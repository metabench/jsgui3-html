/**
 * Area_Chart — SVG area/line chart with gradient fills.
 *
 * Options:
 *   data         — Array of { label, value } or just numbers
 *   series       — Array of { data: [...], color, label } for multi-series
 *   width        — SVG width (default 400)
 *   height       — SVG height (default 200)
 *   show_grid    — Show horizontal grid lines (default true)
 *   show_dots    — Show data point dots (default false)
 *   show_labels  — Show x-axis labels (default true)
 *   show_y_axis  — Show y-axis labels (default true)
 *   smooth       — Use smooth curves (default true)
 *   stacked      — Stack multiple series (default false)
 *   fill_opacity — Gradient fill opacity (default 0.25)
 *   line_width   — Stroke width (default 2)
 *   colors       — Custom color palette
 */
const Control = require('../../../../html-core/control');
const { prop } = require('obext');

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

class Area_Chart extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'area_chart';
        const cfg_data = spec.data;
        const cfg_series = spec.series;
        super(spec);
        this.add_class('jsgui-area-chart');

        this.width = spec.width || 400;
        this.height = spec.height || 200;
        this.show_grid = spec.show_grid !== false;
        this.show_dots = !!spec.show_dots;
        this.show_labels = spec.show_labels !== false;
        this.show_y_axis = spec.show_y_axis !== false;
        this.smooth = spec.smooth !== false;
        this.stacked = !!spec.stacked;
        this.fill_opacity = spec.fill_opacity || 0.25;
        this.line_width = spec.line_width || 2;
        this.colors = spec.colors || DEFAULT_COLORS;

        // Normalise data into series format
        if (cfg_series) {
            this.series = cfg_series;
        } else if (cfg_data) {
            const items = cfg_data.map(d => typeof d === 'number' ? { value: d } : d);
            this.series = [{
                data: items.map(d => d.value),
                labels: items.map(d => d.label || ''),
                color: this.colors[0],
                label: spec.label || ''
            }];
        } else {
            this.series = [];
        }

        if (!spec.el) this.compose();
    }

    compose() {
        if (!this.series.length || !this.series[0].data.length) return;

        const pad = { top: 10, right: 10, bottom: this.show_labels ? 28 : 10, left: this.show_y_axis ? 40 : 10 };
        const cw = this.width - pad.left - pad.right;
        const ch = this.height - pad.top - pad.bottom;

        // Compute global min/max
        let all_vals = [];
        for (const s of this.series) all_vals.push(...s.data);
        const min_v = Math.min(0, ...all_vals);
        const max_v = Math.max(...all_vals) || 1;
        const range = max_v - min_v || 1;

        const svg = new Control({ context: this.context, tag_name: 'svg' });
        svg.add_class('area-chart-svg');
        svg.dom.attributes.width = String(this.width);
        svg.dom.attributes.height = String(this.height);
        svg.dom.attributes.viewBox = `0 0 ${this.width} ${this.height}`;
        svg.dom.attributes.xmlns = 'http://www.w3.org/2000/svg';

        // Defs for gradients
        const defs = new Control({ context: this.context, tag_name: 'defs' });
        this.series.forEach((s, si) => {
            const color = s.color || this.colors[si % this.colors.length];
            const grad = new Control({ context: this.context, tag_name: 'linearGradient' });
            grad.dom.attributes.id = `area-grad-${si}`;
            grad.dom.attributes.x1 = '0'; grad.dom.attributes.y1 = '0';
            grad.dom.attributes.x2 = '0'; grad.dom.attributes.y2 = '1';

            const stop1 = new Control({ context: this.context, tag_name: 'stop' });
            stop1.dom.attributes.offset = '0%';
            stop1.dom.attributes['stop-color'] = color;
            stop1.dom.attributes['stop-opacity'] = String(this.fill_opacity);

            const stop2 = new Control({ context: this.context, tag_name: 'stop' });
            stop2.dom.attributes.offset = '100%';
            stop2.dom.attributes['stop-color'] = color;
            stop2.dom.attributes['stop-opacity'] = '0.02';

            grad.add(stop1);
            grad.add(stop2);
            defs.add(grad);
        });
        svg.add(defs);

        // Grid lines
        if (this.show_grid) {
            const grid_g = new Control({ context: this.context, tag_name: 'g' });
            grid_g.add_class('area-chart-grid');
            const steps = 4;
            for (let i = 0; i <= steps; i++) {
                const y = pad.top + (i / steps) * ch;
                const line = new Control({ context: this.context, tag_name: 'line' });
                line.dom.attributes.x1 = String(pad.left);
                line.dom.attributes.y1 = String(y.toFixed(1));
                line.dom.attributes.x2 = String(pad.left + cw);
                line.dom.attributes.y2 = String(y.toFixed(1));
                line.dom.attributes.stroke = 'var(--j-border, #e2e8f0)';
                line.dom.attributes['stroke-dasharray'] = '3,3';
                line.dom.attributes['stroke-width'] = '0.5';
                grid_g.add(line);
            }
            svg.add(grid_g);
        }

        // Y-axis labels
        if (this.show_y_axis) {
            const ya_g = new Control({ context: this.context, tag_name: 'g' });
            ya_g.add_class('area-chart-y-axis');
            const steps = 4;
            for (let i = 0; i <= steps; i++) {
                const y = pad.top + (i / steps) * ch;
                const val = max_v - (i / steps) * range;
                const txt = new Control({ context: this.context, tag_name: 'text' });
                txt.dom.attributes.x = String(pad.left - 4);
                txt.dom.attributes.y = String(y.toFixed(1));
                txt.dom.attributes['text-anchor'] = 'end';
                txt.dom.attributes['dominant-baseline'] = 'middle';
                txt.dom.attributes.fill = 'var(--j-fg-subtle, #94a3b8)';
                txt.dom.attributes['font-size'] = '10';
                txt.dom.attributes['font-family'] = 'var(--j-font-sans, sans-serif)';
                txt.add(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val).toString());
                ya_g.add(txt);
            }
            svg.add(ya_g);
        }

        // Plot each series
        this.series.forEach((s, si) => {
            const color = s.color || this.colors[si % this.colors.length];
            const n = s.data.length;

            const pts = s.data.map((v, i) => ({
                x: pad.left + (i / (n - 1)) * cw,
                y: pad.top + (1 - (v - min_v) / range) * ch
            }));

            // Build path
            let d;
            if (this.smooth && n > 2) {
                d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
                for (let i = 1; i < n; i++) {
                    const p0 = pts[i - 1];
                    const p1 = pts[i];
                    const cpx = (p0.x + p1.x) / 2;
                    d += ` C ${cpx.toFixed(1)},${p0.y.toFixed(1)} ${cpx.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
                }
            } else {
                d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            }

            // Fill area
            const baseline_y = pad.top + ch;
            const fill_d = d + ` L ${pts[n - 1].x.toFixed(1)},${baseline_y.toFixed(1)} L ${pts[0].x.toFixed(1)},${baseline_y.toFixed(1)} Z`;
            const area = new Control({ context: this.context, tag_name: 'path' });
            area.add_class('area-chart-fill');
            area.dom.attributes.d = fill_d;
            area.dom.attributes.fill = `url(#area-grad-${si})`;
            svg.add(area);

            // Stroke
            const line = new Control({ context: this.context, tag_name: 'path' });
            line.add_class('area-chart-line');
            line.dom.attributes.d = d;
            line.dom.attributes.fill = 'none';
            line.dom.attributes.stroke = color;
            line.dom.attributes['stroke-width'] = String(this.line_width);
            line.dom.attributes['stroke-linecap'] = 'round';
            line.dom.attributes['stroke-linejoin'] = 'round';
            svg.add(line);

            // Dots
            if (this.show_dots) {
                const dots_g = new Control({ context: this.context, tag_name: 'g' });
                dots_g.add_class('area-chart-dots');
                pts.forEach(p => {
                    const dot = new Control({ context: this.context, tag_name: 'circle' });
                    dot.dom.attributes.cx = p.x.toFixed(1);
                    dot.dom.attributes.cy = p.y.toFixed(1);
                    dot.dom.attributes.r = '3';
                    dot.dom.attributes.fill = color;
                    dot.dom.attributes.stroke = 'var(--j-bg, #fff)';
                    dot.dom.attributes['stroke-width'] = '1.5';
                    dots_g.add(dot);
                });
                svg.add(dots_g);
            }
        });

        // X-axis labels
        if (this.show_labels) {
            const labels = this.series[0].labels || this.series[0].data.map((_, i) => String(i + 1));
            const xa_g = new Control({ context: this.context, tag_name: 'g' });
            xa_g.add_class('area-chart-x-axis');
            const n = labels.length;

            // Show at most 8 labels to avoid overlap
            const step = Math.max(1, Math.ceil(n / 8));
            for (let i = 0; i < n; i += step) {
                const x = pad.left + (i / (n - 1)) * cw;
                const txt = new Control({ context: this.context, tag_name: 'text' });
                txt.dom.attributes.x = x.toFixed(1);
                txt.dom.attributes.y = String(this.height - 4);
                txt.dom.attributes['text-anchor'] = 'middle';
                txt.dom.attributes.fill = 'var(--j-fg-subtle, #94a3b8)';
                txt.dom.attributes['font-size'] = '10';
                txt.dom.attributes['font-family'] = 'var(--j-font-sans, sans-serif)';
                txt.add(labels[i] || '');
                xa_g.add(txt);
            }
            svg.add(xa_g);
        }

        this.add(svg);
    }

    set_data(data) {
        const items = data.map(d => typeof d === 'number' ? { value: d } : d);
        this.series = [{
            data: items.map(d => d.value),
            labels: items.map(d => d.label || ''),
            color: this.colors[0]
        }];
        this.recompose();
    }
}

Area_Chart.css = `
.jsgui-area-chart {
    display: inline-block;
}
.jsgui-area-chart svg {
    display: block;
}
`;

module.exports = Area_Chart;
