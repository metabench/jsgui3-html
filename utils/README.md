# Utils

Shared utility functions for jsgui3-html.

## Files

| File | Purpose |
|------|---------|
| `index.js` | Main entry point — re-exports all utilities |
| `deprecation.js` | Deprecation warning system |

## Deprecation Utilities

The deprecation module provides functions for maintaining backwards-compatible API changes while warning developers to migrate.

```javascript
const { deprecation_warning, create_deprecated_alias } = require('jsgui3-html/utils');
```

### `deprecation_warning(old_name, new_name, removal_version)`

Emits a one-time console warning that `old_name` is deprecated in favor of `new_name`. Suppressed in production (`NODE_ENV=production`). Each unique warning is shown only once per process.

```javascript
deprecation_warning('FormField', 'Form_Field', '1.0.0');
// [jsgui3-html] DEPRECATED: "FormField" is deprecated. Use "Form_Field" instead.
// This will be removed in v1.0.0.
```

### `create_deprecated_alias(canonical_module, old_name, new_name, removal_version)`

Creates a module alias that emits a deprecation warning on first use, then returns the canonical module.

```javascript
// In controls.js
controls.FormField = create_deprecated_alias(Form_Field, 'FormField', 'Form_Field');
```

## Related

- [controls/controls.js](../controls/controls.js) — Uses deprecation aliases for renamed controls
