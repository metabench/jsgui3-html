# Detailed Bug Fix Plans for jsgui3-html Controls

This document provides comprehensive analysis, diagnostic testing, and detailed fix plans for the critical bugs identified in the control rendering tests.

## Overview

Based on static analysis and diagnostic testing, 5 high-priority bugs were identified that prevent proper control rendering. Each bug includes:

- Root cause analysis
- Diagnostic test results
- Detailed fix implementation
- Code examples
- Testing verification steps

## 1. Text_Field Value Assignment Bug

### Root Cause
**File:** `controls/organised/0-core/0-basic/1-compositional/Text_Field.js`
**Line 374:** `this.data.model.value = value;` where `value` is undefined

The code attempts to assign `value` to the data model, but `value` is not defined in scope. It should use `spec.value` instead.

### Diagnostic Test Results
```
ReferenceError: value is not defined
    at new Text_Field (controls/organised/0-core/0-basic/1-compositional/Text_Field.js:374:28)
```

### Fix Implementation

**Current Code (Broken):**
```javascript
if (spec.value !== undefined) {
    this.data.model.value = value;  // 'value' is undefined
}
```

**Fixed Code:**
```javascript
if (spec.value !== undefined) {
    this.data.model.value = spec.value;  // Use spec.value instead of undefined 'value'
}
```

### Action Items
- Update `controls/organised/0-core/0-basic/1-compositional/Text_Field.js` so the constructor uses `spec.value` and propagates the same value to any nested controls (view model, text input DOM attributes) prior to activation.
- Expand the Text_Field rendering test suite to assert the initial value appears both in the data model and `this.dom.attributes.value`, guarding against regressions.
- Capture diagnostics about the failure mode (ReferenceError) in the repo issue tracker once the fix is applied so the target can be retired.

### Implementation Workflow
1. Edit the constructor logic in `Text_Field.js`, replacing the undefined `value` usage and ensuring the DOM state mirrors the data model before `activate`.
2. Run the focused diagnostic command (`npx mocha test/diagnostic-bugs.test.js --grep "Text_Field Value Assignment Bug" --require test/setup.js`) to confirm the stack trace disappears.
3. Execute the broader rendering suite (`npx mocha test/rendering.test.js`) to ensure the control still mounts correctly with different specs.
4. Update this document with a short note summarizing the verification steps and mark the bug as resolved when tests pass.

### Testing Verification
After fix, run diagnostic test:
```bash
npx mocha test/diagnostic-bugs.test.js --grep "Text_Field Value Assignment Bug" --require test/setup.js
```

Expected: Tests should pass without ReferenceError.

## 2. Validation_Status_Indicator State Initialization Bug

### Root Cause
**File:** `controls/organised/0-core/0-basic/1-compositional/Validation_Status_Indicator.js`
**Line 134:** `this.data.model.validation.state.on('change', e => {`

The control tries to access `this.data.model.validation.state` but `this.data.model` is never initialized. The constructor doesn't set up the data model properly.

### Diagnostic Test Results
```
TypeError: Cannot read properties of undefined (reading 'state')
    at new Validation_Status_Indicator (controls/organised/0-core/0-basic/1-compositional/Validation_Status_Indicator.js:134:36)
```

### Fix Implementation

**Analysis:** The Validation_Status_Indicator extends Status_Indicator which extends Indicator. The Indicator base class doesn't initialize `this.data.model`, but the Status_Indicator constructor tries to access it.

**Option 1: Initialize data.model in Validation_Status_Indicator constructor**

```javascript
class Validation_Status_Indicator extends Status_Indicator {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'validation_status_indicator';

        // Initialize data model before calling super()
        this.data = new Control_Data({context: spec.context});
        this.data.model = new Data_Object({context: spec.context});
        this.data.model.validation = {
            state: new Data_Value('valid', {context: spec.context})
        };

        super(spec);

        // Handle status spec parameter
        if (spec.status) {
            this.data.model.validation.state.set(spec.status);
        }
    }
}
```

**Option 2: Fix Status_Indicator base class**

Modify `Status_Indicator.js` to properly initialize the data model:

```javascript
class Status_Indicator extends Indicator {
    constructor(spec) {
        super(spec);

        // Initialize data model if not already done
        if (!this.data) {
            this.data = new Control_Data({context: this.context});
        }
        if (!this.data.model) {
            this.data.model = new Data_Object({context: this.context});
        }

        // Initialize validation state
        if (!this.data.model.validation) {
            this.data.model.validation = {
                state: new Data_Value('neutral', {context: this.context})
            };
        }

        // Now it's safe to set up event listeners
        this.data.model.validation.state.on('change', e => {
            // Handle state changes
            this.update_display(e.value);
        });
    }
}
```

**Recommended Approach:** Option 2 - Fix the base class to ensure proper initialization.

