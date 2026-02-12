# Chapter 16: Test Harness Specifications

> Chapter 15 defined the strategy. This chapter provides the  
> exact specifications for each test harness, fixture, and runner  
> needed to verify every control in jsgui3-html.

---

## 16.1 Harness 1: Control Gallery Server

The centrepiece of E2E testing. A local HTTP server that renders **any control in isolation** given its name and spec as URL parameters.

### Full Implementation

```javascript
// test/e2e/harness/gallery_server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const jsgui = require('../../../html-core/html-core');
const all_controls = require('../../../controls/controls');

const PORT = parseInt(process.env.GALLERY_PORT || '4444');

// Collect all static CSS files
const basic_css = fs.readFileSync(path.join(__dirname, '../../../css/basic.css'), 'utf8');
const enhanced_css = fs.readFileSync(path.join(__dirname, '../../../css/native-enhanced.css'), 'utf8');

function collect_control_css(ControlClass) {
    const css_parts = [];
    if (ControlClass.css) css_parts.push(ControlClass.css);
    // Walk prototype chain for inherited CSS
    let proto = Object.getPrototypeOf(ControlClass);
    while (proto && proto !== Function.prototype) {
        if (proto.css) css_parts.push(proto.css);
        proto = Object.getPrototypeOf(proto);
    }
    return css_parts.join('\n');
}

function render_control(control_name, spec, theme, viewport) {
    const ControlClass = all_controls[control_name];
    if (!ControlClass) return null;

    const context = jsgui.create_context();
    const ctrl = new ControlClass({ ...spec, context });
    const control_css = collect_control_css(ControlClass);
    const ctrl_html = ctrl.html;

    return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=${viewport.width}">
    <title>${control_name} – Gallery</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        ${basic_css}
        ${enhanced_css}
        ${control_css}

        * { box-sizing: border-box; }
        body {
            margin: 0; padding: 24px;
            font-family: Inter, system-ui, sans-serif;
            font-size: 14px;
            background: var(--theme-bg, #fff);
            color: var(--theme-text, #111);
        }
        /* Test isolation frame */
        #control-mount {
            position: relative;
            display: inline-block;
        }
        /* Visual debug grid */
        body.show-grid {
            background-image: linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px);
            background-size: 8px 8px;
        }
    </style>
</head>
<body class="${spec.__show_grid ? 'show-grid' : ''}">
    <div id="control-mount" data-testid="mount">
        ${ctrl_html}
    </div>
    <script>
        // Client-side activation
        (function() {
            // For controls that need activation in the browser
            window.__jsgui_gallery = { control: '${control_name}' };
        })();
    </script>
</body>
</html>`;
}

function render_gallery_index() {
    const names = Object.keys(all_controls).filter(k =>
        k !== 'experimental' && k !== 'deprecated' && typeof all_controls[k] === 'function'
    ).sort();

    return `<!DOCTYPE html>
<html><head><title>Control Gallery Index</title>
<style>
    body { font-family: Inter, sans-serif; max-width: 800px; margin: 40px auto; }
    a { display: block; padding: 4px 0; color: #4361ee; }
    h1 { color: #333; }
    .count { color: #999; }
</style></head>
<body>
    <h1>jsgui3-html Control Gallery</h1>
    <p class="count">${names.length} controls available</p>
    ${names.map(n => `<a href="/?control=${n}">${n}</a>`).join('\n')}
</body></html>`;
}

