# jsgui3-html Examples and Tests - Quick Start Guide

This guide provides a quick overview for developers and AI agents to understand and use the jsgui3-html framework.

## Quick Links

- **[Examples README](examples/README.md)** - All binding examples with usage instructions
- **[Tests README](test/README.md)** - Comprehensive test suite documentation
- **[Data Binding Guide](html-core/DATA_BINDING.md)** - Complete binding system API
- **[MVVM Architecture](MVVM.md)** - Framework architecture overview

## Getting Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
cd test && npm install
```

### 2. Run an Example

```bash
# Date picker with validation
node examples/binding_date_picker.js

# User form with multi-field validation
node examples/binding_user_form.js

# Data grid with sorting and filtering
node examples/binding_data_grid.js

# Master-detail view with navigation
node examples/binding_master_detail.js
```

### 3. Run Tests

```bash
# From repository root: run all Playwright E2E suites (aggregate)
npm run test:playwright:all

cd test
npm test                    # All tests
npm run test:core          # Core control tests
npm run test:mvvm          # MVVM and binding tests
npm run test:integration   # Complex scenarios
```

## Key Concepts for AI Agents

### 1. Three-Layer MVVM Architecture

```
Data Model (Data_Object)
    ↕ (bindings with transformations)
View Data Model (Data_Object)
    ↕ (DOM updates)
View (Controls)
```

### 2. Control Creation Pattern

```javascript
class MyControl extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Data layer - raw business data
        this.data.model = new Data_Object({
            value: spec.value || 0
        });
        
        // View data layer - UI state
        this.view.data.model = new Data_Object({
            displayValue: '',
            isValid: false
        });
        
        // Setup reactive patterns
        this.setupBindings();
        this.setupComputed();
        this.setupWatchers();
        
        // Build UI
        if (!spec.el) this.compose();
    }
    
    setupBindings() {
        // Declarative two-way binding
        this.bind({
            'value': {
                to: 'displayValue',
                transform: (v) => v.toString()
            }
        });
    }
    
    setupComputed() {
        // Computed property with dependency tracking
        this.computed(
            this.data.model,
            ['value'],
            (v) => v > 0,
            { propertyName: 'isValid', target: this.view.data.model }
        );
    }
    
    setupWatchers() {
        // React to changes
        this.watch(
            this.data.model,
            'value',
            (newVal, oldVal) => {
                console.log(`Changed: ${oldVal} → ${newVal}`);
            }
        );
    }
    
    compose() {
        // Build UI controls
        const input = new jsgui.Control({
            context: this.context,
            tagName: 'input',
            attrs: { type: 'number' }
        });
        
        this.add(input);
    }
}
```

### 3. Available Transformations

```javascript
// String
this.transforms.string.capitalize('hello')      // "Hello"
this.transforms.string.slugify('Hello World')   // "hello-world"
this.transforms.string.truncate('long...', 10)  // "long..."

// Number
this.transforms.number.toCurrency(1234.56)      // "$1,234.56"
this.transforms.number.toPercent(0.5)           // "50.00%"

// Date
this.transforms.date.format(date, 'YYYY-MM-DD') // "2025-10-03"
this.transforms.date.relative(date)             // "2 days ago"

// Boolean
this.transforms.boolean.toYesNo(true)           // "Yes"

// Array
this.transforms.array.join([1,2,3], ' - ')      // "1 - 2 - 3"
this.transforms.array.pluck(users, 'name')      // ["Alice", "Bob"]
```

### 4. Common Validators

```javascript
this.validators.required(value)                  // Not empty
this.validators.email(value)                     // Valid email
this.validators.url(value)                       // Valid URL
this.validators.range(value, 0, 100)            // 0 ≤ value ≤ 100
this.validators.length(str, 3, 50)              // 3 ≤ length ≤ 50
this.validators.pattern(str, /^[A-Z]+$/)        // Matches regex
```

## Common Use Cases

### Form with Validation

See `examples/binding_user_form.js` for complete implementation:

```javascript
class UserForm extends Data_Model_View_Model_Control {
    setupValidation() {
        this.validationRules = {
            email: [
                { validator: this.validators.required, message: 'Required' },
                { validator: this.validators.email, message: 'Invalid email' }
            ]
        };
    }
    
    validateField(field, value) {
        for (const rule of this.validationRules[field]) {
            if (!rule.validator(value)) {
                this.view.data.model.errors[field] = rule.message;
                return false;
            }
        }
        return true;
    }
}
```

### Data Grid with Filtering

See `examples/binding_data_grid.js` for complete implementation:

```javascript
class DataGrid extends Data_Model_View_Model_Control {
    setupComputed() {
        // Filtered items
        this.computed(
            [this.data.model, this.view.data.model],
            ['items', 'filterText'],
            (items, filter) => {
                if (!filter) return items;
                return items.filter(item => 
                    Object.values(item).some(v => 
                        String(v).toLowerCase().includes(filter.toLowerCase())
                    )
                );
            },
            { propertyName: 'filteredItems', target: this.view.data.model }
        );
        
        // Sorted items
        this.computed(
            this.view.data.model,
            ['filteredItems', 'sortColumn', 'sortDirection'],
            (items, column, direction) => {
                if (!column) return items;
                return [...items].sort((a, b) => {
                    const comparison = a[column] > b[column] ? 1 : -1;
                    return direction === 'asc' ? comparison : -comparison;
                });
            },
            { propertyName: 'sortedItems' }
        );
    }
}
```

### Master-Detail View

See `examples/binding_master_detail.js` for complete implementation:

```javascript
class MasterDetail extends Data_Model_View_Model_Control {
    setupComputed() {
        // Selected item from ID
        this.computed(
            this.data.model,
            ['items', 'selectedId'],
            (items, id) => items.find(item => item.id === id) || null,
            { propertyName: 'selectedItem', target: this.view.data.model }
        );
        
        // Navigation info
        this.computed(
            this.view.data.model,
            ['selectedIndex', 'filteredItems'],
            (index, items) => {
                if (index < 0) return '';
                return `${index + 1} of ${items.length}`;
            },
            { propertyName: 'navigationInfo' }
        );
    }
}
```

## Testing Your Code

### Unit Test Template

```javascript
describe('My Control Tests', () => {
    let context;
    
    beforeEach(() => {
        context = createTestContext();
    });
    
    it('should bind data to view', (done) => {
        const control = new MyControl({ context, value: 10 });
        
        setTimeout(() => {
            expect(control.view.data.model.displayValue).to.equal('10');
            
            control.data.model.value = 20;
            
            setTimeout(() => {
                expect(control.view.data.model.displayValue).to.equal('20');
                done();
            }, 50);
        }, 50);
    });
});
```

### Run Specific Tests

```bash
cd test

