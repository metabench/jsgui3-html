const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

class Pagination extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'pagination';
        super(spec);
        this.add_class('pagination');
        this.dom.tagName = 'nav';
        this.dom.attributes['aria-label'] = 'Pagination';

        this.page = is_defined(spec.page) ? Number(spec.page) : 1;
        this.page_count = is_defined(spec.page_count) ? Number(spec.page_count) : 1;
        this.page_size = is_defined(spec.page_size) ? Number(spec.page_size) : undefined;

        if (!spec.el) {
            this.compose_pagination();
        }
    }

    compose_pagination() {
        const { context } = this;
        const list_ctrl = new Control({ context });
        list_ctrl.dom.tagName = 'ul';
        list_ctrl.add_class('pagination-list');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.list = list_ctrl;

        this.add(list_ctrl);
        this.render_pages();
    }

    render_pages() {
        const list_ctrl = this._ctrl_fields && this._ctrl_fields.list;
        if (!list_ctrl) return;

        list_ctrl.clear();

        const total_pages = Math.max(1, this.page_count || 1);
        const current_page = Math.min(Math.max(1, this.page || 1), total_pages);
        this.page = current_page;

        const add_button = (label, page, disabled, is_current) => {
            const li_ctrl = new Control({ context: this.context });
            li_ctrl.dom.tagName = 'li';
            li_ctrl.add_class('pagination-item');

            const button_ctrl = new Control({ context: this.context });
            button_ctrl.dom.tagName = 'button';
            button_ctrl.dom.attributes.type = 'button';
            button_ctrl.dom.attributes['data-page'] = String(page);
            button_ctrl.add_class('pagination-button');

            if (disabled) {
                button_ctrl.dom.attributes.disabled = 'disabled';
            }
            if (is_current) {
                button_ctrl.dom.attributes['aria-current'] = 'page';
                button_ctrl.add_class('is-current');
            }

            button_ctrl.add(String(label));
            li_ctrl.add(button_ctrl);
            list_ctrl.add(li_ctrl);
        };

        add_button('Prev', current_page - 1, current_page <= 1, false);
        for (let i = 1; i <= total_pages; i += 1) {
            add_button(i, i, false, i === current_page);
        }
        add_button('Next', current_page + 1, current_page >= total_pages, false);
    }

    /**
     * Set the current page.
     * @param {number} page - The page number to set.
     */
    set_page(page) {
        const next_page = Number(page);
        if (!Number.isFinite(next_page)) return;
        this.page = next_page;
        this.render_pages();
        this.raise('page_change', { page: this.page, page_count: this.page_count });
    }

    /**
     * Set the total page count.
     * @param {number} page_count - The page count to set.
     */
    set_page_count(page_count) {
        const next_count = Number(page_count);
        if (!Number.isFinite(next_count)) return;
        this.page_count = Math.max(1, next_count);
        this.render_pages();
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const list_ctrl = this._ctrl_fields && this._ctrl_fields.list;
            if (!list_ctrl || !list_ctrl.dom.el) return;

            list_ctrl.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target || !target.getAttribute) return;
                const page_str = target.getAttribute('data-page');
                if (!is_defined(page_str)) return;
                const next_page = Number(page_str);
                if (!Number.isFinite(next_page)) return;
                if (target.getAttribute('disabled')) return;
                this.set_page(next_page);
            });
        }
    }
}

Pagination.css = `
.pagination-list {
    list-style: none;
    display: flex;
    gap: 6px;
    padding: 0;
    margin: 0;
}
.pagination-button {
    border: 1px solid #ccc;
    background: #fff;
    padding: 4px 8px;
    cursor: pointer;
}
.pagination-button.is-current {
    background: #222;
    color: #fff;
    border-color: #222;
}
`;

module.exports = Pagination;
