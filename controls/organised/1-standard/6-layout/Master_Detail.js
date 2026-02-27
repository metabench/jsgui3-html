const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');

const normalize_items = items => {
    if (!Array.isArray(items)) return [];
    return items.map((item, index) => {
        if (item && typeof item === 'object') {
            const id = is_defined(item.id) ? item.id : index;
            const label = is_defined(item.label) ? item.label : String(id);
            return { ...item, id, label };
        }
        return { id: index, label: String(item), value: item };
    });
};

class Master_Detail extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'master_detail';
        super(spec);
        this.add_class('master-detail');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this.detail_renderer = spec.detail_renderer;
        this.master_renderer = spec.master_renderer;

        // ── Adaptive layout options (all overridable) ──
        // layout_mode: 'auto' | 'phone' | 'tablet' | 'desktop'
        //   'auto' uses breakpoints to determine mode at runtime
        this.layout_mode = spec.layout_mode || 'auto';
        // Breakpoints for auto mode (overridable)
        this.phone_breakpoint = is_defined(spec.phone_breakpoint) ? spec.phone_breakpoint : 600;
        this.tablet_breakpoint = is_defined(spec.tablet_breakpoint) ? spec.tablet_breakpoint : 960;
        // Whether phone mode shows stacked master/detail with back nav
        this.phone_stacked = spec.phone_stacked !== false;
        // Minimum touch target height for items (px)
        this.touch_item_height = spec.touch_item_height || 44;
        // Whether to show back button in phone stacked mode
        this.show_back_button = spec.show_back_button !== false;
        // Track which panel is visible in stacked mode
        this._showing_detail = false;

        this.set_items(spec.items || []);
        this.set_selected_id(is_defined(spec.selected_id) ? spec.selected_id : null);

        if (!spec.el) {
            this.compose_master_detail();
        }

        this.bind_model();
    }

    /**
     * Resolve the current layout mode.
     * @returns {'phone'|'tablet'|'desktop'}
     */
    resolve_layout_mode() {
        if (this.layout_mode !== 'auto') return this.layout_mode;
        // Check context.view_environment first
        if (this.context && this.context.view_environment && this.context.view_environment.layout_mode) {
            return this.context.view_environment.layout_mode;
        }
        // Fall back to window width at runtime
        if (typeof window !== 'undefined') {
            const w = window.innerWidth;
            if (w < this.phone_breakpoint) return 'phone';
            if (w < this.tablet_breakpoint) return 'tablet';
        }
        return 'desktop';
    }

    compose_master_detail() {
        const { context } = this;

        // Back button for phone stacked mode
        const back_ctrl = new Control({ context, tag_name: 'button' });
        back_ctrl.dom.attributes.type = 'button';
        back_ctrl.add_class('master-detail-back');
        back_ctrl.dom.attributes['aria-label'] = 'Back to list';
        back_ctrl.add('← Back');

        const master_ctrl = new Control({ context, tag_name: 'div' });
        master_ctrl.add_class('master-detail-master');

        const detail_ctrl = new Control({ context, tag_name: 'div' });
        detail_ctrl.add_class('master-detail-detail');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.back = back_ctrl;
        this._ctrl_fields.master = master_ctrl;
        this._ctrl_fields.detail = detail_ctrl;

        this.add(back_ctrl);
        this.add(master_ctrl);
        this.add(detail_ctrl);

        this.render_master();
        this.render_detail();
    }

    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            if (e_change.name === 'items') {
                this.items = normalize_items(e_change.value);
                this.ensure_selected_id();
                this.render_master();
                this.render_detail();
            }
            if (e_change.name === 'selected_id') {
                this.selected_id = e_change.value;
                this.render_master();
                this.render_detail();
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
     * Set master items.
     * @param {Array} items - Items to set.
     */
    set_items(items) {
        const normalized = normalize_items(items);
        this.set_model_value('items', normalized);
        this.items = normalized;
        this.ensure_selected_id();
    }

    /**
     * Set selected id.
     * @param {*} selected_id - Selected item id.
     */
    set_selected_id(selected_id) {
        this.set_model_value('selected_id', selected_id);
        this.selected_id = selected_id;
    }

    /**
     * Get selected id.
     * @returns {*}
     */
    get_selected_id() {
        return this.selected_id;
    }

    /**
     * Get selected item.
     * @returns {Object|null}
     */
    get_selected_item() {
        const items = this.items || [];
        const selected_id = this.selected_id;
        const item = items.find(entry => String(entry.id) === String(selected_id));
        return item || null;
    }

    ensure_selected_id() {
        const items = this.items || [];
        if (!items.length) {
            this.selected_id = null;
            return;
        }
        const current = this.get_selected_item();
        if (!current) {
            this.selected_id = items[0].id;
            this.set_model_value('selected_id', this.selected_id);
        }
    }

    render_master() {
        const master_ctrl = this._ctrl_fields && this._ctrl_fields.master;
        if (!master_ctrl) return;

        master_ctrl.clear();
        const items = this.items || [];
        const selected_id = this.selected_id;

        items.forEach((item, index) => {
            const item_ctrl = new Control({ context: this.context, tag_name: 'button' });
            item_ctrl.dom.attributes.type = 'button';
            item_ctrl.add_class('master-detail-item');
            item_ctrl.dom.attributes['data-item-id'] = String(item.id);
            const is_selected = String(item.id) === String(selected_id);
            if (is_selected) item_ctrl.add_class('is-selected');
            item_ctrl.dom.attributes['aria-selected'] = is_selected ? 'true' : 'false';

            if (typeof this.master_renderer === 'function') {
                const rendered = this.master_renderer(item, index);
                if (rendered instanceof Control) {
                    item_ctrl.add(rendered);
                } else if (is_defined(rendered)) {
                    item_ctrl.add(String(rendered));
                }
            } else {
                item_ctrl.add(item.label);
            }

            master_ctrl.add(item_ctrl);
        });
    }

    render_detail() {
        const detail_ctrl = this._ctrl_fields && this._ctrl_fields.detail;
        if (!detail_ctrl) return;

        detail_ctrl.clear();
        const item = this.get_selected_item();
        if (!item) return;

        if (typeof this.detail_renderer === 'function') {
            const rendered = this.detail_renderer(item);
            if (rendered instanceof Control) {
                detail_ctrl.add(rendered);
            } else if (is_defined(rendered)) {
                detail_ctrl.add(String(rendered));
            }
            return;
        }

        const detail_text = is_defined(item.detail) ? item.detail : item.label;
        if (is_defined(detail_text)) detail_ctrl.add(String(detail_text));
    }

    /**
     * Apply the resolved layout mode to the DOM.
     * Called on activate and on window resize.
     */
    _apply_layout_mode() {
        if (!this.dom.el) return;
        const mode = this.resolve_layout_mode();
        this.dom.el.setAttribute('data-layout-mode', mode);

        // Phone stacked: show/hide master vs detail
        if (mode === 'phone' && this.phone_stacked) {
            this.dom.el.classList.toggle('showing-detail', this._showing_detail);
        } else {
            this.dom.el.classList.remove('showing-detail');
            this._showing_detail = false;
        }
    }

    /**
     * Navigate to detail pane in phone stacked mode.
     */
    show_detail() {
        this._showing_detail = true;
        this._apply_layout_mode();
        this.raise('panel_change', { panel: 'detail' });
    }

    /**
     * Navigate back to master list in phone stacked mode.
     */
    show_master() {
        this._showing_detail = false;
        this._apply_layout_mode();
        this.raise('panel_change', { panel: 'master' });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const master_ctrl = this._ctrl_fields && this._ctrl_fields.master;
            const back_ctrl = this._ctrl_fields && this._ctrl_fields.back;
            if (!master_ctrl || !master_ctrl.dom.el) return;

            // Apply initial layout mode
            this._apply_layout_mode();

            // Listen for window resize in auto mode
            if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
                this._resize_handler = () => this._apply_layout_mode();
                window.addEventListener('resize', this._resize_handler);
            }

            // Back button handler
            if (back_ctrl && back_ctrl.dom.el) {
                back_ctrl.add_dom_event_listener('click', () => this.show_master());
            }

            const find_item_el = target => {
                let node = target;
                while (node && node.getAttribute) {
                    if (node.getAttribute('data-item-id') !== null) return node;
                    node = node.parentNode;
                }
                return null;
            };

            master_ctrl.add_dom_event_listener('click', e_click => {
                const item_el = find_item_el(e_click.target);
                if (!item_el) return;
                const item_id = item_el.getAttribute('data-item-id');
                if (!is_defined(item_id)) return;
                this.set_selected_id(item_id);
                this.raise('selection_change', { selected_id: item_id });
                // In phone stacked mode, auto-navigate to detail
                const mode = this.resolve_layout_mode();
                if (mode === 'phone' && this.phone_stacked) {
                    this.show_detail();
                }
            });

            master_ctrl.add_dom_event_listener('keydown', e_key => {
                const item_el = find_item_el(e_key.target);
                if (!item_el) return;
                const key = e_key.key || e_key.keyCode;
                if (key !== 'Enter' && key !== ' ' && key !== 13 && key !== 32) return;
                e_key.preventDefault();
                const item_id = item_el.getAttribute('data-item-id');
                if (!is_defined(item_id)) return;
                this.set_selected_id(item_id);
                this.raise('selection_change', { selected_id: item_id });
                const mode = this.resolve_layout_mode();
                if (mode === 'phone' && this.phone_stacked) {
                    this.show_detail();
                }
            });
        }
    }
}

