# Validation System Architecture - Detailed Implementation Plan

## Objective

Create a comprehensive validation system that works across form containers, individual fields, and data models with support for synchronous/async validation, custom validators, and accessible error presentation.

## Current State Analysis

### Existing Components

| Component | Location | Purpose | Gaps |
|-----------|----------|---------|------|
| Control_Validation | `html-core/Control_Validation.js` | Base validation | Limited API |
| Inline_Validation_Message | `1-standard/1-editor/` | Error display | Not integrated |
| Validation_Status_Indicator | `0-core/0-basic/1-compositional/` | Status icons | Basic only |
| Form_Container | `1-standard/1-editor/` | Form orchestration | Needs enhancement |
| Form_Field | `1-standard/1-editor/` | Field wrapper | Manual validation |

### Architecture Goals

1. **Layered validation** - Field, form, and model levels
2. **Async support** - Server-side validation, debounced checks
3. **Accessible** - ARIA live regions, error announcements
4. **Extensible** - Custom validators, rules, messages
5. **Integrated** - Works with Data_Object and MVVM pattern

---

## Technical Specification

### 1. Validation Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Form Container                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Validation Orchestrator              │   │
│  │  - Collects field results                        │   │
│  │  - Cross-field validation                        │   │
│  │  - Submit gating                                 │   │
│  └─────────────────────────────────────────────────┘   │
│           │                    │                        │
│  ┌────────┴────────┐  ┌───────┴────────┐              │
│  │   Form Field    │  │   Form Field    │   ...        │
│  │  ┌───────────┐  │  │  ┌───────────┐  │              │
│  │  │  Input    │  │  │  │  Input    │  │              │
│  │  │  Control  │  │  │  │  Control  │  │              │
│  │  └─────┬─────┘  │  │  └─────┬─────┘  │              │
│  │        │        │  │        │        │              │
│  │  ┌─────┴─────┐  │  │  ┌─────┴─────┐  │              │
│  │  │ Validator │  │  │  │ Validator │  │              │
│  │  │   Chain   │  │  │  │   Chain   │  │              │
│  │  └───────────┘  │  │  └───────────┘  │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Error Summary / Live Region            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2. Validation Engine

```javascript
// validation/validation_engine.js

class Validation_Engine {
    constructor(options = {}) {
        this.rules = new Map();
        this.messages = {
            ...default_messages,
            ...options.messages
        };
        this.locale = options.locale || 'en';
    }

    /**
     * Register a validation rule.
     * @param {string} name - Rule name
     * @param {Function} validator - (value, params, context) => boolean | Promise<boolean> | ValidationResult
     * @param {string} message - Default error message (can use {param} placeholders)
     */
    register_rule(name, validator, message) {
        this.rules.set(name, { validator, message });
    }

    /**
     * Validate a value against rules.
     * @param {any} value - Value to validate
     * @param {Array} rules - Array of rule configs: { rule: 'name', params: {...}, message?: 'custom' }
     * @param {Object} context - Validation context (field, form, etc.)
     * @returns {Promise<ValidationResult>}
     */
    async validate(value, rules, context = {}) {
        const errors = [];

        for (const rule_config of rules) {
            const { rule, params = {}, message: custom_message } = rule_config;
            const rule_def = this.rules.get(rule);

            if (!rule_def) {
                console.warn(`Unknown validation rule: ${rule}`);
                continue;
            }

            try {
                const result = await Promise.resolve(
                    rule_def.validator(value, params, context)
                );

                const is_valid = result === true ||
                    (typeof result === 'object' && result.valid === true);

                if (!is_valid) {
                    const message = custom_message ||
                        (typeof result === 'object' && result.message) ||
                        this._format_message(rule_def.message, params);

                    errors.push({
                        rule,
                        message,
                        params
                    });

                    // Stop on first error unless configured otherwise
                    if (!context.validate_all) break;
                }
            } catch (err) {
                errors.push({
                    rule,
                    message: err.message,
                    params,
                    error: err
                });
                break;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            value
        };
    }

    _format_message(template, params) {
        return template.replace(/\{(\w+)\}/g, (_, key) => {
            return params[key] !== undefined ? params[key] : `{${key}}`;
        });
    }
}

// Default messages
const default_messages = {
    required: 'This field is required',
    min_length: 'Must be at least {min} characters',
    max_length: 'Must be no more than {max} characters',
    min: 'Must be at least {min}',
    max: 'Must be no more than {max}',
    pattern: 'Invalid format',
    email: 'Please enter a valid email address',
    url: 'Please enter a valid URL',
    number: 'Please enter a valid number',
    integer: 'Please enter a whole number',
    date: 'Please enter a valid date',
    match: 'Values do not match'
};

module.exports = { Validation_Engine, default_messages };
```

