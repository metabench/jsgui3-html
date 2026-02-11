# Chapter 5: Tabbed Composite Architecture

The `Color_Picker` control combines multiple picker modes into a single tabbed interface. The user switches between modes using the tab bar, and the selected color stays in sync across all modes.

## Architecture Overview

```
┌─ Color_Picker ──────────────────────────────────┐
│                                                  │
│   ┌─ Tabbed_Panel ────────────────────────────┐  │
│   │ [Swatches] [Spectrum] [Sliders] [Hex]     │  │
│   │                                           │  │
│   │  ┌─ Active Tab Content ────────────────┐  │  │
│   │  │                                     │  │  │
│   │  │   (whichever mode is active)        │  │  │
│   │  │                                     │  │  │
│   │  └─────────────────────────────────────┘  │  │
│   └───────────────────────────────────────────┘  │
│                                                  │
│   ┌─ Preview Bar ─────────────────────────────┐  │
│   │  [█ old █ | █ new █]   #3A86FF   Copy 📋 │  │
│   └───────────────────────────────────────────┘  │
│                                                  │
│   ┌─ Alpha Slider (optional) ─────────────────┐  │
│   │  🏁 [■■■■■■■■■■■■░░░░]  100%              │  │
│   └───────────────────────────────────────────┘  │
│                                                  │
│   [Cancel]                          [Apply]      │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Color_Picker
├── Tabbed_Panel
│   ├── Tab: "Swatches"  → Swatch_Grid
│   ├── Tab: "Spectrum"  → Gradient_Area
│   ├── Tab: "Wheel"     → HSL_Wheel
│   ├── Tab: "Sliders"   → Channel_Sliders
│   ├── Tab: "Hex"       → Hex_Input
│   └── Tab: "Named"     → Named_Colors
├── Preview_Bar
│   ├── old_swatch (Control with background-color)
│   ├── new_swatch (Control with background-color)
│   ├── hex_label  (String_Control)
│   └── copy_btn   (Button)
├── Alpha_Slider (Horizontal_Slider, optional)
└── Action_Bar
    ├── cancel_btn (Button)
    └── apply_btn  (Button)
```

## API

### Basic Usage

```javascript
const picker = new Color_Picker({
    context,
    color: Color_Value.from_hex('#3A86FF'),
    size: [360, 420],
    modes: ['swatches', 'spectrum', 'sliders', 'hex'],  // which tabs to show
    default_mode: 'spectrum',
    show_alpha: true,
    show_preview: true,
    show_actions: true            // show Cancel/Apply buttons
});

picker.on('color-change', e => {
    // Fires on every interaction (live preview)
    update_preview(e.value);
});

picker.on('apply', e => {
    // Fires when user clicks Apply
    save_color(e.value);
});

picker.on('cancel', e => {
    // Fires when user clicks Cancel
    revert_color(e.previous);
});
```

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | `Color_Value` | white | Initial color |
| `modes` | `string[]` | all | Which picker tabs to show |
| `default_mode` | `string` | first | Which tab is initially active |
| `show_alpha` | `boolean` | `false` | Show alpha slider below tabs |
| `show_preview` | `boolean` | `true` | Show old/new color preview |
| `show_actions` | `boolean` | `false` | Show Cancel/Apply buttons |
| `palette` | `string\|array` | `'crayola'` | Palette for swatch mode |
| `recent_colors` | `Color_Value[]` | `[]` | Pre-populated recent colors |
| `max_recent` | `number` | `8` | Max recent colors to track |

### Programmatic Control

```javascript
// Get/set the current color
picker.color = Color_Value.from_hsl(180, 60, 50);
const current = picker.color;

// Switch active tab
picker.active_mode = 'sliders';

// Get mode control for direct manipulation
const swatch_ctrl = picker.get_mode('swatches');
```

## Color Synchronisation

The core challenge: when the user picks a color in one mode, all other modes must update to show the same color.

### Data Flow

