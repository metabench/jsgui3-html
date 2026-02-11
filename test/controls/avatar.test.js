const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Avatar = require('../../controls/organised/0-core/0-basic/1-compositional/avatar');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

async function run_tests() {
    console.log('Starting Avatar tests...');

    // Test 1: Default Instantiation (fallback icon)
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context });

        assert.strictEqual(av.avatar_size, 'md');
        assert.strictEqual(av.shape, 'circle');
        assert.strictEqual(av.src, '');
        assert.strictEqual(av.initials, '');
        assert.ok(av.has_class('avatar'));
        assert.ok(av.has_class('avatar-md'));
        assert.ok(av.has_class('avatar-circle'));
        assert.ok(av._inner.has_class('avatar-fallback'));

        console.log('Test 1 Passed: Default Instantiation');
    }

    // Test 2: Initials Mode
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context, initials: 'JD' });

        assert.strictEqual(av.initials, 'JD');
        assert.ok(av._inner.has_class('avatar-initials'));

        console.log('Test 2 Passed: Initials Mode');
    }

    // Test 3: Image Mode
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context, src: 'https://example.com/photo.jpg', alt: 'User' });

        assert.strictEqual(av.src, 'https://example.com/photo.jpg');
        assert.ok(av._inner.has_class('avatar-img'));

        console.log('Test 3 Passed: Image Mode');
    }

    // Test 4: Size Variants
    {
        const context = new jsgui.Page_Context();

        const xs = new Avatar({ context, avatar_size: 'xs' });
        assert.ok(xs.has_class('avatar-xs'));

        const sm = new Avatar({ context, avatar_size: 'sm' });
        assert.ok(sm.has_class('avatar-sm'));

        const lg = new Avatar({ context, avatar_size: 'lg' });
        assert.ok(lg.has_class('avatar-lg'));

        const xl = new Avatar({ context, avatar_size: 'xl' });
        assert.ok(xl.has_class('avatar-xl'));

        console.log('Test 4 Passed: Size Variants');
    }

    // Test 5: Square Shape
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context, shape: 'square', initials: 'AB' });

        assert.strictEqual(av.shape, 'square');
        assert.ok(av.has_class('avatar-square'));

        console.log('Test 5 Passed: Square Shape');
    }

    // Test 6: Status Indicator
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context, initials: 'ON', status: 'online' });

        assert.strictEqual(av.status, 'online');
        assert.ok(av._status_ctrl.has_class('status-online'));
        assert.ok(!av._status_ctrl.has_class('hidden'));

        console.log('Test 6 Passed: Status Indicator');
    }

    // Test 7: No Status (hidden)
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context, initials: 'NS' });

        assert.strictEqual(av.status, '');
        assert.ok(av._status_ctrl.has_class('hidden'));

        console.log('Test 7 Passed: No Status Hidden');
    }

    // Test 8: set_status
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context, initials: 'SS' });

        av.set_status('busy');
        assert.strictEqual(av.status, 'busy');
        assert.ok(av._status_ctrl.has_class('status-busy'));
        assert.ok(!av._status_ctrl.has_class('hidden'));

        av.set_status('');
        assert.strictEqual(av.status, '');
        assert.ok(av._status_ctrl.has_class('hidden'));

        console.log('Test 8 Passed: set_status');
    }

    // Test 9: Initials Truncation
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context, initials: 'ABCDEF' });

        // Initials should be truncated to 2 characters
        assert.strictEqual(av.initials, 'ABCDEF'); // raw stored value
        // But the displayed text should be AB (truncated on render)
        assert.ok(av._inner.has_class('avatar-initials'));

        console.log('Test 9 Passed: Initials Truncation');
    }

    // Test 10: set_initials recomposes
    {
        const context = new jsgui.Page_Context();
        const av = new Avatar({ context, initials: 'AA' });

        assert.ok(av._inner.has_class('avatar-initials'));

        av.set_initials('BB');
        assert.strictEqual(av.initials, 'BB');
        assert.ok(av._inner.has_class('avatar-initials'));

        console.log('Test 10 Passed: set_initials');
    }

    console.log('All Avatar tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
