/**
 * Lab Experiment: Swappable Control Internals via "Complexity Gating"
 *
 * Validates the pattern where a control's `mode` property drives which
 * internal composition strategy is used. Changing `mode` tears down the
 * old composition and rebuilds with the new strategy, while preserving
 * the data model and a shared public API surface.
 *
 * Patterns exercised:
 *   - `field()` from obext for reactive mode property with change events
 *   - Mode Registry (strategy map) for composer lookup
 *   - `view.data.model` as the canonical location for mode state
 *   - Teardown → recompose cycle on mode change
 *   - Shared API surface across modes
 */
module.exports = {
    name: 'swappable_mode',
    description: 'Validate mode-driven composition swapping (complexity gating).',

    run: async (tools) => {
        const { create_lab_context, assert, wait_for, cleanup } = tools;
        const jsgui = require('../../html-core/html-core');
        const { Control } = jsgui;
        const { Data_Object } = require('lang-tools');
        const { field } = require('obext');
        const { ensure_control_models } = require('../../html-core/control_model_factory');

        // ════════════════════════════════════════════════════════════
        // SECTION 1: Composer Definitions (Strategy Objects)
        // ════════════════════════════════════════════════════════════

        /**
         * Simple_Table_Composer
         * Uses a standard HTML <table> with <thead>/<tbody>/<tr>/<td>.
         * Minimal — no virtualization, no frozen columns, just data display.
         */
        const Simple_Table_Composer = {
            name: 'simple_table',
            description: 'Standard HTML table — lightweight, accessible, semantic.',
            tag_name: 'table',

            compose(ctrl) {
                ctrl.dom.tagName = 'table';
                ctrl.dom.attributes.role = 'grid';
                ctrl.add_class('mode-simple-table');

                const head = new Control({ context: ctrl.context, tag_name: 'thead' });
                const body = new Control({ context: ctrl.context, tag_name: 'tbody' });

                ctrl._ctrl_fields = ctrl._ctrl_fields || {};
                ctrl._ctrl_fields.head = head;
                ctrl._ctrl_fields.body = body;

                ctrl.add(head);
                ctrl.add(body);
            },

            render(ctrl, rows, columns) {
                const { context } = ctrl;
                const head = ctrl._ctrl_fields.head;
                const body = ctrl._ctrl_fields.body;

                // Clear existing content
                head.content.clear();
                body.content.clear();

                // Header row
                if (columns.length > 0) {
                    const header_row = new Control({ context, tag_name: 'tr' });
                    header_row.add_class('header-row');
                    for (const col of columns) {
                        const th = new Control({ context, tag_name: 'th' });
                        th.add(col.label || col.key);
                        header_row.add(th);
                    }
                    head.add(header_row);
                }

                // Data rows
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    const tr = new Control({ context, tag_name: 'tr' });
                    tr.dom.attributes['data-row-index'] = String(i);
                    for (const col of columns) {
                        const td = new Control({ context, tag_name: 'td' });
                        const value = row[col.key];
                        td.add(value !== undefined && value !== null ? String(value) : '');
                        tr.add(td);
                    }
                    body.add(tr);
                }
            },

            teardown(ctrl) {
                ctrl.content.clear();
                ctrl.remove_class('mode-simple-table');
                delete ctrl._ctrl_fields;
            },

            css: `
.mode-simple-table { border-collapse: collapse; width: 100%; }
.mode-simple-table th { font-weight: 600; text-align: left; padding: 8px; border-bottom: 2px solid #e0e0e0; }
.mode-simple-table td { padding: 8px; border-bottom: 1px solid #f0f0f0; }
            `.trim()
        };

        /**
         * Div_Grid_Composer
         * Uses <div> elements with CSS Grid layout.
         * Demonstrates a fundamentally different DOM structure for the same data.
         */
        const Div_Grid_Composer = {
            name: 'div_grid',
            description: 'CSS Grid layout using divs — flexible for rearrangement.',
            tag_name: 'div',

            compose(ctrl) {
                ctrl.dom.tagName = 'div';
                ctrl.dom.attributes.role = 'grid';
                ctrl.add_class('mode-div-grid');

                const head = new Control({ context: ctrl.context });
                head.dom.tagName = 'div';
                head.add_class('grid-header');

                const body = new Control({ context: ctrl.context });
                body.dom.tagName = 'div';
                body.add_class('grid-body');

                ctrl._ctrl_fields = ctrl._ctrl_fields || {};
                ctrl._ctrl_fields.head = head;
                ctrl._ctrl_fields.body = body;

                ctrl.add(head);
                ctrl.add(body);
            },

            render(ctrl, rows, columns) {
                const { context } = ctrl;
                const head = ctrl._ctrl_fields.head;
                const body = ctrl._ctrl_fields.body;

                head.content.clear();
                body.content.clear();

                // Set grid-template-columns based on column count
                const grid_cols = columns.map(() => '1fr').join(' ');
                head.dom.attributes.style = `display: grid; grid-template-columns: ${grid_cols}`;
                body.dom.attributes.style = `display: grid; grid-template-columns: ${grid_cols}`;

                // Header cells (flat, no row wrapper — pure grid)
                for (const col of columns) {
                    const cell = new Control({ context });
                    cell.dom.tagName = 'div';
                    cell.add_class('grid-header-cell');
                    cell.dom.attributes.role = 'columnheader';
                    cell.add(col.label || col.key);
                    head.add(cell);
                }

                // Data cells
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    for (const col of columns) {
                        const cell = new Control({ context });
                        cell.dom.tagName = 'div';
                        cell.add_class('grid-cell');
                        cell.dom.attributes['data-row-index'] = String(i);
                        cell.dom.attributes['data-col-key'] = col.key;
                        cell.dom.attributes.role = 'gridcell';
                        const value = row[col.key];
                        cell.add(value !== undefined && value !== null ? String(value) : '');
                        body.add(cell);
                    }
                }
            },

            teardown(ctrl) {
                ctrl.content.clear();
                ctrl.remove_class('mode-div-grid');
                delete ctrl._ctrl_fields;
            },

            css: `
.mode-div-grid { width: 100%; }
.grid-header-cell { font-weight: 600; padding: 8px; border-bottom: 2px solid #e0e0e0; }
.grid-cell { padding: 8px; border-bottom: 1px solid #f0f0f0; }
            `.trim()
        };

        // ════════════════════════════════════════════════════════════
        // SECTION 2: Lab_Data_Table — Mode-Switchable Control
        // ════════════════════════════════════════════════════════════

        class Lab_Data_Table extends Control {
            constructor(spec = {}) {
                spec.__type_name = spec.__type_name || 'lab_data_table';
                super(spec);

                // Initialize data/view model stack
                ensure_control_models(this, spec);

                // ── Mode Registry ──
                this._mode_registry = {};
                this.register_mode(Simple_Table_Composer);
                this.register_mode(Div_Grid_Composer);

                // ── Data setup ──
                this.rows = spec.rows || [];
                this.columns = spec.columns || [];

                // ── Reactive mode property ──
                // Uses `field` so mode is stored on `this._` and serializable
                // to `data-jsgui-fields` in rendered HTML.
                const default_mode = spec.mode || 'simple_table';
                field(this, 'mode', default_mode);

                // Also reflect mode into view.data.model for MVVM consumers
                if (this.view && this.view.data && this.view.data.model) {
                    this.view.data.model.mode = default_mode;
                }

                // ── Mode change listener ──
                this.on('change', (e) => {
                    if (e.name === 'mode') {
                        this._on_mode_change(e.old, e.value);
                    }
                });

                // ── Initial compose ──
                if (!spec.el) {
                    this._compose_mode(default_mode);
                    this._render_current();
                }
            }

            // ── Mode Registry API ──

            register_mode(composer) {
                this._mode_registry[composer.name] = composer;
            }

            get_mode_names() {
                return Object.keys(this._mode_registry);
            }

            get_mode_meta(mode_name) {
                const composer = this._mode_registry[mode_name];
                if (!composer) return null;
                return {
                    name: composer.name,
                    description: composer.description,
                    tag_name: composer.tag_name
                };
            }

            // ── Composition lifecycle ──

            _compose_mode(mode_name) {
                const composer = this._mode_registry[mode_name];
                if (!composer) {
                    throw new Error(`Unknown mode: ${mode_name}`);
                }
                this._active_composer = composer;
                composer.compose(this);
            }

            _teardown_mode() {
                if (this._active_composer) {
                    this._active_composer.teardown(this);
                    this._active_composer = null;
                }
            }

            _on_mode_change(old_mode, new_mode) {
                if (old_mode === new_mode) return;

                // Preserve data across mode switch
                const preserved_rows = this.rows;
                const preserved_columns = this.columns;

                // Teardown old composition
                this._teardown_mode();

                // Compose new mode
                this._compose_mode(new_mode);

                // Restore data
                this.rows = preserved_rows;
                this.columns = preserved_columns;

                // Sync view.data.model
                if (this.view && this.view.data && this.view.data.model) {
                    this.view.data.model.mode = new_mode;
                }

                // Re-render with current data
                this._render_current();

                // Raise a semantic event consumers can listen to
                this.raise('mode_changed', {
                    old: old_mode,
                    mode: new_mode,
                    composer: this._active_composer.name
                });
            }

            // ── Shared Public API (stable across modes) ──

            set_rows(rows) {
                this.rows = Array.isArray(rows) ? rows : [];
                this._render_current();
            }

            set_columns(columns) {
                this.columns = Array.isArray(columns) ? columns : [];
                this._render_current();
            }

            _render_current() {
                if (this._active_composer && this.rows && this.columns) {
                    this._active_composer.render(this, this.rows, this.columns);
                }
            }

            get_row_count() {
                return this.rows.length;
            }

            get_column_count() {
                return this.columns.length;
            }
        }

        // ════════════════════════════════════════════════════════════
        // SECTION 3: Assertions
        // ════════════════════════════════════════════════════════════

        const context = create_lab_context();

        const sample_rows = [
            { id: 1, name: 'Alpha', score: 95 },
            { id: 2, name: 'Beta', score: 87 },
            { id: 3, name: 'Gamma', score: 72 }
        ];

        const sample_columns = [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'score', label: 'Score' }
        ];

        // ── Test 1: Default mode is 'simple_table' ──
        const table = new Lab_Data_Table({
            context,
            rows: sample_rows,
            columns: sample_columns
        });

        assert.strictEqual(table.mode, 'simple_table', 'Default mode should be simple_table');
        assert.ok(table._active_composer, 'Should have an active composer');
        assert.strictEqual(table._active_composer.name, 'simple_table');

        // ── Test 2: HTML output uses <table> in simple_table mode ──
        const html_simple = table.html;
        assert.ok(html_simple.includes('<table'), 'simple_table mode should produce <table>');
        assert.ok(html_simple.includes('<thead'), 'simple_table mode should produce <thead>');
        assert.ok(html_simple.includes('<tbody'), 'simple_table mode should produce <tbody>');
        assert.ok(html_simple.includes('Alpha'), 'Should render row data');
        assert.ok(html_simple.includes('ID'), 'Should render column headers');

        // ── Test 3: Mode Registry ──
        const mode_names = table.get_mode_names();
        assert.deepStrictEqual(mode_names.sort(), ['div_grid', 'simple_table']);

        const meta = table.get_mode_meta('div_grid');
        assert.strictEqual(meta.name, 'div_grid');
        assert.strictEqual(meta.tag_name, 'div');

        // ── Test 4: Switch to div_grid mode ──
        let mode_changed_event = null;
        table.on('mode_changed', (e) => { mode_changed_event = e; });

        table.mode = 'div_grid';

        assert.strictEqual(table.mode, 'div_grid', 'Mode should be div_grid after switch');
        assert.strictEqual(table._active_composer.name, 'div_grid');

        // ── Test 5: HTML output uses <div> in div_grid mode ──
        const html_grid = table.html;
        assert.ok(!html_grid.includes('<table'), 'div_grid mode should NOT produce <table>');
        assert.ok(html_grid.includes('grid-header'), 'div_grid mode should have grid-header class');
        assert.ok(html_grid.includes('grid-body'), 'div_grid mode should have grid-body class');
        assert.ok(html_grid.includes('grid-template-columns'), 'div_grid should set CSS grid');
        assert.ok(html_grid.includes('Alpha'), 'Data survives mode switch');
        assert.ok(html_grid.includes('95'), 'All data preserved');

        // ── Test 6: Mode change event fired ──
        assert.ok(mode_changed_event, 'mode_changed event should fire');
        assert.strictEqual(mode_changed_event.old, 'simple_table');
        assert.strictEqual(mode_changed_event.mode, 'div_grid');

        // ── Test 7: Data model preservation across switch ──
        assert.strictEqual(table.rows.length, 3, 'Rows preserved after switch');
        assert.strictEqual(table.columns.length, 3, 'Columns preserved after switch');
        assert.strictEqual(table.get_row_count(), 3);
        assert.strictEqual(table.get_column_count(), 3);

        // ── Test 8: Shared API works in new mode ──
        table.set_rows([...sample_rows, { id: 4, name: 'Delta', score: 61 }]);
        assert.strictEqual(table.get_row_count(), 4, 'set_rows works in div_grid mode');
        const html_updated = table.html;
        assert.ok(html_updated.includes('Delta'), 'New data renders in div_grid mode');

        // ── Test 9: Switch back to simple_table ──
        table.mode = 'simple_table';
        assert.strictEqual(table.mode, 'simple_table');
        const html_back = table.html;
        assert.ok(html_back.includes('<table'), 'Back to <table> after switch');
        assert.ok(html_back.includes('Delta'), 'Data from div_grid mode preserved');
        assert.strictEqual(table.get_row_count(), 4, 'Row count preserved round-trip');

        // ── Test 10: view.data.model.mode stays in sync ──
        assert.strictEqual(table.view.data.model.mode, 'simple_table',
            'view.data.model.mode should sync with field');

        // ── Test 11: field() serialization ──
        // `field()` stores on `this._`, which is read by renderDomAttributes
        assert.ok(table._, 'field() should create obj._');
        assert.strictEqual(table._.mode, 'simple_table', 'obj._.mode should match');

        // ── Test 12: Unknown mode throws ──
        let threw = false;
        try { table.mode = 'nonexistent_mode'; } catch (e) { threw = true; }
        assert.ok(threw, 'Setting unknown mode should throw');

        // ── Test 13: Dynamic mode registration ──
        const Minimal_Composer = {
            name: 'minimal',
            description: 'Absolute minimum — just a div with text.',
            tag_name: 'div',
            compose(ctrl) {
                ctrl.dom.tagName = 'div';
                ctrl.add_class('mode-minimal');
                ctrl._ctrl_fields = ctrl._ctrl_fields || {};
                ctrl._ctrl_fields.body = ctrl;
            },
            render(ctrl, rows) {
                // Just count
                ctrl.content.clear();
                const count_label = new Control({ context: ctrl.context });
                count_label.dom.tagName = 'span';
                count_label.add(`${rows.length} rows`);
                ctrl.add(count_label);
            },
            teardown(ctrl) {
                ctrl.content.clear();
                ctrl.remove_class('mode-minimal');
            },
            css: '.mode-minimal { padding: 16px; font-style: italic; }'
        };

        table.register_mode(Minimal_Composer);
        assert.ok(table.get_mode_names().includes('minimal'), 'Dynamic registration works');

        table.mode = 'minimal';
        const html_minimal = table.html;
        assert.ok(html_minimal.includes('4 rows'), 'Minimal mode renders row count');

        cleanup();
        return {
            ok: true,
            summary: {
                modes_tested: ['simple_table', 'div_grid', 'minimal'],
                assertions_passed: 13,
                patterns_validated: [
                    'field() reactive mode property',
                    'Mode Registry (strategy map)',
                    'Teardown → recompose cycle',
                    'Data preservation across switches',
                    'Shared API surface',
                    'view.data.model sync',
                    'Dynamic mode registration',
                    'Event propagation (mode_changed)'
                ]
            }
        };
    }
};
