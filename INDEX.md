# jsgui3-html Documentation Index

Quick navigation to all framework documentation.

## 🚀 Getting Started

Start here if you're new to jsgui3-html:

1. **[EXAMPLES_AND_TESTS.md](EXAMPLES_AND_TESTS.md)** - 5-minute quick start for developers and AI agents
2. **[examples/binding_simple_counter.js](examples/binding_simple_counter.js)** - Simplest possible example
3. **[README.md](README.md)** - Complete framework documentation

## 📚 Core Documentation

### Framework Documentation
- **[README.md](README.md)** - Main framework documentation
  - Core concepts, architecture, API reference
  - Installation, quick start, component library
  - Performance, debugging, browser compatibility

- **[MVVM.md](MVVM.md)** - MVVM architecture analysis
  - Three-layer model architecture
  - Current implementation analysis
  - Proposed enhancements and roadmap

### Data Binding System
- **[html-core/DATA_BINDING.md](html-core/DATA_BINDING.md)** - Complete binding API
  - ModelBinder, ComputedProperty, PropertyWatcher
  - Transformations library (string, number, date, array, object)
  - Validators (required, email, URL, range, pattern)
  - Usage examples, advanced patterns, migration guide

## 📖 Examples

### Examples Documentation
- **[examples/README.md](examples/README.md)** - Complete examples guide
  - All examples with usage instructions
  - Common patterns (forms, grids, navigation)
  - Best practices, performance tips
  - Creating custom examples

### Example Files

**Beginner:**
- **[examples/binding_simple_counter.js](examples/binding_simple_counter.js)** - Minimal MVVM example
  - Basic structure, binding, computed properties
  - Perfect starting point

**Intermediate:**
- **[examples/binding_date_picker.js](examples/binding_date_picker.js)** - Date picker with validation
  - Date transformations, range validation
  - Error handling, debugging

- **[examples/binding_user_form.js](examples/binding_user_form.js)** - Multi-field form
  - Comprehensive validation
  - Input transformations, async submission

**Advanced:**
- **[examples/binding_data_grid.js](examples/binding_data_grid.js)** - Data grid
  - Collection binding, sorting, filtering
  - Pagination, row selection, custom formatters

- **[examples/binding_master_detail.js](examples/binding_master_detail.js)** - Master-detail view
  - Synchronized navigation
  - Search/filter, previous/next navigation

**Legacy:**
- **[examples/controls_rendering.js](examples/controls_rendering.js)** - Basic controls (pre-MVVM)
- **[examples/compositional_models_controls_rendering.js](examples/compositional_models_controls_rendering.js)** - Compositional patterns

## 🧪 Testing

### Testing Documentation
- **[test/README.md](test/README.md)** - Complete testing guide
  - Test structure, running tests
  - Writing tests, best practices
  - Coverage goals, CI integration
  - AI agent testing guide

### Test Files

**Core Tests:**
- **[test/core/control.test.js](test/core/control.test.js)** - Core control tests (40+ tests)
  - Control creation, rendering, DOM manipulation
  - Classes, content, events, attributes

**MVVM Tests:**
- **[test/mvvm/data-binding.test.js](test/mvvm/data-binding.test.js)** - MVVM patterns (25+ tests)
  - Data_Object, model binding
  - Computed properties, watchers
  
- **[test/mvvm/transformations.test.js](test/mvvm/transformations.test.js)** - Transformations (60+ tests)
  - String, number, date, array, object transformations
  - Validators, composition, edge cases

**Mixin Tests:**
- **[test/mixins/control-mixins.test.js](test/mixins/control-mixins.test.js)** - Mixin tests (20+ tests)
  - Selectable, draggable, resizable, popup
  - Multiple mixin combinations

**Integration Tests:**
- **[test/integration/complex-scenarios.test.js](test/integration/complex-scenarios.test.js)** - Integration (15+ tests)
  - Complex forms, nested components
  - Dynamic rendering, performance
  - Error handling, memory management

### Test Infrastructure
- **[test/setup.js](test/setup.js)** - Test environment configuration
- **[test/package.json](test/package.json)** - Test dependencies and scripts

## 📊 Summary Documents

- **[EXAMPLES_AND_TESTS.md](EXAMPLES_AND_TESTS.md)** - Quick start guide
  - 5-minute getting started
  - Key concepts, common patterns
  - Testing guide, debugging tips
  - AI agent checklist

- **[EXAMPLES_AND_TESTS_SUMMARY.md](EXAMPLES_AND_TESTS_SUMMARY.md)** - Complete summary
  - Files created, test coverage
  - Example features demonstrated
  - AI agent benefits, patterns
  - Maintenance guide

## 🔧 API Reference

### Core Classes
Located in `html-core/`:

- **Control_Core** - Base control class (DOM, events, rendering)
- **Control** - Enhanced control with data binding
- **Data_Model_View_Model_Control** - MVVM control base class
- **Control_View** - View management
- **Control_Data** - Data management
- **Control_Validation** - Validation system

### Binding System
Located in `html-core/`:

- **[ModelBinder.js](html-core/ModelBinder.js)** - Binding infrastructure
  - ModelBinder class (two-way binding)
  - ComputedProperty class (dependency tracking)
  - PropertyWatcher class (change callbacks)
  - BindingManager class (multiple bindings)

