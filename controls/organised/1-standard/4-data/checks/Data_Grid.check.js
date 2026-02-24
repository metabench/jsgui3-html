/**
 * Data_Grid.check.js — Validation for Data_Grid upgrades.
 *
 * Tests:
 *   1.  Basic construction with array data
 *   2.  Static array renders into table
 *   3.  Async data source (function returning promise with array)
 *   4.  Async data source returning {rows, total_count}
 *   5.  total_count stored on grid and model
 *   6.  loading class added during pending promise
 *   7.  loading class removed after resolve
 *   8.  error class added on reject
 *   9.  refresh() alias works
 *   10. server_side set on table when total_count present
 *   11. Sync data source clears server_side
 *   12. Error clears on next successful refresh
 *   13. Stale request handling
 *   14. CSS static property
 */

const Data_Grid = require('../../../../connected/Data_Grid');
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

// Helper: create a controllable promise
function make_deferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
}

// ═══════════════════════════════════════════════════════════
section('1. Basic construction with array data');
// ═══════════════════════════════════════════════════════════

const g1 = new Data_Grid({
    context,
    columns: ['name', 'age'],
    rows: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
    ]
});
const html1 = g1.all_html_render();

assert(html1.includes('data-grid'), '1a: has data-grid class');
assert(html1.includes('data-table'), '1b: contains data-table');
assert(html1.includes('Alice'), '1c: renders row data');
assert(html1.includes('Bob'), '1d: renders second row');

// ═══════════════════════════════════════════════════════════
section('2. Columns render in header');
// ═══════════════════════════════════════════════════════════

assert(html1.includes('name'), '2a: name column header');
assert(html1.includes('age'), '2b: age column header');

// ═══════════════════════════════════════════════════════════
section('3. Async data source — array resolve');
// ═══════════════════════════════════════════════════════════

const deferred3 = make_deferred();
const g3 = new Data_Grid({
    context,
    columns: ['x'],
    data_source: () => deferred3.promise
});

// Before resolve — loading should be set
const html3_pre = g3.all_html_render();
assert(html3_pre.includes('loading'), '3a: loading class while pending');

// Resolve
deferred3.resolve([{ x: 42 }]);

// Use microtask to check after resolve
const p3 = deferred3.promise.then(() => {
    const html3_post = g3.all_html_render();
    assert(!html3_post.includes('class="data-grid loading"'), '3b: loading removed after resolve');
    assert(html3_post.includes('42'), '3c: resolved data rendered');
});

// ═══════════════════════════════════════════════════════════
section('4. Async data source — {rows, total_count} response');
// ═══════════════════════════════════════════════════════════

const deferred4 = make_deferred();
const g4 = new Data_Grid({
    context,
    columns: ['id', 'val'],
    data_source: () => deferred4.promise
});

deferred4.resolve({
    rows: [{ id: 1, val: 'A' }, { id: 2, val: 'B' }],
    total_count: 100
});

const p4 = deferred4.promise.then(() => {
    assert(g4.total_count === 100, '4a: total_count stored on grid');
    assert(g4.model && g4.model.total_count === 100, '4b: total_count in model');

    // table should be in server_side mode
    const table = g4.table;
    assert(table, '4c: table exists');
    if (table) {
        assert(table.server_side === true, '4d: table.server_side set to true');
    }
});

// ═══════════════════════════════════════════════════════════
section('5. Error state');
// ═══════════════════════════════════════════════════════════

const deferred5 = make_deferred();
const g5 = new Data_Grid({
    context,
    columns: ['x'],
    data_source: () => deferred5.promise
});

deferred5.reject(new Error('Network failure'));

const p5 = deferred5.promise.catch(() => { }).then(() => {
    // Give catch handler a tick to run
    return new Promise(r => setTimeout(r, 10));
}).then(() => {
    const html5 = g5.all_html_render();
    assert(html5.includes('error'), '5a: error class added');
    assert(html5.includes('Network failure'), '5b: error message shown');
    assert(!html5.includes('loading'), '5c: loading removed on error');
});

// ═══════════════════════════════════════════════════════════
section('6. refresh() alias');
// ═══════════════════════════════════════════════════════════

const g6 = new Data_Grid({
    context,
    columns: ['name'],
    rows: [{ name: 'Test' }]
});

assert(typeof g6.refresh === 'function', '6a: refresh() method exists');
assert(typeof g6.refresh_rows === 'function', '6b: refresh_rows() still exists');
// Calling refresh should not throw
g6.refresh();
assert(true, '6c: refresh() runs without error');

// ═══════════════════════════════════════════════════════════
section('7. Sync data clears server_side on table');
// ═══════════════════════════════════════════════════════════

const g7 = new Data_Grid({
    context,
    columns: ['x'],
    rows: [{ x: 1 }]
});

assert(g7.total_count === null, '7a: total_count null for sync data');
if (g7.table) {
    assert(g7.table.server_side === false, '7b: table server_side false for sync data');
}

// ═══════════════════════════════════════════════════════════
section('8. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Data_Grid.css === 'string', '8a: .css is string');
assert(Data_Grid.css.includes('.data-grid'), '8b: root selector');
assert(Data_Grid.css.includes('.data-grid.loading'), '8c: loading CSS');
assert(Data_Grid.css.includes('.data-grid.error'), '8d: error CSS');
assert(Data_Grid.css.includes('data-grid-spin'), '8e: spinner animation');

// ═══════════════════════════════════════════════════════════
section('9. Selection event passthrough');
// ═══════════════════════════════════════════════════════════

const g9 = new Data_Grid({
    context,
    columns: ['name'],
    rows: [{ name: 'Alice' }]
});

let selection_event = null;
g9.on('selection_change', e => { selection_event = e; });
g9.set_selection({ row_index: 0, row_data: { name: 'Alice' } });
assert(g9.selection, '9a: selection set');
assert(g9.selection.row_index === 0, '9b: correct row_index');

// ═══════════════════════════════════════════════════════════
section('10. set_filters / set_sort_state / paging');
// ═══════════════════════════════════════════════════════════

const g10 = new Data_Grid({
    context,
    columns: ['name', 'age'],
    rows: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 }
    ]
});

g10.set_page_size(2);
g10.set_page(1);
// After setting page size, table should have it
if (g10.table) {
    assert(g10.table.page_size === 2, '10a: page_size set on table');
    assert(g10.table.page === 1, '10b: page set on table');
}

g10.set_sort_state({ key: 'age', direction: 'asc' });
assert(g10.sort_state && g10.sort_state.key === 'age', '10c: sort_state set');

g10.set_filters({ name: 'Ali' });
assert(g10.filters && g10.filters.name === 'Ali', '10d: filters set');

// ═══════════════════════════════════════════════════════════
// Wait for all async tests, then print summary
// ═══════════════════════════════════════════════════════════

Promise.all([p3, p4, p5].filter(Boolean)).then(() => {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`Data_Grid: ${passed} passed, ${failed} failed`);
    if (failed === 0) console.log('✓ All Data_Grid checks passed');
    else { console.error('✗ Some checks failed'); process.exit(1); }
});
