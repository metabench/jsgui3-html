/**
 * Tabbed Panel E2E Test — comprehensive Puppeteer tests with screenshots.
 *
 * Tests:
 *   1. String tabs — basic tab switching via click
 *   2. Object tabs — icon + badge rendering
 *   3. Tab switching — correct panel visibility
 *   4. ARIA attributes — correct role/aria-selected/aria-hidden
 *   5. Keyboard navigation — arrow keys, Enter
 *   6. CSS correctness — active tab indicator styles
 *   7. Multiple variants — default, vertical, bottom
 *
 * Run: node tmp/tabbed-panel-e2e.js
 */
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');

const PORT = 4477;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const fs = require('fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Ensure screenshot dir exists
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// ── Build the test page ──────────────────────────────────────────────
function build_page() {
    const jsgui = require('../html-core/html-core');
    const controls = require('../controls/controls');
    const { Tabbed_Panel, Admin_Theme } = controls;
    const ctx = new jsgui.Page_Context();

    // 1. String tabs (basic)
    const tp_basic = new Tabbed_Panel({
        context: ctx,
        tabs: ['Overview', 'Details', 'Settings'],
        aria_label: 'Basic tabs'
    });
    tp_basic.tab_pages[0].add('Overview panel content');
    tp_basic.tab_pages[1].add('Details panel content');
    tp_basic.tab_pages[2].add('Settings panel content');

    // 2. Object tabs with icons + badges
    const tp_icons = new Tabbed_Panel({
        context: ctx,
        tabs: [
            { title: 'Dashboard', icon: '📊', content: 'Dashboard content here' },
            { title: 'Users', icon: '👥', badge: 42, content: 'Users list content' },
            { title: 'Errors', icon: '⚠', badge: 3, content: 'Error log content' },
            { title: 'Settings', icon: '⚙', content: 'Settings form content' }
        ],
        aria_label: 'Icon tabs'
    });

    // 3. Vertical tabs
    const tp_vertical = new Tabbed_Panel({
        context: ctx,
        tabs: ['General', 'Security', 'Notifications'],
        tab_bar: { position: 'left' },
        aria_label: 'Vertical tabs'
    });
    tp_vertical.tab_pages[0].add('General settings');
    tp_vertical.tab_pages[1].add('Security settings');
    tp_vertical.tab_pages[2].add('Notification preferences');

    // 4. Bottom tabs
    const tp_bottom = new Tabbed_Panel({
        context: ctx,
        tabs: ['Home', 'Search', 'Profile'],
        tab_bar: { position: 'bottom' },
        aria_label: 'Bottom tabs'
    });
    tp_bottom.tab_pages[0].add('Home content');
    tp_bottom.tab_pages[1].add('Search content');
    tp_bottom.tab_pages[2].add('Profile content');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tabbed Panel E2E Test</title>
    <style>
        ${Admin_Theme.css}
        ${Tabbed_Panel.css || ''}
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
        }
        h2 { margin: 24px 0 8px; font-size: 16px; }
        .test-section { margin-bottom: 32px; }
    </style>
</head>
<body>
    <h1>Tabbed Panel E2E Tests</h1>

    <div class="test-section" id="section-basic">
        <h2>1. Basic String Tabs</h2>
        ${tp_basic.html}
    </div>

    <div class="test-section" id="section-icons">
        <h2>2. Object Tabs with Icons & Badges</h2>
        ${tp_icons.html}
    </div>

    <div class="test-section" id="section-vertical">
        <h2>3. Vertical Tabs</h2>
        ${tp_vertical.html}
    </div>

    <div class="test-section" id="section-bottom">
        <h2>4. Bottom Tabs</h2>
        ${tp_bottom.html}
    </div>

    <script>
        // Activate tabs: listen for radio changes
        document.querySelectorAll('.tab-container').forEach(container => {
            const inputs = container.querySelectorAll('.tab-input');
            const labels = container.querySelectorAll('.tab-label');
            const pages = container.querySelectorAll('.tab-page');

            inputs.forEach((input, idx) => {
                input.addEventListener('change', () => {
                    labels.forEach((lbl, i) => {
                        lbl.setAttribute('aria-selected', i === idx ? 'true' : 'false');
                        lbl.setAttribute('tabindex', i === idx ? '0' : '-1');
                    });
                    pages.forEach((page, i) => {
                        page.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
                    });
                });
            });

            // Keyboard navigation
            labels.forEach((label, idx) => {
                label.addEventListener('keydown', (e) => {
                    let newIdx = idx;
                    const orientation = container.getAttribute('aria-orientation');
                    const isVertical = orientation === 'vertical';
                    if (e.key === (isVertical ? 'ArrowDown' : 'ArrowRight')) {
                        newIdx = (idx + 1) % inputs.length;
                        e.preventDefault();
                    } else if (e.key === (isVertical ? 'ArrowUp' : 'ArrowLeft')) {
                        newIdx = (idx - 1 + inputs.length) % inputs.length;
                        e.preventDefault();
                    }
                    if (newIdx !== idx) {
                        inputs[newIdx].checked = true;
                        inputs[newIdx].dispatchEvent(new Event('change'));
                        labels[newIdx].focus();
                    }
                });
            });
        });
    </script>
</body>
</html>`;
}

// ── Server ───────────────────────────────────────────────────────────
function start_server() {
    return new Promise((resolve, reject) => {
        const html = build_page();
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        });
        server.listen(PORT, () => {
            console.log(`Test server started on http://localhost:${PORT}`);
            resolve(server);
        });
        server.on('error', reject);
    });
}

