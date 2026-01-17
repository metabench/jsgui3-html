/**
 * Function Graph Demo Server
 * 
 * Demonstrates the Function_Graph control with trigonometric functions.
 * Run with: node lab/function_graph_demo_server.js
 */

const http = require('http');
const jsgui = require('../html-core/html-core');
const { Function_Graph } = require('../controls/charts');

const PORT = 3457;

/**
 * Create the demo HTML page.
 */
function create_demo_html() {
    const context = new jsgui.Page_Context();

    // Page container
    const page = new jsgui.Control({ context });
    page.dom.attributes.style = 'padding: 40px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); min-height: 100vh;';

    // Title
    const title = new jsgui.Control({ context, tag_name: 'h1' });
    title.dom.attributes.style = 'color: #fff; margin-bottom: 10px; font-weight: 300;';
    title.add('📈 Function Graph Demo');
    page.add(title);

    const subtitle = new jsgui.Control({ context, tag_name: 'p' });
    subtitle.dom.attributes.style = 'color: #888; margin-bottom: 40px;';
    subtitle.add('Graphing mathematical functions with the Function_Graph control');
    page.add(subtitle);

    // Grid container
    const grid = new jsgui.Control({ context });
    grid.dom.attributes.style = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 30px;';

    // ===== Graph 1: Basic Sine Wave =====
    const card1 = create_card(context, 'Sine Wave', 'fn: x => Math.sin(x)');
    const graph1 = new Function_Graph({
        context,
        fn: x => Math.sin(x),
        name: 'sin(x)',
        x_range: [-2 * Math.PI, 2 * Math.PI],
        width: 500,
        height: 300,
        legend: 'bottom'
    });
    card1.add(graph1);
    grid.add(card1);

    // ===== Graph 2: Multiple Trig Functions =====
    const card2 = create_card(context, 'Trigonometric Functions', 'sin, cos, and tan');
    const graph2 = new Function_Graph({
        context,
        functions: [
            { fn: x => Math.sin(x), name: 'sin(x)', color: '#4285f4' },
            { fn: x => Math.cos(x), name: 'cos(x)', color: '#ea4335' },
            { fn: x => Math.tan(x) * 0.3, name: '0.3·tan(x)', color: '#fbbc04' }
        ],
        x_range: [-2 * Math.PI, 2 * Math.PI],
        y_range: [-2, 2],
        width: 500,
        height: 300,
        legend: 'right'
    });
    card2.add(graph2);
    grid.add(card2);

    // ===== Graph 3: Wave Interference =====
    const card3 = create_card(context, 'Wave Interference', 'sin(x) + sin(2x) creates complex patterns');
    const graph3 = new Function_Graph({
        context,
        functions: [
            { fn: x => Math.sin(x), name: 'sin(x)', color: '#4285f4' },
            { fn: x => Math.sin(2 * x), name: 'sin(2x)', color: '#ea4335' },
            { fn: x => Math.sin(x) + Math.sin(2 * x), name: 'sin(x) + sin(2x)', color: '#34a853' }
        ],
        x_range: [-2 * Math.PI, 2 * Math.PI],
        width: 500,
        height: 300,
        legend: 'bottom'
    });
    card3.add(graph3);
    grid.add(card3);

    // ===== Graph 4: Damped Oscillation =====
    const card4 = create_card(context, 'Damped Oscillation', 'e^(-x/5) · sin(x)');
    const graph4 = new Function_Graph({
        context,
        functions: [
            { fn: x => Math.exp(-x / 5) * Math.sin(x), name: 'e^(-x/5)·sin(x)', color: '#9c27b0' },
            { fn: x => Math.exp(-x / 5), name: 'envelope', color: '#e91e63' },
            { fn: x => -Math.exp(-x / 5), name: '-envelope', color: '#e91e63' }
        ],
        x_range: [0, 4 * Math.PI],
        width: 500,
        height: 300,
        legend: 'bottom'
    });
    card4.add(graph4);
    grid.add(card4);

    // ===== Graph 5: Lissajous Preview =====
    const card5 = create_card(context, 'Phase Shifted', 'sin(x) vs sin(x + π/4)');
    const graph5 = new Function_Graph({
        context,
        functions: [
            { fn: x => Math.sin(x), name: 'sin(x)', color: '#00bcd4' },
            { fn: x => Math.sin(x + Math.PI / 4), name: 'sin(x + π/4)', color: '#ff9800' },
            { fn: x => Math.sin(x + Math.PI / 2), name: 'sin(x + π/2) = cos(x)', color: '#8bc34a' }
        ],
        x_range: [-2 * Math.PI, 2 * Math.PI],
        width: 500,
        height: 300,
        legend: 'right'
    });
    card5.add(graph5);
    grid.add(card5);

    // ===== Graph 6: Polynomial vs Trig =====
    const card6 = create_card(context, 'Taylor Approximation', 'sin(x) ≈ x - x³/6 + x⁵/120');
    const graph6 = new Function_Graph({
        context,
        functions: [
            { fn: x => Math.sin(x), name: 'sin(x)', color: '#4285f4' },
            { fn: x => x, name: 'x (1st order)', color: '#aaa' },
            { fn: x => x - Math.pow(x, 3) / 6, name: 'x - x³/6 (3rd)', color: '#ff9800' },
            { fn: x => x - Math.pow(x, 3) / 6 + Math.pow(x, 5) / 120, name: '5th order', color: '#4caf50' }
        ],
        x_range: [-Math.PI, Math.PI],
        y_range: [-1.5, 1.5],
        width: 500,
        height: 300,
        legend: 'bottom'
    });
    card6.add(graph6);
    grid.add(card6);

    page.add(grid);

    // Code example section
    const code_section = new jsgui.Control({ context });
    code_section.dom.attributes.style = 'margin-top: 50px; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 30px;';

    const code_title = new jsgui.Control({ context, tag_name: 'h2' });
    code_title.dom.attributes.style = 'color: #fff; margin-bottom: 20px;';
    code_title.add('Usage Example');
    code_section.add(code_title);

    const code = new jsgui.Control({ context, tag_name: 'pre' });
    code.dom.attributes.style = 'background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: "Fira Code", monospace; font-size: 14px;';
    code.add(`// Simple: Single function
new Function_Graph({
    fn: x => Math.sin(x),
    x_range: [-2 * Math.PI, 2 * Math.PI]
});

// Multiple functions with names and colors
new Function_Graph({
    functions: [
        { fn: x => Math.sin(x), name: 'sin(x)', color: '#4285f4' },
        { fn: x => Math.cos(x), name: 'cos(x)', color: '#ea4335' }
    ],
    x_range: [-2 * Math.PI, 2 * Math.PI],
    legend: 'right'
});`);
    code_section.add(code);
    page.add(code_section);

    const content_html = page.all_html_render();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Function Graph Demo</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        .chart { background: #fff; border-radius: 8px; }
        .chart-legend { background: rgba(255,255,255,0.9); border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    ${content_html}
</body>
</html>`;
}

/**
 * Create a card wrapper.
 */
function create_card(context, title, description) {
    const card = new jsgui.Control({ context });
    card.dom.attributes.style = 'background: rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);';

    const heading = new jsgui.Control({ context, tag_name: 'h3' });
    heading.dom.attributes.style = 'color: #fff; margin-bottom: 8px; font-weight: 500;';
    heading.add(title);
    card.add(heading);

    const desc = new jsgui.Control({ context, tag_name: 'p' });
    desc.dom.attributes.style = 'color: #888; margin-bottom: 16px; font-size: 14px;';
    desc.add(description);
    card.add(desc);

    return card;
}

// Create server
const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/functions') {
        try {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(create_demo_html());
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Error: ${error.message}\n${error.stack}`);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`\n🎯 Function Graph Demo Server`);
    console.log(`   Running at: http://localhost:${PORT}`);
    console.log(`\n   Showing:`);
    console.log(`   • Sine wave`);
    console.log(`   • sin, cos, tan comparison`);
    console.log(`   • Wave interference`);
    console.log(`   • Damped oscillation`);
    console.log(`   • Phase shifted waves`);
    console.log(`   • Taylor approximation of sin(x)`);
    console.log(`\n   Press Ctrl+C to stop\n`);
});
