'use strict';

const ensure_class = (ctrl, class_name) => {
    if (!ctrl || typeof ctrl.add_class !== 'function') return;
    ctrl.add_class(class_name);
};

const remove_class = (ctrl, class_name) => {
    if (!ctrl || typeof ctrl.remove_class !== 'function') return;
    ctrl.remove_class(class_name);
};

const get_input_element = ctrl => {
    if (!ctrl) return null;
    if (typeof ctrl._get_input_element === 'function') {
        return ctrl._get_input_element();
    }
    return ctrl.dom ? ctrl.dom.el : null;
};

/**
 * Apply validation behavior to an input control.
 * @param {Control} ctrl - Control to update.
 * @param {Object} [options] - Optional settings.
 */
const apply_input_validation = (ctrl, options = {}) => {
    if (!ctrl) return;
    ctrl.__mx = ctrl.__mx || {};
    ctrl.__mx.input_validation = true;

    ctrl._validation_state = 'none';
    ctrl._validation_message = '';
    ctrl._validators = options.validators ? options.validators.slice() : [];

    Object.defineProperty(ctrl, 'validation_state', {
        get() {
            return ctrl._validation_state;
        }
    });

    Object.defineProperty(ctrl, 'validation_message', {
        get() {
            return ctrl._validation_message;
        }
    });

    Object.defineProperty(ctrl, 'is_valid', {
        get() {
            return ctrl._validation_state === 'valid' || ctrl._validation_state === 'none';
        }
    });

    /**
     * Add a validator function.
     * @param {Function} validator - Validator function.
     */
    ctrl.add_validator = function(validator) {
        if (typeof validator !== 'function') return;
        ctrl._validators.push(validator);
    };

    /**
     * Remove a validator function.
     * @param {Function} validator - Validator function.
     */
    ctrl.remove_validator = function(validator) {
        const index = ctrl._validators.indexOf(validator);
        if (index > -1) ctrl._validators.splice(index, 1);
    };

    /**
     * Validate the current value.
     * @returns {Promise<{ valid: boolean, message?: string }>}
     */
    ctrl.validate = async function() {
        const value = typeof ctrl.get_value === 'function' ? ctrl.get_value() : ctrl.value;

        ctrl._set_validation_state('pending', '');

        for (const validator of ctrl._validators) {
            try {
                const result = await Promise.resolve(validator(value, ctrl));
                if (result === false || (result && result.valid === false)) {
                    const message = typeof result === 'object' ? result.message : '';
                    ctrl._set_validation_state('invalid', message);
                    return { valid: false, message };
                }
            } catch (error) {
                const message = error && error.message ? error.message : 'Validation error';
                ctrl._set_validation_state('invalid', message);
                return { valid: false, message };
            }
        }

        const el = get_input_element(ctrl);
        if (el && typeof el.checkValidity === 'function' && !el.checkValidity()) {
            const message = el.validationMessage || 'Invalid value';
            ctrl._set_validation_state('invalid', message);
            return { valid: false, message };
        }

        ctrl._set_validation_state('valid', '');
        return { valid: true };
    };

    /**
     * Clear validation state.
     */
    ctrl.clear_validation = function() {
        ctrl._set_validation_state('none', '');
    };

    ctrl._set_validation_state = function(state, message) {
        const old_state = ctrl._validation_state;
        ctrl._validation_state = state;
        ctrl._validation_message = message;

        remove_class(ctrl, 'validation-none');
        remove_class(ctrl, 'validation-valid');
        remove_class(ctrl, 'validation-invalid');
        remove_class(ctrl, 'validation-pending');
        ensure_class(ctrl, `validation-${state}`);

        const el = get_input_element(ctrl);
        if (el && typeof el.setAttribute === 'function') {
            el.setAttribute('aria-invalid', state === 'invalid' ? 'true' : 'false');
        }

        if (state !== old_state) {
            ctrl.raise('validation_change', {
                state,
                message,
                old_state
            });
        }
    };

    if (options.validate_on_change && typeof ctrl.on === 'function') {
        ctrl.on('change', () => ctrl.validate());
    }

    if (options.validate_on_blur && typeof ctrl.on === 'function') {
        ctrl.on('blur', () => ctrl.validate());
    }
};

const validators = {
    required: value => ({
        valid: value !== '' && value !== null && value !== undefined,
        message: 'This field is required'
    }),
    min_length: min => value => ({
        valid: String(value || '').length >= min,
        message: `Must be at least ${min} characters`
    }),
    max_length: max => value => ({
        valid: String(value || '').length <= max,
        message: `Must be no more than ${max} characters`
    }),
    pattern: (regex, message = 'Invalid format') => value => ({
        valid: regex.test(String(value || '')),
        message
    }),
    email: value => ({
        valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '')),
        message: 'Invalid email address'
    }),
    number_range: (min, max) => value => {
        const num = Number(value);
        return {
            valid: !Number.isNaN(num) && num >= min && num <= max,
            message: `Must be between ${min} and ${max}`
        };
    },
    custom: (fn, message) => value => ({
        valid: fn(value),
        message
    })
};

module.exports = {
    apply_input_validation,
    validators
};
