const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');

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
            return {
                key,
                label: is_defined(column.label) ? column.label : String(key),
                sortable: column.sortable !== false,
                accessor: column.accessor,
                render: column.render
            };
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

class Data_Table extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_table';
        super(spec);
        this.add_class('data-table');
        this.add_class('jsgui-data-table');
        this.dom.tagName = 'table';

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }
        if (spec.compact) this.add_class('data-table-compact');
        if (spec.bordered) this.add_class('data-table-bordered');
        if (spec.striped !== false) this.add_class('data-table-striped');

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this.set_columns(spec.columns || []);
        this.set_rows(spec.rows || []);
        this.set_sort_state(spec.sort_state || null);
        this.set_filters(spec.filters || null);
        this.set_page(is_defined(spec.page) ? spec.page : 1);
        this.set_page_size(spec.page_size || null);

        if (!spec.el) {
            this.compose();
        }

        this.bind_model();
    }


    compose() {
        const { context } = this;
        const head_ctrl = new Control({ context, tag_name: 'thead' });
        const body_ctrl = new Control({ context, tag_name: 'tbody' });

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.head = head_ctrl;
        this._ctrl_fields.body = body_ctrl;

        this.add(head_ctrl);
        this.add(body_ctrl);

        this.render_table();
    }

    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            const name = e_change.name;
            const value = e_change.value;
            if (
                name === 'columns' ||
                name === 'rows' ||
                name === 'sort_state' ||
                name === 'filters' ||
                name === 'page' ||
                name === 'page_size'
            ) {
                if (name === 'columns') {
                    this.columns = normalize_columns(value);
                    if (this.model && typeof this.model.set === 'function') {
                        this.model.set('columns', this.columns, true);
                    }
                } else if (name === 'rows') {
                    this.rows = Array.isArray(value) ? value : [];
                } else if (name === 'sort_state') {
                    this.sort_state = value ? { ...value } : null;
                } else if (name === 'filters') {
                    this.filters = value ? { ...value } : null;
                } else if (name === 'page') {
                    this.page = Number(value) || 1;
                } else if (name === 'page_size') {
                    this.page_size = value ? Number(value) : null;
                }
                this.render_table();
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
     * Set table rows.
     * @param {Array} rows - Rows to set.
     */
    set_rows(rows) {
        const row_list = Array.isArray(rows) ? rows.slice() : [];
        this.set_model_value('rows', row_list);
        this.rows = row_list;
    }

    /**
     * Set table columns.
     * @param {Array} columns - Columns to set.
     */
    set_columns(columns) {
        const normalized = normalize_columns(columns);
        this.set_model_value('columns', normalized);
        this.columns = normalized;
    }

    /**
     * Set sort state.
     * @param {Object|null} sort_state - Sort state object.
     */
    set_sort_state(sort_state) {
        const next_sort_state = sort_state ? { ...sort_state } : null;
        this.set_model_value('sort_state', next_sort_state);
        this.sort_state = next_sort_state;
    }

    /**
     * Set filters.
     * @param {Object|null} filters - Filters to set.
     */
    set_filters(filters) {
        const next_filters = filters ? { ...filters } : null;
        this.set_model_value('filters', next_filters);
        this.filters = next_filters;
    }

    /**
     * Set current page.
     * @param {number} page - Page number.
     */
    set_page(page) {
        const next_page = Number(page) || 1;
        this.set_model_value('page', next_page);
        this.page = next_page;
    }

    /**
     * Set page size.
     * @param {number|null} page_size - Page size.
     */
    set_page_size(page_size) {
        const next_page_size = page_size ? Number(page_size) : null;
        this.set_model_value('page_size', next_page_size);
        this.page_size = next_page_size;
    }

    /**
     * Get visible rows after sort/filter/paging.
     * @returns {Array}
     */
    get_visible_rows() {
        return this.visible_rows || [];
    }

    /**
     * Filter rows based on filters.
     * @param {Array} rows - Rows to filter.
     * @returns {Array}
     */
    get_filtered_rows(rows) {
        if (!this.filters) return rows;
        return rows.filter(row => {
            return Object.keys(this.filters).every(key => {
                const filter_value = this.filters[key];
                if (typeof filter_value === 'function') {
                    return filter_value(row);
                }
                if (!is_defined(filter_value) || filter_value === '') return true;
                const cell_value = row && typeof row === 'object' ? row[key] : undefined;
                return String(cell_value || '').includes(String(filter_value));
            });
        });
    }

    /**
     * Sort rows based on sort state.
     * @param {Array} rows - Rows to sort.
     * @returns {Array}
     */
    get_sorted_rows(rows) {
        if (!this.sort_state || !is_defined(this.sort_state.key)) return rows;
        const sort_key = this.sort_state.key;
        const direction = this.sort_state.direction === 'desc' ? 'desc' : 'asc';
        const column_index = this.columns.findIndex(column => String(column.key) === String(sort_key));
        if (column_index < 0) return rows;
        const column = this.columns[column_index];

        const sorted = rows.slice().sort((left, right) => {
            const left_value = get_cell_value(left, column, column_index);
            const right_value = get_cell_value(right, column, column_index);
            const cmp = compare_values(left_value, right_value);
            return direction === 'desc' ? -cmp : cmp;
        });

        return sorted;
    }

    /**
     * Paginate rows based on page settings.
     * @param {Array} rows - Rows to page.
     * @returns {Array}
     */
    get_paged_rows(rows) {
        if (!this.page_size) return rows;
        const page = Math.max(1, this.page || 1);
        const start_index = (page - 1) * this.page_size;
        return rows.slice(start_index, start_index + this.page_size);
    }

    render_table() {
        const head_ctrl = this._ctrl_fields && this._ctrl_fields.head;
        const body_ctrl = this._ctrl_fields && this._ctrl_fields.body;
        if (!head_ctrl || !body_ctrl) return;

        const columns = this.columns || [];
        const rows = this.rows || [];
        const sort_key = this.sort_state && this.sort_state.key;
        const sort_direction = this.sort_state && this.sort_state.direction === 'desc' ? 'descending' : 'ascending';

        head_ctrl.clear();
        const header_row = new Control({ context: this.context, tag_name: 'tr' });

        columns.forEach(column => {
            const th_ctrl = new Control({ context: this.context, tag_name: 'th' });
            th_ctrl.add_class('data-table-header');
            th_ctrl.dom.attributes['data-column-key'] = String(column.key);
            th_ctrl.dom.attributes.scope = 'col';
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
            header_row.add(th_ctrl);
        });

        head_ctrl.add(header_row);

        body_ctrl.clear();
        const filtered_rows = this.get_filtered_rows(rows);
        const sorted_rows = this.get_sorted_rows(filtered_rows);
        const visible_rows = this.get_paged_rows(sorted_rows);
        this.visible_rows = visible_rows;

        visible_rows.forEach((row, row_index) => {
            const tr_ctrl = new Control({ context: this.context, tag_name: 'tr' });
            tr_ctrl.add_class('data-table-row');
            tr_ctrl.dom.attributes['data-row-index'] = String(row_index);

            columns.forEach((column, column_index) => {
                const td_ctrl = new Control({ context: this.context, tag_name: 'td' });
                td_ctrl.add_class('data-table-cell');

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

            body_ctrl.add(tr_ctrl);
        });
    }

    activate() {
        if (!this.__active) {
            super.activate();

            if (!this.dom.el) return;

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
                        const row_data = this.visible_rows && this.visible_rows[row_index];
                        this.raise('row_click', { row_index, row_data });
                    }
                }
            });

            this.add_dom_event_listener('keydown', e_key => {
                const header_el = find_header_el(e_key.target);
                if (!header_el) return;
                const key = e_key.key || e_key.keyCode;
                if (key !== 'Enter' && key !== ' ' && key !== 13 && key !== 32) return;
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
            });
        }
    }
}

