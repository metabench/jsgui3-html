const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Time_Picker = require('../../controls/organised/0-core/0-basic/1-compositional/time-picker');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

// ── Tests ──

function test_parse_time_24h() {
    const p1 = Time_Picker.parse_time('14:30');
    assert.strictEqual(p1.hours, 14);
    assert.strictEqual(p1.minutes, 30);
    assert.strictEqual(p1.seconds, 0);

    const p2 = Time_Picker.parse_time('09:05:42');
    assert.strictEqual(p2.hours, 9);
    assert.strictEqual(p2.minutes, 5);
    assert.strictEqual(p2.seconds, 42);

    console.log('Test 1 Passed: parse_time 24h');
}

function test_parse_time_12h() {
    const p1 = Time_Picker.parse_time('2:30 PM');
    assert.strictEqual(p1.hours, 14);
    assert.strictEqual(p1.minutes, 30);

    const p2 = Time_Picker.parse_time('12:00 AM');
    assert.strictEqual(p2.hours, 0);

    const p3 = Time_Picker.parse_time('12:00 PM');
    assert.strictEqual(p3.hours, 12);

    console.log('Test 2 Passed: parse_time 12h AM/PM');
}

function test_parse_time_invalid() {
    const p = Time_Picker.parse_time('garbage');
    assert.strictEqual(p.hours, 12);
    assert.strictEqual(p.minutes, 0);

    const p2 = Time_Picker.parse_time(null);
    assert.strictEqual(p2.hours, 12);

    console.log('Test 3 Passed: parse_time invalid');
}

function test_default_instantiation() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context });

    assert.ok(tp.has_class('time-picker'));
    assert.strictEqual(tp.hours, 12);
    assert.strictEqual(tp.minutes, 0);
    assert.strictEqual(tp.value, '12:00');
    assert.ok(tp._clock_wrap, 'Should have clock');
    assert.ok(tp._display_wrap, 'Should have display');
    assert.ok(!tp._spinners_wrap, 'No spinners by default');
    assert.ok(!tp._presets_wrap, 'No presets by default');
    assert.ok(!tp._am_pm_btn, 'No AM/PM in 24h mode');

    console.log('Test 4 Passed: Default Instantiation');
}

function test_custom_config() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({
        context,
        value: '09:30:15',
        show_clock: false,
        show_seconds: true,
        show_spinners: true,
        show_presets: true,
        use_24h: false,
        clock_style: 'classic',
        step_minutes: 5,
    });

    assert.strictEqual(tp.hours, 9);
    assert.strictEqual(tp.minutes, 30);
    assert.strictEqual(tp.seconds, 15);
    assert.strictEqual(tp.value, '09:30:15');
    assert.ok(!tp._clock_wrap, 'No clock');
    assert.ok(tp._spinners_wrap, 'Has spinners');
    assert.ok(tp._presets_wrap, 'Has presets');
    assert.ok(tp._am_pm_btn, 'Has AM/PM in 12h mode');

    console.log('Test 5 Passed: Custom Config');
}

function test_set_time() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context });

    tp.set_time(15, 45, 30);
    assert.strictEqual(tp.hours, 15);
    assert.strictEqual(tp.minutes, 45);
    assert.strictEqual(tp.value, '15:45');

    console.log('Test 6 Passed: set_time');
}

function test_set_value() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context });

    tp.set_value('08:15');
    assert.strictEqual(tp.hours, 8);
    assert.strictEqual(tp.minutes, 15);
    assert.strictEqual(tp.value, '08:15');

    console.log('Test 7 Passed: set_value');
}

function test_display_value_12h() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context, value: '14:30', use_24h: false });

    assert.strictEqual(tp.display_value, '2:30 PM');
    assert.ok(tp.is_pm);
    assert.ok(!tp.is_am);

    const tp2 = new Time_Picker({ context, value: '09:15', use_24h: false });
    assert.strictEqual(tp2.display_value, '9:15 AM');
    assert.ok(tp2.is_am);

    console.log('Test 8 Passed: display_value 12h');
}

function test_toggle_am_pm() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context, value: '09:00' });

    assert.strictEqual(tp.hours, 9);
    tp.toggle_am_pm();
    assert.strictEqual(tp.hours, 21);
    tp.toggle_am_pm();
    assert.strictEqual(tp.hours, 9);

    console.log('Test 9 Passed: toggle_am_pm');
}

function test_increment_hours() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context, value: '23:00' });

    tp.increment_hours(1);
    assert.strictEqual(tp.hours, 0); // wraps around

    tp.increment_hours(-1);
    assert.strictEqual(tp.hours, 23);

    console.log('Test 10 Passed: increment_hours');
}

function test_increment_minutes() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context, value: '10:55' });

    tp.increment_minutes(5);
    // Minutes should wrap → hours should increment
    assert.strictEqual(tp.minutes, 0);
    assert.strictEqual(tp.hours, 11);

    console.log('Test 11 Passed: increment_minutes');
}

function test_step_minutes() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context, value: '10:07', step_minutes: 15 });

    // Minutes should snap to nearest 15: round(7/15)=0 → 0
    assert.strictEqual(tp.minutes, 0);

    tp.set_time(10, 22);
    assert.strictEqual(tp.minutes, 15); // round(22/15)=1 → 15

    tp.set_time(10, 38);
    assert.strictEqual(tp.minutes, 45); // round(38/15)=3 → 45

    console.log('Test 12 Passed: step_minutes snapping');
}

function test_show_seconds() {
    const context = new jsgui.Page_Context();
    const tp = new Time_Picker({ context, value: '14:30:45', show_seconds: true });

    assert.strictEqual(tp.value, '14:30:45');
    assert.strictEqual(tp.seconds, 45);

    console.log('Test 13 Passed: show_seconds');
}

async function run_tests() {
    console.log('Starting Time_Picker tests...');

    test_parse_time_24h();
    test_parse_time_12h();
    test_parse_time_invalid();
    test_default_instantiation();
    test_custom_config();
    test_set_time();
    test_set_value();
    test_display_value_12h();
    test_toggle_am_pm();
    test_increment_hours();
    test_increment_minutes();
    test_step_minutes();
    test_show_seconds();

    console.log('All Time_Picker tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
