# Stepper Control

The `Stepper` control guides users through multi-step flows.

## Usage

```javascript
const stepper = new controls.Stepper({
    context,
    steps: [
        { title: 'Details', content: 'Step 1' },
        { title: 'Review', content: 'Step 2' }
    ],
    current_step: 0
});
```

## Public API

- `set_steps(steps)` - Set step definitions.
- `set_current_step(index)` - Set current step index.
- `get_current_step()` - Get current step index.
- `mark_completed(index)` - Mark a step complete.
- `next()` - Move to next step.
- `previous()` - Move to previous step.

## Events

- `step_change` - Raised when current step changes.

## Tests

- `test/core/layout_controls.test.js`
- `test/e2e/layout-controls.test.js`
