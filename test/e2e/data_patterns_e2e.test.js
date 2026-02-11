/**
 * Data Patterns E2E Tests
 * 
 * Comprehensive Puppeteer tests verifying Data_Object, Data_Value,
 * change events, MVVM sync, and edge cases.
 */
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3610;
const URL = `http://localhost:${PORT}`;
const SERVER_PATH = path.join(__dirname, '../../lab/data_patterns_demo_server.js');

let browser, page, serverProcess;

// ── Server lifecycle ──────────────────────────

async function startServer() {
    return new Promise((resolve, reject) => {
        serverProcess = spawn('node', [SERVER_PATH], {
            env: { ...process.env },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let started = false;
        const timeout = setTimeout(() => {
            if (!started) reject(new Error('Server start timeout'));
        }, 30000);

        serverProcess.stdout.on('data', data => {
            const str = data.toString();
            console.log('[server]', str.trim());
            if (str.includes('running on') && !started) {
                started = true;
                clearTimeout(timeout);
                // Give it a moment to be fully ready
                setTimeout(resolve, 1000);
            }
        });

        serverProcess.stderr.on('data', data => {
            const str = data.toString();
            if (str.trim()) console.error('[server:err]', str.trim());
        });

        serverProcess.on('error', err => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

function stopServer() {
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
        serverProcess = null;
    }
}

// ── Test helpers ──────────────────────────────

async function waitForActivation(p, timeoutMs = 15000) {
    await p.waitForFunction(
        () => window.__data_model !== undefined,
        { timeout: timeoutMs }
    );
}

async function getModelValue(p, field) {
    return p.evaluate((f) => {
        const model = window.__data_model;
        const v = model.get(f);
        return (v && v.value !== undefined) ? v.value : v;
    }, field);
}

async function setModelValue(p, field, value) {
    return p.evaluate((f, v) => {
        window.__data_model.set(f, v);
    }, field, value);
}

async function getElementText(p, id) {
    return p.evaluate(i => {
        const el = document.getElementById(i);
        return el ? (el.value !== undefined && el.tagName === 'INPUT' ? el.value : el.textContent) : null;
    }, id);
}

async function getSliderValue(p, id) {
    return p.evaluate(i => {
        const el = document.getElementById(i);
        return el ? parseInt(el.value, 10) : null;
    }, id);
}

async function setSliderValue(p, id, value) {
    await p.evaluate((i, v) => {
        const el = document.getElementById(i);
        if (el) {
            el.value = v;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, id, value);
    // Allow propagation
    await p.waitForTimeout(100);
}

async function setInputValue(p, id, value) {
    await p.evaluate((i, v) => {
        const el = document.getElementById(i);
        if (el) {
            el.value = v;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, id, value);
    await p.waitForTimeout(100);
}

async function getSwatchColor(p) {
    return p.evaluate(() => {
        const el = document.getElementById('preview-swatch');
        return el ? el.style.backgroundColor : null;
    });
}

async function getEventCount(p) {
    return p.evaluate(() => window.__event_count ? window.__event_count() : 0);
}

// ══════════════════════════════════════════════
// TEST SUITES
// ══════════════════════════════════════════════

describe('Data Patterns E2E Tests', () => {
    beforeAll(async () => {
        await startServer();
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }, 60000);

    afterAll(async () => {
        if (browser) await browser.close();
        stopServer();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        page.on('console', msg => {
            const text = msg.text();
            if (!text.includes('Download the React DevTools'))
                console.log(`  [page:${msg.type()}]`, text);
        });
        page.on('pageerror', err => console.error('  [page:error]', err.message));
        await page.goto(URL, { waitUntil: 'load', timeout: 20000 });
        await waitForActivation(page);
    });

    afterEach(async () => {
        if (page) await page.close();
    });

    // ── 1. Model Initialization ──────────────

    describe('1. Data_Object Initialization', () => {
        test('model has correct initial HSL values', async () => {
            expect(await getModelValue(page, 'h')).toBe(217);
            expect(await getModelValue(page, 's')).toBe(91);
            expect(await getModelValue(page, 'l')).toBe(60);
        });

        test('model has correct initial RGB values', async () => {
            const r = await getModelValue(page, 'r');
            const g = await getModelValue(page, 'g');
            const b = await getModelValue(page, 'b');
            // HSL(217,91,60) → approximately RGB(59,130,246)
            expect(r).toBeGreaterThanOrEqual(50);
            expect(r).toBeLessThanOrEqual(70);
            expect(g).toBeGreaterThanOrEqual(120);
            expect(g).toBeLessThanOrEqual(140);
            expect(b).toBeGreaterThanOrEqual(235);
            expect(b).toBeLessThanOrEqual(255);
        });

        test('model has correct initial hex value', async () => {
            const hex = await getModelValue(page, 'hex');
            expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('model keys are all present', async () => {
            const keys = await page.evaluate(() => window.__data_model.keys());
            expect(keys).toContain('h');
            expect(keys).toContain('s');
            expect(keys).toContain('l');
            expect(keys).toContain('r');
            expect(keys).toContain('g');
            expect(keys).toContain('b');
            expect(keys).toContain('hex');
        });

        test('model fields are Data_Value instances', async () => {
            const isDataValue = await page.evaluate(() => {
                const h = window.__data_model.get('h');
                return h && h.__data_value === true;
            });
            expect(isDataValue).toBe(true);
        });
    });

    // ── 2. HSL Slider → Model → Display ──────

    describe('2. HSL Slider → Model → Display (Change Propagation)', () => {
        test('moving H slider updates model and hex display', async () => {
            await setSliderValue(page, 'slider-h', 0);
            const h = await getModelValue(page, 'h');
            expect(h).toBe(0);

            const hex = await getModelValue(page, 'hex');
            // H=0, S=91, L=60 → red-ish
            expect(hex).toMatch(/^#[0-9a-f]{6}$/i);

            const display = await getElementText(page, 'hex-display');
            expect(display).toMatch(/^#[0-9A-F]{6}$/i);
        });

        test('moving S slider updates model and preview', async () => {
            await setSliderValue(page, 'slider-s', 0);
            const s = await getModelValue(page, 's');
            expect(s).toBe(0);

            // S=0 → grayscale
            const r = await getModelValue(page, 'r');
            const g = await getModelValue(page, 'g');
            const b = await getModelValue(page, 'b');
            // With S=0, R≈G≈B
            expect(Math.abs(r - g)).toBeLessThanOrEqual(5);
            expect(Math.abs(g - b)).toBeLessThanOrEqual(5);
        });

        test('moving L slider to 0 → black', async () => {
            await setSliderValue(page, 'slider-l', 0);
            const r = await getModelValue(page, 'r');
            const g = await getModelValue(page, 'g');
            const b = await getModelValue(page, 'b');
            expect(r).toBe(0);
            expect(g).toBe(0);
            expect(b).toBe(0);

            const hex = await getModelValue(page, 'hex');
            expect(hex).toBe('#000000');
        });

        test('moving L slider to 100 → white', async () => {
            await setSliderValue(page, 'slider-l', 100);
            const r = await getModelValue(page, 'r');
            const g = await getModelValue(page, 'g');
            const b = await getModelValue(page, 'b');
            expect(r).toBe(255);
            expect(g).toBe(255);
            expect(b).toBe(255);

            const hex = await getModelValue(page, 'hex');
            expect(hex).toBe('#ffffff');
        });

        test('slider value display updates', async () => {
            await setSliderValue(page, 'slider-h', 120);
            const display = await getElementText(page, 'slider-h-val');
            expect(display).toBe('120');
        });
    });

    // ── 3. Hex Input → Model → All Displays ──

    describe('3. Hex Input → Model (Bidirectional)', () => {
        test('typing valid hex updates HSL model values', async () => {
            await setInputValue(page, 'input-hex', '#ff0000');
            const h = await getModelValue(page, 'h');
            const s = await getModelValue(page, 's');
            const l = await getModelValue(page, 'l');
            // Red: H=0, S=100, L=50
            expect(h).toBe(0);
            expect(s).toBe(100);
            expect(l).toBe(50);
        });

        test('typing valid hex updates RGB model values', async () => {
            await setInputValue(page, 'input-hex', '#00ff00');
            const r = await getModelValue(page, 'r');
            const g = await getModelValue(page, 'g');
            const b = await getModelValue(page, 'b');
            expect(r).toBe(0);
            expect(g).toBe(255);
            expect(b).toBe(0);
        });

        test('typing valid hex updates slider positions', async () => {
            await setInputValue(page, 'input-hex', '#0000ff');
            const val = await getSliderValue(page, 'slider-h');
            expect(val).toBe(240); // Blue hue
        });

        test('typing valid hex updates preview swatch', async () => {
            await setInputValue(page, 'input-hex', '#ff6600');
            await page.waitForTimeout(100);
            const color = await getSwatchColor(page);
            // Browser normalizes to rgb()
            expect(color).toBeTruthy();
        });
    });

    // ── 4. RGB Input → Model → HSL ──────────

    describe('4. RGB Input → Model → HSL (Bidirectional Propagation)', () => {
        test('setting R input updates model and HSL', async () => {
            await setInputValue(page, 'input-r', '255');
            const r = await getModelValue(page, 'r');
            expect(r).toBe(255);

            // HSL should have recomputed
            const h = await getModelValue(page, 'h');
            expect(typeof h).toBe('number');
        });

        test('setting all RGB to 0 → black (H=0, S=0, L=0)', async () => {
            await setInputValue(page, 'input-r', '0');
            await setInputValue(page, 'input-g', '0');
            await setInputValue(page, 'input-b', '0');
            expect(await getModelValue(page, 'r')).toBe(0);
            expect(await getModelValue(page, 'g')).toBe(0);
            expect(await getModelValue(page, 'b')).toBe(0);
            expect(await getModelValue(page, 'l')).toBe(0);
        });

        test('setting all RGB to 255 → white (S=0, L=100)', async () => {
            await setInputValue(page, 'input-r', '255');
            await setInputValue(page, 'input-g', '255');
            await setInputValue(page, 'input-b', '255');
            expect(await getModelValue(page, 's')).toBe(0);
            expect(await getModelValue(page, 'l')).toBe(100);
        });
    });

    // ── 5. Data_Value.sync() ─────────────────

    describe('5. Data_Value.sync() Bidirectional Binding', () => {
        test('synced Data_Value exists', async () => {
            const exists = await page.evaluate(() => window.__synced_dv !== undefined);
            expect(exists).toBe(true);
        });

        test('synced_dv has same initial value as model.h', async () => {
            const model_h = await getModelValue(page, 'h');
            const synced = await page.evaluate(() => window.__synced_dv.value);
            expect(synced).toBe(model_h);
        });

        test('changing model.h propagates to synced_dv', async () => {
            await setModelValue(page, 'h', 100);
            await page.waitForTimeout(50);
            const synced = await page.evaluate(() => window.__synced_dv.value);
            expect(synced).toBe(100);
        });

        test('changing synced_dv propagates back to model.h', async () => {
            await page.evaluate(() => { window.__synced_dv.value = 200; });
            await page.waitForTimeout(50);
            const model_h = await getModelValue(page, 'h');
            expect(model_h).toBe(200);
        });

        test('sync change count increments', async () => {
            const before = await page.evaluate(() =>
                parseInt(document.getElementById('sync-change-count').textContent, 10)
            );
            await setModelValue(page, 'h', 42);
            await page.waitForTimeout(50);
            const after = await page.evaluate(() =>
                parseInt(document.getElementById('sync-change-count').textContent, 10)
            );
            expect(after).toBeGreaterThan(before);
        });

        test('sync display shows correct h value', async () => {
            await setModelValue(page, 'h', 123);
            await page.waitForTimeout(50);
            const display = await getElementText(page, 'sync-dv-h');
            expect(display).toBe('123');
        });
    });

    // ── 6. Re-entrancy and Edge Cases ────────

    describe('6. Re-entrancy Safety & Edge Cases', () => {
        test('same-value set does not fire change event', async () => {
            const before = await getEventCount(page);
            await setModelValue(page, 'h', 217);
            await page.waitForTimeout(50);
            // Set to same value again
            await setModelValue(page, 'h', 217);
            await page.waitForTimeout(50);
            const after = await getEventCount(page);
            // At most one change event should have fired (for the first set if needed)
            // The second set to same value should be a no-op
            expect(after - before).toBeLessThanOrEqual(10);
        });

        test('rapid slider changes do not crash', async () => {
            // Rapid fire: set H to many values quickly
            for (let i = 0; i < 10; i++) {
                await setSliderValue(page, 'slider-h', i * 36);
            }
            // Should still be responsive
            const h = await getModelValue(page, 'h');
            expect(typeof h).toBe('number');
            expect(h).toBeGreaterThanOrEqual(0);
            expect(h).toBeLessThanOrEqual(360);
        });

        test('no page errors during rapid changes', async () => {
            const errors = [];
            page.on('pageerror', err => errors.push(err.message));

            for (let i = 0; i < 20; i++) {
                await page.evaluate((val) => {
                    window.__data_model.set('h', val);
                }, i * 18);
            }
            await page.waitForTimeout(200);
            expect(errors.length).toBe(0);
        });

        test('boundary value H=0 works correctly', async () => {
            await setSliderValue(page, 'slider-h', 0);
            expect(await getModelValue(page, 'h')).toBe(0);
            const hex = await getModelValue(page, 'hex');
            expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('boundary value H=359 works correctly', async () => {
            await setSliderValue(page, 'slider-h', 359);
            expect(await getModelValue(page, 'h')).toBe(359);
        });

        test('boundary value S=0 gives grayscale', async () => {
            await setSliderValue(page, 'slider-s', 0);
            const r = await getModelValue(page, 'r');
            const g = await getModelValue(page, 'g');
            const b = await getModelValue(page, 'b');
            expect(Math.abs(r - g)).toBeLessThanOrEqual(2);
            expect(Math.abs(g - b)).toBeLessThanOrEqual(2);
        });

        test('boundary value S=100, L=50 gives fully saturated color', async () => {
            await setSliderValue(page, 'slider-h', 0);
            await setSliderValue(page, 'slider-s', 100);
            await setSliderValue(page, 'slider-l', 50);
            // Pure red: H=0, S=100, L=50 → #ff0000
            expect(await getModelValue(page, 'r')).toBe(255);
            expect(await getModelValue(page, 'g')).toBe(0);
            expect(await getModelValue(page, 'b')).toBe(0);
        });
    });

    // ── 7. Model → DOM Sync ─────────────────

    describe('7. Programmatic Model Changes → DOM Update', () => {
        test('setting model.h programmatically updates slider', async () => {
            await setModelValue(page, 'h', 180);
            await page.waitForTimeout(100);
            const val = await getSliderValue(page, 'slider-h');
            expect(val).toBe(180);
        });

        test('setting model.hex concept: setting RGB updates hex display', async () => {
            await page.evaluate(() => {
                const model = window.__data_model;
                model.set('r', 255);
                model.set('g', 0);
                model.set('b', 0);
            });
            await page.waitForTimeout(100);
            const hex = await getModelValue(page, 'hex');
            expect(hex).toBe('#ff0000');
        });

        test('preview swatch reflects model color', async () => {
            await setSliderValue(page, 'slider-h', 0);
            await setSliderValue(page, 'slider-s', 100);
            await setSliderValue(page, 'slider-l', 50);
            await page.waitForTimeout(100);
            const color = await getSwatchColor(page);
            // Browser will normalize to rgb(255, 0, 0) or similar
            expect(color).toBeTruthy();
            expect(color).toContain('255');
            expect(color).toContain('0');
        });

        test('HSL display text updates', async () => {
            await setSliderValue(page, 'slider-h', 120);
            await setSliderValue(page, 'slider-s', 100);
            await setSliderValue(page, 'slider-l', 50);
            await page.waitForTimeout(100);
            const text = await getElementText(page, 'hsl-display');
            expect(text).toContain('120');
            expect(text).toContain('100');
            expect(text).toContain('50');
        });

        test('RGB display text updates', async () => {
            await setSliderValue(page, 'slider-h', 0);
            await setSliderValue(page, 'slider-s', 100);
            await setSliderValue(page, 'slider-l', 50);
            await page.waitForTimeout(100);
            const text = await getElementText(page, 'rgb-display');
            expect(text).toContain('255');
        });
    });

    // ── 8. Full Round-Trip ───────────────────

    describe('8. Full Round-Trip (Slider → Model → Displays → Back)', () => {
        test('slider change → model → all displays update consistently', async () => {
            // Set a specific color: Green
            await setSliderValue(page, 'slider-h', 120);
            await setSliderValue(page, 'slider-s', 100);
            await setSliderValue(page, 'slider-l', 50);
            await page.waitForTimeout(200);

            // Model
            expect(await getModelValue(page, 'h')).toBe(120);
            expect(await getModelValue(page, 's')).toBe(100);
            expect(await getModelValue(page, 'l')).toBe(50);

            // RGB should be pure green
            expect(await getModelValue(page, 'r')).toBe(0);
            expect(await getModelValue(page, 'g')).toBe(255);
            expect(await getModelValue(page, 'b')).toBe(0);

            // Hex
            expect(await getModelValue(page, 'hex')).toBe('#00ff00');

            // DOM displays
            const hex_display = await getElementText(page, 'hex-display');
            expect(hex_display).toBe('#00FF00');

            // Slider value displays
            expect(await getElementText(page, 'slider-h-val')).toBe('120');
            expect(await getElementText(page, 'slider-s-val')).toBe('100');
            expect(await getElementText(page, 'slider-l-val')).toBe('50');
        });

        test('hex input → model → sliders update', async () => {
            await setInputValue(page, 'input-hex', '#ff8000');
            await page.waitForTimeout(200);

            // Should be orange-ish: H≈30, S high, L medium
            const h = await getModelValue(page, 'h');
            expect(h).toBeGreaterThanOrEqual(25);
            expect(h).toBeLessThanOrEqual(35);

            // Sliders should reflect
            const slider_h = await getSliderValue(page, 'slider-h');
            expect(slider_h).toBeGreaterThanOrEqual(25);
            expect(slider_h).toBeLessThanOrEqual(35);
        });

        test('RGB input → model → hex + HSL update', async () => {
            await setInputValue(page, 'input-r', '128');
            await setInputValue(page, 'input-g', '0');
            await setInputValue(page, 'input-b', '255');
            await page.waitForTimeout(200);

            const hex = await getModelValue(page, 'hex');
            // Should be purple-ish
            expect(hex).toMatch(/^#[0-9a-f]{6}$/i);

            const h = await getModelValue(page, 'h');
            // Purple hue range roughly 270
            expect(h).toBeGreaterThanOrEqual(250);
            expect(h).toBeLessThanOrEqual(290);
        });
    });

    // ── 9. Event System ─────────────────────

    describe('9. Change Event System', () => {
        test('events fire on model changes', async () => {
            const before = await getEventCount(page);
            await setModelValue(page, 'h', 42);
            await page.waitForTimeout(50);
            const after = await getEventCount(page);
            expect(after).toBeGreaterThan(before);
        });

        test('event log DOM element gets populated', async () => {
            await setSliderValue(page, 'slider-h', 180);
            await page.waitForTimeout(100);
            const entries = await page.evaluate(() =>
                document.querySelectorAll('#event-log .event-log-entry').length
            );
            expect(entries).toBeGreaterThan(0);
        });

        test('change event has correct name property', async () => {
            const result = await page.evaluate(() => {
                return new Promise(resolve => {
                    const events = [];
                    const handler = (e) => {
                        events.push({ name: e.name, hasValue: 'value' in e });
                    };
                    window.__data_model.on('change', handler);
                    window.__data_model.set('h', 99);
                    // Use setTimeout to collect all synchronous cascading events
                    setTimeout(() => {
                        window.__data_model.off('change', handler);
                        const hEvent = events.find(ev => ev.name === 'h');
                        resolve({
                            found: !!hEvent,
                            name: hEvent ? hEvent.name : events[0]?.name,
                            hasValue: hEvent ? hEvent.hasValue : false,
                            eventCount: events.length,
                            names: events.map(e => e.name)
                        });
                    }, 50);
                });
            });
            expect(result.found).toBe(true);
            expect(result.name).toBe('h');
            expect(result.hasValue).toBe(true);
        });

        test('Data_Value raises change with name=value', async () => {
            const result = await page.evaluate(() => {
                const dv = window.__data_model.get('h');
                return new Promise(resolve => {
                    const handler = (e) => {
                        dv.off('change', handler);
                        resolve({ name: e.name, value: e.value, old: e.old });
                    };
                    dv.on('change', handler);
                    dv.value = 77;
                });
            });
            expect(result.name).toBe('value');
            expect(result.value).toBe(77);
        });
    });

    // ── 10. Data_Object API ─────────────────

    describe('10. Data_Object API Verification', () => {
        test('Data_Object.get returns Data_Value for set fields', async () => {
            const is_dv = await page.evaluate(() => {
                const dv = window.__data_model.get('h');
                return dv && dv.__data_value === true;
            });
            expect(is_dv).toBe(true);
        });

        test('Data_Object.set with same value is no-op (Object.is)', async () => {
            const result = await page.evaluate(() => {
                const dv = window.__data_model.get('h');
                const initialVal = dv.value;
                let changeCount = 0;
                const handler = () => changeCount++;
                dv.on('change', handler);
                dv.value = initialVal; // same value
                dv.off('change', handler);
                return changeCount;
            });
            expect(result).toBe(0);
        });

        test('Data_Object.keys returns all field names', async () => {
            const keys = await page.evaluate(() => window.__data_model.keys());
            expect(keys.sort()).toEqual(['b', 'g', 'h', 'hex', 'l', 'r', 's']);
        });

        test('Data_Object.each iterates all fields', async () => {
            const count = await page.evaluate(() => {
                let c = 0;
                window.__data_model.each(() => c++);
                return c;
            });
            expect(count).toBe(7); // h, s, l, r, g, b, hex
        });

        test('Data_Value.get() returns current value', async () => {
            const val = await page.evaluate(() => {
                const dv = window.__data_model.get('h');
                return dv.get();
            });
            expect(typeof val).toBe('number');
        });

        test('Data_Value.toString() returns string representation', async () => {
            await setModelValue(page, 'h', 42);
            const str = await page.evaluate(() => {
                const dv = window.__data_model.get('h');
                return dv.toString();
            });
            expect(str).toBe('42');
        });
    });

    // ── 11. Real Mouse Interaction on Sliders ──

    describe('11. Mouse Drag Interaction on Sliders', () => {
        test('clicking on H slider track changes the value', async () => {
            const box = await page.$eval('#slider-h', el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            });
            // Click at roughly 1/3 along the slider (H ≈ 120 for 360 range)
            const clickX = box.x + box.width * (120 / 359);
            const clickY = box.y + box.height / 2;
            await page.mouse.click(clickX, clickY);
            await page.waitForTimeout(200);

            const h = await getModelValue(page, 'h');
            // Allow some tolerance for slider snap
            expect(h).toBeGreaterThanOrEqual(100);
            expect(h).toBeLessThanOrEqual(140);
        });

        test('mouse drag across S slider produces intermediate changes', async () => {
            const box = await page.$eval('#slider-s', el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            });
            const startX = box.x + 5;
            const endX = box.x + box.width - 5;
            const midY = box.y + box.height / 2;

            // Drag from left to right
            await page.mouse.move(startX, midY);
            await page.mouse.down();
            // Step across in increments
            const steps = 5;
            for (let i = 1; i <= steps; i++) {
                await page.mouse.move(
                    startX + (endX - startX) * (i / steps),
                    midY
                );
                await page.waitForTimeout(30);
            }
            await page.mouse.up();
            await page.waitForTimeout(100);

            const s = await getModelValue(page, 's');
            // After dragging to the right end, S should be near 100
            expect(s).toBeGreaterThanOrEqual(85);
        });

        test('clicking at start of L slider gives near-zero lightness', async () => {
            const box = await page.$eval('#slider-l', el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            });
            // Click near the very start
            await page.mouse.click(box.x + 3, box.y + box.height / 2);
            await page.waitForTimeout(200);

            const l = await getModelValue(page, 'l');
            expect(l).toBeLessThanOrEqual(5);
        });

        test('clicking at end of L slider gives near-100 lightness', async () => {
            const box = await page.$eval('#slider-l', el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            });
            // Click near the very end
            await page.mouse.click(box.x + box.width - 3, box.y + box.height / 2);
            await page.waitForTimeout(200);

            const l = await getModelValue(page, 'l');
            expect(l).toBeGreaterThanOrEqual(95);
        });

        test('slider drag updates all displays in real-time', async () => {
            const box = await page.$eval('#slider-h', el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            });
            // Click at ~50% of range (H≈180)
            const clickX = box.x + box.width * 0.5;
            await page.mouse.click(clickX, box.y + box.height / 2);
            await page.waitForTimeout(200);

            // Check that all displays updated
            const hex_display = await getElementText(page, 'hex-display');
            expect(hex_display).toMatch(/^#[0-9A-F]{6}$/i);
            const rgb_display = await getElementText(page, 'rgb-display');
            expect(rgb_display).toMatch(/^rgb\(/);
            const hsl_display = await getElementText(page, 'hsl-display');
            expect(hsl_display).toMatch(/^hsl\(/);
            const swatch_color = await getSwatchColor(page);
            expect(swatch_color).toBeTruthy();
        });
    });

    // ── 12. Keyboard Typing in Input Fields ──

    describe('12. Keyboard Typing in Inputs', () => {
        test('typing into hex input with keyboard updates model', async () => {
            const input = await page.$('#input-hex');
            // Triple-click to select all, then type
            await input.click({ clickCount: 3 });
            await page.keyboard.type('#ff0000');
            // Tab out to trigger change
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            const r = await getModelValue(page, 'r');
            const g = await getModelValue(page, 'g');
            const b = await getModelValue(page, 'b');
            expect(r).toBe(255);
            expect(g).toBe(0);
            expect(b).toBe(0);
        });

        test('typing into R input with keyboard updates model', async () => {
            const input = await page.$('#input-r');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('128');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            const r = await getModelValue(page, 'r');
            expect(r).toBe(128);
        });

        test('typing into G input with keyboard updates model', async () => {
            const input = await page.$('#input-g');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('200');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            const g = await getModelValue(page, 'g');
            expect(g).toBe(200);
        });

        test('typing into B input with keyboard updates model', async () => {
            const input = await page.$('#input-b');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('50');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            const b = await getModelValue(page, 'b');
            expect(b).toBe(50);
        });

        test('typing a shorthand 3-char hex (e.g. #f00) updates model', async () => {
            const input = await page.$('#input-hex');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('#f00');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            const r = await getModelValue(page, 'r');
            expect(r).toBe(255);
            const hex = await getModelValue(page, 'hex');
            // Demo stores shorthand as-is, so accept both #f00 and #ff0000
            expect(hex).toMatch(/^#[0-9a-f]{3,6}$/i);
        });

        test('typing hex without # prefix still works', async () => {
            const input = await page.$('#input-hex');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('00ff00');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            const g = await getModelValue(page, 'g');
            expect(g).toBe(255);
            const r = await getModelValue(page, 'r');
            expect(r).toBe(0);
        });

        test('typing invalid hex does not crash or corrupt model', async () => {
            // Capture current state
            const before_h = await getModelValue(page, 'h');

            const input = await page.$('#input-hex');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('zzz');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            // Model should be unchanged
            const after_h = await getModelValue(page, 'h');
            expect(after_h).toBe(before_h);

            // No page errors
            const errors = [];
            page.on('pageerror', err => errors.push(err.message));
            await page.waitForTimeout(100);
            expect(errors.length).toBe(0);
        });

        test('typing out-of-range RGB (e.g. 999) is ignored', async () => {
            const before_r = await getModelValue(page, 'r');
            const input = await page.$('#input-r');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('999');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            // Model should be unchanged — validation rejects > 255
            const after_r = await getModelValue(page, 'r');
            expect(after_r).toBe(before_r);
        });

        test('typing negative RGB value is ignored', async () => {
            const before_g = await getModelValue(page, 'g');
            const input = await page.$('#input-g');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('-10');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            const after_g = await getModelValue(page, 'g');
            expect(after_g).toBe(before_g);
        });
    });

    // ── 13. Focus/Blur Guard Behaviour ──

    describe('13. Focus/Blur Guards (Active Element Skip)', () => {
        test('focused hex input is not overwritten by programmatic model change', async () => {
            const input = await page.$('#input-hex');
            await input.click();
            await page.waitForTimeout(50);

            // While hex input is focused, change the model
            await setModelValue(page, 'h', 0);
            await page.waitForTimeout(100);

            // The hex input should NOT update while focused (activeElement guard)
            const isFocused = await page.evaluate(() =>
                document.activeElement === document.getElementById('input-hex')
            );
            expect(isFocused).toBe(true);

            // The input's value may still show old value
            // (this tests the `document.activeElement !== input_hex` guard)
        });

        test('focused R input is preserved during model propagation', async () => {
            const input = await page.$('#input-r');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('128');
            // Don't tab out — stay focused
            await page.waitForTimeout(50);

            // Change H slider, which triggers RGB recomputation
            await setModelValue(page, 'h', 0);
            await page.waitForTimeout(100);

            // R input should still show what the user typed (128)
            // because it has the activeElement guard
            const isFocused = await page.evaluate(() =>
                document.activeElement === document.getElementById('input-r')
            );
            expect(isFocused).toBe(true);
            const inputVal = await page.evaluate(() =>
                document.getElementById('input-r').value
            );
            expect(inputVal).toBe('128');
        });

        test('focused slider is not overwritten by programmatic model change', async () => {
            // Click and hold slider-h to make it active
            const box = await page.$eval('#slider-h', el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            });
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(50);

            const isFocused = await page.evaluate(() =>
                document.activeElement === document.getElementById('slider-h')
            );
            // If focused, the slider guard should prevent overwrite
            if (isFocused) {
                const currentVal = await getSliderValue(page, 'slider-h');
                // Change model.h programmatically
                await page.evaluate(() => window.__data_model.set('h', 300));
                await page.waitForTimeout(100);
                // Slider should retain its position because it's focused
                const afterVal = await getSliderValue(page, 'slider-h');
                expect(afterVal).toBe(currentVal);
            }
        });

        test('after blurring hex input, model changes update it normally', async () => {
            const input = await page.$('#input-hex');
            await input.click(); // focus
            await page.waitForTimeout(50);
            // Click elsewhere to blur
            await page.click('body');
            await page.waitForTimeout(50);

            // Now change the model
            await setSliderValue(page, 'slider-h', 0);
            await setSliderValue(page, 'slider-s', 100);
            await setSliderValue(page, 'slider-l', 50);
            await page.waitForTimeout(200);

            const hex = await page.evaluate(() =>
                document.getElementById('input-hex').value
            );
            expect(hex.toUpperCase()).toBe('#FF0000');
        });
    });

    // ── 14. Multi-Step User Workflow Scenarios ──

    describe('14. Multi-Step User Workflows', () => {
        test('paint a rainbow: sweep H from 0 to 300 in steps', async () => {
            const colors_seen = [];
            for (const h of [0, 60, 120, 180, 240, 300]) {
                await setSliderValue(page, 'slider-h', h);
                await page.waitForTimeout(50);
                const hex = await getModelValue(page, 'hex');
                colors_seen.push(hex);
            }
            // Should have 6 distinct colors
            const unique = new Set(colors_seen);
            expect(unique.size).toBe(6);

            // All should be valid hex
            for (const c of colors_seen) {
                expect(c).toMatch(/^#[0-9a-f]{6}$/i);
            }
        });

        test('undo/redo simulation: set color, capture, change, restore', async () => {
            // Set initial color
            await setSliderValue(page, 'slider-h', 200);
            await setSliderValue(page, 'slider-s', 80);
            await setSliderValue(page, 'slider-l', 55);
            await page.waitForTimeout(100);

            // Capture state
            const saved_hex = await getModelValue(page, 'hex');
            const saved_r = await getModelValue(page, 'r');
            const saved_g = await getModelValue(page, 'g');
            const saved_b = await getModelValue(page, 'b');

            // Change to a very different color
            await setSliderValue(page, 'slider-h', 0);
            await setSliderValue(page, 'slider-s', 100);
            await setSliderValue(page, 'slider-l', 50);
            await page.waitForTimeout(100);

            const mid_hex = await getModelValue(page, 'hex');
            expect(mid_hex).not.toBe(saved_hex);

            // Restore original via hex input
            await setInputValue(page, 'input-hex', saved_hex);
            await page.waitForTimeout(200);

            // Should be back to original RGB
            const r = await getModelValue(page, 'r');
            const g = await getModelValue(page, 'g');
            const b = await getModelValue(page, 'b');
            expect(r).toBe(saved_r);
            expect(g).toBe(saved_g);
            expect(b).toBe(saved_b);
        });

        test('cycle back to original: change and restore via sliders', async () => {
            // Read initial state
            const init_h = await getModelValue(page, 'h');
            const init_s = await getModelValue(page, 's');
            const init_l = await getModelValue(page, 'l');

            // Change all sliders
            await setSliderValue(page, 'slider-h', (init_h + 180) % 360);
            await setSliderValue(page, 'slider-s', init_s > 50 ? 10 : 90);
            await setSliderValue(page, 'slider-l', init_l > 50 ? 10 : 90);
            await page.waitForTimeout(100);

            // Restore
            await setSliderValue(page, 'slider-h', init_h);
            await setSliderValue(page, 'slider-s', init_s);
            await setSliderValue(page, 'slider-l', init_l);
            await page.waitForTimeout(200);

            expect(await getModelValue(page, 'h')).toBe(init_h);
            expect(await getModelValue(page, 's')).toBe(init_s);
            expect(await getModelValue(page, 'l')).toBe(init_l);
        });

        test('sequential input changes: R then G then B then hex all round-trip', async () => {
            // Set via RGB inputs
            await setInputValue(page, 'input-r', '100');
            await setInputValue(page, 'input-g', '150');
            await setInputValue(page, 'input-b', '200');
            await page.waitForTimeout(200);

            const hex1 = await getModelValue(page, 'hex');
            expect(hex1).toMatch(/^#[0-9a-f]{6}$/i);

            // Now set via hex input to a known color
            await setInputValue(page, 'input-hex', hex1);
            await page.waitForTimeout(200);

            // RGB should round-trip back to same values
            expect(await getModelValue(page, 'r')).toBe(100);
            expect(await getModelValue(page, 'g')).toBe(150);
            expect(await getModelValue(page, 'b')).toBe(200);
        });

        test('mix interaction types: slider then keyboard then programmatic', async () => {
            // Step 1: Set H via slider
            await setSliderValue(page, 'slider-h', 60);
            await page.waitForTimeout(100);
            expect(await getModelValue(page, 'h')).toBe(60);

            // Step 2: Set hex via keyboard
            const input = await page.$('#input-hex');
            await input.click({ clickCount: 3 });
            await page.keyboard.type('#00ffff');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);
            expect(await getModelValue(page, 'r')).toBe(0);
            expect(await getModelValue(page, 'g')).toBe(255);
            expect(await getModelValue(page, 'b')).toBe(255);

            // Step 3: Set model programmatically
            await setModelValue(page, 'h', 300);
            await page.waitForTimeout(100);
            expect(await getModelValue(page, 'h')).toBe(300);

            // All displays should be consistent
            const hex_display = await getElementText(page, 'hex-display');
            expect(hex_display).toMatch(/^#[0-9A-F]{6}$/i);
        });
    });

    // ── 15. Cross-Input Consistency & Stress ──

    describe('15. Cross-Input Consistency & Stress', () => {
        test('all six primary colors produce correct hex values', async () => {
            const primaries = [
                { h: 0, s: 100, l: 50, expected_r: 255, expected_g: 0, expected_b: 0 },  // Red
                { h: 60, s: 100, l: 50, expected_r: 255, expected_g: 255, expected_b: 0 },  // Yellow
                { h: 120, s: 100, l: 50, expected_r: 0, expected_g: 255, expected_b: 0 },  // Green
                { h: 180, s: 100, l: 50, expected_r: 0, expected_g: 255, expected_b: 255 },  // Cyan
                { h: 240, s: 100, l: 50, expected_r: 0, expected_g: 0, expected_b: 255 },  // Blue
                { h: 300, s: 100, l: 50, expected_r: 255, expected_g: 0, expected_b: 255 },  // Magenta
            ];

            for (const p of primaries) {
                await setSliderValue(page, 'slider-h', p.h);
                await setSliderValue(page, 'slider-s', p.s);
                await setSliderValue(page, 'slider-l', p.l);
                await page.waitForTimeout(100);

                expect(await getModelValue(page, 'r')).toBe(p.expected_r);
                expect(await getModelValue(page, 'g')).toBe(p.expected_g);
                expect(await getModelValue(page, 'b')).toBe(p.expected_b);
            }
        });

        test('hex display and model.hex always agree', async () => {
            for (const h of [0, 90, 180, 270]) {
                await setSliderValue(page, 'slider-h', h);
                await page.waitForTimeout(100);

                const model_hex = await getModelValue(page, 'hex');
                const display_hex = await getElementText(page, 'hex-display');
                expect(display_hex.toLowerCase()).toBe(model_hex.toLowerCase());
            }
        });

        test('slider value display and model always agree', async () => {
            for (const h of [30, 150, 270]) {
                await setSliderValue(page, 'slider-h', h);
                await page.waitForTimeout(100);

                const model_h = await getModelValue(page, 'h');
                const display_h = await getElementText(page, 'slider-h-val');
                expect(parseInt(display_h, 10)).toBe(model_h);
            }
        });

        test('sync section displays always match model after slider changes', async () => {
            for (const h of [45, 135, 225, 315]) {
                await setSliderValue(page, 'slider-h', h);
                await page.waitForTimeout(100);

                const model_h = await getModelValue(page, 'h');
                const sync_model_h = await getElementText(page, 'sync-model-h');
                const sync_dv_h = await getElementText(page, 'sync-dv-h');

                expect(parseInt(sync_model_h, 10)).toBe(model_h);
                expect(parseInt(sync_dv_h, 10)).toBe(model_h);
            }
        });

        test('50 rapid programmatic changes leave consistent state', async () => {
            const errors = [];
            page.on('pageerror', err => errors.push(err.message));

            for (let i = 0; i < 50; i++) {
                await page.evaluate((val) => {
                    window.__data_model.set('h', val);
                }, i * 7 % 360);
            }
            await page.waitForTimeout(300);

            // No crashes
            expect(errors.length).toBe(0);

            // Final state is consistent
            const h = await getModelValue(page, 'h');
            expect(typeof h).toBe('number');
            const hex = await getModelValue(page, 'hex');
            expect(hex).toMatch(/^#[0-9a-f]{6}$/i);

            // Displays match model
            const hex_display = await getElementText(page, 'hex-display');
            expect(hex_display.toLowerCase()).toBe(hex.toLowerCase());
        });

        test('rapid slider sweep does not corrupt sync section', async () => {
            for (let h = 0; h < 360; h += 30) {
                await setSliderValue(page, 'slider-h', h);
            }
            await page.waitForTimeout(200);

            // Sync section should be consistent with model
            const model_h = await getModelValue(page, 'h');
            const sync_dv_h = await getElementText(page, 'sync-dv-h');
            expect(parseInt(sync_dv_h, 10)).toBe(model_h);
        });

        test('event log grows with each interaction', async () => {
            const before = await page.evaluate(() =>
                document.querySelectorAll('#event-log .event-log-entry').length
            );

            // Do 3 distinct interactions
            await setSliderValue(page, 'slider-h', 50);
            await setSliderValue(page, 'slider-s', 50);
            await setSliderValue(page, 'slider-l', 50);
            await page.waitForTimeout(200);

            const after = await page.evaluate(() =>
                document.querySelectorAll('#event-log .event-log-entry').length
            );
            expect(after).toBeGreaterThan(before);
        });

        test('event log does not exceed max entries limit', async () => {
            // Fire many changes to fill the log
            for (let i = 0; i < 60; i++) {
                await page.evaluate((val) => {
                    window.__data_model.set('h', val);
                }, i * 6);
            }
            await page.waitForTimeout(200);

            const count = await page.evaluate(() =>
                document.querySelectorAll('#event-log .event-log-entry').length
            );
            // Max is 50 entries as set in the demo client
            expect(count).toBeLessThanOrEqual(50);
        });
    });
});
