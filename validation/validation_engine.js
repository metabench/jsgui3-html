'use strict';

/**
 * Validation Engine
 *
 * Centralized validation rule management with support for:
 * - Named rule registration
 * - Async validation
 * - Message formatting with placeholders
 * - Field and form-level validation
 */

const default_messages = {
    required: 'This field is required',
    min_length: 'Must be at least {min} characters',
    max_length: 'Must be no more than {max} characters',
    pattern: 'Invalid format',
    email: 'Invalid email address',
    number: 'Must be a valid number',
    integer: 'Must be a whole number',
    min: 'Must be at least {min}',
    max: 'Must be no more than {max}',
    range: 'Must be between {min} and {max}',
    url: 'Invalid URL',
    date: 'Invalid date',
    equals: 'Must match {field}',
    custom: 'Invalid value'
};

/**
 * Format a message with placeholder values.
 * @param {string} template - Message template with {placeholder} syntax.
 * @param {Object} values - Values to substitute.
 * @returns {string} Formatted message.
 */
function format_message(template, values = {}) {
    if (!template) return '';
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return values.hasOwnProperty(key) ? String(values[key]) : match;
    });
}

/**
 * Validation Engine class.
 */
class Validation_Engine {
    constructor() {
        this.rules = new Map();
        this.register_built_in_rules();
    }

