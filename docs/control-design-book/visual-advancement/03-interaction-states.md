# Chapter 3: The Five Interaction States

> No control should ever feel "dead." Every interactive surface must respond  
> to all five states: **rest → hover → active → focus → disabled**.

---

## 3.1 The State Matrix

Every interactive control must provide all five states. The table below defines the exact visual treatment for each:

| State | Trigger | Visual Change | CSS Selector | Priority |
|-------|---------|---------------|-------------|----------|
| **Rest** | Default | Base appearance | `.jsgui-*` | Lowest |
| **Hover** | Mouse over | Subtle lift + brightness shift | `:hover` | |
| **Active** | Mouse down / touch | Press-in + darken | `:active` | |
| **Focus** | Tab / keyboard | Ring + outline | `:focus-visible` | |
| **Disabled** | `disabled` attr | Muted + `not-allowed` cursor | `[aria-disabled="true"]`, `:disabled` | Highest |

### Why `:focus-visible` instead of `:focus`?

`:focus` triggers on mouse click too, creating ugly rings for mouse users. `:focus-visible` only shows on keyboard navigation. Every interactive control should use:

```css
.jsgui-button:focus-visible {
    outline: 2px solid var(--j-primary);
    outline-offset: 2px;
    box-shadow: var(--j-focus-ring);
}
```

---

## 3.2 State Recipes by Control Category

### Buttons

```css
/* Rest */
.jsgui-button[data-variant="primary"] {
    background: var(--j-primary);
    color: var(--j-primary-fg);
    box-shadow: var(--j-shadow-sm);
}

/* Hover — lighten + glow + micro-lift */
.jsgui-button[data-variant="primary"]:hover {
    background: var(--j-primary-hover);
    box-shadow: 0 4px 14px color-mix(in srgb, var(--j-primary) 35%, transparent);
    transform: translateY(-1px);
}

/* Active — press in + darken */
.jsgui-button[data-variant="primary"]:active {
    background: color-mix(in srgb, var(--j-primary) 85%, black);
    box-shadow: var(--j-shadow-sm);
    transform: scale(0.97);
}

/* Focus — ring only on keyboard */
.jsgui-button:focus-visible {
    outline: 2px solid var(--j-primary);
    outline-offset: 2px;
    box-shadow: var(--j-focus-ring);
}

/* Disabled — greyed out, no pointer */
.jsgui-button:disabled,
.jsgui-button[aria-disabled="true"] {
    background: var(--j-bg-muted);
    color: var(--j-fg-subtle);
    box-shadow: none;
    cursor: not-allowed;
    pointer-events: none;
}
```

### Text Inputs

```css
/* Rest */
.jsgui-input {
    background: var(--j-bg);
    border: 1px solid var(--j-border);
    border-radius: var(--j-radius-md);
    color: var(--j-fg);
    transition: border-color var(--j-duration-fast) var(--j-ease-out),
                box-shadow var(--j-duration-fast) var(--j-ease-out);
}

/* Hover — border brightens */
.jsgui-input:hover {
    border-color: var(--j-border-strong);
}

/* Focus — border becomes primary + ring */
.jsgui-input:focus {
    border-color: var(--j-primary);
    box-shadow: var(--j-focus-ring);
    outline: none;
}

/* Disabled */
.jsgui-input:disabled {
    background: var(--j-bg-muted);
    color: var(--j-fg-subtle);
    cursor: not-allowed;
}

/* Validation states */
.jsgui-input[aria-invalid="true"] {
    border-color: var(--j-danger);
    box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.15);
}
```

### Toggle Switches

The toggle is one of the most visually complex controls. Current implementation has no states at all.

