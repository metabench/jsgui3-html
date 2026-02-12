# Chapter 5: Control-by-Control Design Guide

> A comprehensive inventory of every control in jsgui3-html, with current status,  
> visual mode support, design specifications, and detailed improvement plans for each.

---

## 5.1 Control Quality Tiers

As controls are improved, they advance through quality tiers:

| Tier | Name | Requirements |
|------|------|-------------|
| **T0 — Stub** | Exists in code, renders something, but lacks styling and states | Has constructor and basic DOM output |
| **T1 — Functional** | Works correctly with one visual mode, has click/change events | At least normal + disabled states |
| **T2 — Styled** | Multiple visual modes, proper hover/active/focus states | At least 3 states, 2+ variants |
| **T3 — Polished** | Micro-animations, colored shadows, full keyboard navigation | 5+ states, animations, ARIA |
| **T4 — World-Class** | Virtual rendering, gesture support, custom cursor, perfect accessibility | All interactions, all modes, all screen sizes |

---

## 5.2 Atomic Controls (Leaves)

These controls have no child controls. They are the building blocks:

### Button

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/0-atomic/button.js` |
| **Tier** | T2 | T4 |
| **Variants** | filled, ghost, vs-classic | filled, ghost, outline, link, vs-classic, vs-toolbar, glass, neumorphic |
| **States** | normal, hover, active, disabled | normal, hover, active, focus, disabled, loading |
| **ARIA** | `role="button"` | + `aria-disabled`, `aria-pressed` (toggle) |
| **Keyboard** | Enter, Space | No changes needed |
| **Animation** | Basic color transition | Hover lift, active press, loading spinner, focus ring fade |

**Design details:**

The button is the single most important control to get right. It sets the aesthetic baseline for the entire library. When a developer evaluates a UI framework, the first thing they look at is the button.

Current variants:

```
filled   → solid gradient background, white/light text, default for CTAs
ghost    → transparent background, accent text, border on hover
vs-classic → Win32 beveled 3D style with ButtonFace gray
```

Missing variants to add:

```
outline  → transparent background, accent border, accent text always visible
link     → looks like a hyperlink, underline on hover, no background
icon     → square button with icon only, no text, tooltip on hover
pill     → extra border-radius (fully rounded ends)
danger   → red background for destructive actions
toolbar  → compact, flat, icon-centric (like VS toolbar buttons)
```

Each variant needs a **full state matrix:**

```
                Normal    Hover     Active    Focus     Disabled
filled          ●         ●         ●         ●         ●
ghost           ●         ●         ●         ●         ●
outline         ●         ●         ●         ●         ●
link            ●         ●         ●         ●         ●
icon            ●         ●         ●         ●         ●
pill            ●         ●         ●         ●         ●
danger          ●         ●         ●         ●         ●
vs-classic      ●         ●         ●         ●         ●
toolbar         ●         ●         ●         ●         ●
```

That's 9 variants × 5 states = **45 visual states** for the button alone.

**Sizing system:**

| Size | Height | Padding | Font Size | Icon Size | Border Radius |
|------|--------|---------|-----------|-----------|---------------|
| `xs` | 24px | 4px 8px | 11px | 14px | 4px |
| `sm` | 28px | 6px 12px | 12px | 16px | 5px |
| `md` | 32px | 8px 16px | 14px | 18px | 6px |
| `lg` | 40px | 10px 20px | 16px | 20px | 8px |
| `xl` | 48px | 12px 24px | 18px | 22px | 10px |

---

### Checkbox

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/0-atomic/checkbox.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, card, win32, switch |
| **States** | checked, unchecked | checked, unchecked, indeterminate, disabled |
| **ARIA** | Partial | `role="checkbox"`, `aria-checked="true|false|mixed"` |
| **Keyboard** | Space | No changes needed |
| **Animation** | None | Check mark draw-in (SVG stroke animation), color transition |

**Design details:**

The checkbox needs an **indeterminate** state (horizontal dash) for tree-selection scenarios where some children are checked and some are not.

Visual recipe for check mark animation:

```css
/* SVG check mark that draws itself */
.checkbox-mark {
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    transition: stroke-dashoffset 200ms ease;
}

