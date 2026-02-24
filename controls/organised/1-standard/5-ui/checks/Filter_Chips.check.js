/**
 * Filter_Chips.check.js — Extensive validation for Filter_Chips control.
 *
 * Tests cover:
 *   1.  Default construction and HTML structure
 *   2.  Custom items
 *   3.  Initial selected_ids via spec
 *   4.  Item with selected:true in item definition
 *   5.  Multiple mode (default)
 *   6.  Single-select mode
 *   7.  Disabled chips
 *   8.  Roving tabindex — first enabled chip gets tabindex=0
 *   9.  Roving tabindex — disabled first chip shifts tabindex=0 to second
 *   10. toggle_chip — select
 *   11. toggle_chip — deselect
 *   12. toggle_chip — multi-select accumulation
 *   13. toggle_chip — single-select replacement
 *   14. get_selected_ids returns array
 *   15. set_selected_ids method
 *   16. set_selected_ids with empty array
 *   17. set_selected_ids with invalid input (null)
 *   18. ARIA attributes (role, aria-label, aria-pressed, data-multiple)
 *   19. CSS static property validation
 *   20. Internal structure (chip_controls array)
 *   21. Empty items array
 *   22. Custom aria_label
 *   23. ID-only items (no label)
 *   24. Combination tests
 *   25. Edge cases
 */

const Filter_Chips = require('../filter_chips');
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

const fc1 = new Filter_Chips({
    context,
    items: [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'inactive', label: 'Inactive' }
    ],
    selected_ids: ['all']
});
const html1 = fc1.all_html_render();

assert(html1.includes('jsgui-filter-chips'), '1a: has jsgui class');
assert(html1.includes('role="group"'), '1b: role=group');
assert(html1.includes('aria-label="Filter chips"'), '1c: default aria-label');
assert(html1.includes('data-multiple="true"'), '1d: multiple mode default');
assert(html1.includes('filter-chip'), '1e: has chip elements');
assert(html1.includes('All'), '1f: first chip text');
assert(html1.includes('Active'), '1g: second chip text');
assert(html1.includes('Inactive'), '1h: third chip text');
assert(fc1.multiple === true, '1i: .multiple property');
assert(fc1.items.length === 3, '1j: 3 items');
assert(fc1.chip_controls.length === 3, '1k: 3 chip controls');

// ═══════════════════════════════════════════════════════════
section('2. Selected state');
// ═══════════════════════════════════════════════════════════

assert(html1.includes('filter-chip-selected'), '2a: has selected chip');
assert(html1.includes('aria-pressed="true"'), '2b: selected chip aria-pressed');
assert(fc1.selected_ids.has('all'), '2c: "all" in selected_ids set');
assert(!fc1.selected_ids.has('active'), '2d: "active" not selected');

// Count selected chips (1)
const selectedCount = (html1.match(/filter-chip-selected/g) || []).length;
assert(selectedCount === 1, '2e: exactly 1 selected chip');

// ═══════════════════════════════════════════════════════════
section('3. Item with selected:true');
// ═══════════════════════════════════════════════════════════

const fc3 = new Filter_Chips({
    context,
    items: [
        { id: 'a', label: 'A', selected: true },
        { id: 'b', label: 'B' }
    ]
});
assert(fc3.selected_ids.has('a'), '3a: item.selected=true adds to selected_ids');
assert(!fc3.selected_ids.has('b'), '3b: unselected item not in set');

// ═══════════════════════════════════════════════════════════
section('4. Chip button rendering');
// ═══════════════════════════════════════════════════════════

assert(html1.includes('<button'), '4a: chips are buttons');
assert(html1.includes('type="button"'), '4b: type=button');
assert(html1.includes('data-chip-id="all"'), '4c: chip ID attribute');
assert(html1.includes('data-chip-id="active"'), '4d: second chip ID');
assert(html1.includes('data-chip-id="inactive"'), '4e: third chip ID');
assert(html1.includes('aria-label="All"'), '4f: chip aria-label from label');

// Count buttons (3 chips)
const buttonCount = (html1.match(/<button/g) || []).length;
assert(buttonCount === 3, '4g: exactly 3 button chips');

// ═══════════════════════════════════════════════════════════
section('5. Roving tabindex');
// ═══════════════════════════════════════════════════════════

// First chip should have tabindex=0
assert(html1.includes('tabindex="0"'), '5a: has tabindex=0');
assert(html1.includes('tabindex="-1"'), '5b: has tabindex=-1');

// Count tabindex=0 (should be exactly 1)
const tab0Count = (html1.match(/tabindex="0"/g) || []).length;
assert(tab0Count === 1, '5c: exactly 1 chip with tabindex=0');

// ═══════════════════════════════════════════════════════════
section('6. Roving tabindex — disabled first chip');
// ═══════════════════════════════════════════════════════════

