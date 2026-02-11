# Skeleton_Loader Control

Animated shimmer placeholders for loading states.

## Usage

```javascript
// Multi-line text skeleton
const textSkeleton = new Skeleton_Loader({
    context,
    variant: 'text',
    lines: 3
});

// Circle skeleton (avatar placeholder)
const circleSkeleton = new Skeleton_Loader({
    context,
    variant: 'circle'
});

// Card skeleton
const cardSkeleton = new Skeleton_Loader({
    context,
    variant: 'card',
    width: '300px'
});
```

## Public API

- `variant` — Shape: `'text'`|`'circle'`|`'rect'`|`'card'`
- `lines` — Number of text lines (for `'text'` variant, min 1)
- `animate` — Whether shimmer animation is active
- `set_animate(bool)` — Toggle animation

## Variants

| Variant | Description |
|---------|-------------|
| `text` | Horizontal lines (last line is 60% width) |
| `circle` | 40px circle |
| `rect` | Full-width rectangle |
| `card` | Bordered card with header bone |

## Notes

- Uses `@keyframes skeleton-shimmer` for the shimmer effect
- Custom `width`/`height` can be set via spec
- `no-animate` class disables shimmer, shows flat gray

## Tests

- `test/controls/skeleton_loader.test.js` — 8 tests
