/**
 * E2E Test Helper Functions
 * 
 * Common utilities for Puppeteer-based E2E tests
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

/**
 * Start a dev-examples server
 * @param {string} example_name - Name of the example directory (e.g., 'counter')
 * @param {number} port - Port to run the server on
 * @returns {Promise<Object>} Server process and URL
 */
async function start_server(example_name, port = 52000) {
    const example_path = path.join(__dirname, '../../dev-examples/binding', example_name);
    
    return new Promise((resolve, reject) => {
        const server_process = spawn('node', ['server.js'], {
            cwd: example_path,
            env: { ...process.env, PORT: port },
            shell: true
        });
        
        let startup_timeout = setTimeout(() => {
            server_process.kill();
            reject(new Error(`Server failed to start within 10 seconds`));
        }, 10000);
        
        server_process.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes(`listening on port ${port}`) || 
                output.includes('Server running') ||
                output.includes('Server Started') ||
                output.includes(`localhost:${port}`)) {
                clearTimeout(startup_timeout);
                resolve({
                    process: server_process,
                    url: `http://localhost:${port}`
                });
            }
        });
        
        server_process.stderr.on('data', (data) => {
            console.error(`Server error: ${data}`);
        });
        
        server_process.on('error', (error) => {
            clearTimeout(startup_timeout);
            reject(error);
        });
    });
}

/**
 * Stop a running server
 * @param {Object} server_process - The server process to stop
 */
function stop_server(server_process) {
    if (server_process && !server_process.killed) {
        server_process.kill();
    }
}

/**
 * Launch a headless browser
 * @param {Object} options - Puppeteer launch options
 * @returns {Promise<Browser>} Puppeteer browser instance
 */
async function launch_browser(options = {}) {
    return await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ...options
    });
}

/**
 * Wait for an element and get its text
 * @param {Page} page - Puppeteer page
 * @param {string} selector - CSS selector
 * @returns {Promise<string>} Element text content
 */
async function get_text(page, selector) {
    await page.waitForSelector(selector, { timeout: 5000 });
    return await page.$eval(selector, el => el.textContent.trim());
}

/**
 * Wait for an element and click it
 * @param {Page} page - Puppeteer page
 * @param {string} selector - CSS selector
 */
async function click_element(page, selector) {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
}

/**
 * Type text into an input field
 * @param {Page} page - Puppeteer page
 * @param {string} selector - CSS selector
 * @param {string} text - Text to type
 */
async function type_text(page, selector, text) {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.keyboard.type(text);
}

/**
 * Get localStorage value
 * @param {Page} page - Puppeteer page
 * @param {string} key - localStorage key
 * @returns {Promise<any>} Parsed localStorage value
 */
async function get_local_storage(page, key) {
    return await page.evaluate((k) => {
        const value = localStorage.getItem(k);
        return value ? JSON.parse(value) : null;
    }, key);
}

/**
 * Clear localStorage
 * @param {Page} page - Puppeteer page
 */
async function clear_local_storage(page) {
    await page.evaluate(() => localStorage.clear());
}

/**
 * Wait for a condition to be true
 * @param {Function} condition - Async function that returns boolean
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} interval - Check interval in milliseconds
 */
async function wait_for_condition(condition, timeout = 5000, interval = 100) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (await condition()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Condition not met within timeout');
}

module.exports = {
    start_server,
    stop_server,
    launch_browser,
    get_text,
    click_element,
    type_text,
    get_local_storage,
    clear_local_storage,
    wait_for_condition
};
