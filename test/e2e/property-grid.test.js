/**
 * Property Grid — E2E Tests
 *
 * Puppeteer tests for the property grid demo server.
 * Start the server first: node lab/property_grid_demo_server.js
 * Then run: npx mocha property-grid.test.js --timeout 30000
 */

const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const {
    launch_browser,
    click_element,
    type_text,
    get_text
} = require('./helpers');

const SCREENSHOT_DIR = path.resolve(__dirname, './screenshots');
const BASE_URL = 'http://localhost:3602';

describe('Property Grid E2E', function () {
    this.timeout(30000);

    let browser, page;

    before(async function () {
        if (!fs.existsSync(SCREENSHOT_DIR)) {
            fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
        }
        browser = await launch_browser();
    });

    after(async function () {
        if (browser) await browser.close();
    });

    beforeEach(async function () {
        page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 900 });
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    });

    afterEach(async function () {
        if (page) await page.close();
    });

    it('should render both property grids', async function () {
        const grid1 = await page.$('#grid1');
        expect(grid1).to.not.be.null;

        const grid2 = await page.$('#grid2');
        expect(grid2).to.not.be.null;

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'property-grid-full.png'),
            fullPage: true
        });
    });

    it('should display all editor types in grid 1', async function () {
        const textValue = await page.$eval('#grid1 input[type="text"]', el => el.value);
        expect(textValue).to.equal('Alice');

        const numValue = await page.$eval('#grid1 input[type="number"]', el => el.value);
        expect(numValue).to.equal('30');

        const checked = await page.$eval('#grid1 input[type="checkbox"]', el => el.checked);
        expect(checked).to.be.true;

        const selectValue = await page.$eval('#grid1 select', el => el.value);
        expect(selectValue).to.equal('admin');

        const dateSummary = await page.$('#grid1 .date-value-editor .ve-popup-summary');
        expect(dateSummary).to.not.be.null;

        const colorSwatch = await page.$('#grid1 .color-value-editor .ve-color-swatch');
        expect(colorSwatch).to.not.be.null;
    });

    it('should display grouped properties in grid 2', async function () {
        const groups = await page.$$('#grid2 .pg-group-header');
        expect(groups.length).to.be.at.least(3);

        const groupLabel = await page.$eval('#grid2 .pg-group-label', el => el.textContent.trim());
        expect(groupLabel).to.equal('Identity');
    });

    it('should update text input and log change', async function () {
        await page.click('#grid1 input[type="text"]', { clickCount: 3 });
        await page.keyboard.type('Bob');
        await page.waitForTimeout(200);

        const output = await page.$eval('#change-output', el => el.textContent);
        expect(output).to.include('name');
    });

    it('should toggle checkbox and log change', async function () {
        await page.click('#grid1 input[type="checkbox"]');
        await page.waitForTimeout(200);

        const checked = await page.$eval('#grid1 input[type="checkbox"]', el => el.checked);
        expect(checked).to.be.false;

        const output = await page.$eval('#change-output', el => el.textContent);
        expect(output).to.include('enabled');
    });

    it('should change enum selection', async function () {
        await page.select('#grid1 select', 'editor');
        await page.waitForTimeout(200);

        const output = await page.$eval('#change-output', el => el.textContent);
        expect(output).to.include('role');
    });

    it('should open and close color popup', async function () {
        await page.click('#grid1 .color-value-editor .ve-popup-trigger');
        await page.waitForTimeout(200);

        const display = await page.$eval(
            '#grid1 .color-value-editor .ve-popup-dropdown',
            el => el.style.display
        );
        expect(display).to.equal('block');

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'property-grid-color-popup.png'),
            fullPage: true
        });

        // Select a color cell
        await page.click('#grid1 .color-value-editor .ve-color-cell');
        await page.waitForTimeout(200);

        const displayAfter = await page.$eval(
            '#grid1 .color-value-editor .ve-popup-dropdown',
            el => el.style.display
        );
        expect(displayAfter).to.equal('none');
    });

    it('should have focusable rows with data-key attributes', async function () {
        // Verify correct number of property rows
        const rows = await page.$$('#grid1 .pg-row');
        expect(rows.length).to.be.at.least(5);

        // Check rows have data-key, tabindex, and ARIA attributes
        const attrs = await page.$$eval('#grid1 .pg-row', els => els.map(el => ({
            key: el.getAttribute('data-key'),
            tabindex: el.getAttribute('tabindex'),
            role: el.getAttribute('role'),
            rowindex: el.getAttribute('aria-rowindex')
        })));

        // First row should be 'name'
        expect(attrs[0].key).to.equal('name');
        expect(attrs[0].tabindex).to.equal('0');
        expect(attrs[0].role).to.equal('row');
        expect(attrs[0].rowindex).to.not.be.null;

        // All rows should have data-key set
        for (const a of attrs) {
            expect(a.key).to.be.a('string');
            expect(a.tabindex).to.equal('0');
        }

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'property-grid-keyboard-nav.png'),
            fullPage: true
        });
    });

    it('should take final overview screenshot', async function () {
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'property-grid-final.png'),
            fullPage: true
        });
    });
});