const server = http.createServer((req, res) => {
    try {
        const url = new URL(req.url, `http://localhost:${PORT}`);

        // Serve static CSS files
        if (url.pathname.startsWith('/css/')) {
            const file = path.join(__dirname, '../../..', url.pathname);
            if (fs.existsSync(file)) {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(fs.readFileSync(file));
                return;
            }
        }

        const control_name = url.searchParams.get('control');
        const theme = url.searchParams.get('theme') || 'light';
        const width = parseInt(url.searchParams.get('width') || '1280');
        const height = parseInt(url.searchParams.get('height') || '720');

        // Index page
        if (!control_name) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(render_gallery_index());
            return;
        }

        // Parse spec — supports both query param and POST body
        let spec = {};
        const spec_param = url.searchParams.get('spec');
        if (spec_param) {
            spec = JSON.parse(decodeURIComponent(spec_param));
        }

        const html = render_control(control_name, spec, theme, { width, height });
        if (!html) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`Unknown control: ${control_name}`);
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error: ${err.message}\n${err.stack}`);
    }
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Gallery server: http://localhost:${PORT}`);
        console.log(`Example: http://localhost:${PORT}/?control=Button&spec=${encodeURIComponent('{"text":"Hello"}')}`);
    });
}

module.exports = {
    start: (port) => new Promise(resolve => {
        server.listen(port || PORT, () => resolve(server));
    }),
    stop: () => new Promise(resolve => server.close(resolve))
};
```

### Usage from Playwright

```javascript
// playwright.config.js
module.exports = defineConfig({
    webServer: {
        command: 'node test/e2e/harness/gallery_server.js',
        port: 4444,
        reuseExistingServer: !process.env.CI
    }
});
```

---

## 16.2 Harness 2: Interaction Test Helpers

Standard helper functions for common test patterns:

```javascript
// test/e2e/harness/interactions.js

/**
 * Test all 5 interaction states of a control.
 * @param {Page} page - Playwright page
 * @param {string} selector - CSS selector for the control
 * @returns {Object} CSS properties for each state
 */
async function measure_interaction_states(page, selector) {
    const el = page.locator(selector);

    const get_styles = async () => el.evaluate(el => {
        const s = getComputedStyle(el);
        return {
            background: s.backgroundColor,
            border: s.borderColor,
            color: s.color,
            boxShadow: s.boxShadow,
            outline: s.outlineStyle,
            opacity: s.opacity,
            transform: s.transform,
            cursor: s.cursor
        };
    });

    // 1. Rest
    const rest = await get_styles();

    // 2. Hover
    await el.hover();
    await page.waitForTimeout(200);
    const hover = await get_styles();

    // 3. Active (mousedown)
    await el.dispatchEvent('mousedown');
    await page.waitForTimeout(50);
    const active = await get_styles();
    await el.dispatchEvent('mouseup');

    // 4. Focus (keyboard)
    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);
    const focus = await get_styles();

    // 5. Disabled (need to reload with disabled spec)
    // Not measured here — test separately with disabled spec

    return { rest, hover, active, focus };
}

/**
 * Test keyboard navigation within a composite control.
 */
async function test_keyboard_nav(page, container_selector, options = {}) {
    const {
        nav_keys = ['ArrowDown', 'ArrowUp'],
        select_key = 'Enter',
        expected_focus_count = 0,
        item_selector = '[role="option"], [role="tab"], [role="menuitem"]'
    } = options;

    const container = page.locator(container_selector);
    await container.focus();

    const results = [];

    for (const key of nav_keys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(100);

        const focused = await page.locator(`${container_selector} ${item_selector}:focus`).count();
        const active_desc = await container.getAttribute('aria-activedescendant');

        results.push({ key, focused_count: focused, active_descendant: active_desc });
    }

    return results;
}

/**
 * Test that a control's value can be set via keyboard typing.
 */
async function test_keyboard_input(page, input_selector, text, options = {}) {
    const { clear_first = true, submit_key = null } = options;

    const input = page.locator(input_selector);
    await input.focus();

    if (clear_first) {
        await input.fill('');
    }

    await input.type(text, { delay: 30 });

    if (submit_key) {
        await page.keyboard.press(submit_key);
    }

    const value = await input.inputValue();
    return { typed: text, result: value, match: value === text };
}

