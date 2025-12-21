# Reorderable List Control

The `Reorderable_List` control provides drag-and-drop and keyboard reordering.

## Usage

```javascript
const reorderable_list = new controls.Reorderable_List({
    context,
    items: ['Alpha', 'Beta', 'Gamma']
});
```

## Public API

- `set_items(items)` - Set list items.
- `get_items()` - Get list items.
- `move_item(from_index, to_index)` - Move an item to a new index.

## Events

- `reorder` - Raised with `{ from_index, to_index, items }`.

## Notes

- Drag-and-drop uses HTML5 drag events.
- Keyboard reordering uses `Alt+ArrowUp/ArrowDown` or `Ctrl+ArrowUp/ArrowDown`.

## Tests

- `test/core/data_collection_controls.test.js`
- `test/e2e/data-controls.test.js`