### Action Items
- Add explicit initialization in `controls/organised/0-core/0-basic/1-compositional/Status_Indicator.js` so `this.data`, `this.data.model`, and `this.data.model.validation.state` exist before listeners are attached; use `Control_Data`, `Data_Object`, and `Data_Value` from `html-core`.
- Ensure `Validation_Status_Indicator.js` registers the status change handler after the base class has prepared the data model and that the optional `spec.validation` payload can hydrate the model during construction.
- Expand diagnostic coverage so the failing constructor trace is guarded by a regression test that instantiates a `Validation_Status_Indicator` with nested validation data.

### Implementation Workflow
1. Update `Status_Indicator.js` (or the indicator lifecycle helpers in `controls/organised/0-core/0-basic/1-compositional/Indicator.js` if shared logic is better) to create the missing structures before attaching `validation.state` handlers.
2. Backfill `Validation_Status_Indicator.js` so it can receive initial validation state via parameters and so derived controls (e.g. `Form_Field`) can listen safely.
3. Run the diagnostic command (`npx mocha test/diagnostic-bugs.test.js --grep "Validation_Status_Indicator State Initialization Bug" --require test/setup.js`) and the broader rendering suite to exercise the change.
4. Document the new guards in this plan and in any related README sections so future authors understand the dependency order.

### Testing Verification
After fix, run diagnostic test:
```bash
npx mocha test/diagnostic-bugs.test.js --grep "Validation_Status_Indicator State Initialization Bug" --require test/setup.js
```

Expected: Tests should pass without TypeError.

## 3. List Items Rendering Bug

### Root Cause
**File:** `controls/organised/0-core/0-basic/1-compositional/list.js` and `controls/organised/0-core/0-basic/1-compositional/item.js`

The List control creates Item controls but:
1. The Item constructor doesn't use the `value` spec parameter
2. The Item's compose method is commented out, so no content is rendered

### Diagnostic Test Results
```
AssertionError: expected '<ul...' to include 'Item 1'
```

The HTML contains empty `<li>` elements without the item text.

### Fix Implementation

**Fix Item.js constructor:**
```javascript
class Item extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'item';
        super(spec);

        // Store the value
        this.value = spec.value;

        // Uncomment and fix compose method
        this.compose();
    }

    compose() {
        if (this.value !== undefined) {
            // Add the value as text content
            this.add(this.value.toString());
        }
    }
}
```

**Alternative: Fix List.js to handle items directly**
```javascript
class List extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'list';
        spec.tag_name = 'ul';
        super(spec);

        if (spec.items) {
            this.items = spec.items;
            this.compose_items();
        }
    }

    compose_items() {
        if (this.items && Array.isArray(this.items)) {
            this.items.forEach(item => {
                const li = new Control({
                    context: this.context,
                    tag_name: 'li'
                });
                li.add(item.toString());
                this.add(li);
            });
        }
    }
}
```

**Recommended Approach:** Fix Item.js to properly handle the value parameter, as this maintains the intended architecture.

### Action Items
- Update `controls/organised/0-core/0-basic/1-compositional/item.js` so each item records `spec.value` (falling back to `spec.text` when appropriate) and produces visible content inside its compose or render helpers.
- Ensure `controls/organised/0-core/0-basic/1-compositional/list.js` calls the updated Item constructor for every entry in `spec.items` and that the overall `<ul>` tag is kept in sync with the data model to support later binding work.
- Add unit coverage to `test/diagnostic-bugs.test.js` or a new rendering test that instantiates a List with multiple items and asserts their textual content is included in the generated HTML.

### Implementation Workflow
1. Wire the Item constructors to accept `value` and render it immediately so looping tests can inspect `<li>` contents.
2. Adjust the List constructor/composer to hydrate items from `spec.items`, creating new Item instances with the computed values.
3. Run the targeted diagnostic command (`npx mocha test/diagnostic-bugs.test.js --grep "List Items Rendering Bug" --require test/setup.js`) and the rendering suite to catch any display regressions.
4. Update this document with the test results and mark the bug fixed once the assertions pass.

### Testing Verification
After fix, run diagnostic test:
```bash
npx mocha test/diagnostic-bugs.test.js --grep "List Items Rendering Bug" --require test/setup.js
```

Expected: HTML should include the item text content.

## 4. Panel Title Rendering Bug

### Root Cause
**File:** `controls/organised/1-standard/6-layout/panel.js`

The Panel constructor accepts a `title` spec parameter but doesn't render it. There's no composition logic to create title elements.

### Diagnostic Test Results
```
AssertionError: expected '<div...' to include 'Test Panel Title'
```

### Fix Implementation

**Modify Panel constructor to handle title:**
```javascript
class Panel extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'panel';
        super(spec);

        // Store title
        this.title = spec.title;

        // Compose the panel structure
        this.compose_panel();
    }

    compose_panel() {
        // Create title element if title is provided
        if (this.title) {
            const titleElement = new Control({
                context: this.context,
                tag_name: 'h3',
                class: 'panel-title'
            });
            titleElement.add(this.title);
            this.add(titleElement);
        }

        // Create content area
        const contentArea = new Control({
            context: this.context,
            class: 'panel-content'
        });

        // Add any content from spec
        if (spec.content) {
            contentArea.add(spec.content);
        }

        this.add(contentArea);
    }
}
```

