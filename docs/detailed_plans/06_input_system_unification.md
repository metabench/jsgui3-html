# Input System Unification - Detailed Implementation Plan

## Objective

Create a unified input system with shared behaviors, validation hooks, accessibility patterns, and consistent API across all input controls (text, number, date, select, checkbox, radio, etc.).

## Current State Analysis

### Input Controls Inventory

| Control | File | Base Class | Shared Patterns |
|---------|------|------------|-----------------|
| Text_Input | `Text_Input.js` | Control | value, disabled, placeholder |
| Number_Input | `number_input.js` | Control | value, min, max, step |
| Textarea | `textarea.js` | Control | value, rows, cols |
| Email_Input | `email_input.js` | Control | value, pattern |
| Password_Input | `password_input.js` | Control | value |
| Tel_Input | `tel_input.js` | Control | value, pattern |
| Url_Input | `url_input.js` | Control | value, pattern |
| Checkbox | `checkbox.js` | Control | checked |
| Radio_Button | `radio-button.js` | Control | checked, name |
| Select_Options | `Select_Options.js` | Control | value, options |
| Dropdown_List | `dropdown-list.js` | Control | value, items |
| Date_Picker | `date-picker.js` | Control | value, min, max |
| Range_Input | `range_input.js` | Control | value, min, max, step |

### Current Issues

1. **No shared base** - Each input reimplements common logic
2. **Inconsistent API** - Different property names for same concepts
3. **Scattered validation** - No unified validation hooks
4. **Accessibility gaps** - ARIA support varies
5. **Event normalization** - Different event names/data

---

## Technical Specification

### 1. Input Base Mixin

Create a mixin (not class) to preserve flexibility:

```javascript
// control_mixins/input_base.js

const { apply_focus_ring } = require('./a11y');

/**
 * Apply input base behavior to a control.
 * @param {Control} control - The control instance
 * @param {Object} options - Configuration options
 */
function apply_input_base(control, options = {}) {
    const {
        value_property = 'value',
        value_attribute = 'value',
        input_element_selector = null,
        supports_disabled = true,
        supports_readonly = false,
        supports_required = false,
        supports_placeholder = false
    } = options;

    // State
    control._input_value = options.initial_value ?? '';
    control._input_disabled = false;
    control._input_readonly = false;
    control._input_required = false;
    control._input_name = options.name || '';

    // Value property
    Object.defineProperty(control, value_property, {
        get() {
            return control._input_value;
        },
        set(val) {
            const old_value = control._input_value;
            if (val === old_value) return;

            control._input_value = val;

            // Update DOM
            const el = control._get_input_element();
            if (el) {
                el[value_attribute] = val;
            }

            // Update model
            if (control.view?.data?.model) {
                control.view.data.model[value_property] = val;
            }

            // Raise event
            control.raise('value_change', { value: val, old_value });
        }
    });

    // Disabled property
    if (supports_disabled) {
        Object.defineProperty(control, 'disabled', {
            get() {
                return control._input_disabled;
            },
            set(val) {
                control._input_disabled = !!val;
                const el = control._get_input_element();
                if (el) {
                    el.disabled = control._input_disabled;
                }
                control.raise('disabled_change', { disabled: control._input_disabled });
            }
        });
    }

    // Readonly property
    if (supports_readonly) {
        Object.defineProperty(control, 'readonly', {
            get() {
                return control._input_readonly;
            },
            set(val) {
                control._input_readonly = !!val;
                const el = control._get_input_element();
                if (el) {
                    el.readOnly = control._input_readonly;
                }
            }
        });
    }

    // Required property
    if (supports_required) {
        Object.defineProperty(control, 'required', {
            get() {
                return control._input_required;
            },
            set(val) {
                control._input_required = !!val;
                const el = control._get_input_element();
                if (el) {
                    el.required = control._input_required;
                    el.setAttribute('aria-required', control._input_required);
                }
            }
        });
    }

    // Name property
    Object.defineProperty(control, 'name', {
        get() {
            return control._input_name;
        },
        set(val) {
            control._input_name = val;
            const el = control._get_input_element();
            if (el) {
                el.name = val;
            }
        }
    });

    // Helper to get input element
    control._get_input_element = function() {
        if (!control.dom || !control.dom.el) return null;

        if (input_element_selector) {
            return control.dom.el.querySelector(input_element_selector);
        }

        // If control IS the input element
        if (control.dom.el.tagName === 'INPUT' ||
            control.dom.el.tagName === 'TEXTAREA' ||
            control.dom.el.tagName === 'SELECT') {
            return control.dom.el;
        }

        // Try to find nested input
        return control.dom.el.querySelector('input, textarea, select');
    };

    // Wire DOM events in activate
    const original_activate = control.activate?.bind(control);

    control.activate = function() {
        if (original_activate) original_activate();

        const el = control._get_input_element();
        if (!el) return;

        // Input event (live updates)
        el.addEventListener('input', (e) => {
            control._input_value = el[value_attribute];
            control.raise('input', { value: control._input_value, native_event: e });
        });

        // Change event (on blur/commit)
        el.addEventListener('change', (e) => {
            control._input_value = el[value_attribute];
            control.raise('change', { value: control._input_value, native_event: e });
        });

        // Focus/blur
        el.addEventListener('focus', (e) => {
            control.add_class('focused');
            control.raise('focus', { native_event: e });
        });

        el.addEventListener('blur', (e) => {
            control.remove_class('focused');
            control.raise('blur', { native_event: e });
        });

        // Apply focus ring
        apply_focus_ring(control);
    };

    // Public methods
    control.focus = function() {
        const el = control._get_input_element();
        if (el) el.focus();
    };

    control.blur = function() {
        const el = control._get_input_element();
        if (el) el.blur();
    };

    control.select = function() {
        const el = control._get_input_element();
        if (el && typeof el.select === 'function') el.select();
    };

    // Initialize from spec
    if (options.spec) {
        if (options.spec.value !== undefined) control[value_property] = options.spec.value;
        if (options.spec.disabled !== undefined) control.disabled = options.spec.disabled;
        if (options.spec.readonly !== undefined) control.readonly = options.spec.readonly;
        if (options.spec.required !== undefined) control.required = options.spec.required;
        if (options.spec.name !== undefined) control.name = options.spec.name;
        if (options.spec.placeholder !== undefined && supports_placeholder) {
            control.placeholder = options.spec.placeholder;
        }
    }
}

module.exports = { apply_input_base };
```

