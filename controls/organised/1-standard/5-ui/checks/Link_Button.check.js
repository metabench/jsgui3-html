/**
 * Link_Button.check.js — Extensive validation for Link_Button control.
 *
 * Tests cover:
 *   1.  Default construction and HTML structure
 *   2.  Custom text
 *   3.  Leading icon support
 *   4.  No icon (no icon_ctrl created)
 *   5.  Underline modes: hover, always, none
 *   6.  Variants: default, subtle, danger
 *   7.  Disabled state
 *   8.  set_text method
 *   9.  set_disabled method (enable/disable cycle)
 *   10. set_variant method (valid + invalid)
 *   11. CSS static property validation
 *   12. Button tag and type attribute
 *   13. Combination tests
 *   14. Edge cases (empty text, null values)
 */

const Link_Button = require('../link_button');
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

const btn1 = new Link_Button({ context });
const html1 = btn1.all_html_render();

assert(html1.includes('jsgui-link-button'), '1a: has jsgui class');
assert(html1.includes('<button'), '1b: renders as button');
assert(html1.includes('type="button"'), '1c: type=button');
assert(html1.includes('data-underline="hover"'), '1d: default underline=hover');
assert(html1.includes('data-variant="default"'), '1e: default variant');
assert(html1.includes('link-button-text'), '1f: has text wrapper');
assert(html1.includes('Link'), '1g: default text is "Link"');
assert(!html1.includes('link-button-icon'), '1h: no icon by default');
assert(!html1.includes('disabled'), '1i: not disabled');
assert(btn1.text === 'Link', '1j: .text property');
assert(btn1.underline === 'hover', '1k: .underline property');
assert(btn1.variant === 'default', '1l: .variant property');
assert(btn1.icon === '', '1m: .icon is empty string');

// ═══════════════════════════════════════════════════════════
section('2. Custom text');
// ═══════════════════════════════════════════════════════════

const btn2 = new Link_Button({ context, text: 'View Details' });
const html2 = btn2.all_html_render();
assert(html2.includes('View Details'), '2a: custom text rendered');
assert(btn2.text === 'View Details', '2b: .text property');

// ═══════════════════════════════════════════════════════════
section('3. Leading icon');
// ═══════════════════════════════════════════════════════════

const btn3 = new Link_Button({ context, text: 'Download', icon: '↓' });
const html3 = btn3.all_html_render();
assert(html3.includes('link-button-icon'), '3a: icon wrapper present');
assert(html3.includes('↓'), '3b: icon content rendered');
assert(html3.includes('link-button-text'), '3c: text wrapper also present');
assert(html3.includes('Download'), '3d: text rendered');
assert(btn3.icon_ctrl !== undefined, '3e: icon_ctrl created');

// Icon appears before text in DOM
const iconIdx = html3.indexOf('link-button-icon');
const textIdx = html3.indexOf('link-button-text');
assert(iconIdx < textIdx, '3f: icon appears before text');

// ═══════════════════════════════════════════════════════════
section('4. No icon — no icon_ctrl');
// ═══════════════════════════════════════════════════════════

const btn4 = new Link_Button({ context, text: 'No icon' });
assert(btn4.icon_ctrl === undefined, '4a: no icon_ctrl when no icon');

// ═══════════════════════════════════════════════════════════
section('5. Underline modes');
// ═══════════════════════════════════════════════════════════

['hover', 'always', 'none'].forEach(mode => {
    const b = new Link_Button({ context, text: 'Test', underline: mode });
    const h = b.all_html_render();
    assert(h.includes(`data-underline="${mode}"`), `5-${mode}: data-underline="${mode}"`);
    assert(b.underline === mode, `5-${mode}: .underline property`);
});

// ═══════════════════════════════════════════════════════════
section('6. Variants');
// ═══════════════════════════════════════════════════════════

['default', 'subtle', 'danger'].forEach(v => {
    const b = new Link_Button({ context, text: 'Test', variant: v });
    const h = b.all_html_render();
    assert(h.includes(`data-variant="${v}"`), `6-${v}: data-variant="${v}"`);
    assert(b.variant === v, `6-${v}: .variant property`);
});

// ═══════════════════════════════════════════════════════════
section('7. Disabled state');
// ═══════════════════════════════════════════════════════════

