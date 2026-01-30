const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const Text_Input = require('../0-core/0-basic/0-native-compositional/Text_Input');
const Checkbox = require('../0-core/0-basic/0-native-compositional/checkbox');
const Number_Input = require('../0-core/0-basic/0-native-compositional/number_input');
const Dropdown_List = require('../0-core/0-basic/0-native-compositional/dropdown-list');
const Color_Picker = require('../2-input/color_picker');
const Font_Picker = require('../2-input/font_picker');
const Anchor_Editor = require('../2-input/anchor_editor');
const Dock_Editor = require('../2-input/dock_editor');

class Property_Grid extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'property_grid';
        super(spec);
        this.add_class('property-grid');

        this.target = spec.target || null;
        this.schema = spec.schema || [];
        this.view_mode = spec.view_mode || 'categorized';
        this.show_description = spec.show_description !== false;
        this.show_search = spec.show_search !== false;
        this.readonly = !!spec.readonly;
        this.collapsed_categories = Array.isArray(spec.collapsed_categories)
            ? spec.collapsed_categories.slice()
            : [];

        this._editor_registry = {};
        this._register_default_editors();

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _register_default_editors() {
        this.register_editor('string', Text_Input);
        this.register_editor('text', Text_Input);
        this.register_editor('number', Number_Input);
        this.register_editor('boolean', Checkbox);
        this.register_editor('enum', Dropdown_List);
        this.register_editor('color', Color_Picker);
        this.register_editor('font', Font_Picker);
        this.register_editor('anchor', Anchor_Editor);
        this.register_editor('dock', Dock_Editor);
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        const toolbar = new Control({ context });
        toolbar.add_class('property-grid-toolbar');
        this.add(toolbar);
        this._ctrl_fields.toolbar = toolbar;

        if (this.show_search) {
            const search = new Text_Input({ context });
            search.add_class('property-grid-search');
            toolbar.add(search);
            this._ctrl_fields.search = search;
            search.on('input', () => {
                this.filter(search.dom.el ? search.dom.el.value : '');
            });
        }

        const body = new Control({ context });
        body.add_class('property-grid-body');
        this.add(body);
        this._ctrl_fields.body = body;

        if (this.show_description) {
            const description = new Control({ context });
            description.add_class('property-grid-description');
            this.add(description);
            this._ctrl_fields.description = description;
        }

        this.refresh();
    }

    set_target(obj) {
        this.target = obj;
        this.refresh();
    }

    set_targets(arr) {
        this.targets = Array.isArray(arr) ? arr.slice() : null;
        this.target = this.targets && this.targets[0] ? this.targets[0] : null;
        this.refresh();
    }

    register_editor(type, editor_class) {
        this._editor_registry[type] = editor_class;
    }

    _get_editor(type) {
        return this._editor_registry[type] || Text_Input;
    }

    _clear_body() {
        if (this._ctrl_fields && this._ctrl_fields.body) {
            this._ctrl_fields.body.clear();
        }
    }

    _render_row(def) {
        const { context } = this;
        const row = new Control({ context });
        row.add_class('property-grid-row');

        const label = new Control({ context });
        label.add_class('property-grid-label');
        label.add(def.display_name || def.name);
        row.add(label);

        const editor_wrapper = new Control({ context });
        editor_wrapper.add_class('property-grid-editor');

        const editor_class = this._get_editor(def.type || 'string');
        const editor_ctrl = new editor_class({ context });

        if (editor_ctrl.dom && editor_ctrl.dom.attributes) {
            if (this.readonly || def.readonly) {
                editor_ctrl.dom.attributes.readonly = 'readonly';
                editor_ctrl.dom.attributes.disabled = 'disabled';
            }
        }

        if (def.type === 'enum' && editor_ctrl.dom && editor_ctrl.dom.tagName === 'select') {
            const values = def.enum_values || [];
            values.forEach(val => {
                const opt = new Control({ context });
                opt.dom.tagName = 'option';
                opt.dom.attributes.value = String(val);
                opt.add(String(val));
                editor_ctrl.add(opt);
            });
        }

        editor_wrapper.add(editor_ctrl);
        row.add(editor_wrapper);

        if (this.target && def.name) {
            const current = this.target[def.name];
            if (editor_ctrl.dom && editor_ctrl.dom.el) {
                if (editor_ctrl.dom.el.type === 'checkbox') {
                    editor_ctrl.dom.el.checked = !!current;
                } else {
                    editor_ctrl.dom.el.value = current !== undefined ? String(current) : '';
                }
            } else if (editor_ctrl.dom && editor_ctrl.dom.attributes) {
                editor_ctrl.dom.attributes.value = current !== undefined ? String(current) : '';
            }
        }

        editor_ctrl.on('change', () => this._handle_change(def, editor_ctrl));
        editor_ctrl.on('input', () => this._handle_change(def, editor_ctrl));

        return row;
    }

    _handle_change(def, editor_ctrl) {
        if (!this.target || !def.name) return;
        let new_value;
        if (editor_ctrl.dom && editor_ctrl.dom.el) {
            if (editor_ctrl.dom.el.type === 'checkbox') {
                new_value = !!editor_ctrl.dom.el.checked;
            } else {
                new_value = editor_ctrl.dom.el.value;
            }
        }
        const old_value = this.target[def.name];
        if (old_value === new_value) return;

        const event_payload = { name: def.name, old_value, new_value, target: this.target };
        this.raise('property-changing', Object.assign({}, event_payload, {
            cancel: () => { event_payload._cancelled = true; }
        }));
        if (event_payload._cancelled) return;

        this.target[def.name] = new_value;
        this.raise('property-change', { name: def.name, old_value, new_value, target: this.target });
    }

    refresh() {
        if (!this._ctrl_fields || !this._ctrl_fields.body) return;
        this._clear_body();
        const body = this._ctrl_fields.body;
        const schema = Array.isArray(this.schema) ? this.schema : [];
        schema.forEach(def => {
            if (def.visible === false) return;
            const row = this._render_row(def);
            body.add(row);
        });
    }

    filter(text) {
        const term = String(text || '').toLowerCase();
        if (!this._ctrl_fields || !this._ctrl_fields.body) return;
        const body = this._ctrl_fields.body;
        const items = body.content && body.content._arr ? body.content._arr : [];
        items.forEach(row => {
            const label = row && row.content && row.content._arr ? row.content._arr[0] : null;
            const label_text = label && label.text ? label.text : '';
            if (!term || String(label_text).toLowerCase().includes(term)) {
                row.show();
            } else {
                row.hide();
            }
        });
    }
}

module.exports = Property_Grid;
