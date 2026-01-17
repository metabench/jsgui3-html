/**
 * Chart Base Control
 * 
 * Abstract base class for all chart types with:
 * - MVVM data binding for reactive updates
 * - SVG container management
 * - Coordinate system helpers
 * - Theme integration
 * 
 * @example
 * // Extend for specific chart types
 * class Bar_Chart extends Chart_Base {
 *     render_chart() {
 *         // Specific rendering logic
 *     }
 * }
 */

const jsgui = require('../../html-core/html-core');
const { Control, Control_Data, Control_View, Data_Object } = jsgui;
const { each, tof } = jsgui;
const { field } = require('obext');
const { themeable } = require('../../control_mixins/themeable');
const { apply_token_map } = require('../../themes/token_maps');

/**
 * Default color palettes for charts.
 */
const CHART_PALETTES = {
    categorical: ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d01', '#46bdc6', '#7b61ff'],
    monochrome: ['#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd'],
    vibrant: ['#ff3366', '#00ccff', '#ffcc00', '#66ff66', '#cc66ff', '#ff9933', '#33cccc'],
    dark: ['#6b8cff', '#ff6b6b', '#ffd93d', '#6bcb77', '#ff9f43', '#54a0ff', '#a29bfe']
};

/**
 * Default chart sizes.
 */
const CHART_SIZES = {
    small: { width: 300, height: 200 },
    medium: { width: 500, height: 300 },
    large: { width: 800, height: 500 }
};

class Chart_Base extends Control {
    /**
     * Create a Chart.
     * @param {Object} spec - Control specification
     * @param {Object} [spec.data] - Chart data with labels and series
     * @param {string[]} [spec.data.labels] - Category labels
     * @param {Object[]} [spec.data.series] - Data series array
     * @param {string} [spec.variant] - Theme variant name
     * @param {Object} [spec.params] - Theme parameters
     */
    constructor(spec = {}) {
        super(spec);
        this.__type_name = spec.__type_name || 'chart';

        // Apply themeable - resolves params and applies hooks
        const params = themeable(this, 'chart', spec);
        this._chart_params = params;

        // Resolve size from params or spec
        const size_preset = params.size || 'medium';
        const size_config = CHART_SIZES[size_preset] || CHART_SIZES.medium;
        this._chart_width = spec.width || size_config.width;
        this._chart_height = spec.height || size_config.height;

        // Resolve palette
        const palette_name = params.palette || 'categorical';
        this._palette = CHART_PALETTES[palette_name] || CHART_PALETTES.categorical;

        // Chart configuration
        this._show_grid = params.grid !== false;
        // Support legend: true as shorthand for 'bottom'
        const legend_param = params.legend;
        if (legend_param === true) {
            this._show_legend = 'bottom';
        } else if (legend_param === false || legend_param === 'none') {
            this._show_legend = 'none';
        } else {
            this._show_legend = legend_param || 'bottom';
        }
        this._animate = params.animation !== false;

        // Margins
        this._margin = spec.margin || { top: 20, right: 20, bottom: 40, left: 50 };

        this.add_class('chart');

        // Setup data binding
        this._setup_data_binding(spec);

        // Store initial data
        if (spec.data) {
            this.set_data(spec.data);
        }

        // Compose chart if not abstract
        if (!spec.abstract && !spec.el) {
            this.compose_chart();
        }
    }

    /**
     * Setup MVVM data binding for reactive updates.
     * @private
     */
    _setup_data_binding(spec) {
        const { context } = this;

        // Data model
        this.data = new Control_Data({ context });
        if (spec.data && spec.data.model) {
            this.data.model = spec.data.model;
        } else {
            this.data.model = new Data_Object({ context });
        }

        field(this.data.model, 'labels');
        field(this.data.model, 'series');

        // View model
        this.view = new Control_View({ context });
        if (spec.view && spec.view.data && spec.view.data.model) {
            this.view.data.model = spec.view.data.model;
        } else {
            this.view.data.model = new Data_Object({ context });
        }

        field(this.view.data.model, 'labels');
        field(this.view.data.model, 'series');

        // Sync data model to view model
        this.data.model.on('change', e => {
            const { name, value, old } = e;
            if (value === old) return;

            if (name === 'labels' || name === 'series') {
                this.view.data.model[name] = value;
                this._on_data_change(name, value);
            }
        });

        // Sync view model to data model
        this.view.data.model.on('change', e => {
            const { name, value, old } = e;
            if (value === old) return;

            if (name === 'labels' || name === 'series') {
                this.data.model[name] = value;
                this._on_data_change(name, value);
            }
        });
    }

