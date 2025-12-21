# Theme mixin

`control_mixins/theme.js` provides helpers to apply tokenized theme variables and data-theme attributes on controls.

## Usage

```javascript
const { apply_theme, apply_theme_overrides } = require('../control_mixins/theme');

apply_theme(ctrl, 'dark');
apply_theme(ctrl, {
    name: 'light',
    tokens: {
        color_primary: '#1f5fcc',
        'theme-color-bg': '#ffffff'
    }
});
apply_theme_overrides(ctrl, {
    color_text: '#0f172a'
});
```

## Token key normalization

- `color_primary` -> `--theme-color-primary`
- `theme-color-primary` -> `--theme-color-primary`
- `--theme-color-primary` stays as-is

## Theme context

Controls can receive a theme via `spec.theme` or inherit from `context.theme`. Pass a theme name string for `data-theme`, or an object for token overrides.

## SASS compatibility

The mixin works with plain CSS variables. SASS can generate tokens using maps and emit `:root` or `[data-theme="..."]` blocks. jsgui3-html only consumes the resulting CSS variables, so bundling can be handled by jsgui3-server.
