# jsgui3-html Test Suite

Comprehensive test suite for the jsgui3-html framework, covering core functionality, MVVM patterns, mixins, transformations, and integration scenarios.

## Requirements

- Node.js 18+ (matches repo `package.json` `engines.node`)

See `docs/regression_tests.md` for recently-added regression coverage.

## Installation

Install test dependencies:

```bash
cd test
npm install
```

## Running Tests

### Run All Playwright E2E Suites (from repo root)
```bash
npm run test:playwright:all
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Core control tests
npm run test:core

# MVVM and data binding tests
npm run test:mvvm

# Control mixin tests
npm run test:mixins

# Integration tests
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
test/
├── setup.js                          # Test environment setup
├── package.json                      # Test dependencies and scripts
├── core/
│   └── control.test.js              # Core control tests
├── mvvm/
│   ├── data-binding.test.js         # MVVM and binding tests
│   └── transformations.test.js      # Transformation and validation tests
├── mixins/
│   └── control-mixins.test.js       # Control mixin tests
└── integration/
    └── complex-scenarios.test.js    # Integration and real-world scenarios
```

## Test Categories

### Core Control Tests (`test/core/control.test.js`)

Tests fundamental control functionality:

- **Control Creation**: Basic instantiation with various configurations
- **DOM Rendering**: HTML generation, mounting, and activation
- **Class Manipulation**: Adding, removing, toggling CSS classes
- **Content Manipulation**: Adding, removing, clearing content
- **Event Handling**: Event registration, triggering, delegation
- **Visibility Control**: Show, hide, toggle operations
- **Lifecycle**: Initialization and cleanup
- **Attributes**: Getting and setting element attributes

**Example Test:**
```javascript
it('should create control with attributes', () => {
    const control = new jsgui.Control({
        context,
        tagName: 'input',
        attrs: {
            type: 'text',
            placeholder: 'Enter text'
        }
    });
    
    expect(control.attrs.type).to.equal('text');
});
```

### MVVM Pattern Tests (`test/mvvm/data-binding.test.js`)

Tests the Model-View-ViewModel architecture:

- **Data_Object Basics**: Creation, property access, change events
- **Model Binding**: One-way and two-way binding between models
- **Transformations**: Data transformation during binding
- **Computed Properties**: Automatic dependency-tracked values
- **Property Watchers**: Observing property changes
- **MVVM Control Integration**: Using bind(), computed(), watch() methods

**Example Test:**
```javascript
it('should create two-way binding between models', (done) => {
    const model1 = new Data_Object({ value: 10 });
    const model2 = new Data_Object({ value: 20 });
    
    const binder = new ModelBinder(model1, 'value', model2, 'value', {
        twoWay: true
    });
    
    setTimeout(() => {
        model2.value = 30;
        
        setTimeout(() => {
            expect(model1.value).to.equal(30);
            binder.unbind();
            done();
        }, 10);
    }, 10);
});
```

### Transformation Tests (`test/mvvm/transformations.test.js`)

Tests all data transformation utilities:

- **String Transformations**: capitalize, titleCase, trim, truncate, slugify
- **Number Transformations**: currency, percentage, fixed decimals, rounding
- **Date Transformations**: formatting, parsing, ISO conversion, relative time
- **Boolean Transformations**: yes/no, on/off, enabled/disabled
- **Array Transformations**: join, first, last, sort, unique, pluck
- **Object Transformations**: keys, values, entries, pick, omit
- **Validators**: required, email, URL, range, length, pattern
- **Composition**: Combining multiple transformations
- **Edge Cases**: Handling null, undefined, empty values

**Example Test:**
```javascript
it('should format as currency', () => {
    expect(Transformations.number.toCurrency(1234.56)).to.equal('$1,234.56');
});
```

### Control Mixin Tests (`test/mixins/control-mixins.test.js`)

Tests UI behavior mixins:

- **Selectable**: Selection/deselection functionality
- **Draggable**: Drag-and-drop behavior
- **Resizable**: Resize handles and operations
- **Popup**: Show/hide popup behavior
- **Pressed State**: Visual feedback for interactions
- **Display Modes**: Switching between view/edit modes
- **Coverable**: Cover/overlay functionality
- **Multiple Mixins**: Combining mixins on same control

**Example Test:**
```javascript
it('should select and deselect control', function() {
    const control = new jsgui.Control({ context, tagName: 'div' });
    Selectable(control);
    control.mount(document.body);
    
    control.select();
    expect(control.has_class('selected')).to.be.true;
    
    control.deselect();
    expect(control.has_class('selected')).to.be.false;
});
```

