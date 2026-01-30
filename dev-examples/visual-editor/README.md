# Visual Editor Controls Demo

This example demonstrates the Selection Handles and Property Grid controls for building visual editors.

## Features

### Selection Handles
- **Resize Handles**: 8-direction resize handles (N, S, E, W, NE, NW, SE, SW)
- **Move Handle**: Frame for moving elements
- **Constraints**: Min/max size constraints
- **Aspect Ratio**: Optional aspect ratio locking
- **Visual Feedback**: Real-time size and position display

### Property Grid
- **Data Binding**: Binds to Data_Object models via MVVM
- **Schema-based**: Define property types and categories
- **Categories**: Organize properties into collapsible groups
- **Search**: Filter properties by name
- **Type Support**: Text, number, boolean, color, etc.
- **Events**: Property change and property changing (cancelable)

## Running the Demo

```bash
node server.js
```

Then open http://localhost:52011 in your browser.

## Architecture

### Selection Handles

Selection handles provide visual feedback and interaction for resizing elements in a visual editor.

```javascript
const selection_handles = new Selection_Handles({
    context,
    target: element,
    handle_size: 8,
    handle_style: 'square',  // 'square', 'circle', or 'diamond'
    min_size: { width: 50, height: 50 },
    max_size: { width: 500, height: 300 },
    maintain_aspect: false
});

selection_handles.on('resize-move', e => {
    console.log('New size:', e.width, 'x', e.height);
    console.log('New position:', e.x, e.y);
});
```

### Property Grid

The property grid provides a UI for editing object properties with type-specific editors.

```javascript
const { Data_Object } = require('lang-tools');

const model = new Data_Object({
    name: 'Button1',
    x: 100,
    y: 80,
    width: 200,
    height: 150
});

const schema = [
    { name: 'name', label: 'Name', type: 'text', category: 'General' },
    { name: 'x', label: 'X Position', type: 'number', category: 'Layout' },
    { name: 'y', label: 'Y Position', type: 'number', category: 'Layout' },
    { name: 'width', label: 'Width', type: 'number', category: 'Layout' },
    { name: 'height', label: 'Height', type: 'number', category: 'Layout' }
];

const property_grid = new Property_Grid({
    context,
    target: model,
    schema: schema,
    show_categories: true,
    show_search: true
});

property_grid.on('property-change', e => {
    console.log(`${e.property} changed from ${e.old_value} to ${e.new_value}`);
});
```

## Visual Editor Pattern

Combining selection handles and property grid creates a complete visual editing experience:

1. **Selection**: Click an element on the canvas to select it
2. **Resize**: Drag handles to resize the selected element
3. **Edit Properties**: Use the property grid to edit element properties
4. **Sync**: Changes in the property grid update the visual element
5. **Undo/Redo**: Changes can be integrated with Undo_Redo_Manager

## Code Examples

### Custom Property Editors

Register custom editors for specific property types:

```javascript
property_grid.register_editor('color', Color_Picker);
property_grid.register_editor('font', Font_Picker);
property_grid.register_editor('anchor', Anchor_Editor);
```

### Filtering Properties

Filter visible properties dynamically:

```javascript
property_grid.filter('layout'); // Show only layout properties
property_grid.filter(''); // Show all properties
```

### Cancelable Property Changes

Prevent invalid property changes:

```javascript
property_grid.on('property-changing', e => {
    if (e.property === 'width' && e.new_value < 0) {
        e.cancel = true; // Cancel the change
    }
});
```

## Testing

The demo includes data-test attributes for E2E testing:

- `data-test="selection-handles"` - Selection handles component
- `data-test="property-grid"` - Property grid component

## Extension Points

### Custom Handle Styles

Extend selection handles with custom handle rendering:

```javascript
class My_Selection_Handles extends Selection_Handles {
    _create_handle(direction) {
        // Custom handle creation
    }
}
```

### Custom Property Editors

Create custom editors for specific property types:

```javascript
class My_Custom_Editor extends Control {
    get_value() { /* ... */ }
    set_value(value) { /* ... */ }
}

property_grid.register_editor('my_type', My_Custom_Editor);
```

## Browser Compatibility

- **Modern Browsers**: Full functionality with pointer events
- **Server-Side Rendering**: Full SSR support
- **Touch Devices**: Touch-compatible handle dragging

## Related Controls

- `Snap_Guide_Overlay` - Snapping guides for alignment
- `Color_Picker` - Color property editor
- `Font_Picker` - Font property editor
- `Anchor_Editor` - Anchor position editor
- `Dock_Editor` - Dock position editor
- `Undo_Redo_Manager` - Undo/redo for property changes
