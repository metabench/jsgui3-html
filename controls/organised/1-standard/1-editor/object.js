// object editor
var jsgui = require('../../../../html-core/html-core');
var Object_Viewer = require('../0-viewer/object');
var Object_KVP_Editor = require('./object-kvp');
var factory = require('./factory');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;
const Text_Input = require('../../0-core/0-basic/0-native-compositional/Text_Input');
const Textarea = require('../../0-core/0-basic/0-native-compositional/textarea');
const Number_Input = require('../../0-core/0-basic/0-native-compositional/number_input');
const Array_Editor = require('./array');

class Object_Editor extends Object_Viewer {
	// Maybe should put this into a form, so that it does a form post.
	//  That could possibly be disabled.

	constructor(spec) {
		super(spec);
		var make = this.make;
		this.factory = factory;
		this.Object_KVP = Object_KVP_Editor;

		//this._super(spec);

		this.add_class('object-editor');
		this.__type_name = 'object_editor';
        this.schema = spec.schema || null;
        this.allow_add = spec.allow_add !== false;
        this.allow_remove = spec.allow_remove !== false;
        this.show_key_editor = spec.show_key_editor !== false;
        this.collapsed_keys = Array.isArray(spec.collapsed_keys) ? spec.collapsed_keys.slice() : [];

	}
	'refresh_internal'() {
		const value = this.value || {};
        const inner = this.inner;
        if (!inner) return;

        inner.clear();

        const schema = this.schema || {};
        const schema_keys = Array.isArray(schema.fields)
            ? schema.fields.map(field => String(field.name))
            : (schema.properties ? Object.keys(schema.properties) : []);
        const value_keys = Object.keys(value || {});
        const keys = schema_keys.concat(value_keys.filter(key => !schema_keys.includes(key)));

        keys.forEach((key, index) => {
            const field_schema = this.get_schema_for_key(key, index, schema);
            const row_ctrl = new Control({ context: this.context, tag_name: 'div' });
            row_ctrl.add_class('object-editor-row');
            row_ctrl.dom.attributes['data-key'] = key;

            const key_ctrl = this.create_key_control(key, field_schema);
            row_ctrl.add(key_ctrl);

            const value_ctrl = this.create_value_control(key, value[key], field_schema);
            row_ctrl.add(value_ctrl.wrapper);

            if (this.allow_remove) {
                const remove_ctrl = new Control({ context: this.context, tag_name: 'button' });
                remove_ctrl.add_class('object-editor-remove');
                remove_ctrl.dom.attributes.type = 'button';
                remove_ctrl.dom.attributes['data-role'] = 'remove-key';
                remove_ctrl.dom.attributes['data-key'] = key;
                remove_ctrl.add('Remove');
                row_ctrl.add(remove_ctrl);
            }

            inner.add(row_ctrl);
        });

        if (this.allow_add) {
            const add_ctrl = new Control({ context: this.context, tag_name: 'button' });
            add_ctrl.add_class('object-editor-add');
            add_ctrl.dom.attributes.type = 'button';
            add_ctrl.dom.attributes['data-role'] = 'add-key';
            add_ctrl.add('Add field');
            inner.add(add_ctrl);
        }

	}
    /**
     * Set editor value.
     * @param {Object} value - Object value.
     */
    set_value(value) {
        this.value = value || {};
        this.refresh_internal();
    }

    /**
     * Get editor value.
     * @returns {Object}
     */
    get_value() {
        return this.value || {};
    }

    /**
     * Toggle collapse for a key.
     * @param {string} key - Key to toggle.
     */
    toggle_key(key) {
        const key_str = String(key);
        const index = this.collapsed_keys.indexOf(key_str);
        if (index >= 0) {
            this.collapsed_keys.splice(index, 1);
        } else {
            this.collapsed_keys.push(key_str);
        }
        this.refresh_internal();
    }

    /**
     * Add a key/value pair.
     * @param {string} key - Key to add.
     * @param {*} value - Value to set.
     * @returns {boolean}
     */
    add_key(key, value) {
        const key_str = String(key || '');
        if (!key_str) return false;
        if (is_defined(this.value[key_str])) return false;
        this.value[key_str] = is_defined(value) ? value : '';
        this.refresh_internal();
        return true;
    }

    /**
     * Remove a key/value pair.
     * @param {string} key - Key to remove.
     * @returns {boolean}
     */
    remove_key(key) {
        const key_str = String(key || '');
        if (!is_defined(this.value[key_str])) return false;
        delete this.value[key_str];
        this.refresh_internal();
        return true;
    }

    get_schema_for_key(key, index, schema) {
        if (Array.isArray(schema.fields)) {
            const field = schema.fields.find(field_def => String(field_def.name) === String(key));
            if (field) return field;
        }
        if (schema.properties && schema.properties[key]) {
            return schema.properties[key];
        }
        return {
            name: key,
            type: typeof (this.value || {})[key]
        };
    }

    create_key_control(key, field_schema) {
        const key_ctrl = new Control({ context: this.context, tag_name: 'input' });
        key_ctrl.add_class('object-editor-key');
        key_ctrl.dom.attributes.type = 'text';
        key_ctrl.dom.attributes.value = String(key);
        key_ctrl.dom.attributes['data-role'] = 'key-input';
        key_ctrl.dom.attributes['data-key'] = key;
        if (!this.show_key_editor || field_schema && field_schema.readonly) {
            key_ctrl.dom.attributes.readonly = 'readonly';
        }
        return key_ctrl;
    }

