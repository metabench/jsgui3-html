const jsgui = require('../../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const { Control, Control_Data, Control_View, Data_Object, Data_Model, Data_Value } = jsgui;
const { prop, field } = require('obext');
const apply_input_mask = require('../../../../../control_mixins/input_mask');
const { apply_full_input_api } = require('../../../../../control_mixins/input_api');
const { themeable } = require('../../../../../control_mixins/themeable');
const { apply_token_map } = require('../../../../../themes/token_maps');

/**
 * Text Input Control
 * 
 * A text input field with theme support, floating label, and validation.
 * 
 * Supports variants: default, compact, floating, filled, underline, search, inline
 * Supports sizes: small, medium, large
 * 
 * @example
 * // Default input
 * new Text_Input({ placeholder: 'Enter text...' });
 * 
 * // Floating label input
 * new Text_Input({ variant: 'floating', label: 'Email' });
 * 
 * // Search input with clear button
 * new Text_Input({ variant: 'search', placeholder: 'Search...' });
 * 
 * // Input with error
 * const input = new Text_Input({ placeholder: 'Email', required: true });
 * input.set_error('Email is required');
 */
class Text_Input extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'text_input';

        // Floating/filled variants need a wrapper div; default renders as <input> directly
        const variant = spec.variant || 'default';
        const needs_wrapper = variant === 'floating' || variant === 'filled' || variant === 'underline';

        if (needs_wrapper) {
            spec.class = 'text-input';
        } else {
            spec.class = 'text-input';
        }

        super(spec);
        const { context } = this;

        // CSS class for input.css rules
        this.add_class('jsgui-input');

        // Apply themeable - resolves params and applies hooks
        const params = themeable(this, 'text_input', spec);

        // Apply token mappings (size -> CSS variables)
        apply_token_map(this, 'input', params);

        // Emit data-variant so CSS selectors like [data-variant="filled"] match
        if (params.variant && params.variant !== 'default') {
            this.dom.attributes['data-variant'] = params.variant;
        }

        // Emit data-size so CSS selectors match
        if (params.size && params.size !== 'medium') {
            this.dom.attributes['data-size'] = params.size;
        }

        this.enhance_only = !!spec.enhance_only && !!spec.el;
        this._variant = variant;
        this._label_text = spec.label || '';

        apply_input_mask(this, spec || {});
        apply_full_input_api(this, {
            disabled: spec.disabled,
            readonly: spec.readonly,
            required: spec.required
        });

        // ARIA required
        if (spec.required) {
            this.dom.attributes['aria-required'] = 'true';
        }

        if (spec.placeholder) this.placeholder = spec.placeholder;

        if (!spec.el) {
            if (needs_wrapper) {
                this.compose_wrapped(params);
            } else {
                this.compose_simple(params);
            }
        }

        // ── MVVM data binding ──────────────────────

        const view_data_model_change_handler = e => {
            const { name, value } = e;
            if (name === 'value') {
                const masked_value = this.apply_input_mask_value
                    ? this.apply_input_mask_value(value)
                    : value;

                if (this._input_el_ctrl) {
                    this._input_el_ctrl.dom.attributes.value = masked_value;
                    if (this._input_el_ctrl.dom.el) {
                        this._input_el_ctrl.dom.el.value = masked_value + '';
                    }
                } else {
                    this.dom.attributes.value = masked_value;
                    if (this.dom.el) {
                        this.dom.el.value = masked_value + '';
                    }
                }

                this.data.model.value = masked_value;
            }
        };

        this.view.data.model.on('change', view_data_model_change_handler);

        this.view.data.on('change', e => {
            const { name, value, old } = e;
            if (name === 'model') {
                if (old instanceof Data_Model) {
                    old.off('change', view_data_model_change_handler);
                }
                value.on('change', view_data_model_change_handler);
            }
        });

        const data_model_change_handler = e => {
            const { name, value } = e;
            if (name === 'value') {
                this.view.data.model.value = value;
            }
        };

        this.data.model.on('change', data_model_change_handler);

        const setup_handle_data_model_itself_changing = () => {
            this.data.on('change', e => {
                const { name, value, old } = e;
                if (name === 'model') {
                    if (old instanceof Data_Model) {
                        old.off('change', data_model_change_handler);
                    }
                    if (value instanceof Data_Model) {
                        value.on('change', data_model_change_handler);
                    }
                }
            });
        };
        setup_handle_data_model_itself_changing();

        if (this.data.model.value !== undefined) {
            this.view.data.model.value = this.data.model.value;
        }

        if (spec.value !== undefined) {
            if (this.data && this.data.model && typeof this.data.model.set === 'function') {
                this.data.model.set('value', spec.value, true);
            } else {
                this.data.model.value = spec.value;
            }
            const target = this._input_el_ctrl || this;
            target.dom.attributes.value = spec.value;
        }

        // For simple (non-wrapped) mode, set tag to input
        if (!needs_wrapper) {
            this.dom.tagName = 'input';
            this.dom.attributes.type = spec.input_type || 'text';
            if (this.placeholder) {
                this.dom.attributes.placeholder = this.placeholder;
            }
        }
    }

    /**
     * Compose a simple text input (no wrapper, renders as <input>).
     */
    compose_simple(params) {
        // Simple mode: the control itself IS the <input>
        // Placeholder is set in constructor
    }

    /**
     * Compose a wrapped text input with label and error span.
     * Used for floating, filled, and underline variants.
     */
    compose_wrapped(params) {
        const { context } = this;

        // Override: wrapper is a <div>
        this.dom.tagName = 'div';
        this.add_class('jsgui-input-wrapper');

        // Inner <input> element
        const input_ctrl = new Control({ context });
        input_ctrl.dom.tagName = 'input';
        input_ctrl.dom.attributes.type = 'text';
        input_ctrl.add_class('jsgui-input-field');
        if (this.placeholder) {
            input_ctrl.dom.attributes.placeholder = this.placeholder;
        }

        // Floating label
        if (this._label_text) {
            const label_ctrl = new Control({ context });
            label_ctrl.dom.tagName = 'label';
            label_ctrl.add_class('jsgui-input-label');
            if (this._variant === 'floating') {
                label_ctrl.add_class('floating');
            }
            label_ctrl.add(this._label_text);
            this._ctrl_fields = this._ctrl_fields || {};
            this._ctrl_fields.label = label_ctrl;
            // Label goes after input for CSS :placeholder-shown + .floating-label trick
            this.add(input_ctrl);
            this.add(label_ctrl);
        } else {
            this.add(input_ctrl);
        }

        // Error message span (hidden by default)
        const error_ctrl = new Control({ context });
        error_ctrl.dom.tagName = 'span';
        error_ctrl.add_class('jsgui-input-error');
        error_ctrl.dom.attributes.role = 'alert';
        error_ctrl.dom.attributes['aria-live'] = 'polite';
        this.add(error_ctrl);

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.input = input_ctrl;
        this._ctrl_fields.error = error_ctrl;
        this._input_el_ctrl = input_ctrl;
    }

    get value() {
        return this.data.model.value;
    }

    set value(v) {
        this.data.model.value = v;
    }

    /**
     * Set an error message on the input.
     * @param {string|null} message - Error message, or null/empty to clear
     */
    set_error(message) {
        const error_ctrl = this._ctrl_fields && this._ctrl_fields.error;
        const input_ctrl = this._input_el_ctrl || this;

        if (message) {
            this.add_class('invalid');
            input_ctrl.dom.attributes['aria-invalid'] = 'true';

            if (error_ctrl) {
                const error_id = 'err-' + (input_ctrl._id ? input_ctrl._id() : Math.random().toString(36).slice(2));
                error_ctrl.dom.attributes.id = error_id;
                input_ctrl.dom.attributes['aria-describedby'] = error_id;

                error_ctrl.clear();
                error_ctrl.add(message);

                if (error_ctrl.dom.el) {
                    error_ctrl.dom.el.textContent = message;
                    error_ctrl.dom.el.id = error_id;
                }
                if (input_ctrl.dom.el) {
                    input_ctrl.dom.el.setAttribute('aria-invalid', 'true');
                    input_ctrl.dom.el.setAttribute('aria-describedby', error_id);
                }
            }
        } else {
            this.remove_class('invalid');
            delete input_ctrl.dom.attributes['aria-invalid'];
            delete input_ctrl.dom.attributes['aria-describedby'];

            if (error_ctrl) {
                error_ctrl.clear();
                if (error_ctrl.dom.el) error_ctrl.dom.el.textContent = '';
                if (input_ctrl.dom.el) {
                    input_ctrl.dom.el.removeAttribute('aria-invalid');
                    input_ctrl.dom.el.removeAttribute('aria-describedby');
                }
            }
        }
    }

    /**
     * Clear any error state.
     */
    clear_error() {
        this.set_error(null);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const { dom } = this;

            // Determine the actual input element
            const input_el = this._input_el_ctrl
                ? this._input_el_ctrl.dom.el
                : dom.el;

            if (input_el) {
                this.view.data.model.value = input_el.value;

                const handle_change_event = () => {
                    const masked_value = this.apply_input_mask_value
                        ? this.apply_input_mask_value(input_el.value)
                        : input_el.value;
                    if (input_el.value !== masked_value) {
                        input_el.value = masked_value;
                    }
                    this.view.data.model.value = masked_value;
                };

                const target_ctrl = this._input_el_ctrl || this;
                target_ctrl.add_dom_event_listener('change', handle_change_event);
                target_ctrl.add_dom_event_listener('keyup', handle_change_event);
                target_ctrl.add_dom_event_listener('keydown', handle_change_event);
            }
        }
    }
}

const { register_swap } = require('../../../../../control_mixins/swap_registry');

const should_enhance = el => {
    if (!el || !el.classList) return false;
    if (el.classList.contains('jsgui-enhance')) return true;
    if (typeof el.closest === 'function' && el.closest('.jsgui-form')) return true;
    return false;
};

register_swap('input[type="text"], input:not([type])', Text_Input, {
    enhancement_mode: 'enhance',
    predicate: should_enhance
});

module.exports = Text_Input;
