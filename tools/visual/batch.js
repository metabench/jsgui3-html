#!/usr/bin/env node
/**
 * batch.js — batch screenshot driver for jsgui3-html.
 *
 * Renders controls server-side (plain Node — no jsgui3-server, no
 * jsgui3-client, no jsdom, no HTTP server), inlines all CSS, and captures
 * many PNGs in one puppeteer session via page.setContent(). Writes a
 * manifest.json describing every shot so AI agents can triage the run
 * without opening each image.
 *
 * Theme axes are applied per control family (measured, not assumed):
 *   - "admin" family (CSS consumes --admin-* vars): one shot per
 *     data-admin-theme preset (vs-default, vs-dark, terminal, vs-classic,
 *     vs-aero, vs-2005, warm).
 *   - "j" family (everything else, styled by --j-* tokens): exactly two
 *     states — default and data-theme="dark". The admin presets are pixel
 *     no-ops for this family, so shooting them would only invite false
 *     "theme applied" conclusions.
 *
 * Usage:
 *   node tools/visual/batch.js                         # all controls + suites
 *   node tools/visual/batch.js --controls Button,Calendar
 *   node tools/visual/batch.js --limit 10 --save-html  # smoke run
 *   node tools/visual/batch.js --update-baselines
 *   node tools/visual/batch.js --compare               # diff vs baselines/
 *
 * Options:
 *   --controls A,B,C     only these controls
 *   --limit N            first N controls of the enumeration
 *   --themes a,b         admin presets to shoot (default: all)
 *   --viewport WxH       repeatable; default 900x700
 *   --out DIR            output dir (default tools/visual/output)
 *   --save-html          also save each page's HTML next to its PNG
 *   --no-suites          skip the composite suite pages
 *   --only-suites        only the composite suite pages
 *   --compare            pixel-diff each shot against baselines/<file>
 *   --update-baselines   copy this run's PNGs into baselines/
 *   --diff-tolerance P   max % changed pixels allowed with --compare (default 0)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const { REPO_ROOT, collect_tree_css, is_admin_family } = require('./css_pipeline');
const { jsgui, make_context, render_document } = require('./render_page');
const { get_spec } = require('./specs');

const puppeteer = require('puppeteer');
const all_controls = require(path.join(REPO_ROOT, 'controls', 'controls.js'));

const BASELINE_DIR = path.join(__dirname, 'baselines');
const DEFAULT_OUT = path.join(__dirname, 'output');

// Not part of the per-control batch, with reasons (recorded in the manifest).
const EXCLUDE = {
    Admin_Theme: 'static theme utility, not a renderable control',
    Active_HTML_Document: 'full-document wrapper — nested <html> is invalid inside a page body',
    Standard_Web_Page: 'full-document wrapper',
    Message_Web_Page: 'full-document wrapper',
    HTML_Document: 'full-document wrapper',
    Blank_HTML_Document: 'full-document wrapper'
};

// position:absolute roots need a sized stage div to be visible in a shot.
const STAGE = {
    Window: [760, 560],
    Window_Manager: [900, 600],
    Modal: [760, 560]
};

/* ── CLI ────────────────────────────────────────────────────────────────── */

function parse_args(argv) {
    const opts = {
        controls: null, limit: 0, themes: null, viewports: [],
        out: DEFAULT_OUT, save_html: false, suites: true, only_suites: false,
        compare: false, update_baselines: false, diff_tolerance: 0
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--controls') opts.controls = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
        else if (a === '--limit') opts.limit = parseInt(argv[++i], 10) || 0;
        else if (a === '--themes') opts.themes = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
        else if (a === '--viewport') opts.viewports.push(argv[++i]);
        else if (a === '--out') opts.out = path.resolve(argv[++i]);
        else if (a === '--save-html') opts.save_html = true;
        else if (a === '--no-suites') opts.suites = false;
        else if (a === '--only-suites') opts.only_suites = true;
        else if (a === '--compare') opts.compare = true;
        else if (a === '--update-baselines') opts.update_baselines = true;
        else if (a === '--diff-tolerance') opts.diff_tolerance = parseFloat(argv[++i]) || 0;
        else { console.error(`Unknown option: ${a}`); process.exit(2); }
    }
    if (!opts.viewports.length) opts.viewports.push('900x700');
    opts.viewports = opts.viewports.map(v => {
        const m = /^(\d+)x(\d+)$/.exec(v);
        if (!m) { console.error(`Bad --viewport '${v}' (want WxH)`); process.exit(2); }
        return { width: +m[1], height: +m[2] };
    });
    return opts;
}

