# Chapter 15: Testing Strategy — Unit, Visual & E2E

> A control library without comprehensive tests is a liability.  
> This chapter specifies the complete testing architecture for jsgui3-html,  
> from unit tests through visual regression to end-to-end browser validation.

---

## 15.1 What Exists Today

### Current Test Infrastructure

| Asset | Location | Status |
|-------|----------|--------|
| Unit tests | `test/rendering.test.js` | ✅ ~25 controls tested for basic instantiation + HTML output |
| Deprecation tests | `test/deprecation.test.js` | ✅ Verifies legacy name aliases emit warnings |
| Diagnostic tests | `test/diagnostic-bugs.test.js` | ✅ Regression tests for specific bug fixes |
| Swap tests | `test/swap-infrastructure.test.js` | ✅ Tests control swap registry |
| Validation tests | `test/validation.test.js` | ✅ Tests control validation pipeline |
| Chart test page | `chart_test.html` | ⚠️ Manual — browser-based visual check |
| Lab demos | `lab/*.js` (25+ files) | ⚠️ Manual — demo servers for visual inspection |
| E2E client script | `lab/date_controls_e2e_client.js` | ⚠️ Custom E2E — not using a standard framework |
| Screenshots | `lab/screenshots/` (23 files) | ⚠️ Manual captures — no automated comparison |
| Experiment runner | `lab/experiment_runner.js` | ⚠️ Custom harness for experiments |

### Current Test Runner

Tests use **Mocha + Chai** (requires `chai`). The test pattern is:

```javascript
const { expect } = require('chai');
const controls = require('../controls/controls');

describe('Control Rendering Tests', () => {
    it('should render Button control', () => {
        const button = new controls.Button({ context, text: 'Test' });
        expect(button).to.exist;
        expect(button.dom.tagName).to.equal('button');
        expect(button.html).to.include('Test');
    });
});
```

### What's Missing

| Gap | Impact | Priority |
|-----|--------|:--------:|
| No `npm test` script | Tests can't be run easily | P0 |
| No CI integration | No automated testing on commit/PR | P0 |
| No E2E framework | Browser interaction tests are manual | P0 |
| No visual regression | CSS changes can break controls silently | P0 |
| No test coverage reporting | No way to know what's untested | P1 |
| Unit tests cover ~25 of ~145 controls | 83% of controls have zero tests | P0 |
| No interaction/state tests | Only tests instantiation, not hover/click/keyboard | P0 |
| No theme tests | No tests for dark mode or token application | P1 |
| No accessibility tests | No ARIA or keyboard navigation tests | P1 |

---

## 15.2 The Four Testing Layers

```
Layer 4:  Visual Regression      ← Screenshot comparison (CI)
Layer 3:  E2E Browser Tests      ← Playwright (interaction, state, a11y)
Layer 2:  Component Tests        ← JSDOM (rendering, composition, data binding)
Layer 1:  Unit Tests             ← Pure functions (token maps, variants, utilities)
```

Each layer tests different things and catches different bugs. All four are needed.

---

## 15.3 Layer 1: Unit Tests (Pure Logic)

