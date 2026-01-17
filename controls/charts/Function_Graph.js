/**
 * Function Graph Control
 * 
 * Graphs mathematical functions by sampling and plotting them.
 * Accepts functions directly - the chart handles sampling and rendering.
 * 
 * @example
 * // Graph sin(x)
 * new Function_Graph({
 *     fn: x => Math.sin(x),
 *     x_range: [-Math.PI * 2, Math.PI * 2]
 * });
 * 
 * // Multiple functions
 * new Function_Graph({
 *     functions: [
 *         { fn: x => Math.sin(x), name: 'sin(x)', color: '#4285f4' },
 *         { fn: x => Math.cos(x), name: 'cos(x)', color: '#ea4335' }
 *     ],
 *     x_range: [-Math.PI * 2, Math.PI * 2]
 * });
 */

const Chart_Base = require('./Chart_Base');

class Function_Graph extends Chart_Base {
    /**
     * Create a Function Graph.
     * @param {Object} spec - Control specification
     * @param {Function} [spec.fn] - Single function to graph: (x) => y
     * @param {Array} [spec.functions] - Multiple functions: [{ fn, name, color }, ...]
     * @param {Array} [spec.x_range=[-10, 10]] - X-axis range [min, max]
     * @param {Array} [spec.y_range] - Y-axis range [min, max] (auto if not set)
     * @param {number} [spec.samples=200] - Number of sample points
     * @param {number} [spec.line_width=2] - Line thickness
     * @param {boolean} [spec.show_axes=true] - Show axis lines
     * @param {boolean} [spec.show_origin=true] - Highlight origin
     */
    constructor(spec = {}) {
        spec.__type_name = 'function_graph';
        super(spec);

        // Function configuration
        this._functions = this._normalize_functions(spec);
        this._x_range = spec.x_range || [-10, 10];
        this._y_range = spec.y_range || null; // Auto-calculate if null
        this._samples = spec.samples || 200;
        this._line_width = spec.line_width || 2;
        this._show_axes = spec.show_axes !== false;
        this._show_origin = spec.show_origin !== false;

        this.add_class('function-graph');

        // Re-render with our properties
        if (!spec.abstract && !spec.el && this._svg) {
            this.render_chart();
        }
    }

    /**
     * Normalize function input to standard format.
     * @private
     */
    _normalize_functions(spec) {
        const palette = this._palette || ['#4285f4', '#ea4335', '#fbbc04', '#34a853'];

        // Single function shorthand
        if (typeof spec.fn === 'function') {
            return [{
                fn: spec.fn,
                name: spec.name || 'f(x)',
                color: spec.color || palette[0]
            }];
        }

        // Multiple functions
        if (Array.isArray(spec.functions)) {
            return spec.functions.map((f, i) => ({
                fn: f.fn,
                name: f.name || `f${i + 1}(x)`,
                color: f.color || palette[i % palette.length]
            }));
        }

        return [];
    }

    /**
     * Add a function to the graph.
     * @param {Function} fn - The function to add
     * @param {string} [name] - Display name
     * @param {string} [color] - Line color
     */
    add_function(fn, name, color) {
        const index = this._functions.length;
        this._functions.push({
            fn,
            name: name || `f${index + 1}(x)`,
            color: color || this._palette[index % this._palette.length]
        });
        this.render_chart();
    }

    /**
     * Clear all functions.
     */
    clear_functions() {
        this._functions = [];
        this.render_chart();
    }

    /**
     * Sample a function over the x range.
     * @private
     */
    _sample_function(fn) {
        // Use defaults if not set yet
        const x_range = this._x_range || [-10, 10];
        const samples = this._samples || 200;
        const [x_min, x_max] = x_range;
        const step = (x_max - x_min) / (samples - 1);
        const points = [];

        for (let i = 0; i < samples; i++) {
            const x = x_min + i * step;
            try {
                const y = fn(x);
                if (isFinite(y)) {
                    points.push({ x, y });
                } else {
                    points.push({ x, y: null }); // Discontinuity
                }
            } catch (e) {
                points.push({ x, y: null }); // Error in function
            }
        }

        return points;
    }

