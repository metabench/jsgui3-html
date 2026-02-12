/**
 * Comprehensive QC check — verifies all completed controls render correctly.
 * Tests: class names, HTML output, basic structure.
 *
 * Run: node tmp/qc-check.js
 */
const jsgui = require('../html-core/html-core');
const controls = require('../controls/controls');
const ctx = new jsgui.Page_Context();

const checks = [];
function ok(label, val) { checks.push({ label, pass: !!val }); }
function fail(label, detail) { checks.push({ label, pass: false, detail }); }

// ── Core Controls ──
console.log('\n━━━ CORE CONTROLS ━━━');

// Badge
try {
    const Badge = controls.Badge;
    const b = new Badge({ context: ctx, variant: 'primary', text: 'New' });
    const html = b.html;
    ok('Badge renders', html.length > 0);
    ok('Badge has jsgui-badge class', html.includes('jsgui-badge'));
    ok('Badge has data-variant', html.includes('data-variant'));
} catch (e) { fail('Badge', e.message); }

// Chip
try {
    const Chip = controls.Chip;
    const c = new Chip({ context: ctx, label: 'JavaScript' });
    const html = c.html;
    ok('Chip renders', html.length > 0);
    ok('Chip has jsgui-chip class', html.includes('jsgui-chip'));
} catch (e) { fail('Chip', e.message); }

// Spinner
try {
    const Spinner = controls.Spinner;
    const s = new Spinner({ context: ctx });
    const html = s.html;
    ok('Spinner renders', html.length > 0);
    ok('Spinner has jsgui-spinner class', html.includes('jsgui-spinner'));
} catch (e) { fail('Spinner', e.message); }

// Avatar
try {
    const Avatar = controls.Avatar;
    const a = new Avatar({ context: ctx, initials: 'JD', size: 'md' });
    const html = a.html;
    ok('Avatar renders', html.length > 0);
    ok('Avatar has jsgui-avatar class', html.includes('jsgui-avatar'));
} catch (e) { fail('Avatar', e.message); }

// Search_Bar
try {
    const Search_Bar = controls.Search_Bar;
    const sb = new Search_Bar({ context: ctx, placeholder: 'Search...' });
    const html = sb.html;
    ok('Search_Bar renders', html.length > 0);
    ok('Search_Bar has jsgui-search-bar class', html.includes('jsgui-search-bar'));
} catch (e) { fail('Search_Bar', e.message); }

// Skeleton_Loader
try {
    const Skeleton_Loader = controls.Skeleton_Loader;
    const sl = new Skeleton_Loader({ context: ctx, variant: 'text', line_count: 3 });
    const html = sl.html;
    ok('Skeleton_Loader renders', html.length > 0);
    ok('Skeleton_Loader has jsgui-skeleton class', html.includes('jsgui-skeleton'));
} catch (e) { fail('Skeleton_Loader', e.message); }

// ── Form Controls ──
console.log('\n━━━ FORM CONTROLS ━━━');

// Progress_Bar
try {
    const Progress_Bar = controls.Progress_Bar;
    const pb = new Progress_Bar({ context: ctx, value: 65, max: 100 });
    const html = pb.html;
    ok('Progress_Bar renders', html.length > 0);
    ok('Progress_Bar has jsgui-progress class', html.includes('jsgui-progress'));
} catch (e) { fail('Progress_Bar', e.message); }

// Rating_Stars
try {
    const Rating_Stars = controls.Rating_Stars;
    const rs = new Rating_Stars({ context: ctx, value: 3.5, max: 5 });
    const html = rs.html;
    ok('Rating_Stars renders', html.length > 0);
    ok('Rating_Stars has jsgui-rating class', html.includes('jsgui-rating'));
} catch (e) { fail('Rating_Stars', e.message); }

// Toggle_Switch
try {
    const Toggle_Switch = controls.Toggle_Switch;
    const ts = new Toggle_Switch({ context: ctx });
    const html = ts.html;
    ok('Toggle_Switch renders', html.length > 0);
    ok('Toggle_Switch has toggle class', html.includes('toggle'));
} catch (e) { fail('Toggle_Switch', e.message); }

