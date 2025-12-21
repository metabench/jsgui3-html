const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const normalize_number_value = value => {
    if (!is_defined(value)) return '';
    if (value === '') return '';
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    return value;
};

const set_attr_if_defined = (dom_attributes, name, value) => {
    if (is_defined(value)) {
        dom_attributes[name] = String(value);
    }
};

class Range_Input extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'range_input';
        super(spec);
        this.add_class('range-input');
        this.dom.tagName = 'input';
        this.dom.attributes.type = 'range';

        set_attr_if_defined(this.dom.attributes, 'min', spec.min);
        set_attr_if_defined(this.dom.attributes, 'max', spec.max);
        set_attr_if_defined(this.dom.attributes, 'step', spec.step);

        if (is_defined(spec.value)) {
            this.set_value(spec.value);
        }

        if (is_defined(spec.min)) {
            this.dom.attributes['aria-valuemin'] = String(spec.min);
        }
        if (is_defined(spec.max)) {
            this.dom.attributes['aria-valuemax'] = String(spec.max);
        }
    }

    /**
     * Set the range input value.
     * @param {*} value - The value to set.
     */
    set_value(value) {
        const normalized = normalize_number_value(value);
        const value_str = normalized === '' ? '' : String(normalized);
        this.value = normalized;
        this.dom.attributes.value = value_str;
        this.dom.attributes['aria-valuenow'] = value_str;
        if (this.dom.el) {
            this.dom.el.value = value_str;
            this.dom.el.setAttribute('aria-valuenow', value_str);
        }
    }

    /**
     * Get the range input value.
     * @returns {*}
     */
    get_value() {
        return this.value;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            const sync_value = () => {
                this.set_value(this.dom.el.value);
            };

            this.add_dom_event_listener('input', sync_value);
            this.add_dom_event_listener('change', sync_value);
        }
    }
}

module.exports = Range_Input;
