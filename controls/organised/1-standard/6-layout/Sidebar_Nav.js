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

        // ── Adaptive layout options (all overridable) ──
        // layout_mode: 'auto' | 'phone' | 'tablet' | 'desktop'
        this.layout_mode = spec.layout_mode || 'auto';
        // Breakpoint for auto-collapse to icon-only rail
        this.collapse_breakpoint = is_defined(spec.collapse_breakpoint) ? Number(spec.collapse_breakpoint) : 768;
        // Breakpoint for phone overlay mode
        this.overlay_breakpoint = is_defined(spec.overlay_breakpoint) ? Number(spec.overlay_breakpoint) : 600;
        // Whether auto-collapse is enabled (default true)
        this.auto_collapse = spec.auto_collapse !== false;
        // Whether phone overlay mode is enabled (default true)
        this.auto_overlay = spec.auto_overlay !== false;

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

    /**
     * Resolve the current layout mode.
     * @returns {'phone'|'tablet'|'desktop'}
     */
    resolve_layout_mode() {
        if (this.layout_mode !== 'auto') return this.layout_mode;
        if (this.context && this.context.view_environment && this.context.view_environment.layout_mode) {
            return this.context.view_environment.layout_mode;
        }
        if (typeof window !== 'undefined') {
            const w = window.innerWidth;
            if (w < this.overlay_breakpoint) return 'phone';
            if (w < this.collapse_breakpoint) return 'tablet';
        }
        return 'desktop';
    }

    /**
     * Apply adaptive layout mode to the DOM.
     */
    _apply_layout_mode() {
        if (!this.dom.el) return;
        const mode = this.resolve_layout_mode();
        this.dom.el.setAttribute('data-layout-mode', mode);

        // Auto-collapse on tablet
        if (mode === 'tablet' && this.auto_collapse && !this.collapsed) {
            this.toggle_collapse(true);
        }

        // Phone overlay mode
        if (mode === 'phone' && this.auto_overlay) {
            this.dom.el.classList.add('sidebar-overlay-mode');
        } else {
            this.dom.el.classList.remove('sidebar-overlay-mode');
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Apply initial layout mode
            this._apply_layout_mode();

            // Listen for resize in auto mode
            if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
                this._resize_handler = () => this._apply_layout_mode();
                window.addEventListener('resize', this._resize_handler);
            }

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

                // Auto-close overlay on phone after navigation
                const mode = this.resolve_layout_mode();
                if (mode === 'phone' && this.auto_overlay) {
                    this.toggle_collapse(true);
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
/* ─── Sidebar_Nav ─── */
.jsgui-sidebar-nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--admin-card-bg, #fff);
    border-right: 1px solid var(--admin-border, #e0e0e0);
    width: var(--sidebar-width, 240px);
    transition: width 0.2s ease;
    overflow: hidden;
}
.jsgui-sidebar-nav.is-collapsed {
    width: var(--sidebar-collapsed-width, 48px);
}
.sidebar-list, .sidebar-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
}
.sidebar-sublist {
    display: none;
}
.sidebar-item.is-expanded > .sidebar-sublist {
    display: block;
}
.sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 8px;
    border: none;
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
    background: var(--admin-header-bg, #f8f8f8);
    cursor: pointer;
    min-height: var(--j-touch-target, 36px);
    color: var(--admin-text, #1e1e1e);
    font-size: 16px;
}
.sidebar-toggle:hover {
    background: var(--admin-hover-bg, #eee);
}
.sidebar-link {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    gap: 8px;
    text-decoration: none;
    cursor: pointer;
    border: none;
    background: none;
    text-align: left;
    color: var(--admin-text, #333);
    min-height: var(--j-touch-target, 36px);
    transition: background 0.1s;
    font-size: 14px;
}
.sidebar-link:hover {
    background: var(--admin-hover-bg, #f0f0f0);
}
.sidebar-link.is-active {
    background: var(--admin-selected-bg, #e8f0fe);
    color: var(--admin-accent, #0078d4);
    font-weight: 600;
}
.sidebar-icon {
    flex-shrink: 0;
    width: 20px;
    text-align: center;
}
.sidebar-badge {
    margin-left: auto;
    font-size: 11px;
    background: var(--admin-accent, #0078d4);
    color: #fff;
    padding: 1px 6px;
    border-radius: 10px;
}
.sidebar-chevron {
    margin-left: auto;
    transition: transform 0.15s;
    color: var(--admin-muted, #999);
}
.sidebar-item.is-expanded > .sidebar-link .sidebar-chevron {
    transform: rotate(90deg);
}
.jsgui-sidebar-nav.is-collapsed .sidebar-label,
.jsgui-sidebar-nav.is-collapsed .sidebar-badge,
.jsgui-sidebar-nav.is-collapsed .sidebar-chevron {
    display: none;
}
.sidebar-item--nested .sidebar-link {
    padding-left: 36px;
}

/* ── Phone overlay mode ── */
.jsgui-sidebar-nav.sidebar-overlay-mode {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 999;
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.15);
    width: var(--sidebar-width, 240px);
}
.jsgui-sidebar-nav.sidebar-overlay-mode.is-collapsed {
    transform: translateX(-100%);
}

/* ── Touch targets for phone/tablet ── */
.jsgui-sidebar-nav[data-layout-mode="phone"] .sidebar-link,
.jsgui-sidebar-nav[data-layout-mode="tablet"] .sidebar-link {
    min-height: 44px;
}
.jsgui-sidebar-nav[data-layout-mode="phone"] .sidebar-toggle,
.jsgui-sidebar-nav[data-layout-mode="tablet"] .sidebar-toggle {
    min-height: 44px;
}
`;

module.exports = Sidebar_Nav;
