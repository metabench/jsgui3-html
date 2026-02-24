const jsgui = require('../../../../../html-core/html-core');
const {Control, Control_Data, Control_View, Data_Object} = jsgui;
const {field} = require('obext');
const Text_Input = require('../0-native-compositional/Text_Input');
const List = require('./list');
const {
    normalize_items,
    find_item_by_value,
    filter_items
} = require('../item_utils');
const {
    apply_focus_ring,
    apply_label
} = require('../../../../../control_mixins/a11y');

class Combo_Box extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'combo_box';
        super(spec);
        this.add_class('combo-box');

        this.items = [];
        this.filtered_items = [];
        this.filter_text = '';
        this.selected_item = null;
        this.open = false;
        this.active_index = -1;
        this.item_id_prefix = `${this._id()}-combo-item`;
        this.load_items_fn = typeof spec.load_items === 'function' ? spec.load_items : null;
        this.auto_load = spec.auto_load !== false;
        this.typeahead = spec.typeahead !== false;
        this.allow_custom_value = !!spec.allow_custom_value;
        this.placeholder = spec.placeholder || '';
        this.aria_label = spec.aria_label;

        this.construct_synchronised_data_and_view_models(spec);

        if (spec.items) {
            this.set_items(spec.items, {from_model: true});
        }
        if (spec.filter_text !== undefined) {
            this.set_filter_text(spec.filter_text, {from_model: true});
        }
        if (spec.value !== undefined) {
            this.set_selected_value(spec.value, {from_model: true});
        }
        if (spec.selected_item !== undefined) {
            this.set_selected_item(spec.selected_item, {from_model: true});
        }
        if (spec.open !== undefined) {
            this.set_open(!!spec.open, {from_model: true});
        }

        if (!spec.el) {
            this.compose_combo_box();
        }
    }

    construct_synchronised_data_and_view_models(spec) {
        const {context} = this;
        this.data = new Control_Data({context});
        if (spec.data && spec.data.model) {
            this.data.model = spec.data.model;
        } else {
            this.data.model = new Data_Object({context});
        }
        field(this.data.model, 'value');
        field(this.data.model, 'items');
        field(this.data.model, 'filter_text');
        field(this.data.model, 'selected_item');
        field(this.data.model, 'open');

        this.view = new Control_View({context});
        if (spec.view && spec.view.data && spec.view.data.model) {
            this.view.data.model = spec.view.data.model;
        } else {
            this.view.data.model = new Data_Object({context});
        }
        field(this.view.data.model, 'value');
        field(this.view.data.model, 'items');
        field(this.view.data.model, 'filter_text');
        field(this.view.data.model, 'selected_item');
        field(this.view.data.model, 'open');

        this.data.model.on('change', e => {
            const {name, value, old} = e;
            if (value === old) return;
            if (name === 'value') {
                this.view.data.model.value = value;
                this.set_selected_value(value, {from_model: true});
            } else if (name === 'items') {
                this.view.data.model.items = value;
                this.set_items(value, {from_model: true});
            } else if (name === 'filter_text') {
                this.view.data.model.filter_text = value;
                this.set_filter_text(value, {from_model: true});
            } else if (name === 'selected_item') {
                this.view.data.model.selected_item = value;
                this.set_selected_item(value, {from_model: true});
            } else if (name === 'open') {
                this.view.data.model.open = value;
                this.set_open(!!value, {from_model: true});
            }
        });

        this.view.data.model.on('change', e => {
            const {name, value, old} = e;
            if (value === old) return;
            if (name === 'value') {
                this.data.model.value = value;
                this.set_selected_value(value, {from_model: true});
            } else if (name === 'items') {
                this.data.model.items = value;
                this.set_items(value, {from_model: true});
            } else if (name === 'filter_text') {
                this.data.model.filter_text = value;
                this.set_filter_text(value, {from_model: true});
            } else if (name === 'selected_item') {
                this.data.model.selected_item = value;
                this.set_selected_item(value, {from_model: true});
            } else if (name === 'open') {
                this.data.model.open = value;
                this.set_open(!!value, {from_model: true});
            }
        });
    }

    compose_combo_box() {
        const {context} = this;

        const input_ctrl = new Text_Input({
            context,
            placeholder: this.placeholder
        });
        input_ctrl.add_class('combo-box-input');
        input_ctrl.dom.attributes.role = 'combobox';
        input_ctrl.dom.attributes['aria-autocomplete'] = this.typeahead ? 'list' : 'none';
        input_ctrl.dom.attributes['aria-expanded'] = this.open ? 'true' : 'false';
        input_ctrl.dom.attributes['aria-haspopup'] = 'listbox';
        apply_focus_ring(input_ctrl);
        if (this.aria_label !== undefined) {
            apply_label(input_ctrl, this.aria_label);
        }

        const dropdown = new Control({
            context,
            class: 'combo-box-dropdown'
        });
        const list_ctrl = new List({
            context,
            items: this.items,
            focusable: false,
            enable_keyboard: false
        });
        list_ctrl.add_class('combo-box-list');
        list_ctrl.dom.attributes.id = `${this._id()}-list`;
        list_ctrl.dom.attributes.role = 'listbox';
        dropdown.add(list_ctrl);
        if (!this.open) {
            dropdown.hide();
        }

        input_ctrl.dom.attributes['aria-controls'] = list_ctrl.dom.attributes.id;

        this.add(input_ctrl);
        this.add(dropdown);

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.input = input_ctrl;
        this._ctrl_fields.dropdown = dropdown;
        this._ctrl_fields.list = list_ctrl;

        this.input = input_ctrl;
        this.dropdown = dropdown;
        this.list = list_ctrl;

        this.sync_input_to_selection();
        this.update_aria_active_descendant();
    }

    /**
     * Set items for the combo box.
     * @param {Array} items - Items to set.
     * @param {Object} [options] - Optional settings.
     */
    set_items(items, options = {}) {
        this.items = normalize_items(items, {id_prefix: this.item_id_prefix});
        this.filtered_items = filter_items(this.items, this.filter_text);
        if (!options.from_model) {
            this.set_model_value('items', items);
        }
        if (this.list && this.list.set_items) {
            this.list.set_items(this.items.map(item => ({
                value: item.value,
                label: item.label,
                id: item.id,
                disabled: item.disabled
            })), {from_model: true});
            if (this.list.set_filter_text) {
                this.list.set_filter_text(this.filter_text, {from_model: true});
            }
        }
        this.update_aria_active_descendant();
    }

    /**
     * Set filter text for typeahead filtering.
     * @param {string} filter_text - Filter text.
     * @param {Object} [options] - Optional settings.
     */
    set_filter_text(filter_text, options = {}) {
        this.filter_text = filter_text || '';
        this.filtered_items = filter_items(this.items, this.filter_text);
        if (!options.from_model) {
            this.set_model_value('filter_text', this.filter_text);
        }
        if (this.list && this.list.set_filter_text) {
            this.list.set_filter_text(this.filter_text, {from_model: true});
        }
    }

    /**
     * Set selected item by value.
     * @param {*} value - Selected value.
     * @param {Object} [options] - Optional settings.
     */
    set_selected_value(value, options = {}) {
        const matched_item = find_item_by_value(this.items, value);
        if (matched_item) {
            this.selected_item = matched_item;
            this.active_index = this.filtered_items.findIndex(item => item.id === matched_item.id);
        } else {
            this.selected_item = null;
            this.active_index = -1;
        }

        if (!options.from_model) {
            this.set_model_value('value', value);
            this.set_model_value('selected_item', this.selected_item);
        }

        this.sync_input_to_selection();
        this.update_aria_active_descendant();
    }

    /**
     * Set selected item directly.
     * @param {Object} item - Selected item.
     * @param {Object} [options] - Optional settings.
     */
    set_selected_item(item, options = {}) {
        if (!item) {
            this.selected_item = null;
            this.active_index = -1;
        } else {
            const matched_item = item.value !== undefined
                ? find_item_by_value(this.items, item.value)
                : find_item_by_value(this.items, item);
            this.selected_item = matched_item || null;
            this.active_index = matched_item
                ? this.filtered_items.findIndex(entry => entry.id === matched_item.id)
                : -1;
        }

        if (!options.from_model) {
            const next_value = this.selected_item ? this.selected_item.value : '';
            this.set_model_value('value', next_value);
            this.set_model_value('selected_item', this.selected_item);
        }

        this.sync_input_to_selection();
        this.update_aria_active_descendant();
    }

    /**
     * Set open state for the dropdown.
     * @param {boolean} open - Whether the dropdown is open.
     * @param {Object} [options] - Optional settings.
     */
    set_open(open, options = {}) {
        this.open = !!open;
        if (!options.from_model) {
            this.set_model_value('open', this.open);
        }
        if (this.dropdown) {
            if (this.open) {
                this.dropdown.show();
            } else {
                this.dropdown.hide();
            }
        }
        if (this.input) {
            this.input.dom.attributes['aria-expanded'] = this.open ? 'true' : 'false';
        }
    }

    /**
     * Load items asynchronously using the configured loader.
     * @param {Object} [options] - Options passed to the loader.
     * @returns {Promise<Array>}
     */
    async load_items(options = {}) {
        if (!this.load_items_fn) return [];
        const loaded_items = await this.load_items_fn(options);
        this.set_items(loaded_items || []);
        return this.items;
    }

    /**
     * Get the selected value.
     * @returns {*}
     */
    get_value() {
        return this.selected_item ? this.selected_item.value : '';
    }

    /**
     * Set the selected value.
     * @param {*} value - Value to set.
     */
    set_value(value) {
        this.set_selected_value(value);
    }

    set_model_value(name, value) {
        if (this.data && this.data.model && this.data.model[name] !== value) {
            this.data.model[name] = value;
        }
        if (this.view && this.view.data && this.view.data.model && this.view.data.model[name] !== value) {
            this.view.data.model[name] = value;
        }
    }

    update_aria_active_descendant() {
        if (!this.input) return;
        const active_item = this.selected_item;
        if (active_item && active_item.id) {
            this.input.dom.attributes['aria-activedescendant'] = active_item.id;
        } else {
            this.input.dom.attributes['aria-activedescendant'] = '';
        }
    }

    sync_input_to_selection() {
        if (!this.input) return;
        let next_value = '';
        if (this.selected_item) {
            next_value = this.selected_item.label;
        } else if (this.allow_custom_value) {
            next_value = this.filter_text || '';
        }
        if (this.input.view && this.input.view.data && this.input.view.data.model) {
            this.input.view.data.model.value = next_value;
        } else {
            this.input.dom.attributes.value = next_value;
            if (this.input.dom.el) {
                this.input.dom.el.value = next_value;
            }
        }
    }

    move_active_index(direction) {
        const count = this.filtered_items.length;
        if (!count) return;
        let next_index = this.active_index;
        if (next_index === -1) {
            next_index = direction > 0 ? 0 : count - 1;
        } else {
            next_index = next_index + direction;
            if (next_index < 0) next_index = count - 1;
            if (next_index >= count) next_index = 0;
        }
        this.active_index = next_index;
        if (this.list && this.list.set_active_index) {
            this.list.set_active_index(next_index, {from_model: true});
        }
        const active_item = this.filtered_items[next_index];
        if (active_item) {
            this.selected_item = active_item;
            this.sync_input_to_selection();
            this.update_aria_active_descendant();
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();

            if (this.input && this.input.dom && this.input.dom.el) {
                const input_el = this.input.dom.el;
                input_el.addEventListener('focus', () => {
                    this.set_open(true);
                });
                input_el.addEventListener('click', () => {
                    this.set_open(true);
                });
                input_el.addEventListener('input', () => {
                    if (this.typeahead) {
                        const next_filter = input_el.value || '';
                        this.set_filter_text(next_filter);
                        this.set_open(true);
                    }
                });
                input_el.addEventListener('keydown', e_keydown => {
                    if (e_keydown.key === 'ArrowDown') {
                        e_keydown.preventDefault();
                        this.set_open(true);
                        this.move_active_index(1);
                    } else if (e_keydown.key === 'ArrowUp') {
                        e_keydown.preventDefault();
                        this.set_open(true);
                        this.move_active_index(-1);
                    } else if (e_keydown.key === 'Enter') {
                        e_keydown.preventDefault();
                        if (this.selected_item) {
                            this.set_selected_item(this.selected_item);
                            this.raise('change', {
                                name: 'selected_item',
                                value: this.selected_item
                            });
                        }
                        this.set_open(false);
                    } else if (e_keydown.key === 'Escape') {
                        e_keydown.preventDefault();
                        this.set_open(false);
                    }
                });
            }

            if (this.list) {
                this.list.on('change', e_change => {
                    if (e_change.name === 'selected_item') {
                        this.set_selected_item(e_change.value);
                        this.raise('change', {
                            name: 'selected_item',
                            value: this.selected_item
                        });
                        this.set_open(false);
                    }
                });
            }

            if (this.auto_load && this.load_items_fn && !this.items.length) {
                this.load_items();
            }
        }
    }
}

Combo_Box.css = `
.combo-box {
    position: relative;
    display: inline-block;
    min-width: 160px;
}
.combo-box-input {
    width: 100%;
}
.combo-box-dropdown {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    background: #fff;
    border: 1px solid #ccc;
    z-index: 10;
    max-height: 220px;
    overflow-y: auto;
}
.combo-box-dropdown.hidden {
    display: none;
}
`;

module.exports = Combo_Box;
