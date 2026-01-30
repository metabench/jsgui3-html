/**
 * Flexi_Chart Demo
 */

const http = require('http');
const jsgui = require('../html-core/html-core');
const { Flexi_Chart } = require('../controls/charts');

const PORT = process.env.PORT || 3336;

const create_demo_html = () => {
    const context = new jsgui.Page_Context();

    // Create page wrapper
    const page = new jsgui.Control({ context });
    page.dom.tagName = 'div';
    page.dom.attributes.style = 'font-family: sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; background-color: #f0f2f5;';

    // Title
    const title = new jsgui.Control({ context, tag_name: 'h1' });
    title.dom.attributes.style = 'text-align: center; color: #333; margin-bottom: 40px;';
    title.add('Flexi_Chart Demo');
    page.add(title);

    // Container for charts
    const grid = new jsgui.Control({ context, tag_name: 'div' });
    grid.dom.attributes.style = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 40px;';
    page.add(grid);

    // Helper to create card
    const create_card = (content) => {
        const card = new jsgui.Control({ context, tag_name: 'div' });
        card.dom.attributes.style = 'background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 20px; overflow: hidden;';
        card.add(content);
        return card;
    };

    // 1. Time Series Chart (Column)
    const time_series_data = [
        { date: '2023-01-01', visitors: 120 },
        { date: '2023-01-02', visitors: 150 },
        { date: '2023-01-03', visitors: 180 },
        { date: '2023-01-04', visitors: 220 },
        { date: '2023-01-05', visitors: 190 },
        { date: '2023-01-06', visitors: 240 },
        { date: '2023-01-07', visitors: 280 }
    ];

    const chart1 = new Flexi_Chart({
        context,
        title: 'Website Visitors (Time Series)',
        type: 'column',
        data: time_series_data,
        options: {
            key: 'date',
            value: 'visitors',
            name: 'Daily Visitors'
        },
        variant: 'dark',
        height: 300
    });
    grid.add(create_card(chart1));

    // 2. Categorical Chart (Pie/Donut)
    const categorical_data = [
        { browser: 'Chrome', share: 65 },
        { browser: 'Firefox', share: 15 },
        { browser: 'Safari', share: 10 },
        { browser: 'Edge', share: 5 },
        { browser: 'Other', share: 5 }
    ];

    const chart2 = new Flexi_Chart({
        context,
        title: 'Browser Market Share (Categorical)',
        type: 'donut',
        data: categorical_data,
        options: {
            key: 'browser',
            value: 'share'
        },
        legend: 'right',
        height: 300
    });
    grid.add(create_card(chart2));

    // 3. Multi-series Bar Chart (Pre-normalized)
    const chart3 = new Flexi_Chart({
        context,
        title: 'Quarterly Revenue (Stacked)',
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            series: [
                { name: 'Product A', values: [30, 40, 45, 50], color: '#4285f4' },
                { name: 'Product B', values: [20, 25, 30, 35], color: '#34a853' }
            ]
        },
        mode: 'stacked',
        legend: 'top',
        height: 300
    });
    grid.add(create_card(chart3));

    // 4. Area Chart (Line-like)
    const chart4 = new Flexi_Chart({
        context,
        title: 'Trend (Area)',
        type: 'line', // Uses Area_Chart with defaults
        data: [
            { time: 1, val: 10 },
            { time: 2, val: 15 },
            { time: 3, val: 13 },
            { time: 4, val: 20 },
            { time: 5, val: 25 }
        ],
        options: { key: 'time', value: 'val' },
        show_points: true,
        height: 300
    });
    grid.add(create_card(chart4));

    // 5. Scatter Chart
    const chart5 = new Flexi_Chart({
        context,
        title: 'Correlation (Scatter)',
        type: 'scatter',
        data: [
            { x: 10, y: 20 },
            { x: 15, y: 25 },
            { x: 20, y: 15 },
            { x: 25, y: 30 },
            { x: 30, y: 28 },
            { x: 35, y: 40 }
        ],
        show_trend_line: true,
        height: 300
    });
    grid.add(create_card(chart5));

    // 6. Loading State Demo
    const chart6 = new Flexi_Chart({
        context,
        title: 'Loading Demo',
        type: 'column',
        height: 300
    });
    chart6._chart.loading = true; // Manually set loading on inner chart for demo
    grid.add(create_card(chart6));

    return `<!DOCTYPE html>
<html>
<head>
    <title>Flexi_Chart Demo</title>
    <style>
        ${Flexi_Chart.css}
        /* Add CSS for internal chart types manually since we aren't using a bundler/system that aggregates them */
        ${require('../controls/charts/Chart_Base').css}
        ${require('../controls/charts/Bar_Chart').css}
        ${require('../controls/charts/Pie_Chart').css}
    </style>
</head>
<body>
    ${page.all_html_render()}
</body>
</html>`;
};

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(create_demo_html());
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Flexi_Chart demo server running at http://localhost:${PORT}`);
});
