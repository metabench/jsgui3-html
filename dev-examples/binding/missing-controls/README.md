# Missing Controls Demo

This dev example showcases the newly added missing controls (inputs, indicators, navigation, and feedback controls).

## Features

- Textarea, number, range, and typed inputs
- Number stepper and stepped slider
- Progress bar and meter with update button
- Badge and inline validation message
- Toggle switch
- Tag input with add/remove
- Breadcrumbs and pagination
- Tooltip, pop-over, toast, and alert banner

## Quick Start

```bash
node dev-examples/binding/missing-controls/server.js
```

Open `http://localhost:52004`.

## Code Example

```javascript
const progress = new controls.Progress_Bar({
    context,
    value: 40,
    max: 100
});

const toast = new controls.Toast({ context });
const toast_id = toast.show('Saved', { status: 'success', timeout_ms: 2000 });
```

## Architecture

- Server renders `Missing_Controls_Demo` using `jsgui3-server`.
- Client bundle hydrates the DOM and wires interactivity in `activate()`.
- Controls are composed declaratively in `client.js` and reused on server and client.

## Extension Points

- Add additional controls to `Missing_Controls_Demo.compose_ui()`.
- Extend CSS in `Missing_Controls_Demo.css` for layout/styling.
- Attach new event handlers in `Missing_Controls_Demo.activate()`.
