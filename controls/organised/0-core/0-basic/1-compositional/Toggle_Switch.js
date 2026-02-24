const jsgui = require('../../../../../html-core/html-core');
const { themeable } = require('../../../../../control_mixins/themeable');
const { apply_token_map } = require('../../../../../themes/token_maps');

const { Control } = jsgui;
const { is_defined } = jsgui;

class Toggle_Switch extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'toggle_switch';
        super(spec);
        this.add_class('toggle-switch');
        this.add_class('jsgui-toggle');

        // Apply theming
        const params = themeable(this, 'toggle_switch', spec, {
            defaults: { size: 'medium' }
        });
        apply_token_map(this, 'toggle_switch', params);

        this.on_label = is_defined(spec.on_label) ? String(spec.on_label) : 'On';
        this.off_label = is_defined(spec.off_label) ? String(spec.off_label) : 'Off';
        this.checked = !!spec.checked;

        if (!spec.el) {
            this.compose(params);
        }
    }

    compose(params) {
        const { context } = this;

        // Hidden native <input type="checkbox"> for accessibility
        const input_ctrl = new Control({ context });
        input_ctrl.dom.tagName = 'input';
        input_ctrl.dom.attributes.type = 'checkbox';
        input_ctrl.dom.attributes.id = input_ctrl._id();
        input_ctrl.dom.attributes.role = 'switch';
        input_ctrl.dom.attributes['aria-checked'] = this.checked ? 'true' : 'false';
        if (this.checked) {
            input_ctrl.dom.attributes.checked = 'checked';
        }
        input_ctrl.add_class('jsgui-toggle-input');

        // Track element (CSS: .jsgui-toggle-track)
        const track_ctrl = new Control({ context });
        track_ctrl.dom.tagName = 'span';
        track_ctrl.add_class('jsgui-toggle-track');

        // Thumb element inside track (CSS: .jsgui-toggle-thumb)
        const thumb_ctrl = new Control({ context });
        thumb_ctrl.dom.tagName = 'span';
        thumb_ctrl.add_class('jsgui-toggle-thumb');
        track_ctrl.add(thumb_ctrl);

        // Label
        const label_ctrl = new Control({ context });
        label_ctrl.dom.tagName = 'label';
        label_ctrl.dom.attributes.for = input_ctrl._id();
        label_ctrl.add_class('jsgui-toggle-label');
        label_ctrl.add(this.checked ? this.on_label : this.off_label);

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.input = input_ctrl;
        this._ctrl_fields.track = track_ctrl;
        this._ctrl_fields.thumb = thumb_ctrl;
        this._ctrl_fields.label = label_ctrl;

        this.add(input_ctrl);
        this.add(track_ctrl);
        this.add(label_ctrl);
    }

    /**
     * Set the toggle checked state.
     * @param {boolean} checked - The checked state.
     */
    set_checked(checked) {
        const next_checked = !!checked;
        this.checked = next_checked;

        const input_ctrl = this._ctrl_fields && this._ctrl_fields.input;
        const label_ctrl = this._ctrl_fields && this._ctrl_fields.label;
        if (input_ctrl) {
            input_ctrl.dom.attributes['aria-checked'] = next_checked ? 'true' : 'false';
            if (next_checked) {
                input_ctrl.dom.attributes.checked = 'checked';
            } else {
                input_ctrl.dom.attributes.checked = '';
            }
            if (input_ctrl.dom.el) {
                input_ctrl.dom.el.checked = next_checked;
                input_ctrl.dom.el.setAttribute('aria-checked', next_checked ? 'true' : 'false');
            }
        }

        if (label_ctrl) {
            const label_text = next_checked ? this.on_label : this.off_label;
            if (label_ctrl.dom && label_ctrl.dom.el) {
                label_ctrl.dom.el.textContent = label_text;
            } else {
                label_ctrl.clear();
                label_ctrl.add(label_text);
            }
        }
    }

    /**
     * Get the toggle checked state.
     * @returns {boolean}
     */
    get_checked() {
        return !!this.checked;
    }

    /**
     * Set the disabled state.
     * @param {boolean} disabled
     */
    set_disabled(disabled) {
        const input_ctrl = this._ctrl_fields && this._ctrl_fields.input;
        if (disabled) {
            this.add_class('disabled');
            if (input_ctrl) {
                input_ctrl.dom.attributes.disabled = 'disabled';
                if (input_ctrl.dom.el) input_ctrl.dom.el.disabled = true;
            }
        } else {
            this.remove_class('disabled');
            if (input_ctrl) {
                delete input_ctrl.dom.attributes.disabled;
                if (input_ctrl.dom.el) input_ctrl.dom.el.disabled = false;
            }
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const input_ctrl = this._ctrl_fields && this._ctrl_fields.input;
            if (!input_ctrl || !input_ctrl.dom || !input_ctrl.dom.el) return;

            input_ctrl.on('change', () => {
                this.set_checked(input_ctrl.dom.el.checked);
                this.raise('change', {
                    name: 'checked',
                    value: this.checked
                });
            });

            // Keyboard: Space/Enter to toggle
            this.add_dom_event_listener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const el = input_ctrl.dom.el;
                    if (el && !el.disabled) {
                        el.checked = !el.checked;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        }
    }
}

Toggle_Switch.css = `
.toggle-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
`;

module.exports = Toggle_Switch;
