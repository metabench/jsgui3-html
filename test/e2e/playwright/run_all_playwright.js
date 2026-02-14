'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PLAYWRIGHT_DIR = __dirname;

const files = fs
    .readdirSync(PLAYWRIGHT_DIR)
    .filter(name => name.endsWith('.e2e.playwright.js'))
    .sort((a, b) => a.localeCompare(b));

let passed = 0;
let failed = 0;

console.log('\n━━━ Playwright Aggregate Runner ━━━\n');

files.forEach(file => {
    const full_path = path.join(PLAYWRIGHT_DIR, file);
    console.log(`▶ Running ${file}`);
    const result = spawnSync(process.execPath, [full_path], {
        stdio: 'inherit'
    });

    if (result.status === 0) {
        passed += 1;
        console.log(`✓ ${file}\n`);
    } else {
        failed += 1;
        console.log(`✗ ${file}\n`);
    }
});

console.log('━━━ Aggregate Summary ━━━');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${files.length}`);

process.exit(failed > 0 ? 1 : 0);