// Horizontal_Slider
try {
    const Slider = controls.Horizontal_Slider;
    const sl = new Slider({ context: ctx, min: 0, max: 100, value: 50 });
    const html = sl.html;
    ok('Horizontal_Slider renders', html.length > 0);
} catch (e) { fail('Horizontal_Slider', e.message); }

// ── Layout & Navigation ──
console.log('\n━━━ LAYOUT & NAVIGATION ━━━');

// Tabbed_Panel
try {
    const Tabbed_Panel = controls.Tabbed_Panel;
    const tp = new Tabbed_Panel({ context: ctx, tabs: [{ id: 't1', label: 'Tab 1' }] });
    const html = tp.html;
    ok('Tabbed_Panel renders', html.length > 0);
    ok('Tabbed_Panel has jsgui-tabs class', html.includes('jsgui-tabs'));
} catch (e) { fail('Tabbed_Panel', e.message); }

// Breadcrumbs
try {
    const Breadcrumbs = controls.Breadcrumbs;
    const bc = new Breadcrumbs({ context: ctx, items: [{ label: 'Home' }, { label: 'Page' }] });
    const html = bc.html;
    ok('Breadcrumbs renders', html.length > 0);
    ok('Breadcrumbs has jsgui-breadcrumbs class', html.includes('jsgui-breadcrumbs'));
} catch (e) { fail('Breadcrumbs', e.message); }

// Accordion
try {
    const Accordion = controls.Accordion;
    const acc = new Accordion({ context: ctx, sections: [{ title: 'Section 1', content: 'Content' }] });
    const html = acc.html;
    ok('Accordion renders', html.length > 0);
    ok('Accordion has jsgui-accordion class', html.includes('jsgui-accordion'));
} catch (e) { fail('Accordion', e.message); }

// Modal
try {
    const Modal = controls.Modal;
    const m = new Modal({ context: ctx, title: 'Test Modal' });
    const html = m.html;
    ok('Modal renders', html.length > 0);
    ok('Modal has jsgui-modal class', html.includes('jsgui-modal'));
} catch (e) { fail('Modal', e.message); }

// Sidebar_Nav
try {
    const Sidebar_Nav = controls.Sidebar_Nav;
    const sn = new Sidebar_Nav({ context: ctx, items: [{ label: 'Dashboard', icon: '📊' }] });
    const html = sn.html;
    ok('Sidebar_Nav renders', html.length > 0);
    ok('Sidebar_Nav has jsgui-sidebar-nav class', html.includes('jsgui-sidebar-nav'));
} catch (e) { fail('Sidebar_Nav', e.message); }

// Wizard
try {
    const Wizard = controls.Wizard;
    const wiz = new Wizard({ context: ctx, steps: [{ id: 's1', title: 'Step 1' }, { id: 's2', title: 'Step 2' }] });
    const html = wiz.html;
    ok('Wizard renders', html.length > 0);
    ok('Wizard has jsgui-wizard class', html.includes('jsgui-wizard'));
    ok('Wizard has step dots', html.includes('wizard-step-dot'));
    ok('Wizard has panels', html.includes('wizard-panel'));
} catch (e) { fail('Wizard', e.message); }

// Split_Pane
try {
    const Split_Pane = controls.Split_Pane;
    const sp = new Split_Pane({ context: ctx });
    const html = sp.html;
    ok('Split_Pane renders', html.length > 0);
} catch (e) { fail('Split_Pane', e.message); }

// ── Data Controls ──
console.log('\n━━━ DATA CONTROLS ━━━');

// Data_Table
try {
    const Data_Table = controls.Data_Table;
    const dt = new Data_Table({ context: ctx, columns: [{ key: 'name', label: 'Name' }], data: [{ name: 'Test' }] });
    const html = dt.html;
    ok('Data_Table renders', html.length > 0);
    ok('Data_Table has jsgui-data-table class', html.includes('jsgui-data-table'));
} catch (e) { fail('Data_Table', e.message); }

