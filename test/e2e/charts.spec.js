/**
 * E2E Tests for Flexi_Chart Demo
 * 
 * Verifies that the chart demo page loads and renders all expected chart types.
 */

const { expect } = require('chai');
const { spawn } = require('child_process');
const path = require('path');
const {
    launch_browser,
    stop_server,
    wait_for_condition
} = require('./helpers');

describe('Flexi_Chart Demo E2E Tests', function () {
    this.timeout(30000);

    let browser;
    let page;
    let server_process;
    const PORT = 53001;
    const BASE_URL = `http://localhost:${PORT}`;

    // Start server manually since it's a standalone script, not a standard example folder
    const start_demo_server = async () => {
        const script_path = path.join(__dirname, '../../lab/flexi_chart_demo.js');

        return new Promise((resolve, reject) => {
            const process_instance = spawn('node', [script_path], {
                env: { ...process.env, PORT },
                stdio: 'pipe',
                shell: true
            });

            let started = false;

            process_instance.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes(`running at http://localhost:${PORT}`) && !started) {
                    started = true;
                    resolve(process_instance);
                }
            });

            process_instance.stderr.on('data', (data) => {
                console.error(`Server stderr: ${data}`);
            });

            process_instance.on('error', (err) => {
                reject(err);
            });

            // Timeout if not started
            setTimeout(() => {
                if (!started) {
                    process_instance.kill();
                    reject(new Error('Server start timeout'));
                }
            }, 10000);
        });
    };

    before(async function () {
        console.log('Starting demo server...');
        server_process = await start_demo_server();
        console.log('Server started');

        console.log('Launching browser...');
        browser = await launch_browser();
        page = await browser.newPage();
    });

    after(async function () {
        if (browser) await browser.close();
        if (server_process) stop_server(server_process);
    });

    it('should load the demo page', async function () {
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        const title = await page.title();
        expect(title).to.equal('Flexi_Chart Demo');
    });

    it('should display the main heading', async function () {
        const heading = await page.$eval('h1', el => el.textContent);
        expect(heading).to.equal('Flexi_Chart Demo');
    });

    it('should render 6 chart cards', async function () {
        // We look for the cards container logic from the demo
        // The demo creates divs with specific styling for cards, but they don't have a specific class "card"
        // However, they are direct children of the grid container.
        // Let's assume the chart containers have 'flexi-chart' class inside them.

        await page.waitForSelector('.flexi-chart');
        const count = await page.$$eval('.flexi-chart', els => els.length);
        expect(count).to.equal(6);
    });

    it('should render SVG for each chart', async function () {
        const svgs = await page.$$eval('.flexi-chart svg', els => els.length);
        expect(svgs).to.equal(6);
    });

    it('should render bars in the first chart (Column)', async function () {
        // First chart is column
        const firstChart = (await page.$$('.flexi-chart'))[0];
        const bars = await firstChart.$$('rect.bar');
        expect(bars.length).to.be.greaterThan(0);
    });

    it('should render filled slice in the second chart (Donut)', async function () {
        // Second chart is donut
        const secondChart = (await page.$$('.flexi-chart'))[1];
        const paths = await secondChart.$$('path'); // Pie/Donut uses paths
        expect(paths.length).to.be.greaterThan(0);
    });

    it('should render stacked bars in the third chart', async function () {
        const thirdChart = (await page.$$('.flexi-chart'))[2];
        const bars = await thirdChart.$$('rect.bar');
        expect(bars.length).to.be.greaterThan(0);
    });

    it('should render area paths in the fourth chart (Area)', async function () {
        const fourthChart = (await page.$$('.flexi-chart'))[3];
        const areas = await fourthChart.$$('path.area');
        expect(areas.length).to.be.greaterThan(0);
    });

    it('should render points in the fifth chart (Scatter)', async function () {
        const fifthChart = (await page.$$('.flexi-chart'))[4];
        const points = await fifthChart.$$('circle.scatter-point');
        expect(points.length).to.be.greaterThan(0);
    });

    it('should not have console errors', async function () {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
            // Also log warnings to see if we have missing assets
            if (msg.type() === 'warning') {
                console.log(`PAGE WARNING: ${msg.text()}`);
            }
        });

        // Reload to capture any initial load errors
        await page.reload({ waitUntil: 'networkidle0' });

        expect(errors).to.deep.equal([]);
    });

    // Specific regression checks
    it('should not show NAN or weird values in axes', async function () {
        const textContent = await page.evaluate(() => document.body.textContent);
        expect(textContent).to.not.include('NaN');
        expect(textContent).to.not.include('undefined');
    });
});
