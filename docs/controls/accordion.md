# Accordion Control

The `Accordion` control composes `Vertical_Expander` sections for collapsible content.

## Usage

```javascript
const accordion = new controls.Accordion({
    context,
    allow_multiple: false,
    sections: [
        { id: 'one', title: 'Section One', content: 'Alpha', open: true },
        { id: 'two', title: 'Section Two', content: 'Beta' }
    ]
});
```

## Public API

- `set_sections(sections)` - Set section definitions.
- `set_open_ids(open_ids)` - Set open section ids.
- `get_open_ids()` - Get open section ids.
- `toggle_section(section_id)` - Toggle a section.

## Events

- `toggle` - Raised when open sections change.

## Notes

- Uses `Vertical_Expander` for open/close animations.
- Supports single-open or multi-open via `allow_multiple`.

## Tests

- `test/core/layout_controls.test.js`
- `test/e2e/layout-controls.test.js`
