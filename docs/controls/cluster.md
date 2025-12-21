# Cluster Control

The `Cluster` control provides a wrapping flex layout with spacing.

## Usage

```javascript
const cluster = new controls.Cluster({
    context,
    gap: 10,
    justify: 'space-between',
    align: 'center'
});
```

## Public API

- `set_gap(gap)` - Set gap in px.
- `set_justify(justify)` - Set `justify-content` value.
- `set_align(align)` - Set `align-items` value.

## Tests

- `test/core/layout_controls.test.js`
