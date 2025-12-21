const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');

const normalize_columns = columns => {
    if (!Array.isArray(columns)) return [];
    return columns.map((column, index) => {
        if (typeof column === 'string') {
            return { key: column, label: column };
        }
        if (column && typeof column === 'object') {
            const key = is_defined(column.key) ? column.key : index;
            return {
                key,
                label: is_defined(column.label) ? column.label : String(key),
                accessor: column.accessor
            };
        }
        return { key: index, label: String(column) };
    });
};

const get_node_id = (node, fallback) => {
    if (is_defined(node.id)) return String(node.id);
    if (is_defined(node.__tree_table_id)) return String(node.__tree_table_id);
    if (is_defined(fallback)) {
        node.__tree_table_id = String(fallback);
        return node.__tree_table_id;
    }
    return undefined;
};

const flatten_nodes = (nodes, expanded_ids, depth = 0, results = [], parent_key = '') => {
    nodes.forEach((node, index) => {
        const node_key = parent_key ? `${parent_key}-${index}` : String(index);
        const node_id = get_node_id(node, node_key);
        results.push({ node, depth, node_id });
        const is_expanded = node_id && expanded_ids.includes(node_id);
        if (is_expanded && Array.isArray(node.children)) {
            flatten_nodes(node.children, expanded_ids, depth + 1, results, node_key);
        }
    });
    return results;
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

class Tree_Table extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'tree_table';
        super(spec);
        this.add_class('tree-table');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this.set_columns(spec.columns || []);
        this.set_rows(spec.rows || []);
        this.set_expanded_ids(spec.expanded_ids || []);

        if (!spec.el) {
            this.compose_tree_table();
        }

        this.bind_model();
    }

    compose_tree_table() {
        const { context } = this;

        const head_ctrl = new Control({ context, tag_name: 'div' });
        head_ctrl.add_class('tree-table-head');

        const body_ctrl = new Control({ context, tag_name: 'div' });
        body_ctrl.add_class('tree-table-body');

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
            if (name === 'columns' || name === 'rows' || name === 'expanded_ids') {
                if (name === 'columns') {
                    this.columns = normalize_columns(e_change.value);
                    if (this.model && typeof this.model.set === 'function') {
                        this.model.set('columns', this.columns, true);
                    }
                } else if (name === 'rows') {
                    this.rows = Array.isArray(e_change.value) ? e_change.value : [];
                } else if (name === 'expanded_ids') {
                    this.expanded_ids = Array.isArray(e_change.value) ? e_change.value.map(String) : [];
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
     * Set table columns.
     * @param {Array} columns - Columns to set.
     */
    set_columns(columns) {
        const normalized = normalize_columns(columns);
        this.set_model_value('columns', normalized);
        this.columns = normalized;
    }

    /**
     * Set tree rows.
     * @param {Array} rows - Rows to set.
     */
    set_rows(rows) {
        const row_list = Array.isArray(rows) ? rows.slice() : [];
        this.set_model_value('rows', row_list);
        this.rows = row_list;
    }

    /**
     * Set expanded node ids.
     * @param {Array} expanded_ids - Expanded ids.
     */
    set_expanded_ids(expanded_ids) {
        const ids = Array.isArray(expanded_ids) ? expanded_ids.map(String) : [];
        this.set_model_value('expanded_ids', ids);
        this.expanded_ids = ids;
    }

    /**
     * Check whether a node id is expanded.
     * @param {*} node_id - Node id to check.
     * @returns {boolean}
     */
    is_expanded(node_id) {
        return this.expanded_ids && this.expanded_ids.includes(String(node_id));
    }

    /**
     * Toggle a node id.
     * @param {*} node_id - Node id to toggle.
     */
    toggle_node(node_id) {
        const id = String(node_id);
        const expanded_ids = this.expanded_ids ? this.expanded_ids.slice() : [];
        const index = expanded_ids.indexOf(id);
        if (index >= 0) {
            expanded_ids.splice(index, 1);
        } else {
            expanded_ids.push(id);
        }
        this.set_expanded_ids(expanded_ids);
    }

    /**
     * Get visible flattened nodes.
     * @returns {Array}
     */
    get_visible_nodes() {
        return this.visible_nodes || [];
    }

    render_table() {
        const head_ctrl = this._ctrl_fields && this._ctrl_fields.head;
        const body_ctrl = this._ctrl_fields && this._ctrl_fields.body;
        if (!head_ctrl || !body_ctrl) return;

        const columns = this.columns || [];
        head_ctrl.clear();

        const header_row = new Control({ context: this.context, tag_name: 'div' });
        header_row.add_class('tree-table-row');
        header_row.add_class('tree-table-header-row');

        columns.forEach(column => {
            const cell_ctrl = new Control({ context: this.context, tag_name: 'div' });
            cell_ctrl.add_class('tree-table-cell');
            cell_ctrl.add_class('tree-table-header');
            cell_ctrl.add(column.label || String(column.key));
            header_row.add(cell_ctrl);
        });

        head_ctrl.add(header_row);

        body_ctrl.clear();
        const flattened = flatten_nodes(this.rows || [], this.expanded_ids || []);
        this.visible_nodes = flattened;

        flattened.forEach((entry, row_index) => {
            const { node, depth, node_id } = entry;
            const row_ctrl = new Control({ context: this.context, tag_name: 'div' });
            row_ctrl.add_class('tree-table-row');
            row_ctrl.dom.attributes['data-node-index'] = String(row_index);
            if (is_defined(node_id)) {
                row_ctrl.dom.attributes['data-node-id'] = String(node_id);
            }

            columns.forEach((column, column_index) => {
                const cell_ctrl = new Control({ context: this.context, tag_name: 'div' });
                cell_ctrl.add_class('tree-table-cell');

                if (column_index === 0) {
                    const indent_ctrl = new Control({ context: this.context, tag_name: 'span' });
                    indent_ctrl.add_class('tree-table-indent');
                    indent_ctrl.dom.attributes.style['padding-left'] = `${depth * 16}px`;

                    if (Array.isArray(node.children) && node.children.length) {
                        const toggle_ctrl = new Control({ context: this.context, tag_name: 'button' });
                        toggle_ctrl.dom.attributes.type = 'button';
                        toggle_ctrl.add_class('tree-table-toggle');
                        toggle_ctrl.dom.attributes['data-toggle-id'] = String(node_id);
                        toggle_ctrl.dom.attributes['aria-expanded'] = this.is_expanded(node_id) ? 'true' : 'false';
                        toggle_ctrl.add(this.is_expanded(node_id) ? '-' : '+');
                        indent_ctrl.add(toggle_ctrl);
                    }

                    const label_ctrl = new Control({ context: this.context, tag_name: 'span' });
                    label_ctrl.add_class('tree-table-label');
                    const label_value = is_defined(node.label)
                        ? node.label
                        : get_cell_value(node, column, column_index);
                    if (is_defined(label_value)) label_ctrl.add(String(label_value));
                    indent_ctrl.add(label_ctrl);
                    cell_ctrl.add(indent_ctrl);
                } else {
                    let value;
                    if (typeof column.accessor === 'function') {
                        value = column.accessor(node);
                    } else {
                        value = get_cell_value(node, column, column_index);
                    }
                    if (is_defined(value)) cell_ctrl.add(String(value));
                }

                row_ctrl.add(cell_ctrl);
            });

            body_ctrl.add(row_ctrl);
        });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const body_ctrl = this._ctrl_fields && this._ctrl_fields.body;
            if (!body_ctrl || !body_ctrl.dom.el) return;

            body_ctrl.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target || !target.getAttribute) return;
                const toggle_id = target.getAttribute('data-toggle-id');
                if (is_defined(toggle_id)) {
                    this.toggle_node(toggle_id);
                    return;
                }
            });
        }
    }
}

Tree_Table.css = `
.tree-table {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.tree-table-row {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 12px;
    padding: 4px 0;
}
.tree-table-header {
    font-weight: 600;
}
.tree-table-toggle {
    margin-right: 6px;
}
`;

module.exports = Tree_Table;
