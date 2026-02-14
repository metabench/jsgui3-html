'use strict';

// ────────────────────────────────────────────────────────────────────────────
// Color_Value — Standalone color model class
//
// Pure JavaScript, no UI dependencies. Represents a color in multiple
// formats (HSL, RGB, HEX) with alpha channel and provides conversions,
// parsing, comparison, and WCAG accessibility calculations.
//
// This is the "M" in MVVM — any control that displays a color
// (Color_Picker, Color_Grid, swatch, preview, etc.) can share the
// same Color_Value instance as its data model.
// ────────────────────────────────────────────────────────────────────────────

// ── Conversion Utilities ──

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
    if (hex.length === 8) {
        // #RRGGBBAA
        const n = parseInt(hex.substring(0, 6), 16);
        const a = parseInt(hex.substring(6, 8), 16) / 255;
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
    }
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgb_to_hex(r, g, b) {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function rgb_to_hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    const v = max;
    const s = max === 0 ? 0 : d / max;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        else if (max === g) h = ((b - r) / d + 2) * 60;
        else h = ((r - g) / d + 4) * 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(v * 100)];
}

function hsv_to_rgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    v = Math.max(0, Math.min(100, v)) / 100;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Parse any common CSS color string into { h, s, l, a }.
 * Supports: #hex, rgb(), rgba(), hsl(), hsla(), named CSS colors (subset).
 * @param {string} input
 * @returns {{ h: number, s: number, l: number, a: number }}
 */
function parse_color(input) {
    if (!input || typeof input !== 'string') return { h: 0, s: 100, l: 50, a: 1 };
    input = input.trim().toLowerCase();

    // Hex (#RGB, #RRGGBB, #RRGGBBAA)
    if (input.startsWith('#')) {
        const parts = hex_to_rgb(input);
        const [r, g, b] = parts;
        const [h, s, l] = rgb_to_hsl(r, g, b);
        return { h, s, l, a: parts.length === 4 ? parts[3] : 1 };
    }

    // rgb(r,g,b) or rgba(r,g,b,a)
    const rgb_match = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (rgb_match) {
        const [h, s, l] = rgb_to_hsl(+rgb_match[1], +rgb_match[2], +rgb_match[3]);
        return { h, s, l, a: rgb_match[4] !== undefined ? +rgb_match[4] : 1 };
    }

    // hsl(h,s%,l%) or hsla(h,s%,l%,a)
    const hsl_match = input.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
    if (hsl_match) {
        return { h: +hsl_match[1], s: +hsl_match[2], l: +hsl_match[3], a: hsl_match[4] !== undefined ? +hsl_match[4] : 1 };
    }

    // Named colors (common subset)
    const named = NAMED_COLORS[input];
    if (named) {
        const [r, g, b] = hex_to_rgb(named);
        const [h, s, l] = rgb_to_hsl(r, g, b);
        return { h, s, l, a: 1 };
    }

    return { h: 0, s: 100, l: 50, a: 1 };
}

// All 148 CSS named colors (+ grey alias)
const NAMED_COLORS = {
    aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff',
    aquamarine: '#7fffd4', azure: '#f0ffff', beige: '#f5f5dc',
    bisque: '#ffe4c4', black: '#000000', blanchedalmond: '#ffebcd',
    blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
    burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00',
    chocolate: '#d2691e', coral: '#ff7f50', cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc', crimson: '#dc143c', cyan: '#00ffff',
    darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b', darkmagenta: '#8b008b', darkolivegreen: '#556b2f',
    darkorange: '#ff8c00', darkorchid: '#9932cc', darkred: '#8b0000',
    darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1',
    darkviolet: '#9400d3', deeppink: '#ff1493', deepskyblue: '#00bfff',
    dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1e90ff',
    firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
    fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff',
    gold: '#ffd700', goldenrod: '#daa520', gray: '#808080',
    green: '#008000', greenyellow: '#adff2f', grey: '#808080',
    honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
    indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c',
    lavender: '#e6e6fa', lavenderblush: '#fff0f5', lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080',
    lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
    lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a', lightseagreen: '#20b2aa', lightskyblue: '#87cefa',
    lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32',
    linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000',
    mediumaquamarine: '#66cdaa', mediumblue: '#0000cd', mediumorchid: '#ba55d3',
    mediumpurple: '#9370db', mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585',
    midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080',
    oldlace: '#fdf5e6', olive: '#808000', olivedrab: '#6b8e23',
    orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6',
    palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee',
    palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9',
    peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd',
    powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399',
    red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1',
    saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460',
    seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d',
    silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd',
    slategray: '#708090', slategrey: '#708090', snow: '#fffafa',
    springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c',
    teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347',
    turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
    white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00',
    yellowgreen: '#9acd32'
};

