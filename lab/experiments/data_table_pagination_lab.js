'use strict';

module.exports = {
    name: 'data_table_pagination',
    description: 'Verify Data_Table total_rows, total_pages computed properties, column_widths model, and selection state',

    run(tools) {
        const assert = tools.assert;
        const ctx = tools.create_lab_context();
        const Data_Table = require('../../controls/organised/1-standard/4-data/Data_Table');

        const make_rows = (n) => Array.from({ length: n }, (_, i) => ({ id: i, name: `Row ${i}`, active: i % 2 === 0 }));

        // ── Test 1: total_rows equals row count (no filter) ──
        {
            const dt = new Data_Table({ context: ctx, columns: ['id', 'name'], rows: make_rows(10), page_size: 3 });
            assert.strictEqual(dt.total_rows, 10, 'total_rows = 10');
        }

        // ── Test 2: total_pages computed correctly ──
        {
            const dt = new Data_Table({ context: ctx, columns: ['id', 'name'], rows: make_rows(10), page_size: 3 });
            assert.strictEqual(dt.total_pages, 4, '10 rows / 3 per page = 4 pages');
        }

        // ── Test 3: total_pages = 1 when no page_size ──
        {
            const dt = new Data_Table({ context: ctx, columns: ['id', 'name'], rows: make_rows(10) });
            assert.strictEqual(dt.total_pages, 1, 'No pagination = 1 page');
        }

        // ── Test 4: total_rows updates after filter ──
        {
            const dt = new Data_Table({ context: ctx, columns: ['id', 'name', 'active'], rows: make_rows(10), page_size: 3 });
            dt.set_filters({ active: (row) => row.active === true });
            assert.strictEqual(dt.total_rows, 5, 'Filtered: 5 even rows');
            assert.strictEqual(dt.total_pages, 2, '5 filtered / 3 per page = 2 pages');
        }

        // ── Test 5: total_rows updates when rows change ──
        {
            const dt = new Data_Table({ context: ctx, columns: ['id', 'name'], rows: make_rows(5), page_size: 2 });
            assert.strictEqual(dt.total_rows, 5, 'Initially 5');
            dt.set_rows(make_rows(20));
            assert.strictEqual(dt.total_rows, 20, 'After set_rows: 20');
            assert.strictEqual(dt.total_pages, 10, '20 / 2 = 10 pages');
        }

        // ── Test 6: Page boundary — last page has fewer items ──
        {
            const dt = new Data_Table({ context: ctx, columns: ['id', 'name'], rows: make_rows(7), page_size: 3 });
            dt.set_page(3);
            assert.strictEqual(dt.visible_rows.length, 1, 'Last page has 1 row');
        }

        // ── Test 7: column_widths in model ──
        {
            const dt = new Data_Table({
                context: ctx,
                columns: [{ key: 'id', label: 'ID', width: 80 }, { key: 'name', label: 'Name', width: 200 }],
                rows: make_rows(3)
            });
            assert.deepStrictEqual(dt.column_widths, { id: 80, name: 200 }, 'Column widths stored in model');
        }

        // ── Test 8: selected_row_indices in model ──
        {
            const dt = new Data_Table({ context: ctx, columns: ['id', 'name'], rows: make_rows(5) });
            assert.deepStrictEqual(dt.selected_row_indices, [], 'Initially empty selection');
        }

        // ── Test 9: total_rows and total_pages are read-through ──
        {
            const dt = new Data_Table({ context: ctx, columns: ['id'], rows: make_rows(12), page_size: 5 });
            assert.strictEqual(dt.total_rows, 12, 'Read-through total_rows');
            assert.strictEqual(dt.total_pages, 3, 'Read-through total_pages (12/5=3)');
            assert.strictEqual(dt.model.total_rows, 12, 'Available on model');
            assert.strictEqual(dt.model.total_pages, 3, 'Available on model');
        }

        console.log('✅ All Data_Table pagination tests passed!');
    }
};
