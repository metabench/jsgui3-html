# Chapter 10: Palettes, Composability & Idiomatic Usage

The previous chapters defined individual controls and their APIs. This chapter shows how those pieces fit together in practice — how palettes work, how the same controls serve different purposes, and what idiomatic jsgui3 color-picking code looks like.

---

## Part 1: The Palette System

### 1.1 What Is a Palette?

A palette is an ordered array of colour entries. Each entry can be as simple as a hex string or as rich as a full descriptor:

```javascript
// Simplest form — just hex strings
const my_palette = ['#FF0000', '#00FF00', '#0000FF'];

// Named palette — objects with hex and name
const named_palette = [
    { hex: '#1DACD6', name: 'Cerulean' },
    { hex: '#FFAACC', name: 'Carnation Pink' },
    { hex: '#1CAC78', name: 'Green (Crayola)' }
];

// Full descriptor — with grouping and metadata
const rich_palette = [
    { hex: '#1DACD6', name: 'Cerulean',   group: 'blues',  warm: false },
    { hex: '#CB4154', name: 'Brick Red',  group: 'reds',   warm: true },
    { hex: '#1CAC78', name: 'Green',      group: 'greens', warm: false }
];
```

All three formats are accepted by every palette-consuming control. The system normalises internally:

```javascript
// Internal normalization — the palette registry does this automatically
function normalize_entry(entry) {
    if (typeof entry === 'string') {
        return { hex: entry, name: null, group: null };
    }
    return {
        hex: entry.hex || entry.color || entry.value,
        name: entry.name || entry.label || null,
        group: entry.group || entry.category || null
    };
}
```

### 1.2 The Palette Registry

Built-in palettes are loaded by name via a central registry:

```javascript
// html-core/palettes/index.js

const palettes = {};

// Register a named palette
function register_palette(name, colors) {
    palettes[name] = colors.map(normalize_entry);
}

// Retrieve by name (or pass through arrays unchanged)
function get_palette(name_or_array) {
    if (Array.isArray(name_or_array)) return name_or_array.map(normalize_entry);
    return palettes[name_or_array] || palettes['crayola'] || [];
}

// List available palette names
function list_palettes() {
    return Object.keys(palettes);
}

// Built-in registrations
register_palette('crayola',  require('./crayola'));   // 133 colors (from existing arr_colors.js)
register_palette('material', require('./material'));   // 256 Material Design colors
register_palette('tailwind', require('./tailwind'));   // 220 Tailwind CSS colors
register_palette('web-safe', require('./web-safe'));   // 216 web-safe colors
register_palette('flat-ui',  require('./flat-ui'));    // 20 Flat UI colors

module.exports = { register_palette, get_palette, list_palettes };
```

### 1.3 Custom Palette Registration

Users can register their own palettes for use anywhere in the system:

```javascript
const { register_palette } = require('jsgui3-html/html-core/palettes');

// Register a brand palette
register_palette('my_brand', [
    { hex: '#1A237E', name: 'Brand Navy' },
    { hex: '#FF6F00', name: 'Brand Orange' },
    { hex: '#E0E0E0', name: 'Brand Light Grey' },
    { hex: '#263238', name: 'Brand Charcoal' }
]);

// Now use it anywhere by name
const picker = new Color_Picker({ context, palette: 'my_brand' });
const grid   = new Swatch_Grid({ context, palette: 'my_brand' });
const named  = new Named_Colors({ context, palette: 'my_brand' });
```

### 1.4 Palette Composition

Palettes can be combined:

```javascript
const { get_palette } = require('jsgui3-html/html-core/palettes');

// Merge two palettes
const combined = [...get_palette('material'), ...get_palette('flat-ui')];

// Take a subset
const blues_only = get_palette('crayola').filter(c => {
    const hue = Color_Value.from_hex(c.hex).hsl.h;
    return hue >= 200 && hue <= 260;
});

// Use as a custom palette
const picker = new Color_Picker({ context, palette: blues_only });
```

---

## Part 2: Composability — Same Controls, Many Contexts

The power of the design is that every picker mode is a **standalone control** that works identically whether used alone, inside a `Color_Picker`, inside a `Theme_Color_Editor`, or embedded in a form. This section shows the same controls used in progressively more complex scenarios.

### 2.1 Standalone: Just a Swatch Grid

The simplest case — a grid of colours on its own:

```javascript
// Pick a color from swatches. That's it.
const grid = new Swatch_Grid({
    context,
    palette: 'material'
});

grid.on('color-change', e => {
    document.body.style.backgroundColor = e.value.css;
});

page.add(grid);
```

### 2.2 Standalone: Just a Hex Input

A text field for entering hex values — useful in developer tools:

```javascript
const input = new Hex_Input({
    context,
    format: 'hex',
    color: Color_Value.from_hex('#333')
});

input.on('color-change', e => {
    code_editor.set_theme_color('foreground', e.value.hex);
});

toolbar.add(input);
```

### 2.3 Colour Indicator Button

A button that shows the current colour and opens a picker on click:

