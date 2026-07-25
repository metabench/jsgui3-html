const jsgui = require('../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../html-core/control_model_factory');
const Data_Table = require('../organised/1-standard/4-data/Data_Table');

const normalize_columns = columns => {
    if (!Array.isArray(columns)) return [];
    return columns.map(column => column);
};

/**
 * Data_Grid — High-level connected data component.
 *
 * Wires a data source (static array, async function, or data adapter) to an
 * inner {@link Data_Table}. Manages loading/error/empty states, pagination
 * parameters, sort/filter state, and server-side mode handoff.
 *
 * **Data source formats:**
 * - `Array` — static row array, rendered immediately.
 * - `Function(params) → Array|Promise` — called with `{columns, sort_state, filters, page, page_size}`.
 * - `{get_rows: Function}` — adapter object with `get_rows(params)` method.
 * - `{rows: Array}` — object with pre-resolved rows.
 *
 * When a promise resolves with `{rows, total_count}`, the grid automatically
 * enables server_side mode on the inner Data_Table, bypassing client-side
 * filter/sort/page processing.
 *
 * @example
 * // Static data
 * const grid = new Data_Grid({ context, columns: ['name', 'age'], rows: data });
 *
 * @example
 * // Async server-side
 * const grid = new Data_Grid({
 *   context,
 *   columns: [{key: 'name', label: 'Name'}],
 *   data_source: async (params) => {
 *     const res = await fetch(`/api/users?page=${params.page}`);
 *     return res.json(); // {rows: [...], total_count: 500}
 *   }
 * });
 *
 * @fires Data_Grid#selection_change When a row is clicked.
 * @fires Data_Grid#sort_change When sort state changes via header click.
 * @fires Data_Grid#page_change When the current page changes.
 * @fires Data_Grid#load_complete When async data source resolves successfully.
 * @fires Data_Grid#error When async data source rejects.
 */
class Data_Grid extends Control {
    /**
     * @param {Object} [spec={}] - Configuration object.
     * @param {Array<string|Object>} spec.columns - Column definitions forwarded to Data_Table.
     * @param {Array|Function|Object} [spec.data_source] - Data source (array, function, or adapter).
     * @param {Array<Object>} [spec.rows] - Alias for data_source when providing static array.
     * @param {Object|null} [spec.sort_state=null] - Initial sort state {key, direction}.
     * @param {Object|null} [spec.filters=null] - Initial filter map.
     * @param {number} [spec.page=1] - Initial page number (1-based).
     * @param {number|null} [spec.page_size=null] - Rows per page (null = no paging).
     * @param {Object|null} [spec.selection=null] - Initial row selection.
     * @param {'none'|'single'|'multiple'} [spec.selection_mode='none'] - Row selection mode.
     * @param {boolean} [spec.persist_activation_state=false] - Persist bounded JSON-safe static state for fresh activation.
     * @param {string} [spec.empty_text='No data available'] - Empty state message.
     */
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_grid';
        super(spec);
        this.add_class('data-grid');
        this.dom.tagName = 'div';

        // ARIA: region landmark for assistive tech
        this.dom.attributes.role = 'region';
        this.dom.attributes['aria-label'] = spec.aria_label || 'Data grid';
        this._destroyed = false;
        this._model_change_handler = null;
        this._model_sync_suspended = false;
        this._table_event_bindings = [];
        this._request_id = 0;

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this._empty_text = spec.empty_text || 'No data available';
        this._selection_mode = spec.selection_mode || 'none';
        this._persist_activation_state = spec.persist_activation_state === true;

        this.set_columns(spec.columns || []);
        this.set_data_source(spec.data_source || spec.rows || []);
        this.set_sort_state(spec.sort_state || null);
        this.set_filters(spec.filters || null);
        this.set_page(is_defined(spec.page) ? spec.page : 1);
        this.set_page_size(spec.page_size || null);
        this.set_selection(spec.selection || null);

        if (!spec.el) {
            this.compose_grid();
        }

