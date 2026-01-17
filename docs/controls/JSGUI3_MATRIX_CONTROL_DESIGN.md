# jsgui3-html Matrix — High-Level Design

> **Status**: Draft
> **Scope**: Design spec for a reusable, general-purpose Matrix control in `jsgui3-html`.

---

## Executive Summary

This document proposes a unified **Matrix** for `jsgui3-html` that provides a robust, scalable grid component. It combines the structural benefits of HTML tables for small datasets with the performance of virtual scrolling for large datasets.

The design aligns with the **Window** architecture, using `jsgui.Control` inheritance, mixins, embedded CSS, and lifecycle methods like `activate()` for behavior.

---

## Architecture & Conventions

### Core Principles (aligned with `Window.js`)

1.  **Inheritance**: Extends `jsgui.Control`.
2.  **Embedded CSS**: Styles are defined in `static css` property. While the server supports SASS for `.scss` files, we use standard CSS in Javascript properties to ensure compatibility and simplicity, using CSS variables (`--var`) where dynamic values are needed.
3.  **Activation**: Interactivity (event listeners, scroll handling) is set up in `activate()`.
4.  **Options/Spec**: clearly defined `spec` object in constructor for configuration.
5.  **Accessibility**: Built-in A11y support using `control_mixins/a11y`.
6.  **Composition**: Chrome/Wrapper controls compose the core Matrix for advanced features (filtering, presets).

### Component Hierarchy

```
Matrix (extends Control)
├── MatrixTableRenderer (for small N)
└── MatrixVirtualRenderer (for large N)

MatrixChrome (extends Control)
├── Toolbar
│   ├── Filter Inputs
│   └── View Toggles
└── Matrix
```

---

## API Design

### Matrix

The main control that automatically handles rendering strategy.

```javascript
/* src/controls/matrix/matrix.js */

const Control = require('jsgui3-html').Control;
const { def, each } = require('jsgui3-html');
const { ensure_sr_text } = require('../../control_mixins/a11y');

class Matrix extends Control {
    constructor(spec) {
        super(spec);
        this.__type_name = 'matrix';
        this.add_class('matrix');

        // Core Data
        this.data = spec.data || []; // Array of objects or array of arrays
        this.columns = spec.columns || []; // Column definitions
        this.rows = spec.rows || []; // Row definitions (if explicit row headers needed)

        // Configuration
        this.virtual = spec.virtual || false; // Force virtual mode
        this.virtual_threshold = spec.virtual_threshold || 1000;
        
        // Layout
        this.cell_size = spec.cell_size || [100, 30];
        
        // State
        this.state = {
            sorted_by: null,
            filters: {},
            selected: []
        };
    }

    activate() {
        if (!this.__active) {
            super.activate();
            // Attach event listeners, scroll handlers, interactions
            this._setup_events();
        }
    }
}

// Embed CSS (standard pattern: ClassName.css = ...)
Matrix.css = `
    .matrix {
        position: relative;
        overflow: auto;
        border: 1px solid #ccc;
    }
    .matrix .cell {
        box-sizing: border-box;
    }
    .matrix .cell:hover {
        background-color: rgba(0,0,0,0.05);
    }
    .matrix .cell.selected {
        background-color: #e0e0e0; 
    }
    
    /* Angled Headers Support */
    .matrix .header-col.angled {
        height: 120px; /* Needs more vertical space */
        vertical-align: bottom;
    }
    .matrix .header-col.angled .label {
        transform: rotate(-45deg);
        transform-origin: bottom left;
        white-space: nowrap;
        width: 150px; /* overflow width */
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
    }
`;
```

### Configuration Objects

**Column Definition:**
```javascript
{
    key: 'id',
    label: 'ID',
    width: 60,
    sortable: true,
    // String/HTML renderer
    renderer: (value, record) => `<b>${value}</b>`,
    
    // Dynamic Cell Example
    // Takes value, the parent cell control, and the full record.
    // implementation: user function adds controls to the cell.
    composer: (value, cell_ctrl, record) => {
        const btn = new Button({ 
            context: cell_ctrl.context, 
            text: value 
        });
        btn.on('click', () => alert(record.id));
        cell_ctrl.add(btn);
    }
}
```

### Dynamic Cell Composition
For advanced scenarios, `composer` functions allow full access to `jsgui3` composition:
1.  **Context**: Access `cell_ctrl.context`.
2.  **Events**: Attach listeners directly to created controls.
3.  **Nesting**: Add complex layouts (e.g. `HorizontalMenu`) inside a single cell.


**Data Model:**
Flexible input support:
1.  **Array of Objects**: `[{ id: 1, name: 'A' }, { id: 2, name: 'B' }]`
2.  **Sparse/Coordinate**: `{ '0,0': val, '5,3': val }` (Good for grids)

---

## Features

### 1. Adaptive Rendering
*   **Table Mode**: Uses standard HTML `<table>`. Best for accessibility and simple layouts when `itemCount < threshold`.
*   **Virtual Mode**: Uses absolute positioning and windowing. Only renders visible cells. Best for performance.

### 2. Interaction (Window-like)
*   **Selection**: Uses `control_mixins/selectable` for robust selection logic.
    *   **Scope**: `Matrix` acts as the `selection_scope`.
    *   **Modes**: Support single, multiple (Ctrl/Shift), and toggle selection.
*   **Keyboard Nav**: Arrow keys to move focus active cell (ARIA grid pattern).
*   **Resize**: Column resizing (using `resizable` mixin concepts).

### 3. Visuals & Layout
*   **Angled Headers**: Support for 45° column headers to accommodate long labels in compact columns.
    *   Configurable via `header: { col: { angle: 45 } }`.
    *   Implemented using CSS transforms (`transform: rotate(-45deg)`).

### 4. Data Integration
*   **Data Models**: Supports `jsgui.Collection` and `Data_Object` for reactive updates.
*   **Virtual Grid**: Leverages patterns from `virtual_grid.js` for efficient data binding.

### 5. Chrome / Wrapper
A `MatrixChrome` control that wraps the `Matrix` to provide:
*   Search/Filter bar.
*   Pagination controls (if not virtual scrolling).
*   Status bar (counts, validation coverage).
*   Toggle views (e.g., transpose rows/cols).

---

## Migration & Implementation

### Current vs New
| Feature | Old Approaches | New Matrix |
| :: | :: | :: |
| **Logic** | Scattered in specific implementation | Centralized in `Matrix` |
| **Styling** | External CSS files | Embedded `static css` property |
| **A11y** | Minimal | `ensure_sr_text`, focus rings |
| **API** | App-specific props | Generic `columns`, `data` props |

### Implementation Plan
1.  **Core**: Implement `Matrix` skeleton with `Window` style setup.
2.  **Table Renderer**: Move logic from `MatrixTableControl` to `Matrix` (table mode).
3.  **Virtual Renderer**: Move logic from `VirtualMatrixControl` to `Matrix` (virtual mode).
4.  **Chrome**: Create `MatrixChrome` to handle the toolbar and wrapping of the generic matrix.

---

## References

*   `controls/organised/1-standard/6-layout/window.js` - Reference implementation for structure, CSS, and API.
