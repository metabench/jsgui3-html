'use strict';

const Value_Editor_Base = require('./Value_Editor_Base');
const { register_value_editor } = require('./value_editor_registry');

/**
 * Text_Value_Editor — simple text input.
 */
class Text_Value_Editor extends Value_Editor_Base {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'text_value_editor';
        super(spec);
        this.add_class('text-value-editor');

        // Create inline <input type="text">
        const jsgui = require('../../../../../html-core/html-core');
        this._input = new jsgui.Control({ context: this.context, tag_name: 'input' });
        this._input.dom.attributes.type = 'text';
        this._input.dom.attributes['data-role'] = 'value-input';
        this._input.add_class('ve-text-input');
        if (this._value != null) {
            this._input.dom.attributes.value = String(this._value);
        }
        if (this._read_only) {
            this._input.dom.attributes.readonly = 'readonly';
        }
        this.add(this._input);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const el = this._input.dom.el;
            if (el) {
                el.addEventListener('input', () => {
                    this.set_value(el.value, { source: 'user' });
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

    set_varies() {
        super.set_varies();
        if (this._input && this._input.dom.el) {
            this._input.dom.el.value = '';
            this._input.dom.el.placeholder = '(varies)';
        }
    }
}

Text_Value_Editor.type_name = 'text';
Text_Value_Editor.display_name = 'Text';

register_value_editor('text', Text_Value_Editor, { inline: true, popup: false });
register_value_editor('string', Text_Value_Editor, { inline: true, popup: false });

module.exports = Text_Value_Editor;
