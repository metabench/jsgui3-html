# Stepped_Slider Control

The `Stepped_Slider` control composes a range input with optional tick labels and a value readout.

## Usage

```javascript
const stepped_slider = new controls.Stepped_Slider({
    context,
    value: 20,
    min: 0,
    max: 100,
    step: 10,
    ticks: [0, 25, 50, 75, 100],
    show_value: true
});
```

## Public API

- `set_value(value)` - Set slider value.
- `get_value()` - Get slider value.
- `set_ticks(ticks)` - Update tick labels.

## Tests

- `test/core/missing_controls.test.js`
