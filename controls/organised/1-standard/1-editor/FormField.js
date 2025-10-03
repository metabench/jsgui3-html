/**
 * FormField - A composite control that combines label, input, and validation indicator
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

class FormField extends Control {
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
            inputControl: options.inputControl || null, // Custom input control
            validator: options.validator || null
        };
        
        this.add_class('form-field');
        
        // Label container
        if (this.config.label) {
            this.labelContainer = new Control({ context, tag_name: 'div' });
            this.labelContainer.add_class('form-field-label-container');
            
            this.label = new Control({ context, tag_name: 'label' });
            this.label.add_class('form-field-label');
            this.label.add(this.config.label);
            
            if (this.config.required) {
                this.requiredIndicator = new Control({ context, tag_name: 'span' });
                this.requiredIndicator.add_class('required-indicator');
                this.requiredIndicator.add(' *');
                this.label.add(this.requiredIndicator);
            }
            
            this.labelContainer.add(this.label);
            this.add(this.labelContainer);
        }
        
        // Input container
        this.inputContainer = new Control({ context, tag_name: 'div' });
        this.inputContainer.add_class('form-field-input-container');
        
        // Create or use provided input control
        if (this.config.inputControl) {
            this.input = this.config.inputControl;
        } else {
            this.input = this._createInputControl(context);
        }
        
        this.inputContainer.add(this.input);
        
        // Validation indicator
        this.validationIndicator = new Validation_Status_Indicator({ context });
        this.validationIndicator.add_class('form-field-validation');
        this.inputContainer.add(this.validationIndicator);
        
        this.add(this.inputContainer);
        
        // Error message
        this.errorMessage = new Control({ context, tag_name: 'div' });
        this.errorMessage.add_class('form-field-error');
        this.add(this.errorMessage);
    }
    
    _createInputControl(context) {
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
    setValue(value) {
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
    getValue() {
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
    setValidation(isValid, errorMessage = '') {
        if (isValid) {
            this.validationIndicator.set_status('valid');
            this.errorMessage.content.clear();
            this.remove_class('has-error');
        } else {
            this.validationIndicator.set_status('invalid');
            this.errorMessage.content.clear();
            this.errorMessage.add(errorMessage);
            this.add_class('has-error');
        }
    }
    
    /**
     * Clear validation state
     */
    clearValidation() {
        this.validationIndicator.set_status('neutral');
        this.errorMessage.content.clear();
        this.remove_class('has-error');
    }
    
    /**
     * Enable/disable the field
     */
    setEnabled(enabled) {
        this.input.dom.el.disabled = !enabled;
        if (enabled) {
            this.remove_class('disabled');
        } else {
            this.add_class('disabled');
        }
    }
}

module.exports = FormField;