    create_value_control(key, value, field_schema) {
        const wrapper = new Control({ context: this.context, tag_name: 'div' });
        wrapper.add_class('object-editor-value');
        wrapper.dom.attributes['data-key'] = key;

        const type = field_schema && field_schema.type ? field_schema.type : typeof value;

        if (type === 'object' && value && !Array.isArray(value)) {
            const toggle_ctrl = new Control({ context: this.context, tag_name: 'button' });
            toggle_ctrl.add_class('object-editor-toggle');
            toggle_ctrl.dom.attributes.type = 'button';
            toggle_ctrl.dom.attributes['data-role'] = 'toggle-node';
            toggle_ctrl.dom.attributes['data-key'] = key;
            const is_collapsed = this.collapsed_keys.includes(String(key));
            toggle_ctrl.dom.attributes['aria-expanded'] = is_collapsed ? 'false' : 'true';
            toggle_ctrl.add(is_collapsed ? 'Expand' : 'Collapse');
            wrapper.add(toggle_ctrl);

            const child_ctrl = new Object_Editor({
                context: this.context,
                value: value || {},
                schema: field_schema && field_schema.schema,
                allow_add: this.allow_add,
                allow_remove: this.allow_remove,
                show_key_editor: this.show_key_editor,
                collapsed_keys: []
            });
            child_ctrl.add_class('object-editor-children');
            if (is_collapsed) {
                child_ctrl.dom.attributes.style.display = 'none';
            }
            wrapper.add(child_ctrl);
            return { wrapper, input_ctrl: null };
        }

        if (type === 'array' || Array.isArray(value)) {
            const toggle_ctrl = new Control({ context: this.context, tag_name: 'button' });
            toggle_ctrl.add_class('object-editor-toggle');
            toggle_ctrl.dom.attributes.type = 'button';
            toggle_ctrl.dom.attributes['data-role'] = 'toggle-node';
            toggle_ctrl.dom.attributes['data-key'] = key;
            const is_collapsed = this.collapsed_keys.includes(String(key));
            toggle_ctrl.dom.attributes['aria-expanded'] = is_collapsed ? 'false' : 'true';
            toggle_ctrl.add(is_collapsed ? 'Expand' : 'Collapse');
            wrapper.add(toggle_ctrl);

            const child_ctrl = new Array_Editor({
                context: this.context,
                value: value || []
            });
            child_ctrl.add_class('object-editor-children');
            if (is_collapsed) {
                child_ctrl.dom.attributes.style.display = 'none';
            }
            wrapper.add(child_ctrl);
            return { wrapper, input_ctrl: null };
        }

        let input_ctrl;
        if (type === 'number') {
            input_ctrl = new Number_Input({ context: this.context, value: value });
        } else if (type === 'boolean') {
            input_ctrl = new Control({ context: this.context, tag_name: 'input' });
            input_ctrl.dom.attributes.type = 'checkbox';
            if (value) {
                input_ctrl.dom.attributes.checked = 'checked';
            }
        } else if (field_schema && field_schema.multiline) {
            input_ctrl = new Textarea({ context: this.context, value: value });
        } else {
            input_ctrl = new Text_Input({ context: this.context, value: value });
        }

        input_ctrl.add_class('object-editor-value-input');
        input_ctrl.dom.attributes['data-role'] = 'value-input';
        input_ctrl.dom.attributes['data-key'] = key;

        wrapper.add(input_ctrl);
        return { wrapper, input_ctrl };
    }

    activate() {
        if (!this.__active) {
            Control.prototype.activate.call(this);
            const inner = this.inner;
            if (!inner || !inner.dom.el) return;

            inner.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target || !target.getAttribute) return;
                const role = target.getAttribute('data-role');
                const key = target.getAttribute('data-key');
                if (role === 'remove-key' && key) {
                    this.remove_key(key);
                }
                if (role === 'add-key') {
                    let index = 1;
                    let new_key = `field_${index}`;
                    while (is_defined(this.value[new_key])) {
                        index += 1;
                        new_key = `field_${index}`;
                    }
                    this.add_key(new_key, '');
                }
                if (role === 'toggle-node' && key) {
                    this.toggle_key(key);
                }
            });

            inner.add_dom_event_listener('change', e_change => {
                const target = e_change.target;
                if (!target || !target.getAttribute) return;
                const role = target.getAttribute('data-role');
                const key = target.getAttribute('data-key');
                if (!key) return;
                if (role === 'key-input') {
                    const new_key = target.value.trim();
                    if (!new_key || new_key === key) return;
                    if (is_defined(this.value[new_key])) return;
                    this.value[new_key] = this.value[key];
                    delete this.value[key];
                    this.refresh_internal();
                }
                if (role === 'value-input') {
                    if (target.type === 'checkbox') {
                        this.value[key] = !!target.checked;
                    } else if (target.type === 'number') {
                        this.value[key] = Number(target.value);
                    } else {
                        this.value[key] = target.value;
                    }
                }
            });
        }
    }
};

Object_Editor.css = `
.object-editor-row {
    display: grid;
    grid-template-columns: minmax(120px, 180px) 1fr auto;
    gap: 8px;
    align-items: center;
    padding: 4px 0;
}
.object-editor-key {
    padding: 4px 6px;
}
.object-editor-value {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.object-editor-value-input {
    padding: 4px 6px;
}
.object-editor-toggle {
    align-self: flex-start;
    border: 1px solid #ccc;
    background: #fff;
    padding: 4px 6px;
    cursor: pointer;
}
.object-editor-children {
    margin-left: 12px;
    padding-left: 8px;
    border-left: 1px dashed #ddd;
}
.object-editor-add,
.object-editor-remove {
    border: 1px solid #ccc;
    background: #fff;
    padding: 4px 6px;
    cursor: pointer;
}
`;
module.exports = Object_Editor;
