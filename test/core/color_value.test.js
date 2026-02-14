const assert = require('assert');
const Color_Value = require('../../html-core/Color_Value');

// ── Static utility tests (same coverage as existing color_picker.test.js) ──

function test_hsl_to_rgb() {
    assert.deepStrictEqual(Color_Value.hsl_to_rgb(0, 1, 0.5), [255, 0, 0], 'Red');
    assert.deepStrictEqual(Color_Value.hsl_to_rgb(120, 1, 0.5), [0, 255, 0], 'Green');
    assert.deepStrictEqual(Color_Value.hsl_to_rgb(240, 1, 0.5), [0, 0, 255], 'Blue');
    assert.deepStrictEqual(Color_Value.hsl_to_rgb(0, 0, 1), [255, 255, 255], 'White');
    assert.deepStrictEqual(Color_Value.hsl_to_rgb(0, 0, 0), [0, 0, 0], 'Black');
    console.log('  ✓ hsl_to_rgb');
}

function test_rgb_to_hsl() {
    assert.deepStrictEqual(Color_Value.rgb_to_hsl(255, 0, 0), [0, 100, 50], 'Red');
    assert.deepStrictEqual(Color_Value.rgb_to_hsl(0, 255, 0), [120, 100, 50], 'Green');
    assert.deepStrictEqual(Color_Value.rgb_to_hsl(0, 0, 255), [240, 100, 50], 'Blue');
    const [h, s, l] = Color_Value.rgb_to_hsl(128, 128, 128);
    assert.strictEqual(h, 0, 'Gray hue');
    assert.strictEqual(s, 0, 'Gray saturation');
    assert.strictEqual(l, 50, 'Gray lightness');
    console.log('  ✓ rgb_to_hsl');
}

function test_hex_to_rgb() {
    assert.deepStrictEqual(Color_Value.hex_to_rgb('#ff0000'), [255, 0, 0]);
    assert.deepStrictEqual(Color_Value.hex_to_rgb('#00ff00'), [0, 255, 0]);
    assert.deepStrictEqual(Color_Value.hex_to_rgb('#f00'), [255, 0, 0], 'Short hex');
    console.log('  ✓ hex_to_rgb');
}

function test_rgb_to_hex() {
    assert.strictEqual(Color_Value.rgb_to_hex(255, 0, 0), '#ff0000');
    assert.strictEqual(Color_Value.rgb_to_hex(0, 255, 0), '#00ff00');
    assert.strictEqual(Color_Value.rgb_to_hex(0, 0, 0), '#000000');
    console.log('  ✓ rgb_to_hex');
}

function test_parse_color() {
    const h1 = Color_Value.parse_color('#ff0000');
    assert.strictEqual(h1.h, 0); assert.strictEqual(h1.s, 100); assert.strictEqual(h1.l, 50);

    const h2 = Color_Value.parse_color('rgb(0, 255, 0)');
    assert.strictEqual(h2.h, 120);

    const h3 = Color_Value.parse_color('hsl(240, 100%, 50%)');
    assert.strictEqual(h3.h, 240); assert.strictEqual(h3.s, 100);

    const h4 = Color_Value.parse_color('not-a-color');
    assert.strictEqual(h4.h, 0); assert.strictEqual(h4.a, 1);

    // Named color
    const h5 = Color_Value.parse_color('red');
    assert.strictEqual(h5.h, 0); assert.strictEqual(h5.s, 100);

    console.log('  ✓ parse_color');
}

// ── Constructor tests ──

function test_constructor_hex() {
    const cv = new Color_Value('#ff0000');
    assert.strictEqual(cv.h, 0);
    assert.strictEqual(cv.s, 100);
    assert.strictEqual(cv.l, 50);
    assert.strictEqual(cv.alpha, 1);
    assert.strictEqual(cv.hex, '#ff0000');
    console.log('  ✓ constructor (hex)');
}

function test_constructor_object() {
    const cv = new Color_Value({ h: 120, s: 100, l: 50, a: 0.5 });
    assert.strictEqual(cv.h, 120);
    assert.strictEqual(cv.alpha, 0.5);
    assert.strictEqual(cv.hex, '#00ff00');
    console.log('  ✓ constructor (object)');
}

