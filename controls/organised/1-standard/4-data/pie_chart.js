/**
 * Pie_Chart — SVG pie/donut chart with labels, tooltips, and legend.
 *
 * Options:
 *   data         — Array of { label, value, color? }
 *   width        — SVG width (default 300)
 *   height       — SVG height (default 300)
 *   donut        — If true, renders as donut chart (default false)
 *   donut_width  — Width of donut ring (default 40)
 *   show_legend  — Show legend (default true)
 *   show_labels  — Show percentage labels on slices (default true)
 *
 * Events: slice_click({ item, index })
 */
const Control = require('../../../../html-core/control');
const { prop } = require('obext');

const DEFAULT_COLORS = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

class Pie_Chart extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'pie_chart';
        const cfg_data = spec.data || [];
        super(spec);
        this.add_class('pie-chart');
        this.add_class('jsgui-pie-chart');
        this.dom.tagName = 'div';

        prop(this, 'data', cfg_data, () => this.recompose());
        this.width = spec.width || 300;
        this.height = spec.height || 300;
        this.donut = !!spec.donut;
        this.donut_width = spec.donut_width || 40;
        this.show_legend = spec.show_legend !== false;
        this.show_labels = spec.show_labels !== false;

        if (!spec.el) this.compose();
    }

    compose() {
        const total = this.data.reduce((s, d) => s + d.value, 0);
        if (total === 0) return;

        const svg_size = Math.min(this.width, this.height);
        const cx = svg_size / 2;
        const cy = svg_size / 2;
        const r = (svg_size / 2) - 10;
        const inner_r = this.donut ? r - this.donut_width : 0;

        const svg = new Control({ context: this.context, tag_name: 'svg' });
        svg.add_class('pie-chart-svg');
        svg.dom.attributes.width = String(svg_size);
        svg.dom.attributes.height = String(svg_size);
        svg.dom.attributes.viewBox = `0 0 ${svg_size} ${svg_size}`;
        svg.dom.attributes.xmlns = 'http://www.w3.org/2000/svg';

        let start_angle = -Math.PI / 2;

        this.data.forEach((item, i) => {
            const slice_angle = (item.value / total) * 2 * Math.PI;
            const end_angle = start_angle + slice_angle;
            const color = item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

            // Arc path
            const x1 = cx + r * Math.cos(start_angle);
            const y1 = cy + r * Math.sin(start_angle);
            const x2 = cx + r * Math.cos(end_angle);
            const y2 = cy + r * Math.sin(end_angle);
            const large_arc = slice_angle > Math.PI ? 1 : 0;

            let d;
            if (inner_r > 0) {
                // Donut
                const ix1 = cx + inner_r * Math.cos(start_angle);
                const iy1 = cy + inner_r * Math.sin(start_angle);
                const ix2 = cx + inner_r * Math.cos(end_angle);
                const iy2 = cy + inner_r * Math.sin(end_angle);
                d = `M ${x1} ${y1} A ${r} ${r} 0 ${large_arc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner_r} ${inner_r} 0 ${large_arc} 0 ${ix1} ${iy1} Z`;
            } else {
                // Full pie
                d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large_arc} 1 ${x2} ${y2} Z`;
            }

            const path = new Control({ context: this.context, tag_name: 'path' });
            path.add_class('pie-chart-slice');
            path.dom.attributes.d = d;
            path.dom.attributes.fill = color;
            path.dom.attributes['data-index'] = String(i);
            path.dom.attributes['data-value'] = String(item.value);
            path.dom.attributes['data-label'] = item.label || '';
            svg.add(path);

            // Percentage label
            if (this.show_labels && slice_angle > 0.3) {
                const mid_angle = start_angle + slice_angle / 2;
                const label_r = this.donut ? (r + inner_r) / 2 : r * 0.65;
                const lx = cx + label_r * Math.cos(mid_angle);
                const ly = cy + label_r * Math.sin(mid_angle);
                const pct = Math.round((item.value / total) * 100);

                const label = new Control({ context: this.context, tag_name: 'text' });
                label.add_class('pie-chart-label');
                label.dom.attributes.x = String(Math.round(lx));
                label.dom.attributes.y = String(Math.round(ly));
                label.add(`${pct}%`);
                svg.add(label);
            }

            start_angle = end_angle;
        });

        this.add(svg);

        // Legend
        if (this.show_legend) {
            const legend = new Control({ context: this.context, tag_name: 'div' });
            legend.add_class('pie-chart-legend');

            this.data.forEach((item, i) => {
                const entry = new Control({ context: this.context, tag_name: 'div' });
                entry.add_class('pie-chart-legend-item');

                const dot = new Control({ context: this.context, tag_name: 'span' });
                dot.add_class('pie-chart-legend-dot');
                const color = item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
                dot.dom.attributes.style = `background:${color}`;
                entry.add(dot);

                const lbl = new Control({ context: this.context, tag_name: 'span' });
                lbl.add_class('pie-chart-legend-label');
                lbl.add(item.label || '');
                entry.add(lbl);

                const val = new Control({ context: this.context, tag_name: 'span' });
                val.add_class('pie-chart-legend-value');
                val.add(String(item.value));
                entry.add(val);

                legend.add(entry);
            });

            this.add(legend);
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            this.dom.el.addEventListener('click', e => {
                const slice = e.target.closest('.pie-chart-slice');
                if (!slice) return;
                const index = parseInt(slice.getAttribute('data-index'), 10);
                this.raise('slice_click', { item: this.data[index], index });
            });
        }
    }
}

Pie_Chart.css = `
.pie-chart { display: inline-flex; flex-direction: column; align-items: center; gap: 12px; }
.pie-chart-slice { transition: opacity 0.15s; cursor: pointer; }
.pie-chart-slice:hover { opacity: 0.8; }
.pie-chart-label { font-size: 12px; text-anchor: middle; fill: #fff; font-weight: 600; pointer-events: none; dominant-baseline: middle; }
.pie-chart-legend { display: flex; flex-wrap: wrap; gap: 8px; }
.pie-chart-legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.pie-chart-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
`;

module.exports = Pie_Chart;
