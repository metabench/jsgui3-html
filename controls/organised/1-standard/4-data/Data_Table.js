const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const Data_Model_View_Model_Control = require('../../../../html-core/Data_Model_View_Model_Control');
const { shallow_array_equals } = require('../../../../html-core/ModelBinder');

// Mixins (Phase 1 - extracted)
const grid_selection = require('../../../../control_mixins/grid_selection');
const grid_keyboard_nav = require('../../../../control_mixins/grid_keyboard_nav');
const column_resize = require('../../../../control_mixins/column_resize');

// Mixins (Phase 2 - new)
const grid_render_mode = require('../../../../control_mixins/grid_render_mode');
const frozen_columns = require('../../../../control_mixins/frozen_columns');
const async_data_source = require('../../../../control_mixins/async_data_source');

// Internal renderers
const Data_Table_Virtual_Renderer = require('./internals/Data_Table_Virtual_Renderer');

// ── Utility functions ──

const normalize_columns = columns => {
    if (!Array.isArray(columns)) return [];
    return columns.map((column, index) => {
        if (typeof column === 'string') {
            return {
                key: column,
                label: column,
                sortable: true
            };
        }
        if (column && typeof column === 'object') {
            const key = is_defined(column.key) ? column.key : index;
            const col = {
                key,
                label: is_defined(column.label) ? column.label : String(key),
                sortable: column.sortable !== false,
                accessor: column.accessor,
                render: column.render
            };
            // Preserve T4 properties
            if (is_defined(column.width)) col.width = column.width;
            if (is_defined(column.resizable)) col.resizable = column.resizable;
            if (is_defined(column.frozen)) col.frozen = column.frozen;
            return col;
        }
        return {
            key: index,
            label: String(column),
            sortable: true
        };
    });
};

const get_cell_value = (row, column, column_index) => {
    if (column && typeof column.accessor === 'function') {
        return column.accessor(row);
    }
    if (Array.isArray(row)) {
        const index = is_defined(column.index) ? column.index : column_index;
        return row[index];
    }
    if (row && typeof row === 'object') {
        const key = is_defined(column.key) ? column.key : column_index;
        return row[key];
    }
    return undefined;
};

const compare_values = (left, right) => {
    if (left === right) return 0;
    if (!is_defined(left)) return 1;
    if (!is_defined(right)) return -1;
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }
    return String(left).localeCompare(String(right));
};

// ══════════════════════════════════════════════════════════════════
// Data_Table — Facade
//
// This is the public API. All interaction features are provided
// by mixins applied in the constructor. Rendering is delegated
// to the active renderer (standard DOM or virtual windowed).
// ══════════════════════════════════════════════════════════════════

/**
 * Data_Table — MVVM-driven tabular data control.
 *
 * Renders rows with sorting, filtering, pagination, column resizing,
 * row selection, virtual scrolling, and server-side data bypass.
 * All interaction features are provided by mixins; rendering is
 * delegated to standard DOM or virtual windowed renderers.
 *
 * **Server-side mode:** When `server_side=true`, the computed pipeline
 * returns rows as-is — the server already handled filtering, sorting,
 * and pagination. `total_count` drives pagination calculations instead
 * of counting filtered rows.
 *
 * @extends Data_Model_View_Model_Control
 *
 * @fires Data_Table#row_click When a row is clicked.
 * @fires Data_Table#sort_change When a sortable header is clicked.
 * @fires Data_Table#selection_change When row selection changes.
 * @fires Data_Table#column_resize When a column is resized via drag.
 * @fires Data_Table#page_change When page navigation occurs.
 */
