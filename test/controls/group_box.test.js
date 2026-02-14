'use strict';

const assert = require('assert');
const jsgui = require('../../html-core/html-core');
const { Control } = jsgui;
const Group_Box = require('../../controls/organised/1-standard/6-layout/group_box');

function test_basic_render() {
    const context = new jsgui.Page_Context();
    const gb = new Group_Box({ context, legend: 'Details' });
    const html = gb.html;

    assert.ok(html.includes('jsgui-group-box'), 'renders group box class');
    assert.ok(html.includes('group-box-legend'), 'renders legend');
    assert.ok(html.includes('Details'), 'renders legend text');
}

function test_constructor_nested_content() {
    const context = new jsgui.Page_Context();

    const child_a = new Control({ context, tag_name: 'span' });
    child_a.add('Child A');
    const child_b = new Control({ context, tag_name: 'span' });
    child_b.add('Child B');

    const gb = new Group_Box({
        context,
        legend: 'Nested',
        content: [child_a, [child_b, 'Tail Content']]
    });

    const html = gb.html;
    assert.ok(html.includes('Child A'), 'renders first nested child');
    assert.ok(html.includes('Child B'), 'renders second nested child');
    assert.ok(html.includes('Tail Content'), 'renders nested string content');
}

function test_add_content_array() {
    const context = new jsgui.Page_Context();
    const gb = new Group_Box({ context, legend: 'Add content' });

    gb.add_content(['One', ['Two', 'Three']]);
    const html = gb.html;

    assert.ok(html.includes('One'), 'adds first content item');
    assert.ok(html.includes('Two'), 'adds nested second content item');
    assert.ok(html.includes('Three'), 'adds nested third content item');
}

function run() {
    console.log('Group_Box tests\n');
    test_basic_render();
    console.log('  ✓ basic render');
    test_constructor_nested_content();
    console.log('  ✓ constructor nested content');
    test_add_content_array();
    console.log('  ✓ add_content array');
    console.log('\n✅ All Group_Box tests passed!');
}

run();
