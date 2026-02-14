/**
 * Foundation Controls Verification Script — Batches 1 + 2 + 3
 * 
 * Requires each modified control, creates instances, and validates
 * that the HTML output contains the expected classes, attributes, and ARIA.
 */

const path = require('path');
const CONTROLS_ROOT = path.join(__dirname, '..', 'controls', 'organised');

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
    if (actual) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.log(`  ❌ ${label} — expected: ${expected}`);
        failed++;
    }
}

function contains(html, str) {
    return html.includes(str);
}

// ══════════════════════════════════════════════
// BATCH 1 — JS ↔ CSS Wiring
// ══════════════════════════════════════════════

console.log('\n── Toggle Switch ──');
try {
    const Toggle_Switch = require(path.join(CONTROLS_ROOT, '0-core/0-basic/1-compositional/toggle_switch.js'));
    const toggle = new Toggle_Switch({ checked: true, on_label: 'Yes', off_label: 'No' });
    const html = toggle.all_html_render();
    check('has .jsgui-toggle class', contains(html, 'jsgui-toggle'), 'class');
    check('has .jsgui-toggle-track', contains(html, 'jsgui-toggle-track'), 'class');
    check('has .jsgui-toggle-thumb', contains(html, 'jsgui-toggle-thumb'), 'class');
    check('has role="switch"', contains(html, 'role="switch"'), 'role');
    check('has aria-checked="true"', contains(html, 'aria-checked="true"'), 'aria');
    check('has set_disabled method', typeof toggle.set_disabled === 'function', 'fn');
} catch (e) { console.log(`  ❌ FATAL: ${e.message}`); failed++; }

console.log('\n── Button (Batch 1) ──');
try {
    const Button = require(path.join(CONTROLS_ROOT, '0-core/0-basic/0-native-compositional/button.js'));
    const btn = new Button({ text: 'Submit', variant: 'primary', params: { size: 'large' } });
    const html = btn.all_html_render();
    check('has .jsgui-button', contains(html, 'jsgui-button'), 'class');
    check('has data-variant="primary"', contains(html, 'data-variant="primary"'), 'attr');
    check('has data-size="large"', contains(html, 'data-size="large"'), 'attr');
    check('has button-text span', contains(html, 'button-text'), 'class');
    check('has set_loading method', typeof btn.set_loading === 'function', 'fn');
    check('has set_disabled method', typeof btn.set_disabled === 'function', 'fn');
} catch (e) { console.log(`  ❌ FATAL: ${e.message}`); failed++; }

console.log('\n── Checkbox ──');
try {
    const Checkbox = require(path.join(CONTROLS_ROOT, '0-core/0-basic/0-native-compositional/checkbox.js'));
    const cb = new Checkbox({ text: 'Accept', checked: true });
    const html = cb.all_html_render();
    check('has .jsgui-checkbox', contains(html, 'jsgui-checkbox'), 'class');
    check('has aria-checked', contains(html, 'aria-checked'), 'aria');
    check('has set_disabled method', typeof cb.set_disabled === 'function', 'fn');
    check('has set_indeterminate method', typeof cb.set_indeterminate === 'function', 'fn');
} catch (e) { console.log(`  ❌ FATAL: ${e.message}`); failed++; }

console.log('\n── Radio Button ──');
try {
    const Radio_Button = require(path.join(CONTROLS_ROOT, '0-core/0-basic/0-native-compositional/radio-button.js'));
    const rb = new Radio_Button({ text: 'Opt A', group_name: 'g', checked: true });
    const html = rb.all_html_render();
    check('has .jsgui-radio', contains(html, 'jsgui-radio'), 'class');
    check('has aria-checked', contains(html, 'aria-checked'), 'aria');
    check('has set_disabled method', typeof rb.set_disabled === 'function', 'fn');
} catch (e) { console.log(`  ❌ FATAL: ${e.message}`); failed++; }

console.log('\n── Progress Bar ──');
try {
    const Progress_Bar = require(path.join(CONTROLS_ROOT, '0-core/0-basic/0-native-compositional/progress_bar.js'));
    const pb = new Progress_Bar({ value: 60, max: 100, variant: 'success', size: 'lg', show_label: true });
    const html = pb.all_html_render();
    check('has .jsgui-progress', contains(html, 'jsgui-progress'), 'class');
    check('has role="progressbar"', contains(html, 'role="progressbar"'), 'role');
    check('has aria-valuenow="60"', contains(html, 'aria-valuenow="60"'), 'aria');
    check('has data-variant="success"', contains(html, 'data-variant="success"'), 'attr');
} catch (e) { console.log(`  ❌ FATAL: ${e.message}`); failed++; }

