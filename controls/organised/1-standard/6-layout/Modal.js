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
 * @param {Function} [spec.before_close] — Async guard: return false to cancel close
 *
 * Events:
 *   'open' — Fired when modal opens
 *   'close' — Fired when modal closes, { trigger: 'button'|'escape'|'overlay'|'api' }
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
        this._before_close = typeof spec.before_close === 'function' ? spec.before_close : null;
        this._is_open = false;
        this._previous_focus = null;

        // ── Adaptive layout options ──
        this.layout_mode = spec.layout_mode || 'auto';
        this.phone_breakpoint = is_defined(spec.phone_breakpoint) ? Number(spec.phone_breakpoint) : 600;
        this.phone_fullscreen = spec.phone_fullscreen !== false;
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
        const title_id = this._id() + '-title';
        this._title_ctrl.dom.attributes.id = title_id;
        if (this._title) this._title_ctrl.add(this._title);
        this._header.add(this._title_ctrl);

        // Link dialog to its title
        this.dom.attributes['aria-labelledby'] = title_id;

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
        if (this._is_open) return;

        // Save current focus for restoration on close
        if (typeof document !== 'undefined') {
            this._previous_focus = document.activeElement;
        }

        this._is_open = true;
        this.add_class('is-open');
        this._apply_layout_mode();
        this.raise('open');

        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this._handle_keydown);
        }

        // Focus the close button (or first focusable) after open
        if (this._close_btn && this._close_btn.dom && this._close_btn.dom.el) {
            this._close_btn.dom.el.focus();
        }
    }

    /**
     * Close the modal — runs before_close guard if configured.
     * @param {string} [trigger='api'] — What caused the close.
     */
    async close(trigger = 'api') {
        if (!this._is_open) return;

        // before_close guard — return false to cancel
        if (this._before_close) {
            const allowed = await this._before_close({ trigger });
            if (allowed === false) return;
        }

        this._is_open = false;
        this.remove_class('is-open');
        this.raise('close', { trigger });

        if (typeof document !== 'undefined') {
            document.removeEventListener('keydown', this._handle_keydown);
        }

        // Restore focus to the element that had it before open
        if (this._previous_focus && typeof this._previous_focus.focus === 'function') {
            this._previous_focus.focus();
            this._previous_focus = null;
        }
    }

    /** Toggle open/close */
    toggle() {
        if (this._is_open) this.close();
        else this.open();
    }

    /** Set a before_close guard function */
    set_before_close(fn) {
        this._before_close = typeof fn === 'function' ? fn : null;
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
                this._close_btn.dom.el.addEventListener('click', () => this.close('button'));
            }

            // Overlay click
            if (this._close_on_overlay) {
                this.dom.el.addEventListener('click', (e) => {
                    if (e.target === this.dom.el) this.close('overlay');
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
            this.close('escape');
        }
    }
}

Modal.css = `
/* ─── Modal Overlay ─── */
.modal {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: var(--j-overlay, rgba(0, 0, 0, 0.5));
    align-items: center;
    justify-content: center;
}
.modal.is-open {
    display: flex;
    animation: modal-fade-in 200ms ease-out;
}
@keyframes modal-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* ─── Modal Box ─── */
.jsgui-modal {
    background: var(--j-bg-surface, #1e1e2e);
    border-radius: var(--j-radius-lg, 8px);
    box-shadow: var(--j-shadow-xl, 0 8px 32px rgba(0, 0, 0, 0.3));
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    min-width: 320px;
    overflow: hidden;
    color: var(--j-fg, #e0e0e0);
    animation: modal-scale-in 200ms ease-out;
}
@keyframes modal-scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
}

/* ─── Size Variants ─── */
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

/* ─── Header ─── */
.jsgui-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--j-space-3, 12px) var(--j-space-4, 16px);
    border-bottom: 1px solid var(--j-border, #333);
    background: var(--j-bg-elevated, #252535);
}
.jsgui-modal-title {
    margin: 0;
    font-size: var(--j-text-base, 1rem);
    font-weight: 600;
    color: var(--j-fg, #e0e0e0);
    font-family: var(--j-font-sans, system-ui, sans-serif);
}

/* ─── Close Button ─── */
.jsgui-modal-close {
    border: none;
    background: transparent;
    font-size: var(--j-text-lg, 1.25rem);
    cursor: pointer;
    padding: var(--j-space-1, 4px) var(--j-space-2, 8px);
    border-radius: var(--j-radius-sm, 4px);
    color: var(--j-fg-muted, #888);
    min-width: var(--j-touch-target, 36px);
    min-height: var(--j-touch-target, 36px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 120ms ease-out, color 120ms ease-out;
}
.jsgui-modal-close:hover {
    background: var(--j-bg-hover, rgba(255,255,255,0.08));
    color: var(--j-fg, #e0e0e0);
}
.jsgui-modal-close:focus-visible {
    outline: 2px solid var(--j-primary, #5b9bd5);
    outline-offset: 2px;
}

/* ─── Body ─── */
.jsgui-modal-body {
    padding: var(--j-space-4, 16px);
    overflow: auto;
    flex: 1;
    font-family: var(--j-font-sans, system-ui, sans-serif);
}

/* ─── Footer ─── */
.jsgui-modal-footer {
    padding: var(--j-space-3, 12px) var(--j-space-4, 16px);
    border-top: 1px solid var(--j-border, #333);
    display: flex;
    justify-content: flex-end;
    gap: var(--j-space-2, 8px);
}
.jsgui-modal-footer:empty {
    display: none;
}

/* ── Phone layout: auto-fullscreen, larger touch targets ── */
.modal[data-layout-mode="phone"] .jsgui-modal-close {
    min-width: 44px;
    min-height: 44px;
}
`;

module.exports = Modal;