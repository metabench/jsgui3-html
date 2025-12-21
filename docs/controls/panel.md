# Panel Control

The `Panel` control is a simple container that can optionally dock or resize.

## Usage

```javascript
const panel = new controls.Panel({
    context,
    title: 'Settings',
    resizable: true,
    min_size: [200, 120]
});
```

## Options

- `title`: optional panel title text.
- `content`: initial content control.
- `resizable`: enable resize handle.
- `min_size` / `max_size`: resize bounds.
- `dock`: dock edge (`left`, `right`, `top`, `bottom`).

## Methods

```javascript
panel.dock_to('right');
panel.undock();
```

## Tests

- `test/core/window_panel.test.js`
