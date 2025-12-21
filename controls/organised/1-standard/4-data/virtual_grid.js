const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');
const apply_virtual_window = require('../../../../control_mixins/virtual_window');

const normalize_items = items => (Array.isArray(items) ? items.slice() : []);

class Virtual_Grid extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'virtual_grid';
        super(spec);
        this.add_class('virtual-grid');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        const item_height = is_defined(spec.item_height) ? Number(spec.item_height) : 120;
        const item_width = is_defined(spec.item_width) ? Number(spec.item_width) : null;
        const height = is_defined(spec.height) ? Number(spec.height) : 320;
        const buffer = is_defined(spec.buffer) ? Number(spec.buffer) : 2;
        const column_count = is_defined(spec.column_count) ? Number(spec.column_count) : 3;
        const gap = is_defined(spec.gap) ? Number(spec.gap) : 12;

        this.item_height = Number.isFinite(item_height) ? item_height : 120;
        this.item_width = Number.isFinite(item_width) ? item_width : null;
        this.height = Number.isFinite(height) ? height : 320;
        this.buffer = Number.isFinite(buffer) ? buffer : 2;
        this.column_count = Number.isFinite(column_count) ? Math.max(1, column_count) : 3;
        this.gap = Number.isFinite(gap) ? gap : 12;
        this.item_renderer = spec.item_renderer;

        apply_virtual_window(this, {
            item_height: this.item_height,
            height: this.height,
            buffer: this.buffer
        });

        this.set_items(spec.items || []);

        if (!spec.el) {
            this.compose_virtual_grid();
        }

        this.bind_model();
    }

    compose_virtual_grid() {
        const { context } = this;

        const viewport_ctrl = new Control({ context, tag_name: 'div' });
        viewport_ctrl.add_class('virtual-grid-viewport');
        viewport_ctrl.dom.attributes.style.height = `${this.height}px`;
        viewport_ctrl.dom.attributes.style['overflow-y'] = 'auto';
        viewport_ctrl.dom.attributes.style.position = 'relative';

        const spacer_ctrl = new Control({ context, tag_name: 'div' });
        spacer_ctrl.add_class('virtual-grid-spacer');

        const items_ctrl = new Control({ context, tag_name: 'div' });
        items_ctrl.add_class('virtual-grid-items');
        items_ctrl.dom.attributes.style.position = 'absolute';
        items_ctrl.dom.attributes.style.top = '0px';
        items_ctrl.dom.attributes.style.left = '0px';
        items_ctrl.dom.attributes.style.right = '0px';
        items_ctrl.dom.attributes.style.display = 'grid';
        items_ctrl.dom.attributes.style['grid-auto-rows'] = `${this.item_height}px`;
        items_ctrl.dom.attributes.style.gap = `${this.gap}px`;

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
     * Set grid items.
     * @param {Array} items - Items to set.
     */
    set_items(items) {
        const list_items = normalize_items(items);
        this.set_model_value('items', list_items);
        this.items = list_items;
    }

    /**
     * Get grid items.
     * @returns {Array}
     */
    get_items() {
        return this.items || [];
    }

    get_row_count() {
        const items = this.get_items();
        return Math.ceil(items.length / this.column_count);
    }

    get_row_height() {
        return this.item_height + this.gap;
    }

    render_window(scroll_top) {
        const viewport_ctrl = this._ctrl_fields && this._ctrl_fields.viewport;
        const spacer_ctrl = this._ctrl_fields && this._ctrl_fields.spacer;
        const items_ctrl = this._ctrl_fields && this._ctrl_fields.items;
        if (!viewport_ctrl || !spacer_ctrl || !items_ctrl) return;

        const items = this.get_items();
        const row_count = this.get_row_count();
        const row_height = this.get_row_height();
        const total_height = this.get_virtual_total_height(row_count, {
            row_height,
            gap: this.gap
        });
        spacer_ctrl.dom.attributes.style.height = `${total_height}px`;

        const range = this.get_virtual_window_range(scroll_top, row_count, {
            item_height: row_height,
            viewport_height: this.height,
            buffer: this.buffer
        });
        const start_row = range.start_index;
        const end_row = range.end_index;

        const grid_columns = this.item_width
            ? `repeat(${this.column_count}, ${this.item_width}px)`
            : `repeat(${this.column_count}, minmax(0, 1fr))`;
        items_ctrl.dom.attributes.style['grid-template-columns'] = grid_columns;
        items_ctrl.dom.attributes.style.transform = `translateY(${start_row * row_height}px)`;
        items_ctrl.clear();

        for (let row_index = start_row; row_index < end_row; row_index += 1) {
            for (let col_index = 0; col_index < this.column_count; col_index += 1) {
                const item_index = row_index * this.column_count + col_index;
                if (item_index >= items.length) break;
                const item = items[item_index];
                let item_ctrl;

                if (typeof this.item_renderer === 'function') {
                    const rendered = this.item_renderer(item, item_index);
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

                item_ctrl.add_class('virtual-grid-item');
                item_ctrl.dom.attributes.style.height = `${this.item_height}px`;
                item_ctrl.dom.attributes['data-index'] = String(item_index);
                items_ctrl.add(item_ctrl);
            }
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

Virtual_Grid.css = `
.virtual-grid {
    width: 100%;
}
.virtual-grid-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    box-sizing: border-box;
    border: 1px solid #e5e5e5;
    background: #fafafa;
}
`;

module.exports = Virtual_Grid;
