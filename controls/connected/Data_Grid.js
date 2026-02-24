const jsgui = require('../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../html-core/control_model_factory');
const Data_Table = require('../organised/1-standard/4-data/data_table');

const normalize_columns = columns => {
    if (!Array.isArray(columns)) return [];
    return columns.map(column => column);
};

class Data_Grid extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_grid';
        super(spec);
        this.add_class('data-grid');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

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

    set_model_value(name, value) {
        if (this.model && typeof this.model.set === 'function') {
            this.model.set(name, value);
        } else if (this.model) {
            this.model[name] = value;
        }
    }

    /**
     * Set data source.
     * @param {*} data_source - Source of rows.
     */
    set_data_source(data_source) {
        this.set_model_value('data_source', data_source);
        this.data_source = data_source;
    }

    /**
     * Set columns.
     * @param {Array} columns - Column definitions.
     */
    set_columns(columns) {
        const normalized = normalize_columns(columns);
        this.set_model_value('columns', normalized);
        this.columns = normalized;
        if (this.table) this.table.set_columns(normalized);
    }

    /**
     * Set sort state.
     * @param {Object|null} sort_state - Sort state.
     */
    set_sort_state(sort_state) {
        const next_sort_state = sort_state ? { ...sort_state } : null;
        this.set_model_value('sort_state', next_sort_state);
        this.sort_state = next_sort_state;
        if (this.table) this.table.set_sort_state(next_sort_state);
    }

    /**
     * Set filters.
     * @param {Object|null} filters - Filters to apply.
     */
    set_filters(filters) {
        const next_filters = filters ? { ...filters } : null;
        this.set_model_value('filters', next_filters);
        this.filters = next_filters;
        if (this.table) this.table.set_filters(next_filters);
    }

    /**
     * Set page.
     * @param {number} page - Page number.
     */
    set_page(page) {
        const next_page = Number(page) || 1;
        this.set_model_value('page', next_page);
        this.page = next_page;
        if (this.table) this.table.set_page(next_page);
    }

    /**
     * Set page size.
     * @param {number|null} page_size - Page size.
     */
    set_page_size(page_size) {
        const next_page_size = page_size ? Number(page_size) : null;
        this.set_model_value('page_size', next_page_size);
        this.page_size = next_page_size;
        if (this.table) this.table.set_page_size(next_page_size);
    }

    /**
     * Set selection.
     * @param {*} selection - Selection object.
     */
    set_selection(selection) {
        this.set_model_value('selection', selection);
        this.selection = selection;
    }

    /**
     * Get selection.
     * @returns {*}
     */
    get_selection() {
        return this.selection;
    }

    /**
     * Refresh rows from the data source.
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
            rows.then(result => {
                if (this._request_id !== request_id) return;
                const resolved_rows = Array.isArray(result) ? result : [];
                if (this.table) this.table.set_rows(resolved_rows);
            });
        } else {
            const resolved_rows = Array.isArray(rows) ? rows : [];
            if (this.table) this.table.set_rows(resolved_rows);
        }
    }
}

Data_Grid.css = `
.data-grid {
    width: 100%;
}
`;

module.exports = Data_Grid;
