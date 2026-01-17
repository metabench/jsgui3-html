// Test Function_Graph
const jsgui = require('./html-core/html-core');
const Function_Graph = require('./controls/charts/Function_Graph');

const context = new jsgui.Page_Context();

const graph = new Function_Graph({
    context,
    fn: x => Math.sin(x),
    name: 'sin(x)',
    x_range: [-2 * Math.PI, 2 * Math.PI],
    width: 500,
    height: 300
});

const html = graph.all_html_render();
console.log('HTML length:', html.length);
console.log('Has path:', html.includes('<path'));
console.log('Has function-graph class:', html.includes('function-graph'));
console.log('SUCCESS!', html.includes('<path') && html.includes('function-graph'));
