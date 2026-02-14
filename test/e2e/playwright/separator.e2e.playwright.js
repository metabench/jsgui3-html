const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_separator_fixture_html } = require('../fixtures/unimplemented/separator_fixture');

const PORT = 4481;

const run_separator_e2e = async () => {
    const html = build_separator_fixture_html();
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

        const horizontal_exists = await page.$('#horizontal-wrap .jsgui-separator');
        const vertical_exists = await page.$('#vertical-wrap .jsgui-separator');
        check(!!horizontal_exists, 'Horizontal separator renders');
        check(!!vertical_exists, 'Vertical separator renders');

        const horizontal_orientation = await page.getAttribute('#horizontal-wrap .jsgui-separator', 'data-orientation');
        const vertical_orientation = await page.getAttribute('#vertical-wrap .jsgui-separator', 'data-orientation');
        check(horizontal_orientation === 'horizontal', 'Horizontal separator has horizontal orientation');
        check(vertical_orientation === 'vertical', 'Vertical separator has vertical orientation');

        const horizontal_aria_hidden = await page.getAttribute('#horizontal-wrap .jsgui-separator', 'aria-hidden');
        const vertical_role = await page.getAttribute('#vertical-wrap .jsgui-separator', 'role');
        const vertical_aria_orientation = await page.getAttribute('#vertical-wrap .jsgui-separator', 'aria-orientation');
        check(horizontal_aria_hidden === 'true', 'Decorative separator has aria-hidden=true');
        check(vertical_role === 'separator', 'Semantic separator has role=separator');
        check(vertical_aria_orientation === 'vertical', 'Semantic separator has aria-orientation=vertical');

        await page.click('#toggle');
        const toggled_orientation = await page.getAttribute('#vertical-wrap .jsgui-separator', 'data-orientation');
        const toggled_aria_orientation = await page.getAttribute('#vertical-wrap .jsgui-separator', 'aria-orientation');
        check(toggled_orientation === 'horizontal', 'Toggle updates orientation to horizontal');
        check(toggled_aria_orientation === 'horizontal', 'Toggle updates aria-orientation to horizontal');

        await page.screenshot({ path: 'screenshots/separator-playwright.png', fullPage: true });

        console.log('\n━━━ Separator Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Separator Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_separator_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
