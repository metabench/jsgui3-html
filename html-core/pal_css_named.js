'use strict';

/**
 * CSS Named Colors Palette — 148 colors organized by hue family
 * 
 * All CSS named colors (Level 4) sorted into hue-family groups
 * for a visually coherent grid. 12 columns × 13 rows = 156 cells
 * (8 cells empty at the end).
 *
 * Data sourced from Color_Value.NAMED_COLORS.
 */

const Color_Value = require('./Color_Value');

// Group named colors by hue family using HSL
const _entries = Object.entries(Color_Value.NAMED_COLORS)
    // Skip grey/darkgrey/etc aliases that duplicate hex values
    .filter(([name]) => !name.endsWith('grey') || name === 'grey');

// Build palette entries with HSL for sorting
const _with_hsl = _entries.map(([name, hex]) => {
    const [r, g, b] = Color_Value.hex_to_rgb(hex);
    const [h, s, l] = Color_Value.rgb_to_hsl(r, g, b);
    return {
        hex: hex,
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2'),
        rgb: `(${r}, ${g}, ${b})`,
        _h: h, _s: s, _l: l
    };
});

// Sort by: hue (12 segments of 30°), then lightness, then saturation
_with_hsl.sort((a, b) => {
    const seg_a = Math.floor(a._h / 30);
    const seg_b = Math.floor(b._h / 30);
    if (seg_a !== seg_b) return seg_a - seg_b;
    if (a._l !== b._l) return a._l - b._l;
    return b._s - a._s;
});

// Strip sorting metadata
const pal_css_named = _with_hsl.map(({ hex, name, rgb }) => ({ hex, name, rgb }));

module.exports = pal_css_named;