// Build reverse lookup (hex → name, first match wins)
const HEX_TO_NAME = {};
for (const [name, hex] of Object.entries(NAMED_COLORS)) {
    if (!HEX_TO_NAME[hex]) HEX_TO_NAME[hex] = name;
}


// ────────────────────────────────────────────────────────────────────────────
// Color_Value class
// ────────────────────────────────────────────────────────────────────────────

class Color_Value {
    /**
     * Create a Color_Value from any supported input.
     * @param {string|Object} input — hex string, css color, or { h, s, l, a }
     */
    constructor(input) {
        if (typeof input === 'string') {
            const parsed = parse_color(input);
            this._h = parsed.h;
            this._s = parsed.s;
            this._l = parsed.l;
            this._a = parsed.a;
        } else if (input && typeof input === 'object') {
            this._h = ((input.h || 0) % 360 + 360) % 360;
            this._s = Math.max(0, Math.min(100, input.s || 0));
            this._l = Math.max(0, Math.min(100, input.l || 0));
            this._a = input.a !== undefined ? Math.max(0, Math.min(1, input.a)) : 1;
        } else {
            // Default: blue
            this._h = 217; this._s = 91; this._l = 60; this._a = 1;
        }

        /** @type {Function[]} Change listeners */
        this._listeners = [];
    }

    // ── Getters ──

    /** @returns {number} Hue 0-360 */
    get h() { return this._h; }
    /** @returns {number} Saturation 0-100 */
    get s() { return this._s; }
    /** @returns {number} Lightness 0-100 */
    get l() { return this._l; }
    /** @returns {number} Alpha 0-1 */
    get alpha() { return this._a; }

    /** @returns {string} Hex string like '#3b82f6' */
    get hex() {
        const [r, g, b] = hsl_to_rgb(this._h, this._s / 100, this._l / 100);
        return rgb_to_hex(r, g, b);
    }

    /** @returns {{ r: number, g: number, b: number }} RGB object with 0-255 values */
    get rgb() {
        const [r, g, b] = hsl_to_rgb(this._h, this._s / 100, this._l / 100);
        return { r, g, b };
    }

    /** @returns {{ h: number, s: number, l: number }} HSL object */
    get hsl() {
        return { h: this._h, s: this._s, l: this._l };
    }

    /** @returns {{ h: number, s: number, v: number }} HSV object */
    get hsv() {
        const { r, g, b } = this.rgb;
        const [h, s, v] = rgb_to_hsv(r, g, b);
        return { h, s, v };
    }

    /**
     * CSS named color name, or null if no exact match.
     * @returns {string|null}
     */
    get name() {
        return HEX_TO_NAME[this.hex] || null;
    }

    /** @returns {string} CSS-ready string in default format (hex) */
    get css() {
        return this.to_string('hex');
    }

    // ── Setters ──

    /**
     * Set from hex string.
     * @param {string} hex — e.g. '#ff0000'
     * @returns {Color_Value} this (for chaining)
     */
    set_hex(hex) {
        const parts = hex_to_rgb(hex);
        const [r, g, b] = parts;
        const [h, s, l] = rgb_to_hsl(r, g, b);
        const old = this._snapshot();
        this._h = h; this._s = s; this._l = l;
        if (parts.length === 4) this._a = parts[3];
        this._notify(old);
        return this;
    }

    /**
     * Set from RGB values.
     * @param {number} r — 0-255
     * @param {number} g — 0-255
     * @param {number} b — 0-255
     * @returns {Color_Value} this
     */
    set_rgb(r, g, b) {
        const [h, s, l] = rgb_to_hsl(
            Math.max(0, Math.min(255, r)),
            Math.max(0, Math.min(255, g)),
            Math.max(0, Math.min(255, b))
        );
        const old = this._snapshot();
        this._h = h; this._s = s; this._l = l;
        this._notify(old);
        return this;
    }

    /**
     * Set from HSL values.
     * @param {number} h — 0-360
     * @param {number} s — 0-100
     * @param {number} l — 0-100
     * @returns {Color_Value} this
     */
    set_hsl(h, s, l) {
        const old = this._snapshot();
        this._h = ((h % 360) + 360) % 360;
        this._s = Math.max(0, Math.min(100, s));
        this._l = Math.max(0, Math.min(100, l));
        this._notify(old);
        return this;
    }

    /**
     * Set alpha channel.
     * @param {number} a — 0-1
     * @returns {Color_Value} this
     */
    set_alpha(a) {
        const old = this._snapshot();
        this._a = Math.max(0, Math.min(1, a));
        this._notify(old);
        return this;
    }

