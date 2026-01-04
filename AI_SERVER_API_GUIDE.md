# jsgui3-server API Documentation for AI Agents

This comprehensive guide provides the server API documentation needed for AI agents to generate correct server-side code for jsgui3-html applications.

## Table of Contents
1. [Server Class API](#server-class-api)
2. [Isomorphic Control Patterns](#isomorphic-control-patterns)
3. [Bundle Building Process](#bundle-building-process)
4. [Error Handling Guide](#error-handling-guide)
5. [Control Export Patterns](#control-export-patterns)
6. [Data Binding on Server](#data-binding-on-server)
7. [Common Patterns for AI](#common-patterns-for-ai)
8. [Troubleshooting Guide](#troubleshooting-guide)

## Server Class API

### Constructor

```javascript
const { Server } = require('jsgui3-server');

const server = new Server(options);
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.Ctrl` | Class | ✅ Yes | Control class (not instance) to render as main application |
| `options.src_path_client_js` | String | ✅ Yes | Absolute path to client entry point file |
| `options.debug` | Boolean | ❌ No | Enable development features and source maps (default: false) |
| `options.port` | Number | ❌ No | Default port for HTTP server (default: 3000) |
| `options.static_path` | String | ❌ No | Path to static assets directory |

**Validation Rules:**
- `Ctrl` must be a class that extends `Control`
- `src_path_client_js` must be an absolute path to an existing file
- File at `src_path_client_js` must be valid JavaScript that exports the control

**Throws:**
- `TypeError` if `Ctrl` is not a valid Control class
- `Error` if `src_path_client_js` file doesn't exist or is invalid
- `Error` if client file has syntax errors or missing dependencies

**Example:**
```javascript
const { Server } = require('jsgui3-server');
const { Demo_UI } = require('./client');

const server = new Server({
    Ctrl: Demo_UI,                                      // ✅ Control class
    src_path_client_js: require.resolve('./client.js'), // ✅ Absolute path
    debug: true                                         // ✅ Enable dev features
});
```

### Events

#### 'ready' Event
Emitted when server has successfully built the client bundle and is ready to start.

```javascript
server.on('ready', () => {
    console.log('Server ready, client bundle built');
    // Safe to call server.start() now
});
```

#### 'error' Event  
Emitted when bundle building or server operations fail.

```javascript
server.on('error', (error) => {
    console.error('Server error:', error);
    // Handle error appropriately
});
```

### Methods

#### `start(port, callback)`
Starts the HTTP server on the specified port.

**Parameters:**
- `port` (Number): Port number to listen on
- `callback` (Function): `(error, actualPort) => {}` called when server starts

**Example:**
```javascript
server.start(3000, (err, port) => {
    if (err) {
        console.error('Failed to start server:', err);
        return;
    }
    console.log(`Server running on port ${port}`);
});
```

#### `stop(callback)`
Stops the HTTP server.

**Parameters:**
- `callback` (Function): `(error) => {}` called when server stops

#### `renderControl()`
Renders the main control to HTML (used internally).

**Returns:** String containing rendered HTML

## Isomorphic Control Patterns

### Core Principle
Controls must work identically on both server (Node.js) and client (browser). This requires careful handling of browser-only APIs.

### Constructor Pattern
```javascript
class My_Control extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'my_control';
        super(spec);
        
        const { context } = this;
        
        // ✅ This runs on BOTH server and client
        // Build UI structure here
        this._create_ui_structure(context);
    }
    
    _create_ui_structure(context) {
        // Create child controls
        this.display = new Control({ context });
        this.button = new Control({ context, tag_name: 'button' });
        this.button.add('Click me');
        
        this.add(this.display);
        this.add(this.button);
    }
    
    activate() {
        // ✅ This runs ONLY on client
        if (!this.__active) {
            super.activate();
            
            // Attach event listeners here
            this._attach_client_events();
        }
    }
    
    _attach_client_events() {
        // Client-only event handling
        this.button.on('click', () => {
            this.display.content.clear();
            this.display.add('Button clicked!');
        });
    }
}
```

### Server-Safe DOM Access
Always guard DOM element access for server compatibility:

```javascript
// ✅ CORRECT - Guard DOM access
if (this.input.dom.el) {
    this.input.dom.el.value = initialValue;
    this.input.dom.el.focus();
}

// ✅ CORRECT - Check for browser environment  
if (typeof document !== 'undefined') {
    document.addEventListener('keydown', this.handleKeydown);
}

// ✅ CORRECT - Check for window object
if (typeof window !== 'undefined') {
    window.addEventListener('resize', this.handleResize);
}

// ❌ WRONG - Will crash on server
this.input.dom.el.value = initialValue;
this.input.dom.el.focus();
document.addEventListener('keydown', this.handleKeydown);
```

### Storage Access Pattern
```javascript
// ✅ CORRECT - Guard localStorage access
if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('my_data');
    if (saved) {
        this.loadData(JSON.parse(saved));
    }
}

// ✅ CORRECT - Guard sessionStorage access
if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('temp_data', JSON.stringify(data));
}
```

### MVVM Data Binding Pattern
```javascript
class Data_Bound_Control extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_bound_control';
        super(spec);
        
        const { context } = this;
        
        // ✅ Create model (works on both server and client)
        this.model = new Data_Object({
            text: 'Initial value',
            count: 0
        });
        
        // ✅ Create display controls
        this.display = new Control({ context });
        this.add(this.display);
        
        // ✅ Set up binding (works on both server and client)
        this.bind('text', this.model, {
            toView: (value) => `Display: ${value}`
        }, this.display);
        
        // ✅ Computed properties
        this.computed(
            this.model,
            ['count'],
            (count) => count * 2,
            { propertyName: 'doubled' }
        );
        
        // ✅ Watch for changes
        this.watch(this.model, 'doubled', (newVal) => {
            console.log('Doubled value changed:', newVal);
        });
    }
}
```

## Bundle Building Process

### How It Works
1. Server reads client entry point file (`src_path_client_js`)
2. Resolves all `require()` dependencies recursively
3. Extracts CSS from control classes (static `css` properties)
4. Creates JavaScript bundle for browser
5. Creates CSS bundle with all extracted styles
6. Emits 'ready' event when complete

### Client File Requirements
```javascript
// client.js - Entry point file
const jsgui = require('../../html');
const { Data_Object } = require('lang-tools');
const { Control, Active_HTML_Document } = jsgui;

// Import required controls
const Data_Model_View_Model_Control = require('../../html-core/Data_Model_View_Model_Control');

// Define your controls
class My_Control extends Control {
    constructor(spec = {}) {
        super(spec);
        // Control implementation
    }
}

// Add CSS to controls
My_Control.css = `
    .my-control {
        background: white;
        padding: 16px;
    }
`;

// Main UI class for server
class Demo_UI extends Active_HTML_Document {
    constructor(spec = {}) {
        super(spec);
        
        const { context } = this;
        
        // Build UI structure
        const myControl = new My_Control({ context });
        this.body.add(myControl);
    }
}

// ✅ REQUIRED - Export for server discovery
jsgui.controls = jsgui.controls || {};
jsgui.controls.Demo_UI = Demo_UI;
jsgui.controls.My_Control = My_Control;

// ✅ REQUIRED - Export main object
module.exports = jsgui;
```

### CSS Extraction
CSS is automatically extracted from control classes:

```javascript
class Styled_Control extends Control {
    constructor(spec = {}) {
        super(spec);
        this.add_class('styled-control');
    }
}

// ✅ CSS will be extracted and served at /css/css.css
Styled_Control.css = `
    .styled-control {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        padding: 20px;
        color: white;
    }
    
    .styled-control:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
`;
```

### Bundle Error Handling
```javascript
server.on('error', (error) => {
    if (error.message.includes('NYI')) {
        console.error('Unimplemented feature used:', error);
        // Handle NYI error
    } else if (error.code === 'MODULE_NOT_FOUND') {
        console.error('Missing dependency:', error.message);
        // Handle missing dependency
    } else {
        console.error('Bundle error:', error);
        // Handle other errors
    }
});
```

## Error Handling Guide

### Common Error Types

#### 1. "NYI" UnhandledPromiseRejection
**Cause:** Control uses unimplemented server functionality
**Example:** `UnhandledPromiseRejection: NYI`

**Solutions:**
```javascript
// ❌ Causes NYI error
class Problematic_Control extends Control {
    constructor(spec) {
        super(spec);
        // Some operation that throws 'NYI'
        this.unimplemented_operation();
    }
}

// ✅ Add error handling
class Safe_Control extends Control {
    constructor(spec) {
        super(spec);
        try {
            this.risky_operation();
        } catch (err) {
            if (err === 'NYI' || (typeof err === 'string' && err.includes('NYI'))) {
                console.warn('Feature not yet implemented, using fallback');
                this.fallback_implementation();
            } else {
                throw err;
            }
        }
    }
    
    fallback_implementation() {
        this.add('Feature not available');
    }
}
```

#### 2. "no defined route result"
**Cause:** Server doesn't handle requested asset (usually non-critical)
**Example:** `1) no defined route result 192.168.2.179 [ 'favicon.ico' ]`

**Solutions:**
- Ignore for non-critical assets like favicon.ico
- Add static file serving for required assets
- This is usually a warning, not a breaking error

#### 3. Control Instantiation Failures
**Cause:** Missing dependencies or incorrect exports

**Solutions:**
```javascript
// ✅ Verify control exports in client.js
jsgui.controls = jsgui.controls || {};
jsgui.controls.Demo_UI = Demo_UI;
jsgui.controls.My_Control = My_Control;

// ✅ Check all required controls are imported
const Required_Control = require('./path/to/Required_Control');

// ✅ Handle missing controls gracefully
class Robust_Control extends Control {
    constructor(spec) {
        super(spec);
        
        try {
            const OptionalControl = require('./OptionalControl');
            this.optional = new OptionalControl({ context: this.context });
            this.add(this.optional);
        } catch (err) {
            console.warn('Optional control not available:', err.message);
            this.add('Basic functionality only');
        }
    }
}
```

#### 4. Bundle Building Failures
**Cause:** Syntax errors, circular dependencies, or missing modules

**Debug Steps:**
1. Enable debug mode: `debug: true`
2. Check client file syntax
3. Verify all imports are correct
4. Test client file in isolation

```javascript
// ✅ Test client file separately
try {
    const client = require('./client.js');
    console.log('Client file loaded successfully');
    console.log('Available controls:', Object.keys(client.controls || {}));
} catch (err) {
    console.error('Client file error:', err);
}
```

## Control Export Patterns

### Required Export Structure
```javascript
// client.js
const jsgui = require('../../html');

// Define controls
class My_Control extends Control {
    // Implementation
}

class Demo_UI extends Active_HTML_Document {
    // Implementation  
}

// ✅ REQUIRED - Attach to jsgui.controls
jsgui.controls = jsgui.controls || {};
jsgui.controls.Demo_UI = Demo_UI;
jsgui.controls.My_Control = My_Control;

// ✅ REQUIRED - Export jsgui object
module.exports = jsgui;
```

### Alternative Export Pattern
```javascript
// client.js - Alternative approach
const controls = {
    Demo_UI: require('./Demo_UI'),
    My_Control: require('./My_Control')
};

// For server
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { controls };
}

// For browser
if (typeof window !== 'undefined') {
    window.MyApp = { controls };
}
```

### Controls.js Integration
If using the main controls registry:

```javascript
// controls/controls.js
const controls = {
    // Existing controls
    Control: require('./base/control'),
    Button: require('./organised/0-core/0-basic/0-native-compositional/button'),
    
    // Add your controls
    My_Control: require('../dev-examples/my-example/My_Control'),
    Demo_UI: require('../dev-examples/my-example/Demo_UI')
};

module.exports = controls;
```

## Data Binding on Server

### Data_Object Usage
```javascript
const { Data_Object } = require('lang-tools');

class Data_Control extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        super(spec);
        
        // ✅ Works on both server and client
        this.model = new Data_Object({
            name: 'Initial Name',
            email: '',
            count: 0
        });
        
        // Create display controls
        const nameDisplay = new Control({ context: this.context });
        const emailDisplay = new Control({ context: this.context });
        
        // ✅ Binding works on server for initial render
        this.bind('name', this.model, {
            toView: (value) => `Name: ${value}`
        }, nameDisplay);
        
        this.bind('email', this.model, {
            toView: (value) => `Email: ${value || 'Not provided'}`
        }, emailDisplay);
        
        this.add(nameDisplay);
        this.add(emailDisplay);
    }
}
```

### Computed Properties
```javascript
// ✅ Computed properties work on server
this.computed(
    this.model,
    ['firstName', 'lastName'],
    (first, last) => `${first} ${last}`.trim(),
    { propertyName: 'fullName' }
);

// ✅ Watch for changes (client-only after initial render)
this.watch(this.model, 'fullName', (newName) => {
    // This will only fire on client after activation
    console.log('Full name changed:', newName);
});
```

## Common Patterns for AI

### 1. Minimal Server Setup
```javascript
const { Server } = require('jsgui3-server');
const jsgui = require('./client');

if (require.main === module) {
    const { Demo_UI } = jsgui.controls;
    
    const server = new Server({
        Ctrl: Demo_UI,
        src_path_client_js: require.resolve('./client.js'),
        debug: true
    });
    
    server.on('ready', () => {
        const port = process.env.PORT || 3000;
        server.start(port, (err) => {
            if (err) {
                console.error('Server failed to start:', err);
                process.exit(1);
            }
            console.log(`Server running at http://localhost:${port}`);
        });
    });
    
    server.on('error', (err) => {
        console.error('Server error:', err);
    });
}
```

### 2. Robust Control with Error Handling
```javascript
class Robust_Control extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'robust_control';
        super(spec);
        
        const { context } = this;
        
        try {
            // Create model safely
            this.model = new Data_Object({
                status: 'initializing',
                data: null
            });
            
            // Build UI structure
            this._create_ui(context);
            
            // Setup data binding
            this._setup_bindings();
            
            this.model.set('status', 'ready');
            
        } catch (err) {
            console.error('Control initialization error:', err);
            this._create_error_ui(context, err);
        }
    }
    
    _create_ui(context) {
        this.display = new Control({ context });
        this.add(this.display);
    }
    
    _create_error_ui(context, error) {
        const errorDisplay = new Control({ context });
        errorDisplay.add(`Error: ${error.message || error}`);
        errorDisplay.add_class('error');
        this.add(errorDisplay);
    }
    
    _setup_bindings() {
        this.bind('status', this.model, {
            toView: (status) => `Status: ${status}`
        }, this.display);
    }
    
    activate() {
        if (!this.__active) {
            super.activate();
            
            // Client-only initialization
            this._setup_client_features();
        }
    }
    
    _setup_client_features() {
        // Add client-only event listeners and functionality
        if (this.display && this.display.dom.el) {
            this.display.on('click', () => {
                this.model.set('status', 'clicked');
            });
        }
    }
}
```

### 3. Complete Example Structure
```javascript
// client.js - Complete example
const jsgui = require('../../html');
const { Data_Object } = require('lang-tools');
const { Control, Active_HTML_Document } = jsgui;
const Data_Model_View_Model_Control = require('../../html-core/Data_Model_View_Model_Control');

// Main application control
class Demo_UI extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'demo_ui';
        super(spec);
        
        const { context } = this;
        
        if (typeof this.body.add_class === 'function') {
            this.body.add_class('demo-app');
        }
        
        // Create header
        const header = new Control({ context, tag_name: 'header' });
        header.add_class('app-header');
        const title = new Control({ context, tag_name: 'h1' });
        title.add('My Demo Application');
        header.add(title);
        
        // Create main content
        const main = new Control({ context, tag_name: 'main' });
        main.add_class('app-main');
        
        const myComponent = new My_Component({ context });
        main.add(myComponent);
        
        // Add to body
        this.body.add(header);
        this.body.add(main);
    }
    
    activate() {
        if (!this.__active) {
            super.activate();
            console.log('Demo UI activated');
        }
    }
}

