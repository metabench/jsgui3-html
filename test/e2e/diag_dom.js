// Quick diagnostic: check what the DOM looks like for the range month-view.
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate
    await page.goto('http://127.0.0.1:3601/', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('.month-view') !== null, { timeout: 15000 });
    await page.waitForTimeout(2000); // Wait for activation

    // Check: what does the #mv-range element look like?
    const result = await page.evaluate(() => {
        const out = {};

        // 1. Does #mv-range exist?
        const mvRange = document.querySelector('#mv-range');
        out.mvRangeExists = !!mvRange;
        if (!mvRange) return out;

        // 2. What's its outerHTML (first 2000 chars)?
        out.mvRangeHTML = mvRange.outerHTML.substring(0, 3000);

        // 3. How many .row elements?
        out.rowCount = mvRange.querySelectorAll('.row').length;
        out.headerRowCount = mvRange.querySelectorAll('.row.header').length;
        out.nonHeaderRowCount = mvRange.querySelectorAll('.row:not(.header)').length;

        // 4. How many .cell elements?
        out.cellCount = mvRange.querySelectorAll('.cell').length;
        out.nonHeaderCellCount = mvRange.querySelectorAll('.row:not(.header) .cell').length;
        out.nonWeekCellCount = mvRange.querySelectorAll('.row:not(.header) .cell:not(.week-number)').length;

        // 5. First 5 cells: className and span text
        const cells = mvRange.querySelectorAll('.row:not(.header) .cell:not(.week-number)');
        out.firstCells = [];
        let i = 0;
        cells.forEach(c => {
            if (i < 5) {
                const span = c.querySelector('span');
                out.firstCells.push({
                    className: c.className,
                    tagName: c.tagName,
                    spanText: span ? span.textContent.trim() : 'NO_SPAN',
                    hasEventListeners: typeof c.onclick,
                    childCount: c.children.length
                });
                i++;
            }
        });

        // 6. Is there a .month-view inside #mv-range?
        const nestedMV = mvRange.querySelector('.month-view');
        out.hasNestedMonthView = !!nestedMV;
        if (nestedMV) {
            out.nestedMVTag = nestedMV.tagName;
            out.nestedMVId = nestedMV.id || 'NO_ID';
            out.nestedRowCount = nestedMV.querySelectorAll('.row').length;
            out.nestedCellCount = nestedMV.querySelectorAll('.row:not(.header) .cell:not(.week-number)').length;
        }

        // 7. Check if mv-range contains the month-view directly or is the month-view
        out.mvRangeClasses = mvRange.className;
        out.mvRangeTag = mvRange.tagName;

        // 8. Check #mv-multi too
        const mvMulti = document.querySelector('#mv-multi');
        out.mvMultiExists = !!mvMulti;
        if (mvMulti) {
            out.mvMultiClasses = mvMulti.className;
            out.mvMultiCellCount = mvMulti.querySelectorAll('.row:not(.header) .cell:not(.week-number)').length;
        }

        return out;
    });

    console.log(JSON.stringify(result, null, 2));

    await browser.close();
    process.exit(0);
})();
