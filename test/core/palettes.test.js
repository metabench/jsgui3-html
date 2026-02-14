'use strict';

const assert = require('assert');
const palettes = require('../../html-core/palettes');

function test_list() {
    const list = palettes.list();
    assert.ok(Array.isArray(list), 'list() returns array');
    assert.ok(list.length >= 5, `Should have >= 5 palettes, got ${list.length}`);

    const keys = list.map(p => p.key);
    assert.ok(keys.includes('crayola_extended'), 'Has crayola_extended');
    assert.ok(keys.includes('pastels'), 'Has pastels');
    assert.ok(keys.includes('crayola_sorted'), 'Has crayola_sorted');
    assert.ok(keys.includes('crayola'), 'Has crayola');
    assert.ok(keys.includes('css_named'), 'Has css_named');

    // Every entry has key and name
    for (const entry of list) {
        assert.ok(entry.key, 'Entry has key');
        assert.ok(entry.name, 'Entry has name');
    }
    console.log('  ✓ list()');
}

function test_get() {
    const crayola = palettes.get('crayola');
    assert.ok(crayola, 'get(crayola) returns entry');
    assert.strictEqual(crayola.name, 'Crayola (Original)');
    assert.ok(Array.isArray(crayola.colors), 'colors is array');
    assert.ok(crayola.colors.length > 100, `Crayola has ${crayola.colors.length} colors`);
    assert.deepStrictEqual(crayola.grid, [12, 12]);

    const css = palettes.get('css_named');
    assert.ok(css, 'get(css_named) returns entry');
    assert.ok(css.colors.length >= 140, `CSS named has ${css.colors.length} colors`);

    // Unknown returns undefined
    assert.strictEqual(palettes.get('nonexistent'), undefined);

    console.log('  ✓ get()');
}

function test_register() {
    const custom_colors = [
        { hex: '#ff0000', name: 'Red', rgb: '(255, 0, 0)' },
        { hex: '#00ff00', name: 'Green', rgb: '(0, 255, 0)' },
        { hex: '#0000ff', name: 'Blue', rgb: '(0, 0, 255)' }
    ];

    palettes.register('test_rgb', {
        name: 'Test RGB',
        colors: custom_colors,
        grid: [3, 1]
    });

    const entry = palettes.get('test_rgb');
    assert.ok(entry, 'Registered palette exists');
    assert.strictEqual(entry.name, 'Test RGB');
    assert.strictEqual(entry.colors.length, 3);

    // Should appear in list
    const list = palettes.list();
    assert.ok(list.some(p => p.key === 'test_rgb'), 'Registered palette in list()');

    // Should appear in keys
    assert.ok(palettes.keys.includes('test_rgb'), 'Registered palette in keys');

    // Overwrite
    palettes.register('test_rgb', {
        name: 'Updated RGB',
        colors: custom_colors,
        grid: [3, 1]
    });
    assert.strictEqual(palettes.get('test_rgb').name, 'Updated RGB');

    // Validation
    assert.throws(() => palettes.register('', { name: 'X', colors: [] }), /non-empty string/);
    assert.throws(() => palettes.register('x', { name: 'X' }), /colors/);

    console.log('  ✓ register()');
}

function test_backward_compat() {
    // Direct property access still works
    assert.ok(palettes.crayola_extended, 'palettes.crayola_extended');
    assert.strictEqual(palettes.crayola_extended.name, 'Crayola Extended (144)');

    assert.ok(palettes.pastels, 'palettes.pastels');
    assert.ok(palettes.crayola_sorted, 'palettes.crayola_sorted');
    assert.ok(palettes.crayola, 'palettes.crayola');
    assert.ok(palettes.css_named, 'palettes.css_named');

    // default_key and keys still work
    assert.strictEqual(palettes.default_key, 'crayola_extended');
    assert.ok(Array.isArray(palettes.keys));
    assert.ok(palettes.keys.includes('crayola'));

    console.log('  ✓ backward compat');
}

function test_css_named_palette() {
    const css = palettes.get('css_named');
    assert.ok(css.colors.length >= 140, `CSS palette has ${css.colors.length} colors`);

    // Each entry has correct format
    for (const color of css.colors) {
        assert.ok(color.hex && color.hex.startsWith('#'), `hex starts with #: ${color.hex}`);
        assert.ok(color.name, `has name: ${color.name}`);
        assert.ok(color.rgb, `has rgb: ${color.rgb}`);
    }

    // Spot-check some well-known colors
    const names = css.colors.map(c => c.name.toLowerCase());
    // Check that Red, Blue, Green (capitalized) are present
    const hexes = css.colors.map(c => c.hex.toLowerCase());
    assert.ok(hexes.includes('#ff0000'), 'Has red (#ff0000)');
    assert.ok(hexes.includes('#0000ff'), 'Has blue (#0000ff)');
    assert.ok(hexes.includes('#008000'), 'Has green (#008000)');
    assert.ok(hexes.includes('#ffa500'), 'Has orange (#ffa500)');

    console.log('  ✓ css named palette');
}

function run() {
    console.log('Palette Registry tests\n');

    test_list();
    test_get();
    test_register();
    test_backward_compat();
    test_css_named_palette();

    console.log('\n✅ All palette tests passed!');
}

run();
