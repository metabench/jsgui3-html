/**
 * Data_Filter.check.js — Validation for Data_Filter control.
 *
 * Tests:
 *   1.  Construction with fields
 *   2.  HTML structure
 *   3.  add_filter() adds a row
 *   4.  get_filters() returns array
 *   5.  get_filter_map() returns map format
 *   6.  filter_change event raised with map payload
 *   7.  apply() filters data correctly
 *   8.  clear() removes all
 *   9.  remove_filter() by index
 *   10. CSS static property
 *   11. Initial filters from spec
 *   12. Operators for different types
 *   13. Multiple filter rows
 *   14. Empty field handling in get_filter_map
 */

const Data_Filter = require('../Data_Filter');
const jsgui = require('../../../../_core');
const Page_Context = jsgui.Page_Context;

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) { passed++; }
    else { console.error(`  ✗ FAIL: ${name}`); failed++; }
}

function section(title) { console.log(`\n── ${title} ──`); }

const context = new Page_Context();

const test_fields = [
    { name: 'name', label: 'Name', type: 'string' },
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'active', label: 'Active', type: 'boolean' }
];

// ═══════════════════════════════════════════════════════════
section('1. Construction with fields');
// ═══════════════════════════════════════════════════════════

const f1 = new Data_Filter({
    context,
    fields: test_fields
});

assert(f1._fields.length === 3, '1a: 3 fields stored');
assert(f1._fields[0].name === 'name', '1b: first field name');
assert(f1._fields[1].type === 'number', '1c: second field type');
assert(f1._filter_rows.length === 0, '1d: no initial filter rows');

// ═══════════════════════════════════════════════════════════
section('2. HTML structure');
// ═══════════════════════════════════════════════════════════

const html1 = f1.all_html_render();
assert(html1.includes('jsgui-data-filter'), '2a: root class');
assert(html1.includes('data-filter-header'), '2b: header section');
assert(html1.includes('data-filter-rows'), '2c: rows container');
assert(html1.includes('Add Filter'), '2d: add button text');
assert(html1.includes('No filters applied'), '2e: empty state message');

// ═══════════════════════════════════════════════════════════
section('3. add_filter()');
// ═══════════════════════════════════════════════════════════

let change_count = 0;
f1.on('change', () => { change_count++; });

f1.add_filter();
assert(f1._filter_rows.length === 1, '3a: 1 filter row after add');
assert(change_count === 1, '3b: change event fired');

const html3 = f1.all_html_render();
assert(html3.includes('data-filter-row'), '3c: filter row rendered');
assert(html3.includes('data-filter-field'), '3d: field selector rendered');
assert(html3.includes('data-filter-operator'), '3e: operator selector rendered');
assert(html3.includes('data-filter-value'), '3f: value input rendered');

// ═══════════════════════════════════════════════════════════
section('4. get_filters() returns array');
// ═══════════════════════════════════════════════════════════

const filters = f1.get_filters();
assert(Array.isArray(filters), '4a: returns array');
assert(filters.length === 1, '4b: 1 filter');
assert(filters[0].field === 'name', '4c: default field is first field');
assert(filters[0].operator === 'contains', '4d: default operator');
assert(filters[0].value === '', '4e: default value empty');

// ═══════════════════════════════════════════════════════════
section('5. get_filter_map()');
// ═══════════════════════════════════════════════════════════

// Empty value should not appear in map
const map_empty = f1.get_filter_map();
assert(typeof map_empty === 'object', '5a: returns object');
assert(Object.keys(map_empty).length === 0, '5b: empty value excluded from map');

// Set a value and check map
f1._filter_rows[0].value = 'Alice';
const map_filled = f1.get_filter_map();
assert(Object.keys(map_filled).length === 1, '5c: 1 entry in map');
assert(map_filled.name, '5d: name key present');
assert(map_filled.name.op === 'contains', '5e: op is contains');
assert(map_filled.name.value === 'Alice', '5f: value is Alice');

// ═══════════════════════════════════════════════════════════
section('6. filter_change event');
// ═══════════════════════════════════════════════════════════

let filter_change_payload = null;
const f6 = new Data_Filter({
    context,
    fields: test_fields
});
f6.on('filter_change', e => { filter_change_payload = e; });

f6._add_filter_row({ field: 'name', operator: 'contains', value: 'Bob' });
f6._fire_change();

assert(filter_change_payload !== null, '6a: filter_change event received');
assert(filter_change_payload.filters, '6b: payload has filters');
assert(filter_change_payload.filters.name, '6c: name key in map');
assert(filter_change_payload.filters.name.op === 'contains', '6d: op is contains');
assert(filter_change_payload.filters.name.value === 'Bob', '6e: value is Bob');

// ═══════════════════════════════════════════════════════════
section('7. apply() filters data');
// ═══════════════════════════════════════════════════════════

const test_data = [
    { name: 'Alice', age: 30, active: true },
    { name: 'Bob', age: 25, active: false },
    { name: 'Charlie', age: 35, active: true }
];

const f7 = new Data_Filter({
    context,
    fields: test_fields,
    filters: [{ field: 'name', operator: 'contains', value: 'Ali' }]
});

const filtered = f7.apply(test_data);
assert(filtered.length === 1, '7a: 1 match');
assert(filtered[0].name === 'Alice', '7b: correct match');