### 3. Built-in Validators

```javascript
// validation/validators.js

const built_in_validators = {
    // Presence
    required: (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    },

    // Length
    min_length: (value, { min }) => {
        return String(value).length >= min;
    },

    max_length: (value, { max }) => {
        return String(value).length <= max;
    },

    length: (value, { min, max }) => {
        const len = String(value).length;
        return len >= min && len <= max;
    },

    // Numeric
    min: (value, { min }) => {
        const num = Number(value);
        return !isNaN(num) && num >= min;
    },

    max: (value, { max }) => {
        const num = Number(value);
        return !isNaN(num) && num <= max;
    },

    range: (value, { min, max }) => {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    number: (value) => {
        return !isNaN(Number(value));
    },

    integer: (value) => {
        return Number.isInteger(Number(value));
    },

    positive: (value) => {
        const num = Number(value);
        return !isNaN(num) && num > 0;
    },

    // Format
    pattern: (value, { pattern, flags }) => {
        const regex = typeof pattern === 'string'
            ? new RegExp(pattern, flags)
            : pattern;
        return regex.test(String(value));
    },

    email: (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
    },

    url: (value) => {
        try {
            new URL(String(value));
            return true;
        } catch {
            return false;
        }
    },

    alpha: (value) => {
        return /^[a-zA-Z]+$/.test(String(value));
    },

    alphanumeric: (value) => {
        return /^[a-zA-Z0-9]+$/.test(String(value));
    },

    // Comparison
    equals: (value, { target }, context) => {
        const target_value = context.form?.get_field_value?.(target);
        return value === target_value;
    },

    not_equals: (value, { target }, context) => {
        const target_value = context.form?.get_field_value?.(target);
        return value !== target_value;
    },

    // Date
    date: (value) => {
        const d = new Date(value);
        return !isNaN(d.getTime());
    },

    date_before: (value, { date }) => {
        const v = new Date(value);
        const d = new Date(date);
        return v < d;
    },

    date_after: (value, { date }) => {
        const v = new Date(value);
        const d = new Date(date);
        return v > d;
    },

    // Array
    array_min: (value, { min }) => {
        return Array.isArray(value) && value.length >= min;
    },

    array_max: (value, { max }) => {
        return Array.isArray(value) && value.length <= max;
    },

    in_list: (value, { list }) => {
        return list.includes(value);
    },

    not_in_list: (value, { list }) => {
        return !list.includes(value);
    },

    // Async validators
    unique: async (value, { endpoint, field }, context) => {
        if (!value) return true;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, value, exclude_id: context.record_id })
        });

        const { unique } = await response.json();
        return unique;
    },

    remote: async (value, { endpoint, method = 'POST' }, context) => {
        const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value, context })
        });

        const result = await response.json();
        return result;
    }
};

/**
 * Register all built-in validators with an engine.
 */
function register_built_in_validators(engine) {
    for (const [name, validator] of Object.entries(built_in_validators)) {
        engine.register_rule(name, validator, default_messages[name] || `${name} validation failed`);
    }
}

module.exports = { built_in_validators, register_built_in_validators };
```

### 4. Form Container Validation