```css
/* Rest — OFF */
.jsgui-toggle-track {
    width: 44px; height: 24px;
    border-radius: var(--j-radius-full);
    background: var(--j-bg-muted);
    border: 2px solid var(--j-border);
    transition: background var(--j-duration-normal) var(--j-ease-out),
                border-color var(--j-duration-normal) var(--j-ease-out);
}
.jsgui-toggle-thumb {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: white;
    box-shadow: var(--j-shadow-sm);
    transition: transform var(--j-duration-normal) var(--j-ease-spring);
}

/* ON state */
.jsgui-toggle-input:checked + .jsgui-toggle-track {
    background: var(--j-primary);
    border-color: var(--j-primary);
}
.jsgui-toggle-input:checked + .jsgui-toggle-track .jsgui-toggle-thumb {
    transform: translateX(20px);
}

/* Hover — subtle glow */
.jsgui-toggle-track:hover {
    border-color: var(--j-border-strong);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--j-fg) 5%, transparent);
}

/* Active — press in */
.jsgui-toggle-track:active .jsgui-toggle-thumb {
    width: 22px; /* Thumb stretches on press */
}

/* Focus */
.jsgui-toggle-input:focus-visible + .jsgui-toggle-track {
    box-shadow: var(--j-focus-ring);
}

/* Disabled */
.jsgui-toggle-input:disabled + .jsgui-toggle-track {
    opacity: 0.4;
    cursor: not-allowed;
}
```

### Data Table Rows

```css
.jsgui-table-row {
    border-bottom: 1px solid var(--j-border);
    transition: background var(--j-duration-fast) var(--j-ease-out);
}
.jsgui-table-row:hover {
    background: color-mix(in srgb, var(--j-primary) 5%, var(--j-bg));
}
.jsgui-table-row[aria-selected="true"] {
    background: color-mix(in srgb, var(--j-primary) 10%, var(--j-bg));
    box-shadow: inset 3px 0 0 var(--j-primary);
}
.jsgui-table-row:active {
    background: color-mix(in srgb, var(--j-primary) 15%, var(--j-bg));
}
```

### Sliders

```css
/* Track */
.jsgui-slider-track {
    height: 6px;
    border-radius: var(--j-radius-full);
    background: var(--j-bg-muted);
}

/* Thumb — Rest */
.jsgui-slider-thumb {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: var(--j-primary);
    box-shadow: var(--j-shadow-sm);
    transition: transform var(--j-duration-fast) var(--j-ease-spring),
                box-shadow var(--j-duration-fast) var(--j-ease-out);
}

/* Thumb — Hover */
.jsgui-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--j-primary) 12%, transparent);
}

/* Thumb — Active */
.jsgui-slider-thumb:active {
    transform: scale(1.25);
    box-shadow: 0 0 0 12px color-mix(in srgb, var(--j-primary) 20%, transparent);
}
```

---

## 3.3 The Transition Formula

All interactive controls should use this consistent transition:

```css
transition:
    background var(--j-duration-fast) var(--j-ease-out),
    border-color var(--j-duration-fast) var(--j-ease-out),
    box-shadow var(--j-duration-fast) var(--j-ease-out),
    color var(--j-duration-fast) var(--j-ease-out),
    transform var(--j-duration-fast) var(--j-ease-out),
    opacity var(--j-duration-fast) var(--j-ease-out);
```

**Rules:**
- Duration: `--j-duration-fast` (120ms) for buttons and interactive elements
- Duration: `--j-duration-normal` (200ms) for larger surfaces (panels, modals)
- Easing: `--j-ease-out` for most transitions; `--j-ease-spring` for thumb/toggle movement
- Never transition `width`, `height`, `top`, `left` — use `transform` instead
- Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }
}
```

---

## 3.4 Implementation Checklist

For each of the ~60 interactive controls:

- [ ] Ensure `rest` state uses token-based colours
- [ ] Add `:hover` with visual brightening/lift
- [ ] Add `:active` with press-in effect (scale or darken)
- [ ] Add `:focus-visible` with the ring pattern
- [ ] Add `:disabled` / `[aria-disabled="true"]` with muted style
- [ ] Add `transition` combining all animated properties
- [ ] Test in both light and dark themes
- [ ] Verify `prefers-reduced-motion` disables animation

---

**Next:** [Chapter 4 — Control-by-Control Transformation Specs](./04-control-specs.md)
