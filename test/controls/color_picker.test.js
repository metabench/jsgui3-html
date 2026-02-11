const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Color_Picker = require('../../controls/organised/0-core/0-basic/1-compositional/color-picker');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

// ── Utility function tests ──

function test_hsl_to_rgb() {
    // Red
    const [r, g, b] = Color_Picker.hsl_to_rgb(0, 1, 0.5);
    assert.strictEqual(r, 255);
    assert.strictEqual(g, 0);
    assert.strictEqual(b, 0);

    // Green
    const [r2, g2, b2] = Color_Picker.hsl_to_rgb(120, 1, 0.5);
    assert.strictEqual(r2, 0);
    assert.strictEqual(g2, 255);
    assert.strictEqual(b2, 0);

    // Blue
    const [r3, g3, b3] = Color_Picker.hsl_to_rgb(240, 1, 0.5);
    assert.strictEqual(r3, 0);
    assert.strictEqual(g3, 0);
    assert.strictEqual(b3, 255);

    // White
    const [r4, g4, b4] = Color_Picker.hsl_to_rgb(0, 0, 1);
    assert.strictEqual(r4, 255);
    assert.strictEqual(g4, 255);
    assert.strictEqual(b4, 255);

    // Black
    const [r5, g5, b5] = Color_Picker.hsl_to_rgb(0, 0, 0);
    assert.strictEqual(r5, 0);
    assert.strictEqual(g5, 0);
    assert.strictEqual(b5, 0);

    console.log('Test 1 Passed: hsl_to_rgb conversions');
}

function test_rgb_to_hsl() {
    // Pure red
    const [h, s, l] = Color_Picker.rgb_to_hsl(255, 0, 0);
    assert.strictEqual(h, 0);
    assert.strictEqual(s, 100);
    assert.strictEqual(l, 50);

    // Pure green
    const [h2, s2, l2] = Color_Picker.rgb_to_hsl(0, 255, 0);
    assert.strictEqual(h2, 120);
    assert.strictEqual(s2, 100);
    assert.strictEqual(l2, 50);

    // Gray
    const [h3, s3, l3] = Color_Picker.rgb_to_hsl(128, 128, 128);
    assert.strictEqual(h3, 0);
    assert.strictEqual(s3, 0);
    assert.strictEqual(l3, 50);

    console.log('Test 2 Passed: rgb_to_hsl conversions');
}

function test_hex_to_rgb() {
    assert.deepStrictEqual(Color_Picker.hex_to_rgb('#ff0000'), [255, 0, 0]);
    assert.deepStrictEqual(Color_Picker.hex_to_rgb('#00ff00'), [0, 255, 0]);
    assert.deepStrictEqual(Color_Picker.hex_to_rgb('#0000ff'), [0, 0, 255]);
    assert.deepStrictEqual(Color_Picker.hex_to_rgb('#ffffff'), [255, 255, 255]);
    assert.deepStrictEqual(Color_Picker.hex_to_rgb('#000000'), [0, 0, 0]);
    // Short hex
    assert.deepStrictEqual(Color_Picker.hex_to_rgb('#f00'), [255, 0, 0]);
    console.log('Test 3 Passed: hex_to_rgb');
}

function test_rgb_to_hex() {
    assert.strictEqual(Color_Picker.rgb_to_hex(255, 0, 0), '#ff0000');
    assert.strictEqual(Color_Picker.rgb_to_hex(0, 255, 0), '#00ff00');
    assert.strictEqual(Color_Picker.rgb_to_hex(0, 0, 255), '#0000ff');
    assert.strictEqual(Color_Picker.rgb_to_hex(255, 255, 255), '#ffffff');
    assert.strictEqual(Color_Picker.rgb_to_hex(0, 0, 0), '#000000');
    console.log('Test 4 Passed: rgb_to_hex');
}

function test_parse_color() {
    // Hex
    const h1 = Color_Picker.parse_color('#ff0000');
    assert.strictEqual(h1.h, 0);
    assert.strictEqual(h1.s, 100);
    assert.strictEqual(h1.l, 50);

    // rgb()
    const h2 = Color_Picker.parse_color('rgb(0, 255, 0)');
    assert.strictEqual(h2.h, 120);

    // hsl()
    const h3 = Color_Picker.parse_color('hsl(240, 100%, 50%)');
    assert.strictEqual(h3.h, 240);
    assert.strictEqual(h3.s, 100);
    assert.strictEqual(h3.l, 50);

    // Invalid
    const h4 = Color_Picker.parse_color('not-a-color');
    assert.strictEqual(h4.h, 0);
    assert.strictEqual(h4.a, 1);

    console.log('Test 5 Passed: parse_color');
}

// ── Control tests ──

function test_default_instantiation() {
    const context = new jsgui.Page_Context();
    const cp = new Color_Picker({ context });

    assert.ok(cp.has_class('color-picker'));
    assert.ok(cp.has_class('cp-layout-vertical'));
    // Default blue — allow ±2 per channel for HSL round-trip rounding
    const [r, g, b] = Color_Picker.hex_to_rgb(cp.hex);
    const [er, eg, eb] = Color_Picker.hex_to_rgb('#3b82f6');
    assert.ok(Math.abs(r - er) <= 2 && Math.abs(g - eg) <= 2 && Math.abs(b - eb) <= 2,
        `Default hex ${cp.hex} should be close to #3b82f6`);
    assert.ok(cp._wheel_wrap, 'Should have wheel');
    assert.ok(cp._sliders_wrap, 'Should have sliders');
    assert.ok(cp._palette_wrap, 'Should have palette');
    assert.ok(cp._hex_row, 'Should have hex input');
    assert.ok(cp._preview_wrap, 'Should have preview');
    assert.ok(!cp._rgb_row, 'Should NOT have RGB inputs by default');
    assert.ok(!cp._hsl_row, 'Should NOT have HSL inputs by default');

    console.log('Test 6 Passed: Default Instantiation');
}

