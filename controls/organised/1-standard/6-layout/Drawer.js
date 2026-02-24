const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');

class Drawer extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'drawer';
        super(spec);
        this.add_class('drawer');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this.position = spec.position === 'right' ? 'right' : 'left';
        this.breakpoint = is_defined(spec.breakpoint) ? Number(spec.breakpoint) : 960;
        this.is_open = !!spec.open;
        this.overlay_mode = spec.overlay_mode !== false;
        this.show_close_button = spec.show_close_button !== false;

        this.set_open(this.is_open);

        if (!spec.el) {
            this.compose_drawer(spec);
        }

        this.bind_model();
    }

    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            if (e_change.name === 'open') {
                this.is_open = !!e_change.value;
                this.apply_state();
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
     * Open the drawer.
     */
    open() {
        this.set_open(true);
        this.raise('open');
    }

    /**
     * Close the drawer.
     */
    close() {
        this.set_open(false);
        this.raise('close');
    }

    /**
     * Toggle the drawer.
     */
    toggle() {
        this.set_open(!this.is_open);
        this.raise('toggle', { open: this.is_open });
    }

    /**
     * Set open state.
     * @param {boolean} is_open - Open state.
     */
    set_open(is_open) {
        this.is_open = !!is_open;
        this.set_model_value('open', this.is_open);
        this.apply_state();
    }

    /**
     * Get open state.
     * @returns {boolean}
     */
    get_open() {
        return !!this.is_open;
    }

    compose_drawer(spec = {}) {
        const { context } = this;

        const overlay_ctrl = new Control({ context, tag_name: 'div' });
        overlay_ctrl.add_class('drawer-overlay');

        const panel_ctrl = new Control({ context, tag_name: 'aside' });
        panel_ctrl.add_class('drawer-panel');
        panel_ctrl.add_class(`drawer-panel-${this.position}`);

        const header_ctrl = new Control({ context, tag_name: 'div' });
        header_ctrl.add_class('drawer-header');

        if (this.show_close_button) {
            const close_button = new Control({ context, tag_name: 'button' });
            close_button.dom.attributes.type = 'button';
            close_button.add_class('drawer-close');
            close_button.add('Close');
            header_ctrl.add(close_button);
            this._ctrl_fields = this._ctrl_fields || {};
            this._ctrl_fields.close_button = close_button;
        }

        const body_ctrl = new Control({ context, tag_name: 'div' });
        body_ctrl.add_class('drawer-body');

        if (is_defined(spec.content)) {
            body_ctrl.add(spec.content);
        }

        panel_ctrl.add(header_ctrl);
        panel_ctrl.add(body_ctrl);

        this.add(overlay_ctrl);
        this.add(panel_ctrl);

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.overlay = overlay_ctrl;
        this._ctrl_fields.panel = panel_ctrl;
        this._ctrl_fields.body = body_ctrl;

        this.apply_state();
    }

    apply_state() {
        if (this.is_open) {
            this.add_class('is-open');
        } else {
            this.remove_class('is-open');
        }
    }

    update_responsive_state() {
        if (typeof window === 'undefined') return;
        const is_overlay = this.overlay_mode && window.innerWidth < this.breakpoint;
        if (is_overlay) {
            this.remove_class('drawer-docked');
            this.add_class('drawer-overlay-mode');
        } else {
            this.add_class('drawer-docked');
            this.remove_class('drawer-overlay-mode');
        }
    }

    trap_focus(e_key) {
        if (!this.is_open || !this._ctrl_fields || !this._ctrl_fields.panel) return;
        const panel_el = this._ctrl_fields.panel.dom.el;
        if (!panel_el) return;

        const focusable = panel_el.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const is_shift = e_key.shiftKey;

        if (document.activeElement === first && is_shift) {
            e_key.preventDefault();
            last.focus();
        } else if (document.activeElement === last && !is_shift) {
            e_key.preventDefault();
            first.focus();
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el || typeof document === 'undefined') return;

            const overlay_ctrl = this._ctrl_fields && this._ctrl_fields.overlay;
            const close_button = this._ctrl_fields && this._ctrl_fields.close_button;

            if (overlay_ctrl && overlay_ctrl.dom.el) {
                overlay_ctrl.add_dom_event_listener('click', () => {
                    if (this.is_open) this.close();
                });
            }

            if (close_button && close_button.dom.el) {
                close_button.add_dom_event_listener('click', () => this.close());
            }

            this.add_dom_event_listener('keydown', e_key => {
                const key = e_key.key || e_key.keyCode;
                if (key === 'Escape' || key === 27) {
                    if (this.is_open) this.close();
                }
                if (key === 'Tab' || key === 9) {
                    this.trap_focus(e_key);
                }
            });

            if (typeof window !== 'undefined') {
                this.update_responsive_state();
                window.addEventListener('resize', () => this.update_responsive_state());
            }
        }
    }
}

Drawer.css = `
/* ─── Drawer ─── */
.drawer {
    position: relative;
}
.drawer-overlay {
    position: fixed;
    inset: 0;
    background: var(--j-overlay, rgba(0, 0, 0, 0.3));
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
}
.drawer-panel {
    position: fixed;
    top: 0;
    bottom: 0;
    width: var(--drawer-width, 280px);
    background: var(--admin-card-bg, #fff);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
    color: var(--admin-text, #1e1e1e);
}
.drawer-panel-right {
    right: 0;
    left: auto;
    transform: translateX(100%);
}
.drawer.is-open .drawer-panel {
    transform: translateX(0);
}
.drawer.is-open .drawer-overlay {
    opacity: 1;
    pointer-events: auto;
}
.drawer-header {
    padding: 12px;
    border-bottom: 1px solid var(--admin-border, #eee);
    display: flex;
    justify-content: flex-end;
}
.drawer-body {
    padding: 12px;
    overflow: auto;
    flex: 1;
}
.drawer-close {
    border: 1px solid var(--admin-border, #ccc);
    background: var(--admin-card-bg, #fff);
    color: var(--admin-text, #333);
    padding: 6px 10px;
    cursor: pointer;
    border-radius: var(--j-radius, 4px);
    min-width: var(--j-touch-target, 36px);
    min-height: var(--j-touch-target, 36px);
}
.drawer-close:hover {
    background: var(--admin-hover-bg, #f0f0f0);
}
.drawer.drawer-docked .drawer-overlay {
    display: none;
}
.drawer.drawer-docked .drawer-panel {
    position: static;
    transform: translateX(0);
    box-shadow: none;
    width: var(--drawer-docked-width, 240px);
}
`;

module.exports = Drawer;
