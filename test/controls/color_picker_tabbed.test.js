'use strict';

const assert = require('assert');
const Color_Value = require('../../html-core/Color_Value');
const Color_Picker_Tabbed = require('../../controls/organised/0-core/0-basic/1-compositional/color-picker-tabbed');

// ── Tests ──

function test_load() {
    assert.strictEqual(typeof Color_Picker_Tabbed, 'function');
    assert.ok(Color_Picker_Tabbed.VARIANTS, 'has VARIANTS');
    assert.ok(Color_Picker_Tabbed.MODE_META, 'has MODE_META');
    assert.ok(Color_Picker_Tabbed.css, 'has static CSS');
    console.log('  ✓ loads with static props');
}

function test_default_variant() {
    const cpt = new Color_Picker_Tabbed({ value: '#ff0000' });
    assert.strictEqual(cpt.hex, '#ff0000', 'hex getter');
    const modes = Object.keys(cpt._mode_controls);
    assert.deepStrictEqual(modes, ['spectrum', 'swatches', 'hex'], 'standard modes');
    assert.ok(cpt._tabbed_panel, 'has Tabbed_Panel');
    assert.ok(cpt._preview_bar, 'has preview bar (standard)');
    assert.ok(cpt._action_bar, 'has action bar (standard)');
    console.log('  ✓ default (standard) variant');
}

function test_compact_variant() {
    const cpt = new Color_Picker_Tabbed({ variant: 'compact', value: '#00ff00' });
    const modes = Object.keys(cpt._mode_controls);
    assert.deepStrictEqual(modes, ['swatches'], 'compact has only swatches');
    assert.ok(cpt._preview_bar, 'compact has preview (default true)');
    assert.ok(!cpt._action_bar, 'compact has no actions');
    console.log('  ✓ compact variant');
}

function test_full_variant() {
    const cpt = new Color_Picker_Tabbed({ variant: 'full' });
    const modes = Object.keys(cpt._mode_controls);
    assert.deepStrictEqual(modes, ['spectrum', 'wheel', 'sliders', 'swatches', 'hex', 'named'], 'full has all 6 modes');
    assert.ok(cpt._action_bar, 'full has actions');
    console.log('  ✓ full variant');
}

function test_developer_variant() {
    const cpt = new Color_Picker_Tabbed({ variant: 'developer' });
    const modes = Object.keys(cpt._mode_controls);
    assert.deepStrictEqual(modes, ['spectrum', 'sliders', 'hex'], 'developer modes');
    assert.ok(!cpt._action_bar, 'developer no actions');
    console.log('  ✓ developer variant');
}

function test_designer_variant() {
    const cpt = new Color_Picker_Tabbed({ variant: 'designer' });
    const modes = Object.keys(cpt._mode_controls);
    assert.deepStrictEqual(modes, ['wheel', 'spectrum', 'named'], 'designer modes');
    assert.ok(cpt._action_bar, 'designer has actions');
    console.log('  ✓ designer variant');
}

function test_inline_variant() {
    const cpt = new Color_Picker_Tabbed({ variant: 'inline' });
    const modes = Object.keys(cpt._mode_controls);
    assert.deepStrictEqual(modes, ['spectrum', 'hex'], 'inline modes');
    assert.ok(!cpt._action_bar, 'inline no actions');
    console.log('  ✓ inline variant');
}

function test_custom_modes() {
    const cpt = new Color_Picker_Tabbed({ modes: ['hex', 'sliders'] });
    const modes = Object.keys(cpt._mode_controls);
    assert.deepStrictEqual(modes, ['hex', 'sliders'], 'custom mode override');
    console.log('  ✓ custom modes override');
}

function test_api_surface() {
    const cpt = new Color_Picker_Tabbed({ value: '#ff0000' });

    // Getters
    assert.strictEqual(cpt.hex, '#ff0000');
    assert.strictEqual(cpt.h, 0);
    assert.strictEqual(cpt.s, 100);
    assert.strictEqual(cpt.l, 50);
    assert.strictEqual(cpt.alpha, 1);
    assert.deepStrictEqual(cpt.rgb, { r: 255, g: 0, b: 0 });
    assert.deepStrictEqual(cpt.hsl, { h: 0, s: 100, l: 50 });

    // set_value
    cpt.set_value('#00ff00');
    assert.strictEqual(cpt.hex, '#00ff00');

    // set_hsl
    cpt.set_hsl(240, 100, 50);
    assert.strictEqual(cpt.hex, '#0000ff');

    // set_alpha
    cpt.set_alpha(0.5);
    assert.strictEqual(cpt.alpha, 0.5);

    // color_model
    assert.ok(cpt.color_model instanceof Color_Value, 'color_model exposed');

    console.log('  ✓ API surface (getters + setters)');
}

function test_shared_color_value() {
    const cpt = new Color_Picker_Tabbed({ variant: 'full', value: '#ff0000' });
    const color_model = cpt.color_model;

    // All mode controls should share the same Color_Value
    for (const [mode, ctrl] of Object.entries(cpt._mode_controls)) {
        assert.strictEqual(ctrl.color, color_model, `${mode} shares Color_Value`);
    }

    // Mutating via API should reflect in mode controls
    cpt.set_value('#0000ff');
    assert.strictEqual(color_model.hex, '#0000ff', 'model updated');

    console.log('  ✓ shared Color_Value across modes');
}

function test_no_preview() {
    const cpt = new Color_Picker_Tabbed({ show_preview: false });
    assert.ok(!cpt._preview_bar, 'no preview when disabled');
    console.log('  ✓ show_preview: false');
}

function test_output_format() {
    const cpt = new Color_Picker_Tabbed({ value: '#ff0000', output_format: 'rgb' });
    assert.strictEqual(cpt.value, 'rgb(255, 0, 0)', 'output in rgb format');

    const cpt2 = new Color_Picker_Tabbed({ value: '#ff0000', output_format: 'hsl' });
    assert.strictEqual(cpt2.value, 'hsl(0, 100%, 50%)', 'output in hsl format');

    console.log('  ✓ output_format');
}

function run() {
    console.log('Color_Picker_Tabbed tests\n');

    console.log('Loading:');
    test_load();

    console.log('\nVariants:');
    test_default_variant();
    test_compact_variant();
    test_full_variant();
    test_developer_variant();
    test_designer_variant();
    test_inline_variant();
    test_custom_modes();

    console.log('\nAPI:');
    test_api_surface();
    test_shared_color_value();
    test_no_preview();
    test_output_format();

    console.log('\n✅ All Color_Picker_Tabbed tests passed!');
}

run();
