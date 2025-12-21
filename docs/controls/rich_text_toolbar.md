# Rich_Text_Toolbar Control

`Rich_Text_Toolbar` renders a configurable toolbar for rich text commands.

## Usage

```javascript
const toolbar = new controls.Rich_Text_Toolbar({
    context,
    buttons: [
        { command: 'bold', label: '<strong>B</strong>', title: 'Bold' },
        { command: 'italic', label: '<em>I</em>', title: 'Italic' },
        { type: 'separator' },
        { command: 'insertUnorderedList', label: 'List', title: 'Bullet List' }
    ]
});
```

## Button Definition

- `command` - Command name used by the editor.
- `label` - Button label (string or HTML).
- `title` - Tooltip text.
- `value` - Optional command value (e.g. `<h2>` for `formatBlock`).
- `handler` - Optional click handler.
- `type: 'separator'` - Separator entry.

## Notes

- Used by `Rich_Text_Editor`, but can be composed independently.
- Default buttons are exposed via `Rich_Text_Toolbar.DEFAULT_BUTTONS`.

## Tests

- `test/core/form_editor_features.test.js`
