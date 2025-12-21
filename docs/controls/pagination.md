# Pagination Control

The `Pagination` control renders page controls with previous/next buttons.

## Usage

```javascript
const pagination = new controls.Pagination({
    context,
    page: 1,
    page_count: 5
});
```

## Public API

- `set_page(page)` - Set the current page.
- `set_page_count(page_count)` - Set the total page count.

## Events

- `page_change` with `{ page, page_count }`.

## Tests

- `test/core/missing_controls.test.js`
