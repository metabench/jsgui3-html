# Data Filter

`Data_Filter` is a live field/operator/value builder for `Data_Grid` and
`Data_Table`.

```javascript
const filter = new controls.Data_Filter({
    context,
    fields: [
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'age', label: 'Age', type: 'number' }
    ],
    filters: [
        { field: 'age', operator: 'greater_or_eq', value: '18' }
    ],
    persist_activation_state: true
});

filter.on('filter_change', event => grid.set_filters(event.filters));
```

`change` emits the descriptor array. `filter_change` emits the map returned by
`get_filter_map()`:

```javascript
{ age: { op: 'greater_or_eq', value: '18' } }
```

`add_filter()`, `remove_filter(index)`, `clear()`, `get_filters()`, and
`apply(rows)` are also public. Conditions combine with AND. Changing a field
rebuilds its operator choices and selects the first valid operator when the old
one does not apply to the new type.

## Activation state

Set `persist_activation_state: true` to write bounded activation metadata so
fields, conditions, and JSON-safe operator descriptions survive fresh SSR
activation and a later fresh reconstruction. The default is false, preserving
ordinary SSR output. The current limit is 64 fields, 64 filter rows, 20 nested
levels, and 32,768 characters.

Filter values are present in rendered HTML. Do not render secrets. Custom
operators containing functions, class instances, symbols, bigint, cycles, or
other non-JSON values disable the activation attribute; custom runtime
semantics should be handled by a server data source.

Activation is idempotent: invoking it again on the same live instance does not
duplicate handlers. Malformed or oversized metadata is ignored safely.