function test_constructor_default() {
    const cv = new Color_Value();
    assert.strictEqual(cv.h, 217);
    assert.strictEqual(cv.alpha, 1);
    console.log('  ✓ constructor (default)');
}

function test_constructor_named() {
    const cv = new Color_Value('red');
    assert.strictEqual(cv.hex, '#ff0000');

    const cv2 = new Color_Value('navy');
    assert.strictEqual(cv2.hex, '#000080');

    console.log('  ✓ constructor (named color)');
}

// ── Getter tests ──

function test_rgb_getter() {
    const cv = new Color_Value('#ff8000');
    const { r, g, b } = cv.rgb;
    assert.ok(r > 200, 'Red should be high');
    assert.ok(g > 100 && g < 140, 'Green should be mid');
    assert.strictEqual(b, 0, 'Blue should be 0');
    console.log('  ✓ rgb getter');
}

function test_hsl_getter() {
    const cv = new Color_Value('#3b82f6');
    const { h, s, l } = cv.hsl;
    assert.ok(h >= 210 && h <= 220, `Hue ~217, got ${h}`);
    assert.ok(s >= 85 && s <= 95, `Sat ~91, got ${s}`);
    assert.ok(l >= 55 && l <= 65, `Light ~60, got ${l}`);
    console.log('  ✓ hsl getter');
}

function test_css_getter() {
    const cv = new Color_Value('#ff0000');
    assert.strictEqual(cv.css, '#ff0000');
    console.log('  ✓ css getter');
}

// ── Setter tests ──

function test_set_hex() {
    const cv = new Color_Value('#000000');
    cv.set_hex('#00ff00');
    assert.strictEqual(cv.hex, '#00ff00');
    assert.strictEqual(cv.h, 120);
    console.log('  ✓ set_hex');
}

function test_set_rgb() {
    const cv = new Color_Value('#000000');
    cv.set_rgb(0, 0, 255);
    assert.strictEqual(cv.hex, '#0000ff');
    assert.strictEqual(cv.h, 240);
    console.log('  ✓ set_rgb');
}

function test_set_hsl() {
    const cv = new Color_Value('#000000');
    cv.set_hsl(120, 100, 50);
    assert.strictEqual(cv.hex, '#00ff00');
    console.log('  ✓ set_hsl');
}

function test_set_alpha() {
    const cv = new Color_Value('#ff0000');
    cv.set_alpha(0.5);
    assert.strictEqual(cv.alpha, 0.5);
    cv.set_alpha(2);
    assert.strictEqual(cv.alpha, 1, 'Clamp to 1');
    cv.set_alpha(-1);
    assert.strictEqual(cv.alpha, 0, 'Clamp to 0');
    console.log('  ✓ set_alpha');
}

function test_set_string() {
    const cv = new Color_Value('#000000');
    cv.set('rgb(255, 0, 0)');
    assert.strictEqual(cv.hex, '#ff0000');
    cv.set('hsl(240, 100%, 50%)');
    assert.strictEqual(cv.hex, '#0000ff');
    console.log('  ✓ set (string)');
}

function test_chaining() {
    const cv = new Color_Value('#000');
    const result = cv.set_hsl(0, 100, 50).set_alpha(0.8);
    assert.strictEqual(result, cv, 'Setters should return this');
    assert.strictEqual(cv.hex, '#ff0000');
    assert.strictEqual(cv.alpha, 0.8);
    console.log('  ✓ chaining');
}

// ── Comparison ──

function test_equals() {
    const a = new Color_Value('#ff0000');
    const b = new Color_Value('#ff0000');
    const c = new Color_Value('#00ff00');

    assert.ok(a.equals(b), 'Same color should be equal');
    assert.ok(!a.equals(c), 'Different colors not equal');
    assert.ok(a.equals('#ff0000'), 'Compare with string');
    assert.ok(!a.equals(null), 'Compare with null');
    console.log('  ✓ equals');
}

// ── WCAG Accessibility ──

