# Chapter 2: The CSS Architecture Revolution

> Replacing scattered inline CSS strings with a unified, layered stylesheet  
> that consumes theme tokens and responds to data-attribute hooks.

---

## 2.1 The Problem with Static `.css` Strings

Today, controls embed their CSS like this:

```javascript
Toggle_Switch.css = `
.toggle-switch { display: inline-flex; ... }
.toggle-switch-slider { background: #bbb; ... }
`;
```

This approach has five critical flaws:

1. **No token consumption** — Hardcoded hex values bypass the theme
2. **No cascade control** — Every control's CSS has equal specificity
3. **No dark mode** — Inline strings can't use `[data-theme="dark"]`
4. **No conditional loading** — The CSS is bundled even if the control isn't used
5. **Duplication** — Each control re-invents spacing, border, shadow rules

---

## 2.2 Target Architecture: Four CSS Layers

```css
@layer jsgui-reset, jsgui-tokens, jsgui-components, jsgui-utilities;
```

### Layer 1: Reset (`jsgui-reset`)

A minimal box-sizing and margin reset. ~20 lines.

```css
@layer jsgui-reset {
    *, *::before, *::after { box-sizing: border-box; }
    [class^="jsgui-"] { margin: 0; padding: 0; }
}
```

### Layer 2: Tokens (`jsgui-tokens`)

All CSS custom properties in one place. This replaces both the `:root` block in `basic.css` and the `--jsgui-*` tokens in `native-enhanced.css`. **One prefix: `--j-`** (short, distinctive, fast to type).

```css
@layer jsgui-tokens {
    :root {
        /* ── Spacing (8px scale) ── */
        --j-space-1: 4px;   --j-space-2: 8px;   --j-space-3: 12px;
        --j-space-4: 16px;  --j-space-5: 24px;   --j-space-6: 32px;
        --j-space-7: 40px;  --j-space-8: 48px;

        /* ── Radii ── */
        --j-radius-sm: 4px;  --j-radius-md: 6px;
        --j-radius-lg: 12px; --j-radius-xl: 16px; --j-radius-full: 9999px;

        /* ── Shadows ── */
        --j-shadow-sm: 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.10);
        --j-shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
        --j-shadow-lg: 0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05);
        --j-shadow-xl: 0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04);

        /* ── Typography ── */
        --j-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --j-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
        --j-text-xs: 0.75rem;   --j-text-sm: 0.875rem;  --j-text-base: 1rem;
        --j-text-lg: 1.125rem;  --j-text-xl: 1.5rem;

        /* ── Motion ── */
        --j-ease-out: cubic-bezier(0.33, 1, 0.68, 1);
        --j-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
        --j-duration-fast: 120ms;
        --j-duration-normal: 200ms;
        --j-duration-slow: 350ms;

        /* ── Colours (Light theme defaults) ── */
        --j-bg: #ffffff;          --j-bg-subtle: #f8f9fa;
        --j-bg-muted: #f1f3f5;   --j-bg-elevated: #ffffff;
        --j-fg: #1a1a2e;         --j-fg-muted: #6c757d;
        --j-fg-subtle: #adb5bd;
        --j-border: #dee2e6;     --j-border-strong: #adb5bd;
        --j-primary: #4361ee;    --j-primary-hover: #3a56d4;
        --j-primary-fg: #ffffff;
        --j-danger: #e63946;     --j-success: #2a9d8f;
        --j-warning: #f4a261;    --j-info: #457b9d;
        --j-focus-ring: 0 0 0 3px rgba(67, 97, 238, 0.35);
    }

    [data-theme="dark"] {
        --j-bg: #0f0f1a;          --j-bg-subtle: #1a1a2e;
        --j-bg-muted: #252540;    --j-bg-elevated: #1e1e35;
        --j-fg: #e8e8f0;          --j-fg-muted: #9ca3af;
        --j-fg-subtle: #6b7280;
        --j-border: #2d2d4a;      --j-border-strong: #4a4a6a;
        --j-primary: #6C83F7;     --j-primary-hover: #8B9CF9;
        --j-primary-fg: #0f0f1a;
        --j-shadow-sm: 0 1px 3px rgba(0,0,0,0.30);
        --j-shadow-md: 0 4px 8px rgba(0,0,0,0.40);
        --j-shadow-lg: 0 10px 20px rgba(0,0,0,0.50);
        --j-focus-ring: 0 0 0 3px rgba(108, 131, 247, 0.4);
    }
}
```

### Layer 3: Components (`jsgui-components`)

One section per control type. Every rule targets a `data-*` attribute set by `derive_hooks()` or a class added by the theming system. This is the heart of this book — Chapter 4 provides the complete spec for each control.

```css
@layer jsgui-components {
    /* ── Button ── */
    .jsgui-button {
        display: inline-flex; align-items: center; justify-content: center;
        gap: var(--btn-gap, var(--j-space-2));
        height: var(--btn-height, 36px);
        padding: 0 var(--btn-padding-x, var(--j-space-4));
        font-size: var(--btn-font-size, var(--j-text-sm));
        font-family: var(--j-font-sans);
        font-weight: 500;
        border-radius: var(--btn-border-radius, var(--j-radius-md));
        border: 1px solid transparent;
        cursor: pointer;
        transition: background var(--j-duration-fast) var(--j-ease-out),
                    box-shadow var(--j-duration-fast) var(--j-ease-out),
                    transform var(--j-duration-fast) var(--j-ease-out);
    }
    .jsgui-button:active { transform: scale(0.97); }
    .jsgui-button:focus-visible { box-shadow: var(--j-focus-ring); outline: none; }
    .jsgui-button:disabled {
        opacity: 0.5; cursor: not-allowed; pointer-events: none;
    }

    /* Variant: primary */
    .jsgui-button[data-variant="primary"] {
        background: var(--j-primary); color: var(--j-primary-fg);
    }
    .jsgui-button[data-variant="primary"]:hover {
        background: var(--j-primary-hover);
        box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
    }

    /* ... (Chapter 4 provides the full set) */
}
```

### Layer 4: Utilities (`jsgui-utilities`)

Atomic helpers for one-off overrides, always winning specificity:

```css
@layer jsgui-utilities {
    .u-sr-only { /* screen-reader only */ }
    .u-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .u-focus-ring:focus-visible { box-shadow: var(--j-focus-ring); outline: none; }
    .u-no-transition { transition: none !important; }
}
```

---

## 2.3 Mapping `token_maps.js` → CSS Custom Properties

The existing `token_maps.js` applies CSS vars through JavaScript:

```javascript
// Current: JS sets inline styles
apply_token_map(ctrl, 'button', { size: 'large' });
// → ctrl.dom.attributes.style['--btn-height'] = '44px';
```

This is **correct** — it lets per-instance overrides work. But it only works if the component CSS actually *uses* those vars. Today, the component CSS doesn't reference `var(--btn-height)` because it doesn't exist. The new Layer 3 CSS fills this gap.

**The flow:**

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  token_maps.js  │────▶│ Inline style=    │────▶│ CSS var() in      │
│  (JS runtime)   │     │ "--btn-height:    │     │ Layer 3 component │
│                 │     │  44px"            │     │ .jsgui-button {   │
│ Sets --btn-*    │     │                  │     │   height: var(    │
│ per-instance    │     │ (per element)    │     │   --btn-height);  │
└─────────────────┘     └──────────────────┘     └───────────────────┘
```

---

## 2.4 Migration Strategy

### Phase 1: Create the consolidated stylesheet

Create `css/jsgui-components.css` with the 4-layer structure. Start with the 5 most-used controls: Button, Text_Input, Panel, Tabbed_Panel, List.

### Phase 2: Bridge the inline `.css` strings

Don't delete the static `.css` properties yet — they're the only styling some controls have. Instead, add a `@layer jsgui-legacy` with lower priority:

```css
@layer jsgui-reset, jsgui-tokens, jsgui-legacy, jsgui-components, jsgui-utilities;
```

Static `.css` strings injected at runtime go into `jsgui-legacy`, so the new component layer always wins.

### Phase 3: Control-by-control migration

For each control:
1. Add `themeable()` call in the constructor
2. Add component CSS rules in Layer 3
3. Test that the inline `.css` string is now redundant
4. Remove the static `.css` property

### Phase 4: Retire legacy CSS

Once all controls are migrated, delete the `jsgui-legacy` layer and the ~1 000 lines of legacy CSS in `basic.css`.

---

## 2.5 File Structure

```
css/
├── jsgui-reset.css          (20 lines)
├── jsgui-tokens.css         (120 lines — all custom properties)
├── jsgui-components.css     (entry point — @import per control)
│   ├── components/
│   │   ├── button.css
│   │   ├── input.css
│   │   ├── toggle.css
│   │   ├── panel.css
│   │   ├── tabbed-panel.css
│   │   ├── menu.css
│   │   ├── list.css
│   │   ├── table.css
│   │   ├── slider.css
│   │   ├── combo-box.css
│   │   ├── window.css
│   │   ├── chart.css
│   │   └── ... (one file per control type)
├── jsgui-utilities.css      (60 lines)
└── jsgui.css                (master import — includes all above)
```

This structure enables **tree-shaking at the CSS level**: apps that only use Button + Input + Panel can import just those three component files.

---

**Next:** [Chapter 3 — The Five Interaction States](./03-interaction-states.md)
