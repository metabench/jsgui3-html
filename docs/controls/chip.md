# Chip Control

A compact element for tags, filters, or selections with optional icon and dismiss button.

## Usage

```javascript
const chip = new Chip({
    context,
    label: 'JavaScript',
    icon: '⭐',
    variant: 'primary',
    dismissible: true
});
```

## Public API

- `label` — Display text
- `icon` — Leading icon/emoji
- `variant` — Visual variant: `'default'`|`'primary'`|`'success'`|`'warning'`|`'error'`
- `dismissible` — Whether close button is shown
- `is_selected` / `is_disabled` — State getters
- `set_label(text)` — Update label
- `set_selected(bool)` — Toggle selection state
- `set_disabled(bool)` — Toggle disabled state
- `set_variant(name)` — Change visual variant

## Events

- `'dismiss'` `{ chip }` — Fired when close button clicked
- `'click'` `{ chip }` — Fired when chip body clicked

## Notes

- Uses `is_selected`/`is_disabled` getters (not `selected`/`disabled`) to avoid collision with base `Control` properties
- Icon, label, disabled, and selected are captured before `super()` to prevent base class consumption
- Pass `chip_icon` or `icon` in spec

## Tests

- `test/controls/chip.test.js` — 10 tests
