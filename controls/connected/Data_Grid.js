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

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this._empty_text = spec.empty_text || 'No data available';

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
        this.refresh_rows();
    }

    /**
     * Compose the inner Data_Table and wire events.
     * @private
     */
    compose_grid() {
        const { context } = this;
        const table = new Data_Table({
            context,
            columns: this.columns,
            rows: []
        });
        table.add_class('data-grid-table');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.table = table;
        this.table = table;
        this.add(table);

        table.on('row_click', e_row => {
            this.set_selection({
                row_index: e_row.row_index,
                row_data: e_row.row_data
            });
            this.raise('selection_change', { selection: this.selection });
        });

        table.on('sort_change', e_sort => {
            if (e_sort && e_sort.sort_state) {
                this.set_sort_state(e_sort.sort_state);
            }
        });
    }

    /**
     * Bind model change listeners for reactive updates.
     * @private
     */
    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            const name = e_change.name;
            const value = e_change.value;

            if (name === 'columns') {
                this.columns = normalize_columns(value);
                if (this.table) this.table.set_columns(this.columns);
                return;
            }

            if (name === 'sort_state') {
                this.sort_state = value ? { ...value } : null;
                if (this.table) this.table.set_sort_state(this.sort_state);
                this.refresh_rows();
                return;
            }

            if (name === 'filters') {
                this.filters = value ? { ...value } : null;
                if (this.table) this.table.set_filters(this.filters);
                this.refresh_rows();
                return;
            }

            if (name === 'page') {
                this.page = Number(value) || 1;
                if (this.table) this.table.set_page(this.page);
                this.refresh_rows();
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
            }
        });
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

    /**
     * Replace the data source and trigger a refresh.
     * @param {Array|Function|Object} data_source - New data source.
     */
    set_data_source(data_source) {
        this.set_model_value('data_source', data_source);
        this.data_source = data_source;
    }

    /**
     * Replace column definitions.
     * @param {Array<string|Object>} columns - New column definitions.
     */
    set_columns(columns) {
        const normalized = normalize_columns(columns);
        this.set_model_value('columns', normalized);
        this.columns = normalized;
        if (this.table) this.table.set_columns(normalized);
    }

    /**
     * Set sort state and trigger refresh if data source is async.
     * @param {{key: string, direction: 'asc'|'desc'}|null} sort_state - Sort state.
     */
    set_sort_state(sort_state) {
        const next_sort_state = sort_state ? { ...sort_state } : null;
        this.set_model_value('sort_state', next_sort_state);
        this.sort_state = next_sort_state;
        if (this.table) this.table.set_sort_state(next_sort_state);
    }

    /**
     * Set filter map and trigger refresh if data source is async.
     * @param {Object|null} filters - Filter map `{column_key: filter_value}`.
     */
    set_filters(filters) {
        const next_filters = filters ? { ...filters } : null;
        this.set_model_value('filters', next_filters);
        this.filters = next_filters;
        if (this.table) this.table.set_filters(next_filters);
    }

    /**
     * Navigate to a specific page (1-based).
     * @param {number} page - Page number.
     */
    set_page(page) {
        const next_page = Number(page) || 1;
        this.set_model_value('page', next_page);
        this.page = next_page;
        if (this.table) this.table.set_page(next_page);
    }

    /**
     * Set rows per page.
     * @param {number|null} page_size - Page size, or null for no paging.
     */
    set_page_size(page_size) {
        const next_page_size = page_size ? Number(page_size) : null;
        this.set_model_value('page_size', next_page_size);
        this.page_size = next_page_size;
        if (this.table) this.table.set_page_size(next_page_size);
    }

    /**
     * Programmatically set row selection.
     * @param {{row_index: number, row_data: Object}|null} selection - Selection state.
     */
    set_selection(selection) {
        this.set_model_value('selection', selection);
        this.selection = selection;
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
        const data_source = this.data_source;
        const params = {
            columns: this.columns,
            sort_state: this.sort_state,
            filters: this.filters,
            page: this.page,
            page_size: this.page_size
        };

        let rows = [];
        if (Array.isArray(data_source)) {
            rows = data_source;
        } else if (typeof data_source === 'function') {
            rows = data_source(params);
        } else if (data_source && typeof data_source.get_rows === 'function') {
            rows = data_source.get_rows(params);
        } else if (data_source && Array.isArray(data_source.rows)) {
            rows = data_source.rows;
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
                if (this._request_id !== request_id) return;
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

                // Empty state
                if (resolved_rows.length === 0) {
                    this._show_empty();
                } else {
                    this._clear_empty();
                }

                /** @event Data_Grid#load_complete */
                this.raise('load_complete', { rows: resolved_rows, total_count });
            }).catch(err => {
                if (this._request_id !== request_id) return;
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
