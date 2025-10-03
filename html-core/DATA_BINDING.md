# Data Binding System for jsgui3-html

## Overview

The jsgui3-html framework now includes a comprehensive data binding system that enables declarative, two-way binding between data models and view models. This system is designed to work seamlessly with the existing MVVM architecture and provides powerful tools for managing state synchronization.

## Core Concepts

### Models in jsgui3-html

The framework distinguishes between three types of models:

1. **Data Model** (`control.data.model`) - Contains the raw, application-level data
2. **View Data Model** (`control.view.data.model`) - Contains UI-specific representations of data
3. **View Model** (`control.view.model`) - Contains UI state (selection, visibility, etc.)

### Why Separate Models?

Consider a date picker control:
- **Data Model**: Stores the date as a JavaScript Date object
- **View Data Model**: Stores the formatted date string for display ("2023-09-15")
- **View Model**: Stores whether the picker is open, highlighted, etc.

This separation allows for:
- Clean data persistence (only serialize the data model)
- Flexible UI representations (multiple views of the same data)
- Easier testing (test business logic independently of UI)

## Key Components

### 1. ModelBinder

The `ModelBinder` class provides declarative two-way binding between any two models.

```javascript
const { ModelBinder } = require('./html-core/ModelBinder');

// Create a binding
const binder = new ModelBinder(
    sourceModel,    // Usually control.data.model
    targetModel,    // Usually control.view.data.model
    {
        // Binding definitions
        'date': {
            to: 'formattedDate',
            transform: (date) => formatDate(date, 'YYYY-MM-DD'),
            reverse: (str) => parseDate(str)
        }
    },
    {
        bidirectional: true,  // Enable two-way binding
        immediate: true,      // Sync immediately
        debug: false          // Enable debug logging
    }
);
```

### 2. ComputedProperty

Computed properties automatically update when their dependencies change.

```javascript
const { ComputedProperty } = require('./html-core/ModelBinder');

// Create a computed property
const fullName = new ComputedProperty(
    model,
    ['firstName', 'lastName'],  // Dependencies
    (first, last) => `${first} ${last}`,  // Compute function
    { propertyName: 'fullName' }
);

// Now model.fullName automatically updates when firstName or lastName changes
```

### 3. PropertyWatcher

Watch for changes to specific properties and respond with custom logic.

```javascript
const { PropertyWatcher } = require('./html-core/ModelBinder');

const watcher = new PropertyWatcher(
    model,
    'selectedItem',
    (newValue, oldValue) => {
        console.log('Selection changed:', oldValue, '→', newValue);
    }
);
```

### 4. Transformations Library

A comprehensive library of common transformations for formatting and parsing data.

```javascript
const { Transformations } = require('./html-core/Transformations');

// Date transformations
Transformations.date.format(new Date(), 'YYYY-MM-DD');  // "2023-09-15"
Transformations.date.parse('2023-09-15');  // Date object

// Number transformations
Transformations.number.toCurrency(1234.56, 'USD');  // "$1,234.56"
Transformations.number.toPercent(0.85);  // "85%"

// String transformations
Transformations.string.titleCase('hello world');  // "Hello World"
Transformations.string.truncate(50)('Very long text...');  // "Very long text..."

// Compose multiple transformations
const formatter = Transformations.compose(
    Transformations.string.trim,
    Transformations.string.toUpper
);
```

## Usage in Controls

### Basic Binding Example

```javascript
class DatePicker extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Setup models
        this.data.model = new Data_Object({
            date: new Date()
        });
        
        this.view.data.model = new Data_Object({
            formattedDate: '',
            format: spec.format || 'YYYY-MM-DD'
        });
        
        // Create binding
        this.bind({
            'date': {
                to: 'formattedDate',
                transform: (date) => this.transforms.date.format(date, this.view.data.model.format),
                reverse: (str) => this.transforms.date.parse(str)
            }
        });
    }
}
```

### Computed Property Example

