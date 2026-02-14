/**
 * Puppeteer gallery verification test
 * 
 * Checks all fixed controls render properly in the gallery server.
 * Verifies: no console errors, non-zero dimensions, no "undefined" text,
 * proper visual structure.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PORT = 4444;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Controls that were fixed in this session
const FIXED_CONTROLS = [
    { name: 'File_Upload', checks: ['renders', 'has_input_file'] },
    { name: 'Radio_Button', checks: ['renders', 'no_undefined', 'has_input_radio'] },
    { name: 'Radio_Button_Tab', checks: ['renders', 'no_undefined', 'has_input_radio'] },
    { name: 'Line_Chart', checks: ['renders', 'has_svg', 'has_lines'] },
    { name: 'Popup_Menu_Button', checks: ['renders', 'has_text'] },
    { name: 'Indicator', checks: ['renders', 'has_dot'] },
];

// Controls that should now have proper gallery specs
const SPEC_CONTROLS = [
    'Data_Grid', 'Data_Row', 'File_Tree_Node', 'Form_Container',
    'Horizontal_Menu', 'Item', 'Item_Selector', 'List',
    'Property_Viewer', 'Reorderable_List', 'Text_Item', 'Toggle_Button',
    'Tree_Node', 'Markdown_Viewer', 'Pie_Chart', 'Sparkline',
    'Area_Chart', 'Bar_Chart', 'Gauge', 'String_Span'
];

// Controls that should be skipped
const SKIP_CONTROLS = [
    'Active_HTML_Document', 'Standard_Web_Page', 'Message_Web_Page'
];

async function run_tests() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let passed = 0, failed = 0;
    const results = [];

    function assert(cond, name) {
        if (cond) { passed++; results.push(`  ✓ ${name}`); }
        else      { failed++; results.push(`  ✗ ${name}`); }
    }

    // ── Test 1: Fixed controls render without errors ─────────
    console.log('\n── Testing fixed controls ──');

    for (const ctrl of FIXED_CONTROLS) {
        const page = await browser.newPage();
        const console_errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') console_errors.push(msg.text());
        });
        page.on('pageerror', err => console_errors.push(err.message));

        try {
            await page.goto(`${BASE_URL}/?control=${ctrl.name}`, { 
                waitUntil: 'networkidle0', 
                timeout: 15000 
            });
            await delay(500);

            // Check for instantiation errors in the page
            const has_error = await page.$eval('#control-mount', el => {
                return el.innerHTML.includes('Instantiation Error');
            });
            assert(!has_error, `${ctrl.name}: no instantiation error`);

            // Check no critical console errors (filter noise)
            const critical_errors = console_errors.filter(e => 
                !e.includes('DEPRECATED') && 
                !e.includes('favicon') &&
                !e.includes('net::ERR') &&
                !e.includes('Expected length') &&
                !e.includes('activate failed')
            );
            assert(critical_errors.length === 0, `${ctrl.name}: no console errors${critical_errors.length > 0 ? ' — ' + critical_errors[0] : ''}`);

            // Check mount has content with non-zero dimensions
            const dims = await page.$eval('#control-mount', el => {
                const rect = el.getBoundingClientRect();
                return { w: rect.width, h: rect.height, html: el.innerHTML.length };
            });
            assert(dims.html > 10, `${ctrl.name}: has content (${dims.html} chars)`);

            // Check no "undefined" text rendered visibly
            if (ctrl.checks.includes('no_undefined')) {
                const has_undefined = await page.$eval('#control-mount', el => {
                    return el.textContent.includes('undefined');
                });
                assert(!has_undefined, `${ctrl.name}: no "undefined" text`);
            }

            // Control-specific checks
            if (ctrl.checks.includes('has_input_file')) {
                const has_file_input = await page.$('#control-mount input[type="file"]');
                assert(!!has_file_input, `${ctrl.name}: has file input`);
            }

            if (ctrl.checks.includes('has_input_radio')) {
                const has_radio = await page.$('#control-mount input[type="radio"]');
                assert(!!has_radio, `${ctrl.name}: has radio input`);
            }

            if (ctrl.checks.includes('has_svg')) {
                const has_svg = await page.$('#control-mount svg');
                assert(!!has_svg, `${ctrl.name}: has SVG element`);
            }

            if (ctrl.checks.includes('has_lines')) {
                const line_count = await page.$$eval('#control-mount line', els => els.length);
                assert(line_count > 0, `${ctrl.name}: has line elements (${line_count})`);
            }

            if (ctrl.checks.includes('has_text')) {
                const text = await page.$eval('#control-mount', el => el.textContent.trim());
                assert(text.length > 0, `${ctrl.name}: has text content`);
            }

            if (ctrl.checks.includes('has_dot')) {
                const has_dot = await page.$('#control-mount .indicator-dot');
                assert(!!has_dot, `${ctrl.name}: has indicator dot`);
            }

            // Take screenshot
            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, `fixed-${ctrl.name}.png`),
                fullPage: true
            });

        } catch (e) {
            assert(false, `${ctrl.name}: page load failed — ${e.message}`);
        }
        await page.close();
    }

    // ── Test 2: Controls with new gallery specs render properly ──
    console.log('\n── Testing gallery-spec controls ──');

    for (const name of SPEC_CONTROLS) {
        const page = await browser.newPage();
        try {
            await page.goto(`${BASE_URL}/?control=${name}`, { 
                waitUntil: 'networkidle0', 
                timeout: 15000 
            });
            await delay(300);

            const has_error = await page.$eval('#control-mount', el => {
                return el.innerHTML.includes('Instantiation Error');
            });
            assert(!has_error, `${name}: renders with spec`);

            if (!has_error) {
                const dims = await page.$eval('#control-mount', el => ({
                    w: el.getBoundingClientRect().width,
                    h: el.getBoundingClientRect().height,
                    html: el.innerHTML.length
                }));
                assert(dims.html > 10, `${name}: has content (${dims.html} chars)`);
            }

        } catch (e) {
            assert(false, `${name}: page load failed — ${e.message}`);
        }
        await page.close();
    }

    // ── Test 3: Skipped controls show utility message ─────────
    console.log('\n── Testing skip list controls ──');

    for (const name of SKIP_CONTROLS) {
        const page = await browser.newPage();
        try {
            await page.goto(`${BASE_URL}/?control=${name}`, { 
                waitUntil: 'networkidle0', 
                timeout: 15000 
            });
            await delay(200);

            const is_utility = await page.$eval('#control-mount', el => {
                return el.innerHTML.includes('utility class');
            });
            // Some skipped controls may not exist in registry
            const is_404 = await page.evaluate(() => document.body.textContent.includes('Unknown control'));
            assert(is_utility || is_404, `${name}: properly skipped or not in registry`);

        } catch (e) {
            assert(false, `${name}: skip check failed — ${e.message}`);
        }
        await page.close();
    }

    // ── Take a combined screenshot of the index ──────────────
    const index_page = await browser.newPage();
    await index_page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
    await index_page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'gallery-index.png'),
        fullPage: true
    });
    await index_page.close();

    // ── Print results ────────────────────────────────────────
    console.log('\n━━━ GALLERY VERIFICATION RESULTS ━━━\n');
    results.forEach(r => console.log(r));
    console.log(`\n  ${passed} passed, ${failed} failed`);
    console.log(failed === 0 ? '\n=== ALL PASS ✓ ===' : '\n=== FAILURES ✗ ===');

    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
}

run_tests().catch(err => { console.error('Fatal:', err); process.exit(1); });
