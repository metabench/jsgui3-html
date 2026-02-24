/**
 * Icon_Button.check.js — Extensive validation for Icon_Button control.
 *
 * Tests cover:
 *   1.  Default construction and HTML structure
 *   2.  Custom icon and aria_label
 *   3.  Tooltip (title attribute)
 *   4.  Toggle mode — aria-pressed tracking
 *   5.  Pressed state
 *   6.  Disabled state
 *   7.  All 5 variants: default, filled, subtle, danger, toolbar
 *   8.  All 3 sizes: sm, md, lg
 *   9.  set_icon method
 *   10. set_pressed method (toggle and non-toggle)
 *   11. set_disabled method (enable/disable cycle)
 *   12. set_variant method — all valid + invalid values
 *   13. set_size method — all valid + invalid values
 *   14. label alias for aria_label
 *   15. CSS static property validation
 *   16. Button tag and type attribute
 *   17. Combination: filled + lg + toggle + pressed + tooltip
 */

const Icon_Button = require('../icon_button');
const jsgui = require('../../../../../html-core/html-core');
const Page_Context = jsgui.Page_Context;

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) { passed++; }
    else { console.error(`  ✗ FAIL: ${name}`); failed++; }
}

function section(title) { console.log(`\n── ${title} ──`); }

const context = new Page_Context();

// ═══════════════════════════════════════════════════════════
section('1. Default construction');
// ═══════════════════════════════════════════════════════════

const btn1 = new Icon_Button({ context });
const html1 = btn1.all_html_render();

assert(html1.includes('jsgui-icon-button'), '1a: has jsgui class');
assert(html1.includes('icon-button-icon'), '1b: has icon child');
assert(html1.includes('<button'), '1c: renders as <button>');
assert(html1.includes('type="button"'), '1d: type=button');
assert(html1.includes('aria-label="Icon button"'), '1e: default aria-label');
assert(html1.includes('data-variant="default"'), '1f: default variant');
assert(html1.includes('data-size="md"'), '1g: default size md');
assert(html1.includes('•'), '1h: default icon is bullet');
assert(!html1.includes('aria-pressed'), '1i: no aria-pressed by default');
assert(!html1.includes('disabled'), '1j: not disabled by default');

// ═══════════════════════════════════════════════════════════
section('2. Custom icon and aria_label');
// ═══════════════════════════════════════════════════════════

const btn2 = new Icon_Button({ context, icon: '✕', aria_label: 'Close dialog' });
const html2 = btn2.all_html_render();

assert(html2.includes('✕'), '2a: custom icon rendered');
assert(html2.includes('aria-label="Close dialog"'), '2b: custom aria-label');
assert(btn2.icon === '✕', '2c: .icon property');
assert(btn2.aria_label === 'Close dialog', '2d: .aria_label property');

// ═══════════════════════════════════════════════════════════
section('3. Label alias');
// ═══════════════════════════════════════════════════════════

const btn3 = new Icon_Button({ context, label: 'Copy to clipboard' });
assert(btn3.aria_label === 'Copy to clipboard', '3a: label alias works');

// ═══════════════════════════════════════════════════════════
section('4. Tooltip');
// ═══════════════════════════════════════════════════════════

const btn4 = new Icon_Button({ context, tooltip: 'Close this panel', aria_label: 'Close' });
const html4 = btn4.all_html_render();
assert(html4.includes('title="Close this panel"'), '4a: tooltip becomes title attribute');

const btn4b = new Icon_Button({ context, aria_label: 'No tooltip' });
const html4b = btn4b.all_html_render();
assert(!html4b.includes('title='), '4b: no title when no tooltip');

// ═══════════════════════════════════════════════════════════
section('5. Toggle mode');
// ═══════════════════════════════════════════════════════════

const btn5 = new Icon_Button({ context, toggle: true, aria_label: 'Bold' });
const html5 = btn5.all_html_render();
assert(html5.includes('aria-pressed="false"'), '5a: toggle starts unpressed');
assert(btn5.toggle === true, '5b: .toggle property');
assert(btn5.pressed === false, '5c: .pressed starts false');

