/**
 * Lab Experiment: View-Owned Data Pipeline
 *
 * Explores the architecture where the VIEW owns a data pipeline, and
 * view.data.model properties are "dual-purpose" — they simultaneously:
 *   1. Configure pipeline stages (data transformation)
 *   2. Drive visual rendering (header indicators, CSS classes, etc.)
 *
 * This is NOT a clean data/view split. It's a more honest model:
 *
 *     data.model.rows (raw source)
 *          ↓
 *     ┌─── view's pipeline ───────────────────────┐
 *     │  filter(view.data.model.filters)          │
 *     │  sort(view.data.model.sort_state)         │
 *     │  paginate(view.data.model.page/page_size) │
 *     │  [mode-specific stages]                   │
 *     └───────────────────────────────────────────┘
 *          ↓
 *     visible_rows → composer.render()
 *
 * Each view.data.model property can be observed by MULTIPLE consumers:
 *   - The pipeline (to recompute visible_rows)
 *   - The renderer (to update aria-sort, highlight active filters, etc.)
 *   - External listeners (to sync saved views, URL state, etc.)
 *
 * The pipeline itself is configurable by MODE — switching modes can
 * add/remove/reorder stages (e.g., virtual mode adds a windowing stage).
 */
module.exports = {
    name: 'view_pipeline',
    description: 'View-owned data pipeline with dual-purpose model properties.',

    run: async (tools) => {
        const { create_lab_context, assert, cleanup } = tools;
        const jsgui = require('../../html-core/html-core');
        const { Control } = jsgui;
        const { Data_Object } = require('lang-tools');
        const { field } = require('obext');
        const { ensure_control_models } = require('../../html-core/control_model_factory');

        // ════════════════════════════════════════════════════════════
        // SECTION 1: View Data Pipeline
        //
        // A pipeline is a sequence of named stages. Each stage is a
        // function: (rows, config) => rows. The config comes from
        // view.data.model — the SAME properties that also drive visuals.
        // ════════════════════════════════════════════════════════════

        class ViewDataPipeline {
            constructor() {
                this._stages = [];
                this._cache = null;
                this._cache_key = null;
            }

            /**
             * Add a named stage. Stages run in insertion order.
             * @param {string} name - Stage identifier (for removal/replacement)
             * @param {Function} transform - (rows, view_model) => rows
             */
            add_stage(name, transform) {
                this._stages.push({ name, transform });
                this._invalidate();
            }

            /**
             * Remove a stage by name
             */
            remove_stage(name) {
                this._stages = this._stages.filter(s => s.name !== name);
                this._invalidate();
            }

            /**
             * Check if a stage exists
             */
            has_stage(name) {
                return this._stages.some(s => s.name === name);
            }

            /**
             * Get ordered stage names (for inspection/debugging)
             */
            get_stage_names() {
                return this._stages.map(s => s.name);
            }

            /**
             * Process raw rows through all stages.
             * @param {Array} raw_rows - Source data
             * @param {Object} view_model - view.data.model (pipeline config)
             * @returns {Array} Transformed rows
             */
            process(raw_rows, view_model) {
                let result = raw_rows;
                for (const stage of this._stages) {
                    result = stage.transform(result, view_model);
                }
                return result;
            }

            _invalidate() {
                this._cache = null;
                this._cache_key = null;
            }
        }

        // ════════════════════════════════════════════════════════════
        // SECTION 2: Standard Pipeline Stages
        //
        // Each reads its config from view_model (the second argument).
        // These are pure functions — no side effects, no DOM touches.
        // ════════════════════════════════════════════════════════════

        const STAGES = {
            filter: (rows, vm) => {
                const filters = vm.filters;
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

            sort: (rows, vm) => {
                const ss = vm.sort_state;
                if (!ss || !ss.key) return rows;
                const dir = ss.direction === 'desc' ? -1 : 1;
                return rows.slice().sort((a, b) => {
                    const av = a[ss.key], bv = b[ss.key];
                    if (av < bv) return -1 * dir;
                    if (av > bv) return 1 * dir;
                    return 0;
                });
            },

            paginate: (rows, vm) => {
                if (!vm.page_size) return rows;
                const page = Math.max(1, vm.page || 1);
                const start = (page - 1) * vm.page_size;
                return rows.slice(start, start + vm.page_size);
            },

            // Mode-specific: virtual windowing stage
            virtual_window: (rows, vm) => {
                if (!vm.virtual_window) return rows;
                const { start, end } = vm.virtual_window;
                return rows.slice(start, end);
            }
        };

        // ════════════════════════════════════════════════════════════
        // SECTION 3: Dual-Purpose Rendering
        //
        // A "view effect" reads from the same view.data.model property
        // that configures a pipeline stage — but produces visual output
        // instead of data transformation.
        //
        // This formalizes the pattern already in render_table():
        //   sort_state → pipeline: sort rows
        //   sort_state → render: aria-sort on headers
        // ════════════════════════════════════════════════════════════

        /**
         * View effects: functions that read view_model and produce
         * visual side-effects on the control. These run AFTER the
         * pipeline, during the render pass.
         */
        const VIEW_EFFECTS = {
            sort_indicators: (ctrl, vm) => {
                // Apply aria-sort to header cells based on sort_state
                const head = ctrl._ctrl_fields && ctrl._ctrl_fields.head;
                if (!head || !head.content || !head.content._arr) return;
                const header_row = head.content._arr[0];
                if (!header_row || !header_row.content || !header_row.content._arr) return;

                const ss = vm.sort_state;
                header_row.content._arr.forEach(th => {
                    const key = th.dom.attributes['data-column-key'];
                    if (ss && String(ss.key) === String(key)) {
                        th.dom.attributes['aria-sort'] =
                            ss.direction === 'desc' ? 'descending' : 'ascending';
                        th.add_class('sort-active');
                    } else {
                        th.dom.attributes['aria-sort'] = 'none';
                        th.remove_class('sort-active');
                    }
                });
            },

            filter_highlights: (ctrl, vm) => {
                // Highlight header cells that have active filters
                const head = ctrl._ctrl_fields && ctrl._ctrl_fields.head;
                if (!head || !head.content || !head.content._arr) return;
                const header_row = head.content._arr[0];
                if (!header_row || !header_row.content || !header_row.content._arr) return;

                const f = vm.filters || {};
                header_row.content._arr.forEach(th => {
                    const key = th.dom.attributes['data-column-key'];
                    if (f[key] !== undefined && f[key] !== null && f[key] !== '') {
                        th.add_class('filter-active');
                    } else {
                        th.remove_class('filter-active');
                    }
                });
            },

            page_info: (ctrl, vm) => {
                // Store computed page info for pager controls to read
                const total = ctrl._pipeline_total_count || 0;
                const ps = vm.page_size || total;
                ctrl._page_info = {
                    page: vm.page || 1,
                    page_size: ps,
                    total_rows: total,
                    total_pages: ps > 0 ? Math.ceil(total / ps) : 1
                };
            }
        };

        // ════════════════════════════════════════════════════════════
        // SECTION 4: Pipeline-Aware Control
        // ════════════════════════════════════════════════════════════

        class Pipeline_Data_Table extends Control {
            constructor(spec = {}) {
                spec.__type_name = spec.__type_name || 'pipeline_data_table';
                super(spec);
                ensure_control_models(this, spec);

                // ── Raw data (data.model) ──
                // This is THE data. Unfiltered, unsorted, unpaged.
                this._raw_rows = spec.rows || [];
                this._columns = spec.columns || [];

                // ── View data model — dual-purpose properties ──
                // Each of these drives BOTH a pipeline stage AND a visual effect.
                const vm = this.view.data.model;
                vm.set('sort_state', spec.sort_state || null);
                vm.set('filters', spec.filters || null);
                vm.set('page', spec.page || 1);
                vm.set('page_size', spec.page_size || null);
                vm.set('mode', spec.mode || 'standard');

                // ── Pipeline (owned by the view) ──
                this._pipeline = new ViewDataPipeline();
                this._pipeline.add_stage('filter', STAGES.filter);
                this._pipeline.add_stage('sort', STAGES.sort);
                this._pipeline.add_stage('paginate', STAGES.paginate);

                // ── View effects (visual consumers of the same properties) ──
                this._view_effects = [
                    VIEW_EFFECTS.sort_indicators,
                    VIEW_EFFECTS.filter_highlights,
                    VIEW_EFFECTS.page_info
                ];

                // ── Reactive: any view model change re-runs pipeline + effects ──
                if (vm && typeof vm.on === 'function') {
                    vm.on('change', () => this.render());
                }

                // ── Initial compose + render ──
                if (!spec.el) {
                    this._compose();
                    this.render();
                }
            }

            _compose() {
                const { context } = this;
                this.dom.tagName = 'table';

                const head = new Control({ context, tag_name: 'thead' });
                const body = new Control({ context, tag_name: 'tbody' });

                this._ctrl_fields = { head, body };
                this.add(head);
                this.add(body);
            }

            // ── The unified render: pipeline THEN effects ──

            render() {
                const head = this._ctrl_fields && this._ctrl_fields.head;
                const body = this._ctrl_fields && this._ctrl_fields.body;
                if (!head || !body) return;

                const vm = this.view.data.model;
                const columns = this._columns;

                // 1. Build header
                head.content.clear();
                const header_row = new Control({ context: this.context, tag_name: 'tr' });
                for (const col of columns) {
                    const th = new Control({ context: this.context, tag_name: 'th' });
                    th.dom.attributes['data-column-key'] = col.key;
                    th.add(col.label || col.key);
                    header_row.add(th);
                }
                head.add(header_row);

                // 2. Run the pipeline: raw_rows → visible_rows
                //    The pipeline reads its config from vm (view.data.model)
                //    — the SAME object that drives visual effects below.
                this._pipeline_total_count = this._raw_rows.length;

                // Count after filtering (for pagination info)
                const after_filter = STAGES.filter(this._raw_rows, vm);
                this._pipeline_total_count = after_filter.length;

                const visible_rows = this._pipeline.process(this._raw_rows, vm);
                this._visible_rows = visible_rows;

                // 3. Render body
                body.content.clear();
                for (let i = 0; i < visible_rows.length; i++) {
                    const row = visible_rows[i];
                    const tr = new Control({ context: this.context, tag_name: 'tr' });
                    for (const col of columns) {
                        const td = new Control({ context: this.context, tag_name: 'td' });
                        const val = row[col.key];
                        td.add(val !== undefined && val !== null ? String(val) : '');
                        tr.add(td);
                    }
                    body.add(tr);
                }

                // 4. Run view effects — they read the SAME vm properties
                //    that the pipeline read, but produce visual output.
                for (const effect of this._view_effects) {
                    effect(this, vm);
                }
            }

            // ── Public API ──

            set_rows(rows) {
                this._raw_rows = Array.isArray(rows) ? rows : [];
                this.render();
            }

            get_visible_rows() {
                return this._visible_rows || [];
            }

            // View model setters — changing these re-runs pipeline + effects
            set_sort(key, direction = 'asc') {
                this.view.data.model.set('sort_state', { key, direction });
            }

            set_filter(key, value) {
                const current = this.view.data.model.filters || {};
                this.view.data.model.set('filters', { ...current, [key]: value });
            }

            clear_filters() {
                this.view.data.model.set('filters', null);
            }

            set_page(page) {
                this.view.data.model.set('page', page);
            }

            // Pipeline API — for mode-driven reconfiguration
            get_pipeline() {
                return this._pipeline;
            }
        }

        // ════════════════════════════════════════════════════════════
        // SECTION 5: Assertions
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

        // ── Test 1: Initial render — no pipeline config, all rows shown ──
        const table = new Pipeline_Data_Table({
            context,
            rows: raw_data,
            columns
        });

        assert.strictEqual(table.get_visible_rows().length, 5,
            'All rows visible with no pipeline config');

        // ── Test 2: Sort — DUAL PURPOSE ──
        // Setting sort_state should:
        //   a) Reorder visible_rows (pipeline effect)
        //   b) Set aria-sort on the correct header (visual effect)
        table.set_sort('name', 'asc');

        const sorted = table.get_visible_rows();
        assert.strictEqual(sorted[0].name, 'Alpha', 'Pipeline: rows sorted by name asc');
        assert.strictEqual(sorted[4].name, 'Echo', 'Pipeline: last row is Echo');

        // Visual effect: header should have aria-sort
        const html_sorted = table.html;
        assert.ok(html_sorted.includes('aria-sort="ascending"'),
            'Visual: aria-sort set on sorted column');
        assert.ok(html_sorted.includes('sort-active'),
            'Visual: sort-active class applied');

        // ── Test 3: Filter — DUAL PURPOSE ──
        // Setting filter should:
        //   a) Reduce visible_rows (pipeline effect)
        //   b) Add filter-active class to header (visual effect)
        table.set_filter('name', 'a');  // matches Alpha, Charlie, Delta, Bravo (all have 'a')

        const filtered = table.get_visible_rows();
        assert.ok(filtered.length < 5, 'Pipeline: filter reduces rows');
        assert.ok(filtered.every(r => r.name.toLowerCase().includes('a')),
            'Pipeline: all rows match filter');

        const html_filtered = table.html;
        assert.ok(html_filtered.includes('filter-active'),
            'Visual: filter-active class on Name column');

        // ── Test 4: Filter + Sort work together ──
        // Both pipeline stages AND both visual effects active simultaneously
        assert.strictEqual(filtered[0].name, sorted.filter(
            r => r.name.toLowerCase().includes('a')
        )[0].name, 'Pipeline: filter applied THEN sort preserved');

        // ── Test 5: Pagination — DUAL PURPOSE ──
        table.clear_filters();
        table.view.data.model.set('page_size', 2);
        table.set_page(1);

        const paged = table.get_visible_rows();
        assert.strictEqual(paged.length, 2, 'Pipeline: page_size=2 limits to 2 rows');
        assert.ok(table._page_info, 'Visual: page_info computed');
        assert.strictEqual(table._page_info.total_pages, 3,
            'Visual: 5 rows / 2 per page = 3 pages');
        assert.strictEqual(table._page_info.page, 1, 'Visual: current page is 1');

        // ── Test 6: Page 2 ──
        table.set_page(2);
        const page2 = table.get_visible_rows();
        assert.strictEqual(page2.length, 2, 'Page 2 has 2 rows');
        assert.notDeepStrictEqual(page2, paged, 'Page 2 has different rows than page 1');

        // ── Test 7: Pipeline stage inspection ──
        assert.deepStrictEqual(
            table.get_pipeline().get_stage_names(),
            ['filter', 'sort', 'paginate'],
            'Pipeline has 3 stages in order'
        );

        // ── Test 8: Dynamic pipeline reconfiguration ──
        // A mode switch could add a stage. Let's add a "top_n" stage.
        table.get_pipeline().add_stage('top_n', (rows, vm) => {
            if (!vm.top_n) return rows;
            return rows.slice(0, vm.top_n);
        });

        assert.ok(table.get_pipeline().has_stage('top_n'), 'Stage added dynamically');
        assert.deepStrictEqual(
            table.get_pipeline().get_stage_names(),
            ['filter', 'sort', 'paginate', 'top_n'],
            'New stage appended to pipeline'
        );

        // ── Test 9: Remove a stage ──
        // Simulate mode switch removing pagination
        table.get_pipeline().remove_stage('paginate');
        table.get_pipeline().remove_stage('top_n');

        // Reset page_size so we see all rows
        table.view.data.model.set('page_size', null);
        table.render();

        assert.strictEqual(table.get_visible_rows().length, 5,
            'Without paginate stage, all sorted rows visible');
        assert.deepStrictEqual(
            table.get_pipeline().get_stage_names(),
            ['filter', 'sort'],
            'Pipeline reduced to 2 stages'
        );

        // ── Test 10: Raw data is never mutated ──
        assert.strictEqual(raw_data[0].name, 'Charlie',
            'Raw data untouched — pipeline works on copies');
        assert.strictEqual(raw_data.length, 5,
            'Source array length unchanged');

        // ── Test 11: view.data.model is the single source of truth ──
        const vm = table.view.data.model;
        assert.ok(vm.sort_state, 'Sort state lives on view.data.model');
        assert.strictEqual(vm.sort_state.key, 'name');
        assert.strictEqual(vm.sort_state.direction, 'asc');

        // ── Test 12: Same raw data, different view = different results ──
        // This proves the view OWNS the pipeline. Same data.model,
        // but a different view.data.model produces different output.
        const table2 = new Pipeline_Data_Table({
            context,
            rows: raw_data,           // SAME raw data
            columns,
            sort_state: { key: 'score', direction: 'desc' },  // DIFFERENT view config
            page_size: 3
        });

        const t2_rows = table2.get_visible_rows();
        assert.strictEqual(t2_rows[0].name, 'Alpha', 'Table 2: highest score first');
        assert.strictEqual(t2_rows.length, 3, 'Table 2: page_size=3');
        assert.strictEqual(table.get_visible_rows()[0].name, 'Alpha',
            'Table 1: still sorted by name');

        // Two views, same data, different pipelines, different results.

        cleanup();
        return {
            ok: true,
            summary: {
                assertions_passed: 12,
                dual_purpose_properties: ['sort_state', 'filters', 'page/page_size'],
                pipeline_stages: ['filter', 'sort', 'paginate', 'top_n (dynamic)'],
                view_effects: ['sort_indicators', 'filter_highlights', 'page_info'],
                key_insight: 'view.data.model properties are dual-purpose: ' +
                    'they drive pipeline stages AND visual rendering from the SAME source. ' +
                    'The pipeline is owned by the view, not by the data model.'
            }
        };
    }
};
