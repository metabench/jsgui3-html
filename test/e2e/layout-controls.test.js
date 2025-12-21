const { expect } = require('chai');
const {
    start_server,
    stop_server,
    launch_browser,
    click_element
} = require('./helpers');

describe('Layout Controls E2E', function() {
    this.timeout(30000);

    let browser;
    let page;
    let server;
    const PORT = 52006;

    before(async function() {
        server = await start_server('layout-controls', PORT);
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

    it('resizes the split pane', async function() {
        const handle = await page.$('.demo-split-pane .split-pane-handle');
        const handle_box = await handle.boundingBox();
        const primary_before = await page.$eval(
            '.demo-split-pane .split-pane-pane-primary',
            el => el.getBoundingClientRect().width
        );

        await page.mouse.move(handle_box.x + 2, handle_box.y + 2);
        await page.mouse.down();
        await page.mouse.move(handle_box.x + 60, handle_box.y + 2);
        await page.mouse.up();

        const primary_after = await page.$eval(
            '.demo-split-pane .split-pane-pane-primary',
            el => el.getBoundingClientRect().width
        );
        expect(primary_after).to.be.greaterThan(primary_before);
    });

    it('toggles accordion sections', async function() {
        await click_element(page, '.demo-accordion .accordion-header[data-section-id="b"]');
        const open_headers = await page.$$eval(
            '.demo-accordion .accordion-header.is-open',
            els => els.map(el => el.getAttribute('data-section-id'))
        );
        expect(open_headers).to.deep.equal(['b']);
    });

    it('opens and closes the drawer', async function() {
        await click_element(page, '.drawer-open-button');
        let is_open = await page.$eval('.demo-drawer', el => el.classList.contains('is-open'));
        expect(is_open).to.equal(true);
        await click_element(page, '.demo-drawer .drawer-overlay');
        is_open = await page.$eval('.demo-drawer', el => el.classList.contains('is-open'));
        expect(is_open).to.equal(false);
    });

    it('moves stepper to next step', async function() {
        await click_element(page, '.stepper-next');
        const current_text = await page.$eval(
            '.demo-stepper .stepper-step.is-current .stepper-step-button',
            el => el.textContent.trim()
        );
        expect(current_text).to.equal('Build');
    });

    it('shows overflow select for tabs', async function() {
        const select_exists = await page.$('.demo-tabbed-panel .tab-overflow-select');
        expect(select_exists).to.exist;
    });

    it('moves tabs with keyboard navigation', async function() {
        await page.focus('.demo-tabbed-panel .tab-label:not(.tab-label-hidden)');
        await page.keyboard.press('ArrowDown');
        const active_index = await page.$eval(
            '.demo-tabbed-panel .tab-label[aria-selected="true"]',
            el => el.getAttribute('data-tab-index')
        );
        expect(active_index).to.equal('1');
    });
});
