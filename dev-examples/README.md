# Dev-Only Examples with jsgui3-server

This directory contains examples that demonstrate client-side functionality using `jsgui3-server` for server-side rendering and development. These examples are specifically designed to show how jsgui3-html works in an isomorphic (server + client) context.

## Why Dev-Only Examples?

These examples require `jsgui3-server` which is listed as a **devDependency** only. This means:
- They demonstrate client-side capabilities in a realistic server context
- They showcase server-side rendering + client-side hydration patterns
- They don't add `jsgui3-server` to production dependencies
- The main `examples/` directory contains standalone examples that don't require a server

## Prerequisites

1. Install all dependencies including devDependencies:
```bash
npm install
```

2. The `jsgui3-server` package will be installed automatically

## Running Examples

Each example has its own server script. To run an example:

```bash
# From the jsgui3-html root directory
node dev-examples/binding/counter/server.js

# Or from within the example directory
cd dev-examples/binding/counter
node server.js
```

Then open your browser to `http://localhost:52000` (or the port shown in console).

## Example Categories

### Binding Examples (`binding/`)
Demonstrate MVVM data binding with server-side rendering:
- **counter/** - Simple counter with server-side rendering and client-side hydration
- **user-form/** - Form with server-side validation API
- **missing-controls/** - New core controls demo (inputs, indicators, navigation, feedback)
- **data-controls/** - Data table, data grid, virtualization, and collection controls
- **layout-controls/** - Layout and navigation controls (split pane, tabs, drawer, stepper)
- **form_editor_features/** - Form container, validation, input masks, autosize, rich text, object editor

## Key Patterns Demonstrated

### 1. Server-Side Rendering + Client-Side Hydration

```javascript
// server.js
const Server = require('jsgui3-server');
const jsgui = require('./client');

const server = new Server({
    Ctrl: jsgui.controls.Demo_UI,
    src_path_client_js: require.resolve('./client.js')
});

server.on('ready', () => {
    server.start(52000, (err) => {
        if (err) throw err;
        console.log('Server started on port 52000');
    });
});
```

The server:
1. Renders the control to HTML on the server
2. Bundles the client-side JavaScript
3. Sends HTML with embedded data to the client
4. Client JavaScript "hydrates" the DOM, attaching event handlers

### 2. Server-Side API with `server.publish()`

```javascript
// server.js
server.on('ready', () => {
    // Publish API endpoints
    server.publish('validateEmail', async (email) => {
        // Returns JSON automatically
        return { 
            valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) 
        };
    });
    
    server.start(52000);
});
```

```javascript
// client.js - calling the API
const response = await fetch('/api/validateEmail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
});
const result = await response.json();
```

### 3. Isomorphic Control Definition

The same control code runs on both server and client:

```javascript
// client.js - defines the UI
const jsgui = require('jsgui3-html');
const Active_HTML_Document = jsgui.Active_HTML_Document;

class Demo_UI extends Active_HTML_Document {
    constructor(spec = {}) {
        super(spec);
        const { context } = this;
        
        // This code runs on BOTH server and client
        // Use data binding to keep state synchronized
    }
    
    activate() {
        // This code ONLY runs on the client
        // Set up client-side event handlers here
    }
}

module.exports = jsgui;
```

### 4. Data Binding with Server Context

```javascript
// The binding system works seamlessly across server/client boundary
this.bind('count', model, {
    toView: (value) => `Count: ${value}`,
    toModel: (text) => parseInt(text) || 0
});

// On server: Renders initial value into HTML
// On client: Updates DOM when model changes
```

## Differences from Standalone Examples

| Aspect | Standalone Examples (`examples/`) | Dev Examples (`dev-examples/`) |
|--------|----------------------------------|-------------------------------|
| **Dependencies** | None (plain Node.js) | Requires `jsgui3-server` |
| **Execution** | `node examples/binding_simple_counter.js` | `node dev-examples/binding/counter/server.js` |
| **Purpose** | Show binding system API | Show isomorphic patterns |
| **Rendering** | Client-side only | Server-side + client-side |
| **File Structure** | Single file | `client.js` + `server.js` |
| **Browser Required** | No | Yes |
| **Real-world Pattern** | API demonstration | Production-like setup |

## Development Workflow

1. **Start the server** - Run the example's server script
2. **Open browser** - Navigate to the displayed URL
3. **Make changes** - Edit `client.js` for UI changes
4. **Restart server** - Server rebuilds client bundle automatically
5. **Refresh browser** - See your changes

## Server Configuration Options

```javascript
const server = new Server({
    Ctrl: Demo_UI,                          // Main UI control
    src_path_client_js: 'path/to/client',  // Client entry point
    debug: true,                            // Include source maps
    port: 52000,                            // Custom port (optional)
});
```

## API Publishing

The server can publish functions as HTTP endpoints:

```javascript
server.on('ready', () => {
    // Simple function - returns text/plain
    server.publish('hello', () => 'Hello, World!');
    
    // Complex function - returns application/json
    server.publish('getData', () => {
        return { users: ['Alice', 'Bob'], count: 2 };
    });
    
    // Async function
    server.publish('fetchUser', async (userId) => {
        const user = await database.getUser(userId);
        return user;
    });
    
    server.start(52000);
});
```

All published functions are available at `/api/<name>`.

## Client-Side Control Activation

Controls have two phases:

1. **Constructor** - Runs on both server and client
   - Define UI structure
   - Set up data binding
   - Configure initial state

2. **Activate** - Runs only on client
   - Attach event handlers
   - Start animations
   - Make API calls

```javascript
class MyControl extends Active_HTML_Document {
    constructor(spec = {}) {
        super(spec);
        // Runs on server AND client
    }
    
    activate() {
        if (!this.__active) {
            super.activate();
            // Only runs on client
        }
    }
}
```

## CSS Handling

CSS is automatically extracted from control definitions:

```javascript
Demo_UI.css = `
    .demo-ui {
        padding: 20px;
        background: #f5f5f5;
    }
    
    .counter-value {
        font-size: 2em;
        font-weight: bold;
    }
`;
```

The server includes this CSS in the served HTML automatically.

## Debugging

### Server-Side Debugging
```bash
node --inspect dev-examples/binding/counter/server.js
```

### Client-Side Debugging
Use browser DevTools. Enable source maps with `debug: true` in server config.

### Common Issues

1. **Port already in use**: Change the port number in `server.js`
2. **Module not found**: Run `npm install` from project root
3. **Changes not reflected**: Restart the server (it rebuilds on startup)

## Example Structure

Each example follows this structure:

```
example-name/
├── client.js       # UI control definition (runs on both server and client)
├── server.js       # Server setup and API endpoints
└── README.md       # Example-specific documentation
```

## Best Practices

1. **Separate concerns**: Keep server logic in `server.js`, UI in `client.js`
2. **Use activation properly**: Constructor for structure, activate for interaction
3. **Leverage binding**: Let the binding system handle DOM updates
4. **Publish APIs**: Use `server.publish()` for backend functionality
5. **Handle errors**: Both server and client should handle errors gracefully

## Learning Path

1. Start with **counter** - Simplest example of server-side rendering
2. Move to **user-form** - Adds server validation
3. Explore **data-grid** - Shows data loading and client-side operations
4. Study **master-detail** - Demonstrates navigation patterns

## Additional Resources

- [jsgui3-server Documentation](https://github.com/metabench/jsgui3-server)
- [jsgui3-html Main Examples](../examples/README.md)
- [Data Binding Guide](../html-core/DATA_BINDING.md)
- [Quick Start Guide](../EXAMPLES_AND_TESTS.md)

## Contributing

When adding new dev examples:
1. Follow the client.js + server.js structure
2. Include a README.md explaining the example
3. Demonstrate a specific pattern or feature
4. Keep examples focused and well-commented
5. Test that server-side rendering works correctly

## Questions?

- For jsgui3-html questions: See main project README
- For jsgui3-server questions: See [jsgui3-server repo](https://github.com/metabench/jsgui3-server)
- For binding system questions: See [DATA_BINDING.md](../html-core/DATA_BINDING.md)
