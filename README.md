# Jsgui3 HTML

Jsgui3-html is an isomorphic (server and client-side) UI component framework that provides a comprehensive control system for building dynamic web applications. It emphasizes compositional architecture, state management, and seamless rendering across environments.

## Table of Contents

- [Core Concepts](#core-concepts)
- [Architecture Overview](#architecture-overview)
- [Control Lifecycle](#control-lifecycle)
- [State Management](#state-management)
- [Mixins System](#mixins-system)
- [Rendering and DOM Management](#rendering-and-dom-management)
- [Event System](#event-system)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Component Library](#component-library)
- [Testing](#testing)
- [Performance Considerations](#performance-considerations)
- [Debugging](#debugging)
- [Browser Compatibility](#browser-compatibility)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

## Core Concepts

### Controls
Controls are the fundamental building blocks of jsgui3-html applications. They are analogous to React Components but designed with a focus on:
- **Isomorphic operation**: Work identically on server and client
- **Compositional architecture**: Build complex UIs from simple components
- **State separation**: Distinguish between data models and view models
- **Direct DOM manipulation**: No virtual DOM - direct, efficient updates

### Evented Architecture
Built on the `Evented_Class` from the lang-tools package, controls can:
- Listen to and raise custom events
- Respond to DOM events
- Communicate between parent and child controls
- Handle data model changes reactively

### Compositional Model
Controls use a compositional model where:
- Complex controls are assembled from simpler subcontrols
- Layout and behavior are defined declaratively
- Dynamic updates are handled automatically
- Reusable patterns can be extracted as mixins

## Architecture Overview

```
Control_Core
├── DOM Management (Control_DOM, DOM_Attributes)
├── Event Handling (Evented_Class)
├── Rendering (HTML generation)
└── Content Management (Collection)

Control (extends Control_Core)
├── Data Binding
├── View Management (Control_View)
├── Compositional Model Support
└── Enhanced Event Mapping

Data_Model_View_Model_Control (extends Control)
├── Separate Data and View Models
├── Automatic Synchronization
├── State Persistence
└── Complex Data Structure Support
```

### Key Classes

| Class | Purpose |
|-------|---------|
| `Control_Core` | Base class providing DOM manipulation, events, and rendering |
| `Control` | Enhanced controls with data binding and compositional models |
| `Data_Model_View_Model_Control` | Controls with explicit data/view model separation |
| `Control_View` | Manages visual representation and UI state |
| `Control_DOM` | Handles DOM-specific functionality and attributes |
| `DOM_Attributes` | Manages DOM attributes with reactive updates |

## Control Lifecycle

### 1. Construction
```javascript
const button = new Control({
    tagName: 'button',
    text: 'Click me',
    class: 'primary-btn'
});
```

### 2. Composition
Controls build their internal structure:
```javascript
compose() {
    this.add(new Icon({ name: 'check' }));
    this.add(new Text({ value: this.label }));
}
```

### 3. Rendering (Server-side)
Generate HTML for initial page load:
```javascript
const html = control.all_html_render();
// <button data-jsgui-id="ctrl_123" class="primary-btn">
//   <i class="icon-check"></i>Click me
// </button>
```

### 4. Activation (Client-side)
Connect rendered HTML to control instances:
```javascript
control.activate(); // Binds to existing DOM element
```

### 5. Event Responses
Handle user interactions and data changes:
```javascript
control.on('click', () => {
    this.data.model.count++;
});
```

## State Management

### Data Models vs View Models

**Data Model**: Contains raw, business logic data
```javascript
this.data.model = new Data_Object({
    user_id: 123,
    email: 'user@example.com',
    created_at: new Date()
});
```

**View Model**: Contains UI-specific representations
```javascript
this.view.data.model = new Data_Object({
    formatted_email: 'user@example.com',
    display_date: '2023-09-01',
    is_highlighted: false
});
```

### Automatic Synchronization
Changes in data models can automatically update view models:
```javascript
this.data.model.on('change', e => {
    if (e.name === 'email') {
        this.view.data.model.formatted_email = formatEmail(e.value);
    }
});
```

### State Persistence
State is serialized into HTML attributes for isomorphic operation:
```html
<div data-jsgui-id="ctrl_123" 
     data-jsgui-fields="{'selected':true,'count':5}"
     data-jsgui-data-model-id="model_456">
```

### Advanced State Management Patterns

#### Observer Pattern Implementation
```javascript
// Data model changes automatically propagate
class ObservableModel extends Data_Object {
    constructor(data) {
        super(data);
        this.observers = new Set();
    }
    
    addObserver(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback); // Return unsubscribe function
    }
    
    notifyObservers(change) {
        this.observers.forEach(callback => callback(change));
    }
}
```

#### Model-View Synchronization
```javascript
class SyncedControl extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Bidirectional binding helper
        this.bindProperty('user_name', {
            dataToView: (value) => value.toUpperCase(),
            viewToData: (value) => value.toLowerCase(),
            immediate: true // Apply transform immediately
        });
    }
    
    bindProperty(dataProperty, options = {}) {
        const { dataToView, viewToData, immediate } = options;
        
        // Data → View
        this.data.model.on('change', e => {
            if (e.name === dataProperty) {
                const transformed = dataToView ? dataToView(e.value) : e.value;
                this.view.data.model[dataProperty] = transformed;
            }
        });
        
        // View → Data
        this.view.data.model.on('change', e => {
            if (e.name === dataProperty) {
                const transformed = viewToData ? viewToData(e.value) : e.value;
                this.data.model[dataProperty] = transformed;
            }
        });
        
        // Initial sync
        if (immediate && this.data.model[dataProperty] !== undefined) {
            const transformed = dataToView ? dataToView(this.data.model[dataProperty]) : this.data.model[dataProperty];
            this.view.data.model[dataProperty] = transformed;
        }
    }
}
```

#### Complex Form Validation
```javascript
class ValidationManager {
    constructor(control) {
        this.control = control;
        this.rules = new Map();
        this.errors = new Map();
    }
    
    addRule(field, validator) {
        if (!this.rules.has(field)) {
            this.rules.set(field, []);
        }
        this.rules.get(field).push(validator);
        
        // Auto-validate on field change
        this.control.data.model.on('change', e => {
            if (e.name === field) {
                this.validateField(field, e.value);
            }
        });
    }
    
    validateField(field, value) {
        const fieldRules = this.rules.get(field) || [];
        const fieldErrors = [];
        
        for (const rule of fieldRules) {
            const result = rule(value);
            if (result !== true) {
                fieldErrors.push(result);
            }
        }
        
        if (fieldErrors.length > 0) {
            this.errors.set(field, fieldErrors);
        } else {
            this.errors.delete(field);
        }
        
        // Update view model
        this.control.view.data.model[`${field}_errors`] = fieldErrors;
        this.control.view.data.model[`${field}_valid`] = fieldErrors.length === 0;
        
        return fieldErrors.length === 0;
    }
    
    validateAll() {
        let isValid = true;
        this.rules.forEach((rules, field) => {
            const fieldValue = this.control.data.model[field];
            const fieldValid = this.validateField(field, fieldValue);
            isValid = isValid && fieldValid;
        });
        return isValid;
    }
}

// Usage
class RegistrationForm extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        this.validator = new ValidationManager(this);
        
        // Add validation rules
        this.validator.addRule('email', value => {
            if (!value) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
            return true;
        });
        
        this.validator.addRule('password', value => {
            if (!value) return 'Password is required';
            if (value.length < 8) return 'Password must be at least 8 characters';
            return true;
        });
    }
}
```

## Mixins System

Mixins are composable functions that enhance controls with reusable behavior. Each mixin is a function `(ctrl, options?) => void|cleanup` that adds properties, events, and DOM behaviors to any control. The framework ships with **39 mixins** organized into 7 categories.

> **📘 Detailed docs**: [control_mixins/README.md](./control_mixins/README.md) for the full catalog and API tables, or [docs/mixins-book.md](./docs/mixins-book.md) for the comprehensive deep-dive reference.

### Using Mixins

```javascript
const selectable = require('./control_mixins/selectable');
const collapsible = require('./control_mixins/collapsible');

class TreeNode extends Control {
    constructor(spec) {
        super(spec);
        selectable(this, null, { multi: true });
        collapsible(this, { trigger: '.header', content: '.children' });
    }
}
```

### Mixin Categories

#### Interaction
| Mixin | Purpose |
|---|---|
| `press-events` | Unified mouse/touch press handling with timing, drag detection, and hold |
| `pressed-state` | Visual `pressed` CSS class feedback on press (disposable) |
| `dragable` | Full drag-and-drop with axis locking and bounds |
| `selectable` | Click-to-select with multi-select (Shift/Ctrl) |
| `selection-box-host` | Marquee/lasso drag-selection |
| `resizable` | Element resizing via drag handles |
| `keyboard_navigation` | Arrow key navigation with roving tabindex (ARIA) |
| `collapsible` | Expand/collapse with `aria-expanded` and CSS classes |
| `press-outside` | Click-away detection |
| `fast-touch-click` | Eliminates 300ms touch delay |

#### Input
| Mixin | Purpose |
|---|---|
| `input_base` | Core `get_value()` / `set_value()` / `focus()` / `blur()` |
| `input_validation` | Pluggable validators, async support, built-in email/number/range |
| `input_mask` | Real-time formatting for phone, date, currency |
| `input_api` | High-level wiring: base + validation + mask |
| `field_status` | Dirty/pristine/touched state tracking |

#### Layout & Display
`display-modes`, `display`, `popup`, `bind`, `coverable`, `virtual_window`, `collapsible` — size modes, popup positioning, spatial binding, virtual scrolling, expand/collapse.

#### Theme
`theme`, `themeable`, `theme_params` — CSS variable tokens, size/variant parameters, theme resolution.

#### Lifecycle
`activation`, `hydration`, `swap_registry`, `auto_enhance`, `mx` — progressive enhancement, SSR hydration, mutation-observer auto-activation, mixin directory.

#### Infrastructure
`mixin_cleanup`, `mixin_registry` — disposable mixin support, formal dependency/conflict metadata.

#### Accessibility & Data
`a11y`, `link-hovers`, `deletable`, `selected-deletable`, `selected-resizable` — ARIA helpers, delete/resize on selected items.

### The Mixin Pattern

```javascript
const { create_mixin_cleanup } = require('./control_mixins/mixin_cleanup');

const my_mixin = (ctrl, options = {}) => {
    // 1. Guard against double-apply
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.my_mixin) return ctrl.__mx.my_mixin;
    
    // 2. Create disposable cleanup handle
    const cleanup = create_mixin_cleanup(ctrl, 'my_mixin');
    ctrl.__mx.my_mixin = cleanup;
    
    // 3. Add behavior
    const handler = (e) => { /* ... */ };
    ctrl.on('click', handler);
    cleanup.track_listener(ctrl, 'click', handler);
    
    return cleanup; // caller can later call cleanup.dispose()
};
```

### Feature Detection

```javascript
const mx = require('./control_mixins/mx');

mx.has_feature(ctrl, 'selectable');  // true/false
mx.list_features(ctrl);             // ['selectable', 'press_events', ...]
```

### Dependency Resolution

Mixins auto-resolve dependencies — you never need to worry about application order:
```javascript
// pressed-state automatically applies press-events if missing
// selectable automatically applies press-events if missing
// selection-box-host automatically applies selectable + press-events
```

## Rendering and DOM Management

### HTML Generation
Controls generate HTML strings for server-side rendering:
```javascript
renderBeginTagToHtml() {
    return `<${this.dom.tagName}${this.renderDomAttributes()}>`;
}

renderEndTagToHtml() {
    return `</${this.dom.tagName}>`;
}
```

### DOM Attributes
Attributes are managed reactively:
```javascript
this.dom.attrs.class = 'active selected';
this.dom.attrs.style.color = 'red';
// Automatically updates DOM when activated
```

### CSS Management
```javascript
// Add/remove classes
control.add_class('active');
control.remove_class('disabled');
control.has_class('selected'); // true/false

// Direct style manipulation
control.style('background-color', '#ff0000');
control.style({ width: '100px', height: '50px' });
```

## Event System

### DOM Events
Automatic mapping of DOM events to control events:
```javascript
control.on('click', e => {
    console.log('Button clicked');
});

control.on('change', e => {
    this.data.model.value = e.target.value;
});
```

### Custom Events
Controls can raise and listen to custom events:
```javascript
// Raise event
control.raise('data_changed', { 
    old_value: prev, 
    new_value: current 
});

// Listen to event
control.on('data_changed', e => {
    this.update_display(e.new_value);
});
```

### Event Delegation
Events bubble up through the control hierarchy:
```javascript
parent_control.on('child_selected', e => {
    console.log('Child control selected:', e.ctrl_target);
});
```

## Examples

### Basic Button with State
```javascript
class ToggleButton extends Control {
    constructor(spec) {
        super(spec);
        
        this.data.model = new Data_Object({
            active: spec.active || false
        });
        
        this.view.data.model = new Data_Object({
            label: spec.active ? 'ON' : 'OFF'
        });
        
        this.on('click', () => {
            this.data.model.active = !this.data.model.active;
        });
        
        this.data.model.on('change', e => {
            if (e.name === 'active') {
                this.view.data.model.label = e.value ? 'ON' : 'OFF';
                this.toggle_class('active', e.value);
            }
        });
    }
}
```

### Data Grid with Pagination
```javascript
class DataGrid extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        this.data.model = new Data_Object({
            records: spec.data || [],
            total_count: spec.total || 0
        });
        
        this.view.data.model = new Data_Object({
            current_page: 1,
            page_size: 10,
            visible_records: []
        });
        
        this.compose_grid();
        this.update_visible_records();
    }
    
    compose_grid() {
        this.add(this.header = new GridHeader({ context: this.context }));
        this.add(this.body = new GridBody({ context: this.context }));
        this.add(this.footer = new GridFooter({ context: this.context }));
    }
}
```

### SVG Rendering
```javascript
const circle = new Control({
    tagName: 'circle',
    attrs: {
        cx: 50,
        cy: 50,
        r: 40,
        stroke: 'green',
        'stroke-width': 4,
        fill: 'yellow'
    }
});

const svg = new Control({
    tagName: 'svg',
    attrs: {
        width: 100,
        height: 100
    }
});
svg.add(circle);
```

### Form with Validation
```javascript
class ValidatedInput extends Control {
    constructor(spec) {
        super(spec);
        
        this.data.model = new Data_Object({
            value: '',
            is_valid: true,
            error_message: ''
        });
        
        this.view.data.model = new Data_Object({
            display_value: '',
            show_error: false
        });
        
        this.on('input', e => {
            const value = e.target.value;
            this.data.model.value = value;
            this.validate(value);
        });
    }
    
    validate(value) {
        const is_valid = this.spec.validator ? this.spec.validator(value) : true;
        this.data.model.is_valid = is_valid;
        this.view.data.model.show_error = !is_valid;
    }
}
```

### Real-World Application Patterns

#### Complete CRUD Application Example
```javascript
// User management application
class UserManager extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Data model - raw user data from API
        this.data.model = new Data_Object({
            users: [],
            loading: false,
            selected_user: null,
            filter: '',
            sort_by: 'name',
            sort_direction: 'asc'
        });
        
        // View model - UI state and formatted data
        this.view.data.model = new Data_Object({
            filtered_users: [],
            display_mode: 'list', // list, grid, detail
            page: 1,
            per_page: 10,
            show_add_form: false,
            show_delete_confirm: false
        });
        
        this.setup_data_bindings();
        this.compose_interface();
        this.load_users();
    }
    
    setup_data_bindings() {
        // Auto-filter users when filter changes
        this.data.model.on('change', e => {
            if (['users', 'filter', 'sort_by', 'sort_direction'].includes(e.name)) {
                this.update_filtered_users();
            }
        });
        
        // Update pagination when filtered users change
        this.view.data.model.on('change', e => {
            if (e.name === 'filtered_users') {
                this.update_pagination();
            }
        });
    }
    
    compose_interface() {
        // Header with search and controls
        this.header = new Control({
            tagName: 'header',
            class: 'user-manager-header'
        });
        
        this.search_input = new Control({
            tagName: 'input',
            attrs: { 
                type: 'text', 
                placeholder: 'Search users...' 
            }
        });
        
        this.add_button = new Control({
            tagName: 'button',
            text: 'Add User',
            class: 'btn btn-primary'
        });
        
        this.header.add(this.search_input);
        this.header.add(this.add_button);
        
        // User list/grid container
        this.user_container = new Control({
            tagName: 'div',
            class: 'user-container'
        });
        
        // Pagination controls
        this.pagination = new PaginationControl({
            context: this.context
        });
        
        this.add(this.header);
        this.add(this.user_container);
        this.add(this.pagination);
        
        this.setup_event_handlers();
    }
    
    setup_event_handlers() {
        // Search input
        this.search_input.on('input', e => {
            this.data.model.filter = e.target.value;
        });
        
        // Add user button
        this.add_button.on('click', () => {
            this.view.data.model.show_add_form = true;
            this.show_add_user_form();
        });
        
        // User selection
        this.on('user_selected', e => {
            this.data.model.selected_user = e.user;
            this.show_user_detail(e.user);
        });
    }
    
    update_filtered_users() {
        let filtered = [...this.data.model.users];
        
        // Apply filter
        if (this.data.model.filter) {
            const filter = this.data.model.filter.toLowerCase();
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(filter) ||
                user.email.toLowerCase().includes(filter)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            const field = this.data.model.sort_by;
            const direction = this.data.model.sort_direction === 'asc' ? 1 : -1;
            return a[field].localeCompare(b[field]) * direction;
        });
        
        this.view.data.model.filtered_users = filtered;
        this.render_users();
    }
    
    render_users() {
        this.user_container.clear();
        
        const users = this.view.data.model.filtered_users;
        const start = (this.view.data.model.page - 1) * this.view.data.model.per_page;
        const end = start + this.view.data.model.per_page;
        const page_users = users.slice(start, end);
        
        page_users.forEach(user => {
            const user_item = new UserItem({
                context: this.context,
                user: user
            });
            
            user_item.on('click', () => {
                this.raise('user_selected', { user });
            });
            
            this.user_container.add(user_item);
        });
    }
    
    async load_users() {
        this.data.model.loading = true;
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            this.data.model.users = users;
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            this.data.model.loading = false;
        }
    }
}

class UserItem extends Control {
    constructor(spec) {
        super(spec);
        this.user = spec.user;
        this.compose_user_item();
    }
    
    compose_user_item() {
        this.dom.tagName = 'div';
        this.add_class('user-item');
        
        this.avatar = new Control({
            tagName: 'img',
            attrs: { 
                src: this.user.avatar || '/default-avatar.png',
                alt: this.user.name
            },
            class: 'user-avatar'
        });
        
        this.info = new Control({
            tagName: 'div',
            class: 'user-info'
        });
        
        this.name = new Control({
            tagName: 'h3',
            text: this.user.name,
            class: 'user-name'
        });
        
        this.email = new Control({
            tagName: 'p',
            text: this.user.email,
            class: 'user-email'
        });
        
        this.info.add(this.name);
        this.info.add(this.email);
        
        this.add(this.avatar);
        this.add(this.info);
    }
}
```

#### Progressive Web App (PWA) Integration
```javascript
class PWAApplication extends Control {
    constructor(spec) {
        super(spec);
        
        this.setup_service_worker();
        this.setup_offline_support();
        this.setup_app_shell();
    }
    
    setup_service_worker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }
    
    setup_offline_support() {
        // Cache critical application state
        this.on('data_change', e => {
            if (e.critical) {
                localStorage.setItem('app_state', JSON.stringify({
                    timestamp: Date.now(),
                    data: e.data
                }));
            }
        });
        
        // Restore state on startup
        window.addEventListener('load', () => {
            const cached_state = localStorage.getItem('app_state');
            if (cached_state) {
                const { data } = JSON.parse(cached_state);
                this.restore_state(data);
            }
        });
    }
    
    setup_app_shell() {
        this.app_shell = new Control({
            tagName: 'div',
            class: 'app-shell'
        });
        
        this.header = new AppHeader({ context: this.context });
        this.nav = new AppNavigation({ context: this.context });
        this.main = new Control({ tagName: 'main', class: 'app-main' });
        this.footer = new AppFooter({ context: this.context });
        
        this.app_shell.add(this.header);
        this.app_shell.add(this.nav);
        this.app_shell.add(this.main);
        this.app_shell.add(this.footer);
        
        this.add(this.app_shell);
    }
}
```

#### Multi-Language Support
```javascript
class I18nControl extends Control {
    constructor(spec) {
        super(spec);
        
        this.locale = spec.locale || 'en';
        this.translations = new Map();
        this.setup_i18n();
    }
    
    setup_i18n() {
        // Load translations
        this.load_translations(this.locale);
        
        // Watch for locale changes
        this.on('locale_change', e => {
            this.locale = e.locale;
            this.load_translations(this.locale);
            this.update_all_text();
        });
    }
    
    async load_translations(locale) {
        try {
            const response = await fetch(`/i18n/${locale}.json`);
            const translations = await response.json();
            this.translations.set(locale, translations);
        } catch (error) {
            console.error(`Failed to load translations for ${locale}:`, error);
        }
    }
    
    t(key, params = {}) {
        const translations = this.translations.get(this.locale) || {};
        let text = translations[key] || key;
        
        // Replace parameters
        Object.entries(params).forEach(([param, value]) => {
            text = text.replace(`{{${param}}}`, value);
        });
        
        return text;
    }
    
    update_all_text() {
        // Update all translatable text in the control tree
        this.iterate_this_and_subcontrols(ctrl => {
            if (ctrl.i18n_key) {
                ctrl.content.clear();
                ctrl.add(this.t(ctrl.i18n_key, ctrl.i18n_params));
            }
        });
    }
}

// Usage
class WelcomeMessage extends I18nControl {
    constructor(spec) {
        super(spec);
        
        this.user_name = spec.user_name;
        this.i18n_key = 'welcome_message';
        this.i18n_params = { name: this.user_name };
        
        this.compose_message();
    }
    
    compose_message() {
        this.dom.tagName = 'h1';
        this.add(this.t(this.i18n_key, this.i18n_params));
    }
}
```

## API Reference

### Control Core Methods

| Method | Description |
|--------|-------------|
| `add(content)` | Add child control or text content |
| `remove()` | Remove this control from parent |
| `render()` | Generate HTML string |
| `activate()` | Connect to DOM element (client-side) |
| `style(property, value)` | Set CSS styles |
| `add_class(name)` | Add CSS class |
| `remove_class(name)` | Remove CSS class |
| `has_class(name)` | Check if class exists |
| `on(event, handler)` | Add event listener |
| `raise(event, data)` | Emit custom event |

### Control Properties

| Property | Description |
|----------|-------------|
| `dom` | DOM-related properties and methods |
| `content` | Collection of child controls |
| `context` | Application context |
| `data.model` | Business data model |
| `view.data.model` | UI-specific view model |
| `parent` | Parent control reference |

### Event Types

| Event | When Triggered |
|-------|----------------|
| `change` | Property or content changes |
| `activate` | Control becomes active |
| `click`, `mousedown`, etc. | DOM events |
| `resize` | Size changes |
| `move` | Position changes |

## Development Status

The framework is actively developed with focus on:
- Enhanced data binding between models
- Improved serialization for complex data structures
- Standardized mixin patterns
- Better debugging and development tools
- Comprehensive testing coverage

For detailed implementation plans, see [MVVM.md](./MVVM.md).

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Basic Installation
```bash
npm install jsgui3-html
# or
yarn add jsgui3-html
```

### Dependencies
The framework depends on several core packages:
- `lang-tools` - Core utilities and Evented_Class foundation
- `obext` - Object extension utilities for properties and fields
- `fnl` - Functional programming utilities (promises/callbacks)
- `jsgui3-gfx-core` - Graphics and geometry utilities (Rect class)

## Quick Start

### Basic Control Creation
```javascript
const jsgui = require('jsgui3-html');
const { Control } = jsgui;

// Create a simple button
const button = new Control({
    tagName: 'button',
    text: 'Hello World',
    class: 'btn primary'
});

// Server-side: Generate HTML
console.log(button.render());
// Output: <button class="btn primary" data-jsgui-id="ctrl_1">Hello World</button>
```

### Building Your First Application
```javascript
// app.js
const jsgui = require('jsgui3-html');
const { Control, Page_Context } = jsgui;

// Create application context
const context = new Page_Context();

// Create main application control
class App extends Control {
    constructor(spec) {
        super(spec);
        this.compose_app();
    }
    
    compose_app() {
        this.add(this.header = new Header({ context: this.context }));
        this.add(this.main = new MainContent({ context: this.context }));
        this.add(this.footer = new Footer({ context: this.context }));
    }
}

// Initialize app
const app = new App({ context });
```

### Server-Side Rendering
```javascript
// server.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    const context = new Page_Context();
    const page = new MyPage({ context });
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>My App</title>
            <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
            ${page.render()}
            <script src="/client.js"></script>
        </body>
        </html>
    `;
    
    res.send(html);
});
```

### Client-Side Activation
This activation step is often called "Hydration" in other UI frameworks.
```javascript
// client.js
const jsgui = require('jsgui3-html');

// Activate controls on page load
document.addEventListener('DOMContentLoaded', () => {
    const context = new jsgui.Page_Context();
    context.activate_page();
});
```

## Component Library

### Built-in Controls

Controls are grouped by stability tier:
- **Stable**: exported at top level from `controls/controls.js`.
- **Experimental**: exported under `controls.experimental`.
- **Deprecated**: legacy aliases under `controls.deprecated` (emit warnings).

#### Basic Controls
```javascript
// Text display
const text = new Control({
    tagName: 'span',
    text: 'Hello World'
});

// Input field
const input = new Control({
    tagName: 'input',
    attrs: {
        type: 'text',
        placeholder: 'Enter text...'
    }
});

// Container
const container = new Control({
    tagName: 'div',
    class: 'container'
});
container.add(text);
container.add(input);
```

#### Layout Controls
```javascript
// Grid layout
const Grid = require('./controls/organised/0-core/0-basic/grid');
const grid = new Grid({
    grid_size: [3, 3], // 3x3 grid
    size: [300, 300]
});

// Panel container
const Panel = require('./controls/organised/1-standard/6-layout/panel');
const panel = new Panel({
    title: 'My Panel',
    collapsible: true
});

// Tabbed interface  
const Tabbed_Panel = require('./controls/organised/1-standard/6-layout/tabbed-panel');
const tabs = new Tabbed_Panel({
    tabs: ['Tab 1', 'Tab 2', 'Tab 3']
});
```

#### Form Controls
```javascript
// Checkbox
const checkbox = new Control({
    tagName: 'input',
    attrs: { type: 'checkbox' }
});

// Radio button group
const Radio_Button_Group = require('./controls/organised/0-core/0-basic/1-compositional/radio-button-group');
const radioGroup = new Radio_Button_Group({
    options: ['Option 1', 'Option 2', 'Option 3'],
    name: 'choices'
});

// Date picker (with view model formatting)
class DatePicker extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        this.data.model = new Data_Object({ date: new Date() });
        this.view.data.model = new Data_Object({ 
            formatted_date: this.format_date(this.data.model.date)
        });
    }
}
```

### Custom Control Development

#### Simple Custom Control
```javascript
class Counter extends Control {
    constructor(spec) {
        super(spec);
        
        this.count = spec.count || 0;
        this.compose_counter();
        this.setup_events();
    }
    
    compose_counter() {
        this.display = new Control({
            tagName: 'span',
            text: this.count.toString(),
            class: 'counter-display'
        });
        
        this.increment_btn = new Control({
            tagName: 'button',
            text: '+',
            class: 'counter-btn'
        });
        
        this.decrement_btn = new Control({
            tagName: 'button',
            text: '-',
            class: 'counter-btn'
        });
        
        this.add(this.decrement_btn);
        this.add(this.display);
        this.add(this.increment_btn);
    }
    
    setup_events() {
        this.increment_btn.on('click', () => {
            this.count++;
            this.display.content.clear();
            this.display.add(this.count.toString());
        });
        
        this.decrement_btn.on('click', () => {
            this.count--;
            this.display.content.clear();
            this.display.add(this.count.toString());
        });
    }
}
```

#### Advanced Control with Data Models
```javascript
class UserProfile extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Data model - raw user data
        this.data.model = new Data_Object({
            id: spec.user_id,
            name: spec.name,
            email: spec.email,
            avatar_url: spec.avatar_url,
            created_at: new Date(spec.created_at)
        });
        
        // View model - formatted for display
        this.view.data.model = new Data_Object({
            display_name: this.data.model.name,
            display_email: this.data.model.email,
            avatar_src: this.data.model.avatar_url || '/default-avatar.png',
            member_since: this.format_date(this.data.model.created_at),
            is_editing: false
        });
        
        this.setup_bindings();
        this.compose_profile();
    }
    
    setup_bindings() {
        // Auto-sync data to view model
        this.data.model.on('change', e => {
            switch(e.name) {
                case 'name':
                    this.view.data.model.display_name = e.value;
                    break;
                case 'email':
                    this.view.data.model.display_email = e.value;
                    break;
            }
        });
        
        // Update UI when view model changes
        this.view.data.model.on('change', e => {
            if (e.name === 'is_editing') {
                this.toggle_edit_mode(e.value);
            }
        });
    }
    
    compose_profile() {
        this.avatar = new Control({
            tagName: 'img',
            attrs: { src: this.view.data.model.avatar_src },
            class: 'user-avatar'
        });
        
        this.name_display = new Control({
            tagName: 'h2',
            text: this.view.data.model.display_name,
            class: 'user-name'
        });
        
        this.edit_btn = new Control({
            tagName: 'button',
            text: 'Edit',
            class: 'edit-btn'
        });
        
        this.add(this.avatar);
        this.add(this.name_display);
        this.add(this.edit_btn);
        
        this.edit_btn.on('click', () => {
            this.view.data.model.is_editing = !this.view.data.model.is_editing;
        });
    }
}
```

## Performance Considerations

### Rendering Optimization
The framework uses direct DOM manipulation instead of virtual DOM:
```javascript
// Efficient - updates only what changed
this.data.model.on('change', e => {
    if (e.name === 'title') {
        this.title_element.content.clear();
        this.title_element.add(e.value);
    }
});

// Avoid - unnecessary full re-render
this.data.model.on('change', e => {
    this.clear();
    this.compose(); // Rebuilds entire control
});
```

### Memory Management
```javascript
// Clean up event listeners when control is removed
remove() {
    this.data.model.off('change', this.data_change_handler);
    this.view.data.model.off('change', this.view_change_handler);
    super.remove();
}
```

### Large Data Sets
```javascript
// Use pagination for large lists
class DataList extends Control {
    constructor(spec) {
        super(spec);
        this.page_size = spec.page_size || 50;
        this.current_page = 0;
        this.render_page();
    }
    
    render_page() {
        const start = this.current_page * this.page_size;
        const end = start + this.page_size;
        const page_data = this.data.slice(start, end);
        
        this.clear();
        page_data.forEach(item => {
            this.add(new ListItem({ data: item }));
        });
    }
}
```

## Testing

### Unit Testing Controls
```javascript
// test/controls/button.test.js
const { Control } = require('jsgui3-html');

describe('Button Control', () => {
    let button;
    
    beforeEach(() => {
        button = new Control({
            tagName: 'button',
            text: 'Test Button'
        });
    });
    
    test('renders correct HTML', () => {
        const html = button.render();
        expect(html).toContain('<button');
        expect(html).toContain('Test Button');
        expect(html).toContain('data-jsgui-id');
    });
    
    test('handles click events', () => {
        let clicked = false;
        button.on('click', () => { clicked = true; });
        
        // Simulate activation and click
        button.activate();
        button.raise('click');
        
        expect(clicked).toBe(true);
    });
});
```

### Integration Testing
```javascript
// test/integration/form.test.js
const { JSDOM } = require('jsdom');

describe('Form Integration', () => {
    let dom, document, window;
    
    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        document = dom.window.document;
        window = dom.window;
        global.document = document;
        global.window = window;
    });
    
    test('form submission updates data model', () => {
        const form = new ContactForm({
            context: new Page_Context()
        });
        
        // Render and activate
        document.body.innerHTML = form.render();
        form.activate();
        
        // Simulate user input
        const nameInput = document.querySelector('input[name="name"]');
        nameInput.value = 'John Doe';
        nameInput.dispatchEvent(new window.Event('input'));
        
        expect(form.data.model.name).toBe('John Doe');
    });
});
```

## Debugging

### Development Tools
```javascript
// Enable debug mode for detailed logging
ctrl.debug_mode = true;

// Inspect control state
console.log(ctrl.inspect()); // Shows all properties and state

// Trace event flow
ctrl.on('*', (event_name, event_data) => {
    console.log(`Event: ${event_name}`, event_data);
});
```

### Common Issues and Solutions

#### Controls Not Activating
```javascript
// Problem: Controls don't respond to events
// Solution: Ensure proper activation
const context = new Page_Context();
context.activate_page(); // Activates all controls on page
```

#### State Not Persisting
```javascript
// Problem: State lost on page reload
// Solution: Implement serialization
ctrl.on('server-pre-render', () => {
    ctrl._fields = ctrl._fields || {};
    ctrl._fields.important_state = ctrl.important_value;
});
```

#### Memory Leaks
```javascript
// Problem: Event listeners not cleaned up
// Solution: Proper cleanup in remove()
remove() {
    // Remove all event listeners
    this.off(); // Removes all listeners on this control
    
    // Clean up child controls
    this.content.each(child => {
        if (child.remove) child.remove();
    });
    
    super.remove();
}
```

## Browser Compatibility

### Supported Browsers
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Polyfills Required
For older browsers, include polyfills for:
- `WeakMap` and `WeakSet`
- `Object.assign`
- `Array.prototype.find`
- `Promise` (if using async features)

### Feature Detection
```javascript
// Check for required features
if (typeof WeakMap === 'undefined') {
    console.error('WeakMap not supported - please include polyfill');
}

// Graceful degradation
if (!window.addEventListener) {
    // Fallback for very old browsers
    ctrl.add_event_listener = function(event, handler) {
        this.dom.el.attachEvent('on' + event, handler);
    };
}
```

## Security Considerations

### XSS Prevention
```javascript
// Safe text rendering (automatically escaped)
const safe_text = new Control({
    tagName: 'div',
    text: user_input // Automatically escaped
});

// Raw HTML (use with caution)
const raw_html = new Control({
    tagName: 'div'
});
raw_html.dom.el.innerHTML = sanitized_html; // Only use with sanitized content
```

### Data Validation
```javascript
class SecureForm extends Control {
    validate_input(value, type) {
        switch(type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'phone':
                return /^\d{10}$/.test(value.replace(/\D/g, ''));
            default:
                return value.length > 0;
        }
    }
    
    sanitize_input(value) {
        return value.replace(/[<>]/g, ''); // Basic sanitization
    }
}
```

## Quick Reference Guides

For detailed information and quick starts:

- **[EXAMPLES_AND_TESTS.md](EXAMPLES_AND_TESTS.md)** - Quick start guide for developers and AI agents
- **[examples/README.md](examples/README.md)** - Standalone examples (Node.js only, no server)
- **[dev-examples/README.md](dev-examples/README.md)** - Server-integrated examples (with jsgui3-server)
- **[dev-examples/DEVELOPMENT_EXAMPLES_SUMMARY.md](dev-examples/DEVELOPMENT_EXAMPLES_SUMMARY.md)** - ⭐ NEW: Enhanced examples with WYSIWYG form builder, history management, and new reusable controls
- **[DEV_EXAMPLES_SUMMARY.md](DEV_EXAMPLES_SUMMARY.md)** - Summary of isomorphic patterns and examples
- **[test/README.md](test/README.md)** - Testing guide and best practices
- **[html-core/DATA_BINDING.md](html-core/DATA_BINDING.md)** - Complete data binding API reference
- **[MVVM.md](MVVM.md)** - MVVM architecture analysis and enhancements

### New in Dev Examples

The dev-examples directory now includes three comprehensive examples:

1. **Enhanced Counter** (`dev-examples/binding/counter/`) - ⭐ ENHANCED
   - Undo/Redo with 50-item history
   - Keyboard shortcuts (↑/↓, R, Ctrl+Z/Y)
   - localStorage persistence
   - Smooth animations
   - Server-side rendering + client activation

2. **User Form** (`dev-examples/binding/user-form/`)
   - Complex validation patterns
   - Async server-side validation
   - Email blacklist checking
   - API endpoint integration

3. **WYSIWYG Form Builder** (`dev-examples/wysiwyg-form-builder/`) - ⭐ NEW (WIP)
   - Visual form building interface
   - 9 field types (text, email, password, number, phone, url, textarea, select, checkbox)
   - Real-time property editing
   - Edit/Preview mode toggle
   - JSON export/import
   - localStorage auto-save

### New Reusable Controls

Three new controls added to the framework:

- **`FormField`** - Composite control combining label + input + validation indicator
- **`Toolbar`** - Flexible button container with icons, tooltips, separators
- **`PropertyEditor`** - Dynamic property editing panel that adapts to item type

All available via: `const { FormField, Toolbar, PropertyEditor } = require('jsgui3-html');`

## Contributing

### Development Setup
```bash
# Clone repository
git clone https://github.com/jsgui3/jsgui3-html.git
cd jsgui3-html

# Install dependencies
npm install

# Install test dependencies
cd test && npm install

# Run all tests
npm test

# Run specific test suites
npm run test:core          # Core control tests
npm run test:mvvm          # MVVM and binding tests
npm run test:integration   # Integration tests

# Run linter
npm run lint
```

### Code Style Guidelines
- Use camelCase for JavaScript variables and methods
- Use PascalCase for class names
- Use snake_case for file names
- Include JSDoc comments for public methods
- Follow the existing patterns for mixins and controls

### Submitting Changes
1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes with tests
4. Run the test suite: `npm test`
5. Submit a pull request with detailed description

### Reporting Issues
When reporting bugs, please include:
- Minimal code example reproducing the issue
- Expected vs actual behavior
- Browser and Node.js versions
- Stack trace if available

## Roadmap

For detailed control improvement planning and checklists, see:
- `docs/jsgui3_html_improvement_plan.md`
- `docs/jsgui3_html_improvement_priorities.md`
- `docs/improvement_checklists/INDEX.md`

### Version 2.x (Current)
- ✅ Core control system with isomorphic rendering
- ✅ Basic mixins (selectable, dragable, press events)
- ✅ Event system and DOM management
- 🔄 Enhanced data binding system
- 🔄 Improved serialization for complex data

### Version 3.x (Planned)
- 📋 Standardized mixin state management
- 📋 Advanced validation framework
- 📋 Performance monitoring tools
- 📋 Component hot-reloading
- 📋 TypeScript definitions

### Version 4.x (Future)
- 📋 WebComponent integration
- 📋 Advanced animation system
- 📋 Mobile-optimized controls
- 📋 Accessibility enhancements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://jsgui3-html.readthedocs.io/)
- 💬 [Community Forum](https://forum.jsgui3.dev/)
- 🐛 [Issue Tracker](https://github.com/jsgui3/jsgui3-html/issues)
- 📧 [Email Support](mailto:support@jsgui3.dev)
- 💡 [Feature Requests](https://github.com/jsgui3/jsgui3-html/discussions/categories/ideas)

## File Structure and Organization

The jsgui3-html framework follows a structured organization:

```
jsgui3-html/
├── html-core/                    # Core framework files
│   ├── control-core.js          # Base Control_Core class
│   ├── control-enh.js           # Enhanced Control class  
│   ├── control.js               # Main Control export
│   ├── Control_View.js          # View management
│   ├── Control_View_UI.js       # UI-specific view logic
│   └── Data_Model_View_Model_Control.js  # MVVM control base
├── control_mixins/               # Reusable behavior mixins
│   ├── selectable.js            # Selection functionality
│   ├── dragable.js              # Drag and drop
│   ├── press-events.js          # Touch/press event handling
│   └── pressed-state.js         # Visual press feedback
└── controls/organised/           # Pre-built control library
    ├── 0-core/0-basic/          # Core controls (Grid, List)
    └── 1-standard/6-layout/     # Layout controls (Panel, Tabbed_Panel)
```

### Framework Philosophy

Jsgui3-html is built on several key principles:

1. **Isomorphic First**: Every component works identically on server and client
2. **Direct DOM Manipulation**: No virtual DOM - direct, predictable updates
3. **Compositional Architecture**: Build complex UIs from simple, reusable pieces
4. **State Separation**: Clear distinction between business data and UI state
5. **Event-Driven**: Reactive updates through comprehensive event system
6. **Mixin-Based Extensions**: Add functionality without complex inheritance

### Key Differences from Other Frameworks

| Feature | jsgui3-html | React | Vue | Angular |
|---------|-------------|-------|-----|---------|
| Virtual DOM | ❌ Direct DOM | ✅ | ✅ | ❌ Direct DOM |
| Server Rendering | ✅ Built-in | ✅ Next.js | ✅ Nuxt.js | ✅ Universal |
| State Management | Data/View Models | External (Redux) | Vuex/Pinia | Services/NgRx |
| Component Model | Class-based | Function/Class | Object/Composition | Class-based |
| Learning Curve | Medium | High | Low | High |
| Bundle Size | Small | Medium | Small | Large |

## Troubleshooting

### Common Installation Issues

#### Node.js Version Compatibility
```bash
# Check Node.js version
node --version  # Should be 14.0.0 or higher

# If using nvm, switch to compatible version
nvm install 16
nvm use 16
```

#### Package Installation Problems
```bash
# Clear npm cache if installation fails
npm cache clean --force

# Delete node_modules and package-lock.json, then reinstall
rm -rf node_modules package-lock.json
npm install

# Use yarn if npm has issues
yarn install
```

### Runtime Error Solutions

#### "Cannot find module 'lang-tools'" Error
```bash
# Install missing dependency
npm install lang-tools

# Or install all dependencies
npm install obext fnl jsgui3-gfx-core
```

#### Controls Not Rendering on Server
```javascript
// Ensure proper context setup
const { Page_Context } = require('jsgui3-html');
const context = new Page_Context();

// Register all controls with context before rendering
app.register_control(my_control);
```

#### Client-Side Activation Failures
```javascript
// Check for proper DOM ready handling
document.addEventListener('DOMContentLoaded', () => {
    // Only activate after DOM is fully loaded
    const context = new jsgui.Page_Context();
    context.activate_page();
});

// Verify script loading order
// 1. jsgui3-html library
// 2. Your application code
// 3. Activation code
```

### Performance Issues

#### Slow Initial Page Load
```javascript
// Use lazy loading for non-critical controls
class LazyControl extends Control {
    constructor(spec) {
        super(spec);
        this.lazy_loaded = false;
    }
    
    activate() {
        if (!this.lazy_loaded) {
            this.compose_heavy_content();
            this.lazy_loaded = true;
        }
        super.activate();
    }
}
```

#### Memory Usage Growing Over Time
```javascript
// Implement proper cleanup in long-running applications
class ManagedControl extends Control {
    constructor(spec) {
        super(spec);
        this.cleanup_handlers = [];
    }
    
    add_managed_listener(target, event, handler) {
        target.on(event, handler);
        this.cleanup_handlers.push(() => target.off(event, handler));
    }
    
    destroy() {
        this.cleanup_handlers.forEach(cleanup => cleanup());
        this.cleanup_handlers = [];
        super.remove();
    }
}
```
