const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Breadcrumbs — Hierarchical navigation trail with clickable links.
 *
 * @param {Object} spec
 * @param {Array}  [spec.items] — Breadcrumb items: { label, href?, id? }
 * @param {string} [spec.separator='/'] — Separator character between items.
 * @param {number} [spec.max_visible=0] — Max items before overflow collapse (0 = unlimited).
 *
 * Events:
 *   'navigate' — { index, item }
 */
class Breadcrumbs extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'breadcrumbs';
        super(spec);
        this.add_class('breadcrumbs');
        this.add_class('jsgui-breadcrumbs');
        this.dom.tagName = 'nav';
        this.dom.attributes['aria-label'] = 'Breadcrumb';

        this.items = Array.isArray(spec.items) ? spec.items.slice() : [];
        this._separator = is_defined(spec.separator) ? String(spec.separator) : '/';
        this._max_visible = (typeof spec.max_visible === 'number' && spec.max_visible > 0)
            ? spec.max_visible : 0;

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
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

        let visible_items = this.items;
        let collapsed = false;

        // Overflow collapse: show first, ellipsis, then last (max_visible - 1)
        if (this._max_visible > 0 && this.items.length > this._max_visible) {
            const tail_count = this._max_visible - 1;
            visible_items = [
                this.items[0],
                { __ellipsis: true },
                ...this.items.slice(this.items.length - tail_count)
            ];
            collapsed = true;
        }

        visible_items.forEach((item, vi) => {
            // Resolve original index for events
            let original_index;
            if (collapsed) {
                if (vi === 0) original_index = 0;
                else if (item.__ellipsis) original_index = -1;
                else original_index = this.items.length - (visible_items.length - 1 - vi);
            } else {
                original_index = vi;
            }

            const li_ctrl = new Control({ context: this.context });
            li_ctrl.dom.tagName = 'li';
            li_ctrl.add_class('breadcrumbs-item');

            // Separator via CSS custom property
            if (this._separator !== '/') {
                li_ctrl.dom.attributes['data-separator'] = this._separator;
            }

            // Ellipsis item
            if (item.__ellipsis) {
                const ellipsis_ctrl = new Control({ context: this.context });
                ellipsis_ctrl.dom.tagName = 'span';
                ellipsis_ctrl.add_class('breadcrumbs-ellipsis');
                ellipsis_ctrl.dom.attributes['aria-hidden'] = 'true';
                ellipsis_ctrl.add('…');
                li_ctrl.add(ellipsis_ctrl);
                list_ctrl.add(li_ctrl);
                return;
            }

            const label = is_defined(item.label) ? String(item.label) : String(item);
            const href = is_defined(item.href) ? String(item.href) : '';
            const is_last = (collapsed)
                ? (vi === visible_items.length - 1)
                : (vi === this.items.length - 1);

            const link_ctrl = new Control({ context: this.context });
            link_ctrl.add_class('breadcrumbs-link');
            link_ctrl.dom.attributes['data-breadcrumb-index'] = String(original_index);

            if (is_last) {
                // Current page — use span, not link
                link_ctrl.dom.tagName = 'span';
                link_ctrl.dom.attributes['aria-current'] = 'page';
                li_ctrl.add_class('breadcrumbs-current');
            } else if (href) {
                link_ctrl.dom.tagName = 'a';
                link_ctrl.dom.attributes.href = href;
            } else {
                link_ctrl.dom.tagName = 'button';
                link_ctrl.dom.attributes.type = 'button';
            }
            link_ctrl.add(label);

            li_ctrl.add(link_ctrl);
            list_ctrl.add(li_ctrl);
        });
    }

    /**
     * Set breadcrumb items (replaces all).
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

    /**
     * Push a new item onto the end of the trail.
     * @param {Object|string} item - { label, href?, id? } or a string.
     */
    push(item) {
        this.items.push(item);
        this.render_items();
    }

    /**
     * Pop the last item from the trail.
     * @returns {Object|string|undefined} The removed item.
     */
    pop() {
        const removed = this.items.pop();
        this.render_items();
        return removed;
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
                if (Number.isNaN(index) || index < 0) return;
                e_click.preventDefault();
                const item = this.items[index];
                this.raise('navigate', { index, item });
            });
        }
    }
}

Breadcrumbs.css = `
/* ─── Breadcrumbs ─── */
.jsgui-breadcrumbs {
    font-family: var(--j-font-sans, system-ui, sans-serif);
    font-size: var(--j-text-sm, 0.875rem);
}

.breadcrumbs-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--j-space-1, 4px);
    padding: 0;
    margin: 0;
}

/* Separator */
.breadcrumbs-item::after {
    content: attr(data-separator);
    margin-left: var(--j-space-1, 4px);
    color: var(--j-fg-muted, #888);
    pointer-events: none;
}
.breadcrumbs-item:not([data-separator])::after {
    content: '/';
}
.breadcrumbs-item:last-child::after {
    content: '';
}

/* Links */
.breadcrumbs-link {
    text-decoration: none;
    color: var(--j-primary, #5b9bd5);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: var(--j-space-1, 4px) var(--j-space-1, 4px);
    border-radius: var(--j-radius-sm, 3px);
    transition: color 120ms ease-out, background 120ms ease-out;
    line-height: 1.4;
}
.breadcrumbs-link:hover {
    color: var(--j-primary-hover, #4a8ac4);
    background: var(--j-bg-hover, rgba(255,255,255,0.06));
}
.breadcrumbs-link:focus-visible {
    outline: 2px solid var(--j-primary, #5b9bd5);
    outline-offset: 2px;
}

/* Current page (last item) */
.breadcrumbs-current .breadcrumbs-link {
    color: var(--j-fg, #e0e0e0);
    cursor: default;
    font-weight: 500;
}
.breadcrumbs-current .breadcrumbs-link:hover {
    background: transparent;
}

/* Ellipsis */
.breadcrumbs-ellipsis {
    color: var(--j-fg-muted, #888);
    padding: 0 var(--j-space-1, 4px);
}
`;

module.exports = Breadcrumbs;
