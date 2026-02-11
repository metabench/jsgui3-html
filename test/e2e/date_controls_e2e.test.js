/**
 * Comprehensive E2E Tests — Date Controls (Month_View, Date_Picker)
 *
 * Tests:
 *   1. Page Structure & Rendering
 *   2. Single Select Mode
 *   3. Range Select Mode
 *   4. Multi Select Mode
 *   5. Date Picker (Year/Month Navigation)
 *   6. Week Numbers
 *   7. Sunday-First Layout
 *   8. Min/Max Bounds
 *
 * Server: lab/date_controls_e2e_server.js (port 3611)
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3611;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SERVER_SCRIPT = path.join(__dirname, '..', '..', 'lab', 'date_controls_e2e_server.js');

let browser, page, serverProcess;

// ── Helper Functions ──

/** Wait for the page to fully load and activate */
async function waitForActivation(pg) {
    await pg.waitForFunction(
        () => document.querySelector('.month-view') !== null,
        { timeout: 15000 }
    );
    // Give activation a moment to complete
    await pg.waitForTimeout(1000);
}

/**
 * Get selectable day cells with text content.
 * Valid day cells have numeric span text and do NOT have the disabled background (#DDDDDD).
 */
async function getSelectableDays(pg, mvSelector) {
    return pg.evaluate((sel) => {
        const mv = document.querySelector(sel);
        if (!mv) return [];
        const cells = mv.querySelectorAll('.row:not(.header) .cell:not(.week-number)');
        const days = [];
        cells.forEach(cell => {
            const span = cell.querySelector('span');
            const text = span ? span.textContent.trim() : '';
            if (!/^\d+$/.test(text)) return;
            // Disabled cells have inline background-color:#DDDDDD (= rgb(221,221,221))
            // Valid cells have background-color:inherit or no background - not disabled
            const bg = cell.style.backgroundColor;
            const isDisabled = bg === '#DDDDDD' || bg === 'rgb(221, 221, 221)';
            // Also check for out-of-bounds class
            if (isDisabled || cell.classList.contains('out-of-bounds')) return;
            days.push({
                text,
                day: parseInt(text, 10),
                classes: cell.className,
                hasSelected: cell.classList.contains('selected'),
                hasWeekend: cell.classList.contains('weekend'),
                hasOutOfBounds: cell.classList.contains('out-of-bounds'),
            });
        });
        return days;
    }, mvSelector);
}

/**
 * Click (mousedown) a specific day number within a month-view.
 * The selectable mixin binds to mousedown, not click.
 */
async function clickDay(pg, mvSelector, dayNum, opts = {}) {
    const clicked = await pg.evaluate((sel, day, options) => {
        const mv = document.querySelector(sel);
        if (!mv) return false;
        const cells = mv.querySelectorAll('.row:not(.header) .cell');
        for (const cell of cells) {
            const span = cell.querySelector('span');
            if (span && span.textContent.trim() === String(day)) {
                // Dispatch mousedown (what the selectable mixin listens to)
                cell.dispatchEvent(new MouseEvent('mousedown', {
                    bubbles: true, cancelable: true,
                    ctrlKey: !!options.ctrl,
                    shiftKey: !!options.shift,
                    metaKey: !!options.meta,
                }));
                // Also dispatch mouseup for range mode
                cell.dispatchEvent(new MouseEvent('mouseup', {
                    bubbles: true, cancelable: true,
                    ctrlKey: !!options.ctrl,
                    shiftKey: !!options.shift,
                    metaKey: !!options.meta,
                }));
                // Also dispatch click for multi mode (which listens to click)
                cell.dispatchEvent(new MouseEvent('click', {
                    bubbles: true, cancelable: true,
                    ctrlKey: !!options.ctrl,
                    shiftKey: !!options.shift,
                    metaKey: !!options.meta,
                }));
                return true;
            }
        }
        return false;
    }, mvSelector, dayNum, opts);
    await pg.waitForTimeout(200);
    return clicked;
}

/**
 * Get cells with the .selected class, plus range/multi classes.
 */
