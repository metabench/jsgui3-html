/**
 * Comprehensive E2E Puppeteer Tests — Picker Controls Activation
 * 
 * Tests that Color_Picker, Time_Picker, and DateTime_Picker are
 * fully activated and interactive in the browser via the jsgui3
 * framework's own activation mechanism.
 * 
 * Prerequisites: 
 *   node lab/picker_controls_demo_server.js  (port 3602)
 *
 * Run:
 *   node test/e2e/picker_controls_e2e.test.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3602';
const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'lab', 'screenshots');

let browser, page;
let passed = 0, failed = 0;
const errors = [];

async function setup() {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

    browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });

    // Capture console messages from the page
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));
    page.on('pageerror', err => errors.push('Page error: ' + err.message));

    console.log('Navigating to ' + BASE_URL + ' ...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for the bundled JS to load and activate
    // The framework's activate() should fire automatically
    await new Promise(r => setTimeout(r, 2000));

    // Check that activation message appeared
    const activated = consoleLogs.some(msg => msg.includes('activated') || msg.includes('Picker Demo'));
    console.log('Console logs from page:', consoleLogs.slice(0, 10));
    console.log('Framework activation detected:', activated);
    console.log('Page errors:', errors.length ? errors : 'none');
}

async function teardown() {
    if (browser) await browser.close();
}

function assert(condition, msg) {
    if (condition) {
        console.log(`  ✅ ${msg}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${msg}`);
        failed++;
    }
}

// ═════════════════════════════════════════════════════
// COLOR PICKER TESTS
// ═════════════════════════════════════════════════════

async function test_cp_canvas_drawn() {
    console.log('\n─── Color Picker: Canvas Drawing ───');

    // Check hue wheel canvas has pixel content
    const wheelDrawn = await page.evaluate(() => {
        const c = document.querySelector('.cp-wheel-canvas');
        if (!c || !c.getContext) return false;
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(90, 2, 1, 1).data;
        return d[3] > 0;
    });
    assert(wheelDrawn, 'Hue wheel canvas has drawn pixels');

    // Check SL area canvas
    const slDrawn = await page.evaluate(() => {
        const c = document.querySelector('.cp-sl-canvas');
        if (!c || !c.getContext) return false;
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(50, 50, 1, 1).data;
        return d[3] > 0;
    });
    assert(slDrawn, 'SL area canvas has drawn pixels');

    const section = await page.$('#color-picker-default');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '01_cp_initial.png') });
}

async function test_cp_slider_h_change() {
    console.log('\n─── Color Picker: H Slider → Hex Sync ───');

    const initialHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    assert(initialHex && initialHex.startsWith('#'), 'Initial hex: ' + initialHex);

    // Move H slider to 0 (red)
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const slider = cp.querySelector('.cp-slider-h');
        slider.value = 0;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 300));

    const newHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    assert(newHex !== initialHex, `H=0 changed hex: ${initialHex} → ${newHex}`);

    // Verify the hex corresponds to a reddish color
    const r = parseInt(newHex.slice(1, 3), 16);
    assert(r > 200, 'Red component is high (>200): R=' + r);
}

async function test_cp_slider_s_change() {
    console.log('\n─── Color Picker: S Slider → Hex Sync ───');

    // First set to known state (H=0, S=100, L=50)
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const sH = cp.querySelector('.cp-slider-h');
        const sS = cp.querySelector('.cp-slider-s');
        const sL = cp.querySelector('.cp-slider-l');
        sH.value = 0; sH.dispatchEvent(new Event('input', { bubbles: true }));
        sS.value = 100; sS.dispatchEvent(new Event('input', { bubbles: true }));
        sL.value = 50; sL.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const fullSatHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);

    // Now reduce saturation to 0 (should become grey)
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const sS = cp.querySelector('.cp-slider-s');
        sS.value = 0;
        sS.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const zeroSatHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    assert(zeroSatHex !== fullSatHex, `S=0 changed hex: ${fullSatHex} → ${zeroSatHex}`);

    // At S=0, R=G=B (grey)
    const r = parseInt(zeroSatHex.slice(1, 3), 16);
    const g = parseInt(zeroSatHex.slice(3, 5), 16);
    const b = parseInt(zeroSatHex.slice(5, 7), 16);
    assert(Math.abs(r - g) < 5 && Math.abs(g - b) < 5, `Grey at S=0: rgb(${r},${g},${b})`);
}

async function test_cp_slider_l_change() {
    console.log('\n─── Color Picker: L Slider → Hex Sync ───');

    // Set L=0 → should be black
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const sL = cp.querySelector('.cp-slider-l');
        sL.value = 0;
        sL.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const blackHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    assert(blackHex === '#000000', 'L=0 → black: ' + blackHex);

    // Set L=100 → should be white
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const sL = cp.querySelector('.cp-slider-l');
        sL.value = 100;
        sL.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const whiteHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    assert(whiteHex === '#ffffff', 'L=100 → white: ' + whiteHex);

    // Reset to normal
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const sL = cp.querySelector('.cp-slider-l');
        sL.value = 50;
        sL.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 100));
}

async function test_cp_hex_input() {
    console.log('\n─── Color Picker: Hex Input → Sliders Sync ───');

    // Type a green hex value
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const hexInput = cp.querySelector('.cp-hex-input');
        hexInput.value = '#00ff00';
        hexInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 300));

    const hVal = await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        return +cp.querySelector('.cp-slider-h').value;
    });
    assert(hVal >= 115 && hVal <= 125, 'H slider → green (~120): ' + hVal);

    // Type a blue hex value
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const hexInput = cp.querySelector('.cp-hex-input');
        hexInput.value = '#0000ff';
        hexInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 300));

    const hBlue = await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        return +cp.querySelector('.cp-slider-h').value;
    });
    assert(hBlue >= 235 && hBlue <= 245, 'H slider → blue (~240): ' + hBlue);

    const section = await page.$('#color-picker-default');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '02_cp_hex_to_blue.png') });
}

async function test_cp_palette_click() {
    console.log('\n─── Color Picker: Palette Click → Hex + Preview ───');

    const initialHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);

    // Click the first palette cell
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const cell = cp.querySelector('.cp-palette-cell');
        if (cell) cell.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const afterHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    assert(afterHex.length === 7 && afterHex.startsWith('#'), 'Palette click → valid hex: ' + afterHex);

    // Check preview swatch background
    const previewBg = await page.evaluate(() => {
        const swatch = document.querySelector('#color-picker-default .cp-preview-new');
        return swatch ? swatch.style.background || swatch.style.backgroundColor : 'none';
    });
    assert(previewBg && previewBg !== 'none', 'Preview swatch updated: ' + previewBg);

    const section = await page.$('#color-picker-default');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '03_cp_palette_clicked.png') });
}

async function test_cp_rgb_inputs() {
    console.log('\n─── Color Picker: RGB Inputs Sync ───');

    await page.evaluate(() => document.querySelector('#color-picker-rgb').scrollIntoView());
    await new Promise(r => setTimeout(r, 200));

    // Change R input
    const hasRgb = await page.evaluate(() => !!document.querySelector('#color-picker-rgb .cp-rgb-r'));
    if (!hasRgb) {
        console.log('  ⚠ RGB inputs not found in compact layout, skipping');
        return;
    }

    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-rgb .color-picker');
        const rIn = cp.querySelector('.cp-rgb-r');
        rIn.value = 0;
        rIn.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const hex = await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-rgb .color-picker');
        const h = cp.querySelector('.cp-hex-input');
        return h ? h.value : 'missing';
    });
    assert(hex.startsWith('#'), 'R=0 updated hex: ' + hex);

    // Verify R component of hex is now 00
    const rComp = hex.slice(1, 3);
    assert(rComp === '00', 'Red component is 00: ' + rComp);

    const section = await page.$('#color-picker-rgb');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '04_cp_rgb_changed.png') });
}

async function test_cp_hsl_inputs() {
    console.log('\n─── Color Picker: HSL Inputs Sync ───');

    const hasHsl = await page.evaluate(() => !!document.querySelector('#color-picker-default .cp-hsl-h'));
    if (!hasHsl) {
        console.log('  ⚠ HSL inputs not found, skipping');
        return;
    }

    // Set H=60 (yellow), S=100, L=50
    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-default .color-picker');
        const hIn = cp.querySelector('.cp-hsl-h');
        const sIn = cp.querySelector('.cp-hsl-s');
        const lIn = cp.querySelector('.cp-hsl-l');
        if (hIn) { hIn.value = 60; hIn.dispatchEvent(new Event('input', { bubbles: true })); }
        if (sIn) { sIn.value = 100; sIn.dispatchEvent(new Event('input', { bubbles: true })); }
        if (lIn) { lIn.value = 50; lIn.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await new Promise(r => setTimeout(r, 300));

    const hex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    // H=60, S=100, L=50 should be yellow (#ffff00)
    assert(hex === '#ffff00', 'HSL(60,100,50) → yellow: ' + hex);

    // Verify H slider also updated
    const sliderH = await page.evaluate(() => +document.querySelector('#color-picker-default .cp-slider-h').value);
    assert(sliderH === 60, 'H slider synced to 60: ' + sliderH);
}

async function test_cp_alpha_slider() {
    console.log('\n─── Color Picker: Alpha Slider ───');

    const hasAlpha = await page.evaluate(() => !!document.querySelector('#color-picker-rgb .cp-slider-a'));
    if (!hasAlpha) {
        console.log('  ⚠ Alpha slider not found, skipping');
        return;
    }

    await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-rgb .color-picker');
        const aSlider = cp.querySelector('.cp-slider-a');
        aSlider.value = 50;
        aSlider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const aValue = await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-rgb .color-picker');
        return +cp.querySelector('.cp-slider-a').value;
    });
    assert(aValue === 50, 'Alpha slider set to 50: ' + aValue);

    const aLabel = await page.evaluate(() => {
        const cp = document.querySelector('#color-picker-rgb .color-picker');
        const sl = cp.querySelector('.cp-slider-a');
        const vl = sl.parentElement.querySelector('.cp-slider-value');
        return vl ? vl.textContent : 'missing';
    });
    assert(aLabel === '50', 'Alpha label shows 50: ' + aLabel);
}

async function test_cp_wheel_click() {
    console.log('\n─── Color Picker: Hue Wheel Click ───');

    // Click on the hue wheel at the top (hue ≈ 0, red)
    const wheelExists = await page.evaluate(() => !!document.querySelector('#color-picker-default .cp-wheel-canvas'));
    if (!wheelExists) {
        console.log('  ⚠ Wheel canvas not found, skipping');
        return;
    }

    const beforeHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);

    // Simulate click on the wheel ring at angle ≈ 180° (cyan area)
    await page.evaluate(() => {
        const canvas = document.querySelector('#color-picker-default .cp-wheel-canvas');
        const rect = canvas.getBoundingClientRect();
        // Click at bottom of ring (180° from top = hue 180 = cyan)
        const event = new MouseEvent('mousedown', {
            clientX: rect.left + 90,  // center x
            clientY: rect.top + 170,  // bottom of ring
            bubbles: true
        });
        canvas.dispatchEvent(event);
        const up = new MouseEvent('mouseup', { bubbles: true });
        document.dispatchEvent(up);
    });
    await new Promise(r => setTimeout(r, 300));

    const afterHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    assert(afterHex !== beforeHex, `Wheel click changed hex: ${beforeHex} → ${afterHex}`);

    const section = await page.$('#color-picker-default');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '05_cp_wheel_clicked.png') });
}

async function test_cp_sl_click() {
    console.log('\n─── Color Picker: SL Area Click ───');

    const slExists = await page.evaluate(() => !!document.querySelector('#color-picker-default .cp-sl-canvas'));
    if (!slExists) {
        console.log('  ⚠ SL canvas not found, skipping');
        return;
    }

    const beforeHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);

    // Click top-left of SL area (S=0, L=100 = white)
    await page.evaluate(() => {
        const canvas = document.querySelector('#color-picker-default .cp-sl-canvas');
        const rect = canvas.getBoundingClientRect();
        const event = new MouseEvent('mousedown', {
            clientX: rect.left + 2,
            clientY: rect.top + 2,
            bubbles: true
        });
        canvas.dispatchEvent(event);
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 300));

    const afterHex = await page.$eval('#color-picker-default .cp-hex-input', el => el.value);
    assert(afterHex !== beforeHex, `SL click changed hex: ${beforeHex} → ${afterHex}`);
}

// ═════════════════════════════════════════════════════
// TIME PICKER TESTS
// ═════════════════════════════════════════════════════

async function test_tp_clock_drawn() {
    console.log('\n─── Time Picker: Clock Canvas Drawn ───');

    await page.evaluate(() => document.querySelector('#time-picker-default').scrollIntoView());
    await new Promise(r => setTimeout(r, 300));

    const drawn = await page.evaluate(() => {
        const c = document.querySelector('#time-picker-default .tp-clock-canvas');
        if (!c || !c.getContext) return false;
        const ctx = c.getContext('2d');
        const sz = c.width;
        const d = ctx.getImageData(sz / 2, sz / 2, 1, 1).data;
        return d[3] > 0;
    });
    assert(drawn, 'Clock center pixel is non-transparent');

    const display = await page.$eval('#time-picker-default .tp-display-time', el => el.textContent.trim());
    assert(display === '14:30', 'Digital display shows 14:30: "' + display + '"');

    const section = await page.$('#time-picker-default');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '06_tp_default.png') });
}

async function test_tp_hour_spinner_up() {
    console.log('\n─── Time Picker: Hour Spinner Up ───');

    await page.evaluate(() => document.querySelector('#time-picker-12h').scrollIntoView());
    await new Promise(r => setTimeout(r, 200));

    const before = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());

    await page.evaluate(() => {
        const tp = document.querySelector('#time-picker-12h .time-picker');
        const btn = tp.querySelector('.tp-h-up');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());
    assert(after !== before, `Hour up: ${before} → ${after}`);
}

async function test_tp_hour_spinner_down() {
    console.log('\n─── Time Picker: Hour Spinner Down ───');

    const before = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());

    await page.evaluate(() => {
        const tp = document.querySelector('#time-picker-12h .time-picker');
        const btn = tp.querySelector('.tp-h-down');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());
    assert(after !== before, `Hour down: ${before} → ${after}`);
}

async function test_tp_minute_spinner_up() {
    console.log('\n─── Time Picker: Minute Spinner Up ───');

    const before = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());

    await page.evaluate(() => {
        const tp = document.querySelector('#time-picker-12h .time-picker');
        const btn = tp.querySelector('.tp-m-up');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());
    assert(after !== before, `Minute up: ${before} → ${after}`);
}

async function test_tp_minute_spinner_down() {
    console.log('\n─── Time Picker: Minute Spinner Down ───');

    const before = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());

    await page.evaluate(() => {
        const tp = document.querySelector('#time-picker-12h .time-picker');
        const btn = tp.querySelector('.tp-m-down');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());
    assert(after !== before, `Minute down: ${before} → ${after}`);
}

async function test_tp_second_spinner() {
    console.log('\n─── Time Picker: Second Spinner ───');

    const hasSec = await page.evaluate(() => !!document.querySelector('#time-picker-12h .tp-s-up'));
    if (!hasSec) {
        console.log('  ⚠ Second spinner not found, skipping');
        return;
    }

    const before = await page.evaluate(() => {
        const v = document.querySelector('#time-picker-12h .tp-s-val');
        return v ? v.textContent.trim() : 'none';
    });

    await page.evaluate(() => {
        const btn = document.querySelector('#time-picker-12h .tp-s-up');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.evaluate(() => {
        const v = document.querySelector('#time-picker-12h .tp-s-val');
        return v ? v.textContent.trim() : 'none';
    });
    assert(after !== before, `Second up: ${before} → ${after}`);
}

async function test_tp_ampm_toggle() {
    console.log('\n─── Time Picker: AM/PM Toggle ───');

    const ampmBtn = await page.evaluate(() => {
        const btn = document.querySelector('#time-picker-12h .tp-ampm-btn');
        return btn ? btn.textContent.trim() : null;
    });

    if (!ampmBtn) {
        console.log('  ⚠ AM/PM button not found, skipping');
        return;
    }

    const before = ampmBtn;
    await page.evaluate(() => {
        const btn = document.querySelector('#time-picker-12h .tp-ampm-btn');
        btn.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.evaluate(() => {
        return document.querySelector('#time-picker-12h .tp-ampm-btn').textContent.trim();
    });

    const expected = before === 'AM' ? 'PM' : 'AM';
    assert(after === expected, `AM/PM toggled: ${before} → ${after}`);

    // Click back to restore
    await page.evaluate(() => {
        document.querySelector('#time-picker-12h .tp-ampm-btn').click();
    });
    await new Promise(r => setTimeout(r, 100));
}

async function test_tp_preset_1200() {
    console.log('\n─── Time Picker: Preset "12:00" ───');

    await page.evaluate(() => {
        const tp = document.querySelector('#time-picker-12h .time-picker');
        const btns = tp.querySelectorAll('.tp-preset-btn');
        for (const b of btns) {
            if (b.getAttribute('data-time') === '12:00') { b.click(); break; }
        }
    });
    await new Promise(r => setTimeout(r, 300));

    const display = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());
    assert(display.includes('12:00'), 'Preset 12:00 → displays: ' + display);

    const section = await page.$('#time-picker-12h');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '07_tp_preset_1200.png') });
}

async function test_tp_preset_now() {
    console.log('\n─── Time Picker: Preset "Now" ───');

    await page.evaluate(() => {
        const tp = document.querySelector('#time-picker-12h .time-picker');
        const btns = tp.querySelectorAll('.tp-preset-btn');
        for (const b of btns) {
            if (b.getAttribute('data-time') === 'Now') { b.click(); break; }
        }
    });
    await new Promise(r => setTimeout(r, 300));

    const display = await page.$eval('#time-picker-12h .tp-display-time', el => el.textContent.trim());
    // Just verify it changed to something with a colon
    assert(display.includes(':'), 'Preset "Now" set time with colon: ' + display);
}

async function test_tp_clock_click() {
    console.log('\n─── Time Picker: Clock Face Click ───');

    const clockExists = await page.evaluate(() => !!document.querySelector('#time-picker-default .tp-clock-canvas'));
    if (!clockExists) {
        console.log('  ⚠ Clock canvas not found, skipping');
        return;
    }

    // First set to known state via preset or spinner
    const before = await page.$eval('#time-picker-default .tp-display-time', el => el.textContent.trim());

    // Click on the clock face (outer ring = minutes, ~3 o'clock position)
    await page.evaluate(() => {
        const canvas = document.querySelector('#time-picker-default .tp-clock-canvas');
        const rect = canvas.getBoundingClientRect();
        const sz = canvas.width;
        // Click at the 3 o'clock position (right edge of outer ring)
        const event = new MouseEvent('click', {
            clientX: rect.left + sz - 15,
            clientY: rect.top + sz / 2,
            bubbles: true
        });
        canvas.dispatchEvent(event);
    });
    await new Promise(r => setTimeout(r, 300));

    const after = await page.$eval('#time-picker-default .tp-display-time', el => el.textContent.trim());
    assert(after !== before, `Clock click changed time: ${before} → ${after}`);

    const section = await page.$('#time-picker-default');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '08_tp_clock_clicked.png') });
}

// ═════════════════════════════════════════════════════
// DATETIME PICKER TESTS  
// ═════════════════════════════════════════════════════

async function test_dtp_stacked_layout() {
    console.log('\n─── DateTime Picker: Stacked Layout ───');

    await page.evaluate(() => document.querySelector('#datetime-picker-stacked').scrollIntoView());
    await new Promise(r => setTimeout(r, 300));

    const hasCal = await page.evaluate(() => !!document.querySelector('#datetime-picker-stacked .month-view'));
    assert(hasCal, 'Stacked layout has month-view');

    const hasTime = await page.evaluate(() => !!document.querySelector('#datetime-picker-stacked .time-picker'));
    assert(hasTime, 'Stacked layout has time-picker');

    const clockDrawn = await page.evaluate(() => {
        const c = document.querySelector('#datetime-picker-stacked .tp-clock-canvas');
        if (!c || !c.getContext) return false;
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(c.width / 2, c.width / 2, 1, 1).data;
        return d[3] > 0;
    });
    assert(clockDrawn, 'Stacked clock canvas drawn');

    const section = await page.$('#datetime-picker-stacked');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '09_dtp_stacked.png') });
}

async function test_dtp_sbs_layout() {
    console.log('\n─── DateTime Picker: Side-by-Side Layout ───');

    await page.evaluate(() => document.querySelector('#datetime-picker-sbs').scrollIntoView());
    await new Promise(r => setTimeout(r, 300));

    const hasCal = await page.evaluate(() => !!document.querySelector('#datetime-picker-sbs .month-view'));
    const hasTime = await page.evaluate(() => !!document.querySelector('#datetime-picker-sbs .time-picker'));
    assert(hasCal && hasTime, 'SBS has both month-view and time-picker');

    const ampmText = await page.evaluate(() => {
        const btn = document.querySelector('#datetime-picker-sbs .tp-ampm-btn');
        return btn ? btn.textContent.trim() : 'none';
    });
    assert(ampmText === 'AM' || ampmText === 'PM', 'SBS has AM/PM: ' + ampmText);
}

async function test_dtp_sbs_hour_spinner() {
    console.log('\n─── DateTime Picker SBS: Hour Spinner ───');

    const before = await page.evaluate(() => {
        const v = document.querySelector('#datetime-picker-sbs .tp-h-val');
        return v ? v.textContent.trim() : 'none';
    });

    await page.evaluate(() => {
        const btn = document.querySelector('#datetime-picker-sbs .tp-h-up');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.evaluate(() => {
        const v = document.querySelector('#datetime-picker-sbs .tp-h-val');
        return v ? v.textContent.trim() : 'none';
    });
    assert(after !== before, `SBS hour up: ${before} → ${after}`);
}

async function test_dtp_sbs_minute_spinner() {
    console.log('\n─── DateTime Picker SBS: Minute Spinner ───');

    const before = await page.evaluate(() => {
        const v = document.querySelector('#datetime-picker-sbs .tp-m-val');
        return v ? v.textContent.trim() : 'none';
    });

    await page.evaluate(() => {
        const btn = document.querySelector('#datetime-picker-sbs .tp-m-up');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.evaluate(() => {
        const v = document.querySelector('#datetime-picker-sbs .tp-m-val');
        return v ? v.textContent.trim() : 'none';
    });
    assert(after !== before, `SBS minute up: ${before} → ${after}`);

    const section = await page.$('#datetime-picker-sbs');
    if (section) await section.screenshot({ path: path.join(SCREENSHOT_DIR, '10_dtp_sbs.png') });
}

async function test_dtp_sbs_ampm_toggle() {
    console.log('\n─── DateTime Picker SBS: AM/PM Toggle ───');

    const before = await page.evaluate(() => {
        const btn = document.querySelector('#datetime-picker-sbs .tp-ampm-btn');
        return btn ? btn.textContent.trim() : null;
    });

    if (!before) {
        console.log('  ⚠ AM/PM button not found, skipping');
        return;
    }

    await page.evaluate(() => {
        document.querySelector('#datetime-picker-sbs .tp-ampm-btn').click();
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.evaluate(() => {
        return document.querySelector('#datetime-picker-sbs .tp-ampm-btn').textContent.trim();
    });
    const expected = before === 'AM' ? 'PM' : 'AM';
    assert(after === expected, `SBS AM/PM toggled: ${before} → ${after}`);
}

// ═════════════════════════════════════════════════════
// FINAL SCREENSHOT
// ═════════════════════════════════════════════════════

async function test_final_screenshots() {
    console.log('\n─── Final Full Page ───');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '11_full_page.png'),
        fullPage: true,
    });
    assert(true, 'Full page screenshot captured');
}

// ═════════════════════════════════════════════════════
// RUNNER
// ═════════════════════════════════════════════════════
(async () => {
    try {
        await setup();
        console.log('\n═══ Running comprehensive activation E2E tests ═══\n');

        // Color Picker tests
        await test_cp_canvas_drawn();
        await test_cp_slider_h_change();
        await test_cp_slider_s_change();
        await test_cp_slider_l_change();
        await test_cp_hex_input();
        await test_cp_palette_click();
        await test_cp_rgb_inputs();
        await test_cp_hsl_inputs();
        await test_cp_alpha_slider();
        await test_cp_wheel_click();
        await test_cp_sl_click();

        // Time Picker tests
        await test_tp_clock_drawn();
        await test_tp_hour_spinner_up();
        await test_tp_hour_spinner_down();
        await test_tp_minute_spinner_up();
        await test_tp_minute_spinner_down();
        await test_tp_second_spinner();
        await test_tp_ampm_toggle();
        await test_tp_preset_1200();
        await test_tp_preset_now();
        await test_tp_clock_click();

        // DateTime Picker tests
        await test_dtp_stacked_layout();
        await test_dtp_sbs_layout();
        await test_dtp_sbs_hour_spinner();
        await test_dtp_sbs_minute_spinner();
        await test_dtp_sbs_ampm_toggle();

        await test_final_screenshots();

        console.log('\n' + '═'.repeat(50));
        console.log(`Results: ${passed} passed, ${failed} failed`);
        if (errors.length) console.log('Page errors:', errors);
        console.log('═'.repeat(50));
        console.log(`Screenshots: ${SCREENSHOT_DIR}`);

        if (failed > 0) process.exit(1);
    } catch (err) {
        console.error('Fatal E2E error:', err);
        process.exit(1);
    } finally {
        await teardown();
    }
})();
