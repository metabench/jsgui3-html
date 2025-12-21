# Select_Options Control

The `Select_Options` control wraps a native `<select>` element with normalized items and async loading helpers.

## Usage

```javascript
const select_options = new controls.Select_Options({
    context,
    items: [
        { value: 'alpha', label: 'Alpha' },
        { value: 'beta', label: 'Beta' }
    ],
    value: 'beta'
});
```

## Options

- `items` / `options`: array of strings, arrays, or objects.
- `value`: selected value.
- `selected_item`: selected item object.
- `filter_text`: optional filter to apply to items.
- `load_items`: async loader function.
- `auto_load`: load on activation when `load_items` is provided.
- `aria_label`: optional label for accessibility.

## Methods

```javascript
await select_options.load_items();
select_options.set_items(['One', 'Two']);
select_options.set_selected_value('Two');
```

## Events

- `change`: raised when selection changes.
  - `name`: `selected_item`
  - `value`: selected item object

## Notes

- Normalized items include `id`, `label`, `value`, and `disabled`.
- `aria-activedescendant` is updated to the selected option id.

## Tests

- `test/core/select_controls.test.js`
