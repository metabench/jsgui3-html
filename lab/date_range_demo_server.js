
/**
 * Date Range Picker Demo Server
 * 
 * Verifies:
 * 1. Single View Mode
 * 2. Dual View Mode
 * 3. Time Selection
 * 
 * Run with: node lab/date_range_demo_server.js
 */

const http = require('http');
const jsgui = require('../html-core/html-core');
const Date_Range_Picker = require('../controls/organised/0-core/0-basic/_complex_date-range-picker');
const Month_View = require('../controls/organised/0-core/0-basic/1-compositional/Month_View');
const Grid = require('../controls/organised/0-core/0-basic/1-compositional/Grid');

const PORT = 3602;

const create_demo_html = () => {
    const context = new jsgui.Page_Context();

    const page = new jsgui.Control({ context });
    page.dom.tagName = 'div';
    page.add_class('date-demo');

    const title = new jsgui.Control({ context, tag_name: 'h1' });
    title.add('jsgui3 Date Range Picker Demo');
    page.add(title);

    // ============================================
    // Section 1: Single View Mode
    // ============================================
    const s1 = new jsgui.Control({ context, tag_name: 'section' });
    s1.add_class('demo-section');
    s1.add(new jsgui.Control({ context, tag_name: 'h2' }).add('1. Single View Mode'));
    s1.add(new jsgui.Control({ context, tag_name: 'p' }).add('Standard date range picker with a single calendar dropdown.'));

    try {
        const drp1 = new Date_Range_Picker({
            context,
            mode: 'single',
            start: '2026-02-10',
            end: '2026-02-14'
        });
        s1.add(drp1);
    } catch (e) {
        s1.add(new jsgui.Control({ context, tag_name: 'pre' }).add(e.message));
    }
    page.add(s1);

    // ============================================
    // Section 2: Dual View Mode
    // ============================================
    const s2 = new jsgui.Control({ context, tag_name: 'section' });
    s2.add_class('demo-section');
    s2.add(new jsgui.Control({ context, tag_name: 'h2' }).add('2. Dual View Mode'));
    s2.add(new jsgui.Control({ context, tag_name: 'p' }).add('Side-by-side calendars. Left handles start, Right handles end. Selection syncs across both.'));

    try {
        const drp2 = new Date_Range_Picker({
            context,
            mode: 'dual',
            start: '2026-03-01',
            end: '2026-03-10'
        });
        s2.add(drp2);
    } catch (e) {
        s2.add(new jsgui.Control({ context, tag_name: 'pre' }).add(e.message));
    }
    page.add(s2);

    // ============================================
    // Section 3: Time Selection
    // ============================================
    const s3 = new jsgui.Control({ context, tag_name: 'section' });
    s3.add_class('demo-section');
    s3.add(new jsgui.Control({ context, tag_name: 'h2' }).add('3. With Time Selection'));
    s3.add(new jsgui.Control({ context, tag_name: 'p' }).add('Adds time inputs next to the date fields.'));

    try {
        const drp3 = new Date_Range_Picker({
            context,
            mode: 'dual',
            use_time: true,
            start: '2026-04-01',
            end: '2026-04-05',
            start_time: '09:00',
            end_time: '17:00'
        });
        s3.add(drp3);
    } catch (e) {
        s3.add(new jsgui.Control({ context, tag_name: 'pre' }).add(e.message));
    }
    page.add(s3);


    // Get component CSS
    let component_css = '';
    if (Grid.css) component_css += Grid.css;
    if (Month_View.css) component_css += Month_View.css;
    if (Date_Range_Picker.css) component_css += Date_Range_Picker.css;

    const html = page.all_html_render();
    return { html, component_css };
};

const server = http.createServer((req, res) => {
    if (req.url !== '/' && req.url !== '/index.html') {
        res.writeHead(404);
        res.end('Not found');
        return;
    }

    const { html, component_css } = create_demo_html();

    const full_html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>jsgui3 Date Range Picker Demo</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Inter', system-ui, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px;
            background: #f8fafc;
            color: #1e293b;
            min-height: 100vh;
        }
        h1 {
            color: #0f172a;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 40px;
        }
        h2 {
            color: #334155;
            margin-top: 0;
            font-size: 1.25rem;
        }
        .demo-section {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        p {
            color: #64748b;
            margin-bottom: 24px;
        }
        pre {
            background: #fee2e2;
            color: #dc2626;
            padding: 12px;
            border-radius: 6px;
        }

        /* --- Component CSS --- */
        ${component_css}
    </style>
</head>
<body>
    ${html}
    <script>
       // NOTE: this lab server renders static SSR HTML only. There is no client
       // bundle, so control activate() never runs in the browser and the popup
       // is not interactive here. Use a full jsgui3-server app for interactivity.
       console.log('Date Range Picker demo loaded (static SSR, no activation)');
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(full_html);
});

server.listen(PORT, () => {
    console.log(`Date Range Picker demo running at http://localhost:${PORT}`);
});
