/**
 * Form_Field - A composite control that combines label, input, and validation indicator
 * 
 * Features:
 * - Label with required indicator
 * - Input control (Text_Input, Checkbox, Dropdown_List, etc.)
 * - Validation status indicator
 * - Error message display
 * - Flexible input type support
 */

const Control = require('../../../../html-core/control');
const Text_Input = require('../../0-core/0-basic/0-native-compositional/Text_Input');
const Validation_Status_Indicator = require('../../0-core/0-basic/1-compositional/Validation_Status_Indicator');

class Form_Field extends Control {
    constructor(options = {}) {
        super(options);
        
        const { context } = options;
        
        // Configuration
        this.config = {
            label: options.label || '',
            name: options.name || '',
            type: options.type || 'text', // text, email, password, checkbox, select, textarea
            placeholder: options.placeholder || '',
            required: options.required || false,
            input_control: options.input_control || null, // Custom input control
            validator: options.validator || null
        };
        
        this.add_class('form-field');
        
        // Label container
        if (this.config.label) {
            this.label_container = new Control({ context, tag_name: 'div' });
            this.label_container.add_class('form-field-label-container');
            
            this.label = new Control({ context, tag_name: 'label' });
            this.label.add_class('form-field-label');
            this.label.add(this.config.label);
            
            if (this.config.required) {
                this.required_indicator = new Control({ context, tag_name: 'span' });
                this.required_indicator.add_class('required-indicator');
                this.required_indicator.add(' *');
                this.label.add(this.required_indicator);
            }
            
            this.label_container.add(this.label);
            this.add(this.label_container);
        }
        
        // Input container
        this.input_container = new Control({ context, tag_name: 'div' });
        this.input_container.add_class('form-field-input-container');
        
        // Create or use provided input control
        if (this.config.input_control) {
            this.input = this.config.input_control;
        } else {
            this.input = this._create_input_control(context);
        }
        
        this.input_container.add(this.input);
        
        // Validation indicator
        this.validation_indicator = new Validation_Status_Indicator({ context });
        this.validation_indicator.add_class('form-field-validation');
        this.input_container.add(this.validation_indicator);
        
        this.add(this.input_container);
        
        // Error message
        this.error_message = new Control({ context, tag_name: 'div' });
        this.error_message.add_class('form-field-error');
        this.add(this.error_message);
    }
    
    _create_input_control(context) {
        const { type, placeholder, name } = this.config;
        
        switch (type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
            case 'url':
            case 'tel':
                const input = new Text_Input({ context });
                input.dom.attributes.type = type;
                input.dom.attributes.name = name;
                if (placeholder) input.dom.attributes.placeholder = placeholder;
                return input;
                
            case 'textarea':
                const textarea = new Control({ context, tag_name: 'textarea' });
                textarea.dom.attributes.name = name;
                if (placeholder) textarea.dom.attributes.placeholder = placeholder;
                textarea.add_class('form-textarea');
                return textarea;
                
            case 'checkbox':
                const checkbox = new Control({ context, tag_name: 'input' });
                checkbox.dom.attributes.type = 'checkbox';
                checkbox.dom.attributes.name = name;
                checkbox.add_class('form-checkbox');
                return checkbox;
                
            case 'select':
                const select = new Control({ context, tag_name: 'select' });
                select.dom.attributes.name = name;
                select.add_class('form-select');
                return select;
                
            default:
                return new Text_Input({ context });
        }
    }
    
    /**
     * Set the field value
     */
    set_value(value) {
        const { type } = this.config;
        
        if (type === 'checkbox') {
            this.input.dom.el.checked = !!value;
        } else if (type === 'select') {
            this.input.dom.el.value = value;
        } else {
            this.input.dom.el.value = value || '';
        }
    }
    
    /**
     * Get the field value
     */
    get_value() {
        const { type } = this.config;
        
        if (type === 'checkbox') {
            return this.input.dom.el.checked;
        } else {
            return this.input.dom.el.value;
        }
    }
    
    /**
     * Set validation state
     */
    set_validation(is_valid, error_message = '') {
        if (is_valid) {
            this.validation_indicator.set_status('valid');
            this.error_message.content.clear();
            this.remove_class('has-error');
        } else {
            this.validation_indicator.set_status('invalid');
            this.error_message.content.clear();
            this.error_message.add(error_message);
            this.add_class('has-error');
        }
    }
    
    /**
     * Clear validation state
     */
    clear_validation() {
        this.validation_indicator.set_status('neutral');
        this.error_message.content.clear();
        this.remove_class('has-error');
    }
    
    /**
     * Enable/disable the field
     */
    set_enabled(enabled) {
        this.input.dom.el.disabled = !enabled;
        if (enabled) {
            this.remove_class('disabled');
        } else {
            this.add_class('disabled');
        }
    }
}

module.exports = Form_Field;