```javascript
// A common pattern: a small color swatch that opens a full picker
const swatch_button = new Button({
    context,
    variant: 'icon',
    style: { 'background-color': current_color.css, width: '32px', height: '32px' }
});

swatch_button.on('click', () => {
    const picker = new Color_Picker({
        context,
        variant: 'standard',
        color: current_color,
        show_actions: true
    });

    picker.on('apply', e => {
        current_color = e.value;
        swatch_button.style('background-color', e.value.css);
        popup.close();
    });

    popup.show(picker, { anchor: swatch_button });
});
```

### 2.4 Inside a Form

Colour as a form field — the picker integrates into the form's value lifecycle:

```javascript
const form = new Form({
    context,
    variant: 'default',
    fields: [
        { name: 'title', type: 'text', label: 'Widget Name' },
        { name: 'description', type: 'textarea', label: 'Description' },
        {
            name: 'color',
            type: 'custom',
            label: 'Widget Colour',
            control: new Color_Picker({
                context,
                variant: 'compact',
                palette: 'material'
            })
        }
    ]
});

form.on('submit', e => {
    const values = e.values;
    console.log(values.title);       // 'My Widget'
    console.log(values.color.hex);   // '#2196F3'
});
```

### 2.5 Tabbed Full Picker

The full-featured picker with multiple modes:

```javascript
const picker = new Color_Picker({
    context,
    variant: 'full',
    color: Color_Value.from_hex('#3A86FF'),
    show_alpha: true,
    show_actions: true
});

picker.on('apply', e => save_color(e.value));
picker.on('cancel', () => close_dialog());

dialog.add(picker);
```

### 2.6 Theme Editor

The same `Color_Picker` appears **inside** the `Theme_Color_Editor`, where each theme token gets its own picker instance:

```javascript
const editor = new Theme_Color_Editor({
    context,
    color_map: Theme_Color_Map.default_dark(),
    live_preview: true
});

// Internally, clicking a row opens:
//   new Color_Picker({ variant: 'theme-editor', color: entry.value })
// The exact same control, just configured differently.

editor.on('theme-color-change', e => {
    console.log(`${e.key}: ${e.value.hex}`);
});

admin_page.add(editor);
```

### 2.7 Side-by-Side Comparison

Compare two colours using two standalone pickers:

```javascript
const picker_a = new Color_Picker({ context, variant: 'standard', color: color_a });
const picker_b = new Color_Picker({ context, variant: 'standard', color: color_b });

const contrast_label = new Control({ context, tag: 'div', class: 'contrast-result' });

function update_contrast() {
    const ratio = Color_Value.contrast_ratio(picker_a.color, picker_b.color);
    contrast_label.set_content(`Contrast: ${ratio.toFixed(2)}:1`);
}

picker_a.on('color-change', update_contrast);
picker_b.on('color-change', update_contrast);

page.add(picker_a);
page.add(contrast_label);
page.add(picker_b);
```

---

## Part 3: Idiomatic Patterns

### 3.1 The One-Liner

The most common use — get a colour from the user:

```javascript
const picker = new Color_Picker({ context, variant: 'compact' });
picker.on('color-change', e => use_color(e.value));
container.add(picker);
```

Three lines. That's it for basic colour selection.

### 3.2 Switching Palettes at Runtime

Palettes are reactive — changing them re-renders the grid:

```javascript
const grid = new Swatch_Grid({ context, palette: 'crayola' });

// Later, switch to a different palette
palette_selector.on('change', e => {
    grid.palette = e.value;   // 'material', 'tailwind', 'my_brand', ...
    // The grid automatically re-renders with the new colours
});
```

This works because `palette` is backed by `prop()` with a `changes()` listener (see Chapter 6, §1.6).

### 3.3 Reading and Writing the Value

All color controls follow the jsgui3 **value convention**:

```javascript
// These are all equivalent ways to get/set
picker.color = Color_Value.from_hex('#FF0000');
picker.set_value(Color_Value.from_hex('#FF0000'));

const val = picker.color;
const val = picker.get_value();

// The value is always a Color_Value instance
console.log(val.hex);    // '#FF0000'
console.log(val.hsl);    // { h: 0, s: 100, l: 50 }
console.log(val.css);    // 'rgb(255, 0, 0)'
console.log(val.name);   // 'Red'
```

### 3.4 Creating Color_Value Instances

`Color_Value` is designed to be easy to construct from any format:

```javascript
// From hex
Color_Value.from_hex('#3A86FF');
Color_Value.from_hex('3A86FF');      // # optional
Color_Value.from_hex('#F00');        // 3-digit shorthand

// From RGB
new Color_Value(31, 117, 254);
Color_Value.from_rgb(31, 117, 254);
Color_Value.from_rgb(31, 117, 254, 0.5);  // with alpha

// From HSL
Color_Value.from_hsl(220, 99, 56);

// From HSV
Color_Value.from_hsv(220, 88, 100);

// From CSS string
Color_Value.from_css('rgb(31, 117, 254)');
Color_Value.from_css('hsl(220, 99%, 56%)');
Color_Value.from_css('rgba(31, 117, 254, 0.5)');

// From a named color
Color_Value.from_name('Cerulean');
Color_Value.from_name('cornflowerblue');

// Smart parser: accepts any format
Color_Value.from('#3A86FF');
Color_Value.from('rgb(31, 117, 254)');
Color_Value.from('Cerulean');
Color_Value.from({ r: 31, g: 117, b: 254 });
```

