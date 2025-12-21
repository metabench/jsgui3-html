# Center Control

The `Center` control centers its children and optionally constrains width/height.

## Usage

```javascript
const center = new controls.Center({
    context,
    min_height: 200,
    max_width: 600
});
```

## Public API

- `set_min_height(min_height)` - Set minimum height in px.
- `set_max_width(max_width)` - Set maximum width in px.

## Tests

- `test/core/layout_controls.test.js`
