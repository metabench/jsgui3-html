/**
 * Alert_Banner — Status alert with icon, message, and optional dismiss.
 *
 * Displays a prominent alert bar with a leading status icon, message text,
 * and optional close button. Integrates with the Admin_Theme system.
 *
 * Options:
 *   status      — 'info' (default), 'success', 'warn'/'warning', 'error'
 *   message     — Alert message text (also accepts 'text')
 *   dismissible — Show close button (default: false)
 *   icon        — Custom icon override (otherwise auto from status)
 *   theme       — Admin theme name
 *
 * API:
 *   set_message(msg)   — Update message text
 *   set_status(status) — Change alert status/color
 *   dismiss()          — Dismiss with animation
 *
 * Events:
 *   'dismiss' — Fired when the banner is dismissed
 */
const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const STATUS_ICONS = {
    info: 'ℹ',
    success: '✓',
    warn: '⚠',
    warning: '⚠',
    error: '✕'
};

const get_status_class = status => status ? `alert-banner-${status}` : '';

class Alert_Banner extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'alert_banner';
        super(spec);
        this.add_class('alert-banner');
        this.add_class('jsgui-alert-banner');
        this.dom.tagName = 'div';
        this.dom.attributes.role = 'alert';

        this.status = is_defined(spec.status) ? String(spec.status) : 'info';
        this.message = is_defined(spec.message)
            ? String(spec.message)
            : (is_defined(spec.text) ? String(spec.text) : '');
        this.dismissible = !!spec.dismissible;
        this._custom_icon = spec.icon || '';

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }

        if (this.status) {
            this.add_class(get_status_class(this.status));
        }

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        this._ctrl_fields = this._ctrl_fields || {};

        // Status icon
        const icon_text = this._custom_icon || STATUS_ICONS[this.status] || STATUS_ICONS.info;
        const icon_ctrl = new Control({ context: this.context, tag_name: 'span' });
        icon_ctrl.add_class('alert-banner-icon');
        icon_ctrl.add(icon_text);
        this._ctrl_fields.icon = icon_ctrl;
        this.add(icon_ctrl);

        // Message
        const message_ctrl = new Control({ context: this.context, tag_name: 'span' });
        message_ctrl.add_class('alert-banner-message');
        if (this.message) {
            message_ctrl.add(this.message);
        }
        this._ctrl_fields.message = message_ctrl;
        this.add(message_ctrl);

        // Dismiss button
        if (this.dismissible) {
            const dismiss_ctrl = new Control({ context: this.context, tag_name: 'button' });
            dismiss_ctrl.dom.attributes.type = 'button';
            dismiss_ctrl.add_class('alert-banner-dismiss');
            dismiss_ctrl.dom.attributes['aria-label'] = 'Dismiss';
            dismiss_ctrl.add('×');
            this._ctrl_fields.dismiss = dismiss_ctrl;
            this.add(dismiss_ctrl);
        }
    }

    /**
     * Set the alert message text.
     * @param {string} message - The message to set.
     */
    set_message(message) {
        this.message = is_defined(message) ? String(message) : '';
        const message_ctrl = this._ctrl_fields && this._ctrl_fields.message;
        if (message_ctrl) {
            message_ctrl.clear();
            if (this.message) {
                message_ctrl.add(this.message);
            }
        }
    }

    /**
     * Set the alert status.
     * @param {string} status - The status to set.
     */
    set_status(status) {
        if (this.status) {
            this.remove_class(get_status_class(this.status));
        }
        this.status = is_defined(status) ? String(status) : '';
        if (this.status) {
            this.add_class(get_status_class(this.status));
        }
        // Update icon
        const icon_ctrl = this._ctrl_fields && this._ctrl_fields.icon;
        if (icon_ctrl && !this._custom_icon) {
            icon_ctrl.clear();
            icon_ctrl.add(STATUS_ICONS[this.status] || STATUS_ICONS.info);
        }
    }

    /**
     * Dismiss the alert banner with animation.
     */
    dismiss() {
        const el = this.dom.el;
        if (el) {
            el.style.transition = 'opacity 0.25s, transform 0.25s, max-height 0.3s';
            el.style.opacity = '0';
            el.style.transform = 'translateY(-8px)';
            el.style.maxHeight = '0';
            el.style.overflow = 'hidden';
            el.style.padding = '0 12px';
            el.style.marginBottom = '0';
            setTimeout(() => {
                this.add_class('alert-banner-hidden');
                el.style.display = 'none';
            }, 300);
        } else {
            this.add_class('alert-banner-hidden');
        }
        this.raise('dismiss');
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Dismiss button click
            this.add_dom_event_listener('click', e => {
                let target = e.target;
                while (target && target !== this.dom.el) {
                    if (target.classList && target.classList.contains('alert-banner-dismiss')) {
                        this.dismiss();
                        return;
                    }
                    target = target.parentNode;
                }
            });
        }
    }
}

Alert_Banner.css = `
.alert-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-family: var(--admin-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    background: var(--admin-card-bg, #f0f4f8);
    color: var(--admin-text, #334155);
    border: 1px solid var(--admin-border, #e2e8f0);
    transition: opacity 0.25s, transform 0.25s;
}
.alert-banner-icon {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    background: rgba(0,0,0,0.08);
    color: inherit;
}
.alert-banner-message {
    flex: 1;
    line-height: 1.4;
}
.alert-banner-dismiss {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    color: inherit;
    opacity: 0.5;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s, background 0.15s;
}
.alert-banner-dismiss:hover {
    opacity: 1;
    background: rgba(0,0,0,0.08);
}
/* Status variants */
.alert-banner-info {
    background: #eff6ff;
    color: #1e40af;
    border-color: #93c5fd;
}
.alert-banner-info .alert-banner-icon { background: #dbeafe; color: #1e40af; }
.alert-banner-success {
    background: #f0fdf4;
    color: #166534;
    border-color: #86efac;
}
.alert-banner-success .alert-banner-icon { background: #dcfce7; color: #166534; }
.alert-banner-warn,
.alert-banner-warning {
    background: #fffbeb;
    color: #92400e;
    border-color: #fcd34d;
}
.alert-banner-warn .alert-banner-icon,
.alert-banner-warning .alert-banner-icon { background: #fef3c7; color: #92400e; }
.alert-banner-error {
    background: #fef2f2;
    color: #991b1b;
    border-color: #fca5a5;
}
.alert-banner-error .alert-banner-icon { background: #fee2e2; color: #991b1b; }
.alert-banner-hidden {
    display: none;
}

:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-dismiss:hover {
    background: rgba(255,255,255,0.12);
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-info {
    background: #1a3352;
    color: #93c5fd;
    border-color: #1d4ed8;
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-info .alert-banner-icon {
    background: #1e3a8a;
    color: #bfdbfe;
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-success {
    background: #1e3a2f;
    color: #6ee7b7;
    border-color: #047857;
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-success .alert-banner-icon {
    background: #064e3b;
    color: #6ee7b7;
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-warn,
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-warning {
    background: #3a3000;
    color: #fcd34d;
    border-color: #a16207;
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-warn .alert-banner-icon,
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-warning .alert-banner-icon {
    background: #422006;
    color: #fcd34d;
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-error {
    background: #3a1d1d;
    color: #fca5a5;
    border-color: #b91c1c;
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .alert-banner-error .alert-banner-icon {
    background: #451a1a;
    color: #fca5a5;
}
`;

module.exports = Alert_Banner;
