# Server API Assumptions Documentation

This document analyzes the failing examples and documents all assumptions being made about the lower-level server API based on observed patterns and errors.

## Current Failing Examples

### 1. Counter Example (`dev-examples/binding/counter/`)
**Status**: Partially working - server starts but shows favicon 404 errors
**Error Pattern**: `1) no defined route result` for `/favicon.ico`

### 2. WYSIWYG Form Builder (`dev-examples/wysiwyg-form-builder/`)
**Status**: Critical failure
**Error Pattern**: `UnhandledPromiseRejection: This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason "NYI".`

## Core API Assumptions

### Server Constructor Pattern

```javascript
const server = new Server({
    Ctrl: Demo_UI,                                      // Main UI control class
    src_path_client_js: require.resolve('./client.js'), // Client entry point
    debug: true                                         // Include source maps
});
```

**Assumptions:**
1. `Server` class is exported from `jsgui3-server` package
2. `Ctrl` parameter expects a Control class (not instance)
3. `src_path_client_js` should be absolute path from `require.resolve()`
4. `debug: true` enables source maps and development features
5. Server handles bundling of client-side JavaScript automatically

### Server Lifecycle Pattern

```javascript
server.on('ready', () => {
    // Server is ready, client bundle built
    server.start(port, (err) => {
        // HTTP server started
    });
});
```

**Assumptions:**
1. Server emits 'ready' event when bundling is complete
2. `start()` method takes port number and callback
3. Callback receives error parameter if startup fails
4. Server handles HTTP routing automatically

### Control Rendering Assumptions

**Isomorphic Control Pattern:**
1. Controls must work on both server (Node.js) and client (browser)
2. DOM element access must be guarded: `if (this.dom.el) { ... }`
3. Event listeners only attached in `activate()` method (client-only)
4. UI structure built in constructor (runs on both server/client)

**Server-Side Rendering Guards:**
```javascript
// ✅ Required pattern
if (this.input.dom.el) {
    this.input.dom.el.value = initial_value;
}

// ✅ Required pattern
if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handler);
}

// ❌ Causes server crash
this.input.dom.el.value = initial_value;  // No guard
```

### Data Model Assumptions

**Data_Object Pattern:**
```javascript
this.model = new Data_Object({
    property_name: initial_value
});
```

**Assumptions:**
1. `Data_Object` from `lang-tools` provides reactive data binding
2. Properties can be get/set with `model.get('prop')` and `model.set('prop', value)`
3. Changes emit events for MVVM binding
4. Works identically on server and client

### Control Dependencies and Exports

**Module Export Pattern:**
```javascript
// Export for jsgui3-server
jsgui.controls = jsgui.controls || {};
jsgui.controls.Demo_UI = Demo_UI;
jsgui.controls.Counter = Counter;

module.exports = jsgui;
```

**Assumptions:**
1. Controls must be attached to `jsgui.controls` object for server access
2. Must export main `jsgui` object with controls attached
3. Server expects named control exports in specific structure

## Identified NYI (Not Yet Implemented) Areas

This repo previously contained a handful of runtime `NYI` / debug-throw (`stop`) paths in core rendering and control plumbing. These were addressed so that common server/client paths no longer throw opaque `"NYI"` rejections.

Current status (high-level):
- Core selector matching (`Control.$match`, `matches_selector`, `find`) no longer throws `NYI`.
- Compositional model wiring no longer throws `stop / nyi` for supported shapes (and now supports `Control` instances in composition arrays).
- `Validation_State.set(...)` accepts richer payloads and emits `change` events.
- `Resource.load_compiler(...)` is implemented and registers compiler resources.
- Rendering is more robust for object-valued DOM attributes and `Data_Model`/`Data_Object` content items.

For implementation notes, see `docs/MVC_MVVM_Developer_Guide.md` section 10.

Remaining `NYI` strings are confined to old/experimental files (for example `html-core/old/**` and `_3_level_attempt_*`) or commented-out blocks.

## Missing Control Dependencies

