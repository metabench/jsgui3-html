/**
 * User Form with Server-Side Validation - Client Side
 * 
 * Demonstrates:
 * - Form field binding with transformations
 * - Client-side validation
 * - Server-side validation via API
 * - Async form submission
 * - Error display
 */

const jsgui = require('../../../html');
const { Data_Object } = require('lang-tools');
const { Control, Active_HTML_Document } = jsgui;
const Data_Model_View_Model_Control = require('../../../html-core/Data_Model_View_Model_Control');

class UserForm extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        const { context } = this;
        
        // Data model - raw user data
        this.data.model = new Data_Object({
            firstName: '',
            lastName: '',
            email: '',
            website: '',
            agreeToTerms: false
        });
        
        // View model - UI state and validation
        this.view.data.model = new Data_Object({
            errors: {},
            touched: {},
            submitting: false,
            submitMessage: null
        });
        
        this.add_class('user-form');
        
        // Create form fields
        this.createFields();
        
        // Setup bindings
        this.setupBindings();
        
        // Setup computed properties
        this.setupComputed();
    }
    
    createFields() {
        const { context } = this;
        
        // First Name
        const firstNameGroup = new Control({ context, tag_name: 'div' });
        firstNameGroup.add_class('form-group');
        
        const firstNameLabel = new Control({ context, tag_name: 'label' });
        firstNameLabel.add('First Name *');
        
        this.firstNameInput = new Control({ context, tag_name: 'input' });
        this.firstNameInput.dom.attributes.type = 'text';
        this.firstNameInput.dom.attributes.name = 'firstName';
        this.firstNameInput.add_class('form-input');
        
        this.firstNameError = new Control({ context, tag_name: 'div' });
        this.firstNameError.add_class('error-message');
        
        firstNameGroup.add(firstNameLabel);
        firstNameGroup.add(this.firstNameInput);
        firstNameGroup.add(this.firstNameError);
        
        // Last Name
        const lastNameGroup = new Control({ context, tag_name: 'div' });
        lastNameGroup.add_class('form-group');
        
        const lastNameLabel = new Control({ context, tag_name: 'label' });
        lastNameLabel.add('Last Name *');
        
        this.lastNameInput = new Control({ context, tag_name: 'input' });
        this.lastNameInput.dom.attributes.type = 'text';
        this.lastNameInput.dom.attributes.name = 'lastName';
        this.lastNameInput.add_class('form-input');
        
        this.lastNameError = new Control({ context, tag_name: 'div' });
        this.lastNameError.add_class('error-message');
        
        lastNameGroup.add(lastNameLabel);
        lastNameGroup.add(this.lastNameInput);
        lastNameGroup.add(this.lastNameError);
        
        // Email
        const emailGroup = new Control({ context, tag_name: 'div' });
        emailGroup.add_class('form-group');
        
        const emailLabel = new Control({ context, tag_name: 'label' });
        emailLabel.add('Email Address *');
        
        this.emailInput = new Control({ context, tag_name: 'input' });
        this.emailInput.dom.attributes.type = 'email';
        this.emailInput.dom.attributes.name = 'email';
        this.emailInput.add_class('form-input');
        
        this.emailError = new Control({ context, tag_name: 'div' });
        this.emailError.add_class('error-message');
        
        emailGroup.add(emailLabel);
        emailGroup.add(this.emailInput);
        emailGroup.add(this.emailError);
        
        // Website
        const websiteGroup = new Control({ context, tag_name: 'div' });
        websiteGroup.add_class('form-group');
        
        const websiteLabel = new Control({ context, tag_name: 'label' });
        websiteLabel.add('Website (optional)');
        
        this.websiteInput = new Control({ context, tag_name: 'input' });
        this.websiteInput.dom.attributes.type = 'url';
        this.websiteInput.dom.attributes.name = 'website';
        this.websiteInput.add_class('form-input');
        
        this.websiteError = new Control({ context, tag_name: 'div' });
        this.websiteError.add_class('error-message');
        
        websiteGroup.add(websiteLabel);
        websiteGroup.add(this.websiteInput);
        websiteGroup.add(this.websiteError);
        
        // Terms checkbox
        const termsGroup = new Control({ context, tag_name: 'div' });
        termsGroup.add_class('form-group');
        termsGroup.add_class('checkbox-group');
        
        this.termsCheckbox = new Control({ context, tag_name: 'input' });
        this.termsCheckbox.dom.attributes.type = 'checkbox';
        this.termsCheckbox.dom.attributes.name = 'agreeToTerms';
        this.termsCheckbox.add_class('form-checkbox');
        
        const termsLabel = new Control({ context, tag_name: 'label' });
        termsLabel.add('I agree to the Terms and Conditions *');
        
        this.termsError = new Control({ context, tag_name: 'div' });
        this.termsError.add_class('error-message');
        
        termsGroup.add(this.termsCheckbox);
        termsGroup.add(termsLabel);
        termsGroup.add(this.termsError);
        
        // Submit button
        this.submitButton = new Control({ context, tag_name: 'button' });
        this.submitButton.add('Register');
        this.submitButton.add_class('submit-button');
        this.submitButton.dom.attributes.type = 'submit';
        
        // Submit message
        this.submitMessage = new Control({ context, tag_name: 'div' });
        this.submitMessage.add_class('submit-message');
        
        // Add all to form
        this.add(firstNameGroup);
        this.add(lastNameGroup);
        this.add(emailGroup);
        this.add(websiteGroup);
        this.add(termsGroup);
        this.add(this.submitButton);
        this.add(this.submitMessage);
    }
    
    setupBindings() {
        // Bind form fields with transformations
        this.bind('firstName', this.data.model, {
            toView: (value) => value,
            toModel: (value) => this.transforms.string.capitalize(value)
        }, this.firstNameInput, 'value');
        
        this.bind('lastName', this.data.model, {
            toView: (value) => value,
            toModel: (value) => this.transforms.string.capitalize(value)
        }, this.lastNameInput, 'value');
        
        this.bind('email', this.data.model, {
            toView: (value) => value,
            toModel: (value) => this.transforms.string.toLowerCase(value.trim())
        }, this.emailInput, 'value');
        
        this.bind('website', this.data.model, {
            toView: (value) => value,
            toModel: (value) => value.trim()
        }, this.websiteInput, 'value');
        
        this.bind('agreeToTerms', this.data.model, {
            toView: (value) => value,
            toModel: (value) => value
        }, this.termsCheckbox, 'checked');
        
        // Bind error messages
        this.bind('errors.firstName', this.view.data.model, {
            toView: (error) => error || ''
        }, this.firstNameError);
        
        this.bind('errors.lastName', this.view.data.model, {
            toView: (error) => error || ''
        }, this.lastNameError);
        
        this.bind('errors.email', this.view.data.model, {
            toView: (error) => error || ''
        }, this.emailError);
        
        this.bind('errors.website', this.view.data.model, {
            toView: (error) => error || ''
        }, this.websiteError);
        
        this.bind('errors.agreeToTerms', this.view.data.model, {
            toView: (error) => error || ''
        }, this.termsError);
        
        this.bind('submitMessage', this.view.data.model, {
            toView: (msg) => msg || ''
        }, this.submitMessage);
    }
    
    setupComputed() {
        // Compute form validity based on errors and submitting state
        this.computed(
            this.view.data.model,
            ['errors', 'submitting'],
            (errors, submitting) => {
                const hasErrors = errors && Object.values(errors).some(err => err);
                return !hasErrors && !submitting;
            },
            { propertyName: 'isFormValid' }
        );
        
        // Watch form validity to update button state
        this.watch(this.view.data.model, 'isFormValid', (isValid) => {
            if (isValid) {
                this.submitButton.remove_class('disabled');
            } else {
                this.submitButton.add_class('disabled');
            }
        });
        
        // Watch submitting state to update button content
        this.watch(this.view.data.model, 'submitting', (submitting) => {
            if (submitting) {
                this.submitButton.content.clear();
                this.submitButton.add('Submitting...');
                this.submitButton.add_class('submitting');
            } else {
                this.submitButton.content.clear();
                this.submitButton.add('Register');
                this.submitButton.remove_class('submitting');
            }
        });
    }
    
    validateField(fieldName) {
        const value = this.data.model.get(fieldName);
        let error = null;
        
        switch(fieldName) {
            case 'firstName':
            case 'lastName':
                if (!value || value.trim() === '') {
                    error = `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`;
                } else if (value.length < 2 || value.length > 50) {
                    error = 'Name must be 2-50 characters';
                }
                break;
                
            case 'email':
                if (!value || value.trim() === '') {
                    error = 'Email is required';
                } else if (!this.validators.email(value)) {
                    error = 'Invalid email address';
                }
                break;
                
            case 'website':
                if (value && !this.validators.url(value)) {
                    error = 'Invalid website URL';
                }
                break;
                
            case 'agreeToTerms':
                if (!value) {
                    error = 'You must agree to the terms';
                }
                break;
        }
        
        const errors = this.view.data.model.get('errors') || {};
        if (error) {
            errors[fieldName] = error;
        } else {
            delete errors[fieldName];
        }
        this.view.data.model.set('errors', errors);
        
        return error === null;
    }
    
    validateAll() {
        const fields = ['firstName', 'lastName', 'email', 'website', 'agreeToTerms'];
        let allValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                allValid = false;
            }
        });
        
        return allValid;
    }
    
    async validateOnServer() {
        // Call server-side validation API
        try {
            const response = await fetch('/api/validateUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data.model.get())
            });
            
            const result = await response.json();
            
            if (!result.valid) {
                const errors = this.view.data.model.get('errors') || {};
                Object.assign(errors, result.errors);
                this.view.data.model.set('errors', errors);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Server validation failed:', error);
            return false;
        }
    }
    
    async handleSubmit() {
        // Validate client-side first
        if (!this.validateAll()) {
            this.view.data.model.set('submitMessage', 'Please fix the errors above');
            this.submitMessage.add_class('error');
            return;
        }
        
        // Set submitting state
        this.view.data.model.set('submitting', true);
        this.view.data.model.set('submitMessage', null);
        this.submitMessage.remove_class('error');
        this.submitMessage.remove_class('success');
        
        // Validate on server
        const serverValid = await this.validateOnServer();
        
        if (!serverValid) {
            this.view.data.model.set('submitting', false);
            this.view.data.model.set('submitMessage', 'Server validation failed. Please check your input.');
            this.submitMessage.add_class('error');
            return;
        }
        
        // Submit to server
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data.model.get())
            });
            
            const result = await response.json();
            
            this.view.data.model.set('submitting', false);
            
            if (result.success) {
                this.view.data.model.set('submitMessage', '✓ Registration successful!');
                this.submitMessage.add_class('success');
                
                // Reset form after 2 seconds
                setTimeout(() => {
                    this.data.model.set({
                        firstName: '',
                        lastName: '',
                        email: '',
                        website: '',
                        agreeToTerms: false
                    });
                    this.view.data.model.set('errors', {});
                    this.view.data.model.set('submitMessage', null);
                }, 2000);
            } else {
                this.view.data.model.set('submitMessage', `Error: ${result.error}`);
                this.submitMessage.add_class('error');
            }
        } catch (error) {
            this.view.data.model.set('submitting', false);
            this.view.data.model.set('submitMessage', 'Network error. Please try again.');
            this.submitMessage.add_class('error');
        }
    }
    
    activate() {
        if (!this.__active) {
            super.activate();
            
            // Attach blur handlers for validation
            this.firstNameInput.on('blur', () => {
                this.view.data.model.set('touched.firstName', true);
                this.validateField('firstName');
            });
            
            this.lastNameInput.on('blur', () => {
                this.view.data.model.set('touched.lastName', true);
                this.validateField('lastName');
            });
            
            this.emailInput.on('blur', () => {
                this.view.data.model.set('touched.email', true);
                this.validateField('email');
            });
            
            this.websiteInput.on('blur', () => {
                this.view.data.model.set('touched.website', true);
                this.validateField('website');
            });
            
            this.termsCheckbox.on('change', () => {
                this.validateField('agreeToTerms');
            });
            
            // Handle form submission
            this.submitButton.on('click', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
            
            console.log('User form activated on client');
        }
    }
}

