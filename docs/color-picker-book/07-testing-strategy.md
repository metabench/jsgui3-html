# Chapter 7: Testing Strategy

A production-ready color picker requires thorough testing across multiple layers. This chapter defines the testing plan.

## Test Structure

```
test/
    core/
        color-value.test.js           ← Pure unit tests for Color_Value
    controls/
        swatch-grid.test.js           ← Each mode control
        hsl-wheel.test.js
        gradient-area.test.js
        channel-sliders.test.js
        hex-input.test.js
        named-colors.test.js
        color-picker.test.js          ← Composite integration tests
```

## Layer 1: Color_Value Unit Tests

These are pure logic tests with no DOM dependency — the most critical tests to write first.

```javascript
describe('Color_Value', () => {
    describe('construction', () => {
        it('creates from RGB values', () => {
            const c = new Color_Value(31, 117, 254);
            expect(c.r).to.equal(31);
            expect(c.g).to.equal(117);
            expect(c.b).to.equal(254);
            expect(c.a).to.equal(1);
        });

        it('creates with alpha', () => {
            const c = new Color_Value(255, 0, 0, 0.5);
            expect(c.a).to.equal(0.5);
        });

        it('clamps values to valid ranges', () => {
            const c = new Color_Value(300, -10, 128);
            expect(c.r).to.equal(255);
            expect(c.g).to.equal(0);
        });
    });

    describe('from_hex', () => {
        it('parses 6-digit hex', () => {
            const c = Color_Value.from_hex('#1F75FE');
            expect(c.r).to.equal(31);
            expect(c.g).to.equal(117);
            expect(c.b).to.equal(254);
        });

        it('parses 3-digit shorthand', () => {
            const c = Color_Value.from_hex('#F00');
            expect(c.r).to.equal(255);
            expect(c.g).to.equal(0);
            expect(c.b).to.equal(0);
        });

        it('parses 8-digit hex with alpha', () => {
            const c = Color_Value.from_hex('#1F75FE80');
            expect(c.a).to.be.closeTo(0.502, 0.01);
        });

        it('handles lowercase', () => {
            const c = Color_Value.from_hex('#ff0000');
            expect(c.r).to.equal(255);
        });

        it('handles missing # prefix', () => {
            const c = Color_Value.from_hex('1F75FE');
            expect(c.r).to.equal(31);
        });
    });

    describe('from_hsl', () => {
        it('converts pure red', () => {
            const c = Color_Value.from_hsl(0, 100, 50);
            expect(c.r).to.equal(255);
            expect(c.g).to.equal(0);
            expect(c.b).to.equal(0);
        });

        it('converts gray (zero saturation)', () => {
            const c = Color_Value.from_hsl(0, 0, 50);
            expect(c.r).to.equal(128);
            expect(c.g).to.equal(128);
            expect(c.b).to.equal(128);
        });

        it('converts black', () => {
            const c = Color_Value.from_hsl(0, 0, 0);
            expect(c.r).to.equal(0);
        });

        it('converts white', () => {
            const c = Color_Value.from_hsl(0, 0, 100);
            expect(c.r).to.equal(255);
        });
    });

    describe('conversions', () => {
        it('round-trips RGB → HSL → RGB', () => {
            const original = new Color_Value(31, 117, 254);
            const hsl = original.hsl;
            const back = Color_Value.from_hsl(hsl.h, hsl.s, hsl.l);
            expect(back.r).to.be.closeTo(original.r, 1);
            expect(back.g).to.be.closeTo(original.g, 1);
            expect(back.b).to.be.closeTo(original.b, 1);
        });

        it('round-trips RGB → HSV → RGB', () => {
            const original = new Color_Value(200, 100, 50);
            const hsv = original.hsv;
            const back = Color_Value.from_hsv(hsv.h, hsv.s, hsv.v);
            expect(back.r).to.be.closeTo(original.r, 1);
            expect(back.g).to.be.closeTo(original.g, 1);
            expect(back.b).to.be.closeTo(original.b, 1);
        });

        it('round-trips RGB → HEX → RGB', () => {
            const original = new Color_Value(31, 117, 254);
            const hex = original.hex;
            const back = Color_Value.from_hex(hex);
            expect(back.r).to.equal(original.r);
            expect(back.g).to.equal(original.g);
            expect(back.b).to.equal(original.b);
        });
    });

    describe('hex output', () => {
        it('outputs uppercase with # prefix', () => {
            const c = new Color_Value(31, 117, 254);
            expect(c.hex).to.equal('#1F75FE');
        });

        it('pads single-digit channels', () => {
            const c = new Color_Value(0, 0, 0);
            expect(c.hex).to.equal('#000000');
        });

        it('includes alpha in hex8', () => {
            const c = new Color_Value(255, 0, 0, 0.5);
            expect(c.hex8).to.match(/^#FF000080$/i);
        });
    });

    describe('css output', () => {
        it('outputs rgb() for opaque colors', () => {
            const c = new Color_Value(31, 117, 254);
            expect(c.css).to.equal('rgb(31, 117, 254)');
        });

        it('outputs rgba() for transparent colors', () => {
            const c = new Color_Value(31, 117, 254, 0.5);
            expect(c.css).to.equal('rgba(31, 117, 254, 0.5)');
        });
    });

    describe('equality', () => {
        it('considers identical colors equal', () => {
            const a = new Color_Value(31, 117, 254);
            const b = new Color_Value(31, 117, 254);
            expect(a.equals(b)).to.be.true;
        });

        it('considers different colors unequal', () => {
            const a = new Color_Value(31, 117, 254);
            const b = new Color_Value(255, 0, 0);
            expect(a.equals(b)).to.be.false;
        });
    });

    describe('utilities', () => {
        it('detects light colors', () => {
            const white = new Color_Value(255, 255, 255);
            expect(white.is_light()).to.be.true;
        });

        it('detects dark colors', () => {
            const black = new Color_Value(0, 0, 0);
            expect(black.is_light()).to.be.false;
        });

        it('suggests text color for contrast', () => {
            const yellow = Color_Value.from_hex('#FFFF00');
            expect(yellow.text_color().hex).to.equal('#000000');
        });
    });
});
```

