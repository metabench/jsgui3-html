# Naming Normalization Migration Guide

This guide helps migrate from deprecated camelCase control names to the canonical snake_case/Camel_Case naming convention.

## Overview

jsgui3-html follows these naming conventions (see `AGENTS.md`):

| Element | Convention | Example |
|---------|------------|---------|
| File names | `snake_case.js` | `form_field.js` |
| Class names | `Camel_Case` | `Form_Field` |
| Methods | `snake_case` | `get_value()` |
| Properties | `snake_case` | `input_control` |

Some legacy files used camelCase naming. These have been converted to aliases that emit deprecation warnings.

## Deprecated Names

| Deprecated | Replacement | File |
|------------|-------------|------|
| `FormField` | `Form_Field` | `form_field.js` |
| `PropertyEditor` | `Property_Editor` | `property_editor.js` |

## Migration Steps

### 1. Update Imports

**Before:**
```javascript
const { FormField, PropertyEditor } = require('jsgui3-html/controls/controls');

// Or direct imports
const FormField = require('jsgui3-html/controls/organised/1-standard/1-editor/FormField');
```

**After:**
```javascript
const { Form_Field, Property_Editor } = require('jsgui3-html/controls/controls');

// Or direct imports
const Form_Field = require('jsgui3-html/controls/organised/1-standard/1-editor/form_field');
```

### 2. Update Class References

**Before:**
```javascript
const field = new FormField({
    context,
    label: 'Email',
    type: 'email'
});
```

**After:**
```javascript
const field = new Form_Field({
    context,
    label: 'Email',
    type: 'email'
});
```

### 3. Update Method Calls

If using the deprecated `FormField`, note that its methods also used camelCase:

**Before:**
```javascript
field.setValue('test@example.com');
const value = field.getValue();
field.setValidation(true);
field.clearValidation();
field.setEnabled(false);
```

**After (using Form_Field):**
```javascript
field.set_value('test@example.com');
const value = field.get_value();
field.set_validation(true);
field.clear_validation();
field.set_enabled(false);
```

### 4. Update Property References

**Before (FormField):**
```javascript
field.labelContainer
field.inputContainer
field.validationIndicator
field.errorMessage
field.config.inputControl
```

**After (Form_Field):**
```javascript
field.label_container
field.input_container
field.validation_indicator
field.error_message
field.config.input_control
```

## Deprecation Timeline

| Version | Action |
|---------|--------|
| 0.0.177+ | Deprecation warnings emitted |
| 1.0.0 | Deprecated aliases removed |

## Automated Migration

You can use find-and-replace or a codemod to update your codebase:

### Simple Find/Replace

```
FormField → Form_Field
PropertyEditor → Property_Editor
setValue → set_value
getValue → get_value
setValidation → set_validation
clearValidation → clear_validation
setEnabled → set_enabled
labelContainer → label_container
inputContainer → input_container
validationIndicator → validation_indicator
errorMessage → error_message
inputControl → input_control
```

### Regex Pattern

```regex
# Find camelCase method calls on form fields
(\w+)\.(setValue|getValue|setValidation|clearValidation|setEnabled)\(

# Replace with snake_case
$1.set_value( (etc.)
```

## Suppressing Warnings

If you need to temporarily suppress deprecation warnings (not recommended):

```javascript
// Set before requiring deprecated modules
process.env.NODE_ENV = 'production';
```

Note: This suppresses ALL deprecation warnings, not just these.

## Verifying Migration

After migration, run your application in development mode. You should see no deprecation warnings related to `FormField` or `PropertyEditor`.

```bash
NODE_ENV=development node your-app.js
```

## Questions?

If you encounter issues during migration, check:
1. `AGENTS.md` for naming conventions
2. `docs/controls/form_field.md` for Form_Field documentation
3. `docs/controls/property_editor.md` for Property_Editor documentation
