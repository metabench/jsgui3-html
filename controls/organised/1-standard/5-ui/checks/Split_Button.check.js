/**
 * Split_Button.check.js — Extensive validation for Split_Button control.
 *
 * Tests cover:
 *   1.  Default construction and HTML structure
 *   2.  Custom text
 *   3.  Menu items rendering
 *   4.  Default action (first item ID)
 *   5.  Custom default_action
 *   6.  Variants: default, primary, danger
 *   7.  Disabled state
 *   8.  Disabled menu items
 *   9.  ARIA attributes (haspopup, expanded, label, role)
 *   10. open_menu / close_menu methods
 *   11. set_disabled method
 *   12. set_variant method (valid + invalid)
 *   13. set_items method
 *   14. Menu item count and separator handling
 *   15. CSS static property validation
 *   16. Internal structure (primary_btn, trigger_btn, menu)
 *   17. Combination: danger + disabled items + custom text
 *   18. Empty items array
 *   19. Edge cases
 */

const Split_Button = require('../split_button');
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

const sb1 = new Split_Button({
    context,
    text: 'Save',
    items: [
        { id: 'save', text: 'Save' },
        { id: 'save_as', text: 'Save As...' },
        { id: 'save_copy', text: 'Save Copy' }
    ]
});
const html1 = sb1.all_html_render();

assert(html1.includes('jsgui-split-button'), '1a: has jsgui class');
assert(html1.includes('split-button-primary'), '1b: has primary button');
assert(html1.includes('split-button-trigger'), '1c: has trigger button');
assert(html1.includes('split-button-menu'), '1d: has menu');
assert(html1.includes('Save'), '1e: primary text');
assert(html1.includes('data-variant="default"'), '1f: default variant');
assert(!html1.includes('split-button-disabled'), '1g: not disabled');
assert(sb1.text === 'Save', '1h: .text property');
assert(sb1.variant === 'default', '1i: .variant property');
assert(sb1.disabled === false, '1j: .disabled property');
assert(sb1.open === false, '1k: .open is false');
assert(sb1.items.length === 3, '1l: 3 items');

// ═══════════════════════════════════════════════════════════
section('2. Menu items rendering');
// ═══════════════════════════════════════════════════════════

assert(html1.includes('Save As...'), '2a: menu item text');
assert(html1.includes('Save Copy'), '2b: second menu item');
assert(html1.includes('data-action-id="save"'), '2c: item ID attribute');
assert(html1.includes('data-action-id="save_as"'), '2d: second item ID');
assert(html1.includes('data-action-id="save_copy"'), '2e: third item ID');
assert(html1.includes('role="menuitem"'), '2f: menuitem role');
assert(html1.includes('role="menu"'), '2g: menu role');

// Count menu items (3)
const menuItemCount = (html1.match(/role="menuitem"/g) || []).length;
assert(menuItemCount === 3, '2h: exactly 3 menu items');

// ═══════════════════════════════════════════════════════════
section('3. Default action');
// ═══════════════════════════════════════════════════════════

assert(sb1.default_action === 'save', '3a: default_action = first item ID');

const sb3 = new Split_Button({
    context,
    text: 'Deploy',
    default_action: 'deploy_staging',
    items: [
        { id: 'deploy_prod', text: 'Production' },
        { id: 'deploy_staging', text: 'Staging' }
    ]
});
assert(sb3.default_action === 'deploy_staging', '3b: custom default_action');

// Empty items
const sb3b = new Split_Button({ context, text: 'Empty', items: [] });
assert(sb3b.default_action === 'default', '3c: no items => default_action = "default"');

// ═══════════════════════════════════════════════════════════
section('4. ARIA attributes');
// ═══════════════════════════════════════════════════════════

assert(html1.includes('aria-haspopup="menu"'), '4a: trigger has aria-haspopup');
assert(html1.includes('aria-expanded="false"'), '4b: starts collapsed');
assert(html1.includes('aria-label="More actions"'), '4c: trigger aria-label');

// ═══════════════════════════════════════════════════════════
section('5. Button types');
// ═══════════════════════════════════════════════════════════

assert(html1.includes('type="button"'), '5a: buttons have type=button');

// Primary and trigger are both buttons
const buttonCount = (html1.match(/type="button"/g) || []).length;
assert(buttonCount >= 2, '5b: at least 2 buttons with type=button');

