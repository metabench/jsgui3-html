# Data Table Control

The `Data_Table` control renders tabular data with sorting, filtering, and pagination hooks.

## Usage

```javascript
const data_table = new controls.Data_Table({
    context,
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' }
    ],
    rows: [
        { name: 'Alpha', status: 'open' },
        { name: 'Beta', status: 'closed' }
    ],
    page_size: 5,
    page: 1
});
```

## Public API

- `set_rows(rows)` - Set the table rows.
- `set_columns(columns)` - Set the column definitions.
- `set_sort_state(sort_state)` - Set `{ key, direction }`.
- `set_filters(filters)` - Set filter object or null.
- `set_page(page)` - Set the current page.
- `set_page_size(page_size)` - Set the page size.
- `get_visible_rows()` - Get the rows after sort/filter/paging.

## Events

- `row_click` - Raised with `{ row_index, row_data }`.
- `sort_change` - Raised when the user changes sort state.

## Notes

- Column definitions may include `accessor(row)` or `render(value, row)`.
- Header buttons are keyboard-focusable and set `aria-sort`.
- Provide stable column keys for consistent sorting.

## Tests

- `test/core/data_collection_controls.test.js`
- `test/e2e/data-controls.test.js`
