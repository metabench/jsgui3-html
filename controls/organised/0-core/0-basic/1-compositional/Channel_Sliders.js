'use strict';

const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const Color_Value = require('../../../../../html-core/Color_Value');

/**
 * Channel_Sliders — HSL/RGB channel sliders with numeric readouts.
 *
 * Color mode interface:
 *   - set color(cv) — silent update
 *   - get color()   — current Color_Value
 *   - 'color-change' event — on user drag/input
 *
 * @param {Object} spec
 * @param {'hsl'|'rgb'} [spec.mode='hsl'] — which channel set to show
 * @param {boolean}     [spec.show_alpha=false]
 */
class Channel_Sliders extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'channel_sliders';
        super(spec);
        this.add_class('channel-sliders');

        this._color = spec.color instanceof Color_Value ? spec.color : new Color_Value(spec.value || '#3b82f6');
        this._mode = spec.mode || 'hsl';
        this._show_alpha = !!spec.show_alpha;

        if (!spec.el) this.compose();
    }

    get color() { return this._color; }

    set color(cv) {
        if (cv instanceof Color_Value) this._color = cv;
        else this._color.set(cv);
        this._sync_from_model();
    }

    compose() {
        const { context } = this;

        this._sliders = {};

        const make_slider = (label, key, min, max, value) => {
            const row = new Control({ context, tag_name: 'div' });
            row.add_class('cs-row');

            const lbl = new Control({ context, tag_name: 'span' });
            lbl.add_class('cs-label');
            lbl.add(label);
            row.add(lbl);

            const input = new Control({ context, tag_name: 'input' });
            input.add_class('cs-slider');
            input.add_class(`cs-slider-${key}`);
            input.dom.attributes.type = 'range';
            input.dom.attributes.min = String(min);
            input.dom.attributes.max = String(max);
            input.dom.attributes.value = String(value);
            row.add(input);

            const val = new Control({ context, tag_name: 'span' });
            val.add_class('cs-value');
            val.add(String(value));
            row.add(val);

            this.add(row);
            this._sliders[key] = { input, val_label: val };
        };

        if (this._mode === 'hsl') {
            make_slider('H', 'h', 0, 360, this._color.h);
            make_slider('S', 's', 0, 100, this._color.s);
            make_slider('L', 'l', 0, 100, this._color.l);
        } else {
            const { r, g, b } = this._color.rgb;
            make_slider('R', 'r', 0, 255, r);
            make_slider('G', 'g', 0, 255, g);
            make_slider('B', 'b', 0, 255, b);
        }

        if (this._show_alpha) {
            make_slider('A', 'a', 0, 100, Math.round(this._color.alpha * 100));
        }
    }

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        for (const [key, slider] of Object.entries(this._sliders)) {
            if (slider.input.dom.el) {
                slider.input.dom.el.addEventListener('input', () => {
                    const v = +slider.input.dom.el.value;
                    slider.val_label.dom.el.textContent = String(v);

                    // Update color model from slider values
                    if (this._mode === 'hsl') {
                        if (key === 'a') {
                            this._color._a = v / 100;
                        } else {
                            this._color[`_${key}`] = v;
                        }
                    } else {
                        // RGB mode
                        const r = +this._sliders.r.input.dom.el.value;
                        const g = +this._sliders.g.input.dom.el.value;
                        const b = +this._sliders.b.input.dom.el.value;
                        const [h, s, l] = Color_Value.rgb_to_hsl(r, g, b);
                        this._color._h = h;
                        this._color._s = s;
                        this._color._l = l;
                        if (key === 'a') this._color._a = v / 100;
                    }

                    this.raise('color-change', { color: this._color });
                });
            }
        }
    }

    /** Sync slider DOM to current Color_Value (called on silent set color) */
    _sync_from_model() {
        if (this._mode === 'hsl') {
            this._set_slider('h', this._color.h);
            this._set_slider('s', this._color.s);
            this._set_slider('l', this._color.l);
        } else {
            const { r, g, b } = this._color.rgb;
            this._set_slider('r', r);
            this._set_slider('g', g);
            this._set_slider('b', b);
        }
        if (this._show_alpha) {
            this._set_slider('a', Math.round(this._color.alpha * 100));
        }
    }

    _set_slider(key, value) {
        const s = this._sliders[key];
        if (s && s.input.dom.el) {
            s.input.dom.el.value = value;
            s.val_label.dom.el.textContent = String(value);
        }
    }
}

Channel_Sliders.css = `
.channel-sliders { display: flex; flex-direction: column; gap: 4px; padding: 4px; }
.cs-row { display: flex; align-items: center; gap: 6px; }
.cs-label { width: 16px; font-weight: 600; font-size: 12px; text-align: center; }
.cs-slider { flex: 1; cursor: pointer; }
.cs-value { width: 32px; text-align: right; font-size: 12px; font-variant-numeric: tabular-nums; }
`;

module.exports = Channel_Sliders;