// ═══════════════════════════════════════════════════════════
section('6. Variants');
// ═══════════════════════════════════════════════════════════

['default', 'primary', 'danger'].forEach(v => {
    const b = new Split_Button({ context, text: 'Test', variant: v, items: [] });
    const h = b.all_html_render();
    assert(h.includes(`data-variant="${v}"`), `6-${v}: data-variant="${v}"`);
    assert(b.variant === v, `6-${v}: .variant property`);
});

// ═══════════════════════════════════════════════════════════
section('7. Disabled state');
// ═══════════════════════════════════════════════════════════

const sb7 = new Split_Button({ context, text: 'Disabled', disabled: true, items: [] });
const html7 = sb7.all_html_render();
assert(html7.includes('split-button-disabled'), '7a: disabled class');
assert(html7.includes('aria-disabled="true"'), '7b: aria-disabled');
assert(sb7.disabled === true, '7c: .disabled property');

// ═══════════════════════════════════════════════════════════
section('8. Disabled menu items');
// ═══════════════════════════════════════════════════════════

const sb8 = new Split_Button({
    context,
    text: 'Actions',
    items: [
        { id: 'edit', text: 'Edit' },
        { id: 'locked', text: 'Locked', disabled: true },
        { id: 'delete', text: 'Delete' }
    ]
});
const html8 = sb8.all_html_render();
assert(html8.includes('split-button-menu-item-disabled'), '8a: disabled item class');

// Only 1 disabled item (the second one)
const disabledCount = (html8.match(/aria-disabled="true"/g) || []).length;
assert(disabledCount === 1, '8b: exactly 1 disabled item');

// ═══════════════════════════════════════════════════════════
section('9. open_menu / close_menu');
// ═══════════════════════════════════════════════════════════

const sb9 = new Split_Button({ context, text: 'Menu', items: [{ id: 'a', text: 'A' }] });
assert(sb9.open === false, '9a: starts closed');

sb9.open_menu();
assert(sb9.open === true, '9b: open after open_menu');
assert(sb9.trigger_btn.dom.attributes['aria-expanded'] === 'true', '9c: aria-expanded=true');

sb9.close_menu();
assert(sb9.open === false, '9d: closed after close_menu');
assert(sb9.trigger_btn.dom.attributes['aria-expanded'] === 'false', '9e: aria-expanded=false');

// Double open is safe
sb9.open_menu();
sb9.open_menu();
assert(sb9.open === true, '9f: double-open safe');

sb9.close_menu();
sb9.close_menu();
assert(sb9.open === false, '9g: double-close safe');

// ═══════════════════════════════════════════════════════════
section('10. set_disabled method');
// ═══════════════════════════════════════════════════════════

const sb10 = new Split_Button({ context, text: 'Test', items: [] });
assert(sb10.disabled === false, '10a: starts enabled');
sb10.set_disabled(true);
assert(sb10.disabled === true, '10b: disabled');
assert(sb10.dom.attributes['aria-disabled'] === 'true', '10c: aria-disabled');
sb10.set_disabled(false);
assert(sb10.disabled === false, '10d: re-enabled');
assert(sb10.dom.attributes['aria-disabled'] === undefined, '10e: aria-disabled removed');

// Idempotent
sb10.set_disabled(false);
assert(sb10.disabled === false, '10f: double-enable safe');

// ═══════════════════════════════════════════════════════════
section('11. set_variant method');
// ═══════════════════════════════════════════════════════════

const sb11 = new Split_Button({ context, text: 'Test', items: [] });
['primary', 'danger', 'default'].forEach(v => {
    sb11.set_variant(v);
    assert(sb11.variant === v, `11-${v}: set_variant('${v}')`);
    assert(sb11.dom.attributes['data-variant'] === v, `11-${v}: data-attr`);
});

sb11.set_variant('invalid');
assert(sb11.variant === 'default', '11-invalid: falls back to default');
sb11.set_variant('');
assert(sb11.variant === 'default', '11-empty: falls back to default');
sb11.set_variant(null);
assert(sb11.variant === 'default', '11-null: falls back to default');
sb11.set_variant(42);
assert(sb11.variant === 'default', '11-number: falls back to default');

// ═══════════════════════════════════════════════════════════
section('12. set_items method');
// ═══════════════════════════════════════════════════════════

const sb12 = new Split_Button({ context, text: 'Test', items: [{ id: 'a', text: 'A' }] });
assert(sb12.items.length === 1, '12a: starts with 1 item');