Master_Detail.css = `
/* ─── Master_Detail ─── */
.master-detail {
    display: grid;
    grid-template-columns: minmax(180px, 240px) 1fr;
    gap: var(--j-gap, 16px);
    align-items: start;
}
.master-detail-back {
    display: none;
}
.master-detail-master {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.master-detail-item {
    text-align: left;
    padding: 8px 10px;
    border: 1px solid var(--admin-border, #ddd);
    border-radius: 6px;
    background: var(--admin-card-bg, #fff);
    color: var(--admin-text, #1e1e1e);
    cursor: pointer;
    min-height: var(--j-touch-target, 36px);
    transition: background 0.12s, border-color 0.12s;
}
.master-detail-item:hover {
    background: var(--admin-hover-bg, #f0f0f0);
}
.master-detail-item.is-selected {
    border-color: var(--admin-accent, #0078d4);
    background: var(--admin-selected-bg, #f5f5f5);
}
.master-detail-detail {
    padding: 12px;
    border: 1px solid var(--admin-border, #eee);
    border-radius: 8px;
    background: var(--admin-surface, #fafafa);
    color: var(--admin-text, #1e1e1e);
    min-height: 120px;
}

/* ── Phone layout: stacked with back button ── */
.master-detail[data-layout-mode="phone"] {
    display: flex;
    flex-direction: column;
    gap: 0;
}
.master-detail[data-layout-mode="phone"] .master-detail-back {
    display: none;
    padding: 8px 12px;
    border: none;
    background: var(--admin-header-bg, #f8f8f8);
    border-bottom: 1px solid var(--admin-border, #ddd);
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    color: var(--admin-accent, #0078d4);
    min-height: var(--j-touch-target, 44px);
}
.master-detail[data-layout-mode="phone"].showing-detail .master-detail-back {
    display: block;
}
.master-detail[data-layout-mode="phone"].showing-detail .master-detail-master {
    display: none;
}
.master-detail[data-layout-mode="phone"]:not(.showing-detail) .master-detail-detail {
    display: none;
}
.master-detail[data-layout-mode="phone"] .master-detail-item {
    min-height: var(--j-touch-target, 44px);
    display: flex;
    align-items: center;
    border-radius: 0;
    border-left: none;
    border-right: none;
}

/* ── Tablet layout: narrower master rail ── */
.master-detail[data-layout-mode="tablet"] {
    grid-template-columns: minmax(140px, 200px) 1fr;
}
.master-detail[data-layout-mode="tablet"] .master-detail-item {
    min-height: var(--j-touch-target, 44px);
    display: flex;
    align-items: center;
}
`;

module.exports = Master_Detail;