async function getSelectedCells(pg, mvSelector) {
    return pg.evaluate((sel) => {
        const mv = document.querySelector(sel);
        if (!mv) return { selected: [], rangeStart: [], rangeEnd: [], rangeBetween: [], multiSelected: [] };
        const result = { selected: [], rangeStart: [], rangeEnd: [], rangeBetween: [], multiSelected: [] };
        mv.querySelectorAll('.row:not(.header) .cell').forEach(cell => {
            const span = cell.querySelector('span');
            const text = span ? span.textContent.trim() : '';
            if (cell.classList.contains('selected')) result.selected.push(text);
            if (cell.classList.contains('range-start')) result.rangeStart.push(text);
            if (cell.classList.contains('range-end')) result.rangeEnd.push(text);
            if (cell.classList.contains('range-between')) result.rangeBetween.push(text);
            if (cell.classList.contains('multi-selected')) result.multiSelected.push(text);
        });
        return result;
    }, mvSelector);
}

/** Get header labels from a month-view */
async function getHeaderLabels(pg, mvSelector) {
    return pg.evaluate((sel) => {
        const mv = document.querySelector(sel);
        if (!mv) return [];
        const header = mv.querySelector('.row.header');
        if (!header) return [];
        const labels = [];
        header.querySelectorAll('.cell span').forEach(span => {
            const text = span.textContent.trim();
            if (text && text !== 'W') labels.push(text);
        });
        return labels;
    }, mvSelector);
}

/** Get week number values from the week-number gutter */
async function getWeekNumbers(pg, mvSelector) {
    return pg.evaluate((sel) => {
        const mv = document.querySelector(sel);
        if (!mv) return [];
        const nums = [];
        mv.querySelectorAll('.row:not(.header) .cell.week-number').forEach(cell => {
            const span = cell.querySelector('span');
            const text = span ? span.textContent.trim() : '';
            if (text) nums.push(text);
        });
        return nums;
    }, mvSelector);
}

/** Get ALL day cells (including disabled) with their state */
async function getAllDayCells(pg, mvSelector) {
    return pg.evaluate((sel) => {
        const mv = document.querySelector(sel);
        if (!mv) return [];
        const days = [];
        mv.querySelectorAll('.row:not(.header) .cell:not(.week-number)').forEach(cell => {
            const span = cell.querySelector('span');
            const text = span ? span.textContent.trim() : '';
            if (/^\d+$/.test(text)) {
                days.push({
                    day: parseInt(text, 10),
                    bg: cell.style.backgroundColor,
                    classes: cell.className,
                    outOfBounds: cell.classList.contains('out-of-bounds'),
                });
            }
        });
        return days;
    }, mvSelector);
}

// ── Server Lifecycle ──

beforeAll(async () => {
    // Start server
    serverProcess = spawn('node', [SERVER_SCRIPT], {
        env: { ...process.env, PORT: String(PORT) },
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for server ready — look for the actual HTTP binding
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Server start timeout')), 90000);
        let output = '';
        serverProcess.stdout.on('data', (data) => {
            const msg = data.toString();
            output += msg;
            process.stdout.write('[server] ' + msg);
            // Wait until we see the server has bound to at least one address
            if (output.includes('Server running')) {
                clearTimeout(timeout);
                resolve();
            }
        });
        serverProcess.stderr.on('data', (data) => {
            process.stderr.write('[server:err] ' + data.toString());
        });
        serverProcess.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
    // Extra wait for full initialization and all interfaces to bind
    await new Promise(r => setTimeout(r, 5000));

    // Launch browser
    browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
}, 120000);

afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
        await new Promise(r => setTimeout(r, 1000));
    }
});

