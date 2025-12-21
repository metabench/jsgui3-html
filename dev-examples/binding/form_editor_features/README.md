# Form Editor Features Demo

Demonstrates form validation routing, input masks, autosize textareas, rich text editing, and schema-driven object editing.

## Features

- Form container with field validation, inline messages, and status badges
- Input masking for date/phone/currency
- Autosize textarea behavior
- Rich text editor with toolbar and markdown toggle
- Object editor with schema-driven fields and add/remove

## Quick Start

```bash
# From the jsgui3-html root
node dev-examples/binding/form_editor_features/server.js
```

Open `http://localhost:52007` in your browser.

## Code Example

```javascript
const form_container = new controls.Form_Container({
    context,
    fields: [
        { name: 'full_name', label: 'Full name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true }
    ]
});

form_container.on('submit', event => {
    // event.values contains validated values
});
```

## Architecture

- Server renders the initial HTML using `jsgui3-server`.
- Client activates controls to attach events and update DOM state.
- `Form_Container` keeps values/validation in `Data_Object` models.
- `Rich_Text_Editor` uses `contenteditable` and a toolbar control.

## Extension Points

- Add custom field validators via `validator` or `validators` arrays.
- Customize toolbar buttons with `toolbar_buttons` in `Rich_Text_Editor`.
- Extend input masks with `mask_type` or `mask_pattern`.
- Provide a schema to `Object_Editor` to control field types and nesting.
