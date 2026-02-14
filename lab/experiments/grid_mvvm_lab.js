'use strict';

module.exports = {
    name: 'grid_mvvm',
    description: 'Verify Grid MVVM modernization: model properties, watch-based reactivity, view.model convenience',

    run(tools) {
        const assert = tools.assert;
        const ctx = tools.create_lab_context();
        const Grid = require('../../controls/organised/0-core/0-basic/1-compositional/grid');

        // ── Test 1: Constructor sets model properties ──
        {
            const g = new Grid({ context: ctx, grid_size: [4, 3], cell_size: [30, 30] });
            assert.ok(g.model, 'Has model');
            assert.deepStrictEqual(g.grid_size, [4, 3], 'grid_size from model');
            assert.deepStrictEqual(g.cell_size, [30, 30], 'cell_size from model');
            assert.strictEqual(g.composition_mode, 'divs', 'Default composition_mode');
            assert.strictEqual(g.column_headers, false, 'Default column_headers');
            assert.strictEqual(g.row_headers, false, 'Default row_headers');
        }

        // ── Test 2: Model is the single source of truth ──
        {
            const g = new Grid({ context: ctx, grid_size: [3, 3] });
            g.model.set('cell_size', [50, 50]);
            assert.deepStrictEqual(g.cell_size, [50, 50], 'Getter reads from model after model.set()');
            g.cell_size = [60, 60];
            assert.deepStrictEqual(g.model.cell_size, [60, 60], 'Setter writes to model');
        }

        // ── Test 3: batch() available on model ──
        {
            const g = new Grid({ context: ctx, grid_size: [2, 2] });
            assert.strictEqual(typeof g.model.batch, 'function', 'Model has batch()');
            g.model.batch(() => {
                g.model.set('cell_size', [20, 20]);
                g.model.set('composition_mode', 'divs');
            });
            assert.deepStrictEqual(g.cell_size, [20, 20], 'Batch sets values');
        }

        // ── Test 4: Rows created matching grid_size ──
        {
            const g = new Grid({ context: ctx, grid_size: [3, 4] });
            assert.strictEqual(g._arr_rows.length, 4, '4 rows created for [3,4] grid');
        }

        // ── Test 5: get_cell works ──
        {
            const g = new Grid({ context: ctx, grid_size: [3, 3], cell_size: [40, 40] });
            const cell = g.get_cell(0, 0);
            assert.ok(cell, 'get_cell(0,0) returns a cell');
            const cell2 = g.get_cell(2, 2);
            assert.ok(cell2, 'get_cell(2,2) returns a cell');
        }

        // ── Test 6: watch triggers recompose on grid_size change ──
        {
            const g = new Grid({ context: ctx, grid_size: [2, 2] });
            assert.strictEqual(g._arr_rows.length, 2, 'Initially 2 rows');
            g.grid_size = [3, 5];
            assert.strictEqual(g._arr_rows.length, 5, 'After resize to [3,5]: 5 rows');
        }

        // ── Test 7: view.model convenience link ──
        {
            const g = new Grid({ context: ctx, grid_size: [2, 2] });
            assert.ok(g.view, 'Has view');
            assert.ok(g.view.data, 'Has view.data');
            assert.ok(g.view.data.model, 'Has view.data.model');
            assert.strictEqual(g.view.model, g.view.data.model, 'view.model === view.data.model');
        }

        // ── Test 8: No obext dependency ──
        {
            const path = require('path');
            const src = require('fs').readFileSync(
                path.join(__dirname, '../../controls/organised/0-core/0-basic/1-compositional/grid.js'),
                'utf8'
            );
            assert.ok(!src.includes("require('obext')"), 'No obext import');
            assert.ok(!src.includes('field(this'), 'No field() calls');
            assert.ok(!src.includes('prop(this'), 'No prop() calls');
            // Ensure no active this.changes() calls (only in comments is OK)
            const non_comment_lines = src.split('\n').filter(l => !l.trim().startsWith('//'));
            const has_changes_call = non_comment_lines.some(l => l.includes('this.changes('));
            assert.ok(!has_changes_call, 'No active this.changes() calls');
        }

        console.log('✅ All Grid MVVM tests passed!');
    }
};
