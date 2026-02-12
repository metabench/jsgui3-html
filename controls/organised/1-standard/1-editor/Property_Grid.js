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

module.exports = Property_Grid;
