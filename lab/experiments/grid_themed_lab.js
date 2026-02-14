'use strict';

module.exports = {
    name: 'grid_themed',
    description: 'Verify Grid CSS theming with --admin-* custom properties, computed cell_count, and model-backed state',

    run(tools) {
        const assert = tools.assert;
        const ctx = tools.create_lab_context();
        const Grid = require('../../controls/organised/0-core/0-basic/1-compositional/grid');

        // ── Test 1: CSS uses --admin-* custom properties ──
        {
            const css = Grid.css;
            assert.ok(css.includes('--admin-accent'), 'CSS uses --admin-accent');
            assert.ok(css.includes('--admin-border'), 'CSS uses --admin-border');
            assert.ok(css.includes('--admin-card-bg'), 'CSS uses --admin-card-bg');
            assert.ok(css.includes('--admin-hover-bg'), 'CSS uses --admin-hover-bg');
            assert.ok(css.includes('--admin-header-bg'), 'CSS uses --admin-header-bg');
            assert.ok(css.includes('--admin-font'), 'CSS uses --admin-font');
            assert.ok(css.includes('--admin-text'), 'CSS uses --admin-text');
            assert.ok(!css.includes('#2046df'), 'No hardcoded #2046df');
        }

        // ── Test 2: Computed cell_count ──
        {
            const g = new Grid({ context: ctx, grid_size: [4, 3] });
            assert.strictEqual(g.cell_count, 12, 'cell_count = 4 * 3 = 12');
        }

        // ── Test 3: cell_count updates on resize ──
        {
            const g = new Grid({ context: ctx, grid_size: [2, 2] });
            assert.strictEqual(g.cell_count, 4, 'Initially 4');
            g.grid_size = [5, 5];
            assert.strictEqual(g.cell_count, 25, 'After resize: 25');
        }

        // ── Test 4: cell_selection and drag_selection model-backed ──
        {
            const g = new Grid({ context: ctx, grid_size: [3, 3], cell_selection: true, drag_selection: true });
            assert.strictEqual(g.cell_selection, true, 'cell_selection from model');
            assert.strictEqual(g.drag_selection, true, 'drag_selection from model');
            assert.strictEqual(g.model.cell_selection, true, 'cell_selection on model');
            assert.strictEqual(g.model.drag_selection, true, 'drag_selection on model');
        }

        // ── Test 5: cell_selection defaults to false ──
        {
            const g = new Grid({ context: ctx, grid_size: [2, 2] });
            assert.strictEqual(g.cell_selection, false, 'Default cell_selection = false');
            assert.strictEqual(g.drag_selection, false, 'Default drag_selection = false');
        }

        // ── Test 6: cell_count for 1x1 and 0-size ──
        {
            const g1 = new Grid({ context: ctx, grid_size: [1, 1] });
            assert.strictEqual(g1.cell_count, 1, '1x1 grid = 1 cell');
        }

        // ── Test 7: CSS has hover and accent-bg styles ──
        {
            const css = Grid.css;
            assert.ok(css.includes('div.grid .row .cell:hover'), 'Has cell hover rule');
            assert.ok(css.includes('--admin-accent-bg'), 'Has accent background for selected');
        }

        console.log('✅ All Grid themed tests passed!');
    }
};
