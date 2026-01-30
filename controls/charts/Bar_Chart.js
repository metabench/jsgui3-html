/**
 * Bar Chart Control
 * 
 * Displays data as vertical or horizontal bars.
 * Supports grouped and stacked modes.
 * 
 * @example
 * // Simple bar chart
 * new Bar_Chart({
 *     data: {
 *         labels: ['Jan', 'Feb', 'Mar'],
 *         series: [{ name: 'Sales', values: [100, 150, 120] }]
 *     }
 * });
 * 
 * // Grouped bar chart
 * new Bar_Chart({
 *     data: {
 *         labels: ['Q1', 'Q2', 'Q3', 'Q4'],
 *         series: [
 *             { name: 'Product A', values: [30, 40, 35, 50] },
 *             { name: 'Product B', values: [25, 35, 30, 45] }
 *         ]
 *     },
 *     mode: 'grouped'
 * });
 */

const Chart_Base = require('./Chart_Base');
const { each } = require('../../html-core/html-core');

class Bar_Chart extends Chart_Base {
    /**
     * Create a Bar Chart.
     * @param {Object} spec - Control specification
     * @param {string} [spec.mode='grouped'] - 'grouped' or 'stacked'
     * @param {string} [spec.orientation='vertical'] - 'vertical' or 'horizontal'
     * @param {number} [spec.bar_gap=0.1] - Gap between bars (0-1)
     * @param {number} [spec.group_gap=0.2] - Gap between groups (0-1)
     */
    constructor(spec = {}) {
        // Set properties BEFORE super() because Chart_Base.compose_chart() 
        // is called during super() and needs these values
        spec.__type_name = 'bar_chart';

        // Pre-initialize instance properties that render_chart needs
        // These will be properly set on `this` before super() calls compose_chart
        const mode = spec.mode || 'grouped';
        const orientation = spec.orientation || 'vertical';
        const bar_gap = spec.bar_gap !== undefined ? spec.bar_gap : 0.1;
        const group_gap = spec.group_gap !== undefined ? spec.group_gap : 0.2;

        // Store in spec so we can access after super()
        spec._pre_mode = mode;
        spec._pre_orientation = orientation;
        spec._pre_bar_gap = bar_gap;
        spec._pre_group_gap = group_gap;

        super(spec);

        // Now set the actual properties (super already composed, but these are for any later re-renders)
        this._mode = mode;
        this._orientation = orientation;
        this._bar_gap = bar_gap;
        this._group_gap = group_gap;

        this.add_class('bar-chart');
        if (this._orientation === 'horizontal') {
            this.add_class('horizontal');
        }

        // Re-render now that properties are set
        if (!spec.abstract && !spec.el && this._svg) {
            this.render_chart();
        }
    }

    /**
     * Render the bar chart content.
     */
    render_chart() {
        if (!this._svg) return;

        // Grid and Axes handled by separate calls but we can override if needed
        // Chart_Base calls render_grid, then we add axes and bars

        // Render axes
        this.render_axes();

        // Render bars
        this.render_bars();
    }

    /**
     * Render X and Y axes.
     */
    render_axes() {
        const area = this.get_chart_area();
        const { min, max } = this.get_value_range();

        // Create axes group
        const axes = this.svg_element('g', { 'class': 'chart-axes' });

        // Y-axis line
        const y_axis = this.svg_element('line', {
            'x1': area.x,
            'y1': area.y,
            'x2': area.x,
            'y2': area.y + area.height,
            'stroke': 'var(--chart-grid-color, #333)',
            'stroke-width': 1
        });
        axes.add(y_axis);

        // X-axis line
        const x_axis = this.svg_element('line', {
            'x1': area.x,
            'y1': area.y + area.height,
            'x2': area.x + area.width,
            'y2': area.y + area.height,
            'stroke': 'var(--chart-grid-color, #333)',
            'stroke-width': 1
        });
        axes.add(x_axis);

        // X-axis labels (categories)
        if (this._labels && this._labels.length) {
            const label_count = this._labels.length;
            const step = area.width / label_count;

            each(this._labels, (label, index) => {
                const x = area.x + step * index + step / 2;
                const y = area.y + area.height + 20;

                const text = this.svg_element('text', {
                    'x': x,
                    'y': y,
                    'text-anchor': 'middle',
                    'font-size': 11,
                    'fill': 'var(--chart-text-color, #666)'
                });
                text.add(label);
                axes.add(text);
            });
        }

        this._svg.add(axes);
    }

