const { expect } = require('chai');
const {
    start_server,
    stop_server,
    launch_browser,
    click_element,
    type_text
} = require('./helpers');

describe('Data Controls E2E', function() {
    this.timeout(30000);

    let browser;
    let page;
    let server;
    const PORT = 52005;

    before(async function() {
        server = await start_server('data-controls', PORT);
        browser = await launch_browser();
    });

    after(async function() {
        if (browser) await browser.close();
        if (server) stop_server(server.process);
    });

    beforeEach(async function() {
        page = await browser.newPage();
        await page.goto(server.url, { waitUntil: 'networkidle0' });
    });

    afterEach(async function() {
        if (page) await page.close();
    });

    it('sorts the data table by name desc', async function() {
        await click_element(page, '.demo-data-table th[data-column-key="name"]');
        await click_element(page, '.demo-data-table th[data-column-key="name"]');
        const first_cell = await page.$eval(
            '.demo-data-table tbody tr:first-child td:first-child',
            el => el.textContent.trim()
        );
        expect(first_cell).to.equal('Zeta');
    });

    it('filters the data table by status', async function() {
        await type_text(page, '.data-table-filter', 'closed');
        const row_count = await page.$$eval('.demo-data-table tbody tr', rows => rows.length);
        expect(row_count).to.equal(2);
    });

    it('paginates the data table', async function() {
        await click_element(page, '.demo-data-table-pagination button[data-page="2"]');
        const first_cell = await page.$eval(
            '.demo-data-table tbody tr:first-child td:first-child',
            el => el.textContent.trim()
        );
        expect(first_cell).to.equal('Delta');
    });

    it('updates data grid selection output', async function() {
        await click_element(page, '.demo-data-grid tbody tr:first-child');
        const selection_text = await page.$eval(
            '.grid-selection-output',
            el => el.textContent.trim()
        );
        expect(selection_text).to.equal('Selected: Oak');
    });

    it('renders virtual list items after scroll', async function() {
        await page.waitForSelector('.demo-virtual-list .virtual-list-viewport');
        await page.$eval('.demo-virtual-list .virtual-list-viewport', el => {
            el.scrollTop = 400;
            el.dispatchEvent(new Event('scroll', { bubbles: true }));
        });
        await page.waitForTimeout(100);
        const index = await page.$eval(
            '.demo-virtual-list .virtual-list-item',
            el => el.getAttribute('data-index')
        );
        expect(Number(index)).to.be.greaterThan(0);
    });

    it('toggles tree table rows', async function() {
        const before_count = await page.$$eval(
            '.demo-tree-table .tree-table-body .tree-table-row',
            rows => rows.length
        );
        await click_element(page, '.demo-tree-table .tree-table-toggle[data-toggle-id="group-1"]');
        const after_count = await page.$$eval(
            '.demo-tree-table .tree-table-body .tree-table-row',
            rows => rows.length
        );
        expect(after_count).to.be.lessThan(before_count);
    });

    it('reorders list items with keyboard', async function() {
        await click_element(page, '.demo-reorderable-list .reorderable-list-item[data-index="0"]');
        await page.keyboard.down('Alt');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.up('Alt');
        const order_text = await page.$eval('.reorder-output', el => el.textContent.trim());
        expect(order_text).to.include('Beta, Alpha');
    });

    it('updates master detail selection', async function() {
        await click_element(page, '.demo-master-detail .master-detail-item[data-item-id="north"]');
        const detail_text = await page.$eval(
            '.demo-master-detail .master-detail-detail',
            el => el.textContent.trim()
        );
        expect(detail_text).to.include('North team');
    });
});
