# Themes

The `themes/` directory provides the token mapping and variant systems that power jsgui3-html's theming infrastructure.

## Files

| File | Purpose |
|------|---------|
| `token_maps.js` | Maps abstract parameter values to concrete CSS custom properties |
| `token_maps.d.ts` | TypeScript definitions for token maps |
| `variants.js` | Built-in variant presets for controls (default, macOS, Windows 11, etc.) |
| `variants.d.ts` | TypeScript definitions for variants |

## Token Maps

Token maps translate high-level design values (like `size: 'medium'`) into specific CSS custom properties. This ensures consistent sizing, spacing, and visual properties across all themed controls.

### Size Tokens

Available for `button`, `input`, `panel`, `tab`, and `menu` control types:

```javascript
const { apply_token_map } = require('jsgui3-html/themes/token_maps');

// Applies --btn-height, --btn-padding-x, --btn-font-size, etc.
apply_token_map(my_button, 'button', { size: 'large' });
```

| Size | Button Height | Input Height | Tab Height |
|------|--------------|--------------|------------|
| `small` | 28px | 32px | 28px |
| `medium` | 36px | 40px | 36px |
| `large` | 44px | 48px | 44px |
| `xlarge` | 56px | — | — |

### Shadow Tokens

```javascript
apply_token_map(my_panel, 'panel', { shadow: 'medium' });
// Sets --shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)
```

Values: `none`, `small`, `medium`, `large`, `xlarge`, `inset`

### Radius Tokens

Values: `none` (0), `small` (4px), `medium` (8px), `large` (12px), `xlarge` (16px), `full` (9999px)

### Spacing Tokens

Values: `none` (0), `xs` (4px), `small` (8px), `medium` (16px), `large` (24px), `xlarge` (32px), `xxlarge` (48px)

## Variants

Variant presets define complete visual configurations for controls. A control can select a variant via `spec.variant` or `context.theme.extends`.

### Window Variants

| Variant | Button Position | Button Style | Button Order |
|---------|----------------|-------------|--------------|
| `default` | right | icons | minimize, maximize, close |
| `macos` | left | traffic-light | close, minimize, maximize |
| `windows-11` | right | segoe | minimize, maximize, close |
| `minimal` | right | minimal | close only |
| `toolbar-only` | — | — | no buttons (title only) |

### Tabbed_Panel Variants

`default`, `pills`, `card`, `vertical`, `vertical-right`, `bottom`, `icon`, `compact`

## CSS Token Architecture

The framework uses two levels of CSS custom properties:

| Prefix | Scope | Examples |
|--------|-------|---------|
| `--j-*` | Framework-level tokens | `--j-radius`, `--j-gap`, `--j-touch-target`, `--j-error`, `--j-success`, `--j-overlay` |
| `--admin-*` | Component/theme tokens | `--admin-card-bg`, `--admin-border`, `--admin-accent`, `--admin-text`, `--admin-muted` |

See [css/jsgui-tokens.css](../css/jsgui-tokens.css) for the current token definitions and [docs/theming_and_styling_system.md](../docs/theming_and_styling_system.md) for the full theming guide.

## Related

- [control_mixins/theme_params.js](../control_mixins/theme_params.js) — Parameter resolution and hook application
- [control_mixins/themeable.js](../control_mixins/themeable.js) — `themeable()` mixin for controls
- [css/jsgui-tokens.css](../css/jsgui-tokens.css) — Base CSS custom property definitions
- [docs/theming_and_styling_system.md](../docs/theming_and_styling_system.md) — Complete theming guide