```javascript
class UserProfile extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        this.data.model = new Data_Object({
            firstName: 'John',
            lastName: 'Doe'
        });
        
        this.view.data.model = new Data_Object();
        
        // Computed full name
        this.computed(
            this.view.data.model,
            ['firstName', 'lastName'],
            (first, last) => `${first} ${last}`,
            { propertyName: 'fullName' }
        );
        
        // Computed initials
        this.computed(
            this.view.data.model,
            ['firstName', 'lastName'],
            (first, last) => `${first[0]}${last[0]}`.toUpperCase(),
            { propertyName: 'initials' }
        );
    }
}
```

### Watcher Example

```javascript
class DataGrid extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        this.data.model = new Data_Object({
            records: [],
            sortColumn: null,
            sortDirection: 'asc'
        });
        
        // Watch for sort changes
        this.watch(
            this.data.model,
            'sortColumn',
            (newCol, oldCol) => {
                console.log(`Sorting by ${newCol} instead of ${oldCol}`);
                this.refreshGrid();
            }
        );
        
        // Watch for data changes
        this.watch(
            this.data.model,
            'records',
            (newRecords, oldRecords) => {
                console.log(`Records changed: ${oldRecords.length} → ${newRecords.length}`);
                this.refreshGrid();
            }
        );
    }
    
    refreshGrid() {
        // Update visible records based on sort settings
        const sorted = this.sortRecords(
            this.data.model.records,
            this.data.model.sortColumn,
            this.data.model.sortDirection
        );
        
        this.view.data.model.visibleRecords = sorted;
    }
}
```

### Complex Example: Form with Validation

```javascript
class UserForm extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Data model - raw form data
        this.data.model = new Data_Object({
            email: '',
            password: '',
            confirmPassword: '',
            age: null
        });
        
        // View model - UI state
        this.view.data.model = new Data_Object({
            emailError: null,
            passwordError: null,
            confirmError: null,
            ageError: null,
            isValid: false
        });
        
        // Validation watchers
        this.watch(this.data.model, 'email', (value) => {
            if (!this.validators.email(value)) {
                this.view.data.model.emailError = 'Invalid email address';
            } else {
                this.view.data.model.emailError = null;
            }
            this.updateValidity();
        });
        
        this.watch(this.data.model, 'password', (value) => {
            if (!this.validators.length(8, 50)(value)) {
                this.view.data.model.passwordError = 'Password must be 8-50 characters';
            } else {
                this.view.data.model.passwordError = null;
            }
            this.updateValidity();
        });
        
        // Computed property for form validity
        this.computed(
            this.view.data.model,
            ['emailError', 'passwordError', 'confirmError', 'ageError'],
            (...errors) => errors.every(e => e === null),
            { propertyName: 'isValid' }
        );
    }
    
    updateValidity() {
        // Computed property handles this automatically
    }
}
```

## Debugging and Inspection

### Enable Debugging

```javascript
const { BindingDebugTools } = require('./html-core/BindingDebugger');

// Enable debugging for a control
const debugger = BindingDebugTools.enableFor(myControl);

// Now all binding operations will be logged to console
```

### Inspect Bindings

```javascript
// Get a visual representation of all bindings
BindingDebugTools.inspect(myControl);

// Output:
// === Data Bindings ===
// 
// Binder #0:
//   date ⇄ formattedDate
//     [with transformation]
//   enabled → interactive
// 
// === Computed Properties ===
//   fullName = f(firstName, lastName)
//     Current value: "John Doe"
// 
// === Watchers ===
//   ✓ selectedItem
//   ✓ sortColumn
```

### Monitor Changes

```javascript
// Monitor changes for 5 seconds
const stopMonitoring = BindingDebugTools.monitor(myControl, 5000);

// Output:
// Monitoring date_picker for 5000ms...
// Monitoring complete. Analyzing changes...
// Detected 2 change events:
// 
// Change #1 at 10:30:45:
//   dataModel.date: "2023-09-15" → "2023-09-16"
//   viewDataModel.formattedDate: "2023-09-15" → "2023-09-16"
```

### Programmatic Inspection

```javascript
// Get binding state
const state = myControl.inspectBindings();

// Returns:
// {
//     binders: [...],
//     computed: [...],
//     watchers: [...]
// }
```

## Advanced Patterns

### Conditional Binding

