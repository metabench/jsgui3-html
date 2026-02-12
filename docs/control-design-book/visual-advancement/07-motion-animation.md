# Chapter 7: Motion & Micro-Animation

> Motion is the difference between a control that works and one that *feels* alive.

---

## 7.1 The Three Motion Tiers

| Tier | Duration | Easing | Use Case |
|------|----------|--------|----------|
| **Instant** | 80–120ms | `ease-out` | Hover highlights, colour changes, active press |
| **Standard** | 150–250ms | `ease-out` or spring | Toggle switches, tab indicators, dropdown open/close |
| **Dramatic** | 300–500ms | spring | Modal entrance, page transitions, accordion expand |

### Easing Curves

```css
:root {
    --j-ease-out:    cubic-bezier(0.33, 1, 0.68, 1);      /* Decelerate — most things */
    --j-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);      /* Symmetric — progress bars */
    --j-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* Overshoot — toggles, thumb */
    --j-ease-bounce: cubic-bezier(0.34, 1.3, 0.64, 1);    /* Subtle bounce — badges */
}
```

---

## 7.2 Micro-Animation Recipes

### Button Press

```css
.jsgui-button {
    transition: transform 80ms ease-out, box-shadow 120ms ease-out;
}
.jsgui-button:active {
    transform: scale(0.97);   /* Press-in — subtle squish */
}
.jsgui-button:hover {
    transform: translateY(-1px);  /* Micro-lift on hover */
}
```

### Toggle Switch Spring

```css
.jsgui-toggle-thumb {
    transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
    /* The spring curve makes the thumb overshoot slightly then settle */
}
```

### Dropdown Reveal

```css
.jsgui-combo-box-dropdown {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
    transition: opacity 150ms ease-out, transform 150ms ease-out;
    pointer-events: none;
}
.jsgui-combo-box[data-open="true"] .jsgui-combo-box-dropdown {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
}
```

### Tab Underline Slide

```css
.jsgui-tabs-indicator {
    position: absolute;
    bottom: 0;
    height: 2px;
    background: var(--j-primary);
    transition: left 200ms ease-out, width 200ms ease-out;
    /* JS updates left and width to match active tab position */
}
```

### Skeleton Shimmer

```css
@keyframes jsgui-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
.jsgui-skeleton {
    background: linear-gradient(90deg,
        var(--j-bg-muted) 25%,
        var(--j-bg-subtle) 37%,
        var(--j-bg-muted) 63%);
    background-size: 200% 100%;
    animation: jsgui-shimmer 1.5s ease-in-out infinite;
    border-radius: var(--j-radius-sm);
}
```

### Spinner Rotation

```css
@keyframes jsgui-spin {
    to { transform: rotate(360deg); }
}
.jsgui-spinner {
    width: 20px; height: 20px;
    border: 2px solid var(--j-bg-muted);
    border-top-color: var(--j-primary);
    border-radius: 50%;
    animation: jsgui-spin 0.6s linear infinite;
}
```

### Badge Pulse (for notification counts)

```css
@keyframes jsgui-pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.15); }
}
.jsgui-badge[data-pulse] {
    animation: jsgui-pulse 1s cubic-bezier(0.34, 1.3, 0.64, 1) 2;
    /* Pulse twice then stop — draws attention without being annoying */
}
```

---

## 7.3 Performance Rules

1. **Only animate `transform` and `opacity`.** These run on the compositor thread (GPU). Everything else triggers layout or paint.
2. **Use `will-change` sparingly.** Each `will-change: transform` creates a new GPU layer. Only add it to elements that actually animate.
3. **Respect reduced motion:**

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

**Next:** [Chapter 8 — Dark Mode Done Right](./08-dark-mode.md)
