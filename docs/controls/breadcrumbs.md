# Breadcrumbs Control

The `Breadcrumbs` control renders a navigation trail from an items list.

## Usage

```javascript
const breadcrumbs = new controls.Breadcrumbs({
    context,
    items: [
        { label: 'Home', href: '/' },
        { label: 'Settings', href: '/settings' },
        { label: 'Profile' }
    ]
});
```

## Public API

- `set_items(items)` - Replace breadcrumb items.
- `get_items()` - Get breadcrumb items.

## Events

- `navigate` with `{ index, item }` on click.

## Tests

- `test/core/missing_controls.test.js`
