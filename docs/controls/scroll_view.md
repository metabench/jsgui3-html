# Scroll_View Control

The `Scroll_View` control wraps a scrollable viewport with optional custom scrollbars.

## Usage

```javascript
const scroll_view = new controls.Scroll_View({
    context,
    show_horizontal: true,
    show_vertical: true,
    inertia: false
});

scroll_view.add(new controls.Text_Item({ context, text: 'Scrollable content' }));
```

## Options

- `show_horizontal`: show horizontal scrollbar (default `true`).
- `show_vertical`: show vertical scrollbar (default `true`).
- `inertia`: enable inertial scrolling.
- `inertia_friction`: damping factor for inertia.

## Methods

```javascript
scroll_view.set_scroll_position({ scroll_top: 40 });
scroll_view.set_scroll_state({ scroll_left: 10 });
```

## Tests

- `test/core/scroll_view.test.js`
