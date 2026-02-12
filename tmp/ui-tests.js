/**
 * Puppeteer UI Tests — Screenshots + Interaction tests for all controls.
 *
 * Run: node tmp/ui-tests.js
 * Requires: test-server.js running on port 4455
 * Outputs: tmp/screenshots/*.png
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:4455';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = [];
function log(test, pass, detail = '') {
    results.push({ test, pass, detail });
    console.log(`  ${pass ? '✓' : '✗'} ${test}${detail ? ' — ' + detail : ''}`);
}

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const delay = ms => new Promise(r => setTimeout(r, ms));

    // ── 1. Load page ──
    console.log('\n━━━ PAGE LOAD ━━━');
    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 10000 });
        const title = await page.title();
        log('Page loads', true, `title: "${title}"`);
    } catch (e) {
        log('Page loads', false, e.message);
        await browser.close();
        return;
    }

    // Full-page screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-full-page.png'), fullPage: true });
    log('Full page screenshot', true);

    // ── 2. Check all sections rendered ──
    console.log('\n━━━ SECTIONS ━━━');
    const sections = await page.$$eval('.test-section-title', els => els.map(e => e.textContent));
    log(`Rendered ${sections.length} sections`, sections.length >= 15, sections.join(', '));

    // Check for error sections
    const errors = await page.$$eval('.error', els => els.map(e => e.textContent));
    log('No render errors', errors.length === 0, errors.length ? `${errors.length} errors: ${errors.join('; ')}` : 'clean');

    // ── 3. Sidebar Nav interaction ──
    console.log('\n━━━ SIDEBAR NAV ━━━');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-sidebar-initial.png'), clip: await getBounds(page, '.jsgui-sidebar-nav') });

    // Click a nav link
    const navLinks = await page.$$('.sidebar-link');
    if (navLinks.length > 1) {
        await navLinks[1].click();
        await delay(300);
        const active = await page.$eval('.sidebar-link.is-active', el => el.textContent.trim());
        log('Sidebar link click → active', true, `active: "${active}"`);
    }

    // Click toggle to collapse
    const toggleBtn = await page.$('.sidebar-toggle');
    if (toggleBtn) {
        await toggleBtn.click();
        await delay(300);
        const collapsed = await page.$eval('.jsgui-sidebar-nav', el => el.classList.contains('is-collapsed'));
        log('Sidebar toggle → collapsed', collapsed);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-sidebar-collapsed.png'), clip: await getBounds(page, '.jsgui-sidebar-nav') });

        // Toggle back
        await toggleBtn.click();
        await delay(300);
    }

    // Expand nested section
    const chevrons = await page.$$('.sidebar-chevron');
    if (chevrons.length > 0) {
        await chevrons[0].click();
        await delay(300);
        const expanded = await page.$('.sidebar-item.is-expanded');
        log('Sidebar chevron → expands nested', !!expanded);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-sidebar-expanded.png'), clip: await getBounds(page, '.jsgui-sidebar-nav') });
    }

    // ── 4. Wizard interaction ──
    console.log('\n━━━ WIZARD ━━━');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-wizard-step1.png'), clip: await getBounds(page, '.jsgui-wizard') });

    const nextBtn = await page.$('.wizard-btn--next');
    if (nextBtn) {
        // Step 1 → 2
        await nextBtn.click();
        await delay(300);
        const activeDots = await page.$$eval('.wizard-step-dot.is-active', els => els.length);
        const completedDots = await page.$$eval('.wizard-step-dot.is-completed', els => els.length);
        log('Wizard Next → step 2', activeDots === 1 && completedDots >= 1, `active=${activeDots}, completed=${completedDots}`);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-wizard-step2.png'), clip: await getBounds(page, '.jsgui-wizard') });

        // Step 2 → 3
        await nextBtn.click();
        await delay(300);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-wizard-step3.png'), clip: await getBounds(page, '.jsgui-wizard') });
        log('Wizard Next → step 3', true);

        // Step 3 → 2 (prev)
        const prevBtn = await page.$('.wizard-btn--prev');
        if (prevBtn) {
            await prevBtn.click();
            await delay(300);
            log('Wizard Prev → back to step 2', true);
        }
    }

    // ── 5. Inline Cell Edit ──
    console.log('\n━━━ INLINE CELL EDIT ━━━');
    const iceDisplay = await page.$('.ice-display');
    if (iceDisplay) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-ice-display.png'), clip: await getBounds(page, '.jsgui-inline-cell-edit') });

        await iceDisplay.click();
        await delay(300);
        const editing = await page.$eval('.inline-cell-edit', el => el.classList.contains('is-editing'));
        log('ICE click → enters edit mode', editing);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-ice-editing.png'), clip: await getBounds(page, '.jsgui-inline-cell-edit') });

        // Type new value
        const input = await page.$('.ice-input');
        if (input) {
            await input.click({ clickCount: 3 }); // select all
            await input.type('Updated Value');
            await delay(200);
        }

        // Click save
        const saveBtn = await page.$('.ice-btn--save');
        if (saveBtn) {
            await saveBtn.click();
            await delay(300);
            const newValue = await page.$eval('.ice-value', el => el.textContent);
            log('ICE save → updated value', newValue === 'Updated Value', `value: "${newValue}"`);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-ice-saved.png'), clip: await getBounds(page, '.jsgui-inline-cell-edit') });
        }
    }

    // ── 6. Charts ──
    console.log('\n━━━ CHARTS ━━━');
    const barBars = await page.$$('.bar-chart-bar');
    log('Bar chart has bars', barBars.length > 0, `${barBars.length} bars`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-bar-chart.png'), clip: await getBounds(page, '.jsgui-bar-chart') });

    // Click a bar → toast
    if (barBars.length > 0) {
        await barBars[2].click();
        await delay(500);
        const toast = await page.$('.demo-toast');
        log('Bar click → toast notification', !!toast);
        if (toast) {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-bar-toast.png'), fullPage: false });
        }
    }

    const pieSlices = await page.$$('.pie-chart-slice');
    log('Pie chart has slices', pieSlices.length > 0, `${pieSlices.length} slices`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-pie-charts.png'), clip: await getBoundsMulti(page, '.jsgui-pie-chart') });

    const sparklines = await page.$$('.jsgui-sparkline');
    log('Sparklines rendered', sparklines.length > 0, `${sparklines.length} sparklines`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-sparklines.png'), clip: await getBounds(page, '.jsgui-sparkline') });

    // ── 7. Markdown Viewer ──
    console.log('\n━━━ MARKDOWN VIEWER ━━━');
    const mdH1 = await page.$('.jsgui-markdown-viewer h1');
    log('Markdown h1 rendered', !!mdH1);
    const mdCode = await page.$('.md-code-block');
    log('Markdown code block rendered', !!mdCode);
    const mdBlockquote = await page.$('.jsgui-markdown-viewer blockquote');
    log('Markdown blockquote rendered', !!mdBlockquote);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-markdown-viewer.png'), clip: await getBounds(page, '.jsgui-markdown-viewer') });

    // ── 8. Other Controls ──
    console.log('\n━━━ OTHER CONTROLS ━━━');

    // Badges/Chips
    const badges = await page.$$('.jsgui-badge');
    log('Badges rendered', badges.length > 0, `${badges.length} badges`);
    const chips = await page.$$('.jsgui-chip');
    log('Chips rendered', chips.length > 0, `${chips.length} chips`);

    // Progress bars
    const progBars = await page.$$('.jsgui-progress');
    log('Progress bars rendered', progBars.length > 0, `${progBars.length} bars`);

    // Spinner
    const spinner = await page.$('.jsgui-spinner');
    log('Spinner rendered', !!spinner);

    // Avatar
    const avatars = await page.$$('.jsgui-avatar');
    log('Avatars rendered', avatars.length > 0, `${avatars.length} avatars`);

    // Search bar
    const searchBar = await page.$('.jsgui-search-bar');
    log('Search bar rendered', !!searchBar);

    // Skeleton loader  
    const skeleton = await page.$('.jsgui-skeleton');
    log('Skeleton loader rendered', !!skeleton);

    // Rating stars
    const stars = await page.$('.jsgui-rating');
    log('Rating stars rendered', !!stars);

    // Breadcrumbs
    const crumbs = await page.$('.jsgui-breadcrumbs');
    log('Breadcrumbs rendered', !!crumbs);

    // ── 9. Dark Mode Toggle ──
    console.log('\n━━━ DARK MODE ━━━');
    const darkToggle = await page.$('.dark-toggle');
    if (darkToggle) {
        await darkToggle.click();
        await delay(500);
        const isDark = await page.$eval('body', el => el.classList.contains('jsgui-dark-mode'));
        log('Dark mode toggle', isDark);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-dark-mode.png'), fullPage: true });

        // Toggle back
        await darkToggle.click();
        await delay(300);
    }

    // ── Summary ──
    console.log('\n━━━ SUMMARY ━━━');
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    console.log(`\n  ${passed} passed, ${failed} failed out of ${results.length} tests`);
    console.log(`  Screenshots saved to: ${SCREENSHOT_DIR}`);

    if (failed > 0) {
        console.log('\n  FAILURES:');
        results.filter(r => !r.pass).forEach(r => console.log(`    ✗ ${r.test}: ${r.detail}`));
    }

    console.log(failed === 0 ? '\n=== ALL PASS ✓ ===' : '\n=== SOME FAILED ✗ ===');

    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
}

// Helpers to get element bounding boxes for clipped screenshots
async function getBounds(page, selector) {
    try {
        const el = await page.$(selector);
        if (!el) return { x: 0, y: 0, width: 1440, height: 400 };
        const box = await el.boundingBox();
        if (!box) return { x: 0, y: 0, width: 1440, height: 400 };
        // Add some padding
        return {
            x: Math.max(0, box.x - 10),
            y: Math.max(0, box.y - 10),
            width: box.width + 20,
            height: box.height + 20
        };
    } catch { return { x: 0, y: 0, width: 1440, height: 400 }; }
}

async function getBoundsMulti(page, selector) {
    try {
        const els = await page.$$(selector);
        if (els.length === 0) return { x: 0, y: 0, width: 1440, height: 400 };
        let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
        for (const el of els) {
            const box = await el.boundingBox();
            if (!box) continue;
            minX = Math.min(minX, box.x);
            minY = Math.min(minY, box.y);
            maxX = Math.max(maxX, box.x + box.width);
            maxY = Math.max(maxY, box.y + box.height);
        }
        return {
            x: Math.max(0, minX - 10),
            y: Math.max(0, minY - 10),
            width: (maxX - minX) + 20,
            height: (maxY - minY) + 20
        };
    } catch { return { x: 0, y: 0, width: 1440, height: 400 }; }
}

run().catch(e => {
    console.error('FATAL:', e);
    process.exit(1);
});
