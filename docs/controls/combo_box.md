# Combo_Box Control

The `Combo_Box` control combines a text input with a filtered list of options.

## Usage

```javascript
const combo_box = new controls.Combo_Box({
    context,
    items: ['Alpha', 'Beta', 'Gamma'],
    placeholder: 'Pick one'
});
```

## Options

- `items`: array of strings, arrays, or objects.
- `value`: selected value.
- `selected_item`: selected item object.
- `filter_text`: initial filter text.
- `load_items`: async loader function.
- `auto_load`: load on activation when `load_items` is provided.
- `typeahead`: enable filtering from input (default `true`).
- `allow_custom_value`: keep input text when no selection.

## Methods

```javascript
combo_box.set_selected_value('Beta');
const value = combo_box.get_value();
```

## Events

- `change`: raised when selection changes.
  - `name`: `selected_item`
  - `value`: selected item object

## Notes

- Input uses `role="combobox"` with `aria-controls` and `aria-activedescendant`.
- List uses `role="listbox"` and updates `aria-selected`.

## Tests

- `test/core/select_controls.test.js`
