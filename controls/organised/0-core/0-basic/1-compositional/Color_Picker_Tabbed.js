'use strict';

const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const Color_Value = require('../../../../../html-core/Color_Value');
const Tabbed_Panel = require('../../../1-standard/6-layout/tabbed-panel');

// Sub-controls
const HSL_Wheel = require('./hsl-wheel');
const Gradient_Area = require('./gradient-area');
const Channel_Sliders = require('./channel-sliders');
const Hex_Input = require('./hex-input');
const Swatch_Grid = require('./swatch-grid');

/**
 * Variant presets — pre-configured mode combinations.
 */
const VARIANTS = {
    compact: { modes: ['swatches'], show_alpha: false, show_actions: false },
    standard: { modes: ['spectrum', 'swatches', 'hex'], show_alpha: false, show_actions: true },
    full: { modes: ['spectrum', 'wheel', 'sliders', 'swatches', 'hex', 'named'], show_alpha: true, show_actions: true },
    developer: { modes: ['spectrum', 'sliders', 'hex'], show_alpha: false, show_actions: false },
    designer: { modes: ['wheel', 'spectrum', 'named'], show_alpha: true, show_actions: true },
    inline: { modes: ['spectrum', 'hex'], show_alpha: false, show_actions: false },
};

/**
 * Mode metadata for tab labels & icons.
 */
const MODE_META = {
    spectrum: { title: 'Spectrum', icon: '🎨' },
    wheel: { title: 'Wheel', icon: '🔵' },
    sliders: { title: 'Sliders', icon: '⚙' },
    swatches: { title: 'Swatches', icon: '🎯' },
    hex: { title: 'Hex', icon: '#' },
    named: { title: 'Named', icon: '📛' },
};

/**
 * Color_Picker_Tabbed — Tabbed composite color picker.
 *
 * Assembles Phase C sub-controls into a Tabbed_Panel with:
 *   - Shared Color_Value model
 *   - Automatic sync between tabs (change in one → silent update to all)
 *   - Preview bar (old vs. new color)
 *   - Optional action bar (Cancel/Apply buttons)
 *   - Variant presets (compact, standard, full, developer, designer, inline)
 *
 * @param {Object} spec
 * @param {string}   [spec.value='#3b82f6'] — initial color
 * @param {string}   [spec.variant='standard'] — variant preset name
 * @param {string[]} [spec.modes] — custom mode list (overrides variant)
 * @param {boolean}  [spec.show_alpha=false]
 * @param {boolean}  [spec.show_actions=false]
 * @param {boolean}  [spec.show_preview=true]
 * @param {string}   [spec.palette_key] — palette key for Swatch_Grid
 * @param {string}   [spec.output_format='hex'] — 'hex'|'rgb'|'hsl'|'rgba'
 */
