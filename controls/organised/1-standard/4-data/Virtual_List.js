const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');
const apply_virtual_window = require('../../../../control_mixins/virtual_window');

const normalize_items = items => (Array.isArray(items) ? items.slice() : []);

class Virtual_List extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'virtual_list';
        super(spec);
        this.add_class('virtual-list');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        const item_height = is_defined(spec.item_height) ? Number(spec.item_height) : 32;
        const height = is_defined(spec.height) ? Number(spec.height) : 240;
        const buffer = is_defined(spec.buffer) ? Number(spec.buffer) : 3;

        this.item_height = Number.isFinite(item_height) ? item_height : 32;
        this.height = Number.isFinite(height) ? height : 240;
        this.buffer = Number.isFinite(buffer) ? buffer : 3;
        this.item_renderer = spec.item_renderer;

        apply_virtual_window(this, {
            item_height: this.item_height,
            height: this.height,
            buffer: this.buffer
        });

        this.set_items(spec.items || []);

        if (!spec.el) {
            this.compose_virtual_list();
        }

        this.bind_model();
    }

    compose_virtual_list() {
        const { context } = this;

        const viewport_ctrl = new Control({ context, tag_name: 'div' });
        viewport_ctrl.add_class('virtual-list-viewport');
        viewport_ctrl.dom.attributes.style.height = `${this.height}px`;
        viewport_ctrl.dom.attributes.style['overflow-y'] = 'auto';
        viewport_ctrl.dom.attributes.style.position = 'relative';

        const spacer_ctrl = new Control({ context, tag_name: 'div' });
        spacer_ctrl.add_class('virtual-list-spacer');

        const items_ctrl = new Control({ context, tag_name: 'div' });
        items_ctrl.add_class('virtual-list-items');
        items_ctrl.dom.attributes.style.position = 'absolute';
        items_ctrl.dom.attributes.style.top = '0px';
        items_ctrl.dom.attributes.style.left = '0px';
        items_ctrl.dom.attributes.style.right = '0px';

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.viewport = viewport_ctrl;
        this._ctrl_fields.spacer = spacer_ctrl;
        this._ctrl_fields.items = items_ctrl;

        viewport_ctrl.add(spacer_ctrl);
        viewport_ctrl.add(items_ctrl);
        this.add(viewport_ctrl);

        this.render_window(0);
    }

    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            if (e_change.name === 'items') {
                this.items = Array.isArray(e_change.value) ? e_change.value : [];
                this.render_window(0);
            }
        });
    }

    set_model_value(name, value) {
        if (this.model && typeof this.model.set === 'function') {
            this.model.set(name, value);
        } else if (this.model) {
            this.model[name] = value;
        }
    }

    /**
     * Set list items.
     * @param {Array} items - Items to set.
     */
    set_items(items) {
        const list_items = normalize_items(items);
        this.set_model_value('items', list_items);
        this.items = list_items;
    }

    /**
     * Get list items.
     * @returns {Array}
     */
    get_items() {
        return this.items || [];
    }

    get_total_height() {
        return this.get_virtual_total_height(this.get_items().length, { row_height: this.item_height });
    }

    render_window(scroll_top) {
        const viewport_ctrl = this._ctrl_fields && this._ctrl_fields.viewport;
        const spacer_ctrl = this._ctrl_fields && this._ctrl_fields.spacer;
        const items_ctrl = this._ctrl_fields && this._ctrl_fields.items;
        if (!viewport_ctrl || !spacer_ctrl || !items_ctrl) return;

        const items = this.get_items();
        const total_height = this.get_total_height();
        spacer_ctrl.dom.attributes.style.height = `${total_height}px`;

        const range = this.get_virtual_window_range(scroll_top, items.length, {
            item_height: this.item_height,
            viewport_height: this.height,
            buffer: this.buffer
        });
        const start_index = range.start_index;
        const end_index = range.end_index;

        items_ctrl.dom.attributes.style.transform = `translateY(${start_index * this.item_height}px)`;
        items_ctrl.clear();

        for (let index = start_index; index < end_index; index += 1) {
            const item = items[index];
            let item_ctrl;
            if (typeof this.item_renderer === 'function') {
                const rendered = this.item_renderer(item, index);
                if (rendered instanceof Control) {
                    item_ctrl = rendered;
                } else {
                    item_ctrl = new Control({ context: this.context, tag_name: 'div' });
                    if (is_defined(rendered)) item_ctrl.add(String(rendered));
                }
            } else {
                item_ctrl = new Control({ context: this.context, tag_name: 'div' });
                if (is_defined(item)) item_ctrl.add(String(item));
            }

            item_ctrl.add_class('virtual-list-item');
            item_ctrl.dom.attributes.style.height = `${this.item_height}px`;
            item_ctrl.dom.attributes['data-index'] = String(index);
            items_ctrl.add(item_ctrl);
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const viewport_ctrl = this._ctrl_fields && this._ctrl_fields.viewport;
            if (!viewport_ctrl || !viewport_ctrl.dom.el) return;

            viewport_ctrl.add_dom_event_listener('scroll', () => {
                const scroll_top = viewport_ctrl.dom.el.scrollTop || 0;
                this.render_window(scroll_top);
            });
        }
    }
}

Virtual_List.css = `
.virtual-list {
    width: 100%;
}
.virtual-list-item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    box-sizing: border-box;
}
`;

module.exports = Virtual_List;
