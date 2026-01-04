# Naming Audit Results

Date: 2026-01-02

## Summary

The codebase contained duplicate control files that differed only by casing. These were resolved by selecting snake_case filenames as canonical and converting camelCase files into deprecated aliases.

## Findings

### Form Field

- **Duplicate files**: `FormField.js` vs `form_field.js`
- **Canonical file**: `controls/organised/1-standard/1-editor/form_field.js`
- **Alias file**: `controls/organised/1-standard/1-editor/FormField.js` (deprecated; emits warning)
- **Canonical class**: `Form_Field`

### Property Editor

- **Duplicate files**: `PropertyEditor.js` vs `property_editor.js`
- **Canonical file**: `controls/organised/1-standard/1-editor/property_editor.js`
- **Alias file**: `controls/organised/1-standard/1-editor/PropertyEditor.js` (deprecated; emits warning)
- **Canonical class**: `Property_Editor`

## Notes

- Deprecated aliases will be removed in v1.0.0.
- Internal imports should reference canonical snake_case files and Camel_Case class names.
