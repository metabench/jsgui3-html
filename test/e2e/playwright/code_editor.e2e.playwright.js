const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_code_editor_fixture_html } = require('../fixtures/unimplemented/code_editor_fixture');

const PORT = 4499;

const run_code_editor_e2e = async () => {
    const html = build_code_editor_fixture_html();
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

        const root = await page.$('.jsgui-code-editor');
        check(!!root, 'Code editor renders');

        const root_role = await page.getAttribute('.jsgui-code-editor', 'role');
        const language_attr = await page.getAttribute('.jsgui-code-editor', 'data-language');
        check(root_role === 'region', 'Code editor has region role');
        check(language_attr === 'javascript', 'Initial language is javascript');

        const initial_value = await page.inputValue('.code-editor-textarea');
        check(initial_value.includes('const sum'), 'Initial value renders in textarea');

        await page.fill('.code-editor-textarea', 'console.log("hello");');
        const typed_value = await page.inputValue('.code-editor-textarea');
        check(typed_value === 'console.log("hello");', 'Textarea accepts typed code');

        await page.click('#set-ts');
        const language_after = await page.getAttribute('.jsgui-code-editor', 'data-language');
        const language_label = await page.textContent('.code-editor-language');
        check(language_after === 'typescript', 'Language data attribute updates');
        check((language_label || '').trim() === 'typescript', 'Language label updates');

        await page.click('#set-sample');
        const sample_value = await page.inputValue('.code-editor-textarea');
        check(sample_value.includes('interface Point'), 'Sample setter updates textarea value');

        await page.screenshot({ path: 'screenshots/code-editor-playwright.png', fullPage: true });

        console.log('\n━━━ Code_Editor Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Code_Editor Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_code_editor_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
