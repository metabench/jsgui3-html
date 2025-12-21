# Tag_Input Control

The `Tag_Input` control manages a list of tags with an input field.

## Usage

```javascript
const tag_input = new controls.Tag_Input({
    context,
    items: ['alpha', 'beta'],
    placeholder: 'Add a tag'
});
```

## Public API

- `set_items(items)` - Replace the tag list.
- `get_items()` - Get the current tag list.
- `add_item(item)` - Add a tag.
- `remove_item(item_or_index)` - Remove a tag by value or index.

## Notes

- Uses `Data_Object` for the model.
- Enter or comma adds a tag; backspace on empty input removes the last tag.

## Tests

- `test/core/missing_controls.test.js`
