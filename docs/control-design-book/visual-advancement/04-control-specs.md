# Chapter 4: Control-by-Control Transformation Specs

> The definitive spec sheet for every major control in jsgui3-html:  
> what it looks like today, what it should look like, and the exact CSS.

---

## 4.1 How to Read Each Spec

Each control entry follows this format:

| Field | Description |
|-------|-------------|
| **Source file** | Path to the control's JS implementation |
| **Current CSS** | Summary of existing inline `.css` property |
| **Target class** | The CSS class name to use in the component layer |
| **JS change** | What to add to the constructor |
| **CSS spec** | Complete component CSS — copy-paste ready |
| **Token map** | Which tokens from `token_maps.js` apply |
| **Variants** | Available variant presets from `variants.js` |

---

## 4.2 Button

**Source:** `controls/organised/0-core/0-basic/0-native-compositional/button.js`  
**Current CSS:** Has theming via `themeable()` + `apply_token_map()`. Has variant data-attrs. Missing component CSS that consumes them.  
**Target class:** `.jsgui-button`

### JS change needed

Already calls `themeable()` — just ensure the class is `jsgui-button`:

```javascript
this.add_class('jsgui-button');
```

### CSS Spec

```css
.jsgui-button {
    display: inline-flex; align-items: center; justify-content: center;
    gap: var(--btn-gap, 6px);
    height: var(--btn-height, 36px);
    padding: 0 var(--btn-padding-x, 16px);
    font: 500 var(--btn-font-size, 0.875rem)/1 var(--j-font-sans);
    letter-spacing: 0.01em;
    border-radius: var(--btn-border-radius, var(--j-radius-md));
    border: 1px solid transparent;
    cursor: pointer;
    user-select: none;
    transition: background 120ms ease-out, box-shadow 120ms ease-out, transform 80ms ease-out;
}
.jsgui-button:active { transform: scale(0.97); }
.jsgui-button:focus-visible { outline: 2px solid var(--j-primary); outline-offset: 2px; }
.jsgui-button:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

/* ── Variants ── */
.jsgui-button[data-variant="primary"] {
    background: var(--j-primary); color: var(--j-primary-fg);
}
.jsgui-button[data-variant="primary"]:hover {
    background: var(--j-primary-hover);
    box-shadow: 0 4px 14px color-mix(in srgb, var(--j-primary) 30%, transparent);
    transform: translateY(-1px);
}

.jsgui-button[data-variant="secondary"],
.jsgui-button:not([data-variant]) {
    background: var(--j-bg-muted); color: var(--j-fg); border-color: var(--j-border);
}
.jsgui-button[data-variant="secondary"]:hover,
.jsgui-button:not([data-variant]):hover {
    background: var(--j-bg-subtle); border-color: var(--j-border-strong);
}

.jsgui-button[data-variant="ghost"] {
    background: transparent; color: var(--j-fg);
}
.jsgui-button[data-variant="ghost"]:hover {
    background: var(--j-bg-muted);
}

.jsgui-button[data-variant="danger"] {
    background: var(--j-danger); color: white;
}
.jsgui-button[data-variant="danger"]:hover {
    box-shadow: 0 4px 14px color-mix(in srgb, var(--j-danger) 30%, transparent);
}

.jsgui-button[data-variant="outline"] {
    background: transparent; color: var(--j-primary); border-color: var(--j-primary);
}
.jsgui-button[data-variant="outline"]:hover {
    background: color-mix(in srgb, var(--j-primary) 8%, transparent);
}

.jsgui-button[data-variant="link"] {
    background: transparent; color: var(--j-primary);
    border: none; padding: 0; height: auto; text-decoration: underline;
}
```

### Token map coverage

| Token | Small | Medium | Large | XLarge |
|-------|-------|--------|-------|--------|
| `--btn-height` | 28px | 36px | 44px | 56px |
| `--btn-padding-x` | 12px | 16px | 20px | 28px |
| `--btn-font-size` | 12px | 14px | 16px | 18px |
| `--btn-border-radius` | 4px | 6px | 8px | 12px |

---

## 4.3 Text Input

**Source:** `controls/organised/0-core/0-basic/0-native-compositional/Text_Input.js`  
**Target class:** `.jsgui-input`

### CSS Spec

```css
.jsgui-input {
    display: block; width: 100%;
    height: var(--input-height, 40px);
    padding: 0 var(--input-padding-x, 12px);
    font: 400 var(--input-font-size, 0.875rem)/1.5 var(--j-font-sans);
    color: var(--j-fg);
    background: var(--j-bg);
    border: 1px solid var(--j-border);
    border-radius: var(--input-border-radius, var(--j-radius-md));
    transition: border-color 120ms ease-out, box-shadow 120ms ease-out;
}
.jsgui-input::placeholder { color: var(--j-fg-subtle); }
.jsgui-input:hover { border-color: var(--j-border-strong); }
.jsgui-input:focus { border-color: var(--j-primary); box-shadow: var(--j-focus-ring); outline: none; }
.jsgui-input:disabled { background: var(--j-bg-muted); color: var(--j-fg-subtle); cursor: not-allowed; }
.jsgui-input[aria-invalid="true"] { border-color: var(--j-danger); }

/* Fill style variants */
.jsgui-input[data-fill-style="filled"] {
    background: var(--j-bg-muted); border-color: transparent;
}
.jsgui-input[data-fill-style="underline"] {
    border: none; border-bottom: 2px solid var(--j-border);
    border-radius: 0; padding-left: 0;
}
.jsgui-input[data-fill-style="underline"]:focus {
    border-bottom-color: var(--j-primary);
}
```

