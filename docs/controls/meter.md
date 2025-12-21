# Meter Control

The `Meter` control wraps a native `<meter>` element with range helpers.

## Usage

```javascript
const meter = new controls.Meter({
    context,
    value: 0.6,
    min: 0,
    max: 1,
    low: 0.3,
    high: 0.8,
    optimum: 0.7
});
```

## Public API

- `set_value(value)` - Set the meter value.
- `get_value()` - Get the meter value.
- `set_min(min_value)`
- `set_max(max_value)`
- `set_low(low_value)`
- `set_high(high_value)`
- `set_optimum(optimum_value)`

## Notes

- Values are clamped to `[min, max]` when set.

## Tests

- `test/core/missing_controls.test.js`
