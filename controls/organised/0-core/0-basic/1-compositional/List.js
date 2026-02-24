/*
    List control with selectable items, async loading, and typeahead filtering.
*/

const jsgui = require('../../../../../html-core/html-core');
const Item = require('./item');
const { each } = jsgui;
const { prop } = require('lang-tools');
const { field } = require('obext');
const {
    normalize_items,
    find_item_by_value,
    filter_items
} = require('../item_utils');
const { Control, Control_Data, Control_View, Data_Object } = jsgui;
const mx_selectable = require('../../../../../control_mixins/selectable');
const keyboard_navigation = require('../../../../../control_mixins/keyboard_navigation');
const {
    apply_focus_ring,
    apply_label
} = require('../../../../../control_mixins/a11y');
const { themeable } = require('../../../../../control_mixins/themeable');
const { apply_token_map, SPACING_TOKENS } = require('../../../../../themes/token_maps');

/**
 * List Control
 * 
 * A list with selectable items, async loading, and typeahead filtering.
 * 
 * Supports variants: default, compact, divided, large, cards
 * 
 * @example
 * // Basic list
 * new List({ items: ['Apple', 'Banana', 'Cherry'] });
 * 
 * // Compact list
 * new List({ variant: 'compact', items: ['A', 'B', 'C'] });
 * 
 * // List with dividers
 * new List({ variant: 'divided', items: ['Item 1', 'Item 2'] });
 */

class List extends Control {
    constructor(spec = {}) {
        super(spec);
        this.__type_name = 'list';

        // Apply themeable - resolves params and applies hooks
        const params = themeable(this, 'list', spec);

        // Apply spacing tokens if available
        if (params.spacing && SPACING_TOKENS[params.spacing]) {
            this.dom.attributes.style = this.dom.attributes.style || {};
            Object.assign(this.dom.attributes.style, SPACING_TOKENS[params.spacing]);
        }

        prop(this, 'ordered', spec.ordered || false);
        if (this.ordered) {
            this.dom.tagName = 'ol';
        } else {
            this.dom.tagName = 'ul';
        }

        this.add_class('list');
        this.items = [];
        this.filtered_items = [];
        this.filter_text = '';
        this.selected_item = null;
        this.selected_index = -1;
        this.multi_select = !!spec.multi_select;
        this.select_toggle = !!spec.select_toggle;
        this.drag_select = !!spec.drag_select;
        this.aria_label = spec.aria_label;
        this.focusable = spec.focusable !== false;
        this.enable_keyboard = spec.enable_keyboard !== false;
        this.item_id_prefix = `${this._id()}-item`;
        this.item_controls = [];
        this.load_items_fn = typeof spec.load_items === 'function' ? spec.load_items : null;
        this.auto_load = spec.auto_load !== false;

        this.construct_synchronised_data_and_view_models(spec);

        if (spec.items) {
            this.set_items(spec.items, { from_model: true });
        }
        if (spec.filter_text !== undefined) {
            this.set_filter_text(spec.filter_text, { from_model: true });
        }
        if (spec.selected_item !== undefined) {
            this.set_selected_item(spec.selected_item, { from_model: true });
        }

        if (this.focusable) {
            if (spec.tabindex !== undefined) {
                this.dom.attributes.tabindex = String(spec.tabindex);
            } else {
                this.dom.attributes.tabindex = '0';
            }
            apply_focus_ring(this);
        }
        if (this.aria_label !== undefined) {
            apply_label(this, this.aria_label);
        }

        if (!spec.el) {
            this.compose();
        }
    }

    construct_synchronised_data_and_view_models(spec) {
        const { context } = this;
        this.data = new Control_Data({ context });
        if (spec.data && spec.data.model) {
            this.data.model = spec.data.model;
        } else {
            this.data.model = new Data_Object({ context });
        }
        field(this.data.model, 'items');
        field(this.data.model, 'selected_item');
        field(this.data.model, 'filter_text');

        this.view = new Control_View({ context });
        if (spec.view && spec.view.data && spec.view.data.model) {
            this.view.data.model = spec.view.data.model;
        } else {
            this.view.data.model = new Data_Object({ context });
        }
        field(this.view.data.model, 'items');
        field(this.view.data.model, 'selected_item');
        field(this.view.data.model, 'filter_text');

        this.data.model.on('change', e => {
            const { name, value, old } = e;
            if (value === old) return;
            if (name === 'items') {
                this.view.data.model.items = value;
                this.set_items(value, { from_model: true });
            } else if (name === 'selected_item') {
                this.view.data.model.selected_item = value;
                this.set_selected_item(value, { from_model: true });
            } else if (name === 'filter_text') {
                this.view.data.model.filter_text = value;
                this.set_filter_text(value, { from_model: true });
            }
        });

        this.view.data.model.on('change', e => {
            const { name, value, old } = e;
            if (value === old) return;
            if (name === 'items') {
                this.data.model.items = value;
                this.set_items(value, { from_model: true });
            } else if (name === 'selected_item') {
                this.data.model.selected_item = value;
                this.set_selected_item(value, { from_model: true });
            } else if (name === 'filter_text') {
                this.data.model.filter_text = value;
                this.set_filter_text(value, { from_model: true });
            }
        });
    }