    /**
     * Set from HSV values.
     * @param {number} h — 0-360
     * @param {number} s — 0-100
     * @param {number} v — 0-100
     * @returns {Color_Value} this
     */
    set_hsv(h, s, v) {
        const [r, g, b] = hsv_to_rgb(h, s, v);
        const [hh, ss, ll] = rgb_to_hsl(r, g, b);
        const old = this._snapshot();
        this._h = hh; this._s = ss; this._l = ll;
        this._notify(old);
        return this;
    }

    /**
     * Set from any supported input string.
     * @param {string} input — hex, rgb(), hsl(), named color
     * @returns {Color_Value} this
     */
    set(input) {
        const parsed = parse_color(input);
        const old = this._snapshot();
        this._h = parsed.h;
        this._s = parsed.s;
        this._l = parsed.l;
        this._a = parsed.a;
        this._notify(old);
        return this;
    }

    // ── Comparison ──

    /**
     * Check equality with another Color_Value or color string.
     * @param {Color_Value|string} other
     * @returns {boolean}
     */
    equals(other) {
        if (typeof other === 'string') other = new Color_Value(other);
        if (!(other instanceof Color_Value)) return false;
        return this._h === other._h && this._s === other._s &&
            this._l === other._l && this._a === other._a;
    }

    // ── WCAG Accessibility ──

    /**
     * Relative luminance per WCAG 2.0.
     * @returns {number} 0-1
     */
    luminance() {
        const { r, g, b } = this.rgb;
        const to_linear = (c) => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * to_linear(r) + 0.7152 * to_linear(g) + 0.0722 * to_linear(b);
    }

