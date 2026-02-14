const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_console_panel_fixture_html } = require('../fixtures/unimplemented/console_panel_fixture');

const PORT = 4498;

const run_console_panel_e2e = async () => {
    const html = build_console_panel_fixture_html();
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

        const root = await page.$('.jsgui-console-panel');
        check(!!root, 'Console panel renders');

        const role = await page.getAttribute('.jsgui-console-panel', 'role');
        const output_role = await page.getAttribute('.console-panel-output', 'role');
        check(role === 'region', 'Console panel has region role');
        check(output_role === 'log', 'Output area has log role');

        const initial_lines = (await page.textContent('.console-panel-output') || '')
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);
        check(initial_lines.length === 2, 'Initial console lines render');

        await page.click('#append');
        await page.click('#append-error');
        const lines_after_append = (await page.textContent('.console-panel-output') || '')
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);
        check(lines_after_append.length === 3, 'Console trims to max_lines');
        check(lines_after_append[lines_after_append.length - 1] === '[error] Build failed', 'Latest appended line is retained');

        await page.click('#clear');
        const lines_after_clear = (await page.textContent('.console-panel-output') || '')
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);
        check(lines_after_clear.length === 0, 'Clear action empties console output');

        await page.screenshot({ path: 'screenshots/console-panel-playwright.png', fullPage: true });

        console.log('\n━━━ Console_Panel Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Console_Panel Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_console_panel_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
