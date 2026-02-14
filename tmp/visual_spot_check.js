// Visual spot-check of key controls - take screenshots and check dimensions
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const PORT = 4460;
const delay = ms => new Promise(r => setTimeout(r, ms));

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Key controls to visually verify
const CONTROLS_TO_CHECK = [
  'Accordion', 'Alert_Banner', 'Avatar', 'Breadcrumbs', 'Button',
  'Calendar', 'Checkbox', 'Color_Picker', 'Combo_Box', 'Data_Table',
  'Dropdown_Menu', 'Gauge', 'Grid', 'Horizontal_Slider', 'Login',
  'Modal', 'Pagination', 'Progress_Bar', 'Radio_Button_Group',
  'Rating_Stars', 'Search_Bar', 'Sidebar_Nav', 'Spinner',
  'Split_Pane', 'Status_Dashboard', 'Stepper', 'Tabbed_Panel',
  'Tag_Input', 'Title_Bar', 'Toggle_Switch', 'Tooltip', 'Tree_View',
  'Window', 'Wizard'
];

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const issues = [];

  for (const name of CONTROLS_TO_CHECK) {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', err => errors.push(`PAGE: ${err.message}`));

    await page.goto(`http://localhost:${PORT}/?control=${name}`, {
      waitUntil: 'networkidle0', timeout: 15000
    });
    await delay(500);

    // Get control mount dimensions
    const info = await page.evaluate(() => {
      const mount = document.querySelector('#control-mount');
      if (!mount) return { exists: false };
      const rect = mount.getBoundingClientRect();
      const first = mount.children[0];
      let first_rect = null;
      if (first) {
        const fr = first.getBoundingClientRect();
        first_rect = { width: fr.width, height: fr.height };
      }
      return {
        exists: true,
        width: rect.width,
        height: rect.height,
        childCount: mount.children.length,
        text: mount.innerText.substring(0, 200),
        first_child: first_rect
      };
    });

    // Flag issues
    const issue_list = [];
    if (errors.length > 0) issue_list.push(`${errors.length} console errors`);
    if (info.first_child && info.first_child.height < 2) issue_list.push('zero height');
    if (info.first_child && info.first_child.width < 2) issue_list.push('zero width');
    if (info.childCount === 0) issue_list.push('no children');

    if (issue_list.length > 0) {
      issues.push({ name, issues: issue_list, errors, info });
      await page.screenshot({ 
        path: path.join(SCREENSHOT_DIR, `issue-${name}.png`), 
        fullPage: true 
      });
    }

    const status = issue_list.length > 0 ? '⚠' : '✓';
    const dims = info.first_child ? `${Math.round(info.first_child.width)}x${Math.round(info.first_child.height)}` : 'n/a';
    console.log(`  ${status} ${name}: ${dims} ${issue_list.length > 0 ? '← ' + issue_list.join(', ') : ''}`);

    // Clear listeners for next iteration
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Checked: ${CONTROLS_TO_CHECK.length}`);
  console.log(`Issues: ${issues.length}`);
  if (issues.length > 0) {
    console.log(`\nIssue details:`);
    issues.forEach(({ name, issues: i, errors }) => {
      console.log(`  ${name}: ${i.join(', ')}`);
      errors.forEach(e => console.log(`    Error: ${e.substring(0, 120)}`));
    });
  }

  await browser.close();
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