    /**
     * Handle data changes - triggers re-render.
     * @private
     */
    _on_data_change(name, value) {
        // Re-render chart on data change (only client-side)
        if (typeof window !== 'undefined' && this.__active) {
            this.render_chart();
        }
    }

    /**
     * Set chart data.
     * @param {Object} data - Chart data
     * @param {string[]} [data.labels] - Category labels
     * @param {Object[]} [data.series] - Data series
     */
    set_data(data) {
        if (data.labels) {
            this._labels = data.labels;
            this.data.model.labels = data.labels;
        }
        if (data.series) {
            this._series = this._normalize_series(data.series);
            this.data.model.series = this._series;
        }
    }

    /**
     * Normalize series data to consistent format.
     * @private
     */
    _normalize_series(series) {
        if (!Array.isArray(series)) return [];

        return series.map((s, index) => {
            if (Array.isArray(s)) {
                // Simple array of values
                return {
                    name: `Series ${index + 1}`,
                    values: s,
                    color: this._palette[index % this._palette.length]
                };
            } else if (typeof s === 'object') {
                // Object with name/values
                return {
                    name: s.name || `Series ${index + 1}`,
                    values: s.values || s.data || [],
                    color: s.color || this._palette[index % this._palette.length]
                };
            }
            return null;
        }).filter(Boolean);
    }

    /**
     * Get chart area dimensions (excluding margins).
     */
    get_chart_area() {
        return {
            x: this._margin.left,
            y: this._margin.top,
            width: this._chart_width - this._margin.left - this._margin.right,
            height: this._chart_height - this._margin.top - this._margin.bottom
        };
    }

    /**
     * Get min/max values from all series.
     */
    get_value_range() {
        if (!this._series || !this._series.length) {
            return { min: 0, max: 100 };
        }

        let min = Infinity;
        let max = -Infinity;

        for (const series of this._series) {
            for (const val of series.values) {
                if (val < min) min = val;
                if (val > max) max = val;
            }
        }

        // Add padding
        const range = max - min;
        min = Math.floor(min - range * 0.1);
        max = Math.ceil(max + range * 0.1);

        // Ensure 0 is included if close
        if (min > 0 && min < max * 0.2) min = 0;

        return { min, max };
    }

    /**
     * Convert a value to Y pixel position.
     */
    value_to_y(value) {
        const { min, max } = this.get_value_range();
        const area = this.get_chart_area();
        const scale = area.height / (max - min);
        return area.y + area.height - (value - min) * scale;
    }

    /**
     * Convert an index to X pixel position.
     */
    index_to_x(index, count) {
        const area = this.get_chart_area();
        const step = area.width / (count - 1 || 1);
        return area.x + index * step;
    }

    /**
     * Create SVG element.
     * @protected
     */
    create_svg() {
        const svg = new Control({
            context: this.context,
            tag_name: 'svg'
        });

        svg.dom.attributes.width = this._chart_width;
        svg.dom.attributes.height = this._chart_height;
        svg.dom.attributes.viewBox = `0 0 ${this._chart_width} ${this._chart_height}`;
        svg.add_class('chart-svg');

        return svg;
    }

