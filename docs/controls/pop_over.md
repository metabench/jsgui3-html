# Pop_Over Control

The `Pop_Over` control renders a clickable pop-over attached to a target element.

## Usage

```javascript
const pop_over = new controls.Pop_Over({
    context,
    content: 'More details',
    target: some_control,
    placement: 'bottom'
});
```

## Public API

- `set_content(content)` - Set the pop-over content.
- `show()` - Show the pop-over.
- `hide()` - Hide the pop-over.
- `toggle()` - Toggle visibility.

## Notes

- Updates `aria-expanded` and `aria-controls` on the target.

## Tests

- `test/core/missing_controls.test.js`
