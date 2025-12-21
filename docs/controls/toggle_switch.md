# Toggle_Switch Control

The `Toggle_Switch` control provides a compositional switch built from a checkbox input.

## Usage

```javascript
const toggle_switch = new controls.Toggle_Switch({
    context,
    checked: true,
    on_label: 'Enabled',
    off_label: 'Disabled'
});
```

## Public API

- `set_checked(checked)` - Set the checked state.
- `get_checked()` - Get the checked state.

## Events

- `change` with `{ name: 'checked', value: boolean }`.

## Notes

- Uses guarded activation and updates `aria-checked` on the input.

## Tests

- `test/core/missing_controls.test.js`
