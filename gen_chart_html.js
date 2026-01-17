// Quick HTML file generation
const jsgui = require('./html-core/html-core');
const { Bar_Chart, Pie_Chart } = require('./controls/charts');
const fs = require('fs');

const context = new jsgui.Page_Context();

// Create a simple bar chart
const bar = new Bar_Chart({
    context,
    data: {
        labels: ['A', 'B', 'C'],
        series: [{ name: 'Test', values: [100, 150, 120] }]
    }
});

const html = `<!DOCTYPE html>
<html>
<head>
    <title>Chart Test</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #eee; }
        .chart { background: white; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>Bar Chart Test</h1>
    ${bar.all_html_render()}
</body>
</html>`;

fs.writeFileSync('chart_test.html', html);
console.log('Wrote chart_test.html');
console.log('Range:', bar.get_value_range());
console.log('Area:', bar.get_chart_area());
console.log('Labels:', bar._labels);
console.log('Series count:', bar._series ? bar._series.length : 0);

// Check for NaN in output
if (html.includes('NaN')) {
    console.log('WARNING: NaN found in HTML!');
    const nanMatch = html.match(/[^\s]*NaN[^\s]*/g);
    console.log('NaN context:', nanMatch);
}
