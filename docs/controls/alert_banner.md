# Alert_Banner Control

The `Alert_Banner` control renders a dismissible alert banner.

## Usage

```javascript
const alert_banner = new controls.Alert_Banner({
    context,
    message: 'Profile saved',
    status: 'success',
    dismissible: true
});
```

## Public API

- `set_message(message)` - Set banner message.
- `set_status(status)` - Set banner status.
- `dismiss()` - Dismiss the banner.

## Events

- `dismiss` - Raised when dismissed.

## Tests

- `test/core/missing_controls.test.js`
