# List Control

The `List` control renders a selectable list with optional filtering and async loading.

## Usage

```javascript
const list = new controls.List({
    context,
    items: ['Alpha', 'Beta', 'Gamma']
});
```

## Options

- `items`: array of strings, arrays, or objects.
- `filter_text`: optional filter string.
- `load_items`: async loader function.
- `auto_load`: load on activation when `load_items` is provided.
- `multi_select`: enable multi-select ARIA state.
- `select_toggle`: allow toggling selection without modifier keys.

## Methods

```javascript
list.set_items([{ value: 1, label: 'One' }]);
list.set_filter_text('one');
const selected = list.get_selected_item();
```

## Events

- `change`: raised when selection changes.
  - `name`: `selected_item`
  - `value`: selected item object

## Notes

- Uses `role="listbox"` and updates `aria-activedescendant`.
- Items use `role="option"` and update `aria-selected`.

## Tests

- `test/core/select_controls.test.js`
