/**
 * Chart Showcase Lab
 * 
 * Visual demonstration of all chart types with various configurations.
 */

const jsgui = require('../../html-core/html-core');
const { Control } = jsgui;
const { Bar_Chart, Pie_Chart } = require('../../controls/charts');

class Chart_Showcase extends Control {
    constructor(spec = {}) {
        super(spec);
        this.__type_name = 'chart_showcase';
        this.add_class('chart-showcase');

        if (!spec.abstract && !spec.el) {
            this.compose_showcase();
        }
    }

    compose_showcase() {
        const context = this.context;

        // Title
        const title = new Control({ context });
        title.dom.tagName = 'h1';
        title.add('Chart Controls Showcase');
        this.add(title);

        // Section: Bar Charts
        this.add_section('Bar Charts', [
            this.create_bar_chart_grouped(),
            this.create_bar_chart_stacked(),
            this.create_bar_chart_colorful()
        ]);

        // Section: Pie Charts
        this.add_section('Pie Charts', [
            this.create_pie_chart_basic(),
            this.create_pie_chart_donut(),
            this.create_pie_chart_colorful()
        ]);

        // Section: Variants
        this.add_section('Theme Variants', [
            this.create_bar_chart_minimal(),
            this.create_bar_chart_dark()
        ]);
    }

    add_section(title, charts) {
        const context = this.context;

        const section = new Control({ context });
        section.add_class('showcase-section');

        const header = new Control({ context });
        header.dom.tagName = 'h2';
        header.add(title);
        section.add(header);

        const grid = new Control({ context });
        grid.add_class('chart-grid');

        charts.forEach(chart => {
            const wrapper = new Control({ context });
            wrapper.add_class('chart-wrapper');
            wrapper.add(chart);
            grid.add(wrapper);
        });

        section.add(grid);
        this.add(section);
    }

    // ===== Bar Charts =====

    create_bar_chart_grouped() {
        const label = this.create_label('Grouped Bar Chart');
        const chart = new Bar_Chart({
            context: this.context,
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                series: [
                    { name: 'Revenue', values: [120, 150, 180, 200, 170, 210] },
                    { name: 'Expenses', values: [80, 90, 100, 110, 95, 105] }
                ]
            }
        });

        const container = new Control({ context: this.context });
        container.add(label);
        container.add(chart);
        return container;
    }

    create_bar_chart_stacked() {
        const label = this.create_label('Stacked Bar Chart');
        const chart = new Bar_Chart({
            context: this.context,
            mode: 'stacked',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                series: [
                    { name: 'Product A', values: [30, 40, 35, 50] },
                    { name: 'Product B', values: [25, 35, 30, 45] },
                    { name: 'Product C', values: [20, 25, 28, 30] }
                ]
            }
        });

        const container = new Control({ context: this.context });
        container.add(label);
        container.add(chart);
        return container;
    }

    create_bar_chart_colorful() {
        const label = this.create_label('Colorful Variant');
        const chart = new Bar_Chart({
            context: this.context,
            variant: 'colorful',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                series: [
                    { name: 'Tasks', values: [12, 19, 8, 15, 10] }
                ]
            }
        });

        const container = new Control({ context: this.context });
        container.add(label);
        container.add(chart);
        return container;
    }

    create_bar_chart_minimal() {
        const label = this.create_label('Minimal Variant');
        const chart = new Bar_Chart({
            context: this.context,
            variant: 'minimal',
            data: {
                labels: ['A', 'B', 'C', 'D'],
                series: [
                    { name: 'Value', values: [40, 65, 50, 80] }
                ]
            }
        });

        const container = new Control({ context: this.context });
        container.add(label);
        container.add(chart);
        return container;
    }

    create_bar_chart_dark() {
        const label = this.create_label('Dark Variant');
        const chart = new Bar_Chart({
            context: this.context,
            variant: 'dark',
            data: {
                labels: ['2020', '2021', '2022', '2023'],
                series: [
                    { name: 'Growth', values: [100, 130, 160, 200] }
                ]
            }
        });

        const container = new Control({ context: this.context });
        container.add(label);
        container.add(chart);
        return container;
    }

    // ===== Pie Charts =====

    create_pie_chart_basic() {
        const label = this.create_label('Basic Pie Chart');
        const chart = new Pie_Chart({
            context: this.context,
            data: {
                labels: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'],
                series: [{ values: [65, 15, 10, 7, 3] }]
            }
        });

        const container = new Control({ context: this.context });
        container.add(label);
        container.add(chart);
        return container;
    }

    create_pie_chart_donut() {
        const label = this.create_label('Donut Chart');
        const chart = new Pie_Chart({
            context: this.context,
            mode: 'donut',
            data: {
                labels: ['Complete', 'In Progress', 'Pending'],
                series: [{ values: [60, 25, 15] }]
            }
        });

        const container = new Control({ context: this.context });
        container.add(label);
        container.add(chart);
        return container;
    }

    create_pie_chart_colorful() {
        const label = this.create_label('Colorful Variant');
        const chart = new Pie_Chart({
            context: this.context,
            variant: 'colorful',
            mode: 'donut',
            data: {
                labels: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'],
                series: [{ values: [20, 20, 20, 20, 20] }]
            }
        });

        const container = new Control({ context: this.context });
        container.add(label);
        container.add(chart);
        return container;
    }

    create_label(text) {
        const label = new Control({ context: this.context });
        label.dom.tagName = 'h3';
        label.add_class('chart-label');
        label.add(text);
        return label;
    }
}

Chart_Showcase.css = `
.chart-showcase {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 24px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
}

.chart-showcase h1 {
    margin: 0 0 32px 0;
    font-size: 2rem;
    color: #1a1a2e;
    text-align: center;
}

.chart-showcase h2 {
    margin: 0 0 16px 0;
    font-size: 1.25rem;
    color: #333;
    border-bottom: 2px solid #4285f4;
    padding-bottom: 8px;
}

.showcase-section {
    margin-bottom: 48px;
}

.chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(520px, 1fr));
    gap: 24px;
}

.chart-wrapper {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}

.chart-wrapper:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.chart-label {
    margin: 0 0 12px 0;
    font-size: 0.9rem;
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
`;

module.exports = Chart_Showcase;
