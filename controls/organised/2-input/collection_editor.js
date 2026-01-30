const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const Property_Grid = require('../2-editor/property_grid');
const Button = require('../0-core/0-basic/0-native-compositional/button');

class Collection_Editor extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'collection_editor';
        super(spec);
        this.add_class('collection-editor');

        this.value = Array.isArray(spec.value) ? spec.value.slice() : [];
        this.item_schema = spec.item_schema || null;
        this.item_type = spec.item_type || 'object';
        this.orderable = spec.orderable !== false;
        this.min_items = spec.min_items || 0;
        this.max_items = spec.max_items || null;

        this.selected_index = -1;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        const list = new Control({ context });
        list.add_class('collection-editor-list');
        this.add(list);
        this._ctrl_fields.list = list;

        const controls = new Control({ context });
        controls.add_class('collection-editor-controls');
        const add_btn = new Button({ context });
        add_btn.add('Add');
        const remove_btn = new Button({ context });
        remove_btn.add('Remove');
        controls.add(add_btn);
        controls.add(remove_btn);
        this.add(controls);
        this._ctrl_fields.add_btn = add_btn;
        this._ctrl_fields.remove_btn = remove_btn;

        const editor = new Property_Grid({ context, schema: this.item_schema || [] });
        editor.add_class('collection-editor-item');
        this.add(editor);
        this._ctrl_fields.editor = editor;

        this._render_list();
    }

    _render_list() {
        const list = this._ctrl_fields && this._ctrl_fields.list;
        if (!list) return;
        list.clear();
        this.value.forEach((item, index) => {
            const row = new Control({ context: this.context, tag_name: 'div' });
            row.add_class('collection-editor-row');
            row.add(String(item && item.name ? item.name : `Item ${index + 1}`));
            if (index === this.selected_index) row.add_class('selected');
            row.on('click', () => this.select_item(index));
            list.add(row);
        });
    }

    get_value() {
        return this.value;
    }

    set_value(arr) {
        this.value = Array.isArray(arr) ? arr.slice() : [];
        this._render_list();
        this.raise('change', { value: this.value });
    }

    add_item(item = null) {
        if (this.max_items !== null && this.value.length >= this.max_items) return;
        const new_item = item || {};
        this.value.push(new_item);
        this._render_list();
        this.raise('change', { value: this.value });
    }

    remove_item(index) {
        if (this.value.length <= this.min_items) return;
        if (index < 0 || index >= this.value.length) return;
        this.value.splice(index, 1);
        this.selected_index = Math.min(this.selected_index, this.value.length - 1);
        this._render_list();
        this.raise('change', { value: this.value });
    }

    move_item(from, to) {
        if (from === to) return;
        if (from < 0 || to < 0 || from >= this.value.length || to >= this.value.length) return;
        const item = this.value.splice(from, 1)[0];
        this.value.splice(to, 0, item);
        this._render_list();
        this.raise('change', { value: this.value });
    }

    select_item(index) {
        if (index < 0 || index >= this.value.length) return;
        this.selected_index = index;
        const editor = this._ctrl_fields && this._ctrl_fields.editor;
        if (editor) {
            editor.set_target(this.value[index]);
        }
        this._render_list();
        this.raise('item-select', { index, item: this.value[index] });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const add_btn = this._ctrl_fields && this._ctrl_fields.add_btn;
            const remove_btn = this._ctrl_fields && this._ctrl_fields.remove_btn;
            if (add_btn && add_btn.dom.el) {
                add_btn.dom.el.addEventListener('click', () => this.add_item());
            }
            if (remove_btn && remove_btn.dom.el) {
                remove_btn.dom.el.addEventListener('click', () => this.remove_item(this.selected_index));
            }
        }
    }
}

module.exports = Collection_Editor;
