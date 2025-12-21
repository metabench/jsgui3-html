# Accessibility and Semantics

Guidance for consistent ARIA roles, labels, focus styles, and keyboard navigation.

## A11y helper usage

Use the helper functions in `control_mixins/a11y.js` to keep ARIA wiring consistent.

```javascript
const {
    apply_role,
    apply_label,
    apply_focus_ring,
    ensure_sr_text
} = require('../control_mixins/a11y');

apply_role(ctrl, 'listbox');
apply_label(ctrl, spec.aria_label);
apply_focus_ring(ctrl, { include_tabindex: true });
ensure_sr_text(icon_button, 'Close window');
```

## Keyboard navigation patterns

Use the shared helper in `control_mixins/keyboard_navigation.js` to wire arrows, Home/End, and Enter/Space.

```javascript
const keyboard_navigation = require('../control_mixins/keyboard_navigation');

keyboard_navigation(ctrl, {
    orientation: 'vertical',
    get_items: () => items,
    get_active_index: () => active_index,
    set_active_index: (index) => set_active_index(index),
    on_activate: () => activate_item()
});
```

## Reduced motion support

Global motion tokens live in `css/basic.css`:

- `--motion-duration-fast`
- `--motion-duration-standard`
- `--motion-duration-slow`
- `--motion-ease-standard`

The `prefers-reduced-motion: reduce` media query zeros these durations and disables transitions/animations. When adding animation, use the tokens so the reduced-motion override applies automatically.

## Icon-only controls

Icon-only controls must include screen reader text. Use `ensure_sr_text` or `apply_label` to set an accessible name. If the icon state changes (e.g., expand/collapse), keep `aria-label` updated to match.
