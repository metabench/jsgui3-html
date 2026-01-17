/**
 * Chart Demo Server
 * 
 * Simple Express server to view charts in browser.
 * Run with: node lab/chart_demo_server.js
 */

const http = require('http');
const jsgui = require('../html-core/html-core');
const { Bar_Chart, Pie_Chart } = require('../controls/charts');

const PORT = 3456;

const create_chart_html = () => {
    const context = new jsgui.Page_Context();

    // Create page wrapper
    const page = new jsgui.Control({ context });
    page.dom.tagName = 'div';
    page.add_class('chart-demo');

    // Title
    const title = new jsgui.Control({ context, tag_name: 'h1' });
    title.add('Chart Controls Demo');
    page.add(title);

    // Section: Bar Charts
    const bar_section = new jsgui.Control({ context });
    bar_section.add_class('section');

    const bar_title = new jsgui.Control({ context, tag_name: 'h2' });
    bar_title.add('Bar Charts');
    bar_section.add(bar_title);

    const bar_grid = new jsgui.Control({ context });
    bar_grid.add_class('chart-grid');

    // Grouped Bar Chart
    const grouped_wrapper = new jsgui.Control({ context });
    grouped_wrapper.add_class('chart-wrapper');
    const grouped_label = new jsgui.Control({ context, tag_name: 'h3' });
    grouped_label.add('Grouped Bar Chart');
    grouped_wrapper.add(grouped_label);

    const grouped_chart = new Bar_Chart({
        context,
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            series: [
                { name: 'Revenue', values: [120, 150, 180, 200, 170, 210] },
                { name: 'Expenses', values: [80, 90, 100, 110, 95, 105] }
            ]
        }
    });
    grouped_wrapper.add(grouped_chart);
    bar_grid.add(grouped_wrapper);

    // Stacked Bar Chart
    const stacked_wrapper = new jsgui.Control({ context });
    stacked_wrapper.add_class('chart-wrapper');
    const stacked_label = new jsgui.Control({ context, tag_name: 'h3' });
    stacked_label.add('Stacked Bar Chart');
    stacked_wrapper.add(stacked_label);

    const stacked_chart = new Bar_Chart({
        context,
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
    stacked_wrapper.add(stacked_chart);
    bar_grid.add(stacked_wrapper);

    // Single Series Bar
    const single_wrapper = new jsgui.Control({ context });
    single_wrapper.add_class('chart-wrapper');
    const single_label = new jsgui.Control({ context, tag_name: 'h3' });
    single_label.add('Single Series');
    single_wrapper.add(single_label);

    const single_chart = new Bar_Chart({
        context,
        variant: 'colorful',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            series: [{ name: 'Tasks', values: [12, 19, 8, 15, 10] }]
        }
    });
    single_wrapper.add(single_chart);
    bar_grid.add(single_wrapper);

    bar_section.add(bar_grid);
    page.add(bar_section);

    // Section: Pie Charts
    const pie_section = new jsgui.Control({ context });
    pie_section.add_class('section');

    const pie_title = new jsgui.Control({ context, tag_name: 'h2' });
    pie_title.add('Pie Charts');
    pie_section.add(pie_title);

    const pie_grid = new jsgui.Control({ context });
    pie_grid.add_class('chart-grid');

    // Basic Pie
    const pie_wrapper = new jsgui.Control({ context });
    pie_wrapper.add_class('chart-wrapper');
    const pie_label = new jsgui.Control({ context, tag_name: 'h3' });
    pie_label.add('Basic Pie Chart');
    pie_wrapper.add(pie_label);

    const pie_chart = new Pie_Chart({
        context,
        data: {
            labels: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'],
            series: [{ values: [65, 15, 10, 7, 3] }]
        }
    });
    pie_wrapper.add(pie_chart);
    pie_grid.add(pie_wrapper);

    // Donut Chart
    const donut_wrapper = new jsgui.Control({ context });
    donut_wrapper.add_class('chart-wrapper');
    const donut_label = new jsgui.Control({ context, tag_name: 'h3' });
    donut_label.add('Donut Chart');
    donut_wrapper.add(donut_label);

    const donut_chart = new Pie_Chart({
        context,
        mode: 'donut',
        data: {
            labels: ['Complete', 'In Progress', 'Pending'],
            series: [{ values: [60, 25, 15] }]
        }
    });
    donut_wrapper.add(donut_chart);
    pie_grid.add(donut_wrapper);

    // Colorful Donut
    const colorful_wrapper = new jsgui.Control({ context });
    colorful_wrapper.add_class('chart-wrapper');
    const colorful_label = new jsgui.Control({ context, tag_name: 'h3' });
    colorful_label.add('Colorful Variant');
    colorful_wrapper.add(colorful_label);

    const colorful_chart = new Pie_Chart({
        context,
        variant: 'colorful',
        mode: 'donut',
        data: {
            labels: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'],
            series: [{ values: [20, 20, 20, 20, 20] }]
        }
    });
    colorful_wrapper.add(colorful_chart);
    pie_grid.add(colorful_wrapper);

    pie_section.add(pie_grid);
    page.add(pie_section);

    const content_html = page.all_html_render();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chart Controls Demo</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 32px;
        }
        
        .chart-demo {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        h1 {
            color: white;
            text-align: center;
            font-size: 2.5rem;
            margin: 0 0 40px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        h2 {
            color: white;
            font-size: 1.5rem;
            margin: 0 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
        }
        
        h3 {
            color: #333;
            font-size: 0.9rem;
            margin: 0 0 12px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        
        .section {
            margin-bottom: 48px;
        }
        
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(520px, 1fr));
            gap: 24px;
        }
        
        .chart-wrapper {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .chart-wrapper:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .chart {
            display: block;
        }
        
        .chart-svg {
            display: block;
            max-width: 100%;
            height: auto;
        }
        
        .chart-legend {
            display: flex;
            justify-content: center;
            gap: 16px;
            padding: 12px 0;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #666;
        }
        
        .legend-swatch {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }
    </style>
</head>
<body>
    ${content_html}
</body>
</html>`;
};

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/charts') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(create_chart_html());
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Chart demo server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