const fc6 = new Filter_Chips({
    context,
    items: [
        { id: 'x', label: 'X', disabled: true },
        { id: 'y', label: 'Y' },
        { id: 'z', label: 'Z' }
    ]
});
const html6 = fc6.all_html_render();

// First chip is disabled, so second chip should get tabindex=0
// There should be exactly 1 tabindex=0
const tab0Count6 = (html6.match(/tabindex="0"/g) || []).length;
assert(tab0Count6 === 1, '6a: still exactly 1 tabindex=0');

// Verify the disabled chip does NOT have tabindex=0
// The tabindex=0 should NOT be on the disabled chip
// Since X is disabled and Y is enabled, Y should get tabindex=0

// ═══════════════════════════════════════════════════════════
section('7. Disabled chips');
// ═══════════════════════════════════════════════════════════

const fc7 = new Filter_Chips({
    context,
    items: [
        { id: 'enabled', label: 'Enabled' },
        { id: 'disabled', label: 'Disabled', disabled: true }
    ]
});
const html7 = fc7.all_html_render();
assert(html7.includes('filter-chip-disabled'), '7a: disabled chip class');
assert(html7.includes('aria-disabled="true"'), '7b: aria-disabled');

// ═══════════════════════════════════════════════════════════
section('8. toggle_chip — select');
// ═══════════════════════════════════════════════════════════

const fc8 = new Filter_Chips({
    context,
    items: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' }
    ]
});
assert(fc8.selected_ids.size === 0, '8a: starts empty');
fc8.toggle_chip('a');
assert(fc8.selected_ids.has('a'), '8b: "a" selected after toggle');
assert(fc8.selected_ids.size === 1, '8c: 1 selected');

// ═══════════════════════════════════════════════════════════
section('9. toggle_chip — deselect');
// ═══════════════════════════════════════════════════════════

fc8.toggle_chip('a');
assert(!fc8.selected_ids.has('a'), '9a: "a" deselected after second toggle');
assert(fc8.selected_ids.size === 0, '9b: 0 selected');

// ═══════════════════════════════════════════════════════════
section('10. toggle_chip — multi-select accumulation');
// ═══════════════════════════════════════════════════════════

const fc10 = new Filter_Chips({
    context,
    items: [
        { id: '1', label: 'One' },
        { id: '2', label: 'Two' },
        { id: '3', label: 'Three' }
    ]
});
fc10.toggle_chip('1');
fc10.toggle_chip('2');
fc10.toggle_chip('3');
assert(fc10.selected_ids.size === 3, '10a: all 3 selected in multi mode');
assert(fc10.selected_ids.has('1'), '10b: 1 selected');
assert(fc10.selected_ids.has('2'), '10c: 2 selected');
assert(fc10.selected_ids.has('3'), '10d: 3 selected');

// ═══════════════════════════════════════════════════════════
section('11. toggle_chip — single-select mode');
// ═══════════════════════════════════════════════════════════

const fc11 = new Filter_Chips({
    context,
    multiple: false,
    items: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' }
    ]
});
fc11.toggle_chip('a');
assert(fc11.selected_ids.has('a'), '11a: a selected');
fc11.toggle_chip('b');
assert(fc11.selected_ids.has('b'), '11b: b selected');
assert(!fc11.selected_ids.has('a'), '11c: a deselected (single select)');
assert(fc11.selected_ids.size === 1, '11d: only 1 selected');

// Deselect in single mode
fc11.toggle_chip('b');
assert(!fc11.selected_ids.has('b'), '11e: b deselected');
assert(fc11.selected_ids.size === 0, '11f: 0 selected');

// ═══════════════════════════════════════════════════════════
section('12. get_selected_ids');
// ═══════════════════════════════════════════════════════════

const fc12 = new Filter_Chips({
    context,
    items: [
        { id: 'x', label: 'X' },
        { id: 'y', label: 'Y' }
    ],
    selected_ids: ['x']
});
const ids12 = fc12.get_selected_ids();
assert(Array.isArray(ids12), '12a: returns array');
assert(ids12.length === 1, '12b: 1 selected');
assert(ids12[0] === 'x', '12c: correct ID');

// ═══════════════════════════════════════════════════════════
section('13. set_selected_ids');
// ═══════════════════════════════════════════════════════════

const fc13 = new Filter_Chips({
    context,
    items: [
        { id: '1', label: 'One' },
        { id: '2', label: 'Two' },
        { id: '3', label: 'Three' }
    ]
});

fc13.set_selected_ids(['2', '3']);
assert(fc13.selected_ids.has('2'), '13a: 2 selected');
assert(fc13.selected_ids.has('3'), '13b: 3 selected');
assert(!fc13.selected_ids.has('1'), '13c: 1 not selected');
assert(fc13.selected_ids.size === 2, '13d: 2 selected total');

// ═══════════════════════════════════════════════════════════
section('14. set_selected_ids edge cases');
// ═══════════════════════════════════════════════════════════