sb12.set_items([
    { id: 'x', text: 'X' },
    { id: 'y', text: 'Y' }
]);
assert(sb12.items.length === 2, '12b: updated to 2 items');

sb12.set_items([]);
assert(sb12.items.length === 0, '12c: cleared to 0 items');

sb12.set_items(null);
assert(sb12.items.length === 0, '12d: null becomes empty array');

// ═══════════════════════════════════════════════════════════
section('13. Empty items');
// ═══════════════════════════════════════════════════════════

const sb13 = new Split_Button({ context, text: 'Empty', items: [] });
const html13 = sb13.all_html_render();
assert(html13.includes('split-button-menu'), '13a: menu element exists even with no items');
assert(!html13.includes('role="menuitem"'), '13b: no menu items');

// ═══════════════════════════════════════════════════════════
section('14. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Split_Button.css === 'string', '14a: .css is string');
assert(Split_Button.css.includes('.jsgui-split-button'), '14b: root selector');
assert(Split_Button.css.includes('.split-button-primary'), '14c: primary CSS');
assert(Split_Button.css.includes('.split-button-trigger'), '14d: trigger CSS');
assert(Split_Button.css.includes('.split-button-menu'), '14e: menu CSS');
assert(Split_Button.css.includes('.split-button-menu-item'), '14f: item CSS');
assert(Split_Button.css.includes('.split-button-menu-item-disabled'), '14g: disabled item CSS');
assert(Split_Button.css.includes('split-button-open'), '14h: open state CSS');
assert(Split_Button.css.includes('data-variant="primary"'), '14i: primary variant CSS');
assert(Split_Button.css.includes('data-variant="danger"'), '14j: danger variant CSS');
assert(Split_Button.css.includes('.split-button-disabled'), '14k: disabled CSS');
assert(Split_Button.css.includes('--j-border'), '14l: uses --j-border');
assert(Split_Button.css.includes('--j-primary'), '14m: uses --j-primary');
assert(Split_Button.css.includes('--j-danger'), '14n: uses --j-danger');
assert(Split_Button.css.includes('--j-bg-hover'), '14o: uses --j-bg-hover');
assert(Split_Button.css.includes('focus-visible'), '14p: focus-visible in CSS');
assert(Split_Button.css.includes('box-shadow'), '14q: box-shadow for menu');
assert(!Split_Button.css.includes('--admin-'), '14r: no deprecated --admin-');

// ═══════════════════════════════════════════════════════════
section('15. Internal structure');
// ═══════════════════════════════════════════════════════════

assert(sb1.primary_btn !== undefined, '15a: primary_btn exists');
assert(sb1.trigger_btn !== undefined, '15b: trigger_btn exists');
assert(sb1.menu !== undefined, '15c: menu exists');

// Primary appears before trigger in DOM order
const primaryIdx = html1.indexOf('split-button-primary');
const triggerIdx = html1.indexOf('split-button-trigger');
const menuIdx = html1.indexOf('split-button-menu');
assert(primaryIdx < triggerIdx, '15d: primary before trigger');
assert(triggerIdx < menuIdx, '15e: trigger before menu');

// ═══════════════════════════════════════════════════════════
section('16. Combination: danger + disabled items + text');
// ═══════════════════════════════════════════════════════════

const sb16 = new Split_Button({
    context,
    text: 'Delete',
    variant: 'danger',
    items: [
        { id: 'trash', text: 'Move to Trash' },
        { id: 'purge', text: 'Delete Permanently', disabled: true }
    ]
});
const html16 = sb16.all_html_render();
assert(html16.includes('data-variant="danger"'), '16a: danger variant');
assert(html16.includes('Delete'), '16b: primary text');
assert(html16.includes('Move to Trash'), '16c: first item');
assert(html16.includes('Delete Permanently'), '16d: disabled item text');
assert(html16.includes('split-button-menu-item-disabled'), '16e: disabled item class');

// ═══════════════════════════════════════════════════════════
section('17. Item uses ID as text when text is missing');
// ═══════════════════════════════════════════════════════════

const sb17 = new Split_Button({
    context,
    text: 'Action',
    items: [{ id: 'fallback_id' }]
});
const html17 = sb17.all_html_render();
assert(html17.includes('fallback_id'), '17a: ID used as text fallback');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Split_Button: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Split_Button checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