beforeEach(async () => {
    page = await browser.newPage();
    page.on('console', msg => {
        // Log everything for debugging
        console.log(`[page:${msg.type()}]`, msg.text());
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitForActivation(page);
});

afterEach(async () => {
    if (page) await page.close();
});

// ═══════════════════════════════════════════════════
// 1. PAGE STRUCTURE & RENDERING
// ═══════════════════════════════════════════════════
describe('1. Page Structure & Rendering', () => {
    test('page loads with title', async () => {
        const title = await page.$eval('.demo-title', el => el.textContent);
        expect(title).toContain('Date Controls');
    });

    test('all 7 demo sections are rendered', async () => {
        const sections = await page.$$('.demo-section');
        expect(sections.length).toBe(7);
    });

    test('7 month-view instances total on page', async () => {
        const count = await page.evaluate(() => document.querySelectorAll('.month-view').length);
        expect(count).toBe(7);
    });

    test('each section has the correct class name', async () => {
        const classes = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.demo-section')).map(s => s.className)
        );
        expect(classes).toContain('demo-section section-single');
        expect(classes).toContain('demo-section section-range');
        expect(classes).toContain('demo-section section-multi');
        expect(classes).toContain('demo-section section-datepicker');
        expect(classes).toContain('demo-section section-weeknums');
        expect(classes).toContain('demo-section section-sundayfirst');
        expect(classes).toContain('demo-section section-bounds');
    });

    test('month-view header row has 7 day labels', async () => {
        const labels = await getHeaderLabels(page, '#mv-single');
        expect(labels.length).toBe(7);
    });

    test('single-select month-view has 28 selectable days (Feb 2026)', async () => {
        const days = await getSelectableDays(page, '#mv-single');
        expect(days.length).toBe(28);
        expect(days[0].day).toBe(1);
        expect(days[days.length - 1].day).toBe(28);
    });

    test('no error messages rendered', async () => {
        const errors = await page.$$('.demo-section pre');
        expect(errors.length).toBe(0);
    });
});

// ═══════════════════════════════════════════════════
// 2. SINGLE SELECT MODE (selectable mixin adds .selected class on mousedown)
// ═══════════════════════════════════════════════════
describe('2. Single Select Mode', () => {
    test('mousedown on a day adds .selected class', async () => {
        await clickDay(page, '#mv-single', 15);
        const result = await getSelectedCells(page, '#mv-single');
        expect(result.selected).toContain('15');
    });

    test('clicking a different day moves .selected to new cell', async () => {
        await clickDay(page, '#mv-single', 10);
        await clickDay(page, '#mv-single', 20);
        const result = await getSelectedCells(page, '#mv-single');
        expect(result.selected).toContain('20');
        expect(result.selected).not.toContain('10');
    });

    test('only one day is selected at a time', async () => {
        await clickDay(page, '#mv-single', 5);
        await clickDay(page, '#mv-single', 12);
        await clickDay(page, '#mv-single', 25);
        const result = await getSelectedCells(page, '#mv-single');
        expect(result.selected.length).toBe(1);
        expect(result.selected[0]).toBe('25');
    });

    test('clicking day 1 selects the first of the month', async () => {
        await clickDay(page, '#mv-single', 1);
        const result = await getSelectedCells(page, '#mv-single');
        expect(result.selected).toContain('1');
    });

    test('clicking day 28 selects the last day', async () => {
        await clickDay(page, '#mv-single', 28);
        const result = await getSelectedCells(page, '#mv-single');
        expect(result.selected).toContain('28');
    });

    test('weekend days are selectable and have weekend class', async () => {
        const days = await getSelectableDays(page, '#mv-single');
        const weekendDays = days.filter(d => d.hasWeekend);
        expect(weekendDays.length).toBeGreaterThan(0);
        // Click a weekend day
        await clickDay(page, '#mv-single', weekendDays[0].day);
        const result = await getSelectedCells(page, '#mv-single');
        expect(result.selected).toContain(String(weekendDays[0].day));
    });
});

// ═══════════════════════════════════════════════════
// 3. RANGE SELECT MODE
// ═══════════════════════════════════════════════════
describe('3. Range Select Mode', () => {
    test('two-click range: first click then second click creates range', async () => {
        await clickDay(page, '#mv-range', 5);
        await clickDay(page, '#mv-range', 15);
        const result = await getSelectedCells(page, '#mv-range');
        // Should have range-start, range-end, and range-between cells
        const totalRange = result.rangeStart.length + result.rangeEnd.length + result.rangeBetween.length;
        expect(totalRange).toBeGreaterThan(0);
    });

    test('range start and end cells get correct classes', async () => {
        await clickDay(page, '#mv-range', 8);
        await clickDay(page, '#mv-range', 12);
        const result = await getSelectedCells(page, '#mv-range');
        expect(result.rangeStart.length).toBeGreaterThanOrEqual(1);
        expect(result.rangeEnd.length).toBeGreaterThanOrEqual(1);
    });

    test('range between cells are highlighted', async () => {
        await clickDay(page, '#mv-range', 5);
        await clickDay(page, '#mv-range', 15);
        const result = await getSelectedCells(page, '#mv-range');
        // Days 6-14 should have range-between class
        expect(result.rangeBetween.length).toBeGreaterThan(0);
    });

    test('reverse range (end before start) auto-swaps', async () => {
        await clickDay(page, '#mv-range', 20);
        await clickDay(page, '#mv-range', 5);
        const result = await getSelectedCells(page, '#mv-range');
        const totalRange = result.rangeStart.length + result.rangeEnd.length + result.rangeBetween.length;
        expect(totalRange).toBeGreaterThan(0);
    });

    test('shift+click extends range from anchor', async () => {
        // First establish a range
        await clickDay(page, '#mv-range', 3);
        await clickDay(page, '#mv-range', 5);
        // Now shift+click to extend
        await clickDay(page, '#mv-range', 20, { shift: true });
        const result = await getSelectedCells(page, '#mv-range');
        const totalRange = result.rangeStart.length + result.rangeEnd.length + result.rangeBetween.length;
        expect(totalRange).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════
// 4. MULTI SELECT MODE
// ═══════════════════════════════════════════════════
describe('4. Multi Select Mode', () => {
    test('plain click selects one date with multi-selected class', async () => {
        await clickDay(page, '#mv-multi', 7);
        const result = await getSelectedCells(page, '#mv-multi');
        expect(result.multiSelected.length).toBe(1);
        expect(result.multiSelected).toContain('7');
    });

    test('ctrl+click toggles additional dates', async () => {
        await clickDay(page, '#mv-multi', 3);
        await clickDay(page, '#mv-multi', 7, { ctrl: true });
        await clickDay(page, '#mv-multi', 14, { ctrl: true });
        const result = await getSelectedCells(page, '#mv-multi');
        expect(result.multiSelected.length).toBeGreaterThanOrEqual(2);
    });

    test('ctrl+click toggles off a selected date', async () => {
        await clickDay(page, '#mv-multi', 10);
        await clickDay(page, '#mv-multi', 15, { ctrl: true });
        // Now deselect 10
        await clickDay(page, '#mv-multi', 10, { ctrl: true });
        const result = await getSelectedCells(page, '#mv-multi');
        expect(result.multiSelected).not.toContain('10');
    });

    test('shift+click selects contiguous range', async () => {
        await clickDay(page, '#mv-multi', 5);
        await clickDay(page, '#mv-multi', 12, { shift: true });
        const result = await getSelectedCells(page, '#mv-multi');
        // Days 5-12 should all be multi-selected
        expect(result.multiSelected.length).toBeGreaterThanOrEqual(7);
    });

    test('plain click after multi-select resets to single', async () => {
        await clickDay(page, '#mv-multi', 3);
        await clickDay(page, '#mv-multi', 8, { ctrl: true });
        await clickDay(page, '#mv-multi', 15, { ctrl: true });
        // Plain click resets
        await clickDay(page, '#mv-multi', 20);
        const result = await getSelectedCells(page, '#mv-multi');
        expect(result.multiSelected.length).toBe(1);
        expect(result.multiSelected).toContain('20');
    });
});

// ═══════════════════════════════════════════════════
// 5. DATE PICKER
// ═══════════════════════════════════════════════════
describe('5. Date Picker', () => {
    test('date picker section rendered with ID', async () => {
        const dp = await page.$('#date-picker');
        expect(dp).not.toBeNull();
    });

    test('date picker contains a month-view', async () => {
        const mv = await page.$('#date-picker .month-view');
        expect(mv).not.toBeNull();
    });

    test('date picker has arrow navigation selectors', async () => {
        const selectors = await page.$$('#date-picker .left-right');
        expect(selectors.length).toBeGreaterThanOrEqual(1);
    });

    test('date picker has arrow buttons', async () => {
        const arrows = await page.$$('#date-picker .button.arrow');
        expect(arrows.length).toBeGreaterThanOrEqual(2);
    });
});

// ═══════════════════════════════════════════════════
// 6. WEEK NUMBERS
// ═══════════════════════════════════════════════════
describe('6. Week Numbers', () => {
    test('header row includes W column', async () => {
        const hasW = await page.evaluate(() => {
            const mv = document.getElementById('mv-weeknums');
            if (!mv) return false;
            const header = mv.querySelector('.row.header');
            if (!header) return false;
            const cells = header.querySelectorAll('.cell');
            const first = cells[0]?.querySelector('span');
            return first ? first.textContent.trim() === 'W' : false;
        });
        expect(hasW).toBe(true);
    });

    test('header has 8 columns (W + 7 days)', async () => {
        const count = await page.evaluate(() => {
            const mv = document.getElementById('mv-weeknums');
            const header = mv?.querySelector('.row.header');
            return header ? header.querySelectorAll('.cell').length : 0;
        });
        expect(count).toBe(8);
    });

    test('week number cells show valid ISO week numbers (1-53)', async () => {
        const weekNums = await getWeekNumbers(page, '#mv-weeknums');
        expect(weekNums.length).toBeGreaterThanOrEqual(4);
        weekNums.forEach(n => {
            const num = parseInt(n, 10);
            expect(num).toBeGreaterThan(0);
            expect(num).toBeLessThanOrEqual(53);
        });
    });

    test('week number cells have week-number class', async () => {
        const hasClass = await page.evaluate(() => {
            const mv = document.getElementById('mv-weeknums');
            if (!mv) return false;
            const wnCells = mv.querySelectorAll('.cell.week-number');
            return wnCells.length >= 5; // header W + data rows
        });
        expect(hasClass).toBe(true);
    });

    test('day cells are still present alongside week numbers', async () => {
        const days = await getSelectableDays(page, '#mv-weeknums');
        expect(days.length).toBe(28); // Feb 2026
    });
});

// ═══════════════════════════════════════════════════
// 7. SUNDAY-FIRST LAYOUT
// ═══════════════════════════════════════════════════
describe('7. Sunday-First Layout', () => {
    test('Sunday-first header starts with Sun', async () => {
        const labels = await getHeaderLabels(page, '#mv-sundayfirst');
        expect(labels.length).toBe(7);
        // First label should contain 'Sun' or 'Su' or 'S' (depending on abbreviation)
        expect(labels[0].toLowerCase()).toMatch(/^su/);
    });

    test('Sunday-first header differs from default (Monday-first)', async () => {
        const defaultLabels = await getHeaderLabels(page, '#mv-single');
        const sundayLabels = await getHeaderLabels(page, '#mv-sundayfirst');
        expect(sundayLabels[0]).not.toBe(defaultLabels[0]);
    });

    test('Sunday-first renders same number of selectable days', async () => {
        const days = await getSelectableDays(page, '#mv-sundayfirst');
        expect(days.length).toBe(28);
    });

    test('day 1 column differs between layouts', async () => {
        // Feb 1 2026 is a Sunday: in Monday-first → column 6, in Sunday-first → column 0
        const defaultPos = await page.evaluate(() => {
            const mv = document.getElementById('mv-single');
            if (!mv) return -1;
            const rows = mv.querySelectorAll('.row:not(.header)');
            for (const row of rows) {
                const cells = row.querySelectorAll('.cell');
                for (let i = 0; i < cells.length; i++) {
                    const span = cells[i].querySelector('span');
                    if (span && span.textContent.trim() === '1') return i;
                }
            }
            return -1;
        });
        const sundayPos = await page.evaluate(() => {
            const mv = document.getElementById('mv-sundayfirst');
            if (!mv) return -1;
            const rows = mv.querySelectorAll('.row:not(.header)');
            for (const row of rows) {
                const cells = row.querySelectorAll('.cell');
                for (let i = 0; i < cells.length; i++) {
                    const span = cells[i].querySelector('span');
                    if (span && span.textContent.trim() === '1') return i;
                }
            }
            return -1;
        });
        expect(defaultPos).not.toBe(sundayPos);
    });
});

// ═══════════════════════════════════════════════════
// 8. MIN/MAX BOUNDS
// ═══════════════════════════════════════════════════
describe('8. Min/Max Bounds', () => {
    test('bounded month-view renders', async () => {
        const mv = await page.$('#mv-bounds');
        expect(mv).not.toBeNull();
    });

    test('in-bounds days are selectable (no out-of-bounds class)', async () => {
        const days = await getSelectableDays(page, '#mv-bounds');
        // Days 5-20 should be selectable (16 days)
        expect(days.length).toBeGreaterThan(0);
        expect(days.length).toBeLessThanOrEqual(16);
    });

    test('out-of-bound days have out-of-bounds class', async () => {
        const allDays = await getAllDayCells(page, '#mv-bounds');
        const oob = allDays.filter(d => d.outOfBounds);
        // Days 1-4 and 21-28 should be out-of-bounds (12 days)
        expect(oob.length).toBeGreaterThan(0);
    });

    test('out-of-bounds days have disabled background', async () => {
        const allDays = await getAllDayCells(page, '#mv-bounds');
        const oob = allDays.filter(d => d.outOfBounds);
        oob.forEach(d => {
            // Should have a background color set (not inherit or empty)
            expect(d.bg).toBeTruthy();
            expect(d.bg).not.toBe('inherit');
        });
    });

    test('total visible days is 28 (Feb 2026)', async () => {
        const allDays = await getAllDayCells(page, '#mv-bounds');
        expect(allDays.length).toBe(28);
    });

    test('clicking an in-bounds day works', async () => {
        const clicked = await clickDay(page, '#mv-bounds', 10);
        expect(clicked).toBe(true);
    });
});