### 3.5 Chaining Conversions

`Color_Value` is immutable — conversion methods return new instances:

```javascript
const base = Color_Value.from_hex('#3A86FF');

// Read in any format
base.hex;           // '#3A86FF'
base.hsl;           // { h: 220, s: 99, l: 56 }
base.hsv;           // { h: 220, s: 88, v: 100 }
base.rgb;           // { r: 31, g: 117, b: 254 }
base.css;           // 'rgb(31, 117, 254)'

// Derived colours
base.lighten(20);   // Color_Value with L+20
base.darken(10);    // Color_Value with L-10
base.saturate(15);  // Color_Value with S+15
base.desaturate(20);
base.rotate_hue(180);  // Complementary colour
base.with_alpha(0.5);  // Same RGB, alpha = 0.5

// Relationships
base.complement();  // 180° rotation
base.analogous();   // [base, +30°, -30°]
base.triadic();     // [base, +120°, +240°]
base.split_complementary();
```

### 3.6 The Consistent Event Contract

Every color-related control — whether it's a bare `Swatch_Grid` or a full `Color_Picker` or a `Theme_Color_Editor` — follows the same event pattern:

```javascript
// All of these work identically:
swatch_grid.on('color-change', handler);
hex_input.on('color-change', handler);
gradient_area.on('color-change', handler);
channel_sliders.on('color-change', handler);
hsl_wheel.on('color-change', handler);
named_colors.on('color-change', handler);
color_picker.on('color-change', handler);

// The handler always receives the same shape:
function handler(e) {
    e.value;       // Color_Value — the new colour
    e.source;      // string — which control raised the event
    e.previous;    // Color_Value — for undo
}
```

This means you can swap one control for another with zero changes to the surrounding code:

```javascript
// Today: a simple swatch grid
let color_control = new Swatch_Grid({ context, palette: 'material' });

// Tomorrow: upgrade to a full picker — no other code changes needed
let color_control = new Color_Picker({ context, variant: 'standard' });

// The listener stays the same either way
color_control.on('color-change', e => {
    widget.style('color', e.value.css);
});
```

---

## Part 4: Palette-Aware Features

### 4.1 Nearest Palette Colour

Given a colour, find the closest match in a palette (useful for snapping or labelling):

```javascript
const { get_palette } = require('jsgui3-html/html-core/palettes');

const arbitrary = Color_Value.from_hex('#2288DD');
const palette = get_palette('crayola');
const nearest = Color_Value.nearest_in_palette(arbitrary, palette);

console.log(nearest.name);      // 'Cerulean'
console.log(nearest.hex);       // '#1DACD6'
console.log(nearest.distance);  // 12.3 (Euclidean in RGB space)
```

### 4.2 Palette Generation

Generate palettes from a base colour:

```javascript
const base = Color_Value.from_hex('#3A86FF');

// Monochromatic — same hue, varying lightness
const mono = base.monochromatic(6);   // 6 shades from light to dark

// Warm/cool split
const warm = base.warm_variant();
const cool = base.cool_variant();

// Material-style shade ramp
const ramp = base.shade_ramp();
// { 50: '#E3F0FF', 100: '#B3D4FF', ... 900: '#0A2B6E' }
```

### 4.3 Palette Previews

The `Swatch_Grid` can render any palette — making it useful as both a picker and a palette visualiser:

```javascript
// As a palette preview strip (non-interactive)
const preview = new Swatch_Grid({
    context,
    palette: 'my_brand',
    grid_size: [4, 1],       // single row, 4 columns
    interactive: false,       // display only, no selection
    show_name: false
});

settings_page.add(preview);  // Shows the 4 brand colours as a strip
```

---

## Summary

| Need | Solution | Lines of Code |
|------|----------|---------------|
| Pick a colour from swatches | `new Swatch_Grid({ palette: 'material' })` | 3 |
| Pick with spectrum + hex | `new Color_Picker({ variant: 'standard' })` | 3 |
| Colour input in a form | `Color_Picker` as `control` in form field | 5 |
| Custom brand palette | `register_palette('brand', [...])` then use by name | 4 |
| Switch palettes at runtime | `grid.palette = 'tailwind'` | 1 |
| Edit theme colours | `new Theme_Color_Editor({ color_map, live_preview: true })` | 5 |
| Compare two colours | Two pickers + `Color_Value.contrast_ratio()` | 10 |
| Generate palette from base | `base.monochromatic(6)` or `base.shade_ramp()` | 1 |

The design philosophy: **simple things should be one line, complex things should be possible, and upgrading from simple to complex should never require rewriting.**
