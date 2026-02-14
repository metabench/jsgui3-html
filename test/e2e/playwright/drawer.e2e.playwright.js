const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_drawer_fixture_html } = require('../fixtures/complex/drawer_fixture');

const PORT = 4503;

const run_drawer_e2e = async () => {
    const html = build_drawer_fixture_html();
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

        const drawer = await page.$('.drawer');
        check(!!drawer, 'Drawer renders');

        const right_panel = await page.locator('.drawer-panel-right').count();
        check(right_panel === 1, 'Drawer uses right-position panel');

        const initially_open = await page.$eval('.drawer', el => el.classList.contains('is-open'));
        check(!initially_open, 'Drawer starts closed');

        await page.click('#open-drawer');
        const open_after_button = await page.$eval('.drawer', el => el.classList.contains('is-open'));
        check(open_after_button, 'Open button opens drawer');

        const overlay_visible = await page.$eval('.drawer-overlay', el => getComputedStyle(el).display !== 'none');
        check(overlay_visible, 'Overlay becomes visible when drawer opens');

        await page.click('.drawer-overlay');
        const closed_after_overlay = await page.$eval('.drawer', el => !el.classList.contains('is-open'));
        check(closed_after_overlay, 'Overlay click closes drawer');

        const drawer_closed_state = await page.$eval('.drawer', el => !el.classList.contains('is-open'));
        check(drawer_closed_state, 'Drawer remains closed after overlay interaction');

        await page.click('#open-drawer');
        await page.click('.drawer-close');
        const closed_after_close = await page.$eval('.drawer', el => !el.classList.contains('is-open'));
        check(closed_after_close, 'Close button closes drawer');

        await page.click('#open-drawer');
        await page.keyboard.press('Escape');
        const closed_after_escape = await page.$eval('.drawer', el => !el.classList.contains('is-open'));
        check(closed_after_escape, 'Escape closes drawer when open');

        await page.keyboard.press('Escape');
        const still_closed_after_extra_escape = await page.$eval('.drawer', el => !el.classList.contains('is-open'));
        check(still_closed_after_extra_escape, 'Escape while already closed keeps drawer closed');

        const log = await page.textContent('#log');
        check((log || '').trim() === 'close', 'Log reflects last close action');

        await page.screenshot({ path: 'screenshots/drawer-playwright.png', fullPage: true });

        console.log('\n━━━ Drawer Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Drawer Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_drawer_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