function test_luminance() {
    const white = new Color_Value('#ffffff');
    const black = new Color_Value('#000000');
    assert.ok(Math.abs(white.luminance() - 1) < 0.01, 'White luminance ~1');
    assert.ok(Math.abs(black.luminance() - 0) < 0.01, 'Black luminance ~0');
    console.log('  ✓ luminance');
}

function test_contrast_ratio() {
    const white = new Color_Value('#ffffff');
    const black = new Color_Value('#000000');
    const ratio = white.contrast_ratio(black);
    assert.ok(ratio > 20 && ratio < 22, `White/black contrast ~21, got ${ratio}`);

    // Same color = 1:1
    const red = new Color_Value('#ff0000');
    assert.ok(Math.abs(red.contrast_ratio(red) - 1) < 0.01, 'Same color = 1:1');
    console.log('  ✓ contrast_ratio');
}

function test_meets_aa() {
    const white = new Color_Value('#ffffff');
    const black = new Color_Value('#000000');
    assert.ok(white.meets_aa(black), 'White on black passes AA');
    assert.ok(white.meets_aa(black, 'large'), 'White on black passes AA large');

    const gray = new Color_Value('#767676');
    assert.ok(gray.meets_aa('#ffffff'), '#767676 on white barely passes AA (4.54:1)');
    console.log('  ✓ meets_aa');
}

function test_meets_aaa() {
    const white = new Color_Value('#ffffff');
    const black = new Color_Value('#000000');
    assert.ok(white.meets_aaa(black), 'White on black passes AAA');

    const lightgray = new Color_Value('#999999');
    assert.ok(!lightgray.meets_aaa('#ffffff'), '#999 on white fails AAA normal text');
    console.log('  ✓ meets_aaa');
}

// ── Formatting ──

function test_to_string() {
    const cv = new Color_Value('#ff0000');
    assert.strictEqual(cv.to_string('hex'), '#ff0000');
    assert.strictEqual(cv.to_string('rgb'), 'rgb(255, 0, 0)');
    assert.strictEqual(cv.to_string('hsl'), 'hsl(0, 100%, 50%)');

    cv.set_alpha(0.5);
    assert.strictEqual(cv.to_string('rgba'), 'rgba(255, 0, 0, 0.5)');
    assert.strictEqual(cv.to_string('hsla'), 'hsla(0, 100%, 50%, 0.5)');
    console.log('  ✓ to_string');
}

// ── Clone ──

function test_clone() {
    const cv = new Color_Value('#ff0000');
    cv.set_alpha(0.7);
    const cloned = cv.clone();
    assert.ok(cv.equals(cloned), 'Clone should equal original');
    assert.ok(cv !== cloned, 'Clone should be a different instance');

    cloned.set_hex('#00ff00');
    assert.ok(!cv.equals(cloned), 'Mutating clone should not affect original');
    assert.strictEqual(cv.hex, '#ff0000', 'Original unchanged');
    console.log('  ✓ clone');
}

// ── Observable change events ──

function test_on_change() {
    const cv = new Color_Value('#ff0000');
    const events = [];

    const unsub = cv.on_change((e) => {
        events.push(e);
    });

    cv.set_hex('#00ff00');
    assert.strictEqual(events.length, 1, 'Should fire once');
    assert.strictEqual(events[0].old.h, 0);
    assert.strictEqual(events[0].current.h, 120);

    cv.set_alpha(0.5);
    assert.strictEqual(events.length, 2, 'Should fire on alpha change');

    // No-op change should NOT fire
    cv.set_alpha(0.5);
    assert.strictEqual(events.length, 2, 'No-op should not fire');

    // Unsubscribe
    unsub();
    cv.set_hex('#0000ff');
    assert.strictEqual(events.length, 2, 'Should not fire after unsub');

    console.log('  ✓ on_change');
}

// ── Static factories ──

function test_from_hex() {
    const cv = Color_Value.from_hex('#ff0000');
    assert.strictEqual(cv.hex, '#ff0000');
    console.log('  ✓ from_hex');
}

