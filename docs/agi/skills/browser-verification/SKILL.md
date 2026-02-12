# Skill: browser-verification

## Scope
Use browser subagents to verify UI rendering, capture evidence, and document visual results.

**Does:**
- Launch demo servers and verify they're running
- Navigate browser to check rendered output
- Capture screenshots and recordings for documentation
- Inspect DOM structure and CSS computed styles
- Verify console for errors

**Does Not:**
- Replace unit tests (use both)
- Handle complex user interaction flows (see e2e testing)

## Why Browser Verification?

Server-side rendering (SSR) in jsgui3 produces HTML that may look correct as strings but render incorrectly in browsers due to:
- Missing CSS
- Incorrect attribute values (NaN, undefined)
- Style attribute format issues
- Layout problems

Browser verification catches issues that unit tests miss.

For detailed operational procedures, see **[Browser Automation Workflow](../../workflows/browser_automation.md)**.

## Common Pitfalls (Activation)
Server-side rendered HTML may appear correct but be **inert** (non-interactive) if the client-side JavaScript is not properly bundled and served. Always verify interactivity (clicking, typing) not just visual presence.

## Procedure

### 1. Create a Demo Server
Create a simple HTTP server that renders the component:

```javascript
// lab/<component>_demo_server.js
const http = require('http');
const jsgui = require('../html-core/html-core');
const { MyComponent } = require('../controls/<component>');

const PORT = 3456;

function create_demo_html() {
    const context = new jsgui.Page_Context();
    const component = new MyComponent({ context, ...options });
    return `<!DOCTYPE html>
<html>
<head><style>${MyComponent.css || ''}</style></head>
<body>${component.all_html_render()}</body>
</html>`;
}

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(create_demo_html());
}).listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
```

### 2. Start the Server
```bash
node lab/<component>_demo_server.js
```

Verify the server starts without errors.

### 3. Use Browser Subagent
Call the browser subagent with a clear task:

```
Navigate to http://localhost:<port> and verify:
1. Page loads without errors
2. Component renders visibly (not empty/blank)
3. Expected elements present (bars, paths, etc.)
4. No console errors
5. Take screenshot for documentation
```

### 4. Interpret Results
The subagent will report:
- Connection success/failure
- DOM inspection results
- Console log contents
- Screenshot paths

### 5. Debug Common Issues

**Server Connection Refused:**
- Check server crashed (view command status)
- Fix code errors and restart

**Elements Missing or Wrong:**
- Check HTML output with Node.js first
- Verify attributes are present and valid (not NaN)

**Styles Not Applying:**
- Check CSS is included in page
- Verify style attribute format (string vs object)

### 6. Capture Evidence
Save screenshots and recordings to artifacts directory:
- `<component>_demo_1234567890.png`
- `<component>_recording_1234567890.webp`

Embed in walkthrough:
```markdown
![Component Demo](file:///path/to/screenshot.png)
```

## Real Example: Chart Legend Fix

**Problem**: Legend swatches (colored squares) were invisible.

**Debug Process**:
1. Started chart_demo_server.js
2. Browser subagent navigated to localhost:3456
3. Subagent inspected `.legend-swatch` elements
4. Found `background-color: rgba(0,0,0,0)` - transparent!
5. Root cause: `style = { object }` instead of `style = "string"`

**Fix**: Changed to template literal:
```javascript
swatch.dom.attributes.style = `background-color: ${color}`;
```

**Verification**: Browser subagent confirmed colored swatches visible.

## Validation Checklist
- [ ] Demo server starts without errors
- [ ] Browser can connect to server
- [ ] Component renders visibly
- [ ] No console errors
- [ ] Screenshot captured for documentation
- [ ] Known issues identified and logged

## References
- [lab/chart_demo_server.js](file:///c:/Users/james/Documents/repos/jsgui3-html/lab/chart_demo_server.js) - Example demo server
- [lab/function_graph_demo_server.js](file:///c:/Users/james/Documents/repos/jsgui3-html/lab/function_graph_demo_server.js) - Presentation-quality demo