const btn7 = new Link_Button({ context, text: 'Disabled', disabled: true });
const html7 = btn7.all_html_render();
assert(html7.includes('link-button-disabled'), '7a: disabled class');
assert(html7.includes('aria-disabled="true"'), '7b: aria-disabled');
assert(btn7.disabled === true, '7c: .disabled property');

// ═══════════════════════════════════════════════════════════
section('8. set_text method');
// ═══════════════════════════════════════════════════════════

const btn8 = new Link_Button({ context, text: 'First' });
assert(btn8.text === 'First', '8a: initial text');
btn8.set_text('Second');
assert(btn8.text === 'Second', '8b: updated text');
btn8.set_text('');
assert(btn8.text === '', '8c: empty string accepted');
btn8.set_text(null);
assert(btn8.text === '', '8d: null becomes empty string');
btn8.set_text('Final');
assert(btn8.text === 'Final', '8e: can set again after null');

// ═══════════════════════════════════════════════════════════
section('9. set_disabled method');
// ═══════════════════════════════════════════════════════════

const btn9 = new Link_Button({ context, text: 'Test' });
assert(btn9.disabled === false, '9a: starts enabled');
btn9.set_disabled(true);
assert(btn9.disabled === true, '9b: disabled after set_disabled(true)');
assert(btn9.dom.attributes['aria-disabled'] === 'true', '9c: aria-disabled set');
btn9.set_disabled(false);
assert(btn9.disabled === false, '9d: re-enabled');
assert(btn9.dom.attributes['aria-disabled'] === undefined, '9e: aria-disabled removed');

// Idempotent
btn9.set_disabled(false);
assert(btn9.disabled === false, '9f: double-enable is safe');

// ═══════════════════════════════════════════════════════════
section('10. set_variant method');
// ═══════════════════════════════════════════════════════════

const btn10 = new Link_Button({ context, text: 'Test' });
['subtle', 'danger', 'default'].forEach(v => {
    btn10.set_variant(v);
    assert(btn10.variant === v, `10-${v}: set_variant('${v}') works`);
    assert(btn10.dom.attributes['data-variant'] === v, `10-${v}: data-attr updated`);
});

btn10.set_variant('invalid');
assert(btn10.variant === 'default', '10-invalid: falls back to default');
btn10.set_variant('');
assert(btn10.variant === 'default', '10-empty: falls back to default');
btn10.set_variant(null);
assert(btn10.variant === 'default', '10-null: falls back to default');

// ═══════════════════════════════════════════════════════════
section('11. Combination: icon + danger + always underline');
// ═══════════════════════════════════════════════════════════

const btn11 = new Link_Button({
    context,
    text: 'Delete permanently',
    icon: '🗑',
    variant: 'danger',
    underline: 'always'
});
const html11 = btn11.all_html_render();

assert(html11.includes('data-variant="danger"'), '11a: danger variant');
assert(html11.includes('data-underline="always"'), '11b: always underline');
assert(html11.includes('link-button-icon'), '11c: icon present');
assert(html11.includes('🗑'), '11d: icon content');
assert(html11.includes('Delete permanently'), '11e: text content');

// ═══════════════════════════════════════════════════════════
section('12. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Link_Button.css === 'string', '12a: .css is string');
assert(Link_Button.css.includes('.jsgui-link-button'), '12b: root selector');
assert(Link_Button.css.includes('.link-button-icon'), '12c: icon selector');
assert(Link_Button.css.includes('data-underline="always"'), '12d: always underline CSS');
assert(Link_Button.css.includes('data-underline="hover"'), '12e: hover underline CSS');
assert(Link_Button.css.includes('data-underline="none"'), '12f: none underline CSS');
assert(Link_Button.css.includes('data-variant="subtle"'), '12g: subtle variant CSS');
assert(Link_Button.css.includes('data-variant="danger"'), '12h: danger variant CSS');
assert(Link_Button.css.includes('--j-primary'), '12i: uses --j-primary');
assert(Link_Button.css.includes('--j-danger'), '12j: uses --j-danger');
assert(Link_Button.css.includes('--j-fg-muted'), '12k: uses --j-fg-muted');
assert(!Link_Button.css.includes('--admin-'), '12l: no deprecated --admin-');

// ═══════════════════════════════════════════════════════════
section('13. Internal structure');
// ═══════════════════════════════════════════════════════════

assert(btn1.text_ctrl !== undefined, '13a: text_ctrl exists');
assert(typeof btn1.all_html_render === 'function', '13b: all_html_render is function');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Link_Button: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Link_Button checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