module.exports = {
    measure_interaction_states,
    test_keyboard_nav,
    test_keyboard_input
};
```

---

## 16.3 Harness 3: Theme Verification Suite

A dedicated test runner that verifies token application across themes:

```javascript
// test/e2e/harness/theme_verifier.js

const { test, expect } = require('@playwright/test');

const GALLERY = 'http://localhost:4444';

/**
 * Generate tests that verify a control looks correct in both light and dark themes.
 */
function verify_themed_control(control_name, spec, expectations) {
    for (const theme of ['light', 'dark']) {
        test.describe(`${control_name} [${theme}]`, () => {
            test.beforeEach(async ({ page }) => {
                await page.goto(`${GALLERY}?control=${control_name}&theme=${theme}&spec=${
                    encodeURIComponent(JSON.stringify(spec))
                }`);
            });

            test('uses theme tokens, not hardcoded colours', async ({ page }) => {
                const el = page.locator('[data-testid="mount"] > *').first();
                const styles = await el.evaluate(el => {
                    const s = getComputedStyle(el);
                    return {
                        bg: s.backgroundColor,
                        color: s.color
                    };
                });

                // In dark mode, backgrounds should be dark and text should be light
                if (theme === 'dark') {
                    const bg = parse_rgb(styles.bg);
                    const fg = parse_rgb(styles.color);
                    expect(luminance(bg)).toBeLessThan(0.4); // Dark background
                    expect(luminance(fg)).toBeGreaterThan(0.5); // Light text
                }
            });

            test('has sufficient colour contrast (WCAG AA)', async ({ page }) => {
                const el = page.locator('[data-testid="mount"] > *').first();
                const { bg, fg } = await el.evaluate(el => {
                    const s = getComputedStyle(el);
                    return { bg: s.backgroundColor, fg: s.color };
                });

                const ratio = contrast_ratio(parse_rgb(bg), parse_rgb(fg));
                // WCAG AA requires 4.5:1 for normal text
                expect(ratio).toBeGreaterThanOrEqual(4.5);
            });

            if (expectations?.screenshot) {
                test('matches visual reference', async ({ page }) => {
                    const mount = page.locator('[data-testid="mount"]');
                    await expect(mount).toHaveScreenshot(
                        `${control_name}-${theme}.png`
                    );
                });
            }
        });
    }
}

// Colour utility helpers
function parse_rgb(str) {
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
}

function luminance([r, g, b]) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrast_ratio(rgb1, rgb2) {
    const l1 = luminance(rgb1) + 0.05;
    const l2 = luminance(rgb2) + 0.05;
    return l1 > l2 ? l1 / l2 : l2 / l1;
}

module.exports = { verify_themed_control };
```

### Usage in E2E Tests

```javascript
// test/e2e/themes/all_controls_themed.e2e.js

const { verify_themed_control } = require('../harness/theme_verifier');

verify_themed_control('Button', { text: 'Click Me' }, { screenshot: true });
verify_themed_control('Toggle_Switch', { label: 'Dark Mode' }, { screenshot: true });
verify_themed_control('Text_Input', { placeholder: 'Type here' }, { screenshot: true });
verify_themed_control('Data_Table', {
    columns: [{ key: 'name', label: 'Name' }],
    rows: [{ name: 'Alice' }, { name: 'Bob' }]
}, { screenshot: true });
// ... repeat for every control
```

---

## 16.4 Harness 4: Control Completeness Audit Runner

An automated audit script that checks every control against the completeness criteria from Chapter 13:

```javascript
// test/audit/completeness_audit.js

const controls = require('../../controls/controls');

const report = { pass: [], fail: [], skip: [] };

