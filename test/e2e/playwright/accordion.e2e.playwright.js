const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_accordion_fixture_html } = require('../fixtures/complex/accordion_fixture');

const PORT = 4502;

const run_accordion_e2e = async () => {
    const html = build_accordion_fixture_html();
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

        const root = await page.$('.jsgui-accordion');
        check(!!root, 'Accordion renders');

        const sections = await page.$$('.accordion-section');
        check(sections.length === 3, 'Three accordion sections render');

        const initial_open_a = await page.$eval('.accordion-section:nth-of-type(1)', el => el.classList.contains('is-open'));
        check(initial_open_a, 'First section starts open');

        await page.click('.accordion-section:nth-of-type(2) .accordion-header');
        const open_b = await page.$eval('.accordion-section:nth-of-type(2)', el => el.classList.contains('is-open'));
        check(open_b, 'Click opens second section');

        await page.click('.accordion-section:nth-of-type(1) .accordion-header');
        const closed_a = await page.$eval('.accordion-section:nth-of-type(1)', el => !el.classList.contains('is-open'));
        check(closed_a, 'Click closes first section');

        await page.focus('.accordion-section:nth-of-type(3) .accordion-header');
        await page.keyboard.press('Enter');
        const open_c = await page.$eval('.accordion-section:nth-of-type(3)', el => el.classList.contains('is-open'));
        check(open_c, 'Enter key toggles third section open');

        await page.keyboard.press('Space');
        const closed_c = await page.$eval('.accordion-section:nth-of-type(3)', el => !el.classList.contains('is-open'));
        check(closed_c, 'Space key toggles third section closed');

        await page.keyboard.press('Enter');
        const reopened_c = await page.$eval('.accordion-section:nth-of-type(3)', el => el.classList.contains('is-open'));
        check(reopened_c, 'Repeated Enter reopens third section');

        const multiple_open = await page.$$eval('.accordion-section.is-open', els => els.length);
        check(multiple_open >= 2, 'Multiple sections can remain open with allow_multiple=true');

        const log = await page.textContent('#log');
        check((log || '').startsWith('toggle:c:'), 'Interaction log reflects latest toggle');

        await page.screenshot({ path: 'screenshots/accordion-playwright.png', fullPage: true });

        console.log('\n━━━ Accordion Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Accordion Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_accordion_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
