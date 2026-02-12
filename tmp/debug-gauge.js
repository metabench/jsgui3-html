// Detailed debug to find exact line causing issue
const jsgui = require('../html-core/html-core');
const ctx = new jsgui.Page_Context();
const Control = require('../html-core/control');

// Test 1: Can we create a basic gauge with NO spec at all?
try {
    const Gauge = require('../controls/organised/1-standard/4-data/gauge');
    console.log('1. Creating Gauge with empty spec...');
    const g1 = new Gauge({ context: ctx });
    console.log('   OK — length:', g1.html.length);
} catch (e) {
    console.error('1. FAILED:', e.message);
}

// Test 2: Minimal spec
try {
    // Clear module cache
    delete require.cache[require.resolve('../controls/organised/1-standard/4-data/gauge')];
    const Gauge = require('../controls/organised/1-standard/4-data/gauge');
    console.log('2. Creating Gauge with value only...');
    const g2 = new Gauge({ context: ctx, value: 50 });
    console.log('   OK — length:', g2.html.length);
} catch (e) {
    console.error('2. FAILED:', e.message);
}

// Test 3: Check what super(spec) does with remaining props
try {
    console.log('3. Creating base Control with size prop...');
    const c = new Control({ context: ctx, size: 160 });
    console.log('   OK — no crash');
} catch (e) {
    console.error('3. FAILED:', e.message, e.stack.split('\n').slice(0, 3).join('\n'));
}

// Test 4: Check what base Control does with thresholds (array)
try {
    console.log('4. Creating base Control with thresholds...');
    const c = new Control({ context: ctx, thresholds: [1, 2, 3] });
    console.log('   OK — no crash');
} catch (e) {
    console.error('4. FAILED:', e.message, e.stack.split('\n').slice(0, 3).join('\n'));
}