// Equals filter
const f7b = new Data_Filter({
    context,
    fields: test_fields,
    filters: [{ field: 'name', operator: 'equals', value: 'Bob' }]
});
const filtered_eq = f7b.apply(test_data);
assert(filtered_eq.length === 1, '7c: equals match');
assert(filtered_eq[0].name === 'Bob', '7d: correct equals match');

// Greater than
const f7c = new Data_Filter({
    context,
    fields: test_fields,
    filters: [{ field: 'age', operator: 'greater_than', value: '28' }]
});
const filtered_gt = f7c.apply(test_data);
assert(filtered_gt.length === 2, '7e: 2 people over 28');

// ═══════════════════════════════════════════════════════════
section('8. clear()');
// ═══════════════════════════════════════════════════════════

const f8 = new Data_Filter({
    context,
    fields: test_fields,
    filters: [
        { field: 'name', operator: 'contains', value: 'x' },
        { field: 'age', operator: 'equals', value: '30' }
    ]
});
assert(f8._filter_rows.length === 2, '8a: 2 rows before clear');

f8.clear();
assert(f8._filter_rows.length === 0, '8b: 0 rows after clear');
assert(f8.get_filters().length === 0, '8c: get_filters empty');
assert(Object.keys(f8.get_filter_map()).length === 0, '8d: get_filter_map empty');

// ═══════════════════════════════════════════════════════════
section('9. remove_filter()');
// ═══════════════════════════════════════════════════════════

const f9 = new Data_Filter({
    context,
    fields: test_fields,
    filters: [
        { field: 'name', operator: 'contains', value: 'A' },
        { field: 'age', operator: 'greater_than', value: '20' },
        { field: 'active', operator: 'equals', value: 'true' }
    ]
});
assert(f9._filter_rows.length === 3, '9a: 3 rows');

f9.remove_filter(1);
assert(f9._filter_rows.length === 2, '9b: 2 rows after remove');
assert(f9._filter_rows[0].field === 'name', '9c: first row unchanged');
assert(f9._filter_rows[1].field === 'active', '9d: third row shifted to index 1');

// Invalid index
f9.remove_filter(99);
assert(f9._filter_rows.length === 2, '9e: no change for invalid index');

f9.remove_filter(-1);
assert(f9._filter_rows.length === 2, '9f: no change for negative index');

// ═══════════════════════════════════════════════════════════
section('10. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Data_Filter.css === 'string', '10a: .css is string');
assert(Data_Filter.css.includes('.jsgui-data-filter'), '10b: root selector');
assert(Data_Filter.css.includes('.data-filter-row'), '10c: row selector');
assert(Data_Filter.css.includes('.data-filter-add-btn'), '10d: add button selector');
assert(Data_Filter.css.includes('.data-filter-remove-btn'), '10e: remove button selector');
assert(Data_Filter.css.includes('.data-filter-empty'), '10f: empty state selector');

// ═══════════════════════════════════════════════════════════
section('11. Initial filters from spec');
// ═══════════════════════════════════════════════════════════

const f11 = new Data_Filter({
    context,
    fields: test_fields,
    filters: [
        { field: 'name', operator: 'starts_with', value: 'Ch' }
    ]
});

assert(f11._filter_rows.length === 1, '11a: 1 initial filter');
assert(f11._filter_rows[0].field === 'name', '11b: correct field');
assert(f11._filter_rows[0].operator === 'starts_with', '11c: correct operator');
assert(f11._filter_rows[0].value === 'Ch', '11d: correct value');

const filtered11 = f11.apply(test_data);
assert(filtered11.length === 1, '11e: starts_with filters correctly');
assert(filtered11[0].name === 'Charlie', '11f: correct match');

// ═══════════════════════════════════════════════════════════
section('12. String field shorthand');
// ═══════════════════════════════════════════════════════════

const f12 = new Data_Filter({
    context,
    fields: ['name', 'age']
});

assert(f12._fields.length === 2, '12a: 2 fields');
assert(f12._fields[0].name === 'name', '12b: name from string');
assert(f12._fields[0].type === 'string', '12c: default type is string');
assert(f12._fields[1].name === 'age', '12d: age from string');

// ═══════════════════════════════════════════════════════════
section('13. Multiple filters applied together');
// ═══════════════════════════════════════════════════════════

const f13 = new Data_Filter({
    context,
    fields: test_fields,
    filters: [
        { field: 'name', operator: 'contains', value: 'li' },
        { field: 'age', operator: 'greater_than', value: '20' }
    ]
});

const filtered13 = f13.apply(test_data);
// 'Ali' in Alice (age 30 > 20) and 'li' in Charlie (age 35 > 20)
assert(filtered13.length === 2, '13a: 2 matches (Alice + Charlie)');

// ═══════════════════════════════════════════════════════════
section('14. get_filter_map excludes empty values');
// ═══════════════════════════════════════════════════════════

const f14 = new Data_Filter({
    context,
    fields: test_fields,
    filters: [
        { field: 'name', operator: 'contains', value: '' },  // empty
        { field: 'age', operator: 'equals', value: '30' }    // filled
    ]
});

const map14 = f14.get_filter_map();
assert(Object.keys(map14).length === 1, '14a: only non-empty in map');
assert(map14.age, '14b: age present');
assert(!map14.name, '14c: empty name excluded');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Data_Filter: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Data_Filter checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
