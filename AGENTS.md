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
5.  **Adaptive PR Checklist:** For responsive/multi-device Tier 1 control upgrades, use `.github/pull_request_template_adaptive_tier1.md` and the book at `docs/books/adaptive-control-improvements/`.

## Knowledge & Memory Architecture

This project uses a **dual-memory model** so that knowledge is accessible to all agents, not just one tool.

### Project Memory (Repo-Local) — ALL agents read this

| Location | Purpose |
|----------|---------|
| `AGENTS.md` | Universal conventions, testing patterns, coding style |
| `docs/agi/LESSONS.md` | Accumulated project-specific lessons and gotchas |
| `docs/agi/INDEX.md` | Knowledge hub — start here for navigation |
| `docs/sessions/` | Durable session records with progress and outcomes |
| Path-local `AGENT.md` | Subsystem-specific guides (see table below) |

### Cross-Repo Memory (Antigravity) — spans all projects

Location: `C:\Users\james\.gemini\antigravity\knowledge\`
- Contains distilled cross-project knowledge (e.g., Puppeteer tips, Node.js patterns)
- Antigravity reads natively; **VS Code agents can also read** from this directory
- Structure: `<topic-slug>/metadata.json` (summary) + `artifacts/` (details)

### Path-Local Agent Guides

| Path | Scope |
|------|-------|
| [controls/organised/AGENT.md](controls/organised/AGENT.md) | Control creation, naming, testing, theming |

### What Goes Where?

| Knowledge | Repo-local | Antigravity KIs |
|-----------|-----------|-----------------|
| Project conventions | ✅ `AGENTS.md` | ❌ |
| Project lessons | ✅ `docs/agi/LESSONS.md` | ❌ |
| Session progress | ✅ `docs/sessions/` | Optional (for quick continuity) |
| Cross-repo patterns | ✅ Dual-write to `LESSONS.md` | ✅ Antigravity KIs |
| Subsystem context | ✅ Path-local `AGENT.md` | ❌ |

### For Agents: When You Learn Something

1. **Project-specific** → write to `docs/agi/LESSONS.md`
2. **Cross-repo useful** → also write to Antigravity lessons (if available) or note in `docs/agi/LESSONS.md` with a `[CROSS-REPO]` tag
3. **Subsystem-specific** → update the relevant path-local `AGENT.md`

### Agent Role System (MCP)

Agents can adopt specialised personas from the `copilot-dl-news` agent library via the `adopt_agent` MCP tool:

- **Config**: `.agent/agent-roles.json` — curated roster of available agent roles
- **Tool**: `adopt_agent` (in `tools/ui/quick-picker/mcp-server.js`) — shows Electron picker, returns selected agent's full `.agent.md` content
- **UI**: WLILO-themed Electron picker with agent cards (emoji, title, purpose, tags)
- **Usage**: Call `adopt_agent` → user picks a role → agent receives full role definition and follows its directives

Available roles are cross-referenced from `copilot-dl-news/.github/agents/index.json` for metadata. Edit `.agent/agent-roles.json` to add/remove agents from the roster.

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

### E2E Tests with Puppeteer — MANDATORY for Interactive Controls

**Every interactive control MUST have thorough E2E tests** that exercise client-side behavior,
not just static HTML rendering. Controls in this project use Server-Side Rendering (SSR) with
client-side activation — meaning the HTML is built on the server but interactive behavior only
works after activation scripts run in the browser. **You cannot test interactive behavior with
Node.js-only checks** — you must use Puppeteer to verify clicks, keyboard navigation, ARIA
updates, CSS state changes, and content transitions in a real browser.

### What E2E Tests MUST Cover

For every interactive control, test **all of these categories**:

| Category | What to test | Example assertions |
|----------|--------------|--------------------|
| **Static rendering** | Elements exist, correct count, correct text | `assert(labels.length === 3)` |
| **Click interactions** | Click triggers state change, correct panel shows | Click label → verify `input.checked`, verify page `display !== 'none'` |
| **Keyboard navigation** | Arrow keys, Enter, Escape, Tab | Press ArrowRight → verify next tab activates |
| **ARIA attributes** | `aria-selected`, `aria-hidden`, `aria-expanded`, `role` | After click: `aria-selected="true"` on new, `"false"` on old |
| **CSS visual state** | Active indicator, hover styles, transitions | `borderBottomColor !== 'transparent'` on checked tab |
| **Content isolation** | Switching shows correct content, hides others | Click tab 2 → visible page has tab 2 content, tab 1 page is `display:none` |
| **Edge cases** | Wrap-around, rapid clicks, empty states | ArrowRight on last tab → wraps to first |

### Self-Contained E2E Test Pattern

Each E2E test file should be **self-contained**: it builds a test page, starts an HTTP server,
runs Puppeteer tests, captures screenshots, and shuts everything down. This avoids test ordering
dependencies and makes tests independently runnable.

```javascript
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

const PORT = 4477; // Use a unique port per test file
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// 1. Build the test page with SSR controls + client-side activation script
function build_page() {
    const jsgui = require('../html-core/html-core');
    const { My_Control } = require('../controls/controls');
    const ctx = new jsgui.Page_Context();

    const ctrl = new My_Control({ context: ctx, /* options */ });

    return `<!DOCTYPE html>
<html><head><style>${My_Control.css || ''}</style></head>
<body>
    <div id="test-section">${ctrl.html}</div>
    <script>
        // CLIENT-SIDE ACTIVATION — this is critical for testing interactive behavior.
        // Without this, the server-rendered HTML is static and won't respond to events.
        document.querySelectorAll('.my-control').forEach(el => {
            // Add event listeners that mirror what activate() does
            el.addEventListener('click', () => { /* ... */ });
        });
    </script>
</body></html>`;
}

