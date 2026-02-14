'use strict';

const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const Color_Value = require('../../../../../html-core/Color_Value');

/**
 * Hex_Input — Text input for hex color codes.
 *
 * Color mode interface:
 *   - set color(cv) — silent update
 *   - get color()   — current Color_Value
 *   - 'color-change' event — on valid user input
 *
 * @param {Object} spec
 * @param {string} [spec.value='#3b82f6']
 */
class Hex_Input extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'hex_input';
        super(spec);
        this.add_class('hex-input-ctrl');

        this._color = spec.color instanceof Color_Value ? spec.color : new Color_Value(spec.value || '#3b82f6');

        if (!spec.el) this.compose();
    }

    get color() { return this._color; }

    set color(cv) {
        if (cv instanceof Color_Value) this._color = cv;
        else this._color.set(cv);
        this._sync_display();
    }

    compose() {
        const { context } = this;

        this._row = new Control({ context, tag_name: 'div' });
        this._row.add_class('hi-row');

        const lbl = new Control({ context, tag_name: 'span' });
        lbl.add_class('hi-label');
        lbl.add('#');
        this._row.add(lbl);

        this._input = new Control({ context, tag_name: 'input' });
        this._input.add_class('hi-input');
        this._input.dom.attributes.type = 'text';
        this._input.dom.attributes.maxlength = '7';
        this._input.dom.attributes.value = this._color.hex;
        this._input.dom.attributes.spellcheck = 'false';
        this._input.dom.attributes.autocomplete = 'off';
        this._row.add(this._input);

        this.add(this._row);
    }

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        if (this._input && this._input.dom.el) {
            const el = this._input.dom.el;

            // Validate and apply on blur or Enter
            const apply = () => {
                let val = el.value.trim();
                if (!val.startsWith('#')) val = '#' + val;
                if (/^#[0-9a-fA-F]{6}$/.test(val) || /^#[0-9a-fA-F]{3}$/.test(val)) {
                    this._color.set(val);
                    el.classList.remove('hi-error');
                    this.raise('color-change', { color: this._color, hex: this._color.hex });
                } else {
                    el.classList.add('hi-error');
                }
            };

            el.addEventListener('change', apply);
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    apply();
                }
            });
        }
    }

    _sync_display() {
        if (this._input && this._input.dom.el) {
            this._input.dom.el.value = this._color.hex;
            this._input.dom.el.classList.remove('hi-error');
        }
    }
}

Hex_Input.css = `
.hex-input-ctrl { display: inline-flex; }
.hi-row { display: flex; align-items: center; gap: 2px; }
.hi-label { font-weight: 600; font-size: 14px; color: #666; }
.hi-input {
    width: 80px; padding: 4px 6px;
    font-family: monospace; font-size: 13px;
    border: 1px solid #ccc; border-radius: 3px;
    outline: none; transition: border-color 0.15s;
}
.hi-input:focus { border-color: #3b82f6; }
.hi-error { border-color: #ef4444 !important; }
`;

module.exports = Hex_Input;
