# Range_Input Control

The `Range_Input` control wraps a native `<input type="range">` with basic ARIA updates.

## Usage

```javascript
const range_input = new controls.Range_Input({
    context,
    value: 25,
    min: 0,
    max: 100,
    step: 5
});
```

## Public API

- `set_value(value)` - Set the slider value.
- `get_value()` - Get the slider value.

## Notes

- Updates `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.
- DOM access is guarded in `activate()`.

## Tests

- `test/core/missing_controls.test.js`
