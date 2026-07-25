/**
 * render_page.js — render jsgui3-html controls to complete standalone HTML
 * documents in plain Node: no jsgui3-server, no jsgui3-client, no jsdom,
 * no HTTP. CSS is fully inlined via css_pipeline, so the resulting string can
 * be handed straight to puppeteer's page.setContent() (or saved to disk).
 *
 * Theme axes (both are pure CSS attributes on <html>, no client JS):
 *   admin_theme: one of Admin_Theme.themes (vs-default, vs-dark, terminal,
 *                vs-classic, vs-aero, vs-2005, warm) — only restyles controls
 *                whose CSS consumes --admin-* variables.
 *   data_theme:  'dark' switches the --j-* token set (general controls).
 */
'use strict';

const path = require('path');
const { REPO_ROOT, collect_tree_css, build_page_css, is_admin_family } = require('./css_pipeline');

const jsgui = require(path.join(REPO_ROOT, 'html.js'));

// Page_Context suitable for rendering ANY exported control: Login's
// constructor unconditionally reads context.req.headers, so every harness
// context carries an empty request stub.
function make_context() {
    const ctx = new jsgui.Page_Context();
    ctx.req = { headers: {} };
    return ctx;
}

function render_controls(controls) {
    const list = Array.isArray(controls) ? controls : [controls];
    return list.map(c => c.all_html_render()).join('\n');
}

/**
 * Render a complete HTML document string.
 *   controls   control instance or array (used for markup AND tree CSS
 *              collection) — or pass { body_html, tree_css } directly.
 *   opts:
 *     title        document title
 *     admin_theme  data-admin-theme preset name
 *     data_theme   'dark' for the --j-* dark set
 *     bg           body background override (default: theme-appropriate)
 *     fixed_font   pin body font to Segoe UI (for pixel-diff runs where a
 *                  preset's --admin-font must not confound the comparison)
 *     padding      body padding (default 24px)
 *     stage        wrap body_html in a positioned stage div of WxH — needed
 *                  for position:absolute roots such as Window
 *     extra_css    appended after all other CSS
 */
function render_document(controls, opts) {
    opts = opts || {};
    let body_html, tree_css;
    if (controls && typeof controls === 'object' && !Array.isArray(controls)
        && typeof controls.all_html_render !== 'function' && controls.body_html !== undefined) {
        body_html = controls.body_html;
        tree_css = controls.tree_css || '';
    } else {
        body_html = render_controls(controls);
        tree_css = collect_tree_css(controls).css;
    }
    if (opts.stage) {
        const [w, h] = opts.stage;
        body_html = `<div style="position:relative;width:${w}px;height:${h}px">${body_html}</div>`;
    }
    const css = build_page_css(tree_css, { extra_css: opts.extra_css });

    const html_attrs = (opts.admin_theme ? ` data-admin-theme="${opts.admin_theme}"` : '')
        + (opts.data_theme ? ` data-theme="${opts.data_theme}"` : '');
    const body_bg = opts.bg
        || (opts.admin_theme ? 'var(--admin-bg, var(--j-bg, #ffffff))' : 'var(--j-bg, #ffffff)');
    const body_font = opts.fixed_font
        ? `'Segoe UI', sans-serif`
        : `var(--admin-font, 'Segoe UI', system-ui, sans-serif)`;
    const padding = opts.padding !== undefined ? opts.padding : '24px';

    return `<!DOCTYPE html><html lang="en"${html_attrs}><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opts.title || 'jsgui3-html visual harness'}</title>
<style>${css}
body { margin: 0; padding: ${padding}; background: ${body_bg}; font-family: ${body_font}; color: var(--admin-text, var(--j-fg, #111)); }
.vh-label { font: 600 12px 'Segoe UI', sans-serif; color: #888; margin: 0 0 8px; text-transform: uppercase; letter-spacing: .06em; }
.vh-row { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
</style></head><body>${body_html}</body></html>`;
}

module.exports = {
    jsgui,
    make_context,
    render_controls,
    render_document,
    collect_tree_css,
    is_admin_family
};
