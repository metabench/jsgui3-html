# Simple Counter Example with Server-Side Rendering

This example demonstrates the most basic server-side rendering pattern with client-side hydration using jsgui3-html and jsgui3-server.

## What It Demonstrates

1. **Server-Side Rendering**: The counter UI is rendered to HTML on the server
2. **Client-Side Hydration**: JavaScript activates the rendered HTML in the browser
3. **MVVM Data Binding**: Display automatically updates when model changes
4. **Computed Properties**: Even/odd styling updates automatically
5. **Event Handling**: Button clicks modify the model
6. **Isomorphic Code**: Same code runs on server and client

## Running the Example

```bash
# From jsgui3-html root directory
node dev-examples/binding/counter/server.js

# Or from this directory
node server.js
```

Then open: `http://localhost:52000`

## File Structure

- **client.js**: Defines the Counter control and Demo_UI (runs on both server and client)
- **server.js**: Configures and starts the jsgui3-server
- **README.md**: This file

## How It Works

### Step 1: Server Startup
```javascript
const server = new Server({
    Ctrl: Demo_UI,                              // Control to render
    src_path_client_js: require.resolve('./client.js')  // Client bundle
});

server.on('ready', () => {
    server.start(52000);  // Start HTTP server
});
```

### Step 2: Server-Side Rendering
When a browser requests the page:
1. Server creates `Demo_UI` instance
2. Calls `constructor()` - builds UI structure
3. Calls `all_html_render()` - generates HTML
4. Includes client JavaScript bundle
5. Sends complete HTML to browser

### Step 3: Client-Side Hydration
When browser loads the page:
1. Parses HTML and displays content (already visible!)
2. Loads and executes client JavaScript bundle
3. Creates `Demo_UI` instance with `el` option (attaches to existing DOM)
4. Calls `activate()` - attaches event handlers
5. Page becomes interactive

### Key Concepts

#### Constructor vs Activate
```javascript
class Counter extends Control {
    constructor(spec = {}) {
        // Runs on BOTH server and client
        super(spec);
        
        // Create model
        this.model = new Data_Object({ count: 0 });
        
        // Build UI structure
        this.add(button);
        
        // Set up data binding
        this.bind('count', this.model, {...}, display);
    }
    
    activate() {
        // Only runs on CLIENT
        if (!this.__active) {
            super.activate();
            
            // Attach event handlers
            button.on('click', () => {
                this.model.set('count', current + 1);
            });
        }
    }
}
```

#### Data Binding
```javascript
// Binding definition (works on both server and client)
this.bind('count', this.model, {
    toView: (value) => `Count: ${value}`
}, display);

// On server: Renders initial value into HTML
// On client: Updates DOM when model.set('count', newValue) is called
```

#### Computed Properties
```javascript
// Automatically recalculates when count changes
this.computed(() => {
    const count = this.model.get('count');
    return count % 2 === 0 ? 'even' : 'odd';
}, (parity) => {
    display.add_class(parity);
});
```

## What You'll See

1. **Initial Load**: Counter displays "Count: 0" (rendered on server)
2. **Click +**: Count increases to 1, display updates, color changes to pink (odd)
3. **Click +**: Count increases to 2, display updates, color changes to blue (even)
4. **Click −**: Count decreases, display and color update
5. **Click Reset**: Count returns to 0

## Benefits of Server-Side Rendering

1. **Fast First Paint**: HTML visible immediately, no JavaScript required
2. **SEO Friendly**: Search engines see complete content
3. **Progressive Enhancement**: Works without JavaScript (though not interactive)
4. **Better UX**: No flash of unstyled content
5. **Shared Code**: Same control definition runs on server and client

## Differences from Standalone Example

The standalone example (`examples/binding_simple_counter.js`):
- Runs in Node.js without a browser
- Demonstrates the binding API
- Single file, no server configuration
- Used for learning and testing

This dev example:
- Runs a real web server
- Requires a browser
- Shows production-like patterns
- Split into client.js and server.js
- Demonstrates isomorphic rendering

## Next Steps

Try these modifications to learn more:

1. **Change Initial Count**: In `client.js`, change `initialCount: 0` to `initialCount: 10`
2. **Add More Buttons**: Create buttons for +5, +10, etc.
3. **Add Input Field**: Let users enter a number directly
4. **Persist State**: Use localStorage to save count between page loads
5. **Add Animation**: Use CSS transitions when count changes

## See Also

- [User Form Example](../user-form/) - Adds server-side validation
- [Data Grid Example](../data-grid/) - Server-provided data
- [Data Binding Guide](../../../html-core/DATA_BINDING.md) - Complete API reference
