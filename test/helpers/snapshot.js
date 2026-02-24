const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

/**
 * Basic HTML formatter to ensure stable diffs across snapshots
 */
function formatHtml(html) {
    if (!html) return '';
    return html
        .replace(/>\s+</g, '><') // remove whitespace between tags
        .replace(/(<[^\/][^>]*>)/g, '\n$1') // newline before opening tags
        .replace(/(<\/[^>]+>)/g, '$1\n') // newline after closing tags
        .replace(/\n\s*\n/g, '\n') // remove empty lines
        .trim();
}

/**
 * Helper to match a rendered HTML string against a baseline snapshot on disk.
 * Run `UPDATE_SNAPSHOTS=1 npm test` to rewrite the baseline files.
 * 
 * @param {string} testName Unique identifier for the snapshot
 * @param {string} rawHtml The output HTML to test
 */
function htmlSnapshot(testName, rawHtml) {
    const snapshotsDir = path.join(__dirname, '..', '__snapshots__');
    if (!fs.existsSync(snapshotsDir)) {
        fs.mkdirSync(snapshotsDir, { recursive: true });
    }

    const safeFilename = testName.replace(/[^a-z0-9-_]/gi, '_').toLowerCase() + '.snap';
    const filepath = path.join(snapshotsDir, safeFilename);
    const formattedHtml = formatHtml(rawHtml);

    if (process.env.UPDATE_SNAPSHOTS === '1' || !fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, formattedHtml, 'utf8');
        console.log(`\n  [Snapshot] Created/Updated ${safeFilename}`);
        return; // Success
    }

    const baseline = fs.readFileSync(filepath, 'utf8');
    expect(formattedHtml).to.equal(baseline, `HTML Snapshot mismatch for "${testName}"! View diff or run with UPDATE_SNAPSHOTS=1 to overwrite.`);
}

module.exports = { htmlSnapshot, formatHtml };
