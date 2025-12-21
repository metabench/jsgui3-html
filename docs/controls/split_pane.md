# Split Pane Control

The `Split_Pane` control provides a resizable two-pane layout with a draggable handle.

## Usage

```javascript
const split_pane = new controls.Split_Pane({
    context,
    orientation: 'horizontal',
    size: 240,
    min_size: 120,
    max_size: 480,
    panes: ['Left', 'Right']
});
```

## Public API

- `set_orientation(orientation)` - Set `"horizontal"` or `"vertical"`.
- `set_primary(primary)` - Set `"first"` or `"second"` pane as primary.
- `set_size(size)` - Set size (px or CSS string).
- `get_size()` - Get current size.
- `set_min_size(min_size)` - Set minimum size in px.
- `set_max_size(max_size)` - Set maximum size in px.

## Events

- `resize` - Raised after drag resize with `{ size }`.

## Notes

- Drag events are attached in `activate()`.
- The primary pane uses `flex-basis` sizing.

## Tests

- `test/core/layout_controls.test.js`
- `test/e2e/layout-controls.test.js`
