// Quick test script
const jsgui = require('./html-core/html-core');
const { Bar_Chart, Pie_Chart } = require('./controls/charts');

const context = new jsgui.Page_Context();

// Test Bar_Chart
console.log('=== Bar_Chart Test ===');
const bar = new Bar_Chart({
    context,
    data: {
        labels: ['A', 'B'],
        series: [{ name: 'X', values: [10, 20] }]
    }
});

const range = bar.get_value_range();
console.log('Range:', range);

const area = bar.get_chart_area();
console.log('Area:', area);

// Calculate bar position manually
const value = 20;
const min = range.min;
const max = range.max;
const bar_height = ((value - min) / (max - min)) * area.height;
console.log('Bar height for 20:', bar_height);

const html = bar.all_html_render();
// Extract just one rect to see its attributes
const rectMatch = html.match(/<rect[^>]*data-value="20"[^>]*>/);
console.log('Rect for 20:', rectMatch ? rectMatch[0] : 'not found');

// Test Pie_Chart
console.log('\n=== Pie_Chart Test ===');
const pie = new Pie_Chart({
    context,
    data: {
        labels: ['A', 'B', 'C'],
        series: [{ values: [30, 40, 30] }]
    }
});

const pieDim = pie.get_pie_dimensions();
console.log('Pie dimensions:', pieDim);

const pieHtml = pie.all_html_render();
const pathMatch = pieHtml.match(/d="[^"]+"/g);
console.log('Paths found:', pathMatch ? pathMatch.length : 0);
if (pathMatch && pathMatch[0]) {
    console.log('First path:', pathMatch[0].slice(0, 200));
}