// ═══════════════════════════════════════════════════════════
section('6. Toggle + initially pressed');
// ═══════════════════════════════════════════════════════════

const btn6 = new Icon_Button({ context, toggle: true, pressed: true, aria_label: 'Fav' });
const html6 = btn6.all_html_render();
assert(html6.includes('aria-pressed="true"'), '6a: starts pressed');
assert(btn6.pressed === true, '6b: .pressed is true');

// ═══════════════════════════════════════════════════════════
section('7. Disabled state');
// ═══════════════════════════════════════════════════════════

const btn7 = new Icon_Button({ context, disabled: true, aria_label: 'Disabled' });
const html7 = btn7.all_html_render();
assert(html7.includes('aria-disabled="true"'), '7a: aria-disabled');
assert(html7.includes('icon-button-disabled'), '7b: disabled class');
assert(btn7.disabled === true, '7c: .disabled property');

// ═══════════════════════════════════════════════════════════
section('8. Variants');
// ═══════════════════════════════════════════════════════════

['default', 'filled', 'subtle', 'danger', 'toolbar'].forEach(v => {
    const b = new Icon_Button({ context, variant: v, aria_label: v });
    const h = b.all_html_render();
    assert(h.includes(`data-variant="${v}"`), `8-${v}: data-variant="${v}"`);
    assert(b.variant === v, `8-${v}: .variant property`);
});

// ═══════════════════════════════════════════════════════════
section('9. Sizes');
// ═══════════════════════════════════════════════════════════

['sm', 'md', 'lg'].forEach(s => {
    const b = new Icon_Button({ context, size: s, aria_label: s });
    const h = b.all_html_render();
    assert(h.includes(`data-size="${s}"`), `9-${s}: data-size="${s}"`);
    assert(b.size === s, `9-${s}: .size property`);
});

// ═══════════════════════════════════════════════════════════
section('10. set_icon method');
// ═══════════════════════════════════════════════════════════

const btn10 = new Icon_Button({ context, icon: 'A', aria_label: 'test' });
assert(btn10.icon === 'A', '10a: initial icon');
btn10.set_icon('B');
assert(btn10.icon === 'B', '10b: icon updated to B');
btn10.set_icon('');
assert(btn10.icon === '•', '10c: empty string falls back to bullet');
btn10.set_icon(null);
assert(btn10.icon === '•', '10d: null falls back to bullet');

// ═══════════════════════════════════════════════════════════
section('11. set_pressed method');
// ═══════════════════════════════════════════════════════════

const btn11 = new Icon_Button({ context, toggle: true, aria_label: 'toggle' });
assert(btn11.pressed === false, '11a: starts unpressed');
btn11.set_pressed(true);
assert(btn11.pressed === true, '11b: pressed after set_pressed(true)');
assert(btn11.dom.attributes['aria-pressed'] === 'true', '11c: aria-pressed updated');
btn11.set_pressed(false);
assert(btn11.pressed === false, '11d: unpressed after set_pressed(false)');
assert(btn11.dom.attributes['aria-pressed'] === 'false', '11e: aria-pressed reset');

// Non-toggle mode — set_pressed still updates the property
const btn11b = new Icon_Button({ context, toggle: false, aria_label: 'no toggle' });
btn11b.set_pressed(true);
assert(btn11b.pressed === true, '11f: set_pressed works even without toggle mode');

// ═══════════════════════════════════════════════════════════
section('12. set_disabled method');
// ═══════════════════════════════════════════════════════════

const btn12 = new Icon_Button({ context, aria_label: 'test' });
assert(btn12.disabled === false, '12a: starts enabled');
btn12.set_disabled(true);
assert(btn12.disabled === true, '12b: disabled after set_disabled(true)');
assert(btn12.dom.attributes['aria-disabled'] === 'true', '12c: aria-disabled set');
btn12.set_disabled(false);
assert(btn12.disabled === false, '12d: re-enabled');
assert(btn12.dom.attributes['aria-disabled'] === undefined, '12e: aria-disabled removed');

// Multiple toggles
btn12.set_disabled(true);
btn12.set_disabled(true);
assert(btn12.disabled === true, '12f: double-disable is safe');
btn12.set_disabled(false);
btn12.set_disabled(false);
assert(btn12.disabled === false, '12g: double-enable is safe');

