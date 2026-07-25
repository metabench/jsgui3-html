# Data Table

`Data_Table` is the model-driven rendering engine used by `Data_Grid`. Use it
directly when the application already owns its rows and query state.

```javascript
const table = new controls.Data_Table({
    context,
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' }
    ],
    rows,
    filters: { status: { op: 'equals', value: 'open' } },
    page: 1,
    page_size: 25,
    selection_mode: 'single'
});
```

`table.model` is the source of truth for columns, rows, sort, filters, paging,
visible rows, totals, and `selected_row_indices`. Setters update that model and
the computed filter → sort → page pipeline updates the view.

## Filtering and paging

`set_filters()` accepts predicate functions, legacy scalar substring values,
and the structured operators documented in [Data Grid](data_grid.md). Multiple
keys combine with AND. `set_sort_state()` and `set_filters()` reset page to 1.
`set_page()` normalizes values to a 1-based integer.

Set `server_side: true` when `rows` is already the requested server page. The
table then bypasses local query processing and uses `total_count` for ARIA and
page totals.

## Selection and interaction

Selection modes are `none`, `single`, and `multiple`. Selected indices are
zero-based indices in `visible_rows`, exposed through `get_selected_rows()`.
Rows use `.is-selected` and `aria-selected`.

Sortable headers support click and Enter. Rows support pointer selection and
the grid keyboard-navigation mixin. Relevant events are `sort_change`,
`page_change`, `row_click`, `selection_change`, and `column_resize`.

## Rendering and lifecycle

The table supports standard/virtual rendering, density variants, frozen and
resizable columns, and adaptive layout. `aria-rowindex` includes the page
offset; `aria-rowcount` reflects total data rows plus the header.

`destroy()` is idempotent. It removes root, window, document, virtual-scroll,
and resize-drag listeners and invalidates pending async-mixin work.

The opt-in `persist_activation_state` behavior, limits, security implications,
and reconstruction contract are documented under
[Data Grid: Opt-in fresh activation state](data_grid.md#opt-in-fresh-activation-state).