```javascript
this.bind({
    'value': {
        to: 'displayValue',
        transform: (v) => formatValue(v),
        condition: (v) => v !== null  // Only bind when value is not null
    }
});
```

### Composed Transformations

```javascript
const formatAndUppercase = this.transforms.compose(
    this.transforms.string.trim,
    this.transforms.string.toUpper,
    this.transforms.string.truncate(20)
);

this.bind({
    'title': {
        to: 'displayTitle',
        transform: formatAndUppercase
    }
});
```

### Bidirectional with Different Transforms

```javascript
this.bind({
    'price': {
        to: 'priceDisplay',
        transform: (num) => this.transforms.number.toCurrency(num, 'USD'),
        reverse: (str) => this.transforms.number.parse(str)
    }
}, { bidirectional: true });
```

### Manual Binding Updates

```javascript
// Create a binder but don't activate immediately
const binder = new ModelBinder(sourceModel, targetModel, bindings, { immediate: false });

// Activate when ready
binder.activate();

// Update a specific binding
binder.updateBinding('propertyName');

// Deactivate to stop syncing
binder.deactivate();
```

## Performance Considerations

### Lazy Activation

For controls that aren't immediately visible, defer binding activation:

```javascript
class LazyControl extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Create binder but don't activate
        this._binder = new ModelBinder(
            this.data.model,
            this.view.data.model,
            { /* bindings */ },
            { immediate: false }
        );
    }
    
    activate() {
        super.activate();
        if (this._binder) {
            this._binder.activate();
        }
    }
}
```

### Cleanup

Always cleanup bindings when controls are destroyed:

```javascript
class MyControl extends Data_Model_View_Model_Control {
    destroy() {
        // Binding manager automatically cleans up
        super.destroy();
    }
}
```

### Throttling Updates

For high-frequency changes, use custom watchers with throttling:

```javascript
const throttle = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

this.watch(
    this.data.model,
    'searchTerm',
    throttle((value) => {
        this.performSearch(value);
    }, 300)
);
```

## Migration Guide

### Updating Existing Controls

To add data binding to an existing control:

1. Extend `Data_Model_View_Model_Control` instead of `Control`
2. Setup data and view models in constructor
3. Replace manual sync logic with `this.bind()`
4. Replace manual property watching with `this.watch()`
5. Replace manual computed values with `this.computed()`

Before:
```javascript
class DatePicker extends Control {
    constructor(spec) {
        super(spec);
        
        this.date = new Date();
        this.formattedDate = this.formatDate(this.date);
        
        // Manual sync
        this.on('change', e => {
            if (e.name === 'date') {
                this.formattedDate = this.formatDate(e.value);
            }
        });
    }
}
```

After:
```javascript
class DatePicker extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        this.data.model = new Data_Object({ date: new Date() });
        this.view.data.model = new Data_Object({ formattedDate: '' });
        
        // Declarative binding
        this.bind({
            'date': {
                to: 'formattedDate',
                transform: (d) => this.transforms.date.format(d, 'YYYY-MM-DD')
            }
        });
    }
}
```

## Best Practices

1. **Use Transformations Library**: Leverage built-in transformations instead of writing custom formatters
2. **Keep Models Clean**: Don't mix UI state with business data
3. **Name Properties Clearly**: Use descriptive names like `formattedDate` instead of `date2`
4. **Document Bindings**: Add comments explaining complex binding logic
5. **Enable Debug Mode During Development**: Use `BindingDebugTools` to troubleshoot issues
6. **Test Transformations**: Write unit tests for custom transformation functions
7. **Cleanup Properly**: Always call `super.destroy()` to cleanup bindings

## API Reference

See individual class documentation:
- [ModelBinder.js](./ModelBinder.js)
- [Transformations.js](./Transformations.js)
- [BindingDebugger.js](./BindingDebugger.js)
- [Data_Model_View_Model_Control.js](./Data_Model_View_Model_Control.js)

## Examples

See the `examples/` directory for complete working examples:
- [Simple Form Binding](../examples/binding_simple_form.js)
- [Data Grid with Sorting](../examples/binding_data_grid.js)
- [Complex Validation](../examples/binding_validation.js)
- [Master-Detail View](../examples/binding_master_detail.js)
