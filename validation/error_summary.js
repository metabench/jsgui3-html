'use strict';

const jsgui = require('../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Error Summary Component
 *
 * Displays a summary of form validation errors with:
 * - ARIA live region for screen reader announcements
 * - Clickable links to jump to error fields
 * - Automatic show/hide based on error state
 */
class Error_Summary extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'error_summary';
        super(spec);
        this.add_class('error-summary');
        this.dom.tagName = 'div';

        // ARIA live region for accessibility
        this.dom.attributes.role = 'alert';
        this.dom.attributes['aria-live'] = 'polite';
        this.dom.attributes['aria-atomic'] = 'true';

        this.title = spec.title || 'Please correct the following errors:';
        this.errors = {};
        this.field_labels = spec.field_labels || {};

        if (!spec.el) {
            this._compose();
        }

        // Initially hidden if no errors
        this.hide();
    }

    /**
     * Compose the error summary structure.
     * @private
     */
    _compose() {
        const { context } = this;

        // Title
        this._title_ctrl = new Control({
            context,
            tag_name: 'h3'
        });
        this._title_ctrl.add_class('error-summary-title');
        this._title_ctrl.add(this.title);
        this.add(this._title_ctrl);

        // Error list
        this._list_ctrl = new Control({
            context,
            tag_name: 'ul'
        });
        this._list_ctrl.add_class('error-summary-list');
        this.add(this._list_ctrl);
    }

    /**
     * Set the errors to display.
     * @param {Object} errors - Object with field names as keys and error messages as values.
     */
    set_errors(errors) {
        this.errors = errors || {};
        this._render_errors();

        const has_errors = Object.keys(this.errors).length > 0;
        if (has_errors) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Add a single error.
     * @param {string} field_name - Field name.
     * @param {string} message - Error message.
     */
    add_error(field_name, message) {
        this.errors[field_name] = message;
        this._render_errors();
        this.show();
    }

    /**
     * Remove a single error.
     * @param {string} field_name - Field name.
     */
    remove_error(field_name) {
        delete this.errors[field_name];
        this._render_errors();

        if (Object.keys(this.errors).length === 0) {
            this.hide();
        }
    }

    /**
     * Clear all errors.
     */
    clear() {
        this.errors = {};
        this._render_errors();
        this.hide();
    }

    /**
     * Get the number of errors.
     * @returns {number}
     */
    get error_count() {
        return Object.keys(this.errors).length;
    }

    /**
     * Check if there are any errors.
     * @returns {boolean}
     */
    has_errors() {
        return this.error_count > 0;
    }

    /**
     * Set field labels for display.
     * @param {Object} labels - Object with field names as keys and labels as values.
     */
    set_field_labels(labels) {
        this.field_labels = labels || {};
        this._render_errors();
    }

    /**
     * Render the error list.
     * @private
     */
    _render_errors() {
        if (!this._list_ctrl) return;

        this._list_ctrl.clear();

        Object.entries(this.errors).forEach(([field_name, message]) => {
            const label = this.field_labels[field_name] || this._humanize_field_name(field_name);
            const item = this._create_error_item(field_name, label, message);
            this._list_ctrl.add(item);
        });
    }

    /**
     * Create an error list item.
     * @private
     */
    _create_error_item(field_name, label, message) {
        const { context } = this;

        const item = new Control({
            context,
            tag_name: 'li'
        });
        item.add_class('error-summary-item');

        const link = new Control({
            context,
            tag_name: 'a'
        });
        link.add_class('error-summary-link');
        link.dom.attributes.href = `#${field_name}`;
        link.dom.attributes['data-field'] = field_name;

        // Format: "Field Label: Error message"
        const field_label = new Control({
            context,
            tag_name: 'span'
        });
        field_label.add_class('error-summary-field');
        field_label.add(label + ': ');

        const error_text = new Control({
            context,
            tag_name: 'span'
        });
        error_text.add_class('error-summary-message');
        error_text.add(message);

        link.add(field_label);
        link.add(error_text);
        item.add(link);

        return item;
    }

    /**
     * Convert field_name to human-readable label.
     * @private
     */
    _humanize_field_name(field_name) {
        return field_name
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^./, str => str.toUpperCase());
    }

    /**
     * Activate the control.
     */
    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Handle click on error links to focus the field
            this.add_dom_event_listener('click', (e) => {
                const link = e.target.closest('.error-summary-link');
                if (!link) return;

                e.preventDefault();
                const field_name = link.getAttribute('data-field');
                if (!field_name) return;

                // Try to find and focus the field
                const field = document.querySelector(
                    `[name="${field_name}"], #${field_name}, [data-field-name="${field_name}"]`
                );
                if (field) {
                    field.focus();
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                this.raise('error_click', { field_name });
            });
        }
    }
}

Error_Summary.css = `
.error-summary {
    background-color: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
}

.error-summary-title {
    color: #b91c1c;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
}

.error-summary-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.error-summary-item {
    margin-bottom: 8px;
}

.error-summary-item:last-child {
    margin-bottom: 0;
}

.error-summary-link {
    color: #b91c1c;
    text-decoration: underline;
    cursor: pointer;
}

.error-summary-link:hover {
    color: #991b1b;
}

.error-summary-link:focus {
    outline: 2px solid #ef4444;
    outline-offset: 2px;
}

.error-summary-field {
    font-weight: 600;
}

.error-summary-message {
    font-weight: normal;
}

/* Hidden state */
.error-summary[hidden],
.error-summary.hidden {
    display: none;
}
`;

module.exports = Error_Summary;
