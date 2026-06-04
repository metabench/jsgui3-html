const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const get_status_class = status => status ? `inline-validation-message-${status}` : '';

// Status icons (Unicode symbols)
const status_icons = {
    error: '\u2717',    // Heavy ballot X
    warn: '\u26A0',     // Warning sign
    info: '\u2139',     // Information source
    success: '\u2713'   // Check mark
};

class Inline_Validation_Message extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'inline_validation_message';
        super(spec);
        this.add_class('inline-validation-message');
        this.dom.tagName = 'span';

        // ARIA attributes for accessibility
        this.dom.attributes.role = 'status';
        this.dom.attributes['aria-live'] = 'polite';
        this.dom.attributes['aria-atomic'] = 'true';

        this.show_icon = spec.show_icon !== false;
        this.status = is_defined(spec.status) ? String(spec.status) : '';
        if (this.status) {
            this.add_class(get_status_class(this.status));
        }

        this.message = is_defined(spec.message) ? String(spec.message) : '';
        if (!spec.el) {
            this.compose();
        }
    }

    _get_icon_ctrl() {
        return this.icon || this._icon_ctrl || (this._ctrl_fields && this._ctrl_fields.icon) || null;
    }

    _get_text_ctrl() {
        return this.text || this._text_ctrl || (this._ctrl_fields && this._ctrl_fields.text) || null;
    }

    /**
     * Compose the message structure with icon.
     * @private
     */
    compose() {
        const { context } = this;

        // Icon container
        this._icon_ctrl = new Control({
            context,
            tag_name: 'span'
        });
        this._icon_ctrl.add_class('inline-validation-icon');
        this._icon_ctrl.dom.attributes['aria-hidden'] = 'true';
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.icon = this.icon = this._icon_ctrl;
        this.add(this._icon_ctrl);

        // Text container
        this._text_ctrl = new Control({
            context,
            tag_name: 'span'
        });
        this._text_ctrl.add_class('inline-validation-text');
        this._ctrl_fields.text = this.text = this._text_ctrl;
        this.add(this._text_ctrl);

        // Set initial content
        this._update_icon();
        if (this.message) {
            this._text_ctrl.add(this.message);
        }
    }

    /**
     * Update the icon based on status.
     * @private
     */
    _update_icon() {
        const icon_ctrl = this._get_icon_ctrl();
        if (!icon_ctrl) return;
        icon_ctrl.clear();

        if (this.show_icon && this.status && status_icons[this.status]) {
            icon_ctrl.add(status_icons[this.status]);
            icon_ctrl.show();
        } else {
            icon_ctrl.hide();
        }

        if (this.dom && this.dom.el) {
            const icon_el = this.dom.el.querySelector('.inline-validation-icon');
            if (icon_el) {
                if (this.show_icon && this.status && status_icons[this.status]) {
                    icon_el.textContent = status_icons[this.status];
                    icon_el.classList.remove('hidden');
                } else {
                    icon_el.textContent = '';
                    icon_el.classList.add('hidden');
                }
            }
        }
    }

    /**
     * Set the validation message text.
     * @param {string} message - The message to set.
     * @param {string} [status] - Optional status to set at the same time.
     */
    set_message(message, status) {
        this.message = is_defined(message) ? String(message) : '';
        const text_ctrl = this._get_text_ctrl();

        if (text_ctrl) {
            text_ctrl.clear();
            if (this.message) {
                text_ctrl.add(this.message);
            }
        }

        if (this.dom && this.dom.el) {
            const text_el = this.dom.el.querySelector('.inline-validation-text');
            if (text_el) {
                text_el.textContent = this.message;
            }
        }

        if (is_defined(status)) {
            this.set_status(status);
        }
    }

    /**
     * Get the validation message text.
     * @returns {string}
     */
    get_message() {
        return this.message || '';
    }

    /**
     * Set the validation status.
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
        this._update_icon();
    }

    /**
     * Clear the message and status.
     */
    clear_validation() {
        this.set_message('');
        this.set_status('');
    }

    /**
     * Set error state.
     * @param {string} message - Error message.
     */
    set_error(message) {
        this.set_message(message, 'error');
    }

    /**
     * Set success state.
     * @param {string} [message] - Optional success message.
     */
    set_success(message) {
        this.set_message(message || '', 'success');
    }

    /**
     * Set warning state.
     * @param {string} message - Warning message.
     */
    set_warning(message) {
        this.set_message(message, 'warn');
    }

    /**
     * Set info state.
     * @param {string} message - Info message.
     */
    set_info(message) {
        this.set_message(message, 'info');
    }
}

Inline_Validation_Message.css = `
.inline-validation-message {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85em;
    color: var(--admin-text-secondary, #444);
    min-height: 1.2em;
}

.inline-validation-icon {
    flex-shrink: 0;
    font-weight: bold;
}

.inline-validation-text {
    flex: 1;
}

.inline-validation-message-error {
    color: #b71c1c;
}

.inline-validation-message-error .inline-validation-icon {
    color: #d32f2f;
}

.inline-validation-message-warn {
    color: #e65100;
}

.inline-validation-message-warn .inline-validation-icon {
    color: #ff9800;
}

.inline-validation-message-info {
    color: #0d47a1;
}

.inline-validation-message-info .inline-validation-icon {
    color: #1976d2;
}

.inline-validation-message-success {
    color: #1b5e20;
}

.inline-validation-message-success .inline-validation-icon {
    color: #388e3c;
}

:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message {
    color: #cbd5e1;
}

:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message-error,
:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message-error .inline-validation-icon {
    color: #fca5a5;
}

:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message-warn,
:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message-warn .inline-validation-icon {
    color: #fcd34d;
}

:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message-info,
:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message-info .inline-validation-icon {
    color: #93c5fd;
}

:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message-success,
:is(.jsgui-dark-mode, [data-theme="dark"]) .inline-validation-message-success .inline-validation-icon {
    color: #6ee7b7;
}
`;

module.exports = Inline_Validation_Message;
