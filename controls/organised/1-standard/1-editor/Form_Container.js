const jsgui = require('../../../../html-core/html-core');

const { Control, Data_Object } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');
const apply_field_status = require('../../../../control_mixins/field_status').apply_field_status;
const Inline_Validation_Message = require('./Inline_Validation_Message');
const Badge = require('../../0-core/0-basic/1-compositional/badge');
const Text_Input = require('../../0-core/0-basic/0-native-compositional/Text_Input');
const Textarea = require('../../0-core/0-basic/0-native-compositional/Textarea');

const normalize_fields = fields => (Array.isArray(fields) ? fields.slice() : []);

const get_field_label = field => {
    if (is_defined(field.label)) return String(field.label);
    if (is_defined(field.name)) return String(field.name);
    return 'Field';
};

const get_field_name = (field, index) => {
    if (is_defined(field.name)) return String(field.name);
    return `field_${index}`;
};

class Form_Container extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'form_container';
        super(spec);
        this.add_class('form-container');
        this.dom.tagName = 'form';
        this.dom.attributes.novalidate = 'novalidate'; // Use custom validation, not browser's

        ensure_control_models(this, spec);
        this.model = this.data.model;

        const { context } = this;
        this.values = spec.values instanceof Data_Object ? spec.values : new Data_Object({ context });
        this.validation = spec.validation instanceof Data_Object ? spec.validation : new Data_Object({ context });
        this.errors = spec.errors instanceof Data_Object ? spec.errors : new Data_Object({ context });

        this.model.set('values', this.values);
        this.model.set('validation', this.validation);
        this.model.set('errors', this.errors);

        this.fields = normalize_fields(spec.fields);
        this.show_status_badge = spec.show_status_badge !== false;

        // ── Adaptive layout options (all overridable) ──
        // layout_mode: 'auto' | 'phone' | 'tablet' | 'desktop'
        this.layout_mode = spec.layout_mode || 'auto';
        // Breakpoint for stacking labels above inputs
        this.stack_breakpoint = is_defined(spec.stack_breakpoint) ? Number(spec.stack_breakpoint) : 600;
        // Label width for side-by-side layout (overridable)
        this.label_width = spec.label_width || '160px';

        if (!spec.el) {
            this.compose();
        }

        this.bind_model();
    }

    bind_model() {
        if (!this.values || typeof this.values.on !== 'function') return;

        this.values.on('change', e_change => {
            const field_name = e_change.name;
            const field_ctrl = this.field_controls && this.field_controls[field_name];
            if (!field_ctrl) return;
            this.apply_field_value(field_ctrl, e_change.value);
        });
    }

    /**
     * Set field value in model and control.
     * @param {string} field_name - Field name.
     * @param {*} value - Value to set.
     */
    set_value(field_name, value) {
        if (!field_name) return;
        if (this.values && typeof this.values.set === 'function') {
            this.values.set(field_name, value);
        }
        const field_ctrl = this.field_controls && this.field_controls[field_name];
        if (field_ctrl) {
            this.apply_field_value(field_ctrl, value);
        }
    }

    /**
     * Get field value.
     * @param {string} field_name - Field name.
     * @returns {*}
     */
    get_value(field_name) {
        const field_ctrl = this.field_controls && this.field_controls[field_name];
        if (!field_ctrl) return undefined;
        return this.read_field_value(field_ctrl);
    }

    /**
     * Get form values.
     * @returns {Object}
     */
    get_values() {
        const values = {};
        Object.keys(this.field_controls || {}).forEach(field_name => {
            values[field_name] = this.get_value(field_name);
        });
        return values;
    }

    /**
     * Set form values.
     * @param {Object} values - Values to set.
     */
    set_values(values) {
        if (!values || typeof values !== 'object') return;
        Object.keys(values).forEach(field_name => {
            this.set_value(field_name, values[field_name]);
        });
    }

    /**
     * Validate all fields.
     * @returns {Object} Validation result.
     */
    validate() {
        const result = {
            valid: true,
            errors: {}
        };

        this.fields.forEach((field, index) => {
            const field_name = get_field_name(field, index);
            const field_ctrl = this.field_controls[field_name];
            if (!field_ctrl) return;
            const value = this.read_field_value(field_ctrl);

            const errors = [];
            const validators = [];

            if (field.required) {
                validators.push(val => {
                    if (field.type === 'checkbox') {
                        return val ? true : 'This field is required.';
                    }
                    if (is_defined(val) && String(val).trim() !== '') return true;
                    return 'This field is required.';
                });
            }

            if (typeof field.validator === 'function') {
                validators.push(field.validator);
            }
            if (Array.isArray(field.validators)) {
                field.validators.forEach(validator => {
                    if (typeof validator === 'function') validators.push(validator);
                });
            }

            validators.forEach(validator => {
                const validation = validator(value, this.get_values());
                if (validation === true) return;
                if (validation === false) {
                    errors.push('Invalid value.');
                    return;
                }
                if (typeof validation === 'string') {
                    errors.push(validation);
                    return;
                }
                if (validation && typeof validation === 'object') {
                    if (validation.valid === false) {
                        errors.push(validation.message || 'Invalid value.');
                    }
                }
            });

            if (errors.length) {
                result.valid = false;
                result.errors[field_name] = errors[0];
                this.validation.set(field_name, { valid: false, status: 'error' });
                this.errors.set(field_name, errors[0]);
                this.update_field_status(field_ctrl, 'error', errors[0]);
            } else {
                this.validation.set(field_name, { valid: true, status: 'success' });
                this.errors.set(field_name, '');
                this.update_field_status(field_ctrl, 'success', '');
            }
        });

        return result;
    }

    /**
     * Submit the form.
     * @returns {Object}
     */
    submit() {
        const validation = this.validate();
        if (validation.valid) {
            this.raise('submit', { values: this.get_values() });
        } else {
            this.raise('invalid', { errors: validation.errors, summary: this.get_error_summary() });
        }
        return validation;
    }

    /**
     * Get a summary of all current validation errors.
     * @returns {Array<{field: string, message: string}>}
     */
    get_error_summary() {
        const summary = [];
        this.fields.forEach((field, index) => {
            const field_name = get_field_name(field, index);
            const err = this.errors && typeof this.errors.get === 'function'
                ? this.errors.get(field_name) : null;
            if (err) {
                summary.push({ field: field_name, label: get_field_label(field), message: String(err) });
            }
        });
        return summary;
    }

    compose() {
        const { context } = this;
        this.field_controls = {};

        this.fields.forEach((field, index) => {
            const field_name = get_field_name(field, index);
            const field_label = get_field_label(field);

            const field_ctrl = new Control({ context, tag_name: 'div' });
            field_ctrl.add_class('form-container-field');
            field_ctrl.dom.attributes['data-field-name'] = field_name;
            apply_field_status(field_ctrl);

            const label_ctrl = new Control({ context, tag_name: 'label' });
            label_ctrl.add_class('form-container-label');
            label_ctrl.dom.attributes['data-field-name'] = field_name;
            label_ctrl.add(field_label);

            const input_ctrl = this.create_input_control(field, context);
            input_ctrl.add_class('form-container-input');
            input_ctrl.dom.attributes['data-field-name'] = field_name;
            input_ctrl.dom.attributes.name = field_name;

            if (field.required) {
                input_ctrl.dom.attributes.required = 'required';
                input_ctrl.dom.attributes['aria-required'] = 'true';
            }

            const message_id = `${field_name}-msg`;
            const message_ctrl = new Inline_Validation_Message({
                context,
                message: '',
                status: ''
            });
            message_ctrl.add_class('form-container-message');
            message_ctrl.dom.attributes.id = message_id;
            message_ctrl.dom.attributes.role = 'alert';
            message_ctrl.dom.attributes['aria-live'] = 'polite';

            // Link input to its validation message
            input_ctrl.dom.attributes['aria-describedby'] = message_id;

            let badge_ctrl = null;
            if (this.show_status_badge) {
                badge_ctrl = new Badge({
                    context,
                    text: '',
                    status: ''
                });
                badge_ctrl.add_class('form-container-badge');
            }

            field_ctrl.add(label_ctrl);
            field_ctrl.add(input_ctrl);
            if (badge_ctrl) field_ctrl.add(badge_ctrl);
            field_ctrl.add(message_ctrl);

            const initial_value = is_defined(field.value) ? field.value : field.initial_value;
            if (is_defined(initial_value)) {
                this.apply_field_value({ input_ctrl, field }, initial_value);
                this.values.set(field_name, initial_value);
            }

            this.update_field_status(
                { field_ctrl, input_ctrl, message_ctrl, badge_ctrl, field },
                '',
                ''
            );

            this.field_controls[field_name] = {
                field_ctrl,
                input_ctrl,
                message_ctrl,
                badge_ctrl,
                field
            };

            this.add(field_ctrl);
        });
    }

    create_input_control(field, context) {
        if (field.input_control) {
            return field.input_control;
        }

        const type = field.type || 'text';
        if (type === 'textarea') {
            return new Textarea({
                context,
                placeholder: field.placeholder,
                autosize: field.autosize,
                mask_type: field.mask_type,
                mask_pattern: field.mask_pattern
            });
        }

        if (type === 'checkbox') {
            const checkbox = new Control({ context, tag_name: 'input' });
            checkbox.dom.attributes.type = 'checkbox';
            return checkbox;
        }

        const input = new Text_Input({
            context,
            placeholder: field.placeholder,
            mask_type: field.mask_type,
            mask_pattern: field.mask_pattern
        });
        input.dom.attributes.type = type;
        return input;
    }

    read_field_value(field_ctrl) {
        const input_ctrl = field_ctrl.input_ctrl || field_ctrl;
        const field_def = field_ctrl.field || {};
        if (!input_ctrl) return undefined;
        if (typeof input_ctrl.get_value === 'function') {
            return input_ctrl.get_value();
        }
        if (input_ctrl.dom && input_ctrl.dom.el) {
            if (field_def.type === 'checkbox') return !!input_ctrl.dom.el.checked;
            return input_ctrl.dom.el.value;
        }
        if (this.values && typeof this.values.get === 'function') {
            return this.values.get(field_def.name);
        }
        return undefined;
    }

    apply_field_value(field_ctrl, value) {
        const input_ctrl = field_ctrl.input_ctrl || field_ctrl;
        const field_def = field_ctrl.field || {};
        if (!input_ctrl) return;
        if (typeof input_ctrl.set_value === 'function') {
            input_ctrl.set_value(value);
            return;
        }
        if (input_ctrl.dom && input_ctrl.dom.el) {
            if (field_def.type === 'checkbox') {
                input_ctrl.dom.el.checked = !!value;
            } else {
                input_ctrl.dom.el.value = is_defined(value) ? value : '';
            }
        } else if (input_ctrl.dom && input_ctrl.dom.attributes) {
            if (field_def.type === 'checkbox') {
                if (value) {
                    input_ctrl.dom.attributes.checked = 'checked';
                } else {
                    delete input_ctrl.dom.attributes.checked;
                }
            } else {
                input_ctrl.dom.attributes.value = is_defined(value) ? value : '';
            }
        }
    }

    update_field_status(field_ctrl, status, message) {
        const { field_ctrl: wrapper, input_ctrl, message_ctrl, badge_ctrl, field } = field_ctrl;
        const badge_text = status ? status.toUpperCase() : '';
        if (wrapper && wrapper.set_field_status) {
            wrapper.set_field_status(status, {
                input_ctrl,
                message_ctrl,
                badge_ctrl,
                message,
                badge_text
            });
        }
        if (field && field.status_badge_text && badge_ctrl && badge_ctrl.set_text) {
            badge_ctrl.set_text(field.status_badge_text);
        }
    }

    /**
     * Resolve current layout mode.
     * @returns {'phone'|'tablet'|'desktop'}
     */
    resolve_layout_mode() {
        if (this.layout_mode !== 'auto') return this.layout_mode;
        if (this.context && this.context.view_environment && this.context.view_environment.layout_mode) {
            return this.context.view_environment.layout_mode;
        }
        if (typeof window !== 'undefined') {
            if (window.innerWidth < this.stack_breakpoint) return 'phone';
        }
        return 'desktop';
    }

    /**
     * Apply adaptive layout mode to the DOM.
     */
    _apply_layout_mode() {
        if (!this.dom.el) return;
        const mode = this.resolve_layout_mode();
        this.dom.el.setAttribute('data-layout-mode', mode);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Apply initial layout mode
            this._apply_layout_mode();

            // Listen for window resize in auto mode
            if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
                this._resize_handler = () => this._apply_layout_mode();
                window.addEventListener('resize', this._resize_handler);
            }

            const handle_event = e_event => {
                const target = e_event.target;
                if (!target || !target.getAttribute) return;
                const field_name = target.getAttribute('data-field-name') || target.name;
                if (!field_name) return;
                const field_ctrl = this.field_controls && this.field_controls[field_name];
                if (!field_ctrl) return;
                const value = this.read_field_value(field_ctrl);
                if (this.values && typeof this.values.set === 'function') {
                    this.values.set(field_name, value);
                }
            };

            this.add_dom_event_listener('input', handle_event);
            this.add_dom_event_listener('change', handle_event);

            this.add_dom_event_listener('submit', e_submit => {
                e_submit.preventDefault();
                this.submit();
            });
        }
    }
}