// ── Tests ────────────────────────────────────────────────────────────
async function run_tests() {
    const server = await start_server();
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    let passed = 0;
    let failed = 0;
    const results = [];

    function assert(condition, name) {
        if (condition) {
            passed++;
            results.push(`  ✓ ${name}`);
        } else {
            failed++;
            results.push(`  ✗ ${name}`);
        }
    }

    try {
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });

        // ── Screenshot 1: Initial state ──────────────────────────────
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tp-01-initial.png'), fullPage: true });
        console.log('Screenshot: tp-01-initial.png');

        // ── Test 1: Basic rendering ──────────────────────────────────
        const basicContainer = await page.$('#section-basic .tab-container');
        assert(!!basicContainer, 'Basic tab container renders');

        const basicTabs = await page.$$('#section-basic .tab-label');
        assert(basicTabs.length === 3, 'Basic has 3 tab labels');

        const basicPages = await page.$$('#section-basic .tab-page');
        assert(basicPages.length === 3, 'Basic has 3 tab pages');

        const basicInputs = await page.$$('#section-basic .tab-input');
        assert(basicInputs.length === 3, 'Basic has 3 hidden radio inputs');

        // ── Test 2: Tab text content (now wrapped in .tab-text span) ─
        const tab1Text = await page.$$eval('#section-basic .tab-label', els => els[0].textContent.trim());
        assert(tab1Text === 'Overview', `First tab text is "Overview" (got: "${tab1Text}")`);

        const tab2Text = await page.$$eval('#section-basic .tab-label', els => els[1].textContent.trim());
        assert(tab2Text === 'Details', `Second tab text is "Details" (got: "${tab2Text}")`);

        // ── Test 3: Initial tab state (first tab selected) ──────────
        const firstChecked = await page.$$eval('#section-basic .tab-input', els => els[0].checked);
        assert(firstChecked === true, 'First radio input is checked initially');

        const firstAriaSelected = await page.$$eval('#section-basic .tab-label', els => els[0].getAttribute('aria-selected'));
        assert(firstAriaSelected === 'true', 'First tab aria-selected=true');

        const firstPageHidden = await page.$$eval('#section-basic .tab-page', els => els[0].getAttribute('aria-hidden'));
        assert(firstPageHidden === 'false', 'First tab page aria-hidden=false');

        // ── Test 4: First page visible, others hidden ───────────────
        const page1Display = await page.$$eval('#section-basic .tab-page', els => getComputedStyle(els[0]).display);
        assert(page1Display !== 'none', 'First tab page is visible via CSS');

        const page2Content = await page.$$eval('#section-basic .tab-page', els => els[1].textContent.trim());
        assert(page2Content === 'Details panel content', 'Second page has correct content');

        // ── Test 5: Click second tab ─────────────────────────────────
        // Find the second label and click it
        const secondLabel = (await page.$$('#section-basic .tab-label'))[1];
        await secondLabel.click();
        await delay(200);

        // Verify second input is now checked
        const secondChecked = await page.$$eval('#section-basic .tab-input', inputs => inputs[1].checked);
        assert(secondChecked === true, 'Second input checked after click');

        // Verify second page is visible
        const page2Visible = await page.$$eval('#section-basic .tab-page', pages => {
            return getComputedStyle(pages[1]).display;
        });
        assert(page2Visible !== 'none', 'Second page visible after tab click');

        // Verify first page is hidden
        const page1Hidden = await page.$$eval('#section-basic .tab-page', pages => {
            return getComputedStyle(pages[0]).display;
        });
        assert(page1Hidden === 'none', 'First page hidden after switching to second');

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tp-02-second-tab.png'), fullPage: true });
        console.log('Screenshot: tp-02-second-tab.png');

        // ── Test 6: Click third tab ──────────────────────────────────
        const thirdLabel = (await page.$$('#section-basic .tab-label'))[2];
        await thirdLabel.click();
        await delay(200);

        const thirdChecked = await page.$$eval('#section-basic .tab-input', inputs => inputs[2].checked);
        assert(thirdChecked === true, 'Third input checked after click');

        const page3Content = await page.$$eval('#section-basic .tab-page', pages => pages[2].textContent.trim());
        assert(page3Content === 'Settings panel content', 'Third page shows correct content');

        // ── Test 7: ARIA updates after tab switch ────────────────────
        const ariaStates = await page.$$eval('#section-basic .tab-label', labels => {
            return labels.map(l => l.getAttribute('aria-selected'));
        });
        assert(ariaStates[0] === 'false', 'After switch: tab 1 aria-selected=false');
        assert(ariaStates[2] === 'true', 'After switch: tab 3 aria-selected=true');

        const pageAriaStates = await page.$$eval('#section-basic .tab-page', pages => {
            return pages.map(p => p.getAttribute('aria-hidden'));
        });
        assert(pageAriaStates[0] === 'true', 'After switch: page 1 aria-hidden=true');
        assert(pageAriaStates[2] === 'false', 'After switch: page 3 aria-hidden=false');

        // ── Test 8: Icon tabs — icons render ─────────────────────────
        const iconSpans = await page.$$('#section-icons .tab-icon');
        assert(iconSpans.length === 4, `Icon tabs have 4 tab-icon spans (got: ${iconSpans.length})`);

        const firstIconText = await page.$eval('#section-icons .tab-icon', el => el.textContent);
        assert(firstIconText === '📊', `First icon is 📊 (got: "${firstIconText}")`);

        // ── Test 9: Badge tabs — badges render ──────────────────────
        const badges = await page.$$('#section-icons .tab-badge');
        assert(badges.length === 2, `Icon tabs have 2 badges (got: ${badges.length})`);

        const badge1Text = await page.$eval('#section-icons .tab-badge', el => el.textContent);
        assert(badge1Text === '42', `First badge shows "42" (got: "${badge1Text}")`);

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tp-03-icon-badges.png'), fullPage: true });
        console.log('Screenshot: tp-03-icon-badges.png');

        // ── Test 10: Tab label structure ─────────────────────────────
        const labelChildren = await page.$eval('#section-icons .tab-label', el => {
            return Array.from(el.children).map(c => c.className);
        });
        assert(labelChildren.includes('tab-icon'), 'Icon tab label contains .tab-icon');
        assert(labelChildren.includes('tab-text'), 'Icon tab label contains .tab-text');

        // ── Test 11: Vertical tabs ──────────────────────────────────
        const verticalContainer = await page.$('#section-vertical .tabbed-panel-vertical');
        assert(!!verticalContainer, 'Vertical tabs have tabbed-panel-vertical class');

        const verticalOrientation = await page.$eval('#section-vertical .tab-container', el => el.getAttribute('aria-orientation'));
        assert(verticalOrientation === 'vertical', 'Vertical tabs have aria-orientation=vertical');

        // ── Test 12: Bottom tabs ─────────────────────────────────────
        const bottomContainer = await page.$('#section-bottom .tabbed-panel-bottom');
        assert(!!bottomContainer, 'Bottom tabs have tabbed-panel-bottom class');

        // ── Test 13: CSS active indicator ────────────────────────────
        // Click back to first tab in icon section
        const iconFirstLabel = (await page.$$('#section-icons .tab-label'))[0];
        await iconFirstLabel.click();
        await delay(200);

        const activeTabStyle = await page.$$eval('#section-icons .tab-input', inputs => {
            // Find the checked input's adjacent label
            for (const input of inputs) {
                if (input.checked) {
                    const label = input.nextElementSibling;
                    const style = getComputedStyle(label);
                    return {
                        borderBottomColor: style.borderBottomColor,
                        color: style.color
                    };
                }
            }
            return null;
        });
        assert(activeTabStyle !== null, 'Active tab has computed styles');
        // The active border should not be transparent
        assert(
            activeTabStyle && activeTabStyle.borderBottomColor !== 'rgba(0, 0, 0, 0)' && activeTabStyle.borderBottomColor !== 'transparent',
            `Active tab has visible border-bottom (got: ${activeTabStyle?.borderBottomColor})`
        );

        // ── Test 14: Keyboard navigation ─────────────────────────────
        // Focus first tab in basic section, then press ArrowRight
        const basicFirstLabel = (await page.$$('#section-basic .tab-label'))[0];
        await basicFirstLabel.click();
        await delay(100);
        await basicFirstLabel.focus();
        await page.keyboard.press('ArrowRight');
        await delay(200);

        const afterArrowChecked = await page.$$eval('#section-basic .tab-input', inputs => {
            return inputs.map(i => i.checked);
        });
        assert(afterArrowChecked[1] === true, 'ArrowRight moves to second tab');

        // ArrowRight again to third
        await page.keyboard.press('ArrowRight');
        await delay(200);

        const afterArrow2Checked = await page.$$eval('#section-basic .tab-input', inputs => {
            return inputs.map(i => i.checked);
        });
        assert(afterArrow2Checked[2] === true, 'Second ArrowRight moves to third tab');

        // ArrowLeft back to second
        await page.keyboard.press('ArrowLeft');
        await delay(200);

        const afterLeftChecked = await page.$$eval('#section-basic .tab-input', inputs => {
            return inputs.map(i => i.checked);
        });
        assert(afterLeftChecked[1] === true, 'ArrowLeft moves back to second tab');

        // ── Test 15: Vertical keyboard (ArrowDown/Up) ─────────────
        const vertFirstLabel = (await page.$$('#section-vertical .tab-label'))[0];
        await vertFirstLabel.click();
        await delay(100);
        await vertFirstLabel.focus();
        await page.keyboard.press('ArrowDown');
        await delay(200);

        const vertAfterDown = await page.$$eval('#section-vertical .tab-input', inputs => {
            return inputs.map(i => i.checked);
        });
        assert(vertAfterDown[1] === true, 'ArrowDown in vertical tabs moves to second tab');

        // ── Test 16: Tab page content isolation ─────────────────────
        // Click different icon tabs and verify correct content shows
        const iconLabels = await page.$$('#section-icons .tab-label');
        await iconLabels[1].click();
        await delay(200);

        const usersPageContent = await page.$$eval('#section-icons .tab-page', pages => {
            for (const p of pages) {
                if (getComputedStyle(p).display !== 'none') return p.textContent.trim();
            }
            return '';
        });
        assert(usersPageContent === 'Users list content', `Users tab shows correct content (got: "${usersPageContent}")`);

        await iconLabels[2].click();
        await delay(200);

        const errorsPageContent = await page.$$eval('#section-icons .tab-page', pages => {
            for (const p of pages) {
                if (getComputedStyle(p).display !== 'none') return p.textContent.trim();
            }
            return '';
        });
        assert(errorsPageContent === 'Error log content', `Errors tab shows correct content (got: "${errorsPageContent}")`);

        // ── Test 17: Keyboard wrap-around — ArrowRight on last tab ───
        // Currently on tab 3 (third) in basic section from earlier; go there
        const basicTab3 = (await page.$$('#section-basic .tab-label'))[2];
        await basicTab3.click();
        await delay(100);
        await basicTab3.focus();
        // ArrowRight from last tab should wrap to first
        await page.keyboard.press('ArrowRight');
        await delay(200);

        const afterWrapChecked = await page.$$eval('#section-basic .tab-input', inputs => {
            return inputs.map(i => i.checked);
        });
        assert(afterWrapChecked[0] === true, 'ArrowRight on last tab wraps to first tab');

        // Verify first page content is visible again
        const wrapPageContent = await page.$$eval('#section-basic .tab-page', pages => {
            for (const p of pages) {
                if (getComputedStyle(p).display !== 'none') return p.textContent.trim();
            }
            return '';
        });
        assert(wrapPageContent === 'Overview panel content', 'After wrap-around, first page content is visible');

        // ── Test 18: Keyboard wrap-around — ArrowLeft on first tab ───
        // Currently on first tab, ArrowLeft should wrap to last
        await page.keyboard.press('ArrowLeft');
        await delay(200);

        const afterLeftWrapChecked = await page.$$eval('#section-basic .tab-input', inputs => {
            return inputs.map(i => i.checked);
        });
        assert(afterLeftWrapChecked[2] === true, 'ArrowLeft on first tab wraps to last tab');

        // ── Test 19: Bottom tabs — click interaction ─────────────────
        const bottomLabels = await page.$$('#section-bottom .tab-label');
        await bottomLabels[1].click();
        await delay(200);

        const bottomAfterClick = await page.$$eval('#section-bottom .tab-input', inputs => inputs.map(i => i.checked));
        assert(bottomAfterClick[1] === true, 'Bottom tab click selects second tab');

        const bottomPageContent = await page.$$eval('#section-bottom .tab-page', pages => {
            for (const p of pages) {
                if (getComputedStyle(p).display !== 'none') return p.textContent.trim();
            }
            return '';
        });
        assert(bottomPageContent === 'Search content', `Bottom tab shows correct content (got: "${bottomPageContent}")`);

        // ── Final screenshot ─────────────────────────────────────────
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tp-04-final-state.png'), fullPage: true });
        console.log('Screenshot: tp-04-final-state.png');

    } catch (err) {
        console.error('Test error:', err.message);
        failed++;
        results.push(`  ✗ FATAL: ${err.message}`);
    }

    // ── Results ──────────────────────────────────────────────────────
    console.log('\n━━━ TABBED PANEL E2E RESULTS ━━━\n');
    results.forEach(r => console.log(r));
    console.log(`\n  ${passed} passed, ${failed} failed out of ${passed + failed} checks`);
    console.log(failed === 0 ? '\n=== ALL PASS ✓ ===' : '\n=== FAILURES ✗ ===');

    await browser.close();
    server.close();
    process.exit(failed > 0 ? 1 : 0);
}

run_tests().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