function test_from_rgb() {
    const cv = Color_Value.from_rgb(0, 255, 0);
    assert.strictEqual(cv.hex, '#00ff00');

    const cv2 = Color_Value.from_rgb(255, 0, 0, 0.5);
    assert.strictEqual(cv2.alpha, 0.5);
    console.log('  ✓ from_rgb');
}

function test_from_hsl() {
    const cv = Color_Value.from_hsl(240, 100, 50);
    assert.strictEqual(cv.hex, '#0000ff');

    const cv2 = Color_Value.from_hsl(0, 100, 50, 0.3);
    assert.strictEqual(cv2.alpha, 0.3);
    console.log('  ✓ from_hsl');
}

function test_from_any() {
    const cv1 = Color_Value.from('#ff0000');
    assert.strictEqual(cv1.hex, '#ff0000');

    const cv2 = Color_Value.from({ h: 120, s: 100, l: 50 });
    assert.strictEqual(cv2.hex, '#00ff00');
    console.log('  ✓ from (any)');
}

// ── Edge cases ──

function test_edge_cases() {
    // Negative hue wraps
    const cv = new Color_Value({ h: -60, s: 100, l: 50 });
    assert.strictEqual(cv.h, 300, 'Negative hue wraps');

    // Hue > 360 wraps
    const cv2 = new Color_Value({ h: 480, s: 100, l: 50 });
    assert.strictEqual(cv2.h, 120, 'Hue > 360 wraps');

    // Out of range saturation clamps
    const cv3 = new Color_Value({ h: 0, s: 200, l: 50 });
    assert.strictEqual(cv3.s, 100, 'Saturation clamped to 100');

    // Out of range lightness clamps
    const cv4 = new Color_Value({ h: 0, s: 50, l: -10 });
    assert.strictEqual(cv4.l, 0, 'Lightness clamped to 0');

    console.log('  ✓ edge cases');
}

// ── Phase A: HSV ──

function test_hsv_conversions() {
    // rgb_to_hsv
    assert.deepStrictEqual(Color_Value.rgb_to_hsv(255, 0, 0), [0, 100, 100], 'Red HSV');
    assert.deepStrictEqual(Color_Value.rgb_to_hsv(0, 255, 0), [120, 100, 100], 'Green HSV');
    assert.deepStrictEqual(Color_Value.rgb_to_hsv(0, 0, 255), [240, 100, 100], 'Blue HSV');
    assert.deepStrictEqual(Color_Value.rgb_to_hsv(0, 0, 0), [0, 0, 0], 'Black HSV');
    assert.deepStrictEqual(Color_Value.rgb_to_hsv(255, 255, 255), [0, 0, 100], 'White HSV');

    // hsv_to_rgb
    assert.deepStrictEqual(Color_Value.hsv_to_rgb(0, 100, 100), [255, 0, 0], 'HSV Red→RGB');
    assert.deepStrictEqual(Color_Value.hsv_to_rgb(120, 100, 100), [0, 255, 0], 'HSV Green→RGB');
    assert.deepStrictEqual(Color_Value.hsv_to_rgb(240, 100, 100), [0, 0, 255], 'HSV Blue→RGB');
    console.log('  ✓ hsv conversions');
}

function test_hsv_getter() {
    const cv = new Color_Value('#ff0000');
    const hsv = cv.hsv;
    assert.strictEqual(hsv.h, 0);
    assert.strictEqual(hsv.s, 100);
    assert.strictEqual(hsv.v, 100);

    const cv2 = new Color_Value('#000000');
    assert.strictEqual(cv2.hsv.v, 0, 'Black value = 0');
    console.log('  ✓ hsv getter');
}

function test_set_hsv() {
    const cv = new Color_Value('#000000');
    cv.set_hsv(120, 100, 100);
    assert.strictEqual(cv.hex, '#00ff00');

    // Should fire change
    let fired = false;
    cv.on_change(() => fired = true);
    cv.set_hsv(0, 100, 100);
    assert.ok(fired, 'set_hsv should fire on_change');
    assert.strictEqual(cv.hex, '#ff0000');
    console.log('  ✓ set_hsv');
}

