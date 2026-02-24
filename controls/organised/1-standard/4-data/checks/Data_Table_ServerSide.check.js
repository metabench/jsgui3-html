/**
 * Data_Table_ServerSide.check.js — Validation for Data_Table server_side mode.
 *
 * Tests:
 *   1.  Default (server_side=false) — client-side filter/sort/page works
 *   2.  server_side=true via spec — visible_rows returns rows as-is
 *   3.  server_side=true — external total_count used for total_rows
 *   4.  server_side=true — sort headers still render with indicators
 *   5.  set_server_side() method toggles mode
 *   6.  Client-side filtering regression test
 *   7.  Client-side sorting regression test
 *   8.  Client-side paging regression test
 *   9.  server_side + total_pages calculated from total_count
 *   10. server_side getter
 */

const Data_Table = require('../data_table');
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

const test_rows = [
    { name: 'Alice', age: 30, role: 'admin' },
    { name: 'Bob', age: 25, role: 'user' },
    { name: 'Charlie', age: 35, role: 'admin' },
    { name: 'Diana', age: 28, role: 'user' },
    { name: 'Eve', age: 22, role: 'viewer' }
];

const test_columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'role', label: 'Role' }
];

// ═══════════════════════════════════════════════════════════
section('1. Default mode — client-side processing works');
// ═══════════════════════════════════════════════════════════

const t1 = new Data_Table({
    context,
    columns: test_columns,
    rows: test_rows.slice()
});

assert(t1.server_side === false, '1a: server_side defaults to false');
assert(t1.visible_rows.length === 5, '1b: all rows visible without paging');

// ═══════════════════════════════════════════════════════════
section('2. server_side=true — rows returned as-is');
// ═══════════════════════════════════════════════════════════

const server_rows = [
    { name: 'ServerRow1', age: 99 },
    { name: 'ServerRow2', age: 88 }
];

const t2 = new Data_Table({
    context,
    columns: test_columns,
    rows: server_rows.slice(),
    server_side: true,
    total_count: 500,
    page: 3,
    page_size: 2,
    filters: { name: 'xxx' },  // Should be IGNORED in server_side mode
    sort_state: { key: 'age', direction: 'desc' }  // Should be IGNORED for processing
});

assert(t2.server_side === true, '2a: server_side=true from spec');
assert(t2.visible_rows.length === 2, '2b: rows returned as-is (not filtered/paged)');
assert(t2.visible_rows[0].name === 'ServerRow1', '2c: first row unchanged');
assert(t2.visible_rows[1].name === 'ServerRow2', '2d: second row unchanged');

// ═══════════════════════════════════════════════════════════
section('3. server_side — total_count drives total_rows/total_pages');
// ═══════════════════════════════════════════════════════════

assert(t2.total_rows === 500, '3a: total_rows = total_count');
assert(t2.total_pages === 250, '3b: total_pages = 500/2 = 250');

// ═══════════════════════════════════════════════════════════
section('4. server_side — headers still render with sort indicators');
// ═══════════════════════════════════════════════════════════

const html2 = t2.all_html_render();
assert(html2.includes('data-table-header'), '4a: headers rendered');
assert(html2.includes('is-sortable'), '4b: sortable class present');
assert(html2.includes('aria-sort'), '4c: aria-sort present');
assert(html2.includes('data-column-key="age"'), '4d: age column rendered');

// Sort indicator should show descending for the sorted column
assert(html2.includes('aria-sort="descending"'), '4e: descending sort shown');

// ═══════════════════════════════════════════════════════════
section('5. set_server_side() toggles mode');
// ═══════════════════════════════════════════════════════════

const t5 = new Data_Table({
    context,
    columns: test_columns,
    rows: test_rows.slice(),
    page_size: 2,
    page: 1
});

assert(t5.server_side === false, '5a: starts client-side');
assert(t5.visible_rows.length === 2, '5b: client-side paging gives 2 rows');

t5.set_server_side(true);
assert(t5.server_side === true, '5c: toggled to server_side');
assert(t5.visible_rows.length === 5, '5d: all 5 rows visible (paging bypassed)');

t5.set_server_side(false);
assert(t5.server_side === false, '5e: toggled back to client-side');
assert(t5.visible_rows.length === 2, '5f: paging active again (2 per page)');

// ═══════════════════════════════════════════════════════════
section('6. Client-side filtering regression');
// ═══════════════════════════════════════════════════════════

const t6 = new Data_Table({
    context,
    columns: test_columns,
    rows: test_rows.slice(),
    filters: { name: 'Ali' }
});

assert(t6.server_side === false, '6a: client-side mode');
assert(t6.visible_rows.length === 1, '6b: filter leaves 1 row');
assert(t6.visible_rows[0].name === 'Alice', '6c: correct filtered row');

// ═══════════════════════════════════════════════════════════
section('7. Client-side sorting regression');
// ═══════════════════════════════════════════════════════════

const t7 = new Data_Table({
    context,
    columns: test_columns,
    rows: test_rows.slice(),
    sort_state: { key: 'age', direction: 'asc' }
});

assert(t7.visible_rows[0].age === 22, '7a: youngest first (asc)');
assert(t7.visible_rows[4].age === 35, '7b: oldest last');

// ═══════════════════════════════════════════════════════════
section('8. Client-side paging regression');
// ═══════════════════════════════════════════════════════════

const t8 = new Data_Table({
    context,
    columns: test_columns,
    rows: test_rows.slice(),
    page_size: 3,
    page: 2
});

assert(t8.visible_rows.length === 2, '8a: page 2 has 2 remaining rows');
assert(t8.total_pages === 2, '8b: 5 rows / 3 per page = 2 pages');
assert(t8.total_rows === 5, '8c: total_rows = 5');

// ═══════════════════════════════════════════════════════════
section('9. server_side + total_pages edge cases');
// ═══════════════════════════════════════════════════════════

const t9 = new Data_Table({
    context,
    columns: test_columns,
    rows: [],
    server_side: true,
    total_count: 0,
    page_size: 10
});

assert(t9.total_rows === 0, '9a: total_rows = 0');
assert(t9.total_pages === 1, '9b: total_pages at least 1');

// ═══════════════════════════════════════════════════════════
section('10. server_side getter');
// ═══════════════════════════════════════════════════════════

const t10 = new Data_Table({
    context,
    columns: test_columns,
    rows: [],
    server_side: true
});

assert(t10.server_side === true, '10a: getter returns true');
t10.set_server_side(false);
assert(t10.server_side === false, '10b: getter reflects change');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Data_Table (server_side): ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Data_Table server_side checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
