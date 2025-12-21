# Virtual Grid Control

The `Virtual_Grid` control renders a windowed grid layout for large datasets.

## Usage

```javascript
const virtual_grid = new controls.Virtual_Grid({
    context,
    items: Array.from({ length: 60 }, (_, i) => `Card ${i + 1}`),
    height: 320,
    item_height: 120,
    column_count: 3,
    gap: 12
});
```

## Public API

- `set_items(items)` - Set grid items.
- `get_items()` - Get grid items.

## Notes

- Uses the `virtual_window` mixin to calculate visible rows.
- `item_renderer(item, index)` can return a `Control` or string.
- `column_count` controls grid columns; `gap` sets row/column spacing.

## Tests

- `test/core/data_collection_controls.test.js`
- `test/e2e/data-controls.test.js`