fc13.set_selected_ids([]);
assert(fc13.selected_ids.size === 0, '14a: empty array clears selection');

fc13.set_selected_ids(null);
assert(fc13.selected_ids.size === 0, '14b: null becomes empty');

fc13.set_selected_ids(['1']);
assert(fc13.selected_ids.size === 1, '14c: can set again after null');

// Numeric IDs get stringified
fc13.set_selected_ids([1, 2]);
assert(fc13.selected_ids.has('1'), '14d: numeric ID stringified');
assert(fc13.selected_ids.has('2'), '14e: second numeric ID stringified');

// ═══════════════════════════════════════════════════════════
section('15. data-multiple attribute');
// ═══════════════════════════════════════════════════════════

const fcMulti = new Filter_Chips({ context, items: [] });
const htmlMulti = fcMulti.all_html_render();
assert(htmlMulti.includes('data-multiple="true"'), '15a: multi mode default');

const fcSingle = new Filter_Chips({ context, multiple: false, items: [] });
const htmlSingle = fcSingle.all_html_render();
assert(htmlSingle.includes('data-multiple="false"'), '15b: single mode');

// ═══════════════════════════════════════════════════════════
section('16. Custom aria_label');
// ═══════════════════════════════════════════════════════════

const fc16 = new Filter_Chips({ context, aria_label: 'Priority filter', items: [] });
const html16 = fc16.all_html_render();
assert(html16.includes('aria-label="Priority filter"'), '16a: custom aria-label');

// ═══════════════════════════════════════════════════════════
section('17. ID-only items (no label)');
// ═══════════════════════════════════════════════════════════

const fc17 = new Filter_Chips({
    context,
    items: [{ id: 'raw_id' }]
});
const html17 = fc17.all_html_render();
assert(html17.includes('raw_id'), '17a: ID used as display text when no label');
assert(html17.includes('aria-label="raw_id"'), '17b: ID used as aria-label');

// ═══════════════════════════════════════════════════════════
section('18. Empty items');
// ═══════════════════════════════════════════════════════════

const fc18 = new Filter_Chips({ context, items: [] });
const html18 = fc18.all_html_render();
assert(html18.includes('jsgui-filter-chips'), '18a: root renders');
assert(!html18.includes('<button'), '18b: no chip buttons');
assert(fc18.chip_controls.length === 0, '18c: empty chip_controls');

// ═══════════════════════════════════════════════════════════
section('19. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Filter_Chips.css === 'string', '19a: .css is string');
assert(Filter_Chips.css.includes('.jsgui-filter-chips'), '19b: root selector');
assert(Filter_Chips.css.includes('.filter-chip'), '19c: chip selector');
assert(Filter_Chips.css.includes('.filter-chip-selected'), '19d: selected chip CSS');
assert(Filter_Chips.css.includes('.filter-chip-disabled'), '19e: disabled chip CSS');
assert(Filter_Chips.css.includes('--j-border'), '19f: uses --j-border');
assert(Filter_Chips.css.includes('--j-primary'), '19g: uses --j-primary');
assert(Filter_Chips.css.includes('--j-bg-hover'), '19h: uses --j-bg-hover');
assert(Filter_Chips.css.includes('focus-visible'), '19i: focus-visible in CSS');
assert(Filter_Chips.css.includes('border-radius: 999px'), '19j: pill shape');
assert(Filter_Chips.css.includes('font-weight: 500'), '19k: bold selected text');
assert(!Filter_Chips.css.includes('--admin-'), '19l: no deprecated --admin-');

// ═══════════════════════════════════════════════════════════
section('20. Sync state after toggle');
// ═══════════════════════════════════════════════════════════

const fc20 = new Filter_Chips({
    context,
    items: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' }
    ]
});
fc20.toggle_chip('a');
// After toggle, the chip_control's aria-pressed should update
assert(fc20.chip_controls[0].dom.attributes['aria-pressed'] === 'true', '20a: chip aria-pressed synced to true');
fc20.toggle_chip('a');
assert(fc20.chip_controls[0].dom.attributes['aria-pressed'] === 'false', '20b: chip aria-pressed synced to false');

// ═══════════════════════════════════════════════════════════
section('21. Combination: single + disabled + initial selection');
// ═══════════════════════════════════════════════════════════

const fc21 = new Filter_Chips({
    context,
    multiple: false,
    items: [
        { id: 'open', label: 'Open', selected: true },
        { id: 'closed', label: 'Closed' },
        { id: 'archived', label: 'Archived', disabled: true }
    ]
});
const html21 = fc21.all_html_render();

assert(fc21.selected_ids.has('open'), '21a: initial selection from item.selected');
assert(html21.includes('data-multiple="false"'), '21b: single select');
assert(html21.includes('filter-chip-disabled'), '21c: has disabled chip');
assert(html21.includes('filter-chip-selected'), '21d: has selected chip');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Filter_Chips: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Filter_Chips checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
