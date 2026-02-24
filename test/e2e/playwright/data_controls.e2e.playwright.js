/**
 * Data Controls Playwright E2E Tests
 *
 * Tests Data_Table, Data_Filter, and Data_Grid at T4 quality.
 * Covers: rendering, ARIA attributes, interaction, states, and screenshots.
 */
const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');
const {
    build_data_table_fixture_html,
    build_data_filter_fixture_html,
    build_data_grid_fixture_html
} = require('../fixtures/data_controls_fixture');

const PORT = 4497;

// ── Test runner utilities ──

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

const section = (title) => {
    results.push(`\n── ${title} ──`);
};

// ── Individual test suites ──

const test_data_table = async (page, html_map) => {
    html_map.current = build_data_table_fixture_html();
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });

    section('Data_Table — Rendering');

    // Grid role
    const grid_role = await page.getAttribute('#test-table', 'role');
    check(grid_role === 'grid', 'Table has role="grid"');

    // ARIA label
    const grid_label = await page.getAttribute('#test-table', 'aria-label');
    check(grid_label === 'Data table', 'Table has aria-label="Data table"');

    // Column headers
    const headers = await page.$$('#test-table thead th');
    check(headers.length === 4, 'All 4 column headers render');

    // Header text
    const header_texts = await Promise.all(headers.map(h => h.textContent()));
    check(header_texts[0].includes('ID'), 'First header is ID');
    check(header_texts[1].includes('Name'), 'Second header is Name');

    // aria-sort on sortable headers
    const sort_attr = await page.getAttribute('#test-table thead th', 'aria-sort');
    check(sort_attr !== null, 'Sortable header has aria-sort attribute');

    section('Data_Table — Rows & Paging');

    // With page_size=3, only 3 rows visible
    const rows = await page.$$('#test-table tbody tr.data-table-row');
    check(rows.length === 3, 'Page 1 shows 3 of 5 rows (page_size=3)');

    // Row role
    const row_role = await rows[0].getAttribute('role');
    check(row_role === 'row', 'Rows have role="row"');

    // aria-rowindex (1-based, +1 for header)
    const row_index = await rows[0].getAttribute('aria-rowindex');
    check(row_index === '2', 'First data row has aria-rowindex="2"');

    // Cell content
    const first_cells = await page.$$('#test-table tbody tr:first-child td');
    const cell_texts = await Promise.all(first_cells.map(c => c.textContent()));
    check(cell_texts[0] === '1', 'First cell of first row is "1"');
    check(cell_texts[1] === 'Alice', 'Second cell of first row is "Alice"');

    // Cell role
    const cell_role = await first_cells[0].getAttribute('role');
    check(cell_role === 'gridcell', 'Cells have role="gridcell"');

    section('Data_Table — Density & Variants');

    const density = await page.getAttribute('#test-table', 'data-density');
    check(density === 'comfortable', 'Default density is comfortable');

    const has_striped = await page.$eval('#test-table', el => el.classList.contains('data-table-striped'));
    check(has_striped, 'Striped class applied by default');

    section('Data_Table — Empty State');

    const empty_rows = await page.$$('#test-empty-table tbody tr.data-table-row');
    check(empty_rows.length === 0, 'Empty table has no data rows');

    await page.screenshot({ path: 'screenshots/data-table-e2e.png', fullPage: true });
};