function test_custom_config() {
    const context = new jsgui.Page_Context();
    const cp = new Color_Picker({
        context,
        value: '#ff0000',
        show_wheel: false,
        show_sliders: false,
        show_palette: false,
        show_hex_input: false,
        show_rgb_inputs: true,
        show_hsl_inputs: true,
        show_alpha: true,
        show_preview: false,
        layout: 'horizontal',
        output_format: 'rgb',
    });

    assert.ok(cp.has_class('cp-layout-horizontal'));
    assert.ok(!cp._wheel_wrap, 'No wheel');
    assert.ok(!cp._sliders_wrap, 'No sliders');
    assert.ok(!cp._palette_wrap, 'No palette');
    assert.ok(!cp._hex_row, 'No hex');
    assert.ok(!cp._preview_wrap, 'No preview');
    assert.ok(cp._rgb_row, 'Has RGB');
    assert.ok(cp._hsl_row, 'Has HSL');

    // Value should be red in rgb format
    assert.strictEqual(cp.value, 'rgb(255, 0, 0)');

    console.log('Test 7 Passed: Custom Config');
}

function test_set_value() {
    const context = new jsgui.Page_Context();
    const cp = new Color_Picker({ context });

    cp.set_value('#00ff00');
    assert.strictEqual(cp.h, 120);
    assert.strictEqual(cp.s, 100);
    assert.strictEqual(cp.l, 50);
    assert.strictEqual(cp.hex, '#00ff00');

    console.log('Test 8 Passed: set_value');
}

function test_set_hsl() {
    const context = new jsgui.Page_Context();
    const cp = new Color_Picker({ context });

    cp.set_hsl(240, 100, 50);
    assert.strictEqual(cp.h, 240);
    assert.strictEqual(cp.s, 100);
    assert.strictEqual(cp.l, 50);
    assert.strictEqual(cp.hex, '#0000ff');

    console.log('Test 9 Passed: set_hsl');
}

function test_set_alpha() {
    const context = new jsgui.Page_Context();
    const cp = new Color_Picker({ context, value: '#ff0000', output_format: 'rgba' });

    cp.set_alpha(0.5);
    assert.strictEqual(cp.alpha, 0.5);
    assert.strictEqual(cp.value, 'rgba(255, 0, 0, 0.5)');

    // Clamp
    cp.set_alpha(2);
    assert.strictEqual(cp.alpha, 1);
    cp.set_alpha(-1);
    assert.strictEqual(cp.alpha, 0);

    console.log('Test 10 Passed: set_alpha');
}

function test_output_formats() {
    const context = new jsgui.Page_Context();

    const hex_cp = new Color_Picker({ context, value: '#ff0000', output_format: 'hex' });
    assert.strictEqual(hex_cp.value, '#ff0000');

    const rgb_cp = new Color_Picker({ context, value: '#ff0000', output_format: 'rgb' });
    assert.strictEqual(rgb_cp.value, 'rgb(255, 0, 0)');

    const hsl_cp = new Color_Picker({ context, value: '#ff0000', output_format: 'hsl' });
    assert.strictEqual(hsl_cp.value, 'hsl(0, 100%, 50%)');

    console.log('Test 11 Passed: Output Formats');
}

function test_rgb_getter() {
    const context = new jsgui.Page_Context();
    const cp = new Color_Picker({ context, value: '#ff8000' });

    const { r, g, b } = cp.rgb;
    assert.ok(r > 200, 'Red should be high');
    assert.ok(g > 100 && g < 140, 'Green should be mid');
    assert.strictEqual(b, 0);

    console.log('Test 12 Passed: rgb getter');
}

function test_hsl_getter() {
    const context = new jsgui.Page_Context();
    const cp = new Color_Picker({ context, value: '#3b82f6' });

    const { h, s, l } = cp.hsl;
    assert.ok(h >= 210 && h <= 220, `Hue should be ~217, got ${h}`);
    assert.ok(s >= 85 && s <= 95, `Sat should be ~91, got ${s}`);
    assert.ok(l >= 55 && l <= 65, `Light should be ~60, got ${l}`);

    console.log('Test 13 Passed: hsl getter');
}

function test_custom_palette() {
    const context = new jsgui.Page_Context();
    const custom = ['#111', '#222', '#333'];
    const cp = new Color_Picker({ context, palette: custom });

    assert.strictEqual(cp._palette_colors.length, 3);

    console.log('Test 14 Passed: Custom Palette');
}

async function run_tests() {
    console.log('Starting Color_Picker tests...');

    test_hsl_to_rgb();
    test_rgb_to_hsl();
    test_hex_to_rgb();
    test_rgb_to_hex();
    test_parse_color();
    test_default_instantiation();
    test_custom_config();
    test_set_value();
    test_set_hsl();
    test_set_alpha();
    test_output_formats();
    test_rgb_getter();
    test_hsl_getter();
    test_custom_palette();

    console.log('All Color_Picker tests passed!');
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
