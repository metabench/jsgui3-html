const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_group_box_fixture_html } = require('../fixtures/unimplemented/group_box_fixture');

const PORT = 4482;

const run_group_box_e2e = async () => {
    const html = build_group_box_fixture_html();
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

        const fieldset_count = await page.locator('#normal fieldset.jsgui-group-box').count();
        check(fieldset_count === 1, 'Fieldset-mode Group_Box renders as fieldset');

        const legend_text = await page.locator('#normal .group-box-legend').innerText();
        check(legend_text.trim() === 'Customer Details', 'Legend text renders');

        const invalid_role = await page.getAttribute('#invalid .jsgui-group-box', 'role');
        const invalid_aria = await page.getAttribute('#invalid .jsgui-group-box', 'aria-invalid');
        check(invalid_role === 'group', 'Non-fieldset Group_Box has role=group');
        check(invalid_aria === 'true', 'Invalid Group_Box has aria-invalid=true');

        await page.click('#toggle-invalid');
        const invalid_after_toggle = await page.getAttribute('#invalid .jsgui-group-box', 'aria-invalid');
        check(invalid_after_toggle === null, 'Toggle removes invalid aria state');

        await page.click('#toggle-invalid');
        const invalid_after_second = await page.getAttribute('#invalid .jsgui-group-box', 'aria-invalid');
        check(invalid_after_second === 'true', 'Toggle restores invalid aria state');

        const input_exists = await page.locator('#normal input[type="text"]').count();
        check(input_exists === 1, 'Nested content renders inside Group_Box content area');

        await page.screenshot({ path: 'screenshots/group-box-playwright.png', fullPage: true });

        console.log('\n━━━ Group_Box Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Group_Box Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_group_box_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
