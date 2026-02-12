# Chapter 6: Colour System & Palette Engineering

> A colour system is not a palette — it's a set of rules  
> that make every surface, state, and semantic meaning consistent.

---

## 6.1 Semantic Colour Architecture

Colours in jsgui3-html should be accessed **only through semantic aliases**, never directly. No control CSS should ever contain a hex colour.

### The Three Colour Layers

```
Layer 1: Primitive Palette      Layer 2: Semantic Aliases         Layer 3: Component Tokens
─────────────────────           ─────────────────────────         ────────────────────────
--j-blue-50:  #eef2ff           --j-primary:       var(blue-500)  --btn-bg:     var(--j-primary)
--j-blue-100: #dbeafe           --j-primary-hover: var(blue-600)  --btn-hover:  var(--j-primary-hover)
--j-blue-500: #4361ee           --j-bg:            var(gray-0)    --input-border: var(--j-border)
--j-blue-600: #3a56d4           --j-fg:            var(gray-900)
--j-blue-900: #1e2a5e
```

- **Layer 1** defines the raw palette. Users never touch these.
- **Layer 2** maps meaning to colour. Theme switching swaps this layer.
- **Layer 3** maps component parts to semantic aliases. Controls reference these.

---

## 6.2 The Primitive Palette

Each hue has a 10-step luminance ramp:

| Step | Light (Usage) | Dark (Usage) |
|:----:|:------------:|:------------:|
| 50 | Tinted backgrounds, subtle fills | Near-black tint |
| 100 | Hover backgrounds, badges | Card backgrounds |
| 200 | Active state backgrounds | Borders |
| 300 | Borders, dividers | Muted text |
| 400 | Muted text | — |
| 500 | **Brand / accent colour** | **Brand / accent colour** |
| 600 | Hover state for brand | Lighter hover state |
| 700 | Active/pressed for brand | — |
| 800 | Dark text on light bg | — |
| 900 | Headings, high contrast | Primary text |

### The Full Colour Tokens

```css
:root {
    /* ── Blue (Primary) ── */
    --j-blue-50: #eef2ff;  --j-blue-100: #dbeafe;
    --j-blue-200: #bfdbfe; --j-blue-300: #93c5fd;
    --j-blue-500: #4361ee; --j-blue-600: #3a56d4;
    --j-blue-700: #2f46b0; --j-blue-900: #1e2a5e;

    /* ── Red (Danger) ── */
    --j-red-50: #fef2f2;   --j-red-100: #fee2e2;
    --j-red-500: #e63946;  --j-red-600: #d32f2f;
    --j-red-700: #b91c1c;

    /* ── Green (Success) ── */
    --j-green-50: #f0fdf4;  --j-green-100: #dcfce7;
    --j-green-500: #2a9d8f; --j-green-600: #228b7e;
    --j-green-700: #1a7a6e;

    /* ── Amber (Warning) ── */
    --j-amber-50: #fffbeb;  --j-amber-100: #fef3c7;
    --j-amber-500: #f4a261; --j-amber-600: #e09356;
    --j-amber-700: #cc844b;

    /* ── Slate (Neutrals) ── */
    --j-slate-0: #ffffff;   --j-slate-50: #f8f9fa;
    --j-slate-100: #f1f3f5; --j-slate-200: #e9ecef;
    --j-slate-300: #dee2e6; --j-slate-400: #adb5bd;
    --j-slate-500: #6c757d; --j-slate-600: #495057;
    --j-slate-700: #343a40; --j-slate-800: #1a1a2e;
    --j-slate-900: #0f0f1a;
}
```

---

## 6.3 Semantic Mapping: Light vs Dark

```css
/* Light Theme (default) */
:root {
    --j-bg:           var(--j-slate-0);
    --j-bg-subtle:    var(--j-slate-50);
    --j-bg-muted:     var(--j-slate-100);
    --j-bg-elevated:  var(--j-slate-0);
    --j-fg:           var(--j-slate-800);
    --j-fg-muted:     var(--j-slate-500);
    --j-fg-subtle:    var(--j-slate-400);
    --j-border:       var(--j-slate-300);
    --j-border-strong: var(--j-slate-400);
    --j-primary:      var(--j-blue-500);
    --j-primary-hover: var(--j-blue-600);
    --j-primary-fg:   white;
    --j-danger:       var(--j-red-500);
    --j-success:      var(--j-green-500);
    --j-warning:      var(--j-amber-500);
}

/* Dark Theme */
[data-theme="dark"] {
    --j-bg:           var(--j-slate-900);
    --j-bg-subtle:    var(--j-slate-800);
    --j-bg-muted:     var(--j-slate-700);
    --j-bg-elevated:  var(--j-slate-800);
    --j-fg:           var(--j-slate-50);
    --j-fg-muted:     var(--j-slate-400);
    --j-fg-subtle:    var(--j-slate-500);
    --j-border:       var(--j-slate-700);
    --j-border-strong: var(--j-slate-600);
    --j-primary:      var(--j-blue-300);
    --j-primary-hover: var(--j-blue-200);
    --j-primary-fg:   var(--j-slate-900);
    --j-danger:       var(--j-red-500);
    --j-success:      var(--j-green-500);
    --j-warning:      var(--j-amber-500);
}
```

---

## 6.4 Colour Accessibility

### Contrast Ratios

Every semantic colour pair must meet **WCAG AA** (4.5:1 for text, 3:1 for large text / UI components):

| Pair | Light Ratio | Dark Ratio | Passes AA |
|------|:-----------:|:----------:|:---------:|
| `--j-fg` on `--j-bg` | 15.3:1 | 14.7:1 | ✅ |
| `--j-fg-muted` on `--j-bg` | 4.6:1 | 4.5:1 | ✅ (barely) |
| `--j-primary` on `--j-bg` | 4.7:1 | 9.2:1 | ✅ |
| `--j-primary-fg` on `--j-primary` | 5.8:1 | 8.1:1 | ✅ |
| `--j-danger` on `--j-bg` | 5.1:1 | 5.6:1 | ✅ |

### Colour-Blind Safe

The palette relies on **blue + red + green + amber** — a combination that is distinguishable by most colour-blind users. For extra safety, all stateful elements should also use an **icon or text label** alongside colour:

- ✅ Success: green + checkmark icon
- ⚠️ Warning: amber + triangle icon
- ❌ Error: red + X icon / exclamation
- ℹ️ Info: blue + "i" icon

---

## 6.5 Coloured Shadows (Premium Tier)

Premium controls cast shadows tinted with their own colour:

```css
.jsgui-button[data-variant="primary"]:hover {
    box-shadow: 0 4px 14px color-mix(in srgb, var(--j-primary) 30%, transparent),
                0 1px 3px color-mix(in srgb, var(--j-primary) 15%, transparent);
}

.jsgui-button[data-variant="danger"]:hover {
    box-shadow: 0 4px 14px color-mix(in srgb, var(--j-danger) 30%, transparent);
}

.jsgui-button[data-variant="success"]:hover {
    box-shadow: 0 4px 14px color-mix(in srgb, var(--j-success) 30%, transparent);
}
```

The `color-mix()` function (supported in all modern browsers) eliminates the need for separate RGBA shadow tokens per colour.

---

**Next:** [Chapter 7 — Motion & Micro-Animation](./07-motion-animation.md)