    /**
     * Calculate Y range from sampled data.
     * @private
     */
    _calculate_y_range() {
        if (this._y_range) return this._y_range;
        const functions = this._functions || [];

        let y_min = Infinity, y_max = -Infinity;

        for (const func of functions) {
            const points = this._sample_function(func.fn);
            for (const p of points) {
                if (p.y !== null) {
                    if (p.y < y_min) y_min = p.y;
                    if (p.y > y_max) y_max = p.y;
                }
            }
        }

        // Add 10% padding
        const range = y_max - y_min;
        y_min -= range * 0.1;
        y_max += range * 0.1;

        // Use symmetric range if crossing zero
        if (y_min < 0 && y_max > 0) {
            const absMax = Math.max(Math.abs(y_min), Math.abs(y_max));
            y_min = -absMax;
            y_max = absMax;
        }

        return [y_min, y_max];
    }

    /**
     * Convert X value to pixel.
     */
    x_to_pixel(x) {
        const area = this.get_chart_area();
        const x_range = this._x_range || [-10, 10];
        const [x_min, x_max] = x_range;
        return area.x + (x - x_min) / (x_max - x_min) * area.width;
    }

    /**
     * Convert Y value to pixel.
     */
    y_to_pixel(y) {
        const area = this.get_chart_area();
        const [y_min, y_max] = this._calculate_y_range();
        return area.y + area.height - (y - y_min) / (y_max - y_min) * area.height;
    }

    /**
     * Get legend items.
     */
    get_legend_items() {
        const functions = this._functions || [];
        return functions.map(f => ({
            name: f.name,
            color: f.color
        }));
    }

    /**
     * Render the function graph.
     */
    render_chart() {
        if (!this._svg) return;
        this._svg.clear();

        if (this._show_grid) {
            this.render_grid();
        }

        if (this._show_axes) {
            this.render_axes();
        }

        this.render_functions();
    }

    /**
     * Render the grid.
     */
    render_grid() {
        const area = this.get_chart_area();
        const x_range = this._x_range || [-10, 10];
        const [x_min, x_max] = x_range;
        const [y_min, y_max] = this._calculate_y_range();
        const grid = this.svg_element('g', { 'class': 'chart-grid' });

        // Horizontal grid lines
        const y_step = (y_max - y_min) / 8;
        for (let y = y_min; y <= y_max; y += y_step) {
            const py = this.y_to_pixel(y);
            const line = this.svg_element('line', {
                'x1': area.x, 'y1': py,
                'x2': area.x + area.width, 'y2': py,
                'stroke': '#e0e0e0', 'stroke-width': 1
            });
            grid.add(line);
        }

        // Vertical grid lines
        const x_step = (x_max - x_min) / 8;
        for (let x = x_min; x <= x_max; x += x_step) {
            const px = this.x_to_pixel(x);
            const line = this.svg_element('line', {
                'x1': px, 'y1': area.y,
                'x2': px, 'y2': area.y + area.height,
                'stroke': '#e0e0e0', 'stroke-width': 1
            });
            grid.add(line);
        }

        this._svg.add(grid);
    }

