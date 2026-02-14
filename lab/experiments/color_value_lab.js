/**
 * Lab Experiment: Color_Value Model
 *
 * Validates that Color_Value works correctly as a standalone model,
 * focusing on MVVM patterns: observable changes, round-trip conversions,
 * and multiple views sharing one model.
 */
module.exports = {
    name: 'color_value',
    description: 'Validate Color_Value model: conversions, observers, MVVM pattern',
    run: async (tools) => {
        const { assert, cleanup } = tools;
        const Color_Value = require('../../html-core/Color_Value');

        // Helper: compare two hex strings with ±1 per-channel tolerance
        // (HSL round-trips can lose 1 unit due to integer rounding)
        const hex_close = (a, b) => {
            const pa = Color_Value.hex_to_rgb(a);
            const pb = Color_Value.hex_to_rgb(b);
            return Math.abs(pa[0] - pb[0]) <= 1 &&
                Math.abs(pa[1] - pb[1]) <= 1 &&
                Math.abs(pa[2] - pb[2]) <= 1;
        };

        // ── 1. Round-trip fidelity ──
        // Pure primary/secondary colors survive exact round-trip
        const primaries = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
        for (const hex of primaries) {
            const cv = new Color_Value(hex);
            assert(cv.hex === hex, `Round-trip failed for ${hex}: got ${cv.hex}`);
        }

        // ── 2. Observable: multiple listeners, same model ──
        const model = new Color_Value('#ff0000');
        const view_a_updates = [];
        const view_b_updates = [];

        model.on_change(e => view_a_updates.push(e.current));
        model.on_change(e => view_b_updates.push(e.current));

        model.set_hex('#00ff00');
        model.set_alpha(0.5);
        model.set_hsl(240, 100, 50);

        assert(view_a_updates.length === 3, `View A should have 3 updates, got ${view_a_updates.length}`);
        assert(view_b_updates.length === 3, `View B should have 3 updates, got ${view_b_updates.length}`);
        assert(view_a_updates[2].h === 240, 'View A last update should be blue');
        assert(view_b_updates[2].h === 240, 'View B last update should be blue');

        // ── 3. MVVM pattern: model drives two "views" ──
        const theme_primary = new Color_Value('#3b82f6');
        let swatch_color = theme_primary.hex;
        let label_text = theme_primary.to_string('rgb');

        theme_primary.on_change(e => {
            swatch_color = e.color.hex;
            label_text = e.color.to_string('rgb');
        });

        theme_primary.set_hex('#ef4444');
        // HSL round-trip may shift by ±1 per channel
        assert(hex_close(swatch_color, '#ef4444'), `Swatch should be ~#ef4444, got ${swatch_color}`);

        // ── 4. WCAG contrast validation ──
        const bg = new Color_Value('#1e1e2e');
        const fg = new Color_Value('#cdd6f4');
        const ratio = bg.contrast_ratio(fg);
        assert(ratio > 10, `Dark bg + light fg should have high contrast: ${ratio.toFixed(2)}`);
        assert(bg.meets_aa(fg), 'Should pass WCAG AA');
        assert(bg.meets_aaa(fg), 'Should pass WCAG AAA');

        // ── 5. Unsubscribe prevents updates ──
        const cv = new Color_Value('#ff0000');
        let count = 0;
        const unsub = cv.on_change(() => count++);
        cv.set_hex('#00ff00');
        assert(count === 1, 'Should fire once');
        unsub();
        cv.set_hex('#0000ff');
        assert(count === 1, 'Should not fire after unsub');

        // ── 6. Clone independence ──
        const orig = new Color_Value('#ff0000');
        const clone = orig.clone();
        clone.set_hex('#00ff00');
        assert(orig.hex === '#ff0000', 'Original should not change when clone mutates');

        cleanup();
        return { ok: true, message: `All Color_Value MVVM patterns validated (${primaries.length} round-trips, observer pattern, WCAG)` };
    }
};
