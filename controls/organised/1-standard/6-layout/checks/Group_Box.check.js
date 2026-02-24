/**
 * Group_Box.check.js — Extensive validation for Group_Box control.
 *
 * Tests cover:
 *   1.  Default construction (fieldset)
 *   2.  Legend text
 *   3.  Div mode (use_div)
 *   4.  Variant: default
 *   5.  Variant: subtle
 *   6.  Variant: elevated
 *   7.  Invalid state
 *   8.  Disabled state (fieldset)
 *   9.  Disabled state (div)
 *   10. set_legend method
 *   11. set_invalid method (toggle on/off)
 *   12. set_disabled method (toggle on/off)
 *   13. set_variant method (valid + invalid)
 *   14. add_content method
 *   15. CSS static property validation
 *   16. Internal structure (legend_ctrl, content_ctrl)
 *   17. Combination: elevated + invalid + legend
 *   18. Edge cases
 */

const Group_Box = require('../group_box');
const jsgui = require('../../../../../html-core/html-core');
const Page_Context = jsgui.Page_Context;
const { Control } = jsgui;

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) { passed++; }
    else { console.error(`  ✗ FAIL: ${name}`); failed++; }
}

function section(title) { console.log(`\n── ${title} ──`); }

const context = new Page_Context();

// ═══════════════════════════════════════════════════════════
section('1. Default construction (fieldset)');
// ═══════════════════════════════════════════════════════════

const gb1 = new Group_Box({ context, legend: 'Settings' });
const html1 = gb1.all_html_render();

assert(html1.includes('jsgui-group-box'), '1a: has jsgui class');
assert(html1.includes('<fieldset'), '1b: renders as fieldset');
assert(html1.includes('<legend'), '1c: has legend element');
assert(html1.includes('group-box-legend'), '1d: legend class');
assert(html1.includes('group-box-content'), '1e: content area');
assert(html1.includes('Settings'), '1f: legend text');
assert(html1.includes('data-variant="default"'), '1g: default variant');
assert(!html1.includes('group-box-invalid'), '1h: not invalid');
assert(!html1.includes('group-box-disabled'), '1i: not disabled');
assert(gb1.legend === 'Settings', '1j: .legend property');
assert(gb1.variant === 'default', '1k: .variant property');
assert(gb1.invalid === false, '1l: .invalid property');
assert(gb1.disabled === false, '1m: .disabled property');
assert(gb1.use_div === false, '1n: .use_div property');

// ═══════════════════════════════════════════════════════════
section('2. Div mode');
// ═══════════════════════════════════════════════════════════

const gb2 = new Group_Box({ context, legend: 'Filters', use_div: true });
const html2 = gb2.all_html_render();

assert(html2.includes('<div'), '2a: renders as div');
assert(!html2.includes('<fieldset'), '2b: no fieldset');
assert(!html2.includes('<legend'), '2c: no legend element (uses span)');
assert(html2.includes('<span'), '2d: legend is span');
assert(html2.includes('Filters'), '2e: legend text present');
assert(gb2.use_div === true, '2f: .use_div property');

// ═══════════════════════════════════════════════════════════
section('3. Variants');
// ═══════════════════════════════════════════════════════════

['default', 'subtle', 'elevated'].forEach(v => {
    const b = new Group_Box({ context, legend: 'Test', variant: v });
    const h = b.all_html_render();
    assert(h.includes(`data-variant="${v}"`), `3-${v}: data-variant="${v}"`);
    assert(b.variant === v, `3-${v}: .variant property`);
});

// ═══════════════════════════════════════════════════════════
section('4. Invalid state');
// ═══════════════════════════════════════════════════════════

const gb4 = new Group_Box({ context, legend: 'Login', invalid: true });
const html4 = gb4.all_html_render();
assert(html4.includes('group-box-invalid'), '4a: invalid class');
assert(html4.includes('aria-invalid="true"'), '4b: aria-invalid');
assert(gb4.invalid === true, '4c: .invalid property');

// ═══════════════════════════════════════════════════════════
section('5. Disabled state (fieldset)');
// ═══════════════════════════════════════════════════════════

const gb5 = new Group_Box({ context, legend: 'Disabled', disabled: true });
const html5 = gb5.all_html_render();
assert(html5.includes('group-box-disabled'), '5a: disabled class');
assert(html5.includes('aria-disabled="true"'), '5b: aria-disabled');
assert(gb5.disabled === true, '5c: .disabled property');

// ═══════════════════════════════════════════════════════════
section('6. Disabled state (div mode)');
// ═══════════════════════════════════════════════════════════

const gb6 = new Group_Box({ context, legend: 'Disabled Div', disabled: true, use_div: true });
const html6 = gb6.all_html_render();
assert(html6.includes('group-box-disabled'), '6a: disabled class in div mode');
assert(html6.includes('aria-disabled="true"'), '6b: aria-disabled in div mode');

// ═══════════════════════════════════════════════════════════
section('7. set_legend method');
// ═══════════════════════════════════════════════════════════

const gb7 = new Group_Box({ context, legend: 'First' });
assert(gb7.legend === 'First', '7a: initial legend');
gb7.set_legend('Second');
assert(gb7.legend === 'Second', '7b: updated legend');
gb7.set_legend('');
assert(gb7.legend === '', '7c: empty string');
gb7.set_legend(null);
assert(gb7.legend === '', '7d: null becomes empty');
gb7.set_legend('Final');
assert(gb7.legend === 'Final', '7e: set again');

