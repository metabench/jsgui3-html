# Virtual List Control

The `Virtual_List` control renders a windowed subset of items for large lists.

## Usage

```javascript
const virtual_list = new controls.Virtual_List({
    context,
    items: Array.from({ length: 100 }, (_, i) => `Row ${i + 1}`),
    height: 240,
    item_height: 28,
    buffer: 3
});
```

## Public API

- `set_items(items)` - Set list items.
- `get_items()` - Get list items.

## Notes

- Uses the `virtual_window` mixin for range calculation.
- `item_renderer(item, index)` can return a `Control` or string.
- Scroll handling is attached in `activate()`.

## Tests

- `test/core/data_collection_controls.test.js`
- `test/e2e/data-controls.test.js`
