# Chapter 6: jsgui3 Implementation Patterns

This chapter maps the designs from Chapters 4–5 to concrete jsgui3 patterns, showing how to use the framework's conventions, mixins, and systems correctly.

## File Organisation

```
html-core/
    color-value.js                    ← Color_Value class (no DOM deps)

controls/organised/0-core/0-basic/
    2-picker/                         ← NEW picker category
        swatch-grid.js
        hsl-wheel.js
        gradient-area.js
        channel-sliders.js
        hex-input.js
        named-colors.js
        color-picker.js               ← tabbed composite

html-core/
    palettes/                         ← NEW palettes folder
        crayola.js                    ← moved from arr_colors.js
        material.js
        tailwind.js
        web-safe.js
        index.js                      ← palette registry
```

## Control Scaffold: The Pattern Every Mode Follows

Each mode control follows the same scaffold, based on the `SKILL.md` pattern:

```javascript
const jsgui = require('path/to/html-core/html-core');
const Control = jsgui.Control;
const { themeable } = require('path/to/control_mixins/themeable');
const Color_Value = require('path/to/html-core/color-value');
const { prop, field } = require('obext');

class Swatch_Grid extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'swatch_grid';
        super(spec);
        this.add_class('swatch-grid');

        // Theme integration
        const params = themeable(this, 'swatch_grid', spec);

        // Internal state
        field(this, '_color', spec.color || Color_Value.from_hex('#FFFFFF'));
        prop(this, 'palette', spec.palette || 'crayola');
        prop(this, 'grid_size', spec.grid_size || [12, 12]);

        // SSR-safe composition
        if (!spec.abstract && !spec.el) {
            this._compose(params);
        }
    }

    _compose(params) {
        // Build sub-controls here — runs on server
    }

    activate() {
        if (this.__activated) return;
        this.__activated = true;
        super.activate();
        // DOM event wiring here — client only
    }

    // --- Color API (consistent across all modes) ---

    get color() { return this._color; }
    set color(value) {
        this._color = value;
        this._update_visual();
    }

    get_value() { return this._color; }
    set_value(v) { this.color = v; }

    _update_visual() {
        // Update DOM to reflect current color — no events raised
    }
}

Swatch_Grid.css = `
.swatch-grid {
    /* CSS custom properties for theming */
    --swatch-size: var(--swatch-grid-swatch-size, 20px);
    --swatch-gap: var(--swatch-grid-gap, 2px);
    --swatch-border-radius: var(--swatch-grid-radius, 2px);
}
`;

module.exports = Swatch_Grid;
```

## Key jsgui3 Patterns Used

### 1. The `_ctrl_fields` Pattern

jsgui3 uses `_ctrl_fields` to track named child controls for SSR hydration:

```javascript
_compose(params) {
    const grid = new Grid({
        context: this.context,
        grid_size: this.grid_size,
        cell_selection: 'single'
    });
    this.add(grid);

    this._ctrl_fields = this._ctrl_fields || {};
    this._ctrl_fields.grid = grid;
}
```

On the client, after SSR, `activate()` can access `this.grid` because the framework resolves `_ctrl_fields`.

### 2. The `raise()` / `on()` Event System

All controls use `raise()` to emit events and `on()` to listen:

```javascript
// In the mode control (child)
this.raise('color-change', {
    value: new_color,
    source: 'swatch_grid',
    previous: old_color
});

// In Color_Picker (parent)
swatch_grid.on('color-change', e => {
    this._on_mode_color_change(e);
});
```

### 3. The Activation Guard

Prevent double-activation using the pattern from LESSONS.md:

```javascript
activate() {
    if (this.__activated) return;
    this.__activated = true;
    super.activate();
    // ... wire DOM events
}
```

### 4. The `themeable` Mixin

Integrates with the theme system to resolve variant-specific parameters:

```javascript
// In constructor
const params = themeable(this, 'swatch_grid', spec);
// params now contains resolved size, variant, colors etc.

// Use params in _compose()
if (params.size === 'compact') {
    this.grid_size = [8, 4];
}
```

### 5. Composition Over Inheritance

The `Color_Picker` composite **composes** mode controls and a `Tabbed_Panel`:

```javascript
// ✅ Correct: composition
class Color_Picker extends Control {
    _compose() {
        this._tabbed_panel = new Tabbed_Panel({ ... });
        this._swatch_grid = new Swatch_Grid({ ... });
        this._gradient_area = new Gradient_Area({ ... });
        this.add(this._tabbed_panel);
    }
}

// ❌ Wrong: inheritance
class Color_Picker extends Tabbed_Panel { ... }
```

### 6. The `changes()` Reactive Pattern

React to property changes using the `changes()` method from `obext`:

```javascript
constructor(spec) {
    // ...
    this.changes({
        palette: v => {
            // Re-render swatches when palette changes
            if (!spec.el) {
                this._rebuild_grid();
            }
        }
    });
}
```

## Canvas Controls: Special Handling

The `HSL_Wheel` and `Gradient_Area` modes require `<canvas>` elements for pixel-perfect rendering and hit testing.

### SSR Strategy for Canvas Controls

Since `<canvas>` cannot render content on the server, use a placeholder:

