const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Rating_Stars = require('../../controls/organised/0-core/0-basic/1-compositional/rating-stars');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

async function run_tests() {
    console.log('Starting Rating_Stars tests...');

    // Test 1: Default Instantiation
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context });

        assert.strictEqual(rs.max, 5, 'Default max should be 5');
        assert.strictEqual(rs.value, 0, 'Default value should be 0');
        assert.strictEqual(rs._stars.length, 5, 'Should have 5 star elements');
        assert.ok(rs.has_class('rating-stars'), 'Should have rating-stars class');

        console.log('Test 1 Passed: Default Instantiation');
    }

    // Test 2: Custom Max and Initial Value
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context, max: 10, value: 7 });

        assert.strictEqual(rs.max, 10, 'Max should be 10');
        assert.strictEqual(rs.value, 7, 'Value should be 7');
        assert.strictEqual(rs._stars.length, 10, 'Should have 10 star elements');

        console.log('Test 2 Passed: Custom Max and Value');
    }

    // Test 3: set_value / get_value API
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context });

        rs.set_value(3);
        assert.strictEqual(rs.get_value(), 3, 'get_value should return 3');

        rs.set_value(5);
        assert.strictEqual(rs.value, 5, 'value should be 5');

        // Overwrite with different value
        rs.value = 1;
        assert.strictEqual(rs.get_value(), 1, 'get_value should return 1 after setter');

        console.log('Test 3 Passed: set_value / get_value API');
    }

    // Test 4: Value Clamping
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context, max: 5 });

        // Cannot exceed max
        rs.value = 10;
        assert.strictEqual(rs.value, 5, 'Value should clamp to max (5)');

        // Cannot go below 0
        rs.value = -3;
        assert.strictEqual(rs.value, 0, 'Value should clamp to 0');

        // NaN becomes 0
        rs.value = 'hello';
        assert.strictEqual(rs.value, 0, 'NaN input should become 0');

        console.log('Test 4 Passed: Value Clamping');
    }

    // Test 5: Readonly Mode
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context, value: 4, readonly: true });

        assert.strictEqual(rs.readonly, true, 'Should be readonly');
        assert.ok(rs.has_class('readonly'), 'Should have readonly class');
        assert.strictEqual(rs.value, 4, 'Value should still be 4');

        // Can still set value programmatically
        rs.set_value(2);
        assert.strictEqual(rs.value, 2, 'Programmatic set should work in readonly');

        console.log('Test 5 Passed: Readonly Mode');
    }

    // Test 6: Half-Star Support
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context, half: true, value: 3.5 });

        assert.strictEqual(rs.value, 3.5, 'Should support half value 3.5');
        assert.strictEqual(rs._half, true, 'Half mode should be enabled');

        rs.value = 2.3;
        assert.strictEqual(rs.value, 2.5, 'Should snap to nearest 0.5 (2.5)');

        rs.value = 2.7;
        assert.strictEqual(rs.value, 2.5, 'Should snap to nearest 0.5 (2.5)');

        rs.value = 2.8;
        assert.strictEqual(rs.value, 3, 'Should snap to nearest 0.5 (3)');

        console.log('Test 6 Passed: Half-Star Support');
    }

    // Test 7: Star Display State
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context, value: 3 });

        // First 3 stars should be filled
        for (let i = 0; i < 3; i++) {
            assert.ok(rs._stars[i].has_class('filled'), `Star ${i} should be filled`);
        }
        // Last 2 stars should NOT be filled
        for (let i = 3; i < 5; i++) {
            assert.ok(!rs._stars[i].has_class('filled'), `Star ${i} should not be filled`);
        }

        console.log('Test 7 Passed: Star Display State');
    }

    // Test 8: set_readonly Toggle
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context });

        assert.strictEqual(rs.readonly, false, 'Should not be readonly initially');
        assert.ok(!rs.has_class('readonly'), 'Should not have readonly class');

        rs.set_readonly(true);
        assert.strictEqual(rs.readonly, true, 'Should be readonly after set');
        assert.ok(rs.has_class('readonly'), 'Should have readonly class after set');

        rs.set_readonly(false);
        assert.strictEqual(rs.readonly, false, 'Should not be readonly after unset');
        assert.ok(!rs.has_class('readonly'), 'Should not have readonly class after unset');

        console.log('Test 8 Passed: set_readonly Toggle');
    }

    // Test 9: Min Stars
    {
        const context = new jsgui.Page_Context();
        const rs = new Rating_Stars({ context, max: 0 });

        // Max should be clamped to at least 1
        assert.strictEqual(rs.max, 1, 'Max should be at least 1');
        assert.strictEqual(rs._stars.length, 1, 'Should have 1 star');

        console.log('Test 9 Passed: Min Stars');
    }

    console.log('All Rating_Stars tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
