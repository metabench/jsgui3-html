# Progress_Bar Control

The `Progress_Bar` control wraps a native `<progress>` element with value and max helpers.

## Usage

```javascript
const progress = new controls.Progress_Bar({
    context,
    value: 40,
    max: 100
});
```

## Public API

- `set_value(value)` - Set the progress value.
- `get_value()` - Get the progress value.
- `set_max(max_value)` - Set the max value.
- `get_max()` - Get the max value.

## Notes

- Values are clamped to `[0, max]` when max is provided.

## Tests

- `test/core/missing_controls.test.js`
