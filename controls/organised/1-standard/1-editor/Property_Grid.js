'use strict';

/**
 * Property_Grid
 *
 * VS-style two-column property grid.
 * Takes a schema array + data object and builds
 * one row per property, using the value_editor_registry
 * to create the correct editor per type.
 *
 * Events:
 *   property-change  { key, value, old, valid }
 *   validation-error { key, message }
 *   row-focus        { index, key }
 */

const jsgui = require('../../../../html-core/html-core');
const Control = jsgui.Control;
const { create_editor } = require('./value_editors/value_editor_registry');
const collapsible = require('../../../../control_mixins/collapsible');

// Ensure all built-in editors are registered
require('./value_editors');

class Property_Grid extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'property_grid';
        super(spec);
        this.add_class('property-grid');
        this.dom.attributes.role = 'grid';
        this.dom.attributes['aria-label'] = spec.aria_label || 'Properties';

        this._schema = spec.schema || [];
        this._data = spec.data || {};
        this._editors = new Map();
        this._row_controls = new Map();
        this._focused_index = -1;
        this._group_headers = []; // for collapsible
        this._group_row_sets = []; // rows associated with each group

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const flat_fields = this._flatten_schema(this._schema);

        flat_fields.forEach((field, index) => {
            if (field._group_header) {
                // Group header row
                const header = new Control({ context: this.context, tag_name: 'div' });
                header.add_class('pg-group-header');
                header.dom.attributes.role = 'row';

                const header_label = new Control({ context: this.context, tag_name: 'div' });
                header_label.add_class('pg-group-label');
                header_label.dom.attributes.role = 'columnheader';
                header_label.dom.attributes['aria-expanded'] = 'true';
                header_label.add(field._group_header);
                header.add(header_label);

                this.add(header);
                this._group_headers.push(header);
                this._group_row_sets.push([]);  // will be filled by subsequent rows
                return;
            }

            const row = new Control({ context: this.context, tag_name: 'div' });
            row.add_class('pg-row');
            row.dom.attributes.role = 'row';
            row.dom.attributes.tabindex = '0';
            row.dom.attributes['aria-rowindex'] = String(index + 1);
            row.dom.attributes['data-key'] = field.key;

            // Label cell
            const label = new Control({ context: this.context, tag_name: 'div' });
            label.add_class('pg-label');
            label.dom.attributes.role = 'rowheader';
            label.add(field.label || field.key);
            row.add(label);

            // Value cell
            const value_cell = new Control({ context: this.context, tag_name: 'div' });
            value_cell.add_class('pg-value');
            value_cell.dom.attributes.role = 'gridcell';
            value_cell.dom.attributes['aria-label'] = `${field.label || field.key} value`;

            const editor = create_editor(field.type, {
                context: this.context,
                value: this._data[field.key],
                ...field
            });

            if (editor) {
                value_cell.add(editor);
                this._editors.set(field.key, editor);
            }

            row.add(value_cell);
            this._row_controls.set(field.key, row);
            this.add(row);
            // Track this row in the current group (if any)
            if (this._group_row_sets.length > 0) {
                this._group_row_sets[this._group_row_sets.length - 1].push(row);
            }
        });
    }

    /**
     * Flatten grouped schema into a flat array.
     * Group entries get a _group_header marker.
     */
    _flatten_schema(schema) {
        const result = [];
        for (const item of schema) {
            if (item.group && Array.isArray(item.fields)) {
                result.push({ _group_header: item.group });
                for (const f of item.fields) {
                    result.push(f);
                }
            } else {
                result.push(item);
            }
        }
        return result;
    }

    activate() {
        if (!this.__active) {
            super.activate();

            // Wire editors → data + events
            for (const [key, editor] of this._editors) {
                editor.on('value-change', (e) => {
                    const result = editor.validate();
                    const row = this._row_controls.get(key);

                    if (row && row.dom.el) {
                        if (!result.valid) {
                            row.dom.el.classList.add('pg-row-invalid');
                            row.dom.el.setAttribute('title', result.message || '');
                        } else {
                            row.dom.el.classList.remove('pg-row-invalid');
                            row.dom.el.removeAttribute('title');
                        }
                    }

                    this._data[key] = e.value;
                    this.raise('property-change', {
                        key,
                        value: e.value,
                        old: e.old,
                        valid: result.valid
                    });

                    if (!result.valid) {
                        this.raise('validation-error', { key, message: result.message });
                    }
                });
            }

            // Keyboard navigation
            if (this.dom.el) {
                this.dom.el.addEventListener('keydown', (e) => {
                    this._handle_grid_keydown(e);
                });
            }

            // Collapsible group headers
            this._group_headers.forEach((header, idx) => {
                const rows = this._group_row_sets[idx];
                if (header.dom.el) {
                    header.dom.el.addEventListener('click', () => {
                        const is_collapsed = header.dom.el.classList.contains('collapsed');
                        if (is_collapsed) {
                            header.dom.el.classList.remove('collapsed');
                            const label_el = header.dom.el.querySelector('.pg-group-label');
                            if (label_el) label_el.setAttribute('aria-expanded', 'true');
                            rows.forEach(row => { if (row.dom.el) row.dom.el.style.display = ''; });
                        } else {
                            header.dom.el.classList.add('collapsed');
                            const label_el = header.dom.el.querySelector('.pg-group-label');
                            if (label_el) label_el.setAttribute('aria-expanded', 'false');
                            rows.forEach(row => { if (row.dom.el) row.dom.el.style.display = 'none'; });
                        }
                    });
                }
            });
        }
    }

    _handle_grid_keydown(e) {
        const rows = this._get_focusable_rows();
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this._focus_row(this._focused_index + 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this._focus_row(this._focused_index - 1);
                break;
            case 'Home':
                e.preventDefault();
                this._focus_row(0);
                break;
            case 'End':
                e.preventDefault();
                this._focus_row(rows.length - 1);
                break;
        }
    }

    _get_focusable_rows() {
        if (!this.dom.el) return [];
        return Array.from(this.dom.el.querySelectorAll('.pg-row'));
    }

    _focus_row(index) {
        const rows = this._get_focusable_rows();
        if (index < 0 || index >= rows.length) return;
        this._focused_index = index;
        rows[index].focus();
        const key = rows[index].getAttribute('data-key');
        this.raise('row-focus', { index, key });
    }

    // ── Public API ──

    get_values() {
        const result = {};
        for (const [key, editor] of this._editors) {
            result[key] = editor.get_value();
        }
        return result;
    }

    set_values(data) {
        for (const [key, editor] of this._editors) {
            if (key in data) {
                editor.set_value(data[key], { silent: true });
            }
        }
        Object.assign(this._data, data);
    }

    get_editor(key) {
        return this._editors.get(key);
    }

    /**
     * Validate all editors. Returns { valid, errors }.
     */
    validate_all() {
        const errors = [];
        for (const [key, editor] of this._editors) {
            const r = editor.validate();
            if (!r.valid) errors.push({ key, message: r.message });
        }
        return { valid: errors.length === 0, errors };
    }
}

