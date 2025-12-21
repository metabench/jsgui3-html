const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

class Breadcrumbs extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'breadcrumbs';
        super(spec);
        this.add_class('breadcrumbs');
        this.dom.tagName = 'nav';
        this.dom.attributes['aria-label'] = 'Breadcrumb';

        this.items = Array.isArray(spec.items) ? spec.items.slice() : [];

        if (!spec.el) {
            this.compose_breadcrumbs();
        }
    }

    compose_breadcrumbs() {
        const { context } = this;
        const list_ctrl = new Control({ context });
        list_ctrl.dom.tagName = 'ol';
        list_ctrl.add_class('breadcrumbs-list');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.list = list_ctrl;

        this.add(list_ctrl);
        this.render_items();
    }

    render_items() {
        const list_ctrl = this._ctrl_fields && this._ctrl_fields.list;
        if (!list_ctrl) return;

        list_ctrl.clear();
        this.items.forEach((item, index) => {
            const li_ctrl = new Control({ context: this.context });
            li_ctrl.dom.tagName = 'li';
            li_ctrl.add_class('breadcrumbs-item');

            const label = is_defined(item.label) ? String(item.label) : String(item);
            const href = is_defined(item.href) ? String(item.href) : '';

            const link_ctrl = new Control({ context: this.context });
            link_ctrl.dom.tagName = href ? 'a' : 'button';
            link_ctrl.add_class('breadcrumbs-link');
            link_ctrl.dom.attributes['data-breadcrumb-index'] = String(index);
            if (href) {
                link_ctrl.dom.attributes.href = href;
            } else {
                link_ctrl.dom.attributes.type = 'button';
            }
            link_ctrl.add(label);

            li_ctrl.add(link_ctrl);
            list_ctrl.add(li_ctrl);
        });
    }

    /**
     * Set breadcrumb items.
     * @param {Array} items - The items to set.
     */
    set_items(items) {
        this.items = Array.isArray(items) ? items.slice() : [];
        this.render_items();
    }

    /**
     * Get breadcrumb items.
     * @returns {Array}
     */
    get_items() {
        return this.items;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const list_ctrl = this._ctrl_fields && this._ctrl_fields.list;
            if (!list_ctrl || !list_ctrl.dom.el) return;

            list_ctrl.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target || !target.getAttribute) return;
                const index_str = target.getAttribute('data-breadcrumb-index');
                if (!is_defined(index_str)) return;
                const index = parseInt(index_str, 10);
                if (Number.isNaN(index)) return;
                e_click.preventDefault();
                const item = this.items[index];
                this.raise('navigate', { index, item });
            });
        }
    }
}

Breadcrumbs.css = `
.breadcrumbs-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0;
    margin: 0;
}
.breadcrumbs-item::after {
    content: '/';
    margin-left: 6px;
    color: #888;
}
.breadcrumbs-item:last-child::after {
    content: '';
}
.breadcrumbs-link {
    text-decoration: none;
    color: inherit;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
}
`;

module.exports = Breadcrumbs;
