const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const normalize_number_value = value => {
    if (!is_defined(value)) return undefined;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    return undefined;
};

class Progress_Bar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'progress_bar';
        super(spec);
        this.add_class('progress-bar');
        this.dom.tagName = 'progress';

        if (is_defined(spec.max)) {
            this.set_max(spec.max);
        }
        if (is_defined(spec.value)) {
            this.set_value(spec.value);
        }
    }

    /**
     * Set the progress value.
     * @param {*} value - The value to set.
     */
    set_value(value) {
        const numeric = normalize_number_value(value);
        if (!is_defined(numeric)) {
            this.value = undefined;
            this.dom.attributes.value = '';
            if (this.dom.el) {
                this.dom.el.removeAttribute('value');
            }
            return;
        }

        const max_value = is_defined(this.max) ? this.max : undefined;
        const clamped = is_defined(max_value)
            ? Math.max(0, Math.min(numeric, max_value))
            : Math.max(0, numeric);

        this.value = clamped;
        const value_str = String(clamped);
        this.dom.attributes.value = value_str;
        if (this.dom.el) {
            this.dom.el.value = clamped;
        }
    }

    /**
     * Get the progress value.
     * @returns {*}
     */
    get_value() {
        return this.value;
    }

    /**
     * Set the progress max value.
     * @param {*} max_value - The max value to set.
     */
    set_max(max_value) {
        const numeric = normalize_number_value(max_value);
        if (!is_defined(numeric)) {
            this.max = undefined;
            this.dom.attributes.max = '';
            if (this.dom.el) {
                this.dom.el.removeAttribute('max');
            }
            return;
        }
        this.max = numeric;
        this.dom.attributes.max = String(numeric);
        if (this.dom.el) {
            this.dom.el.max = numeric;
        }
    }

    /**
     * Get the progress max value.
     * @returns {*}
     */
    get_max() {
        return this.max;
    }
}

module.exports = Progress_Bar;
