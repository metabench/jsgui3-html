# Tooltip Control

The `Tooltip` control renders a positioned tooltip that can be attached to a target element.

## Usage

```javascript
const tooltip = new controls.Tooltip({
    context,
    message: 'Helpful hint',
    target: some_control,
    placement: 'top'
});
```

## Public API

- `set_message(message)` - Set the tooltip message.
- `show()` - Show the tooltip.
- `hide()` - Hide the tooltip.

## Notes

- Sets `aria-describedby` on the target when activated.

## Tests

- `test/core/missing_controls.test.js`
