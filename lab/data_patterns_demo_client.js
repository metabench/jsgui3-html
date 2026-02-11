/**
 * Data Patterns Demo — Color Swatch Editor
 * 
 * Demonstrates idiomatic jsgui3 patterns for Data_Object, Data_Value,
 * change event chains, and MVVM data binding.
 * 
 * Patterns demonstrated:
 *   1. Data_Object as canonical model (HSL + hex + RGB)
 *   2. data.model ↔ view.data.model sync via change events
 *   3. Data_Value.sync() for bidirectional binding
 *   4. Change propagation chains (slider → model → displays)
 *   5. Re-entrancy safety (Object.is guard + updatingFrom Set)
 *   6. DOM ↔ model round-trip via activate()
 */

const jsgui = require('jsgui3-client');
const { Control, Data_Object, Data_Value } = jsgui;
const Active_HTML_Document = jsgui.controls.Active_HTML_Document || jsgui.Active_HTML_Document;

// ── Color conversion utilities ──────────────────

function hsl_to_rgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgb_to_hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        else if (max === g) h = ((b - r) / d + 2) * 60;
        else h = ((r - g) / d + 4) * 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function rgb_to_hex(r, g, b) {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function hex_to_rgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ── Data Patterns Demo ──────────────────────────

class Data_Patterns_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_patterns_demo';
        super(spec);
        this.__type_name = 'data_patterns_demo';
        this.add_class('data-patterns-demo');

        if (!spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        const body = this.body || this;

        // ── STYLE ──
        const style = new Control({ context, tag_name: 'style' });
        style.add(`
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #0f0f23; color: #e2e8f0; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 40px 20px; }
            .demo-container { max-width: 720px; width: 100%; }
            .demo-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .demo-subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 32px; }
            .section { background: #1e1e3a; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #2d2d50; }
            .section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #818cf8; margin-bottom: 16px; }
            .preview-row { display: flex; gap: 20px; align-items: center; }
            .color-swatch { width: 100px; height: 100px; border-radius: 16px; border: 2px solid #3d3d5c; transition: background-color 0.15s ease; flex-shrink: 0; }
            .color-info { flex: 1; }
            .color-hex-display { font-size: 32px; font-weight: 700; font-family: 'JetBrains Mono', monospace; letter-spacing: 2px; }
            .color-rgb-display, .color-hsl-display { font-size: 14px; color: #94a3b8; margin-top: 4px; }
            .slider-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
            .slider-label { width: 24px; font-size: 14px; font-weight: 600; color: #a5b4fc; text-align: right; }
            .slider-input { flex: 1; -webkit-appearance: none; height: 8px; border-radius: 4px; background: #2d2d50; outline: none; cursor: pointer; }
            .slider-input::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #6366f1; cursor: pointer; border: 2px solid #fff; }
            .slider-value { width: 48px; font-size: 14px; text-align: right; font-family: monospace; color: #cbd5e1; }
            .input-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
            .input-group { display: flex; flex-direction: column; gap: 4px; }
            .input-group label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
            .input-group input { background: #12122a; border: 1px solid #2d2d50; border-radius: 8px; padding: 8px 10px; color: #e2e8f0; font-family: monospace; font-size: 14px; outline: none; transition: border-color 0.2s; }
            .input-group input:focus { border-color: #6366f1; }
            .sync-section { background: #1a1a35; border-radius: 12px; padding: 16px; margin-top: 16px; }
            .sync-row { display: flex; align-items: center; gap: 12px; font-size: 13px; margin-bottom: 8px; }
            .sync-label { color: #64748b; width: 120px; }
            .sync-value { font-family: monospace; color: #a5b4fc; background: #12122a; padding: 4px 8px; border-radius: 4px; }
            .event-log { background: #12122a; border-radius: 12px; padding: 12px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; }
            .event-log-entry { padding: 3px 0; color: #94a3b8; border-bottom: 1px solid #1e1e3a; }
            .event-log-entry .evt-name { color: #6366f1; }
            .event-log-entry .evt-value { color: #22c55e; }
        `);
        if (this.head) {
            this.head.add(style);
        } else {
            body.add(style);
        }

        // ── CONTAINER ──
        const container = new Control({ context, 'class': 'demo-container' });
        container.dom.tagName = 'div';

        // Title
        const title = new Control({ context, 'class': 'demo-title' });
        title.dom.tagName = 'div';
        title.add('Data Pattern Explorer');
        container.add(title);

        const subtitle = new Control({ context, 'class': 'demo-subtitle' });
        subtitle.dom.tagName = 'div';
        subtitle.add('Data_Object · Data_Value · Change Events · MVVM Sync');
        container.add(subtitle);

        // ── SECTION 1: Preview ──
        const sec_preview = this._create_section(context, container, 'Color Preview');
        const preview_row = new Control({ context, 'class': 'preview-row' });
        preview_row.dom.tagName = 'div';

        const swatch = new Control({ context, 'class': 'color-swatch' });
        swatch.dom.tagName = 'div';
        swatch.dom.attributes.id = 'preview-swatch';
        swatch.dom.attributes.style = 'background-color: #3b82f6';
        preview_row.add(swatch);

        const info = new Control({ context, 'class': 'color-info' });
        info.dom.tagName = 'div';

        const hex_display = new Control({ context, 'class': 'color-hex-display' });
        hex_display.dom.tagName = 'div';
        hex_display.dom.attributes.id = 'hex-display';
        hex_display.add('#3B82F6');
        info.add(hex_display);

        const rgb_display = new Control({ context, 'class': 'color-rgb-display' });
        rgb_display.dom.tagName = 'div';
        rgb_display.dom.attributes.id = 'rgb-display';
        rgb_display.add('rgb(59, 130, 246)');
        info.add(rgb_display);

        const hsl_display = new Control({ context, 'class': 'color-hsl-display' });
        hsl_display.dom.tagName = 'div';
        hsl_display.dom.attributes.id = 'hsl-display';
        hsl_display.add('hsl(217, 91%, 60%)');
        info.add(hsl_display);

        preview_row.add(info);
        sec_preview.add(preview_row);

        // ── SECTION 2: H/S/L Sliders ──
        const sec_sliders = this._create_section(context, container, 'HSL Sliders → Data_Object');
        this._create_slider(context, sec_sliders, 'H', 'slider-h', 0, 359, 217);
        this._create_slider(context, sec_sliders, 'S', 'slider-s', 0, 100, 91);
        this._create_slider(context, sec_sliders, 'L', 'slider-l', 0, 100, 60);

        // ── SECTION 3: Input Fields ──
        const sec_inputs = this._create_section(context, container, 'Bidirectional Inputs');
        const input_grid = new Control({ context, 'class': 'input-grid' });
        input_grid.dom.tagName = 'div';
        this._create_input(context, input_grid, 'Hex', 'input-hex', '#3B82F6');
        this._create_input(context, input_grid, 'R', 'input-r', '59');
        this._create_input(context, input_grid, 'G', 'input-g', '130');
        this._create_input(context, input_grid, 'B', 'input-b', '246');
        sec_inputs.add(input_grid);

        // ── SECTION 4: Data_Value.sync() Demo ──
        const sec_sync = this._create_section(context, container, 'Data_Value.sync() Demo');
        const sync_area = new Control({ context, 'class': 'sync-section' });
        sync_area.dom.tagName = 'div';
        sync_area.dom.attributes.id = 'sync-section';

        this._create_sync_row(context, sync_area, 'model.h', 'sync-model-h', '217');
        this._create_sync_row(context, sync_area, 'synced_dv.h', 'sync-dv-h', '217');
        this._create_sync_row(context, sync_area, 'Change Count', 'sync-change-count', '0');
        sec_sync.add(sync_area);

        // ── SECTION 5: Event Log ──    
        const sec_events = this._create_section(context, container, 'Change Event Log');
        const event_log = new Control({ context, 'class': 'event-log' });
        event_log.dom.tagName = 'div';
        event_log.dom.attributes.id = 'event-log';

        const init_entry = new Control({ context, 'class': 'event-log-entry' });
        init_entry.dom.tagName = 'div';
        init_entry.add('Waiting for changes...');
        event_log.add(init_entry);
        sec_events.add(event_log);

        body.add(container);
    }

    _create_section(context, parent, title_text) {
        const section = new Control({ context, 'class': 'section' });
        section.dom.tagName = 'div';
        const title = new Control({ context, 'class': 'section-title' });
        title.dom.tagName = 'div';
        title.add(title_text);
        section.add(title);
        parent.add(section);
        return section;
    }

    _create_slider(context, parent, label, id, min, max, value) {
        const row = new Control({ context, 'class': 'slider-row' });
        row.dom.tagName = 'div';

        const lbl = new Control({ context, 'class': 'slider-label' });
        lbl.dom.tagName = 'span';
        lbl.add(label);
        row.add(lbl);

        const slider = new Control({ context });
        slider.dom.tagName = 'input';
        slider.dom.attributes.type = 'range';
        slider.dom.attributes.class = 'slider-input';
        slider.dom.attributes.id = id;
        slider.dom.attributes.min = '' + min;
        slider.dom.attributes.max = '' + max;
        slider.dom.attributes.value = '' + value;
        row.add(slider);

        const val_display = new Control({ context, 'class': 'slider-value' });
        val_display.dom.tagName = 'span';
        val_display.dom.attributes.id = id + '-val';
        val_display.add('' + value);
        row.add(val_display);

        parent.add(row);
    }

    _create_input(context, parent, label, id, value) {
        const group = new Control({ context, 'class': 'input-group' });
        group.dom.tagName = 'div';

        const lbl = new Control({ context });
        lbl.dom.tagName = 'label';
        lbl.add(label);
        group.add(lbl);

        const input = new Control({ context });
        input.dom.tagName = 'input';
        input.dom.attributes.type = 'text';
        input.dom.attributes.id = id;
        input.dom.attributes.value = value;
        group.add(input);

        parent.add(group);
    }

    _create_sync_row(context, parent, label, id, value) {
        const row = new Control({ context, 'class': 'sync-row' });
        row.dom.tagName = 'div';

        const lbl = new Control({ context, 'class': 'sync-label' });
        lbl.dom.tagName = 'span';
        lbl.add(label);
        row.add(lbl);

        const val = new Control({ context, 'class': 'sync-value' });
        val.dom.tagName = 'span';
        val.dom.attributes.id = id;
        val.add(value);
        row.add(val);

        parent.add(row);
    }

    activate() {
        if (this.__active) return;
        super.activate();

        console.log('⚡ Data_Patterns_Demo activate() — setting up data binding');

        const { context } = this;

        // ══════════════════════════════════════════
        // PATTERN 1: Data_Object as canonical model
        // ══════════════════════════════════════════
        //
        // A single Data_Object holds all color state.
        // set(name, value) wraps primitives in Data_Value (via ensure_data_value)
        // and raises 'change' events with {name, value, data_value, raw_value}.
        //
        const model = new Data_Object({ context });
        model.set('h', 217);
        model.set('s', 91);
        model.set('l', 60);
        const [r0, g0, b0] = hsl_to_rgb(217, 91, 60);
        model.set('r', r0);
        model.set('g', g0);
        model.set('b', b0);
        model.set('hex', rgb_to_hex(r0, g0, b0));

        // Expose model globally for E2E testing
        window.__data_model = model;

        // ── DOM references ──
        const slider_h = document.getElementById('slider-h');
        const slider_s = document.getElementById('slider-s');
        const slider_l = document.getElementById('slider-l');
        const val_h = document.getElementById('slider-h-val');
        const val_s = document.getElementById('slider-s-val');
        const val_l = document.getElementById('slider-l-val');
        const input_hex = document.getElementById('input-hex');
        const input_r = document.getElementById('input-r');
        const input_g = document.getElementById('input-g');
        const input_b = document.getElementById('input-b');
        const swatch = document.getElementById('preview-swatch');
        const hex_display = document.getElementById('hex-display');
        const rgb_display = document.getElementById('rgb-display');
        const hsl_display = document.getElementById('hsl-display');
        const event_log = document.getElementById('event-log');

        // ══════════════════════════════════════════
        // PATTERN 2: Change propagation chains
        // ══════════════════════════════════════════
        //
        // When HSL changes → recompute RGB and hex.
        // When RGB changes → recompute HSL and hex.
        // The Data_Value setter's Object.is guard prevents
        // infinite loops: if recomputed value === current, no event fires.
        //

        let _updating = false;

        const update_rgb_from_hsl = () => {
            if (_updating) return;
            _updating = true;
            try {
                const h = model.get('h');
                const s = model.get('s');
                const l = model.get('l');
                const h_val = (h && h.value !== undefined) ? h.value : h;
                const s_val = (s && s.value !== undefined) ? s.value : s;
                const l_val = (l && l.value !== undefined) ? l.value : l;
                const [r, g, b] = hsl_to_rgb(h_val, s_val, l_val);
                model.set('r', r);
                model.set('g', g);
                model.set('b', b);
                model.set('hex', rgb_to_hex(r, g, b));
            } finally {
                _updating = false;
            }
        };

        const update_hsl_from_rgb = () => {
            if (_updating) return;
            _updating = true;
            try {
                const r = model.get('r');
                const g = model.get('g');
                const b = model.get('b');
                const r_val = (r && r.value !== undefined) ? r.value : r;
                const g_val = (g && g.value !== undefined) ? g.value : g;
                const b_val = (b && b.value !== undefined) ? b.value : b;
                const [h, s, l] = rgb_to_hsl(r_val, g_val, b_val);
                model.set('h', h);
                model.set('s', s);
                model.set('l', l);
                model.set('hex', rgb_to_hex(r_val, g_val, b_val));
            } finally {
                _updating = false;
            }
        };

        // ══════════════════════════════════════════
        // PATTERN 3: Model → DOM (change listener)
        // ══════════════════════════════════════════
        //
        // model.on('change') fires for every set().
        // We update all DOM elements from the model.
        //

        let event_count = 0;
        const max_log_entries = 50;

        const get_raw = (val) => (val && val.value !== undefined) ? val.value : val;

        model.on('change', (e) => {
            const { name } = e;
            const raw = e.raw_value !== undefined ? e.raw_value : get_raw(e.value);

            // Log the event
            event_count++;
            if (event_log) {
                const entry = document.createElement('div');
                entry.className = 'event-log-entry';
                entry.innerHTML = `<span class="evt-name">${name}</span> → <span class="evt-value">${raw}</span> (#${event_count})`;
                event_log.insertBefore(entry, event_log.firstChild);
                // Trim old entries
                while (event_log.children.length > max_log_entries) {
                    event_log.removeChild(event_log.lastChild);
                }
            }

            // Update DOM based on which property changed
            const h = get_raw(model.get('h'));
            const s = get_raw(model.get('s'));
            const l = get_raw(model.get('l'));
            const r = get_raw(model.get('r'));
            const g = get_raw(model.get('g'));
            const b = get_raw(model.get('b'));
            const hex = get_raw(model.get('hex'));

            // Sliders + value displays
            if (name === 'h' || name === 's' || name === 'l') {
                update_rgb_from_hsl();
            }
            if (name === 'r' || name === 'g' || name === 'b') {
                update_hsl_from_rgb();
            }

            // Re-read after propagation
            const h2 = get_raw(model.get('h'));
            const s2 = get_raw(model.get('s'));
            const l2 = get_raw(model.get('l'));
            const r2 = get_raw(model.get('r'));
            const g2 = get_raw(model.get('g'));
            const b2 = get_raw(model.get('b'));
            const hex2 = get_raw(model.get('hex'));

            // Update slider positions (only if not being dragged)
            if (slider_h && document.activeElement !== slider_h) slider_h.value = h2;
            if (slider_s && document.activeElement !== slider_s) slider_s.value = s2;
            if (slider_l && document.activeElement !== slider_l) slider_l.value = l2;

            // Update slider value displays
            if (val_h) val_h.textContent = h2;
            if (val_s) val_s.textContent = s2;
            if (val_l) val_l.textContent = l2;

            // Update inputs (only if not focused)
            if (input_hex && document.activeElement !== input_hex) input_hex.value = hex2.toUpperCase();
            if (input_r && document.activeElement !== input_r) input_r.value = r2;
            if (input_g && document.activeElement !== input_g) input_g.value = g2;
            if (input_b && document.activeElement !== input_b) input_b.value = b2;

            // Update preview
            if (swatch) swatch.style.backgroundColor = hex2;
            if (hex_display) hex_display.textContent = hex2.toUpperCase();
            if (rgb_display) rgb_display.textContent = `rgb(${r2}, ${g2}, ${b2})`;
            if (hsl_display) hsl_display.textContent = `hsl(${h2}, ${s2}%, ${l2}%)`;

            // Update sync display
            const sync_model_h = document.getElementById('sync-model-h');
            if (sync_model_h) sync_model_h.textContent = h2;
        });

        // ══════════════════════════════════════════
        // PATTERN 4: DOM → Model (event listeners)
        // ══════════════════════════════════════════
        //
        // Slider/input events → model.set() → triggers change chain.
        //

        // HSL sliders
        const bind_slider = (slider, prop_name) => {
            if (!slider) return;
            const handler = () => {
                model.set(prop_name, parseInt(slider.value, 10));
            };
            slider.addEventListener('input', handler);
            slider.addEventListener('change', handler);
        };
        bind_slider(slider_h, 'h');
        bind_slider(slider_s, 's');
        bind_slider(slider_l, 'l');

        // Hex input
        if (input_hex) {
            input_hex.addEventListener('change', () => {
                const hex = input_hex.value.trim();
                if (/^#?[0-9a-fA-F]{3,6}$/.test(hex)) {
                    const canonical = hex.startsWith('#') ? hex : '#' + hex;
                    const [r, g, b] = hex_to_rgb(canonical);
                    _updating = true;
                    try {
                        model.set('r', r);
                        model.set('g', g);
                        model.set('b', b);
                        model.set('hex', canonical.toLowerCase());
                        const [h, s, l] = rgb_to_hsl(r, g, b);
                        model.set('h', h);
                        model.set('s', s);
                        model.set('l', l);
                    } finally {
                        _updating = false;
                    }
                    // Fire one final update to refresh all displays
                    model.set('hex', canonical.toLowerCase());
                }
            });
        }

        // RGB inputs
        const bind_rgb_input = (input, prop_name) => {
            if (!input) return;
            input.addEventListener('change', () => {
                const val = parseInt(input.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 255) {
                    model.set(prop_name, val);
                }
            });
        };
        bind_rgb_input(input_r, 'r');
        bind_rgb_input(input_g, 'g');
        bind_rgb_input(input_b, 'b');

        // ══════════════════════════════════════════
        // PATTERN 5: Data_Value.sync() demo
        // ══════════════════════════════════════════
        //
        // Create a separate Data_Value and sync it with the model's 'h' field.
        // When model.h changes, synced_dv updates automatically and vice versa.
        // The built-in re-entrancy guard (updatingFrom Set) prevents loops.
        //

        const model_h_dv = model.get('h');
        if (model_h_dv && model_h_dv.__data_value) {
            const synced_dv = new Data_Value({ value: model_h_dv.value });
            Data_Value.sync(model_h_dv, synced_dv);

            let sync_change_count = 0;
            window.__synced_dv = synced_dv;

            synced_dv.on('change', (e) => {
                if (e.name === 'value') {
                    sync_change_count++;
                    const sync_dv_display = document.getElementById('sync-dv-h');
                    const count_display = document.getElementById('sync-change-count');
                    if (sync_dv_display) sync_dv_display.textContent = e.value;
                    if (count_display) count_display.textContent = sync_change_count;
                }
            });

            console.log('✅ Data_Value.sync() established between model.h and synced_dv');
        } else {
            console.log('⚠️ model.h is not a Data_Value, sync demo skipped');
        }

        // Expose event count for testing
        window.__event_count = () => event_count;

        console.log('✅ Data_Patterns_Demo fully activated');
        console.log('  Model fields:', model.keys());
        console.log('  model.h =', get_raw(model.get('h')));
        console.log('  model.hex =', get_raw(model.get('hex')));
    }
}

// Register for framework hydration
jsgui.controls = jsgui.controls || {};
jsgui.controls.Data_Patterns_Demo = Data_Patterns_Demo;

module.exports = jsgui;