/* ── Control enumeration (dedupe deprecated aliases, apply excludes) ────── */

function enumerate_controls() {
    const by_fn = new Map();
    for (const [name, fn] of Object.entries(all_controls)) {
        if (typeof fn !== 'function') continue;
        const entry = by_fn.get(fn);
        // Prefer the export key matching the class's own name (canonical);
        // extra keys are deprecated aliases (FormField -> Form_Field, ...).
        if (!entry) by_fn.set(fn, name);
        else if (name === fn.name && entry !== fn.name) by_fn.set(fn, name);
    }
    const names = [...by_fn.values()].sort();
    const skipped = [];
    const active = names.filter(n => {
        if (EXCLUDE[n]) { skipped.push({ control: n, reason: EXCLUDE[n] }); return false; }
        return true;
    });
    return { active, skipped };
}

/* ── Suite pages (composite at-a-glance galleries) ──────────────────────── */

function suite_pages(admin_presets) {
    const ctx = make_context();
    const { Button, Text_Field, Calendar, Alert_Banner, Data_Table, Badge, Progress_Bar } = jsgui;

    const basic_controls = [
        new Button({ context: ctx, text: 'Save changes', variant: 'primary' }),
        new Button({ context: ctx, text: 'Cancel' }),
        new Button({ context: ctx, text: 'Delete', variant: 'danger' }),
        new Text_Field({ context: ctx, name: 'username', placeholder: 'Username' }),
        new Calendar({ context: ctx, year: 2026, month: 6 })
    ];
    const basic_html =
        '<p class="vh-label">Buttons</p><div class="vh-row">'
        + basic_controls.slice(0, 3).map(c => c.all_html_render()).join('\n') + '</div>'
        + '<p class="vh-label">Text field</p><div class="vh-row">' + basic_controls[3].all_html_render() + '</div>'
        + '<p class="vh-label">Calendar</p><div class="vh-row">' + basic_controls[4].all_html_render() + '</div>';
    const basic_css = collect_tree_css(basic_controls).css;

    // Alert_Banner status vocabulary: info | success | warning | error.
    const admin_controls = [
        ...['info', 'success', 'warning', 'error'].map(status =>
            new Alert_Banner({ context: ctx, status, message: `This is a ${status} alert banner rendered server-side.` })),
        new Data_Table({
            context: ctx,
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' }
            ],
            rows: [
                { name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },
                { name: 'Grace Hopper', role: 'Admiral', status: 'Active' },
                { name: 'Alan Turing', role: 'Cryptanalyst', status: 'Away' }
            ]
        }),
        ...['default', 'success', 'warning'].map(v => new Badge({ context: ctx, text: v, variant: v })),
        new Progress_Bar({ context: ctx, value: 65 })
    ];
    const admin_html =
        '<p class="vh-label">Alert banners</p>'
        + admin_controls.slice(0, 4).map(c => c.all_html_render()).join('\n')
        + '<p class="vh-label" style="margin-top:16px">Data table</p>' + admin_controls[4].all_html_render()
        + '<p class="vh-label" style="margin-top:16px">Badges + progress</p><div class="vh-row">'
        + admin_controls.slice(5, 8).map(c => c.all_html_render()).join('\n') + '</div>'
        + '<div style="max-width:420px">' + admin_controls[8].all_html_render() + '</div>';
    const admin_css = collect_tree_css(admin_controls).css;

    const pages = [
        { name: 'suite-basic--default--1280x900', suite: 'basic', theme_axis: 'j-mode', theme: 'default',
          viewport: { width: 1280, height: 900 },
          html: render_document({ body_html: basic_html, tree_css: basic_css }, { title: 'Suite: basic' }) },
        { name: 'suite-basic--dark--1280x900', suite: 'basic', theme_axis: 'j-mode', theme: 'dark',
          viewport: { width: 1280, height: 900 },
          html: render_document({ body_html: basic_html, tree_css: basic_css }, { title: 'Suite: basic (dark)', data_theme: 'dark' }) },
        { name: 'suite-basic--default--375x900', suite: 'basic', theme_axis: 'j-mode', theme: 'default',
          viewport: { width: 375, height: 900 },
          html: render_document({ body_html: basic_html, tree_css: basic_css }, { title: 'Suite: basic (mobile)' }) }
    ];
    for (const preset of admin_presets) {
        pages.push({
            name: `suite-admin--${preset}--1024x800`, suite: 'admin', theme_axis: 'admin-preset', theme: preset,
            viewport: { width: 1024, height: 800 },
            html: render_document({ body_html: admin_html, tree_css: admin_css },
                { title: `Suite: admin (${preset})`, admin_theme: preset })
        });
    }
    return pages;
}

