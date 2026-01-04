const path = require('path');
const { expect } = require('chai');

const {
    start_server_from_path,
    stop_server,
    launch_browser,
    wait_for_condition
} = require('./helpers');

describe('Progressive Enhancement Demo', function() {
    this.timeout(120000);

    let browser;
    let page;
    let server;

    const PORT = 52008;
    const example_path = path.join(__dirname, '../../dev-examples/progressive');

    before(async function() {
        server = await start_server_from_path(example_path, PORT, { startup_timeout_ms: 90000 });
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

    it('should leave tier0 inputs unactivated', async function() {
        await page.waitForSelector('[data-test="tier0-input"]', { timeout: 5000 });
        const activation_value = await page.$eval('[data-test="tier0-input"]', el => el.getAttribute('data-jsgui-enhanced'));
        expect(activation_value).to.equal(null);
    });

    it('should activate tier2 inputs', async function() {
        await page.waitForSelector('[data-test="tier2-input"]', { timeout: 5000 });
        await wait_for_condition(async () => {
            const value = await page.$eval('[data-test="tier2-input"]', el => el.getAttribute('data-jsgui-enhanced'));
            return value === 'true';
        }, 8000);

        const activation_value = await page.$eval('[data-test="tier2-input"]', el => el.getAttribute('data-jsgui-enhanced'));
        expect(activation_value).to.equal('true');
    });

    it('should skip inputs marked as no-enhance', async function() {
        await page.waitForSelector('[data-test="mixed-skip"]', { timeout: 5000 });
        const activation_value = await page.$eval('[data-test="mixed-skip"]', el => el.getAttribute('data-jsgui-enhanced'));
        expect(activation_value).to.equal(null);
    });
});
