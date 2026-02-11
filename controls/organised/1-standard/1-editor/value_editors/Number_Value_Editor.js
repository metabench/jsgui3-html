'use strict';

const Value_Editor_Base = require('./Value_Editor_Base');
const { register_value_editor } = require('./value_editor_registry');

/**
 * Number_Value_Editor — numeric input with min/max/step validation.
 */
class Number_Value_Editor extends Value_Editor_Base {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'number_value_editor';
        super(spec);
        this.add_class('number-value-editor');

        this._min = spec.min;
        this._max = spec.max;
        this._step = spec.step || 1;

        const jsgui = require('../../../../../html-core/html-core');
        this._input = new jsgui.Control({ context: this.context, tag_name: 'input' });
        this._input.dom.attributes.type = 'number';
        this._input.dom.attributes['data-role'] = 'value-input';
        this._input.add_class('ve-number-input');
        if (this._value != null) this._input.dom.attributes.value = String(this._value);
        if (this._min !== undefined) this._input.dom.attributes.min = String(this._min);
        if (this._max !== undefined) this._input.dom.attributes.max = String(this._max);
        if (this._step !== undefined) this._input.dom.attributes.step = String(this._step);
        if (this._read_only) this._input.dom.attributes.readonly = 'readonly';
        this.add(this._input);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const el = this._input.dom.el;
            if (el) {
                el.addEventListener('input', () => {
                    const n = parseFloat(el.value);
                    this.set_value(isNaN(n) ? null : n, { source: 'user' });
                });
                el.addEventListener('keydown', (e) => this.handle_keydown(e));
            }
        }
    }

    set_value(value, opts = {}) {
        super.set_value(value, opts);
        if (this._input && this._input.dom.el) {
            this._input.dom.el.value = value != null ? String(value) : '';
        }
    }

    validate() {
        const v = this.get_value();
        if (v === null || v === undefined || isNaN(v)) {
            return { valid: false, message: 'Value is not a number' };
        }
        if (this._min !== undefined && v < this._min) {
            return { valid: false, message: `Minimum is ${this._min}` };
        }
        if (this._max !== undefined && v > this._max) {
            return { valid: false, message: `Maximum is ${this._max}` };
        }
        return { valid: true };
    }
}

Number_Value_Editor.type_name = 'number';
Number_Value_Editor.display_name = 'Number';

register_value_editor('number', Number_Value_Editor, { inline: true, popup: false });

module.exports = Number_Value_Editor;
