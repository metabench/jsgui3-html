const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Toolbar = require('../../controls/organised/1-standard/5-ui/Toolbar');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

// ─── Helper: walk jsgui control tree ───
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
    console.log('Starting Toolbar tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        assert.ok(tb.has_class('jsgui-toolbar'), 'should have jsgui-toolbar class');
        assert.strictEqual(tb.dom.attributes.role, 'toolbar', 'should have role=toolbar');
        assert.strictEqual(tb.dom.attributes['aria-orientation'], 'horizontal',
            'default orientation should be horizontal');
        assert.ok(tb.has_class('toolbar-horizontal'), 'should have horizontal class');

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: Vertical orientation
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context, orientation: 'vertical' });

        assert.strictEqual(tb._orientation, 'vertical');
        assert.strictEqual(tb.dom.attributes['aria-orientation'], 'vertical');
        assert.ok(tb.has_class('toolbar-vertical'));

        console.log('Test 2 Passed: Vertical orientation');
    }

    // Test 3: addButton creates button with correct structure
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        const btn = tb.addButton({
            id: 'save',
            icon: '💾',
            label: 'Save',
            tooltip: 'Save document'
        });

        assert.ok(btn, 'addButton should return a control');
        assert.ok(btn.has_class('toolbar-button'), 'button should have toolbar-button class');
        assert.strictEqual(btn.dom.attributes.title, 'Save document', 'should have tooltip');
        assert.strictEqual(btn.dom.attributes['data-toolbar-id'], 'save', 'should have data id');
        assert.strictEqual(tb.items.length, 1, 'should have 1 item');

        console.log('Test 3 Passed: addButton creates button');
    }

    // Test 4: Roving tabindex — first button gets tabindex=0, rest get -1
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        const btn1 = tb.addButton({ id: 'a', label: 'A' });
        const btn2 = tb.addButton({ id: 'b', label: 'B' });
        const btn3 = tb.addButton({ id: 'c', label: 'C' });

        assert.strictEqual(btn1.dom.attributes.tabindex, '0',
            'first button should have tabindex=0');
        assert.strictEqual(btn2.dom.attributes.tabindex, '-1',
            'second button should have tabindex=-1');
        assert.strictEqual(btn3.dom.attributes.tabindex, '-1',
            'third button should have tabindex=-1');

        console.log('Test 4 Passed: Roving tabindex');
    }

    // Test 5: Toggle button has aria-pressed
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        const toggle_off = tb.addButton({ id: 'bold', label: 'B', toggle: true });
        const toggle_on = tb.addButton({ id: 'italic', label: 'I', toggle: true, pressed: true });

        assert.strictEqual(toggle_off.dom.attributes['aria-pressed'], 'false',
            'unpressed toggle should have aria-pressed=false');
        assert.strictEqual(toggle_on.dom.attributes['aria-pressed'], 'true',
            'pressed toggle should have aria-pressed=true');

        console.log('Test 5 Passed: Toggle button aria-pressed');
    }

    // Test 6: Disabled button
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        const btn = tb.addButton({ id: 'delete', label: 'Delete', disabled: true });

        assert.strictEqual(btn.dom.attributes.disabled, '', 'should have disabled attribute');
        assert.strictEqual(btn.dom.attributes['aria-disabled'], 'true',
            'should have aria-disabled=true');

        console.log('Test 6 Passed: Disabled button');
    }

    // Test 7: set_item_disabled toggles disabled state
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        const btn = tb.addButton({ id: 'undo', label: 'Undo' });
        assert.strictEqual(btn.dom.attributes.disabled, undefined, 'initially not disabled');

        tb.set_item_disabled('undo', true);
        assert.strictEqual(btn.dom.attributes.disabled, '', 'should be disabled');
        assert.strictEqual(btn.dom.attributes['aria-disabled'], 'true');

        tb.set_item_disabled('undo', false);
        assert.strictEqual(btn.dom.attributes.disabled, undefined, 'should be enabled again');
        assert.strictEqual(btn.dom.attributes['aria-disabled'], undefined);

        console.log('Test 7 Passed: set_item_disabled');
    }

    // Test 8: set_item_pressed changes pressed state
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        tb.addButton({ id: 'bold', label: 'B', toggle: true });
        const entry = tb._item_configs.find(e => e.config.id === 'bold');

        assert.strictEqual(entry.ctrl.dom.attributes['aria-pressed'], 'false');

        tb.set_item_pressed('bold', true);
        assert.strictEqual(entry.ctrl.dom.attributes['aria-pressed'], 'true');

        tb.set_item_pressed('bold', false);
        assert.strictEqual(entry.ctrl.dom.attributes['aria-pressed'], 'false');

        console.log('Test 8 Passed: set_item_pressed');
    }

    // Test 9: addSeparator has role=separator
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        const sep = tb.addSeparator();
        assert.ok(sep.has_class('toolbar-separator'));
        assert.strictEqual(sep.dom.attributes.role, 'separator', 'should have role=separator');
        assert.strictEqual(sep.dom.attributes['aria-orientation'], 'vertical',
            'horizontal toolbar separator should have vertical orientation');

        console.log('Test 9 Passed: Separator has role and orientation');
    }

    // Test 10: addSpacer creates flexible space
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        const spacer = tb.addSpacer();
        assert.ok(spacer.has_class('toolbar-spacer'));
        assert.strictEqual(tb.items.length, 1);

        console.log('Test 10 Passed: addSpacer');
    }

    // Test 11: clear removes all items
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        tb.addButton({ id: 'a', label: 'A' });
        tb.addSeparator();
        tb.addButton({ id: 'b', label: 'B' });

        assert.strictEqual(tb.items.length, 3);

        tb.clear();
        assert.strictEqual(tb.items.length, 0, 'items should be empty after clear');
        assert.strictEqual(tb._item_configs.length, 0, 'configs should be empty after clear');

        console.log('Test 11 Passed: clear');
    }

    // Test 12: addControl wraps custom control
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        const custom = new jsgui.Control({ context });
        tb.addControl(custom);

        assert.ok(custom.has_class('toolbar-item'));
        assert.strictEqual(tb.items.length, 1);

        console.log('Test 12 Passed: addControl');
    }

    // Test 13: Icon has aria-hidden
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context });

        tb.addButton({ id: 'zoom', icon: '🔍' });

        const icon = find_child(tb, c =>
            c.has_class && c.has_class('toolbar-button-icon'));
        assert.ok(icon, 'should have icon control');
        assert.strictEqual(icon.dom.attributes['aria-hidden'], 'true',
            'icon should be aria-hidden');

        console.log('Test 13 Passed: Icon aria-hidden');
    }

    // Test 14: CSS uses theme tokens
    {
        const css = Toolbar.css;
        const lines = css.split('\n');
        const bad_lines = lines.filter(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;
            const has_hex = /#[0-9a-fA-F]{3,8}\b/.test(trimmed);
            const is_var_fallback = /var\([^)]*#[0-9a-fA-F]{3,8}/.test(trimmed);
            const is_rgba = /rgba?\(/.test(trimmed);
            return has_hex && !is_var_fallback && !is_rgba;
        });

        assert.strictEqual(bad_lines.length, 0,
            `CSS should not have hardcoded hex outside var() fallbacks. Found: ${bad_lines.join('; ')}`);
        assert.ok(css.includes('var(--j-'), 'CSS should use --j- tokens');

        console.log('Test 14 Passed: CSS uses theme tokens');
    }

    // Test 15: Vertical separator orientation is horizontal
    {
        const context = new jsgui.Page_Context();
        const tb = new Toolbar({ context, orientation: 'vertical' });

        const sep = tb.addSeparator();
        assert.strictEqual(sep.dom.attributes['aria-orientation'], 'horizontal',
            'vertical toolbar separator should have horizontal orientation');

        console.log('Test 15 Passed: Vertical separator orientation');
    }

    console.log(`\nAll 15 Toolbar tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