Property_Grid.css = `
.property-grid {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--pg-border, var(--admin-border, #e2e8f0));
    border-radius: 6px;
    overflow: hidden;
    font-family: var(--pg-font, var(--admin-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif));
    font-size: var(--pg-font-size, 13px);
    color: var(--pg-text, var(--admin-text, #1e293b));
    background: var(--pg-bg, var(--admin-card-bg, #fff));
}

/* Group header */
.pg-group-header {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    background: var(--pg-group-bg, var(--admin-header-bg, #f8fafc));
    border-bottom: 1px solid var(--pg-border, var(--admin-border, #e2e8f0));
    cursor: pointer;
    user-select: none;
}
.pg-group-header:not(:first-child) {
    border-top: 1px solid var(--pg-border, var(--admin-border, #e2e8f0));
}
.pg-group-label {
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--pg-group-text, var(--admin-muted, #64748b));
}
.pg-group-label::before {
    content: '▾ ';
    display: inline-block;
    transition: transform 0.15s;
}
.pg-group-header.collapsed .pg-group-label::before {
    transform: rotate(-90deg);
}

/* Rows */
.pg-row {
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid var(--pg-row-border, #f1f5f9);
    transition: background 0.1s;
    outline: none;
}
.pg-row:last-child { border-bottom: none; }
.pg-row:nth-child(even) {
    background: var(--pg-row-alt, rgba(0,0,0,0.01));
}
.pg-row:hover {
    background: var(--pg-row-hover, var(--admin-hover, #f1f5f9));
}
.pg-row:focus {
    box-shadow: inset 3px 0 0 var(--pg-accent, var(--admin-accent, #3b82f6));
    background: var(--pg-row-focus, rgba(59,130,246,0.04));
}

/* Label cell */
.pg-label {
    flex: 0 0 var(--pg-label-width, 40%);
    padding: 6px 10px;
    font-weight: 500;
    color: var(--pg-label-text, var(--admin-text, #1e293b));
    border-right: 1px solid var(--pg-border, var(--admin-border, #e2e8f0));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Value cell */
.pg-value {
    flex: 1;
    padding: 4px 8px;
    min-height: 30px;
    display: flex;
    align-items: center;
}

/* Validation error */
.pg-row-invalid {
    box-shadow: inset 3px 0 0 var(--pg-error, #ef4444);
}
.pg-row-invalid .pg-value {
    color: var(--pg-error, #ef4444);
}
`;

module.exports = Property_Grid;

