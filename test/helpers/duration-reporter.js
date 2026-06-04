const Spec = require('mocha/lib/reporters/spec');
const fs = require('fs');
const path = require('path');

class DurationReporter extends Spec {
    constructor(runner, options) {
        super(runner, options);

        const durationsFile = path.join(__dirname, '../test_durations.json');
        
        // Load existing durations to estimate progress
        let expectedDurations = {};
        try {
            if (fs.existsSync(durationsFile)) {
                expectedDurations = JSON.parse(fs.readFileSync(durationsFile, 'utf8'));
            }
        } catch (e) {
            // Ignore parsing errors
        }

        const timings = {};
        let activeSuite = null;
        let suiteStartTime = 0;
        let totalExpectedTime = 0;
        let completedExpectedTime = 0;
        const activeSuites = [];

        // Build list of expected suites to calculate total expected time
        runner.on('start', () => {
            function calculateTotalExpected(suite) {
                if (suite.title && suite.tests && suite.tests.length > 0) {
                    if (expectedDurations[suite.title]) {
                        totalExpectedTime += expectedDurations[suite.title];
                    } else {
                        // Default fallback estimates if no record exists yet
                        const isE2E = suite.file && suite.file.includes('e2e');
                        totalExpectedTime += isE2E ? 10000 : 100; // 10s for E2E, 100ms for unit
                    }
                }
                for (const child of suite.suites) {
                    calculateTotalExpected(child);
                }
            }
            calculateTotalExpected(runner.suite);

            if (totalExpectedTime > 0) {
                console.log(`\n📊 Estimated suite total duration: ${Math.round(totalExpectedTime / 1000)} seconds\n`);
            }
        });

        runner.on('suite', (suite) => {
            if (suite.root || !suite.title) return;
            
            // Only track duration and print progress for suites that contain actual tests
            if (suite.tests && suite.tests.length > 0) {
                activeSuite = suite.title;
                suiteStartTime = Date.now();
                
                const expected = expectedDurations[suite.title] || (suite.file && suite.file.includes('e2e') ? 10000 : 100);
                const percent = totalExpectedTime > 0 ? Math.round((completedExpectedTime / totalExpectedTime) * 100) : 0;
                const remaining = totalExpectedTime > 0 ? Math.max(0, Math.round((totalExpectedTime - completedExpectedTime) / 1000)) : 0;
                
                console.log(`\n\x1b[36m» [Progress: ${percent}% | Est. Remaining: ${remaining}s] Running "${suite.title}" (expected ~${Math.round(expected / 1000)}s)...\x1b[0m`);
            }
        });

        runner.on('suite end', (suite) => {
            if (suite.root || !suite.title) return;
            
            if (suite.title === activeSuite) {
                const duration = Date.now() - suiteStartTime;
                timings[suite.title] = duration;
                
                const expected = expectedDurations[suite.title] || (suite.file && suite.file.includes('e2e') ? 10000 : 100);
                completedExpectedTime += expected;
                activeSuite = null;
            }
        });

        runner.on('end', () => {
            // Merge and update durations
            for (const [title, duration] of Object.entries(timings)) {
                if (expectedDurations[title]) {
                    // Exponential Moving Average (70% new, 30% old) to absorb environment jitter
                    expectedDurations[title] = Math.round(expectedDurations[title] * 0.3 + duration * 0.7);
                } else {
                    expectedDurations[title] = duration;
                }
            }

            try {
                fs.writeFileSync(durationsFile, JSON.stringify(expectedDurations, null, 2));
                console.log(`\n\x1b[32m⏱️  Test durations successfully updated in: ${path.relative(process.cwd(), durationsFile)}\x1b[0m\n`);
            } catch (e) {
                console.error('Failed to save test durations:', e);
            }
        });
    }
}

module.exports = DurationReporter;