// Feature component
class My_Component extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'my_component';
        super(spec);
        
        const { context } = this;
        
        this.model = new Data_Object({
            message: 'Hello World',
            count: 0
        });
        
        this.add_class('my-component');
        
        // Create UI elements
        const display = new Control({ context });
        const button = new Control({ context, tag_name: 'button' });
        button.add('Click Me');
        
        this.add(display);
        this.add(button);
        
        // Setup binding
        this.bind('message', this.model, null, display);
        
        // Store reference for activation
        this._button = button;
    }
    
    activate() {
        if (!this.__active) {
            super.activate();
            
            this._button.on('click', () => {
                const current = this.model.get('count');
                this.model.set('count', current + 1);
                this.model.set('message', `Clicked ${current + 1} times`);
            });
        }
    }
}

// CSS
Demo_UI.css = `
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
    }
    
    .app-header {
        background: #333;
        color: white;
        padding: 20px;
        text-align: center;
    }
    
    .app-main {
        padding: 40px 20px;
        max-width: 800px;
        margin: 0 auto;
    }
`;

My_Component.css = `
    .my-component {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        text-align: center;
    }
    
    .my-component button {
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        margin-top: 10px;
    }
    
    .my-component button:hover {
        background: #0056b3;
    }
`;

// Export for server
jsgui.controls = jsgui.controls || {};
jsgui.controls.Demo_UI = Demo_UI;
jsgui.controls.My_Component = My_Component;

