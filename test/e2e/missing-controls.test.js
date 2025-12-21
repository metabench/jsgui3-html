const { expect } = require('chai');
const {
    start_server,
    stop_server,
    launch_browser,
    click_element,
    type_text
} = require('./helpers');

describe('Missing Controls E2E', function() {
    this.timeout(30000);

    let browser;
    let page;
    let server;
    const PORT = 52004;

    before(async function() {
        server = await start_server('missing-controls', PORT);
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

    it('toggles the switch', async function() {
        await page.waitForSelector('.demo-toggle-switch .toggle-switch-input');
        const label_selector = '.demo-toggle-switch .toggle-switch-label';
        const initial_label = await page.$eval(label_selector, el => el.textContent.trim());
        await page.click('.demo-toggle-switch .toggle-switch-input');
        const updated_label = await page.$eval(label_selector, el => el.textContent.trim());
        expect(updated_label).to.not.equal(initial_label);
    });

    it('adds a tag on enter', async function() {
        await type_text(page, '.demo-tag-input .tag-input-field', 'gamma');
        await page.keyboard.press('Enter');
        const tags = await page.$$eval('.demo-tag-input .tag-input-text', els =>
            els.map(el => el.textContent.trim())
        );
        expect(tags).to.include('gamma');
    });

    it('changes pagination page', async function() {
        await click_element(page, '.demo-pagination button[data-page="2"]');
        const current = await page.$eval('.demo-pagination .pagination-button.is-current', el => el.textContent.trim());
        expect(current).to.equal('2');
    });

    it('shows tooltip on hover', async function() {
        await page.hover('.demo-tooltip-target');
        const is_visible = await page.$eval('.demo-tooltip', el => el.classList.contains('is-visible'));
        expect(is_visible).to.equal(true);
    });

    it('toggles pop-over on click', async function() {
        await click_element(page, '.demo-popover-target');
        const is_visible = await page.$eval('.demo-popover', el => el.classList.contains('is-visible'));
        expect(is_visible).to.equal(true);
    });

    it('shows and dismisses toast', async function() {
        await click_element(page, '.demo-toast-button');
        await page.waitForSelector('.demo-toast .toast');
        await click_element(page, '.demo-toast .toast-dismiss');
        const remaining = await page.$$eval('.demo-toast .toast', els => els.length);
        expect(remaining).to.equal(0);
    });

    it('dismisses alert banner', async function() {
        await click_element(page, '.demo-alert-banner .alert-banner-dismiss');
        const display = await page.$eval('.demo-alert-banner', el => getComputedStyle(el).display);
        expect(display).to.equal('none');
    });

    it('updates progress and meter', async function() {
        const progress_before = await page.$eval('.demo-progress-bar', el => el.getAttribute('value'));
        await click_element(page, '.demo-progress-button');
        const progress_after = await page.$eval('.demo-progress-bar', el => el.getAttribute('value'));
        expect(progress_after).to.not.equal(progress_before);
    });

    it('steps number stepper', async function() {
        const input_selector = '.demo-number-stepper .number-stepper-input';
        await page.waitForSelector(input_selector);
        const before = await page.$eval(input_selector, el => el.value);
        await click_element(page, '.demo-number-stepper .number-stepper-increment');
        const after = await page.$eval(input_selector, el => el.value);
        expect(after).to.not.equal(before);
    });
});