    /**
     * Create an SVG element helper.
     * @protected
     */
    svg_element(tag_name, attributes = {}) {
        const el = new Control({
            context: this.context,
            tag_name
        });

        // Set each attribute directly
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'class') {
                el.add_class(value);
            } else {
                el.dom.attributes[key] = value;
            }
        }

        return el;
    }

    /**
     * Compose the chart structure.
     * Override in subclasses.
     */
    compose_chart() {
        // Clear existing content
        this.clear();

        // Create SVG container
        this._svg = this.create_svg();
        this.add(this._svg);

        // Render chart content
        this.render_chart();

        // Add legend if configured
        if (this._show_legend !== 'none') {
            this.render_legend();
        }
    }

    /**
     * Render the chart content.
     * Override in subclasses.
     */
    render_chart() {
        // Base implementation - override in subclasses
        if (this._show_grid) {
            this.render_grid();
        }
    }

    /**
     * Render grid lines.
     * @protected
     */
    render_grid() {
        const area = this.get_chart_area();
        const { min, max } = this.get_value_range();

        // Create grid group
        const grid = this.svg_element('g', { 'class': 'chart-grid' });

        // Horizontal grid lines
        const steps = 5;
        const step = (max - min) / steps;

        for (let i = 0; i <= steps; i++) {
            const value = min + i * step;
            const y = this.value_to_y(value);

            const line = this.svg_element('line', {
                'x1': area.x,
                'y1': y,
                'x2': area.x + area.width,
                'y2': y,
                'stroke': '#e0e0e0',
                'stroke-width': 1
            });
            grid.add(line);

            // Y-axis label
            const label = this.svg_element('text', {
                'x': area.x - 8,
                'y': y + 4,
                'text-anchor': 'end',
                'font-size': 11,
                'fill': '#666'
            });
            label.add(Math.round(value).toString());
            grid.add(label);
        }

        this._svg.add(grid);
    }

    /**
     * Render the legend.
     * @protected
     */
    /**
     * Get legend items. Override in subclasses like Pie_Chart
     * to customize legend content.
     * @returns {Array<{name: string, color: string}>} Legend items
     */
    get_legend_items() {
        if (!this._series || !this._series.length) return [];
        return this._series.map(s => ({
            name: s.name,
            color: s.color
        }));
    }

    /**
     * Render the legend component.
     */
    render_legend() {
        const items = this.get_legend_items();
        if (!items || !items.length) return;

        const legend = new Control({ context: this.context });
        legend.add_class('chart-legend');
        legend.add_class(`legend-${this._show_legend}`);

        items.forEach((item) => {
            const itemEl = new Control({ context: this.context });
            itemEl.add_class('legend-item');

            const swatch = new Control({ context: this.context });
            swatch.add_class('legend-swatch');
            swatch.dom.attributes.style = `background-color: ${item.color}`;
            itemEl.add(swatch);

            const label = new Control({ context: this.context });
            label.add_class('legend-label');
            label.add(item.name);
            itemEl.add(label);

            legend.add(itemEl);
        });

        this.add(legend);
    }

    /**
     * Activate chart on client-side.
     */
    activate() {
        if (!this.__active) {
            super.activate();

            // Re-render if we have data
            if (this._series && this._series.length) {
                this.render_chart();
            }
        }
    }
}

// Static CSS
Chart_Base.css = `
.chart {
    display: inline-block;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chart-svg {
    display: block;
}

.chart-grid line {
    shape-rendering: crispEdges;
}

.chart-legend {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 8px;
    flex-wrap: wrap;
}

.chart-legend.legend-top {
    order: -1;
    margin-bottom: 8px;
}

.chart-legend.legend-bottom {
    margin-top: 8px;
}

.chart-legend.legend-left {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    flex-direction: column;
    align-items: flex-start;
}

.chart-legend.legend-right {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    flex-direction: column;
    align-items: flex-start;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #666;
    cursor: pointer;
    transition: opacity 0.2s;
}

.legend-item:hover {
    opacity: 0.8;
}

.legend-swatch {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
}
`;

// Export palettes and sizes for use in other chart types
Chart_Base.PALETTES = CHART_PALETTES;
Chart_Base.SIZES = CHART_SIZES;

module.exports = Chart_Base;
