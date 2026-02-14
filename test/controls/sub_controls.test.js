'use strict';

const assert = require('assert');
const Color_Value = require('../../html-core/Color_Value');

// Sub-controls
const Swatch_Grid = require('../../controls/organised/0-core/0-basic/1-compositional/swatch-grid');
const Channel_Sliders = require('../../controls/organised/0-core/0-basic/1-compositional/channel-sliders');
const Hex_Input = require('../../controls/organised/0-core/0-basic/1-compositional/hex-input');
const Gradient_Area = require('../../controls/organised/0-core/0-basic/1-compositional/gradient-area');
const HSL_Wheel = require('../../controls/organised/0-core/0-basic/1-compositional/hsl-wheel');

// ── Helpers ──

// ±2 per channel tolerance for HSL round-trip
const hex_close = (a, b) => {
    const pa = Color_Value.hex_to_rgb(a);
    const pb = Color_Value.hex_to_rgb(b);
    return Math.abs(pa[0] - pb[0]) <= 2 &&
        Math.abs(pa[1] - pb[1]) <= 2 &&
        Math.abs(pa[2] - pb[2]) <= 2;
};

// ── Tests ──

function test_all_load() {
    assert.strictEqual(typeof Swatch_Grid, 'function', 'Swatch_Grid is a constructor');
    assert.strictEqual(typeof Channel_Sliders, 'function', 'Channel_Sliders is a constructor');
    assert.strictEqual(typeof Hex_Input, 'function', 'Hex_Input is a constructor');
    assert.strictEqual(typeof Gradient_Area, 'function', 'Gradient_Area is a constructor');
    assert.strictEqual(typeof HSL_Wheel, 'function', 'HSL_Wheel is a constructor');
    console.log('  ✓ all sub-controls load');
}

function test_all_have_css() {
    assert.ok(Swatch_Grid.css, 'Swatch_Grid has static CSS');
    assert.ok(Channel_Sliders.css, 'Channel_Sliders has static CSS');
    assert.ok(Hex_Input.css, 'Hex_Input has static CSS');
    assert.ok(Gradient_Area.css, 'Gradient_Area has static CSS');
    assert.ok(HSL_Wheel.css, 'HSL_Wheel has static CSS');
    console.log('  ✓ all have static CSS');
}

function test_swatch_grid_instantiation() {
    const sg = new Swatch_Grid();
    assert.ok(sg.color instanceof Color_Value, 'has Color_Value');
    assert.ok(hex_close(sg.color.hex, '#3b82f6'), `default color: ${sg.color.hex}`);

    // Custom palette
    const sg2 = new Swatch_Grid({ palette: ['#ff0000', '#00ff00', '#0000ff'] });
    assert.ok(sg2._palette.length === 3, 'custom palette');

    // Custom value (pure primary — exact match)
    const sg3 = new Swatch_Grid({ value: '#ff0000' });
    assert.strictEqual(sg3.color.hex, '#ff0000', 'custom initial value');

    // Set color (pure primary — exact match)
    sg.color = '#00ff00';
    assert.strictEqual(sg.color.hex, '#00ff00', 'set color string');

    console.log('  ✓ Swatch_Grid instantiation');
}

function test_swatch_grid_palette_key() {
    // Test with palette_key (requires palettes.js)
    const sg = new Swatch_Grid({ palette_key: 'crayola' });
    assert.ok(sg._palette.length > 100, `palette_key loaded ${sg._palette.length} colors`);
    console.log('  ✓ Swatch_Grid palette_key');
}

function test_channel_sliders_hsl() {
    const cs = new Channel_Sliders({ value: '#ff0000' });
    assert.ok(cs.color instanceof Color_Value, 'has Color_Value');
    assert.ok(cs._sliders.h, 'has H slider');
    assert.ok(cs._sliders.s, 'has S slider');
    assert.ok(cs._sliders.l, 'has L slider');
    assert.ok(!cs._sliders.a, 'no alpha by default');
    console.log('  ✓ Channel_Sliders HSL mode');
}

function test_channel_sliders_rgb() {
    const cs = new Channel_Sliders({ value: '#ff0000', mode: 'rgb' });
    assert.ok(cs._sliders.r, 'has R slider');
    assert.ok(cs._sliders.g, 'has G slider');
    assert.ok(cs._sliders.b, 'has B slider');
    console.log('  ✓ Channel_Sliders RGB mode');
}

