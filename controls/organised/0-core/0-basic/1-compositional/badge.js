const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { themeable } = require('../../../../../control_mixins/themeable');

const MAX_DISPLAY_VALUE = 99;

class Badge extends Control {
    /**
     * Create a new Badge.
     * 
     * @param {Object} spec - Badge specification
     * @param {string} [spec.text] - Badge text content
     * @param {string} [spec.label] - Alias for text
     * @param {number} [spec.value] - Numeric value (auto-truncated to max_value+)
     * @param {number} [spec.max_value=99] - Max displayed value before showing "99+"
     * @param {string} [spec.variant] - Colour: primary, success, warning, danger, info, primary-subtle, etc.
     * @param {string} [spec.size] - Size: sm, md (default), lg
     * @param {boolean} [spec.dot] - Dot-only mode (no text)
     * @param {boolean} [spec.pulse] - Pulse animation
     * @param {boolean} [spec.square] - Square shape instead of pill
     * @param {string} [spec.status] - Legacy status class (info, success, warn, error)
     */
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'badge';
        super(spec);
        this.add_class('badge');
        this.add_class('jsgui-badge');
        this.dom.tagName = 'span';

        // Apply themeable
        const params = themeable(this, 'badge', spec);

        // Variant (colour)
        const variant = spec.variant || params.variant || '';
        if (variant) {
            this.dom.attributes['data-variant'] = variant;
        }

        // Size
        const size = spec.size || params.size || '';
        if (size && size !== 'md') {
            this.dom.attributes['data-size'] = size;
        }

        // Dot mode
        if (spec.dot) {
            this.add_class('dot');
        }

        // Pulse
        if (spec.pulse) {
            this.add_class('pulse');
        }

        // Square shape
        if (spec.square) {
            this.add_class('square');
        }

        // Legacy status support
        this.status = is_defined(spec.status) ? String(spec.status) : '';
        if (this.status) {
            this.add_class(`badge-${this.status}`);
        }

        // Max value
        this._max_value = is_defined(spec.max_value) ? spec.max_value : MAX_DISPLAY_VALUE;

        // Content
        if (!spec.el && !spec.dot) {
            if (is_defined(spec.value)) {
                this.set_value(spec.value);
            } else {
                this.text = is_defined(spec.text) ? String(spec.text) : (is_defined(spec.label) ? String(spec.label) : '');
                if (this.text) {
                    this.add(this.text);
                }
            }
        }
    }

    /**
     * Set badge text.
     * @param {string} text - The text to set.
     */
    set_text(text) {
        this.text = is_defined(text) ? String(text) : '';
        this.clear();
        if (this.text) {
            this.add(this.text);
        }
    }

    /**
     * Get badge text.
     * @returns {string}
     */
    get_text() {
        return this.text || '';
    }

    /**
     * Set numeric value (auto-truncates to max_value+).
     * @param {number} value - The numeric value.
     */
    set_value(value) {
        this._value = value;
        const display = (typeof value === 'number' && value > this._max_value)
            ? `${this._max_value}+`
            : String(value);
        this.set_text(display);
    }

    /**
     * Get the raw numeric value.
     * @returns {number}
     */
    get_value() {
        return this._value;
    }

    /**
     * Set badge status (legacy).
     * @param {string} status - The status to set.
     */
    set_status(status) {
        if (this.status) {
            this.remove_class(`badge-${this.status}`);
        }
        this.status = is_defined(status) ? String(status) : '';
        if (this.status) {
            this.add_class(`badge-${this.status}`);
        }
    }

    /**
     * Set variant.
     * @param {string} variant - Colour variant name.
     */
    set_variant(variant) {
        this.dom.attributes['data-variant'] = variant || '';
    }

    /**
     * Enable/disable pulse animation.
     * @param {boolean} enabled
     */
    set_pulse(enabled) {
        if (enabled) {
            this.add_class('pulse');
        } else {
            this.remove_class('pulse');
        }
    }
}

// Legacy inline CSS kept for backward compatibility
Badge.css = `
.badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75em;
    background: #eee;
    color: #333;
}
.badge-info {
    background: #e3f2fd;
    color: #0d47a1;
}
.badge-success {
    background: #e8f5e9;
    color: #1b5e20;
}
.badge-warn {
    background: #fff8e1;
    color: #ff6f00;
}
.badge-error {
    background: #ffebee;
    color: #b71c1c;
}
`;

module.exports = Badge;
