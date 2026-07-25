'use strict';

const assert = require('assert');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');
const esbuild = require('esbuild');
const jsgui = require('../../../html-core/html-core');
const Data_Grid = require('../../../controls/connected/Data_Grid');
const Data_Filter = require('../../../controls/organised/1-standard/4-data/Data_Filter');
const Data_Table = require('../../../controls/organised/1-standard/4-data/Data_Table');

const rows = [
    { name: 'Alice', age: 31, role: 'admin' },
    { name: 'Bob', age: 23, role: 'editor' },
    { name: 'Carol', age: 41, role: 'viewer' },
    { name: 'David', age: 28, role: 'editor' }
];
const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'role', label: 'Role' }
];

const build_html = bundle => {
    const context = new jsgui.Page_Context();
    const app = new jsgui.Control({ context, tag_name: 'main' });
    app.dom.attributes.id = 'data-controls-app';
    app.add(new Data_Filter({
        context,
        fields: [
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'age', label: 'Age', type: 'number' },
            { name: 'role', label: 'Role', type: 'string' }
        ],
        filters: [{ field: 'name', operator: 'contains', value: '' }],
        persist_activation_state: true
    }));
    app.add(new Data_Grid({
        context,
        columns,
        rows,
        page_size: 2,
        selection_mode: 'single',
        persist_activation_state: true,
        aria_label: 'Activated people grid'
    }));

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Activated jsgui3 data controls</title>
<style>${Data_Filter.css}\n${Data_Table.css}\n${Data_Grid.css}</style>
</head>
<body>${app.all_html_render()}<script>${bundle}</script></body>
</html>`;
};

const run = async () => {
    const entry_point = path.join(__dirname, '../fixtures/activated_data_controls_client.js');
    const build = await esbuild.build({
        entryPoints: [entry_point],
        bundle: true,
        format: 'iife',
        platform: 'browser',
        write: false,
        logLevel: 'silent'
    });
    const html = build_html(build.outputFiles[0].text);
    const server = http.createServer((request, response) => {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end(html);
    });
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}/`;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const browser_errors = [];
    page.on('pageerror', error => browser_errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') browser_errors.push(message.text());
    });

    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => window.__jsgui_data_controls_ready === true);

        assert.strictEqual(await page.locator('tbody tr').count(), 2, 'SSR paging survives activation');
        assert.strictEqual(
            await page.locator('table').getAttribute('aria-label'),
            'Activated people grid',
            'Grid label reaches the activated table'
        );

        await page.locator('.data-filter-value').fill('Ali');
        assert.strictEqual(await page.locator('tbody tr').count(), 1, 'Filter drives the real Data_Grid');
        assert.strictEqual(await page.locator('tbody tr td').first().textContent(), 'Alice');

        await page.locator('.data-filter-value').fill('');
        const name_header = page.locator('th[data-column-key="name"]');
        await name_header.click();
        const click_sort_state = await page.evaluate(() => {
            const { grid, metrics } = window.__jsgui_data_controls;
            return {
                aria_sort: document.querySelector('th[data-column-key="name"]').getAttribute('aria-sort'),
                grid_sort: grid.sort_state,
                table_sort: grid.table.sort_state,
                sort_events: metrics.sort_change
            };
        });
        assert.strictEqual(
            click_sort_state.aria_sort,
            'ascending',
            `Header click did not sort: ${JSON.stringify(click_sort_state)}`
        );
        await name_header.focus();
        await name_header.press('Enter');
        assert.strictEqual(await name_header.getAttribute('aria-sort'), 'descending');

        await page.locator('tbody tr').first().click();
        assert.strictEqual(
            await page.locator('tbody tr').first().getAttribute('aria-selected'),
            'true',
            'Click selection updates ARIA'
        );
        assert.strictEqual(
            await page.locator('tbody tr').first().evaluate(element => element.classList.contains('is-selected')),
            true,
            'Click selection updates visual class'
        );

        await page.evaluate(() => window.__jsgui_data_controls.grid.set_page(2));
        const state = await page.evaluate(() => {
            const { grid, metrics } = window.__jsgui_data_controls;
            return {
                metrics,
                grid_page: grid.page,
                table_page: grid.table.page,
                selected: grid.table.get_selected_rows()
            };
        });
        assert.deepStrictEqual(state.metrics, {
            filter_change: 2,
            sort_change: 2,
            page_change: 1,
            selection_change: 1
        });
        assert.strictEqual(state.grid_page, 2);
        assert.strictEqual(state.table_page, 2);
        assert.deepStrictEqual(state.selected, [], 'Paging clears a no-longer-visible selection');
        assert.deepStrictEqual(browser_errors, [], `Browser errors: ${browser_errors.join('; ')}`);

        console.log('Activated Data_Filter → Data_Grid browser contract: PASS');
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
};

run().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
});
