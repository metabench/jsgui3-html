const jsgui = require('../../../../../html-core/html-core');
const {Control} = jsgui;

const clamp_ratio = value => {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
};

class Scrollbar extends Control {
    constructor(spec = {}) {
        super(spec);
        this.__type_name = 'scrollbar';
        this.add_class('scrollbar');

        this.direction = spec.direction || this.__direction || 'vertical';
        this.min = 0;
        this.max = 1000;
        this.step = spec.step || 1;
        this.value = 0;
        this.ratio = 0;
        this.page_ratio = 0;

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const input_ctrl = new Control({
            context: this.context
        });
        input_ctrl.dom.tagName = 'input';
        input_ctrl.dom.attributes.type = 'range';
        input_ctrl.dom.attributes.min = this.min;
        input_ctrl.dom.attributes.max = this.max;
        input_ctrl.dom.attributes.value = this.value;
        input_ctrl.dom.attributes.step = this.step;
        input_ctrl.add_class('scrollbar-input');
        input_ctrl.dom.attributes.role = 'scrollbar';
        input_ctrl.dom.attributes['aria-orientation'] = this.direction;
        this.add(input_ctrl);

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.input = input_ctrl;
    }

    /**
     * Set the scrollbar ratio (0-1).
     * @param {number} ratio - Ratio to set.
     */
    set_ratio(ratio) {
        const next_ratio = clamp_ratio(Number(ratio) || 0);
        this.ratio = next_ratio;
        const next_value = this.min + (this.max - this.min) * next_ratio;
        this.set_value(next_value, {from_ratio: true});
    }

    /**
     * Set the scrollbar value.
     * @param {number} value - Value to set.
     * @param {Object} [options] - Optional settings.
     */
    set_value(value, options = {}) {
        const next_value = Number.isNaN(Number(value)) ? 0 : Number(value);
        const clamped = Math.min(this.max, Math.max(this.min, next_value));
        this.value = clamped;
        this.ratio = (this.max === this.min) ? 0 : (clamped - this.min) / (this.max - this.min);
        const input_ctrl = this._ctrl_fields && this._ctrl_fields.input;
        if (input_ctrl) {
            input_ctrl.dom.attributes.value = clamped;
            input_ctrl.dom.attributes['aria-valuenow'] = String(clamped);
            if (input_ctrl.dom.el) {
                input_ctrl.dom.el.value = clamped;
            }
        }
        if (!options.from_ratio) {
            this.raise('scroll', {
                value: this.value,
                ratio: this.ratio
            });
        }
    }

    /**
     * Set page ratio for the scrollbar.
     * @param {number} page_ratio - Ratio of viewport to content.
     */
    set_page_ratio(page_ratio) {
        this.page_ratio = clamp_ratio(Number(page_ratio) || 0);
    }

    /**
     * Sync scrollbar from scroll state.
     * @param {number} offset - Scroll offset.
     * @param {number} total - Total scroll size.
     * @param {number} viewport - Viewport size.
     */
    sync_from_scroll(offset, total, viewport) {
        if (!total || !viewport) {
            this.set_ratio(0);
            this.set_page_ratio(1);
            return;
        }
        const scroll_range = Math.max(1, total - viewport);
        const ratio = offset / scroll_range;
        this.set_ratio(ratio);
        this.set_page_ratio(viewport / total);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const input_ctrl = this._ctrl_fields && this._ctrl_fields.input;
            if (input_ctrl && input_ctrl.dom && input_ctrl.dom.el) {
                input_ctrl.dom.el.addEventListener('input', () => {
                    const next_value = Number(input_ctrl.dom.el.value);
                    this.set_value(next_value);
                });
            }
        }
    }
}

class Horizontal_Scrollbar extends Scrollbar {
    constructor(spec = {}) {
        super(Object.assign({}, spec, {direction: 'horizontal'}));
        this.__direction = 'horizontal';
        this.add_class('horizontal');
    }
}

class Vertical_Scrollbar extends Scrollbar {
    constructor(spec = {}) {
        super(Object.assign({}, spec, {direction: 'vertical'}));
        this.__direction = 'vertical';
        this.add_class('vertical');
    }
}

Scrollbar.H = Scrollbar.Horizontal = Horizontal_Scrollbar;
Scrollbar.V = Scrollbar.Vertical = Vertical_Scrollbar;

Scrollbar.css = `
.scrollbar {
    display: flex;
    align-items: center;
}
.scrollbar.horizontal .scrollbar-input {
    width: 100%;
}
.scrollbar.vertical .scrollbar-input {
    width: 100%;
}
`;

module.exports = Scrollbar;
