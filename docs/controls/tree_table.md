# Tree Table Control

The `Tree_Table` control renders hierarchical rows with expandable children.

## Usage

```javascript
const tree_table = new controls.Tree_Table({
    context,
    columns: [
        { key: 'label', label: 'Item' },
        { key: 'value', label: 'Value' }
    ],
    rows: [
        { id: 'group', label: 'Group', children: [{ id: 'a', label: 'Alpha' }] }
    ],
    expanded_ids: ['group']
});
```

## Public API

- `set_rows(rows)` - Set tree rows.
- `set_columns(columns)` - Set column definitions.
- `set_expanded_ids(expanded_ids)` - Set expanded node ids.
- `toggle_node(node_id)` - Toggle a node id.
- `get_visible_nodes()` - Get flattened visible nodes.

## Notes

- Provide stable `id` values to preserve expand state.
- First column renders expand toggles and indentation.

## Tests

- `test/core/data_collection_controls.test.js`
- `test/e2e/data-controls.test.js`