```javascript
_compose(params) {
    // On the server, create a placeholder div
    const canvas_wrapper = new Control({
        context: this.context,
        class: 'canvas-wrapper'
    });
    canvas_wrapper.style('width', this.size[0] + 'px');
    canvas_wrapper.style('height', this.size[1] + 'px');
    canvas_wrapper.style('background-color', '#333');  // placeholder
    this.add(canvas_wrapper);
    this._ctrl_fields = this._ctrl_fields || {};
    this._ctrl_fields.canvas_wrapper = canvas_wrapper;
}

activate() {
    if (this.__activated) return;
    this.__activated = true;
    super.activate();

    // On the client, insert an actual canvas element
    const el = this.canvas_wrapper.dom.el;
    const canvas = document.createElement('canvas');
    canvas.width = el.offsetWidth;
    canvas.height = el.offsetHeight;
    el.appendChild(canvas);
    this._ctx = canvas.getContext('2d');
    this._draw();
}
```

### Drawing the Hue Ring (HSL_Wheel)

```javascript
_draw_hue_ring() {
    const { _ctx: ctx, _center, _outer_radius, _inner_radius } = this;
    for (let angle = 0; angle < 360; angle++) {
        const rad = (angle - 90) * Math.PI / 180;
        const rad_next = (angle - 89) * Math.PI / 180;
        ctx.beginPath();
        ctx.arc(_center[0], _center[1], _outer_radius, rad, rad_next);
        ctx.arc(_center[0], _center[1], _inner_radius, rad_next, rad, true);
        ctx.closePath();
        ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
        ctx.fill();
    }
}
```

### Hit Testing in Canvas Controls

When the user clicks the canvas, determine which region was hit:

```javascript
_handle_canvas_click(e) {
    const rect = this._canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - this._center[0];
    const dy = y - this._center[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= this._inner_radius && distance <= this._outer_radius) {
        // Click on the hue ring
        const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
        this._set_hue(Math.round(angle));
    } else if (distance < this._inner_radius) {
        // Click inside the S/L area
        this._handle_sl_pick(x, y);
    }
}
```

## CSS Architecture

### Static CSS on the Class

Each control defines its base styles as a static property:

```javascript
Swatch_Grid.css = `
.swatch-grid {
    display: inline-block;
    padding: var(--swatch-grid-padding, 4px);
}
.swatch-grid .cell {
    width: var(--swatch-grid-swatch-size, 20px);
    height: var(--swatch-grid-swatch-size, 20px);
    border-radius: var(--swatch-grid-radius, 2px);
    cursor: pointer;
    transition: transform 0.1s ease;
}
.swatch-grid .cell:hover {
    transform: scale(1.2);
    z-index: 1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.swatch-grid .cell.selected {
    outline: 2px solid var(--swatch-grid-selection-color, #fff);
    outline-offset: 1px;
    box-shadow: 0 0 0 3px var(--swatch-grid-focus-ring, #1F75FE);
}
`;
```

### Theme Token Maps

Register size tokens so themes can override:

```javascript
// In themes/token_maps.js
const SIZE_TOKENS = {
    // ... existing
    swatch_grid: {
        small:  { '--swatch-grid-swatch-size': '14px', '--swatch-grid-gap': '1px' },
        medium: { '--swatch-grid-swatch-size': '20px', '--swatch-grid-gap': '2px' },
        large:  { '--swatch-grid-swatch-size': '28px', '--swatch-grid-gap': '3px' }
    },
    color_picker: {
        compact:  { '--color-picker-width': '240px', '--color-picker-height': '280px' },
        standard: { '--color-picker-width': '320px', '--color-picker-height': '380px' },
        large:    { '--color-picker-width': '400px', '--color-picker-height': '480px' }
    }
};
```

## Registering Controls

### Variant Registration

In `themes/variants.js`:

```javascript
const swatch_grid_variants = {
    'default': { size: 'medium', palette: 'crayola', grid_size: [12, 12] },
    'compact': { size: 'small', palette: 'material', grid_size: [10, 5] },
    'expanded': { size: 'large', palette: 'crayola', grid_size: [16, 10] }
};

const color_picker_variants = {
    'compact':    { modes: ['swatches'], show_alpha: false, show_actions: false },
    'standard':   { modes: ['spectrum', 'swatches', 'hex'], show_alpha: false },
    'full':       { modes: ['swatches', 'spectrum', 'wheel', 'sliders', 'hex', 'named'], show_alpha: true },
    'developer':  { modes: ['spectrum', 'sliders', 'hex'], show_alpha: true },
    'designer':   { modes: ['wheel', 'spectrum', 'named'], show_alpha: true }
};
```

### Export in Controls Index

Add to the appropriate controls index so they're discoverable:

```javascript
// controls/organised/0-core/0-basic/2-picker/index.js
module.exports = {
    Swatch_Grid: require('./swatch-grid'),
    HSL_Wheel: require('./hsl-wheel'),
    Gradient_Area: require('./gradient-area'),
    Channel_Sliders: require('./channel-sliders'),
    Hex_Input: require('./hex-input'),
    Named_Colors: require('./named-colors'),
    Color_Picker: require('./color-picker')
};
```
