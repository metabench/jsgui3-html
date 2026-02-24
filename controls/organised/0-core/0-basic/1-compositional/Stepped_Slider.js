const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const Range_Input = require('../0-native-compositional/range_input');

class Stepped_Slider extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'stepped_slider';
        super(spec);
        this.add_class('stepped-slider');
        this.dom.tagName = 'div';

        this.min = is_defined(spec.min) ? Number(spec.min) : 0;
        this.max = is_defined(spec.max) ? Number(spec.max) : 100;
        this.step = is_defined(spec.step) ? Number(spec.step) : 1;
        this.value = is_defined(spec.value) ? Number(spec.value) : this.min;
        this.ticks = Array.isArray(spec.ticks) ? spec.ticks.slice() : [];
        this.show_value = !!spec.show_value;

        if (!spec.el) {
            this.compose_stepped_slider();
        }
    }

    compose_stepped_slider() {
        const { context } = this;

        const range_ctrl = new Range_Input({
            context,
            min: this.min,
            max: this.max,
            step: this.step,
            value: this.value
        });
        range_ctrl.add_class('stepped-slider-input');

        const value_ctrl = new Control({ context, tag_name: 'span' });
        value_ctrl.add_class('stepped-slider-value');
        if (this.show_value) {
            value_ctrl.add(String(this.value));
        }

        const ticks_ctrl = new Control({ context, tag_name: 'div' });
        ticks_ctrl.add_class('stepped-slider-ticks');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.range = range_ctrl;
        this._ctrl_fields.value_ctrl = value_ctrl;
        this._ctrl_fields.ticks = ticks_ctrl;

        this.add(range_ctrl);
        this.add(value_ctrl);
        this.add(ticks_ctrl);

        this.render_ticks();
    }

    render_ticks() {
        const ticks_ctrl = this._ctrl_fields && this._ctrl_fields.ticks;
        if (!ticks_ctrl) return;
        ticks_ctrl.clear();

        if (!this.ticks.length) return;

        this.ticks.forEach(tick => {
            const tick_ctrl = new Control({ context: this.context, tag_name: 'span' });
            tick_ctrl.add_class('stepped-slider-tick');
            tick_ctrl.add(String(tick));
            ticks_ctrl.add(tick_ctrl);
        });
    }

    update_value_label() {
        const value_ctrl = this._ctrl_fields && this._ctrl_fields.value_ctrl;
        if (!value_ctrl) return;
        if (!this.show_value) return;

        if (value_ctrl.dom && value_ctrl.dom.el) {
            value_ctrl.dom.el.textContent = String(this.value);
        } else {
            value_ctrl.clear();
            value_ctrl.add(String(this.value));
        }
    }

    /**
     * Set slider value.
     * @param {*} value - The value to set.
     */
    set_value(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return;
        const clamped = Math.min(Math.max(numeric, this.min), this.max);
        this.value = clamped;
        const range_ctrl = this._ctrl_fields && this._ctrl_fields.range;
        if (range_ctrl) {
            range_ctrl.set_value(clamped);
        }
        this.update_value_label();
    }

    /**
     * Get slider value.
     * @returns {number}
     */
    get_value() {
        return this.value;
    }

    /**
     * Set ticks for the slider.
     * @param {Array} ticks - Tick labels to display.
     */
    set_ticks(ticks) {
        this.ticks = Array.isArray(ticks) ? ticks.slice() : [];
        this.render_ticks();
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const range_ctrl = this._ctrl_fields && this._ctrl_fields.range;
            if (!range_ctrl || !range_ctrl.dom.el) return;

            range_ctrl.add_dom_event_listener('input', () => {
                this.set_value(range_ctrl.dom.el.value);
                this.raise('change', { name: 'value', value: this.value });
            });
        }
    }
}

Stepped_Slider.css = `
.stepped-slider {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.stepped-slider-input {
    width: 100%;
}
.stepped-slider-value {
    font-size: 0.85em;
    color: #444;
}
.stepped-slider-ticks {
    display: flex;
    justify-content: space-between;
    font-size: 0.75em;
    color: #666;
}
`;

module.exports = Stepped_Slider;
