const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { build_split_button_fixture_html } = require('../fixtures/unimplemented/split_button_fixture');

const PORT = 4495;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
    const html = build_split_button_fixture_html();
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });
    await new Promise(resolve => server.listen(PORT, resolve));

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });

    let passed = 0;
    let failed = 0;
    const results = [];
    const assert = (condition, label) => {
        if (condition) {
            passed++;
            results.push(`  ✓ ${label}`);
        } else {
            failed++;
            results.push(`  ✗ ${label}`);
        }
    };

    const root = await page.$('.jsgui-split-button');
    assert(!!root, 'Split button renders');

    const items = await page.$$('.split-button-menu-item');
    assert(items.length === 3, 'Three menu items render');

    const expanded_initial = await page.getAttribute('.split-button-trigger', 'aria-expanded');
    assert(expanded_initial === 'false', 'Trigger starts collapsed');

    await page.click('.split-button-primary');
    await delay(100);
    const log_primary = await page.textContent('#log');
    assert(log_primary === 'action:save:primary', 'Primary click emits primary action');

    await page.click('.split-button-trigger');
    await delay(100);
    const open_after_click = await page.$eval('.jsgui-split-button', el => el.classList.contains('split-button-open'));
    assert(open_after_click, 'Trigger click opens menu');

    const expanded_open = await page.getAttribute('.split-button-trigger', 'aria-expanded');
    assert(expanded_open === 'true', 'aria-expanded true when open');

    await page.click('.split-button-menu-item[data-action-id="save_as"]');
    await delay(100);
    const log_menu = await page.textContent('#log');
    assert(log_menu === 'action:save_as:menu', 'Menu item click emits menu action');

    const open_after_item = await page.$eval('.jsgui-split-button', el => el.classList.contains('split-button-open'));
    assert(!open_after_item, 'Menu closes after item click');

    await page.focus('.split-button-trigger');
    await page.keyboard.press('ArrowDown');
    await delay(100);
    const open_keyboard = await page.$eval('.jsgui-split-button', el => el.classList.contains('split-button-open'));
    assert(open_keyboard, 'ArrowDown opens menu');

    await page.keyboard.press('Escape');
    await delay(100);
    const open_after_escape = await page.$eval('.jsgui-split-button', el => el.classList.contains('split-button-open'));
    assert(!open_after_escape, 'Escape closes menu');

    await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'split_button.png'),
        fullPage: true
    });

    console.log('\n━━━ Split_Button Playwright Results ━━━\n');
    results.forEach(r => console.log(r));
    console.log(`\n  ${passed} passed, ${failed} failed`);
    console.log(failed === 0 ? '\n=== ALL PASS ✓ ===' : '\n=== FAILURES ✗ ===');

    await browser.close();
    await new Promise(resolve => server.close(resolve));
    process.exit(failed > 0 ? 1 : 0);
};

run().catch(async err => {
    console.error('Fatal error in Split_Button Playwright test:', err);
    process.exit(1);
});
