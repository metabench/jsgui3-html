const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_link_button_fixture_html } = require('../fixtures/unimplemented/link_button_fixture');

const PORT = 4484;

const run_link_button_e2e = async () => {
    const html = build_link_button_fixture_html();
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

        const hover_underline_mode = await page.getAttribute('#hover .jsgui-link-button', 'data-underline');
        const always_underline_mode = await page.getAttribute('#always .jsgui-link-button', 'data-underline');
        const none_underline_mode = await page.getAttribute('#none .jsgui-link-button', 'data-underline');
        check(hover_underline_mode === 'hover', 'Hover underline mode set');
        check(always_underline_mode === 'always', 'Always underline mode set');
        check(none_underline_mode === 'none', 'None underline mode set');

        await page.click('#hover .jsgui-link-button');
        const log_after_hover = await page.textContent('#log');
        check((log_after_hover || '').trim() === 'hover-click', 'Hover-mode button click handled');

        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        const log_after_enter = await page.textContent('#log');
        check((log_after_enter || '').trim().length > 0, 'Keyboard Enter triggers a link-button action');

        const disabled_attr = await page.getAttribute('#disabled .jsgui-link-button', 'disabled');
        check(disabled_attr !== null, 'Disabled link button has disabled attribute');

        const log_before_disabled = await page.textContent('#log');
        await page.click('#disabled .jsgui-link-button', { force: true });
        const log_after_disabled = await page.textContent('#log');
        check((log_before_disabled || '').trim() === (log_after_disabled || '').trim(), 'Disabled link button does not activate');

        await page.screenshot({ path: 'screenshots/link-button-playwright.png', fullPage: true });

        console.log('\n━━━ Link_Button Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Link_Button Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_link_button_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
