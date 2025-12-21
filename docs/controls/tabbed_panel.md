# Tabbed Panel Control

The `Tabbed_Panel` control renders tabbed content with optional vertical, icon, and overflow variants.

## Usage

```javascript
const tabbed_panel = new controls.Tabbed_Panel({
    context,
    tabs: [
        { title: 'Overview', content: 'Overview content' },
        { title: 'Details', content: 'Details content', icon: 'info' }
    ],
    tab_bar: {
        position: 'left',
        variant: 'icon',
        overflow: true,
        max_tabs: 3
    }
});
```

## Tab Bar Options

- `position` - `top`, `bottom`, `left`, or `right`.
- `variant` - `icon` to render icons when provided in tab definitions.
- `overflow` - Enable overflow select control.
- `max_tabs` - Max visible tabs before overflow.

## Notes

- Overflow tabs are accessible via a select element.
- Tab definitions can be strings, arrays, controls, or objects.

## Tests

- `test/core/layout_controls.test.js`
- `test/e2e/layout-controls.test.js`