// ═══════════════════════════════════════════════════════════
section('8. set_invalid method');
// ═══════════════════════════════════════════════════════════

const gb8 = new Group_Box({ context, legend: 'Test' });
assert(gb8.invalid === false, '8a: starts valid');
gb8.set_invalid(true);
assert(gb8.invalid === true, '8b: set to invalid');
assert(gb8.dom.attributes['aria-invalid'] === 'true', '8c: aria-invalid set');
gb8.set_invalid(false);
assert(gb8.invalid === false, '8d: set back to valid');
assert(gb8.dom.attributes['aria-invalid'] === undefined, '8e: aria-invalid removed');

// Idempotent
gb8.set_invalid(false);
assert(gb8.invalid === false, '8f: double-clear is safe');

// ═══════════════════════════════════════════════════════════
section('9. set_disabled method');
// ═══════════════════════════════════════════════════════════

const gb9 = new Group_Box({ context, legend: 'Test' });
assert(gb9.disabled === false, '9a: starts enabled');
gb9.set_disabled(true);
assert(gb9.disabled === true, '9b: disabled');
assert(gb9.dom.attributes['aria-disabled'] === 'true', '9c: aria-disabled set');
gb9.set_disabled(false);
assert(gb9.disabled === false, '9d: re-enabled');
assert(gb9.dom.attributes['aria-disabled'] === undefined, '9e: aria-disabled removed');

// Double toggle
gb9.set_disabled(true);
gb9.set_disabled(true);
assert(gb9.disabled === true, '9f: double-disable safe');

// ═══════════════════════════════════════════════════════════
section('10. set_variant method');
// ═══════════════════════════════════════════════════════════

const gb10 = new Group_Box({ context, legend: 'Test' });
['subtle', 'elevated', 'default'].forEach(v => {
    gb10.set_variant(v);
    assert(gb10.variant === v, `10-${v}: set_variant('${v}')`);
    assert(gb10.dom.attributes['data-variant'] === v, `10-${v}: data-attr`);
});

gb10.set_variant('invalid');
assert(gb10.variant === 'default', '10-invalid: falls back to default');
gb10.set_variant('');
assert(gb10.variant === 'default', '10-empty: falls back to default');
gb10.set_variant(null);
assert(gb10.variant === 'default', '10-null: falls back to default');

// ═══════════════════════════════════════════════════════════
section('11. add_content method');
// ═══════════════════════════════════════════════════════════

const gb11 = new Group_Box({ context, legend: 'Form' });
const child = new Control({ context });
child.add_class('test-child');
child.add('Hello');
gb11.add_content(child);
const html11 = gb11.all_html_render();
assert(html11.includes('test-child'), '11a: child added to content area');
assert(html11.includes('Hello'), '11b: child content rendered');

// Assert child is inside content area (appears after group-box-content)
const contentIdx = html11.indexOf('group-box-content');
const childIdx = html11.indexOf('test-child');
assert(contentIdx < childIdx, '11c: child is inside content area');

// ═══════════════════════════════════════════════════════════
section('12. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Group_Box.css === 'string', '12a: .css is string');
assert(Group_Box.css.includes('.jsgui-group-box'), '12b: root selector');
assert(Group_Box.css.includes('.group-box-legend'), '12c: legend selector');
assert(Group_Box.css.includes('.group-box-content'), '12d: content selector');
assert(Group_Box.css.includes('data-variant="subtle"'), '12e: subtle variant CSS');
assert(Group_Box.css.includes('data-variant="elevated"'), '12f: elevated variant CSS');
assert(Group_Box.css.includes('.group-box-invalid'), '12g: invalid CSS');
assert(Group_Box.css.includes('.group-box-disabled'), '12h: disabled CSS');
assert(Group_Box.css.includes('--j-border'), '12i: uses --j-border');
assert(Group_Box.css.includes('--j-danger'), '12j: uses --j-danger');
assert(Group_Box.css.includes('--j-fg-muted'), '12k: uses --j-fg-muted');
assert(!Group_Box.css.includes('--admin-'), '12l: no deprecated --admin-');

// ═══════════════════════════════════════════════════════════
section('13. Internal structure');
// ═══════════════════════════════════════════════════════════

assert(gb1.legend_ctrl !== undefined, '13a: legend_ctrl exists');
assert(gb1.content_ctrl !== undefined, '13b: content_ctrl exists');

// ═══════════════════════════════════════════════════════════
section('14. Combination: elevated + invalid + disabled');
// ═══════════════════════════════════════════════════════════

const gb14 = new Group_Box({
    context,
    legend: 'Critical Settings',
    variant: 'elevated',
    invalid: true,
    disabled: true
});
const html14 = gb14.all_html_render();

assert(html14.includes('data-variant="elevated"'), '14a: elevated variant');
assert(html14.includes('group-box-invalid'), '14b: invalid');
assert(html14.includes('group-box-disabled'), '14c: disabled');
assert(html14.includes('Critical Settings'), '14d: legend text');

// ═══════════════════════════════════════════════════════════
section('15. Empty legend');
// ═══════════════════════════════════════════════════════════

const gb15 = new Group_Box({ context });
assert(gb15.legend === '', '15a: empty legend by default');
const html15 = gb15.all_html_render();
assert(html15.includes('group-box-legend'), '15b: legend element still present');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Group_Box: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Group_Box checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
