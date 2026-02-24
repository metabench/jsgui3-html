'use strict';

/**
 * Data_Table T4 Phase 2 — Verification Script
 * 
 * Tests:
 * 1. Module loads without error
 * 2. Mixin application (grid_selection, grid_keyboard_nav, column_resize, grid_render_mode)
 * 3. Selection API works through mixin
 * 4. Keyboard nav API works through mixin
 * 5. Render mode auto-detection
 * 6. normalize_columns preserves T4 properties
 * 7. Virtual renderer instantiation
 * 8. Frozen columns config
 * 9. Async data source config
 * 10. Row factory produces correct structure
 */

const path = require('path');
const root = path.join(__dirname, '..');

let pass = 0;
let fail = 0;

function assert(condition, label) {
    if (condition) {
        pass++;
        console.log(`  ✅ ${label}`);
    } else {
        fail++;
        console.error(`  ❌ ${label}`);
    }
}

console.log('=== Data_Table T4 Phase 2 — Verification ===\n');

// ── Test 1: Module loads ──
console.log('1. Module loading');
let Data_Table;
try {
    Data_Table = require(path.join(root, 'controls/organised/1-standard/4-data/Data_Table'));
    assert(typeof Data_Table === 'function', 'Data_Table exports a constructor');
} catch (err) {
    console.error('  ❌ FATAL: Module load failed:', err.message);
    process.exit(1);
}

// ── Create instances without explicit context (jsgui handles internally) ──

// ── Test 2: Basic instantiation with mixins ──
console.log('\n2. Mixin application');
const dt = new Data_Table({
    selection_mode: 'multiple',
    columns: [
        { key: 'name', label: 'Name', width: 200, resizable: true },
        { key: 'age', label: 'Age', width: 80 },
        { key: 'city', label: 'City', frozen: 'left' }
    ],
    rows: [
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
        { name: 'Charlie', age: 35, city: 'CHI' }
    ]
});

assert(dt.__mx && dt.__mx.grid_selection === true, 'grid_selection mixin applied');
assert(dt.__mx && dt.__mx.grid_keyboard_nav === true, 'grid_keyboard_nav mixin applied');
assert(dt.__mx && dt.__mx.column_resize === true, 'column_resize mixin applied');
assert(dt.__mx && dt.__mx.grid_render_mode === true, 'grid_render_mode mixin applied');

// ── Test 3: Selection API via mixin ──
console.log('\n3. Selection API (via mixin)');
assert(typeof dt.select_row === 'function', 'select_row exists');
assert(typeof dt.deselect_row === 'function', 'deselect_row exists');
assert(typeof dt.toggle_row === 'function', 'toggle_row exists');
assert(typeof dt.select_all === 'function', 'select_all exists');
assert(typeof dt.deselect_all === 'function', 'deselect_all exists');
assert(typeof dt.get_selected_rows === 'function', 'get_selected_rows exists');

dt.select_row(0);
assert(dt.get_selected_rows().includes(0), 'select_row(0) works');

dt.select_row(1);
assert(dt.get_selected_rows().length === 2, 'multi-select works');

dt.deselect_all();
assert(dt.get_selected_rows().length === 0, 'deselect_all clears');

// ── Test 4: Keyboard nav via mixin ──
console.log('\n4. Keyboard navigation (via mixin)');
assert(typeof dt._move_selection === 'function', '_move_selection exists');
assert(typeof dt._handle_grid_keydown === 'function', '_handle_grid_keydown exists');

// Reset state from previous test section
dt.last_selected_index = null;
dt.selected_rows.clear();

dt._move_selection(1, { shiftKey: false, ctrlKey: false, metaKey: false });
assert(dt.last_selected_index === 0, 'move_selection delta=1 from null → 0');

dt._move_selection(1, { shiftKey: false, ctrlKey: false, metaKey: false });
assert(dt.last_selected_index === 1, 'move_selection delta=1 → 1');

