'use strict';

const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const Color_Value = require('../../../../../html-core/Color_Value');

/**
 * HSL_Wheel — Hue ring with Saturation-Lightness area inside.
 *
 * The outer ring selects Hue (0-360°).
 * The inner square selects Saturation (x) and Lightness (y).
 *
 * Color mode interface:
 *   - set color(cv) — silent update
 *   - get color()   — current Color_Value
 *   - 'color-change' event — on user drag
 *
 * @param {Object} spec
 * @param {number} [spec.canvas_size=180] — total canvas size in px
 */
class HSL_Wheel extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'hsl_wheel';
        const canvas_size = spec.canvas_size || 180;
        super(spec);
        this.add_class('hsl-wheel');

        this._color = spec.color instanceof Color_Value ? spec.color : new Color_Value(spec.value || '#3b82f6');
        this._size = canvas_size;

        // Ring dimensions
        this._cx = this._size / 2;
        this._cy = this._size / 2;
        this._outer = this._cx - 2;
        this._inner = this._cx - 22;
        this._sl_offset = this._cx - this._inner * 0.7;
        this._sl_size = this._inner * 1.4;

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
        this._draw_sl_area();
        this._position_hue_dot();
        this._position_sl_dot();
    }

    compose() {
        const { context } = this;
        const size = this._size;

        this._wrap = new Control({ context, tag_name: 'div' });
        this._wrap.add_class('hw-wrap');
        this._wrap.dom.attributes.style = `width:${size}px;height:${size}px`;

        // Hue ring canvas
        this._ring_canvas = new Control({ context, tag_name: 'canvas' });
        this._ring_canvas.add_class('hw-ring');
        this._ring_canvas.dom.attributes.width = String(size);
        this._ring_canvas.dom.attributes.height = String(size);
        this._wrap.add(this._ring_canvas);

        // SL area canvas (centered inside ring)
        const sl_size = Math.round(this._sl_size);
        const sl_offset = Math.round(this._sl_offset);
        this._sl_canvas = new Control({ context, tag_name: 'canvas' });
        this._sl_canvas.add_class('hw-sl');
        this._sl_canvas.dom.attributes.width = String(sl_size);
        this._sl_canvas.dom.attributes.height = String(sl_size);
        this._sl_canvas.dom.attributes.style = `left:${sl_offset}px;top:${sl_offset}px;width:${sl_size}px;height:${sl_size}px`;
        this._wrap.add(this._sl_canvas);

        // Hue indicator dot
        this._hue_dot = new Control({ context, tag_name: 'div' });
        this._hue_dot.add_class('hw-hue-dot');
        this._wrap.add(this._hue_dot);

        // SL indicator dot
        this._sl_dot = new Control({ context, tag_name: 'div' });
        this._sl_dot.add_class('hw-sl-dot');
        this._wrap.add(this._sl_dot);

        this.add(this._wrap);
    }

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        this._draw_hue_ring();
        this._draw_sl_area();
        this._position_hue_dot();
        this._position_sl_dot();

        // Hue ring drag
        if (this._ring_canvas && this._ring_canvas.dom.el) {
            this._ring_canvas.dom.el.addEventListener('mousedown', (e) => {
                if (!this._is_in_ring(e)) return;
                this._handle_ring(e);
                const move = (me) => this._handle_ring(me);
                const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                };
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            });
        }

        // SL area drag
        if (this._sl_canvas && this._sl_canvas.dom.el) {
            this._sl_canvas.dom.el.addEventListener('mousedown', (e) => {
                this._handle_sl(e);
                const move = (me) => this._handle_sl(me);
                const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                };
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            });
        }
    }

    // ── Canvas drawing ──

    _draw_hue_ring() {
        const el = this._ring_canvas ? this._ring_canvas.dom.el : null;
        if (!el || !el.getContext) return;
        const ctx = el.getContext('2d');
        const { _cx: cx, _cy: cy, _outer: outer, _inner: inner } = this;

        ctx.clearRect(0, 0, this._size, this._size);
        for (let deg = 0; deg < 360; deg++) {
            const rad1 = (deg - 90) * Math.PI / 180;
            const rad2 = (deg + 1.5 - 90) * Math.PI / 180;
            ctx.beginPath();
            ctx.arc(cx, cy, outer, rad1, rad2);
            ctx.arc(cx, cy, inner, rad2, rad1, true);
            ctx.closePath();
            ctx.fillStyle = `hsl(${deg}, 100%, 50%)`;
            ctx.fill();
        }
    }

    _draw_sl_area() {
        const el = this._sl_canvas ? this._sl_canvas.dom.el : null;
        if (!el || !el.getContext) return;
        const ctx = el.getContext('2d');
        const w = el.width, h = el.height;
        ctx.clearRect(0, 0, w, h);

        const hue = this._color.h;
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                const s = x / w;
                const l = 1 - (y / h);
                const [r, g, b] = Color_Value.hsl_to_rgb(hue, s, l);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // ── Indicator dots ──

    _position_hue_dot() {
        if (!this._hue_dot || !this._hue_dot.dom.el) return;
        const rad = (this._color.h - 90) * Math.PI / 180;
        const ring_mid = (this._outer + this._inner) / 2;
        const x = this._cx + ring_mid * Math.cos(rad) - 6;
        const y = this._cy + ring_mid * Math.sin(rad) - 6;
        this._hue_dot.dom.el.style.left = x + 'px';
        this._hue_dot.dom.el.style.top = y + 'px';
    }

    _position_sl_dot() {
        if (!this._sl_dot || !this._sl_dot.dom.el) return;
        const x = this._sl_offset + (this._color.s / 100) * this._sl_size - 6;
        const y = this._sl_offset + (1 - this._color.l / 100) * this._sl_size - 6;
        this._sl_dot.dom.el.style.left = x + 'px';
        this._sl_dot.dom.el.style.top = y + 'px';
    }

    // ── Event handlers ──

    _is_in_ring(e) {
        const el = this._ring_canvas.dom.el;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - this._cx;
        const y = e.clientY - rect.top - this._cy;
        const dist = Math.sqrt(x * x + y * y);
        return dist >= this._inner - 5 && dist <= this._outer + 5;
    }

    _handle_ring(e) {
        const el = this._ring_canvas.dom.el;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - this._cx;
        const y = e.clientY - rect.top - this._cy;
        let deg = Math.atan2(y, x) * 180 / Math.PI + 90;
        if (deg < 0) deg += 360;
        this._color._h = Math.round(deg);
        this._draw_sl_area();
        this._position_hue_dot();
        this.raise('color-change', { color: this._color });
    }

    _handle_sl(e) {
        const el = this._sl_canvas.dom.el;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, Math.min(el.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(el.height, e.clientY - rect.top));
        this._color._s = Math.round((x / el.width) * 100);
        this._color._l = Math.round((1 - y / el.height) * 100);
        this._position_sl_dot();
        this.raise('color-change', { color: this._color });
    }

    /**
     * Resize canvas and recalculate all ring dimensions. Called when .size changes.
     * @param {number} new_size — new square dimension in px
     */
    _resize(new_size) {
        if (new_size === this._size || new_size <= 0) return;
        this._size = new_size;

        // Recalculate ring geometry
        this._cx = new_size / 2;
        this._cy = new_size / 2;
        this._outer = this._cx - 2;
        this._inner = this._cx - 22;
        this._sl_offset = this._cx - this._inner * 0.7;
        this._sl_size = this._inner * 1.4;

        // Update wrapper
        if (this._wrap && this._wrap.dom.el) {
            this._wrap.dom.el.style.width = new_size + 'px';
            this._wrap.dom.el.style.height = new_size + 'px';
        }

        // Update ring canvas
        if (this._ring_canvas && this._ring_canvas.dom.el) {
            this._ring_canvas.dom.el.width = new_size;
            this._ring_canvas.dom.el.height = new_size;
        }

        // Update SL canvas
        const sl_size = Math.round(this._sl_size);
        const sl_offset = Math.round(this._sl_offset);
        if (this._sl_canvas && this._sl_canvas.dom.el) {
            this._sl_canvas.dom.el.width = sl_size;
            this._sl_canvas.dom.el.height = sl_size;
            this._sl_canvas.dom.el.style.left = sl_offset + 'px';
            this._sl_canvas.dom.el.style.top = sl_offset + 'px';
            this._sl_canvas.dom.el.style.width = sl_size + 'px';
            this._sl_canvas.dom.el.style.height = sl_size + 'px';
        }

        this._draw_hue_ring();
        this._draw_sl_area();
        this._position_hue_dot();
        this._position_sl_dot();
    }
}

HSL_Wheel.css = `
.hw-wrap { position: relative; cursor: crosshair; }
.hw-ring { position: absolute; top: 0; left: 0; }
.hw-sl { position: absolute; cursor: crosshair; }
.hw-hue-dot, .hw-sl-dot {
    position: absolute; width: 12px; height: 12px;
    border-radius: 50%; border: 2px solid #fff;
    box-shadow: 0 0 2px rgba(0,0,0,0.5);
    pointer-events: none;
}
`;

module.exports = HSL_Wheel;