    /**
     * Register a validation rule.
     * @param {string} name - Rule name.
     * @param {Function} validator - Validator function (value, options, context) => boolean|string|Promise.
     * @param {string} [message] - Default error message.
     */
    register_rule(name, validator, message) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new Error('Rule name must be a non-empty string');
        }
        if (typeof validator !== 'function') {
            throw new Error('Validator must be a function');
        }

        this.rules.set(name, {
            validator,
            message: message || default_messages[name] || 'Invalid value'
        });
    }

    /**
     * Unregister a validation rule.
     * @param {string} name - Rule name.
     * @returns {boolean} True if rule was removed.
     */
    unregister_rule(name) {
        return this.rules.delete(name);
    }

    /**
     * Check if a rule is registered.
     * @param {string} name - Rule name.
     * @returns {boolean}
     */
    has_rule(name) {
        return this.rules.has(name);
    }

    /**
     * Get all registered rule names.
     * @returns {string[]}
     */
    get_rule_names() {
        return Array.from(this.rules.keys());
    }

    /**
     * Validate a value against a set of rules.
     * @param {*} value - Value to validate.
     * @param {Array|Object} rules - Rules to apply.
     * @param {Object} [context] - Validation context (other field values, etc.).
     * @returns {Promise<{valid: boolean, errors: string[]}>}
     */
    async validate(value, rules, context = {}) {
        const errors = [];
        const rule_list = this._normalize_rules(rules);

        for (const rule_config of rule_list) {
            const { name, options, message: custom_message } = rule_config;
            const rule = this.rules.get(name);

            if (!rule) {
                console.warn(`[Validation_Engine] Unknown rule: ${name}`);
                continue;
            }

            try {
                const result = await Promise.resolve(
                    rule.validator(value, options, context)
                );

                if (result === true) {
                    continue;
                }

                // Determine error message
                let error_message;
                if (typeof result === 'string') {
                    error_message = result;
                } else if (result && typeof result === 'object' && result.message) {
                    error_message = result.message;
                } else {
                    error_message = custom_message || rule.message;
                }

                errors.push(format_message(error_message, options));
            } catch (error) {
                errors.push(error.message || 'Validation error');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate multiple fields.
     * @param {Object} values - Field values keyed by name.
     * @param {Object} field_rules - Rules keyed by field name.
     * @returns {Promise<{valid: boolean, errors: Object}>}
     */
    async validate_all(values, field_rules) {
        const results = {};
        let all_valid = true;

        for (const [field_name, rules] of Object.entries(field_rules)) {
            const value = values[field_name];
            const result = await this.validate(value, rules, values);
            results[field_name] = result;
            if (!result.valid) {
                all_valid = false;
            }
        }

        return {
            valid: all_valid,
            errors: results
        };
    }

    /**
     * Normalize rules to consistent format.
     * @private
     */
    _normalize_rules(rules) {
        if (!rules) return [];

        // Array of rule configs
        if (Array.isArray(rules)) {
            return rules.map(rule => this._normalize_rule(rule));
        }

        // Object with rule names as keys
        if (typeof rules === 'object') {
            return Object.entries(rules).map(([name, options]) => {
                if (options === true) {
                    return { name, options: {} };
                }
                if (options === false) {
                    return null;
                }
                return { name, options: options || {} };
            }).filter(Boolean);
        }

        return [];
    }

    /**
     * Normalize a single rule.
     * @private
     */
    _normalize_rule(rule) {
        if (typeof rule === 'string') {
            return { name: rule, options: {} };
        }
        if (typeof rule === 'object' && rule.name) {
            return {
                name: rule.name,
                options: rule.options || rule,
                message: rule.message
            };
        }
        return { name: 'custom', options: rule };
    }

    /**
     * Register built-in validation rules.
     * @private
     */
    register_built_in_rules() {
        // Required
        this.register_rule('required', (value) => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim() !== '';
            if (Array.isArray(value)) return value.length > 0;
            return true;
        }, default_messages.required);

        // String length
        this.register_rule('min_length', (value, options) => {
            const min = options.min || options.value || 0;
            const str = String(value || '');
            return str.length >= min;
        }, default_messages.min_length);

        this.register_rule('max_length', (value, options) => {
            const max = options.max || options.value || Infinity;
            const str = String(value || '');
            return str.length <= max;
        }, default_messages.max_length);

        // Pattern
        this.register_rule('pattern', (value, options) => {
            const pattern = options.pattern || options.regex || options.value;
            if (!pattern) return true;
            const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
            return regex.test(String(value || ''));
        }, default_messages.pattern);

        // Email
        this.register_rule('email', (value) => {
            if (!value) return true; // Use required for empty check
            const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return email_regex.test(String(value));
        }, default_messages.email);

        // URL
        this.register_rule('url', (value) => {
            if (!value) return true;
            try {
                new URL(String(value));
                return true;
            } catch {
                return false;
            }
        }, default_messages.url);

        // Number validation
        this.register_rule('number', (value) => {
            if (value === '' || value === null || value === undefined) return true;
            return !isNaN(Number(value));
        }, default_messages.number);

        this.register_rule('integer', (value) => {
            if (value === '' || value === null || value === undefined) return true;
            return Number.isInteger(Number(value));
        }, default_messages.integer);

        // Range
        this.register_rule('min', (value, options) => {
            if (value === '' || value === null || value === undefined) return true;
            const min = options.min || options.value || 0;
            return Number(value) >= min;
        }, default_messages.min);

        this.register_rule('max', (value, options) => {
            if (value === '' || value === null || value === undefined) return true;
            const max = options.max || options.value || Infinity;
            return Number(value) <= max;
        }, default_messages.max);

        this.register_rule('range', (value, options) => {
            if (value === '' || value === null || value === undefined) return true;
            const num = Number(value);
            const min = options.min || 0;
            const max = options.max || Infinity;
            return num >= min && num <= max;
        }, default_messages.range);

        // Date
        this.register_rule('date', (value) => {
            if (!value) return true;
            const date = new Date(value);
            return !isNaN(date.getTime());
        }, default_messages.date);

        // Equality check (for confirm password, etc.)
        this.register_rule('equals', (value, options, context) => {
            const field = options.field || options.value;
            if (!field) return true;
            return value === context[field];
        }, default_messages.equals);

        // Custom function
        this.register_rule('custom', (value, options) => {
            if (typeof options === 'function') {
                return options(value);
            }
            if (typeof options.validator === 'function') {
                return options.validator(value);
            }
            return true;
        }, default_messages.custom);
    }
}

// Singleton instance
const default_engine = new Validation_Engine();

module.exports = {
    Validation_Engine,
    default_engine,
    format_message
};
