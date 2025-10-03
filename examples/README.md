# jsgui3-html Examples

Comprehensive examples demonstrating the capabilities of the jsgui3-html framework, with special focus on the new MVVM data binding system.

## Available Examples

### Data Binding Examples

#### 1. Date Picker (`binding_date_picker.js`)

A complete date picker control demonstrating:
- Basic model binding with transformations
- Date formatting and parsing
- Computed properties (`isInRange`, `rangeText`)
- Property watchers for validation
- Real-time validation with error messages
- Debugging with BindingDebugTools

**Key Features:**
- Two-way binding between raw date and formatted display
- Min/max date range validation
- Automatic error message display
- Interactive state management

**Run Example:**
```bash
node examples/binding_date_picker.js
```

**Usage in Code:**
```javascript
const datePicker = new DatePicker({
    context,
    date: new Date(),
    minDate: new Date('2023-01-01'),
    maxDate: new Date('2023-12-31'),
    format: 'YYYY-MM-DD'
});
```

#### 2. User Form with Validation (`binding_user_form.js`)

A comprehensive registration form demonstrating:
- Multi-field form binding
- Real-time validation with multiple validators
- Computed form state (`isValid`, `errorCount`, `canSubmit`)
- Transformation of user input (capitalization, lowercase, truncation)
- Touch-tracking for better UX
- Async form submission

**Key Features:**
- First name, last name, email, age, website, bio fields
- Required field validation
- Email format validation
- URL validation
- Length validation
- Terms agreement checkbox
- Error display only for touched fields
- Submit button state management

**Run Example:**
```bash
node examples/binding_user_form.js
```

**Usage in Code:**
```javascript
const form = new UserForm({ context });

form.on('submit', (data) => {
    console.log('Form submitted:', data);
});
```

#### 3. Data Grid with Sorting and Filtering (`binding_data_grid.js`)

A powerful data grid demonstrating:
- Collection binding and rendering
- Computed filtering based on search text
- Computed sorting by any column
- Pagination with computed page count
- Row selection tracking
- Custom column formatters
- Dynamic re-rendering

**Key Features:**
- Filter by any text across all columns
- Sort by clicking column headers (ascending/descending)
- Pagination controls with page info
- Row selection with visual feedback
- Result count display
- Automatic reset to page 1 on filter/sort

**Run Example:**
```bash
node examples/binding_data_grid.js
```

**Usage in Code:**
```javascript
const grid = new DataGrid({
    context,
    items: arrayOfObjects,
    columns: [
        { field: 'id', label: 'ID' },
        { field: 'name', label: 'Name' },
        { 
            field: 'age', 
            label: 'Age',
            formatter: (val) => val ? `${val} years` : '-'
        }
    ],
    pageSize: 10
});
```

#### 4. Master-Detail View (`binding_master_detail.js`)

A sophisticated master-detail interface demonstrating:
- Master list with search/filter
- Detail pane with synchronized navigation
- Computed selected item from ID
- Previous/Next navigation with boundary checking
- Navigation info display
- Empty state handling

**Key Features:**
- Search items in master list
- Click to select item
- Detail view updates automatically
- Navigate with Previous/Next buttons
- Displays "X of Y" position
- Handles empty states gracefully

**Run Example:**
```bash
node examples/binding_master_detail.js
```

**Usage in Code:**
```javascript
const view = new MasterDetailView({
    context,
    items: [
        {
            id: 1,
            title: 'Item Title',
            subtitle: 'Subtitle',
            description: 'Description...',
            metadata: { author: 'Name', date: '2025-10-03' },
            content: 'Full content...'
        }
    ]
});

view.selectItem(1);
```

### Legacy Examples

#### 5. Basic Controls Rendering (`controls_rendering.js`)

Demonstrates basic control creation and rendering without MVVM.

#### 6. Compositional Models (`compositional_models_controls_rendering.js`)

Shows compositional pattern for complex controls.

## Data Binding System Overview

All new examples use the comprehensive data binding system with:

### ModelBinder
- One-way and two-way binding
- Transformation functions
- Reverse transformations
- Automatic synchronization

### Computed Properties
- Automatic dependency tracking
- Efficient recalculation
- Support for multiple dependencies
- Cross-model computations

### Property Watchers
- Observe property changes
- Execute callbacks
- Immediate execution option
- Watch multiple properties

### Transformations Library
- **String**: capitalize, titleCase, trim, truncate, slugify
- **Number**: currency, percentage, fixed decimals, commas
- **Date**: format, parse, ISO, locale, relative
- **Boolean**: yes/no, on/off, enabled/disabled
- **Array**: join, first, last, sort, unique, pluck
- **Object**: keys, values, pick, omit

### Validators
- required, email, url, pattern
- range, min, max, length

### Debugging Tools
- `BindingDebugTools.inspect()`: View all bindings
- `BindingDebugTools.monitor()`: Watch changes
- Snapshot and compare model states

## Common Patterns

### Basic Binding

```javascript
class MyControl extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        this.data.model = new Data_Object({
            value: 10
        });
        
        this.view.data.model = new Data_Object({
            display: ''
        });
        
        // Bind with transformation
        this.bind({
            'value': {
                to: 'display',
                transform: (val) => `Value: ${val}`
            }
        });
    }
}
```

### Computed Properties

```javascript
this.computed(
    this.data.model,
    ['firstName', 'lastName'],
    (first, last) => `${first} ${last}`,
    { propertyName: 'fullName' }
);
```

