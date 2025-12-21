# Data Grid Control

The `Data_Grid` control wraps `Data_Table` with a data source API and selection tracking.

## Usage

```javascript
const data_grid = new controls.Data_Grid({
    context,
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' }
    ],
    data_source: ({ sort_state }) => {
        const rows = load_rows();
        if (sort_state) {
            rows.sort((a, b) => a.name.localeCompare(b.name));
        }
        return rows;
    }
});
```

## Public API

- `set_data_source(data_source)` - Set the data source.
- `set_columns(columns)` - Set column definitions.
- `set_sort_state(sort_state)` - Set `{ key, direction }`.
- `set_filters(filters)` - Set filter object or null.
- `set_page(page)` - Set the current page.
- `set_page_size(page_size)` - Set the page size.
- `set_selection(selection)` - Set selection metadata.
- `get_selection()` - Get selection metadata.
- `refresh_rows()` - Reload rows from the data source.

## Data Source Options

- `Array` - Static rows.
- `Function(params)` - Return rows synchronously or via Promise.
- `Object` with `get_rows(params)` or `rows` array.

## Events

- `selection_change` - Raised when a row is selected.

## Notes

- Sort changes from the header re-invoke the data source.
- Wraps `Data_Table` for a consistent MVC/MVVM API.

## Migration Notes

- Replaces the previously commented `controls/connected/data-grid.js` stub.
- Use `data_source` + `columns` instead of legacy ad-hoc row wiring.

## Tests

- `test/core/data_collection_controls.test.js`
- `test/e2e/data-controls.test.js`
