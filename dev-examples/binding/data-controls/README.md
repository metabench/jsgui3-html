# Data Controls Demo

This dev example showcases the data and collection controls (tables, grids, virtualization, and layouts).

## Features

- Data table with sorting, filtering, and pagination
- Data grid with a `data_source` function and selection output
- Virtual list and virtual grid windowing
- Tree table with expand/collapse
- Reorderable list with drag-and-drop and keyboard support
- Master/detail split view

## Quick Start

```bash
node dev-examples/binding/data-controls/server.js
```

Open `http://localhost:52005`.

## Code Example

```javascript
const data_grid = new controls.Data_Grid({
    context,
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' }
    ],
    data_source: ({ sort_state }) => {
        const rows = load_rows();
        if (sort_state) {
            rows.sort((a, b) => a.name.localeCompare(b.name));
        }
        return rows;
    }
});

const reorderable_list = new controls.Reorderable_List({
    context,
    items: ['Alpha', 'Beta', 'Gamma']
});
```

## Architecture

- Server renders `Data_Controls_Demo` using `jsgui3-server`.
- Client bundle hydrates the DOM and wires interactivity in `activate()`.
- Controls are composed in `client.js` and reused on server and client.

## Extension Points

- Add new controls in `Data_Controls_Demo.compose_ui()`.
- Update table/grid data sources to pull from APIs.
- Extend styling in `Data_Controls_Demo.css`.
