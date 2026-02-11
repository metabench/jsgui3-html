/**
 * Diagnostic: check if _cell_date_map is populated after activation.
 * Run while the E2E server is NOT running (we start our own).
 */
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3612; // Use different port to avoid conflict
const SERVER_SCRIPT = path.join(__dirname, '..', '..', 'lab', 'date_controls_e2e_server.js');

(async () => {
    // Start server
    const server = spawn('node', [SERVER_SCRIPT], {
        env: { ...process.env, PORT: String(PORT) },
        stdio: ['pipe', 'pipe', 'pipe']
    });

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('timeout')), 90000);
        server.stdout.on('data', d => {
            const msg = d.toString();
            process.stdout.write('[s] ' + msg);
            if (msg.includes('Server running')) { clearTimeout(timeout); resolve(); }
        });
        server.stderr.on('data', d => process.stderr.write('[e] ' + d.toString()));
    });
    await new Promise(r => setTimeout(r, 3000));

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('.month-view'), { timeout: 15000 });
    await page.waitForTimeout(2000);

    const info = await page.evaluate(() => {
        const jsgui = window.jsgui3;
        const ctx = jsgui && jsgui.client_context;
        if (!ctx) return { error: 'no client_context' };

        const controls = ctx._map_controls;
        if (!controls) return { error: 'no _map_controls' };

        let result = {};

        // Find all month_view controls
        let monthViews = [];
        controls.forEach((ctrl, id) => {
            if (ctrl && ctrl.__type_name === 'month_view') {
                const mapSize = ctrl._cell_date_map ? ctrl._cell_date_map.size : -1;
                const dateMapSize = ctrl._date_cell_map ? ctrl._date_cell_map.size : -1;

                let cellCount = 0, cellsWithValue = 0, sampleValues = [];
                if (typeof ctrl.each_cell === 'function') {
                    ctrl.each_cell((cell, pos) => {
                        cellCount++;
                        if (cell.value != null) {
                            cellsWithValue++;
                            if (sampleValues.length < 3) sampleValues.push({ pos: pos.toString(), value: cell.value, typeName: cell.__type_name });
                        }
                    });
                }

                monthViews.push({
                    id: ctrl.dom && ctrl.dom.attrs && ctrl.dom.attrs.id,
                    mode: ctrl.selection_mode,
                    month: ctrl.month,
                    year: ctrl.year,
                    mapSize, dateMapSize,
                    cellCount, cellsWithValue, sampleValues,
                    rangeStart: ctrl._range_start,
                    rangeEnd: ctrl._range_end,
                    anchor: ctrl._anchor_date,
                });
            }
        });

        result.monthViews = monthViews;
        result.totalControls = controls.size;
        return result;
    });

    console.log('\n=== DIAGNOSTIC RESULTS ===');
    console.log(JSON.stringify(info, null, 2));

    await browser.close();
    server.kill('SIGTERM');
    process.exit(0);
})();
