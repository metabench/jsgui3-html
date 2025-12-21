# Number_Input Control

The `Number_Input` control wraps a native `<input type="number">` with guarded activation and value helpers.

## Usage

```javascript
const number_input = new controls.Number_Input({
    context,
    value: 3,
    min: 0,
    max: 10,
    step: 1
});
```

## Public API

- `set_value(value)` - Set the input value.
- `get_value()` - Get the input value.

## Notes

- DOM access is guarded in `activate()`.
- Value changes are synced on `input` and `change` events.

## Tests

- `test/core/missing_controls.test.js`
