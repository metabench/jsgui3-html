const Data_Table = require('../controls/organised/1-standard/4-data/data_table');
const assert = require('assert');

// Mock DOM logic
if (typeof Element !== 'undefined') {
    Element.prototype.scrollIntoView = () => { };
}

console.log('── Verifying Data_Table T4 Features ──');

function test_selection_api() {
    console.log('1. Testing Selection API...');
    const tbl = new Data_Table({
        columns: ['id', 'name'],
        rows: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' }
        ],
        selection_mode: 'multiple'
    });

    // Check initial state
    assert.strictEqual(tbl.selection_mode, 'multiple');
    assert.strictEqual(tbl.get_selected_rows().length, 0);

    // Check .selection-enabled class via all_html_render
    const html_init = tbl.all_html_render();
    assert.ok(html_init.includes('selection-enabled'), 'Should have .selection-enabled class');

    // Select row 1
    tbl.select_row(1);
    const sel = tbl.get_selected_rows();
    assert.deepStrictEqual(sel, [1]);

    // Verify DOM properties on the Control
    const body_ctrl = tbl._ctrl_fields.body;

    // Access content using iterator
    let rows = [];
    body_ctrl.content.each(r => rows.push(r));

    const row1 = rows[1]; // Index 1

    // Check class directly from attributes
    const row1_class = (row1.dom.attributes.class || '');
    assert.ok(row1_class.includes('is-selected'), 'Row 1 should have .is-selected class');
    assert.strictEqual(row1.dom.attributes['aria-selected'], 'true');

    // Select row 2 (add to selection)
    tbl.select_row(2);
    assert.deepStrictEqual(tbl.get_selected_rows(), [1, 2]);

    // Deselect row 1
    tbl.deselect_row(1);
    assert.strictEqual(tbl.get_selected_rows().length, 1);
    const row1_class_after = (row1.dom.attributes.class || '');
    assert.ok(!row1_class_after.includes('is-selected'), 'Row 1 should NOT have .is-selected class');

    console.log('   ✅ Selection API passed');
}

function test_keyboard_nav_logic() {
    console.log('2. Testing Keyboard Navigation Logic...');
    const tbl = new Data_Table({
        columns: ['id'],
        rows: [1, 2, 3],
        selection_mode: 'single'
    });

    // Initial selection
    tbl.select_row(0);

    // Simulate ArrowDown logic directly via _move_selection
    tbl._move_selection(1, { shiftKey: false, ctrlKey: false });
    assert.deepStrictEqual(tbl.get_selected_rows(), [1]);

    // ArrowDown again
    tbl._move_selection(1, { shiftKey: false, ctrlKey: false });
    assert.deepStrictEqual(tbl.get_selected_rows(), [2]);

    // ArrowDown at end (should stay)
    tbl._move_selection(1, { shiftKey: false, ctrlKey: false });
    assert.deepStrictEqual(tbl.get_selected_rows(), [2]);

    console.log('   ✅ Keyboard Logic passed');
}

function test_keyboard_range_selection() {
    console.log('3. Testing Keyboard Range Selection (Shift)...');
    const tbl = new Data_Table({
        columns: ['id'],
        rows: [0, 1, 2, 3, 4],
        selection_mode: 'multiple'
    });

    tbl.select_row(2); // Start at middle

    // Move Down with Shift
    tbl._move_selection(1, { shiftKey: true, ctrlKey: false });
    // Should select 2 and 3
    assert.deepStrictEqual(tbl.get_selected_rows(), [2, 3]);

    // Move Down again with Shift
    tbl._move_selection(1, { shiftKey: true, ctrlKey: false });
    // Should select 2, 3, 4
    assert.deepStrictEqual(tbl.get_selected_rows(), [2, 3, 4]);

    console.log('   ✅ Range Selection Logic passed');
}

try {
    test_selection_api();
    test_keyboard_nav_logic();
    test_keyboard_range_selection();
    console.log('══════════════════════════════════════');
    console.log('  ALL TESTS PASSED');
    console.log('══════════════════════════════════════');
} catch (e) {
    console.error('Test Failed:', e);
    // console.error(e.stack);
    process.exit(1);
}
