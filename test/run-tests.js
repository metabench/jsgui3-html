const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const durationsFile = path.join(__dirname, 'test_durations.json');

// Get command line arguments
const args = process.argv.slice(2);
const runAll = args.includes('--all');
const runControls = args.includes('--controls') || runAll;
const runE2E = args.includes('--e2e') || runAll;
const runUnit = args.includes('--unit') || (!runControls && !runE2E) || runAll;

// 1. Read existing timings to build initial estimate dashboard
let expectedDurations = {};
let totalExpectedMs = 0;
let unitCount = 0;
let controlsCount = 0;
let e2eCount = 0;

try {
    if (fs.existsSync(durationsFile)) {
        expectedDurations = JSON.parse(fs.readFileSync(durationsFile, 'utf8'));
    }
} catch (e) {
    // Ignore issues loading durations
}

// Scrape files to count tests
const controlsDir = path.join(__dirname, 'controls');
const controlsFiles = fs.existsSync(controlsDir)
    ? fs.readdirSync(controlsDir).filter(f => f.endsWith('.test.js'))
    : [];

const e2eDir = path.join(__dirname, 'e2e');
const e2eFiles = fs.existsSync(e2eDir)
    ? fs.readdirSync(e2eDir).filter(f => f.endsWith('.test.js') && f !== 'helpers.js')
    : [];

// Estimate durations
if (runUnit) {
    // Unit/Integration tests are JSDOM-based, very fast
    for (const [title, ms] of Object.entries(expectedDurations)) {
        if (!title.startsWith('E2E:') && !title.startsWith('Control:')) {
            totalExpectedMs += ms;
            unitCount++;
        }
    }
    if (unitCount === 0) totalExpectedMs += 4000; // default 4s estimate
}

if (runControls) {
    for (const file of controlsFiles) {
        const key = `Control: ${file}`;
        totalExpectedMs += expectedDurations[key] || 1500; // default 1.5s per standalone test
        controlsCount++;
    }
}

if (runE2E) {
    for (const file of e2eFiles) {
        const key = `E2E: ${file}`;
        totalExpectedMs += expectedDurations[key] || 15000; // default 15s per E2E test
        e2eCount++;
    }
}

console.log('\n\x1b[35m==================================================\x1b[0m');
console.log('\x1b[1m\x1b[35m  jsgui3-html Timed & Instrumented Test Runner   \x1b[0m');
console.log('\x1b[35m==================================================\x1b[0m');
console.log(`📋 \x1b[1mTarget Suites:\x1b[0m` +
    (runUnit ? ' \x1b[32m[Unit/Integration]\x1b[0m' : '') +
    (runControls ? ' \x1b[36m[Standalone Controls]\x1b[0m' : '') +
    (runE2E ? ' \x1b[33m[Puppeteer E2E]\x1b[0m' : '')
);

if (totalExpectedMs > 0) {
    const totalSec = Math.round(totalExpectedMs / 1000);
    console.log(`📊 \x1b[1mEstimated Total Duration:\x1b[0m \x1b[33m${totalSec}s\x1b[0m`);
}
console.log('\x1b[35m--------------------------------------------------\x1b[0m\n');

// Update durations in JSON
function saveDuration(key, duration) {
    try {
        let currentDurations = {};
        if (fs.existsSync(durationsFile)) {
            currentDurations = JSON.parse(fs.readFileSync(durationsFile, 'utf8'));
        }
        if (currentDurations[key]) {
            currentDurations[key] = Math.round(currentDurations[key] * 0.3 + duration * 0.7);
        } else {
            currentDurations[key] = duration;
        }
        fs.writeFileSync(durationsFile, JSON.stringify(currentDurations, null, 2));
    } catch (e) {
        // Ignore write issues
    }
}

