// Quick check what's failing for Data_Row, Horizontal_Menu, Pie_Chart, Area_Chart, Bar_Chart
const jsgui = require('../html-core/html-core');
const all_controls = require('../controls/controls');

function safe_render(name, spec) {
    try {
        const ctx = new jsgui.Page_Context();
        const C = all_controls[name];
        if (!C) return { error: 'Not in registry' };
        const ctrl = new C({ ...spec, context: ctx });
        const html = ctrl.html || '';
        return { html_len: html.length, error: null };
    } catch (e) {
        return { html_len: 0, error: e.message, stack: e.stack };
    }
}

const tests = [
    ['Data_Row', { items: ['Alice', '30', 'London'] }],
    ['Horizontal_Menu', { value: { 'File': ['New', 'Open'], 'Edit': ['Undo'] } }],
    ['Pie_Chart', { data: { labels: ['A', 'B', 'C'], series: [{ name: 'S', values: [60, 30, 10] }] }, size: [300, 300] }],
    ['Area_Chart', { data: { labels: ['Jan', 'Feb'], series: [{ name: 'R', values: [100, 150] }] }, size: [400, 250] }],
    ['Bar_Chart', { data: { labels: ['Q1', 'Q2'], series: [{ name: 'S', values: [120, 180] }] }, size: [400, 250] }],
    ['Window_Manager', {}],
];

for (const [name, spec] of tests) {
    const r = safe_render(name, spec);
    if (r.error) {
        console.log(`\n✗ ${name}: ${r.error}`);
        if (r.stack) console.log('  STACK:', r.stack.split('\n').slice(0,4).join('\n  '));
    } else {
        console.log(`✓ ${name}: ${r.html_len} chars`);
    }
}