.checkbox[aria-checked="true"] .checkbox-mark {
    stroke-dashoffset: 0;  /* Draws the check */
}
```

The `card` variant wraps the checkbox in a clickable card:

```
┌──────────────────────┐        ┌──────────────────────┐
│ ☐  Option A          │        │ ☑  Option A          │
│    Description text   │  →    │    Description text   │
└──────────────────────┘        └──────────────────────┘
     (unchecked card)                (checked card, highlighted border)
```

---

### Radio Button

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/0-atomic/radio.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, card, win32, segmented |
| **States** | selected, unselected | selected, unselected, disabled, focus |
| **ARIA** | Partial | `role="radio"`, `aria-checked`, group with `role="radiogroup"` |
| **Keyboard** | Arrow Up/Down | Arrow Left/Right too, Home/End |
| **Animation** | None | Inner circle scale-in, color transition |

**The segmented variant** transforms radios into a segmented control (like iOS):

```
[  Option A  |  Option B  |  Option C  ]
    active       inactive     inactive
```

---

### Text Field / Input

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/0-atomic/text-input.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, outlined, filled, floating-label, win32-sunken |
| **States** | normal, focused | normal, hover, focused, error, disabled, readonly |
| **ARIA** | Minimal | `aria-invalid`, `aria-describedby` (for error message), `aria-required` |
| **Keyboard** | Standard text | No changes needed |
| **Animation** | None | Focus border transition, floating label rise, error shake |

**The floating-label variant** has a label that starts inside the field and floats up on focus:

```
Before focus:              After focus:
┌────────────────────┐     ┌──── Email ──────────┐
│  Email...          │  →  │  user@example.com    │
└────────────────────┘     └─────────────────────┘
```

CSS technique for the floating label:

```css
.floating-label {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--text-tertiary);
    pointer-events: none;
    transition: all 200ms ease;
}

.input:focus + .floating-label,
.input:not(:placeholder-shown) + .floating-label {
    top: 6px;
    transform: translateY(0);
    font-size: 11px;
    color: var(--theme-color-primary);
}
```

---

### Slider / Range

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/0-atomic/slider.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, thin, thick, range (two thumbs), stepped |
| **States** | normal | normal, hover (thumb enlarges), active (thumb pressed), disabled |
| **ARIA** | Minimal | `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-orientation` |
| **Keyboard** | None | Arrow keys (step), Page Up/Down (10 steps), Home/End (min/max) |
| **Animation** | None | Thumb scale on hover, tooltip appears with value, track fill transition |

**Tooltip-on-drag pattern:**

When the user drags the slider thumb, a tooltip appears above showing the current value. The tooltip follows the thumb position using CSS `--value` custom property:

```css
.slider-tooltip {
    position: absolute;
    bottom: 100%;
    left: calc(var(--value) * 100%);
    transform: translateX(-50%) translateY(-8px);
    opacity: 0;
    transition: opacity 150ms ease, transform 150ms ease;
}

.slider:active .slider-tooltip,
.slider:focus .slider-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(-12px);
}
```

---

### Progress Bar

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/0-atomic/progress-bar.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, thin, thick, circular, win32-chunky, gradient, striped |
| **States** | determinate | determinate, indeterminate (continuous animation), complete (green + check) |
| **ARIA** | Minimal | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| **Animation** | None | Width transition (determinate), crawl animation (indeterminate) |

**Win32 chunky variant:** Discrete green blocks (like classic XP progress bars):

```css
.progress-win32 .track {
    background: repeating-linear-gradient(
        90deg,
        #00A000 0px, #00A000 10px,   /* Green block */
        transparent 10px, transparent 12px  /* Gap */
    );
    background-size: calc(var(--value) * 100%) 100%;
}
```

**Striped animated variant** (like Bootstrap):

```css
.progress-striped .track {
    background: linear-gradient(
        45deg,
        rgba(255,255,255,0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255,255,255,0.15) 50%,
        rgba(255,255,255,0.15) 75%,
        transparent 75%
    );
    background-size: 1rem 1rem;
    animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
    from { background-position: 1rem 0; }
    to { background-position: 0 0; }
}
```

---

### Toggle / Switch

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/0-atomic/toggle.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, ios-style, android-style, win32 |
| **States** | on, off | on, off, disabled, focus |
| **ARIA** | Minimal | `role="switch"`, `aria-checked` |
| **Keyboard** | None | Space to toggle |
| **Animation** | None | Thumb slide (200ms ease), background color transition, focus ring |

**The iOS-style toggle** has a slightly larger thumb that casts a subtle shadow:

```css
.toggle-ios .thumb {
    width: 26px;
    height: 26px;
    border-radius: 13px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1);
    transition: transform 200ms ease;
}

