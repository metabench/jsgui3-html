/**
 * Example: User Form with Validation
 * 
 * This example demonstrates:
 * - Form field binding
 * - Validation with multiple validators
 * - Computed properties for form state
 * - Error display and handling
 * - Transformation of user input
 */

const jsgui = require('../html-core/html-core');
const { Data_Object } = require('lang-tools');
const Data_Model_View_Model_Control = require('../html-core/Data_Model_View_Model_Control');

class UserForm extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Data model - raw user data
        this.data.model = new Data_Object({
            firstName: '',
            lastName: '',
            email: '',
            age: null,
            website: '',
            bio: '',
            agreeToTerms: false
        });
        
        // View model - UI state and validation
        this.view.data.model = new Data_Object({
            errors: {},
            touched: {},
            submitting: false,
            submitMessage: null
        });
        
        this.setupBindings();
        this.setupValidation();
        this.setupComputed();
        this.setupWatchers();
        
        if (!spec.el) {
            this.compose();
        }
    }
    
    setupBindings() {
        // Bind name fields with capitalization
        this.bind({
            'firstName': {
                to: 'firstName',
                transform: this.transforms.string.capitalize
            },
            'lastName': {
                to: 'lastName',
                transform: this.transforms.string.capitalize
            },
            'email': {
                to: 'email',
                transform: this.transforms.string.toLowerCase
            },
            'website': {
                to: 'website',
                transform: this.transforms.string.trim
            },
            'bio': {
                to: 'bio',
                transform: (text) => this.transforms.string.truncate(text, 500)
            }
        });
    }
    
    setupValidation() {
        // Define validation rules
        this.validationRules = {
            firstName: [
                { validator: this.validators.required, message: 'First name is required' },
                { validator: (v) => this.validators.length(v, 2, 50), message: 'First name must be 2-50 characters' }
            ],
            lastName: [
                { validator: this.validators.required, message: 'Last name is required' },
                { validator: (v) => this.validators.length(v, 2, 50), message: 'Last name must be 2-50 characters' }
            ],
            email: [
                { validator: this.validators.required, message: 'Email is required' },
                { validator: this.validators.email, message: 'Invalid email address' }
            ],
            age: [
                { validator: (v) => v === null || this.validators.range(v, 13, 120), message: 'Age must be between 13 and 120' }
            ],
            website: [
                { validator: (v) => !v || this.validators.url(v), message: 'Invalid website URL' }
            ],
            agreeToTerms: [
                { validator: (v) => v === true, message: 'You must agree to the terms' }
            ]
        };
    }
    
    setupComputed() {
        // Computed: full name
        this.computed(
            this.data.model,
            ['firstName', 'lastName'],
            (first, last) => {
                return [first, last].filter(Boolean).join(' ') || 'Anonymous';
            },
            { propertyName: 'fullName' }
        );
        
        // Computed: form validity
        this.computed(
            this.view.data.model,
            ['errors'],
            (errors) => {
                return Object.keys(errors).length === 0;
            },
            { propertyName: 'isValid' }
        );
        
        // Computed: has errors
        this.computed(
            this.view.data.model,
            ['errors'],
            (errors) => {
                return Object.keys(errors).filter(key => errors[key]).length;
            },
            { propertyName: 'errorCount' }
        );
        
        // Computed: can submit
        this.computed(
            this.view.data.model,
            ['isValid', 'submitting'],
            (isValid, submitting) => {
                return isValid && !submitting;
            },
            { propertyName: 'canSubmit' }
        );
    }
    
    setupWatchers() {
        // Watch each field for changes and validate
        const fields = ['firstName', 'lastName', 'email', 'age', 'website', 'agreeToTerms'];
        
        fields.forEach(field => {
            this.watch(
                this.data.model,
                field,
                (value) => {
                    // Mark field as touched
                    this.view.data.model.touched[field] = true;
                    
                    // Validate field
                    this.validateField(field, value);
                }
            );
        });
    }
    
    validateField(field, value) {
        const rules = this.validationRules[field];
        if (!rules) return true;
        
        for (const rule of rules) {
            if (!rule.validator(value)) {
                this.view.data.model.errors[field] = rule.message;
                return false;
            }
        }
        
        // Clear error if valid
        delete this.view.data.model.errors[field];
        this.view.data.model.errors = { ...this.view.data.model.errors };
        return true;
    }
    
    validateAll() {
        const fields = ['firstName', 'lastName', 'email', 'age', 'website', 'agreeToTerms'];
        let isValid = true;
        
        fields.forEach(field => {
            const value = this.data.model[field];
            if (!this.validateField(field, value)) {
                isValid = false;
            }
            this.view.data.model.touched[field] = true;
        });
        
        return isValid;
    }
    
    async handleSubmit() {
        if (!this.validateAll()) {
            this.view.data.model.submitMessage = 'Please fix errors before submitting';
            return;
        }
        
        this.view.data.model.submitting = true;
        this.view.data.model.submitMessage = 'Submitting...';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('Form submitted:', this.data.model);
            this.view.data.model.submitMessage = 'Form submitted successfully!';
            this.trigger('submit', this.data.model);
        } catch (error) {
            this.view.data.model.submitMessage = 'Submission failed: ' + error.message;
        } finally {
            this.view.data.model.submitting = false;
        }
    }
    
    compose() {
        this.add_class('user-form');
        
        // Form title
        this.add(new jsgui.Control({
            context: this.context,
            tagName: 'h2',
            content: 'User Registration'
        }));
        
        // First name field
        this.add(this.createField({
            label: 'First Name',
            field: 'firstName',
            type: 'text',
            placeholder: 'Enter your first name'
        }));
        
        // Last name field
        this.add(this.createField({
            label: 'Last Name',
            field: 'lastName',
            type: 'text',
            placeholder: 'Enter your last name'
        }));
        
        // Email field
        this.add(this.createField({
            label: 'Email',
            field: 'email',
            type: 'email',
            placeholder: 'your.email@example.com'
        }));
        
        // Age field
        this.add(this.createField({
            label: 'Age (optional)',
            field: 'age',
            type: 'number',
            placeholder: '18'
        }));
        
        // Website field
        this.add(this.createField({
            label: 'Website (optional)',
            field: 'website',
            type: 'url',
            placeholder: 'https://example.com'
        }));
        
        // Bio field
        this.add(this.createField({
            label: 'Bio (optional)',
            field: 'bio',
            type: 'textarea',
            placeholder: 'Tell us about yourself...'
        }));
        
        // Terms checkbox
        this.add(this.createCheckbox({
            label: 'I agree to the terms and conditions',
            field: 'agreeToTerms'
        }));
        
        // Submit button
        const submitBtn = new jsgui.Control({
            context: this.context,
            tagName: 'button',
            attrs: { type: 'button' },
            content: 'Submit'
        });
        
        this.watch(
            this.view.data.model,
            'canSubmit',
            (canSubmit) => {
                if (submitBtn.dom.el) {
                    submitBtn.dom.el.disabled = !canSubmit;
                }
            },
            { immediate: true }
        );
        
        submitBtn.on('click', () => this.handleSubmit());
        this.add(submitBtn);
        
        // Submit message
        const submitMessage = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'submit-message'
        });
        
        this.watch(
            this.view.data.model,
            'submitMessage',
            (message) => {
                if (message) {
                    submitMessage.clear();
                    submitMessage.add(message);
                    submitMessage.show();
                } else {
                    submitMessage.hide();
                }
            }
        );
        
        this.add(submitMessage);
    }
    
    createField(spec) {
        const container = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'form-field'
        });
        
        // Label
        container.add(new jsgui.Control({
            context: this.context,
            tagName: 'label',
            content: spec.label
        }));
        
        // Input
        const input = new jsgui.Control({
            context: this.context,
            tagName: spec.type === 'textarea' ? 'textarea' : 'input',
            attrs: {
                type: spec.type === 'textarea' ? undefined : spec.type,
                placeholder: spec.placeholder
            }
        });
        
        // Bind input to model
        this.watch(
            this.data.model,
            spec.field,
            (value) => {
                if (input.dom.el) {
                    input.dom.el.value = value || '';
                }
            },
            { immediate: true }
        );
        
        input.on('input', (e) => {
            const value = e.target.value;
            this.data.model[spec.field] = spec.type === 'number' ? 
                (value ? Number(value) : null) : value;
        });
        
        container.add(input);
        
        // Error message
        const errorMsg = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'error-message'
        });
        
        this.watch(
            this.view.data.model,
            'errors',
            (errors) => {
                const error = errors[spec.field];
                const touched = this.view.data.model.touched[spec.field];
                
                if (error && touched) {
                    errorMsg.clear();
                    errorMsg.add(error);
                    errorMsg.show();
                    container.add_class('has-error');
                } else {
                    errorMsg.hide();
                    container.remove_class('has-error');
                }
            }
        );
        
        container.add(errorMsg);
        
        return container;
    }
    
    createCheckbox(spec) {
        const container = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'form-checkbox'
        });
        
        const input = new jsgui.Control({
            context: this.context,
            tagName: 'input',
            attrs: { type: 'checkbox' }
        });
        
        this.watch(
            this.data.model,
            spec.field,
            (value) => {
                if (input.dom.el) {
                    input.dom.el.checked = !!value;
                }
            },
            { immediate: true }
        );
        
        input.on('change', (e) => {
            this.data.model[spec.field] = e.target.checked;
        });
        
        container.add(input);
        
        const label = new jsgui.Control({
            context: this.context,
            tagName: 'label',
            content: spec.label
        });
        
        container.add(label);
        
        // Error message
        const errorMsg = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'error-message'
        });
        
        this.watch(
            this.view.data.model,
            'errors',
            (errors) => {
                const error = errors[spec.field];
                const touched = this.view.data.model.touched[spec.field];
                
                if (error && touched) {
                    errorMsg.clear();
                    errorMsg.add(error);
                    errorMsg.show();
                } else {
                    errorMsg.hide();
                }
            }
        );
        
        container.add(errorMsg);
        
        return container;
    }
}

// Usage example
function createExample() {
    const context = new jsgui.Page_Context();
    
    const form = new UserForm({ context });
    
    // Listen for submit
    form.on('submit', (data) => {
        console.log('Form submitted with data:', data);
    });
    
    // Pre-fill some data
    form.data.model.firstName = 'john';
    form.data.model.lastName = 'doe';
    form.data.model.email = 'JOHN.DOE@EXAMPLE.COM';
    
    // Enable debugging
    const { BindingDebugTools } = require('../html-core/BindingDebugger');
    BindingDebugTools.inspect(form);
    
    return form;
}

if (require.main === module) {
    const form = createExample();
    console.log('\nRendered HTML:');
    console.log(form.html);
}

module.exports = UserForm;
