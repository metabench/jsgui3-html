# Layout Controls Demo

This dev example showcases layout and navigation controls (split pane, accordion, drawer, tabs, stepper, and primitives).

## Features

- Split pane with drag handle
- Accordion with single-open mode
- Drawer with overlay and focus trap
- Tabbed panel variants with icons and overflow
- Stepper navigation
- Layout primitives: stack, cluster, center, grid gap

## Quick Start

```bash
node dev-examples/binding/layout-controls/server.js
```

Open `http://localhost:52006`.

## Code Example

```javascript
const split_pane = new controls.Split_Pane({
    context,
    orientation: 'horizontal',
    size: 240,
    panes: ['Left', 'Right']
});

const stepper = new controls.Stepper({
    context,
    steps: [
        { title: 'Plan', content: 'Step 1' },
        { title: 'Build', content: 'Step 2' }
    ]
});
```

## Architecture

- Server renders `Layout_Controls_Demo` using `jsgui3-server`.
- Client bundle hydrates the DOM and wires interactivity in `activate()`.

## Extension Points

- Add additional sections in `Layout_Controls_Demo.compose_ui()`.
- Extend styling in `Layout_Controls_Demo.css`.
