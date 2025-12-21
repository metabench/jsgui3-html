# Number_Stepper Control

The `Number_Stepper` control composes a number input with increment/decrement buttons.

## Usage

```javascript
const number_stepper = new controls.Number_Stepper({
    context,
    value: 2,
    min: 0,
    max: 10,
    step: 1
});
```

## Public API

- `set_value(value)` - Set the stepper value.
- `get_value()` - Get the stepper value.
- `step_up()` - Increment by the step.
- `step_down()` - Decrement by the step.

## Events

- `change` with `{ name: 'value', value }` when updated.

## Tests

- `test/core/missing_controls.test.js`
