# Badge Control

The `Badge` control renders a small status pill.

## Usage

```javascript
const badge = new controls.Badge({
    context,
    text: 'Beta',
    status: 'info'
});
```

## Public API

- `set_text(text)` - Set badge text.
- `get_text()` - Get badge text.
- `set_status(status)` - Set badge status.

## Notes

- Status classes use `badge-<status>`.
- Common statuses: `info`, `success`, `warn`, `error`.
- Used by `Form_Container` alongside `Inline_Validation_Message`.

## Tests

- `test/core/missing_controls.test.js`
- `test/core/form_editor_features.test.js`