// Inline_Cell_Edit
try {
    const Inline_Cell_Edit = controls.Inline_Cell_Edit;
    const ice = new Inline_Cell_Edit({ context: ctx, value: 'Test', type: 'text' });
    const html = ice.html;
    ok('Inline_Cell_Edit renders', html.length > 0);
    ok('Inline_Cell_Edit has inline-cell-edit class', html.includes('inline-cell-edit'));
} catch (e) { fail('Inline_Cell_Edit', e.message); }

// ── Charts ──
console.log('\n━━━ CHARTS ━━━');

// Bar_Chart
try {
    const Bar_Chart = controls.Bar_Chart;
    const bc = new Bar_Chart({ context: ctx, data: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] });
    const html = bc.html;
    ok('Bar_Chart renders', html.length > 0);
    ok('Bar_Chart has jsgui-bar-chart class', html.includes('jsgui-bar-chart'));
} catch (e) { fail('Bar_Chart', e.message); }

// Pie_Chart
try {
    const Pie_Chart = controls.Pie_Chart;
    const pc = new Pie_Chart({ context: ctx, data: [{ label: 'A', value: 30 }, { label: 'B', value: 70 }] });
    const html = pc.html;
    ok('Pie_Chart renders', html.length > 0);
    ok('Pie_Chart has jsgui-pie-chart class', html.includes('jsgui-pie-chart'));
} catch (e) { fail('Pie_Chart', e.message); }

// Sparkline
try {
    const Sparkline = controls.Sparkline;
    const sp = new Sparkline({ context: ctx, data: [1, 3, 2, 5, 4] });
    const html = sp.html;
    ok('Sparkline renders', html.length > 0);
    ok('Sparkline has jsgui-sparkline class', html.includes('jsgui-sparkline'));
} catch (e) { fail('Sparkline', e.message); }

// Area_Chart (NEW)
try {
    const Area_Chart = controls.Area_Chart;
    const ac = new Area_Chart({
        context: ctx, data: [
            { label: 'Jan', value: 10 }, { label: 'Feb', value: 25 },
            { label: 'Mar', value: 18 }, { label: 'Apr', value: 35 },
            { label: 'May', value: 28 }, { label: 'Jun', value: 42 }
        ]
    });
    const html = ac.html;
    ok('Area_Chart renders', html.length > 0);
    ok('Area_Chart has jsgui-area-chart class', html.includes('jsgui-area-chart'));
    ok('Area_Chart has SVG', html.includes('<svg'));
    ok('Area_Chart has gradient fill', html.includes('area-grad'));
    ok('Area_Chart has line path', html.includes('area-chart-line'));
    ok('Area_Chart has grid', html.includes('area-chart-grid'));
    ok('Area_Chart has y-axis', html.includes('area-chart-y-axis'));
    ok('Area_Chart has x-axis labels', html.includes('area-chart-x-axis'));
} catch (e) { fail('Area_Chart', e.message); }

// Gauge (NEW)
try {
    const Gauge = controls.Gauge;
    const g = new Gauge({ context: ctx, value: 72, min: 0, max: 100, unit: '%' });
    const html = g.html;
    ok('Gauge renders', html.length > 0);
    ok('Gauge has jsgui-gauge class', html.includes('jsgui-gauge'));
    ok('Gauge has SVG', html.includes('<svg'));
    ok('Gauge has track arc', html.includes('gauge-track'));
    ok('Gauge has fill arc', html.includes('gauge-fill'));
    ok('Gauge has value text', html.includes('72%'));
    ok('Gauge has min label', html.includes('>0<'));
    ok('Gauge has max label', html.includes('>100<'));
} catch (e) { fail('Gauge', e.message); }

// Gauge with thresholds
try {
    const Gauge = controls.Gauge;
    const g = new Gauge({
        context: ctx, value: 85, max: 100, show_ticks: true,
        thresholds: [
            { value: 0, color: '#10b981' },
            { value: 60, color: '#f59e0b' },
            { value: 80, color: '#ef4444' }
        ]
    });
    const html = g.html;
    ok('Gauge with thresholds renders', html.length > 0);
    ok('Gauge threshold uses correct color', html.includes('#ef4444'));
    ok('Gauge has tick marks', html.includes('gauge-ticks'));
} catch (e) { fail('Gauge thresholds', e.message); }

