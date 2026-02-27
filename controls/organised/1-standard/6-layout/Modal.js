const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Modal — Dialog overlay with header, body, footer, and backdrop.
 *
 * @param {Object} spec
 * @param {string} [spec.title] — Modal title text
 * @param {string} [spec.size] — Size: sm, md (default), lg, xl, full
 * @param {boolean} [spec.closable=true] — Show close button
 * @param {boolean} [spec.close_on_overlay=true] — Close when clicking overlay
 *
 * Events:
 *   'open' — Fired when modal opens
 *   'close' — Fired when modal closes
 */
class Modal extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'modal';
        super(spec);
        this.add_class('modal');
        this.add_class('jsgui-modal-overlay');

        this.dom.attributes.role = 'dialog';
        this.dom.attributes['aria-modal'] = 'true';

        // Config
        this._title = spec.title || '';
        this._size = spec.size || '';
        this._closable = is_defined(spec.closable) ? !!spec.closable : true;
        this._close_on_overlay = is_defined(spec.close_on_overlay) ? !!spec.close_on_overlay : true;
        this._is_open = false;

        // ── Adaptive layout options (all overridable) ──
        // layout_mode: 'auto' | 'phone' | 'tablet' | 'desktop'
        this.layout_mode = spec.layout_mode || 'auto';
        // Breakpoint for phone mode
        this.phone_breakpoint = is_defined(spec.phone_breakpoint) ? Number(spec.phone_breakpoint) : 600;
        // Whether to auto-fullscreen on phone (default true, overridable)
        this.phone_fullscreen = spec.phone_fullscreen !== false;
        // Whether to trap focus inside the modal (default true)
        this.trap_focus_enabled = spec.trap_focus !== false;

        if (!spec.el) {
            this.compose(spec);
        }
    }

    compose(spec) {
        const { context } = this;

        // Modal box
        this._box = new Control({ context });
        this._box.add_class('jsgui-modal');
        if (this._size && this._size !== 'md') {
            this._box.dom.attributes['data-size'] = this._size;
        }

        // Header
        this._header = new Control({ context });
        this._header.add_class('jsgui-modal-header');

        this._title_ctrl = new Control({ context, tag_name: 'h2' });
        this._title_ctrl.add_class('jsgui-modal-title');
        if (this._title) this._title_ctrl.add(this._title);
        this._header.add(this._title_ctrl);

        if (this._closable) {
            this._close_btn = new Control({ context, tag_name: 'button' });
            this._close_btn.add_class('jsgui-modal-close');
            this._close_btn.dom.attributes.type = 'button';
            this._close_btn.dom.attributes['aria-label'] = 'Close';
            this._close_btn.add('×');
            this._header.add(this._close_btn);
        }

        this._box.add(this._header);

        // Body
        this._body = new Control({ context });
        this._body.add_class('jsgui-modal-body');
        if (is_defined(spec.content)) {
            this._body.add(spec.content);
        }
        this._box.add(this._body);

        // Footer (empty slot)
        this._footer = new Control({ context });
        this._footer.add_class('jsgui-modal-footer');
        this._box.add(this._footer);

        this.add(this._box);
    }

    // ── Public API ──

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
            if (window.innerWidth < this.phone_breakpoint) return 'phone';
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

        // Apply phone fullscreen if configured
        if (this._box && this._box.dom && this._box.dom.el) {
            if (mode === 'phone' && this.phone_fullscreen) {
                this._box.dom.el.setAttribute('data-size', 'full');
            } else if (this._size && this._size !== 'md') {
                this._box.dom.el.setAttribute('data-size', this._size);
            } else {
                this._box.dom.el.removeAttribute('data-size');
            }
        }
    }

    /** Open the modal */
    open() {
        this._is_open = true;
        this.add_class('is-open');
        this._apply_layout_mode();
        this.raise('open');
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this._handle_keydown);
        }
    }

    /** Close the modal */
    close() {
        this._is_open = false;
        this.remove_class('is-open');
        this.raise('close');
        if (typeof document !== 'undefined') {
            document.removeEventListener('keydown', this._handle_keydown);
        }
    }

    /** Toggle open/close */
    toggle() {
        if (this._is_open) this.close();
        else this.open();
    }

    /** Set the modal title */
    set_title(text) {
        this._title = text || '';
        if (this._title_ctrl) {
            this._title_ctrl.clear();
            if (this._title) this._title_ctrl.add(this._title);
        }
    }

    /** Add content to the body */
    set_content(content) {
        if (this._body) {
            this._body.clear();
            if (content) this._body.add(content);
        }
    }

    /** Add content to the footer */
    set_footer(content) {
        if (this._footer) {
            this._footer.clear();
            if (content) this._footer.add(content);
        }
    }

    /** Get the body control for direct manipulation */
    get body() { return this._body; }
    get footer() { return this._footer; }

    // ── Activation ──

    /**
     * Trap focus inside the modal when Tab is pressed.
     * @param {KeyboardEvent} e_key
     */
    _trap_focus(e_key) {
        if (!this._is_open || !this.trap_focus_enabled) return;
        if (!this._box || !this._box.dom || !this._box.dom.el) return;

        const box_el = this._box.dom.el;
        const focusable = box_el.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e_key.shiftKey && document.activeElement === first) {
            e_key.preventDefault();
            last.focus();
        } else if (!e_key.shiftKey && document.activeElement === last) {
            e_key.preventDefault();
            first.focus();
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Apply initial layout mode
            this._apply_layout_mode();

            // Listen for window resize in auto mode
            if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
                this._resize_handler = () => {
                    if (this._is_open) this._apply_layout_mode();
                };
                window.addEventListener('resize', this._resize_handler);
            }

            // Close button
            if (this._close_btn && this._close_btn.dom.el) {
                this._close_btn.dom.el.addEventListener('click', () => this.close());
            }

            // Overlay click
            if (this._close_on_overlay) {
                this.dom.el.addEventListener('click', (e) => {
                    if (e.target === this.dom.el) this.close();
                });
            }

            // Focus trap on Tab key
            if (this.trap_focus_enabled) {
                this.dom.el.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        this._trap_focus(e);
                    }
                });
            }
        }
    }

    _handle_keydown = (e) => {
        if (e.key === 'Escape' && this._is_open && this._closable) {
            this.close();
        }
    }
}

