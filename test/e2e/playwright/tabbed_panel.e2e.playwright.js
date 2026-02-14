const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_tabbed_panel_fixture_html } = require('../fixtures/complex/tabbed_panel_fixture');

const PORT = 4501;

const run_tabbed_panel_e2e = async () => {
    const html = build_tabbed_panel_fixture_html();
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });

    await new Promise(resolve => server.listen(PORT, resolve));

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    let passed = 0;
    let failed = 0;
    const results = [];

    const check = (condition, label) => {
        if (condition) {
            passed++;
            results.push(`  ✓ ${label}`);
        } else {
            failed++;
            results.push(`  ✗ ${label}`);
        }
    };

    try {
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });

        const root = await page.$('.jsgui-tabs');
        check(!!root, 'Tabbed panel renders');

        const tablist_role = await page.getAttribute('.jsgui-tabs', 'role');
        check(tablist_role === 'tablist', 'Tablist role is present');

        const selected_initial = await page.getAttribute('.tab-label[data-tab-index="0"]', 'aria-selected');
        const page_initial = await page.getAttribute('.tab-page[data-tab-index="0"]', 'aria-hidden');
        check(selected_initial === 'true', 'First tab selected initially');
        check(page_initial === 'false', 'First tab page visible initially');

        await page.click('.tab-label[data-tab-index="1"]');
        const selected_second = await page.getAttribute('.tab-label[data-tab-index="1"]', 'aria-selected');
        const second_visible = await page.getAttribute('.tab-page[data-tab-index="1"]', 'aria-hidden');
        check(selected_second === 'true', 'Click selects second tab');
        check(second_visible === 'false', 'Second tab page visible after click');

        await page.focus('.tab-label[data-tab-index="1"]');
        await page.keyboard.press('ArrowRight');
        const selected_third = await page.getAttribute('.tab-label[data-tab-index="2"]', 'aria-selected');
        check(selected_third === 'true', 'ArrowRight moves selection to next tab');

        await page.keyboard.press('ArrowLeft');
        const selected_second_after_left = await page.getAttribute('.tab-label[data-tab-index="1"]', 'aria-selected');
        check(selected_second_after_left === 'true', 'ArrowLeft moves selection to previous tab');

        await page.keyboard.press('ArrowLeft');
        const selected_first_after_left = await page.getAttribute('.tab-label[data-tab-index="0"]', 'aria-selected');
        check(selected_first_after_left === 'true', 'ArrowLeft moves selection to first tab');

        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        const selected_third_again = await page.getAttribute('.tab-label[data-tab-index="2"]', 'aria-selected');
        check(selected_third_again === 'true', 'ArrowRight can move forward repeatedly to third tab');

        const disabled_attr = await page.getAttribute('.tab-label[data-tab-index="3"]', 'aria-disabled');
        check(disabled_attr === 'true', 'Disabled tab has aria-disabled');

        await page.dispatchEvent('.tab-label[data-tab-index="3"]', 'click');
        const still_selected_third = await page.getAttribute('.tab-label[data-tab-index="2"]', 'aria-selected');
        check(still_selected_third === 'true', 'Disabled tab cannot be activated');

        const active_controls_visible_panel = await page.evaluate(() => {
            const active_tab = document.querySelector('.tab-label[aria-selected="true"]');
            if (!active_tab) return false;
            const controls = active_tab.getAttribute('aria-controls');
            if (!controls) return false;
            const panel = document.getElementById(controls);
            if (!panel) return false;
            return panel.getAttribute('aria-hidden') === 'false';
        });
        check(active_controls_visible_panel, 'Active tab aria-controls points to visible panel');

        await page.click('.tab-label[data-tab-index="2"] .tab-close');
        const closed_log = await page.textContent('#log');
        const closed_tab_count = await page.locator('.tab-label[data-tab-index="2"]').count();
        check((closed_log || '').startsWith('closed:2'), 'Close button logs closed tab index');
        check(closed_tab_count === 0, 'Closable tab is removed from DOM');

        await page.screenshot({ path: 'screenshots/tabbed-panel-playwright.png', fullPage: true });

        console.log('\n━━━ Tabbed_Panel Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Tabbed_Panel Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_tabbed_panel_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
