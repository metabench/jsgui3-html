const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const p = await b.newPage();
    await p.setViewport({ width: 1200, height: 900 });
    await p.goto('http://localhost:3602', { waitUntil: 'networkidle0', timeout: 10000 });
    await new Promise(r => setTimeout(r, 500));

    // Check basic selectors
    try {
        const hex = await p.$eval('#color-picker-default .cp-hex-input', el => el.value);
        console.log('hex:', hex);
    } catch (e) { console.log('hex err:', e.message); }

    try {
        const disp = await p.$eval('#time-picker-default .tp-display-time', el => el.textContent);
        console.log('time:', disp);
    } catch (e) { console.log('time err:', e.message); }

    try {
        const drawn = await p.evaluate(() => {
            const c = document.querySelector('.cp-wheel-canvas');
            if (!c) return 'no canvas';
            const ctx = c.getContext('2d');
            const d = ctx.getImageData(90, 2, 1, 1).data;
            return d[3] > 0 ? 'drawn' : 'empty';
        });
        console.log('wheel:', drawn);
    } catch (e) { console.log('wheel err:', e.message); }

    // Test slider interaction
    try {
        await p.evaluate(() => {
            const cp = document.querySelector('#color-picker-default .color-picker');
            const slider = cp.querySelector('.cp-slider-h');
            slider.value = 0;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await new Promise(r => setTimeout(r, 200));
        const newHex = await p.$eval('#color-picker-default .cp-hex-input', el => el.value);
        console.log('after slider change hex:', newHex);
    } catch (e) { console.log('slider err:', e.message); }

    // Console errors
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    console.log('page errors:', errors.length ? errors : 'none');

    await b.close();
})();