---

## 4.4 Toggle Switch

**Source:** `controls/organised/0-core/0-basic/1-compositional/toggle_switch.js`  
**Current CSS:** 28 lines, hardcoded `#bbb`, no states.  
**Target class:** `.jsgui-toggle`

### JS change needed

```javascript
// In constructor, add:
const params = themeable(this, 'toggle_switch', spec, {
    defaults: { size: 'medium' }
});
this.add_class('jsgui-toggle');
```

### CSS Spec

```css
.jsgui-toggle { display: inline-flex; align-items: center; gap: var(--j-space-2); cursor: pointer; }
.jsgui-toggle-track {
    position: relative; width: 44px; height: 24px;
    border-radius: var(--j-radius-full);
    background: var(--j-bg-muted); border: 2px solid var(--j-border);
    transition: background 200ms ease-out, border-color 200ms ease-out;
}
.jsgui-toggle-thumb {
    position: absolute; top: 1px; left: 1px;
    width: 18px; height: 18px; border-radius: 50%;
    background: white; box-shadow: var(--j-shadow-sm);
    transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.jsgui-toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }

/* ON */
.jsgui-toggle-input:checked ~ .jsgui-toggle-track {
    background: var(--j-primary); border-color: var(--j-primary);
}
.jsgui-toggle-input:checked ~ .jsgui-toggle-track .jsgui-toggle-thumb {
    transform: translateX(20px);
}

/* Hover */
.jsgui-toggle:hover .jsgui-toggle-track {
    border-color: var(--j-border-strong);
}

/* Focus */
.jsgui-toggle-input:focus-visible ~ .jsgui-toggle-track {
    box-shadow: var(--j-focus-ring);
}

/* Disabled */
.jsgui-toggle[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

/* Label */
.jsgui-toggle-label { font: 400 var(--j-text-sm)/1.4 var(--j-font-sans); color: var(--j-fg); }
```

---

## 4.5 Panel

**Source:** `controls/organised/0-core/0-basic/1-compositional/panel.js`  
**Target class:** `.jsgui-panel`

### CSS Spec

```css
.jsgui-panel {
    padding: var(--panel-padding, var(--j-space-4));
    background: var(--j-bg);
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow, none);
    color: var(--j-fg);
}

/* Variant: card */
.jsgui-panel[data-variant="card"] {
    background: var(--j-bg-elevated);
    border: 1px solid var(--j-border);
    border-radius: var(--j-radius-lg);
    box-shadow: var(--j-shadow-sm);
}

/* Variant: elevated */
.jsgui-panel[data-variant="elevated"] {
    border-radius: var(--j-radius-lg);
    box-shadow: var(--j-shadow-lg);
}

/* Variant: well (sunken) */
.jsgui-panel[data-variant="well"] {
    background: var(--j-bg-subtle);
    border: 1px solid var(--j-border);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
    border-radius: var(--j-radius-sm);
}

/* Variant: glass */
.jsgui-panel[data-variant="glass"] {
    background: color-mix(in srgb, var(--j-bg) 70%, transparent);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid color-mix(in srgb, var(--j-border) 50%, transparent);
    border-radius: var(--j-radius-lg);
    box-shadow: var(--j-shadow-md);
}
```

---

## 4.6 Data Table

**Source:** `controls/organised/1-standard/4-data/data_table.js`  
**Current CSS:** 12 lines, hardcoded borders, no states.  
**Target class:** `.jsgui-table`

### CSS Spec

```css
.jsgui-table { width: 100%; border-collapse: collapse; font-family: var(--j-font-sans); }
.jsgui-table-header {
    text-align: left; font-weight: 600; font-size: var(--j-text-sm);
    color: var(--j-fg-muted); letter-spacing: 0.03em; text-transform: uppercase;
    padding: var(--j-space-2) var(--j-space-3);
    border-bottom: 2px solid var(--j-border);
}
.jsgui-table-header.is-sortable { cursor: pointer; user-select: none; }
.jsgui-table-header.is-sortable:hover { color: var(--j-fg); }

.jsgui-table-row {
    border-bottom: 1px solid var(--j-border);
    transition: background 100ms ease-out;
}
.jsgui-table-row:hover { background: color-mix(in srgb, var(--j-primary) 4%, var(--j-bg)); }
.jsgui-table-row[aria-selected="true"] {
    background: color-mix(in srgb, var(--j-primary) 10%, var(--j-bg));
}

.jsgui-table-cell {
    padding: var(--j-space-2) var(--j-space-3);
    font-size: var(--j-text-sm); color: var(--j-fg);
}

/* Zebra striping (opt-in) */
.jsgui-table[data-striped] .jsgui-table-row:nth-child(even) {
    background: var(--j-bg-subtle);
}
```