### Property Watchers

```javascript
this.watch(
    this.data.model,
    'value',
    (newVal, oldVal) => {
        console.log(`Changed from ${oldVal} to ${newVal}`);
    }
);
```

### Validation

```javascript
validateField(field, value) {
    const rules = [
        { validator: this.validators.required, message: 'Required' },
        { validator: this.validators.email, message: 'Invalid email' }
    ];
    
    for (const rule of rules) {
        if (!rule.validator(value)) {
            this.view.data.model.errors[field] = rule.message;
            return false;
        }
    }
    
    return true;
}
```

### Cross-Model Computed Properties

```javascript
this.computed(
    [this.data.model, this.view.data.model],
    ['items', 'filterText'],
    (items, filter) => {
        return items.filter(item => 
            item.includes(filter)
        );
    },
    { 
        propertyName: 'filteredItems',
        target: this.view.data.model
    }
);
```

## Running Examples

### Prerequisites

```bash
npm install
```

### Run Single Example

```bash
node examples/binding_date_picker.js
node examples/binding_user_form.js
node examples/binding_data_grid.js
node examples/binding_master_detail.js
```

### Server-Side Rendering

All examples support server-side rendering and will output HTML:

```javascript
const control = createExample();
console.log(control.html);
```

### Client-Side Usage

Mount to DOM:

```javascript
const control = new DatePicker({ context });
control.mount(document.getElementById('app'));
```

## Debugging Examples

Enable debugging for any example:

```javascript
const { BindingDebugTools } = require('./html-core/BindingDebugger');

// Enable for specific control
BindingDebugTools.enableFor(control);

// Inspect bindings
BindingDebugTools.inspect(control);

// Monitor changes for 5 seconds
BindingDebugTools.monitor(control, 5000);
```

## Example Architecture

All binding examples follow this structure:

```
MyControl (extends Data_Model_View_Model_Control)
├── data.model (Data_Object)
│   └── Raw application data
├── view.data.model (Data_Object)
│   └── UI state and computed values
├── setupBindings()
│   └── Define model-to-view bindings
├── setupComputed()
│   └── Define computed properties
├── setupWatchers()
│   └── Define property watchers
└── compose()
    └── Build UI controls
```

## Best Practices

### 1. Separate Models
Keep data model and view model separate:
- **Data Model**: Business data (user info, items, dates)
- **View Model**: UI state (errors, loading, visibility)

### 2. Use Transformations
Transform data during binding rather than in UI:
```javascript
this.bind({
    'price': {
        to: 'displayPrice',
        transform: this.transforms.number.toCurrency
    }
});
```

### 3. Computed Properties for Derived State
Use computed properties instead of manual updates:
```javascript
// Good
this.computed(this.data.model, ['width', 'height'],
    (w, h) => w * h,
    { propertyName: 'area' }
);

// Avoid
this.watch(this.data.model, 'width', () => {
    this.data.model.area = this.data.model.width * this.data.model.height;
});
```

### 4. Validate Incrementally
Validate fields as they change, not just on submit:
```javascript
this.watch(this.data.model, 'email', (value) => {
    this.validateField('email', value);
});
```

### 5. Clean Up
Always clean up bindings when destroying controls:
```javascript
destroy() {
    if (this._binding_manager) {
        this._binding_manager.unbindAll();
    }
    super.destroy();
}
```

## Performance Tips

1. **Batch Updates**: Change multiple properties together
2. **Debounce Filters**: Debounce expensive computed properties
3. **Lazy Rendering**: Only render visible items
4. **Optimize Watchers**: Limit number of watchers
5. **Use Immediate: false**: Avoid unnecessary initial calculations

## Integration with jsgui3-server

These examples work seamlessly with jsgui3-server:

```javascript
// Server-side
const control = new UserForm({ context });
const html = control.html;
res.send(html);

// Client-side hydration
const control = new UserForm({
    context,
    el: document.getElementById('user-form')
});
```

## Creating Your Own Examples

Template for new examples:

```javascript
const jsgui = require('../html-core/html-core');
const { Data_Object } = require('lang-tools');
const Data_Model_View_Model_Control = require('../html-core/Data_Model_View_Model_Control');

class MyControl extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Setup models
        this.data.model = new Data_Object({ /* data */ });
        this.view.data.model = new Data_Object({ /* ui state */ });
        
        // Setup patterns
        this.setupBindings();
        this.setupComputed();
        this.setupWatchers();
        
        // Build UI
        if (!spec.el) {
            this.compose();
        }
    }
    
    setupBindings() { /* ... */ }
    setupComputed() { /* ... */ }
    setupWatchers() { /* ... */ }
    compose() { /* ... */ }
}

function createExample() {
    const context = new jsgui.Page_Context();
    return new MyControl({ context });
}

if (require.main === module) {
    const control = createExample();
    console.log(control.html);
}

module.exports = MyControl;
```

## Additional Resources

- [DATA_BINDING.md](../html-core/DATA_BINDING.md) - Complete binding system documentation
- [MVVM.md](../MVVM.md) - MVVM architecture overview
- [README.md](../README.md) - Framework documentation
- [test/README.md](../test/README.md) - Test suite documentation

## Contributing Examples

To contribute a new example:

1. Follow the architecture pattern above
2. Include comprehensive comments
3. Demonstrate specific features
4. Provide usage instructions
5. Add entry to this README
6. Create corresponding test in test/integration/

## License

Same license as jsgui3-html framework.
