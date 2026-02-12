# Chapter 8: Dark Mode Done Right

> Dark mode is not "invert everything." It's a carefully calibrated  
> second colour environment with its own shadow, contrast, and emphasis rules.

---

## 8.1 The Dark Mode Principles

### 1. Surfaces Use Elevation, Not Borders

In light mode, depth is communicated with shadow. In dark mode, **depth = brightness**: deeper elements are darker, elevated elements are lighter.

```css
[data-theme="dark"] {
    --j-bg:          #0f0f1a;   /* Deepest surface */
    --j-bg-subtle:   #1a1a2e;   /* Cards, sidebars */
    --j-bg-muted:    #252540;   /* Inputs, wells */
    --j-bg-elevated: #1e1e35;   /* Modals, dropdowns, tooltips */
}
```

### 2. Shadows Are Darker, Not Larger

Dark backgrounds absorb shadow, so dark mode shadows need **higher opacity**:

```css
[data-theme="dark"] {
    --j-shadow-sm: 0 1px 3px rgba(0,0,0,0.40);
    --j-shadow-md: 0 4px 8px rgba(0,0,0,0.50);
    --j-shadow-lg: 0 10px 20px rgba(0,0,0,0.60);
}
```

### 3. Text Uses Reduced Contrast

Pure white (#ffffff) on pure dark creates eye strain. Use off-white:

| Token | Light Value | Dark Value |
|-------|:-----------:|:----------:|
| `--j-fg` | `#1a1a2e` (near black) | `#e8e8f0` (off white, not pure white) |
| `--j-fg-muted` | `#6c757d` | `#9ca3af` |
| `--j-fg-subtle` | `#adb5bd` | `#6b7280` |

### 4. Accent Colours Shift Lighter

In dark mode, the primary blue needs to be lighter to maintain contrast and remain visible against the dark background:

```css
[data-theme="dark"] {
    --j-primary:       #6C83F7;   /* Lighter than light-mode #4361ee */
    --j-primary-hover: #8B9CF9;   /* Even lighter on hover */
    --j-primary-fg:    #0f0f1a;   /* Dark text on light accent */
}
```

### 5. Borders Become Subtle Dividers

Dark borders should be barely visible — they separate zones without drawing attention:

```css
[data-theme="dark"] {
    --j-border:       #2d2d4a;   /* Very subtle */
    --j-border-strong: #4a4a6a;  /* For hover state / emphasis */
}
```

---

## 8.2 Component Adjustments for Dark Mode

### Buttons in Dark Mode

Primary buttons work naturally (light text on coloured bg). But secondary and ghost buttons need care:

```css
[data-theme="dark"] .jsgui-button[data-variant="secondary"],
[data-theme="dark"] .jsgui-button:not([data-variant]) {
    background: var(--j-bg-muted);   /* Lighter than page bg */
    color: var(--j-fg);
    border-color: var(--j-border);
}
[data-theme="dark"] .jsgui-button[data-variant="secondary"]:hover {
    background: var(--j-bg-subtle);
    border-color: var(--j-border-strong);
}
```

### Inputs in Dark Mode

The input background should contrast against the page background:

```css
[data-theme="dark"] .jsgui-input {
    background: var(--j-bg-muted);
    border-color: var(--j-border);
    color: var(--j-fg);
}
[data-theme="dark"] .jsgui-input::placeholder {
    color: var(--j-fg-subtle);
}
```

### Scrollbars

Custom scrollbars for dark mode create a cohesive feel:

```css
[data-theme="dark"] {
    scrollbar-color: var(--j-bg-muted) transparent;
}
[data-theme="dark"] ::-webkit-scrollbar {
    width: 8px;
}
[data-theme="dark"] ::-webkit-scrollbar-track {
    background: transparent;
}
[data-theme="dark"] ::-webkit-scrollbar-thumb {
    background: var(--j-border);
    border-radius: var(--j-radius-full);
}
[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
    background: var(--j-border-strong);
}
```

---

## 8.3 Implementing the Toggle

### Option A: Data Attribute (Recommended)

Set `data-theme="dark"` on the `<html>` element. All token overrides cascade automatically.

```javascript
// In page-context.js or equivalent
set_theme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('jsgui-theme', mode);
}

// On page load — respect OS preference as default
const stored = localStorage.getItem('jsgui-theme');
const os_prefers_dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
set_theme(stored || (os_prefers_dark ? 'dark' : 'light'));
```

### Option B: Automatic (OS-Following)

```css
@media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
        /* Dark tokens here — applies when no explicit override */
    }
}
```

This makes dark mode the default when the user's OS is in dark mode, but allows an explicit `data-theme="light"` to override.

---

## 8.4 Testing Checklist

For every control, verify in dark mode:

- [ ] Text is readable (off-white, not pure white)
- [ ] Borders are visible but subtle
- [ ] Hover state produces a visible change
- [ ] Focus ring is visible against the dark background
- [ ] Disabled state is distinguishable from enabled
- [ ] Shadows are visible (higher opacity than light mode)
- [ ] No hardcoded hex colours leak through (`#fff`, `#000`, `#ccc` etc.)
- [ ] Scrollbar thumbs are visible
- [ ] Selection/highlight uses the shifted accent colour

---

**Next:** [Chapter 9 — From Inline Strings to a Proper CSS Pipeline](./09-css-pipeline.md)
