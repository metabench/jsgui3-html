# Theming and Styling System

This document describes the tokenized CSS variables, theme context overrides, and layering strategy for jsgui3-html.

## Tokenized CSS variables

Tokens live in `css/basic.css` under `@layer base`. They are grouped by role:

- Colors: `--theme-color-bg`, `--theme-color-surface`, `--theme-color-text`, `--theme-color-primary`, `--theme-color-focus`
- Spacing: `--theme-space-1` ... `--theme-space-6`
- Radius: `--theme-radius-1` ... `--theme-radius-3`
- Typography: `--theme-font-family-base`, `--theme-font-size-base`, `--theme-line-height-base`

All controls should prefer these variables for colors, spacing, and type.

## Layered base/component/utility styles

`css/basic.css` declares layers:

- `@layer base` for global tokens and theme defaults
- `@layer components` for shared component patterns such as `.theme-surface`
- `@layer utilities` for small utility classes such as `.u-text-muted` and `.focus-ring`

Layering keeps base defaults low priority while allowing components and utilities to override selectively.

## Theme context overrides

Use `spec.theme` or `context.theme` to apply a theme name or token overrides to any control.

```javascript
const panel = new controls.Panel({
    context,
    theme: {
        name: 'dark',
        tokens: {
            color_primary: '#60a5fa',
            color_bg: '#0f172a'
        }
    },
    theme_overrides: {
        color_text: '#e5e7eb'
    }
});
```

The theme mixin translates token keys to CSS variables and applies them on the control root, so tokens cascade to child controls.

## SASS compatibility

The system is CSS-variable first and does not require SASS. For SASS users, generate variable blocks with maps:

```scss
$theme-dark: (
  color-bg: #0f172a,
  color-text: #e5e7eb,
  color-primary: #60a5fa
);

[data-theme="dark"] {
  @each $key, $value in $theme-dark {
    --theme-#{$key}: #{$value};
  }
}
```

jsgui3-server can handle bundling; jsgui3-html only needs the resulting CSS variables.