function test_from_hsv() {
    const cv = Color_Value.from_hsv(240, 100, 100);
    assert.strictEqual(cv.hex, '#0000ff');

    const cv2 = Color_Value.from_hsv(0, 0, 50, 0.5);
    assert.strictEqual(cv2.alpha, 0.5);
    const { r, g, b } = cv2.rgb;
    assert.ok(r === g && g === b, 'Gray from HSV S=0');
    console.log('  ✓ from_hsv');
}

function test_to_string_hsv() {
    const cv = new Color_Value('#ff0000');
    assert.strictEqual(cv.to_string('hsv'), 'hsv(0, 100%, 100%)');
    console.log('  ✓ to_string hsv');
}

// ── Phase A: Color Manipulation ──

function test_lighten_darken() {
    const cv = new Color_Value({ h: 0, s: 100, l: 50 });
    const lighter = cv.lighten(20);
    assert.strictEqual(lighter.l, 70, 'Lighten by 20');
    assert.strictEqual(cv.l, 50, 'Original unchanged');

    const darker = cv.darken(30);
    assert.strictEqual(darker.l, 20, 'Darken by 30');

    // Clamping
    const max_light = cv.lighten(200);
    assert.strictEqual(max_light.l, 100, 'Lighten clamped to 100');
    const min_dark = cv.darken(200);
    assert.strictEqual(min_dark.l, 0, 'Darken clamped to 0');
    console.log('  ✓ lighten / darken');
}

function test_saturate_desaturate() {
    const cv = new Color_Value({ h: 0, s: 50, l: 50 });
    const more = cv.saturate(30);
    assert.strictEqual(more.s, 80, 'Saturate by 30');

    const less = cv.desaturate(30);
    assert.strictEqual(less.s, 20, 'Desaturate by 30');

    // Clamping
    assert.strictEqual(cv.saturate(200).s, 100, 'Saturate clamped to 100');
    assert.strictEqual(cv.desaturate(200).s, 0, 'Desaturate clamped to 0');
    console.log('  ✓ saturate / desaturate');
}

function test_complement() {
    const cv = new Color_Value({ h: 0, s: 100, l: 50 }); // Red
    const comp = cv.complement();
    assert.strictEqual(comp.h, 180, 'Red complement = Cyan hue');
    assert.strictEqual(comp.s, 100, 'Saturation preserved');
    assert.strictEqual(comp.l, 50, 'Lightness preserved');

    const cv2 = new Color_Value({ h: 240, s: 100, l: 50 }); // Blue
    assert.strictEqual(cv2.complement().h, 60, 'Blue complement = Yellow hue');
    console.log('  ✓ complement');
}

function test_analogous() {
    const cv = new Color_Value({ h: 120, s: 100, l: 50 }); // Green
    const [a, b, c] = cv.analogous();
    assert.strictEqual(a.h, 90, 'Analogous -30°');
    assert.strictEqual(b.h, 120, 'Analogous center');
    assert.strictEqual(c.h, 150, 'Analogous +30°');
    assert.strictEqual(a.s, 100, 'Saturation preserved');
    console.log('  ✓ analogous');
}

function test_triadic() {
    const cv = new Color_Value({ h: 0, s: 100, l: 50 }); // Red
    const [a, b, c] = cv.triadic();
    assert.strictEqual(a.h, 0, 'Triadic base');
    assert.strictEqual(b.h, 120, 'Triadic +120°');
    assert.strictEqual(c.h, 240, 'Triadic +240°');
    console.log('  ✓ triadic');
}

function test_is_light_text_color() {
    const white = new Color_Value('#ffffff');
    assert.ok(white.is_light(), 'White is light');
    assert.strictEqual(white.text_color().hex, '#000000', 'Text on white = black');

    const black = new Color_Value('#000000');
    assert.ok(!black.is_light(), 'Black is not light');
    assert.strictEqual(black.text_color().hex, '#ffffff', 'Text on black = white');
    console.log('  ✓ is_light / text_color');
}

// ── Phase A: Named Colors ──