### 2. Validation Mixin

```javascript
// control_mixins/input_validation.js

/**
 * Apply validation behavior to an input control.
 * @param {Control} control - The control instance
 * @param {Object} options - Validation options
 */
function apply_input_validation(control, options = {}) {
    // Validation state
    control._validation_state = 'none'; // 'none' | 'valid' | 'invalid' | 'pending'
    control._validation_message = '';
    control._validators = options.validators || [];

    // Properties
    Object.defineProperty(control, 'validation_state', {
        get() {
            return control._validation_state;
        }
    });

    Object.defineProperty(control, 'validation_message', {
        get() {
            return control._validation_message;
        }
    });

    Object.defineProperty(control, 'is_valid', {
        get() {
            return control._validation_state === 'valid' ||
                   control._validation_state === 'none';
        }
    });

    /**
     * Add a validator function.
     * @param {Function} validator - (value) => { valid: boolean, message?: string } | Promise
     */
    control.add_validator = function(validator) {
        control._validators.push(validator);
    };

    /**
     * Remove a validator function.
     * @param {Function} validator
     */
    control.remove_validator = function(validator) {
        const index = control._validators.indexOf(validator);
        if (index > -1) control._validators.splice(index, 1);
    };

    /**
     * Validate the current value.
     * @returns {Promise<{ valid: boolean, message?: string }>}
     */
    control.validate = async function() {
        const value = control.value;

        control._set_validation_state('pending', '');

        // Run all validators
        for (const validator of control._validators) {
            try {
                const result = await Promise.resolve(validator(value, control));

                if (result === false || (result && result.valid === false)) {
                    const message = typeof result === 'object' ? result.message : '';
                    control._set_validation_state('invalid', message);
                    return { valid: false, message };
                }
            } catch (err) {
                control._set_validation_state('invalid', err.message);
                return { valid: false, message: err.message };
            }
        }

        // Check native validation
        const el = control._get_input_element?.();
        if (el && !el.checkValidity()) {
            control._set_validation_state('invalid', el.validationMessage);
            return { valid: false, message: el.validationMessage };
        }

        control._set_validation_state('valid', '');
        return { valid: true };
    };

    /**
     * Clear validation state.
     */
    control.clear_validation = function() {
        control._set_validation_state('none', '');
    };

    // Internal state setter
    control._set_validation_state = function(state, message) {
        const old_state = control._validation_state;
        control._validation_state = state;
        control._validation_message = message;

        // Update classes
        control.remove_class('validation-none');
        control.remove_class('validation-valid');
        control.remove_class('validation-invalid');
        control.remove_class('validation-pending');
        control.add_class(`validation-${state}`);

        // Update ARIA
        const el = control._get_input_element?.();
        if (el) {
            el.setAttribute('aria-invalid', state === 'invalid' ? 'true' : 'false');
        }

        // Raise event
        if (state !== old_state) {
            control.raise('validation_change', {
                state,
                message,
                old_state
            });
        }
    };

    // Auto-validate on change (optional)
    if (options.validate_on_change) {
        control.on('change', () => control.validate());
    }

    if (options.validate_on_blur) {
        control.on('blur', () => control.validate());
    }
}

// Built-in validators
const validators = {
    required: (value) => ({
        valid: value !== '' && value !== null && value !== undefined,
        message: 'This field is required'
    }),

    min_length: (min) => (value) => ({
        valid: String(value).length >= min,
        message: `Must be at least ${min} characters`
    }),

    max_length: (max) => (value) => ({
        valid: String(value).length <= max,
        message: `Must be no more than ${max} characters`
    }),

    pattern: (regex, message = 'Invalid format') => (value) => ({
        valid: regex.test(String(value)),
        message
    }),

    email: (value) => ({
        valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
        message: 'Invalid email address'
    }),

    number_range: (min, max) => (value) => {
        const num = Number(value);
        return {
            valid: !isNaN(num) && num >= min && num <= max,
            message: `Must be between ${min} and ${max}`
        };
    },

    custom: (fn, message) => (value) => ({
        valid: fn(value),
        message
    })
};

module.exports = { apply_input_validation, validators };
```

