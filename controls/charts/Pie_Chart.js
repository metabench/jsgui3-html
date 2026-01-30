/**
 * Pie Chart Control
 * 
 * Displays data as a circular chart with proportional segments.
 * Supports pie and donut modes.
 * 
 * @example
 * // Simple pie chart
 * new Pie_Chart({
 *     data: {
 *         labels: ['Chrome', 'Firefox', 'Safari', 'Edge'],
 *         series: [{ values: [65, 20, 10, 5] }]
 *     }
 * });
 * 
 * // Donut chart
 * new Pie_Chart({
 *     mode: 'donut',
 *     data: {
 *         labels: ['Complete', 'Remaining'],
 *         series: [{ values: [75, 25] }]
 *     }
 * });
 */

const Chart_Base = require('./Chart_Base');
const { each } = require('../../html-core/html-core');

class Pie_Chart extends Chart_Base {
    /**
     * Create a Pie Chart.
     * @param {Object} spec - Control specification
     * @param {string} [spec.mode='pie'] - 'pie' or 'donut'
     * @param {number} [spec.inner_radius=0] - Inner radius for donut (0-1)
     * @param {number} [spec.start_angle=-90] - Start angle in degrees
     * @param {boolean} [spec.show_labels=true] - Show value labels on segments
     * @param {boolean} [spec.show_percentages=true] - Show as percentages
     */
    constructor(spec = {}) {
        spec.__type_name = 'pie_chart';
        super(spec);

        this._mode = spec.mode || 'pie';
        this._inner_radius = spec.inner_radius !== undefined ? spec.inner_radius : (this._mode === 'donut' ? 0.5 : 0);
        this._start_angle = spec.start_angle !== undefined ? spec.start_angle : -90;
        this._show_labels = spec.show_labels !== false;
        this._show_percentages = spec.show_percentages !== false;

        this.add_class('pie-chart');
        if (this._mode === 'donut') {
            this.add_class('donut');
        }

        // Re-render now that properties are set (super() already rendered with defaults)
        if (!spec.abstract && !spec.el && this._svg) {
            this.render_chart();
        }
    }

    /**
     * Calculate chart center and radius.
     */
    get_pie_dimensions() {
        const area = this.get_chart_area();
        const center_x = area.x + area.width / 2;
        const center_y = area.y + area.height / 2;
        const radius = Math.min(area.width, area.height) / 2 - 10;
        // Use default if _inner_radius not yet set
        const inner_radius_ratio = this._inner_radius !== undefined ? this._inner_radius : 0;
        const inner_radius = radius * inner_radius_ratio;

        return { center_x, center_y, radius, inner_radius };
    }

    /**
     * Get values from first series (pie only uses one series).
     */
    get_values() {
        if (!this._series || !this._series.length) return [];
        return this._series[0].values || [];
    }

    /**
     * Get total of all values (excluding hidden ones).
     */
    get_total() {
        const values = this.get_values();
        return values.reduce((sum, val, index) => {
            const label = this._labels && this._labels[index] ? this._labels[index] : `Segment ${index + 1}`;
            if (this._hidden_series.has(label)) return sum;
            return sum + val;
        }, 0);
    }

    /**
     * Get legend items for pie chart.
     * Uses labels and palette instead of series names.
     * @returns {Array<{name: string, color: string}>} Legend items
     */
    get_legend_items() {
        const values = this.get_values();
        if (!values.length) return [];

        return values.map((value, index) => {
            const name = this._labels && this._labels[index] ? this._labels[index] : `Segment ${index + 1}`;
            return {
                name: name,
                color: this._palette[index % this._palette.length],
                visible: !this._hidden_series.has(name)
            };
        });
    }

    /**
     * Render the pie chart content.
     */
    render_chart() {
        if (!this._svg) return;

        // Clear existing chart content (kept by base or manual clear)
        // Chart_Base.render_chart_content calls this, but it clears SVG before calling.
        // So we are working on a clean SVG.

        // Render pie segments
        this.render_segments();

        // Render center label for donut (use default if not set)
        const mode = this._mode || 'pie';
        if (mode === 'donut') {
            this.render_center_label();
        }

        // No grid/axes for pie chart usually
    }

