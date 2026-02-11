const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Spinner = require('../../controls/organised/0-core/0-basic/1-compositional/spinner');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

async function run_tests() {
    console.log('Starting Spinner tests...');

    // Test 1: Default Instantiation
    {
        const context = new jsgui.Page_Context();
        const sp = new Spinner({ context });

        assert.strictEqual(sp.spinner_size, 'md', 'Default size should be md');
        assert.strictEqual(sp.label, '', 'Default label should be empty');
        assert.strictEqual(sp.visible, true, 'Should be visible by default');
        assert.ok(sp.has_class('spinner-control'), 'Should have spinner-control class');
        assert.ok(sp.has_class('spinner-md'), 'Should have spinner-md class');

        console.log('Test 1 Passed: Default Instantiation');
    }

    // Test 2: Size Variants
    {
        const context = new jsgui.Page_Context();

        const sm = new Spinner({ context, size: 'sm' });
        assert.ok(sm.has_class('spinner-sm'), 'Should have spinner-sm class');
        assert.strictEqual(sm.spinner_size, 'sm');

        const lg = new Spinner({ context, size: 'lg' });
        assert.ok(lg.has_class('spinner-lg'), 'Should have spinner-lg class');
        assert.strictEqual(lg.spinner_size, 'lg');

        console.log('Test 2 Passed: Size Variants');
    }

    // Test 3: Custom Label
    {
        const context = new jsgui.Page_Context();
        const sp = new Spinner({ context, label: 'Loading...' });

        assert.strictEqual(sp.label, 'Loading...');
        assert.ok(sp._label_ctrl, 'Should have label control');
        assert.ok(!sp._label_ctrl.has_class('hidden'), 'Label should not be hidden');

        console.log('Test 3 Passed: Custom Label');
    }

    // Test 4: No Label (hidden)
    {
        const context = new jsgui.Page_Context();
        const sp = new Spinner({ context });

        assert.strictEqual(sp.label, '');
        assert.ok(sp._label_ctrl.has_class('hidden'), 'Empty label should be hidden');

        console.log('Test 4 Passed: No Label Hidden');
    }

    // Test 5: Show / Hide / Toggle
    {
        const context = new jsgui.Page_Context();
        const sp = new Spinner({ context });

        assert.strictEqual(sp.visible, true);
        assert.ok(!sp.has_class('hidden'));

        sp.hide();
        assert.strictEqual(sp.visible, false);
        assert.ok(sp.has_class('hidden'), 'Should have hidden class after hide()');

        sp.show();
        assert.strictEqual(sp.visible, true);
        assert.ok(!sp.has_class('hidden'), 'Should not have hidden class after show()');

        sp.toggle();
        assert.strictEqual(sp.visible, false, 'Toggle should hide');

        sp.toggle();
        assert.strictEqual(sp.visible, true, 'Toggle should show');

        console.log('Test 5 Passed: Show / Hide / Toggle');
    }

    // Test 6: Initial Hidden
    {
        const context = new jsgui.Page_Context();
        const sp = new Spinner({ context, visible: false });

        assert.strictEqual(sp.visible, false);
        assert.ok(sp.has_class('hidden'), 'Should start hidden');

        sp.show();
        assert.strictEqual(sp.visible, true);
        assert.ok(!sp.has_class('hidden'));

        console.log('Test 6 Passed: Initial Hidden');
    }

    // Test 7: set_label
    {
        const context = new jsgui.Page_Context();
        const sp = new Spinner({ context });

        assert.strictEqual(sp.label, '');
        sp.set_label('Please wait...');
        assert.strictEqual(sp._label_text, 'Please wait...');

        sp.set_label('');
        assert.strictEqual(sp._label_text, '');

        console.log('Test 7 Passed: set_label');
    }

    console.log('All Spinner tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
