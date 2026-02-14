/**
 * Lab Experiment: MVVM Data Pipeline
 *
 * Validates using jsgui3's `ComputedProperty` (via `this.computed()`) to
 * implement a fully reactive, declarative data pipeline.
 *
 * Key Pattern:
 *   this.computed(
 *       [data.model, view.data.model],
 *       ['rows', 'sort_state', 'filters', 'page'],
 *       (rows, sort, filters, page) => { ...pipeline logic... },
 *       { propertyName: 'visible_rows', target: view.data.model }
 *   );
 *
 * This eliminates manual `render()` calls. Changing ANY dependency automatically
 * updates `visible_rows`, which in turn automatically updates the DOM.
 */
module.exports = {
    name: 'mvvm_pipeline',
    description: 'Declarative data pipeline using MVVM ComputedProperty.',

    run: async (tools) => {
        const { create_lab_context, assert, cleanup, wait_for } = tools;
        // Require the Control class that supports MVVM (Data_Model_View_Model_Control)
        // In the lab environment, standard 'jsgui.Control' maps to this.
        const jsgui = require('../../html-core/html-core');
        const { Control } = jsgui;
        // We need transformations or at least the logic for them
        const { ensure_control_models } = require('../../html-core/control_model_factory');

        // ════════════════════════════════════════════════════════════
        // SECTION 1: Pipeline Logic (Pure Functions)
        // ════════════════════════════════════════════════════════════

        const PIPELINE = {
            filter: (rows, filters) => {
                if (!filters) return rows;
                return rows.filter(row =>
                    Object.keys(filters).every(key => {
                        const fv = filters[key];
                        if (typeof fv === 'function') return fv(row);
                        if (fv === undefined || fv === null || fv === '') return true;
                        return String(row[key] || '').toLowerCase()
                            .includes(String(fv).toLowerCase());
                    })
                );
            },

            sort: (rows, sort_state) => {
                if (!sort_state || !sort_state.key) return rows;
                const dir = sort_state.direction === 'desc' ? -1 : 1;
                return rows.slice().sort((a, b) => {
                    const av = a[sort_state.key], bv = b[sort_state.key];
                    if (av < bv) return -1 * dir;
                    if (av > bv) return 1 * dir;
                    return 0;
                });
            },

            paginate: (rows, page, page_size) => {
                if (!page_size) return rows;
                const p = Math.max(1, page || 1);
                const start = (p - 1) * page_size;
                return rows.slice(start, start + page_size);
            }
        };

        // ════════════════════════════════════════════════════════════
        // SECTION 2: MVVM Control
        // ════════════════════════════════════════════════════════════

        class MVVM_Pipeline_Table extends Control {
            constructor(spec = {}) {
                spec.__type_name = spec.__type_name || 'mvvm_pipeline_table';
                super(spec);
                ensure_control_models(this, spec);

                // Initial Data
                this.data.model.set('rows', spec.rows || []);
                this.views_columns = spec.columns || [];

                // Initial View State
                const vm = this.view.data.model;
                vm.set({
                    sort_state: spec.sort_state || null,
                    filters: spec.filters || null,
                    page: spec.page || 1,
                    page_size: spec.page_size || null
                });

                // Initial render
                if (!spec.el) {
                    this._compose();
                }

                // ── THE DECLARATIVE PIPELINE ──
                // Single source of truth for 'visible_rows'.
                // Automatically re-computes when ANY dependency changes.

                this.computed(
                    [this.data.model, this.view.data.model],
                    ['rows', 'sort_state', 'filters', 'page', 'page_size'],
                    (rows, sort, filters, page, page_size) => {
                        let res = rows || [];
                        res = PIPELINE.filter(res, filters);
                        res = PIPELINE.sort(res, sort);
                        res = PIPELINE.paginate(res, page, page_size);
                        return res;
                    },
                    { propertyName: 'visible_rows', target: this.view.data.model }
                );

                // ── View Effects (Reacting to visible_rows) ──
                // In a full MVVM system, the DOM would be list-bound to visible_rows.
                // Here we'll use a simple watcher to trigger the render, proving reactivity.

                // We also need to watch for column changes or sort state to update headers.
                // A 'render_all' approach is simplest for this lab to prove the data flow.

                this.watch(this.view.data.model, ['visible_rows', 'sort_state', 'filters'], () => {
                    this.render();
                }, { immediate: true });


            }

            _compose() {
                const { context } = this;
                this.dom.tagName = 'table';
                this.add(this.thead = new Control({ context, tag_name: 'thead' }));
                this.add(this.tbody = new Control({ context, tag_name: 'tbody' }));
            }

            render() {
                // Determine current state from Model (no args passed!)
                const vm = this.view.data.model;
                const rows = vm.visible_rows || []; // The computed result!
                const cols = this.views_columns;

                // Render Header
                this.thead.content.clear();
                const tr_head = new Control({ context: this.context, tag_name: 'tr' });
                cols.forEach(col => {
                    const th = new Control({ context: this.context, tag_name: 'th' });
                    th.add(col.label || col.key);

                    // View Effect: Sort Indicators
                    // Derived directly from view model state
                    if (vm.sort_state && vm.sort_state.key === col.key) {
                        th.dom.attributes['aria-sort'] =
                            vm.sort_state.direction === 'desc' ? 'descending' : 'ascending';
                    }
                    tr_head.add(th);
                });
                this.thead.add(tr_head);

                // Render Body
                this.tbody.content.clear();
                rows.forEach(row => {
                    const tr = new Control({ context: this.context, tag_name: 'tr' });
                    cols.forEach(col => {
                        const td = new Control({ context: this.context, tag_name: 'td' });
                        td.add(String(row[col.key] || ''));
                        tr.add(td);
                    });
                    this.tbody.add(tr);
                });
            }

            // Public Helpers to mutate View Model (for testing convenience)
            set_sort(key, direction = 'asc') {
                this.view.data.model.set('sort_state', { key, direction });
            }
            set_filter(key, value) {
                const current = this.view.data.model.filters || {};
                this.view.data.model.set('filters', { ...current, [key]: value });
            }
            set_page(page) {
                this.view.data.model.set('page', page);
            }
        }

        // ════════════════════════════════════════════════════════════
        // SECTION 3: Assertions
        // ════════════════════════════════════════════════════════════

        const context = create_lab_context();
        const raw_data = [
            { id: 1, name: 'Charlie', score: 72 },
            { id: 2, name: 'Alpha', score: 95 },
            { id: 3, name: 'Echo', score: 88 },
            { id: 4, name: 'Bravo', score: 61 },
            { id: 5, name: 'Delta', score: 79 }
        ];
        const columns = [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'score', label: 'Score' }
        ];

        const table = new MVVM_Pipeline_Table({
            context,
            rows: raw_data,
            columns
        });

        // Computed properties might be async/immediate depending on options using 'wait_for'
        // But ModelBinder defaults to immediate: true usually.
        // Let's verify initial state.

        // 1. Initial State
        let visible = table.view.data.model.visible_rows;
        assert.strictEqual(visible.length, 5, 'Initial: all rows visible');
        assert.strictEqual(table.tbody.content._arr.length, 5, 'Initial: DOM rendered 5 rows');

        // 2. Reactivity: Sort
        // We ONLY set the property. We do NOT call render().
        table.set_sort('name', 'asc');

        // computed might need a tick? 
        // In jsgui, events are usually synchronous, but let's see.
        visible = table.view.data.model.visible_rows;
        assert.strictEqual(visible[0].name, 'Alpha', 'Sorted: Alpha first');

        const html_sorted = table.html;
        assert.ok(html_sorted.includes('aria-sort="ascending"'), 'Visual: aria-sort updated');
        assert.ok(html_sorted.includes('>Alpha<'), 'Visual: Alpha rendered');

        // 3. Reactivity: Filter
        table.set_filter('name', 'a'); // Charlie, Alpha, Bravo, Delta
        visible = table.view.data.model.visible_rows;
        assert.strictEqual(visible.length, 4, 'Filtered: 4 rows match');
        assert.ok(visible.every(r => r.name.toLowerCase().includes('a')), 'Filtered correctly');
        assert.strictEqual(table.tbody.content._arr.length, 4, 'DOM updated to 4 rows');

        // 4. Reactivity: Pagination
        table.view.data.model.set('page_size', 2);
        table.set_page(1);
        visible = table.view.data.model.visible_rows;
        assert.strictEqual(visible.length, 2, 'Paged: 2 rows');
        assert.strictEqual(visible[0].name, 'Alpha', 'Paged: Alpha is first (sorted & filtered)');

        // 5. Cross-Model Reactivity: Data Change
        // Push a new row to the DATA model.
        // The View pipeline should pick this up automatically.
        const new_rows = [...raw_data, { id: 6, name: 'Foxtrot', score: 50 }]; // has 'o', no 'a' -> filtered out? 
        // Wait, current filter is 'a'. 'Foxtrot' does not contain 'a'.
        // Let's add 'Abba'
        const abba = { id: 6, name: 'Abba', score: 100 };
        const new_data = [...raw_data, abba];

        table.data.model.set('rows', new_data);

        visible = table.view.data.model.visible_rows;
        // Should sort 'Abba' to first (before 'Alpha')?
        // Sort is name asc. Abba < Alpha.
        // Filter 'a' matches Abba.
        // Page 1 size 2.

        // Expected: [Abba, Alpha]
        assert.strictEqual(visible[0].name, 'Abba', 'Data update: Abba sorted first');
        assert.strictEqual(visible[1].name, 'Alpha', 'Data update: Alpha second');
        assert.strictEqual(visible.length, 2, 'Data update: Page size still 2');

        cleanup();
        return {
            ok: true,
            summary: {
                assertions_passed: 5, // grouped
                pattern: 'this.computed([data, view.data], [deps], fn)',
                reactivity: 'Fully automatic (no manual render calls)'
            }
        };
    }
};
