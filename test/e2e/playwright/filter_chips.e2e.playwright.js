const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_filter_chips_fixture_html } = require('../fixtures/unimplemented/filter_chips_fixture');

const PORT = 4496;

const run_filter_chips_e2e = async () => {
    const html = build_filter_chips_fixture_html();
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

        const root_role = await page.getAttribute('.jsgui-filter-chips', 'role');
        check(root_role === 'group', 'Filter chips container has group role');

        const chips = await page.$$('.filter-chip');
        check(chips.length === 4, 'All filter chips render');

        const all_pressed = await page.getAttribute('.filter-chip[data-chip-id="all"]', 'aria-pressed');
        check(all_pressed === 'true', 'Initial selected chip is pressed');

        const log_initial = await page.textContent('#log');
        check((log_initial || '').trim() === 'all', 'Initial selected ids log is correct');

        await page.click('.filter-chip[data-chip-id="open"]');
        const open_pressed = await page.getAttribute('.filter-chip[data-chip-id="open"]', 'aria-pressed');
        check(open_pressed === 'true', 'Click selects open chip');

        await page.focus('.filter-chip[data-chip-id="closed"]');
        await page.keyboard.press('Enter');
        const closed_pressed = await page.getAttribute('.filter-chip[data-chip-id="closed"]', 'aria-pressed');
        check(closed_pressed === 'true', 'Enter key selects closed chip');

        const log_after_multi = (await page.textContent('#log') || '').trim();
        check(log_after_multi.includes('all') && log_after_multi.includes('open') && log_after_multi.includes('closed'), 'Multi-select state tracked in log');

        const log_before_disabled = (await page.textContent('#log') || '').trim();
        await page.click('.filter-chip[data-chip-id="archived"]', { force: true });
        const log_after_disabled = (await page.textContent('#log') || '').trim();
        check(log_before_disabled === log_after_disabled, 'Disabled chip does not change selection state');

        await page.click('.filter-chip[data-chip-id="open"]');
        const open_pressed_after_toggle = await page.getAttribute('.filter-chip[data-chip-id="open"]', 'aria-pressed');
        check(open_pressed_after_toggle === 'false', 'Click toggles selected chip off');

        await page.screenshot({ path: 'screenshots/filter-chips-playwright.png', fullPage: true });

        console.log('\n━━━ Filter_Chips Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Filter_Chips Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_filter_chips_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