class Data_Table extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_table';
        super(spec);
        this.add_class('data-table');
        this.add_class('jsgui-data-table');
        this.dom.tagName = 'table';
        this.dom.attributes.role = 'grid';
        this.dom.attributes.tabindex = '0';
        this.dom.attributes['aria-label'] = spec.aria_label || 'Data table';
        // aria-rowcount/colcount set by render_table for accurate values

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }
        // Density: comfortable (default), compact, dense
        this._density = spec.density || 'comfortable';
        this.dom.attributes['data-density'] = this._density;
        if (spec.compact) this._density = 'compact';
        if (spec.compact) this.dom.attributes['data-density'] = 'compact';
        if (spec.bordered) this.add_class('data-table-bordered');
        if (spec.striped !== false) this.add_class('data-table-striped');

        // ── Adaptive layout options (all overridable) ──
        // layout_mode: 'auto' | 'phone' | 'tablet' | 'desktop'
        this.layout_mode = spec.layout_mode || 'auto';
        // Breakpoint for phone mode
        this.phone_breakpoint = is_defined(spec.phone_breakpoint) ? Number(spec.phone_breakpoint) : 600;
        // Whether to enable horizontal scroll wrapper on narrow viewports
        this.scroll_on_overflow = spec.scroll_on_overflow !== false;
        // Column priority array — columns with priority > threshold are hidden on phone
        // Each column can have { priority: 1|2|3 } — lower = always visible
        this.column_priority_threshold = is_defined(spec.column_priority_threshold) ? spec.column_priority_threshold : null;

        // DMVMC's super already calls ensure_control_models
        this.model = this.data.model;

        // ── Data setup (use batch for efficiency) ──
        this.model.batch(() => {
            this.model.set('columns', normalize_columns(spec.columns || []));
            this.model.set('rows', Array.isArray(spec.rows) ? spec.rows.slice() : []);
            this.model.set('sort_state', spec.sort_state || null);
            this.model.set('filters', spec.filters || null);
            this.model.set('page', is_defined(spec.page) ? spec.page : 1);
            this.model.set('page_size', spec.page_size || null);
            this.model.set('server_side', !!spec.server_side);
            this.model.set('total_count', spec.total_count || null);
            // Column widths stored in model (survive re-renders)
            const initial_widths = {};
            (spec.columns || []).forEach((col, i) => {
                const key = (typeof col === 'string') ? col : (col.key || i);
                if (col.width) initial_widths[key] = col.width;
            });
            this.model.set('column_widths', initial_widths);
            // Selection state in model
            this.model.set('selected_row_indices', []);
        });

        // ── Apply Mixins (Facade pattern) ──

        // Selection (Phase 1)
        grid_selection(this, { mode: spec.selection_mode || 'none' });

        // Keyboard navigation (Phase 1) — depends on grid_selection
        grid_keyboard_nav(this);

        // Column resize (Phase 1)
        column_resize(this);

        // Render mode selection (Phase 2)
        grid_render_mode(this, {
            mode: spec.render_mode || 'auto',
            threshold: spec.virtual_threshold || 1000
        });

        // Frozen columns (Phase 2) — only if configured
        if (spec.frozen_left || spec.frozen_right) {
            frozen_columns(this, {
                left: spec.frozen_left || 0,
                right: spec.frozen_right || 0
            });
        }

        // Async data source (Phase 2) — only if data_source provided
        if (spec.data_source) {
            async_data_source(this, { data_source: spec.data_source });
        }

        // ── Virtual Renderer Setup ──
        this._virtual_renderer = new Data_Table_Virtual_Renderer(this, {
            row_height: spec.row_height || 36,
            buffer: spec.virtual_buffer || 5,
            viewport_height: spec.viewport_height || 400
        });

        // Row creation factory — shared by standard and virtual renderers
        this._create_row_ctrl = (row, row_index, columns) => {
            return this._build_row_ctrl(row, row_index, columns);
        };

        // ── MVVM Computed Pipeline ──
        // Must run before compose() so visible_rows is populated when render_table() executes
        this._setup_computed_pipeline();

        if (!spec.el) {
            this.compose();
        }
    }

    // ── Composition ──

    compose() {
        const { context } = this;
        const head_ctrl = new Control({ context, tag_name: 'thead' });
        const body_ctrl = new Control({ context, tag_name: 'tbody' });

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.head = head_ctrl;
        this._ctrl_fields.body = body_ctrl;

        this.add(head_ctrl);
        this.add(body_ctrl);

        // If virtual mode, set up the scroll container
        if (this.get_render_mode() === 'virtual') {
            this._virtual_renderer.compose(head_ctrl, body_ctrl);
        }

        this.render_table();
    }

    // ── MVVM Computed Pipeline ──

    _setup_computed_pipeline() {
        if (!this.model) return;

        // Computed: visible_rows = pipeline(rows → filter → sort → page)
        // In server_side mode, rows are returned as-is (server already processed)
        this.computed(
            this.model,
            ['rows', 'filters', 'sort_state', 'page', 'page_size', 'columns', 'server_side'],
            (rows, filters, sort_state, page, page_size, columns, server_side) => {
                rows = Array.isArray(rows) ? rows : [];
                columns = Array.isArray(columns) ? columns : [];

                if (server_side) {
                    // Server already filtered/sorted/paged
                    return rows;
                }

                const filtered = this._compute_filtered_rows(rows, filters);
                const sorted = this._compute_sorted_rows(filtered, sort_state, columns);
                const paged = this._compute_paged_rows(sorted, page, page_size);
                return paged;
            },
            {
                property_name: 'visible_rows',
                equals: shallow_array_equals
            }
        );

        // Computed: total_rows = count of rows after filtering
        // In server_side mode, use externally provided total_count
        this.computed(
            this.model,
            ['rows', 'filters', 'server_side', 'total_count'],
            (rows, filters, server_side, total_count) => {
                rows = Array.isArray(rows) ? rows : [];
                if (server_side && total_count != null) {
                    return Number(total_count);
                }
                return this._compute_filtered_rows(rows, filters).length;
            },
            { property_name: 'total_rows' }
        );

        // Computed: total_pages = ceil(total_rows / page_size)
        this.computed(
            this.model,
            ['total_rows', 'page_size'],
            (total_rows, page_size) => {
                if (!page_size || page_size <= 0) return 1;
                return Math.ceil((total_rows || 0) / page_size) || 1;
            },
            { property_name: 'total_pages' }
        );

        // Watch: when visible_rows changes, re-render the table
        this.watch(this.model, 'visible_rows', () => {
            this.render_table();
        });

        // Watch: when rows change, update render mode (auto-detection)
        this.watch(this.model, 'rows', () => {
            if (this._update_render_mode) this._update_render_mode();
        });

        // Watch: sync selection state to model when mixin fires selection_change
        this.on('selection_change', (e) => {
            if (this.model && e && e.selected) {
                this.model.set('selected_row_indices', e.selected);
            }
        });

        // Watch: sync column widths to model on resize
        this.on('column_resize', (e) => {
            if (this.model && e && e.column) {
                const widths = { ...(this.model.column_widths || {}) };
                widths[e.column.key] = e.width;
                this.model.set('column_widths', widths);
            }
        });
    }

    // ── Data Accessors (model-only, no duplicated state) ──

    set_model_value(name, value) {
        if (this.model && typeof this.model.set === 'function') {
            this.model.set(name, value);
        } else if (this.model) {
            this.model[name] = value;
        }
    }

    /**
     * Replace all data rows.
     * @param {Array<Object>} rows - New row data array.
     */
    set_rows(rows) {
        this.set_model_value('rows', Array.isArray(rows) ? rows.slice() : []);
    }

    /**
     * Replace column definitions.
     * @param {Array<string|Object>} columns - New column definitions.
     */
    set_columns(columns) {
        this.set_model_value('columns', normalize_columns(columns));
    }

    /**
     * Set sort state. Resets page to 1.
     * @param {{key: string, direction: 'asc'|'desc'}|null} sort_state - Sort state.
     */
    set_sort_state(sort_state) {
        this.model.batch(() => {
            this.set_model_value('sort_state', sort_state ? { ...sort_state } : null);
            this.set_model_value('page', 1); // Reset to page 1 on sort change
        });
    }

    /**
     * Set filter map. Resets page to 1.
     * @param {Object|null} filters - Column filter map `{column_key: value}`.
     */
    set_filters(filters) {
        this.model.batch(() => {
            this.set_model_value('filters', filters ? { ...filters } : null);
            this.set_model_value('page', 1); // Reset to page 1 on filter change
        });
    }

    /**
     * Navigate to a specific page (1-based).
     * @param {number} page - Page number.
     */
    set_page(page) {
        this.set_model_value('page', Number(page) || 1);
    }

    /**
     * Set rows per page.
     * @param {number|null} page_size - Page size, or null for no paging.
     */
    set_page_size(page_size) {
        this.set_model_value('page_size', page_size ? Number(page_size) : null);
    }

    // Read-through accessors — model is the source of truth
    get columns() { return this.model ? this.model.columns : []; }
    get rows() { return this.model ? this.model.rows : []; }
    get sort_state() { return this.model ? this.model.sort_state : null; }
    get filters() { return this.model ? this.model.filters : null; }
    get page() { return this.model ? this.model.page : 1; }
    get page_size() { return this.model ? this.model.page_size : null; }
    get visible_rows() { return this.model ? this.model.visible_rows : []; }
    get total_rows() { return this.model ? this.model.total_rows : 0; }
    get total_pages() { return this.model ? this.model.total_pages : 1; }
    get column_widths() { return this.model ? this.model.column_widths : {}; }
    get selected_row_indices() { return this.model ? this.model.selected_row_indices : []; }
    get server_side() { return this.model ? !!this.model.server_side : false; }

    /**
     * Enable or disable server-side mode.
     * @param {boolean} flag - True to bypass client-side filter/sort/page.
     */
    set_server_side(flag) {
        this.set_model_value('server_side', !!flag);
    }

    /**
     * Returns the rows currently visible after the computed pipeline.
     * In server_side mode, these are the raw rows provided.
     * @returns {Array<Object>}
     */
    get_visible_rows() {
        return this.visible_rows || [];
    }

    // ── Data Processing (pure functions for computed pipeline) ──

    _compute_filtered_rows(rows, filters) {
        if (!filters) return rows;
        return rows.filter(row => {
            return Object.keys(filters).every(key => {
                const filter_value = filters[key];
                if (typeof filter_value === 'function') {
                    return filter_value(row);
                }
                if (!is_defined(filter_value) || filter_value === '') return true;
                const cell_value = row && typeof row === 'object' ? row[key] : undefined;
                return String(cell_value || '').includes(String(filter_value));
            });
        });
    }

    _compute_sorted_rows(rows, sort_state, columns) {
        if (!sort_state || !is_defined(sort_state.key)) return rows;
        const sort_key = sort_state.key;
        const direction = sort_state.direction === 'desc' ? 'desc' : 'asc';
        const column_index = columns.findIndex(column => String(column.key) === String(sort_key));
        if (column_index < 0) return rows;
        const column = columns[column_index];

        const sorted = rows.slice().sort((left, right) => {
            const left_value = get_cell_value(left, column, column_index);
            const right_value = get_cell_value(right, column, column_index);
            const cmp = compare_values(left_value, right_value);
            return direction === 'desc' ? -cmp : cmp;
        });

        return sorted;
    }

    _compute_paged_rows(rows, page, page_size) {
        if (!page_size) return rows;
        const safe_page = Math.max(1, page || 1);
        const start_index = (safe_page - 1) * page_size;
        return rows.slice(start_index, start_index + page_size);
    }

    // Legacy aliases for backward compatibility
    get_filtered_rows(rows) { return this._compute_filtered_rows(rows, this.filters); }
    get_sorted_rows(rows) { return this._compute_sorted_rows(rows, this.sort_state, this.columns); }
    get_paged_rows(rows) { return this._compute_paged_rows(rows, this.page, this.page_size); }

    // ── Row Factory ──

    /**
     * Build a single row Control. Shared factory for both standard
     * and virtual renderers.
     */
    _build_row_ctrl(row, row_index, columns) {
        const tr_ctrl = new Control({ context: this.context, tag_name: 'tr' });
        tr_ctrl.add_class('data-table-row');
        tr_ctrl.dom.attributes['data-row-index'] = String(row_index);
        tr_ctrl.dom.attributes.role = 'row';
        tr_ctrl.dom.attributes['aria-rowindex'] = String(row_index + 2); // +2: 1-based, row 1 is header

        const is_selected = this.selected_rows.has(String(row_index));
        if (is_selected) {
            tr_ctrl.add_class('is-selected');
            tr_ctrl.dom.attributes['aria-selected'] = 'true';
        } else {
            tr_ctrl.dom.attributes['aria-selected'] = 'false';
        }

        columns.forEach((column, column_index) => {
            const td_ctrl = new Control({ context: this.context, tag_name: 'td' });
            td_ctrl.add_class('data-table-cell');
            td_ctrl.dom.attributes.role = 'gridcell';

            const cell_value = get_cell_value(row, column, column_index);
            if (typeof column.render === 'function') {
                const rendered = column.render(cell_value, row);
                if (rendered instanceof Control) {
                    td_ctrl.add(rendered);
                } else if (is_defined(rendered)) {
                    td_ctrl.add(String(rendered));
                }
            } else if (is_defined(cell_value)) {
                td_ctrl.add(String(cell_value));
            }

            tr_ctrl.add(td_ctrl);
        });

        return tr_ctrl;
    }

    // ── Rendering (delegates based on mode) ──

    render_table() {
        const head_ctrl = this._ctrl_fields && this._ctrl_fields.head;
        const body_ctrl = this._ctrl_fields && this._ctrl_fields.body;
        if (!head_ctrl || !body_ctrl) return;

        const columns = this.columns || [];
        // Read visible_rows from model (computed pipeline)
        const visible_rows = this.visible_rows || [];
        const sort_state = this.sort_state;
        const sort_key = sort_state && sort_state.key;
        const sort_direction = sort_state && sort_state.direction === 'desc' ? 'descending' : 'ascending';

        // ── Render Header (shared by all modes) ──

        head_ctrl.clear();
        const header_row = new Control({ context: this.context, tag_name: 'tr' });

        columns.forEach((column, col_idx) => {
            const th_ctrl = new Control({ context: this.context, tag_name: 'th' });
            th_ctrl.add_class('data-table-header');
            th_ctrl.dom.attributes['data-column-key'] = String(column.key);
            th_ctrl.dom.attributes.scope = 'col';
            th_ctrl.dom.attributes.role = 'columnheader';

            if (column.width) {
                th_ctrl.dom.attributes.style = `width: ${column.width}px`;
            }

            th_ctrl.add(column.label || String(column.key));

            if (column.sortable !== false) {
                th_ctrl.add_class('is-sortable');
                th_ctrl.dom.attributes.tabindex = '0';
                if (is_defined(sort_key) && String(sort_key) === String(column.key)) {
                    th_ctrl.dom.attributes['aria-sort'] = sort_direction;
                } else {
                    th_ctrl.dom.attributes['aria-sort'] = 'none';
                }
            }

            // Resize handle (from column_resize mixin)
            if (column.resizable !== false && this.__mx && this.__mx.column_resize) {
                const resize_handle = new Control({ context: this.context, tag_name: 'div' });
                resize_handle.add_class('data-table-resize-handle');
                resize_handle.add_dom_event_listener('click', e => e.stopPropagation());
                resize_handle.add_dom_event_listener('mousedown', e => this._handle_resize_start(e, column, th_ctrl));
                th_ctrl.add(resize_handle);
            }

            header_row.add(th_ctrl);
        });

        head_ctrl.add(header_row);

        // ── ARIA grid counts ──
        const all_rows = this.model ? (this.model.rows || []) : [];
        this.dom.attributes['aria-colcount'] = String(columns.length);
        this.dom.attributes['aria-rowcount'] = String(all_rows.length + 1); // +1 for header

        // ── Render Body (delegates to active renderer) ──

        if (this.get_render_mode() === 'virtual') {
            // Virtual rendering — windowed
            this._virtual_renderer.render(visible_rows, columns, this._create_row_ctrl);
        } else {
            // Standard rendering — full DOM
            body_ctrl.clear();
            visible_rows.forEach((row, row_index) => {
                const tr_ctrl = this._build_row_ctrl(row, row_index, columns);
                body_ctrl.add(tr_ctrl);
            });
        }

        // Apply frozen column styles if mixin is active
        if (this.__mx && this.__mx.frozen_columns) {
            this._apply_frozen_styles();
        }
    }

    // ── Activation ──

    /**
     * Resolve the current layout mode.
     * @returns {'phone'|'tablet'|'desktop'}
     */
    resolve_layout_mode() {
        if (this.layout_mode !== 'auto') return this.layout_mode;
        if (this.context && this.context.view_environment && this.context.view_environment.layout_mode) {
            return this.context.view_environment.layout_mode;
        }
        if (typeof window !== 'undefined') {
            if (window.innerWidth < this.phone_breakpoint) return 'phone';
        }
        return 'desktop';
    }

    /**
     * Apply adaptive layout mode to the DOM.
     */
    _apply_layout_mode() {
        if (!this.dom.el) return;
        const mode = this.resolve_layout_mode();
        this.dom.el.setAttribute('data-layout-mode', mode);

        // Hide low-priority columns on phone if configured
        if (this.column_priority_threshold !== null && mode === 'phone') {
            const threshold = this.column_priority_threshold;
            const columns = this.columns || [];
            columns.forEach(col => {
                const priority = col.priority || 1;
                const cells = this.dom.el.querySelectorAll(`[data-column-key="${col.key}"], td:nth-child(${columns.indexOf(col) + 1})`);
                cells.forEach(cell => {
                    if (priority > threshold) {
                        cell.classList.add('data-table-col-hidden');
                    } else {
                        cell.classList.remove('data-table-col-hidden');
                    }
                });
            });
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();

            if (!this.dom.el) return;

            // Apply initial layout mode
            this._apply_layout_mode();

            // Listen for resize in auto mode
            if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
                this._resize_handler = () => this._apply_layout_mode();
                window.addEventListener('resize', this._resize_handler);
            }

            const find_row_el = target => {
                let node = target;
                while (node && node.getAttribute) {
                    if (node.getAttribute('data-row-index') !== null) return node;
                    node = node.parentNode;
                }
                return null;
            };

            const find_header_el = target => {
                let node = target;
                while (node && node.getAttribute) {
                    if (node.getAttribute('data-column-key') !== null) return node;
                    node = node.parentNode;
                }
                return null;
            };

            // Click: sort headers + row selection (via mixin)
            this.add_dom_event_listener('click', e_click => {
                const header_el = find_header_el(e_click.target);
                if (header_el) {
                    const column_key = header_el.getAttribute('data-column-key');
                    const column = (this.columns || []).find(col => String(col.key) === String(column_key));
                    if (column && column.sortable !== false) {
                        const direction = this.sort_state && String(this.sort_state.key) === String(column.key) && this.sort_state.direction === 'asc'
                            ? 'desc'
                            : 'asc';
                        this.set_sort_state({ key: column.key, direction });
                        this.raise('sort_change', { sort_state: this.sort_state });
                    }
                    return;
                }

                const row_el = find_row_el(e_click.target);
                if (row_el) {
                    const row_index = parseInt(row_el.getAttribute('data-row-index'), 10);
                    if (!Number.isNaN(row_index)) {
                        // Delegates to grid_selection mixin
                        this._handle_selection_click(row_index, e_click);
                        const row_data = this.visible_rows && this.visible_rows[row_index];
                        this.raise('row_click', { row_index, row_data, original_event: e_click });
                    }
                }
            });

            // Keydown: header sort + grid navigation (via mixin)
            this.add_dom_event_listener('keydown', e_key => {
                // Header sorting
                const header_el = find_header_el(e_key.target);
                if (header_el) {
                    const key = e_key.key;
                    if (key === 'Enter' || key === ' ') {
                        e_key.preventDefault();
                        const column_key = header_el.getAttribute('data-column-key');
                        const column = (this.columns || []).find(col => String(col.key) === String(column_key));
                        if (column && column.sortable !== false) {
                            const direction = this.sort_state && String(this.sort_state.key) === String(column.key) && this.sort_state.direction === 'asc'
                                ? 'desc'
                                : 'asc';
                            this.set_sort_state({ key: column.key, direction });
                            this.raise('sort_change', { sort_state: this.sort_state });
                        }
                    }
                    return;
                }

                // Delegates to grid_keyboard_nav mixin
                this._handle_grid_keydown(e_key);
            });

            // Virtual scroll listener
            if (this.get_render_mode() === 'virtual') {
                this._virtual_renderer.attach_scroll_listener();
            }

            // Load async data if source is set
            if (this.__mx && this.__mx.async_data_source && this._data_source) {
                this.load_data();
            }
        }
    }
}

