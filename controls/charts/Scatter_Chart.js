/**
 * Scatter Chart Control
 * 
 * Displays data as scattered points on a 2D coordinate system.
 * Supports multiple data series with optional trend lines.
 * 
 * @example
 * new Scatter_Chart({
 *     data: {
 *         series: [{
 *             name: 'Sample',
 *             points: [
 *                 { x: 10, y: 20 },
 *                 { x: 25, y: 35 },
 *                 { x: 40, y: 30 }
 *             ]
 *         }]
 *     }
 * });
 */

const Chart_Base = require('./Chart_Base');

class Scatter_Chart extends Chart_Base {
    /**
     * Create a Scatter Chart.
     * @param {Object} spec - Control specification
     * @param {number} [spec.point_size=6] - Default point radius
     * @param {string} [spec.point_shape='circle'] - 'circle', 'square', or 'diamond'
     * @param {boolean} [spec.show_trend_line=false] - Show linear trend line
     */
    constructor(spec = {}) {
        spec.__type_name = 'scatter_chart';
        super(spec);

        this._point_size = spec.point_size !== undefined ? spec.point_size : 6;
        this._point_shape = spec.point_shape || 'circle';
        this._show_trend_line = spec.show_trend_line === true;

        this.add_class('scatter-chart');

        // Re-render now that properties are set
        if (!spec.abstract && !spec.el && this._svg) {
            this.render_chart();
        }
    }

    /**
     * Override set_data to handle scatter data format.
     */
    set_data(data) {
        if (data.series) {
            this._series = this._normalize_scatter_series(data.series);
            this.data.model.series = this._series;
        }
    }

    /**
     * Normalize scatter series to consistent format.
     * @private
     */
    _normalize_scatter_series(series) {
        if (!Array.isArray(series)) return [];

        return series.map((s, index) => {
            let points = [];

            if (s.points) {
                // Direct points array: [{ x, y }, ...]
                points = s.points.map(p => ({
                    x: p.x,
                    y: p.y,
                    label: p.label
                }));
            } else if (s.values && Array.isArray(s.values)) {
                // Handle standard adapter output where points are in 'values'
                points = s.values.map(p => ({
                    x: p.x,
                    y: p.y,
                    label: p.label
                }));
            } else if (s.x && s.y && Array.isArray(s.x) && Array.isArray(s.y)) {
                // Separate x/y arrays
                const len = Math.min(s.x.length, s.y.length);
                for (let i = 0; i < len; i++) {
                    points.push({ x: s.x[i], y: s.y[i] });
                }
            }

            return {
                name: s.name || `Series ${index + 1}`,
                points: points,
                color: s.color || this._palette[index % this._palette.length]
            };
        }).filter(s => s.points.length > 0);
    }

    /**
     * Get X/Y ranges from scatter data.
     */
    get_scatter_range() {
        if (!this._series || !this._series.length) {
            return { x_min: 0, x_max: 100, y_min: 0, y_max: 100 };
        }

        let x_min = Infinity, x_max = -Infinity;
        let y_min = Infinity, y_max = -Infinity;

        for (const series of this._series) {
            for (const point of series.points) {
                if (point.x < x_min) x_min = point.x;
                if (point.x > x_max) x_max = point.x;
                if (point.y < y_min) y_min = point.y;
                if (point.y > y_max) y_max = point.y;
            }
        }

        // Add padding
        const x_range = x_max - x_min;
        const y_range = y_max - y_min;
        x_min = Math.floor(x_min - x_range * 0.1);
        x_max = Math.ceil(x_max + x_range * 0.1);
        y_min = Math.floor(y_min - y_range * 0.1);
        y_max = Math.ceil(y_max + y_range * 0.1);

        // Include 0 if close
        if (x_min > 0 && x_min < x_max * 0.2) x_min = 0;
        if (y_min > 0 && y_min < y_max * 0.2) y_min = 0;

        return { x_min, x_max, y_min, y_max };
    }

    /**
     * Convert X value to pixel position.
     */
    x_to_pixel(value) {
        const { x_min, x_max } = this.get_scatter_range();
        const area = this.get_chart_area();
        const scale = area.width / (x_max - x_min);
        return area.x + (value - x_min) * scale;
    }

    /**
     * Convert Y value to pixel position.
     */
    y_to_pixel(value) {
        const { y_min, y_max } = this.get_scatter_range();
        const area = this.get_chart_area();
        const scale = area.height / (y_max - y_min);
        return area.y + area.height - (value - y_min) * scale;
    }

    /**
     * Render the scatter chart content.
     */
    render_chart() {
        if (!this._svg) return;

        this._svg.clear();

        if (this._show_grid) {
            this.render_scatter_grid();
        }

        this.render_axes();

        const show_trend = this._show_trend_line !== undefined ? this._show_trend_line : false;
        if (show_trend) {
            this.render_trend_lines();
        }

        this.render_points();
    }

    /**
     * Render grid for scatter chart.
     */
    render_scatter_grid() {
        const area = this.get_chart_area();
        const { x_min, x_max, y_min, y_max } = this.get_scatter_range();
        const grid = this.svg_element('g', { 'class': 'chart-grid' });

        // Horizontal grid lines
        const y_steps = 5;
        const y_step = (y_max - y_min) / y_steps;
        for (let i = 0; i <= y_steps; i++) {
            const value = y_min + i * y_step;
            const y = this.y_to_pixel(value);

            const line = this.svg_element('line', {
                'x1': area.x,
                'y1': y,
                'x2': area.x + area.width,
                'y2': y,
                'stroke': '#e0e0e0',
                'stroke-width': 1
            });
            grid.add(line);
        }

        // Vertical grid lines
        const x_steps = 5;
        const x_step = (x_max - x_min) / x_steps;
        for (let i = 0; i <= x_steps; i++) {
            const value = x_min + i * x_step;
            const x = this.x_to_pixel(value);

            const line = this.svg_element('line', {
                'x1': x,
                'y1': area.y,
                'x2': x,
                'y2': area.y + area.height,
                'stroke': '#e0e0e0',
                'stroke-width': 1
            });
            grid.add(line);
        }

        this._svg.add(grid);
    }