// 2. Start server, run tests, capture screenshots, shut down
async function run_tests() {
    const html = build_page();
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });
    await new Promise(r => server.listen(PORT, r));

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });

    let passed = 0, failed = 0;
    const results = [];
    function assert(cond, name) {
        if (cond) { passed++; results.push(`  ✓ ${name}`); }
        else      { failed++; results.push(`  ✗ ${name}`); }
    }

    // ── Static rendering checks ──────────────────────────────────
    const container = await page.$('#test-section .my-control');
    assert(!!container, 'Control renders');

    // ── Interactive click test ───────────────────────────────────
    const button = (await page.$$('.my-control .clickable'))[0];
    await button.click();
    await delay(200); // Allow time for event handlers + DOM updates
    const result = await page.$eval('.my-control .output', el => el.textContent);
    assert(result === 'expected', 'Click produces correct output');

    // ── Keyboard test ────────────────────────────────────────────
    await button.focus();
    await page.keyboard.press('ArrowRight');
    await delay(200);
    // Verify keyboard navigation changed state...

    // ── Screenshot for visual verification ───────────────────────
    await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'my-control-test.png'),
        fullPage: true
    });

    // ── Print results ────────────────────────────────────────────
    console.log('\n━━━ RESULTS ━━━\n');
    results.forEach(r => console.log(r));
    console.log(`\n  ${passed} passed, ${failed} failed`);
    console.log(failed === 0 ? '\n=== ALL PASS ✓ ===' : '\n=== FAILURES ✗ ===');

    await browser.close();
    server.close();
    process.exit(failed > 0 ? 1 : 0);
}

run_tests().catch(err => { console.error('Fatal:', err); process.exit(1); });
```

### Puppeteer 24 Compatibility Notes

- **No `page.waitForTimeout()`** — use `const delay = ms => new Promise(r => setTimeout(r, ms))` instead
- **Use `$$eval` with array indexing** instead of `:nth-of-type()` CSS selectors for mixed DOM siblings
- **Use `page.$eval` / `page.$$eval`** for computed styles: `await page.$$eval('.el', els => getComputedStyle(els[0]).display)`

### Key Reference Implementation

See `tmp/tabbed-panel-e2e.js` for a complete 37-assertion E2E test covering:
- String tabs, icon tabs, badge tabs
- Click-based tab switching with panel visibility verification
- ARIA attribute sync (`aria-selected`, `aria-hidden`)
- Keyboard navigation (ArrowRight/Left/Down) across horizontal and vertical variants
- CSS active indicator verification via computed styles
- Content isolation between tab panels
- 4 automated screenshots
```

## Command Safety — Auto-Run Rules

**Agents MUST auto-run safe commands** (`SafeToAutoRun: true`) to avoid unnecessary permission prompts. Only commands with destructive side-effects should require approval.

### Always Safe to Auto-Run ✅

These commands are **non-destructive and MUST set `SafeToAutoRun: true`**:

| Category | Examples |
|----------|----------|
| **Run scripts** | `node tmp/check.js`, `node tmp/ui-tests.js`, `node tmp/test-server.js` |
| **Run tests** | `npx jest test/...`, `npx mocha test/...`, `node test/...` |
| **View output** | `type <file>`, `Get-Content <file>`, `cat <file>` |
| **List files** | `dir`, `ls`, `Get-ChildItem`, `tree` |
| **Git read-only** | `git status`, `git log -n 5`, `git diff`, `git branch` |
| **Check ports** | `Get-NetTCPConnection -LocalPort <port>` |
| **Process listing** | `Get-Process -Name node` |
| **Node verification** | `node -e "console.log('ok')"`, `node --version` |

### Requires Approval ❌

Only these categories should ever set `SafeToAutoRun: false`:

- **Installing packages** — `npm install`, `npm link`, `npx -y create-*`
- **Deleting files** — `Remove-Item`, `del`, `rm`
- **Killing processes** — `Stop-Process`, `taskkill`
- **Git mutations** — `git add`, `git commit`, `git push`, `git checkout`
- **System-level changes** — `setx`, registry edits, environment variable changes
- **Network requests** — `Invoke-WebRequest`, `curl`, `wget` (unless localhost)

### Verification Pattern (preferred)

Write a throwaway check file, then auto-run it:

```javascript
// Agent writes tmp/check.js, then runs: node tmp/check.js (SafeToAutoRun: true)
const jsgui = require('../html-core/html-core');
const MyControl = require('../controls/organised/.../my_control');
const ctx = new jsgui.Page_Context();
const checks = [];
function ok(label, val) { checks.push({label, pass: !!val}); }

ok('Has class', new MyControl({ context: ctx }).html.includes('my-class'));

checks.forEach(c => console.log((c.pass ? '  ✓' : '  ✗') + ' ' + c.label));
const all = checks.every(c => c.pass);
console.log(all ? '\n=== ALL PASS ✓ ===' : '\n=== SOME FAILED ✗ ===');
process.exit(all ? 0 : 1);
```

### Starting Servers

**Starting a server** is safe to auto-run when it's a dev/test server on a local port:

```powershell
# ✅ Safe to auto-run
node tmp/test-server.js
node tools/sprint-tracker/tracker_server.js
```

**Stopping a server** (killing processes) requires approval.

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