# Run all tests
npm test

# Run specific suite
npx mocha test/mvvm/data-binding.test.js

# Run specific test
npx mocha test/mvvm/data-binding.test.js --grep "should bind"

# Watch mode
npm run test:watch
```

## Debugging

### Enable Binding Debug Tools

```javascript
const { BindingDebugTools } = require('./html-core/BindingDebugger');

// Inspect bindings
BindingDebugTools.inspect(control);

// Output:
// Control: MyControl
// Bindings: 3
//   1. data.model.value → view.data.model.displayValue
//   2. data.model.firstName + data.model.lastName → data.model.fullName
//   3. watching data.model.value

// Monitor changes
BindingDebugTools.monitor(control, 3000);
```

### Debug Single Binding

```javascript
const binder = new ModelBinder(
    source, 'value',
    target, 'display',
    { 
        transform: (v) => v.toString(),
        debug: true  // Logs all changes
    }
);
```

## Framework File Structure

```
jsgui3-html/
├── examples/                     # Usage examples
│   ├── README.md                # Examples documentation
│   ├── binding_date_picker.js   # Date picker with validation
│   ├── binding_user_form.js     # Multi-field form
│   ├── binding_data_grid.js     # Sortable/filterable grid
│   └── binding_master_detail.js # Navigation view
├── test/                        # Comprehensive test suite
│   ├── README.md               # Testing guide
│   ├── setup.js                # Test environment
│   ├── core/                   # Core control tests
│   ├── mvvm/                   # MVVM pattern tests
│   ├── mixins/                 # Mixin tests
│   └── integration/            # Integration tests
├── html-core/                   # Core framework
│   ├── ModelBinder.js          # Binding system
│   ├── Transformations.js      # Data transformations
│   ├── BindingDebugger.js      # Debug tools
│   ├── Data_Model_View_Model_Control.js
│   └── DATA_BINDING.md         # API documentation
├── control_mixins/              # UI behavior mixins
├── controls/                    # Pre-built controls
└── README.md                    # Main documentation
```

## AI Agent Checklist

When working with jsgui3-html:

- [ ] Extend `Data_Model_View_Model_Control` for MVVM controls
- [ ] Create separate `data.model` and `view.data.model`
- [ ] Use `this.bind()` for declarative bindings
- [ ] Use `this.computed()` for derived values
- [ ] Use `this.watch()` for side effects
- [ ] Apply transformations during binding
- [ ] Validate incrementally, not just on submit
- [ ] Clean up bindings in `destroy()`
- [ ] Test with provided test infrastructure
- [ ] Reference examples for patterns
- [ ] Use BindingDebugTools for troubleshooting

## Common Pitfalls

1. **Forgetting to trigger change events**
   ```javascript
   // Bad - won't trigger bindings
   data.model.items.push(item);
   
   // Good - triggers change event
   data.model.items = [...data.model.items, item];
   ```

2. **Not using async timing for tests**
   ```javascript
   // Bad - checks before binding completes
   model.value = 10;
   expect(viewModel.display).to.equal('10'); // Fails!
   
   // Good - waits for async binding
   model.value = 10;
   setTimeout(() => {
       expect(viewModel.display).to.equal('10'); // Works!
   }, 50);
   ```

3. **Circular binding loops**
   ```javascript
   // Bad - creates infinite loop
   this.bind({ 'a': { to: 'b', twoWay: true } });
   this.bind({ 'b': { to: 'a', twoWay: true } });
   
   // Good - one-way bindings
   this.bind({ 'a': { to: 'b' } });
   ```

## Performance Optimization

```javascript
// Debounce expensive computations
this.computed(
    this.data.model,
    ['items', 'filter'],
    (items, filter) => expensiveOperation(items, filter),
    { 
        propertyName: 'result',
        debounce: 300  // Wait 300ms after last change
    }
);

// Batch updates
const updates = {
    firstName: 'John',
    lastName: 'Doe',
    age: 30
};
Object.assign(this.data.model, updates);
```

## Next Steps

1. **Read the Examples**: Start with `examples/binding_date_picker.js`
2. **Run the Tests**: `cd test && npm test`
3. **Read the Docs**: `html-core/DATA_BINDING.md`
4. **Build Something**: Create your own control using the patterns
5. **Test It**: Add tests to `test/integration/`

## Support

- Check examples for patterns
- Review tests for API usage
- Read inline documentation
- Inspect with BindingDebugTools
- Run tests to verify behavior

## License

Same as jsgui3-html framework.
