/**
 * Data_Filter — Dynamic filter builder for tabular data.
 *
 * Lets users create one or more filter conditions (field + operator + value),
 * combine them, and apply them to a data array.
 *
 * Options:
 *   fields      — Array of { name, label?, type? } describing filterable columns
 *   filters     — Optional initial filters: [{ field, operator, value }]
 *   operators   — Optional custom operators map: { type: [{ value, label }] }
 *   theme       — Admin theme name
 *
 * API:
 *   add_filter()           — Add a blank filter row
 *   remove_filter(index)   — Remove a filter row by index
 *   get_filters()          — Returns array of { field, operator, value } descriptors
 *   clear()                — Remove all filter rows
 *   apply(data)            — Filter an array of objects, returns matching subset
 *
 * Events:
 *   'change' { filters }   — Fired when any filter is added, modified, or removed
 */
const Control = require('../../../../html-core/control');

const FILTER_STATE_ATTRIBUTE = 'data-jsgui-filter-state';
const MAX_FILTER_STATE_CHARACTERS = 32768;
const MAX_FILTER_FIELDS = 64;
const MAX_FILTER_ROWS = 64;

const is_json_safe = (value, seen = new Set(), depth = 0) => {
    if (depth > 20) return false;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'object' || seen.has(value)) return false;
    if (!Array.isArray(value)) {
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null) return false;
    }
    seen.add(value);
    const values = Array.isArray(value) ? value : Object.keys(value).map(key => value[key]);
    const safe = values.every(item => is_json_safe(item, seen, depth + 1));
    seen.delete(value);
    return safe;
};