// ═══════════════════════════════════════════════════════════
section('13. set_variant method');
// ═══════════════════════════════════════════════════════════

const btn13 = new Icon_Button({ context, aria_label: 'test' });
['filled', 'subtle', 'danger', 'toolbar', 'default'].forEach(v => {
    btn13.set_variant(v);
    assert(btn13.variant === v, `13-${v}: set_variant('${v}') works`);
    assert(btn13.dom.attributes['data-variant'] === v, `13-${v}: data-attr updated`);
});

// Invalid values
btn13.set_variant('invalid');
assert(btn13.variant === 'default', '13-invalid: falls back to default');
btn13.set_variant('');
assert(btn13.variant === 'default', '13-empty: falls back to default');
btn13.set_variant(null);
assert(btn13.variant === 'default', '13-null: falls back to default');
btn13.set_variant(42);
assert(btn13.variant === 'default', '13-number: falls back to default');

// ═══════════════════════════════════════════════════════════
section('14. set_size method');
// ═══════════════════════════════════════════════════════════

const btn14 = new Icon_Button({ context, aria_label: 'test' });
['sm', 'md', 'lg'].forEach(s => {
    btn14.set_size(s);
    assert(btn14.size === s, `14-${s}: set_size('${s}') works`);
    assert(btn14.dom.attributes['data-size'] === s, `14-${s}: data-attr updated`);
});

btn14.set_size('xl');
assert(btn14.size === 'md', '14-invalid: falls back to md');
btn14.set_size('');
assert(btn14.size === 'md', '14-empty: falls back to md');

// ═══════════════════════════════════════════════════════════
section('15. Combination: filled + lg + toggle + pressed + tooltip');
// ═══════════════════════════════════════════════════════════

const btn15 = new Icon_Button({
    context,
    icon: '★',
    variant: 'filled',
    size: 'lg',
    toggle: true,
    pressed: true,
    tooltip: 'Toggle favorite',
    aria_label: 'Favorite'
});
const html15 = btn15.all_html_render();

assert(html15.includes('data-variant="filled"'), '15a: filled variant');
assert(html15.includes('data-size="lg"'), '15b: lg size');
assert(html15.includes('aria-pressed="true"'), '15c: pressed');
assert(html15.includes('title="Toggle favorite"'), '15d: tooltip');
assert(html15.includes('aria-label="Favorite"'), '15e: aria-label');
assert(html15.includes('★'), '15f: icon content');

// ═══════════════════════════════════════════════════════════
section('16. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Icon_Button.css === 'string', '16a: .css is string');
assert(Icon_Button.css.includes('.jsgui-icon-button'), '16b: root selector');
assert(Icon_Button.css.includes('.icon-button-icon'), '16c: icon selector');
assert(Icon_Button.css.includes('data-variant="filled"'), '16d: filled variant CSS');
assert(Icon_Button.css.includes('data-variant="subtle"'), '16e: subtle variant CSS');
assert(Icon_Button.css.includes('data-variant="danger"'), '16f: danger variant CSS');
assert(Icon_Button.css.includes('data-variant="toolbar"'), '16g: toolbar variant CSS');
assert(Icon_Button.css.includes('data-size="sm"'), '16h: sm size CSS');
assert(Icon_Button.css.includes('data-size="md"'), '16i: md size CSS');
assert(Icon_Button.css.includes('data-size="lg"'), '16j: lg size CSS');
assert(Icon_Button.css.includes('--j-border'), '16k: uses --j-border token');
assert(Icon_Button.css.includes('--j-primary'), '16l: uses --j-primary token');
assert(Icon_Button.css.includes('--j-danger'), '16m: uses --j-danger token');
assert(!Icon_Button.css.includes('--admin-'), '16n: no deprecated --admin- tokens');

// ═══════════════════════════════════════════════════════════
section('17. Internal structure');
// ═══════════════════════════════════════════════════════════

assert(btn1.icon_ctrl !== undefined, '17a: icon_ctrl child exists');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Icon_Button: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Icon_Button checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
