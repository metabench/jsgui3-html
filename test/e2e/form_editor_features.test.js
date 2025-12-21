const { expect } = require('chai');
const {
    start_server,
    stop_server,
    launch_browser,
    click_element,
    type_text
} = require('./helpers');

describe('Form Editor Features E2E', function() {
    this.timeout(30000);

    let browser;
    let page;
    let server;
    const PORT = 52007;

    before(async function() {
        server = await start_server('form_editor_features', PORT);
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

    it('shows required validation message on submit', async function() {
        await click_element(page, '.form-submit-button');
        const message = await page.$eval(
            '.form-container-field[data-field-name="full_name"] .form-container-message',
            el => el.textContent.trim()
        );
        expect(message).to.equal('This field is required.');
    });

    it('applies phone input mask', async function() {
        const selector = 'input.form-container-input[data-field-name="phone"]';
        await type_text(page, selector, '1234567890');
        const value = await page.$eval(selector, el => el.value);
        expect(value).to.equal('(123) 456-7890');
    });

    it('autosizes the notes textarea', async function() {
        const selector = 'textarea.form-container-input[data-field-name="notes"]';
        const before_height = await page.$eval(selector, el => parseFloat(getComputedStyle(el).height));
        await type_text(page, selector, 'Line 1\nLine 2\nLine 3\nLine 4');
        await page.waitForTimeout(200);
        const after_height = await page.$eval(selector, el => parseFloat(getComputedStyle(el).height));
        expect(after_height).to.be.greaterThan(before_height);
    });

    it('toggles markdown mode in the rich text editor', async function() {
        await click_element(page, '.rte-toolbar-button[data-command="toggle_markdown"]');
        const markdown_visible = await page.$eval('.rte-markdown', el => !el.classList.contains('is-hidden'));
        expect(markdown_visible).to.equal(true);

        await page.$eval('.rte-markdown', el => {
            el.value = '# Heading';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await click_element(page, '.rte-toolbar-button[data-command="toggle_markdown"]');
        const output = await page.$eval('.rte-output', el => el.textContent.trim());
        expect(output).to.include('<h1>');
    });
});