### 3. Unified Input API

```javascript
// control_mixins/input_api.js

/**
 * Standard input control API specification.
 *
 * All input controls should implement:
 *
 * PROPERTIES:
 * - value: any - The input's value
 * - disabled: boolean - Whether input is disabled
 * - readonly: boolean - Whether input is read-only (if applicable)
 * - required: boolean - Whether input is required
 * - name: string - Form field name
 * - placeholder: string - Placeholder text (if applicable)
 * - validation_state: string - 'none' | 'valid' | 'invalid' | 'pending'
 * - validation_message: string - Current validation message
 * - is_valid: boolean - Quick validity check
 *
 * METHODS:
 * - focus() - Focus the input
 * - blur() - Blur the input
 * - select() - Select input content (if applicable)
 * - validate() - Run validation, returns Promise<{valid, message}>
 * - clear_validation() - Clear validation state
 * - add_validator(fn) - Add validation function
 * - remove_validator(fn) - Remove validation function
 *
 * EVENTS:
 * - input: { value } - Fired on every input change
 * - change: { value } - Fired on committed change
 * - focus: {} - Fired on focus
 * - blur: {} - Fired on blur
 * - value_change: { value, old_value } - Fired when value property changes
 * - validation_change: { state, message, old_state } - Fired on validation state change
 * - disabled_change: { disabled } - Fired when disabled changes
 */

/**
 * Apply full input API to a control.
 */
function apply_full_input_api(control, options = {}) {
    const { apply_input_base } = require('./input_base');
    const { apply_input_validation } = require('./input_validation');

    apply_input_base(control, options);
    apply_input_validation(control, options);
}

module.exports = { apply_full_input_api };
```

### 4. Updated Control Implementation Example

```javascript
// Text_Input.js with unified API

const jsgui = require('./../../../../html-core/html-core');
const Control = jsgui.Control;
const { apply_full_input_api } = require('../../../../control_mixins/input_api');

class Text_Input extends Control {
    constructor(spec = {}) {
        spec.__type_name = 'text_input';
        spec.tag_name = 'input';
        super(spec);

        this.add_class('text-input');
        this.dom.attributes.type = spec.type || 'text';

        // Apply unified input API
        apply_full_input_api(this, {
            spec,
            supports_disabled: true,
            supports_readonly: true,
            supports_required: true,
            supports_placeholder: true,
            validate_on_blur: spec.validate_on_blur ?? true
        });

        // Text-specific properties
        if (spec.maxlength) {
            this.dom.attributes.maxlength = spec.maxlength;
        }
        if (spec.minlength) {
            this.dom.attributes.minlength = spec.minlength;
        }
        if (spec.pattern) {
            this.dom.attributes.pattern = spec.pattern;
        }
        if (spec.autocomplete) {
            this.dom.attributes.autocomplete = spec.autocomplete;
        }
    }
}

// Register as text input
Text_Input._input_type = 'text';

module.exports = Text_Input;
```

