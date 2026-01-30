const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const Text_Input = require('../0-core/0-basic/0-native-compositional/Text_Input');
const Color_Palette = require('../0-core/0-basic/1-compositional/color-palette');

class Color_Picker extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'color_picker';
        super(spec);
        this.add_class('color-picker');

        this.value = spec.value || '#000000';
        this.mode = spec.mode || 'full';
        this.show_alpha = !!spec.show_alpha;
        this.show_inputs = spec.show_inputs !== false;
        this.presets = spec.presets || null;
        this.recent_count = spec.recent_count || 8;
        this.format = spec.format || 'hex';

        this.recents = [];

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        if (this.show_inputs) {
            const input = new Text_Input({ context });
            input.add_class('color-picker-input');
            this.add(input);
            this._ctrl_fields.input = input;
        }

        const palette = new Color_Palette({ context, palette: this.presets || undefined });
        palette.add_class('color-picker-palette');
        this.add(palette);
        this._ctrl_fields.palette = palette;

        this._sync_ui();
    }

    _sync_ui() {
        const input = this._ctrl_fields && this._ctrl_fields.input;
        if (input && input.dom && input.dom.el) {
            input.dom.el.value = this.value || '';
        } else if (input && input.dom && input.dom.attributes) {
            input.dom.attributes.value = this.value || '';
        }
    }

    set_value(color) {
        this.value = color || '';
        this._sync_ui();
        this.raise('change', { value: this.value, format: this.format });
    }

    get_value() {
        return this.value || '';
    }

    add_recent(color) {
        if (!color) return;
        this.recents = [color].concat(this.recents.filter(c => c !== color)).slice(0, this.recent_count);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const input = this._ctrl_fields && this._ctrl_fields.input;
            const palette = this._ctrl_fields && this._ctrl_fields.palette;

            if (input && input.dom && input.dom.el) {
                input.dom.el.addEventListener('input', () => {
                    this.value = input.dom.el.value;
                    this.raise('input', { value: this.value });
                    this.raise('change', { value: this.value, format: this.format });
                });
            }

            if (palette) {
                palette.on('choose-color', e => {
                    if (e && e.value) {
                        this.set_value(e.value);
                        this.add_recent(e.value);
                    }
                });
            }
        }
    }
}

module.exports = Color_Picker;