    /**
     * Render the bars.
     */
    render_bars() {
        const active_series = this.get_active_series();
        if (!active_series || !active_series.length) return;
        if (!this._labels || !this._labels.length) return;

        const area = this.get_chart_area();
        const { min, max } = this.get_value_range();
        const range = max - min;

        const num_categories = this._labels.length;
        const num_series = active_series.length;

        // Use defaults if properties not yet set (during initial compose_chart from super())
        const bar_gap = this._bar_gap !== undefined ? this._bar_gap : 0.1;
        const group_gap = this._group_gap !== undefined ? this._group_gap : 0.2;
        const mode = this._mode || 'grouped';

        // Calculate bar widths
        const category_width = area.width / num_categories;
        const group_padding = category_width * group_gap / 2;
        const usable_width = category_width - group_padding * 2;

        let bar_width;
        if (mode === 'grouped') {
            bar_width = usable_width / num_series;
            bar_width = bar_width * (1 - bar_gap);
        } else {
            // Stacked
            bar_width = usable_width * (1 - bar_gap);
        }

        // Create bars group
        const bars_group = this.svg_element('g', { 'class': 'chart-bars' });

        if (this._mode === 'grouped') {
            this._render_grouped_bars(bars_group, area, min, range, category_width, group_padding, bar_width, active_series);
        } else {
            this._render_stacked_bars(bars_group, area, min, range, category_width, group_padding, bar_width, active_series);
        }

        this._svg.add(bars_group);
    }

    /**
     * Render grouped bars.
     * @private
     */
    _render_grouped_bars(group, area, min, range, category_width, group_padding, bar_width, active_series) {
        active_series.forEach((series, series_index) => {
            series.values.forEach((value, cat_index) => {
                const bar_height = ((value - min) / range) * area.height;
                const x = area.x +
                    cat_index * category_width +
                    group_padding +
                    series_index * (bar_width / (1 - this._bar_gap)) +
                    (bar_width * this._bar_gap / 2);
                const y = area.y + area.height - bar_height;

                const bar = this.svg_element('rect', {
                    'x': x,
                    'y': y,
                    'width': bar_width,
                    'height': bar_height,
                    'fill': series.color,
                    'class': 'bar',
                    'data-series': series.name,
                    'data-category': this._labels[cat_index],
                    'data-value': value
                });

                group.add(bar);
            });
        });
    }

    /**
     * Render stacked bars.
     * @private
     */
    _render_stacked_bars(group, area, min, range, category_width, group_padding, bar_width, active_series) {
        const num_categories = this._labels.length;

        for (let cat_index = 0; cat_index < num_categories; cat_index++) {
            let cumulative_height = 0;
            const x = area.x + cat_index * category_width + group_padding + (category_width - group_padding * 2 - bar_width) / 2;

            active_series.forEach((series, series_index) => {
                const value = series.values[cat_index] || 0;
                const bar_height = ((value - min) / range) * area.height;
                const y = area.y + area.height - cumulative_height - bar_height;

                const bar = this.svg_element('rect', {
                    'x': x,
                    'y': y,
                    'width': bar_width,
                    'height': bar_height,
                    'fill': series.color,
                    'class': 'bar',
                    'data-series': series.name,
                    'data-category': this._labels[cat_index],
                    'data-value': value
                });

                group.add(bar);
                cumulative_height += bar_height;
            });
        }
    }

    /**
     * Activate bar chart on client-side.
     */
    activate() {
        if (!this.__active) {
            super.activate();

            // Add hover effects
            this._setup_bar_interactions();
        }
    }

    /**
     * Setup bar hover and click interactions.
     * @private
     */
    _setup_bar_interactions() {
        // Find all bar elements
        const el = this.dom.el;
        if (!el) return;

        // Delegated listener for better performance with many bars
        const barsGroup = el.querySelector('.chart-bars');
        if (!barsGroup) return;

        barsGroup.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('bar')) {
                e.target.style.opacity = '0.8';

                const series = e.target.getAttribute('data-series');
                const category = e.target.getAttribute('data-category');
                const value = e.target.getAttribute('data-value');

                this.raise_event('point-hover', {
                    series,
                    category,
                    value: parseFloat(value),
                    element: e.target
                });
            }
        });

        barsGroup.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('bar')) {
                e.target.style.opacity = '1';
            }
        });

        barsGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('bar')) {
                const series = e.target.getAttribute('data-series');
                const category = e.target.getAttribute('data-category');
                const value = e.target.getAttribute('data-value');

                this.raise_event('point-click', {
                    series,
                    category,
                    value: parseFloat(value),
                    element: e.target
                });
            }
        });
    }
}

// Add CSS
Bar_Chart.css = `
.bar-chart .bar {
    transition: opacity 0.15s ease;
    cursor: pointer;
}
`;

module.exports = Bar_Chart;
