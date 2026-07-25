/**
 * css_pipeline.js — standalone CSS assembly for server-rendered jsgui3-html pages.
 *
 * Produces a single inline <style> payload from the three CSS sources a page
 * needs, with no HTTP serving and no jsgui3-server:
 *
 *   1. css/jsgui.css flattened — its `@import url(...) layer(...)` graph does
 *      not work when inlined raw into a <style> tag, so each imported file is
 *      wrapped in an explicit `@layer <name> { ... }` block, preserving the
 *      master sheet's layer order declaration.
 *   2. Admin_Theme.css — the static preset string (all `[data-admin-theme]`
 *      blocks), built server-side at require() time.
 *   3. Per-class `static css` strings, collected by walking the INSTANTIATED
 *      control tree (constructor inheritance chain per node + recursive
 *      descent through ctrl.content), deduped by trimmed content. This is the
 *      same algorithm jsgui3-server's site-page-composer uses; walking only
 *      the root class's inheritance chain drops the CSS of composed child
 *      controls (e.g. a Data_Table inside a Window).
 *
 * Layer convention: collected statics are emitted inside `@layer jsgui-legacy`
 * so that css/components/*.css (layer jsgui-components) wins where both style
 * the same control — matching the cascade order declared in css/jsgui.css.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const CSS_DIR = path.join(REPO_ROOT, 'css');

let _master_css_cache = null;

// Flatten css/jsgui.css: keep the top-level @layer order declaration, then
// inline each @import, wrapping layered imports in @layer blocks.
function flatten_master_css() {
    if (_master_css_cache !== null) return _master_css_cache;
    const master = fs.readFileSync(path.join(CSS_DIR, 'jsgui.css'), 'utf8');
    let css = (master.match(/@layer[^;{]+;/) || [''])[0] + '\n';
    const re = /@import\s+url\(['"]?(.+?)['"]?\)(?:\s+layer\((.+?)\))?\s*;/g;
    let m;
    while ((m = re.exec(master)) !== null) {
        const body = fs.readFileSync(path.join(CSS_DIR, m[1]), 'utf8');
        css += m[2] ? `@layer ${m[2]} {\n${body}\n}\n` : body + '\n';
    }
    _master_css_cache = css;
    return css;
}

// Walk an instantiated control tree collecting `static css` strings.
// Returns { css, contributors } where contributors is the list of class names
// that supplied CSS (deduped by trimmed content).
function collect_tree_css(roots, state) {
    state = state || {
        seen_controls: new Set(),
        seen_css: new Set(),
        out: [],
        contributors: []
    };
    const list = Array.isArray(roots) ? roots : [roots];
    for (const ctrl of list) {
        if (!ctrl || typeof ctrl !== 'object' || state.seen_controls.has(ctrl)) continue;
        state.seen_controls.add(ctrl);
        for (let cls = ctrl.constructor; cls && cls !== Object; cls = Object.getPrototypeOf(cls)) {
            if (Object.prototype.hasOwnProperty.call(cls, 'css') &&
                typeof cls.css === 'string' && cls.css.trim() &&
                !state.seen_css.has(cls.css.trim())) {
                state.seen_css.add(cls.css.trim());
                state.out.push(cls.css);
                state.contributors.push(cls.name || '(anon)');
            }
        }
        if (ctrl.content && typeof ctrl.content.each === 'function') {
            ctrl.content.each(child => {
                if (child && child.constructor) collect_tree_css(child, state);
            });
        }
    }
    return { css: state.out.join('\n'), contributors: state.contributors, _state: state };
}

// A control belongs to the "admin" theme family if any CSS it (or a composed
// child) ships consumes --admin-* custom properties; those controls respond
// to the data-admin-theme presets. Everything else is styled by --j-* tokens
// and only responds to data-theme="dark" / .jsgui-dark-mode.
function is_admin_family(tree_css) {
    return tree_css.indexOf('--admin-') !== -1;
}

// Full page CSS payload. `tree_css` comes from collect_tree_css(roots).css.
function build_page_css(tree_css, opts) {
    opts = opts || {};
    const jsgui = require(path.join(REPO_ROOT, 'html.js'));
    const parts = [flatten_master_css()];
    if (opts.include_admin_theme !== false) parts.push(jsgui.Admin_Theme.css);
    if (tree_css && tree_css.trim()) {
        parts.push(`@layer jsgui-legacy {\n${tree_css}\n}`);
    }
    if (opts.extra_css) parts.push(opts.extra_css);
    return parts.join('\n');
}

module.exports = {
    REPO_ROOT,
    flatten_master_css,
    collect_tree_css,
    is_admin_family,
    build_page_css
};