// Full adaptive CSS
Modal.css = `
/* ─── Modal ─── */
.modal {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: var(--j-overlay, rgba(0, 0, 0, 0.4));
    align-items: center;
    justify-content: center;
}
.modal.is-open {
    display: flex;
}
.jsgui-modal {
    background: var(--admin-card-bg, #fff);
    border-radius: var(--j-radius-lg, 8px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    min-width: 320px;
    overflow: hidden;
    color: var(--admin-text, #1e1e1e);
}
.jsgui-modal[data-size="sm"] {
    min-width: 280px;
    max-width: 400px;
}
.jsgui-modal[data-size="lg"] {
    min-width: 600px;
    max-width: 800px;
}
.jsgui-modal[data-size="xl"] {
    min-width: 800px;
    max-width: 1100px;
}
.jsgui-modal[data-size="full"] {
    min-width: 100vw;
    min-height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
}
.jsgui-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
    background: var(--admin-header-bg, #f8f8f8);
}
.jsgui-modal-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--admin-text, #1e1e1e);
}
.jsgui-modal-close {
    border: none;
    background: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--admin-muted, #666);
    min-width: var(--j-touch-target, 36px);
    min-height: var(--j-touch-target, 36px);
    display: flex;
    align-items: center;
    justify-content: center;
}
.jsgui-modal-close:hover {
    background: var(--admin-hover-bg, #eee);
    color: var(--admin-text, #1e1e1e);
}
.jsgui-modal-body {
    padding: 16px;
    overflow: auto;
    flex: 1;
}
.jsgui-modal-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--admin-border, #e0e0e0);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
.jsgui-modal-footer:empty {
    display: none;
}

/* ── Phone layout: auto-fullscreen ── */
.modal[data-layout-mode="phone"] .jsgui-modal-close {
    min-width: 44px;
    min-height: 44px;
}
`;

module.exports = Modal;