## Layer 2: Mode Control Unit Tests

Each mode control is tested for construction, rendering, and event emission:

```javascript
describe('Swatch_Grid', () => {
    let context;

    beforeEach(() => {
        context = test_utils.create_context();
    });

    describe('constructor', () => {
        it('creates with default spec', () => {
            const sg = new Swatch_Grid({ context });
            expect(sg.__type_name).to.equal('swatch_grid');
        });

        it('accepts custom palette', () => {
            const palette = [{ hex: '#FF0000', name: 'Red' }];
            const sg = new Swatch_Grid({ context, palette });
            expect(sg.palette).to.deep.equal(palette);
        });

        it('sets default grid size', () => {
            const sg = new Swatch_Grid({ context });
            expect(sg.grid_size).to.deep.equal([12, 12]);
        });

        it('adds swatch-grid CSS class', () => {
            const sg = new Swatch_Grid({ context });
            const html = sg.all_html_process();
            expect(html).to.include('swatch-grid');
        });
    });

    describe('rendering', () => {
        it('renders correct number of cells', () => {
            const sg = new Swatch_Grid({
                context,
                grid_size: [4, 3],
                palette: Array(12).fill('#FF0000')
            });
            const html = sg.all_html_process();
            // Should contain 12 cells
            expect((html.match(/cell/g) || []).length).to.be.at.least(12);
        });

        it('sets background-color on cells', () => {
            const sg = new Swatch_Grid({
                context,
                grid_size: [1, 1],
                palette: ['#FF0000']
            });
            const html = sg.all_html_process();
            expect(html.to.include('FF0000') || html.to.include('ff0000'));
        });
    });

    describe('color API', () => {
        it('has a color getter', () => {
            const sg = new Swatch_Grid({
                context,
                color: Color_Value.from_hex('#FF0000')
            });
            expect(sg.color.hex).to.equal('#FF0000');
        });

        it('updates visual on color set', () => {
            const sg = new Swatch_Grid({ context });
            sg.color = Color_Value.from_hex('#00FF00');
            expect(sg.color.hex).to.equal('#00FF00');
        });
    });
});
```

## Layer 3: Composite Integration Tests

Test that the `Color_Picker` correctly synchronizes color across modes:

