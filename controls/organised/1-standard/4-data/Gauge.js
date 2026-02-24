/**
 * Gauge — Radial gauge / speedometer chart.
 *
 * Options:
 *   value        — Current value (default 0)
 *   min          — Minimum (default 0)
 *   max          — Maximum (default 100)
 *   size         — SVG size in px (default 160)
 *   label        — Centre label (default: formatted value)
 *   unit         — Unit suffix (e.g. '%', 'km/h')
 *   thresholds   — Array of { value, color } for multi-zone coloring
 *   color        — Fill color if no thresholds (default '#3b82f6')
 *   track_color  — Background arc (default '#e2e8f0')
 *   stroke_width — Arc thickness (default 12)
 *   start_angle  — Degrees from bottom-left (default 135)
 *   end_angle    — Degrees to bottom-right (default 405)
 *   show_ticks   — Show tick marks (default false)
 *   show_labels  — Show min/max labels (default true)
 */
const Control = require('../../../../html-core/control');
const { prop } = require('obext');

class Gauge extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'gauge';

        // Extract all gauge-specific properties BEFORE super()
        // to prevent base Control from trying to interpret them
        const gauge_props = [
            'value', 'min', 'max', 'size', 'label', 'unit',
            'thresholds', 'color', 'track_color', 'stroke_width',
            'start_angle', 'end_angle', 'show_ticks', 'show_labels'
        ];
        const cfg = {};
        for (const k of gauge_props) {
            if (k in spec) { cfg[k] = spec[k]; delete spec[k]; }
        }

        super(spec);
        this.add_class('jsgui-gauge');

        // Reactive: setting .value auto-recomposes the SVG
        prop(this, 'value', cfg.value || 0, () => this.recompose());
        this.min = cfg.min || 0;
        this.max = cfg.max || 100;
        this._size = cfg.size || 160;
        this._gauge_label = cfg.label;
        this.unit = cfg.unit || '';
        this.thresholds = cfg.thresholds || null;
        this.color = cfg.color || '#3b82f6';
        this.track_color = cfg.track_color || 'var(--j-bg-muted, #e2e8f0)';
        this.stroke_width = cfg.stroke_width || 12;
        this.start_angle = cfg.start_angle || 135;
        this.end_angle = cfg.end_angle || 405;
        this.show_ticks = !!cfg.show_ticks;
        this.show_labels = cfg.show_labels !== false;

        if (!spec.el) this.compose();
    }

    _deg_to_rad(deg) {
        return (deg * Math.PI) / 180;
    }

    _arc_path(cx, cy, r, start_deg, end_deg) {
        const start = this._deg_to_rad(start_deg);
        const end = this._deg_to_rad(end_deg);
        const x1 = cx + r * Math.cos(start);
        const y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end);
        const y2 = cy + r * Math.sin(end);
        const sweep = end_deg - start_deg;
        const large = sweep > 180 ? 1 : 0;
        return `M ${x1.toFixed(2)},${y1.toFixed(2)} A ${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
    }

    _get_fill_color(val) {
        if (!this.thresholds || !this.thresholds.length) return this.color;
        const sorted = [...this.thresholds].sort((a, b) => a.value - b.value);
        let c = sorted[0].color;
        for (const t of sorted) {
            if (val >= t.value) c = t.color;
        }
        return c;
    }

    compose() {
        const half = this._size / 2;
        const r = half - this.stroke_width / 2 - 4;
        const cx = half;
        const cy = half;
        const total_angle = this.end_angle - this.start_angle;
        const pct = Math.max(0, Math.min(1, (this.value - this.min) / (this.max - this.min || 1)));
        const value_angle = this.start_angle + pct * total_angle;
        const fill_color = this._get_fill_color(this.value);

        const svg = new Control({ context: this.context, tag_name: 'svg' });
        svg.add_class('gauge-svg');
        svg.dom.attributes.width = String(this._size);
        svg.dom.attributes.height = String(this._size);
        svg.dom.attributes.viewBox = `0 0 ${this._size} ${this._size}`;
        svg.dom.attributes.xmlns = 'http://www.w3.org/2000/svg';

        // Track arc
        const track = new Control({ context: this.context, tag_name: 'path' });
        track.add_class('gauge-track');
        track.dom.attributes.d = this._arc_path(cx, cy, r, this.start_angle, this.end_angle);
        track.dom.attributes.fill = 'none';
        track.dom.attributes.stroke = this.track_color;
        track.dom.attributes['stroke-width'] = String(this.stroke_width);
        track.dom.attributes['stroke-linecap'] = 'round';
        svg.add(track);

        // Value arc
        if (pct > 0.005) {
            const val_arc = new Control({ context: this.context, tag_name: 'path' });
            val_arc.add_class('gauge-fill');
            val_arc.dom.attributes.d = this._arc_path(cx, cy, r, this.start_angle, value_angle);
            val_arc.dom.attributes.fill = 'none';
            val_arc.dom.attributes.stroke = fill_color;
            val_arc.dom.attributes['stroke-width'] = String(this.stroke_width);
            val_arc.dom.attributes['stroke-linecap'] = 'round';
            svg.add(val_arc);
        }

        // Tick marks
        if (this.show_ticks) {
            const tick_g = new Control({ context: this.context, tag_name: 'g' });
            tick_g.add_class('gauge-ticks');
            const num_ticks = 10;
            for (let i = 0; i <= num_ticks; i++) {
                const angle = this._deg_to_rad(this.start_angle + (i / num_ticks) * total_angle);
                const is_major = i % 5 === 0;
                const outer_r = r + this.stroke_width / 2 + 2;
                const inner_r = outer_r - (is_major ? 8 : 4);
                const tick = new Control({ context: this.context, tag_name: 'line' });
                tick.dom.attributes.x1 = (cx + inner_r * Math.cos(angle)).toFixed(2);
                tick.dom.attributes.y1 = (cy + inner_r * Math.sin(angle)).toFixed(2);
                tick.dom.attributes.x2 = (cx + outer_r * Math.cos(angle)).toFixed(2);
                tick.dom.attributes.y2 = (cy + outer_r * Math.sin(angle)).toFixed(2);
                tick.dom.attributes.stroke = 'var(--j-fg-subtle, #94a3b8)';
                tick.dom.attributes['stroke-width'] = is_major ? '2' : '1';
                tick_g.add(tick);
            }
            svg.add(tick_g);
        }

        // Centre label
        const display_val = this._gauge_label !== undefined ? this._gauge_label : Math.round(this.value);
        const val_text = new Control({ context: this.context, tag_name: 'text' });
        val_text.add_class('gauge-value');
        val_text.dom.attributes.x = String(cx);
        val_text.dom.attributes.y = String(cy + 4);
        val_text.dom.attributes['text-anchor'] = 'middle';
        val_text.dom.attributes['dominant-baseline'] = 'middle';
        val_text.dom.attributes.fill = 'var(--j-fg, #1e293b)';
        val_text.dom.attributes['font-size'] = String(Math.round(this._size / 5));
        val_text.dom.attributes['font-weight'] = '700';
        val_text.dom.attributes['font-family'] = 'var(--j-font-sans, sans-serif)';
        val_text.add(String(display_val) + this.unit);
        svg.add(val_text);

        // Min / Max labels
        if (this.show_labels) {
            const label_r = r + this.stroke_width / 2 + 14;

            const min_angle = this._deg_to_rad(this.start_angle);
            const min_text = new Control({ context: this.context, tag_name: 'text' });
            min_text.add_class('gauge-label-min');
            min_text.dom.attributes.x = (cx + label_r * Math.cos(min_angle)).toFixed(1);
            min_text.dom.attributes.y = (cy + label_r * Math.sin(min_angle)).toFixed(1);
            min_text.dom.attributes['text-anchor'] = 'middle';
            min_text.dom.attributes.fill = 'var(--j-fg-subtle, #94a3b8)';
            min_text.dom.attributes['font-size'] = '10';
            min_text.dom.attributes['font-family'] = 'var(--j-font-sans, sans-serif)';
            min_text.add(String(this.min));
            svg.add(min_text);

            const max_angle = this._deg_to_rad(this.end_angle);
            const max_text = new Control({ context: this.context, tag_name: 'text' });
            max_text.add_class('gauge-label-max');
            max_text.dom.attributes.x = (cx + label_r * Math.cos(max_angle)).toFixed(1);
            max_text.dom.attributes.y = (cy + label_r * Math.sin(max_angle)).toFixed(1);
            max_text.dom.attributes['text-anchor'] = 'middle';
            max_text.dom.attributes.fill = 'var(--j-fg-subtle, #94a3b8)';
            max_text.dom.attributes['font-size'] = '10';
            max_text.dom.attributes['font-family'] = 'var(--j-font-sans, sans-serif)';
            max_text.add(String(this.max));
            svg.add(max_text);
        }

        this.add(svg);
    }

}

Gauge.css = `
.jsgui-gauge {
    display: inline-block;
}
.jsgui-gauge svg {
    display: block;
}
`;

module.exports = Gauge;