console.log('\n── Range Input (Slider) ──');
try {
    const Range_Input = require(path.join(CONTROLS_ROOT, '0-core/0-basic/0-native-compositional/range_input.js'));
    const slider = new Range_Input({ min: 0, max: 100, step: 5, value: 50 });
    const html = slider.all_html_render();
    check('has .jsgui-slider', contains(html, 'jsgui-slider'), 'class');
    check('has type="range"', contains(html, 'type="range"'), 'attr');
    check('has aria-valuenow', contains(html, 'aria-valuenow'), 'aria');
} catch (e) { console.log(`  ❌ FATAL: ${e.message}`); failed++; }

// ══════════════════════════════════════════════
// BATCH 2 — Button T3+ & Text Field T3
// ══════════════════════════════════════════════

console.log('\n── Button (Batch 2 — T3+) ──');
try {
    const Button = require(path.join(CONTROLS_ROOT, '0-core/0-basic/0-native-compositional/button.js'));

    const toggle_btn = new Button({ text: 'Bold', toggle: true, pressed: true });
    check('toggle: aria-pressed="true"', contains(toggle_btn.all_html_render(), 'aria-pressed="true"'), 'aria');
    check('toggle: .pressed class', contains(toggle_btn.all_html_render(), 'pressed'), 'class');

    const icon_btn = new Button({ icon: '★', label: 'Fav', icon_position: 'only' });
    check('icon-only: data-icon-only', contains(icon_btn.all_html_render(), 'data-icon-only'), 'attr');
    check('icon-only: aria-label', contains(icon_btn.all_html_render(), 'aria-label'), 'aria');

    const pill = new Button({ text: 'Pill', shape: 'pill' });
    check('pill: .btn-pill class', contains(pill.all_html_render(), 'btn-pill'), 'class');

    const circle = new Button({ icon: '+', shape: 'circle' });
    check('circle: .btn-circle class', contains(circle.all_html_render(), 'btn-circle'), 'class');
} catch (e) { console.log(`  ❌ FATAL: ${e.message}`); failed++; }

console.log('\n── Text Field (T3) ──');
try {
    const Text_Input = require(path.join(CONTROLS_ROOT, '0-core/0-basic/0-native-compositional/Text_Input.js'));

    const simple = new Text_Input({ placeholder: 'Enter...', value: 'hi' });
    const sh = simple.all_html_render();
    check('simple: .jsgui-input', contains(sh, 'jsgui-input'), 'class');
    check('simple: <input tag', contains(sh, '<input'), 'tag');
    check('has set_error method', typeof simple.set_error === 'function', 'fn');

    const floating = new Text_Input({ variant: 'floating', label: 'Email', placeholder: 'x@y.z' });
    const fh = floating.all_html_render();
    check('floating: data-variant="floating"', contains(fh, 'data-variant="floating"'), 'attr');
    check('floating: .jsgui-input-wrapper', contains(fh, 'jsgui-input-wrapper'), 'class');
    check('floating: .jsgui-input-label', contains(fh, 'jsgui-input-label'), 'class');
    check('floating: .jsgui-input-error', contains(fh, 'jsgui-input-error'), 'class');

    const req = new Text_Input({ placeholder: 'Req', required: true });
    check('required: aria-required', contains(req.all_html_render(), 'aria-required'), 'aria');

    const small = new Text_Input({ placeholder: 'S', params: { size: 'small' } });
    check('small: data-size="small"', contains(small.all_html_render(), 'data-size="small"'), 'attr');
} catch (e) { console.log(`  ❌ FATAL: ${e.message}`); failed++; }

// ══════════════════════════════════════════════
// BATCH 3 — Panel T3 & Tabbed Panel T3
// ══════════════════════════════════════════════