### What to Test
- Token map resolution (`token_maps.js`)
- Variant parameter merging (`theme_params.js`, `variants.js`)
- Colour conversion utilities (Color_Picker's `hsl_to_rgb`, `rgb_to_hex`, etc.)
- Data normalisation functions (`normalize_columns`, `normalize_items`, etc.)
- Validation schemas and error messages

### Test File Structure

```
test/
├── unit/
│   ├── token_maps.test.js
│   ├── theme_params.test.js
│   ├── variants.test.js
│   ├── colour_utils.test.js
│   ├── item_utils.test.js
│   └── data_normalisation.test.js
```

### Example: Token Map Unit Test

```javascript
const { expect } = require('chai');
const { SIZE_TOKENS, resolve_size_tokens } = require('../../themes/token_maps');

describe('Token Maps', () => {
    describe('SIZE_TOKENS', () => {
        it('should define all four size steps for buttons', () => {
            expect(SIZE_TOKENS.button).to.have.all.keys('small', 'medium', 'large', 'xlarge');
        });

        it('should produce valid CSS values for button.medium', () => {
            const tokens = SIZE_TOKENS.button.medium;
            expect(tokens['--btn-height']).to.match(/^\d+px$/);
            expect(tokens['--btn-padding-x']).to.match(/^\d+px$/);
            expect(tokens['--btn-font-size']).to.match(/^\d+px$/);
        });

        it('should align button heights to 4px grid', () => {
            for (const [size, tokens] of Object.entries(SIZE_TOKENS.button)) {
                const height = parseInt(tokens['--btn-height']);
                expect(height % 4, `${size} height ${height} not on 4px grid`).to.equal(0);
            }
        });
    });

    describe('Theme Params Resolution', () => {
        it('should merge variant → theme → spec with correct priority', () => {
            const result = resolve_params('button', {
                variant: 'primary',
                params: { size: 'large' }  // spec overrides
            }, {
                theme: { params: { button: { size: 'small' } } }  // theme level
            });
            // Spec params win over theme params
            expect(result.size).to.equal('large');
        });
    });
});
```

### Running

```bash
npm test -- --grep "Token Maps"
```

---

## 15.4 Layer 2: Component Tests (JSDOM Rendering)

### What to Test
- Control instantiation with various spec combinations
- HTML output structure (tag names, class names, attributes, ARIA roles)
- Theme application (data-attributes, CSS classes from `themeable()`)
- Data binding (value changes propagate to DOM)
- Composition (child controls are created correctly)

### Test Harness: Control Test Factory

Create a reusable test harness that handles context creation and provides assertion helpers:

```javascript
// test/helpers/control_harness.js

const jsgui = require('../../html-core/html-core');

class ControlTestHarness {
    constructor() {
        this.context = this._create_context();
        this.controls = [];
    }

    /**
     * Create a control and track it for cleanup.
     */
    create(ControlClass, spec = {}) {
        spec.context = spec.context || this.context;
        const ctrl = new ControlClass(spec);
        this.controls.push(ctrl);
        return ctrl;
    }

    /**
     * Get the rendered HTML of a control.
     */
    html(ctrl) {
        return ctrl.html;
    }

    /**
     * Assert a control has a specific CSS class.
     */
    assert_has_class(ctrl, class_name) {
        const html = this.html(ctrl);
        expect(html).to.include(`class="`);
        expect(html).to.include(class_name);
    }

    /**
     * Assert a control has a specific data attribute.
     */
    assert_has_data(ctrl, attr, value) {
        const html = this.html(ctrl);
        if (value !== undefined) {
            expect(html).to.include(`data-${attr}="${value}"`);
        } else {
            expect(html).to.include(`data-${attr}`);
        }
    }

    /**
     * Assert a control has a specific ARIA attribute.
     */
    assert_aria(ctrl, attr, value) {
        const html = this.html(ctrl);
        expect(html).to.include(`aria-${attr}="${value}"`);
    }

    /**
     * Assert the rendered HTML contains a child with the given tag.
     */
    assert_contains_tag(ctrl, tag_name) {
        const html = this.html(ctrl);
        expect(html).to.include(`<${tag_name}`);
    }

    /**
     * Cleanup all created controls.
     */
    dispose() {
        this.controls.forEach(c => {
            if (c.remove) c.remove();
        });
        this.controls = [];
    }

    _create_context() {
        // Minimal test context
        return {
            document: {},
            controls: require('../../controls/controls')
        };
    }
}

module.exports = { ControlTestHarness };
```

### Example: Complete Component Test

```javascript
const { expect } = require('chai');
const { ControlTestHarness } = require('../helpers/control_harness');
const Toggle_Switch = require('../../controls/organised/0-core/0-basic/1-compositional/toggle_switch');