```javascript
describe('Color_Picker', () => {
    let context;

    beforeEach(() => {
        context = test_utils.create_context();
    });

    describe('tab management', () => {
        it('creates tabs for requested modes', () => {
            const picker = new Color_Picker({
                context,
                modes: ['swatches', 'hex']
            });
            const html = picker.all_html_process();
            expect(html).to.include('Swatches');
            expect(html).to.include('Hex');
        });

        it('does not create unrequested modes', () => {
            const picker = new Color_Picker({
                context,
                modes: ['swatches']
            });
            const html = picker.all_html_process();
            expect(html).not.to.include('Spectrum');
        });
    });

    describe('color synchronisation', () => {
        it('propagates initial color to all modes', () => {
            const color = Color_Value.from_hex('#3A86FF');
            const picker = new Color_Picker({
                context,
                color,
                modes: ['swatches', 'hex', 'sliders']
            });
            expect(picker.get_mode('swatches').color.hex).to.equal('#3A86FF');
            expect(picker.get_mode('hex').color.hex).to.equal('#3A86FF');
            expect(picker.get_mode('sliders').color.hex).to.equal('#3A86FF');
        });

        it('updates all modes when color is set programmatically', () => {
            const picker = new Color_Picker({
                context,
                modes: ['swatches', 'hex']
            });
            picker.color = Color_Value.from_hex('#FF0000');
            expect(picker.get_mode('swatches').color.hex).to.equal('#FF0000');
            expect(picker.get_mode('hex').color.hex).to.equal('#FF0000');
        });
    });

    describe('events', () => {
        it('raises color-change when a mode picks a color', () => {
            const picker = new Color_Picker({
                context,
                modes: ['swatches']
            });
            let received;
            picker.on('color-change', e => { received = e; });

            // Simulate mode raising event
            picker.get_mode('swatches').raise('color-change', {
                value: Color_Value.from_hex('#FF0000'),
                source: 'swatch_grid'
            });

            expect(received).to.exist;
            expect(received.value.hex).to.equal('#FF0000');
        });
    });

    describe('variants', () => {
        it('compact variant shows only swatches', () => {
            const picker = new Color_Picker({
                context,
                variant: 'compact'
            });
            const html = picker.all_html_process();
            expect(html).to.include('Swatches');
            expect(html).not.to.include('Spectrum');
        });

        it('full variant shows all modes', () => {
            const picker = new Color_Picker({
                context,
                variant: 'full'
            });
            const modes = picker._mode_names;
            expect(modes).to.include('swatches');
            expect(modes).to.include('spectrum');
            expect(modes).to.include('hex');
        });
    });
});
```

## Layer 4: Browser / E2E Tests

Interactive behavior must be tested in a real browser environment:

```javascript
describe('Color_Picker E2E', () => {
    it('clicking a swatch updates the preview bar', async () => {
        // Navigate to a page with the color picker rendered
        // Click a specific swatch cell
        // Assert the preview bar background-color changed
    });

    it('typing a hex value updates the preview', async () => {
        // Switch to the Hex tab
        // Type '#FF0000' in the input field
        // Assert the preview swatch shows red
    });

    it('dragging the hue ring changes the gradient area color', async () => {
        // Switch to the Spectrum tab
        // Drag the hue slider
        // Assert the gradient area background hue changed
    });

    it('switching tabs preserves the current color', async () => {
        // Pick a color in Swatches tab
        // Switch to Hex tab
        // Assert the hex input shows the same color
    });

    it('Cancel button reverts to original color', async () => {
        // Set initial color to blue
        // Change to red
        // Click Cancel
        // Assert picker.color is back to blue
    });
});
```

## Layer 5: Accessibility Tests

```javascript
describe('Color_Picker Accessibility', () => {
    describe('Swatch_Grid', () => {
        it('has role="grid" on the container', () => {});
        it('has role="gridcell" on each swatch', () => {});
        it('has aria-label with color name on each cell', () => {});
        it('supports arrow key navigation between cells', () => {});
        it('supports Enter to select focused cell', () => {});
        it('announces selected color to screen readers', () => {});
    });

    describe('Channel_Sliders', () => {
        it('has role="slider" on each slider', () => {});
        it('has aria-valuemin and aria-valuemax', () => {});
        it('has aria-valuenow reflecting current value', () => {});
        it('has aria-label identifying the channel', () => {});
    });

    describe('Color_Picker composite', () => {
        it('uses role="tablist" for the tab bar', () => {});
        it('uses role="tab" for each tab', () => {});
        it('uses role="tabpanel" for tab content', () => {});
        it('supports Tab key to move between major regions', () => {});
    });
});
```

## Test Execution

### Commands

```bash
# Run all color picker tests
npx mocha test/core/color-value.test.js test/controls/swatch-grid.test.js test/controls/color-picker.test.js

# Run only Color_Value (pure logic, fast)
npx mocha test/core/color-value.test.js

# Run with coverage
npx nyc mocha test/core/color-value.test.js
```

### CI Integration

Color picker tests should be part of the standard `npm test` run. Add to `package.json`:

```json
{
    "scripts": {
        "test:color": "mocha test/core/color-value.test.js test/controls/*color*.test.js test/controls/*swatch*.test.js test/controls/*picker*.test.js"
    }
}
```

## Coverage Targets

| Component | Target Coverage | Priority |
|-----------|----------------|----------|
| `Color_Value` | 95%+ | Critical — pure logic |
| `Swatch_Grid` | 80%+ | High — most used mode |
| `Channel_Sliders` | 80%+ | High — complex interactions |
| `Hex_Input` | 85%+ | High — input validation |
| `Color_Picker` composite | 75%+ | High — integration |
| `Gradient_Area` | 70%+ | Medium — canvas-heavy |
| `HSL_Wheel` | 70%+ | Medium — canvas-heavy |
| `Named_Colors` | 75%+ | Medium — list filtering |
