const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Modal = require('../../controls/organised/1-standard/6-layout/modal');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

// ─── Helper ───
function find_child(ctrl, predicate) {
    if (predicate(ctrl)) return ctrl;
    const children = ctrl.content && ctrl.content._arr;
    if (Array.isArray(children)) {
        for (const child of children) {
            if (child && typeof child === 'object' && child.dom) {
                const found = find_child(child, predicate);
                if (found) return found;
            }
        }
    }
    return null;
}

async function run_tests() {
    console.log('Starting Modal tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context, title: 'Test Modal' });

        assert.ok(modal.has_class('jsgui-modal-overlay'), 'should have overlay class');
        assert.strictEqual(modal.dom.attributes.role, 'dialog', 'should have role=dialog');
        assert.strictEqual(modal.dom.attributes['aria-modal'], 'true', 'should have aria-modal');

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: aria-labelledby links title to dialog
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context, title: 'Hello' });

        const labelledby = modal.dom.attributes['aria-labelledby'];
        assert.ok(labelledby, 'should have aria-labelledby');

        const title_ctrl = find_child(modal, c =>
            c.has_class && c.has_class('jsgui-modal-title'));
        assert.ok(title_ctrl, 'should have title control');
        assert.strictEqual(title_ctrl.dom.attributes.id, labelledby,
            'title id should match aria-labelledby');

        console.log('Test 2 Passed: aria-labelledby links title to dialog');
    }

    // Test 3: Open/close lifecycle
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context });

        assert.strictEqual(modal._is_open, false, 'should start closed');

        modal.open();
        assert.strictEqual(modal._is_open, true, 'should be open after open()');
        assert.ok(modal.has_class('is-open'), 'should have is-open class');

        await modal.close();
        assert.strictEqual(modal._is_open, false, 'should be closed after close()');

        console.log('Test 3 Passed: Open/close lifecycle');
    }

    // Test 4: Open event fires
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context });
        let open_fired = false;

        modal.on('open', () => { open_fired = true; });
        modal.open();

        assert.ok(open_fired, 'open event should fire');

        await modal.close();
        console.log('Test 4 Passed: Open event fires');
    }

    // Test 5: Close event fires with trigger
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context });
        let close_data = null;

        modal.on('close', data => { close_data = data; });
        modal.open();
        await modal.close('api');

        assert.ok(close_data, 'close event should fire');
        assert.strictEqual(close_data.trigger, 'api', 'trigger should be api');

        console.log('Test 5 Passed: Close event with trigger');
    }

    // Test 6: before_close guard blocks close
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({
            context,
            before_close: () => false
        });

        modal.open();
        await modal.close();

        assert.strictEqual(modal._is_open, true,
            'modal should remain open when before_close returns false');

        // Override to allow close
        modal.set_before_close(null);
        await modal.close();
        assert.strictEqual(modal._is_open, false, 'should close after removing guard');

        console.log('Test 6 Passed: before_close guard blocks close');
    }

    // Test 7: before_close async guard
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({
            context,
            before_close: async () => {
                // Simulate async check that allows close
                return true;
            }
        });

        modal.open();
        await modal.close();
        assert.strictEqual(modal._is_open, false, 'should close when async guard allows');

        console.log('Test 7 Passed: Async before_close guard');
    }

    // Test 8: Close button has aria-label
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context });

        const close_btn = find_child(modal, c =>
            c.has_class && c.has_class('jsgui-modal-close'));
        assert.ok(close_btn, 'should have close button');
        assert.strictEqual(close_btn.dom.attributes['aria-label'], 'Close',
            'close button should have aria-label=Close');

        console.log('Test 8 Passed: Close button aria-label');
    }

    // Test 9: closable=false hides close button
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context, closable: false });

        const close_btn = find_child(modal, c =>
            c.has_class && c.has_class('jsgui-modal-close'));
        assert.strictEqual(close_btn, null, 'should not have close button');

        console.log('Test 9 Passed: closable=false hides close button');
    }

    // Test 10: Size variants
    {
        const context = new jsgui.Page_Context();
        const modal_sm = new Modal({ context, size: 'sm' });
        const modal_lg = new Modal({ context, size: 'lg' });

        const box_sm = find_child(modal_sm, c =>
            c.has_class && c.has_class('jsgui-modal'));
        const box_lg = find_child(modal_lg, c =>
            c.has_class && c.has_class('jsgui-modal'));

        assert.strictEqual(box_sm.dom.attributes['data-size'], 'sm');
        assert.strictEqual(box_lg.dom.attributes['data-size'], 'lg');

        console.log('Test 10 Passed: Size variants');
    }

    // Test 11: set_title updates title
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context, title: 'Original' });

        modal.set_title('Updated');
        assert.strictEqual(modal._title, 'Updated');

        console.log('Test 11 Passed: set_title');
    }

    // Test 12: toggle
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context });

        modal.toggle();
        assert.strictEqual(modal._is_open, true, 'toggle should open');

        modal.toggle();
        // Note: close is async now, but toggle calls it. Wait a tick.
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(modal._is_open, false, 'toggle should close');

        console.log('Test 12 Passed: toggle');
    }

    // Test 13: CSS uses theme tokens
    {
        const css = Modal.css;
        const lines = css.split('\n');
        const bad_lines = lines.filter(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')
                || trimmed.startsWith('@') || trimmed.startsWith('from')
                || trimmed.startsWith('to')) return false;
            const has_hex = /#[0-9a-fA-F]{3,8}\b/.test(trimmed);
            const is_var_fallback = /var\([^)]*#[0-9a-fA-F]{3,8}/.test(trimmed);
            const is_rgba = /rgba?\(/.test(trimmed);
            return has_hex && !is_var_fallback && !is_rgba;
        });

        assert.strictEqual(bad_lines.length, 0,
            `CSS should not have hardcoded hex. Found: ${bad_lines.join('; ')}`);
        assert.ok(css.includes('var(--j-'), 'CSS should use --j- tokens');
        assert.ok(!css.includes('--admin-'), 'CSS should not use --admin- tokens');

        console.log('Test 13 Passed: CSS uses theme tokens');
    }

    // Test 14: Modal structure has header, body, footer
    {
        const context = new jsgui.Page_Context();
        const modal = new Modal({ context, title: 'Structured' });

        const header = find_child(modal, c => c.has_class && c.has_class('jsgui-modal-header'));
        const body = find_child(modal, c => c.has_class && c.has_class('jsgui-modal-body'));
        const footer = find_child(modal, c => c.has_class && c.has_class('jsgui-modal-footer'));

        assert.ok(header, 'should have header');
        assert.ok(body, 'should have body');
        assert.ok(footer, 'should have footer');

        console.log('Test 14 Passed: Modal structure');
    }

    // Test 15: CSS includes animations
    {
        const css = Modal.css;
        assert.ok(css.includes('@keyframes modal-fade-in'), 'should have fade-in animation');
        assert.ok(css.includes('@keyframes modal-scale-in'), 'should have scale-in animation');

        console.log('Test 15 Passed: CSS animations');
    }

    console.log(`\nAll 15 Modal tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
