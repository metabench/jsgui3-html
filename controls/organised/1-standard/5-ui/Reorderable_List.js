const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');

const normalize_items = items => (Array.isArray(items) ? items.slice() : []);

class Reorderable_List extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'reorderable_list';
        super(spec);
        this.add_class('reorderable-list');
        this.dom.tagName = 'ul';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this.item_renderer = spec.item_renderer;

        this.set_items(spec.items || []);

        if (!spec.el) {
            this.render_items();
        }

        this.bind_model();
    }

    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            if (e_change.name === 'items') {
                this.items = Array.isArray(e_change.value) ? e_change.value : [];
                this.render_items();
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
     * Set the list items.
     * @param {Array} items - Items to set.
     */
    set_items(items) {
        const list_items = normalize_items(items);
        this.set_model_value('items', list_items);
        this.items = list_items;
    }

    /**
     * Get the list items.
     * @returns {Array}
     */
    get_items() {
        return this.items || [];
    }

    /**
     * Move an item from one index to another.
     * @param {number} from_index - Starting index.
     * @param {number} to_index - Destination index.
     */
    move_item(from_index, to_index) {
        const items = this.get_items();
        if (!items.length) return;
        if (from_index === to_index) return;
        if (from_index < 0 || from_index >= items.length) return;

        const next_items = items.slice();
        const [moved_item] = next_items.splice(from_index, 1);
        const insert_index = Math.max(0, Math.min(to_index, next_items.length));
        next_items.splice(insert_index, 0, moved_item);
        this.set_items(next_items);
        this.raise('reorder', {
            from_index,
            to_index: insert_index,
            items: next_items
        });
        this.focus_item(insert_index);
    }

    focus_item(index) {
        if (!this.dom.el) return;
        const item_el = this.dom.el.querySelector(`[data-index="${index}"]`);
        if (item_el && typeof item_el.focus === 'function') {
            item_el.focus();
        }
    }

    render_items() {
        this.clear();
        const items = this.get_items();

        items.forEach((item, index) => {
            const item_ctrl = new Control({ context: this.context, tag_name: 'li' });
            item_ctrl.add_class('reorderable-list-item');
            item_ctrl.dom.attributes['data-index'] = String(index);
            item_ctrl.dom.attributes.draggable = 'true';
            item_ctrl.dom.attributes.tabindex = '0';

            if (typeof this.item_renderer === 'function') {
                const rendered = this.item_renderer(item, index);
                if (rendered instanceof Control) {
                    item_ctrl.add(rendered);
                } else if (is_defined(rendered)) {
                    item_ctrl.add(String(rendered));
                }
            } else if (is_defined(item)) {
                item_ctrl.add(String(item));
            }

            this.add(item_ctrl);
        });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            const find_item_el = target => {
                let node = target;
                while (node && node.getAttribute) {
                    if (node.getAttribute('data-index') !== null) return node;
                    node = node.parentNode;
                }
                return null;
            };

            let drag_index = null;

            this.add_dom_event_listener('dragstart', e_drag => {
                const item_el = find_item_el(e_drag.target);
                if (!item_el) return;
                drag_index = parseInt(item_el.getAttribute('data-index'), 10);
                item_el.classList.add('is-dragging');
                if (e_drag.dataTransfer) {
                    e_drag.dataTransfer.effectAllowed = 'move';
                    e_drag.dataTransfer.setData('text/plain', String(drag_index));
                }
            });

            this.add_dom_event_listener('dragover', e_drag => {
                const item_el = find_item_el(e_drag.target);
                if (!item_el) return;
                e_drag.preventDefault();
                item_el.classList.add('is-drag-over');
            });

            this.add_dom_event_listener('dragleave', e_drag => {
                const item_el = find_item_el(e_drag.target);
                if (!item_el) return;
                item_el.classList.remove('is-drag-over');
            });

            this.add_dom_event_listener('drop', e_drop => {
                e_drop.preventDefault();
                const item_el = find_item_el(e_drop.target);
                if (!item_el) return;
                const drop_index = parseInt(item_el.getAttribute('data-index'), 10);
                const from_index = drag_index;
                drag_index = null;
                if (Number.isNaN(from_index) || Number.isNaN(drop_index)) return;
                item_el.classList.remove('is-drag-over');
                this.move_item(from_index, drop_index);
            });

            this.add_dom_event_listener('dragend', () => {
                drag_index = null;
                if (!this.dom.el) return;
                const dragging_el = this.dom.el.querySelector('.reorderable-list-item.is-dragging');
                if (dragging_el) dragging_el.classList.remove('is-dragging');
                const over_els = this.dom.el.querySelectorAll('.reorderable-list-item.is-drag-over');
                over_els.forEach(el => el.classList.remove('is-drag-over'));
            });

            this.add_dom_event_listener('keydown', e_key => {
                const item_el = find_item_el(e_key.target);
                if (!item_el) return;
                const key = e_key.key || e_key.keyCode;
                const move_up = (key === 'ArrowUp' || key === 38) && (e_key.ctrlKey || e_key.altKey);
                const move_down = (key === 'ArrowDown' || key === 40) && (e_key.ctrlKey || e_key.altKey);
                if (!move_up && !move_down) return;
                e_key.preventDefault();
                const index = parseInt(item_el.getAttribute('data-index'), 10);
                if (Number.isNaN(index)) return;
                const next_index = move_up ? index - 1 : index + 1;
                this.move_item(index, next_index);
            });
        }
    }
}

Reorderable_List.css = `
.reorderable-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.reorderable-list-item {
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    cursor: grab;
}
.reorderable-list-item.is-dragging {
    opacity: 0.5;
}
.reorderable-list-item.is-drag-over {
    border-color: #999;
    background: #f5f5f5;
}
`;

module.exports = Reorderable_List;
