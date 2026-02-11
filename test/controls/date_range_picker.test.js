const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Date_Range_Picker = require('../../controls/organised/0-core/0-basic/_complex_date-range-picker');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

const { Control } = jsgui;

async function run_tests() {
    console.log('Starting Date_Range_Picker tests...');

    // Test 1: Instantiation (Single Mode)
    {
        const context = new jsgui.Page_Context();
        const drp = new Date_Range_Picker({ context, mode: 'single' });

        assert.strictEqual(drp.mode, 'single');
        assert.ok(drp.mv_start, 'Should have start calendar');
        assert.strictEqual(drp.mv_end, undefined, 'Should not have end calendar in single mode');
        assert.ok(drp.input_start, 'Should have start input');
        assert.ok(drp.input_end, 'Should have end input');

        console.log('Test 1 Passed: Instantiation (Single Mode)');
    }

    // Test 2: Instantiation (Dual Mode)
    {
        const context = new jsgui.Page_Context();
        const drp = new Date_Range_Picker({ context, mode: 'dual' });

        assert.strictEqual(drp.mode, 'dual');
        assert.ok(drp.mv_start, 'Should have start calendar');
        assert.ok(drp.mv_end, 'Should have end calendar');
        assert.ok(drp.mv_start.has_class('left-view'));
        assert.ok(drp.mv_end.has_class('right-view'));

        // Verify Dual View Default Months (consecutive)
        const now = new Date();
        assert.strictEqual(drp.mv_start.month, now.getMonth());
        assert.strictEqual(drp.mv_start.year, now.getFullYear());

        let expected_next_m = now.getMonth() + 1;
        let expected_next_y = now.getFullYear();
        if (expected_next_m > 11) { expected_next_m = 0; expected_next_y++; }

        assert.strictEqual(drp.mv_end.month, expected_next_m);
        assert.strictEqual(drp.mv_end.year, expected_next_y);

        console.log('Test 2 Passed: Instantiation (Dual Mode)');
    }

    // Test 3: Time Inputs
    {
        const context = new jsgui.Page_Context();
        const drp = new Date_Range_Picker({ context, use_time: true });

        assert.ok(drp.use_time);
        assert.ok(drp.input_start_time, 'Should have start time input');
        assert.ok(drp.input_end_time, 'Should have end time input');
        assert.strictEqual(drp.input_start_time.dom.attrs.type, 'time');

        console.log('Test 3 Passed: Time Inputs');
    }

    // Test 4: Range Logic (Internal Event Handling)
    {
        const context = new jsgui.Page_Context();
        const drp = new Date_Range_Picker({ context, mode: 'single' });

        const start_iso = '2026-05-01';
        const end_iso = '2026-05-10';

        drp.activate();

        drp.mv_start.raise('range-change', { start: start_iso, end: end_iso, target: drp.mv_start });

        assert.strictEqual(drp.start_date, start_iso);
        assert.strictEqual(drp.end_date, end_iso);

        console.log('Test 4 Passed: Range Logic State Update');
    }

    // Test 5: Initial Values
    {
        const context = new jsgui.Page_Context();
        const drp = new Date_Range_Picker({
            context,
            initial_start: '2026-10-01',
            initial_end: '2026-10-05',
            use_time: true,
            start_time: '10:00',
            end_time: '12:00'
        });

        assert.strictEqual(drp.start_date, '2026-10-01');
        assert.strictEqual(drp.end_date, '2026-10-05');
        assert.strictEqual(drp.start_time, '10:00');
        assert.strictEqual(drp.end_time, '12:00');

        // Verify calendar sync
        assert.strictEqual(drp.mv_start.range_start, '2026-10-01');
        assert.strictEqual(drp.mv_start.range_end, '2026-10-05');

        console.log('Test 5 Passed: Initial Values');
    }

    console.log('All tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