function test_channel_sliders_alpha() {
    const cs = new Channel_Sliders({ show_alpha: true });
    assert.ok(cs._sliders.a, 'has alpha slider');
    console.log('  ✓ Channel_Sliders alpha');
}

function test_hex_input() {
    const hi = new Hex_Input({ value: '#abcdef' });
    assert.ok(hi.color instanceof Color_Value, 'has Color_Value');
    assert.ok(hex_close(hi.color.hex, '#abcdef'), `initial value: ${hi.color.hex}`);

    // Set color
    hi.color = '#123456';
    assert.ok(hex_close(hi.color.hex, '#123456'), `set color: ${hi.color.hex}`);

    console.log('  ✓ Hex_Input');
}

function test_gradient_area() {
    const ga = new Gradient_Area({ value: '#ff0000', canvas_size: 150 });
    assert.ok(ga.color instanceof Color_Value, 'has Color_Value');
    assert.strictEqual(ga._size, 150, 'custom canvas_size');

    // Set color
    ga.color = '#00ff00';
    assert.strictEqual(ga.color.hex, '#00ff00', 'set color');

    console.log('  ✓ Gradient_Area');
}

function test_hsl_wheel() {
    const hw = new HSL_Wheel({ value: '#3b82f6', canvas_size: 200 });
    assert.ok(hw.color instanceof Color_Value, 'has Color_Value');
    assert.strictEqual(hw._size, 200, 'custom canvas_size');

    // Set color
    hw.color = '#ff6347';
    assert.ok(hex_close(hw.color.hex, '#ff6347'), `set color: ${hw.color.hex}`);

    console.log('  ✓ HSL_Wheel');
}

function test_color_mode_interface() {
    // All sub-controls should support the same interface
    const controls = [
        new Swatch_Grid({ value: '#ff0000' }),
        new Channel_Sliders({ value: '#ff0000' }),
        new Hex_Input({ value: '#ff0000' }),
        new Gradient_Area({ value: '#ff0000' }),
        new HSL_Wheel({ value: '#ff0000' })
    ];

    for (const ctrl of controls) {
        const name = ctrl.constructor.name;

        // get color
        assert.ok(ctrl.color instanceof Color_Value, `${name}.color is Color_Value`);

        // set color (string — pure primary, exact match)
        ctrl.color = '#0000ff';
        assert.strictEqual(ctrl.color.hex, '#0000ff', `${name}.color = string works`);

        // set color (Color_Value instance — pure primary, exact match)
        const cv = new Color_Value('#00ff00');
        ctrl.color = cv;
        assert.strictEqual(ctrl.color.hex, '#00ff00', `${name}.color = Color_Value works`);
    }

    console.log('  ✓ color mode interface (all 5 controls)');
}

function test_shared_color_value() {
    // Sub-controls can share a single Color_Value instance
    const shared = new Color_Value('#3b82f6');
    const sg = new Swatch_Grid({ color: shared });
    const cs = new Channel_Sliders({ color: shared });
    const hi = new Hex_Input({ color: shared });

    assert.ok(sg.color === shared, 'Swatch_Grid shares Color_Value');
    assert.ok(cs.color === shared, 'Channel_Sliders shares Color_Value');
    assert.ok(hi.color === shared, 'Hex_Input shares Color_Value');

    // Mutating the shared model reflects in all
    shared.set('#ff0000');
    assert.strictEqual(sg.color.hex, '#ff0000', 'sg sees change');
    assert.strictEqual(cs.color.hex, '#ff0000', 'cs sees change');
    assert.strictEqual(hi.color.hex, '#ff0000', 'hi sees change');

    console.log('  ✓ shared Color_Value instance');
}

function run() {
    console.log('Sub-Control tests\n');

    console.log('Loading:');
    test_all_load();
    test_all_have_css();

    console.log('\nSwatch_Grid:');
    test_swatch_grid_instantiation();
    test_swatch_grid_palette_key();

    console.log('\nChannel_Sliders:');
    test_channel_sliders_hsl();
    test_channel_sliders_rgb();
    test_channel_sliders_alpha();

    console.log('\nHex_Input:');
    test_hex_input();

    console.log('\nGradient_Area:');
    test_gradient_area();

    console.log('\nHSL_Wheel:');
    test_hsl_wheel();

    console.log('\nInterface Contract:');
    test_color_mode_interface();
    test_shared_color_value();

    console.log('\n✅ All sub-control tests passed!');
}

run();
