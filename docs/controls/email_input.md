# Email_Input Control

The `Email_Input` control is a `Text_Input` with `type="email"`.

## Usage

```javascript
const email_input = new controls.Email_Input({
    context,
    value: 'user@example.com',
    placeholder: 'name@example.com'
});
```

## Notes

- Inherits behavior from `Text_Input`.

## Tests

- `test/core/missing_controls.test.js`