Form_Container.css = `
/* ─── Form_Container ─── */
.form-container {
    display: flex;
    flex-direction: column;
    gap: var(--j-space-3, 12px);
    font-family: var(--j-font-sans, system-ui, sans-serif);
}
.form-container-field {
    display: grid;
    grid-template-columns: var(--form-label-width, 160px) 1fr auto;
    gap: var(--j-space-2, 8px);
    align-items: center;
}
.form-container-label {
    font-weight: 600;
    color: var(--j-fg, #e0e0e0);
    font-size: var(--j-text-sm, 0.875rem);
}
.form-container-input {
    min-width: 0;
    min-height: var(--j-touch-target, 36px);
}
.form-container-input:focus-visible {
    outline: 2px solid var(--j-primary, #5b9bd5);
    outline-offset: -1px;
}
.form-container-message {
    grid-column: 2 / -1;
    font-size: var(--j-text-xs, 0.75rem);
}
.form-container-badge {
    justify-self: end;
}
.field-status-error .form-container-input {
    border-color: var(--j-danger, #b71c1c);
}
.field-status-error .form-container-message {
    color: var(--j-danger, #b71c1c);
}
.field-status-success .form-container-input {
    border-color: var(--j-success, #1b5e20);
}
.field-status-success .form-container-message {
    color: var(--j-success, #1b5e20);
}

/* ── Phone layout: label stacks above input ── */
.form-container[data-layout-mode="phone"] .form-container-field {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
}
.form-container[data-layout-mode="phone"] .form-container-input {
    min-height: var(--j-touch-target, 44px);
}
.form-container[data-layout-mode="phone"] .form-container-message {
    grid-column: 1;
}
.form-container[data-layout-mode="phone"] .form-container-badge {
    justify-self: start;
}

/* ── Tablet layout: narrower label ── */
.form-container[data-layout-mode="tablet"] .form-container-field {
    grid-template-columns: 120px 1fr auto;
}
.form-container[data-layout-mode="tablet"] .form-container-input {
    min-height: var(--j-touch-target, 44px);
}
`;

module.exports = Form_Container;