function audit_control(name, ControlClass) {
    const issues = [];

    // 1. Has static CSS?
    if (!ControlClass.css && !ControlClass.prototype.css) {
        issues.push('NO_CSS: No static .css property');
    }

    // 2. CSS uses tokens (not hardcoded hex)?
    const css = ControlClass.css || '';
    const hex_matches = css.match(/#[0-9a-f]{3,8}/gi) || [];
    if (hex_matches.length > 0) {
        issues.push(`HARDCODED_COLOURS: ${hex_matches.length} hex values in CSS: ${hex_matches.slice(0, 3).join(', ')}...`);
    }

    // 3. Has ARIA roles?
    try {
        const ctrl = new ControlClass({ __type_name: name.toLowerCase() });
        const html = ctrl.html || '';
        const has_role = /role=/.test(html) || /aria-/.test(html);
        if (!has_role) {
            issues.push('NO_ARIA: No role or aria-* attributes in rendered HTML');
        }
    } catch (e) {
        issues.push(`INSTANTIATION_ERROR: ${e.message}`);
    }

    // 4. Has documented JSDoc?
    const source = ControlClass.toString();
    if (!source.includes('/**') && !source.includes('@param')) {
        issues.push('NO_JSDOC: No JSDoc comments on class');
    }

    // 5. Has activate() method?
    if (!ControlClass.prototype.activate) {
        issues.push('NO_ACTIVATE: No activate() method for browser interactivity');
    }

    // 6. Uses themeable?
    const proto_source = ControlClass.prototype.constructor.toString();
    const uses_themeable = proto_source.includes('themeable') || proto_source.includes('theme_params');

    if (!uses_themeable) {
        issues.push('NO_THEME: Does not call themeable() mixin');
    }

    // Report
    if (issues.length === 0) {
        report.pass.push(name);
    } else {
        report.fail.push({ name, issues });
    }
}

// Run
const control_names = Object.keys(controls).filter(k =>
    k !== 'experimental' && k !== 'deprecated' && typeof controls[k] === 'function'
);

for (const name of control_names) {
    try {
        audit_control(name, controls[name]);
    } catch (e) {
        report.skip.push({ name, reason: e.message });
    }
}

// Print report
console.log('\n=== CONTROL COMPLETENESS AUDIT ===\n');
console.log(`✅ PASS: ${report.pass.length}`);
console.log(`❌ FAIL: ${report.fail.length}`);
console.log(`⏭️  SKIP: ${report.skip.length}`);
console.log(`   TOTAL: ${control_names.length}\n`);

if (report.fail.length > 0) {
    console.log('--- FAILURES ---');
    for (const { name, issues } of report.fail) {
        console.log(`\n  ${name}:`);
        for (const issue of issues) {
            console.log(`    ⚠️  ${issue}`);
        }
    }
}

if (report.skip.length > 0) {
    console.log('\n--- SKIPPED ---');
    for (const { name, reason } of report.skip) {
        console.log(`  ⏭️  ${name}: ${reason}`);
    }
}

// Exit code for CI
process.exit(report.fail.length > 0 ? 1 : 0);
```

### npm Script

```json
{
    "scripts": {
        "audit:controls": "node test/audit/completeness_audit.js"
    }
}
```

---

## 16.5 Harness 5: Responsive Layout Test Matrix

Test that controls render correctly at multiple viewport sizes:

```javascript
// test/e2e/harness/responsive_matrix.js

const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'widescreen', width: 1920, height: 1080 }
];

/**
 * Generate responsive tests for a control.
 */
