# Rich Text Editor Demo

A simple demonstration of the `Rich_Text_Editor` control, showcasing its basic features and API.

## Features Demonstrated

- **Basic Formatting**: Bold, italic, underline
- **Lists**: Ordered and unordered
- **Links**: Insert and remove hyperlinks
- **Clear Formatting**: Strip all formatting
- **HTML Output**: View the generated HTML
- **Plain Text Extraction**: Get text without markup
- **Character/Word Count**: Real-time statistics
- **Read-only Mode**: Toggle editing capability
- **Clean Paste**: Automatic formatting removal from pasted content

## Running the Demo

```bash
node dev-examples/rich-text-editor/server.js
```

Then open: **http://localhost:52010**

## Usage

1. **Type and Format**
   - Type text in the editor
   - Select text and click toolbar buttons to format
   - Use keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)

2. **Create Lists**
   - Click bullet or numbered list button
   - Type list items, press Enter for new items

3. **Add Links**
   - Select text
   - Click link button
   - Enter URL when prompted

4. **View Output**
   - HTML output updates automatically as you type
   - Shows sanitized HTML markup

5. **Test Features**
   - Click "Get HTML" to see full HTML in alert
   - Click "Get Plain Text" to extract text only
   - Click "Clear Content" to reset editor
   - Click "Toggle Read-Only" to disable editing

## API Methods

The Rich_Text_Editor control provides:

```javascript
// Get/Set content
const html = rte.get_html();
rte.set_html('<p>New content</p>');

// Get plain text
const text = rte.get_text();

// Clear editor
rte.clear();

// Check if empty
const empty = rte.is_empty();

// Read-only mode
rte.set_read_only(true);

// Focus editor
rte.focus();

// Get statistics
const chars = rte.get_character_count();
const words = rte.get_word_count();
```

## Implementation Notes

This demo shows the Phase 1 (MVP) implementation. See the control's source code comments for extensive documentation on planned enhancements in future phases.

## Files

- `client.js` - Demo application (180 lines)
- `server.js` - Server configuration
- `styles.css` - Demo-specific styling
- `README.md` - This documentation

## Related Controls

- `Form_Field` - Can use Rich_Text_Editor as input control
- `Text_Input` - Simple single-line alternative
- `Textarea` - Simple multi-line alternative

## Next Steps

Try integrating the Rich_Text_Editor into a form:

```javascript
const FormField = require('../../controls/organised/1-standard/1-editor/FormField');
const Rich_Text_Editor = require('../../controls/organised/1-standard/1-editor/Rich_Text_Editor');

const rte = new Rich_Text_Editor({
    context,
    placeholder: 'Enter description...',
    min_height: '200px'
});

const field = new FormField({
    context,
    label: 'Description',
    name: 'description',
    inputControl: rte
});
```

This allows the rich text editor to be used in any form with validation and styling.