const DEFAULT_OPERATORS = {
    string: [
        { value: 'contains', label: 'contains' },
        { value: 'equals', label: 'equals' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
        { value: 'not_equals', label: '≠' }
    ],
    number: [
        { value: 'equals', label: '=' },
        { value: 'not_equals', label: '≠' },
        { value: 'greater_than', label: '>' },
        { value: 'less_than', label: '<' },
        { value: 'greater_or_eq', label: '≥' },
        { value: 'less_or_eq', label: '≤' }
    ],
    boolean: [
        { value: 'equals', label: 'is' }
    ]
};

const read_filter_state = element => {
    if (!element || typeof element.getAttribute !== 'function') return null;
    const json = element.getAttribute(FILTER_STATE_ATTRIBUTE);
    if (!json || json.length > MAX_FILTER_STATE_CHARACTERS) return null;
    try {
        const state = JSON.parse(json);
        if (!state || state.version !== 1
            || !Array.isArray(state.fields) || state.fields.length > MAX_FILTER_FIELDS
            || !Array.isArray(state.filters) || state.filters.length > MAX_FILTER_ROWS) {
            return null;
        }
        return state;
    } catch (error) {
        return null;
    }
};

class Data_Filter extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_filter';
        const restored_state = read_filter_state(spec.el);
        const cfg_fields = spec.fields || (restored_state && restored_state.fields) || [];
        const cfg_filters = spec.filters || (restored_state && restored_state.filters) || [];
        const cfg_operators = spec.operators || (restored_state && restored_state.operators) || null;
        super(spec);
        this._persist_activation_state = spec.persist_activation_state === true || !!restored_state;
        this.add_class('jsgui-data-filter');
        this.dom.tagName = 'div';

        // ARIA: group semantics
        this.dom.attributes.role = 'group';
        this.dom.attributes['aria-label'] = 'Data filters';

        this._fields = cfg_fields.map(f =>
            typeof f === 'string' ? { name: f, label: f, type: 'string' } : {
                name: f.name,
                label: f.label || f.name,
                type: f.type || 'string'
            }
        );
        this._operators = cfg_operators || DEFAULT_OPERATORS;
        this._filter_rows = spec.el
            ? cfg_filters.map(filter => ({
                field: filter.field || '',
                operator: filter.operator || 'contains',
                value: filter.value == null ? '' : String(filter.value),
                el: null
            }))
            : [];
        this._row_container = null;

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }

        if (!spec.el) {
            this.compose();
            // Add initial filters
            if (cfg_filters.length > 0) {
                cfg_filters.forEach(f => this._add_filter_row(f));
            }
            this._sync_activation_state_attribute();
        }
    }

    compose() {
        this.compose_header();
        this.compose_rows();
    }

    compose_header() {
        const header = new Control({ context: this.context, tag_name: 'div' });
        header.add_class('data-filter-header');

        const title = new Control({ context: this.context, tag_name: 'span' });
        title.add_class('data-filter-title');
        title.add('Filters');
        header.add(title);

        const add_btn = new Control({ context: this.context, tag_name: 'button' });
        add_btn.add_class('data-filter-add-btn');
        add_btn.dom.attributes.type = 'button';
        add_btn.dom.attributes['aria-label'] = 'Add filter';
        add_btn.add('+ Add Filter');
        header.add(add_btn);

        this._add_btn = add_btn;
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.add_btn = add_btn;
        this.add(header);
    }

    compose_rows() {
        const container = new Control({ context: this.context, tag_name: 'div' });
        container.add_class('data-filter-rows');
        this._row_container = container;
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.row_container = container;
        this.add(container);

        // Empty state
        const empty = new Control({ context: this.context, tag_name: 'div' });
        empty.add_class('data-filter-empty');
        empty.add('No filters applied');
        this._empty_msg = empty;
        this._ctrl_fields.empty_msg = empty;
        container.add(empty);
    }

    // ── Public API ──

    add_filter() {
        const row_data = this._add_filter_row({});
        if (this.__active) this._activate_row(row_data);
        this._fire_change();
    }

    remove_filter(index) {
        if (index >= 0 && index < this._filter_rows.length) {
            const row = this._filter_rows[index];
            if (row.el) {
                this._deactivate_row(row);
                this._row_container.remove(row.el);
            }
            this._filter_rows.splice(index, 1);
            this._update_empty_state();
            this._fire_change();
        }
    }

    get_filters() {
        return this._filter_rows.map(r => ({
            field: r.field,
            operator: r.operator,
            value: r.value
        }));
    }

    /**
     * Get filters in map format compatible with Data_Grid.set_filters().
     * @returns {Object} e.g. {name: {op: 'contains', value: 'Alice'}, role: {op: 'equals', value: 'admin'}}
     */
    get_filter_map() {
        const map = {};
        this._filter_rows.forEach(r => {
            if (r.field && r.value !== '') {
                map[r.field] = { op: r.operator, value: r.value };
            }
        });
        return map;
    }

    clear() {
        while (this._filter_rows.length > 0) {
            const row = this._filter_rows.pop();
            if (row.el) {
                this._deactivate_row(row);
                this._row_container.remove(row.el);
            }
        }
        this._update_empty_state();
        this._fire_change();
    }

    /**
     * Apply current filters to an array of objects.
     * @param {Array<Object>} data
     * @returns {Array<Object>} filtered subset
     */
    apply(data) {
        const filters = this.get_filters();
        if (filters.length === 0) return data;
        return data.filter(item => filters.every(f => this._match(item, f)));
    }

    // ── Internal ──

    _add_filter_row(init = {}) {
        const row_data = {
            field: init.field || (this._fields.length > 0 ? this._fields[0].name : ''),
            operator: init.operator || 'contains',
            value: init.value != null ? String(init.value) : '',
            el: null
        };

        const row = new Control({ context: this.context, tag_name: 'div' });
        row.add_class('data-filter-row');
        row_data.el = row;

        // Field selector
        const field_sel = new Control({ context: this.context, tag_name: 'select' });
        field_sel.add_class('data-filter-field');
        field_sel.dom.attributes['aria-label'] = 'Filter field';
        this._fields.forEach(f => {
            const opt = new Control({ context: this.context, tag_name: 'option' });
            opt.dom.attributes.value = f.name;
            if (f.name === row_data.field) opt.dom.attributes.selected = 'selected';
            opt.add(f.label);
            field_sel.add(opt);
        });
        row.add(field_sel);

        // Operator selector
        const op_sel = new Control({ context: this.context, tag_name: 'select' });
        op_sel.add_class('data-filter-operator');
        op_sel.dom.attributes['aria-label'] = 'Filter operator';
        row_data._op_sel = op_sel;
        this._populate_operator_select(row_data);
        row.add(op_sel);

        // Value input
        const val_input = new Control({ context: this.context, tag_name: 'input' });
        val_input.add_class('data-filter-value');
        val_input.dom.attributes.type = 'text';
        val_input.dom.attributes.placeholder = 'Value…';
        val_input.dom.attributes['aria-label'] = 'Filter value';
        if (row_data.value) val_input.dom.attributes.value = row_data.value;
        row.add(val_input);

        // Remove button
        const rm_btn = new Control({ context: this.context, tag_name: 'button' });
        rm_btn.add_class('data-filter-remove-btn');
        rm_btn.dom.attributes.type = 'button';
        rm_btn.dom.attributes['aria-label'] = 'Remove filter';
        rm_btn.add('×');
        row.add(rm_btn);

        // Store refs for activation
        row_data._field_sel = field_sel;
        row_data._val_input = val_input;
        row_data._rm_btn = rm_btn;

        this._filter_rows.push(row_data);
        this._row_container.add(row);
        this._update_empty_state();
        return row_data;
    }

    _get_field_type(name) {
        const f = this._fields.find(f => f.name === name);
        return f ? f.type : 'string';
    }

    _populate_operator_select(row_data) {
        const op_sel = row_data && row_data._op_sel;
        if (!op_sel) return;
        const field_type = this._get_field_type(row_data.field);
        const ops = this._operators[field_type] || this._operators.string || [];
        if (!ops.some(operator => operator.value === row_data.operator)) {
            row_data.operator = ops.length ? ops[0].value : '';
        }
        op_sel.clear();
        ops.forEach(operator => {
            const option = new Control({ context: this.context, tag_name: 'option' });
            option.dom.attributes.value = operator.value;
            if (operator.value === row_data.operator) option.dom.attributes.selected = 'selected';
            option.add(operator.label);
            op_sel.add(option);
        });
        if (op_sel.dom.el) op_sel.dom.el.value = row_data.operator;
    }

    _update_empty_state() {
        if (this._empty_msg) {
            if (this._filter_rows.length > 0) {
                this._empty_msg.add_class('data-filter-empty-hidden');
            } else {
                this._empty_msg.remove_class('data-filter-empty-hidden');
            }
        }
    }

    _fire_change() {
        const filters = this.get_filters();
        const filter_map = this.get_filter_map();
        this.raise('change', { filters });
        this.raise('filter_change', { filters: filter_map });
        this._sync_activation_state_attribute();
    }

    _sync_activation_state_attribute() {
        if (!this._persist_activation_state) return;
        const state = {
            version: 1,
            fields: this._fields.map(field => ({
                name: field.name,
                label: field.label,
                type: field.type
            })),
            filters: this.get_filters(),
            operators: this._operators
        };
        let json = null;
        try {
            if (this._fields.length <= MAX_FILTER_FIELDS
                && this._filter_rows.length <= MAX_FILTER_ROWS
                && is_json_safe(state)) {
                json = JSON.stringify(state);
            }
        } catch (error) {
            json = null;
        }
        if (!json || json.length > MAX_FILTER_STATE_CHARACTERS) {
            delete this.dom.attributes[FILTER_STATE_ATTRIBUTE];
            if (this.dom.el) this.dom.el.removeAttribute(FILTER_STATE_ATTRIBUTE);
            return;
        }
        this.dom.attributes[FILTER_STATE_ATTRIBUTE] = json;
        if (this.dom.el) this.dom.el.setAttribute(FILTER_STATE_ATTRIBUTE, json);
    }

    _match(item, filter) {
        const raw = item[filter.field];
        if (raw == null) return false;
        const val = String(raw);
        const fv = filter.value;

        switch (filter.operator) {
            case 'contains': return val.toLowerCase().includes(fv.toLowerCase());
            case 'equals': return val === fv;
            case 'not_equals': return val !== fv;
            case 'starts_with': return val.toLowerCase().startsWith(fv.toLowerCase());
            case 'ends_with': return val.toLowerCase().endsWith(fv.toLowerCase());
            case 'greater_than': return Number(raw) > Number(fv);
            case 'less_than': return Number(raw) < Number(fv);
            case 'greater_or_eq': return Number(raw) >= Number(fv);
            case 'less_or_eq': return Number(raw) <= Number(fv);
            default: return true;
        }
    }

    activate() {
        if (this.__active) return;
        super.activate();
        const that = this;

        this._ctrl_fields = this._ctrl_fields || {};
        this._add_btn = this._ctrl_fields.add_btn || this.add_btn || this._add_btn;
        this._row_container = this._ctrl_fields.row_container || this.row_container || this._row_container;
        this._empty_msg = this._ctrl_fields.empty_msg || this.empty_msg || this._empty_msg;

        const find_control = element => {
            if (!element || !this.context || !this.context.map_controls) return null;
            const id = element.getAttribute('data-jsgui-id');
            return id ? this.context.map_controls[id] : null;
        };
        if (this.dom.el) {
            const row_elements = Array.from(this.dom.el.querySelectorAll('.data-filter-row'));
            this._filter_rows = row_elements.map((row_element, index) => {
                const existing = this._filter_rows[index] || {};
                const field_element = row_element.querySelector('.data-filter-field');
                const operator_element = row_element.querySelector('.data-filter-operator');
                const value_element = row_element.querySelector('.data-filter-value');
                return {
                    field: existing.field || (field_element ? field_element.value : ''),
                    operator: existing.operator || (operator_element ? operator_element.value : 'contains'),
                    value: existing.value == null
                        ? (value_element ? value_element.value : '')
                        : String(existing.value),
                    el: find_control(row_element),
                    _field_sel: find_control(field_element),
                    _op_sel: find_control(operator_element),
                    _val_input: find_control(value_element),
                    _rm_btn: find_control(row_element.querySelector('.data-filter-remove-btn'))
                };
            });
        }

        // Add filter button
        if (this._add_btn) {
            this._add_handler = () => that.add_filter();
            this._add_btn.on('click', this._add_handler);
        }

        // Wire up existing rows
        this._filter_rows.forEach((row_data, idx) => {
            that._activate_row(row_data, idx);
        });
    }

    _activate_row(row_data, idx) {
        if (!row_data || row_data._handlers_bound) return;
        const that = this;
        row_data._handlers_bound = true;

        if (row_data._field_sel) {
            row_data._field_handler = function () {
                const el = row_data._field_sel.dom.el;
                if (el) row_data.field = el.value;
                that._populate_operator_select(row_data);
                that._fire_change();
            };
            row_data._field_sel.on('change', row_data._field_handler);
        }
        if (row_data._op_sel) {
            row_data._operator_handler = function () {
                const el = row_data._op_sel.dom.el;
                if (el) row_data.operator = el.value;
                that._fire_change();
            };
            row_data._op_sel.on('change', row_data._operator_handler);
        }
        if (row_data._val_input) {
            row_data._value_handler = function () {
                const el = row_data._val_input.dom.el;
                if (el) row_data.value = el.value;
                that._fire_change();
            };
            row_data._val_input.add_dom_event_listener('input', row_data._value_handler);
        }
        if (row_data._rm_btn) {
            row_data._remove_handler = function () {
                const current_idx = that._filter_rows.indexOf(row_data);
                if (current_idx >= 0) that.remove_filter(current_idx);
            };
            row_data._rm_btn.on('click', row_data._remove_handler);
        }
    }

    _deactivate_row(row_data) {
        if (!row_data || !row_data._handlers_bound) return;
        if (row_data._field_sel && row_data._field_handler) {
            row_data._field_sel.off('change', row_data._field_handler);
        }
        if (row_data._op_sel && row_data._operator_handler) {
            row_data._op_sel.off('change', row_data._operator_handler);
        }
        if (row_data._val_input && row_data._value_handler) {
            row_data._val_input.remove_dom_event_listener('input', row_data._value_handler);
        }
        if (row_data._rm_btn && row_data._remove_handler) {
            row_data._rm_btn.off('click', row_data._remove_handler);
        }
        row_data._field_handler = null;
        row_data._operator_handler = null;
        row_data._value_handler = null;
        row_data._remove_handler = null;
        row_data._handlers_bound = false;
    }

    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        if (this._add_btn && this._add_handler) {
            this._add_btn.off('click', this._add_handler);
        }
        this._add_handler = null;
        this._filter_rows.forEach(row_data => this._deactivate_row(row_data));
        if (typeof super.destroy === 'function') super.destroy();
    }
}

