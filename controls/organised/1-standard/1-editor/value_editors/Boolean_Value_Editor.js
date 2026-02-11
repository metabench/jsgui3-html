'use strict';

const Value_Editor_Base = require('./Value_Editor_Base');
const { register_value_editor } = require('./value_editor_registry');

/**
 * Boolean_Value_Editor — checkbox.
 */
class Boolean_Value_Editor extends Value_Editor_Base {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'boolean_value_editor';
        super(spec);
        this.add_class('boolean-value-editor');

        const jsgui = require('../../../../../html-core/html-core');
        this._input = new jsgui.Control({ context: this.context, tag_name: 'input' });
        this._input.dom.attributes.type = 'checkbox';
        this._input.dom.attributes['data-role'] = 'value-input';
        this._input.add_class('ve-checkbox');
        if (this._value) {
            this._input.dom.attributes.checked = 'checked';
        }
        if (this._read_only) {
            this._input.dom.attributes.disabled = 'disabled';
        }
        this.add(this._input);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const el = this._input.dom.el;
            if (el) {
                el.addEventListener('change', () => {
                    this.set_value(el.checked, { source: 'user' });
                });
            }
        }
    }

    set_value(value, opts = {}) {
        super.set_value(!!value, opts);
        if (this._input && this._input.dom.el) {
            this._input.dom.el.checked = !!value;
        }
    }

    get_display_text() {
        if (this._varies) return '(varies)';
        return this._value ? 'Yes' : 'No';
    }

    set_varies() {
        super.set_varies();
        if (this._input && this._input.dom.el) {
            this._input.dom.el.indeterminate = true;
        }
    }
}

Boolean_Value_Editor.type_name = 'boolean';
Boolean_Value_Editor.display_name = 'Boolean';

register_value_editor('boolean', Boolean_Value_Editor, { inline: true, popup: false });

module.exports = Boolean_Value_Editor;
