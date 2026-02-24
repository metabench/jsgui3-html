const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_showcase_app_fixture_html } = require('../fixtures/complex/showcase_app_fixture');

const PORT = 4504;

const run_showcase_app_e2e = async () => {
    const html = build_showcase_app_fixture_html();
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });

    await new Promise(resolve => server.listen(PORT, resolve));

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1380, height: 920 } });
    const page_errors = [];
    page.on('pageerror', err => {
        page_errors.push(err && err.stack ? err.stack : (err && err.message ? err.message : String(err)));
    });

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

        check(page_errors.length === 0, 'Fixture script has no page errors');
        if (page_errors.length) {
            console.log('Page errors:', page_errors);
        }

        const shell = await page.$('.showcase-shell');
        check(!!shell, 'Showcase app shell renders');

        const section_count = await page.$$('.showcase-content .card');
        check(section_count.length >= 4, 'Showcase contains multiple control sections');

        const initial_theme = await page.getAttribute('html', 'data-admin-theme');
        check(initial_theme === 'vs-default', 'Initial theme preset is vs-default');

        await page.selectOption('#theme-preset-select', 'vs-dark');
        const changed_theme = await page.getAttribute('html', 'data-admin-theme');
        check(changed_theme === 'vs-dark', 'Theme preset selection updates data-admin-theme');

        await page.fill('#theme-accent', '#ff0066');
        await page.dispatchEvent('#theme-accent', 'input');
        const accent_value = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--admin-accent').trim());
        check(accent_value === '#ff0066', 'Accent theme variable updates from editor input');

        await page.fill('#theme-radius', '10');
        await page.dispatchEvent('#theme-radius', 'input');
        const radius_value = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--admin-radius').trim());
        check(radius_value === '10px', 'Radius theme variable updates with px unit');

        await page.click('#theme-reset');
        const reset_radius = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--admin-radius').trim());
        check(reset_radius !== '10px', 'Reset restores preset value after manual edit');

        await page.click('#theme-export');
        const exported_json = await page.$eval('#theme-json', el => el.value || '');
        check(exported_json.includes('"preset"'), 'Theme export writes JSON payload');

        await page.fill('#theme-json', '{"preset":"terminal","overrides":{"--admin-accent":"#11aa22"}}');
        await page.click('#theme-import');
        const imported_theme = await page.getAttribute('html', 'data-admin-theme');
        const imported_accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--admin-accent').trim());
        check(imported_theme === 'terminal', 'Theme import applies preset from JSON');
        check(imported_accent === '#11aa22', 'Theme import applies override variables');

        await page.click('#theme-save-local');
        const has_saved_state = await page.evaluate(() => !!localStorage.getItem('showcase_theme_state_v1'));
        check(has_saved_state, 'Save local stores theme state in localStorage');

        await page.click('#theme-clear-local');
        const has_cleared_state = await page.evaluate(() => !localStorage.getItem('showcase_theme_state_v1'));
        check(has_cleared_state, 'Clear saved removes theme state from localStorage');

        await page.click('#status-cycle');
        const status_after_cycle = await page.getAttribute('#showcase-status-wrap .jsgui-status-bar', 'data-status');
        check(status_after_cycle === 'success', 'Status cycle button updates status bar state');

        await page.click('#showcase-open-drawer');
        const drawer_open = await page.$eval('#showcase-drawer .drawer', el => el.classList.contains('is-open'));
        check(drawer_open, 'Drawer opens from showcase control button');

        await page.dispatchEvent('#showcase-drawer .drawer-overlay', 'click');
        const drawer_closed = await page.$eval('#showcase-drawer .drawer', el => !el.classList.contains('is-open'));
        check(drawer_closed, 'Drawer overlay closes drawer');

        const initial_console_lines = (await page.textContent('.console-panel-output') || '').split(/\r?\n/).filter(Boolean).length;
        await page.click('#console-append');
        const appended_console_lines = (await page.textContent('.console-panel-output') || '').split(/\r?\n/).filter(Boolean).length;
        check(appended_console_lines >= initial_console_lines, 'Console append action updates output lines');

        await page.click('#console-clear');
        const cleared_console_lines = (await page.textContent('.console-panel-output') || '').split(/\r?\n/).filter(Boolean).length;
        check(cleared_console_lines === 0, 'Console clear action empties output');

        await page.click('.tab-label[data-tab-index="1"]');
        const tab_selected = await page.getAttribute('.tab-label[data-tab-index="1"]', 'aria-selected');
        check(tab_selected === 'true', 'Tabbed panel remains interactive inside showcase app');

        await page.click('.showcase-nav-link[data-target="showcase-editor"]');
        const nav_active = await page.$eval('.showcase-nav-link[data-target="showcase-editor"]', el => el.classList.contains('is-active'));
        check(nav_active, 'Sidebar navigation updates active link state');

        await page.screenshot({ path: 'screenshots/showcase-app-playwright.png', fullPage: true });

        console.log('\n━━━ Showcase_App Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Showcase_App Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_showcase_app_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
