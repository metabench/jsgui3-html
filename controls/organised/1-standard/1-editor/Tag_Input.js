const jsgui = require('../../../../html-core/html-core');

const { Control, Data_Object } = jsgui;
const { is_defined } = jsgui;

class Tag_Input extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'tag_input';
        super(spec);
        this.add_class('tag-input');

        const { context } = this;
        const items = Array.isArray(spec.items) ? spec.items.slice() : [];

        this.model = spec.model instanceof Data_Object
            ? spec.model
            : new Data_Object({ context, items, input_value: '' });

        if (!spec.el) {
            this.compose_tag_input(items, spec.placeholder);
        }
    }

    compose_tag_input(items, placeholder) {
        const { context } = this;

        const tags_container = new Control({ context });
        tags_container.dom.tagName = 'div';
        tags_container.add_class('tag-input-items');

        const input_ctrl = new Control({ context });
        input_ctrl.dom.tagName = 'input';
        input_ctrl.dom.attributes.type = 'text';
        input_ctrl.dom.attributes.autocomplete = 'off';
        if (is_defined(placeholder)) {
            input_ctrl.dom.attributes.placeholder = String(placeholder);
        }
        input_ctrl.add_class('tag-input-field');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.tags_container = tags_container;
        this._ctrl_fields.input_ctrl = input_ctrl;

        this.add(tags_container);
        this.add(input_ctrl);

        this.set_items(items);
    }

    render_tags() {
        const tags_container = this._ctrl_fields && this._ctrl_fields.tags_container;
        if (!tags_container) return;

        tags_container.clear();
        const items = this.get_items();

        items.forEach((item, index) => {
            const tag_ctrl = new Control({ context: this.context });
            tag_ctrl.dom.tagName = 'span';
            tag_ctrl.add_class('tag-input-item');

            const text_ctrl = new Control({ context: this.context });
            text_ctrl.dom.tagName = 'span';
            text_ctrl.add_class('tag-input-text');
            text_ctrl.add(String(item));

            const remove_ctrl = new Control({ context: this.context });
            remove_ctrl.dom.tagName = 'button';
            remove_ctrl.dom.attributes.type = 'button';
            remove_ctrl.dom.attributes['data-tag-index'] = String(index);
            remove_ctrl.add_class('tag-input-remove');
            remove_ctrl.add('x');

            tag_ctrl.add(text_ctrl);
            tag_ctrl.add(remove_ctrl);
            tags_container.add(tag_ctrl);
        });
    }

    /**
     * Set the tag items.
     * @param {Array} items - The items to set.
     */
    set_items(items) {
        const next_items = Array.isArray(items) ? items.slice() : [];
        this.model.items = next_items;
        this.render_tags();
    }

    /**
     * Get the tag items.
     * @returns {Array}
     */
    get_items() {
        return Array.isArray(this.model.items) ? this.model.items : [];
    }

    /**
     * Add a tag item.
     * @param {*} item - The item to add.
     */
    add_item(item) {
        if (!is_defined(item)) return;
        const items = this.get_items();
        const next_items = items.slice();
        next_items.push(item);
        this.set_items(next_items);
    }

    /**
     * Remove a tag item.
     * @param {*} item_or_index - Index or item value to remove.
     */
    remove_item(item_or_index) {
        const items = this.get_items();
        if (!items.length) return;

        let next_items = items.slice();
        if (typeof item_or_index === 'number') {
            if (item_or_index >= 0 && item_or_index < next_items.length) {
                next_items.splice(item_or_index, 1);
            }
        } else {
            const index = next_items.indexOf(item_or_index);
            if (index >= 0) {
                next_items.splice(index, 1);
            }
        }

        this.set_items(next_items);
    }

    activate() {
        if (!this.__active) {
            super.activate();

            const tags_container = this._ctrl_fields && this._ctrl_fields.tags_container;
            const input_ctrl = this._ctrl_fields && this._ctrl_fields.input_ctrl;
            if (!tags_container || !input_ctrl || !input_ctrl.dom.el) return;

            const add_from_input = () => {
                const raw_value = input_ctrl.dom.el.value.trim();
                if (!raw_value) return;
                this.add_item(raw_value);
                input_ctrl.dom.el.value = '';
                this.model.input_value = '';
            };

            input_ctrl.add_dom_event_listener('input', () => {
                this.model.input_value = input_ctrl.dom.el.value;
            });

            input_ctrl.add_dom_event_listener('keydown', e_key => {
                const key = e_key.key || e_key.keyCode;
                if (key === 'Enter' || key === ',' || key === 13 || key === 188) {
                    e_key.preventDefault();
                    add_from_input();
                } else if ((key === 'Backspace' || key === 8) && input_ctrl.dom.el.value === '') {
                    const items = this.get_items();
                    if (items.length) {
                        this.remove_item(items.length - 1);
                    }
                }
            });

            if (tags_container.dom.el) {
                tags_container.add_dom_event_listener('click', e_click => {
                    const target = e_click.target;
                    if (!target || !target.getAttribute) return;
                    const index_str = target.getAttribute('data-tag-index');
                    if (!is_defined(index_str)) return;
                    const index = parseInt(index_str, 10);
                    if (!Number.isNaN(index)) {
                        this.remove_item(index);
                    }
                });
            }
        }
    }
}

Tag_Input.css = `
.tag-input {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 6px;
}
.tag-input-items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.tag-input-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 999px;
    background: #f0f0f0;
}
.tag-input-remove {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.8em;
}
.tag-input-field {
    border: none;
    outline: none;
    min-width: 120px;
}
`;

module.exports = Tag_Input;