### Integration Tests (`test/integration/complex-scenarios.test.js`)

Tests complex real-world scenarios:

- **Complex Forms**: Multi-field validation and error handling
- **Nested Components**: Parent-child communication and data flow
- **Dynamic Lists**: Filtering, sorting, and dynamic rendering
- **Master-Detail**: Synchronized navigation between views
- **Data Pipelines**: Chained transformations
- **Performance**: Handling many controls and bindings
- **Error Handling**: Graceful error recovery
- **Memory Management**: Cleanup and leak prevention

**Example Test:**
```javascript
it('should validate all fields in complex form', (done) => {
    const form = new ComplexForm({ context });
    
    form.data.model.username = 'testuser';
    form.data.model.email = 'test@example.com';
    form.data.model.password = 'password123';
    form.data.model.confirmPassword = 'password123';
    
    setTimeout(() => {
        expect(form.view.data.model.isValid).to.be.true;
        done();
    }, 100);
});
```

## Testing Best Practices

### Writing Tests

1. **Clear Test Names**: Use descriptive names that explain what is being tested
   ```javascript
   it('should apply transformation pipeline', () => {
   ```

2. **Arrange-Act-Assert**: Structure tests clearly
   ```javascript
   // Arrange
   const control = new jsgui.Control({ context });
   
   // Act
   control.add_class('test');
   
   // Assert
   expect(control.has_class('test')).to.be.true;
   ```

3. **Cleanup**: Always clean up after tests
   ```javascript
   afterEach(() => {
       cleanup();
   });
   ```

4. **Async Handling**: Use done() or async/await for async tests
   ```javascript
   it('should handle async operation', (done) => {
       setTimeout(() => {
           expect(result).to.equal(expected);
           done();
       }, 100);
   });
   ```

### Test Helpers

Global helper functions available in all tests:

- `createTestContext()`: Creates a fresh Page_Context
- `waitFor(ms)`: Promise-based delay
- `triggerEvent(element, eventName, detail)`: Triggers DOM events
- `cleanup()`: Clears document body

### Mocking and Spies

Use Sinon for spies, stubs, and mocks:

```javascript
const spy = sinon.spy();
control.on('click', spy);
control.trigger('click');
expect(spy.calledOnce).to.be.true;
```

## Coverage Goals

Target coverage metrics:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    cd test
    npm install
    npm test
```

## Debugging Tests

### Run Single Test File
```bash
npx mocha test/core/control.test.js
```

### Run Single Test
```bash
npx mocha test/core/control.test.js --grep "should create a basic control"
```

### Enable Debug Output
```javascript
describe.only('Debug This Suite', () => {
    // Only this suite will run
});

it.only('should debug this test', () => {
    // Only this test will run
});
```

### Use Node Debugger
```bash
node --inspect-brk node_modules/.bin/mocha test/core/control.test.js
```

## AI Agent Testing Guide

These tests serve multiple purposes for AI agents:

1. **Feature Discovery**: Tests document all framework capabilities
2. **Usage Examples**: Tests show correct API usage patterns
3. **Regression Prevention**: Tests catch breaking changes
4. **Behavior Verification**: Tests validate expected behavior

### For AI Code Generation

When generating code that uses jsgui3-html, AI agents can:

1. Reference test files to understand correct API usage
2. Follow patterns demonstrated in integration tests
3. Validate generated code against test expectations
4. Learn from test error messages

### Test-Driven Development

AI agents can use tests to:

1. Understand requirements from test descriptions
2. Generate implementations that pass tests
3. Refactor code while maintaining test compliance
4. Extend functionality by adding new tests first

## Contributing

When adding new features to jsgui3-html:

1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add integration tests for complex features
4. Update this README with new test categories
5. Maintain > 80% code coverage

## Known Limitations

- Some mixin tests are skipped if mixins are not available
- DOM testing uses jsdom which has some limitations
- Async timing tests may be flaky on slow systems
- Performance tests are environment-dependent

## Future Improvements

- [ ] Add visual regression tests
- [ ] Add accessibility (a11y) tests
- [ ] Add cross-browser testing setup
- [ ] Add performance benchmarking
- [ ] Add E2E tests with real browsers
- [ ] Add snapshot testing for rendered output
- [ ] Add stress tests for large data sets

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon Spies/Stubs/Mocks](https://sinonjs.org/)
- [jsdom Documentation](https://github.com/jsdom/jsdom)

## License

Same license as jsgui3-html framework.
