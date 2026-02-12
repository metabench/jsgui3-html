/**
 * Sidebar_Nav — Collapsible sidebar navigation with sections, icons, badges.
 *
 * Options:
 *   items        — Array of nav items: { id, label, icon?, badge?, href?, items? }
 *   collapsed    — Start collapsed (icon-only mode)
 *   active_id    — Initially active item id
 *   on_navigate  — Callback when item is clicked
 *
 * Events: navigate({ id, item })
 */
const Control = require('../../../../html-core/control');
const { is_defined } = require('../../../../html-core/html-core');

class Sidebar_Nav extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'sidebar_nav';
        super(spec);
        this.add_class('sidebar-nav');
        this.add_class('jsgui-sidebar-nav');
        this.dom.tagName = 'nav';

        this.items = spec.items || [];
        this.active_id = spec.active_id || null;
        this.collapsed = !!spec.collapsed;
        this.on_navigate = spec.on_navigate || null;
        this._expanded_groups = new Set();

        if (this.collapsed) {
            this.add_class('is-collapsed');
        }

        if (!spec.el) this.compose();
    }

    compose() {
        // Collapse toggle button
        this._toggle_btn = new Control({ context: this.context, tag_name: 'button' });
        this._toggle_btn.add_class('sidebar-toggle');
        this._toggle_btn.dom.attributes.type = 'button';
        this._toggle_btn.dom.attributes['aria-label'] = 'Toggle sidebar';
        this._toggle_btn.add('☰');
        this.add(this._toggle_btn);

        // Nav list
        this._nav_list = new Control({ context: this.context, tag_name: 'ul' });
        this._nav_list.add_class('sidebar-list');
        this._nav_list.dom.attributes.role = 'list';

        this._render_items(this.items, this._nav_list, 0);
        this.add(this._nav_list);
    }

    _render_items(items, parent, depth) {
        (items || []).forEach(item => {
            const li = new Control({ context: this.context, tag_name: 'li' });
            li.add_class('sidebar-item');
            if (depth > 0) li.add_class('sidebar-item--nested');
            li.dom.attributes['data-nav-id'] = item.id;

            const has_children = Array.isArray(item.items) && item.items.length > 0;

            // Item link/button
            const link = new Control({ context: this.context, tag_name: item.href ? 'a' : 'button' });
            link.add_class('sidebar-link');
            link.dom.attributes['data-nav-id'] = item.id;
            if (item.href) {
                link.dom.attributes.href = item.href;
            } else {
                link.dom.attributes.type = 'button';
            }
            if (item.id === this.active_id) {
                link.add_class('is-active');
            }
            if (has_children) {
                link.add_class('has-children');
            }

            // Icon
            if (item.icon) {
                const icon_span = new Control({ context: this.context, tag_name: 'span' });
                icon_span.add_class('sidebar-icon');
                icon_span.add(item.icon);
                link.add(icon_span);
            }

            // Label
            const label_span = new Control({ context: this.context, tag_name: 'span' });
            label_span.add_class('sidebar-label');
            label_span.add(item.label || item.id);
            link.add(label_span);

            // Badge
            if (is_defined(item.badge)) {
                const badge_span = new Control({ context: this.context, tag_name: 'span' });
                badge_span.add_class('sidebar-badge');
                badge_span.add(String(item.badge));
                link.add(badge_span);
            }

            // Expand indicator for groups
            if (has_children) {
                const chevron = new Control({ context: this.context, tag_name: 'span' });
                chevron.add_class('sidebar-chevron');
                chevron.add('›');
                link.add(chevron);
            }

            li.add(link);

            // Children submenu
            if (has_children) {
                const sub_list = new Control({ context: this.context, tag_name: 'ul' });
                sub_list.add_class('sidebar-sublist');
                sub_list.dom.attributes.role = 'group';
                this._render_items(item.items, sub_list, depth + 1);
                li.add(sub_list);
            }

            parent.add(li);
        });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Toggle collapse
            const toggle_btn = this.dom.el.querySelector('.sidebar-toggle');
            if (toggle_btn) {
                toggle_btn.addEventListener('click', () => {
                    this.toggle_collapse();
                });
            }

            // Item clicks
            this.dom.el.addEventListener('click', e => {
                const link = e.target.closest('.sidebar-link');
                if (!link) return;

                const id = link.getAttribute('data-nav-id');
                if (!id) return;

                // If has children, toggle expand
                if (link.classList.contains('has-children')) {
                    e.preventDefault();
                    this._toggle_group(id, link);
                    return;
                }

                // Navigate
                this.set_active(id);
                this.raise('navigate', { id, item: this._find_item(id) });
                if (this.on_navigate) {
                    this.on_navigate(id, this._find_item(id));
                }
            });
        }
    }

    _toggle_group(id, link_el) {
        const li = link_el.closest('.sidebar-item');
        if (!li) return;
        const sub = li.querySelector('.sidebar-sublist');
        if (!sub) return;

        if (this._expanded_groups.has(id)) {
            this._expanded_groups.delete(id);
            li.classList.remove('is-expanded');
        } else {
            this._expanded_groups.add(id);
            li.classList.add('is-expanded');
        }
    }

    set_active(id) {
        this.active_id = id;
        if (!this.dom.el) return;
        this.dom.el.querySelectorAll('.sidebar-link.is-active').forEach(el => {
            el.classList.remove('is-active');
        });
        const target = this.dom.el.querySelector(`.sidebar-link[data-nav-id="${id}"]`);
        if (target) target.classList.add('is-active');
    }

    toggle_collapse(force) {
        this.collapsed = typeof force === 'boolean' ? force : !this.collapsed;
        if (this.dom.el) {
            this.dom.el.classList.toggle('is-collapsed', this.collapsed);
        }
        this.raise('collapse', { collapsed: this.collapsed });
    }

    _find_item(id, items) {
        const list = items || this.items;
        for (const item of list) {
            if (item.id === id) return item;
            if (item.items) {
                const found = this._find_item(id, item.items);
                if (found) return found;
            }
        }
        return null;
    }

    get_active_id() {
        return this.active_id;
    }
}

Sidebar_Nav.css = `
.sidebar-nav {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.sidebar-list, .sidebar-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
}
.sidebar-link {
    display: flex;
    align-items: center;
    width: 100%;
    text-decoration: none;
    cursor: pointer;
    border: none;
    background: none;
    text-align: left;
}
`;

module.exports = Sidebar_Nav;