    /**
     * Render axes with labels.
     */
    render_axes() {
        const area = this.get_chart_area();
        const { x_min, x_max, y_min, y_max } = this.get_scatter_range();
        const axes = this.svg_element('g', { 'class': 'chart-axes' });

        // Y-axis
        const y_axis = this.svg_element('line', {
            'x1': area.x,
            'y1': area.y,
            'x2': area.x,
            'y2': area.y + area.height,
            'stroke': '#333',
            'stroke-width': 1
        });
        axes.add(y_axis);

        // X-axis
        const x_axis = this.svg_element('line', {
            'x1': area.x,
            'y1': area.y + area.height,
            'x2': area.x + area.width,
            'y2': area.y + area.height,
            'stroke': '#333',
            'stroke-width': 1
        });
        axes.add(x_axis);

        // Y-axis labels
        const y_steps = 5;
        const y_step = (y_max - y_min) / y_steps;
        for (let i = 0; i <= y_steps; i++) {
            const value = y_min + i * y_step;
            const y = this.y_to_pixel(value);

            const label = this.svg_element('text', {
                'x': area.x - 8,
                'y': y + 4,
                'text-anchor': 'end',
                'font-size': 10,
                'fill': '#666'
            });
            label.add(Math.round(value).toString());
            axes.add(label);
        }

        // X-axis labels
        const x_steps = 5;
        const x_step = (x_max - x_min) / x_steps;
        for (let i = 0; i <= x_steps; i++) {
            const value = x_min + i * x_step;
            const x = this.x_to_pixel(value);

            const label = this.svg_element('text', {
                'x': x,
                'y': area.y + area.height + 16,
                'text-anchor': 'middle',
                'font-size': 10,
                'fill': '#666'
            });
            label.add(Math.round(value).toString());
            axes.add(label);
        }

        this._svg.add(axes);
    }

    /**
     * Render scatter points.
     */
    render_points() {
        if (!this._series || !this._series.length) return;

        const point_size = this._point_size !== undefined ? this._point_size : 6;
        const points_group = this.svg_element('g', { 'class': 'chart-points' });

        this._series.forEach((series) => {
            series.points.forEach((point, i) => {
                const px = this.x_to_pixel(point.x);
                const py = this.y_to_pixel(point.y);

                const circle = this.svg_element('circle', {
                    'cx': px,
                    'cy': py,
                    'r': point_size,
                    'fill': series.color,
                    'stroke': '#fff',
                    'stroke-width': 2,
                    'class': 'scatter-point',
                    'data-series': series.name,
                    'data-x': point.x,
                    'data-y': point.y
                });
                points_group.add(circle);
            });
        });

        this._svg.add(points_group);
    }

    /**
     * Render linear trend lines.
     */
    render_trend_lines() {
        if (!this._series || !this._series.length) return;

        const trends = this.svg_element('g', { 'class': 'chart-trends' });

        this._series.forEach((series) => {
            if (series.points.length < 2) return;

            // Calculate linear regression
            const { slope, intercept } = this._linear_regression(series.points);
            const { x_min, x_max } = this.get_scatter_range();

            const x1 = this.x_to_pixel(x_min);
            const y1 = this.y_to_pixel(slope * x_min + intercept);
            const x2 = this.x_to_pixel(x_max);
            const y2 = this.y_to_pixel(slope * x_max + intercept);

            const line = this.svg_element('line', {
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2,
                'stroke': series.color,
                'stroke-width': 2,
                'stroke-dasharray': '5,5',
                'opacity': 0.6,
                'class': 'trend-line'
            });
            trends.add(line);
        });

        this._svg.add(trends);
    }

    /**
     * Calculate simple linear regression.
     * @private
     */
    _linear_regression(points) {
        const n = points.length;
        let sum_x = 0, sum_y = 0, sum_xy = 0, sum_xx = 0;

        for (const p of points) {
            sum_x += p.x;
            sum_y += p.y;
            sum_xy += p.x * p.y;
            sum_xx += p.x * p.x;
        }

        const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
        const intercept = (sum_y - slope * sum_x) / n;

        return { slope, intercept };
    }

    /**
     * Activate scatter chart on client-side.
     */
    activate() {
        if (!this.__active) {
            super.activate();
            this._setup_point_interactions();
        }
    }

    /**
     * Setup point hover interactions.
     * @private
     */
    _setup_point_interactions() {
        const el = this.dom.el;
        if (!el) return;

        const points = el.querySelectorAll('.scatter-point');

        points.forEach(point => {
            point.addEventListener('mouseenter', () => {
                point.setAttribute('r', String(parseInt(point.getAttribute('r')) + 2));
            });

            point.addEventListener('mouseleave', () => {
                point.setAttribute('r', String(parseInt(point.getAttribute('r')) - 2));
            });

            point.addEventListener('click', () => {
                this.raise('point-click', {
                    series: point.getAttribute('data-series'),
                    x: parseFloat(point.getAttribute('data-x')),
                    y: parseFloat(point.getAttribute('data-y')),
                    element: point
                });
            });
        });
    }
}

// Add CSS
Scatter_Chart.css = `
.scatter-chart .scatter-point {
    transition: r 0.15s ease;
    cursor: pointer;
}

.scatter-chart .trend-line {
    pointer-events: none;
}
`;

module.exports = Scatter_Chart;
