# Window Control

The `Window` control provides draggable, resizable windows with snapping and docking.

## Usage

```javascript
const window_ctrl = new controls.Window({
    context,
    title: 'Demo',
    snap: true,
    min_size: [240, 160]
});
```

## Options

- `snap`: enable snap-to-edge behavior (default `true`).
- `snap_threshold`: pixel threshold for snapping.
- `dock_sizes`: optional size override when docking.
- `min_size` / `max_size`: resize constraints.
- `resize_bounds`: restrict resize extents.

## Methods

```javascript
window_ctrl.dock_to('left');
window_ctrl.undock();
window_ctrl.bring_to_front_z();
```

## Tests

- `test/core/window_panel.test.js`
