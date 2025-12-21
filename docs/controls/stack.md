# Stack Control

The `Stack` control provides a simple flex stack with spacing.

## Usage

```javascript
const stack = new controls.Stack({
    context,
    direction: 'column',
    gap: 12
});
```

## Public API

- `set_direction(direction)` - Set `"row"` or `"column"`.
- `set_gap(gap)` - Set gap in px.

## Tests

- `test/core/layout_controls.test.js`
