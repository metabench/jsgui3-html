const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const get_status_class = status => status ? `inline-validation-message-${status}` : '';

class Inline_Validation_Message extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'inline_validation_message';
        super(spec);
        this.add_class('inline-validation-message');
        this.dom.tagName = 'span';
        this.dom.attributes.role = 'status';

        this.status = is_defined(spec.status) ? String(spec.status) : '';
        if (this.status) {
            this.add_class(get_status_class(this.status));
        }

        this.message = is_defined(spec.message) ? String(spec.message) : '';
        if (!spec.el && this.message) {
            this.add(this.message);
        }
    }

    /**
     * Set the validation message text.
     * @param {string} message - The message to set.
     */
    set_message(message) {
        this.message = is_defined(message) ? String(message) : '';
        this.clear();
        if (this.message) {
            this.add(this.message);
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
    }
}

Inline_Validation_Message.css = `
.inline-validation-message {
    display: inline-flex;
    align-items: center;
    font-size: 0.85em;
    color: #444;
}
.inline-validation-message-error {
    color: #b71c1c;
}
.inline-validation-message-warn {
    color: #ff6f00;
}
.inline-validation-message-info {
    color: #0d47a1;
}
.inline-validation-message-success {
    color: #1b5e20;
}
`;

module.exports = Inline_Validation_Message;
