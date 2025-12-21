# Master Detail Control

The `Master_Detail` control displays a selectable master list with a detail pane.

## Usage

```javascript
const master_detail = new controls.Master_Detail({
    context,
    items: [
        { id: 'north', label: 'North', detail: 'North coverage.' },
        { id: 'south', label: 'South', detail: 'South coverage.' }
    ],
    selected_id: 'south'
});
```

## Public API

- `set_items(items)` - Set master items.
- `set_selected_id(selected_id)` - Set the active selection.
- `get_selected_id()` - Get the selected id.
- `get_selected_item()` - Get the selected item.

## Events

- `selection_change` - Raised when selection changes.

## Notes

- Items are normalized to include `id` and `label`.
- Provide `detail_renderer(item)` to customize detail output.

## Tests

- `test/core/data_collection_controls.test.js`
- `test/e2e/data-controls.test.js`
