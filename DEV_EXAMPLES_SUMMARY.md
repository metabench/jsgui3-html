# Dev-Only Examples Summary

This document summarizes the server-integrated examples created to demonstrate jsgui3-html client-side functionality in a realistic isomorphic context.

## What Was Created

### 1. Infrastructure Setup

- **package.json**: Added `jsgui3-server: ^0.0.31` to devDependencies
- **dev-examples/README.md**: Comprehensive guide (200+ lines)
  - How to run examples
  - Key patterns explained
  - Differences from standalone examples
  - Best practices and debugging

### 2. Counter Example (`dev-examples/binding/counter/`)

**Files Created:**
- `client.js` (250+ lines) - Counter control with MVVM binding
- `server.js` (50+ lines) - Server configuration
- `README.md` (180+ lines) - Complete documentation

**Demonstrates:**
- Basic server-side rendering + client-side activation
- Two-way data binding
- Computed properties (even/odd styling)
- Event handling in isomorphic context
- Constructor vs activate pattern

**Run:** `node dev-examples/binding/counter/server.js`  
**URL:** `http://localhost:52000`

### 3. User Form Example (`dev-examples/binding/user-form/`)

**Files Created:**
- `client.js` (450+ lines) - Form with comprehensive validation
- `server.js` (120+ lines) - Server with validation APIs
- `README.md` (200+ lines) - Complete documentation

**Demonstrates:**
- Form field binding with transformations
- Client-side validation (on blur)
- Server-side validation via API
- Email blacklist checking
- Duplicate detection
- Async form submission
- Data/View model separation
- Error display system

**Run:** `node dev-examples/binding/user-form/server.js`  
**URL:** `http://localhost:52001`

**API Endpoints:**
- `POST /api/validateUser` - Validate form data
- `POST /api/register` - Register new user
- `GET /api/getUsers` - List registered users (debug)

## Architecture Patterns

### Server-Side Rendering + Client-Side Activation

```
Server Process:
1. Receive HTTP request
2. Create Control instance
3. Call constructor() - builds UI
4. Render to HTML string
5. Bundle client JavaScript
6. Send HTML + JS to browser

Client Process:
1. Parse and display HTML (fast!)
2. Load JavaScript bundle
3. Create Control instance with el option
4. Call constructor() - attaches to DOM
5. Call activate() - adds interactivity
6. Page is now fully interactive
```

### Progressive Enhancement (Activation)

The progressive example demonstrates activation tiers for native inputs:

1. Tier 0: plain native inputs without activation
2. Tier 1: native inputs styled with CSS tokens
3. Tier 2: activated native inputs using swap registration
4. Mixed: `.jsgui-form` activation with `.jsgui-no-enhance` opt-out

### Isomorphic Control Pattern

```javascript
class MyControl extends Control {
    constructor(spec = {}) {
        // Runs on BOTH server and client
        super(spec);
        
        // Create model
        this.model = new Data_Object({...});
        
        // Build UI structure
        this.add(childControls);
        
        // Set up data binding
        this.bind(...);
    }
    
    activate() {
        // Only runs on CLIENT
        if (!this.__active) {
            super.activate();
            
            // Attach event handlers
            this.button.on('click', () => {...});
        }
    }
}
```

### API Publishing with server.publish()

```javascript
server.on('ready', () => {
    // Automatic JSON/text response based on return type
    server.publish('myFunction', (input) => {
        // Process input
        return { result: 'data' }; // Becomes application/json
    });
    
    // Available at /api/myFunction
    server.start(port);
});
```

## Benefits for AI Agents

These examples provide:

1. **Realistic Patterns**: Production-like server setup
2. **Complete Context**: Server + client code together
3. **API Integration**: How to connect frontend to backend
4. **Validation Examples**: Both client and server-side
5. **State Management**: Data model + view model patterns
6. **Async Operations**: Loading states, error handling
7. **Best Practices**: Proper separation of concerns

## Comparison: Standalone vs Dev Examples

