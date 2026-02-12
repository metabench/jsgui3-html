const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { themeable } = require('../../../../../control_mixins/themeable');

const normalize_number_value = value => {
    if (!is_defined(value)) return undefined;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    return undefined;
};

/**
 * Progress Bar — visual indicator of completion.
 * 
 * @param {Object} spec
 * @param {number} [spec.value] — Current progress value
 * @param {number} [spec.max=100] — Maximum value
 * @param {string} [spec.variant] — Colour: primary (default), success, warning, danger, info
 * @param {string} [spec.size] — Size: xs, sm, md (default), lg, xl
 * @param {boolean} [spec.striped] — Striped fill pattern
 * @param {boolean} [spec.animated] — Animate the stripes
 * @param {boolean} [spec.indeterminate] — Indeterminate mode (unknown progress)
 * @param {boolean} [spec.show_label] — Show percentage label
 */
class Progress_Bar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'progress_bar';
        super(spec);
        this.add_class('progress-bar');
        this.add_class('jsgui-progress');

        // Apply themeable
        themeable(this, 'progress', spec);

        // Variant
        const variant = spec.variant || '';
        if (variant && variant !== 'primary') {
            this.dom.attributes['data-variant'] = variant;
        }

        // Size
        const size = spec.size || '';
        if (size && size !== 'md') {
            this.dom.attributes['data-size'] = size;
        }

        // Striped
        if (spec.striped) this.add_class('striped');
        if (spec.animated) this.add_class('animated');

        // Indeterminate
        this._indeterminate = !!spec.indeterminate;
        if (this._indeterminate) this.add_class('indeterminate');

        // Max
        this.max = is_defined(spec.max) ? Number(spec.max) : 100;
        this._show_label = !!spec.show_label;

        // Compose the div-based bar
        if (!spec.el) {
            this.compose(spec);
        }
    }

    compose(spec) {
        const { context } = this;

        // Fill bar
        this._fill = new Control({ context });
        this._fill.add_class('jsgui-progress-fill');
        this.add(this._fill);

        // Label (optional)
        if (this._show_label) {
            this._label = new Control({ context });
            this._label.add_class('jsgui-progress-label');
            this.add(this._label);
        }

        // Set initial value
        if (is_defined(spec.value)) {
            this.set_value(spec.value);
        }
    }

    /**
     * Set the progress value.
     * @param {number} value
     */
    set_value(value) {
        const numeric = normalize_number_value(value);
        if (!is_defined(numeric)) {
            this.value = undefined;
            if (this._fill) {
                this._fill.dom.attributes.style = this._fill.dom.attributes.style || {};
                this._fill.dom.attributes.style.width = '0%';
            }
            return;
        }

        const clamped = Math.max(0, Math.min(numeric, this.max));
        this.value = clamped;
        const percent = Math.round((clamped / this.max) * 100);

        if (this._fill) {
            this._fill.dom.attributes.style = this._fill.dom.attributes.style || {};
            this._fill.dom.attributes.style.width = `${percent}%`;
            if (this._fill.dom.el) {
                this._fill.dom.el.style.width = `${percent}%`;
            }
        }

        if (this._label) {
            this._label.clear();
            this._label.add(`${percent}%`);
            if (this._label.dom.el) {
                this._label.dom.el.textContent = `${percent}%`;
            }
        }
    }

    /**
     * Get the progress value.
     * @returns {number|undefined}
     */
    get_value() {
        return this.value;
    }

    /**
     * Set the max value.
     * @param {number} max_value
     */
    set_max(max_value) {
        const numeric = normalize_number_value(max_value);
        if (is_defined(numeric)) {
            this.max = numeric;
            // Re-render if value exists
            if (is_defined(this.value)) this.set_value(this.value);
        }
    }

    /**
     * Get the max value.
     * @returns {number}
     */
    get_max() {
        return this.max;
    }

    /**
     * Set indeterminate state.
     * @param {boolean} v
     */
    set_indeterminate(v) {
        this._indeterminate = !!v;
        if (this._indeterminate) {
            this.add_class('indeterminate');
        } else {
            this.remove_class('indeterminate');
        }
    }
}

// Legacy CSS kept for backward compat
Progress_Bar.css = `
.progress-bar {
    display: block;
    width: 100%;
}
`;

module.exports = Progress_Bar;