```javascript
// Enhanced Form_Container validation

class Form_Container extends Control {
    constructor(spec) {
        super(spec);

        this._validation_engine = spec.validation_engine || get_default_engine();
        this._fields = new Map();
        this._validation_mode = spec.validation_mode || 'on_submit'; // 'on_change' | 'on_blur' | 'on_submit'
        this._show_all_errors = spec.show_all_errors ?? false;

        // Cross-field validators
        this._form_validators = spec.validators || [];
    }

    /**
     * Register a field with the form.
     */
    register_field(name, control, rules = []) {
        this._fields.set(name, {
            control,
            rules,
            touched: false,
            dirty: false
        });

        // Wire events based on validation mode
        if (this._validation_mode === 'on_change') {
            control.on('change', () => this.validate_field(name));
        } else if (this._validation_mode === 'on_blur') {
            control.on('blur', () => {
                this._fields.get(name).touched = true;
                this.validate_field(name);
            });
        }

        control.on('input', () => {
            this._fields.get(name).dirty = true;
        });
    }

    /**
     * Validate a single field.
     */
    async validate_field(name) {
        const field = this._fields.get(name);
        if (!field) return { valid: true, errors: [] };

        const value = field.control.value;
        const context = {
            field: name,
            form: this,
            validate_all: this._show_all_errors
        };

        const result = await this._validation_engine.validate(value, field.rules, context);

        // Update field UI
        this._update_field_validation_ui(name, result);

        return result;
    }

    /**
     * Validate all fields.
     */
    async validate() {
        const results = new Map();
        const errors = [];

        // Validate each field
        for (const [name, field] of this._fields) {
            const result = await this.validate_field(name);
            results.set(name, result);

            if (!result.valid) {
                errors.push(...result.errors.map(e => ({
                    ...e,
                    field: name
                })));
            }
        }

        // Run form-level validators
        const form_context = {
            form: this,
            values: this.get_values(),
            validate_all: this._show_all_errors
        };

        for (const validator of this._form_validators) {
            const result = await Promise.resolve(validator(form_context));

            if (result === false || (result && result.valid === false)) {
                errors.push({
                    rule: 'form',
                    message: typeof result === 'object' ? result.message : 'Form validation failed',
                    field: result?.field || null
                });
            }
        }

        const is_valid = errors.length === 0;

        // Update form UI
        this._update_form_validation_ui(is_valid, errors);

        // Raise event
        this.raise('validation_complete', {
            valid: is_valid,
            errors,
            results
        });

        return { valid: is_valid, errors, results };
    }

    /**
     * Clear all validation state.
     */
    clear_validation() {
        for (const [name, field] of this._fields) {
            field.control.clear_validation?.();
            this._update_field_validation_ui(name, { valid: true, errors: [] });
        }

        this._error_summary?.clear();
    }

    /**
     * Get all form values.
     */
    get_values() {
        const values = {};
        for (const [name, field] of this._fields) {
            values[name] = field.control.value;
        }
        return values;
    }

    /**
     * Get a specific field's value.
     */
    get_field_value(name) {
        return this._fields.get(name)?.control.value;
    }

    /**
     * Handle form submission.
     */
    async submit() {
        const validation = await this.validate();

        if (!validation.valid) {
            // Focus first invalid field
            for (const [name, field] of this._fields) {
                if (!validation.results.get(name)?.valid) {
                    field.control.focus?.();
                    break;
                }
            }

            this.raise('submit_blocked', { errors: validation.errors });
            return false;
        }

        this.raise('submit', { values: this.get_values() });
        return true;
    }

    _update_field_validation_ui(name, result) {
        const field = this._fields.get(name);
        if (!field) return;

        const { control } = field;

        // Update validation state
        if (control._set_validation_state) {
            control._set_validation_state(
                result.valid ? 'valid' : 'invalid',
                result.errors[0]?.message || ''
            );
        }

        // Update inline message
        const message_control = this._get_field_message_control(name);
        if (message_control) {
            if (result.valid) {
                message_control.hide?.();
            } else {
                message_control.set_message?.(result.errors[0]?.message, 'error');
                message_control.show?.();
            }
        }

        // Update ARIA
        const el = control._get_input_element?.();
        if (el) {
            el.setAttribute('aria-invalid', result.valid ? 'false' : 'true');

            if (message_control?.dom?.el?.id) {
                el.setAttribute('aria-describedby', message_control.dom.el.id);
            }
        }
    }

    _update_form_validation_ui(is_valid, errors) {
        if (is_valid) {
            this.remove_class('form-invalid');
            this.add_class('form-valid');
        } else {
            this.remove_class('form-valid');
            this.add_class('form-invalid');
        }

        // Update error summary
        if (this._error_summary) {
            this._error_summary.set_errors(errors);
        }
    }
}
```

