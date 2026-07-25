# Data Grid

`Data_Grid` is the connected, application-facing tabular control. It owns query
state and a data source, and projects the resulting rows into an inner
[`Data_Table`](data_table.md). Pair it with [`Data_Filter`](data_filter.md) when
users need a field/operator/value filter builder.

## Quick start

```javascript
const Data_Grid = require('../../controls/connected/Data_Grid');

const grid = new Data_Grid({
    context,
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' }
    ],
    rows: [
        { name: 'Alice', age: 31 },
        { name: 'Bob', age: 23 }
    ],
    page_size: 20,
    selection_mode: 'single'
});
```

`data_source` may instead be a function or `{get_rows(params)}` adapter. It
receives:

```javascript
{
    columns,
    sort_state,
    filters,
    page,       // 1-based integer
    page_size
}
```

It may return an array, a promise of an array, or
`{rows, total_count}`. Supplying `total_count` switches the inner table to
server-side mode, so the server owns filtering, sorting, and paging.

## Filter integration

The filter map supports three compatible forms:

```javascript
grid.set_filters({
    name: 'Ali',                                      // substring
    active: row => row.active === true,              // predicate
    age: { op: 'greater_or_eq', value: 18 }           // structured
});
```

Structured operators are `contains`, `equals`, `not_equals`, `starts_with`,
`ends_with`, `greater_than`, `less_than`, `greater_or_eq`, and `less_or_eq`.
Keys combine with AND. Empty structured values are inactive. Unknown/custom
operators are intended for server data sources; local processing leaves them
unrestricted.

`Data_Filter#get_filter_map()` produces the structured form directly:

```javascript
filter.on('filter_change', event => grid.set_filters(event.filters));
```

Sorting or filtering resets both grid and table to page 1 before the data
source is called.

## State ownership and selection

`Data_Grid.model` is the source of truth for connected query state:
`columns`, `data_source`, `sort_state`, `filters`, `page`, `page_size`, and
`selection`. `Data_Table.model` owns rendered table state and is a projection
of the grid. On fresh activation only, valid persisted table state seeds the
grid once; the grid then resumes ownership.

Grid selection is singular metadata:

```javascript
{ row_index: 0, row_data: row }
```

`row_index` is zero-based within the current visible page. Programmatic
selection updates the table model, `.is-selected`, and `aria-selected`.
Selection is preserved by row object identity while that object remains
visible; it is cleared when filtering, paging, or replacement removes it.
There is no cross-fetch identity contract yet.

## API and events

- `set_data_source(source)`, `set_columns(columns)`
- `set_sort_state(state)`, `set_filters(filters)`
- `set_page(page)`, `set_page_size(size)`
- `set_selection(selection)`, `get_selection()`
- `refresh()` / `refresh_rows()`
- `destroy()`

User header sorting emits `sort_change` once. Effective page changes emit
`page_change` with `{page, previous_page}`; implicit sort/filter resets also add
`reason`. Row interaction emits `row_click` and `selection_change`. Async loads
emit `load_complete`; thrown/rejected loads emit `error`.

Programmatic sort and selection setters are silent. Programmatic `set_page`
emits when the effective page changes. Page values are normalized to integers
of at least 1.

Only the newest async request may update the grid. `destroy()` unbinds model and
table listeners and invalidates pending work.

## Opt-in fresh activation state

Set `persist_activation_state: true` only for bounded, static, JSON-safe data:

```javascript
const grid = new Data_Grid({
    context,
    columns,
    rows,
    persist_activation_state: true
});
```

This writes columns, rows, view state, and selected visible-row indices into a
`data-jsgui-tabular-state` HTML attribute so a fresh browser context can resume
sorting, filtering, paging, and selection without replacing the initial SSR
DOM. The attribute is synchronized after serializable state changes and
removed if state becomes unsafe.

Limits are 64 columns, 500 rows, 20 levels of nesting, and 131,072 serialized
characters. Functions, symbols, bigint, non-finite numbers, cycles, and class
instances are rejected. Because row and filter values become HTML, do not
enable this option for secrets or large/sensitive datasets. Async functions and
adapters are not serialized.

## Canonical example and verification

- `examples/binding_data_grid.js` uses the exported `Data_Filter` and
  `Data_Grid`.
- `npm run test:data-controls` runs the focused unit, lifecycle, and repeated
  reconstruction contract.
- `npm run test:data-controls:browser` bundles and activates the exported
  controls in Chromium, then exercises filtering, pointer/keyboard sorting,
  paging, selection, ARIA state, event cardinality, and browser errors.