console.log('\n── Panel (T3) ──');
try {
    const Panel = require(path.join(CONTROLS_ROOT, '1-standard/6-layout/panel.js'));

    // Basic panel with title
    const p = new Panel({ title: 'Settings', variant: 'card', content: 'Hello' });
    const ph = p.all_html_render();
    check('has .jsgui-panel class', contains(ph, 'jsgui-panel'), 'class');
    check('has data-variant="card"', contains(ph, 'data-variant="card"'), 'attr');
    check('has role="region"', contains(ph, 'role="region"'), 'role');
    check('has aria-label="Settings"', contains(ph, 'aria-label="Settings"'), 'aria');
    check('has .jsgui-panel-header', contains(ph, 'jsgui-panel-header'), 'class');
    check('has .jsgui-panel-title', contains(ph, 'jsgui-panel-title'), 'class');
    check('has .jsgui-panel-content', contains(ph, 'jsgui-panel-content'), 'class');

    // Panel with footer
    check('has add_footer method', typeof p.add_footer === 'function', 'fn');
    p.add_footer('Actions');
    const pfh = p.all_html_render();
    check('footer: .jsgui-panel-footer', contains(pfh, 'jsgui-panel-footer'), 'class');

    // Hoverable panel
    const hp = new Panel({ title: 'Click me', hoverable: true });
    check('hoverable: .hoverable class', contains(hp.all_html_render(), 'hoverable'), 'class');

    // Collapsible panel
    const cp = new Panel({ title: 'Collapsible', params: { collapsible: true } });
    check('has toggle_collapsed method', typeof cp.toggle_collapsed === 'function', 'fn');
    check('has set_collapsed method', typeof cp.set_collapsed === 'function', 'fn');
    check('collapsible: .panel-collapse-toggle', contains(cp.all_html_render(), 'panel-collapse-toggle'), 'class');

    // Glass variant
    const gp = new Panel({ variant: 'glass', content: 'Frosted' });
    check('glass: data-variant="glass"', contains(gp.all_html_render(), 'data-variant="glass"'), 'attr');

    // Hero variant
    const herp = new Panel({ variant: 'hero', title: 'Hero', content: 'Big' });
    check('hero: data-variant="hero"', contains(herp.all_html_render(), 'data-variant="hero"'), 'attr');
} catch (e) {
    console.log(`  ❌ FATAL: ${e.message}`);
    console.error(e.stack);
    failed++;
}

console.log('\n── Tabbed Panel (T3) ──');
try {
    const Tabbed_Panel = require(path.join(CONTROLS_ROOT, '1-standard/6-layout/tabbed-panel.js'));

    // Basic tabs
    const tp = new Tabbed_Panel({ tabs: ['Home', 'Profile', 'Settings'] });
    const th = tp.all_html_render();
    check('has .jsgui-tabs class', contains(th, 'jsgui-tabs'), 'class');
    check('has role="tablist"', contains(th, 'role="tablist"'), 'role');
    check('has role="tab"', contains(th, 'role="tab"'), 'role');
    check('has role="tabpanel"', contains(th, 'role="tabpanel"'), 'role');
    check('has aria-selected', contains(th, 'aria-selected'), 'aria');
    check('has aria-controls', contains(th, 'aria-controls'), 'aria');
    check('has aria-labelledby', contains(th, 'aria-labelledby'), 'aria');
    check('has .tab-label', contains(th, 'tab-label'), 'class');
    check('has .tab-page', contains(th, 'tab-page'), 'class');
    check('has set_active_tab_index method', typeof tp.set_active_tab_index === 'function', 'fn');

    // Pills variant
    const pills = new Tabbed_Panel({ variant: 'pills', tabs: ['A', 'B'] });
    check('pills: data-variant="pills"', contains(pills.all_html_render(), 'data-variant="pills"'), 'attr');

    // Disabled tab
    const dt = new Tabbed_Panel({
        tabs: [
            'Active',
            { title: 'Disabled', disabled: true },
            'Other'
        ]
    });
    const dth = dt.all_html_render();
    check('disabled tab: .tab-disabled class', contains(dth, 'tab-disabled'), 'class');
    check('disabled tab: aria-disabled="true"', contains(dth, 'aria-disabled="true"'), 'aria');
    check('disabled tab: input disabled', contains(dth, 'disabled="disabled"'), 'attr');

    // Closable tab
    const ct = new Tabbed_Panel({
        tabs: [
            { title: 'File', closable: true },
            'Settings'
        ]
    });
    const cth = ct.all_html_render();
    check('closable tab: .tab-close button', contains(cth, 'tab-close'), 'class');
    check('closable tab: aria-label on close', contains(cth, 'Close File'), 'aria');

    // Tab with icon + badge
    const ib = new Tabbed_Panel({
        tabs: [
            { title: 'Errors', icon: '⚠', badge: 5 },
            'Info'
        ]
    });
    const ibh = ib.all_html_render();
    check('icon tab: .tab-icon', contains(ibh, 'tab-icon'), 'class');
    check('badge tab: .tab-badge', contains(ibh, 'tab-badge'), 'class');
} catch (e) {
    console.log(`  ❌ FATAL: ${e.message}`);
    console.error(e.stack);
    failed++;
}

// ── Summary ───────────────────────────────────
console.log('\n══════════════════════════════════════');
console.log(`  PASSED: ${passed}  |  FAILED: ${failed}`);
console.log('══════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
