/**
 * Area Chart Control
 * 
 * Displays data as filled areas under line series.
 * Supports stacked and overlapping modes.
 * 
 * @example
 * new Area_Chart({
 *     data: {
 *         labels: ['Jan', 'Feb', 'Mar', 'Apr'],
 *         series: [
 *             { name: 'Revenue', values: [100, 150, 120, 180] },
 *             { name: 'Costs', values: [80, 90, 85, 100] }
 *         ]
 *     }
 * });
 */

const Chart_Base = require('./Chart_Base');

class Area_Chart extends Chart_Base {
    /**
     * Create an Area Chart.
     * @param {Object} spec - Control specification
     * @param {string} [spec.mode='overlap'] - 'overlap' or 'stacked'
     * @param {number} [spec.opacity=0.6] - Fill opacity
     * @param {boolean} [spec.show_lines=true] - Show border lines
     * @param {boolean} [spec.show_points=false] - Show data points
     */
    constructor(spec = {}) {
        spec.__type_name = 'area_chart';
        super(spec);

        this._mode = spec.mode || 'overlap';
        this._opacity = spec.opacity !== undefined ? spec.opacity : 0.6;
        this._show_lines = spec.show_lines !== false;
        this._show_points = spec.show_points === true;

        this.add_class('area-chart');

        // Re-render now that properties are set
        if (!spec.abstract && !spec.el && this._svg) {
            this.render_chart();
        }
    }

    /**
     * Render the area chart content.
     */
    render_chart() {
        if (!this._svg) return;

        this._svg.clear();

        if (this._show_grid) {
            this.render_grid();
        }

        this.render_axes();
        this.render_areas();

        if (this._show_points) {
            this.render_points();
        }
    }

    /**
     * Render axes.
     */
    render_axes() {
        const area = this.get_chart_area();
        const axes = this.svg_element('g', { 'class': 'chart-axes' });

        // Y-axis line
        const y_axis = this.svg_element('line', {
            'x1': area.x,
            'y1': area.y,
            'x2': area.x,
            'y2': area.y + area.height,
            'stroke': '#333',
            'stroke-width': 1
        });
        axes.add(y_axis);

        // X-axis line
        const x_axis = this.svg_element('line', {
            'x1': area.x,
            'y1': area.y + area.height,
            'x2': area.x + area.width,
            'y2': area.y + area.height,
            'stroke': '#333',
            'stroke-width': 1
        });
        axes.add(x_axis);

        // X-axis labels
        if (this._labels && this._labels.length) {
            const step = area.width / (this._labels.length - 1 || 1);

            this._labels.forEach((label, index) => {
                const x = area.x + index * step;
                const y = area.y + area.height + 20;

                const text = this.svg_element('text', {
                    'x': x,
                    'y': y,
                    'text-anchor': 'middle',
                    'font-size': 11,
                    'fill': '#666'
                });
                text.add(label);
                axes.add(text);
            });
        }

        this._svg.add(axes);
    }

    /**
     * Render the filled areas.
     */
    render_areas() {
        if (!this._series || !this._series.length) return;

        const area = this.get_chart_area();
        const { min, max } = this.get_value_range();
        const areas_group = this.svg_element('g', { 'class': 'chart-areas' });

        // Use defaults if not set
        const mode = this._mode || 'overlap';
        const opacity = this._opacity !== undefined ? this._opacity : 0.6;
        const show_lines = this._show_lines !== undefined ? this._show_lines : true;

        if (mode === 'stacked') {
            this._render_stacked_areas(areas_group, area, min, max, opacity, show_lines);
        } else {
            this._render_overlap_areas(areas_group, area, min, max, opacity, show_lines);
        }

        this._svg.add(areas_group);
    }

    /**
     * Render overlapping areas (each series independent).
     * @private
     */
    _render_overlap_areas(group, area, min, max, opacity, show_lines) {
        const range = max - min;
        const count = this._labels ? this._labels.length : 0;
        if (count === 0) return;

        this._series.forEach((series, series_index) => {
            const points = [];

            series.values.forEach((value, i) => {
                const x = this.index_to_x(i, count);
                const y = this.value_to_y(value);
                points.push({ x, y });
            });

            // Create area path
            const area_path = this._create_area_path(points, area);
            const area_element = this.svg_element('path', {
                'd': area_path,
                'fill': series.color,
                'fill-opacity': opacity,
                'class': 'area',
                'data-series': series.name
            });
            group.add(area_element);

            // Add line on top
            if (show_lines) {
                const line_path = this._create_line_path(points);
                const line_element = this.svg_element('path', {
                    'd': line_path,
                    'fill': 'none',
                    'stroke': series.color,
                    'stroke-width': 2,
                    'class': 'area-line',
                    'data-series': series.name
                });
                group.add(line_element);
            }
        });
    }

