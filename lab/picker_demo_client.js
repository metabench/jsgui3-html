/**
 * Picker Controls Demo — Client Entry Point
 * 
 * Follows the jsgui3 pattern: extends Active_HTML_Document,
 * composes controls in constructor, and lets the framework's
 * own activate() handle all client-side interactivity.
 * 
 * The Server in picker_controls_demo_server.js bundles this file
 * and serves it with automatic hydration + activation.
 */

const jsgui = require('jsgui3-client');

const { Control, Active_HTML_Document } = jsgui;
const controls = jsgui.controls;

const Color_Picker = require('../controls/organised/0-core/0-basic/1-compositional/color-picker');
const Time_Picker = require('../controls/organised/0-core/0-basic/1-compositional/time-picker');
const DateTime_Picker = require('../controls/organised/0-core/0-basic/1-compositional/datetime-picker');

class Picker_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'picker_demo';
        super(spec);

        const { context } = this;

        if (typeof this.body.add_class === 'function') {
            this.body.add_class('picker-demo-body');
        }

        // Only compose when server-rendering (not hydrating from existing DOM)
        if (!spec.el) {
            this.compose_ui(context);
        }
    }

    compose_ui(context) {
        const container = new Control({ context, tag_name: 'div' });
        container.add_class('picker-demo');

        const title = new Control({ context, tag_name: 'h1' });
        title.add('jsgui3 Advanced Picker Controls');
        container.add(title);

        const subtitle = new Control({ context, tag_name: 'p' });
        subtitle.add_class('subtitle');
        subtitle.add('Color_Picker · Time_Picker · DateTime_Picker — All with framework activation.');
        container.add(subtitle);

        // ============= COLOR PICKER — Default =============
        const s1 = new Control({ context, tag_name: 'section' });
        s1.add_class('demo-section');
        s1.dom.attrs['id'] = 'color-picker-default';
        const h1 = new Control({ context, tag_name: 'h2' });
        h1.add('🎨 Color_Picker — Default');
        s1.add(h1);
        const d1 = new Control({ context, tag_name: 'p' });
        d1.add('Wheel + sliders + palette + hex input + preview. All defaults. Drag sliders, click palette, type hex.');
        s1.add(d1);
        try {
            const cp1 = new Color_Picker({ context });
            s1.add(cp1);
            this._cp_default = cp1;
        } catch (e) {
            const err = new Control({ context, tag_name: 'pre' });
            err.add('Error: ' + e.message);
            s1.add(err);
        }
        container.add(s1);

        // ============= COLOR PICKER — RGB + Alpha =============
        const s2 = new Control({ context, tag_name: 'section' });
        s2.add_class('demo-section');
        s2.dom.attrs['id'] = 'color-picker-rgb';
        const h2 = new Control({ context, tag_name: 'h2' });
        h2.add('🎨 Color_Picker — RGB Inputs + Alpha + Compact');
        s2.add(h2);
        const d2 = new Control({ context, tag_name: 'p' });
        d2.add('show_rgb_inputs: true, show_alpha: true, show_wheel: false, layout: "compact", output_format: "rgba"');
        s2.add(d2);
        try {
            const cp2 = new Color_Picker({
                context,
                value: '#ef4444',
                show_wheel: false,
                show_sliders: true,
                show_rgb_inputs: true,
                show_alpha: true,
                layout: 'compact',
                output_format: 'rgba',
            });
            s2.add(cp2);
            this._cp_rgb = cp2;
        } catch (e) {
            const err = new Control({ context, tag_name: 'pre' });
            err.add('Error: ' + e.message);
            s2.add(err);
        }
        container.add(s2);

        // ============= TIME PICKER — Default 24h =============
        const s4 = new Control({ context, tag_name: 'section' });
        s4.add_class('demo-section');
        s4.dom.attrs['id'] = 'time-picker-default';
        const h4 = new Control({ context, tag_name: 'h2' });
        h4.add('🕐 Time_Picker — Default (24h, Clock Face)');
        s4.add(h4);
        const d4 = new Control({ context, tag_name: 'p' });
        d4.add('Default config: clock face + digital display. 24h mode. Click on clock to set time.');
        s4.add(d4);
        try {
            const tp1 = new Time_Picker({ context, value: '14:30' });
            s4.add(tp1);
            this._tp_default = tp1;
        } catch (e) {
            const err = new Control({ context, tag_name: 'pre' });
            err.add('Error: ' + e.message);
            s4.add(err);
        }
        container.add(s4);

        // ============= TIME PICKER — 12h + Spinners + Presets =============
        const s5 = new Control({ context, tag_name: 'section' });
        s5.add_class('demo-section');
        s5.dom.attrs['id'] = 'time-picker-12h';
        const h5 = new Control({ context, tag_name: 'h2' });
        h5.add('🕐 Time_Picker — 12h + Spinners + Presets');
        s5.add(h5);
        const d5 = new Control({ context, tag_name: 'p' });
        d5.add('use_24h: false, show_spinners: true, show_presets: true, show_seconds: true, step_minutes: 15');
        s5.add(d5);
        try {
            const tp2 = new Time_Picker({
                context,
                value: '2:30 PM',
                use_24h: false,
                show_spinners: true,
                show_presets: true,
                show_seconds: true,
                show_second_hand: true,
                step_minutes: 15,
                presets: ['Now', '09:00', '12:00', '17:00', '22:00'],
            });
            s5.add(tp2);
            this._tp_12h = tp2;
        } catch (e) {
            const err = new Control({ context, tag_name: 'pre' });
            err.add('Error: ' + e.message);
            s5.add(err);
        }
        container.add(s5);

        // ============= DATETIME PICKER — Stacked =============
        const s7 = new Control({ context, tag_name: 'section' });
        s7.add_class('demo-section');
        s7.dom.attrs['id'] = 'datetime-picker-stacked';
        const h7 = new Control({ context, tag_name: 'h2' });
        h7.add('📅🕐 DateTime_Picker — Stacked (default)');
        s7.add(h7);
        const d7 = new Control({ context, tag_name: 'p' });
        d7.add('Combines Month_View + Time_Picker in stacked layout. Calendar above, time below.');
        s7.add(d7);
        try {
            const dtp1 = new DateTime_Picker({
                context,
                value: '2026-02-11T14:30',
            });
            s7.add(dtp1);
            this._dtp_stacked = dtp1;
        } catch (e) {
            const err = new Control({ context, tag_name: 'pre' });
            err.add('Error: ' + e.message);
            s7.add(err);
        }
        container.add(s7);

        // ============= DATETIME PICKER — Side by Side =============
        const s8 = new Control({ context, tag_name: 'section' });
        s8.add_class('demo-section');
        s8.dom.attrs['id'] = 'datetime-picker-sbs';
        const h8 = new Control({ context, tag_name: 'h2' });
        h8.add('📅🕐 DateTime_Picker — Side by Side');
        s8.add(h8);
        const d8 = new Control({ context, tag_name: 'p' });
        d8.add('layout: "side-by-side", use_24h: false, show_spinners: true. Calendar left, time right.');
        s8.add(d8);
        try {
            const dtp2 = new DateTime_Picker({
                context,
                value: '2026-02-11T09:45',
                layout: 'side-by-side',
                use_24h: false,
                show_spinners: true,
            });
            s8.add(dtp2);
            this._dtp_sbs = dtp2;
        } catch (e) {
            const err = new Control({ context, tag_name: 'pre' });
            err.add('Error: ' + e.message);
            s8.add(err);
        }
        container.add(s8);

        this.body.add(container);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            console.log('✅ Picker Demo activated — all controls should now be interactive.');
        }
    }
}