// ── Test 5: Render mode ──
console.log('\n5. Render mode');
assert(typeof dt.get_render_mode === 'function', 'get_render_mode exists');
assert(typeof dt.set_render_mode === 'function', 'set_render_mode exists');
assert(dt.get_render_mode() === 'standard', 'Default mode is standard (3 rows < 1000 threshold)');

// Test that virtual mode can be set
dt.set_render_mode('virtual');
assert(dt.get_render_mode() === 'virtual', 'Can switch to virtual mode');

dt.set_render_mode('standard');
assert(dt.get_render_mode() === 'standard', 'Can switch back to standard');

// ── Test 6: normalize_columns preserves T4 props ──
console.log('\n6. Column normalization');
const cols = dt.columns;
assert(cols[0].width === 200, 'width preserved');
assert(cols[0].resizable === true, 'resizable preserved');
assert(cols[2].frozen === 'left', 'frozen preserved');

// ── Test 7: Virtual renderer ──
console.log('\n7. Virtual renderer');
assert(dt._virtual_renderer !== null, 'Virtual renderer instantiated');
assert(typeof dt._virtual_renderer.render === 'function', 'render method exists');
assert(typeof dt._virtual_renderer.attach_scroll_listener === 'function', 'scroll listener method exists');

// ── Test 8: Frozen columns (should NOT be applied since we didn't pass frozen_left/right) ──
console.log('\n8. Frozen columns');
const dt_frozen = new Data_Table({
    frozen_left: 1,
    frozen_right: 1,
    columns: [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
        { key: 'c', label: 'C' }
    ],
    rows: [{ a: 1, b: 2, c: 3 }]
});
assert(dt_frozen.__mx && dt_frozen.__mx.frozen_columns === true, 'frozen_columns mixin applied');
assert(typeof dt_frozen.set_frozen_columns === 'function', 'set_frozen_columns API exists');
assert(dt_frozen.get_frozen_columns().left === 1, 'left frozen count = 1');
assert(dt_frozen.get_frozen_columns().right === 1, 'right frozen count = 1');

// ── Test 9: Async data source ──
console.log('\n9. Async data source');
const dt_async = new Data_Table({
    columns: [{ key: 'x', label: 'X' }],
    rows: [],
    data_source: async (params) => ({ rows: [{ x: 42 }], total: 1 })
});
assert(dt_async.__mx && dt_async.__mx.async_data_source === true, 'async_data_source mixin applied');
assert(typeof dt_async.load_data === 'function', 'load_data API exists');
assert(typeof dt_async.is_loading === 'function', 'is_loading API exists');

// ── Test 10: Row factory ──
console.log('\n10. Row factory');
const row_ctrl = dt._build_row_ctrl({ name: 'Test', age: 99, city: 'SF' }, 0, dt.columns);
assert(row_ctrl !== null, 'Row control created');
assert(row_ctrl.dom.attributes['data-row-index'] === '0', 'data-row-index set');
assert(row_ctrl.dom.attributes.role === 'row', 'ARIA role=row set');

// ── Test 11: Auto-detection threshold ──
console.log('\n11. Auto-detection threshold');
const big_rows = Array.from({ length: 1500 }, (_, i) => ({ key: i }));
const dt_big = new Data_Table({
    columns: [{ key: 'key', label: 'Key' }],
    rows: big_rows
});
assert(dt_big.get_render_mode() === 'virtual', '1500 rows auto-detects virtual mode');

const dt_small = new Data_Table({
    columns: [{ key: 'key', label: 'Key' }],
    rows: big_rows.slice(0, 100)
});
assert(dt_small.get_render_mode() === 'standard', '100 rows stays in standard mode');

// ── Summary ──
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${pass} passed, ${fail} failed, ${pass + fail} total`);
console.log(`${'='.repeat(50)}`);
process.exit(fail > 0 ? 1 : 0);