class Color_Picker_Tabbed extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'color_picker_tabbed';

        // Capture config before super()
        const variant_name = spec.variant || 'standard';
        const variant = VARIANTS[variant_name] || VARIANTS.standard;
        const cfg = {
            modes: spec.modes || variant.modes,
            show_alpha: spec.show_alpha !== undefined ? spec.show_alpha : variant.show_alpha,
            show_actions: spec.show_actions !== undefined ? spec.show_actions : variant.show_actions,
            show_preview: spec.show_preview !== false,
            palette_key: spec.palette_key || null,
            output_format: spec.output_format || 'hex',
        };
        const initial_value = spec.value || '#3b82f6';

        super(spec);
        this.add_class('color-picker-tabbed');
        this.add_class(`cpt-variant-${variant_name}`);

        this._cfg = cfg;
        this._color = new Color_Value(initial_value);
        this._prev_hex = this._color.hex;
        this._mode_controls = {}; // key → sub-control instance

        if (!spec.el) this.compose();
    }

    // ── Public API ──

    /** The underlying Color_Value model (for MVVM binding) */
    get color_model() { return this._color; }

    get value() { return this._color.to_string(this._cfg.output_format); }
    get hex() { return this._color.hex; }
    get rgb() { return this._color.rgb; }
    get hsl() { return this._color.hsl; }
    get h() { return this._color.h; }
    get s() { return this._color.s; }
    get l() { return this._color.l; }
    get alpha() { return this._color.alpha; }

    set_value(color_str) {
        this._color.set(color_str);
        this._sync_all_modes();
    }

    set_hsl(h, s, l) {
        this._color.set_hsl(h, s, l);
        this._sync_all_modes();
    }

    set_alpha(a) {
        this._color.set_alpha(a);
        this._sync_all_modes();
    }

    // ── Compose ──

    compose() {
        const { context } = this;
        const cfg = this._cfg;

        // Build sub-controls for each mode
        const tabs = cfg.modes.map(mode => {
            const ctrl = this._create_mode_control(mode);
            if (ctrl) {
                this._mode_controls[mode] = ctrl;
                const meta = MODE_META[mode] || { title: mode, icon: '' };
                return {
                    title: meta.title,
                    icon: meta.icon,
                    content: ctrl
                };
            }
            return null;
        }).filter(Boolean);

        // Tabbed panel
        this._tabbed_panel = new Tabbed_Panel({
            context,
            tabs,
            tab_bar: { variant: 'compact' }
        });
        this.add(this._tabbed_panel);

        // Preview bar
        if (cfg.show_preview) {
            this._preview_bar = new Control({ context, tag_name: 'div' });
            this._preview_bar.add_class('cpt-preview');

            this._preview_prev = new Control({ context, tag_name: 'div' });
            this._preview_prev.add_class('cpt-preview-prev');
            this._preview_prev.dom.attributes.style = `background:${this._prev_hex}`;
            this._preview_prev.dom.attributes.title = 'Previous';
            this._preview_bar.add(this._preview_prev);

            this._preview_new = new Control({ context, tag_name: 'div' });
            this._preview_new.add_class('cpt-preview-new');
            this._preview_new.dom.attributes.style = `background:${this._color.hex}`;
            this._preview_new.dom.attributes.title = 'Current';
            this._preview_bar.add(this._preview_new);

            this.add(this._preview_bar);
        }

        // Action bar
        if (cfg.show_actions) {
            this._action_bar = new Control({ context, tag_name: 'div' });
            this._action_bar.add_class('cpt-actions');

            this._btn_cancel = new Control({ context, tag_name: 'button' });
            this._btn_cancel.add_class('cpt-btn-cancel');
            this._btn_cancel.add('Cancel');
            this._action_bar.add(this._btn_cancel);

            this._btn_apply = new Control({ context, tag_name: 'button' });
            this._btn_apply.add_class('cpt-btn-apply');
            this._btn_apply.add('Apply');
            this._action_bar.add(this._btn_apply);

            this.add(this._action_bar);
        }
    }

    _create_mode_control(mode) {
        const { context } = this;
        const color = this._color;
        const cfg = this._cfg;

        switch (mode) {
            case 'spectrum':
                return new Gradient_Area({ context, color, canvas_size: 180 });
            case 'wheel':
                return new HSL_Wheel({ context, color, canvas_size: 180 });
            case 'sliders':
                return new Channel_Sliders({ context, color, mode: 'hsl', show_alpha: cfg.show_alpha });
            case 'swatches':
                return new Swatch_Grid({ context, color, palette_key: cfg.palette_key || undefined });
            case 'hex':
                return new Hex_Input({ context, color });
            case 'named': {
                // Named colors palette — same as swatches with css_named palette
                return new Swatch_Grid({ context, color, palette_key: 'css_named' });
            }
            default:
                return null;
        }
    }

    // ── Activation (live DOM) ──

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        // Wire up sync: when any mode control raises 'color-change', sync others
        for (const [mode, ctrl] of Object.entries(this._mode_controls)) {
            ctrl.on('color-change', () => {
                this._on_mode_change(mode);
            });
        }

        // Action buttons
        if (this._btn_cancel && this._btn_cancel.dom.el) {
            this._btn_cancel.dom.el.addEventListener('click', () => {
                this._color.set(this._prev_hex);
                this._sync_all_modes();
                this.raise('cancel', { hex: this._prev_hex });
            });
        }
        if (this._btn_apply && this._btn_apply.dom.el) {
            this._btn_apply.dom.el.addEventListener('click', () => {
                this._prev_hex = this._color.hex;
                this._update_preview();
                this.raise('apply', { value: this.value, hex: this._color.hex });
            });
        }
    }

    _on_mode_change(source_mode) {
        // The source mode already mutated this._color. Sync all other modes.
        for (const [mode, ctrl] of Object.entries(this._mode_controls)) {
            if (mode !== source_mode) {
                ctrl.color = this._color;
            }
        }

        // Update preview
        this._update_preview();

        // Forward change event
        const { r, g, b } = this._color.rgb;
        this.raise('change', {
            value: this.value,
            hex: this._color.hex,
            h: this._color.h, s: this._color.s, l: this._color.l,
            r, g, b, a: this._color.alpha
        });
    }

    _sync_all_modes() {
        for (const ctrl of Object.values(this._mode_controls)) {
            ctrl.color = this._color;
        }
        this._update_preview();
    }

    _update_preview() {
        if (this._preview_new && this._preview_new.dom.el) {
            this._preview_new.dom.el.style.background = this._color.hex;
        }
        if (this._preview_prev && this._preview_prev.dom.el) {
            this._preview_prev.dom.el.style.background = this._prev_hex;
        }
    }
}

// ── Expose variant names ──
Color_Picker_Tabbed.VARIANTS = VARIANTS;
Color_Picker_Tabbed.MODE_META = MODE_META;

// ── Static CSS ──
Color_Picker_Tabbed.css = `
.color-picker-tabbed {
    display: inline-flex;
    flex-direction: column;
    min-width: 220px;
    border-radius: 8px;
    overflow: hidden;
    font-family: var(--admin-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
}
.cpt-preview {
    display: flex; height: 40px; border-top: 1px solid var(--admin-border, #e2e8f0);
}
.cpt-preview-prev, .cpt-preview-new {
    flex: 1;
    transition: background 0.15s;
}
.cpt-preview-prev { border-right: 1px solid rgba(0,0,0,0.1); }
.cpt-actions {
    display: flex; gap: 8px; padding: 8px; justify-content: flex-end;
    border-top: 1px solid var(--admin-border, #e2e8f0);
}
.cpt-btn-cancel, .cpt-btn-apply {
    padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: none;
    transition: background 0.15s;
}
.cpt-btn-cancel {
    background: var(--admin-hover, #f1f5f9); color: var(--admin-muted, #64748b);
}
.cpt-btn-cancel:hover { background: var(--admin-border, #e2e8f0); }
.cpt-btn-apply {
    background: var(--admin-accent, #3b82f6); color: #fff; font-weight: 600;
}
.cpt-btn-apply:hover { filter: brightness(1.1); }
`;

module.exports = Color_Picker_Tabbed;
