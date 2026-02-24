const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Tabbed_Panel = require('../../controls/organised/1-standard/6-layout/tabbed-panel');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

// ─── Helper ───
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

function find_all_children(ctrl, predicate) {
    const results = [];
    walk_children(ctrl, c => { if (predicate(c)) results.push(c); });
    return results;
}

async function run_tests() {
    console.log('Starting Tabbed Panel tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['Tab 1', 'Tab 2', 'Tab 3']
        });

        assert.ok(tabs.has_class('jsgui-tabs'), 'should have jsgui-tabs class');
        assert.ok(tabs.has_class('tab-container'), 'should have tab-container class');

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: Tab labels with role=tab
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['Alpha', 'Beta', 'Gamma']
        });

        const labels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-label'));

        assert.strictEqual(labels.length, 3, 'should have 3 tab labels');
        labels.forEach(label => {
            assert.strictEqual(label.dom.attributes.role, 'tab',
                'tab label should have role=tab');
        });

        console.log('Test 2 Passed: Tab labels have role=tab');
    }

    // Test 3: First tab selected by default (aria-selected, tabindex)
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['First', 'Second']
        });

        const labels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-label'));

        assert.strictEqual(labels[0].dom.attributes['aria-selected'], 'true',
            'first tab should be selected');
        assert.strictEqual(labels[0].dom.attributes.tabindex, '0',
            'first tab should have tabindex=0');
        assert.strictEqual(labels[1].dom.attributes['aria-selected'], 'false',
            'second tab should not be selected');
        assert.strictEqual(labels[1].dom.attributes.tabindex, '-1',
            'second tab should have tabindex=-1');

        console.log('Test 3 Passed: First tab selected by default');
    }

    // Test 4: Tab panels with role=tabpanel and aria-labelledby
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['One', 'Two']
        });

        const panels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-page'));

        assert.strictEqual(panels.length, 2, 'should have 2 tab panels');
        panels.forEach(panel => {
            assert.strictEqual(panel.dom.attributes.role, 'tabpanel',
                'panel should have role=tabpanel');
            assert.ok(panel.dom.attributes['aria-labelledby'],
                'panel should have aria-labelledby');
        });

        console.log('Test 4 Passed: Tab panels have correct ARIA');
    }

    // Test 5: Tab label aria-controls links to corresponding panel
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['A', 'B']
        });

        const labels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-label'));
        const panels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-page'));

        // First tab label's aria-controls should equal first panel's id
        assert.strictEqual(labels[0].dom.attributes['aria-controls'],
            panels[0].dom.attributes.id,
            'first tab aria-controls should match first panel id');

        // First panel's aria-labelledby should equal first tab's id
        assert.strictEqual(panels[0].dom.attributes['aria-labelledby'],
            labels[0].dom.attributes.id,
            'first panel aria-labelledby should match first tab id');

        console.log('Test 5 Passed: Tab/panel link via aria-controls/aria-labelledby');
    }

    // Test 6: set_active_tab_index changes selection
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['X', 'Y', 'Z']
        });

        tabs.set_active_tab_index(2);

        const labels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-label'));
        const panels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-page'));

        assert.strictEqual(labels[2].dom.attributes['aria-selected'], 'true',
            'tab 2 should be selected after set_active_tab_index(2)');
        assert.strictEqual(labels[0].dom.attributes['aria-selected'], 'false');
        assert.strictEqual(panels[2].dom.attributes['aria-hidden'], 'false',
            'panel 2 should be visible');
        assert.strictEqual(panels[0].dom.attributes['aria-hidden'], 'true',
            'panel 0 should be hidden');

        console.log('Test 6 Passed: set_active_tab_index');
    }

    // Test 7: Disabled tab
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: [
                'Normal',
                { title: 'Disabled', disabled: true }
            ]
        });

        const labels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-label'));

        const disabled_label = labels[1];
        assert.ok(disabled_label.has_class('tab-disabled'), 'disabled tab should have tab-disabled class');
        assert.strictEqual(disabled_label.dom.attributes['aria-disabled'], 'true');

        console.log('Test 7 Passed: Disabled tab');
    }

    // Test 8: Icon tabs
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: [
                { title: 'Home', icon: '🏠' },
                { title: 'Settings', icon: '⚙️' }
            ]
        });

        const icons = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-icon'));
        assert.strictEqual(icons.length, 2, 'should have 2 icons');

        console.log('Test 8 Passed: Icon tabs');
    }

    // Test 9: Badge support
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: [
                { title: 'Errors', badge: 5 },
                'Ok'
            ]
        });

        const badges = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-badge'));
        assert.strictEqual(badges.length, 1, 'should have 1 badge');

        console.log('Test 9 Passed: Badge support');
    }

    // Test 10: Closable tab has close button
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: [
                { title: 'Closable', closable: true },
                'Normal'
            ]
        });

        const close_btns = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-close'));
        assert.strictEqual(close_btns.length, 1, 'should have 1 close button');
        assert.ok(close_btns[0].dom.attributes['aria-label'],
            'close button should have aria-label');

        console.log('Test 10 Passed: Closable tab');
    }

    // Test 11: aria-label on the panel
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['A'],
            aria_label: 'Settings navigation'
        });

        assert.strictEqual(tabs.dom.attributes['aria-label'], 'Settings navigation');

        console.log('Test 11 Passed: aria-label on tabbed panel');
    }

    // Test 12: Vertical orientation
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['A', 'B'],
            tab_bar: { position: 'left' }
        });

        assert.strictEqual(tabs.dom.attributes['aria-orientation'], 'vertical');
        assert.ok(tabs.has_class('tabbed-panel-vertical'));

        console.log('Test 12 Passed: Vertical orientation');
    }

    // Test 13: CSS uses --j-* tokens, no standalone hex
    {
        const css = Tabbed_Panel.css;
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
            `CSS should not have hardcoded hex. Found: ${bad_lines.join('; ')}`);
        assert.ok(css.includes('var(--j-'), 'CSS should use --j- tokens');
        assert.ok(!css.includes('--admin-'), 'CSS should not reference --admin- tokens');

        console.log('Test 13 Passed: CSS uses theme tokens');
    }

    // Test 14: Tab page aria-hidden matches selection
    {
        const context = new jsgui.Page_Context();
        const tabs = new Tabbed_Panel({
            context,
            tabs: ['A', 'B', 'C']
        });

        const panels = find_all_children(tabs, c =>
            c.has_class && c.has_class('tab-page'));

        assert.strictEqual(panels[0].dom.attributes['aria-hidden'], 'false',
            'first panel should be visible');
        assert.strictEqual(panels[1].dom.attributes['aria-hidden'], 'true',
            'second panel should be hidden');
        assert.strictEqual(panels[2].dom.attributes['aria-hidden'], 'true',
            'third panel should be hidden');

        console.log('Test 14 Passed: Panel visibility matches selection');
    }

    console.log(`\nAll 14 Tabbed Panel tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