### 5. Accessible Error Presentation

```javascript
// validation/error_summary.js

class Error_Summary extends Control {
    constructor(spec = {}) {
        super(spec);
        this.__type_name = 'error_summary';
        this.add_class('error-summary');

        // Live region for announcements
        this.dom.attributes.role = 'alert';
        this.dom.attributes['aria-live'] = 'polite';

        this._errors = [];
    }

    set_errors(errors) {
        this._errors = errors;
        this._render();

        // Announce to screen readers
        if (errors.length > 0) {
            this._announce(`Form has ${errors.length} error${errors.length > 1 ? 's' : ''}`);
        }
    }

    clear() {
        this._errors = [];
        this._render();
    }

    _render() {
        // Clear existing content
        while (this.content && this.content.length > 0) {
            this.content[0].remove();
        }

        if (this._errors.length === 0) {
            this.hide();
            return;
        }

        // Create header
        const header = new Control({ context: this.context, tag_name: 'h4' });
        header.add(`Please fix ${this._errors.length} error${this._errors.length > 1 ? 's' : ''}:`);
        this.add(header);

        // Create error list
        const list = new Control({ context: this.context, tag_name: 'ul' });

        for (const error of this._errors) {
            const item = new Control({ context: this.context, tag_name: 'li' });

            if (error.field) {
                const link = new Control({ context: this.context, tag_name: 'a' });
                link.dom.attributes.href = `#field-${error.field}`;
                link.add(error.message);

                link.on('click', (e) => {
                    e.preventDefault?.();
                    this.raise('error_click', { error });
                });

                item.add(link);
            } else {
                item.add(error.message);
            }

            list.add(item);
        }

        this.add(list);
        this.show();
    }

    _announce(message) {
        // For screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }
}

Error_Summary.css = `
.error-summary {
    background: var(--jsgui-error-bg, #fff5f5);
    border: 1px solid var(--jsgui-error-color, #cc0000);
    border-radius: var(--jsgui-radius, 4px);
    padding: 16px;
    margin-bottom: 16px;
}

.error-summary h4 {
    color: var(--jsgui-error-color, #cc0000);
    margin: 0 0 8px 0;
}

.error-summary ul {
    margin: 0;
    padding-left: 20px;
}

.error-summary li {
    margin-bottom: 4px;
}

.error-summary a {
    color: var(--jsgui-error-color, #cc0000);
    text-decoration: underline;
}

.error-summary a:hover {
    text-decoration: none;
}
`;

module.exports = Error_Summary;
```

### 6. Enhanced Inline_Validation_Message

```javascript
// Updated Inline_Validation_Message

class Inline_Validation_Message extends Control {
    constructor(spec = {}) {
        super(spec);
        this.__type_name = 'inline_validation_message';
        this.add_class('inline-validation-message');

        // ARIA
        this.dom.attributes.role = 'alert';
        this.dom.attributes['aria-live'] = 'polite';

        // Generate ID for aria-describedby
        this.dom.attributes.id = spec.id || `validation-msg-${Math.random().toString(36).substr(2, 9)}`;

        this._status = 'none';
        this._message = '';

        if (spec.message) {
            this.set_message(spec.message, spec.status || 'error');
        }
    }

    set_message(message, status = 'error') {
        this._message = message;
        this._status = status;

        // Update classes
        this.remove_class('status-none');
        this.remove_class('status-error');
        this.remove_class('status-warning');
        this.remove_class('status-success');
        this.remove_class('status-info');
        this.add_class(`status-${status}`);

        // Update content
        while (this.content && this.content.length > 0) {
            this.content[0].remove();
        }

        if (message) {
            // Icon
            const icon = new Control({ context: this.context, tag_name: 'span' });
            icon.add_class('validation-icon');
            icon.add(this._get_icon(status));
            this.add(icon);

            // Message text
            const text = new Control({ context: this.context, tag_name: 'span' });
            text.add_class('validation-text');
            text.add(message);
            this.add(text);

            this.show();
        } else {
            this.hide();
        }
    }

    clear() {
        this.set_message('', 'none');
    }