function test_from_name() {
    // Helper for ±2 per channel tolerance (HSL stores rounded integers,
    // so double conversion hex→RGB→HSL→RGB→hex can shift by up to 2)
    const hex_close = (a, b) => {
        const pa = Color_Value.hex_to_rgb(a);
        const pb = Color_Value.hex_to_rgb(b);
        return Math.abs(pa[0] - pb[0]) <= 2 &&
            Math.abs(pa[1] - pb[1]) <= 2 &&
            Math.abs(pa[2] - pb[2]) <= 2;
    };

    const coral = Color_Value.from_name('coral');
    assert.ok(hex_close(coral.hex, '#ff7f50'), `coral should be ~#ff7f50, got ${coral.hex}`);

    const cornflower = Color_Value.from_name('cornflowerblue');
    assert.ok(hex_close(cornflower.hex, '#6495ed'), `cornflowerblue should be ~#6495ed, got ${cornflower.hex}`);

    // Case-insensitive
    const rebeccapurple = Color_Value.from_name('RebeccaPurple');
    assert.ok(hex_close(rebeccapurple.hex, '#663399'), `rebeccapurple should be ~#663399, got ${rebeccapurple.hex}`);

    // Unknown throws
    assert.throws(() => Color_Value.from_name('notacolor'), /Unknown CSS color/);
    console.log('  \u2713 from_name');
}

function test_name_getter() {
    // Pure primaries should round-trip exactly
    const red = new Color_Value('#ff0000');
    assert.strictEqual(red.name, 'red');

    const white = new Color_Value('#ffffff');
    assert.strictEqual(white.name, 'white');

    const black = new Color_Value('#000000');
    assert.strictEqual(black.name, 'black');

    // Non-named color returns null
    const custom = new Color_Value('#123456');
    assert.strictEqual(custom.name, null);

    // Verify reverse lookup table is populated
    assert.ok(Object.keys(Color_Value.HEX_TO_NAME).length > 100, 'HEX_TO_NAME should have entries');
    console.log('  \u2713 name getter');
}

function test_named_colors_count() {
    const names = Object.keys(Color_Value.NAMED_COLORS);
    // CSS has 148 named colors + grey aliases = ~150+
    assert.ok(names.length >= 148, `Should have >= 148 named colors, got ${names.length}`);
    console.log('  ✓ named colors count (' + names.length + ' entries)');
}

// ── Run all ──

function run() {
    console.log('Color_Value tests\n');
    console.log('Static utilities:');
    test_hsl_to_rgb();
    test_rgb_to_hsl();
    test_hex_to_rgb();
    test_rgb_to_hex();
    test_parse_color();

    console.log('\nConstructor:');
    test_constructor_hex();
    test_constructor_object();
    test_constructor_default();
    test_constructor_named();

    console.log('\nGetters:');
    test_rgb_getter();
    test_hsl_getter();
    test_css_getter();

    console.log('\nSetters:');
    test_set_hex();
    test_set_rgb();
    test_set_hsl();
    test_set_alpha();
    test_set_string();
    test_chaining();

    console.log('\nComparison:');
    test_equals();

    console.log('\nWCAG Accessibility:');
    test_luminance();
    test_contrast_ratio();
    test_meets_aa();
    test_meets_aaa();

    console.log('\nFormatting:');
    test_to_string();

    console.log('\nClone:');
    test_clone();

    console.log('\nObservable:');
    test_on_change();

    console.log('\nFactories:');
    test_from_hex();
    test_from_rgb();
    test_from_hsl();
    test_from_any();

    console.log('\nEdge cases:');
    test_edge_cases();

    console.log('\nHSV:');
    test_hsv_conversions();
    test_hsv_getter();
    test_set_hsv();
    test_from_hsv();
    test_to_string_hsv();

    console.log('\nColor Manipulation:');
    test_lighten_darken();
    test_saturate_desaturate();
    test_complement();
    test_analogous();
    test_triadic();
    test_is_light_text_color();

    console.log('\nNamed Colors:');
    test_from_name();
    test_name_getter();
    test_named_colors_count();

    console.log('\n✅ All Color_Value tests passed!');
}

run();

