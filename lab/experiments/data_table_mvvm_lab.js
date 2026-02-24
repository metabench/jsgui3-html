'use strict';

module.exports = {
    name: 'data_table_mvvm',
    description: 'Verify Data_Table MVVM refactor: computed pipeline, batch setters, model-only state',

    run(tools) {
        const assert = tools.assert;
        const ctx = tools.create_lab_context();
        const Data_Table = require('../../controls/organised/1-standard/4-data/Data_Table');

        const rows = [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
            { name: 'Carol', age: 35 },
            { name: 'Dan', age: 28 },
            { name: 'Eve', age: 22 }
        ];
        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' }
        ];

        // ── Test 1: Constructor populates model and computed pipeline ──
        {
            const dt = new Data_Table({ context: ctx, columns, rows, page_size: 2 });

            assert.strictEqual(dt.rows.length, 5, 'Model has all 5 rows');
            assert.strictEqual(dt.columns.length, 2, 'Model has 2 columns');
            assert.strictEqual(dt.visible_rows.length, 2, 'Page 1: 2 visible rows');
            assert.strictEqual(dt.page, 1, 'Default page is 1');
            assert.ok(dt.model, 'Has model');
            assert.strictEqual(typeof dt.model.batch, 'function', 'Model has batch()');
        }

        // ── Test 2: Pagination ──
        {
            const dt = new Data_Table({ context: ctx, columns, rows, page_size: 2 });

            dt.set_page(2);
            assert.strictEqual(dt.visible_rows.length, 2, 'Page 2: 2 visible rows');
            assert.strictEqual(dt.visible_rows[0].name, 'Carol', 'Page 2 starts with Carol');

            dt.set_page(3);
            assert.strictEqual(dt.visible_rows.length, 1, 'Page 3: 1 visible row');
            assert.strictEqual(dt.visible_rows[0].name, 'Eve', 'Page 3 is Eve');
        }

        // ── Test 3: Sorting via computed ──
        {
            const dt = new Data_Table({ context: ctx, columns, rows });

            dt.set_sort_state({ key: 'age', direction: 'asc' });
            assert.strictEqual(dt.visible_rows[0].name, 'Eve', 'Sort asc: youngest first (Eve, 22)');
            assert.strictEqual(dt.visible_rows[4].name, 'Carol', 'Sort asc: oldest last (Carol, 35)');

            dt.set_sort_state({ key: 'age', direction: 'desc' });
            assert.strictEqual(dt.visible_rows[0].name, 'Carol', 'Sort desc: oldest first');
        }

        // ── Test 4: Filtering via computed ──
        {
            const dt = new Data_Table({ context: ctx, columns, rows });

            dt.set_filters({ name: 'a' }); // Alice, Carol, Dan (contain 'a')
            const names = dt.visible_rows.map(r => r.name);
            assert.ok(names.includes('Dan'), 'Filter "a": Dan included');
            assert.ok(!names.includes('Bob'), 'Filter "a": Bob excluded');
            assert.ok(!names.includes('Eve'), 'Filter "a": Eve excluded');
        }

        // ── Test 5: set_sort_state resets page via batch ──
        {
            const dt = new Data_Table({ context: ctx, columns, rows, page_size: 2 });

            dt.set_page(3);
            assert.strictEqual(dt.page, 3, 'Page set to 3');

            let render_count = 0;
            const orig = dt.render_table.bind(dt);
            dt.render_table = () => { render_count++; orig(); };

            dt.set_sort_state({ key: 'name', direction: 'asc' });
            assert.strictEqual(dt.page, 1, 'Sort resets page to 1');
            // With batch: sort_state + page change fires ONE computed update → ONE render
            assert.strictEqual(render_count, 1, 'Batch: only 1 render for sort+page reset');
        }

        // ── Test 6: set_filters resets page via batch ──
        {
            const dt = new Data_Table({ context: ctx, columns, rows, page_size: 2 });

            dt.set_page(2);
            assert.strictEqual(dt.page, 2);

            let render_count = 0;
            const orig = dt.render_table.bind(dt);
            dt.render_table = () => { render_count++; orig(); };

            dt.set_filters({ name: 'Alice' });
            assert.strictEqual(dt.page, 1, 'Filter resets page to 1');
            assert.strictEqual(render_count, 1, 'Batch: only 1 render for filter+page reset');
        }

        // ── Test 7: Model-only state (no duplicated instance properties) ──
        {
            const dt = new Data_Table({ context: ctx, columns, rows });

            // Getters read from model
            dt.model.set('page', 3);
            assert.strictEqual(dt.page, 3, 'Getter reads from model');

            dt.model.set('page_size', 10);
            assert.strictEqual(dt.page_size, 10, 'page_size getter reads from model');
        }

        // ── Test 8: Backward compatibility — legacy method aliases ──
        {
            const dt = new Data_Table({ context: ctx, columns, rows });

            const filtered = dt.get_filtered_rows(rows);
            assert.strictEqual(filtered.length, 5, 'get_filtered_rows legacy alias works');

            const sorted = dt.get_sorted_rows(rows);
            assert.strictEqual(sorted.length, 5, 'get_sorted_rows legacy alias works');

            const paged = dt.get_paged_rows(rows);
            assert.strictEqual(paged.length, 5, 'get_paged_rows legacy alias works (no page_size)');
        }

        console.log('✅ All Data_Table MVVM tests passed!');
    }
};