describe('Toggle_Switch', () => {
    let harness;

    beforeEach(() => { harness = new ControlTestHarness(); });
    afterEach(() => { harness.dispose(); });

    describe('Rendering', () => {
        it('should render a toggle_switch container', () => {
            const toggle = harness.create(Toggle_Switch, { label: 'Dark Mode' });
            harness.assert_has_class(toggle, 'toggle-switch');
            harness.assert_contains_tag(toggle, 'input');
        });

        it('should include the label text', () => {
            const toggle = harness.create(Toggle_Switch, { label: 'Wi-Fi' });
            const html = harness.html(toggle);
            expect(html).to.include('Wi-Fi');
        });

        it('should render as checked when value is true', () => {
            const toggle = harness.create(Toggle_Switch, { value: true });
            const html = harness.html(toggle);
            expect(html).to.include('checked');
        });
    });

    describe('Theming', () => {
        it('should have the jsgui-toggle class when themed', () => {
            const toggle = harness.create(Toggle_Switch, { label: 'Test' });
            harness.assert_has_class(toggle, 'jsgui-toggle');
        });

        it('should apply size data-attribute', () => {
            const toggle = harness.create(Toggle_Switch, {
                label: 'Test',
                params: { size: 'large' }
            });
            harness.assert_has_data(toggle, 'size', 'large');
        });
    });

    describe('Accessibility', () => {
        it('should have role="switch"', () => {
            const toggle = harness.create(Toggle_Switch);
            harness.assert_aria(toggle, 'role', 'switch');
        });

        it('should have aria-checked matching value', () => {
            const on = harness.create(Toggle_Switch, { value: true });
            harness.assert_aria(on, 'checked', 'true');

            const off = harness.create(Toggle_Switch, { value: false });
            harness.assert_aria(off, 'checked', 'false');
        });
    });
});
```

### Required Tests Per Control

Every control should have tests for:

- [ ] **Instantiation** — creates without error for minimal spec
- [ ] **Default rendering** — produces expected HTML structure
- [ ] **Spec options** — each spec property affects output correctly
- [ ] **Theme integration** — CSS classes and data-attrs applied by `themeable()`
- [ ] **ARIA attributes** — correct roles, states, labels
- [ ] **Edge cases** — empty data, null values, missing properties

---

## 15.5 Layer 3: E2E Browser Tests (Playwright)

### Why Playwright?
- Cross-browser (Chromium, Firefox, WebKit)
- Headless + headed modes
- Built-in screenshot comparison
- Network interception for mocking API calls
- Excellent accessibility testing via `@axe-core/playwright`

### Setup

```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install
```

### package.json scripts

```json
{
    "scripts": {
        "test": "mocha test/**/*.test.js",
        "test:unit": "mocha test/unit/**/*.test.js",
        "test:component": "mocha test/component/**/*.test.js",
        "test:e2e": "npx playwright test",
        "test:visual": "npx playwright test --project=visual",
        "test:all": "npm run test:unit && npm run test:component && npm run test:e2e"
    }
}
```

### E2E Test Harness: Control Gallery Server

Create a dedicated test server that renders any control with any spec:

```javascript
// test/e2e/harness/gallery_server.js

const http = require('http');
const jsgui = require('../../../html-core/html-core');
const controls = require('../../../controls/controls');

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost`);
    const control_name = url.searchParams.get('control');
    const spec_json = url.searchParams.get('spec') || '{}';
    const theme = url.searchParams.get('theme') || 'light';

    if (!control_name || !controls[control_name]) {
        res.writeHead(404);
        res.end(`Unknown control: ${control_name}`);
        return;
    }

    const spec = JSON.parse(spec_json);
    const page = new jsgui.Standard_Web_Page({ context: jsgui.create_context() });

    // Set theme
    page.dom.attributes['data-theme'] = theme;

    // Create the control
    const ctrl = new controls[control_name]({ ...spec, context: page.context });
    page.add(ctrl);

    // Include CSS
    const html = `<!DOCTYPE html>
<html data-theme="${theme}">
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/css/jsgui.css">
    <style>${controls[control_name].css || ''}</style>
</head>
<body style="padding:24px; font-family:Inter,sans-serif;">
    ${page.html}
    <script>
        // Activate all controls
        document.querySelectorAll('[data-jsgui]').forEach(el => {
            // activation hook
        });
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

module.exports = { start: (port = 4444) => server.listen(port) };
```

### E2E Test File Structure

```
test/
├── e2e/
│   ├── harness/
│   │   ├── gallery_server.js      ← Serves any control on demand
│   │   └── test_fixtures.js       ← Common spec objects
│   ├── controls/
│   │   ├── button.e2e.js
│   │   ├── toggle_switch.e2e.js
│   │   ├── combo_box.e2e.js
│   │   ├── data_table.e2e.js
│   │   ├── slider.e2e.js
│   │   ├── modal.e2e.js
│   │   ├── tabbed_panel.e2e.js
│   │   └── ...
│   ├── themes/
│   │   ├── dark_mode.e2e.js       ← All controls in dark mode
│   │   └── token_application.e2e.js
│   ├── a11y/
│   │   └── accessibility.e2e.js   ← axe-core scan of each control
│   └── playwright.config.js
```

### Example: Button E2E Test

```javascript
// test/e2e/controls/button.e2e.js

const { test, expect } = require('@playwright/test');

const GALLERY = 'http://localhost:4444';

