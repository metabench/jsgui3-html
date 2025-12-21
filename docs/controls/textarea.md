# Textarea Control

The `Textarea` control wraps a native `<textarea>` with guarded activation and value helpers.

## Usage

```javascript
const textarea = new controls.Textarea({
    context,
    value: 'Notes',
    rows: 4,
    cols: 40,
    placeholder: 'Enter text',
    autosize: true,
    autosize_line_height: 20,
    mask_type: 'date'
});
```

## Public API

- `set_value(value)` - Set the textarea value.
- `get_value()` - Get the textarea value.
- `focus()` - Focus the textarea element.
- `select()` - Select textarea content.

## Notes

- DOM access is guarded in `activate()`.
- Value changes are synced on `input` and `change` events.
- `autosize` adjusts height using `scrollHeight` with a fallback to `rows * autosize_line_height`.
- When `mask_type` or `mask_pattern` is supplied, `get_raw_value()` and `set_raw_value()` are available.

## Tests

- `test/core/missing_controls.test.js`
- `test/core/form_editor_features.test.js`
