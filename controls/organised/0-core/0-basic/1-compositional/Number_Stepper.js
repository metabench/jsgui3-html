const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const Number_Input = require('../0-native-compositional/number_input');

const normalize_number_value = value => {
    if (!is_defined(value)) return '';
    if (value === '') return '';
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    return '';
};

class Number_Stepper extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'number_stepper';
        super(spec);
        this.add_class('number-stepper');
        this.dom.tagName = 'div';

        this.min = is_defined(spec.min) ? Number(spec.min) : undefined;
        this.max = is_defined(spec.max) ? Number(spec.max) : undefined;
        this.step = is_defined(spec.step) ? Number(spec.step) : 1;
        this.value = normalize_number_value(spec.value);

        if (!spec.el) {
            this.compose_number_stepper();
        }
    }

    compose_number_stepper() {
        const { context } = this;
        const input_ctrl = new Number_Input({
            context,
            value: this.value,
            min: this.min,
            max: this.max,
            step: this.step
        });
        input_ctrl.add_class('number-stepper-input');

        const increment_ctrl = new Control({ context, tag_name: 'button' });
        increment_ctrl.dom.attributes.type = 'button';
        increment_ctrl.add_class('number-stepper-button');
        increment_ctrl.add_class('number-stepper-increment');
        increment_ctrl.add('+');

        const decrement_ctrl = new Control({ context, tag_name: 'button' });
        decrement_ctrl.dom.attributes.type = 'button';
        decrement_ctrl.add_class('number-stepper-button');
        decrement_ctrl.add_class('number-stepper-decrement');
        decrement_ctrl.add('-');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.input = input_ctrl;
        this._ctrl_fields.increment = increment_ctrl;
        this._ctrl_fields.decrement = decrement_ctrl;

        this.add(decrement_ctrl);
        this.add(input_ctrl);
        this.add(increment_ctrl);
    }

    clamp_value(value) {
        const numeric = normalize_number_value(value);
        if (numeric === '') return '';
        let next_value = numeric;
        if (is_defined(this.min)) next_value = Math.max(next_value, this.min);
        if (is_defined(this.max)) next_value = Math.min(next_value, this.max);
        return next_value;
    }

    /**
     * Set the stepper value.
     * @param {*} value - The value to set.
     */
    set_value(value) {
        const clamped = this.clamp_value(value);
        this.value = clamped;
        const input_ctrl = this._ctrl_fields && this._ctrl_fields.input;
        if (input_ctrl) {
            input_ctrl.set_value(clamped);
        }
    }

    /**
     * Get the stepper value.
     * @returns {*}
     */
    get_value() {
        return this.value;
    }

    /**
     * Step the value up.
     */
    step_up() {
        const current = normalize_number_value(this.value);
        const next_value = current === '' ? this.step : Number(current) + this.step;
        this.set_value(next_value);
        this.raise('change', { name: 'value', value: this.value });
    }

    /**
     * Step the value down.
     */
    step_down() {
        const current = normalize_number_value(this.value);
        const next_value = current === '' ? -this.step : Number(current) - this.step;
        this.set_value(next_value);
        this.raise('change', { name: 'value', value: this.value });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const input_ctrl = this._ctrl_fields && this._ctrl_fields.input;
            const increment_ctrl = this._ctrl_fields && this._ctrl_fields.increment;
            const decrement_ctrl = this._ctrl_fields && this._ctrl_fields.decrement;

            if (input_ctrl && input_ctrl.dom.el) {
                input_ctrl.add_dom_event_listener('input', () => {
                    this.set_value(input_ctrl.dom.el.value);
                    this.raise('change', { name: 'value', value: this.value });
                });
            }

            if (increment_ctrl) {
                increment_ctrl.on('click', () => this.step_up());
            }

            if (decrement_ctrl) {
                decrement_ctrl.on('click', () => this.step_down());
            }
        }
    }
}

Number_Stepper.css = `
.number-stepper {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.number-stepper-button {
    width: 28px;
    height: 28px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;
}
.number-stepper-input {
    width: 80px;
}
`;

module.exports = Number_Stepper;
