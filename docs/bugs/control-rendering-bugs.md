# Control Rendering Bugs Documentation

This document details bugs discovered during rendering tests of jsgui3-html controls. These bugs prevent controls from rendering correctly and need to be fixed for proper functionality.

## Bugs Found

### 1. Text_Input Control - Value Not Set in DOM Attributes
**File:** `controls/organised/0-core/0-basic/0-native-compositional/Text_Input.js`
**Issue:** When `spec.value` is provided, it sets `this.data.model.value` but does not set `this.dom.attributes.value`, so the rendered HTML does not include the initial value.
**Test Failure:** `AssertionError: expected undefined to equal 'test value'`
**Severity:** Medium
**Fix:** In the constructor, after setting `this.data.model.value = spec.value;`, also set `this.dom.attributes.value = spec.value;`

### 2. Radio_Button Control - Text Not Set from Spec
**File:** `controls/organised/0-core/0-basic/0-native-compositional/radio-button.js`
**Issue:** The control does not set `this.text` from `spec.text` or `spec.label`, so labels are not rendered.
**Test Failure:** `AssertionError: expected '<div...' to include 'Option 1'`
**Severity:** Low
**Fix:** Added `if (spec.text) this.text = spec.text; if (spec.label) this.text = spec.label;` in constructor.

### 3. Text_Field Control - ReferenceError: value is not defined
**File:** `controls/organised/0-core/0-basic/1-compositional/Text_Field.js`
**Issue:** Line 374: `value is not defined` - likely a variable scoping issue in the constructor.
**Test Failure:** `ReferenceError: value is not defined`
**Severity:** High
**Fix:** Needs investigation of the Text_Field constructor code.

### 4. List Control - Items Not Rendered
**File:** `controls/organised/0-core/0-basic/1-compositional/list.js`
**Issue:** When `spec.items` is provided, the control does not render the items in the HTML.
**Test Failure:** `AssertionError: expected '<ul...' to include 'Item 1'`
**Severity:** Medium
**Fix:** The List control needs to process `spec.items` in the constructor or compose method.

### 5. Form_Field Control - Validation_Status_Indicator State Undefined
**File:** `controls/organised/1-standard/1-editor/form_field.js` and `controls/organised/0-core/0-basic/1-compositional/Validation_Status_Indicator.js`
**Issue:** Form_Field creates a Validation_Status_Indicator, but the indicator tries to access `this.state` which is undefined.
**Test Failure:** `TypeError: Cannot read properties of undefined (reading 'state')`
**Severity:** High
**Fix:** Validation_Status_Indicator constructor needs to initialize `this.state` or handle undefined state.

### 6. Panel Control - Title Not Rendered
**File:** `controls/organised/1-standard/6-layout/panel.js`
**Issue:** When `spec.title` is provided, it's not included in the rendered HTML.
**Test Failure:** `AssertionError: expected '<div...' to include 'Test Panel'`
**Severity:** Low
**Fix:** Panel control needs to render the title in compose method.

### 7. Tabbed_Panel Control - Not Yet Implemented
**File:** `controls/organised/1-standard/6-layout/tabbed-panel.js`
**Issue:** Throws "NYI" error, indicating the control is not implemented.
**Test Failure:** `Error: the string "NYI" was thrown`
**Severity:** High
**Fix:** Implement the Tabbed_Panel control functionality.

### 8. Window Control - jsgui.controls.Button Not Constructor
**File:** `controls/organised/1-standard/6-layout/window.js`
**Issue:** Line 41 tries to create `new jsgui.controls.Button`, but `jsgui.controls` is not defined or Button is not available there.
**Test Failure:** `TypeError: jsgui.controls.Button is not a constructor`
**Severity:** High
**Fix:** Use `new controls.Button` or import Button properly.

### 9. Validation_Status_Indicator Control - State Undefined
**File:** `controls/organised/0-core/0-basic/1-compositional/Validation_Status_Indicator.js`
**Issue:** Line 134 tries to access `this.state` which is undefined.
**Test Failure:** `TypeError: Cannot read properties of undefined (reading 'state')`
**Severity:** High
**Fix:** Initialize `this.state` in the constructor.

### 10. Select_Options Control - jsgui.option Not Defined
**File:** `controls/organised/0-core/0-basic/0-native-compositional/Select_Options.js`
**Issue:** Line 88: `new jsgui.option` - `jsgui.option` is not defined.
**Severity:** High
**Fix:** Define or import the option control, or use a different approach for creating option elements.

## Summary

- **Total Bugs:** 10
- **High Severity:** 5 (Text_Field, Form_Field, Tabbed_Panel, Window, Validation_Status_Indicator)
- **Medium Severity:** 3 (Text_Input, List, Select_Options)
- **Low Severity:** 2 (Radio_Button, Panel)

## Next Steps

1. Fix high-severity bugs first to enable basic functionality
2. Implement missing controls (Tabbed_Panel)
3. Improve test coverage for edge cases
4. Add integration tests for complex control interactions

## Testing Notes

- Tests run with Mocha and Chai
- Uses jsdom for DOM simulation
- 12 controls pass rendering tests, 9 fail
- Fixed bugs: Text_Input type attribute, Checkbox/Radio_Button text handling, Select_Options options format