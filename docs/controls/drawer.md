# Drawer Control

The `Drawer` control provides an overlay or docked navigation panel with focus trapping.

## Usage

```javascript
const drawer = new controls.Drawer({
    context,
    open: false,
    position: 'left',
    breakpoint: 960,
    content: 'Drawer content'
});
```

## Public API

- `open()` - Open the drawer.
- `close()` - Close the drawer.
- `toggle()` - Toggle open state.
- `set_open(is_open)` - Set open state.
- `get_open()` - Get open state.

## Events

- `open` - Raised when opened.
- `close` - Raised when closed.
- `toggle` - Raised on toggle.

## Notes

- Overlay vs docked mode is controlled by `breakpoint`.
- Focus trapping and Escape handling are applied in `activate()`.

## Tests

- `test/core/layout_controls.test.js`
- `test/e2e/layout-controls.test.js`