.toggle-ios[aria-checked="true"] .thumb {
    transform: translateX(20px);
}

.toggle-ios[aria-checked="true"] .track {
    background: #22c55e;  /* Green when on */
}
```

---

### Color Swatch

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/0-atomic/color-swatch.js` |
| **Tier** | T0 | T2 |
| **Missing** | Checkerboard behind alpha, border for light colors, tooltip with hex value |

---

## 5.3 Compositional Controls

These controls compose multiple atomic controls together:

### Window / Panel

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/window.js` |
| **Tier** | T2 | T4 |
| **Variants** | default, redesigned | default, macOS-traffic-light, win32-classic, glass, floating |
| **Features** | Title bar, close/minimize/maximize, resize, drag | + Snap-to-edge, animated minimize/maximize, z-order management |
| **ARIA** | Partial | `role="dialog"` or `role="application"`, `aria-label` from title |

**The Window is the showcase control** for jsgui3-html. It's the control that demonstrates the library's capability most dramatically. A well-designed window with smooth dragging, animated minimize, and multiple visual modes is a powerful demo.

Detailed resize handle system:

```
┌─N──────────────────NE
│                     │
W                     E  ← 8 resize handles: N, NE, E, SE, S, SW, W, NW
│                     │
└─S──────────────────SE
```

Each handle should:
- Change the cursor appropriately (`n-resize`, `ne-resize`, etc.)
- Show a subtle highlight on hover
- Clamp to minimum size (200×100 default)

---

### Tab Control

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/tab-control.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, underline, pills, win32-tabs, vertical |
| **States** | active tab only | active, hover, focus, disabled |
| **ARIA** | Partial | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| **Keyboard** | None | Arrow Left/Right to navigate tabs, Home/End, Enter to select |
| **Animation** | None | Underline slide (active indicator moves smoothly between tabs) |

**Underline slide animation:**

The active indicator (underline) smoothly translates from one tab to another when switching:

```css
.tab-indicator {
    position: absolute;
    bottom: 0;
    height: 2px;
    background: var(--theme-color-primary);
    transition: left 200ms ease, width 200ms ease;
}
```

The `left` and `width` are set via JavaScript to match the active tab's position and size.

---

### Month View (Calendar)

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/month-view.js` |
| **Tier** | T2 | T3 |
| **Features** | Single select, range select, multi-select, today highlight | + Week numbers, disabled dates, min/max date range, locale support |
| **States** | normal, selected, today, range | + hover, disabled, out-of-month (dimmed) |
| **ARIA** | Partial | `role="grid"`, `aria-label`, date cells with `aria-selected` |

---

### Color Palette

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/color-palette.js` |
| **Tier** | T1 | T3 |
| **Features** | Grid of color swatches | + Search, favorites, custom colors, recently used |
| **States** | selected | selected, hover (enlarge + tooltip with name), focus ring |

---

### Menu

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/menu.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, context-menu, dropdown, win32 |
| **Features** | Items | + Separators, icons, keyboard shortcuts display, checkable items, submenus |
| **ARIA** | Minimal | `role="menu"`, `role="menuitem"`, `aria-haspopup`, `aria-expanded` |
| **Keyboard** | None | Arrows to navigate, Enter to activate, Escape to close |

---

### List

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/list.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, bordered, card-style, win32 |
| **Features** | Items with click | + Multi-select (Ctrl+click, Shift+click), virtual rendering, drag-to-reorder |
| **ARIA** | Minimal | `role="listbox"`, `role="option"`, `aria-selected`, `aria-multiselectable` |
| **Keyboard** | None | Arrow Up/Down, Home/End, Ctrl+A (select all), Space to toggle selection |

---

### Grid / Table

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/grid.js` |
| **Tier** | T1 | T4 |
| **Variants** | default | default, striped, compact, win32-property-grid |
| **Features** | Columns and rows | + Column resize, sort, filter, row selection, cell editing, frozen columns, virtual scrolling |
| **ARIA** | Minimal | `role="grid"`, `role="row"`, `role="gridcell"`, `aria-sort`, `aria-colindex` |
| **Keyboard** | None | Arrow keys (cell navigation), Enter (edit), Tab (next cell), Ctrl+Home/End |

