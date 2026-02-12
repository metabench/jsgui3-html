/**
 * Bar_Chart — Simple SVG bar chart with labels, values, and tooltips.
 *
 * Options:
 *   data       — Array of { label, value, color? }
 *   width      — SVG width (default 400)
 *   height     — SVG height (default 250)
 *   bar_gap    — Gap between bars (default 4)
 *   show_labels — Show x-axis labels (default true)
 *   show_values — Show values on bars (default true)
 *   orientation — 'vertical' | 'horizontal' (default 'vertical')
 *
 * Events: bar_click({ item, index })
 */
const Control = require('../../../../html-core/control');
const { prop } = require('obext');

const DEFAULT_COLORS = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

class Bar_Chart extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'bar_chart';
        const cfg_data = spec.data || [];
        super(spec);
        this.add_class('bar-chart');
        this.add_class('jsgui-bar-chart');
        this.dom.tagName = 'div';

        prop(this, 'data', cfg_data, () => this.recompose());
        this.width = spec.width || 400;
        this.height = spec.height || 250;
        this.bar_gap = spec.bar_gap || 4;
        this.show_labels = spec.show_labels !== false;
        this.show_values = spec.show_values !== false;
        this.orientation = spec.orientation || 'vertical';

        if (!spec.el) this.compose();
    }

    compose() {
        const svg = new Control({ context: this.context, tag_name: 'svg' });
        svg.add_class('bar-chart-svg');
        svg.dom.attributes.width = String(this.width);
        svg.dom.attributes.height = String(this.height);
        svg.dom.attributes.viewBox = `0 0 ${this.width} ${this.height}`;
        svg.dom.attributes.xmlns = 'http://www.w3.org/2000/svg';

        if (this.data.length === 0) {
            this.add(svg);
            return;
        }

        const max_val = Math.max(...this.data.map(d => d.value), 1);
        const padding = { top: 20, right: 20, bottom: this.show_labels ? 40 : 20, left: 50 };
        const chart_w = this.width - padding.left - padding.right;
        const chart_h = this.height - padding.top - padding.bottom;

        // Y-axis gridlines
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chart_h * (1 - i / 4));
            const line = new Control({ context: this.context, tag_name: 'line' });
            line.dom.attributes.x1 = String(padding.left);
            line.dom.attributes.y1 = String(y);
            line.dom.attributes.x2 = String(this.width - padding.right);
            line.dom.attributes.y2 = String(y);
            line.add_class('bar-chart-grid');
            svg.add(line);

            // Y-axis label
            const label = new Control({ context: this.context, tag_name: 'text' });
            label.dom.attributes.x = String(padding.left - 8);
            label.dom.attributes.y = String(y + 4);
            label.add_class('bar-chart-y-label');
            label.add(String(Math.round(max_val * i / 4)));
            svg.add(label);
        }

        // Bars
        const bar_w = (chart_w - this.bar_gap * (this.data.length - 1)) / this.data.length;

        this.data.forEach((item, i) => {
            const x = padding.left + i * (bar_w + this.bar_gap);
            const bar_h = (item.value / max_val) * chart_h;
            const y = padding.top + chart_h - bar_h;
            const color = item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

            const rect = new Control({ context: this.context, tag_name: 'rect' });
            rect.add_class('bar-chart-bar');
            rect.dom.attributes.x = String(x);
            rect.dom.attributes.y = String(y);
            rect.dom.attributes.width = String(Math.max(bar_w, 1));
            rect.dom.attributes.height = String(Math.max(bar_h, 0));
            rect.dom.attributes.fill = color;
            rect.dom.attributes.rx = '3';
            rect.dom.attributes['data-index'] = String(i);
            rect.dom.attributes['data-value'] = String(item.value);
            svg.add(rect);

            // Value label on bar
            if (this.show_values && bar_h > 16) {
                const val_label = new Control({ context: this.context, tag_name: 'text' });
                val_label.dom.attributes.x = String(x + bar_w / 2);
                val_label.dom.attributes.y = String(y + 14);
                val_label.add_class('bar-chart-val');
                val_label.add(String(item.value));
                svg.add(val_label);
            }

            // X-axis label
            if (this.show_labels) {
                const x_label = new Control({ context: this.context, tag_name: 'text' });
                x_label.dom.attributes.x = String(x + bar_w / 2);
                x_label.dom.attributes.y = String(this.height - 8);
                x_label.add_class('bar-chart-x-label');
                x_label.add(item.label || '');
                svg.add(x_label);
            }
        });

        this.add(svg);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            this.dom.el.addEventListener('click', e => {
                const bar = e.target.closest('.bar-chart-bar');
                if (!bar) return;
                const index = parseInt(bar.getAttribute('data-index'), 10);
                this.raise('bar_click', { item: this.data[index], index });
            });
        }
    }
}

Bar_Chart.css = `
.bar-chart { display: inline-block; }
.bar-chart-grid { stroke: #e5e7eb; stroke-width: 1; }
.bar-chart-y-label { font-size: 11px; text-anchor: end; fill: #6b7280; }
.bar-chart-x-label { font-size: 11px; text-anchor: middle; fill: #6b7280; }
.bar-chart-val { font-size: 11px; text-anchor: middle; fill: #fff; font-weight: 600; }
.bar-chart-bar { transition: opacity 0.15s; cursor: pointer; }
.bar-chart-bar:hover { opacity: 0.8; }
`;

module.exports = Bar_Chart;
