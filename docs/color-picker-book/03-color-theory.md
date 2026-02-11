# Chapter 3: Color Theory & Models

Understanding color models is essential for building a color picker that converts seamlessly between representations. This chapter covers the models we need to support and the mathematics behind converting between them.

## Color Models Overview

### RGB (Red, Green, Blue)

The native model of screens. Each channel is an integer from 0–255.

```
RGB(31, 117, 254)  →  a vivid blue
RGB(255, 0, 0)     →  pure red
RGB(128, 128, 128) →  medium gray
```

**When users use it:** Web developers, CSS authors, anyone reading `rgb()` values.

**Representation:**
```javascript
{ r: 31, g: 117, b: 254 }
```

### HSL (Hue, Saturation, Lightness)

A cylindrical model that separates *what color* (hue) from *how vivid* (saturation) and *how bright* (lightness).

```
Hue:        0–360° (color wheel position)
Saturation: 0–100% (gray → full color)
Lightness:  0–100% (black → white)
```

**When users use it:** Designers adjusting color properties independently. "Make it a bit lighter" = increase L. "Make it less saturated" = decrease S.

**Representation:**
```javascript
{ h: 220, s: 99, l: 56 }
```

### HSV / HSB (Hue, Saturation, Value/Brightness)

Similar to HSL but uses "value" (brightness of the color) instead of "lightness". This is the model behind the classic Photoshop-style square picker.

```
Hue:        0–360°
Saturation: 0–100% (horizontal axis in gradient area)
Value:      0–100% (vertical axis in gradient area)
```

**When users use it:** The 2D gradient area picker maps directly to S (x-axis) and V (y-axis).

**Representation:**
```javascript
{ h: 220, s: 99, v: 100 }
```

### HEX

A compact string encoding of RGB values. The most common format in CSS and design handoffs.

```
#1F75FE     →  RGB(31, 117, 254)
#FF0000     →  pure red
#808080     →  medium gray
#1F75FE80   →  with 50% alpha (8-digit hex)
```

**Representation:** A string, always normalised to uppercase with `#` prefix.

### Named Colors

CSS's 148 named colors (`red`, `cornflowerblue`, `papayawhip`) plus custom palette names like the Crayola set already in `arr_colors.js`.

**When users use it:** Quick recognition. "I want Coral" is more intuitive than "#FF7F50".

### Alpha Channel

An opacity value from 0 (fully transparent) to 1 (fully opaque), applicable to any model:

```
RGBA(31, 117, 254, 0.5)
HSLA(220, 99%, 56%, 0.75)
#1F75FE80
```

## The Color Value Object

All picker modes should share a single normalised color value:

```javascript
class Color_Value {
    constructor(r, g, b, a = 1) {
        this.r = r;  // 0–255
        this.g = g;  // 0–255
        this.b = b;  // 0–255
        this.a = a;  // 0–1
    }

    // --- Getters for derived representations ---

    get hex()  { /* → '#1F75FE' */ }
    get hex8() { /* → '#1F75FE80' (with alpha) */ }
    get rgb()  { /* → { r, g, b } */ }
    get rgba() { /* → { r, g, b, a } */ }
    get hsl()  { /* → { h, s, l } */ }
    get hsla() { /* → { h, s, l, a } */ }
    get hsv()  { /* → { h, s, v } */ }
    get css()  { /* → 'rgba(31, 117, 254, 1)' */ }

    // --- Static factory methods ---

    static from_hex(hex)        { /* parse '#1F75FE' or '#1F75FE80' */ }
    static from_rgb(r, g, b, a) { /* direct construction */ }
    static from_hsl(h, s, l, a) { /* convert and construct */ }
    static from_hsv(h, s, v, a) { /* convert and construct */ }
    static from_name(name)      { /* lookup in named colors table */ }

    // --- Comparison ---

    equals(other)  { /* compare RGBA values */ }
    toString()     { /* default to hex */ }
}
```

## Conversion Algorithms

### RGB → HSL

```javascript
function rgb_to_hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const l = (max + min) / 2;

    if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}
```

### HSL → RGB

```javascript
function hsl_to_rgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;

    if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }

    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
    };
}
```

### RGB → HSV

```javascript
function rgb_to_hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const v = max;
    const s = max === 0 ? 0 : d / max;

    let h = 0;
    if (d !== 0) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}
```

### HSV → RGB

```javascript
function hsv_to_rgb(h, s, v) {
    h /= 360; s /= 100; v /= 100;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
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
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
```

### HEX ↔ RGB

```javascript
function hex_to_rgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
    };
}

function rgb_to_hex(r, g, b, a) {
    const hex = '#' + [r, g, b].map(v =>
        v.toString(16).padStart(2, '0')
    ).join('').toUpperCase();

    if (a !== undefined && a < 1) {
        return hex + Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
    }
    return hex;
}
```

## Color Utilities

Beyond conversion, the `Color_Value` class should provide utility methods:

```javascript
// Contrast ratio (WCAG)
contrast_ratio(other) { /* → number 1–21 */ }

// Derived colors
lighten(amount)    { /* → new Color_Value */ }
darken(amount)     { /* → new Color_Value */ }
saturate(amount)   { /* → new Color_Value */ }
desaturate(amount) { /* → new Color_Value */ }
complement()       { /* → hue + 180° */ }
analogous()        { /* → [hue - 30°, this, hue + 30°] */ }

// Accessibility
is_light()  { /* → true if luminance > 0.5 */ }
text_color() { /* → black or white for best contrast */ }
```

These utilities become valuable in theme editors and design tools built on top of the color picker.

## Where This Code Lives

The `Color_Value` class and all conversion functions should be placed in:

```
html-core/color-value.js
```

This keeps it alongside other core utilities (`arr_colors.js` is already there) and makes it importable by both server-side and client-side code without any DOM dependencies.