The Grid is the most complex control in the library and should be the highest priority for virtual rendering (see Chapter 9).

---

### Combo Box / Dropdown

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/combo-box.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, searchable, multi-select, win32 |
| **Features** | Open/close, select item | + Type-to-filter, clear button, chips for multi-select, group headers |
| **ARIA** | Minimal | `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `role="listbox"` for popup |
| **Keyboard** | None | Arrow Down to open, type to filter, Enter to select, Escape to close |

---

### Scrollbar

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/scrollbar.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, thin (macOS-style), win32, overlay |
| **Features** | Thumb drag | + Arrow buttons (optional), page click on track, smooth scroll |

Modern thin scrollbar CSS:

```css
/* Thin overlay scrollbar (macOS-style) */
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
```

---

### Tree View

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/tree-view.js` |
| **Tier** | T1 | T3 |
| **Variants** | default | default, file-tree, win32, checkbox-tree |
| **Features** | Expand/collapse | + Node icons, drag-to-reorder, lazy loading, multi-select, inline rename |
| **ARIA** | Minimal | `role="tree"`, `role="treeitem"`, `aria-expanded`, `aria-level`, `aria-selected` |
| **Keyboard** | None | Arrow Up/Down (navigate), Left (collapse), Right (expand), Home/End, * (expand all), Enter (activate) |

---

## 5.4 Layout Controls

### Splitter / Split Panel

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/splitter.js` |
| **Tier** | T1 | T2 |
| **Variants** | default | horizontal, vertical, nested |
| **Features** | Drag to resize | + Double-click to reset, min/max pane sizes, collapse button |
| **Cursor** | Needs `col-resize` / `row-resize` on the divider |

### Toolbar

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | `controls/organised/0-core/0-basic/1-compositional/toolbar.js` |
| **Tier** | T1 | T2 |
| **Features** | Button container | + Separators, overflow menu (»), grip for drag, toggleable buttons |

---

## 5.5 Priority Improvement Order

Based on visual impact, usage frequency, and complexity:

| Priority | Control | Current Tier | Target | Effort | Impact |
|:--------:|---------|:------------:|:------:|:------:|:------:|
| **1** | Button | T2 | T4 | Medium | **Highest** |
| **2** | Text Field | T1 | T3 | Medium | High |
| **3** | Panel/Card | T2 | T3 | Low | High |
| **4** | Window | T2 | T4 | High | **Highest** |
| **5** | Tab Control | T1 | T3 | Medium | High |
| **6** | Grid | T1 | T4 | **Very High** | **Highest** |
| **7** | List | T1 | T3 | Medium | High |
| **8** | Combo Box | T1 | T3 | High | High |
| **9** | Scrollbar | T1 | T3 | Medium | Medium |
| **10** | Progress | T1 | T3 | Low | Medium |
| **11** | Checkbox | T1 | T3 | Low | Medium |
| **12** | Radio | T1 | T3 | Low | Medium |
| **13** | Toggle | T1 | T3 | Low | Medium |
| **14** | Tree View | T1 | T3 | High | Medium |
| **15** | Menu | T1 | T3 | Medium | Medium |
| **16** | Slider | T1 | T3 | Medium | Low |
| **17** | Month View | T2 | T3 | Low | Low |
| **18** | Color Palette | T1 | T3 | Medium | Low |
| **19** | Splitter | T1 | T2 | Low | Low |
| **20** | Toolbar | T1 | T2 | Low | Low |

**Decision logic:** Button first (it's on every page), then Text Field (forms are everywhere), then visual showcase controls (Window, Grid), then everything else by usage frequency.