    /**
     * Set list items.
     * @param {Array} items - Items to set.
     * @param {Object} [options] - Optional settings.
     */
    set_items(items, options = {}) {
        this.items = normalize_items(items, { id_prefix: this.item_id_prefix });
        this.filtered_items = filter_items(this.items, this.filter_text);
        if (!options.from_model) {
            this.set_model_value('items', items);
        }
        this.compose();
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
        this.compose();
    }

    /**
     * Set selected item.
     * @param {*} selected_item - Item or value to select.
     * @param {Object} [options] - Optional settings.
     */
    set_selected_item(selected_item, options = {}) {
        if (!selected_item) {
            this.selected_item = null;
        } else if (selected_item.value !== undefined) {
            this.selected_item = find_item_by_value(this.items, selected_item.value) || null;
        } else {
            this.selected_item = find_item_by_value(this.items, selected_item) || null;
        }

        if (!options.from_model) {
            this.set_model_value('selected_item', this.selected_item);
        }

        this.selected_index = this.selected_item
            ? this.filtered_items.findIndex(item => item.id === this.selected_item.id)
            : -1;
        this.apply_selection_to_items();
        this.update_aria_active_descendant();
    }

    /**
     * Set selected item by value.
     * @param {*} value - Value to select.
     * @param {Object} [options] - Optional settings.
     */
    set_selected_value(value, options = {}) {
        const matched_item = find_item_by_value(this.items, value);
        this.set_selected_item(matched_item, options);
    }

    /**
     * Get selected item.
     * @returns {Object|null}
     */
    get_selected_item() {
        return this.selected_item || null;
    }