| Aspect | Standalone (`examples/`) | Dev (`dev-examples/`) |
|--------|-------------------------|----------------------|
| Dependencies | None | jsgui3-server |
| Files | Single .js file | client.js + server.js |
| Execution | `node example.js` | `node server.js` + browser |
| Purpose | API demonstration | Isomorphic patterns |
| Rendering | Client-side only | Server + client |
| Real Browser | No | Yes |
| Network Requests | No | Yes |
| URL Access | No | Yes (http://localhost) |
| Production-like | No | Yes |

## Key Concepts Demonstrated

### 1. Constructor vs Activate

- **Constructor**: Runs on both server and client, defines structure
- **Activate**: Runs only on client, adds interactivity

### 2. Data Binding

- Declarative connection between model and view
- Automatic updates when model changes
- Transformations during model ↔ view conversion

### 3. Computed Properties

- Automatically recalculate when dependencies change
- Used for derived state (e.g., form validity)

### 4. View Model Pattern

- Separate data (user data) from UI state (errors, loading)
- Cleaner code organization
- Easier testing

### 5. Server APIs

- Published as HTTP endpoints via `server.publish()`
- Automatic JSON/text serialization
- Simple async/await pattern

## Development Workflow

1. **Edit client.js** - Modify UI or logic
2. **Restart server** - Rebuilds client bundle
3. **Refresh browser** - See changes
4. **Check console** - View logs from server and client

## Testing Scenarios

### Counter Example

```bash
# Start server
node dev-examples/binding/counter/server.js

# Open browser
# Click buttons
# Observe reactive updates
# Check computed styling (even/odd)
```

### Form Example

```bash
# Start server
node dev-examples/binding/user-form/server.js

# Test cases:
✓ Valid submission - All fields correct
❌ Empty fields - Required validation
❌ Invalid email - Format validation  
❌ Blacklisted email - Server validation
❌ Duplicate email - Database check
❌ Invalid URL - Format validation

# Debug API:
curl http://localhost:52001/api/getUsers
```

## Future Examples (Planned)

### Data Grid with Server Data
- Server-provided dataset
- Client-side sorting/filtering
- Pagination
- Real-time updates

### Master-Detail Navigation
- Client-side routing
- Server-side rendering per route
- Navigation patterns
- State preservation

## Integration Examples

### With Database
```javascript
server.publish('getUsers', async () => {
    const users = await db.collection('users').find().toArray();
    return users;
});
```

### With Authentication
```javascript
server.on('ready', () => {
    server.app.use(authMiddleware);
    server.publish('protectedRoute', (data) => {
        // Only accessible when authenticated
    });
});
```

### With WebSockets
```javascript
server.on('ready', () => {
    const io = require('socket.io')(server.httpServer);
    io.on('connection', (socket) => {
        // Real-time communication
    });
});
```

## Documentation Structure

```
dev-examples/
├── README.md (main guide)
├── binding/
│   ├── counter/
│   │   ├── client.js
│   │   ├── server.js
│   │   └── README.md
│   └── user-form/
│       ├── client.js
│       ├── server.js
│       └── README.md
```

Each example includes:
- Complete working code
- Inline comments
- Dedicated README
- Usage instructions
- Test scenarios
- Customization ideas

## Technical Details

### Package Changes
```json
{
  "devDependencies": {
    "esbuild": "^0.25.10",
    "jsgui3-server": "^0.0.31"  // Added
  }
}
```

### Example Ports
- Counter: 52000
- User Form: 52001
- Data Grid: 52002 (planned)
- Master-Detail: 52003 (planned)

### File Sizes
- dev-examples/README.md: ~10 KB
- Counter example total: ~25 KB
- User Form example total: ~35 KB
- Total documentation: ~70 KB

## Learning Path

**For Beginners:**
1. Start with standalone examples (`examples/`)
2. Learn binding API without server complexity
3. Move to counter dev example
4. Understand server-side rendering

**For Intermediate:**
1. Study user form example
2. Learn validation patterns
3. Understand API integration
4. Explore data/view model separation

**For Advanced:**
1. Extend examples with database
2. Add authentication
3. Implement real-time features
4. Deploy to production

## AI Agent Benefits

These examples help AI agents:

1. **Understand Patterns**: Complete, realistic code
2. **Generate Code**: Reference implementations
3. **Debug Issues**: Working examples to compare
4. **Learn Best Practices**: Production-quality code
5. **Suggest Improvements**: Based on established patterns

## Maintenance Notes

- Keep jsgui3-server version in sync with jsgui3-html
- Update examples when breaking changes occur
- Add more examples as features are added
- Keep documentation comprehensive
- Test examples with each release

## Success Metrics

✅ Examples run without errors  
✅ Documentation is comprehensive  
✅ Patterns are production-ready  
✅ Code is well-commented  
✅ Learning path is clear  
✅ API integration works  
✅ Validation demonstrates best practices  

## Resources

- [jsgui3-html Repository](https://github.com/metabench/jsgui3-html)
- [jsgui3-server Repository](https://github.com/metabench/jsgui3-server)
- [Data Binding Guide](../html-core/DATA_BINDING.md)
- [Examples Guide](../EXAMPLES_AND_TESTS.md)

## Contributing

To add new dev examples:

1. Create directory: `dev-examples/<category>/<name>/`
2. Add `client.js` (UI definition)
3. Add `server.js` (server setup + APIs)
4. Add `README.md` (comprehensive docs)
5. Use next available port (520XX)
6. Update main dev-examples/README.md
7. Test thoroughly
8. Submit PR with all files

## Questions?

- Main examples: See `examples/README.md`
- Data binding: See `html-core/DATA_BINDING.md`
- Server setup: See `dev-examples/README.md`
- Quick start: See `EXAMPLES_AND_TESTS.md`
