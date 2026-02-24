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

- **[docs/controls/INDEX.md](docs/controls/INDEX.md)** - Controls documentation index
- **[docs/accessibility_and_semantics.md](docs/accessibility_and_semantics.md)** - Accessibility roles, keyboard patterns, reduced motion
- **[docs/theming_and_styling_system.md](docs/theming_and_styling_system.md)** - Theme tokens, layers, SASS compatibility

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

### Controls & Components
- **[controls/README.md](controls/README.md)** — Full control catalogue (120+ controls)
  - Directory map, usage examples, stability tiers
  - Adaptive-layout reference for responsive controls
- **[controls/organised/AGENT.md](controls/organised/AGENT.md)** — Control creation guide for AI agents
- **[docs/Control_Dom.md](docs/Control_Dom.md)** — Control_DOM / DOM_Attributes internals

### Theming & Styling
- **[themes/README.md](themes/README.md)** — Token maps, size tables, variants, CSS architecture
- **[docs/theming_and_styling_system.md](docs/theming_and_styling_system.md)** — Theming overview
- **[css/jsgui-tokens.css](css/jsgui-tokens.css)** — Framework-level CSS custom properties

### Validation
- **[validation/README.md](validation/README.md)** — Validation_Engine, Error_Summary, format_message

### Device-Adaptive Composition
- **[docs/books/device-adaptive-composition/](docs/books/device-adaptive-composition/)** — 8-chapter book
  - Platform audit, responsive composition model, data vs view model
  - Styling & breakpoints, showcase assessment, implementation patterns
  - Testing harness, roadmap & adoption plan

### Mixins
- **[control_mixins/README.md](control_mixins/README.md)** — Mixin overview & catalogue
- **[docs/books/mixins-book.md](docs/books/mixins-book.md)** — Deep-dive mixin guide

### Utilities
- **[utils/README.md](utils/README.md)** — Deprecation helpers

### Configuration & Factories
- **[cfn/readme.md](cfn/readme.md)** — Control factory functions

### Roadmap
- **[roadmap.md](roadmap.md)** — 7-phase development roadmap with progress tracking

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
│   ├── INDEX.md                           # This file
│   ├── roadmap.md                         # 7-phase roadmap
│   ├── AGENTS.md                          # AI agent guide
│   └── EXAMPLES_AND_TESTS.md              # Quick start
│
├── Core Framework (html-core/)
│   ├── README.md                          # Engine overview
│   ├── DATA_BINDING.md                    # Binding docs
│   ├── control-core.js                    # Control_Core base
│   ├── Data_Model_View_Model_Control.js   # MVVM base
│   ├── ModelBinder.js                     # Binding system
│   ├── Transformations.js                 # Transforms
│   └── BindingDebugger.js                 # Debug tools
│
├── Controls (controls/)
│   ├── README.md                          # 120+ control catalogue
│   ├── controls.js                        # Re-exports
│   └── organised/                         # By tier & category
│       ├── AGENT.md                       # Control creation guide
│       ├── 0-core/                        # Native & compositional
│       └── 1-standard/                    # Editor, Data, UI, Layout
│
├── Mixins (control_mixins/)
│   ├── README.md                          # Mixin overview
│   └── *.js                               # 39 behavior mixins
│
├── Themes (themes/)
│   ├── README.md                          # Tokens, variants, CSS arch
│   ├── token_maps.js                      # Size / shadow / radius tokens
│   └── variants.js                        # Per-control variant defs
│
├── Validation (validation/)
│   ├── README.md                          # Engine & Error_Summary
│   ├── validation_engine.js               # Rule runner
│   └── error_summary.js                   # Error display control
│
├── CSS (css/)
│   ├── jsgui-tokens.css                   # Framework tokens
│   ├── jsgui-reset.css                    # Reset styles
│   └── jsgui-utilities.css                # Utility classes
│
├── Utilities (utils/)
│   ├── README.md                          # Deprecation helpers
│   └── deprecation.js
│
├── Configuration Factories (cfn/)
│   └── readme.md                          # Factory functions
│
├── Examples (examples/)
│   ├── README.md                          # Examples guide
│   └── binding_*.js                       # 5 binding examples
│
├── Dev Examples (dev-examples/)
│   └── README.md                          # Development examples
│
├── Tests (test/)
│   ├── README.md                          # Testing guide
│   ├── core/                              # Core control tests
│   ├── mvvm/                              # MVVM & transform tests
│   ├── mixins/                            # Mixin tests
│   └── integration/                       # Complex scenarios
│
├── Docs (docs/)
│   ├── agi/INDEX.md                       # AGI knowledge hub
│   ├── books/                             # Deep-dive guides
│   │   ├── device-adaptive-composition/   # 8-chapter adaptive book
│   │   ├── adaptive-control-improvements/ # Improvement patterns
│   │   └── mixins-book.md                 # Mixin deep-dive
│   ├── accessibility_and_semantics.md
│   ├── theming_and_styling_system.md
│   └── Control_Dom.md                     # DOM internals
│
└── Tools (tools/)
    └── dev/                               # Dev utilities
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

### I want to theme controls
1. Read [themes/README.md](themes/README.md) for token maps & variants
2. Review [docs/theming_and_styling_system.md](docs/theming_and_styling_system.md)
3. Check [css/jsgui-tokens.css](css/jsgui-tokens.css) for available tokens

### I want to validate user input
1. Read [validation/README.md](validation/README.md)
2. Study the Validation_Engine API and default rules
3. See Error_Summary for displaying validation errors

### I want to make a control responsive
1. Read the [device-adaptive composition book](docs/books/device-adaptive-composition/)
2. Study Chapter 6 — Implementation Patterns & APIs
3. Follow the `resolve_layout_mode()` / `_apply_layout_mode()` pattern
4. Use `[data-layout-mode]` CSS selectors

### I'm an AI agent
1. Start with [AGENTS.md](AGENTS.md) — conventions, testing, coding style
2. Read [controls/organised/AGENT.md](controls/organised/AGENT.md) for control creation
3. Study example patterns in [examples/README.md](examples/README.md)
4. Reference [test/README.md](test/README.md) for testing

## 📞 Support

- Check examples for patterns
- Review tests for API usage
- Read inline documentation
- Use BindingDebugTools for debugging
- Run tests to verify behavior

## 🔄 Version Information

- **Framework**: jsgui3-html
- **Documentation Version**: 2.0 (June 2025)
- **Controls**: 120+ across 6 tiers
- **Mixins**: 39 behaviour mixins
- **Examples**: 5 binding examples + 2 legacy + dev-examples
- **Tests**: 160+ tests across 6 test files
- **Test Coverage Target**: >80%
- **Adaptive Controls**: 12 controls with device-adaptive layout

## 📝 License

Same as jsgui3-html framework.

---

**Last Updated**: June 2025  
**Maintained By**: jsgui3-html contributors
