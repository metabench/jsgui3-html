/**
 * Flexi_Chart Control
 * 
 * A unified chart wrapper that automatically selects and instantiates 
 * the specific chart type based on configuration.
 * 
 * Includes built-in data adaptation logic supporting various raw data shapes.
 */

const jsgui = require('../../html-core/html-core');
const { Control } = jsgui;
const adapters = require('./data_adapters');

// Import specific chart types
const Bar_Chart = require('./Bar_Chart');
const Pie_Chart = require('./Pie_Chart');
const Area_Chart = require('./Area_Chart');
const Scatter_Chart = require('./Scatter_Chart');
const Chart_Base = require('./Chart_Base');

// Mapping of types to constructors
const CHART_TYPES = {
    'bar': Bar_Chart,
    'column': Bar_Chart, // alias
    'pie': Pie_Chart,
    'donut': Pie_Chart,
    'line': Area_Chart,
    'area': Area_Chart,
    'scatter': Scatter_Chart,
    'default': Bar_Chart
};

// Map friendly type names to internal props
const TYPE_PROPS = {
    'column': { orientation: 'vertical' },
    'bar': { orientation: 'horizontal' },
    'pie': { mode: 'pie' },
    'donut': { mode: 'donut' },
    'line': { show_points: true },
    'area': { show_points: false }
};

class Flexi_Chart extends Control {
    /**
     * Create a Flexi Chart.
     * @param {Object} spec - Control specification
     * @param {string} [spec.type='bar'] - Chart type (bar, column, pie, donut)
     * @param {Object|Array} [spec.data] - Chart data (raw or normalized)
     * @param {Object} [spec.options] - Adapter options
     * @param {string} [spec.title] - Chart title
     */
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'flexi_chart';
        super(spec);

        this.add_class('flexi-chart');

        // Resolve params
        this._chart_type = spec.type || 'column';
        this._raw_data = spec.data;
        this._adapter_options = spec.options || {};
        this._title = spec.title;

        // Store visual props
        this._chart_props = {
            width: spec.width,
            height: spec.height,
            variant: spec.variant,
            palette: spec.palette,
            legend: spec.legend,
            grid: spec.grid
        };

        // Compose immediately
        if (!spec.abstract && !spec.el) {
            this.compose_content();
        }
    }

    /**
     * Compose content - Title + Inner Chart
     */
    compose_content() {
        this.clear();

        // 1. Add Title if present
        if (this._title) {
            const title = new Control({
                context: this.context,
                tag_name: 'h3'
            });
            title.add_class('chart-title');
            title.add(this._title);
            this.add(title);
        }

        // 2. Prepare Data
        const normalized_data = adapters.normalize(this._raw_data, this._adapter_options);

        // 3. Instantiate Inner Chart
        const Constructor = CHART_TYPES[this._chart_type] || CHART_TYPES.default;
        const type_props = TYPE_PROPS[this._chart_type] || {};

        const chart_spec = {
            context: this.context,
            data: normalized_data,
            ...type_props,
            // Pass through layout/visual props
            width: this._chart_props.width || 'auto',
            height: this._chart_props.height || 'auto',
            variant: this._chart_props.variant,
            palette: this._chart_props.palette,
            legend: this._chart_props.legend,
            grid: this._chart_props.grid
        };

        this._chart = new Constructor(chart_spec);
        this.add(this._chart);

        // Proxy events from inner chart to this control
        this._chart.on('point-click', (e) => this.raise('point-click', e));
        this._chart.on('point-hover', (e) => this.raise('point-hover', e));
    }

    /**
     * Update data dynamically.
     */
    set_data(data, options) {
        this._raw_data = data;
        if (options) this._adapter_options = options;

        // Normalize and push to inner chart
        const normalized = adapters.normalize(data, this._adapter_options);
        if (this._chart) {
            this._chart.set_data(normalized);
        }
    }
}

Flexi_Chart.css = `
.flexi-chart {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.flexi-chart .chart-title {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    text-align: center;
}
`;

module.exports = Flexi_Chart;