// Promise wrapper to run a shell command
function runCmd(command, args, cwd, inheritStdio = true) {
    return new Promise((resolve) => {
        const child = spawn(command, args, {
            cwd,
            shell: true,
            stdio: inheritStdio ? 'inherit' : 'pipe'
        });
        
        let stdout = '';
        if (!inheritStdio) {
            child.stdout.on('data', data => stdout += data.toString());
            child.stderr.on('data', data => stdout += data.toString());
        }

        child.on('close', (code) => {
            resolve({ code: code || 0, stdout });
        });
    });
}

async function main() {
    let failed = false;

    // --- Phase 1: Unit & Integration Tests (Mocha with DurationReporter) ---
    if (runUnit) {
        console.log('🚀 \x1b[1m[1/3] Running Unit & Integration Tests...\x1b[0m');
        const unitArgs = [
            'mocha',
            'core/**/*.test.js',
            'mvvm/**/*.test.js',
            'mixins/**/*.test.js',
            'integration/**/*.test.js',
            'router/**/*.test.js',
            '*.test.js',
            '--reporter',
            './helpers/duration-reporter.js',
            '--timeout',
            '10000',
            '--exit'
        ];
        const res = await runCmd('npx', unitArgs, __dirname);
        if (res.code !== 0) {
            console.error('\n❌ Unit/Integration tests failed.');
            failed = true;
        }
        console.log('\n\x1b[32m✓ Unit & Integration Tests complete.\x1b[0m\n');
    }

    // --- Phase 2: Standalone Control Tests (Spawn sequentially via Node) ---
    if (runControls && !failed) {
        console.log('🚀 \x1b[1m[2/3] Running Standalone Control Tests...\x1b[0m');
        let completed = 0;
        
        for (const file of controlsFiles) {
            const start = Date.now();
            const percent = Math.round((completed / controlsFiles.length) * 100);
            console.log(`\n\x1b[36m» [Progress: ${percent}%] Running Standalone Control: "${file}"...\x1b[0m`);
            
            const res = await runCmd('node', [path.join(controlsDir, file)], __dirname);
            const duration = Date.now() - start;
            
            if (res.code !== 0) {
                console.error(`❌ Standalone control test failed: ${file}`);
                failed = true;
                break;
            }
            
            saveDuration(`Control: ${file}`, duration);
            completed++;
        }
        if (!failed) {
            console.log('\n\x1b[32m✓ All Standalone Control Tests passed successfully.\x1b[0m\n');
        }
    }

    // --- Phase 3: E2E Tests (Mocha E2E with custom durations) ---
    if (runE2E && !failed) {
        console.log('🚀 \x1b[1m[3/3] Running Puppeteer E2E Tests...\x1b[0m');
        let completed = 0;
        
        for (const file of e2eFiles) {
            const start = Date.now();
            const percent = Math.round((completed / e2eFiles.length) * 100);
            console.log(`\n\x1b[33m» [Progress: ${percent}%] Running E2E Test: "${file}"...\x1b[0m`);
            
            // Spawn each E2E test file in its own isolated mocha invocation
            const res = await runCmd('npx', ['mocha', file, '--timeout', '120000', '--exit'], e2eDir);
            const duration = Date.now() - start;
            
            if (res.code !== 0) {
                console.error(`❌ E2E test failed: ${file}`);
                failed = true;
                break;
            }
            
            saveDuration(`E2E: ${file}`, duration);
            completed++;
        }
        if (!failed) {
            console.log('\n\x1b[32m✓ All Puppeteer E2E Tests passed successfully.\x1b[0m\n');
        }
    }

    if (failed) {
        console.log('\x1b[31m══════════════════════════════════════════════════\x1b[0m');
        console.log('\x1b[31m❌ TEST SUITE RUN FAILED\x1b[0m');
        console.log('\x1b[31m══════════════════════════════════════════════════\x1b[0m');
        process.exit(1);
    } else {
        console.log('\x1b[32m══════════════════════════════════════════════════\x1b[0m');
        console.log('\x1b[32m🎉 ALL TEST SUITES PASSED SUCCESSFULLY\x1b[0m');
        console.log('\x1b[32m══════════════════════════════════════════════════\x1b[0m');
        process.exit(0);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
