# Chapter 2: Current State Assessment

## Existing Color-Related Code

The jsgui3-html codebase currently contains three files directly related to color picking:

### `color-grid.js` — The Grid of Colored Cells

**Location:** `controls/organised/0-core/0-basic/1-compositional/color-grid.js`

`Color_Grid` extends `Grid` and displays a rectangular array of colored cells. Users click a cell to select a color.

**What it does:**
- Accepts a `palette` array (objects with `.hex` or plain strings)
- Accepts a `grid_size` (e.g., `[12, 12]`)
- Creates a `Grid` with `cell_selection: 'single'`
- Iterates over cells and sets `cell.color` from the palette
- Raises `choose-color` event with the selected color when a cell is clicked via the grid's `selection_scope`
- Supports `resize` events by recalculating grid cell sizes

**What it doesn't do:**
- No hover preview
- No tooltip showing color name/hex
- No search or filter
- No "recently used" tracking
- No keyboard navigation for cell selection
- No accessibility attributes (ARIA labels, roles)

### `color-palette.js` — The Palette Wrapper

**Location:** `controls/organised/0-core/0-basic/1-compositional/color-palette.js`

`Color_Palette` wraps a `Color_Grid` and adds a small 2×1 foreground/background color indicator grid at the top.

**What it does:**
- Defaults to the Crayola palette (133 named colors from `arr_colors.js`)
- Creates an 80×40px foreground/background indicator (`fg_bg_color_grid`)
- Creates a main `Color_Grid` with configurable `grid_size` (default `[12, 12]`)
- Raises `choose-color` on cell selection
- Tracks `_ctrl_fields` for `color_grid` and `fg_bg_color_grid`

**What it doesn't do:**
- Doesn't actually update the fg/bg indicator when a color is chosen
- No visual differentiation between foreground and background slots
- No toggle between fg/bg selection
- No theme integration via `themeable` mixin
- No CSS custom properties

### `arr_colors.js` — The Crayola Palette

**Location:** `html-core/arr_colors.js`

A static array of 133 Crayola crayon colors, each with `hex`, `name`, and `rgb` string fields.

**Example entry:**
```javascript
{
    "hex": "#1F75FE",
    "name": "Blue",
    "rgb": "(31, 117, 254)"
}
```

**Strengths:**
- Good variety of named, recognisable colors
- Clean data structure

**Weaknesses:**
- The `rgb` field is a string, not an array — requires parsing
- Only one palette is available (no Material Design, Tailwind, web-safe, etc.)
- No categorisation (warm, cool, neutral, etc.)

### `color-grid copy.js` — A Stale Duplicate

An older copy of `color-grid.js` that extends `Control` directly instead of `Grid`. This should be deleted as part of cleanup — it creates confusion.

## Related Controls That Already Exist

Several existing controls are directly relevant as building blocks:

| Control | File | Relevance |
|---------|------|-----------|
| `Grid` | `1-compositional/grid.js` | Base for `Color_Grid`, provides cell layout and selection |
| `Cell` | `1-compositional/Cell.js` | Individual grid cell with color support |
| `Tabbed_Panel` | `1-standard/6-layout/tabbed-panel.js` | Will host the multi-mode picker tabs |
| `Horizontal_Slider` | `1-standard/5-ui/horizontal-slider.js` | Min/max/value slider for channel controls |
| `Stepped_Slider` | `1-compositional/stepped_slider.js` | Discrete-step slider variant |
| `Text_Field` | `1-compositional/Text_Field.js` | Text input for hex/RGB/HSL entry |
| `Toggle_Button` | `1-compositional/toggle-button.js` | For fg/bg or mode toggles |

## Test Coverage

**There are no tests for any color-related controls.** The `test/controls/` directory contains tests for buttons, charts, context menus, dropdowns, inputs, lists, panels, and windows — but nothing for `Color_Grid`, `Color_Palette`, or any color utility.

This is a significant gap. Even the basic swatch-selection flow is untested.

## Feature Completeness Score

Using the quality framework from `controls_expansion_ideas.md`:

| Criterion | Status | Score |
|-----------|--------|-------|
| Constructor handles all spec properties | Partial | 2/5 |
| Type name set correctly | ✅ | 5/5 |
| CSS classes follow naming convention | ✅ | 5/5 |
| Composition is complete | Partial | 2/5 |
| Activation wires all events | Partial | 3/5 |
| Value get/set works correctly | ❌ No `get_value()`/`set_value()` | 0/5 |
| Disabled state handled | ❌ | 0/5 |
| Cleanup/destroy method | ❌ | 0/5 |
| Theme integration (`themeable`) | ❌ | 0/5 |
| Documentation | ❌ | 0/5 |
| Unit tests | ❌ | 0/5 |
| Accessibility (ARIA, keyboard) | ❌ | 0/5 |

**Overall: Tier 3 (Alpha/Experimental) — approximately 15% complete** relative to a production-ready color picker.

## Summary of Gaps

To reach the vision described in Chapter 1, we need:

1. **Color value model** — Normalised object with RGB, HSL, HSV, hex conversions
2. **Multiple picker modes** — Not just swatches, but spectrum, sliders, text input
3. **Tabbed composite** — Using `Tabbed_Panel` to switch between modes
4. **Theme integration** — `themeable` mixin, CSS custom properties, variant support
5. **Accessibility** — ARIA attributes, keyboard navigation, announcements
6. **Value API** — Proper `get_value()` / `set_value()` / `color` property
7. **Event normalisation** — All modes emit a consistent `color-change` event
8. **Tests** — Unit, integration, and visual regression tests
9. **Documentation** — JSDoc, usage examples, API reference
10. **Additional palettes** — Material, Tailwind, web-safe, custom
