# Chapter 5: Typography, Spacing & The 8px Grid

> Precision alignment, consistent rhythm, and deliberate typographic choices  
> transform a UI from "works" to "designed."

---

## 5.1 The 8px Spatial Grid

All spacing in jsgui3-html should be multiples of 4px, with 8px as the primary unit:

| Token | Value | Use Case |
|-------|-------|----------|
| `--j-space-1` | 4px | Icon gaps, tight padding, badge insets |
| `--j-space-2` | 8px | Inner padding, compact gaps, list item padding |
| `--j-space-3` | 12px | Medium padding, input horizontal padding |
| `--j-space-4` | 16px | Standard padding, button horizontal padding, card padding |
| `--j-space-5` | 24px | Section padding, large gaps |
| `--j-space-6` | 32px | Panel padding, modal padding |
| `--j-space-7` | 40px | Hero sections |
| `--j-space-8` | 48px | Page-level margins |

### Why 8px?

- **Sub-pixel avoidance:** 8 divides evenly at all common DPR values (1×, 1.5×, 2×, 3×)
- **Visual rhythm:** Consistent spacing creates a sense of order that users feel but can't articulate
- **Alignment:** All control heights snap to the grid: 28, 36, 44, 56 are all aligned

### Control Height Scale

| Size | Height | Leading Use |
|------|--------|-------------|
| Small | 28px (7 × 4) | Compact UIs, toolbars, inline controls |
| Medium | 36px (9 × 4) | Standard forms, default size |
| Large | 44px (11 × 4) | Touch targets, prominent CTAs |
| XLarge | 56px (14 × 4) | Hero buttons, major actions |

Every interactive control should use one of these heights. No exceptions. No arbitrary values.

---

## 5.2 Typography Scale

### Font Stack

```css
--j-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--j-font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

**Inter** is the recommended primary font: it has optical sizing, tabular numbers, and was designed specifically for UI. Load it from Google Fonts with `display=swap`.

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `--j-text-xs` | 0.75rem (12px) | 400 | 1.5 | +0.03em | Captions, badges, timestamps |
| `--j-text-sm` | 0.875rem (14px) | 400 | 1.5 | +0.01em | Body text, table cells, labels |
| `--j-text-base` | 1rem (16px) | 400 | 1.5 | 0 | Default body, input text |
| `--j-text-lg` | 1.125rem (18px) | 500 | 1.4 | -0.01em | Section headings, card titles |
| `--j-text-xl` | 1.5rem (24px) | 600 | 1.3 | -0.02em | Panel titles, page headings |
| `--j-text-2xl` | 2rem (32px) | 700 | 1.2 | -0.025em | Hero headings |

### Letter Spacing Rules

- **Small text (≤12px):** Increase tracking (+0.03em) for legibility
- **Body text (14–16px):** Near-zero tracking
- **Headings (≥18px):** Tighten tracking (-0.01em to -0.025em) for visual density
- **Uppercase labels:** Always add +0.05em tracking

```css
.jsgui-label {
    font: 600 var(--j-text-xs)/1 var(--j-font-sans);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--j-fg-muted);
}
```

---

## 5.3 Alignment Rules

### Baseline Alignment

When controls sit side-by-side on a toolbar or form row, their text baselines must align:

```css
.jsgui-form-row {
    display: flex;
    align-items: baseline;
    gap: var(--j-space-3);
}
```

### Touch Target Minimum

All interactive elements must have a minimum 44×44px touch target (WCAG 2.5.5). For small-sized controls (28px height), add transparent padding:

```css
.jsgui-button.btn-small {
    height: 28px;
    /* Actual visual size is 28px, but touch target is expanded */
    position: relative;
}
.jsgui-button.btn-small::before {
    content: ''; position: absolute;
    top: -8px; left: -4px; right: -4px; bottom: -8px;
}
```

### Vertical Rhythm in Forms

```css
.jsgui-form-group {
    display: flex; flex-direction: column;
    gap: var(--j-space-1);           /* 4px between label and input */
    margin-bottom: var(--j-space-4); /* 16px between form groups */
}
.jsgui-form-section {
    margin-bottom: var(--j-space-6); /* 32px between sections */
}
```

---

## 5.4 Token Integration with `token_maps.js`

The existing `SIZE_TOKENS` in `token_maps.js` already define heights and paddings for buttons, inputs, panels, tabs, and menus. These values should be updated to align with the 8px grid:

| Current Value | Aligned Value | Difference |
|:------------:|:------------:|:----------:|
| Button small height: 28px | 28px | ✅ Already aligned |
| Input small height: 32px | **28px** | Reduce by 4px |
| Input medium height: 40px | **36px** | Reduce by 4px |
| Input large height: 48px | **44px** | Reduce by 4px |
| Tab small height: 28px | 28px | ✅ Already aligned |

Inputs should match button heights at each size step so they align perfectly in form rows.

---

**Next:** [Chapter 6 — Colour System & Palette Engineering](./06-colour-system.md)
