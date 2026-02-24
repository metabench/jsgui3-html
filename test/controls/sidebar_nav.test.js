const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Sidebar_Nav = require('../../controls/organised/1-standard/6-layout/sidebar_nav');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

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

function find_all_children(ctrl, predicate) {
    const results = [];
    const walk = c => {
        if (predicate(c)) results.push(c);
        const ch = c.content && c.content._arr;
        if (Array.isArray(ch)) ch.forEach(x => { if (x && x.dom) walk(x); });
    };
    walk(ctrl);
    return results;
}

const SAMPLE_ITEMS = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'users', label: 'Users', icon: '👥', badge: 3 },
    {
        id: 'settings', label: 'Settings', icon: '⚙️',
        items: [
            { id: 'general', label: 'General' },
            { id: 'security', label: 'Security' }
        ]
    }
];

async function run_tests() {
    console.log('Starting Sidebar_Nav tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        assert.ok(nav.has_class('jsgui-sidebar-nav'));
        assert.strictEqual(nav.dom.tagName, 'nav');
        assert.ok(nav.dom.attributes['aria-label']);

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: ARIA tree pattern — list has role=tree
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        const tree = find_child(nav, c => c.has_class && c.has_class('sidebar-list'));
        assert.ok(tree, 'should have list');
        assert.strictEqual(tree.dom.attributes.role, 'tree', 'list should have role=tree');

        console.log('Test 2 Passed: role=tree on list');
    }

    // Test 3: Links have role=treeitem
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        const links = find_all_children(nav, c =>
            c.has_class && c.has_class('sidebar-link'));

        // 3 top-level + 2 nested = 5 total
        assert.strictEqual(links.length, 5, 'should have 5 links');
        links.forEach(link => {
            assert.strictEqual(link.dom.attributes.role, 'treeitem',
                'link should have role=treeitem');
        });

        console.log('Test 3 Passed: Links have role=treeitem');
    }

    // Test 4: Group items have aria-expanded
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        const settings_link = find_child(nav, c =>
            c.has_class && c.has_class('sidebar-link') &&
            c.dom.attributes['data-nav-id'] === 'settings');
        assert.ok(settings_link);
        assert.strictEqual(settings_link.dom.attributes['aria-expanded'], 'false',
            'group should have aria-expanded=false initially');

        console.log('Test 4 Passed: Group has aria-expanded');
    }

    // Test 5: Active item has aria-current=page
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS, active_id: 'users' });

        const active_link = find_child(nav, c =>
            c.has_class && c.has_class('sidebar-link') &&
            c.dom.attributes['data-nav-id'] === 'users');
        assert.ok(active_link);
        assert.ok(active_link.has_class('is-active'), 'active link should have is-active class');
        assert.strictEqual(active_link.dom.attributes['aria-current'], 'page',
            'active link should have aria-current=page');

        console.log('Test 5 Passed: Active item aria-current=page');
    }

    // Test 6: Roving tabindex - active item gets tabindex=0, rest get -1
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS, active_id: 'home' });

        const links = find_all_children(nav, c =>
            c.has_class && c.has_class('sidebar-link'));

        const home = links.find(l => l.dom.attributes['data-nav-id'] === 'home');
        const users = links.find(l => l.dom.attributes['data-nav-id'] === 'users');

        assert.strictEqual(home.dom.attributes.tabindex, '0', 'active item tabindex=0');
        assert.strictEqual(users.dom.attributes.tabindex, '-1', 'inactive item tabindex=-1');

        console.log('Test 6 Passed: Roving tabindex');
    }

    // Test 7: Toggle collapse
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        assert.strictEqual(nav.collapsed, false, 'initially not collapsed');

        nav.toggle_collapse(true);
        assert.strictEqual(nav.collapsed, true);
        assert.strictEqual(nav._toggle_btn.dom.attributes['aria-expanded'], 'false');

        nav.toggle_collapse(false);
        assert.strictEqual(nav.collapsed, false);
        assert.strictEqual(nav._toggle_btn.dom.attributes['aria-expanded'], 'true');

        console.log('Test 7 Passed: Toggle collapse updates aria-expanded');
    }

    // Test 8: Collapse event fires
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });
        let event_data = null;

        nav.on('collapse', data => { event_data = data; });
        nav.toggle_collapse(true);

        assert.ok(event_data, 'collapse event should fire');
        assert.strictEqual(event_data.collapsed, true);

        console.log('Test 8 Passed: Collapse event');
    }

    // Test 9: Icon has aria-hidden
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        const icon = find_child(nav, c =>
            c.has_class && c.has_class('sidebar-icon'));
        assert.ok(icon);
        assert.strictEqual(icon.dom.attributes['aria-hidden'], 'true');

        console.log('Test 9 Passed: Icon aria-hidden');
    }

    // Test 10: Badge has aria-label
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        const badge = find_child(nav, c =>
            c.has_class && c.has_class('sidebar-badge'));
        assert.ok(badge);
        assert.ok(badge.dom.attributes['aria-label'], 'badge should have aria-label');

        console.log('Test 10 Passed: Badge aria-label');
    }

    // Test 11: Chevron has aria-hidden
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        const chevron = find_child(nav, c =>
            c.has_class && c.has_class('sidebar-chevron'));
        assert.ok(chevron);
        assert.strictEqual(chevron.dom.attributes['aria-hidden'], 'true');

        console.log('Test 11 Passed: Chevron aria-hidden');
    }

    // Test 12: Sublist has role=group
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        const sublist = find_child(nav, c =>
            c.has_class && c.has_class('sidebar-sublist'));
        assert.ok(sublist);
        assert.strictEqual(sublist.dom.attributes.role, 'group');

        console.log('Test 12 Passed: Sublist role=group');
    }

    // Test 13: get_active_id and _find_item
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS, active_id: 'users' });

        assert.strictEqual(nav.get_active_id(), 'users');

        const item = nav._find_item('security');
        assert.ok(item, 'should find nested item');
        assert.strictEqual(item.label, 'Security');

        console.log('Test 13 Passed: get_active_id and _find_item');
    }

    // Test 14: CSS uses theme tokens
    {
        const css = Sidebar_Nav.css;
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
        assert.ok(!css.includes('--admin-'), 'CSS should not have --admin- tokens');

        console.log('Test 14 Passed: CSS uses theme tokens');
    }

    // Test 15: Toggle button has aria-label
    {
        const context = new jsgui.Page_Context();
        const nav = new Sidebar_Nav({ context, items: SAMPLE_ITEMS });

        assert.strictEqual(nav._toggle_btn.dom.attributes['aria-label'], 'Toggle sidebar');

        console.log('Test 15 Passed: Toggle button aria-label');
    }

    console.log(`\nAll 15 Sidebar_Nav tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
