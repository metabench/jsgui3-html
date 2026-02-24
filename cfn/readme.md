# cfn — Control Factory Functions

This directory contains factory functions for creating controls using a functional programming style. Instead of instantiating control classes directly, these functions compose controls declaratively.

## Concept

Traditional control creation requires imperative class instantiation:

```javascript
const item = new Item({ context: ctx });
const left = new Control({ context: ctx });
const right = new Control({ context: ctx });
item.add(left);
item.add(right);
```

Factory functions express the same intent more concisely:

```javascript
const item = left_right(ctx, left_content, right_content);
```

## Files

| File | Description |
|------|-------------|
| `left-right.js` | Left-right layout factory (currently delegated to `Item` control) |

## Status

This module is in early development. The existing `left-right.js` is a placeholder — its functionality currently lives in the `Item` control. Future factory functions will provide concise compositional shortcuts for common control patterns.

## Related

- [controls/README.md](../controls/README.md) — Full control catalog
- [html-core/README.md](../html-core/README.md) — Core framework with `parse_mount` (declarative HTML-to-control)