    /**
     * WCAG contrast ratio against another color.
     * @param {Color_Value|string} other
     * @returns {number} 1-21
     */
    contrast_ratio(other) {
        if (typeof other === 'string') other = new Color_Value(other);
        const l1 = this.luminance();
        const l2 = other.luminance();
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Check if this color meets WCAG AA contrast against another color.
     * @param {Color_Value|string} other
     * @param {'normal'|'large'} text_size
     * @returns {boolean}
     */
    meets_aa(other, text_size = 'normal') {
        const ratio = this.contrast_ratio(other);
        return text_size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }

    /**
     * Check if this color meets WCAG AAA contrast against another color.
     * @param {Color_Value|string} other
     * @param {'normal'|'large'} text_size
     * @returns {boolean}
     */
    meets_aaa(other, text_size = 'normal') {
        const ratio = this.contrast_ratio(other);
        return text_size === 'large' ? ratio >= 4.5 : ratio >= 7;
    }

    // ── Color Manipulation ──

    /**
     * Return a new Color_Value with lightness increased.
     * @param {number} amount — 0-100 to add to lightness
     * @returns {Color_Value}
     */
    lighten(amount) {
        return new Color_Value({ h: this._h, s: this._s, l: Math.min(100, this._l + amount), a: this._a });
    }

    /**
     * Return a new Color_Value with lightness decreased.
     * @param {number} amount — 0-100 to subtract from lightness
     * @returns {Color_Value}
     */
    darken(amount) {
        return new Color_Value({ h: this._h, s: this._s, l: Math.max(0, this._l - amount), a: this._a });
    }

    /**
     * Return a new Color_Value with saturation increased.
     * @param {number} amount — 0-100 to add to saturation
     * @returns {Color_Value}
     */
    saturate(amount) {
        return new Color_Value({ h: this._h, s: Math.min(100, this._s + amount), l: this._l, a: this._a });
    }

    /**
     * Return a new Color_Value with saturation decreased.
     * @param {number} amount — 0-100 to subtract from saturation
     * @returns {Color_Value}
     */
    desaturate(amount) {
        return new Color_Value({ h: this._h, s: Math.max(0, this._s - amount), l: this._l, a: this._a });
    }

    /**
     * Return the complement (hue + 180°).
     * @returns {Color_Value}
     */
    complement() {
        return new Color_Value({ h: (this._h + 180) % 360, s: this._s, l: this._l, a: this._a });
    }

    /**
     * Return analogous colors (hue ± 30°).
     * @returns {Color_Value[]}
     */
    analogous() {
        return [
            new Color_Value({ h: (this._h - 30 + 360) % 360, s: this._s, l: this._l, a: this._a }),
            this.clone(),
            new Color_Value({ h: (this._h + 30) % 360, s: this._s, l: this._l, a: this._a })
        ];
    }

    /**
     * Return triadic colors (hue + 120°, hue + 240°).
     * @returns {Color_Value[]}
     */
    triadic() {
        return [
            this.clone(),
            new Color_Value({ h: (this._h + 120) % 360, s: this._s, l: this._l, a: this._a }),
            new Color_Value({ h: (this._h + 240) % 360, s: this._s, l: this._l, a: this._a })
        ];
    }

    /**
     * Is this a "light" color? (luminance > 0.5)
     * @returns {boolean}
     */
    is_light() {
        return this.luminance() > 0.5;
    }

    /**
     * Best contrasting text color (black or white).
     * @returns {Color_Value}
     */
    text_color() {
        return this.is_light() ? new Color_Value('#000000') : new Color_Value('#ffffff');
    }

    // ── Formatting ──

    /**
     * Format as CSS string.
     * @param {'hex'|'rgb'|'rgba'|'hsl'|'hsla'|'hsv'} format
     * @returns {string}
     */
    to_string(format = 'hex') {
        const { r, g, b } = this.rgb;
        switch (format) {
            case 'rgb': return `rgb(${r}, ${g}, ${b})`;
            case 'rgba': return `rgba(${r}, ${g}, ${b}, ${this._a})`;
            case 'hsl': return `hsl(${this._h}, ${this._s}%, ${this._l}%)`;
            case 'hsla': return `hsla(${this._h}, ${this._s}%, ${this._l}%, ${this._a})`;
            case 'hsv': { const hsv = this.hsv; return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`; }
            default: return this.hex;
        }
    }

    /**
     * Clone this Color_Value.
     * @returns {Color_Value}
     */
    clone() {
        const cv = new Color_Value({ h: this._h, s: this._s, l: this._l, a: this._a });
        return cv;
    }

    // ── Observable (simple change events for MVVM) ──

    /**
     * Listen for changes.
     * @param {Function} fn — called with ({ old, current }) where both are { h, s, l, a }
     * @returns {Function} unsubscribe function
     */
    on_change(fn) {
        this._listeners.push(fn);
        return () => {
            const idx = this._listeners.indexOf(fn);
            if (idx !== -1) this._listeners.splice(idx, 1);
        };
    }

    /** @private */
    _snapshot() {
        return { h: this._h, s: this._s, l: this._l, a: this._a };
    }

    /** @private */
    _notify(old) {
        if (old.h === this._h && old.s === this._s && old.l === this._l && old.a === this._a) return;
        const current = this._snapshot();
        for (const fn of this._listeners) {
            try { fn({ old, current, color: this }); } catch (e) { /* swallow listener errors */ }
        }
    }

    // ── Static Factories ──

    /**
     * Create from hex string.
     * @param {string} hex
     * @returns {Color_Value}
     */
    static from_hex(hex) {
        return new Color_Value(hex);
    }

    /**
     * Create from RGB values (0-255).
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} [a=1]
     * @returns {Color_Value}
     */
    static from_rgb(r, g, b, a = 1) {
        const [h, s, l] = rgb_to_hsl(r, g, b);
        return new Color_Value({ h, s, l, a });
    }

    /**
     * Create from HSL values.
     * @param {number} h — 0-360
     * @param {number} s — 0-100
     * @param {number} l — 0-100
     * @param {number} [a=1]
     * @returns {Color_Value}
     */
    static from_hsl(h, s, l, a = 1) {
        return new Color_Value({ h, s, l, a });
    }

    /**
     * Create from HSV values.
     * @param {number} h — 0-360
     * @param {number} s — 0-100
     * @param {number} v — 0-100
     * @param {number} [a=1]
     * @returns {Color_Value}
     */
    static from_hsv(h, s, v, a = 1) {
        const [r, g, b] = hsv_to_rgb(h, s, v);
        const [hh, ss, ll] = rgb_to_hsl(r, g, b);
        return new Color_Value({ h: hh, s: ss, l: ll, a });
    }

    /**
     * Create from a CSS named color.
     * @param {string} name — e.g. 'coral', 'cornflowerblue'
     * @returns {Color_Value}
     */
    static from_name(name) {
        const hex = NAMED_COLORS[name.toLowerCase()];
        if (!hex) throw new Error(`Unknown CSS color name: ${name}`);
        return new Color_Value(hex);
    }

    /**
     * Create from any supported input.
     * @param {string|Object} input
     * @returns {Color_Value}
     */
    static from(input) {
        return new Color_Value(input);
    }
}

// ── Expose conversion utilities as statics (backward compat with Color_Picker) ──
Color_Value.hsl_to_rgb = hsl_to_rgb;
Color_Value.rgb_to_hsl = rgb_to_hsl;
Color_Value.hex_to_rgb = hex_to_rgb;
Color_Value.rgb_to_hex = rgb_to_hex;
Color_Value.rgb_to_hsv = rgb_to_hsv;
Color_Value.hsv_to_rgb = hsv_to_rgb;
Color_Value.parse_color = parse_color;
Color_Value.NAMED_COLORS = NAMED_COLORS;
Color_Value.HEX_TO_NAME = HEX_TO_NAME;

module.exports = Color_Value;