    /**
     * Render pie segments.
     */
    render_segments() {
        const values = this.get_values();
        const total = this.get_total();

        if (!values.length || total === 0) return;

        const { center_x, center_y, radius, inner_radius } = this.get_pie_dimensions();
        const segments = this.svg_element('g', { 'class': 'chart-segments' });

        // Use defaults if properties not yet set
        const start_angle = this._start_angle !== undefined ? this._start_angle : -90;
        const show_labels = this._show_labels !== undefined ? this._show_labels : true;
        const show_percentages = this._show_percentages !== undefined ? this._show_percentages : true;

        let current_angle = start_angle;

        values.forEach((value, index) => {
            const label = this._labels ? this._labels[index] : `Segment ${index + 1}`;

            // Skip if hidden
            if (this._hidden_series.has(label)) return;

            const percentage = (value / total) * 100;
            const angle = (value / total) * 360;

            // Create segment path
            const path = this._create_arc_path(
                center_x, center_y,
                radius, inner_radius,
                current_angle, current_angle + angle
            );

            const color = this._palette[index % this._palette.length];

            const segment = this.svg_element('path', {
                'd': path,
                'fill': color,
                'class': 'segment',
                'data-index': index,
                'data-label': label,
                'data-value': value,
                'data-percentage': percentage.toFixed(1)
            });

            segments.add(segment);

            // Add label
            if (show_labels && percentage > 5) {
                const label_angle = current_angle + angle / 2;
                const label_radius = inner_radius + (radius - inner_radius) * 0.65;
                const label_x = center_x + label_radius * Math.cos(label_angle * Math.PI / 180);
                const label_y = center_y + label_radius * Math.sin(label_angle * Math.PI / 180);

                const label_text = this.svg_element('text', {
                    'x': label_x,
                    'y': label_y,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    'font-size': 11,
                    'fill': '#fff',
                    'font-weight': 'bold',
                    'class': 'segment-label'
                });

                const display_value = show_percentages
                    ? `${percentage.toFixed(0)}%`
                    : value.toString();
                label_text.add(display_value);
                segments.add(label_text);
            }

            current_angle += angle;
        });

        this._svg.add(segments);
    }

    /**
     * Create SVG arc path.
     * @private
     */
    _create_arc_path(cx, cy, outer_r, inner_r, start_angle, end_angle) {
        // Handle full circle
        if (end_angle - start_angle >= 360) {
            end_angle = start_angle + 359.99;
        }

        const start_rad = start_angle * Math.PI / 180;
        const end_rad = end_angle * Math.PI / 180;

        const outer_x1 = cx + outer_r * Math.cos(start_rad);
        const outer_y1 = cy + outer_r * Math.sin(start_rad);
        const outer_x2 = cx + outer_r * Math.cos(end_rad);
        const outer_y2 = cy + outer_r * Math.sin(end_rad);

        const large_arc = (end_angle - start_angle) > 180 ? 1 : 0;

        if (inner_r === 0) {
            // Full pie segment
            return `M ${cx} ${cy} L ${outer_x1} ${outer_y1} A ${outer_r} ${outer_r} 0 ${large_arc} 1 ${outer_x2} ${outer_y2} Z`;
        } else {
            // Donut segment
            const inner_x1 = cx + inner_r * Math.cos(start_rad);
            const inner_y1 = cy + inner_r * Math.sin(start_rad);
            const inner_x2 = cx + inner_r * Math.cos(end_rad);
            const inner_y2 = cy + inner_r * Math.sin(end_rad);

            return `M ${outer_x1} ${outer_y1} A ${outer_r} ${outer_r} 0 ${large_arc} 1 ${outer_x2} ${outer_y2} L ${inner_x2} ${inner_y2} A ${inner_r} ${inner_r} 0 ${large_arc} 0 ${inner_x1} ${inner_y1} Z`;
        }
    }

    /**
     * Render center label for donut charts.
     */
    render_center_label() {
        const { center_x, center_y } = this.get_pie_dimensions();
        const total = this.get_total();

        // Round if needed
        const displayTotal = Math.round(total * 100) / 100;

        const label = this.svg_element('text', {
            'x': center_x,
            'y': center_y,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            'font-size': 24,
            'font-weight': 'bold',
            'fill': 'var(--chart-text-color, #333)',
            'class': 'center-label'
        });

        label.add(displayTotal.toString());
        this._svg.add(label);
    }

    /**
     * Activate pie chart on client-side.
     */
    activate() {
        if (!this.__active) {
            super.activate();
            this._setup_segment_interactions();
        }
    }

    /**
     * Setup segment hover and click interactions.
     * @private
     */
    _setup_segment_interactions() {
        const el = this.dom.el;
        if (!el) return;

        // Delegated listener
        const segmentsGroup = el.querySelector('.chart-segments');
        if (!segmentsGroup) return;

        segmentsGroup.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('segment')) {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.transformOrigin = 'center';

                const label = e.target.getAttribute('data-label');
                const value = e.target.getAttribute('data-value');

                this.raise_event('point-hover', {
                    series: label, // For pie, series name often maps to category label
                    category: label,
                    value: parseFloat(value),
                    element: e.target
                });
            }
        });

        segmentsGroup.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('segment')) {
                e.target.style.transform = 'scale(1)';
            }
        });

        segmentsGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('segment')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                const label = e.target.getAttribute('data-label');
                const value = parseFloat(e.target.getAttribute('data-value'));
                const percentage = parseFloat(e.target.getAttribute('data-percentage'));

                this.raise_event('point-click', {
                    series: label,
                    category: label,
                    value: value,
                    index: index,
                    percentage: percentage,
                    element: e.target
                });
            }
        });
    }
}

// Add CSS
Pie_Chart.css = `
.pie-chart .segment {
    transition: transform 0.15s ease;
    cursor: pointer;
    transform-box: fill-box;
}

.pie-chart .segment-label {
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.pie-chart .center-label {
    pointer-events: none;
}
`;

module.exports = Pie_Chart;