Picker_Demo.css = `
* { box-sizing: border-box; }
body {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    margin: 0;
    padding: 24px;
    background: #0f172a;
    color: #e2e8f0;
}
.picker-demo {
    max-width: 1000px;
    margin: 0 auto;
}
h1 { color: #f1f5f9; border-bottom: 3px solid #3b82f6; padding-bottom: 12px; font-size: 28px; }
.subtitle { color: #94a3b8; font-size: 14px; margin-top: -8px; }
h2 { color: #f1f5f9; margin-top: 0; font-size: 18px; }
.demo-section {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.demo-section p { color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 16px; }
pre { background: #450a0a; color: #fca5a5; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-size: 12px; }

/* Force position: relative on wheel wraps so dots can be positioned */
.cp-wheel-wrap { position: relative; }
.cp-hue-dot, .cp-sl-dot {
    position: absolute;
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 4px rgba(0,0,0,0.5);
    pointer-events: none;
}
.cp-hue-dot { background: transparent; }
.cp-sl-dot  { background: transparent; }

/* SL canvas positioning inside wheel */
.cp-sl-canvas {
    position: absolute;
    top: 40px; left: 40px;
}

/* Month_View dark overrides */
.month-view {
    --mv-bg: #0f172a;
    --mv-text: #e2e8f0;
    --mv-header-text: #94a3b8;
    --mv-accent: #3b82f6;
}
.left-right.arrows-selector { display:flex;align-items:center;justify-content:center;gap:8px;padding:4px 0; }
.left-right.arrows-selector .item-selector { flex:1;text-align:center;font-size:15px;font-weight:600;color:#e2e8f0; }
.left-right.arrows-selector .item-selector .item { cursor:pointer;padding:2px 8px; }
.left-right.arrows-selector .item-selector .list.hidden { display:none; }
.button.arrow { display:inline-flex;align-items:center;justify-content:center;background:#334155;border:1px solid #475569;border-radius:6px;cursor:pointer;padding:2px;min-width:32px;min-height:32px; }
.button.arrow:hover { background:#475569; }
.button.arrow svg { width:16px;height:16px;fill:#e2e8f0;stroke:#e2e8f0; }
`;

// Register all control types so hydration can find them by __type_name
controls.Picker_Demo = Picker_Demo;
controls.Color_Picker = Color_Picker;
controls.Time_Picker = Time_Picker;
controls.DateTime_Picker = DateTime_Picker;

module.exports = jsgui;