    /**
     * Render the coordinate axes.
     */
    render_axes() {
        const area = this.get_chart_area();
        const x_range = this._x_range || [-10, 10];
        const [x_min, x_max] = x_range;
        const [y_min, y_max] = this._calculate_y_range();
        const axes = this.svg_element('g', { 'class': 'chart-axes' });

        // X-axis (y=0 line)
        if (y_min <= 0 && y_max >= 0) {
            const y0 = this.y_to_pixel(0);
            const x_axis = this.svg_element('line', {
                'x1': area.x, 'y1': y0,
                'x2': area.x + area.width, 'y2': y0,
                'stroke': '#333', 'stroke-width': 1.5
            });
            axes.add(x_axis);
        }

        // Y-axis (x=0 line)
        if (x_min <= 0 && x_max >= 0) {
            const x0 = this.x_to_pixel(0);
            const y_axis = this.svg_element('line', {
                'x1': x0, 'y1': area.y,
                'x2': x0, 'y2': area.y + area.height,
                'stroke': '#333', 'stroke-width': 1.5
            });
            axes.add(y_axis);
        }

        // Origin marker
        if (this._show_origin && x_min <= 0 && x_max >= 0 && y_min <= 0 && y_max >= 0) {
            const origin = this.svg_element('circle', {
                'cx': this.x_to_pixel(0),
                'cy': this.y_to_pixel(0),
                'r': 4,
                'fill': '#333'
            });
            axes.add(origin);
        }

        // Axis labels
        this._render_axis_labels(axes, x_min, x_max, y_min, y_max);

        this._svg.add(axes);
    }

    /**
     * Render axis labels.
     * @private
     */
    _render_axis_labels(axes, x_min, x_max, y_min, y_max) {
        const area = this.get_chart_area();

        // X-axis labels
        const x_step = (x_max - x_min) / 4;
        for (let x = x_min; x <= x_max + 0.0001; x += x_step) {
            const px = this.x_to_pixel(x);
            const label = this.svg_element('text', {
                'x': px, 'y': area.y + area.height + 15,
                'text-anchor': 'middle', 'font-size': 10, 'fill': '#666'
            });
            label.add(this._format_number(x));
            axes.add(label);
        }

        // Y-axis labels
        const y_step = (y_max - y_min) / 4;
        for (let y = y_min; y <= y_max + 0.0001; y += y_step) {
            const py = this.y_to_pixel(y);
            const label = this.svg_element('text', {
                'x': area.x - 5, 'y': py + 4,
                'text-anchor': 'end', 'font-size': 10, 'fill': '#666'
            });
            label.add(this._format_number(y));
            axes.add(label);
        }
    }

    /**
     * Format a number for axis labels.
     * @private
     */
    _format_number(n) {
        if (Math.abs(n) < 0.0001) return '0';
        if (Math.abs(n - Math.PI) < 0.001) return 'π';
        if (Math.abs(n + Math.PI) < 0.001) return '-π';
        if (Math.abs(n - 2 * Math.PI) < 0.001) return '2π';
        if (Math.abs(n + 2 * Math.PI) < 0.001) return '-2π';
        if (Math.abs(n - Math.PI / 2) < 0.001) return 'π/2';
        if (Math.abs(n + Math.PI / 2) < 0.001) return '-π/2';
        return n.toFixed(1).replace(/\.0$/, '');
    }

    /**
     * Render all functions.
     */
    render_functions() {
        const functions = this._functions || [];
        if (!functions.length) return;

        const functions_group = this.svg_element('g', { 'class': 'chart-functions' });
        const line_width = this._line_width || 2;

        for (const func of functions) {
            const points = this._sample_function(func.fn);
            const path_data = this._create_path_data(points);

            if (path_data) {
                const path = this.svg_element('path', {
                    'd': path_data,
                    'fill': 'none',
                    'stroke': func.color,
                    'stroke-width': line_width,
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'class': 'function-line',
                    'data-name': func.name
                });
                functions_group.add(path);
            }
        }

        this._svg.add(functions_group);
    }

    /**
     * Create SVG path data from points.
     * @private
     */
    _create_path_data(points) {
        let path = '';
        let in_line = false;

        for (const p of points) {
            if (p.y === null) {
                in_line = false;
                continue;
            }

            const px = this.x_to_pixel(p.x);
            const py = this.y_to_pixel(p.y);

            if (!in_line) {
                path += `M ${px} ${py} `;
                in_line = true;
            } else {
                path += `L ${px} ${py} `;
            }
        }

        return path.trim() || null;
    }
}

// CSS
Function_Graph.css = `
.function-graph .function-line {
    transition: stroke-width 0.15s ease;
}

.function-graph .function-line:hover {
    stroke-width: 4;
}
`;

module.exports = Function_Graph;