---

## Migration Guide

### For Existing Code

**Before (inconsistent):**
```javascript
// Text_Input
input.value = 'hello';
input.on('change', (e) => console.log(e.value));

// Checkbox (different)
checkbox.checked = true;
checkbox.on('change', (e) => console.log(e.checked));

// Select (different again)
select.selected_value = 'option1';
select.on('selection_change', (e) => console.log(e.selected));
```

**After (unified):**
```javascript
// All inputs use same pattern
input.value = 'hello';
checkbox.value = true;  // or checkbox.checked for backwards compat
select.value = 'option1';

// All use same events
input.on('value_change', (e) => console.log(e.value));
checkbox.on('value_change', (e) => console.log(e.value));
select.on('value_change', (e) => console.log(e.value));
```

### Backwards Compatibility

For controls like Checkbox that traditionally use `checked`:

```javascript
class Checkbox extends Control {
    constructor(spec) {
        // ...

        apply_full_input_api(this, {
            value_property: 'checked',
            value_attribute: 'checked',
            // ...
        });

        // Alias for migration
        Object.defineProperty(this, 'value', {
            get() { return this.checked; },
            set(v) { this.checked = v; }
        });
    }
}
```

---

## Implementation Steps

### Phase 1: Create Mixins

1. Create `control_mixins/input_base.js`
2. Create `control_mixins/input_validation.js`
3. Create `control_mixins/input_api.js`
4. Add unit tests for mixins

### Phase 2: Update Core Inputs

Update in order of complexity:

1. Text_Input
2. Textarea
3. Number_Input
4. Range_Input
5. Checkbox
6. Radio_Button
7. Select_Options / Dropdown_List
8. Date_Picker
9. Typed inputs (Email, Password, Tel, Url)

### Phase 3: Update Documentation

1. Add API reference for unified input API
2. Update each control's documentation
3. Add migration guide

### Phase 4: Update Form Integration

1. Update Form_Container to use unified API
2. Update Form_Field to work with any unified input
3. Add form-level validation orchestration

---

## Testing Strategy

### Unit Tests

```javascript
describe('Input Base Mixin', () => {
    it('should sync value to DOM', () => {
        const control = create_text_input();
        control.activate();

        control.value = 'test';
        expect(control.dom.el.value).toBe('test');
    });

    it('should raise value_change event', () => {
        const control = create_text_input();
        const handler = jest.fn();
        control.on('value_change', handler);

        control.value = 'new';

        expect(handler).toHaveBeenCalledWith({
            value: 'new',
            old_value: ''
        });
    });

    it('should support disabled state', () => {
        const control = create_text_input();
        control.activate();

        control.disabled = true;
        expect(control.dom.el.disabled).toBe(true);
    });
});

describe('Input Validation Mixin', () => {
    it('should validate required field', async () => {
        const control = create_text_input();
        control.add_validator(validators.required);

        control.value = '';
        const result = await control.validate();

        expect(result.valid).toBe(false);
        expect(control.validation_state).toBe('invalid');
    });

    it('should support async validators', async () => {
        const control = create_text_input();
        control.add_validator(async (value) => {
            await delay(10);
            return { valid: value === 'valid' };
        });

        control.value = 'valid';
        const result = await control.validate();

        expect(result.valid).toBe(true);
    });
});
```

### Integration Tests

```javascript
describe('Form with unified inputs', () => {
    it('should validate all fields', async () => {
        const form = new Form_Container({
            context,
            fields: [
                { name: 'email', type: 'email', required: true },
                { name: 'age', type: 'number', min: 0, max: 120 }
            ]
        });

        form.activate();

        // Set invalid values
        form.get_field('email').value = 'not-an-email';
        form.get_field('age').value = 150;

        const result = await form.validate();

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(2);
    });
});
```

---

## Success Criteria

1. **Consistent API** - All inputs use same property/method names
2. **Validation works** - Built-in and custom validators function correctly
3. **Events unified** - Same event names and payload structure
4. **Backwards compatible** - Old code continues to work with deprecation warnings
5. **Documented** - Full API reference and migration guide
6. **Tested** - Unit tests for mixins, integration tests for controls
