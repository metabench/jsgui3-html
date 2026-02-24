'use strict';

const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const Color_Value = require('../../../../../html-core/Color_Value');

/**
 * Gradient_Area — 2D Saturation-Value gradient picker (Photoshop-style).
 *
 * Uses HSV color model. Horizontal = Saturation (0→100), Vertical = Value (100→0).
 * Background gradient is tinted by the current Hue.
 *
 * Color mode interface:
 *   - set color(cv) — silent update
 *   - get color()   — current Color_Value
 *   - 'color-change' event — on user drag
 *
 * @param {Object} spec
 * @param {number} [spec.canvas_size=200] — canvas width/height in px
 */
class Gradient_Area extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'gradient_area';
        const canvas_size = spec.canvas_size || 200;
        super(spec);
        this.add_class('gradient-area');

        this._color = spec.color instanceof Color_Value ? spec.color : new Color_Value(spec.value || '#3b82f6');
        this._size = canvas_size;

        // Bridge: when .size is set via Control base prop, update canvas
        this.on('resize', (e) => {
            if (e && e.value) {
                const [w, h] = e.value;
                this._resize(Math.min(w, h));
            }
        });

        if (!spec.el) this.compose();
    }

    get color() { return this._color; }

    set color(cv) {
        if (cv instanceof Color_Value) this._color = cv;
        else this._color.set(cv);
        this._redraw();
        this._position_dot();
    }

    compose() {
        const { context } = this;
        const size = this._size;

        this._wrap = new Control({ context, tag_name: 'div' });
        this._wrap.add_class('ga-wrap');
        this._wrap.dom.attributes.style = `width:${size}px;height:${size}px`;

        this._canvas = new Control({ context, tag_name: 'canvas' });
        this._canvas.add_class('ga-canvas');
        this._canvas.dom.attributes.width = String(size);
        this._canvas.dom.attributes.height = String(size);
        this._wrap.add(this._canvas);

        this._dot = new Control({ context, tag_name: 'div' });
        this._dot.add_class('ga-dot');
        this._wrap.add(this._dot);

        this.add(this._wrap);
    }

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        this._redraw();
        this._position_dot();

        if (this._canvas && this._canvas.dom.el) {
            this._canvas.dom.el.addEventListener('mousedown', (e) => {
                this._handle_pick(e);
                const move = (me) => this._handle_pick(me);
                const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                };
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            });
        }
    }

    _redraw() {
        const el = this._canvas ? this._canvas.dom.el : null;
        if (!el || !el.getContext) return;
        const ctx = el.getContext('2d');
        const w = this._size, h = this._size;
        const hue = this._color.hsv.h;

        ctx.clearRect(0, 0, w, h);

        // Draw using HSV: x = saturation, y = value (inverted)
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                const s = Math.round((x / w) * 100);
                const v = Math.round((1 - y / h) * 100);
                const [r, g, b] = Color_Value.hsv_to_rgb(hue, s, v);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    _position_dot() {
        if (!this._dot || !this._dot.dom.el) return;
        const hsv = this._color.hsv;
        const x = (hsv.s / 100) * this._size - 7;
        const y = (1 - hsv.v / 100) * this._size - 7;
        this._dot.dom.el.style.left = x + 'px';
        this._dot.dom.el.style.top = y + 'px';
    }

    _handle_pick(e) {
        const el = this._canvas.dom.el;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, Math.min(this._size, e.clientX - rect.left));
        const y = Math.max(0, Math.min(this._size, e.clientY - rect.top));
        const s = Math.round((x / this._size) * 100);
        const v = Math.round((1 - y / this._size) * 100);
        const hue = this._color.hsv.h;

        this._color.set_hsv(hue, s, v);
        this._position_dot();
        this.raise('color-change', { color: this._color });
    }

    /**
     * Resize canvas and redraw. Called when .size property changes.
     * @param {number} new_size — new square dimension in px
     */
    _resize(new_size) {
        if (new_size === this._size || new_size <= 0) return;
        this._size = new_size;

        // Update wrapper
        if (this._wrap && this._wrap.dom.el) {
            this._wrap.dom.el.style.width = new_size + 'px';
            this._wrap.dom.el.style.height = new_size + 'px';
        }

        // Update canvas
        if (this._canvas && this._canvas.dom.el) {
            this._canvas.dom.el.width = new_size;
            this._canvas.dom.el.height = new_size;
        }

        this._redraw();
        this._position_dot();
    }
}

Gradient_Area.css = `
.ga-wrap { position: relative; cursor: crosshair; }
.ga-canvas { display: block; border-radius: 4px; }
.ga-dot {
    position: absolute; width: 14px; height: 14px;
    border-radius: 50%; border: 2px solid #fff;
    box-shadow: 0 0 2px rgba(0,0,0,0.5);
    pointer-events: none;
}
`;

module.exports = Gradient_Area;