UserForm.css = `
    .user-form {
        max-width: 500px;
        margin: 0 auto;
        padding: 30px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
    }
    
    .form-input {
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 4px;
        font-size: 1em;
        transition: border-color 0.2s;
    }
    
    .form-input:focus {
        outline: none;
        border-color: #667eea;
    }
    
    .form-input:invalid {
        border-color: #f44336;
    }
    
    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .form-checkbox {
        width: auto;
        margin: 0;
    }
    
    .error-message {
        color: #f44336;
        font-size: 0.9em;
        margin-top: 5px;
        min-height: 1.2em;
    }
    
    .submit-button {
        width: 100%;
        padding: 12px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1.1em;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .submit-button:hover:not(.disabled):not(.submitting) {
        background: #5568d3;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .submit-button.disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    
    .submit-button.submitting {
        background: #999;
        cursor: wait;
    }
    
    .submit-message {
        margin-top: 15px;
        padding: 12px;
        border-radius: 4px;
        text-align: center;
        font-weight: 600;
    }
    
    .submit-message.success {
        background: #4caf50;
        color: white;
    }
    
    .submit-message.error {
        background: #ffebee;
        color: #c62828;
    }
`;

class Demo_UI extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'user_form_demo_ui';
        super(spec);
        
        const { context } = this;
        
        if (typeof this.body.add_class === 'function') {
            this.body.add_class('form-demo');
        }
        
        if (!spec.el) {
            const title = new Control({ context, tag_name: 'h1' });
            title.add('User Registration with Server Validation');
            title.add_class('demo-title');
            
            const description = new Control({ context, tag_name: 'p' });
            description.add('This form demonstrates client-side and server-side validation. ' +
                          'Try submitting invalid data to see validation in action.');
            description.add_class('demo-description');
            
            const form = new UserForm({ context });
            
            const info = new Control({ context, tag_name: 'div' });
            info.add_class('demo-info');
            info.add('💡 The form validates on blur (client-side) and submission (server-side). ' +
                    'Data is transformed (names capitalized, email lowercase) and validated before submission.');
            
            this.body.add(title);
            this.body.add(description);
            this.body.add(form);
            this.body.add(info);
        }
    }
    
    activate() {
        if (!this.__active) {
            super.activate();
            console.log('Form Demo UI activated');
        }
    }
}

Demo_UI.css = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 20px;
    }
    
    .form-demo {
        max-width: 800px;
        margin: 0 auto;
    }
    
    .demo-title {
        color: white;
        text-align: center;
        margin-bottom: 20px;
        font-size: 2.5em;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .demo-description {
        color: white;
        text-align: center;
        margin-bottom: 40px;
        font-size: 1.2em;
        line-height: 1.6;
        opacity: 0.9;
    }
    
    .demo-info {
        color: white;
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        line-height: 1.6;
    }
`;

jsgui.controls = jsgui.controls || {};
jsgui.controls.Demo_UI = Demo_UI;
jsgui.controls.UserForm = UserForm;

module.exports = jsgui;
