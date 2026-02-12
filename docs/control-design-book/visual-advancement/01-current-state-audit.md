# Chapter 1: Where We Stand — Auditing the Current Visual State

> Before we can improve anything, we must know *exactly* where we are.  
> This chapter is a forensic audit of every visual surface in jsgui3-html.

---

## 1.1 The Two CSS Files

jsgui3-html's entire global stylesheet lives in just two files:

### `css/basic.css` (1 194 lines, 22 KB)

| Section | Lines | Purpose | Assessment |
|---------|-------|---------|------------|
| CSS Custom Properties (`:root`) | 24–62 | Theme tokens — colours, spacing 1–6, radii 1–3, font, motion | **Good foundation.** 30+ tokens defined. Light/dark themes present. |
| `[data-theme="light"]` block | 64–75 | Duplicate of `:root` defaults | Redundant but harmless. |
| `[data-theme="dark"]` block | 77–88 | Dark mode overrides | **Minimal.** Only 10 colour tokens. No shadow or radius overrides. |
| `@layer components` | 91–105 | `.theme-surface`, `.theme-surface-muted` | **Only 2 utility classes.** No control-specific component styles. |
| `@layer utilities` | 107–136 | `.focus-ring`, `.sr-only`, `.u-text-muted`, `.u-border` | **Good start**, but only 4 utilities total. |
| `prefers-reduced-motion` | 138–150 | Disables all animation | ✅ Correct implementation. |
| Legacy CSS | 152–1194 | Tree nodes, grids, flexiboard, window, menu, admin layouts | **Problematic.** ~1 000 lines of unsorted, undocumented legacy CSS with hardcoded hex colours (`#CCCCCC`, `#EEEEEE`, `#0D4F8B`) that bypass the token system entirely. |

**Key finding:** The modern token system (lines 1–150) and the legacy CSS (lines 152+) are two different worlds. The legacy CSS uses **zero** CSS custom properties.

### `css/native-enhanced.css` (141 lines, 4.5 KB)

A Tier 1 progressive enhancement stylesheet for native HTML elements:

| Feature | Status | Notes |
|---------|--------|-------|
| Input styling | ✅ Defined | `--jsgui-input-*` tokens for font, padding, border, radius, bg, color |
| Focus ring | ✅ Defined | Blue border + box-shadow on `:focus` |
| Disabled state | ✅ Defined | Grey bg + `cursor: not-allowed` |
| Validation states | ✅ Defined | `.jsgui-invalid` (red border), `.jsgui-valid` (green border) |
| Button styling | ✅ Defined | `--jsgui-button-*` tokens for size, colour, hover, active |
| Select styling | ✅ Defined | `appearance: none` + custom padding |
| Checkbox/Radio | ⚠️ Minimal | Only sets `width: 18px`, `height: 18px`, `accent-color` |

**Key finding:** This file uses its own `--jsgui-*` prefix which is separate from the `--theme-*` prefix in `basic.css`. There is **no bridge** between the two token systems.

---

## 1.2 The Inline CSS Problem

Most controls define their styles as a static `.css` string property on the class. Here is what real controls look like today:

### Toggle_Switch (28 lines of CSS)

```css
.toggle-switch { display: inline-flex; align-items: center; gap: 8px; }
.toggle-switch-slider { width: 28px; height: 16px; border-radius: 999px; background: #bbb; }
.toggle-switch-slider::after {
    content: ''; width: 12px; height: 12px; border-radius: 50%;
    background: #fff; transition: transform 0.2s ease;
}
```

**Problems:**
- Hardcoded `#bbb` background — ignores theme tokens
- No hover, focus, active, or disabled states
- Dimensions (`28×16px`, `12px` knob) are not on the spacing scale
- No dark mode adaptation

### Data_Table (12 lines of CSS)

```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table-header { text-align: left; font-weight: 600; padding: 6px 8px; border-bottom: 1px solid #ddd; }
.data-table-row { border-bottom: 1px solid #eee; }
.data-table-cell { padding: 6px 8px; }
```

**Problems:**
- No hover highlighting on rows
- No selected row state
- No sortable column indicator styling
- Hardcoded `#ddd`/`#eee` borders
- No zebra striping option

### Combo_Box (12 lines of CSS)

```css
.combo-box { position: relative; display: inline-block; min-width: 160px; }
.combo-box-dropdown { position: absolute; background: #fff; border: 1px solid #ccc;
    max-height: 220px; overflow-y: auto; }
```

**Problems:**
- No box-shadow on dropdown
- No border-radius
- No transition on open/close
- Hardcoded white background

### Horizontal_Slider (0 lines of CSS)

The slider control has **no CSS at all** — not even the static `.css` property. It relies entirely on hardcoded JavaScript style manipulation and legacy class names from `basic.css`.

---

## 1.3 Theming Infrastructure Audit

### What Exists and Works

The theming system is actually well-architected. The problem is **adoption**, not design:

