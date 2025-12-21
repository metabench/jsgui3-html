# Form_Container Control

The `Form_Container` control renders a form layout with validation routing, inline messages, and status badges.

## Usage

```javascript
const form_container = new controls.Form_Container({
    context,
    fields: [
        { name: 'full_name', label: 'Full name', required: true, placeholder: 'Ada Lovelace' },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            validator: value => /.+@.+\..+/.test(value || '') || 'Invalid email'
        },
        { name: 'phone', label: 'Phone', mask_type: 'phone' },
        { name: 'notes', label: 'Notes', type: 'textarea', autosize: true }
    ]
});

const submit_button = new Control({ context, tag_name: 'button' });
submit_button.dom.attributes.type = 'submit';
submit_button.add('Submit');
form_container.add(submit_button);
```

## Field Definition Options

- `name` - Field name used in values/errors.
- `label` - Label text (defaults to name).
- `type` - Input type (`text`, `email`, `checkbox`, `textarea`, etc.).
- `placeholder` - Input placeholder.
- `value` / `initial_value` - Initial field value.
- `required` - Adds required validation.
- `validator` / `validators` - Validation function(s) returning `true`, `false`, or error message.
- `mask_type` / `mask_pattern` - Input masking configuration.
- `autosize` - Enable autosize for textarea fields.
- `input_control` - Custom control instance to use for the field.

## Container Options

- `show_status_badge` - Toggle status badge rendering (default: true).

## Public API

- `set_value(field_name, value)` - Set a field value.
- `get_value(field_name)` - Read a field value.
- `set_values(values)` - Set multiple values.
- `get_values()` - Get values map.
- `validate()` - Validate all fields.
- `submit()` - Validate and emit submit/invalid events.

## Events

- `submit` - Raised with `{ values }` when valid.
- `invalid` - Raised with `{ errors }` when invalid.

## Notes

- Uses `Inline_Validation_Message` and `Badge` per field.
- Applies `field-status-*` classes and `aria-invalid` / `aria-describedby` via `control_mixins/field_status`.

## Tests

- `test/core/form_editor_features.test.js`

## Example

- `dev-examples/binding/form_editor_features`