Analysis of `wysiwyg-form-builder` shows dependencies on controls that exist but may have issues:

### Required Controls That Exist:
1. `Toolbar` - `controls/organised/1-standard/5-ui/Toolbar.js`
2. `PropertyEditor` - `controls/organised/1-standard/1-editor/PropertyEditor.js`
3. `panel` - `controls/organised/1-standard/6-layout/panel.js`
4. `Button` - `controls/organised/0-core/0-basic/0-native-compositional/button.js`

### Potential Issues:
1. Controls may have NYI implementations causing the "NYI" rejection
2. Controls may not be properly exported in `controls/controls.js`
3. Dependencies between controls may be broken
4. Server-side rendering compatibility issues

## Server Bundle Building Assumptions

**Bundle Process:**
```
Building client bundle...
Separating CSS and JS
arr_pos_spans_css_js_nodes.length X
```

**Assumptions:**
1. Server automatically bundles client JavaScript from `src_path_client_js`
2. CSS is separated from JavaScript during bundling
3. Server creates isomorphic bundle that works on both server/client
4. Process is asynchronous and emits 'ready' event when complete

## HTTP Server Assumptions

**Routing Pattern:**
```
pre routing tree set route: /js/js.js
pre routing tree set route: /css/css.css
pre routing tree set route: /
```

**Assumptions:**
1. Server automatically creates routes for bundled assets
2. `/js/js.js` serves the client JavaScript bundle
3. `/css/css.css` serves the extracted CSS
4. `/` serves the main application HTML
5. Missing routes (like favicon.ico) result in "no defined route result" warnings

## Context and DOM Assumptions

**Context Pattern:**
```javascript
const { context } = this;
const control = new Control({ context, tag_name: 'div' });
```

**Assumptions:**
1. All controls receive `context` object in constructor
2. Context provides DOM abstraction layer
3. Same context works on server (virtual DOM) and client (real DOM)
4. `tag_name` parameter creates appropriate DOM element type

## CSS Handling Assumptions

**CSS Attachment Pattern:**
```javascript
Counter.css = `
    .counter { /* styles */ }
`;
```

**Assumptions:**
1. Static `css` property on control classes defines styles
2. Server collects and bundles CSS from all controls
3. CSS is served at `/css/css.css` route
4. Class names match between server-rendered HTML and client CSS

## Error Handling Assumptions

**Current Error Patterns:**
1. Unhandled promise rejections with "NYI" message
2. Missing favicon route warnings (non-critical)
3. Control instantiation failures during server rendering

**Expected Error Handling:**
1. Server should catch and report control rendering errors
2. Missing dependencies should be reported clearly
3. NYI implementations should provide helpful error messages
4. Build process should validate all dependencies

## Client Hydration Assumptions

**Hydration Pattern:**
```javascript
activate() {
    if (!this.__active) {
        super.activate();
        // Attach event listeners and client-only functionality
    }
}
```

**Assumptions:**
1. Server renders static HTML with initial state
2. Client JavaScript "hydrates" the page by attaching interactivity
3. `activate()` method only runs on client
4. DOM structure matches between server render and client expectations
5. Data binding automatically synchronizes after hydration

## Storage and Persistence Assumptions

**LocalStorage Pattern:**
```javascript
if (typeof localStorage !== 'undefined') {
    localStorage.setItem('key', value);
}
```

**Assumptions:**
1. Server doesn't have localStorage, so checks are required
2. Client automatically persists state changes
3. State restoration happens during control construction
4. Storage operations are synchronous and don't affect rendering

## Next Steps for Diagnosis

To resolve the failing examples, investigate:

1. **NYI Implementations**: Find and implement the missing functionality causing "NYI" rejections
2. **Control Dependencies**: Verify all required controls are properly exported and functional
3. **Server Bundle Process**: Debug the bundling process that's failing in wysiwyg-form-builder
4. **Error Propagation**: Improve error handling to show specific failure points
5. **Favicon Handling**: Add proper static file serving for common assets