```
themeable(ctrl, type, spec)          ← Entry point. Resolves params, applies hooks.
  └─ resolve_params(type, spec, ctx) ← 3-layer merge: variant → theme → spec
       └─ get_variant_params(type)   ← From variants.js registry
  └─ apply_hooks(ctrl, hooks)        ← Sets data-attrs + CSS classes
  └─ apply_token_map(ctrl, type, p)  ← Converts abstract values → CSS vars
```

| Component | File | Status |
|-----------|------|--------|
| `themeable()` mixin | `control_mixins/themeable.js` | ✅ Clean, well-documented |
| `resolve_params()` | `control_mixins/theme_params.js` | ✅ 3-layer merge with validation |
| `apply_token_map()` | `themes/token_maps.js` | ✅ Maps size/shadow/radius/spacing |
| Variant registry | `themes/variants.js` | ✅ 10+ control types, 70+ presets |
| `apply_theme()` | `control_mixins/theme.js` | ✅ Token application with `--theme-` prefix |
| Param schemas | `theme_params.js` L47–121 | ✅ Validation for all registered types |

### What's Missing

| Gap | Impact | Difficulty |
|-----|--------|------------|
| **No global component CSS** that consumes the tokens | Tokens defined but unused in rendering | Medium — need ~500 lines of CSS |
| **No CSS loading pipeline** | Each control's `.css` string is injected ad-hoc or not at all | Medium — need a CSS registry/loader |
| **Many controls don't call `themeable()`** | Toggle_Switch, Horizontal_Slider, most older controls | Low per control — just add the call |
| **No CSS for data-attr hooks** | `theme_params.js` sets `data-fill-style`, `data-variant` etc., but no CSS rules match them | Medium — need attribute-targeted CSS |
| **Dual token prefix** | `--theme-*` in basic.css vs `--jsgui-*` in native-enhanced.css | Low — unify to `--jsgui-*` |

---

## 1.4 Control Adoption Scorecard

How many of the ~100 exported controls actually use the theming system?

| Category | Total | Uses `themeable()` | Has static `.css` | Uses tokens | Score |
|----------|:-----:|:-----------------:|:-----------------:|:-----------:|:-----:|
| **Buttons** (Button, Arrow_Button) | 2 | ✅ 1 | ✅ 1 | Partial | 🟡 |
| **Text inputs** (Text_Input, Number, Password, Email, URL, Tel, Search) | 8 | ⚠️ 1 | ⚠️ 1 | Partial | 🟡 |
| **Selection** (Checkbox, Radio, Toggle, Combo, Dropdown, Select, List) | 7 | ❌ 0 | ✅ 3 | ❌ 0 | 🔴 |
| **Data** (Data_Table, Data_Row, Grid, Virtual_List, Virtual_Grid) | 5 | ❌ 0 | ✅ 2 | ❌ 0 | 🔴 |
| **Navigation** (Tabbed_Panel, Menu, Context_Menu, Breadcrumb, Toolbar) | 5 | ⚠️ 1 | ✅ 2 | Partial | 🟡 |
| **Layout** (Panel, Window, Stack, Cluster, Center, Stepper) | 7 | ⚠️ 1 | ✅ 1 | Partial | 🟡 |
| **Indicators** (Badge, Chip, Spinner, Skeleton, Progress, Toast, Status) | 8 | ❌ 0 | ✅ 4 | ❌ 0 | 🔴 |
| **Pickers** (Date, Time, DateTime, Color, Month_View, Calendar) | 6 | ❌ 0 | ✅ 2 | ❌ 0 | 🔴 |
| **Charts** (Bar, Pie, Scatter, Area, Function_Graph) | 5 | ❌ 0 | ❌ 0 | ❌ 0 | 🔴 |
| **Advanced** (Property_Grid, Rich_Text, Form_Container, Login) | 5 | ❌ 0 | ⚠️ 2 | ❌ 0 | 🔴 |

**Summary:** Only **~5 out of ~100 controls** use `themeable()`. The variant registry in `variants.js` defines presets for 16 control type aliases, but most of the actual control classes never read those presets.

---

## 1.5 The Gap Quantified

| Metric | Current | Target (Premium) | Gap |
|--------|:-------:|:-----------------:|:---:|
| Controls with 5 interaction states | ~3 | All interactive (~60) | **57** |
| Controls using theme tokens | ~5 | All (~100) | **95** |
| Lines of component CSS | ~200 (scattered) | ~3 000 (consolidated) | **2 800** |
| Dark mode–ready controls | ~5 | All (~100) | **95** |
| Controls with transitions | ~3 | All interactive (~60) | **57** |
| Controls with ARIA roles | ~8 | All interactive (~60) | **52** |

The remaining chapters of this book address each of these gaps systematically.

---

**Next:** [Chapter 2 — The CSS Architecture Revolution](./02-css-architecture.md)