test.describe('Button', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${GALLERY}?control=Button&spec=${encodeURIComponent(JSON.stringify({
            text: 'Click Me',
            params: { variant: 'primary', size: 'medium' }
        }))}`);
    });

    test('renders visible button with correct text', async ({ page }) => {
        const button = page.locator('.jsgui-button');
        await expect(button).toBeVisible();
        await expect(button).toHaveText('Click Me');
    });

    test('has primary variant styling', async ({ page }) => {
        const button = page.locator('.jsgui-button');
        await expect(button).toHaveAttribute('data-variant', 'primary');
    });

    test('shows hover state on mouse over', async ({ page }) => {
        const button = page.locator('.jsgui-button');
        const bgBefore = await button.evaluate(el =>
            getComputedStyle(el).backgroundColor
        );
        await button.hover();
        await page.waitForTimeout(200); // Wait for transition
        const bgAfter = await button.evaluate(el =>
            getComputedStyle(el).backgroundColor
        );
        expect(bgBefore).not.toEqual(bgAfter);
    });

    test('shows active state on click', async ({ page }) => {
        const button = page.locator('.jsgui-button');
        await button.dispatchEvent('mousedown');
        const transform = await button.evaluate(el =>
            getComputedStyle(el).transform
        );
        // scale(0.97) produces a matrix value
        expect(transform).not.toEqual('none');
    });

    test('shows focus ring on keyboard focus', async ({ page }) => {
        await page.keyboard.press('Tab');
        const button = page.locator('.jsgui-button');
        const outline = await button.evaluate(el =>
            getComputedStyle(el).outlineStyle
        );
        expect(outline).not.toEqual('none');
    });

    test('disabled button is not clickable', async ({ page }) => {
        await page.goto(`${GALLERY}?control=Button&spec=${encodeURIComponent(JSON.stringify({
            text: 'Disabled',
            disabled: true
        }))}`);
        const button = page.locator('.jsgui-button');
        await expect(button).toHaveCSS('pointer-events', 'none');
        await expect(button).toHaveCSS('opacity', '0.5');
    });
});
```

### Example: Toggle Switch E2E Test

```javascript
// test/e2e/controls/toggle_switch.e2e.js

test.describe('Toggle_Switch', () => {
    test('toggles on click', async ({ page }) => {
        await page.goto(`${GALLERY}?control=Toggle_Switch&spec=${encodeURIComponent(JSON.stringify({
            label: 'Dark Mode', value: false
        }))}`);

        const toggle = page.locator('.jsgui-toggle');
        const track = page.locator('.jsgui-toggle-track');

        // Initially OFF
        const bgBefore = await track.evaluate(el => getComputedStyle(el).backgroundColor);

        // Click to toggle ON
        await toggle.click();
        await page.waitForTimeout(300); // Spring animation

        const bgAfter = await track.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(bgBefore).not.toEqual(bgAfter);
    });

    test('responds to keyboard Space', async ({ page }) => {
        await page.goto(`${GALLERY}?control=Toggle_Switch&spec=${encodeURIComponent(JSON.stringify({
            label: 'Notifications'
        }))}`);

        await page.keyboard.press('Tab'); // Focus the toggle
        await page.keyboard.press('Space'); // Toggle it

        const input = page.locator('.jsgui-toggle-input');
        await expect(input).toBeChecked();
    });
});
```

### Example: Accessibility E2E Test (axe-core)

```javascript
// test/e2e/a11y/accessibility.e2e.js

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const CONTROLS_TO_TEST = [
    { name: 'Button', spec: { text: 'Click me' } },
    { name: 'Text_Input', spec: { placeholder: 'Enter text' } },
    { name: 'Toggle_Switch', spec: { label: 'Enable' } },
    { name: 'Checkbox', spec: { text: 'Accept terms' } },
    { name: 'Data_Table', spec: { columns: [{ key: 'name', label: 'Name' }], rows: [{ name: 'Test' }] } },
    { name: 'Modal', spec: { title: 'Confirm', content: 'Are you sure?' } },
    { name: 'Tabbed_Panel', spec: { tabs: [{ title: 'Tab 1', content: 'Content' }] } }
];

for (const { name, spec } of CONTROLS_TO_TEST) {
    test(`${name} passes axe-core accessibility scan`, async ({ page }) => {
        await page.goto(`${GALLERY}?control=${name}&spec=${encodeURIComponent(JSON.stringify(spec))}`);

        const results = await new AxeBuilder({ page })
            .include('[data-jsgui]')  // Only scan the control
            .analyze();

        expect(results.violations).toEqual([]);
    });
}
```

---

## 15.6 Layer 4: Visual Regression Testing

### Tool: Playwright + `toHaveScreenshot()`

Playwright has built-in screenshot comparison. First run generates reference images; subsequent runs compare against them.

### Playwright Config

```javascript
// test/e2e/playwright.config.js

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: '.',
    timeout: 30000,
    projects: [
        {
            name: 'functional',
            testMatch: 'controls/**/*.e2e.js'
        },
        {
            name: 'visual',
            testMatch: 'visual/**/*.visual.js',
            expect: {
                toHaveScreenshot: {
                    maxDiffPixelRatio: 0.01,  // Allow 1% pixel difference
                    threshold: 0.2            // Per-pixel colour tolerance
                }
            }
        },
        {
            name: 'accessibility',
            testMatch: 'a11y/**/*.e2e.js'
        }
    ],
    webServer: {
        command: 'node test/e2e/harness/gallery_server.js',
        port: 4444,
        reuseExistingServer: !process.env.CI
    }
});
```

### Visual Test Example

```javascript
// test/e2e/visual/button.visual.js

const { test, expect } = require('@playwright/test');

const GALLERY = 'http://localhost:4444';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'outline'];
const SIZES = ['small', 'medium', 'large'];
const THEMES = ['light', 'dark'];

for (const theme of THEMES) {
    for (const variant of VARIANTS) {
        for (const size of SIZES) {
            test(`Button ${variant} ${size} (${theme})`, async ({ page }) => {
                await page.goto(`${GALLERY}?control=Button&theme=${theme}&spec=${encodeURIComponent(JSON.stringify({
                    text: 'Button',
                    params: { variant, size }
                }))}`);

                const button = page.locator('.jsgui-button');
                await expect(button).toHaveScreenshot(
                    `button-${variant}-${size}-${theme}.png`
                );
            });
        }
    }
}
```

This generates **30 reference screenshots** (5 variants × 3 sizes × 2 themes) for buttons alone.

### Screenshot Directory Structure

```
test/e2e/visual/
├── button.visual.js
├── toggle.visual.js
├── input.visual.js
├── table.visual.js
├── ...
└── __screenshots__/           ← Auto-generated by Playwright
    ├── button-primary-medium-light.png
    ├── button-primary-medium-dark.png
    └── ...
```

---

## 15.7 Test Coverage Targets

### Phase 1: Foundation (with CSS architecture sprint)

| Metric | Target |
|--------|--------|
| Unit tests for theme infrastructure | 100% of `token_maps.js`, `theme_params.js`, `variants.js` |
| Component tests | All 5 day-3–day-6 controls (Button, Input, Toggle, Panel, Table) |
| E2E interaction tests | Button (5 states), Toggle (toggle + keyboard), Input (type + validate) |
| Visual regression | Button (30 combos), Toggle (8 combos), Input (12 combos) |
| Accessibility | axe-core pass for all 5 controls |

### Phase 2: Expansion

| Metric | Target |
|--------|--------|
| Component tests | 40 most-used controls |
| E2E interaction | All controls with hover/click/keyboard behaviour |
| Visual regression | All controls × themes + sizes = ~500 screenshots |
| Accessibility | axe-core pass for all interactive controls |

### Phase 3: Complete

| Metric | Target |
|--------|--------|
| Component tests | All ~145 controls |
| E2E | Full interaction coverage |
| Visual regression | ~1 000 screenshots as reference baseline |
| Code coverage | >80% line coverage |

---

## 15.8 CI Pipeline Integration

```yaml
# .github/workflows/test.yml

name: Tests
on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:component

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:visual
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diff
          path: test/e2e/visual/__screenshots__/
```

---

## 15.9 Leveraging Existing Lab Infrastructure

The `lab/` directory is a goldmine that should be formalised:

| Existing Asset | Formalised As |
|----------------|---------------|
| `lab/date_controls_demo_server.js` | E2E test fixture for date controls |
| `lab/color_controls_demo_server.js` | E2E test fixture for colour controls |
| `lab/chart_demo_server.js` | E2E test fixture for chart controls |
| `lab/property_grid_demo_server.js` | E2E test fixture for property grid |
| `lab/date_controls_e2e_client.js` | **Already an E2E script** — migrate to Playwright |
| `lab/screenshots/` (23 files) | Seed the visual regression baseline |
| `lab/experiment_runner.js` | Extend into a formal test harness |
| `lab/fixtures/` | Move to `test/fixtures/` |

The existing `date_controls_e2e_client.js` is custom-written E2E logic. This should be ported to Playwright tests for standardisation, cross-browser support, and CI integration.

---

**Next:** [Chapter 16 — Test Harness Specifications](./16-test-harnesses.md)
