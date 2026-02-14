const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_status_bar_fixture_html } = require('../fixtures/unimplemented/status_bar_fixture');

const PORT = 4497;

const run_status_bar_e2e = async () => {
    const html = build_status_bar_fixture_html();
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

        const bar = await page.$('.jsgui-status-bar');
        check(!!bar, 'Status bar renders');

        const role = await page.getAttribute('.jsgui-status-bar', 'role');
        const aria_live = await page.getAttribute('.jsgui-status-bar', 'aria-live');
        check(role === 'status', 'Status bar has status role');
        check(aria_live === 'polite', 'Status bar has polite aria-live');

        const initial_status = await page.getAttribute('.jsgui-status-bar', 'data-status');
        const initial_text = await page.textContent('.jsgui-status-bar .status-bar-left');
        check(initial_status === 'info', 'Initial status is info');
        check((initial_text || '').trim() === 'Ready', 'Initial text is Ready');

        await page.click('#set-success');
        const success_status = await page.getAttribute('.jsgui-status-bar', 'data-status');
        const success_text = await page.textContent('.jsgui-status-bar .status-bar-left');
        check(success_status === 'success', 'Status changes to success');
        check((success_text || '').trim() === 'Saved successfully', 'Success text updates');

        await page.click('#set-warning');
        const warning_status = await page.getAttribute('.jsgui-status-bar', 'data-status');
        const warning_meta = await page.textContent('.jsgui-status-bar .status-bar-right');
        check(warning_status === 'warning', 'Status changes to warning');
        check((warning_meta || '').trim() === 'Press Ctrl+S', 'Warning meta updates');

        await page.click('#set-error');
        const error_status = await page.getAttribute('.jsgui-status-bar', 'data-status');
        const error_text = await page.textContent('.jsgui-status-bar .status-bar-left');
        check(error_status === 'error', 'Status changes to error');
        check((error_text || '').trim() === 'Save failed', 'Error text updates');

        await page.screenshot({ path: 'screenshots/status-bar-playwright.png', fullPage: true });

        console.log('\n━━━ Status_Bar Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Status_Bar Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_status_bar_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
