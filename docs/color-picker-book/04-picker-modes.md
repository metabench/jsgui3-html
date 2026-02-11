# Chapter 4: Picker Mode Designs

Each picker mode is a standalone jsgui3 control. They can be used independently or composed inside the tabbed `Color_Picker`. Every mode:

- Accepts a `color` property (a `Color_Value` instance)
- Raises `color-change` events with a `Color_Value` when the user picks
- Implements `get_value()` / `set_value()` for programmatic access
- Is SSR-safe (constructs DOM on server, activates on client)

## Mode 1: Swatch Grid (`Swatch_Grid`)

The simplest mode. A grid of colored squares the user clicks to select.

### Visual Layout

```
┌─────────────────────────────────┐
│ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│ [selected: █████ Cerulean]      │
└─────────────────────────────────┘
```

### API

```javascript
const swatches = new Swatch_Grid({
    context,
    palette: 'crayola',           // or 'material', 'tailwind', 'web-safe', or custom array
    grid_size: [12, 12],          // columns × rows
    size: [300, 280],
    show_name: true,              // display color name on hover/select
    show_selected: true           // show selected color preview bar
});

swatches.on('color-change', e => {
    console.log(e.value);         // Color_Value instance
    console.log(e.value.hex);     // '#1DACD6'
    console.log(e.value.name);    // 'Cerulean'
});
```

### Built-in Palettes

| Palette | Colors | Source |
|---------|--------|-------|
| `crayola` | 133 | Existing `arr_colors.js` |
| `material` | 256 | Material Design 2014 |
| `tailwind` | 220 | Tailwind CSS v3 |
| `web-safe` | 216 | The classic 216-color web-safe palette |
| `flat-ui` | 20 | Flat UI Colors |

### Enhancements Over Current `Color_Grid`

- Hover tooltip showing color name and hex value
- Selected cell gets a checkmark or border highlight
- Keyboard navigation (arrow keys, Enter to select)
- ARIA `role="grid"`, `role="gridcell"`, `aria-label` per cell
- Optional search/filter bar above the grid

---

## Mode 2: HSL Wheel (`HSL_Wheel`)

A circular hue wheel with a triangular or rectangular saturation/lightness area inside.

### Visual Layout

```
         ╭──────────╮
       ╱   ╭──────╮   ╲
     ╱    │  S/L   │    ╲
    │     │ area   │     │
    │ HUE │        │ HUE │
    │     │        │     │
     ╲    │        │    ╱
       ╲   ╰──────╯   ╱
         ╰──────────╯
```

### API

```javascript
const wheel = new HSL_Wheel({
    context,
    size: [280, 280],
    wheel_width: 24,              // thickness of the hue ring
    inner_shape: 'square',        // 'square' or 'triangle'
    show_values: true             // display H, S, L numbers
});

wheel.color = Color_Value.from_hsl(220, 80, 50);

wheel.on('color-change', e => {
    console.log(e.value.hsl);     // { h: 220, s: 80, l: 50 }
});
```

### Implementation Notes

- The hue ring is rendered as a conic gradient on a `<canvas>` or using CSS `conic-gradient()`.
- The inner area uses a 2D gradient (saturation horizontal, lightness vertical).
- Dragging on the ring changes hue; dragging inside the area changes S and L.
- A small circle indicator shows the current position on the ring and in the area.

### Canvas vs CSS

| Approach | Pros | Cons |
|----------|------|------|
| Canvas | Pixel-perfect, easy hit testing | Requires `activate()` for drawing, blurry on resize |
| CSS gradients | Resolution-independent, no JS for rendering | Complex clipping for triangle shape, harder hit testing |

**Recommendation:** Use CSS `conic-gradient` for the hue ring (SSR-friendly) and a `<canvas>` for the inner saturation/lightness area (pixel-accurate interaction).

---

## Mode 3: Gradient Area (`Gradient_Area`)

The classic Photoshop-style picker: a 2D saturation-value rectangle with a separate hue slider.

### Visual Layout

```
┌─────────────────────────────┬───┐
│                             │   │
│    Saturation →             │ H │
│                             │ U │
│         ●                   │ E │
│    Brightness               │   │
│    ↓                        │ ▲ │
│                             │   │
│                             │   │
└─────────────────────────────┴───┘
```

### API

```javascript
const gradient = new Gradient_Area({
    context,
    size: [300, 260],
    hue_slider_width: 24,         // width of the vertical hue strip
    show_hex: true                // display hex value overlay
});

gradient.color = Color_Value.from_hex('#3A86FF');

gradient.on('color-change', e => {
    console.log(e.value.hsv);     // { h: 220, s: 77, v: 100 }
});
```

### Implementation Notes

- The main area background is a layered CSS gradient:
  - Layer 1: horizontal white-to-hue gradient
  - Layer 2: vertical transparent-to-black gradient
- The hue slider on the right is a vertical `Horizontal_Slider` rotated, or a custom vertical slider with a hue spectrum background.
- The crosshair indicator tracks the current S/V position.
- Clicking or dragging in the area updates S and V; sliding the hue bar updates H.