// ── Viewers ──
console.log('\n━━━ VIEWERS ━━━');

// Markdown_Viewer
try {
    const Markdown_Viewer = controls.Markdown_Viewer;
    const md = new Markdown_Viewer({ context: ctx, markdown: '# Hello\n\nThis is **bold** text.' });
    const html = md.html;
    ok('Markdown_Viewer renders', html.length > 0);
    ok('Markdown_Viewer has jsgui-markdown-viewer class', html.includes('jsgui-markdown-viewer'));
    ok('Markdown_Viewer renders h1', html.includes('<h1'));
    ok('Markdown_Viewer renders bold', html.includes('<strong'));
} catch (e) { fail('Markdown_Viewer', e.message); }

// Color_Picker
try {
    const Color_Picker = controls.Color_Picker;
    const cp = new Color_Picker({ context: ctx });
    const html = cp.html;
    ok('Color_Picker renders', html.length > 0);
    ok('Color_Picker has color-picker class', html.includes('color-picker'));
} catch (e) { fail('Color_Picker', e.message); }

// Rich_Text_Editor
try {
    const Rich_Text_Editor = controls.Rich_Text_Editor;
    const rte = new Rich_Text_Editor({ context: ctx });
    const html = rte.html;
    ok('Rich_Text_Editor renders', html.length > 0);
    ok('Rich_Text_Editor has jsgui-rte class', html.includes('jsgui-rte'));
} catch (e) { fail('Rich_Text_Editor', e.message); }

// ── Admin Controls ──
console.log('\n━━━ ADMIN CONTROLS ━━━');

// Admin_Theme
try {
    const Admin_Theme = controls.Admin_Theme;
    ok('Admin_Theme loads', !!Admin_Theme);
    ok('Admin_Theme has css', Admin_Theme.css.length > 100);
    ok('Admin_Theme has 4 themes', Admin_Theme.themes.length >= 4);
    ok('Admin_Theme css has vs-default', Admin_Theme.css.includes('--admin-bg'));
    ok('Admin_Theme css has vs-dark', Admin_Theme.css.includes('vs-dark'));
} catch (e) { fail('Admin_Theme', e.message); }

// Stat_Card
try {
    const Stat_Card = controls.Stat_Card;
    const sc = new Stat_Card({ context: ctx, label: 'Active Users', value: '1,234', trend: 'up', trend_value: '+12%', icon: '👤', theme: 'vs-dark' });
    const html = sc.html;
    ok('Stat_Card renders', html.length > 0);
    ok('Stat_Card has class', html.includes('jsgui-stat-card'));
    ok('Stat_Card has value', html.includes('1,234'));
    ok('Stat_Card has label', html.includes('Active Users'));
    ok('Stat_Card has trend arrow', html.includes('↑'));
    ok('Stat_Card has icon', html.includes('👤'));
    ok('Stat_Card has theme attr', html.includes('data-admin-theme'));
} catch (e) { fail('Stat_Card', e.message); }

// Log_Viewer
try {
    const Log_Viewer = controls.Log_Viewer;
    const lv = new Log_Viewer({
        context: ctx, title: 'Server Logs', entries: [
            { message: 'Server started', level: 'info', timestamp: '12:00:00' },
            { message: 'Connection failed', level: 'error', timestamp: '12:01:00' },
            { message: 'Retrying...', level: 'warn', timestamp: '12:01:05' }
        ]
    });
    const html = lv.html;
    ok('Log_Viewer renders', html.length > 0);
    ok('Log_Viewer has class', html.includes('jsgui-log-viewer'));
    ok('Log_Viewer has entries', html.includes('log-entry'));
    ok('Log_Viewer has line numbers', html.includes('log-entry-ln'));
    ok('Log_Viewer has error entry', html.includes('log-entry-error'));
    ok('Log_Viewer has toolbar', html.includes('log-viewer-toolbar'));
    ok('Log_Viewer has title', html.includes('Server Logs'));
    ok('Log_Viewer has count', html.includes('3 entries'));
    ok('Log_Viewer has timestamps', html.includes('12:00:00'));
} catch (e) { fail('Log_Viewer', e.message); }