Data_Table.css = `
/* ─── Data_Table ─── */
.jsgui-data-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--j-font-sans, system-ui, sans-serif);
    font-size: var(--j-text-sm, 0.875rem);
    color: var(--j-fg, #e0e0e0);
    background: var(--j-bg-surface, #1e1e2e);
}

/* Header */
.data-table-header {
    text-align: left;
    font-weight: 600;
    padding: var(--j-space-2, 8px) var(--j-space-3, 12px);
    border-bottom: 2px solid var(--j-border, #333);
    background: var(--j-bg-elevated, #252535);
    color: var(--j-fg-muted, #999);
    font-size: var(--j-text-xs, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    user-select: none;
    position: relative;
}
.data-table-header.is-sortable {
    cursor: pointer;
    padding-right: 22px;
    transition: color 120ms ease-out;
}
.data-table-header.is-sortable:hover {
    color: var(--j-fg, #e0e0e0);
}
.data-table-header.is-sortable:focus-visible {
    outline: 2px solid var(--j-primary, #5b9bd5);
    outline-offset: -2px;
    border-radius: 2px;
}

/* Sort indicators */
.data-table-header[aria-sort="ascending"]::after {
    content: ' ▲';
    font-size: 9px;
    color: var(--j-primary, #5b9bd5);
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
}
.data-table-header[aria-sort="descending"]::after {
    content: ' ▼';
    font-size: 9px;
    color: var(--j-primary, #5b9bd5);
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
}
.data-table-header[aria-sort="none"]::after {
    content: ' ⇅';
    font-size: 9px;
    color: var(--j-fg-muted, #666);
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 120ms ease-out;
}
.data-table-header.is-sortable:hover[aria-sort="none"]::after {
    opacity: 0.5;
}

/* Rows */
.data-table-row {
    border-bottom: 1px solid var(--j-border, #333);
    transition: background-color 80ms ease-out;
    height: var(--j-row-height, 40px);
}
.data-table-row:last-child {
    border-bottom: none;
}
.data-table-row:hover {
    background: var(--j-bg-hover, rgba(255,255,255,0.04));
}
.data-table-row.is-selected {
    background: var(--j-primary-muted, rgba(91,155,213,0.15));
}
.data-table-row:focus-visible {
    outline: 2px solid var(--j-primary, #5b9bd5);
    outline-offset: -2px;
}

/* Striped rows */
.data-table-striped .data-table-row:nth-child(even) {
    background: var(--j-bg-muted, rgba(255,255,255,0.02));
}
.data-table-striped .data-table-row:nth-child(even):hover {
    background: var(--j-bg-hover, rgba(255,255,255,0.04));
}

/* Cells */
.data-table-cell {
    padding: var(--j-space-2, 8px) var(--j-space-3, 12px);
    vertical-align: middle;
    border-bottom: 1px solid var(--j-border, #333);
}
.data-table-cell:focus-visible {
    outline: 2px solid var(--j-primary, #5b9bd5);
    outline-offset: -2px;
}

/* Bordered variant */
.data-table-bordered .data-table-cell,
.data-table-bordered .data-table-header {
    border: 1px solid var(--j-border, #333);
}

/* Density: comfortable (default) */
.jsgui-data-table[data-density="comfortable"] .data-table-header,
.jsgui-data-table[data-density="comfortable"] .data-table-cell {
    padding: var(--j-space-2, 8px) var(--j-space-3, 12px);
}
.jsgui-data-table[data-density="comfortable"] .data-table-row {
    height: var(--j-row-height, 40px);
}

/* Density: compact */
.jsgui-data-table[data-density="compact"] .data-table-header,
.jsgui-data-table[data-density="compact"] .data-table-cell {
    padding: var(--j-space-1, 4px) var(--j-space-2, 8px);
}
.jsgui-data-table[data-density="compact"] .data-table-row {
    height: 32px;
}

/* Density: dense */
.jsgui-data-table[data-density="dense"] .data-table-header,
.jsgui-data-table[data-density="dense"] .data-table-cell {
    padding: 2px var(--j-space-1, 4px);
    font-size: var(--j-text-xs, 0.75rem);
}
.jsgui-data-table[data-density="dense"] .data-table-row {
    height: 24px;
}

/* Loading overlay */
.jsgui-data-table[aria-busy="true"] {
    opacity: 0.5;
    pointer-events: none;
}

/* Column priority hiding */
.data-table-col-hidden {
    display: none;
}

/* Resize handle */
.data-table-resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    background: transparent;
    transition: background 120ms ease-out;
}
.data-table-resize-handle:hover {
    background: var(--j-primary, #5b9bd5);
}

/* ── Phone layout: scrollable + touch sizing ── */
.jsgui-data-table[data-layout-mode="phone"] {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}
.jsgui-data-table[data-layout-mode="phone"] .data-table-row {
    height: var(--j-touch-target, 44px);
}
.jsgui-data-table[data-layout-mode="phone"] .data-table-header,
.jsgui-data-table[data-layout-mode="phone"] .data-table-cell {
    padding: var(--j-space-2, 8px) var(--j-space-3, 10px);
    font-size: var(--j-text-xs, 0.75rem);
}

/* ── Tablet layout: touch row height ── */
.jsgui-data-table[data-layout-mode="tablet"] .data-table-row {
    height: var(--j-touch-target, 44px);
}
`;

module.exports = Data_Table;
