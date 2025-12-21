# Toast Control

The `Toast` control manages a list of toast messages.

## Usage

```javascript
const toast = new controls.Toast({ context });
const toast_id = toast.show('Saved', { status: 'success', timeout_ms: 2500 });
```

## Public API

- `show(message, options)` - Show a toast and return its id.
- `dismiss(toast_id)` - Dismiss a toast by id.

## Notes

- Uses event delegation for dismiss actions.

## Tests

- `test/core/missing_controls.test.js`
