const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const normalize_number_value = value => {
    if (!is_defined(value)) return undefined;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    return undefined;
};

class Meter extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'meter';
        super(spec);
        this.add_class('meter');
        this.dom.tagName = 'meter';

        if (is_defined(spec.min)) this.set_min(spec.min);
        if (is_defined(spec.max)) this.set_max(spec.max);
        if (is_defined(spec.low)) this.set_low(spec.low);
        if (is_defined(spec.high)) this.set_high(spec.high);
        if (is_defined(spec.optimum)) this.set_optimum(spec.optimum);
        if (is_defined(spec.value)) this.set_value(spec.value);
    }

    /**
     * Set the meter value.
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

        const min_value = is_defined(this.min) ? this.min : 0;
        const max_value = is_defined(this.max) ? this.max : numeric;
        const clamped = Math.min(Math.max(numeric, min_value), max_value);

        this.value = clamped;
        this.dom.attributes.value = String(clamped);
        if (this.dom.el) {
            this.dom.el.value = clamped;
        }
    }

    /**
     * Get the meter value.
     * @returns {*}
     */
    get_value() {
        return this.value;
    }

    /**
     * Set the meter min value.
     * @param {*} min_value - The min value to set.
     */
    set_min(min_value) {
        const numeric = normalize_number_value(min_value);
        if (!is_defined(numeric)) return;
        this.min = numeric;
        this.dom.attributes.min = String(numeric);
        if (this.dom.el) {
            this.dom.el.min = numeric;
        }
    }

    /**
     * Set the meter max value.
     * @param {*} max_value - The max value to set.
     */
    set_max(max_value) {
        const numeric = normalize_number_value(max_value);
        if (!is_defined(numeric)) return;
        this.max = numeric;
        this.dom.attributes.max = String(numeric);
        if (this.dom.el) {
            this.dom.el.max = numeric;
        }
    }

    /**
     * Set the meter low value.
     * @param {*} low_value - The low value to set.
     */
    set_low(low_value) {
        const numeric = normalize_number_value(low_value);
        if (!is_defined(numeric)) return;
        this.low = numeric;
        this.dom.attributes.low = String(numeric);
        if (this.dom.el) {
            this.dom.el.low = numeric;
        }
    }

    /**
     * Set the meter high value.
     * @param {*} high_value - The high value to set.
     */
    set_high(high_value) {
        const numeric = normalize_number_value(high_value);
        if (!is_defined(numeric)) return;
        this.high = numeric;
        this.dom.attributes.high = String(numeric);
        if (this.dom.el) {
            this.dom.el.high = numeric;
        }
    }

    /**
     * Set the meter optimum value.
     * @param {*} optimum_value - The optimum value to set.
     */
    set_optimum(optimum_value) {
        const numeric = normalize_number_value(optimum_value);
        if (!is_defined(numeric)) return;
        this.optimum = numeric;
        this.dom.attributes.optimum = String(numeric);
        if (this.dom.el) {
            this.dom.el.optimum = numeric;
        }
    }
}

module.exports = Meter;
