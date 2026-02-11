const puppeteer = require('puppeteer');

(async () => {
    const b = await puppeteer.launch({ headless: 'new' });
    const p = await b.newPage();
    const logs = [];
    p.on('console', m => logs.push(m.text()));
    p.on('pageerror', e => logs.push('PAGE_ERROR: ' + e.message));

    await p.goto('http://localhost:3602', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    console.log('=== KEY CONSOLE MESSAGES ===');
    const key = logs.filter(l =>
        l.includes('activated') || l.includes('activate') ||
        l.includes('reconnect') || l.includes('PAGE_ERROR') ||
        l.includes('Picker Demo') || l.includes('color_picker')
    );
    key.forEach(l => console.log(' ', l));

    // Check canvas drawing - the hue wheel should have colored pixels
    console.log('\n=== CANVAS DRAWING CHECK ===');
    const wheelDrawn = await p.evaluate(() => {
        const c = document.querySelector('.cp-wheel-canvas');
        if (!c || !c.getContext) return 'no canvas or no context';
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(90, 2, 1, 1).data;
        return d[3] > 0 ? 'DRAWN (alpha=' + d[3] + ')' : 'BLANK (alpha=' + d[3] + ')';
    });
    console.log('  Hue wheel:', wheelDrawn);

    const slDrawn = await p.evaluate(() => {
        const c = document.querySelector('.cp-sl-canvas');
        if (!c || !c.getContext) return 'no canvas';
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(50, 50, 1, 1).data;
        return d[3] > 0 ? 'DRAWN' : 'BLANK';
    });
    console.log('  SL area:', slDrawn);

    const clockDrawn = await p.evaluate(() => {
        const c = document.querySelector('.tp-clock-canvas');
        if (!c || !c.getContext) return 'no canvas';
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(100, 100, 1, 1).data;
        return d[3] > 0 ? 'DRAWN' : 'BLANK';
    });
    console.log('  Clock:', clockDrawn);

    // Check slider interaction
    console.log('\n=== SLIDER INTERACTION TEST ===');
    const before = await p.$eval('#color-picker-default .cp-hex-input', el => el.value);
    console.log('  Hex before:', before);

    await p.evaluate(() => {
        const slider = document.querySelector('#color-picker-default .cp-slider-h');
        if (slider) {
            slider.value = 0;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await new Promise(r => setTimeout(r, 500));

    const after = await p.$eval('#color-picker-default .cp-hex-input', el => el.value);
    console.log('  Hex after H=0:', after);
    console.log('  Slider changed hex:', before !== after ? 'YES ✅' : 'NO ❌');

    // Check spinner interaction
    console.log('\n=== SPINNER INTERACTION TEST ===');
    const timeBefore = await p.evaluate(() => {
        const el = document.querySelector('#time-picker-12h .tp-display-time');
        return el ? el.textContent.trim() : 'not found';
    });
    console.log('  Time before:', timeBefore);

    await p.evaluate(() => {
        const btn = document.querySelector('#time-picker-12h .tp-h-up');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const timeAfter = await p.evaluate(() => {
        const el = document.querySelector('#time-picker-12h .tp-display-time');
        return el ? el.textContent.trim() : 'not found';
    });
    console.log('  Time after hour up:', timeAfter);
    console.log('  Spinner changed time:', timeBefore !== timeAfter ? 'YES ✅' : 'NO ❌');

    // Full error check
    console.log('\n=== PAGE ERRORS ===');
    const errors = logs.filter(l => l.includes('PAGE_ERROR'));
    console.log(errors.length ? errors.join('\n') : '  None ✅');

    await b.close();
})();