module.exports = jsgui;
```

## Troubleshooting Guide

### Debug Steps
1. **Enable Debug Mode**
   ```javascript
   const server = new Server({
       Ctrl: Demo_UI,
       src_path_client_js: require.resolve('./client.js'),
       debug: true  // ✅ Enable detailed output
   });
   ```

2. **Test Client File Independently**
   ```javascript
   // Test before using in server
   try {
       const client = require('./client.js');
       console.log('✅ Client file loads');
       console.log('Controls:', Object.keys(client.controls || {}));
   } catch (err) {
       console.error('❌ Client file error:', err);
   }
   ```

3. **Check Control Dependencies**
   ```javascript
   // Verify all required modules exist
   const requiredControls = [
       '../../html-core/Data_Model_View_Model_Control',
       '../../controls/organised/1-standard/5-ui/Button'
   ];
   
   requiredControls.forEach(path => {
       try {
           require(path);
           console.log(`✅ ${path} available`);
       } catch (err) {
           console.error(`❌ ${path} missing:`, err.message);
       }
   });
   ```

4. **Validate Control Structure**
   ```javascript
   // Check control is properly structured
   function validateControl(ControlClass) {
       if (typeof ControlClass !== 'function') {
           throw new Error('Control must be a class/function');
       }
       
       // Test instantiation
       const mockContext = { /* minimal context */ };
       try {
           const instance = new ControlClass({ context: mockContext });
           console.log('✅ Control instantiates successfully');
           return true;
       } catch (err) {
           console.error('❌ Control instantiation failed:', err);
           return false;
       }
   }
   ```

### Common Solutions

| Problem | Solution |
|---------|----------|
| NYI UnhandledPromiseRejection | Add try/catch around risky operations |
| Missing favicon route | Ignore or add static file serving |
| Control not found | Check exports in client.js |
| Bundle build fails | Enable debug mode, check syntax |
| DOM access error | Add `if (this.dom.el)` guards |
| LocalStorage error | Add `if (typeof localStorage !== 'undefined')` |
| Event listener fails | Move to `activate()` method |
| CSS not loading | Check `ControlClass.css` static property |

### Performance Tips
- Keep control constructors lightweight
- Move heavy initialization to `activate()`
- Use lazy loading for optional dependencies
- Guard all browser-only API access
- Minimize DOM manipulation on server

This documentation provides AI agents with the complete information needed to generate correct, robust server-side code for jsgui3-html applications.