const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_icon_button_fixture_html } = require('../fixtures/unimplemented/icon_button_fixture');

const PORT = 4483;

const run_icon_button_e2e = async () => {
    const html = build_icon_button_fixture_html();
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });

    await new Promise(resolve => server.listen(PORT, resolve));

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

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

        const normal_label = await page.getAttribute('#normal-wrap .jsgui-icon-button', 'aria-label');
        const normal_title = await page.getAttribute('#normal-wrap .jsgui-icon-button', 'title');
        check(normal_label === 'Print', 'Normal Icon_Button has aria-label');
        check(normal_title === 'Print document', 'Normal Icon_Button has tooltip title');

        await page.click('#normal-wrap .jsgui-icon-button');
        const log_after_normal = await page.textContent('#log');
        check((log_after_normal || '').trim() === 'normal-click', 'Normal button click is handled');

        const before_pressed = await page.getAttribute('#toggle-wrap .jsgui-icon-button', 'aria-pressed');
        await page.click('#toggle-wrap .jsgui-icon-button');
        const after_pressed = await page.getAttribute('#toggle-wrap .jsgui-icon-button', 'aria-pressed');
        check(before_pressed === 'false' && after_pressed === 'true', 'Toggle button updates aria-pressed state');

        await page.click('#toggle-wrap .jsgui-icon-button');
        const after_second = await page.getAttribute('#toggle-wrap .jsgui-icon-button', 'aria-pressed');
        check(after_second === 'false', 'Toggle button can be turned off');

        const disabled_attr = await page.getAttribute('#disabled-wrap .jsgui-icon-button', 'disabled');
        check(disabled_attr !== null, 'Disabled button has disabled attribute');

        const log_before_disabled = await page.textContent('#log');
        await page.click('#disabled-wrap .jsgui-icon-button', { force: true });
        const log_after_disabled = await page.textContent('#log');
        check((log_before_disabled || '').trim() === (log_after_disabled || '').trim(), 'Disabled button does not trigger action');

        await page.screenshot({ path: 'screenshots/icon-button-playwright.png', fullPage: true });

        console.log('\n━━━ Icon_Button Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Icon_Button Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_icon_button_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