    /**
     * Set active index for keyboard navigation.
     * @param {number} index - Index to activate.
     * @param {Object} [options] - Optional settings.
     */
    set_active_index(index, options = {}) {
        if (index < 0 || index >= this.filtered_items.length) return;
        const item = this.filtered_items[index];
        this.selected_index = index;
        this.selected_item = item;
        if (!options.from_model) {
            this.set_model_value('selected_item', item);
        }
        this.apply_selection_to_items();
        this.update_aria_active_descendant();
        if (options.raise_change) {
            this.raise('change', {
                name: 'selected_item',
                value: this.selected_item,
                index: this.selected_index
            });
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

    set_model_value(name, value) {
        if (this.data && this.data.model && this.data.model[name] !== value) {
            this.data.model[name] = value;
        }
        if (this.view && this.view.data && this.view.data.model && this.view.data.model[name] !== value) {
            this.view.data.model[name] = value;
        }
    }

    apply_selection_to_items() {
        if (!this.item_controls.length) return;
        each(this.item_controls, ctrl_item => {
            const item_id = ctrl_item._fields && ctrl_item._fields.item_id;
            const is_selected = !!(this.selected_item && item_id === this.selected_item.id);
            ctrl_item.dom.attributes['aria-selected'] = is_selected ? 'true' : 'false';
            if (ctrl_item.selected !== is_selected) {
                ctrl_item.selected = is_selected;
            }
        });
    }

    update_aria_active_descendant() {
        const active_item = this.selected_item;
        if (active_item && active_item.id) {
            this.dom.attributes['aria-activedescendant'] = active_item.id;
        } else {
            this.dom.attributes['aria-activedescendant'] = '';
        }
    }

    compose() {
        this.clear();
        this.dom.attributes.role = 'listbox';
        if (this.multi_select) {
            this.dom.attributes['aria-multiselectable'] = 'true';
        }

        this.item_controls = [];
        each(this.filtered_items, (item, index) => {
            let display_value = item.label;
            if (item.original && typeof item.original === 'object' && !Array.isArray(item.original)) {
                if (item.original.icon || item.original.text) {
                    display_value = item.original;
                }
            }

            const ctrl_item = new Item({
                context: this.context,
                value: display_value
            });
            ctrl_item._fields = ctrl_item._fields || {};
            ctrl_item._fields.index = index;
            ctrl_item._fields.item_id = item.id;
            ctrl_item._fields.item_value = item.value;
            ctrl_item.dom.attributes.id = item.id;
            ctrl_item.dom.attributes['data-index'] = String(item.index);
            ctrl_item.dom.attributes['data-value'] = String(item.value);
            ctrl_item.dom.attributes.role = 'option';
            ctrl_item.dom.attributes['aria-selected'] = 'false';

            mx_selectable(ctrl_item, null, {
                multi: this.multi_select,
                toggle: this.select_toggle,
                drag: this.drag_select
            });
            ctrl_item.selectable = true;
            ctrl_item.on('change', e_change => {
                if (e_change.name === 'selected' && e_change.value) {
                    this.set_selected_item(item, { from_model: true });
                    this.raise('change', {
                        name: 'selected_item',
                        value: this.selected_item,
                        index: this.selected_index
                    });
                }
            });

            this.add(ctrl_item);
            this.item_controls.push(ctrl_item);
        });

        this.apply_selection_to_items();
        this.update_aria_active_descendant();
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const selection_scope = this.find_selection_scope();
            if (selection_scope && selection_scope.on) {
                selection_scope.on('change', e_change => {
                    const selected_ctrl = e_change.value;
                    if (selected_ctrl && selected_ctrl._fields && selected_ctrl._fields.item_id) {
                        const item = this.items.find(entry => entry.id === selected_ctrl._fields.item_id);
                        if (item) {
                            this.set_selected_item(item, { from_model: true });
                        }
                    } else {
                        this.set_selected_item(null, { from_model: true });
                    }
                    this.raise('change', {
                        name: 'selected_item',
                        value: this.selected_item,
                        index: this.selected_index
                    });
                });
            }
            if (this.auto_load && this.load_items_fn && !this.items.length) {
                this.load_items();
            }
            if (this.enable_keyboard) {
                keyboard_navigation(this, {
                    orientation: 'vertical',
                    get_items: () => this.item_controls,
                    get_active_index: () => this.selected_index,
                    set_active_index: (index) => {
                        this.set_active_index(index, { from_model: true, raise_change: true });
                    },
                    on_activate: () => {
                        if (this.selected_item) {
                            this.raise('change', {
                                name: 'selected_item',
                                value: this.selected_item,
                                index: this.selected_index
                            });
                        }
                    }
                });
            }

            // Drag selection: listen for drag events on items and select ranges
            if (this.drag_select) {
                let drag_start_index = null;
                this.item_controls.forEach((ctrl, idx) => {
                    ctrl.on('drag-select-start', () => {
                        drag_start_index = idx;
                    });
                    ctrl.on('drag-select-move', (e) => {
                        if (drag_start_index === null) return;
                        const evt = e.event || e;
                        const el_under = document.elementFromPoint(
                            evt.clientX, evt.clientY
                        );
                        if (!el_under) return;
                        const end_idx = this._find_item_index_from_el(el_under);
                        if (end_idx !== null) {
                            this._select_item_range(drag_start_index, end_idx);
                        }
                    });
                    ctrl.on('drag-select-end', () => {
                        if (drag_start_index !== null) {
                            this.raise('drag-selection-change', {
                                indices: this._get_selected_indices()
                            });
                        }
                        drag_start_index = null;
                    });
                });
            }
        }
    }
    '_find_item_index_from_el'(el) {
        let current = el;
        while (current && current !== this.dom.el) {
            for (let i = 0; i < this.item_controls.length; i++) {
                const ctrl = this.item_controls[i];
                const ctrl_el = (ctrl.dom && ctrl.dom.el) || ctrl.el;
                if (ctrl_el && (ctrl_el === current || ctrl_el.contains(current))) {
                    return i;
                }
            }
            current = current.parentElement;
        }
        return null;
    }
    '_select_item_range'(start_idx, end_idx) {
        const lo = Math.min(start_idx, end_idx);
        const hi = Math.max(start_idx, end_idx);
        this.item_controls.forEach((ctrl, i) => {
            ctrl.selected = (i >= lo && i <= hi);
        });
    }
    '_get_selected_indices'() {
        const indices = [];
        this.item_controls.forEach((ctrl, i) => {
            if (ctrl.selected) indices.push(i);
        });
        return indices;
    }
}

module.exports = List;
