/**
 * Sparkline — Tiny inline SVG line chart for compact data visualization.
 *
 * Options:
 *   data         — Array of numbers
 *   width        — SVG width (default 120)
 *   height       — SVG height (default 32)
 *   stroke_color — Line color (default '#3b82f6')
 *   fill         — Fill area under line (default false)
 *   show_dot     — Show dot on last point (default true)
 *   line_width   — Stroke width (default 1.5)
 */
const Control = require('../../../../html-core/control');
const { prop } = require('obext');

class Sparkline extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'sparkline';
        super(spec);
        this.add_class('sparkline');
        this.add_class('jsgui-sparkline');
        this.dom.tagName = 'span';

        // Reactive: setting .data auto-recomposes the SVG
        prop(this, 'data', spec.data || [], () => this.recompose());
        this.width = spec.width || 120;
        this.height = spec.height || 32;
        this.stroke_color = spec.stroke_color || '#3b82f6';
        this.fill = !!spec.fill;
        this.show_dot = spec.show_dot !== false;
        this.line_width = spec.line_width || 1.5;

        if (!spec.el) this.compose();
    }

    compose() {
        if (this.data.length < 2) return;

        const svg = new Control({ context: this.context, tag_name: 'svg' });
        svg.add_class('sparkline-svg');
        svg.dom.attributes.width = String(this.width);
        svg.dom.attributes.height = String(this.height);
        svg.dom.attributes.viewBox = `0 0 ${this.width} ${this.height}`;
        svg.dom.attributes.xmlns = 'http://www.w3.org/2000/svg';

        const min_val = Math.min(...this.data);
        const max_val = Math.max(...this.data);
        const range = max_val - min_val || 1;
        const padding = 2;

        const points = this.data.map((v, i) => {
            const x = padding + (i / (this.data.length - 1)) * (this.width - padding * 2);
            const y = padding + (1 - (v - min_val) / range) * (this.height - padding * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });

        // Fill area
        if (this.fill) {
            const first_x = padding;
            const last_x = padding + (this.width - padding * 2);
            const fill_d = `M ${first_x},${this.height - padding} L ${points.join(' L ')} L ${last_x},${this.height - padding} Z`;

            const fill_path = new Control({ context: this.context, tag_name: 'path' });
            fill_path.add_class('sparkline-fill');
            fill_path.dom.attributes.d = fill_d;
            fill_path.dom.attributes.fill = this.stroke_color;
            fill_path.dom.attributes['fill-opacity'] = '0.15';
            svg.add(fill_path);
        }

        // Line
        const polyline = new Control({ context: this.context, tag_name: 'polyline' });
        polyline.add_class('sparkline-line');
        polyline.dom.attributes.points = points.join(' ');
        polyline.dom.attributes.fill = 'none';
        polyline.dom.attributes.stroke = this.stroke_color;
        polyline.dom.attributes['stroke-width'] = String(this.line_width);
        polyline.dom.attributes['stroke-linecap'] = 'round';
        polyline.dom.attributes['stroke-linejoin'] = 'round';
        svg.add(polyline);

        // Last-point dot
        if (this.show_dot) {
            const last_point = points[points.length - 1].split(',');
            const dot = new Control({ context: this.context, tag_name: 'circle' });
            dot.add_class('sparkline-dot');
            dot.dom.attributes.cx = last_point[0];
            dot.dom.attributes.cy = last_point[1];
            dot.dom.attributes.r = '2.5';
            dot.dom.attributes.fill = this.stroke_color;
            svg.add(dot);
        }

        this.add(svg);
    }

}

Sparkline.css = `
.sparkline {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}
`;

module.exports = Sparkline;