// Log_Viewer empty state
try {
    const Log_Viewer = controls.Log_Viewer;
    const lv = new Log_Viewer({ context: ctx });
    const html = lv.html;
    ok('Log_Viewer empty state', html.includes('log-viewer-empty'));
} catch (e) { fail('Log_Viewer empty', e.message); }

// Key_Value_Table with badges and title
try {
    const Key_Value_Table = controls.Key_Value_Table;
    const kvt = new Key_Value_Table({
        context: ctx,
        title: 'Server Config',
        subtitle: 'Runtime settings',
        show_header: true,
        data: [
            { key: 'Host', value: 'localhost' },
            { key: 'Port', value: '3000' },
            { key: 'Env', value: 'production', badge: 'LIVE', badge_variant: 'success' }
        ],
        theme: 'vs-dark'
    });
    const html = kvt.html;
    ok('Key_Value_Table renders', html.length > 0);
    ok('Key_Value_Table has class', html.includes('jsgui-kv-table'));
    ok('Key_Value_Table has title bar', html.includes('kv-title-bar'));
    ok('Key_Value_Table has title', html.includes('Server Config'));
    ok('Key_Value_Table has subtitle', html.includes('Runtime settings'));
    ok('Key_Value_Table has header', html.includes('kv-header'));
    ok('Key_Value_Table has keys', html.includes('Host'));
    ok('Key_Value_Table has values', html.includes('localhost'));
    ok('Key_Value_Table has badge', html.includes('kv-badge'));
    ok('Key_Value_Table has badge variant', html.includes('kv-badge-success'));
    ok('Key_Value_Table has theme attr', html.includes('data-admin-theme'));
    ok('Key_Value_Table has striped rows', html.includes('kv-row-striped'));
} catch (e) { fail('Key_Value_Table', e.message); }

// Key_Value_Table object shorthand
try {
    const Key_Value_Table = controls.Key_Value_Table;
    const kvt = new Key_Value_Table({ context: ctx, data: { a: '1', b: '2', c: '3' }, compact: true });
    const html = kvt.html;
    ok('Key_Value_Table object data', html.includes('a') && html.includes('1'));
    ok('Key_Value_Table compact class', html.includes('kv-compact'));
} catch (e) { fail('Key_Value_Table compact', e.message); }

// Data_Table theme support
try {
    const Data_Table = controls.Data_Table;
    const dt = new Data_Table({ context: ctx, columns: [{ key: 'name', label: 'Name' }], data: [{ name: 'Test' }], theme: 'vs-dark', bordered: true });
    const html = dt.html;
    ok('Data_Table has theme attr', html.includes('data-admin-theme'));
    ok('Data_Table has bordered class', html.includes('data-table-bordered'));
} catch (e) { fail('Data_Table theme', e.message); }

// ── Report ──
console.log('\n━━━━━━━━━━━━━━━━━━━━━');
const passed = checks.filter(c => c.pass).length;
const failed = checks.filter(c => !c.pass).length;
checks.forEach(c => console.log(`  ${c.pass ? '✓' : '✗'} ${c.label}${c.detail ? ' — ' + c.detail : ''}`));
console.log(`\n  ${passed} passed, ${failed} failed out of ${checks.length} checks`);

if (failed > 0) {
    console.log('\n  FAILURES:');
    checks.filter(c => !c.pass).forEach(c => console.log(`    ✗ ${c.label}: ${c.detail || 'assertion failed'}`));
}

console.log(failed === 0 ? '\n=== ALL PASS ✓ ===' : '\n=== SOME FAILED ✗ ===');
process.exit(failed > 0 ? 1 : 0);
