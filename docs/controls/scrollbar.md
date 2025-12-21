# Scrollbar Control

The `Scrollbar` control provides a horizontal or vertical scrollbar that can be synchronized with a scroll view.

## Usage

```javascript
const scrollbar = new controls.Scrollbar({
    context,
    direction: 'vertical'
});
```

## Methods

```javascript
scrollbar.set_ratio(0.5);
scrollbar.set_value(100);
```

## Events

- `scroll`: raised when the scrollbar value changes.
  - `value`: current value
  - `ratio`: 0-1 ratio

## Tests

- `test/core/scroll_view.test.js`
