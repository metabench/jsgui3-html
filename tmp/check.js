// tmp/check.js — Verify all new controls load from controls registry
const controls = require('../controls/controls');
const checks = [];
function ok(label, val) { checks.push({ label, pass: !!val }); }

const expected = [
    'Sidebar_Nav', 'Wizard', 'Inline_Cell_Edit', 'Markdown_Viewer',
    'Bar_Chart', 'Pie_Chart', 'Sparkline',
    // Also verify previously-added controls still export
    'Accordion', 'Rating_Stars', 'Color_Picker', 'Rich_Text_Editor',
    'Data_Table', 'Tree_View', 'Split_Pane', 'Modal', 'Window',
    'Tabbed_Panel', 'Breadcrumbs', 'Badge', 'Chip', 'Toast',
    'Tooltip', 'Search_Bar', 'Skeleton_Loader', 'Spinner', 'Avatar',
    'File_Upload', 'Slider', 'Progress_Bar'
];

expected.forEach(name => {
    try {
        const ctrl = controls[name];
        ok(`export: ${name}`, typeof ctrl === 'function');
    } catch (e) {
        ok(`export: ${name} (ERROR: ${e.message})`, false);
    }
});

// Quick instantiation test for new controls
const jsgui = require('../html-core/html-core');
const ctx = new jsgui.Page_Context();

try {
    const nav = new controls.Sidebar_Nav({ context: ctx, items: [{ id: 'a', label: 'A' }] });
    ok('instantiate: Sidebar_Nav', nav.html.includes('sidebar-nav'));
} catch (e) { ok('instantiate: Sidebar_Nav ERROR', false); }

try {
    const wiz = new controls.Wizard({ context: ctx, steps: [{ title: 'S1' }] });
    ok('instantiate: Wizard', wiz.html.includes('wizard'));
} catch (e) { ok('instantiate: Wizard ERROR', false); }

try {
    const bar = new controls.Bar_Chart({ context: ctx, data: [{ label: 'A', value: 10 }] });
    ok('instantiate: Bar_Chart', bar.html.includes('bar-chart'));
} catch (e) { ok('instantiate: Bar_Chart ERROR', false); }

try {
    const pie = new controls.Pie_Chart({ context: ctx, data: [{ label: 'A', value: 50 }] });
    ok('instantiate: Pie_Chart', pie.html.includes('pie-chart'));
} catch (e) { ok('instantiate: Pie_Chart ERROR', false); }

try {
    const spark = new controls.Sparkline({ context: ctx, data: [1, 2, 3, 4, 5] });
    ok('instantiate: Sparkline', spark.html.includes('sparkline'));
} catch (e) { ok('instantiate: Sparkline ERROR', false); }

try {
    const ice = new controls.Inline_Cell_Edit({ context: ctx, value: 'test' });
    ok('instantiate: Inline_Cell_Edit', ice.html.includes('inline-cell-edit'));
} catch (e) { ok('instantiate: Inline_Cell_Edit ERROR', false); }

try {
    const md = new controls.Markdown_Viewer({ context: ctx, markdown: '# Hi' });
    ok('instantiate: Markdown_Viewer', md.html.includes('markdown-viewer'));
} catch (e) { ok('instantiate: Markdown_Viewer ERROR', false); }

// Report
checks.forEach(c => console.log((c.pass ? '  ✓' : '  ✗') + ' ' + c.label));
const all = checks.every(c => c.pass);
console.log(`\n${checks.filter(c => c.pass).length}/${checks.length} pass`);
console.log(all ? '\n=== ALL PASS ✓ ===' : '\n=== SOME FAILED ✗ ===');
process.exit(all ? 0 : 1);