        this.bind_model();
        if (!spec.el) this.refresh_rows();
    }

    /**
     * Compose the inner Data_Table and wire events.
     * @private
     */
    compose_grid() {
        const { context } = this;
        const initial_rows = Array.isArray(this.data_source) ? this.data_source : [];
        const table = new Data_Table({
            context,
            columns: this.columns,
            rows: initial_rows,
            sort_state: this.sort_state,
            filters: this.filters,
            page: this.page,
            page_size: this.page_size,
            selection_mode: this._selection_mode,
            selected_row_indices: this.selection && Number.isInteger(Number(this.selection.row_index))
                ? [Number(this.selection.row_index)]
                : [],
            persist_activation_state: this._persist_activation_state,
            aria_label: this.dom.attributes['aria-label']
        });
        table.add_class('data-grid-table');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.table = table;
        this.table = table;
        this.add(table);

        this._bind_table_events();
        this._sync_table_selection(this.selection);
    }

    /**
     * Bind the inner table bridge once. On the server this follows composition;
     * after fresh browser reconstruction it runs from activate(), once the
     * serialized control field has restored `this.table`.
     * @private
     */
    _bind_table_events() {
        const table = this.table;
        if (!table || this._table_events_bound_to === table) return;
        this._unbind_table_events();
        this._table_events_bound_to = table;

        const on_row_click = e_row => {
            if (this._destroyed || this._syncing_table_selection) return;
            const selection = {
                row_index: e_row.row_index,
                row_data: e_row.row_data
            };
            if (!this.selection || this.selection.row_index !== selection.row_index
                || this.selection.row_data !== selection.row_data) {
                this.set_selection(selection);
                this.raise('selection_change', { selection: this.selection });
            }
            this.raise('row_click', e_row);
        };

        const on_selection_change = e_selection => {
            if (this._destroyed || this._syncing_table_selection) return;
            const selected = e_selection && Array.isArray(e_selection.selected)
                ? e_selection.selected
                : [];
            const row_index = selected.length ? selected[selected.length - 1] : null;
            const row_data = row_index === null || !Array.isArray(table.visible_rows)
                ? null
                : table.visible_rows[row_index];
            const selection = row_index === null ? null : { row_index, row_data };
            this._set_selection_state(selection, { sync_table: false });
            this.raise('selection_change', { selection, selected });
        };

        const on_sort_change = e_sort => {
            if (this._destroyed) return;
            if (e_sort && e_sort.sort_state) {
                this.set_sort_state(e_sort.sort_state, { source_table: true });
                this.raise('sort_change', { sort_state: this.sort_state });
            }
        };

        const on_page_change = e_page => {
            if (this._destroyed || !e_page) return;
            this.set_page(e_page.page, { source_table: true });
        };

        [
            ['row_click', on_row_click],
            ['selection_change', on_selection_change],
            ['sort_change', on_sort_change],
            ['page_change', on_page_change]
        ].forEach(([event_name, handler]) => {
            table.on(event_name, handler);
            this._table_event_bindings.push({ table, event_name, handler });
        });
    }

    _unbind_table_events() {
        this._table_event_bindings.forEach(({ table, event_name, handler }) => {
            if (table && typeof table.off === 'function') {
                table.off(event_name, handler);
            }
        });
        this._table_event_bindings = [];
        this._table_events_bound_to = null;
    }

    /**
     * Bind model change listeners for reactive updates.
     * @private
     */
    bind_model() {
        if (!this.model || typeof this.model.on !== 'function' || this._model_change_handler) return;

        this._model_change_handler = e_change => {
            if (this._destroyed || this._adopting_table_state || this._model_sync_suspended) return;
            const name = e_change.name;
            const value = e_change.value;

            if (name === 'columns') {
                this.columns = normalize_columns(value);
                if (this.table) this.table.set_columns(this.columns);
                return;
            }

            if (name === 'sort_state') {
                const previous_page = Math.max(1, Math.trunc(Number(this.page)) || 1);
                this.sort_state = value ? { ...value } : null;
                this.page = 1;
                this._write_model_values({ page: 1 });
                if (this.table) this.table.set_sort_state(this.sort_state);
                this.refresh_rows();
                if (previous_page !== 1) {
                    this.raise('page_change', { page: 1, previous_page, reason: 'sort' });
                }
                return;
            }

            if (name === 'filters') {
                const previous_page = Math.max(1, Math.trunc(Number(this.page)) || 1);
                this.filters = value ? { ...value } : null;
                this.page = 1;
                this._write_model_values({ page: 1 });
                if (this.table) this.table.set_filters(this.filters);
                this.refresh_rows();
                if (previous_page !== 1) {
                    this.raise('page_change', { page: 1, previous_page, reason: 'filter' });
                }
                return;
            }

            if (name === 'page') {
                this.page = Math.max(1, Math.trunc(Number(value)) || 1);
                if (this.table) this.table.set_page(this.page, { silent: true });
                this.refresh_rows();
                this.raise('page_change', { page: this.page });
                return;
            }

            if (name === 'page_size') {
                this.page_size = value ? Number(value) : null;
                if (this.table) this.table.set_page_size(this.page_size);
                this.refresh_rows();
                return;
            }

            if (name === 'data_source') {
                this.data_source = value;
                this.refresh_rows();
                return;
            }

            if (name === 'selection') {
                this.selection = value;
                this._sync_table_selection(value);
            }
        };
        this.model.on('change', this._model_change_handler);
    }

    /**
     * Adopt the restored static Data_Table model without replacing the
     * server-rendered rows during initial activation.
     * @private
     */
    _adopt_reattached_table_state() {
        const table = this.table;
        if (!table || !table._persist_activation_state) return;

        this.columns = Array.isArray(table.columns) ? table.columns : [];
        this.data_source = Array.isArray(table.rows) ? table.rows : [];
        this.sort_state = table.sort_state || null;
        this.filters = table.filters || null;
        this.page = table.page || 1;
        this.page_size = table.page_size || null;
        this._selection_mode = table.selection_mode || 'none';
        const selected = typeof table.get_selected_rows === 'function'
            ? table.get_selected_rows()
            : [];
        const selected_index = selected.length ? selected[selected.length - 1] : null;
        this.selection = selected_index === null
            ? null
            : {
                row_index: selected_index,
                row_data: Array.isArray(table.visible_rows) ? table.visible_rows[selected_index] : null
            };

        if (!this.model || typeof this.model.set !== 'function') return;
        this._adopting_table_state = true;
        const write_state = () => {
            this.model.set('columns', this.columns);
            this.model.set('data_source', this.data_source);
            this.model.set('sort_state', this.sort_state);
            this.model.set('filters', this.filters);
            this.model.set('page', this.page);
            this.model.set('page_size', this.page_size);
            this.model.set('selection', this.selection);
        };
        if (typeof this.model.batch === 'function') this.model.batch(write_state);
        else write_state();
        this._adopting_table_state = false;
    }

    /**
     * Set a value on the model.
     * @param {string} name - Property name.
     * @param {*} value - Property value.
     */
    set_model_value(name, value) {
        if (this.model && typeof this.model.set === 'function') {
            this.model.set(name, value);
        } else if (this.model) {
            this.model[name] = value;
        }
    }

    _write_model_values(values) {
        if (!this.model || typeof this.model.set !== 'function') return;
        this._model_sync_suspended = true;
        try {
            const write_values = () => {
                Object.keys(values).forEach(name => this.model.set(name, values[name]));
            };
            if (typeof this.model.batch === 'function') this.model.batch(write_values);
            else write_values();
        } finally {
            this._model_sync_suspended = false;
        }
    }

    _set_selection_state(selection, options = {}) {
        const next_selection = selection && Number.isInteger(Number(selection.row_index))
            ? {
                row_index: Number(selection.row_index),
                row_data: selection.row_data
            }
            : null;
        this.selection = next_selection;
        this._write_model_values({ selection: next_selection });
        if (options.sync_table !== false) this._sync_table_selection(next_selection);
    }

    _sync_table_selection(selection) {
        const table = this.table;
        if (!table || !table.selected_rows || table.selection_mode === 'none') return;
        const next_index = selection && Number.isInteger(Number(selection.row_index))
            ? Number(selection.row_index)
            : null;
        const current = typeof table.get_selected_rows === 'function'
            ? table.get_selected_rows()
            : [];
        if ((next_index === null && current.length === 0)
            || (next_index !== null && current.length === 1 && current[0] === next_index)) {
            return;
        }

        this._syncing_table_selection = true;
        try {
            table.selected_rows.clear();
            if (next_index !== null && next_index >= 0
                && Array.isArray(table.visible_rows) && next_index < table.visible_rows.length) {
                table.selected_rows.add(String(next_index));
                table.last_selected_index = next_index;
                table._selection_anchor = next_index;
            } else {
                table.last_selected_index = null;
                table._selection_anchor = null;
            }
            if (typeof table.set_model_value === 'function') {
                table.set_model_value('selected_row_indices', table.get_selected_rows());
            }
            if (typeof table.render_table === 'function') table.render_table();
        } finally {
            this._syncing_table_selection = false;
        }
    }

    _reconcile_selection() {
        if (!this.selection || !this.table || !Array.isArray(this.table.visible_rows)) {
            this._sync_table_selection(this.selection);
            return;
        }
        const visible_rows = this.table.visible_rows;
        let row_index = this.selection.row_data == null
            ? Number(this.selection.row_index)
            : visible_rows.indexOf(this.selection.row_data);
        if (!Number.isInteger(row_index) || row_index < 0 || row_index >= visible_rows.length) {
            this._set_selection_state(null);
            return;
        }
        const row_data = visible_rows[row_index];
        if (row_index !== this.selection.row_index || row_data !== this.selection.row_data) {
            this._set_selection_state({ row_index, row_data });
            return;
        }
        this._sync_table_selection(this.selection);
    }

    /**
     * Replace the data source and trigger a refresh.
     * @param {Array|Function|Object} data_source - New data source.
     */
    set_data_source(data_source) {
        this.data_source = data_source;
        this._write_model_values({ data_source });
        if (this._model_change_handler && !this._destroyed) this.refresh_rows();
    }

    /**
     * Replace column definitions.
     * @param {Array<string|Object>} columns - New column definitions.
     */
    set_columns(columns) {
        const normalized = normalize_columns(columns);
        this.columns = normalized;
        this._write_model_values({ columns: normalized });
        if (this.table) this.table.set_columns(normalized);
    }

    /**
     * Set sort state and trigger refresh if data source is async.
     * @param {{key: string, direction: 'asc'|'desc'}|null} sort_state - Sort state.
     */
    set_sort_state(sort_state, options = {}) {
        const next_sort_state = sort_state ? { ...sort_state } : null;
        const previous_page = Math.max(1, Math.trunc(Number(this.page)) || 1);
        this.sort_state = next_sort_state;
        this.page = 1;
        this._write_model_values({ sort_state: next_sort_state, page: 1 });
        if (this.table && options.source_table !== true) {
            this.table.set_sort_state(next_sort_state);
        } else if (this.table) {
            this.table.set_page(1, { silent: true });
        }
        if (this._model_change_handler && !this._destroyed) {
            this.refresh_rows();
        }
        if (previous_page !== 1 && options.silent !== true) {
            this.raise('page_change', { page: 1, previous_page, reason: 'sort' });
        }
    }

    /**
     * Set filter map and trigger refresh if data source is async.
     * @param {Object|null} filters - Filter map `{column_key: filter_value}`.
     */
    set_filters(filters) {
        const next_filters = filters ? { ...filters } : null;
        const previous_page = Math.max(1, Math.trunc(Number(this.page)) || 1);
        this.filters = next_filters;
        this.page = 1;
        this._write_model_values({ filters: next_filters, page: 1 });
        if (this.table) this.table.set_filters(next_filters);
        if (this._model_change_handler && !this._destroyed) {
            this.refresh_rows();
        }
        if (previous_page !== 1) {
            this.raise('page_change', { page: 1, previous_page, reason: 'filter' });
        }
    }

    /**
     * Navigate to a specific page (1-based).
     * @param {number} page - Page number.
     */
    set_page(page, options = {}) {
        const next_page = Math.max(1, Math.trunc(Number(page)) || 1);
        const previous_page = Math.max(1, Math.trunc(Number(this.page)) || 1);
        this.page = next_page;
        this._write_model_values({ page: next_page });
        if (this.table && options.source_table !== true) {
            this.table.set_page(next_page, { silent: true });
        }
        if (this._model_change_handler && !this._destroyed) {
            this.refresh_rows();
        }
        if (next_page !== previous_page && options.silent !== true) {
            this.raise('page_change', { page: next_page, previous_page });
        }
    }

    /**
     * Set rows per page.
     * @param {number|null} page_size - Page size, or null for no paging.
     */
    set_page_size(page_size) {
        const next_page_size = page_size ? Number(page_size) : null;
        this.page_size = next_page_size;
        this._write_model_values({ page_size: next_page_size });
        if (this.table) this.table.set_page_size(next_page_size);
        if (this._model_change_handler && !this._destroyed) {
            this.refresh_rows();
        }
    }

    /**
     * Programmatically set row selection.
     * @param {{row_index: number, row_data: Object}|null} selection - Selection state.
     */
    set_selection(selection) {
        this._set_selection_state(selection);
    }

    /**
     * Get current row selection.
     * @returns {{row_index: number, row_data: Object}|null}
     */
    get_selection() {
        return this.selection;
    }

    /**
     * Current total count from server (null if client-side).
     * @type {number|null}
     */
    get total_count_value() {
        return this.total_count;
    }

    /**
     * Refresh rows from the data source with current parameters.
     *
     * For async data sources, sets loading state during the pending promise.
     * Handles stale request cancellation — only the latest request's result
     * is applied.
     *
     * @fires Data_Grid#load_complete On successful async load.
     * @fires Data_Grid#error On failed async load.
     */
    refresh_rows() {
        if (this._destroyed) return;
        const data_source = this.data_source;
        const params = {
            columns: this.columns,
            sort_state: this.sort_state,
            filters: this.filters,
            page: this.page,
            page_size: this.page_size
        };

        let rows = [];
        try {
            if (Array.isArray(data_source)) {
                rows = data_source;
            } else if (typeof data_source === 'function') {
                rows = data_source(params);
            } else if (data_source && typeof data_source.get_rows === 'function') {
                rows = data_source.get_rows(params);
            } else if (data_source && Array.isArray(data_source.rows)) {
                rows = data_source.rows;
            }
        } catch (error) {
            this.remove_class('loading');
            this.dom.attributes['aria-busy'] = 'false';
            this.add_class('error');
            const message = error && error.message ? error.message : String(error);
            this._show_error(message);
            this.raise('error', { message, error });
            return;
        }

        if (rows && typeof rows.then === 'function') {
            const request_id = (this._request_id || 0) + 1;
            this._request_id = request_id;

            // Loading state + ARIA busy indicator
            this.add_class('loading');
            this.remove_class('empty');
            this.dom.attributes['aria-busy'] = 'true';
            this._clear_error();
            this._clear_empty();

            rows.then(result => {
                if (this._destroyed || this._request_id !== request_id) return;
                this.remove_class('loading');
                this.dom.attributes['aria-busy'] = 'false';

                // Handle {rows, total_count} response objects
                let resolved_rows;
                let total_count = null;
                if (result && !Array.isArray(result) && Array.isArray(result.rows)) {
                    resolved_rows = result.rows;
                    total_count = (result.total_count != null) ? Number(result.total_count) : null;
                } else {
                    resolved_rows = Array.isArray(result) ? result : [];
                }

                this.total_count = total_count;
                this.set_model_value('total_count', total_count);

                // When total_count is present, enable server_side mode on table
                if (this.table) {
                    if (typeof this.table.set_server_side === 'function') {
                        this.table.set_server_side(total_count != null);
                    }
                    if (total_count != null) {
                        this.table.set_model_value('total_count', total_count);
                    }
                    this.table.set_rows(resolved_rows);
                }
                this._reconcile_selection();

                // Empty state
                if (resolved_rows.length === 0) {
                    this._show_empty();
                } else {
                    this._clear_empty();
                }

                /** @event Data_Grid#load_complete */
                this.raise('load_complete', { rows: resolved_rows, total_count });
            }).catch(err => {
                if (this._destroyed || this._request_id !== request_id) return;
                this.remove_class('loading');
                this.dom.attributes['aria-busy'] = 'false';
                this.add_class('error');
                const msg = err && err.message ? err.message : String(err);
                this._show_error(msg);

                /** @event Data_Grid#error */
                this.raise('error', { message: msg, error: err });
            });
        } else {
            // Synchronous data — no loading state needed
            this._clear_error();
            this.total_count = null;
            this.set_model_value('total_count', null);
            const resolved_rows = Array.isArray(rows) ? rows : [];
            if (this.table) {
                if (typeof this.table.set_server_side === 'function') {
                    this.table.set_server_side(false);
                }
                this.table.set_rows(resolved_rows);
            }
            this._reconcile_selection();

            // Empty state
            if (resolved_rows.length === 0) {
                this._show_empty();
            } else {
                this._clear_empty();
            }
        }
    }

    /**
     * Public refresh alias for cleaner API.
     * @returns {void}
     */
    refresh() {
        return this.refresh_rows();
    }

    /**
     * Display an error message inside the grid.
     * @param {string} msg - Error message to display.
     * @private
     */
    _show_error(msg) {
        if (!this._error_ctrl) {
            const { context } = this;
            const err_ctrl = new Control({ context, tag_name: 'div' });
            err_ctrl.add_class('data-grid-error');
            err_ctrl.dom.attributes['aria-live'] = 'assertive';
            err_ctrl.dom.attributes.role = 'alert';
            this._error_ctrl = err_ctrl;
            this.add(err_ctrl);
        }
        this._error_ctrl.content.clear();
        this._error_ctrl.add(msg || 'An error occurred');
    }

    /**
     * Clear any displayed error.
     * @private
     */
    _clear_error() {
        this.remove_class('error');
        if (this._error_ctrl) {
            this._error_ctrl.content.clear();
        }
    }

    /**
     * Display empty state message.
     * @private
     */
    _show_empty() {
        this.add_class('empty');
        if (!this._empty_ctrl) {
            const { context } = this;
            const empty_ctrl = new Control({ context, tag_name: 'div' });
            empty_ctrl.add_class('data-grid-empty');
            empty_ctrl.dom.attributes['aria-live'] = 'polite';
            this._empty_ctrl = empty_ctrl;
            this.add(empty_ctrl);
        }
        this._empty_ctrl.content.clear();
        this._empty_ctrl.add(this._empty_text);
    }

    /**
     * Clear empty state display.
     * @private
     */
    _clear_empty() {
        this.remove_class('empty');
        if (this._empty_ctrl) {
            this._empty_ctrl.content.clear();
        }
    }

    activate() {
        if (this.__active) return;
        super.activate();

        if (!this.table && this._ctrl_fields && this._ctrl_fields.table) {
            this.table = this._ctrl_fields.table;
        }
        if (!this.table) return;

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.table = this.table;
        this._adopt_reattached_table_state();
        this._bind_table_events();
        this._sync_table_selection(this.selection);
    }

    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this._request_id += 1;
        this._unbind_table_events();
        if (this.model && this._model_change_handler && typeof this.model.off === 'function') {
            this.model.off('change', this._model_change_handler);
        }
        this._model_change_handler = null;
        if (this.table && typeof this.table.destroy === 'function') {
            this.table.destroy();
        }
        if (typeof super.destroy === 'function') super.destroy();
    }
}

Data_Grid.css = `
.data-grid {
    width: 100%;
    position: relative;
}
.data-grid.loading {
    opacity: 0.55;
    pointer-events: none;
    transition: opacity 150ms ease-out;
}
.data-grid.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    margin: -12px 0 0 -12px;
    border: 3px solid var(--j-border, #555);
    border-top-color: var(--j-primary, #5b9bd5);
    border-radius: 50%;
    animation: data-grid-spin 0.6s linear infinite;
    pointer-events: none;
    z-index: 10;
}
@keyframes data-grid-spin {
    to { transform: rotate(360deg); }
}
.data-grid.error .data-grid-error {
    padding: var(--j-space-3, 12px);
    color: var(--j-danger, #cd3131);
    font-size: var(--j-text-sm, 0.875rem);
    text-align: center;
}
.data-grid.empty .data-grid-empty {
    padding: var(--j-space-3, 12px) var(--j-space-2, 8px);
    color: var(--j-fg-muted, #888);
    font-size: var(--j-text-sm, 0.875rem);
    font-style: italic;
    text-align: center;
}
`;

module.exports = Data_Grid;
