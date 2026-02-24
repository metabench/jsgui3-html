const fs = require('fs');
const path = require('path');
const _pm = require('pixelmatch');
const pixelmatch = _pm.default || _pm;
const { PNG } = require('pngjs');
const { expect } = require('chai');

/**
 * Perform a visual diff against a baseline snapshot using PixelMatch.
 * If UPDATE_SNAPSHOTS=1 is set, it will overwrite the baseline.
 * 
 * @param {import('playwright').Page|import('playwright').ElementHandle} target The playwright page or element handle to screenshot
 * @param {string} testName The unique name for the snapshot
 * @param {object} options Options to pass (threshold, etc)
 */
async function assertVisualMatch(target, testName, options = {}) {
    const threshold = options.threshold || 0.1; // PixelMatch sensitivity
    const maxDiffPercent = options.maxDiffPercent || 0.1; // Total % allowed different

    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    const baselineDir = path.join(screenshotsDir, 'baseline');
    const diffDir = path.join(screenshotsDir, 'diff');
    const actualDir = path.join(screenshotsDir, 'actual');

    [baselineDir, diffDir, actualDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    const safeName = testName.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
    const baselinePath = path.join(baselineDir, `${safeName}.png`);
    const actualPath = path.join(actualDir, `${safeName}.png`);
    const diffPath = path.join(diffDir, `${safeName}.png`);

    // 1. Capture the screenshot to "actual"
    // (If target is a locator or element handle, it will only capture that node)
    const buffer = await target.screenshot({ path: actualPath });

    // 2. Overwrite or create baseline if missing or requested
    if (process.env.UPDATE_SNAPSHOTS === '1' || !fs.existsSync(baselinePath)) {
        fs.writeFileSync(baselinePath, buffer);
        console.log(`\n  [Visual Match] Created/Updated baseline for ${safeName}`);
        return;
    }

    // 3. Load baseline and compare
    const img1 = PNG.sync.read(fs.readFileSync(actualPath));
    const img2 = PNG.sync.read(fs.readFileSync(baselinePath));

    const { width, height } = img1;

    // Ensure dimensions match
    expect(width).to.equal(img2.width, `Width mismatch for ${safeName}`);
    expect(height).to.equal(img2.height, `Height mismatch for ${safeName}`);

    const diff = new PNG({ width, height });

    // 4. Extract diff using pixelmatch
    const numDiffPixels = pixelmatch(
        img1.data, img2.data, diff.data, width, height,
        { threshold }
    );

    const diffPercent = (numDiffPixels / (width * height)) * 100;

    // 5. If diff detected, save the visual representation
    if (numDiffPixels > 0) {
        fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }

    // 6. Assert against max allowed percent
    expect(diffPercent).to.be.at.most(maxDiffPercent, `Visual mismatch for ${safeName}: ${diffPercent.toFixed(2)}% pixels differ. See diff at ${diffPath}`);
}

module.exports = { assertVisualMatch };