/* ── Per-control pages ──────────────────────────────────────────────────── */

function control_pages(name, admin_presets, viewports, failures) {
    const C = all_controls[name];
    let ctrl, ctx;
    try {
        ctx = make_context();
        ctrl = new C(Object.assign({ context: ctx }, get_spec(name, jsgui, ctx)));
    } catch (e) {
        failures.push({ control: name, stage: 'construct', error: String(e && e.message || e) });
        return [];
    }
    let body_html, tree_css;
    try {
        body_html = ctrl.all_html_render();
        tree_css = collect_tree_css(ctrl).css;
    } catch (e) {
        failures.push({ control: name, stage: 'render', error: String(e && e.message || e) });
        return [];
    }
    const family = is_admin_family(tree_css) ? 'admin' : 'j';
    const labelled = html => `<p class="vh-label">${name}</p>` + html;
    const themes = family === 'admin'
        ? admin_presets.map(p => ({ axis: 'admin-preset', theme: p, doc_opts: { admin_theme: p } }))
        : [{ axis: 'j-mode', theme: 'default', doc_opts: {} },
           { axis: 'j-mode', theme: 'dark', doc_opts: { data_theme: 'dark' } }];

    const pages = [];
    for (const t of themes) {
        for (const vp of viewports) {
            const opts = Object.assign({ title: `${name} (${t.theme})` }, t.doc_opts);
            if (STAGE[name]) opts.stage = STAGE[name];
            pages.push({
                name: `${name}--${t.theme}--${vp.width}x${vp.height}`,
                control: name, family, theme_axis: t.axis, theme: t.theme, viewport: vp,
                html: render_document({ body_html: labelled(body_html), tree_css }, opts)
            });
        }
    }
    return pages;
}

/* ── Pixel compare (lazy: only with --compare / --update-baselines) ─────── */

async function load_diff_tools() {
    const e2e_nm = path.join(REPO_ROOT, 'test', 'e2e', 'node_modules');
    const { PNG } = require(path.join(e2e_nm, 'pngjs'));
    const pixelmatch = (await import(
        pathToFileURL(path.join(e2e_nm, 'pixelmatch', 'index.js')).href
    )).default;
    return { PNG, pixelmatch };
}

/* ── Main ───────────────────────────────────────────────────────────────── */

