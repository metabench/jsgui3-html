const jsgui = require('../../../../html-core/html-core');
const { Control, tpl, is_defined } = jsgui;
const Data_Model_View_Model_Control = require('../../../../html-core/Data_Model_View_Model_Control');

const fields = [
    ['page', Number],
    ['page_count', Number],
    ['page_size', Number]
];

class Pagination extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'pagination';
        super(spec, fields);
        this.add_class('pagination');
        this.dom.tagName = 'nav';
        this.dom.attributes['aria-label'] = 'Pagination';

        this.page = is_defined(spec.page) ? Number(spec.page) : 1;
        this.page_count = is_defined(spec.page_count) ? Number(spec.page_count) : 1;
        this.page_size = is_defined(spec.page_size) ? Number(spec.page_size) : undefined;

        this.on('change', e => {
            if (e.name === 'page' || e.name === 'page_count') {
                this.render_pages();
            }
        });

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        tpl`<ul class="pagination-list" data-jsgui-ctrl="list"></ul>`.mount(this);
        this._wire_jsgui_ctrls();
        this.render_pages();
    }

    render_pages() {
        const list_ctrl = this.list;
        if (!list_ctrl) return;

        list_ctrl.clear();
        const total_pages = Math.max(1, this.page_count || 1);
        const current_page = Math.min(Math.max(1, this.page || 1), total_pages);

        // Synchronize state safely without infinite loops
        if (this.page !== current_page) {
            this.page = current_page;
        }

        const add_button = (label, page, disabled, is_current) => {
            const current_class = is_current ? 'is-current' : '';

            // Mount the button template onto a temporary fragment, or parse it directly 
            // 'mount' returns an array of top-level controls instantiated
            const parsed_controls = tpl`
                <li class="pagination-item">
                    <button type="button" data-page="${page}" class="pagination-button ${current_class}">
                        ${String(label)}
                    </button>
                </li>
            `.mount(list_ctrl);

            const li = parsed_controls[0];
            const btn = li.content._arr[0]; // Retrieve the nested button

            if (disabled) btn.dom.attributes.disabled = 'disabled';
            if (is_current) btn.dom.attributes['aria-current'] = 'page';
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
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const list_ctrl = this.list;
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