```
User clicks swatch
    → Swatch_Grid raises 'color-change' with Color_Value
    → Color_Picker receives event
    → Color_Picker updates internal this._color
    → Color_Picker calls set_color() on ALL mode controls
    → Each mode updates its visual state (without raising events)
    → Color_Picker updates Preview_Bar
    → Color_Picker raises its own 'color-change' event upward
```

### Implementation

```javascript
// Inside Color_Picker
_on_mode_color_change(e) {
    const new_color = e.value;
    this._color = new_color;

    // Update all modes except the source
    for (const [name, ctrl] of this._modes) {
        if (name !== e.source) {
            ctrl.color = new_color;    // setter, no event raised
        }
    }

    // Update preview bar
    this._preview_bar.new_color = new_color;

    // Update alpha slider
    if (this._alpha_slider) {
        this._alpha_slider.value = new_color.a * 100;
    }

    // Raise to parent
    this.raise('color-change', {
        value: new_color,
        source: e.source,
        previous: this._previous_color
    });
}
```

### Avoiding Infinite Loops

The key rule: **setting `color` on a mode control must NOT raise a `color-change` event.** Only user interaction raises events.

```javascript
// Inside each mode control
set color(value) {
    this._color = value;
    this._update_visual();         // update DOM, no event
}

// User interaction:
_on_user_click(e) {
    this._color = new_color;
    this._update_visual();
    this.raise('color-change', {   // event only from user action
        value: this._color,
        source: this._type_name
    });
}
```

## Using the Existing Tabbed_Panel

The `Tabbed_Panel` control already supports:

- Multiple tab variants (`default`, `pills`, `card`, `compact`)
- Tab groups with selection management
- `set_active_tab_index()` for programmatic switching
- CSS custom properties for theming

The `Color_Picker` composes a `Tabbed_Panel` and registers each mode as a tab:

```javascript
compose_picker() {
    const tabs_def = [];
    for (const mode_name of this._mode_names) {
        tabs_def.push({
            name: mode_labels[mode_name],
            content: this._create_mode_control(mode_name)
        });
    }

    this._tabbed_panel = new Tabbed_Panel({
        context: this.context,
        tabs: tabs_def,
        variant: 'compact',
        size: [this.size[0], this.size[1] - 80]  // leave room for preview/actions
    });

    this.add(this._tabbed_panel);
}
```

## Preview Bar Design

The preview bar sits below the tabs and shows:

1. **Old color swatch** — the color when the picker was opened
2. **New color swatch** — the currently selected color
3. **Hex label** — current color as `#RRGGBB`
4. **Copy button** — copies hex to clipboard

```javascript
compose_preview_bar() {
    const bar = new Control({ context: this.context, class: 'preview-bar' });

    this._old_swatch = new Control({
        context: this.context,
        class: 'color-swatch old'
    });
    this._old_swatch.style('background-color', this._color.css);

    this._new_swatch = new Control({
        context: this.context,
        class: 'color-swatch new'
    });
    this._new_swatch.style('background-color', this._color.css);

    this._hex_label = new jsgui.String_Control({
        context: this.context,
        text: this._color.hex
    });

    bar.add(this._old_swatch);
    bar.add(this._new_swatch);
    bar.add(this._hex_label);
    this.add(bar);
}
```

## Variants

The `Color_Picker` itself supports variants to cover common use cases:

| Variant | Description | Modes Included |
|---------|-------------|----------------|
| `compact` | Small popup, swatches only | `swatches` |
| `standard` | Spectrum + swatches + hex | `spectrum`, `swatches`, `hex` |
| `full` | All modes | all |
| `developer` | Spectrum + sliders + hex | `spectrum`, `sliders`, `hex` |
| `designer` | Wheel + spectrum + named | `wheel`, `spectrum`, `named` |
| `inline` | No actions bar, emits live | varies |
| `dialog` | With Cancel/Apply buttons | varies |

```javascript
// Quick compact picker
const simple = new Color_Picker({
    context,
    variant: 'compact',
    color: current_color
});

// Full-featured designer picker
const advanced = new Color_Picker({
    context,
    variant: 'designer',
    show_alpha: true,
    show_preview: true
});
```
