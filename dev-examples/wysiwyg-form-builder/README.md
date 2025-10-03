# WYSIWYG Form Builder Example

A comprehensive visual form builder that demonstrates advanced jsgui3-html capabilities including complex UI composition, real-time property editing, and data persistence.

## Features

### 🎨 Visual Form Building
- **Click-to-Add Fields**: Click any field type in the palette to add it to your form
- **Live Preview**: Toggle between edit and preview modes to see your form in action
- **Drag Reordering**: Use ↑/↓ buttons to reorder fields
- **Field Selection**: Click fields to select and edit their properties

### 📝 Field Types Supported
- Text Input
- Email
- Password  
- Number
- Phone (tel)
- URL
- Text Area
- Dropdown/Select
- Checkbox

### ⚙️ Property Editing
- Label and placeholder text
- Field name/ID
- Required validation
- Field width (responsive)
- Dropdown options
- Real-time updates

### 💾 Data Persistence
- **localStorage**: Auto-saves your form as you work
- **JSON Export**: Download form definition as JSON
- **JSON Import**: Load previously exported forms
- **New/Clear**: Start fresh anytime

### 🎯 Preview Mode
- See exactly how your form will render
- Test form interactions
- Verify layout and styling
- Submit button included (non-functional in preview)

## Running the Example

```bash
node dev-examples/wysiwyg-form-builder/server.js
```

Then open: **http://localhost:52002**

## Quick Start Guide

### Building Your First Form

1. **Add Fields**
   - Click "Text Input" in the left palette
   - The field appears in the canvas
   - Notice it's automatically selected (blue border)

2. **Edit Properties**
   - Right panel shows field properties
   - Change "Label" to "Full Name"
   - Set "Placeholder" to "Enter your name"
   - Check "Required"

3. **Add More Fields**
   - Click "Email" to add an email field
   - Click "Text Area" for comments
   - Click "Dropdown" for a select field

4. **Edit Dropdown Options**
   - Select the dropdown field
   - In properties, edit "Options" (comma-separated)
   - e.g., "Small, Medium, Large"

5. **Reorder Fields**
   - Use ↑ ↓ buttons to move fields up/down
   - Build the perfect field order

6. **Preview Your Form**
   - Click "👁 Preview" in the toolbar
   - See your rendered form
   - Click "✏️ Edit" to return to editing

7. **Save Your Work**
   - Click "💾 Save" to persist to localStorage
   - Click "📥 Export" to download JSON
   - Click "📤 Import" to load a JSON form

## Architecture

### Component Structure

```
FormBuilder (Main Control)
├── Toolbar
│   ├── New, Save, Export, Import buttons
│   ├── Preview toggle
│   └── Clear button
├── Palette Panel (Left)
│   └── Field type buttons (PaletteItem)
├── Canvas Panel (Center)
│   ├── Form title editor
│   └── Field previews or rendered fields
└── Property Editor (Right)
    └── Dynamic property fields
```

### Key Classes

**FormBuilder** - Main control orchestrating the entire UI
- Manages form state (fields array, selection, mode)
- Handles field CRUD operations
- Coordinates between panels
- Implements persistence

**PaletteItem** - Clickable field type button
- Represents a draggable field type
- Icon + label display
- Click handler for adding fields

**FormFieldPreview** - Edit mode field representation
- Shows field type and properties
- Move up/down buttons
- Selection highlighting
- Click to select

**PropertyEditor** - Dynamic property panel (from controls/)
- Renders properties based on field type
- Real-time onChange callbacks
- Delete button
- Text inputs, checkboxes for properties

**Toolbar** - Top action bar (from controls/)
- Flexible button container
- Icon + label buttons
- Separators and spacers

### Data Model

```javascript
{
  formTitle: "My Form",
  fields: [
    {
      type: "text",
      label: "Full Name",
      name: "fullName",
      placeholder: "Enter your name",
      required: true,
      width: "100"
    },
    {
      type: "email",
      label: "Email Address",
      name: "email",
      placeholder: "you@example.com",
      required: true,
      width: "100"
    },
    {
      type: "select",
      label: "Size",
      name: "size",
      options: ["Small", "Medium", "Large"],
      required: false,
      width: "50"
    }
  ],
  selectedFieldIndex: 0,
  mode: "edit" // or "preview"
}
```

## Technical Highlights

### 1. Isomorphic Rendering
- Form builder UI renders on server
- Hydrates on client with full interactivity
- Same code runs in both environments

### 2. MVVM Data Binding
- Model changes automatically update view
- Computed properties for UI state
- Watch API for reactive updates

### 3. Compositional Architecture
- Modular control system
- Reusable components (Toolbar, PropertyEditor, FormField)
- Clean separation of concerns

### 4. localStorage Integration
- Auto-save on every change
- Restore on page load
- Non-blocking, client-only

### 5. JSON Export/Import
- Clean, portable form definitions
- File download via Blob API
- File upload via FileReader API

## Extending the Builder

### Adding New Field Types

1. Add to palette in `_createPalette()`:
```javascript
{ type: 'date', icon: '📅', label: 'Date Picker' }
```

2. Handle rendering in `FormFieldPreview._renderPreview()`:
```javascript
if (type === 'date') {
    inputPreview.add('📅 Select date...');
}
```

3. Add property editors in `PropertyEditor.loadItem()` as needed

### Custom Validations

Extend FormField component to add:
- Pattern validation
- Min/max length
- Custom validator functions
- Async server-side validation

### Advanced Features Ideas

- **Drag & Drop**: Use `mx.dragable` mixin for true drag-drop
- **Field Grouping**: Add sections/fieldsets
- **Conditional Logic**: Show/hide fields based on values
- **Templates**: Save and load form templates
- **Code Generation**: Generate HTML/React/Vue from JSON
- **Styling Options**: Custom colors, fonts, layouts
- **Collaboration**: Real-time multi-user editing
- **Validation Rules**: Visual rule builder
- **Database Integration**: Save forms to backend
- **Form Submission**: Connect to actual endpoints

## Files

- `client.js` - Main application code (585 lines)
- `server.js` - Server configuration and startup
- `styles.css` - Comprehensive UI styling
- `README.md` - This documentation

## Learning Points

This example demonstrates:

✅ Complex UI composition with nested controls  
✅ Dynamic component creation and destruction  
✅ Property-driven UI updates  
✅ Client-side state management  
✅ localStorage for persistence  
✅ File I/O (JSON export/import)  
✅ Mode switching (edit/preview)  
✅ Selection and focus management  
✅ Responsive three-panel layout  
✅ Real-time property editing  
✅ Keyboard and mouse interactions  
✅ CSS-in-JS for component styles  

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support
- localStorage API required for persistence
- File API required for import/export

## Next Steps

Try building:
- A contact form
- A survey form
- A registration form
- An order form
- A feedback form

Then export the JSON and use it in your actual applications!

## Related Examples

- **counter/** - Basic MVVM binding with history
- **user-form/** - Form validation patterns

## License

Part of jsgui3-html examples (MIT License)
