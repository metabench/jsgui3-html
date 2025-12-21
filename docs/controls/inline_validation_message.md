# Inline_Validation_Message Control

The `Inline_Validation_Message` control displays inline validation text with status styling.

## Usage

```javascript
const inline_message = new controls.Inline_Validation_Message({
    context,
    message: 'Required field',
    status: 'error'
});
```

## Public API

- `set_message(message)` - Set the message text.
- `get_message()` - Get the message text.
- `set_status(status)` - Set the status.

## Notes

- Adds `role="status"` for screen reader updates.
- Works with `control_mixins/field_status` to attach `aria-invalid` and `aria-describedby`.
- Status tokens: `error`, `warn`, `info`, `success`.

## Tests

- `test/core/missing_controls.test.js`
- `test/core/form_editor_features.test.js`
