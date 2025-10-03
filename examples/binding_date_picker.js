/**
 * Example: Simple Date Picker with Data Binding
 * 
 * This example demonstrates:
 * - Basic model binding
 * - Data transformations
 * - Computed properties
 * - Watchers
 */

const jsgui = require('../html-core/html-core');
const { Data_Object } = require('lang-tools');
const Data_Model_View_Model_Control = require('../html-core/Data_Model_View_Model_Control');

class DatePicker extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Setup data model with raw date
        this.data.model = new Data_Object({
            date: spec.date || new Date(),
            minDate: spec.minDate || null,
            maxDate: spec.maxDate || null,
            enabled: spec.enabled !== false
        });
        
        // Setup view model with formatted date
        this.view.data.model = new Data_Object({
            formattedDate: '',
            displayFormat: spec.format || 'YYYY-MM-DD',
            interactive: true,
            errorMessage: null
        });
        
        // Create bindings between models
        this.setupBindings();
        
        // Setup computed properties
        this.setupComputed();
        
        // Setup watchers
        this.setupWatchers();
        
        // Compose UI if not activated from existing DOM
        if (!spec.el) {
            this.compose();
        }
    }
    
    setupBindings() {
        // Bind date to formattedDate with transformation
        this.bind({
            'date': {
                to: 'formattedDate',
                transform: (date) => {
                    if (!date) return '';
                    return this.transforms.date.format(
                        date,
                        this.view.data.model.displayFormat
                    );
                },
                reverse: (str) => {
                    if (!str) return null;
                    return this.transforms.date.parse(str);
                }
            },
            'enabled': {
                to: 'interactive',
                transform: (enabled) => {
                    // Interactive only if enabled AND no error
                    return enabled && !this.view.data.model.errorMessage;
                }
            }
        });
    }
    
    setupComputed() {
        // Computed property: is the date in range?
        this.computed(
            this.view.data.model,
            ['date', 'minDate', 'maxDate'],
            (date, minDate, maxDate) => {
                if (!date) return false;
                if (minDate && date < minDate) return false;
                if (maxDate && date > maxDate) return false;
                return true;
            },
            { propertyName: 'isInRange' }
        );
        
        // Computed property: formatted date range text
        this.computed(
            this.view.data.model,
            ['minDate', 'maxDate'],
            (minDate, maxDate) => {
                if (!minDate && !maxDate) return 'Any date';
                if (minDate && !maxDate) {
                    return `From ${this.transforms.date.format(minDate, 'YYYY-MM-DD')}`;
                }
                if (!minDate && maxDate) {
                    return `Until ${this.transforms.date.format(maxDate, 'YYYY-MM-DD')}`;
                }
                return `${this.transforms.date.format(minDate, 'YYYY-MM-DD')} to ${this.transforms.date.format(maxDate, 'YYYY-MM-DD')}`;
            },
            { propertyName: 'rangeText' }
        );
    }
    
    setupWatchers() {
        // Watch for date changes and validate
        this.watch(
            this.data.model,
            'date',
            (newDate, oldDate) => {
                console.log('Date changed:', oldDate, '→', newDate);
                this.validateDate(newDate);
            }
        );
        
        // Watch for enabled state changes
        this.watch(
            this.data.model,
            'enabled',
            (enabled) => {
                if (enabled) {
                    this.remove_class('disabled');
                } else {
                    this.add_class('disabled');
                }
            },
            { immediate: true }
        );
    }
    
    validateDate(date) {
        const { minDate, maxDate } = this.data.model;
        
        if (!date) {
            this.view.data.model.errorMessage = 'Date is required';
            return false;
        }
        
        if (minDate && date < minDate) {
            this.view.data.model.errorMessage = `Date must be after ${this.transforms.date.format(minDate, 'YYYY-MM-DD')}`;
            return false;
        }
        
        if (maxDate && date > maxDate) {
            this.view.data.model.errorMessage = `Date must be before ${this.transforms.date.format(maxDate, 'YYYY-MM-DD')}`;
            return false;
        }
        
        this.view.data.model.errorMessage = null;
        return true;
    }
    
    compose() {
        this.add_class('date-picker');
        
        // Input field for date
        const input = new jsgui.Control({
            context: this.context,
            tagName: 'input',
            attrs: {
                type: 'text',
                placeholder: this.view.data.model.displayFormat
            }
        });
        
        // Bind input value to formatted date
        this.watch(
            this.view.data.model,
            'formattedDate',
            (value) => {
                if (input.dom.el) {
                    input.dom.el.value = value;
                }
            },
            { immediate: true }
        );
        
        // Handle input changes
        input.on('input', (e) => {
            const value = e.target.value;
            this.view.data.model.formattedDate = value;
        });
        
        this.add(input);
        
        // Error message display
        const errorDisplay = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'error-message'
        });
        
        this.watch(
            this.view.data.model,
            'errorMessage',
            (message) => {
                if (message) {
                    errorDisplay.clear();
                    errorDisplay.add(message);
                    errorDisplay.show();
                } else {
                    errorDisplay.hide();
                }
            }
        );
        
        this.add(errorDisplay);
        
        // Range info display
        const rangeInfo = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'range-info'
        });
        
        this.watch(
            this.view.data.model,
            'rangeText',
            (text) => {
                rangeInfo.clear();
                rangeInfo.add(text);
            },
            { immediate: true }
        );
        
        this.add(rangeInfo);
    }
}

// Usage example
function createExample() {
    const context = new jsgui.Page_Context();
    
    // Create a date picker with constraints
    const datePicker = new DatePicker({
        context,
        date: new Date(),
        minDate: new Date('2023-01-01'),
        maxDate: new Date('2023-12-31'),
        format: 'YYYY-MM-DD'
    });
    
    // Enable debugging
    const { BindingDebugTools } = require('../html-core/BindingDebugger');
    BindingDebugTools.enableFor(datePicker);
    
    // Inspect bindings
    console.log('Date Picker Bindings:');
    BindingDebugTools.inspect(datePicker);
    
    // Test changing the date
    console.log('\nChanging date to 2023-06-15...');
    datePicker.data.model.date = new Date('2023-06-15');
    
    // Test invalid date
    console.log('\nChanging date to 2024-01-01 (out of range)...');
    datePicker.data.model.date = new Date('2024-01-01');
    
    // Monitor changes for 3 seconds
    console.log('\nMonitoring changes for 3 seconds...');
    BindingDebugTools.monitor(datePicker, 3000);
    
    return datePicker;
}

// Run example if executed directly
if (require.main === module) {
    const datePicker = createExample();
    
    // Render to HTML
    console.log('\nRendered HTML:');
    console.log(datePicker.html);
}

module.exports = DatePicker;
