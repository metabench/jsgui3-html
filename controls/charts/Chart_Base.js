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
     * @param {string} [spec.variant] - Theme variant name ('dark', 'compact')
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

        // Handle "auto" sizing
        this._auto_size = spec.width === 'auto' || spec.height === 'auto';
        this._chart_width = spec.width === 'auto' ? size_config.width : (spec.width || size_config.width);
        this._chart_height = spec.height === 'auto' ? size_config.height : (spec.height || size_config.height);

        // Resolve palette based on variant
        const variant = spec.variant || 'default';
        let default_palette = 'categorical';
        if (variant === 'dark') default_palette = 'dark';

        const palette_name = params.palette || default_palette;
        this._palette = CHART_PALETTES[palette_name] || CHART_PALETTES.categorical;

        // Chart configuration
        this._show_grid = params.grid !== false;

        // Legend configuration (top, bottom, left, right, none)
        const legend_param = params.legend;
        if (legend_param === true) {
            this._show_legend = 'bottom';
        } else if (legend_param === false || legend_param === 'none') {
            this._show_legend = 'none';
        } else {
            this._show_legend = legend_param || 'bottom';
        }

        this._animate = params.animation !== false;

        // Track hidden series (toggled via legend)
        this._hidden_series = new Set();

        // Margins - adjustable by variant
        this._margin = spec.margin || { top: 20, right: 20, bottom: 40, left: 50 };
        if (spec.variant === 'compact') {
            this._margin = { top: 10, right: 10, bottom: 20, left: 30 };
        }

        this.add_class('chart');
        if (spec.variant) this.add_class(`variant-${spec.variant}`);

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
            // Apply updates
            if (name === 'labels') this._labels = value;
            if (name === 'series') this._series = this._normalize_series(value);

            this.render_chart_content();
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
     * Get active (visible) series.
     */
    get_active_series() {
        if (!this._series) return [];
        return this._series.filter(s => !this._hidden_series.has(s.name));
    }

    /**
     * Get min/max values from active series.
     */
    get_value_range() {
        const series = this.get_active_series();
        if (!series || !series.length) {
            return { min: 0, max: 100 };
        }

        let min = Infinity;
        let max = -Infinity;

        for (const s of series) {
            for (const val of s.values) {
                if (val < min) min = val;
                if (val > max) max = val;
            }
        }

        if (min === Infinity) return { min: 0, max: 100 };

        // Add padding
        const range = max - min;
        min = Math.floor(min - range * 0.1);
        max = Math.ceil(max + range * 0.1);

        // Ensure 0 is included if close
        if (min > 0 && min < max * 0.2) min = 0;

        // Handle flat line case
        if (min === max) {
            max = min + 10;
        }

        return { min, max };
    }

    /**
     * Convert a value to Y pixel position.
     */
    value_to_y(value) {
        const { min, max } = this.get_value_range();
        const area = this.get_chart_area();
        const range = max - min || 1;
        const scale = area.height / range;
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

        this._update_svg_attribs(svg);
        svg.add_class('chart-svg');

        return svg;
    }

    /**
     * Update SVG dimensions
     */
    _update_svg_attribs(svg = this._svg) {
        if (!svg) return;
        svg.dom.attributes.width = this._chart_width;
        svg.dom.attributes.height = this._chart_height;
        svg.dom.attributes.viewBox = `0 0 ${this._chart_width} ${this._chart_height}`;
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

        // Add CSS class for layout
        this.add_class(`layout-${this._show_legend}`);

        // Create main container for layout if needed, but for now 
        // we use flexbox on the chart control itself via CSS.

        // Legend before chart if top/left
        if (this._show_legend === 'top' || this._show_legend === 'left') {
            this.render_legend();
        }

        // Create SVG container
        this._svg = this.create_svg();
        this.add(this._svg);

        // Render chart content
        this.render_chart_content();

        // Legend after chart if bottom/right
        if (this._show_legend === 'bottom' || this._show_legend === 'right') {
            this.render_legend();
        }
    }

    /**
     * Central rendering method to refresh just the chart part.
     */
    render_chart_content() {
        if (!this._svg) return;
        this._svg.clear();

        // Check for empty data
        if (!this._series || this._series.length === 0) {
            this.render_empty();
            return;
        }

        // Base implementation - override in subclasses
        this.render_chart();
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
     * Render empty state.
     */
    render_empty() {
        const area = this.get_chart_area();
        const text = this.svg_element('text', {
            x: this._chart_width / 2,
            y: this._chart_height / 2,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: '#999',
            'font-size': 14
        });
        text.add('No Data');
        this._svg.add(text);
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
        const range = max - min;
        const step = range > 0 ? range / steps : 1;

        for (let i = 0; i <= steps; i++) {
            const value = min + i * step;
            const y = this.value_to_y(value);

            const line = this.svg_element('line', {
                'x1': area.x,
                'y1': y,
                'x2': area.x + area.width,
                'y2': y,
                'stroke': 'var(--chart-grid-color, #e0e0e0)',
                'stroke-width': 1
            });
            grid.add(line);

            // Y-axis label
            const label = this.svg_element('text', {
                'x': area.x - 8,
                'y': y + 4,
                'text-anchor': 'end',
                'font-size': 11,
                'fill': 'var(--chart-text-color, #666)'
            });
            // Format number?
            label.add(Math.round(value).toString());
            grid.add(label);
        }

        this._svg.add(grid);
    }

    /**
     * Get legend items. Override in subclasses like Pie_Chart
     * to customize legend content.
     * @returns {Array<{name: string, color: string}>} Legend items
     */
    get_legend_items() {
        if (!this._series || !this._series.length) return [];
        return this._series.map(s => ({
            name: s.name,
            color: s.color,
            visible: !this._hidden_series.has(s.name)
        }));
    }

    /**
     * Render the legend component.
     */
    render_legend() {
        // Remove existing legend if any
        if (this._legend_ctrl) {
            this.remove(this._legend_ctrl);
        }

        const items = this.get_legend_items();
        if (!items || !items.length) return;

        const legend = new Control({ context: this.context });
        legend.add_class('chart-legend');
        legend.add_class(`legend-${this._show_legend}`);
        this._legend_ctrl = legend;

        items.forEach((item) => {
            const itemEl = new Control({ context: this.context });
            itemEl.add_class('legend-item');
            if (!item.visible) itemEl.add_class('hidden');

            const swatch = new Control({ context: this.context });
            swatch.add_class('legend-swatch');
            swatch.dom.attributes.style = `background-color: ${item.color}`;
            itemEl.add(swatch);

            const label = new Control({ context: this.context });
            label.add_class('legend-label');
            label.add(item.name);
            itemEl.add(label);

            // Client-side click handler setup handled in activate() via delegated event or specific bind?
            // Since we re-render on server, we can add data-attribute for client to pick up
            itemEl.dom.attributes['data-series'] = item.name;

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

            // Responsive sizing
            if (this._auto_size && typeof ResizeObserver !== 'undefined') {
                this._setup_resize_observer();
            }

            // Legend interactions
            this._setup_legend_interactions();

            // Initial Render (if empty SVG)
            if (this._series && this._series.length && (!this._svg || this._svg.content.length === 0)) {
                this.render_chart_content();
            }
        }
    }

    _setup_resize_observer() {
        const el = this.dom.el;
        if (!el) return;

        let resize_timeout;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.contentRect) {
                    const { width, height } = entry.contentRect;

                    // Throttle resize
                    if (resize_timeout) clearTimeout(resize_timeout);
                    resize_timeout = setTimeout(() => {
                        this._resize(width, height);
                    }, 100);
                }
            }
        });

        observer.observe(el);
        this._resize_observer = observer;
    }

    _resize(width, height) {
        // Adjust for legend if it takes space (not overlay)
        // This handles simple resizing of the graph area within container
        // Actually, improved approach:
        // If 'auto', we read the container size.
        // We need to account for legend taking up space.

        const el = this.dom.el;

        // Simple heuristic: if we are resizing, update internal dims and redraw
        // But need to subtract legend size if fixed
        let chart_w = width;
        let chart_h = height;

        // If legend is side-by-side, it's tricky without sophisticated layout engine.
        // For now, assume chart takes 100% of available space in container (which includes legend).
        // If legend is outside SVG, SVG needs to shrink.

        const svg_el = el.querySelector('svg');
        const legend_el = el.querySelector('.chart-legend');

        if (legend_el && (this._show_legend === 'top' || this._show_legend === 'bottom')) {
            chart_h -= legend_el.offsetHeight;
        }
        if (legend_el && (this._show_legend === 'left' || this._show_legend === 'right')) {
            chart_w -= legend_el.offsetWidth;
        }

        if (chart_w !== this._chart_width || chart_h !== this._chart_height) {
            this._chart_width = chart_w;
            this._chart_height = chart_h;

            this._update_svg_attribs();
            this.render_chart_content();
        }
    }

    _setup_legend_interactions() {
        const el = this.dom.el;
        if (!el) return;

        // Delegated click
        el.addEventListener('click', (e) => {
            const item = e.target.closest('.legend-item');
            if (item) {
                const seriesName = item.getAttribute('data-series');
                this._toggle_series(seriesName);
            }
        });
    }

    _toggle_series(name) {
        if (this._hidden_series.has(name)) {
            this._hidden_series.delete(name);
        } else {
            this._hidden_series.add(name);
        }

        // Re-render legend to update visuals (opacity)
        // And re-render chart

        // Update DOM classes directly for legend to avoid full re-render flickering
        const el = this.dom.el;
        const item = el.querySelector(`.legend-item[data-series="${name}"]`);
        if (item) {
            if (this._hidden_series.has(name)) {
                item.classList.add('hidden');
            } else {
                item.classList.remove('hidden');
            }
        }

        this.render_chart_content();
    }

    /**
     * Raise a unified point event.
     * @param {string} type - 'point-click' or 'point-hover'
     * @param {Object} payload
     */
    raise_event(type, payload) {
        this.raise(type, {
            ...payload,
            event: type,
            target: this
        });
    }
}

// Static CSS
Chart_Base.css = `
.chart {
    display: flex;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    user-select: none;
    --chart-text-color: #666;
    --chart-grid-color: #e0e0e0;
}

.chart.variant-dark {
    background-color: #222;
    --chart-text-color: #aaa;
    --chart-grid-color: #444;
}

.chart.layout-bottom { flex-direction: column; }
.chart.layout-top { flex-direction: column-reverse; }
.chart.layout-left { flex-direction: row-reverse; }
.chart.layout-right { flex-direction: row; }

.chart-svg {
    display: block;
    flex-grow: 1;
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
    align-items: center;
}

.chart.layout-left .chart-legend,
.chart.layout-right .chart-legend {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--chart-text-color);
    cursor: pointer;
    transition: opacity 0.2s;
}

.legend-item:hover {
    opacity: 0.8;
}

.legend-item.hidden {
    opacity: 0.4;
    text-decoration: line-through;
}

.legend-swatch {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
}
`;

// Export palettes and sizes
Chart_Base.PALETTES = CHART_PALETTES;
Chart_Base.SIZES = CHART_SIZES;

module.exports = Chart_Base;
