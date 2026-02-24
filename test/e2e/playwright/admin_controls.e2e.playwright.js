/**
 * Admin Controls E2E — Playwright Test
 *
 * Tests activated (client-side interactive) behavior of all 9 upgraded
 * admin controls: Data_Table, Sidebar_Nav, Breadcrumbs, Toolbar,
 * Tabbed_Panel, Master_Detail, Form_Container, Modal, Toast.
 *
 * Run: node test/e2e/playwright/admin_controls.e2e.playwright.js
 */

const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const { build_admin_controls_fixture_html } = require('../fixtures/complex/admin_controls_fixture');

const PORT = 4510;

const run_admin_controls_e2e = async () => {
    const html = build_admin_controls_fixture_html();
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });

    await new Promise(resolve => server.listen(PORT, resolve));

    const browser = await chromium.launch({ headless: true });
    const b_context = await browser.newContext({ viewport: { width: 1380, height: 920 } });
    const page = await b_context.newPage();
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

        // ── 0. No page errors ──
        check(page_errors.length === 0, 'Fixture loads without page errors');
        if (page_errors.length) {
            console.log('Page errors:', page_errors);
        }

        /* ═══════════════════════════════════════════
         *  DATA TABLE
         * ═══════════════════════════════════════════ */

        const table = await page.$('#table-wrap .jsgui-data-table');
        check(!!table, 'Data_Table: renders');

        const grid_role = await page.getAttribute('#table-wrap .jsgui-data-table', 'role');
        check(grid_role === 'grid', 'Data_Table: has role=grid');

        const row_count = await page.$$eval('#table-wrap tbody tr', rows => rows.length);
        check(row_count === 5, 'Data_Table: renders 5 data rows');

        // Click on second row
        await page.click('#table-wrap tbody tr:nth-child(2)');
        const selected_row = await page.$eval('#table-wrap tbody tr:nth-child(2)', el => el.classList.contains('is-selected'));
        check(selected_row, 'Data_Table: click row adds is-selected');

        const selected_aria = await page.getAttribute('#table-wrap tbody tr:nth-child(2)', 'aria-selected');
        check(selected_aria === 'true', 'Data_Table: clicked row has aria-selected=true');

        // Click a different row should deselect previous
        await page.click('#table-wrap tbody tr:nth-child(4)');
        const prev_deselected = await page.$eval('#table-wrap tbody tr:nth-child(2)', el => !el.classList.contains('is-selected'));
        check(prev_deselected, 'Data_Table: clicking another row deselects previous');

        // Density toggle
        await page.evaluate(() => window.set_table_density('compact'));
        const density = await page.getAttribute('#table-wrap .jsgui-data-table', 'data-density');
        check(density === 'compact', 'Data_Table: density toggle sets data-density=compact');

        /* ═══════════════════════════════════════════
         *  SIDEBAR NAV
         * ═══════════════════════════════════════════ */

        const nav = await page.$('#nav-wrap .jsgui-sidebar-nav');
        check(!!nav, 'Sidebar_Nav: renders');

        const tree_role = await page.getAttribute('#nav-wrap .sidebar-list', 'role');
        check(tree_role === 'tree', 'Sidebar_Nav: list has role=tree');

        // Initial active
        const initial_active = await page.$eval('#nav-wrap .sidebar-link[data-nav-id="all"]', el => el.classList.contains('is-active'));
        check(initial_active, 'Sidebar_Nav: initial active item is "all"');

        // Click another nav item
        await page.click('#nav-wrap .sidebar-link[data-nav-id="dept-platform"]');
        const new_active = await page.$eval('#nav-wrap .sidebar-link[data-nav-id="dept-platform"]', el => el.classList.contains('is-active'));
        check(new_active, 'Sidebar_Nav: click sets new active item');

        const old_deactive = await page.$eval('#nav-wrap .sidebar-link[data-nav-id="all"]', el => !el.classList.contains('is-active'));
        check(old_deactive, 'Sidebar_Nav: previous item loses is-active');

        const nav_log = await page.textContent('#log');
        check(nav_log === 'nav:active:dept-platform', 'Sidebar_Nav: click logs correct nav-id');

        /* ═══════════════════════════════════════════
         *  BREADCRUMBS
         * ═══════════════════════════════════════════ */

        const breadcrumbs = await page.$('#breadcrumbs-wrap .jsgui-breadcrumbs');
        check(!!breadcrumbs, 'Breadcrumbs: renders');

        const aria_current = await page.$('#breadcrumbs-wrap [aria-current="page"]');
        check(!!aria_current, 'Breadcrumbs: has aria-current=page');

        // Nav click should update last breadcrumb
        await page.click('#nav-wrap .sidebar-link[data-nav-id="dept-data"]');
        const last_crumb = await page.$eval('#breadcrumbs-wrap [aria-current="page"]', el => el.textContent.trim());
        check(last_crumb === 'Data', 'Breadcrumbs: nav click updates last breadcrumb label');

        /* ═══════════════════════════════════════════
         *  TOOLBAR
         * ═══════════════════════════════════════════ */

        const toolbar = await page.$('#toolbar-wrap .jsgui-toolbar');
        check(!!toolbar, 'Toolbar: renders');

        const toolbar_role = await page.getAttribute('#toolbar-wrap .jsgui-toolbar', 'role');
        check(toolbar_role === 'toolbar', 'Toolbar: has role=toolbar');

        // Click 'add' button
        await page.click('#toolbar-wrap [data-item-id="add"]');
        const add_log = await page.textContent('#log');
        check(add_log === 'toolbar:action:add', 'Toolbar: click logs action');

        // Density toggle group — mutual exclusion
        const initial_pressed = await page.getAttribute('#toolbar-wrap [data-item-id="density-comfortable"]', 'aria-pressed');
        check(initial_pressed === 'true', 'Toolbar: initial density toggle is pressed');

        await page.click('#toolbar-wrap [data-item-id="density-compact"]');
        const compact_pressed = await page.getAttribute('#toolbar-wrap [data-item-id="density-compact"]', 'aria-pressed');
        const comf_unpressed = await page.getAttribute('#toolbar-wrap [data-item-id="density-comfortable"]', 'aria-pressed');
        check(compact_pressed === 'true', 'Toolbar: toggle group activates clicked');
        check(comf_unpressed === 'false', 'Toolbar: toggle group deactivates previous');

        /* ═══════════════════════════════════════════
         *  TABBED PANEL
         * ═══════════════════════════════════════════ */

        const tabs_root = await page.$('#tabs-wrap');
        check(!!tabs_root, 'Tabbed_Panel: renders');

        const tablist_role = await page.$eval('#tabs-wrap .jsgui-tabs, #tabs-wrap .tab-container', el => el.getAttribute('role'));
        check(tablist_role === 'tablist', 'Tabbed_Panel: has role=tablist');

        // Click second tab
        await page.click('#tabs-wrap .tab-label[data-tab-index="1"]');
        const tab_b_selected = await page.getAttribute('#tabs-wrap .tab-label[data-tab-index="1"]', 'aria-selected');
        check(tab_b_selected === 'true', 'Tabbed_Panel: click selects second tab');

        const tab_b_visible = await page.getAttribute('#tabs-wrap .tab-page[data-tab-index="1"]', 'aria-hidden');
        check(tab_b_visible === 'false', 'Tabbed_Panel: second tab page visible after click');

        // Keyboard: ArrowRight moves to third tab
        await page.focus('#tabs-wrap .tab-label[data-tab-index="1"]');
        await page.keyboard.press('ArrowRight');
        const tab_c_selected = await page.getAttribute('#tabs-wrap .tab-label[data-tab-index="2"]', 'aria-selected');
        check(tab_c_selected === 'true', 'Tabbed_Panel: ArrowRight moves to next tab');

        // ArrowLeft returns to second
        await page.keyboard.press('ArrowLeft');
        const tab_b_again = await page.getAttribute('#tabs-wrap .tab-label[data-tab-index="1"]', 'aria-selected');
        check(tab_b_again === 'true', 'Tabbed_Panel: ArrowLeft moves to previous tab');

        /* ═══════════════════════════════════════════
         *  MASTER DETAIL
         * ═══════════════════════════════════════════ */

        const md = await page.$('#md-wrap .master-detail');
        check(!!md, 'Master_Detail: renders');

        const listbox_role = await page.getAttribute('#md-wrap .master-detail-master', 'role');
        check(listbox_role === 'listbox', 'Master_Detail: master has role=listbox');

        // Initial selection
        const initial_selected = await page.$eval('#md-wrap .master-detail-item[data-item-id="1"]', el => el.classList.contains('is-selected'));
        check(initial_selected, 'Master_Detail: initial item selected');

        // Click second item
        await page.click('#md-wrap .master-detail-item[data-item-id="2"]');
        const second_selected = await page.$eval('#md-wrap .master-detail-item[data-item-id="2"]', el => el.classList.contains('is-selected'));
        check(second_selected, 'Master_Detail: click selects new item');

        const detail_text = await page.textContent('#md-wrap .master-detail-detail');
        check(detail_text.includes('details'), 'Master_Detail: detail pane updates on selection');

        // Keyboard: ArrowDown
        await page.focus('#md-wrap .master-detail-item[data-item-id="2"]');
        await page.keyboard.press('ArrowDown');
        const third_via_kb = await page.$eval('#md-wrap .master-detail-item[data-item-id="3"]', el => el.classList.contains('is-selected'));
        check(third_via_kb, 'Master_Detail: ArrowDown selects next item');

        /* ═══════════════════════════════════════════
         *  FORM CONTAINER
         * ═══════════════════════════════════════════ */

        const form = await page.$('#form-wrap form');
        check(!!form, 'Form_Container: renders as <form>');

        // Submit empty form — validation error
        await page.dispatchEvent('#form-wrap form', 'submit');
        const invalid_log = await page.textContent('#log');
        check(invalid_log === 'form:submit:invalid', 'Form_Container: empty submit triggers validation');

        const aria_invalid = await page.getAttribute('#form-wrap [name="fullname"]', 'aria-invalid');
        check(aria_invalid === 'true', 'Form_Container: empty required field has aria-invalid=true');

        const describedby = await page.getAttribute('#form-wrap [name="fullname"]', 'aria-describedby');
        check(!!describedby, 'Form_Container: field has aria-describedby');

        // Fill all required fields and submit — success
        await page.fill('#form-wrap [name="fullname"]', 'Test User');
        await page.fill('#form-wrap [name="dept"]', 'Platform');
        await page.dispatchEvent('#form-wrap form', 'submit');
        const valid_log = await page.textContent('#log');
        check(valid_log === 'form:submit:success', 'Form_Container: valid submit logs success');

        const valid_aria = await page.getAttribute('#form-wrap [name="fullname"]', 'aria-invalid');
        check(valid_aria === 'false', 'Form_Container: valid field has aria-invalid=false');

        /* ═══════════════════════════════════════════
         *  MODAL
         * ═══════════════════════════════════════════ */

        const modal = await page.$('#modal-wrap .jsgui-modal-overlay');
        check(!!modal, 'Modal: renders');

        const dialog_role = await page.getAttribute('#modal-wrap .jsgui-modal-overlay', 'role');
        check(dialog_role === 'dialog', 'Modal: has role=dialog');

        // Open modal
        await page.click('#open-modal');
        const is_open = await page.$eval('#modal-wrap .jsgui-modal-overlay', el => el.classList.contains('is-open'));
        check(is_open, 'Modal: open button adds is-open');

        // Escape closes
        await page.keyboard.press('Escape');
        const is_closed = await page.$eval('#modal-wrap .jsgui-modal-overlay', el => !el.classList.contains('is-open'));
        check(is_closed, 'Modal: Escape key closes modal');

        const esc_log = await page.textContent('#log');
        check(esc_log === 'modal:close:escape', 'Modal: Escape logs close:escape');

        // Open and confirm
        await page.click('#open-modal');
        await page.click('#modal-wrap [data-button-id="confirm"]');
        const confirm_log = await page.textContent('#log');
        check(confirm_log === 'modal:close:confirm', 'Modal: confirm button closes with confirm action');

        /* ═══════════════════════════════════════════
         *  TOAST
         * ═══════════════════════════════════════════ */

        // Show toast
        await page.click('#show-toast');
        const toast_visible = await page.$('#toast-container .fixture-toast');
        check(!!toast_visible, 'Toast: appears after trigger');

        const toast_text = await page.textContent('#toast-container .fixture-toast');
        check(toast_text === 'Test notification', 'Toast: has correct text content');

        const toast_role = await page.getAttribute('#toast-container .fixture-toast', 'role');
        check(toast_role === 'status', 'Toast: has role=status');

        // Wait for auto-dismiss (1.5s delay + 0.3s exit)
        await page.waitForTimeout(2500);
        const toast_gone = await page.$('#toast-container .fixture-toast');
        check(!toast_gone, 'Toast: auto-dismisses after timeout');

        // ── Visual Regression ──
        const { assertVisualMatch } = require('../helpers/visualDiff');
        await assertVisualMatch(page, 'admin_controls_full_page', { maxDiffPercent: 0.5 });

        // ── Accessibility (a11y) Regression ──
        const AxeBuilder = require('@axe-core/playwright').default;
        const a11yResults = await new AxeBuilder({ page })
            .disableRules([
                'color-contrast',
                'html-has-lang',
                'page-has-heading-one',
                'region',
                'landmark-one-main',
                'aria-allowed-role',
                'aria-required-children',
                'label',
                'label-title-only'
            ])
            .analyze();

        // Exclude specific known fixture limitations if needed, but aim for 0 violations.
        check(a11yResults.violations.length === 0, 'A11y: No accessibility violations found by axe-core');
        if (a11yResults.violations.length > 0) {
            const fs = require('fs');
            fs.writeFileSync('a11y_violations.json', JSON.stringify(a11yResults.violations, null, 2));
            console.log('\n━━━ A11y Violations saved to a11y_violations.json ━━━\n');
        }

        // ── Results ──
        console.log('\n━━━ Admin Controls Playwright Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);

        assert.strictEqual(failed, 0, 'Admin Controls Playwright test has failures');
    } finally {
        await browser.close();
        server.close();
    }
};

run_admin_controls_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
