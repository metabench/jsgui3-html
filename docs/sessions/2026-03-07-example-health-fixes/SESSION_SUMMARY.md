# Session Summary

**Date**: 2026-03-07
**Topic**: Example Health Fixes

## Completed
- Fixed the shared dev-example bundling path so server-backed demos now emit real client bundles instead of the fallback stub.
- Repaired the broken demos identified in the audit:
  - `counter`
  - `data-controls`
  - `form_editor_features`
  - `layout-controls`
  - `missing-controls`
  - `showcase_app`
  - `user-form`
  - `rich-text-editor`
  - `wysiwyg-form-builder`
- Repaired stale standalone examples:
  - `binding_simple_counter.js`
  - `binding_data_grid.js`
  - `ex_data-transform-resource.js`
- Fixed shared control issues uncovered by the demos:
  - `Pagination` SSR page labels
  - `Color_Picker` hydration refs
  - `Datetime_Picker` SSR composition
  - `Toolbar` SSR type tagging
  - `Property_Editor` SSR type tagging

## Not Completed
- Broad cleanup of the long-standing case-sensitive `require(...)` warnings emitted during bundling.
- Favicon routing for demo servers.

## Follow-ups
- [ ] Clean up legacy case mismatches in `require(...)` paths so demo/test stderr is readable.
- [ ] Add a shared favicon or quiet route for demo servers if the noise becomes a testing problem.

## Lessons Learned
- Demo activation should not assume constructor-created child refs survive SSR; use `data-jsgui-ctrl` and `_wire_jsgui_ctrls()` for any control tree that needs to reconnect after activation.
- Example code using `Data_Object#get(...)` must normalize `Data_Value` wrappers before mutating arrays or comparing primitive values.

## Files Changed
- `controls/organised/0-core/0-basic/1-compositional/Color_Picker.js`
- `controls/organised/0-core/0-basic/1-compositional/Datetime_Picker.js`
- `controls/organised/1-standard/1-editor/Property_Editor.js`
- `controls/organised/1-standard/5-ui/Pagination.js`
- `controls/organised/1-standard/5-ui/Toolbar.js`
- `dev-examples/binding/showcase_app/client.js`
- `dev-examples/binding/user-form/client.js`
- `dev-examples/rich-text-editor/client.js`
- `dev-examples/wysiwyg-form-builder/client.js`
- `examples/ex_data-transform-resource.js`

## Verification
- Full `dev-examples/*/server.js` startup sweep: all 10 demos returned `200` for `/` and `/js/js.js`, and all bundles were real output rather than the fallback stub.
- Full `examples/*.js` script sweep: all 8 standalone examples exited successfully.
- Browser smoke:
  - `data-controls`: filter + grid selection passed
  - `layout-controls`: stepper + drawer passed
  - `wysiwyg-form-builder`: add field + preview mode passed
- E2E / focused tests:
  - `test/core/missing_controls.test.js`: passing
  - `test/e2e/missing-controls.test.js`: passing
  - `test/e2e/picker_controls_e2e.test.js`: passing
  - `test/e2e/form_editor_features.test.js`: passing
  - `test/e2e/property-grid.test.js`: passing