function test_responsive(control_name, spec, assertions) {
    for (const vp of VIEWPORTS) {
        test.describe(`${control_name} @ ${vp.name} (${vp.width}×${vp.height})`, () => {
            test.use({ viewport: { width: vp.width, height: vp.height } });

            test.beforeEach(async ({ page }) => {
                await page.goto(`http://localhost:4444/?control=${control_name}&spec=${
                    encodeURIComponent(JSON.stringify(spec))
                }`);
            });

            test('is fully visible within viewport', async ({ page }) => {
                const mount = page.locator('[data-testid="mount"]');
                const box = await mount.boundingBox();
                expect(box.x).toBeGreaterThanOrEqual(0);
                expect(box.y).toBeGreaterThanOrEqual(0);
                expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
            });

            test('does not cause horizontal scroll', async ({ page }) => {
                const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
                expect(scrollWidth).toBeLessThanOrEqual(vp.width);
            });

            test('text is readable (font-size >= 12px)', async ({ page }) => {
                const sizes = await page.evaluate(() => {
                    const elements = document.querySelectorAll('#control-mount *');
                    return [...elements].map(el =>
                        parseFloat(getComputedStyle(el).fontSize)
                    ).filter(s => s > 0);
                });
                for (const size of sizes) {
                    expect(size).toBeGreaterThanOrEqual(12);
                }
            });

            if (assertions) {
                assertions(test, expect, vp);
            }
        });
    }
}

module.exports = { test_responsive, VIEWPORTS };
```

---

## 16.6 Harness 6: Performance Benchmark Runner

Test that controls render within performance budgets:

```javascript
// test/e2e/harness/perf_benchmark.js

const { test, expect } = require('@playwright/test');

/**
 * Benchmark control instantiation and rendering time.
 */
function benchmark_control(control_name, spec, options = {}) {
    const { max_render_ms = 50, max_first_paint_ms = 100 } = options;

    test.describe(`${control_name} Performance`, () => {
        test(`renders within ${max_render_ms}ms`, async ({ page }) => {
            await page.goto(`http://localhost:4444/?control=${control_name}&spec=${
                encodeURIComponent(JSON.stringify(spec))
            }`);

            // Measure time from navigation to first meaningful paint
            const timing = await page.evaluate(() => {
                const nav = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByName('first-contentful-paint')[0];
                return {
                    dom_interactive: nav.domInteractive,
                    dom_complete: nav.domComplete,
                    first_paint: paint ? paint.startTime : null
                };
            });

            if (timing.first_paint) {
                expect(timing.first_paint).toBeLessThan(max_first_paint_ms);
            }
        });

        test('server-side render time is acceptable', async ({ page }) => {
            const start = Date.now();
            const response = await page.goto(`http://localhost:4444/?control=${control_name}&spec=${
                encodeURIComponent(JSON.stringify(spec))
            }`);
            const elapsed = Date.now() - start;

            // Server should respond within 200ms for any single control
            expect(elapsed).toBeLessThan(200);
            expect(response.status()).toBe(200);
        });
    });
}