async function run(opts) {
    const t0 = Date.now();
    fs.mkdirSync(opts.out, { recursive: true });
    const html_dir = path.join(opts.out, 'html');
    if (opts.save_html) fs.mkdirSync(html_dir, { recursive: true });

    const admin_presets = opts.themes || jsgui.Admin_Theme.themes;
    const failures = [];
    let skipped = [];
    let pages = [];

    if (!opts.only_suites) {
        const en = enumerate_controls();
        skipped = en.skipped;
        let names = opts.controls || en.active;
        if (opts.controls) {
            const unknown = names.filter(n => typeof all_controls[n] !== 'function');
            if (unknown.length) { console.error(`Unknown controls: ${unknown.join(', ')}`); process.exit(2); }
        }
        if (opts.limit) names = names.slice(0, opts.limit);
        for (const name of names) {
            pages.push(...control_pages(name, admin_presets, opts.viewports, failures));
        }
    }
    if (opts.suites || opts.only_suites) pages.push(...suite_pages(admin_presets));

    console.log(`Rendering done: ${pages.length} pages, ${failures.length} failures  (${Date.now() - t0} ms)`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const console_errors = [], page_errors = [], failed_requests = [];
    page.on('console', m => { if (m.type() === 'error') console_errors.push(m.text()); });
    page.on('pageerror', e => page_errors.push(String(e)));
    page.on('requestfailed', r => failed_requests.push(`${r.url()} :: ${r.failure() && r.failure().errorText}`));

    const shots = [];
    for (const p of pages) {
        const marks = [console_errors.length, page_errors.length, failed_requests.length];
        const file = p.name + '.png';
        if (opts.save_html) fs.writeFileSync(path.join(html_dir, p.name + '.html'), p.html);
        await page.setViewport(p.viewport);
        await page.setContent(p.html, { waitUntil: 'load' });
        await page.screenshot({ path: path.join(opts.out, file), fullPage: true });
        shots.push({
            file,
            control: p.control || null,
            suite: p.suite || null,
            family: p.family || (p.suite === 'admin' ? 'admin' : 'j'),
            theme_axis: p.theme_axis,
            theme: p.theme,
            viewport: `${p.viewport.width}x${p.viewport.height}`,
            console_errors: console_errors.slice(marks[0]),
            page_errors: page_errors.slice(marks[1]),
            failed_requests: failed_requests.slice(marks[2])
        });
    }
    await browser.close();
    console.log(`Shots done: ${shots.length} PNGs  (${Date.now() - t0} ms total)`);

    /* baselines / compare */
    let compare_failures = 0;
    if (opts.update_baselines) {
        fs.mkdirSync(BASELINE_DIR, { recursive: true });
        for (const s of shots) {
            fs.copyFileSync(path.join(opts.out, s.file), path.join(BASELINE_DIR, s.file));
        }
        console.log(`Baselines updated: ${shots.length} PNGs -> ${BASELINE_DIR}`);
    } else if (opts.compare) {
        const { PNG, pixelmatch } = await load_diff_tools();
        const diff_dir = path.join(opts.out, 'diff');
        fs.mkdirSync(diff_dir, { recursive: true });
        for (const s of shots) {
            const base_path = path.join(BASELINE_DIR, s.file);
            if (!fs.existsSync(base_path)) { s.baseline = 'missing'; continue; }
            const a = PNG.sync.read(fs.readFileSync(base_path));
            const b = PNG.sync.read(fs.readFileSync(path.join(opts.out, s.file)));
            if (a.width !== b.width || a.height !== b.height) {
                s.baseline = 'dimension-mismatch';
                compare_failures++;
                continue;
            }
            const diff = new PNG({ width: a.width, height: a.height });
            const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
            const pct = 100 * n / (a.width * a.height);
            s.baseline = 'compared';
            s.px_changed = n;
            s.px_changed_pct = +pct.toFixed(3);
            if (pct > opts.diff_tolerance) {
                compare_failures++;
                fs.writeFileSync(path.join(diff_dir, 'diff-' + s.file), PNG.sync.write(diff));
            }
        }
        console.log(`Compare: ${compare_failures} shot(s) over tolerance (${opts.diff_tolerance}%)`);
    }

    const hermetic_failures = shots.filter(s =>
        s.console_errors.length || s.page_errors.length || s.failed_requests.length);

    const manifest = {
        generated_by: 'tools/visual/batch.js',
        generated_at: new Date().toISOString(),
        args: process.argv.slice(2),
        totals: {
            pages: pages.length,
            shots: shots.length,
            render_failures: failures.length,
            hermetic_failures: hermetic_failures.length,
            compare_failures,
            skipped: skipped.length,
            elapsed_ms: Date.now() - t0
        },
        theme_model: {
            'admin-preset': 'data-admin-theme attribute; only restyles controls whose CSS consumes --admin-* variables',
            'j-mode': 'default vs data-theme="dark"; the --j-* token family. Admin presets are pixel no-ops here by design.'
        },
        failures,
        skipped,
        shots
    };
    fs.writeFileSync(path.join(opts.out, 'manifest.json'), JSON.stringify(manifest, null, 2));

    if (failures.length) {
        console.error(`RENDER FAILURES (${failures.length}):`);
        for (const f of failures) console.error(`  ${f.control} [${f.stage}]: ${f.error}`);
    }
    if (hermetic_failures.length) {
        console.error(`HERMETICITY FAILURES (${hermetic_failures.length}):`);
        for (const s of hermetic_failures) console.error(`  ${s.file}`);
    }
    console.log(`Manifest: ${path.join(opts.out, 'manifest.json')}`);
    console.log(`Output:   ${opts.out}`);

    const ok = !failures.length && !hermetic_failures.length && !compare_failures;
    return { ok, manifest };
}

if (require.main === module) {
    run(parse_args(process.argv.slice(2)))
        .then(r => process.exit(r.ok ? 0 : 1))
        .catch(e => { console.error(e.stack || e); process.exit(1); });
}

module.exports = { run, parse_args, enumerate_controls };