    _get_icon(status) {
        switch (status) {
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'success': return '✓';
            case 'info': return 'ℹ';
            default: return '';
        }
    }
}

Inline_Validation_Message.css = `
.inline-validation-message {
    font-size: 12px;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.inline-validation-message.status-none {
    display: none;
}

.inline-validation-message.status-error {
    color: var(--jsgui-error-color, #cc0000);
}

.inline-validation-message.status-warning {
    color: var(--jsgui-warning-color, #cc8800);
}

.inline-validation-message.status-success {
    color: var(--jsgui-success-color, #00aa00);
}

.inline-validation-message.status-info {
    color: var(--jsgui-info-color, #0066cc);
}

.validation-icon {
    font-weight: bold;
}
`;

module.exports = Inline_Validation_Message;
```

---

## Usage Examples

### Basic Form Validation

```javascript
const form = new Form_Container({
    context,
    validation_mode: 'on_blur'
});

// Add fields with rules
form.register_field('email', email_input, [
    { rule: 'required' },
    { rule: 'email' }
]);

form.register_field('password', password_input, [
    { rule: 'required' },
    { rule: 'min_length', params: { min: 8 } },
    { rule: 'pattern', params: { pattern: /[A-Z]/ }, message: 'Must contain uppercase letter' },
    { rule: 'pattern', params: { pattern: /[0-9]/ }, message: 'Must contain number' }
]);

form.register_field('confirm_password', confirm_input, [
    { rule: 'required' },
    { rule: 'equals', params: { target: 'password' }, message: 'Passwords must match' }
]);

// Form-level validation
form.add_form_validator(async ({ values }) => {
    const response = await api.check_email_available(values.email);
    return {
        valid: response.available,
        message: 'Email is already registered',
        field: 'email'
    };
});

// Handle submit
form.on('submit', async ({ values }) => {
    await api.register(values);
});

form.on('submit_blocked', ({ errors }) => {
    console.log('Form has errors:', errors);
});
```

### Custom Validator

```javascript
// Register custom validator
validation_engine.register_rule(
    'strong_password',
    (value, { min_score = 3 }) => {
        let score = 0;
        if (value.length >= 8) score++;
        if (value.length >= 12) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[a-z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        return {
            valid: score >= min_score,
            message: `Password strength: ${score}/6 (need ${min_score})`
        };
    },
    'Password is not strong enough'
);

// Use it
form.register_field('password', password_input, [
    { rule: 'required' },
    { rule: 'strong_password', params: { min_score: 4 } }
]);
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('Validation_Engine', () => {
    it('should validate required field', async () => {
        const engine = new Validation_Engine();
        register_built_in_validators(engine);

        const result = await engine.validate('', [{ rule: 'required' }]);
        expect(result.valid).toBe(false);
    });

    it('should support async validators', async () => {
        const engine = new Validation_Engine();
        engine.register_rule('async_check', async (value) => {
            await new Promise(r => setTimeout(r, 10));
            return value === 'valid';
        });

        const result = await engine.validate('valid', [{ rule: 'async_check' }]);
        expect(result.valid).toBe(true);
    });

    it('should format error messages with params', async () => {
        const engine = new Validation_Engine();
        register_built_in_validators(engine);

        const result = await engine.validate('ab', [
            { rule: 'min_length', params: { min: 5 } }
        ]);

        expect(result.errors[0].message).toBe('Must be at least 5 characters');
    });
});
```

### Integration Tests

```javascript
describe('Form_Container validation', () => {
    it('should validate all fields on submit', async () => {
        const form = create_test_form();

        form.get_field('email').control.value = 'invalid';

        const result = await form.submit();

        expect(result).toBe(false);
        expect(form.dom.el.classList.contains('form-invalid')).toBe(true);
    });

    it('should announce errors to screen readers', async () => {
        // Test ARIA live region updates
    });
});
```

---

## Success Criteria

1. **Validation runs correctly** - All built-in rules work as expected
2. **Async support** - Server-side validation integrates smoothly
3. **Error presentation** - Inline messages and summary display correctly
4. **Accessible** - Screen readers announce errors appropriately
5. **Cross-field validation** - Password confirmation and similar patterns work
6. **Extensible** - Custom validators can be added easily
7. **Documented** - Full API reference with examples
