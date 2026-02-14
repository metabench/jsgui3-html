const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_form_designer_fixture_html } = require('../fixtures/unimplemented/form_designer_fixture');

const PORT = 4500;

const run_form_designer_e2e = async () => {
    const html = build_form_designer_fixture_html();
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

        const root = await page.$('.jsgui-form-designer');
        check(!!root, 'Form designer renders');

        const role = await page.getAttribute('.jsgui-form-designer', 'role');
        check(role === 'region', 'Form designer has region role');

        const initial_rows = await page.$$('.form-designer-row');
        check(initial_rows.length === 3, 'Initial field rows render');

        await page.click('#add');
        const rows_after_add = await page.$$('.form-designer-row');
        check(rows_after_add.length === 4, 'Add action appends a new field row');

        await page.click('#remove-email');
        const rows_after_remove = await page.$$('.form-designer-row');
        const email_row = await page.$('.form-designer-row[data-field-id="email"]');
        check(rows_after_remove.length === 3, 'Remove action deletes one field row');
        check(!email_row, 'Removed field row is absent');

        await page.click('#move-notes-up');
        const first_two_ids = await page.$$eval('.form-designer-row', rows => rows.slice(0, 2).map(r => r.getAttribute('data-field-id')));
        check(first_two_ids[1] === 'name' || first_two_ids[0] === 'notes', 'Move-up action changes row ordering');

        await page.screenshot({ path: 'screenshots/form-designer-playwright.png', fullPage: true });

        console.log('\n━━━ Form_Designer Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Form_Designer Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_form_designer_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
