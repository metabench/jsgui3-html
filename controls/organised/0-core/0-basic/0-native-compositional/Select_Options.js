const jsgui = require('../../../../../html-core/html-core');
const {Control, Control_Data, Control_View, Data_Object, each} = jsgui;
const {field} = require('obext');
const {
    normalize_items,
    find_item_by_value,
    filter_items
} = require('../item_utils');
const {
    apply_focus_ring,
    apply_label
} = require('../../../../../control_mixins/a11y');
const { apply_full_input_api } = require('../../../../../control_mixins/input_api');

class Select_Options extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'select_options';
        spec.tag_name = 'select';
        super(spec);
        this.add_class('select-options');
        this.enhance_only = !!spec.enhance_only && !!spec.el;

        const {context} = this;
        this.items = [];
        this.filtered_items = [];
        this.filter_text = '';
        this.selected_item = null;
        this.load_items_fn = typeof spec.load_items === 'function' ? spec.load_items : null;
        this.auto_load = spec.auto_load !== false;
        this.item_id_prefix = `${this._id()}-option`;
        this.aria_label = spec.aria_label;

        this.construct_synchronised_data_and_view_models(spec, context);

        apply_full_input_api(this, {
            disabled: spec.disabled,
            readonly: spec.readonly,
            required: spec.required,
            get_value: () => {
                if (this.data && this.data.model && this.data.model.value !== undefined) {
                    return this.data.model.value;
                }
                return this.selected_item ? this.selected_item.value : '';
            },
            set_value: value => {
                this.set_selected_value(value);
            }
        });

        if (spec.items || spec.options) {
            this.set_items(spec.items || spec.options, {from_model: true});
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

        apply_focus_ring(this);
        if (this.aria_label !== undefined) {
            apply_label(this, this.aria_label);
        }

        if (!spec.el) {
            this.compose();
        }
    }

    construct_synchronised_data_and_view_models(spec, context) {
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
            }
        });
    }

    /**
     * Set items for the select options control.
     * @param {Array} items - Items to set.
     * @param {Object} [options] - Optional settings.
     */
    set_items(items, options = {}) {
        this.items = normalize_items(items, {id_prefix: this.item_id_prefix});
        this.filtered_items = filter_items(this.items, this.filter_text);

        if (!options.from_model) {
            this.set_model_value('items', items);
        }
        this.compose();
    }

    /**
     * Set the filter text for typeahead filtering.
     * @param {string} filter_text - Filter text.
     * @param {Object} [options] - Optional settings.
     */
    set_filter_text(filter_text, options = {}) {
        this.filter_text = filter_text || '';
        this.filtered_items = filter_items(this.items, this.filter_text);
        if (!options.from_model) {
            this.set_model_value('filter_text', this.filter_text);
        }
        this.compose();
    }

    /**
     * Set the selected item by value.
     * @param {*} value - Selected value.
     * @param {Object} [options] - Optional settings.
     */
    set_selected_value(value, options = {}) {
        const matched_item = find_item_by_value(this.items, value);
        if (matched_item) {
            this.selected_item = matched_item;
        } else {
            this.selected_item = null;
        }

        if (!options.from_model) {
            this.set_model_value('value', value);
            this.set_model_value('selected_item', this.selected_item);
        }

        if (this.dom.el) {
            this.dom.el.value = value;
        }
        this.update_aria_active_descendant();
        this.apply_option_selection();
    }

    /**
     * Set the selected item directly.
     * @param {Object} item - Selected item.
     * @param {Object} [options] - Optional settings.
     */
    set_selected_item(item, options = {}) {
        if (!item) {
            this.selected_item = null;
        } else {
            const matched_item = item.value !== undefined
                ? find_item_by_value(this.items, item.value)
                : find_item_by_value(this.items, item);
            this.selected_item = matched_item || null;
        }

        if (!options.from_model) {
            const next_value = this.selected_item ? this.selected_item.value : '';
            this.set_model_value('value', next_value);
            this.set_model_value('selected_item', this.selected_item);
        }
        this.update_aria_active_descendant();
        this.apply_option_selection();
    }

    /**
     * Load items asynchronously using the configured loader.
     * @param {Object} [options] - Options passed to the loader.
     * @returns {Promise<Array>} - Loaded items.
     */
    async load_items(options = {}) {
        if (!this.load_items_fn) return [];
        const loaded_items = await this.load_items_fn(options);
        this.set_items(loaded_items || []);
        return this.items;
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
        const active_item = this.selected_item;
        if (active_item && active_item.id) {
            this.dom.attributes['aria-activedescendant'] = active_item.id;
            if (this.dom.el && typeof this.dom.el.setAttribute === 'function') {
                this.dom.el.setAttribute('aria-activedescendant', active_item.id);
            }
        } else {
            this.dom.attributes['aria-activedescendant'] = '';
            if (this.dom.el && typeof this.dom.el.removeAttribute === 'function') {
                this.dom.el.removeAttribute('aria-activedescendant');
            }
        }
    }

    apply_option_selection() {
        if (!this.content || !this.content.each) return;
        this.content.each(ctrl_option => {
            const option_id = ctrl_option.dom && ctrl_option.dom.attributes && ctrl_option.dom.attributes.id;
            const is_selected = !!(this.selected_item && option_id === this.selected_item.id);
            ctrl_option.dom.attributes['aria-selected'] = is_selected ? 'true' : 'false';
        });
    }

    compose() {
        if (this.enhance_only && this.dom.el) {
            this.dom.attributes.role = this.dom.attributes.role || 'listbox';
            if (typeof this.dom.el.setAttribute === 'function') {
                this.dom.el.setAttribute('role', this.dom.attributes.role);
            }
            this.update_aria_active_descendant();
            return;
        }

        this.clear();
        this.dom.attributes.role = 'listbox';

        const {context} = this;
        each(this.filtered_items, item => {
            const ctrl_option = new jsgui.option({
                context
            });
            ctrl_option.dom.attributes.value = item.value;
            ctrl_option.dom.attributes.id = item.id;
            ctrl_option.dom.attributes['aria-selected'] = item === this.selected_item ? 'true' : 'false';
            if (item.disabled) {
                ctrl_option.dom.attributes.disabled = 'disabled';
            }
            ctrl_option.add(item.label);
            this.add(ctrl_option);
        });
        if (this.selected_item) {
            this.dom.attributes.value = this.selected_item.value;
        }
        this.update_aria_active_descendant();
    }

    _load_items_from_dom() {
        if (!this.dom.el || !this.dom.el.options) return;
        const dom_items = [];
        const options = this.dom.el.options;
        for (let i = 0; i < options.length; i += 1) {
            const option = options[i];
            dom_items.push({
                value: option.value,
                label: option.text,
                disabled: option.disabled,
                id: option.id || `${this.item_id_prefix}-${i}`
            });
        }

        this.items = normalize_items(dom_items, {id_prefix: this.item_id_prefix});
        this.filtered_items = filter_items(this.items, this.filter_text);

        if (this.dom.el) {
            this.set_selected_value(this.dom.el.value);
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (this.dom.el) {
                if (this.enhance_only && !this.items.length) {
                    this._load_items_from_dom();
                }
                this.add_dom_event_listener('change', () => {
                    const next_value = this.dom.el.value;
                    this.set_selected_value(next_value);
                    this.raise('change', {
                        name: 'selected_item',
                        value: this.selected_item
                    });
                });
            }
            if (this.auto_load && this.load_items_fn && !this.items.length) {
                this.load_items();
            }
        }
    }
}

const { register_swap } = require('../../../../../control_mixins/swap_registry');

const should_enhance = el => {
    if (!el || !el.classList) return false;
    if (el.classList.contains('jsgui-enhance')) return true;
    if (typeof el.closest === 'function' && el.closest('.jsgui-form')) return true;
    return false;
};

register_swap('select', Select_Options, {
    enhancement_mode: 'enhance',
    predicate: should_enhance
});

module.exports = Select_Options;
