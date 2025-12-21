const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const get_status_class = status => status ? `alert-banner-${status}` : '';

class Alert_Banner extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'alert_banner';
        super(spec);
        this.add_class('alert-banner');
        this.dom.tagName = 'div';
        this.dom.attributes.role = 'alert';

        this.status = is_defined(spec.status) ? String(spec.status) : '';
        this.message = is_defined(spec.message)
            ? String(spec.message)
            : (is_defined(spec.text) ? String(spec.text) : '');
        this.dismissible = !!spec.dismissible;

        if (this.status) {
            this.add_class(get_status_class(this.status));
        }

        if (!spec.el) {
            this.compose_alert();
        }
    }

    compose_alert() {
        const message_ctrl = new Control({ context: this.context });
        message_ctrl.dom.tagName = 'span';
        message_ctrl.add_class('alert-banner-message');
        if (this.message) {
            message_ctrl.add(this.message);
        }

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.message = message_ctrl;

        this.add(message_ctrl);

        if (this.dismissible) {
            const dismiss_ctrl = new Control({ context: this.context });
            dismiss_ctrl.dom.tagName = 'button';
            dismiss_ctrl.dom.attributes.type = 'button';
            dismiss_ctrl.add_class('alert-banner-dismiss');
            dismiss_ctrl.add('x');
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
    }

    /**
     * Dismiss the alert banner.
     */
    dismiss() {
        this.add_class('alert-banner-hidden');
        if (this.dom.el) {
            this.dom.el.style.display = 'none';
        }
        this.raise('dismiss');
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const dismiss_ctrl = this._ctrl_fields && this._ctrl_fields.dismiss;
            if (!dismiss_ctrl || !dismiss_ctrl.dom.el) return;

            dismiss_ctrl.on('click', () => this.dismiss());
        }
    }
}

Alert_Banner.css = `
.alert-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 6px;
    background: #f0f0f0;
    color: #333;
}
.alert-banner-info {
    background: #e3f2fd;
    color: #0d47a1;
}
.alert-banner-success {
    background: #e8f5e9;
    color: #1b5e20;
}
.alert-banner-warn {
    background: #fff8e1;
    color: #ff6f00;
}
.alert-banner-error {
    background: #ffebee;
    color: #b71c1c;
}
.alert-banner-dismiss {
    border: none;
    background: transparent;
    cursor: pointer;
    color: inherit;
}
.alert-banner-hidden {
    display: none;
}
`;

module.exports = Alert_Banner;
