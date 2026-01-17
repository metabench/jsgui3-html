# Skill: autonomous-ui-inspection

## Scope
Use this skill for **reliable, agent-friendly UI inspection**:
- Visual: Screenshots via browser tools.
- Numeric: Bounding boxes, styles, overflow detection.

**Does:**
- Capture screenshots of rendered UI.
- Extract layout metrics for validation.
- Provide evidence for UI changes.

**Does Not:**
- Make styling changes (that's a separate task).
- Run full E2E test suites.

## Inputs
- URL or HTML file path.
- "Ready" selector (e.g., `.control-loaded`).
- Viewport size (default: 1280x800).

## Procedure

### A) Visual Inspection (Browser Tool)

1. **Start server** (if needed):
   ```bash
   npm run dev
   ```

2. **Navigate to URL** using browser subagent.

3. **Capture screenshot**:
   - Full page for baseline.
   - Clipped to specific element if needed.

### B) Numeric Inspection (Script)

Create/run a Puppeteer script:

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/control-demo');
  
  // Wait for ready
  await page.waitForSelector('.control-loaded');
  
  // Get metrics
  const metrics = await page.evaluate(() => {
    const el = document.querySelector('.my-control');
    const rect = el.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      isOverflowing: el.scrollWidth > el.clientWidth
    };
  });
  
  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})();
```

### C) Using ui-pick for Inspection Results

After inspection, present findings to user:
```bash
node tools/dev/ui-pick.js "Looks correct" "Needs adjustment" --theme=wlilo
```

## Validation
- Screenshot captured and saved.
- Numeric metrics match expected values.
- No console errors during render.

## References
- [Browser Subagent](file:///c:/Users/james/Documents/repos/jsgui3-html/tools/dev/ui-pick.js)
- [lab-experimentation skill](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/agi/skills/lab-experimentation/SKILL.md)