- **[Transformations.js](html-core/Transformations.js)** - Data transformations
  - String, Number, Date transformations
  - Boolean, Array, Object transformations
  - Validators
  - Composition utilities

- **[BindingDebugger.js](html-core/BindingDebugger.js)** - Debugging tools
  - BindingDebugger class
  - BindingDebugTools (inspect, monitor)
  - Snapshot and comparison

### Mixins
Located in `control_mixins/`:

- **selectable.js** - Selection behavior
- **draggable.js** - Drag-and-drop
- **resizable.js** - Resize behavior
- **popup.js** - Popup/overlay
- **pressed-state.js** - Press feedback
- **display-modes.js** - View modes
- **bind.js** - Legacy binding
- **coverable.js** - Cover/overlay

## 📁 File Structure

```
jsgui3-html/
├── Documentation
│   ├── README.md                           # Main docs
│   ├── MVVM.md                            # Architecture
│   ├── EXAMPLES_AND_TESTS.md              # Quick start
│   ├── EXAMPLES_AND_TESTS_SUMMARY.md      # Complete summary
│   └── INDEX.md                           # This file
│
├── Examples (examples/)
│   ├── README.md                          # Examples guide
│   ├── binding_simple_counter.js          # Beginner
│   ├── binding_date_picker.js             # Intermediate
│   ├── binding_user_form.js               # Intermediate
│   ├── binding_data_grid.js               # Advanced
│   └── binding_master_detail.js           # Advanced
│
├── Tests (test/)
│   ├── README.md                          # Testing guide
│   ├── setup.js                           # Test config
│   ├── core/control.test.js               # Core tests
│   ├── mvvm/data-binding.test.js          # MVVM tests
│   ├── mvvm/transformations.test.js       # Transform tests
│   ├── mixins/control-mixins.test.js      # Mixin tests
│   └── integration/complex-scenarios.test.js # Integration
│
├── Core Framework (html-core/)
│   ├── ModelBinder.js                     # Binding system
│   ├── Transformations.js                 # Transformations
│   ├── BindingDebugger.js                 # Debug tools
│   ├── Data_Model_View_Model_Control.js   # MVVM base
│   ├── DATA_BINDING.md                    # Binding docs
│   └── [other core files]
│
├── Mixins (control_mixins/)
│   ├── selectable.js
│   ├── draggable.js
│   ├── resizable.js
│   └── [other mixins]
│
└── Controls (controls/)
    └── [pre-built controls]
```

## 🎯 Quick Reference by Task

### I want to learn jsgui3-html
1. Read [EXAMPLES_AND_TESTS.md](EXAMPLES_AND_TESTS.md)
2. Run [examples/binding_simple_counter.js](examples/binding_simple_counter.js)
3. Read [README.md](README.md)

### I want to see working examples
1. Browse [examples/README.md](examples/README.md)
2. Run examples:
   ```bash
   node examples/binding_simple_counter.js
   node examples/binding_user_form.js
   node examples/binding_data_grid.js
   ```

### I want to understand data binding
1. Read [html-core/DATA_BINDING.md](html-core/DATA_BINDING.md)
2. Study [examples/binding_date_picker.js](examples/binding_date_picker.js)
3. Review [test/mvvm/data-binding.test.js](test/mvvm/data-binding.test.js)

### I want to understand MVVM architecture
1. Read [MVVM.md](MVVM.md)
2. Study [examples/binding_user_form.js](examples/binding_user_form.js)
3. Review [html-core/Data_Model_View_Model_Control.js](html-core/Data_Model_View_Model_Control.js)

### I want to test the framework
1. Read [test/README.md](test/README.md)
2. Run tests:
   ```bash
   cd test
   npm install
   npm test
   ```

### I want to build a form
1. Study [examples/binding_user_form.js](examples/binding_user_form.js)
2. Reference [html-core/DATA_BINDING.md](html-core/DATA_BINDING.md) for validators
3. Check [test/mvvm/transformations.test.js](test/mvvm/transformations.test.js) for validation examples

### I want to build a data grid
1. Study [examples/binding_data_grid.js](examples/binding_data_grid.js)
2. Review computed properties for filtering/sorting
3. Check [test/integration/complex-scenarios.test.js](test/integration/complex-scenarios.test.js) for patterns

### I want to debug bindings
1. Read [html-core/BindingDebugger.js](html-core/BindingDebugger.js)
2. Use `BindingDebugTools.inspect(control)`
3. Use `BindingDebugTools.monitor(control, duration)`

### I'm an AI agent
1. Start with [EXAMPLES_AND_TESTS.md](EXAMPLES_AND_TESTS.md) - AI agent checklist
2. Index all test files for API coverage
3. Study example patterns for code generation
4. Reference tests for validation

## 📞 Support

- Check examples for patterns
- Review tests for API usage
- Read inline documentation
- Use BindingDebugTools for debugging
- Run tests to verify behavior

## 🔄 Version Information

- **Framework**: jsgui3-html
- **Documentation Version**: 1.0 (October 2025)
- **Examples Count**: 5 binding examples + 2 legacy
- **Tests Count**: 160+ tests across 6 test files
- **Test Coverage Target**: >80%

## 📝 License

Same as jsgui3-html framework.

---

**Last Updated**: October 3, 2025  
**Maintained By**: jsgui3-html contributors
