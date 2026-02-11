const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Skeleton_Loader = require('../../controls/organised/0-core/0-basic/1-compositional/skeleton-loader');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

async function run_tests() {
    console.log('Starting Skeleton_Loader tests...');

    // Test 1: Default Instantiation (single text line)
    {
        const context = new jsgui.Page_Context();
        const sk = new Skeleton_Loader({ context });

        assert.strictEqual(sk.variant, 'text');
        assert.strictEqual(sk.lines, 1);
        assert.strictEqual(sk.animate, true);
        assert.ok(sk.has_class('skeleton-loader'));
        assert.ok(sk.has_class('skeleton-text'));

        console.log('Test 1 Passed: Default Instantiation');
    }

    // Test 2: Multi-Line Text
    {
        const context = new jsgui.Page_Context();
        const sk = new Skeleton_Loader({ context, lines: 3 });

        assert.strictEqual(sk.lines, 3);
        assert.strictEqual(sk.variant, 'text');

        console.log('Test 2 Passed: Multi-Line Text');
    }

    // Test 3: Circle Variant
    {
        const context = new jsgui.Page_Context();
        const sk = new Skeleton_Loader({ context, variant: 'circle' });

        assert.strictEqual(sk.variant, 'circle');
        assert.ok(sk.has_class('skeleton-circle'));

        console.log('Test 3 Passed: Circle Variant');
    }

    // Test 4: Rect Variant
    {
        const context = new jsgui.Page_Context();
        const sk = new Skeleton_Loader({ context, variant: 'rect', width: '300px', height: '200px' });

        assert.strictEqual(sk.variant, 'rect');
        assert.ok(sk.has_class('skeleton-rect'));

        console.log('Test 4 Passed: Rect Variant');
    }

    // Test 5: Card Variant
    {
        const context = new jsgui.Page_Context();
        const sk = new Skeleton_Loader({ context, variant: 'card' });

        assert.strictEqual(sk.variant, 'card');
        assert.ok(sk.has_class('skeleton-card'));

        console.log('Test 5 Passed: Card Variant');
    }

    // Test 6: Animation Toggle
    {
        const context = new jsgui.Page_Context();
        const sk = new Skeleton_Loader({ context });

        assert.strictEqual(sk.animate, true);
        assert.ok(!sk.has_class('no-animate'));

        sk.set_animate(false);
        assert.strictEqual(sk.animate, false);
        assert.ok(sk.has_class('no-animate'));

        sk.set_animate(true);
        assert.strictEqual(sk.animate, true);
        assert.ok(!sk.has_class('no-animate'));

        console.log('Test 6 Passed: Animation Toggle');
    }

    // Test 7: Initial No Animation
    {
        const context = new jsgui.Page_Context();
        const sk = new Skeleton_Loader({ context, animate: false });

        assert.strictEqual(sk.animate, false);
        assert.ok(sk.has_class('no-animate'));

        console.log('Test 7 Passed: Initial No Animation');
    }

    // Test 8: Lines Clamping
    {
        const context = new jsgui.Page_Context();
        const sk = new Skeleton_Loader({ context, lines: 0 });

        assert.strictEqual(sk.lines, 1, 'Lines should clamp to minimum 1');

        console.log('Test 8 Passed: Lines Clamping');
    }

    console.log('All Skeleton_Loader tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
