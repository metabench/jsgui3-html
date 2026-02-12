const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

// ────────────────────────────────────────────
// Color conversion utilities
// ────────────────────────────────────────────

function hsl_to_rgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgb_to_hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        else if (max === g) h = ((b - r) / d + 2) * 60;
        else h = ((r - g) / d + 4) * 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function hex_to_rgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgb_to_hex(r, g, b) {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function parse_color(input) {
    if (!input || typeof input !== 'string') return { h: 0, s: 100, l: 50, a: 1 };
    input = input.trim().toLowerCase();

    // Hex
    if (input.startsWith('#')) {
        const [r, g, b] = hex_to_rgb(input);
        const [h, s, l] = rgb_to_hsl(r, g, b);
        return { h, s, l, a: 1 };
    }

    // rgb(r,g,b) or rgba(r,g,b,a)
    const rgb_match = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (rgb_match) {
        const [h, s, l] = rgb_to_hsl(+rgb_match[1], +rgb_match[2], +rgb_match[3]);
        return { h, s, l, a: rgb_match[4] !== undefined ? +rgb_match[4] : 1 };
    }

    // hsl(h,s%,l%) or hsla
    const hsl_match = input.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
    if (hsl_match) {
        return { h: +hsl_match[1], s: +hsl_match[2], l: +hsl_match[3], a: hsl_match[4] !== undefined ? +hsl_match[4] : 1 };
    }

    return { h: 0, s: 100, l: 50, a: 1 };
}

// ────────────────────────────────────────────

/**
 * Color_Picker — Advanced color selection control.
 *
 * Sub-components (all toggleable):
 *   - HSL Wheel       (show_wheel, default: true)
 *   - H/S/L Sliders   (show_sliders, default: true)
 *   - Palette Grid    (show_palette, default: true)
 *   - Hex Input       (show_hex_input, default: true)
 *   - RGB Inputs      (show_rgb_inputs, default: false)
 *   - HSL Inputs      (show_hsl_inputs, default: false)
 *   - Alpha Slider    (show_alpha, default: false)
 *   - Preview Swatch  (show_preview, default: true)
 *
 * @param {Object} spec
 * @param {string}  [spec.value='#3b82f6']
 * @param {boolean} [spec.show_wheel=true]
 * @param {boolean} [spec.show_sliders=true]
 * @param {boolean} [spec.show_palette=true]
 * @param {boolean} [spec.show_hex_input=true]
 * @param {boolean} [spec.show_rgb_inputs=false]
 * @param {boolean} [spec.show_hsl_inputs=false]
 * @param {boolean} [spec.show_alpha=false]
 * @param {boolean} [spec.show_preview=true]
 * @param {string}  [spec.layout='vertical']  'vertical'|'horizontal'|'compact'
 * @param {string}  [spec.output_format='hex'] 'hex'|'rgb'|'hsl'|'rgba'
 */
class Color_Picker extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'color_picker';

        // Capture all config before super() to avoid base-class consumption
        const initial_value = spec.value || '#3b82f6';
        const cfg = {
            show_wheel: spec.show_wheel !== false,
            show_sliders: spec.show_sliders !== false,
            show_palette: spec.show_palette !== false,
            show_hex_input: spec.show_hex_input !== false,
            show_rgb_inputs: !!spec.show_rgb_inputs,
            show_hsl_inputs: !!spec.show_hsl_inputs,
            show_alpha: !!spec.show_alpha,
            show_preview: spec.show_preview !== false,
            layout: spec.layout || 'vertical',
            output_format: spec.output_format || 'hex',
            palette_key: spec.palette_key || null,
            palette: spec.palette || null,
        };

        super(spec);
        this.add_class('color-picker');
        this.add_class(`cp-layout-${cfg.layout}`);

        this._cfg = cfg;

        // Internal HSL + alpha state
        const parsed = parse_color(initial_value);
        this._h = parsed.h;
        this._s = parsed.s;
        this._l = parsed.l;
        this._a = parsed.a;
        this._prev_hex = this._current_hex();

        if (!spec.el) {
            this.compose();
        }
    }

    // ── Public API ──

    get h() { return this._h; }
    get s() { return this._s; }
    get l() { return this._l; }
    get alpha() { return this._a; }

    get value() {
        return this._format_output();
    }

    get hex() { return this._current_hex(); }

    get rgb() {
        const [r, g, b] = hsl_to_rgb(this._h, this._s / 100, this._l / 100);
        return { r, g, b };
    }

    get hsl() {
        return { h: this._h, s: this._s, l: this._l };
    }

    set_value(color_str) {
        const parsed = parse_color(color_str);
        this._h = parsed.h;
        this._s = parsed.s;
        this._l = parsed.l;
        this._a = parsed.a;
        this._sync_ui();
    }

    set_hsl(h, s, l) {
        this._h = ((h % 360) + 360) % 360;
        this._s = Math.max(0, Math.min(100, s));
        this._l = Math.max(0, Math.min(100, l));
        this._sync_ui();
    }

    set_alpha(a) {
        this._a = Math.max(0, Math.min(1, a));
        this._sync_ui();
    }

    // ── Internal ──

    _current_hex() {
        const [r, g, b] = hsl_to_rgb(this._h, this._s / 100, this._l / 100);
        return rgb_to_hex(r, g, b);
    }

    _format_output() {
        const [r, g, b] = hsl_to_rgb(this._h, this._s / 100, this._l / 100);
        switch (this._cfg.output_format) {
            case 'rgb': return `rgb(${r}, ${g}, ${b})`;
            case 'rgba': return `rgba(${r}, ${g}, ${b}, ${this._a})`;
            case 'hsl': return `hsl(${this._h}, ${this._s}%, ${this._l}%)`;
            default: return rgb_to_hex(r, g, b);
        }
    }

    _sync_ui() {
        // Update hex input
        if (this._hex_input) {
            this._hex_input_val = this._current_hex();
        }
        // Update preview
        if (this._preview_new) {
            // Will update in activate/DOM
        }
    }

    compose() {
        const { context } = this;
        const cfg = this._cfg;

        // ── HSL Wheel ──
        if (cfg.show_wheel) {
            this._wheel_wrap = new Control({ context, tag_name: 'div' });
            this._wheel_wrap.add_class('cp-wheel-wrap');

            // Canvas for the hue ring — rendered via activate()
            this._wheel_canvas = new Control({ context, tag_name: 'canvas' });
            this._wheel_canvas.add_class('cp-wheel-canvas');
            this._wheel_canvas.dom.attributes.width = '180';
            this._wheel_canvas.dom.attributes.height = '180';
            this._wheel_wrap.add(this._wheel_canvas);

            // SL area inside the ring
            this._sl_canvas = new Control({ context, tag_name: 'canvas' });
            this._sl_canvas.add_class('cp-sl-canvas');
            this._sl_canvas.dom.attributes.width = '100';
            this._sl_canvas.dom.attributes.height = '100';
            this._wheel_wrap.add(this._sl_canvas);

            // Hue indicator dot
            this._hue_dot = new Control({ context, tag_name: 'div' });
            this._hue_dot.add_class('cp-hue-dot');
            this._wheel_wrap.add(this._hue_dot);

            // SL indicator dot
            this._sl_dot = new Control({ context, tag_name: 'div' });
            this._sl_dot.add_class('cp-sl-dot');
            this._wheel_wrap.add(this._sl_dot);

            this.add(this._wheel_wrap);
        }

        // ── Sliders ──
        if (cfg.show_sliders) {
            this._sliders_wrap = new Control({ context, tag_name: 'div' });
            this._sliders_wrap.add_class('cp-sliders');

            const make_slider = (label, cls, min, max, value) => {
                const row = new Control({ context, tag_name: 'div' });
                row.add_class('cp-slider-row');

                const lbl = new Control({ context, tag_name: 'span' });
                lbl.add_class('cp-slider-label');
                lbl.add(label);
                row.add(lbl);

                const input = new Control({ context, tag_name: 'input' });
                input.add_class('cp-slider');
                input.add_class(cls);
                input.dom.attributes.type = 'range';
                input.dom.attributes.min = String(min);
                input.dom.attributes.max = String(max);
                input.dom.attributes.value = String(value);
                row.add(input);

                const val = new Control({ context, tag_name: 'span' });
                val.add_class('cp-slider-value');
                val.add(String(value));
                row.add(val);

                this._sliders_wrap.add(row);
                return { input, val_label: val };
            };

            this._slider_h = make_slider('H', 'cp-slider-h', 0, 360, this._h);
            this._slider_s = make_slider('S', 'cp-slider-s', 0, 100, this._s);
            this._slider_l = make_slider('L', 'cp-slider-l', 0, 100, this._l);

            if (cfg.show_alpha) {
                this._slider_a = make_slider('A', 'cp-slider-a', 0, 100, Math.round(this._a * 100));
            }

            this.add(this._sliders_wrap);
        }

        // ── Hex Input ──
        if (cfg.show_hex_input) {
            this._hex_row = new Control({ context, tag_name: 'div' });
            this._hex_row.add_class('cp-hex-row');

            const lbl = new Control({ context, tag_name: 'span' });
            lbl.add_class('cp-hex-label');
            lbl.add('Hex');
            this._hex_row.add(lbl);

            this._hex_input = new Control({ context, tag_name: 'input' });
            this._hex_input.add_class('cp-hex-input');
            this._hex_input.dom.attributes.type = 'text';
            this._hex_input.dom.attributes.maxlength = '7';
            this._hex_input.dom.attributes.value = this._current_hex();
            this._hex_row.add(this._hex_input);

            this.add(this._hex_row);
        }

        // ── RGB Inputs ──
        if (cfg.show_rgb_inputs) {
            this._rgb_row = new Control({ context, tag_name: 'div' });
            this._rgb_row.add_class('cp-rgb-row');

            const [r, g, b] = hsl_to_rgb(this._h, this._s / 100, this._l / 100);
            const make_num = (label, cls, value) => {
                const wrap = new Control({ context, tag_name: 'div' });
                wrap.add_class('cp-num-field');
                const lbl = new Control({ context, tag_name: 'span' });
                lbl.add(label);
                wrap.add(lbl);
                const inp = new Control({ context, tag_name: 'input' });
                inp.add_class(cls);
                inp.dom.attributes.type = 'number';
                inp.dom.attributes.min = '0';
                inp.dom.attributes.max = '255';
                inp.dom.attributes.value = String(value);
                wrap.add(inp);
                this._rgb_row.add(wrap);
                return inp;
            };
            this._rgb_r = make_num('R', 'cp-rgb-r', r);
            this._rgb_g = make_num('G', 'cp-rgb-g', g);
            this._rgb_b = make_num('B', 'cp-rgb-b', b);
            this.add(this._rgb_row);
        }

        // ── HSL Inputs ──
        if (cfg.show_hsl_inputs) {
            this._hsl_row = new Control({ context, tag_name: 'div' });
            this._hsl_row.add_class('cp-hsl-row');

            const make_hsl = (label, cls, value, max) => {
                const wrap = new Control({ context, tag_name: 'div' });
                wrap.add_class('cp-num-field');
                const lbl = new Control({ context, tag_name: 'span' });
                lbl.add(label);
                wrap.add(lbl);
                const inp = new Control({ context, tag_name: 'input' });
                inp.add_class(cls);
                inp.dom.attributes.type = 'number';
                inp.dom.attributes.min = '0';
                inp.dom.attributes.max = String(max);
                inp.dom.attributes.value = String(value);
                wrap.add(inp);
                this._hsl_row.add(wrap);
                return inp;
            };
            this._hsl_h = make_hsl('H', 'cp-hsl-h', this._h, 360);
            this._hsl_s = make_hsl('S', 'cp-hsl-s', this._s, 100);
            this._hsl_l = make_hsl('L', 'cp-hsl-l', this._l, 100);
            this.add(this._hsl_row);
        }

        // ── Palette Grid ──
        if (cfg.show_palette) {
            this._palette_wrap = new Control({ context, tag_name: 'div' });
            this._palette_wrap.add_class('cp-palette');

            let colors;
            if (cfg.palette && Array.isArray(cfg.palette)) {
                colors = cfg.palette;
            } else {
                // Use built-in quick palette
                colors = [
                    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
                    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
                    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c',
                    '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff',
                ];
            }
            this._palette_colors = colors;

            colors.forEach(hex => {
                const cell = new Control({ context, tag_name: 'div' });
                cell.add_class('cp-palette-cell');
                cell.dom.attributes['data-color'] = hex;
                // inline background set via style attribute for SSR
                cell.dom.attributes.style = `background:${hex}`;
                this._palette_wrap.add(cell);
            });

            this.add(this._palette_wrap);
        }

        // ── Preview Swatch ──
        if (cfg.show_preview) {
            this._preview_wrap = new Control({ context, tag_name: 'div' });
            this._preview_wrap.add_class('cp-preview');

            this._preview_prev = new Control({ context, tag_name: 'div' });
            this._preview_prev.add_class('cp-preview-prev');
            this._preview_prev.dom.attributes.style = `background:${this._prev_hex}`;
            this._preview_prev.dom.attributes.title = 'Previous';
            this._preview_wrap.add(this._preview_prev);

            this._preview_new = new Control({ context, tag_name: 'div' });
            this._preview_new.add_class('cp-preview-new');
            this._preview_new.dom.attributes.style = `background:${this._current_hex()}`;
            this._preview_new.dom.attributes.title = 'Current';
            this._preview_wrap.add(this._preview_new);

            this.add(this._preview_wrap);
        }
    }

    // ── Reconnect DOM refs for hydration (when compose was skipped) ──
    _reconnect_from_dom() {
        const el = this.dom.el;
        if (!el) return;

        const q = (cls) => {
            const found = el.querySelector('.' + cls);
            return found ? { dom: { el: found } } : null;
        };

        // Wheel + SL canvases
        if (!this._wheel_canvas) this._wheel_canvas = q('cp-wheel-canvas');
        if (!this._sl_canvas) this._sl_canvas = q('cp-sl-canvas');
        if (!this._hue_dot) this._hue_dot = q('cp-hue-dot');
        if (!this._sl_dot) this._sl_dot = q('cp-sl-dot');

        // Sliders: each is { input: Control, val_label: Control }
        const reconnect_slider = (cls) => {
            const inp = el.querySelector('.' + cls);
            if (!inp) return null;
            const row = inp.closest('.cp-slider-row');
            const valSpan = row ? row.querySelector('.cp-slider-value') : null;
            return {
                input: { dom: { el: inp } },
                val_label: { dom: { el: valSpan } }
            };
        };
        if (!this._slider_h) this._slider_h = reconnect_slider('cp-slider-h');
        if (!this._slider_s) this._slider_s = reconnect_slider('cp-slider-s');
        if (!this._slider_l) this._slider_l = reconnect_slider('cp-slider-l');
        if (!this._slider_a) this._slider_a = reconnect_slider('cp-slider-a');

        // Hex input
        if (!this._hex_input) this._hex_input = q('cp-hex-input');

        // Palette
        if (!this._palette_wrap) this._palette_wrap = q('cp-palette');

        // Preview swatches
        if (!this._preview_new) this._preview_new = q('cp-preview-new');
        if (!this._preview_prev) this._preview_prev = q('cp-preview-prev');

        // RGB inputs
        if (!this._rgb_r) this._rgb_r = q('cp-rgb-r');
        if (!this._rgb_g) this._rgb_g = q('cp-rgb-g');
        if (!this._rgb_b) this._rgb_b = q('cp-rgb-b');

        // HSL inputs
        if (!this._hsl_h) this._hsl_h = q('cp-hsl-h');
        if (!this._hsl_s) this._hsl_s = q('cp-hsl-s');
        if (!this._hsl_l) this._hsl_l = q('cp-hsl-l');

        // Read initial state from DOM slider values
        if (this._slider_h && this._slider_h.input.dom.el) {
            this._h = +this._slider_h.input.dom.el.value;
        }
        if (this._slider_s && this._slider_s.input.dom.el) {
            this._s = +this._slider_s.input.dom.el.value;
        }
        if (this._slider_l && this._slider_l.input.dom.el) {
            this._l = +this._slider_l.input.dom.el.value;
        }
        if (this._slider_a && this._slider_a.input.dom.el) {
            this._a = +this._slider_a.input.dom.el.value / 100;
        }
    }

    // ── Activation (live DOM interactivity) ──
    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        // Reconnect DOM references if hydrating
        this._reconnect_from_dom();

        // Draw the hue wheel on canvas
        if (this._wheel_canvas && this._wheel_canvas.dom.el) {
            this._draw_hue_wheel();
            this._draw_sl_area();
            this._position_hue_dot();
            this._position_sl_dot();

            // Hue wheel click
            this._wheel_canvas.dom.el.addEventListener('mousedown', (e) => {
                this._handle_wheel_event(e);
                const move = (me) => this._handle_wheel_event(me);
                const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                };
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            });

            // SL area click
            if (this._sl_canvas && this._sl_canvas.dom.el) {
                this._sl_canvas.dom.el.addEventListener('mousedown', (e) => {
                    this._handle_sl_event(e);
                    const move = (me) => this._handle_sl_event(me);
                    const up = () => {
                        document.removeEventListener('mousemove', move);
                        document.removeEventListener('mouseup', up);
                    };
                    document.addEventListener('mousemove', move);
                    document.addEventListener('mouseup', up);
                });
            }
        }

        // Slider input events
        if (this._slider_h) {
            this._slider_h.input.dom.el.addEventListener('input', () => {
                this._h = +this._slider_h.input.dom.el.value;
                this._slider_h.val_label.dom.el.textContent = String(this._h);
                this._on_change();
            });
        }
        if (this._slider_s) {
            this._slider_s.input.dom.el.addEventListener('input', () => {
                this._s = +this._slider_s.input.dom.el.value;
                this._slider_s.val_label.dom.el.textContent = String(this._s);
                this._on_change();
            });
        }
        if (this._slider_l) {
            this._slider_l.input.dom.el.addEventListener('input', () => {
                this._l = +this._slider_l.input.dom.el.value;
                this._slider_l.val_label.dom.el.textContent = String(this._l);
                this._on_change();
            });
        }
        if (this._slider_a) {
            this._slider_a.input.dom.el.addEventListener('input', () => {
                this._a = +this._slider_a.input.dom.el.value / 100;
                this._slider_a.val_label.dom.el.textContent = String(Math.round(this._a * 100));
                this._on_change();
            });
        }

        // Hex input
        if (this._hex_input && this._hex_input.dom.el) {
            this._hex_input.dom.el.addEventListener('change', () => {
                let val = this._hex_input.dom.el.value.trim();
                if (!val.startsWith('#')) val = '#' + val;
                if (/^#[0-9a-fA-F]{6}$/.test(val) || /^#[0-9a-fA-F]{3}$/.test(val)) {
                    const [r, g, b] = hex_to_rgb(val);
                    const [h, s, l] = rgb_to_hsl(r, g, b);
                    this._h = h; this._s = s; this._l = l;
                    this._on_change();
                }
            });
        }

        // Palette cell clicks
        if (this._palette_wrap && this._palette_wrap.dom.el) {
            this._palette_wrap.dom.el.addEventListener('click', (e) => {
                const cell = e.target.closest('.cp-palette-cell');
                if (cell) {
                    const hex = cell.getAttribute('data-color');
                    if (hex) {
                        const [r, g, b] = hex_to_rgb(hex);
                        const [h, s, l] = rgb_to_hsl(r, g, b);
                        this._h = h; this._s = s; this._l = l;
                        this._on_change();
                    }
                }
            });
        }

        // RGB inputs
        if (this._rgb_r && this._rgb_r.dom.el) {
            const sync_rgb = () => {
                const r = +this._rgb_r.dom.el.value;
                const g = +this._rgb_g.dom.el.value;
                const b = +this._rgb_b.dom.el.value;
                const [h, s, l] = rgb_to_hsl(r, g, b);
                this._h = h; this._s = s; this._l = l;
                this._on_change();
            };
            this._rgb_r.dom.el.addEventListener('input', sync_rgb);
            this._rgb_g.dom.el.addEventListener('input', sync_rgb);
            this._rgb_b.dom.el.addEventListener('input', sync_rgb);
        }

        // HSL inputs
        if (this._hsl_h && this._hsl_h.dom.el) {
            const sync_hsl = () => {
                this._h = +this._hsl_h.dom.el.value;
                this._s = +this._hsl_s.dom.el.value;
                this._l = +this._hsl_l.dom.el.value;
                this._on_change();
            };
            this._hsl_h.dom.el.addEventListener('input', sync_hsl);
            this._hsl_s.dom.el.addEventListener('input', sync_hsl);
            this._hsl_l.dom.el.addEventListener('input', sync_hsl);
        }
    }

    // ── Canvas rendering ──

    _draw_hue_wheel() {
        const canvas = this._wheel_canvas.dom.el;
        if (!canvas || !canvas.getContext) return;
        const ctx = canvas.getContext('2d');
        const cx = 90, cy = 90, outer = 88, inner = 68;

        ctx.clearRect(0, 0, 180, 180);
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
        const canvas = this._sl_canvas ? this._sl_canvas.dom.el : null;
        if (!canvas || !canvas.getContext) return;
        const ctx = canvas.getContext('2d');
        const w = 100, h = 100;
        ctx.clearRect(0, 0, w, h);

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                const s = x / w;
                const l = 1 - (y / h);
                const [r, g, b] = hsl_to_rgb(this._h, s, l);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    _position_hue_dot() {
        if (!this._hue_dot || !this._hue_dot.dom.el) return;
        const rad = (this._h - 90) * Math.PI / 180;
        const r = 78; // midpoint of ring
        const x = 90 + r * Math.cos(rad) - 6;
        const y = 90 + r * Math.sin(rad) - 6;
        this._hue_dot.dom.el.style.left = x + 'px';
        this._hue_dot.dom.el.style.top = y + 'px';
    }

    _position_sl_dot() {
        if (!this._sl_dot || !this._sl_dot.dom.el || !this._sl_canvas) return;
        const canvas = this._sl_canvas.dom.el;
        if (!canvas) return;
        const rect_left = parseInt(canvas.style.left || '40');
        const rect_top = parseInt(canvas.style.top || '40');
        const x = rect_left + (this._s / 100) * 100 - 6;
        const y = rect_top + (1 - this._l / 100) * 100 - 6;
        this._sl_dot.dom.el.style.left = x + 'px';
        this._sl_dot.dom.el.style.top = y + 'px';
    }

    _handle_wheel_event(e) {
        const canvas = this._wheel_canvas.dom.el;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - 90;
        const y = e.clientY - rect.top - 90;
        const dist = Math.sqrt(x * x + y * y);
        if (dist < 65 || dist > 92) return; // outside the ring
        let deg = Math.atan2(y, x) * 180 / Math.PI + 90;
        if (deg < 0) deg += 360;
        this._h = Math.round(deg);
        this._on_change();
        this._draw_sl_area();
    }

    _handle_sl_event(e) {
        const canvas = this._sl_canvas.dom.el;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, e.clientX - rect.left));
        const y = Math.max(0, Math.min(100, e.clientY - rect.top));
        this._s = Math.round(x);
        this._l = Math.round(100 - y);
        this._on_change();
    }

    _on_change() {
        // Update all UI elements to reflect new HSL
        const hex = this._current_hex();
        const [r, g, b] = hsl_to_rgb(this._h, this._s / 100, this._l / 100);

        // Sliders
        if (this._slider_h && this._slider_h.input.dom.el) {
            this._slider_h.input.dom.el.value = this._h;
            this._slider_h.val_label.dom.el.textContent = String(this._h);
        }
        if (this._slider_s && this._slider_s.input.dom.el) {
            this._slider_s.input.dom.el.value = this._s;
            this._slider_s.val_label.dom.el.textContent = String(this._s);
        }
        if (this._slider_l && this._slider_l.input.dom.el) {
            this._slider_l.input.dom.el.value = this._l;
            this._slider_l.val_label.dom.el.textContent = String(this._l);
        }

        // Hex
        if (this._hex_input && this._hex_input.dom.el) {
            this._hex_input.dom.el.value = hex;
        }

        // RGB
        if (this._rgb_r && this._rgb_r.dom.el) {
            this._rgb_r.dom.el.value = r;
            this._rgb_g.dom.el.value = g;
            this._rgb_b.dom.el.value = b;
        }

        // HSL
        if (this._hsl_h && this._hsl_h.dom.el) {
            this._hsl_h.dom.el.value = this._h;
            this._hsl_s.dom.el.value = this._s;
            this._hsl_l.dom.el.value = this._l;
        }

        // Wheel visuals
        if (this._hue_dot) this._position_hue_dot();
        if (this._sl_dot) this._position_sl_dot();

        // Preview
        if (this._preview_new && this._preview_new.dom.el) {
            this._preview_new.dom.el.style.background = hex;
        }

        this.raise('change', {
            value: this._format_output(),
            hex, h: this._h, s: this._s, l: this._l,
            r, g, b, a: this._a
        });
    }
}

// ── Static CSS ──
Color_Picker.css = `
.color-picker {
    display: inline-flex;
    flex-direction: column;
}
.cp-layout-horizontal { flex-direction: row; flex-wrap: wrap; }
.cp-wheel-wrap { position: relative; width: 180px; height: 180px; margin: 0 auto; }
.cp-wheel-canvas { position: absolute; top: 0; left: 0; cursor: crosshair; }
.cp-sl-canvas { position: absolute; top: 40px; left: 40px; width: 100px; height: 100px; cursor: crosshair; }
.cp-hue-dot, .cp-sl-dot { position: absolute; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; pointer-events: none; }
`;


// Export utilities for testing
Color_Picker.hsl_to_rgb = hsl_to_rgb;
Color_Picker.rgb_to_hsl = rgb_to_hsl;
Color_Picker.hex_to_rgb = hex_to_rgb;
Color_Picker.rgb_to_hex = rgb_to_hex;
Color_Picker.parse_color = parse_color;

module.exports = Color_Picker;
