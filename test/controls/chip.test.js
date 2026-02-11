const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Chip = require('../../controls/organised/0-core/0-basic/1-compositional/chip');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

async function run_tests() {
    console.log('Starting Chip tests...');

    // Test 1: Default Instantiation
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context, label: 'Tag' });

        assert.strictEqual(chip.label, 'Tag');
        assert.strictEqual(chip.variant, 'default');
        assert.strictEqual(chip.dismissible, false);
        assert.strictEqual(chip.is_selected, false);
        assert.strictEqual(chip.is_disabled, false);
        assert.ok(chip.has_class('chip'));
        assert.ok(chip.has_class('chip-default'));

        console.log('Test 1 Passed: Default Instantiation');
    }

    // Test 2: With Icon
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context, label: 'Star', icon: '⭐' });

        assert.strictEqual(chip.icon, '⭐');
        assert.ok(chip._icon_ctrl, 'Should have icon control');
        assert.ok(chip._icon_ctrl.has_class('chip-icon'));

        console.log('Test 2 Passed: With Icon');
    }

    // Test 3: Dismissible
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context, label: 'Remove me', dismissible: true });

        assert.strictEqual(chip.dismissible, true);
        assert.ok(chip._close_ctrl, 'Should have close control');
        assert.ok(chip._close_ctrl.has_class('chip-close'));

        console.log('Test 3 Passed: Dismissible');
    }

    // Test 4: Variants
    {
        const context = new jsgui.Page_Context();

        const primary = new Chip({ context, label: 'P', variant: 'primary' });
        assert.ok(primary.has_class('chip-primary'));

        const success = new Chip({ context, label: 'S', variant: 'success' });
        assert.ok(success.has_class('chip-success'));

        const warning = new Chip({ context, label: 'W', variant: 'warning' });
        assert.ok(warning.has_class('chip-warning'));

        const error = new Chip({ context, label: 'E', variant: 'error' });
        assert.ok(error.has_class('chip-error'));

        console.log('Test 4 Passed: Variants');
    }

    // Test 5: Selected State
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context, label: 'Sel', selected: true });

        assert.strictEqual(chip.is_selected, true);
        assert.ok(chip.has_class('selected'));

        chip.set_selected(false);
        assert.strictEqual(chip.is_selected, false);
        assert.ok(!chip.has_class('selected'));

        chip.set_selected(true);
        assert.strictEqual(chip.is_selected, true);
        assert.ok(chip.has_class('selected'));

        console.log('Test 5 Passed: Selected State');
    }

    // Test 6: Disabled State 
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context, label: 'Dis', disabled: true });

        assert.strictEqual(chip.is_disabled, true);
        assert.ok(chip.has_class('disabled'));

        chip.set_disabled(false);
        assert.strictEqual(chip.is_disabled, false);
        assert.ok(!chip.has_class('disabled'));

        console.log('Test 6 Passed: Disabled State');
    }

    // Test 7: set_label
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context, label: 'Original' });

        assert.strictEqual(chip.label, 'Original');
        chip.set_label('Updated');
        assert.strictEqual(chip.label, 'Updated');

        console.log('Test 7 Passed: set_label');
    }

    // Test 8: set_variant
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context, label: 'V', variant: 'primary' });

        assert.ok(chip.has_class('chip-primary'));
        chip.set_variant('error');
        assert.strictEqual(chip.variant, 'error');
        assert.ok(chip.has_class('chip-error'));
        assert.ok(!chip.has_class('chip-primary'));

        console.log('Test 8 Passed: set_variant');
    }

    // Test 9: No Dismiss Button When Not Dismissible
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context, label: 'Plain' });

        assert.ok(!chip._close_ctrl, 'Should NOT have close control');

        console.log('Test 9 Passed: No Dismiss Button');
    }

    // Test 10: Empty Label
    {
        const context = new jsgui.Page_Context();
        const chip = new Chip({ context });

        assert.strictEqual(chip.label, '');
        assert.ok(chip.has_class('chip'));

        console.log('Test 10 Passed: Empty Label');
    }

    console.log('All Chip tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
