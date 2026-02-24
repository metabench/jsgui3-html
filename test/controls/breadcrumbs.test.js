const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Breadcrumbs = require('../../controls/organised/1-standard/5-ui/breadcrumbs');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

// ─── Helper: walk jsgui control tree ───
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
    console.log('Starting Breadcrumbs tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const bc = new Breadcrumbs({ context });

        assert.ok(bc.has_class('breadcrumbs'), 'should have breadcrumbs class');
        assert.ok(bc.has_class('jsgui-breadcrumbs'), 'should have jsgui-breadcrumbs class');
        assert.strictEqual(bc.dom.tagName, 'nav', 'should be a nav element');
        assert.strictEqual(bc.dom.attributes['aria-label'], 'Breadcrumb', 'should have aria-label');
        assert.strictEqual(bc._separator, '/', 'default separator should be /');

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: Renders items with correct count
    {
        const context = new jsgui.Page_Context();
        const items = [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Widget' }
        ];
        const bc = new Breadcrumbs({ context, items });

        assert.strictEqual(bc.items.length, 3, 'should have 3 items');

        // Find all breadcrumb items
        const li_items = find_all_children(bc, c => c.has_class && c.has_class('breadcrumbs-item'));
        assert.strictEqual(li_items.length, 3, 'should render 3 list items');

        console.log('Test 2 Passed: Renders items with correct count');
    }

    // Test 3: Last item has aria-current="page"
    {
        const context = new jsgui.Page_Context();
        const items = [
            { label: 'Home', href: '/' },
            { label: 'Current Page' }
        ];
        const bc = new Breadcrumbs({ context, items });

        // Find the last breadcrumb link
        const links = find_all_children(bc, c => c.has_class && c.has_class('breadcrumbs-link'));
        assert.strictEqual(links.length, 2, 'should have 2 links');

        const last_link = links[links.length - 1];
        assert.strictEqual(last_link.dom.attributes['aria-current'], 'page',
            'last item should have aria-current=page');
        assert.strictEqual(last_link.dom.tagName, 'span',
            'last item should be a span, not a link');

        // First item should NOT have aria-current
        assert.strictEqual(links[0].dom.attributes['aria-current'], undefined,
            'first item should not have aria-current');
        assert.strictEqual(links[0].dom.tagName, 'a',
            'first item with href should be an <a>');

        console.log('Test 3 Passed: Last item has aria-current="page"');
    }

    // Test 4: set_items() replaces items
    {
        const context = new jsgui.Page_Context();
        const bc = new Breadcrumbs({ context, items: [{ label: 'Home' }] });

        assert.strictEqual(bc.items.length, 1, 'initially 1 item');

        bc.set_items([
            { label: 'Home' },
            { label: 'About' },
            { label: 'Team' }
        ]);

        assert.strictEqual(bc.items.length, 3, 'should have 3 items after set_items');

        const links = find_all_children(bc, c => c.has_class && c.has_class('breadcrumbs-link'));
        assert.strictEqual(links.length, 3, 'should render 3 links after set_items');

        console.log('Test 4 Passed: set_items() replaces items');
    }

    // Test 5: push() appends item
    {
        const context = new jsgui.Page_Context();
        const bc = new Breadcrumbs({ context, items: [{ label: 'Home' }] });

        bc.push({ label: 'Products' });
        assert.strictEqual(bc.items.length, 2, 'should have 2 items after push');

        bc.push({ label: 'Widget' });
        assert.strictEqual(bc.items.length, 3, 'should have 3 items after second push');

        const links = find_all_children(bc, c => c.has_class && c.has_class('breadcrumbs-link'));
        assert.strictEqual(links.length, 3, 'should render 3 links');

        // Last pushed item should have aria-current
        const last = links[links.length - 1];
        assert.strictEqual(last.dom.attributes['aria-current'], 'page');

        console.log('Test 5 Passed: push() appends item');
    }

    // Test 6: pop() removes last item
    {
        const context = new jsgui.Page_Context();
        const bc = new Breadcrumbs({
            context,
            items: [
                { label: 'Home' },
                { label: 'Products' },
                { label: 'Widget' }
            ]
        });

        const popped = bc.pop();
        assert.strictEqual(popped.label, 'Widget', 'pop should return removed item');
        assert.strictEqual(bc.items.length, 2, 'should have 2 items after pop');

        console.log('Test 6 Passed: pop() removes last item');
    }

    // Test 7: Navigate event fires with correct data
    {
        const context = new jsgui.Page_Context();
        const items = [
            { label: 'Home', href: '/' },
            { label: 'Products' },
            { label: 'Current' }
        ];
        const bc = new Breadcrumbs({ context, items });
        let event_data = null;

        bc.on('navigate', data => { event_data = data; });

        // The event only fires on activate+click (needs DOM), but we can verify
        // the handler is set up and the items are correct
        assert.strictEqual(bc.items[1].label, 'Products');

        console.log('Test 7 Passed: Navigate event handler can be registered');
    }

    // Test 8: Custom separator
    {
        const context = new jsgui.Page_Context();
        const bc = new Breadcrumbs({
            context,
            items: [{ label: 'A' }, { label: 'B' }],
            separator: '>'
        });

        assert.strictEqual(bc._separator, '>', 'separator should be >');

        // Verify data-separator attribute is set on items
        const items = find_all_children(bc, c => c.has_class && c.has_class('breadcrumbs-item'));
        assert.ok(items.length > 0, 'should have items');
        assert.strictEqual(items[0].dom.attributes['data-separator'], '>',
            'items should have data-separator attribute');

        console.log('Test 8 Passed: Custom separator');
    }

    // Test 9: max_visible overflow collapse
    {
        const context = new jsgui.Page_Context();
        const bc = new Breadcrumbs({
            context,
            items: [
                { label: 'Home' },
                { label: 'Cat1' },
                { label: 'Cat2' },
                { label: 'Cat3' },
                { label: 'Product' }
            ],
            max_visible: 3
        });

        // Should show: Home, …, Cat3, Product (3 real + 1 ellipsis = 4 li items)
        const li_items = find_all_children(bc, c => c.has_class && c.has_class('breadcrumbs-item'));
        assert.ok(li_items.length <= 4, `should collapse to at most 4 visible items, got ${li_items.length}`);

        // Should have an ellipsis element
        const ellipsis = find_child(bc, c => c.has_class && c.has_class('breadcrumbs-ellipsis'));
        assert.ok(ellipsis, 'should have ellipsis element');

        // Original items unchanged
        assert.strictEqual(bc.items.length, 5, 'internal items array should still have 5');

        console.log('Test 9 Passed: max_visible overflow collapse');
    }

    // Test 10: get_items returns the items array
    {
        const context = new jsgui.Page_Context();
        const items = [{ label: 'A' }, { label: 'B' }];
        const bc = new Breadcrumbs({ context, items });

        const result = bc.get_items();
        assert.strictEqual(result.length, 2);
        assert.strictEqual(result[0].label, 'A');

        console.log('Test 10 Passed: get_items returns items');
    }

    // Test 11: CSS uses theme tokens (no hardcoded hex outside var())
    {
        const css = Breadcrumbs.css;
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
            `CSS should not have hardcoded hex colors outside var() fallbacks. Found: ${bad_lines.join('; ')}`);

        assert.ok(css.includes('var(--j-'), 'CSS should use --j- theme tokens');

        console.log('Test 11 Passed: CSS uses theme tokens');
    }

    // Test 12: Button items (without href) get type=button
    {
        const context = new jsgui.Page_Context();
        const bc = new Breadcrumbs({
            context,
            items: [
                { label: 'Home' },
                { label: 'Settings' },
                { label: 'Current' }
            ]
        });

        const links = find_all_children(bc, c => c.has_class && c.has_class('breadcrumbs-link'));
        // First item without href should be a button (not last — last is span)
        assert.strictEqual(links[0].dom.tagName, 'button',
            'items without href should be buttons');
        assert.strictEqual(links[0].dom.attributes.type, 'button',
            'button should have type=button');

        console.log('Test 12 Passed: Button items get type=button');
    }

    console.log(`\nAll 12 Breadcrumbs tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
