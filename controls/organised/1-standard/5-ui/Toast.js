const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Toast — Non-modal notification system with stackable messages,
 * auto-dismiss timers, status variants, hover-pause, and action buttons.
 *
 * @param {Object} spec
 * @param {string} [spec.position='top-right'] — Position: top-right, top-left, top-center,
 *                                               bottom-right, bottom-left, bottom-center
 * @param {number} [spec.max_visible=5] — Maximum visible toasts before stacking.
 * @param {number} [spec.default_timeout_ms=5000] — Default auto-dismiss duration.
 *
 * Events:
 *   'show'    — { id, message, status }
 *   'dismiss' — { id, trigger }
 *   'action'  — { id, action_id }
 */
class Toast extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'toast';
        super(spec);
        this.add_class('toast-container');
        this.add_class('jsgui-toast-container');
        this.dom.tagName = 'div';
        this.dom.attributes['aria-live'] = 'polite';
        this.dom.attributes['aria-relevant'] = 'additions';

        // Position
        this._position = spec.position || 'top-right';
        this.dom.attributes['data-position'] = this._position;

        // Limits
        this._max_visible = (typeof spec.max_visible === 'number' && spec.max_visible > 0)
            ? spec.max_visible : 5;
        this._default_timeout_ms = (typeof spec.default_timeout_ms === 'number' && spec.default_timeout_ms > 0)
            ? spec.default_timeout_ms : 5000;

        this.toast_items = new Map();
        this._toast_timers = new Map();
        this.toast_id_counter = 1;
    }

    /**
     * Show a toast message.
     * @param {string} message - The message to show.
     * @param {object} [options] - Optional toast options.
     * @param {string} [options.status] - Status variant: success, error, warning, info.
     * @param {number} [options.timeout_ms] - Auto-dismiss ms (0 = no auto-dismiss).
     * @param {string} [options.action_label] - Action button label.
     * @param {string} [options.action_id] - Action button identifier.
     * @param {boolean} [options.dismissible=true] - Show dismiss button.
     * @returns {string} Toast id.
     */
    show(message, options = {}) {
        const msg_text = is_defined(message) ? String(message) : '';
        const id = `toast_${this.toast_id_counter++}`;
        const status = is_defined(options.status) ? String(options.status) : '';
        const dismissible = options.dismissible !== false;
        const action_label = is_defined(options.action_label) ? String(options.action_label) : '';
        const action_id = is_defined(options.action_id) ? String(options.action_id) : '';

        // ── Build toast item ──
        const toast_ctrl = new Control({ context: this.context });
        toast_ctrl.dom.tagName = 'div';
        toast_ctrl.add_class('toast');
        toast_ctrl.add_class('jsgui-toast');
        toast_ctrl.dom.attributes['data-toast-id'] = id;
        toast_ctrl.dom.attributes.role = 'status';
        toast_ctrl.dom.attributes['aria-atomic'] = 'true';

        if (status) {
            toast_ctrl.add_class(`toast-${status}`);
            toast_ctrl.dom.attributes['data-status'] = status;

            // Error toasts use assertive live region
            if (status === 'error') {
                toast_ctrl.dom.attributes['aria-live'] = 'assertive';
            }
        }

        // Icon area
        const icon_ctrl = new Control({ context: this.context });
        icon_ctrl.dom.tagName = 'span';
        icon_ctrl.add_class('toast-icon');
        icon_ctrl.dom.attributes['aria-hidden'] = 'true';
        const icon_map = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
        icon_ctrl.add(icon_map[status] || 'ℹ');
        toast_ctrl.add(icon_ctrl);

        // Message text
        const text_ctrl = new Control({ context: this.context });
        text_ctrl.dom.tagName = 'span';
        text_ctrl.add_class('toast-message');
        text_ctrl.add(msg_text);
        toast_ctrl.add(text_ctrl);

        // Actions area
        const actions_ctrl = new Control({ context: this.context });
        actions_ctrl.dom.tagName = 'span';
        actions_ctrl.add_class('toast-actions');

        // Action button (optional)
        if (action_label) {
            const action_ctrl = new Control({ context: this.context });
            action_ctrl.dom.tagName = 'button';
            action_ctrl.dom.attributes.type = 'button';
            action_ctrl.add_class('toast-action');
            action_ctrl.dom.attributes['data-toast-id'] = id;
            action_ctrl.dom.attributes['data-action-id'] = action_id || 'default';
            action_ctrl.add(action_label);
            actions_ctrl.add(action_ctrl);
        }

        // Dismiss button
        if (dismissible) {
            const dismiss_ctrl = new Control({ context: this.context });
            dismiss_ctrl.dom.tagName = 'button';
            dismiss_ctrl.dom.attributes.type = 'button';
            dismiss_ctrl.dom.attributes['data-toast-id'] = id;
            dismiss_ctrl.dom.attributes['data-dismiss'] = 'true';
            dismiss_ctrl.add_class('toast-dismiss');
            dismiss_ctrl.dom.attributes['aria-label'] = 'Dismiss notification';
            dismiss_ctrl.add('×');
            actions_ctrl.add(dismiss_ctrl);
        }

        toast_ctrl.add(actions_ctrl);

        // ── Enforce max_visible ──
        this._enforce_max_visible();

        // ── Add to DOM ──
        this.add(toast_ctrl);
        this.toast_items.set(id, toast_ctrl);

        // ── Auto-dismiss timer ──
        const timeout_ms = is_defined(options.timeout_ms)
            ? options.timeout_ms
            : this._default_timeout_ms;

        if (typeof window !== 'undefined' && Number.isFinite(timeout_ms) && timeout_ms > 0) {
            const timer_state = {
                remaining: timeout_ms,
                start: Date.now(),
                timer_id: null
            };
            timer_state.timer_id = setTimeout(() => {
                this._dismiss_internal(id, 'timeout');
            }, timeout_ms);
            this._toast_timers.set(id, timer_state);
        }

        // Raise event
        this.raise('show', { id, message: msg_text, status });

        return id;
    }

    /**
     * Dismiss a toast by id.
     * @param {string} toast_id - The toast id.
     */
    dismiss(toast_id) {
        this._dismiss_internal(toast_id, 'api');
    }

    /**
     * Dismiss all active toasts.
     */
    clear() {
        const ids = Array.from(this.toast_items.keys());
        for (const id of ids) {
            this._dismiss_internal(id, 'api');
        }
    }

    /**
     * Internal dismiss with trigger tracking.
     * @param {string} toast_id
     * @param {string} trigger - 'button' | 'timeout' | 'action' | 'api'
     */
    _dismiss_internal(toast_id, trigger) {
        const toast_ctrl = this.toast_items.get(toast_id);
        if (!toast_ctrl) return;

        // Clear any pending timer
        const timer_state = this._toast_timers.get(toast_id);
        if (timer_state && timer_state.timer_id) {
            clearTimeout(timer_state.timer_id);
        }
        this._toast_timers.delete(toast_id);

        this.toast_items.delete(toast_id);
        toast_ctrl.remove();

        this.raise('dismiss', { id: toast_id, trigger });
    }

    /**
     * Pause auto-dismiss timer for a toast (on hover).
     * @param {string} toast_id
     */
    _pause_timer(toast_id) {
        const timer_state = this._toast_timers.get(toast_id);
        if (!timer_state || !timer_state.timer_id) return;
        clearTimeout(timer_state.timer_id);
        timer_state.timer_id = null;
        timer_state.remaining = timer_state.remaining - (Date.now() - timer_state.start);
        if (timer_state.remaining < 0) timer_state.remaining = 0;
    }

    /**
     * Resume auto-dismiss timer for a toast (on mouse leave).
     * @param {string} toast_id
     */
    _resume_timer(toast_id) {
        const timer_state = this._toast_timers.get(toast_id);
        if (!timer_state || timer_state.timer_id) return; // already running or no timer
        if (timer_state.remaining <= 0) {
            this._dismiss_internal(toast_id, 'timeout');
            return;
        }
        timer_state.start = Date.now();
        timer_state.timer_id = setTimeout(() => {
            this._dismiss_internal(toast_id, 'timeout');
        }, timer_state.remaining);
    }

    /**
     * Enforce max_visible limit by removing oldest toasts.
     */
    _enforce_max_visible() {
        while (this.toast_items.size >= this._max_visible) {
            const oldest_id = this.toast_items.keys().next().value;
            if (oldest_id) {
                this._dismiss_internal(oldest_id, 'api');
            } else {
                break;
            }
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Click handler for dismiss buttons and action buttons
            this.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target || !target.getAttribute) return;

                const toast_id = target.getAttribute('data-toast-id');
                if (!is_defined(toast_id)) return;

                // Action button
                const action_id = target.getAttribute('data-action-id');
                if (is_defined(action_id)) {
                    this.raise('action', { id: toast_id, action_id });
                    this._dismiss_internal(toast_id, 'action');
                    return;
                }

                // Dismiss button
                const is_dismiss = target.getAttribute('data-dismiss');
                if (is_defined(is_dismiss)) {
                    this._dismiss_internal(toast_id, 'button');
                }
            });

            // Hover pause/resume for auto-dismiss timers
            this.add_dom_event_listener('mouseenter', e => {
                const toast_el = e.target && e.target.closest
                    ? e.target.closest('[data-toast-id]')
                    : null;
                if (!toast_el) return;
                const toast_id = toast_el.getAttribute('data-toast-id');
                if (toast_id) this._pause_timer(toast_id);
            }, true);

            this.add_dom_event_listener('mouseleave', e => {
                const toast_el = e.target && e.target.closest
                    ? e.target.closest('[data-toast-id]')
                    : null;
                if (!toast_el) return;
                const toast_id = toast_el.getAttribute('data-toast-id');
                if (toast_id) this._resume_timer(toast_id);
            }, true);
        }
    }
}