---

## Mode 4: Channel Sliders (`Channel_Sliders`)

Three (or four) labeled sliders — one per channel — with numeric input fields.

### Visual Layout

```
┌─────────────────────────────────┐
│  R  [■■■■■■■■■■■░░░░░]  [128]  │
│  G  [■■■■■■■■■■■■■■░░]  [200]  │
│  B  [■■■■■■■■■■■■■■■■]  [255]  │
│  A  [■■■■■■■■■■■■■░░░]  [ 80]  │
│                                 │
│  Mode: (●) RGB  (○) HSL        │
└─────────────────────────────────┘
```

### API

```javascript
const sliders = new Channel_Sliders({
    context,
    mode: 'rgb',                  // 'rgb' or 'hsl'
    show_alpha: true,             // include alpha slider
    size: [300, 180]
});

sliders.color = Color_Value.from_rgb(128, 200, 255, 0.8);

sliders.on('color-change', e => {
    console.log(e.value.rgba);
});
```

### Implementation Notes

- Each slider is a `Horizontal_Slider` with:
  - `min: 0`, `max: 255` (RGB) or `max: 360/100/100` (HSL)
  - A gradient background showing the channel's range at current other-channel values
- The numeric field beside each slider is a `Text_Field` with validation
- A `Radio_Button_Group` toggles between RGB and HSL modes
- Changing mode recalculates slider positions without changing the underlying color

---

## Mode 5: Hex/Text Input (`Hex_Input`)

Direct text entry with format validation and a live preview swatch.

### Visual Layout

```
┌─────────────────────────────────┐
│                                 │
│  Format: [HEX ▾]               │
│                                 │
│  ┌──────────────────┐  ┌────┐  │
│  │ #3A86FF           │  │████│  │
│  └──────────────────┘  └────┘  │
│                                 │
│  Recent:                        │
│  ■ ■ ■ ■ ■ ■ ■ ■              │
└─────────────────────────────────┘
```

### API

```javascript
const hex_input = new Hex_Input({
    context,
    format: 'hex',                // 'hex', 'rgb', 'hsl', 'css'
    show_preview: true,
    show_recent: true,
    max_recent: 8
});

hex_input.color = Color_Value.from_hex('#3A86FF');

hex_input.on('color-change', e => {
    console.log(e.value.hex);     // '#3A86FF'
});
```

### Format Examples

| Format | Example Input | Parsed As |
|--------|---------------|-----------|
| `hex` | `#3A86FF` | `Color_Value.from_hex('#3A86FF')` |
| `rgb` | `31, 117, 254` | `Color_Value.from_rgb(31, 117, 254)` |
| `hsl` | `220, 99%, 56%` | `Color_Value.from_hsl(220, 99, 56)` |
| `css` | `rgba(31,117,254,0.8)` | parsed with regex |

### Implementation Notes

- Input validation runs on each keystroke (with debounce)
- Invalid input shows a red border but doesn't clear the field
- The preview swatch updates live as the user types
- "Recent colors" row tracks the last N selected colors (stored in component state)

---

## Mode 6: Named Colors (`Named_Colors`)

A searchable, categorised list of named colors — useful for quick selection by name.

### Visual Layout

```
┌─────────────────────────────────┐
│  🔍 [Search colors...        ]  │
│                                 │
│  ▾ Blues                        │
│    ■ Cerulean        #1DACD6    │
│    ■ Cornflower      #9ACEEB    │
│    ■ Denim           #2B6CC4    │
│    ■ Navy Blue       #1974D2    │
│                                 │
│  ▾ Reds                         │
│    ■ Brick Red       #CB4154    │
│    ■ Mahogany        #CD4A4C    │
└─────────────────────────────────┘
```

### API

```javascript
const named = new Named_Colors({
    context,
    palette: 'crayola',
    categorise: true,             // group by color family
    show_hex: true,
    searchable: true,
    size: [300, 300]
});

named.on('color-change', e => {
    console.log(e.value.name);    // 'Cerulean'
    console.log(e.value.hex);     // '#1DACD6'
});
```

### Implementation Notes

- Uses a scrollable `List` control internally
- Each item shows a color swatch, the name, and optionally the hex code
- The search field filters by name (case-insensitive substring match)
- Categories are computed by mapping hue ranges to family names
- Extends the existing palette data with automatic categorisation

---

## Shared Behavior Across All Modes

### The `color-change` Event

Every mode raises the same event:

```javascript
{
    type: 'color-change',
    value: Color_Value,           // the new color
    source: 'swatch_grid',       // which mode raised it
    previous: Color_Value         // the previous color (for undo)
}
```

### The `color` Property

Every mode has a `color` getter/setter:

```javascript
// Set externally (e.g., when switching tabs)
mode_control.color = new_color_value;

// Get current value
const current = mode_control.color;
```

Setting the `color` property updates the visual state without raising a `color-change` event (to avoid infinite loops when the parent synchronizes tabs).

### Disabled State

All modes support `disabled = true`:
- Grays out the control
- Prevents interaction
- Sets `aria-disabled="true"`
