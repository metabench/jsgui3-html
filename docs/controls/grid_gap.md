# Grid Gap Control

The `Grid_Gap` control provides a CSS grid with configurable columns and gap.

## Usage

```javascript
const grid_gap = new controls.Grid_Gap({
    context,
    columns: 'repeat(3, minmax(0, 1fr))',
    gap: 12
});
```

## Public API

- `set_columns(columns)` - Set `grid-template-columns` value.
- `set_gap(gap)` - Set gap in px.

## Tests

- `test/core/layout_controls.test.js`
