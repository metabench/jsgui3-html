# Checkbox Control

The `Checkbox` control wraps a native checkbox input with a label and raises a `change` event when the checked state changes.

## Usage

```javascript
const checkbox = new controls.Checkbox({
    context,
    text: 'Accept terms',
    checked: true
});
```

## Properties

- `text`: label text rendered next to the checkbox.
- `checked`: boolean initial checked state.
- `name`: optional input name.

## Methods

```javascript
checkbox.set_checked(true);
const is_checked = checkbox.get_checked();
```

## Events

- `change`: raised when the checkbox changes.
  - `name`: `checked`
  - `value`: boolean checked state

## Notes

- DOM access is guarded in `activate()`; the control is safe for server rendering.
- The checked state is serialized into HTML and synchronized on change.
- `aria-checked` is set on the input and updated when the checkbox changes.
- Focus styling is applied on `input:focus-visible + label`.

## Tests

- `test/core/checkbox.test.js`
