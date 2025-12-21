# Object_Editor Control

`Object_Editor` renders editable key/value rows with optional schema guidance.

## Usage

```javascript
const object_editor = new controls.Object_Editor({
    context,
    value: { title: 'Example', count: 2 },
    schema: {
        fields: [
            { name: 'title', type: 'string' },
            { name: 'count', type: 'number' }
        ]
    },
    allow_add: true,
    allow_remove: true
});
```

## Public API

- `set_value(value)` - Set the object value.
- `get_value()` - Get the object value.
- `toggle_key(key)` - Expand or collapse a key.
- `add_key(key, value)` - Add a key/value pair.
- `remove_key(key)` - Remove a key/value pair.

## Notes

- Supports nested objects and arrays via expand/collapse.
- Schema can be supplied via `schema.fields` or `schema.properties`.

## Tests

- `test/core/form_editor_features.test.js`

## Example

- `dev-examples/binding/form_editor_features`
