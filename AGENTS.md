# 🧠 AGI Singularity & jsgui3-html

**Current Mode:** Antigravity Harmonization
**Knowledge Hub:** [`docs/agi/INDEX.md`](docs/agi/INDEX.md)
**Self Model:** [`docs/agi/SELF_MODEL.md`](docs/agi/SELF_MODEL.md)
**Interaction Tool:** `tools/dev/ui-pick.js`

## Core Directives for Agents
1.  **Docs First:** Before starting work, read `docs/agi/INDEX.md` and `docs/sessions/SESSIONS_HUB.md`.
2.  **Session Discipline:** Follow the [`session-discipline`](docs/agi/skills/session-discipline/SKILL.md) skill. Use templates from `docs/sessions/_templates/`.
3.  **UI Decisions:** Use `node tools/dev/ui-pick.js` when you need to ask the user a choice (A vs B).
4.  **Self-Correction:** If you find a pattern, document it in `docs/agi/PATTERNS.md`.

---

# Guidelines for AI Agents Working with jsgui3-html

This document provides guidelines for AI agents (like GitHub Copilot, ChatGPT, Claude, etc.) when contributing to or working with the jsgui3-html codebase.

## Naming Conventions

**IMPORTANT:** This project uses specific naming conventions that must be followed:

### JavaScript Variables and Methods
- Use **snake_case** for variables, methods, and functions
- Use **Camel_Case** (with underscores) for class names

### Examples:

```javascript
// ✅ CORRECT
class Form_Field extends Control {
    constructor(options = {}) {
        super(options);
        this.field_name = options.field_name;
        this.input_type = options.input_type;
    }
    
    set_value(value) {
        this.current_value = value;
    }
    
    get_value() {
        return this.current_value;
    }
}

const form_field = new Form_Field({
    field_name: 'email',
    input_type: 'email'
});

// ❌ INCORRECT - DO NOT USE
class FormField extends Control {
    constructor(options = {}) {
        super(options);
        this.fieldName = options.fieldName;  // Wrong: camelCase
        this.inputType = options.inputType;  // Wrong: camelCase
    }
    
    setValue(value) {  // Wrong: camelCase
        this.currentValue = value;
    }
}
```

### File Names
- Use **snake_case** for file names
- Examples:
  - ✅ `form_field.js`
  - ✅ `property_editor.js`
  - ✅ `data_model_view_model_control.js`
  - ❌ `formField.js`
  - ❌ `propertyEditor.js`

### CSS Classes
- Use **kebab-case** for CSS class names
- Examples:
  - ✅ `form-field`
  - ✅ `property-editor`
  - ✅ `counter-display`

### Constants
- Use **SCREAMING_SNAKE_CASE** for constants
- Examples:
  - ✅ `MAX_HISTORY_SIZE`
  - ✅ `DEFAULT_PORT`

## Architectural Patterns

### Isomorphic Controls

All controls must work on both server and client:

```javascript
class My_Control extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'my_control';
        super(spec);
        
        const { context } = this;
        
        // This runs on BOTH server and client
        // Build UI structure here
        this._create_ui(context);
    }
    
    activate() {
        // This runs ONLY on client
        if (!this.__active) {
            super.activate();
            
            // Add event listeners here
            this._attach_events();
        }
    }
    
    _create_ui(context) {
        // Build structure (runs on both)
        this.display = new Control({ context });
        this.add(this.display);
    }
    
    _attach_events() {
        // Client-only event handling
        this.display.on('click', () => {
            // Handle click
        });
    }
}
```

### MVVM Pattern

Use `Data_Model_View_Model_Control` for data-bound controls:

```javascript
const { Data_Object } = require('lang-tools');

class My_Data_Control extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'my_data_control';
        super(spec);
        
        const { context } = this;
        
        // Create model with Data_Object
        this.model = new Data_Object({
            property_name: initial_value
        });
        
        // Bind model to view
        this.bind('property_name', this.model, {
            toView: (value) => `Display: ${value}`
        }, display_control);
        
        // Computed properties
        this.computed(
            this.model,
            ['property_name'],
            (value) => value * 2,
            { propertyName: 'computed_property' }
        );
        
        // Watch for changes
        this.watch(this.model, 'computed_property', (new_val) => {
            console.log('Changed:', new_val);
        });
    }
}
```

### Server-Side Rendering Guards

Always guard DOM element access for server compatibility:

```javascript
// ✅ CORRECT
if (this.input.dom.el) {
    this.input.dom.el.value = initial_value;
}

// ✅ CORRECT
if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handler);
}

// ❌ INCORRECT - Will crash on server
this.input.dom.el.value = initial_value;
```

## Code Organization

### Directory Structure

```
controls/
├── organised/
│   ├── 0-core/
│   │   ├── 0-basic/
│   │   │   ├── 0-native-compositional/  # Native elements
│   │   │   └── 1-compositional/         # Composed controls
│   │   └── 1-advanced/                  # Advanced features
│   └── 1-standard/
│       ├── 1-editor/                    # Form/editing controls
│       ├── 5-ui/                        # UI components
│       └── 6-layout/                    # Layout controls
```

### Control Exports

All controls must be exported from `controls/controls.js`:

```javascript
const controls = {
    My_Control: require('./organised/1-standard/5-ui/my_control'),
    // ... other controls
}

module.exports = controls;
```

## Vendor Dependencies

- Treat everything under `node_modules/` as read-only. Do not edit files in installed packages.
- Fix dependency issues by updating package versions, contributing upstream patches, or adding overrides, not by modifying vendor files directly.

## Testing Guidelines

### E2E Tests with Puppeteer

All interactive examples should have E2E tests:

```javascript
const puppeteer = require('puppeteer');

describe('My Control E2E', () => {
    let browser, page, server;
    
    before(async () => {
        // Start server
        server = await start_test_server(port);
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: true
        });
        
        page = await browser.newPage();
        await page.goto(`http://localhost:${port}`);
    });
    
    after(async () => {
        await browser.close();
        await server.close();
    });
    
    it('should test functionality', async () => {
        // Test implementation
        await page.click('.my-button');
        const text = await page.$eval('.display', el => el.textContent);
        expect(text).to.equal('Expected Text');
    });
});
```

## Documentation Requirements

### JSDoc Comments

All public methods should have JSDoc:

```javascript
/**
 * Set the field value
 * @param {*} value - The value to set
 */
set_value(value) {
    this.current_value = value;
}
```

### README Files

Each example should have:
- Feature list
- Quick start guide
- Code examples
- Architecture explanation
- Extension points

## Common Pitfalls

### 1. CamelCase Instead of snake_case
❌ `formField`, `getValue`, `myVariable`  
✅ `form_field`, `get_value`, `my_variable`

### 2. Accessing DOM on Server
❌ `this.input.dom.el.value = x` (without guard)  
✅ `if (this.input.dom.el) this.input.dom.el.value = x`

### 3. Client-Only Code in Constructor
❌ Adding event listeners in constructor  
✅ Adding event listeners in `activate()` method

### 4. Not Using Data_Object for Models
❌ `this.model = { count: 0 }`  
✅ `this.model = new Data_Object({ count: 0 })`

### 5. Not Calling super() in Subclasses
❌ Missing `super(spec)` call  
✅ Always call `super(spec)` first in constructor

## Workspace Hygiene

### Temporary & Diagnostic Files

**NEVER dump temporary files into the repo root.** This includes:
- Test output captures (`test_output*.txt`)
- Server/process logs (`server_output.log`, `server_error.log`)
- Diagnostic dumps (`diag_output.txt`, `debug_*.js`)
- Any file created solely for debugging or CI inspection

**Where to put them instead:**
1. **Prefer in-memory** — pipe output through `Select-String` or `grep` directly rather than writing to disk
2. **If you must write to disk**, use the OS temp directory (`$env:TEMP` on Windows, `/tmp` on Unix)
3. **Always clean up** — delete any temp files you create before finishing your task
4. **Use `.gitignore`** — if a new temp file pattern emerges, add it to `.gitignore` immediately

### Examples

```powershell
# ✅ CORRECT — filter output inline, no temp file
npx jest test/e2e/my.test.js --verbose 2>&1 | Select-String "FAIL|PASS|Tests:"

# ✅ CORRECT — write to OS temp dir if capture needed
npx jest test/e2e/my.test.js 2>&1 | Out-File "$env:TEMP\test_output.txt"

# ❌ WRONG — dumps into repo root
npx jest test/e2e/my.test.js 2>&1 | Out-File "test_output.txt"
```

### Debug Logging in Source

- Add `console.log` debug lines sparingly and **always remove them** before finishing the task
- Never leave `[DEBUG ...]` log prefixes in committed code

## Development Workflow

### Creating New Controls

1. Create file in appropriate directory with snake_case name
2. Use Camel_Case for class name
3. Implement constructor and activate() methods
4. Add to `controls/controls.js` exports
5. Write tests
6. Document in README

### Creating New Examples

1. Create directory under `dev-examples/`
2. Create `client.js` (with Camel_Case classes, snake_case methods)
3. Create `server.js` (follow existing patterns)
4. Create `styles.css` (optional)
5. Create `README.md` (required)
6. Write E2E tests
7. Update main README.md

## Code Review Checklist

Before submitting code, verify:

- [ ] All variables/methods use snake_case
- [ ] All class names use Camel_Case
- [ ] All file names use snake_case
- [ ] DOM access is guarded for server compatibility
- [ ] Event listeners only in activate()
- [ ] Data models use Data_Object
- [ ] JSDoc comments on public methods
- [ ] README documentation included
- [ ] E2E tests written and passing
- [ ] No console.log (use proper logging)
- [ ] Proper error handling

## Resources

- Main README: [README.md](README.md)
- Data Binding: [html-core/DATA_BINDING.md](html-core/DATA_BINDING.md)
- Examples: [dev-examples/README.md](dev-examples/README.md)
- MVVM: [MVVM.md](MVVM.md)
- Testing: [test/README.md](test/README.md)

## Questions?

When in doubt:
1. Look at existing code in `controls/organised/`
2. Check the examples in `examples/` and `dev-examples/`
3. Follow the patterns in `html-core/`
4. Refer to this guide

## Summary

**The #1 Rule: Use snake_case for everything except class names (use Camel_Case)**

This is not negotiable and is a core convention of the jsgui3-html codebase. All contributions must follow this pattern.
