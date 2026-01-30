/**
 * Chart Data Adapters
 * 
 * Helper functions to transform various raw data shapes into 
 * standard chart format { labels: [], series: [] }.
 */

const { each, tof } = require('../../html-core/html-core');

// Standardize series object structure
const create_series = (name, values, color) => ({
    name,
    values,
    ...(color ? { color } : {})
});

const adapters = {
    /**
     * Normalize data based on detected or specified shape.
     * @param {Array|Object} data - Raw data
     * @param {Object} options - formatting options
     */
    normalize(data, options = {}) {
        if (!data) return { labels: [], series: [] };

        // Already in standard format
        if (data.labels && data.series) return data;

        // Detect shape if passed as array
        if (Array.isArray(data)) {
            if (data.length === 0) return { labels: [], series: [] };

            const first = data[0];

            // Explicit mapping provided
            if (options.key && options.value) {
                if (first[options.key] !== undefined && first[options.value] !== undefined) {
                    return adapters.categorical(data, options);
                }
            }

            // Time series: { day/date/time, count/value }
            if (first.day !== undefined || first.date !== undefined || first.time !== undefined) {
                return adapters.time_series(data, options);
            }

            // Categorical: { label, value }
            if (first.label !== undefined && first.value !== undefined) {
                return adapters.categorical(data, options);
            }

            // Histogram buckets: { min, max, count }
            if (first.min !== undefined && first.max !== undefined && first.count !== undefined) {
                return adapters.histogram(data, options);
            }

            // Scatter: { x, y }
            if (first.x !== undefined && first.y !== undefined) {
                return adapters.scatter(data, options);
            }
        }

        return { labels: [], series: [] };
    },

    /**
     * Convert time series data.
     * Expects: [{ day: '2023-01-01', count: 10 }, ...]
     * Output: { labels: ['2023-01-01', ...], series: [{ name: 'Count', values: [10, ...] }] }
     */
    time_series(data, options = {}) {
        const key_field = options.key || (data[0].day ? 'day' : (data[0].date ? 'date' : 'time'));
        const value_field = options.value || 'count';
        const series_name = options.name || 'Count';

        const labels = [];
        const values = [];

        data.forEach(item => {
            labels.push(item[key_field]);
            values.push(item[value_field]);
        });

        return {
            labels,
            series: [create_series(series_name, values)]
        };
    },

    /**
     * Convert categorical data.
     * Expects: [{ label: 'A', value: 10 }, ...]
     */
    categorical(data, options = {}) {
        const key_field = options.key || 'label';
        const value_field = options.value || 'value';
        const series_name = options.name || 'Value';

        const labels = [];
        const values = [];

        data.forEach(item => {
            labels.push(item[key_field]);
            values.push(item[value_field]);
        });

        return {
            labels,
            series: [create_series(series_name, values)]
        };
    },

    /**
     * Convert histogram bucket data.
     * Expects: [{ min: 0, max: 10, count: 5 }, ...]
     */
    histogram(data, options = {}) {
        const series_name = options.name || 'Frequency';

        const labels = [];
        const values = [];

        data.forEach(item => {
            // Format label as range "0-10"
            const label = `${item.min}-${item.max}`;
            labels.push(label);
            values.push(item.count);
        });

        return {
            labels,
            series: [create_series(series_name, values)]
        };
    },

    /**
     * Convert scatter data (special case, usually no labels array but x/y pairs).
     * This might need adjusting depending on how Scatter_Chart expects data.
     * Assuming Scatter_Chart might want [{ x, y }] in series values.
     */
    scatter(data, options = {}) {
        const series_name = options.name || 'Points';
        return {
            labels: [], // Scatter charts often don't use categorical labels
            series: [create_series(series_name, data)]
        };
    }
};

module.exports = adapters;
