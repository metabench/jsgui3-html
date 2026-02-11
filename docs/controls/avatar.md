# Avatar Control

Displays a user image, initials, or fallback icon in a circle or square.

## Usage

```javascript
const avatar = new Avatar({
    context,
    initials: 'JD',
    avatar_size: 'lg',
    status: 'online',
    bg_color: '#3b82f6'
});
```

## Public API

- `src` — Image URL
- `initials` — Fallback initials (truncated to 2 chars)
- `avatar_size` — Size: `'xs'`|`'sm'`|`'md'`|`'lg'`|`'xl'`
- `shape` — Shape: `'circle'`|`'square'`
- `status` — Status dot: `'online'`|`'offline'`|`'busy'`|`'away'`
- `set_src(url)` — Change image (recomposes)
- `set_initials(text)` — Change initials (recomposes)
- `set_status(status)` — Change status indicator

## Priority

Image > Initials > Fallback icon (`👤`)

## Notes

- Uses `avatar_size` instead of `size` to avoid collision with `Control.size`
- Status dot positioned bottom-right with a white border ring
- Size-appropriate status dot scaling

## Tests

- `test/controls/avatar.test.js` — 10 tests