**Alternative: Use Titled_Panel subclass**
Since there's already a `Titled_Panel` control, consider using that instead of modifying the base Panel.

### Action Items
- Enhance `controls/organised/1-standard/6-layout/panel.js` so the constructor stores `spec.title` and the compose phase renders an `h3` (or configurable heading) when a title is provided.
- Ensure `spec.content` (or `spec.inner`) is composed after the title so document structure matches the expected order and CSS can target `.panel-title` separately from the content block.
- Add a rendering test that creates a Panel with a title string and asserts that the `<div>` contains that heading text, locking the layout in place before shipping.

### Implementation Workflow
1. Refactor the panel class to call a `compose_title` helper (or similar) from the constructor after calling `super`, keeping the control compositional and isomorphic.
2. Extend the existing rendering test suite (`test/rendering.test.js`) with a new case (or add a new diagnostic spec) that checks `spec.title` output.
3. Run the targeted diagnostic command and the rendering tests to verify both structure and CSS classes.
4. Update documentation to note the stable API (title + content) and close the bug once the assertions pass.

### Testing Verification
After fix, run diagnostic test:
```bash
npx mocha test/diagnostic-bugs.test.js --grep "Panel Title Rendering Bug" --require test/setup.js
```

Expected: HTML should include the title text.

## 5. Window Button Constructor Bug

### Root Cause
**File:** `controls/organised/1-standard/6-layout/window.js`
**Line 41:** `btn_minimize = new jsgui.controls.Button({`

The code tries to access `jsgui.controls.Button`, but Button is not available in the `jsgui.controls` object. Button is defined in a separate file and needs to be required directly.

### Diagnostic Test Results
```
TypeError: jsgui.controls.Button is not a constructor
    at new Window (controls/organised/1-standard/6-layout/window.js:41:20)
```

### Fix Implementation

**Add require statement and use direct import:**
```javascript
const jsgui = require('../../../html-core/html-core');
const Button = require('../0-core/0-basic/0-native-compositional/button');

class Window extends Control {
    constructor(spec) {
        // ... existing code ...

        // Replace jsgui.controls.Button with Button
        btn_minimize = new Button({
            context,
            text: '_',
            title: 'Minimize'
        });

        btn_maximize = new Button({
            context,
            text: '□',
            title: 'Maximize'
        });

        btn_close = new Button({
            context,
            text: '×',
            title: 'Close'
        });

        // ... rest of constructor ...
    }
}
```

**Alternative: Ensure Button is in jsgui.controls**
Modify the module loading system to include Button in `jsgui.controls`, but this would require changes to the core module system.

**Recommended Approach:** Direct require/import as shown above.

### Action Items
- Confirm `controls/organised/1-standard/6-layout/window.js` requires the Button control directly (`const Button = require('../0-core/0-basic/0-native-compositional/button')`) so it no longer depends on a global `jsgui.controls` registry.
- Wrap each button construction (`minimize`, `maximize`, `close`) in optional guards driven by `spec.show_buttons` and add descriptive `title` text, mirroring the expected user experience.
- Extend the Window rendering diagnostics to include a instantiation test that asserts button controls exist and trigger their event handlers without throwing.

### Implementation Workflow
1. Update the constructor in `window.js` to declare the shared Button dependency explicitly, ensuring server and client builds resolve the module the same way.
2. Add the tests to `test/diagnostic-bugs.test.js` (or a new rendering test) that mount a Window and exercise the button lifecycle so the previous TypeError would surface if the dependency were missing.
3. Run the targeted diagnostic command (`npx mocha test/diagnostic-bugs.test.js --grep "Window Button Constructor Bug" --require test/setup.js`) and the broader rendering suite to verify the instantiation path remains stable.
4. Document the expectation that controls should import their dependencies directly, and mention this check in the testing strategy above.

### Testing Verification
After fix, run diagnostic test:
```bash
npx mocha test/diagnostic-bugs.test.js --grep "Window Button Constructor Bug" --require test/setup.js
```

Expected: Window should instantiate without TypeError.

## Implementation Priority

1. **Text_Field** - Simple variable fix, high impact
2. **Window** - Simple import fix, high impact
3. **Validation_Status_Indicator** - Moderate complexity, affects form validation
4. **List** - Moderate complexity, affects data display
5. **Panel** - Moderate complexity, affects UI layout

## Testing Strategy

After implementing fixes:

1. Run individual diagnostic tests for each bug
2. Run full rendering test suite to ensure no regressions
3. Run integration tests to verify controls work together
4. Update documentation with fix details

## Risk Assessment

- **Low Risk:** Text_Field, Window (simple fixes)
- **Medium Risk:** List, Panel (architectural changes)
- **High Risk:** Validation_Status_Indicator (affects inheritance chain)

All fixes maintain backward compatibility and follow existing jsgui3 patterns.
