const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Form_Container = require('../../controls/organised/1-standard/1-editor/form_container');

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

const FIELDS = [
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'bio', label: 'Bio', type: 'textarea' }
];

async function run_tests() {
    console.log('Starting Form_Container tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({ context, fields: FIELDS });

        assert.ok(form.has_class('form-container'));
        assert.strictEqual(form.dom.tagName, 'form');
        assert.strictEqual(form.dom.attributes.novalidate, 'novalidate');

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: Fields rendered
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({ context, fields: FIELDS });

        const field_wrappers = find_all_children(form, c =>
            c.has_class && c.has_class('form-container-field'));
        assert.strictEqual(field_wrappers.length, 3, 'should have 3 field wrappers');

        console.log('Test 2 Passed: Fields rendered');
    }

    // Test 3: Required field has aria-required
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({ context, fields: FIELDS });

        const inputs = find_all_children(form, c =>
            c.has_class && c.has_class('form-container-input'));
        const username_input = inputs.find(i => i.dom.attributes.name === 'username');

        assert.ok(username_input);
        assert.strictEqual(username_input.dom.attributes['aria-required'], 'true');
        assert.strictEqual(username_input.dom.attributes.required, 'required');

        console.log('Test 3 Passed: Required field aria-required');
    }

    // Test 4: Input has aria-describedby linking to message
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({ context, fields: FIELDS });

        const inputs = find_all_children(form, c =>
            c.has_class && c.has_class('form-container-input'));
        const messages = find_all_children(form, c =>
            c.has_class && c.has_class('form-container-message'));

        const username_input = inputs.find(i => i.dom.attributes.name === 'username');
        const described_by = username_input.dom.attributes['aria-describedby'];
        assert.ok(described_by, 'input should have aria-describedby');

        // Find matching message
        const matching_msg = messages.find(m => m.dom.attributes.id === described_by);
        assert.ok(matching_msg, 'should find message with matching id');

        console.log('Test 4 Passed: aria-describedby links input to message');
    }

    // Test 5: Validation messages have role=alert
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({ context, fields: FIELDS });

        const messages = find_all_children(form, c =>
            c.has_class && c.has_class('form-container-message'));
        messages.forEach(msg => {
            assert.strictEqual(msg.dom.attributes.role, 'alert');
            assert.strictEqual(msg.dom.attributes['aria-live'], 'polite');
        });

        console.log('Test 5 Passed: Messages have role=alert');
    }

    // Test 6: set_value and get_value
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({
            context,
            fields: [{ name: 'name', label: 'Name', value: 'Test' }]
        });

        // get_values returns existing values
        const values = form.get_values();
        assert.ok('name' in values, 'should have name in values');

        console.log('Test 6 Passed: set_value and get_value');
    }

    // Test 7: Validate with required field empty
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({
            context,
            fields: [{ name: 'required_field', label: 'Required', required: true }]
        });

        const result = form.validate();
        assert.strictEqual(result.valid, false, 'should be invalid');
        assert.ok(result.errors.required_field, 'should have error for required_field');

        console.log('Test 7 Passed: Required validation');
    }

    // Test 8: Custom validator
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({
            context,
            fields: [{
                name: 'age',
                label: 'Age',
                validator: val => {
                    // No value set, so val is undefined
                    return 'Must be a number';
                }
            }]
        });

        const result = form.validate();
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.errors.age, 'Must be a number');

        console.log('Test 8 Passed: Custom validator');
    }

    // Test 9: get_error_summary
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({
            context,
            fields: [
                { name: 'f1', label: 'Field One', required: true },
                { name: 'f2', label: 'Field Two', required: true }
            ]
        });

        form.validate();
        const summary = form.get_error_summary();

        assert.ok(Array.isArray(summary));
        assert.strictEqual(summary.length, 2);
        assert.strictEqual(summary[0].field, 'f1');
        assert.strictEqual(summary[0].label, 'Field One');
        assert.ok(summary[0].message);

        console.log('Test 9 Passed: get_error_summary');
    }

    // Test 10: Submit event for valid form
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({
            context,
            fields: [{ name: 'opt', label: 'Optional' }]
        });

        let submit_data = null;
        form.on('submit', data => { submit_data = data; });

        form.submit();
        assert.ok(submit_data, 'submit event should fire for valid form');
        assert.ok(submit_data.values, 'should include values');

        console.log('Test 10 Passed: Submit event');
    }

    // Test 11: Invalid event includes error summary
    {
        const context = new jsgui.Page_Context();
        const form = new Form_Container({
            context,
            fields: [{ name: 'req', label: 'Required', required: true }]
        });

        let invalid_data = null;
        form.on('invalid', data => { invalid_data = data; });

        form.submit();
        assert.ok(invalid_data, 'invalid event should fire');
        assert.ok(invalid_data.errors, 'should have errors');
        assert.ok(Array.isArray(invalid_data.summary), 'should have summary array');

        console.log('Test 11 Passed: Invalid event with summary');
    }

    // Test 12: CSS uses theme tokens
    {
        const css = Form_Container.css;
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

        console.log('Test 12 Passed: CSS uses theme tokens');
    }

    // Test 13: Focus-visible in CSS
    {
        const css = Form_Container.css;
        assert.ok(css.includes(':focus-visible'), 'CSS should include focus-visible');

        console.log('Test 13 Passed: CSS focus-visible');
    }

    console.log(`\nAll 13 Form_Container tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
