'use strict';

const Value_Editor_Base = require('./Value_Editor_Base');
const { register_value_editor } = require('./value_editor_registry');

/**
 * Enum_Value_Editor — <select> dropdown for fixed option sets.
 */
class Enum_Value_Editor extends Value_Editor_Base {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'enum_value_editor';
        super(spec);
        this.add_class('enum-value-editor');

        this._options = spec.options || [];

        const jsgui = require('../../../../../html-core/html-core');
        this._select = new jsgui.Control({ context: this.context, tag_name: 'select' });
        this._select.dom.attributes['data-role'] = 'value-input';
        this._select.add_class('ve-select');

        this._options.forEach(opt => {
            const label = (typeof opt === 'object') ? opt.label : opt;
            const val = (typeof opt === 'object') ? opt.value : opt;

            const option = new jsgui.Control({ context: this.context, tag_name: 'option' });
            option.dom.attributes.value = val;
            option.add(label);
            if (val === this._value) option.dom.attributes.selected = 'selected';
            this._select.add(option);
        });

        if (this._read_only) this._select.dom.attributes.disabled = 'disabled';
        this.add(this._select);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const el = this._select.dom.el;
            if (el) {
                el.addEventListener('change', () => {
                    this.set_value(el.value, { source: 'user' });
                });
            }
        }
    }

    set_value(value, opts = {}) {
        super.set_value(value, opts);
        if (this._select && this._select.dom.el) {
            this._select.dom.el.value = value != null ? String(value) : '';
        }
    }
}

Enum_Value_Editor.type_name = 'enum';
Enum_Value_Editor.display_name = 'Enum';

register_value_editor('enum', Enum_Value_Editor, { inline: true, popup: false });

module.exports = Enum_Value_Editor;