module.exports = { benchmark_control };
```

---

## 16.7 Complete Test File Structure

```
test/
├── unit/                          ← Layer 1: Pure function tests
│   ├── token_maps.test.js
│   ├── theme_params.test.js
│   ├── variants.test.js
│   ├── colour_utils.test.js
│   └── data_normalisation.test.js
├── component/                     ← Layer 2: JSDOM rendering tests
│   ├── helpers/
│   │   └── control_harness.js     ← ControlTestHarness class
│   ├── button.test.js
│   ├── toggle_switch.test.js
│   ├── text_input.test.js
│   ├── data_table.test.js
│   ├── combo_box.test.js
│   └── ... (one per control)
├── e2e/                           ← Layer 3 & 4: Browser tests
│   ├── playwright.config.js
│   ├── harness/
│   │   ├── gallery_server.js      ← Control Gallery Server
│   │   ├── interactions.js        ← Interaction test helpers
│   │   ├── theme_verifier.js      ← Theme verification suite
│   │   ├── responsive_matrix.js   ← Responsive viewport tests
│   │   └── perf_benchmark.js      ← Performance benchmarks
│   ├── controls/                  ← E2E interaction tests
│   │   ├── button.e2e.js
│   │   ├── toggle_switch.e2e.js
│   │   ├── combo_box.e2e.js
│   │   └── ... (one per control)
│   ├── visual/                    ← Visual regression tests
│   │   ├── button.visual.js
│   │   ├── toggle.visual.js
│   │   └── __screenshots__/       ← Auto-generated baselines
│   ├── themes/
│   │   └── all_controls_themed.e2e.js
│   ├── a11y/
│   │   └── accessibility.e2e.js
│   └── responsive/
│       └── all_controls_responsive.e2e.js
├── audit/                         ← Automated audits
│   └── completeness_audit.js
├── fixtures/                      ← Shared test data
│   ├── sample_table_data.json
│   ├── tree_data.json
│   └── chart_data.json
├── deprecation.test.js            ← (existing)
├── diagnostic-bugs.test.js        ← (existing)
├── rendering.test.js              ← (existing)
├── swap-infrastructure.test.js    ← (existing)
└── validation.test.js             ← (existing)
```

---

## 16.8 npm Scripts — Full Testing Toolkit

```json
{
    "scripts": {
        "test": "npm run test:unit && npm run test:component",
        "test:unit": "mocha test/unit/**/*.test.js --timeout 5000",
        "test:component": "mocha test/component/**/*.test.js --timeout 10000",
        "test:e2e": "npx playwright test --project=functional",
        "test:visual": "npx playwright test --project=visual",
        "test:visual:update": "npx playwright test --project=visual --update-snapshots",
        "test:a11y": "npx playwright test --project=accessibility",
        "test:responsive": "npx playwright test test/e2e/responsive/",
        "test:perf": "npx playwright test test/e2e/perf/",
        "test:all": "npm run test && npm run test:e2e && npm run test:visual && npm run test:a11y",
        "audit:controls": "node test/audit/completeness_audit.js",
        "gallery": "node test/e2e/harness/gallery_server.js"
    }
}
```

---

## 16.9 Testing Effort Integration with Previous Chapters

### Chapters 11–12: New Controls — Testing Requirements

Every new control from Chapters 11 and 12 must ship with:

| Test Type | Minimum Tests | Estimated Extra Time |
|-----------|:-------------:|:--------------------:|
| Component test | 5 per control (instantiation, rendering, spec, theme, ARIA) | +0.5 day per control |
| E2E interaction | 3 per control (click, keyboard, state change) | +0.5 day per control |
| Visual baseline | 4 screenshots (light/dark × default/compact) | Included in dev time |
| Accessibility | 1 axe-core scan | Included in dev time |

This adds approximately **1 day** of testing per new control, or **~22 extra days** across all 22 new controls.

### Chapters 13–14: Completing Controls — Testing Requirements

For completed controls, update/expand existing tests:

| Control Being Completed | Tests to Add | Time |
|------------------------|:------------:|:----:|
| Search_Bar | Clear/debounce/autocomplete E2E | +0.5 day |
| Tooltip | Positioning/collision E2E | +0.5 day |
| Toast | Animation timing E2E, stacking | +0.5 day |
| Data_Table | Column resize/sort/empty state | +1 day |
| Horizontal_Slider (rewrite) | Full E2E + ARIA + keyboard | +1 day |
| Modal | Focus trap/escape/backdrop E2E | +0.5 day |
| Color_Picker | Eyedropper/copy/presets | +0.5 day |
| Others (Badge, Chip, etc.) | Basic variant/state tests | +0.25 day each |

**Total extra testing time for Chapters 13–14: ~7 days**

---

## 16.10 Revised Grand Total with Testing

| Phase | Dev Days | Testing Days | Total |
|-------|:--------:|:------------:|:-----:|
| Complete existing controls (Ch 13–14) | 35–48 | 7 | **42–55** |
| Build new controls (Ch 11–12) | 55–70 | 22 | **77–92** |
| Test infrastructure setup (Ch 15–16) | — | 5 | **5** |
| **Grand Total** | **90–118** | **34** | **124–152** |

The testing investment (~34 days) is approximately 25% of total effort — well within the industry standard of 20–35% for a UI component library.

---

> Testing is not a tax on development.  
> It is the proof that the toolkit works.  
> Every day spent writing tests saves a week of debugging in production.