---

## 4.7 Combo Box

**Source:** `controls/organised/0-core/0-basic/1-compositional/combo-box.js`  
**Target class:** `.jsgui-combo-box`

### CSS Spec

```css
.jsgui-combo-box { position: relative; display: inline-block; min-width: 200px; }

.jsgui-combo-box-dropdown {
    position: absolute; left: 0; right: 0; top: calc(100% + 4px);
    background: var(--j-bg-elevated);
    border: 1px solid var(--j-border);
    border-radius: var(--j-radius-md);
    box-shadow: var(--j-shadow-lg);
    max-height: 240px; overflow-y: auto;
    z-index: 50;
    opacity: 0; transform: translateY(-4px);
    transition: opacity 150ms ease-out, transform 150ms ease-out;
    pointer-events: none;
}
.jsgui-combo-box[data-open="true"] .jsgui-combo-box-dropdown {
    opacity: 1; transform: translateY(0); pointer-events: auto;
}

.jsgui-combo-box-item {
    padding: var(--j-space-2) var(--j-space-3);
    font-size: var(--j-text-sm); color: var(--j-fg);
    cursor: pointer;
    transition: background 80ms ease-out;
}
.jsgui-combo-box-item:hover { background: var(--j-bg-muted); }
.jsgui-combo-box-item[aria-selected="true"] {
    background: color-mix(in srgb, var(--j-primary) 10%, var(--j-bg));
    color: var(--j-primary);
}
```

---

## 4.8 Horizontal Slider

**Source:** `controls/organised/1-standard/5-ui/horizontal-slider.js`  
**Current CSS:** None. Zero. The control has no visual definition at all.  
**Target class:** `.jsgui-slider`

### JS change needed

This control needs the most work. It must:
1. Add `themeable()` call
2. Use semantic class names instead of `.h-bar` / `.v-bar`
3. Remove inline position calculations in favour of CSS/percentage-based positioning

### CSS Spec

```css
.jsgui-slider { position: relative; width: 100%; height: 24px; display: flex; align-items: center; }
.jsgui-slider-track {
    position: absolute; left: 0; right: 0; height: 6px;
    border-radius: var(--j-radius-full);
    background: var(--j-bg-muted);
}
.jsgui-slider-fill {
    position: absolute; left: 0; height: 6px;
    border-radius: var(--j-radius-full);
    background: var(--j-primary);
}
.jsgui-slider-thumb {
    position: absolute; top: 50%; transform: translate(-50%, -50%);
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--j-primary);
    box-shadow: var(--j-shadow-sm);
    cursor: grab;
    transition: transform 80ms ease-out, box-shadow 80ms ease-out;
}
.jsgui-slider-thumb:hover {
    transform: translate(-50%, -50%) scale(1.2);
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--j-primary) 12%, transparent);
}
.jsgui-slider-thumb:active {
    cursor: grabbing;
    transform: translate(-50%, -50%) scale(1.3);
    box-shadow: 0 0 0 12px color-mix(in srgb, var(--j-primary) 20%, transparent);
}
.jsgui-slider:focus-visible .jsgui-slider-thumb {
    box-shadow: var(--j-focus-ring);
}
.jsgui-slider[aria-disabled="true"] { opacity: 0.4; pointer-events: none; }
```

---

## 4.9 Additional Controls (Summary Table)

| Control | Target Class | Key CSS Features Needed |
|---------|-------------|------------------------|
| Checkbox | `.jsgui-checkbox` | Custom check mark (SVG or CSS), checked/indeterminate states, spring animation on toggle |
| Radio | `.jsgui-radio` | Custom dot indicator, group management, scale animation on select |
| Tabbed_Panel | `.jsgui-tabs` | Animated underline indicator, tab position (top/bottom/left/right), pill variant |
| Menu | `.jsgui-menu` | Horizontal/vertical layout, active indicator (underline/bg/border), hover highlight |
| Context_Menu | `.jsgui-context-menu` | Shadow, fade-in animation, keyboard-highlighted item, separator lines |
| Dropdown_Menu | `.jsgui-dropdown` | Chevron rotation on open, dropdown shadow + animation, selected item check |
| Window | `.jsgui-window` | Title bar gradient/flat, button styles (traffic-light/segoe/icons), resize handles |
| Badge | `.jsgui-badge` | Colour variants (primary/success/warning/danger), pill shape, pulse animation |
| Spinner | `.jsgui-spinner` | Rotating ring animation, size variants, colour matching parent |
| Progress | `.jsgui-progress` | Animated fill bar, striped variant, indeterminate shimmer |
| Toast | `.jsgui-toast` | Slide-in animation, auto-dismiss timer bar, type variants (info/success/error/warning) |
| Skeleton | `.jsgui-skeleton` | Shimmer animation, rounded shape variants (text/circle/rect) |

Each of these needs the full 5-state treatment described in Chapter 3.

---

**Next:** [Chapter 5 — Typography, Spacing & The 8px Grid](./05-typography-spacing.md)