const test_data_filter = async (page, html_map) => {
    html_map.current = build_data_filter_fixture_html();
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });

    section('Data_Filter — Structure');

    // Root element
    const root = await page.$('#test-filter');
    check(root !== null, 'Data_Filter root element renders');

    // ARIA group
    const role = await page.getAttribute('#test-filter', 'role');
    check(role === 'group', 'Root has role="group"');

    const label = await page.getAttribute('#test-filter', 'aria-label');
    check(label === 'Data filters', 'Root has aria-label="Data filters"');

    // Header
    const title = await page.$('#test-filter .data-filter-title');
    check(title !== null, 'Filter title renders');

    const title_text = await title.textContent();
    check(title_text.includes('Filters'), 'Title text contains "Filters"');

    // Add button
    const add_btn = await page.$('#test-filter .data-filter-add-btn');
    check(add_btn !== null, 'Add filter button renders');

    const add_label = await add_btn.getAttribute('aria-label');
    check(add_label === 'Add filter', 'Add button has aria-label="Add filter"');

    section('Data_Filter — Empty State');

    const empty_msg = await page.$('#test-filter .data-filter-empty');
    check(empty_msg !== null, 'Empty state message element exists');

    section('Data_Filter — Pre-loaded Filters');

    // Pre-loaded filter has 1 row
    const preloaded_rows = await page.$$('#test-filter-preloaded .data-filter-row');
    check(preloaded_rows.length === 1, 'Pre-loaded filter has 1 filter row');

    // Each row has field, operator, value inputs and remove button
    const row = preloaded_rows[0];
    const field_sel = await row.$('select.data-filter-field');
    check(field_sel !== null, 'Filter row has field selector');

    const op_sel = await row.$('select.data-filter-operator');
    check(op_sel !== null, 'Filter row has operator selector');

    const value_input = await row.$('input.data-filter-value');
    check(value_input !== null, 'Filter row has value input');

    const remove_btn = await row.$('button.data-filter-remove-btn');
    check(remove_btn !== null, 'Filter row has remove button');

    await page.screenshot({ path: 'screenshots/data-filter-e2e.png', fullPage: true });
};

const test_data_grid = async (page, html_map) => {
    html_map.current = build_data_grid_fixture_html();
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });

    section('Data_Grid — Rendering');

    const root = await page.$('#test-grid');
    check(root !== null, 'Data_Grid root element renders');

    // ARIA region
    const role = await page.getAttribute('#test-grid', 'role');
    check(role === 'region', 'Root has role="region"');

    const label = await page.getAttribute('#test-grid', 'aria-label');
    check(label === 'Data grid', 'Root has aria-label="Data grid"');

    // Has inner table
    const inner_table = await page.$('#test-grid .data-grid-table');
    check(inner_table !== null, 'Inner Data_Table renders with data-grid-table class');

    // Has data class
    const has_class = await page.$eval('#test-grid', el => el.classList.contains('data-grid'));
    check(has_class, 'Root has data-grid class');

    // Rows
    const rows = await page.$$('#test-grid .data-table-row');
    check(rows.length === 3, 'Grid shows 3 data rows');

    section('Data_Grid — Empty State');

    const empty_root = await page.$('#test-empty-grid');
    check(empty_root !== null, 'Empty grid root renders');

    const has_empty_class = await page.$eval('#test-empty-grid', el => el.classList.contains('empty'));
    check(has_empty_class, 'Empty grid has "empty" class');

    const empty_msg = await page.$('#test-empty-grid .data-grid-empty');
    check(empty_msg !== null, 'Empty state message renders');

    const empty_text = await empty_msg.textContent();
    check(empty_text.includes('No results found'), 'Empty state shows custom text');

    const empty_rows = await page.$$('#test-empty-grid .data-table-row');
    check(empty_rows.length === 0, 'Empty grid has no data rows');

    await page.screenshot({ path: 'screenshots/data-grid-e2e.png', fullPage: true });
};

// ── Main ──

const run_data_controls_e2e = async () => {
    // Dynamic HTML — switched per test suite
    const html_map = { current: '' };
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html_map.current);
    });

    await new Promise(resolve => server.listen(PORT, resolve));

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

    try {
        await test_data_table(page, html_map);
        await test_data_filter(page, html_map);
        await test_data_grid(page, html_map);

        console.log('\n━━━ Data Controls Playwright E2E Results ━━━\n');
        results.forEach(r => console.log(r));
        console.log(`\n  ${passed} passed, ${failed} failed`);
        console.log(`  Total: ${passed + failed}`);

        assert.strictEqual(failed, 0, `Data Controls Playwright test has ${failed} failures`);
    } finally {
        await browser.close();
        server.close();
    }
};

run_data_controls_e2e()
    .then(() => {
        console.log('\n=== ALL PASS ✓ ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n=== FAILURES ✗ ===');
        console.error(err && err.stack ? err.stack : err);
        process.exit(1);
    });