Data_Filter.css = `
/* ─── Data_Filter ─── */
.jsgui-data-filter {
    font-family: var(--admin-font, 'Segoe UI', -apple-system, sans-serif);
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--admin-radius-lg, 6px);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.data-filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
}
.data-filter-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--admin-muted, #888);
}
.data-filter-add-btn {
    font-size: 12px;
    font-weight: 500;
    color: var(--admin-accent, #007acc);
    background: none;
    border: 1px solid var(--admin-accent, #007acc);
    border-radius: var(--admin-radius, 4px);
    padding: 4px 10px;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    font-family: inherit;
}
.data-filter-add-btn:hover {
    background: var(--admin-accent, #007acc);
    color: #fff;
}
.data-filter-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.data-filter-row {
    display: flex;
    align-items: center;
    gap: 6px;
}
.data-filter-field,
.data-filter-operator {
    font-size: 13px;
    font-family: inherit;
    padding: 5px 8px;
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--admin-radius, 4px);
    background: var(--admin-header-bg, #f5f5f5);
    color: var(--admin-text, #1e1e1e);
    min-width: 0;
    cursor: pointer;
}
.data-filter-field:focus,
.data-filter-operator:focus,
.data-filter-value:focus {
    outline: 2px solid var(--admin-accent, #007acc);
    outline-offset: -1px;
    border-color: var(--admin-accent, #007acc);
}
.data-filter-field { flex: 0 0 auto; min-width: 110px; }
.data-filter-operator { flex: 0 0 auto; min-width: 90px; }
.data-filter-value {
    flex: 1 1 auto;
    min-width: 80px;
    font-size: 13px;
    font-family: inherit;
    padding: 5px 8px;
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--admin-radius, 4px);
    background: var(--admin-card-bg, #fff);
    color: var(--admin-text, #1e1e1e);
}
.data-filter-value::placeholder {
    color: var(--admin-muted, #888);
}
.data-filter-remove-btn {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--admin-muted, #888);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--admin-radius, 4px);
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    font-family: inherit;
    line-height: 1;
}
.data-filter-remove-btn:hover {
    color: var(--admin-danger, #cd3131);
    background: rgba(205,49,49,0.08);
    border-color: var(--admin-danger, #cd3131);
}
.data-filter-empty {
    font-size: 12px;
    color: var(--admin-muted, #888);
    font-style: italic;
    padding: 6px 0;
}
.data-filter-empty-hidden {
    display: none;
}
`;

module.exports = Data_Filter;