Data_Table.css = `
/* ─── Data_Table ─── */
.jsgui-data-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--admin-font, 'Segoe UI', -apple-system, sans-serif);
    font-size: var(--admin-font-size, 13px);
    color: var(--admin-text, #1e1e1e);
    background: var(--admin-card-bg, #fff);
}

/* Header */
.data-table-header {
    text-align: left;
    font-weight: 600;
    padding: var(--admin-cell-padding, 8px 12px);
    border-bottom: 2px solid var(--admin-border, #e0e0e0);
    background: var(--admin-header-bg, #f8f8f8);
    color: var(--admin-header-text, #616161);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    user-select: none;
    position: relative;
}
.data-table-header.is-sortable {
    cursor: pointer;
    padding-right: 22px;
    transition: color 0.1s;
}
.data-table-header.is-sortable:hover {
    color: var(--admin-text, #1e1e1e);
}
.data-table-header.is-sortable:focus-visible {
    outline: 2px solid var(--admin-accent, #0078d4);
    outline-offset: -2px;
    border-radius: 2px;
}

/* Sort indicators */
.data-table-header[aria-sort="ascending"]::after {
    content: ' ▲';
    font-size: 9px;
    color: var(--admin-accent, #0078d4);
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
}
.data-table-header[aria-sort="descending"]::after {
    content: ' ▼';
    font-size: 9px;
    color: var(--admin-accent, #0078d4);
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
}
.data-table-header[aria-sort="none"]::after {
    content: ' ⇅';
    font-size: 9px;
    color: var(--admin-text-muted, #9e9e9e);
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.1s;
}
.data-table-header.is-sortable:hover[aria-sort="none"]::after {
    opacity: 0.5;
}

/* Rows */
.data-table-row {
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
    transition: background-color 0.08s;
    height: var(--admin-row-height, 36px);
}
.data-table-row:last-child {
    border-bottom: none;
}
.data-table-row:hover {
    background: var(--admin-hover-bg, #e8e8e8);
}

/* Striped rows */
.data-table-striped .data-table-row:nth-child(even) {
    background: var(--admin-stripe-bg, #f8f8f8);
}
.data-table-striped .data-table-row:nth-child(even):hover {
    background: var(--admin-hover-bg, #e8e8e8);
}

/* Cells */
.data-table-cell {
    padding: var(--admin-cell-padding, 8px 12px);
    vertical-align: middle;
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
}

/* Bordered variant */
.data-table-bordered .data-table-cell,
.data-table-bordered .data-table-header {
    border: 1px solid var(--admin-border, #e0e0e0);
}

/* Compact variant */
.data-table-compact .data-table-header,
.data-table-compact .data-table-cell {
    padding: 4px 8px;
}
.data-table-compact .data-table-row {
    height: 28px;
}
`;

module.exports = Data_Table;
