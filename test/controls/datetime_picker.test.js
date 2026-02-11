const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const DateTime_Picker = require('../../controls/organised/0-core/0-basic/1-compositional/datetime-picker');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

// ── Tests ──

function test_parse_datetime_iso() {
    const p1 = DateTime_Picker.parse_datetime('2026-02-11T14:30');
    assert.strictEqual(p1.date.getFullYear(), 2026);
    assert.strictEqual(p1.date.getMonth(), 1); // 0-based
    assert.strictEqual(p1.date.getDate(), 11);
    assert.strictEqual(p1.time_str, '14:30');

    const p2 = DateTime_Picker.parse_datetime('2025-12-25T09:05:30');
    assert.strictEqual(p2.date.getFullYear(), 2025);
    assert.strictEqual(p2.date.getMonth(), 11);
    assert.strictEqual(p2.time_str, '09:05:30');

    console.log('Test 1 Passed: parse_datetime ISO');
}

function test_parse_datetime_date_only() {
    const p = DateTime_Picker.parse_datetime('2026-06-15');
    assert.strictEqual(p.date.getFullYear(), 2026);
    assert.strictEqual(p.date.getMonth(), 5);
    assert.strictEqual(p.date.getDate(), 15);
    assert.strictEqual(p.time_str, '12:00'); // default noon

    console.log('Test 2 Passed: parse_datetime date-only');
}

function test_parse_datetime_invalid() {
    const p = DateTime_Picker.parse_datetime('not-a-date');
    // Should return current date
    assert.ok(p.date instanceof Date);
    assert.ok(p.time_str.includes(':'));

    console.log('Test 3 Passed: parse_datetime invalid');
}

function test_default_instantiation() {
    const context = new jsgui.Page_Context();
    const dtp = new DateTime_Picker({ context });

    assert.ok(dtp.has_class('datetime-picker'));
    assert.ok(dtp.has_class('dtp-layout-stacked'));
    assert.ok(dtp._month_view, 'Should have Month_View');
    assert.ok(dtp._time_picker, 'Should have Time_Picker');
    assert.ok(dtp._header, 'Should have header');
    assert.ok(!dtp._tabs, 'No tabs in stacked layout');

    console.log('Test 4 Passed: Default Instantiation');
}

function test_custom_value() {
    const context = new jsgui.Page_Context();
    const dtp = new DateTime_Picker({
        context,
        value: '2026-02-11T14:30',
    });

    assert.strictEqual(dtp.date.getFullYear(), 2026);
    assert.strictEqual(dtp.date.getMonth(), 1);
    assert.strictEqual(dtp.date.getDate(), 11);
    assert.strictEqual(dtp.hours, 14);
    assert.strictEqual(dtp.minutes, 30);
    assert.ok(dtp.value.startsWith('2026-02-11T14:30'));

    console.log('Test 5 Passed: Custom Value');
}

function test_layout_side_by_side() {
    const context = new jsgui.Page_Context();
    const dtp = new DateTime_Picker({
        context,
        layout: 'side-by-side',
    });

    assert.ok(dtp.has_class('dtp-layout-side-by-side'));

    console.log('Test 6 Passed: Side-by-side Layout');
}

function test_layout_tabbed() {
    const context = new jsgui.Page_Context();
    const dtp = new DateTime_Picker({
        context,
        layout: 'tabbed',
    });

    assert.ok(dtp.has_class('dtp-layout-tabbed'));
    assert.ok(dtp._tabs, 'Should have tab buttons');
    assert.ok(dtp._tab_date, 'Should have date tab');
    assert.ok(dtp._tab_time, 'Should have time tab');

    console.log('Test 7 Passed: Tabbed Layout');
}

function test_set_date() {
    const context = new jsgui.Page_Context();
    const dtp = new DateTime_Picker({ context });

    dtp.set_date(2030, 5, 15); // June 15, 2030
    assert.strictEqual(dtp.date.getFullYear(), 2030);
    assert.strictEqual(dtp.date.getMonth(), 5);
    assert.strictEqual(dtp.date.getDate(), 15);

    console.log('Test 8 Passed: set_date');
}

function test_set_time() {
    const context = new jsgui.Page_Context();
    const dtp = new DateTime_Picker({ context });

    dtp.set_time(9, 45);
    assert.strictEqual(dtp.hours, 9);
    assert.strictEqual(dtp.minutes, 45);

    console.log('Test 9 Passed: set_time');
}

function test_datetime_getter() {
    const context = new jsgui.Page_Context();
    const dtp = new DateTime_Picker({
        context,
        value: '2026-03-15T16:30',
    });

    const dt = dtp.datetime;
    assert.ok(dt instanceof Date);
    assert.strictEqual(dt.getFullYear(), 2026);
    assert.strictEqual(dt.getMonth(), 2);
    assert.strictEqual(dt.getDate(), 15);
    assert.strictEqual(dt.getHours(), 16);
    assert.strictEqual(dt.getMinutes(), 30);

    console.log('Test 10 Passed: datetime getter');
}

async function run_tests() {
    console.log('Starting DateTime_Picker tests...');

    test_parse_datetime_iso();
    test_parse_datetime_date_only();
    test_parse_datetime_invalid();
    test_default_instantiation();
    test_custom_value();
    test_layout_side_by_side();
    test_layout_tabbed();
    test_set_date();
    test_set_time();
    test_datetime_getter();

    console.log('All DateTime_Picker tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
