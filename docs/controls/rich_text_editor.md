# Rich_Text_Editor Control

`Rich_Text_Editor` is a lightweight WYSIWYG editor built on `contenteditable` with a toolbar and optional markdown mode.

## Usage

```javascript
const rich_text_editor = new controls.Rich_Text_Editor({
    context,
    placeholder: 'Start typing...',
    initial_html: '<p>Hello</p>',
    allow_markdown: true,
    on_change: html => {
        // Handle HTML updates
    }
});
```

## Configuration

- `placeholder` - Placeholder text for HTML mode.
- `initial_html` - Initial HTML content.
- `initial_markdown` - Initial markdown content (converted to HTML).
- `allow_markdown` - Enable markdown toggle button.
- `markdown_mode` - Start in markdown mode.
- `toolbar_buttons` - Custom toolbar button definitions.
- `min_height` / `max_height` - Size constraints.
- `read_only` - Disable editing.
- `on_change` - Callback invoked with HTML string.

## Public API

- `get_html()` / `set_html(html)` - Read/write HTML.
- `get_markdown()` / `set_markdown(markdown)` - Read/write markdown.
- `toggle_markdown_mode(force)` - Toggle markdown mode.
- `get_text()` - Plain text content.
- `clear()` - Clear editor.
- `set_read_only(read_only)` - Toggle read-only mode.
- `focus()` - Focus the active editor.
- `get_character_count()` / `get_word_count()` - Content metrics.

## Notes

- Uses `Rich_Text_Toolbar` for formatting controls.
- Paste handling sanitizes HTML and strips unsafe tags/attributes.
- Markdown conversion is intentionally lightweight.
- Include `controls/organised/1-standard/1-editor/rich_text_editor.css` for styling.

## Tests

- `test/core/form_editor_features.test.js`

## Example

- `dev-examples/binding/form_editor_features`