    /**
     * Render stacked areas.
     * @private
     */
    _render_stacked_areas(group, area, min, max, opacity, show_lines) {
        const count = this._labels ? this._labels.length : 0;
        if (count === 0) return;

        // Calculate cumulative values for stacking
        const cumulative = new Array(count).fill(0);

        this._series.forEach((series, series_index) => {
            const points = [];
            const base_points = [];

            series.values.forEach((value, i) => {
                const x = this.index_to_x(i, count);
                const total = cumulative[i] + value;
                const y = this.value_to_y(total);
                const base_y = this.value_to_y(cumulative[i]);

                points.push({ x, y });
                base_points.push({ x, y: base_y });

                cumulative[i] = total;
            });

            // Create stacked area path
            const stacked_path = this._create_stacked_area_path(points, base_points);
            const area_element = this.svg_element('path', {
                'd': stacked_path,
                'fill': series.color,
                'fill-opacity': opacity,
                'class': 'area stacked',
                'data-series': series.name
            });
            group.add(area_element);

            // Add line on top
            if (show_lines) {
                const line_path = this._create_line_path(points);
                const line_element = this.svg_element('path', {
                    'd': line_path,
                    'fill': 'none',
                    'stroke': series.color,
                    'stroke-width': 2,
                    'class': 'area-line',
                    'data-series': series.name
                });
                group.add(line_element);
            }
        });
    }

    /**
     * Create SVG path for an area (down to baseline).
     * @private
     */
    _create_area_path(points, chart_area) {
        if (points.length === 0) return '';

        const baseline_y = chart_area.y + chart_area.height;

        let path = `M ${points[0].x} ${baseline_y}`;
        path += ` L ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x} ${points[i].y}`;
        }

        path += ` L ${points[points.length - 1].x} ${baseline_y}`;
        path += ' Z';

        return path;
    }

    /**
     * Create SVG path for a stacked area.
     * @private
     */
    _create_stacked_area_path(top_points, bottom_points) {
        if (top_points.length === 0) return '';

        let path = `M ${top_points[0].x} ${top_points[0].y}`;

        for (let i = 1; i < top_points.length; i++) {
            path += ` L ${top_points[i].x} ${top_points[i].y}`;
        }

        // Go back along the bottom
        for (let i = bottom_points.length - 1; i >= 0; i--) {
            path += ` L ${bottom_points[i].x} ${bottom_points[i].y}`;
        }

        path += ' Z';

        return path;
    }

    /**
     * Create SVG path for a line.
     * @private
     */
    _create_line_path(points) {
        if (points.length === 0) return '';

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x} ${points[i].y}`;
        }

        return path;
    }

    /**
     * Render data points.
     */
    render_points() {
        if (!this._series || !this._series.length) return;

        const count = this._labels ? this._labels.length : 0;
        if (count === 0) return;

        const points_group = this.svg_element('g', { 'class': 'chart-points' });

        this._series.forEach((series) => {
            series.values.forEach((value, i) => {
                const x = this.index_to_x(i, count);
                const y = this.value_to_y(value);

                const circle = this.svg_element('circle', {
                    'cx': x,
                    'cy': y,
                    'r': 4,
                    'fill': series.color,
                    'stroke': '#fff',
                    'stroke-width': 2,
                    'class': 'point',
                    'data-series': series.name,
                    'data-value': value
                });
                points_group.add(circle);
            });
        });

        this._svg.add(points_group);
    }

    /**
     * Activate area chart on client-side.
     */
    activate() {
        if (!this.__active) {
            super.activate();
            this._setup_area_interactions();
        }
    }

    /**
     * Setup area hover interactions.
     * @private
     */
    _setup_area_interactions() {
        const el = this.dom.el;
        if (!el) return;

        const areas = el.querySelectorAll('.area');

        areas.forEach(area => {
            area.addEventListener('mouseenter', () => {
                area.style.fillOpacity = '0.8';
            });

            area.addEventListener('mouseleave', () => {
                area.style.fillOpacity = '';
            });
        });
    }
}

// Add CSS
Area_Chart.css = `
.area-chart .area {
    transition: fill-opacity 0.15s ease;
}

.area-chart .area-line {
    pointer-events: none;
}

.area-chart .point {
    transition: r 0.15s ease;
    cursor: pointer;
}

.area-chart .point:hover {
    r: 6;
}
`;

module.exports = Area_Chart;