Toast.css = `
/* ─── Toast Container ─── */
.jsgui-toast-container {
    display: flex;
    flex-direction: column;
    gap: var(--j-space-2, 8px);
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    max-width: 420px;
    width: 100%;
    padding: var(--j-space-3, 12px);
}
/* Position variants */
.jsgui-toast-container[data-position="top-right"]    { top: 0; right: 0; }
.jsgui-toast-container[data-position="top-left"]     { top: 0; left: 0; }
.jsgui-toast-container[data-position="top-center"]   { top: 0; left: 50%; transform: translateX(-50%); }
.jsgui-toast-container[data-position="bottom-right"] { bottom: 0; right: 0; }
.jsgui-toast-container[data-position="bottom-left"]  { bottom: 0; left: 0; }
.jsgui-toast-container[data-position="bottom-center"]{ bottom: 0; left: 50%; transform: translateX(-50%); }

/* ─── Individual Toast ─── */
.jsgui-toast {
    display: flex;
    align-items: center;
    gap: var(--j-space-3, 12px);
    padding: var(--j-space-3, 12px) var(--j-space-4, 16px);
    border-radius: var(--j-radius-md, 8px);
    background: var(--j-bg-elevated, #1e1e2e);
    color: var(--j-fg, #e0e0e0);
    box-shadow: var(--j-shadow-lg, 0 8px 24px rgba(0,0,0,0.25));
    font-family: var(--j-font-sans, system-ui, sans-serif);
    font-size: var(--j-text-sm, 0.875rem);
    pointer-events: auto;
    animation: toast-enter 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transition: opacity 200ms ease-out, transform 200ms ease-out;
}

/* ── Status Variants ── */
.jsgui-toast.toast-success {
    background: var(--j-success, #1b5e20);
    color: var(--j-fg-on-status, #fff);
}
.jsgui-toast.toast-error {
    background: var(--j-danger, #b71c1c);
    color: var(--j-fg-on-status, #fff);
}
.jsgui-toast.toast-warning,
.jsgui-toast.toast-warn {
    background: var(--j-warning, #e65100);
    color: var(--j-fg-on-status, #fff);
}
.jsgui-toast.toast-info {
    background: var(--j-info, #0d47a1);
    color: var(--j-fg-on-status, #fff);
}

/* ── Icon ── */
.toast-icon {
    flex-shrink: 0;
    font-size: 1.1em;
    line-height: 1;
}

/* ── Message ── */
.toast-message {
    flex: 1 1 auto;
    line-height: 1.4;
}

/* ── Actions area ── */
.toast-actions {
    display: flex;
    align-items: center;
    gap: var(--j-space-2, 8px);
    flex-shrink: 0;
}

/* ── Action Button ── */
.toast-action {
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: inherit;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: var(--j-radius-sm, 4px);
    font-size: var(--j-text-sm, 0.875rem);
    font-weight: 600;
    transition: background 120ms ease-out;
}
.toast-action:hover {
    background: rgba(255, 255, 255, 0.3);
}
.toast-action:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

/* ── Dismiss Button ── */
.toast-dismiss {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    padding: 2px 6px;
    border-radius: var(--j-radius-sm, 4px);
    font-size: 1.1em;
    line-height: 1;
    transition: opacity 120ms ease-out;
}
.toast-dismiss:hover {
    opacity: 1;
}
.toast-dismiss:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

/* ── Animations ── */
@keyframes toast-enter {
    from {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
`;

module.exports = Toast;
