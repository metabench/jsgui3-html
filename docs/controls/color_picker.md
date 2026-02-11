# Color_Picker

Advanced color selection control with HSL wheel, sliders, palette grid, and multiple input modes.

## Usage

```js
const Color_Picker = require('controls/organised/0-core/0-basic/1-compositional/color-picker');

// Minimal — wheel + sliders + palette + hex input
const cp = new Color_Picker({ context });

// Custom — only RGB inputs + alpha
const cp2 = new Color_Picker({
    context,
    value: '#ff0000',
    show_wheel: false,
    show_sliders: false,
    show_rgb_inputs: true,
    show_alpha: true,
    output_format: 'rgba',
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | string | `'#3b82f6'` | Initial color (hex, rgb(), hsl()) |
| `show_wheel` | bool | `true` | HSL color wheel |
| `show_sliders` | bool | `true` | H/S/L range sliders |
| `show_palette` | bool | `true` | Swatch palette grid |
| `show_hex_input` | bool | `true` | Hex text input |
| `show_rgb_inputs` | bool | `false` | R/G/B number spinners |
| `show_hsl_inputs` | bool | `false` | H/S/L number spinners |
| `show_alpha` | bool | `false` | Alpha slider (0–100%) |
| `show_preview` | bool | `true` | Old/new color comparison swatch |
| `layout` | string | `'vertical'` | `'vertical'` \| `'horizontal'` \| `'compact'` |
| `output_format` | string | `'hex'` | `'hex'` \| `'rgb'` \| `'hsl'` \| `'rgba'` |
| `palette` | array | built-in 24 | Custom color array |
| `palette_key` | string | — | Palette registry key |

## Public API

| Property/Method | Returns | Description |
|----------------|---------|-------------|
| `.value` | string | Formatted color string |
| `.hex` | string | `#RRGGBB` hex |
| `.rgb` | `{r,g,b}` | RGB components (0–255) |
| `.hsl` | `{h,s,l}` | HSL components |
| `.h` / `.s` / `.l` | number | Individual HSL values |
| `.alpha` | number | Alpha (0–1) |
| `.set_value(str)` | — | Parse and set any color string |
| `.set_hsl(h,s,l)` | — | Set via HSL |
| `.set_alpha(a)` | — | Set alpha (clamped 0–1) |

## Events

- **`change`** `{ value, hex, h, s, l, r, g, b, a }` — fires on every value change

## Notes

- HSL↔RGB round-trips may have ±1 rounding per channel
- All sub-components can be toggled independently
- Canvas-based wheel requires browser with Canvas API

## Tests

`test/controls/color_picker.test.js` — 14 tests
