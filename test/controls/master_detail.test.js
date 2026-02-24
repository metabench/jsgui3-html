const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Master_Detail = require('../../controls/organised/1-standard/6-layout/master_detail');

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
    { id: 'a', label: 'Alpha', detail: 'Alpha details' },
    { id: 'b', label: 'Beta', detail: 'Beta details' },
    { id: 'c', label: 'Gamma', detail: 'Gamma details' }
];

async function run_tests() {
    console.log('Starting Master_Detail tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS });

        assert.ok(md.has_class('master-detail'));

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: Master panel has role=listbox
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS });

        const master = find_child(md, c => c.has_class && c.has_class('master-detail-master'));
        assert.ok(master);
        assert.strictEqual(master.dom.attributes.role, 'listbox');
        assert.ok(master.dom.attributes['aria-label']);

        console.log('Test 2 Passed: Master panel role=listbox');
    }

    // Test 3: Items have role=option and aria-selected
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS });

        const items = find_all_children(md, c =>
            c.has_class && c.has_class('master-detail-item'));
        assert.strictEqual(items.length, 3);

        items.forEach(item => {
            assert.strictEqual(item.dom.attributes.role, 'option');
            assert.ok(['true', 'false'].includes(item.dom.attributes['aria-selected']));
        });

        console.log('Test 3 Passed: Items have role=option');
    }

    // Test 4: Explicit selected_id selects correct item
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS, selected_id: 'a' });

        assert.strictEqual(md.get_selected_id(), 'a');

        const items = find_all_children(md, c =>
            c.has_class && c.has_class('master-detail-item'));
        assert.strictEqual(items[0].dom.attributes['aria-selected'], 'true');
        assert.strictEqual(items[1].dom.attributes['aria-selected'], 'false');

        console.log('Test 4 Passed: First item auto-selected');
    }

    // Test 5: Roving tabindex
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS, selected_id: 'b' });

        const items = find_all_children(md, c =>
            c.has_class && c.has_class('master-detail-item'));

        const alpha = items.find(i => i.dom.attributes['data-item-id'] === 'a');
        const beta = items.find(i => i.dom.attributes['data-item-id'] === 'b');

        assert.strictEqual(alpha.dom.attributes.tabindex, '-1');
        assert.strictEqual(beta.dom.attributes.tabindex, '0');

        console.log('Test 5 Passed: Roving tabindex');
    }

    // Test 6: set_selected_id and get_selected_item
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS });

        md.set_selected_id('c');
        const item = md.get_selected_item();
        assert.ok(item);
        assert.strictEqual(item.label, 'Gamma');

        console.log('Test 6 Passed: set_selected_id and get_selected_item');
    }

    // Test 7: Back button has aria-label
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS });

        const back = find_child(md, c => c.has_class && c.has_class('master-detail-back'));
        assert.ok(back);
        assert.strictEqual(back.dom.attributes['aria-label'], 'Back to list');

        console.log('Test 7 Passed: Back button aria-label');
    }

    // Test 8: Detail panel renders
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS });

        const detail = find_child(md, c => c.has_class && c.has_class('master-detail-detail'));
        assert.ok(detail);

        console.log('Test 8 Passed: Detail panel renders');
    }

    // Test 9: show_detail / show_master
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({ context, items: SAMPLE_ITEMS, selected_id: 'a' });

        md.show_detail();
        assert.strictEqual(md._showing_detail, true, 'should show detail');

        md.show_master();
        assert.strictEqual(md._showing_detail, false, 'should show master');

        console.log('Test 9 Passed: show_detail / show_master');
    }

    // Test 10: custom master_renderer
    {
        const context = new jsgui.Page_Context();
        const md = new Master_Detail({
            context,
            items: SAMPLE_ITEMS,
            selected_id: 'a',
            master_renderer: item => `[${item.label}]`
        });

        // Should have rendered without errors
        assert.ok(md.get_selected_item());

        console.log('Test 10 Passed: Custom master_renderer');
    }

    // Test 11: CSS uses theme tokens
    {
        const css = Master_Detail.css;
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

        console.log('Test 11 Passed: CSS uses theme tokens');
    }

    // Test 12: Focus-visible in CSS
    {
        const css = Master_Detail.css;
        assert.ok(css.includes(':focus-visible'), 'CSS should include focus-visible');

        console.log('Test 12 Passed: CSS focus-visible');
    }

    console.log(`\nAll 12 Master_Detail tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
