# Form and Editor Features

Each checklist item should include tests and documentation updates.

## Form container with validation routing
- [x] Create `controls/organised/1-standard/1-editor/form_container.js` with class `Form_Container`.
- [x] Model: `Data_Object` for values and validation state.
- [x] Provide `validate()` and `submit()`; support field validators.
- [x] Integrate with `inline_validation_message`.
- [x] Export, example, E2E tests for validation flow.

## Field-level error display + status badges
- [x] Standardize CSS classes and status tokens for errors.
- [x] Add helpers to attach `aria-invalid` and `aria-describedby`.
- [x] Document usage with `inline_validation_message` and `badge`.

## Input masking
- [x] Create helper or mixin for `text_input` and `textarea`.
- [x] Support date, currency, phone with pluggable patterns.
- [x] Add tests for masking behavior and raw value access.

## Autosize textarea
- [x] Add autosize mode to `Textarea` or a compositional wrapper.
- [x] Use hidden sizer or scrollHeight with DOM guard.
- [x] Add tests for resize on input.

## Rich text editor improvements
- [x] Add toolbar control and formatting commands.
- [x] Optional markdown mode; add paste sanitization.
- [x] Update docs and add example.

## Object editor improvements
- [x] Add schema-driven rendering and key/value add/remove.
- [x] Support expand/collapse per object node.
- [x] Update tests and example.
