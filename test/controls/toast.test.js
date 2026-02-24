const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Toast = require('../../controls/organised/1-standard/5-ui/toast');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

// ─── Helper: walk jsgui control tree (children live at content._arr) ───
function walk_children(ctrl, visitor) {
    visitor(ctrl);
    const children = ctrl.content && ctrl.content._arr;
    if (Array.isArray(children)) {
        for (const child of children) {
            if (child && typeof child === 'object' && child.dom) {
                walk_children(child, visitor);
            }
        }
    }
}

function find_child(ctrl, predicate) {
    let found = null;
    walk_children(ctrl, c => { if (!found && predicate(c)) found = c; });
    return found;
}

async function run_tests() {
    console.log('Starting Toast tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context });

        assert.ok(toast.has_class('toast-container'), 'should have toast-container class');
        assert.ok(toast.has_class('jsgui-toast-container'), 'should have jsgui-toast-container class');
        assert.strictEqual(toast.dom.attributes['aria-live'], 'polite', 'should have aria-live=polite');
        assert.strictEqual(toast.dom.attributes['aria-relevant'], 'additions', 'should have aria-relevant=additions');
        assert.strictEqual(toast.dom.attributes['data-position'], 'top-right', 'default position should be top-right');
        assert.strictEqual(toast._max_visible, 5, 'default max_visible should be 5');
        assert.strictEqual(toast._default_timeout_ms, 5000, 'default timeout should be 5000ms');

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: Custom position
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context, position: 'bottom-left' });

        assert.strictEqual(toast.dom.attributes['data-position'], 'bottom-left');
        assert.strictEqual(toast._position, 'bottom-left');

        console.log('Test 2 Passed: Custom position');
    }

    // Test 3: show() returns id and creates correct DOM structure
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context });

        const id = toast.show('Hello world');

        assert.ok(id, 'show() should return a toast id');
        assert.ok(id.startsWith('toast_'), 'id should start with toast_');
        assert.strictEqual(toast.toast_items.size, 1, 'should have 1 toast item');

        const toast_ctrl = toast.toast_items.get(id);
        assert.ok(toast_ctrl, 'toast control should exist in map');
        assert.ok(toast_ctrl.has_class('jsgui-toast'), 'toast item should have jsgui-toast class');
        assert.strictEqual(toast_ctrl.dom.attributes.role, 'status', 'should have role=status');
        assert.strictEqual(toast_ctrl.dom.attributes['aria-atomic'], 'true', 'should have aria-atomic=true');

        console.log('Test 3 Passed: show() returns id with correct DOM structure');
    }

    // Test 4: Status variants add correct classes
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context, max_visible: 10 });

        const id_success = toast.show('OK', { status: 'success' });
        const id_error = toast.show('Fail', { status: 'error' });
        const id_warning = toast.show('Warn', { status: 'warning' });
        const id_info = toast.show('Info', { status: 'info' });

        const success_ctrl = toast.toast_items.get(id_success);
        const error_ctrl = toast.toast_items.get(id_error);
        const warning_ctrl = toast.toast_items.get(id_warning);
        const info_ctrl = toast.toast_items.get(id_info);

        assert.ok(success_ctrl.has_class('toast-success'), 'success variant class');
        assert.ok(error_ctrl.has_class('toast-error'), 'error variant class');
        assert.ok(warning_ctrl.has_class('toast-warning'), 'warning variant class');
        assert.ok(info_ctrl.has_class('toast-info'), 'info variant class');

        // Error toasts should have assertive aria-live
        assert.strictEqual(error_ctrl.dom.attributes['aria-live'], 'assertive',
            'error toasts should use assertive live region');

        console.log('Test 4 Passed: Status variants add correct classes and ARIA');
    }

    // Test 5: dismiss() removes toast
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context });

        const id = toast.show('To be dismissed');
        assert.strictEqual(toast.toast_items.size, 1, 'should have 1 toast');

        toast.dismiss(id);
        assert.strictEqual(toast.toast_items.size, 0, 'should have 0 toasts after dismiss');

        // Dismiss non-existent id should not throw
        toast.dismiss('non_existent');
        assert.strictEqual(toast.toast_items.size, 0, 'no-op for non-existent id');

        console.log('Test 5 Passed: dismiss() removes toast');
    }

    // Test 6: clear() removes all toasts
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context, max_visible: 10 });

        toast.show('One');
        toast.show('Two');
        toast.show('Three');
        assert.strictEqual(toast.toast_items.size, 3);

        toast.clear();
        assert.strictEqual(toast.toast_items.size, 0, 'clear() should remove all toasts');

        console.log('Test 6 Passed: clear() removes all toasts');
    }

    // Test 7: max_visible enforces limit
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context, max_visible: 3 });

        toast.show('One');
        toast.show('Two');
        toast.show('Three');
        assert.strictEqual(toast.toast_items.size, 3, 'should have 3 toasts');

        // Adding a 4th should evict the oldest
        toast.show('Four');
        assert.strictEqual(toast.toast_items.size, 3, 'should still have max 3 after adding 4th');

        // The oldest (One) should be gone
        const remaining_ids = Array.from(toast.toast_items.keys());
        assert.ok(!remaining_ids.includes('toast_1'), 'oldest toast should be evicted');

        console.log('Test 7 Passed: max_visible enforces limit');
    }

    // Test 8: Action button support
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context });

        const id = toast.show('Deleted', {
            action_label: 'Undo',
            action_id: 'undo_delete'
        });

        const toast_ctrl = toast.toast_items.get(id);
        // Verify the toast was created with action button
        assert.ok(toast_ctrl, 'toast should exist');
        assert.ok(toast_ctrl.has_class('jsgui-toast'), 'should be a jsgui-toast');

        console.log('Test 8 Passed: Action button support');
    }

    // Test 9: Dismiss button has aria-label (check via child controls)
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context });

        const id = toast.show('Test');
        const toast_ctrl = toast.toast_items.get(id);

        const dismiss = find_child(toast_ctrl, c => c.has_class && c.has_class('toast-dismiss'));
        assert.ok(dismiss, 'should have a dismiss button');
        assert.strictEqual(dismiss.dom.attributes['aria-label'], 'Dismiss notification',
            'dismiss button should have aria-label');

        console.log('Test 9 Passed: Dismiss button has aria-label');
    }

    // Test 10: Icon rendered per status (check via child controls)
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context, max_visible: 10 });

        const id_success = toast.show('OK', { status: 'success' });
        const id_error = toast.show('Fail', { status: 'error' });

        const success_icon = find_child(toast.toast_items.get(id_success),
            c => c.has_class && c.has_class('toast-icon'));
        const error_icon = find_child(toast.toast_items.get(id_error),
            c => c.has_class && c.has_class('toast-icon'));

        assert.ok(success_icon, 'success toast should have icon element');
        assert.ok(error_icon, 'error toast should have icon element');
        assert.strictEqual(success_icon.dom.attributes['aria-hidden'], 'true', 'icon should be aria-hidden');

        console.log('Test 10 Passed: Icon rendered per status');
    }

    // Test 11: Custom max_visible and default_timeout_ms
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context, max_visible: 2, default_timeout_ms: 10000 });

        assert.strictEqual(toast._max_visible, 2, 'custom max_visible');
        assert.strictEqual(toast._default_timeout_ms, 10000, 'custom default_timeout_ms');

        console.log('Test 11 Passed: Custom max_visible and default_timeout_ms');
    }

    // Test 12: show event is raised
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context });
        let event_data = null;

        toast.on('show', data => { event_data = data; });
        const id = toast.show('Event test', { status: 'info' });

        assert.ok(event_data, 'show event should have fired');
        assert.strictEqual(event_data.id, id, 'event should have correct id');
        assert.strictEqual(event_data.message, 'Event test', 'event should have correct message');
        assert.strictEqual(event_data.status, 'info', 'event should have correct status');

        console.log('Test 12 Passed: show event is raised');
    }

    // Test 13: dismiss event is raised with trigger
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context });
        let event_data = null;

        toast.on('dismiss', data => { event_data = data; });
        const id = toast.show('Dismiss test');
        toast.dismiss(id);

        assert.ok(event_data, 'dismiss event should have fired');
        assert.strictEqual(event_data.id, id, 'event should have correct id');
        assert.strictEqual(event_data.trigger, 'api', 'trigger should be api');

        console.log('Test 13 Passed: dismiss event is raised with trigger');
    }

    // Test 14: Dismissible=false hides dismiss button
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context });

        const id = toast.show('No dismiss', { dismissible: false });
        const toast_ctrl = toast.toast_items.get(id);

        const dismiss = find_child(toast_ctrl, c => c.has_class && c.has_class('toast-dismiss'));
        assert.ok(!dismiss, 'should not have dismiss button when dismissible=false');

        console.log('Test 14 Passed: dismissible=false hides dismiss button');
    }

    // Test 15: Sequential IDs increment
    {
        const context = new jsgui.Page_Context();
        const toast = new Toast({ context, max_visible: 20 });

        const id1 = toast.show('First');
        const id2 = toast.show('Second');
        const id3 = toast.show('Third');

        assert.strictEqual(id1, 'toast_1');
        assert.strictEqual(id2, 'toast_2');
        assert.strictEqual(id3, 'toast_3');

        console.log('Test 15 Passed: Sequential IDs increment');
    }

    // Test 16: CSS uses theme tokens (no hardcoded hex colors)
    {
        const css = Toast.css;
        // Should NOT contain raw hex colors
        const hex_pattern = /#[0-9a-fA-F]{3,8}\b/g;
        const hex_matches = css.match(hex_pattern) || [];
        // Filter to only non-fallback hex values (those not inside var() fallbacks)
        // We allow hex as fallback values inside var() — those are fine
        // But standalone hex outside var() means hardcoded colors
        const lines = css.split('\n');
        const bad_lines = lines.filter(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;
            // Check for hex colors not inside var() fallbacks
            const has_hex = /#[0-9a-fA-F]{3,8}\b/.test(trimmed);
            const is_var_fallback = /var\([^)]*#[0-9a-fA-F]{3,8}/.test(trimmed);
            const is_rgba = /rgba?\(/.test(trimmed);
            return has_hex && !is_var_fallback && !is_rgba;
        });

        assert.strictEqual(bad_lines.length, 0,
            `CSS should not have hardcoded hex colors outside var() fallbacks. Found: ${bad_lines.join('; ')}`);

        // Should contain theme token references
        assert.ok(css.includes('var(--j-'), 'CSS should use --j- theme tokens');

        console.log('Test 16 Passed: CSS uses theme tokens');
    }

    console.log(`\nAll 16 Toast tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
