# Validation

The `validation/` directory provides a validation engine and error display components for jsgui3-html controls.

## Files

| File | Purpose |
|------|---------|
| `index.js` | Main entry point — exports `Validation_Engine`, `default_engine`, `format_message`, `Error_Summary` |
| `validation_engine.js` | Core validation engine with built-in validators and message formatting |
| `error_summary.js` | `Error_Summary` control — displays a list of validation errors |

## Usage

```javascript
const { Validation_Engine, default_engine, format_message, Error_Summary } = require('jsgui3-html/validation');
```

### Validation_Engine

The engine runs validators against field values and returns structured results:

```javascript
const engine = new Validation_Engine();

// Register a validator
engine.add_rule('email', {
    required: true,
    pattern: /^[^@]+@[^@]+\.[^@]+$/,
    message: 'Please enter a valid email address'
});

// Validate a value
const result = engine.validate('email', 'user@example.com');
// { valid: true, errors: [] }
```

### default_engine

A pre-configured `Validation_Engine` instance with common validators ready to use.

### format_message

Formats validation error messages with interpolated field values:

```javascript
const msg = format_message('{{field}} must be at least {{min}} characters', {
    field: 'Password',
    min: 8
});
// "Password must be at least 8 characters"
```

### Error_Summary

A control that renders a list of validation errors. Typically placed at the top or bottom of a form.

```javascript
const summary = new Error_Summary({
    context: ctx,
    errors: [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password too short' }
    ]
});
```

## Related

- [html-core/Control_Validation.js](../html-core/Control_Validation.js) — Control-level validation integration
- [html-core/Transformations.js](../html-core/Transformations.js) — Validators (required, email, URL, range, pattern)
- [html-core/DATA_BINDING.md](../html-core/DATA_BINDING.md) — Binding-level validation
- [controls/organised/1-standard/1-editor/form_container.js](../controls/organised/1-standard/1-editor/form_container.js) — Form with validation routing
- [controls/organised/1-standard/1-editor/inline_validation_message.js](../controls/organised/1-standard/1-editor/inline_validation_message.js) — Inline error display
