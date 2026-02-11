
/**
 * Date Controls Demo Server
 * 
 * Server to view Month_View range selection modes in browser.
 * Run with: node lab/date_controls_demo_server.js
 */

const http = require('http');
const jsgui = require('../html-core/html-core');
const Grid = require('../controls/organised/0-core/0-basic/1-compositional/grid');
const Month_View = require('../controls/organised/0-core/0-basic/1-compositional/month-view');
const Date_Picker = require('../controls/organised/0-core/0-basic/_complex_date-picker');

const PORT = 3601;

const create_demo_html = () => {
    const context = new jsgui.Page_Context();

    const page = new jsgui.Control({ context });
    page.dom.tagName = 'div';
    page.add_class('date-demo');

    const title = new jsgui.Control({ context, tag_name: 'h1' });
    title.add('jsgui3 Date Controls — Range Selection Demo');
    page.add(title);

    // ============================================
    // Section 1: Month_View — single mode (default)
    // ============================================
    const s1 = new jsgui.Control({ context, tag_name: 'section' });
    s1.add_class('demo-section');
    const h2_1 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_1.add('Section 1: Month_View — Single Select (default)');
    s1.add(h2_1);
    const d1 = new jsgui.Control({ context, tag_name: 'p' });
    d1.add('Standard single day selection. Click any day to select it.');
    s1.add(d1);
    try {
        const mv1 = new Month_View({ context, size: [360, 220] });
        s1.add(mv1);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message);
        s1.add(err);
    }
    page.add(s1);

    // ============================================
    // Section 2: Month_View — range mode
    // ============================================
    const s2 = new jsgui.Control({ context, tag_name: 'section' });
    s2.add_class('demo-section');
    const h2_2 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_2.add('Section 2: Month_View — Range Select');
    s2.add(h2_2);
    const d2 = new jsgui.Control({ context, tag_name: 'p' });
    d2.add('Click once for range start, click again for range end. Auto-swaps if end < start. Drag also works. Hold Shift+click to extend from anchor.');
    s2.add(d2);
    const range_status = new jsgui.Control({ context, tag_name: 'div' });
    range_status.dom.attrs['id'] = 'range-status';
    range_status.add_class('status-bar');
    range_status.add('Selected range: (none)');
    s2.add(range_status);
    try {
        const mv2 = new Month_View({ context, size: [360, 220], selection_mode: 'range' });
        s2.add(mv2);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message);
        s2.add(err);
    }
    page.add(s2);

    // ============================================
    // Section 3: Month_View — multi mode
    // ============================================
    const s3 = new jsgui.Control({ context, tag_name: 'section' });
    s3.add_class('demo-section');
    const h2_3 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_3.add('Section 3: Month_View — Multi Select');
    s3.add(h2_3);
    const d3 = new jsgui.Control({ context, tag_name: 'p' });
    d3.add('Ctrl+click to toggle individual dates. Shift+click to select a contiguous range. Plain click to select only one date.');
    s3.add(d3);
    const multi_status = new jsgui.Control({ context, tag_name: 'div' });
    multi_status.dom.attrs['id'] = 'multi-status';
    multi_status.add_class('status-bar');
    multi_status.add('Selected dates: (none)');
    s3.add(multi_status);
    try {
        const mv3 = new Month_View({ context, size: [360, 220], selection_mode: 'multi' });
        s3.add(mv3);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message);
        s3.add(err);
    }
    page.add(s3);

    // ============================================
    // Section 4: Complex Date Picker (fixed year range)
    // ============================================
    const s4 = new jsgui.Control({ context, tag_name: 'section' });
    s4.add_class('demo-section');
    const h2_4 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_4.add('Section 4: Complex Date Picker (Year/Month navigation)');
    s4.add(h2_4);
    const d4 = new jsgui.Control({ context, tag_name: 'p' });
    d4.add('Year and month navigation with arrows. Year range is now dynamic (current year ±10).');
    s4.add(d4);
    try {
        const dp = new Date_Picker({ context, size: [360, 280] });
        s4.add(dp);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message);
        s4.add(err);
    }
    page.add(s4);

    // ============================================
    // Section 5: Month_View — with week numbers
    // ============================================
    const s5 = new jsgui.Control({ context, tag_name: 'section' });
    s5.add_class('demo-section');
    const h2_5 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_5.add('Section 5: Month_View — Week Numbers');
    s5.add(h2_5);
    const d5 = new jsgui.Control({ context, tag_name: 'p' });
    d5.add('ISO week numbers displayed in a left gutter column. show_week_numbers: true.');
    s5.add(d5);
    try {
        const mv5 = new Month_View({ context, size: [400, 220], show_week_numbers: true });
        s5.add(mv5);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message);
        s5.add(err);
    }
    page.add(s5);

    // ============================================
    // Section 6: Month_View — Sunday-first
    // ============================================
    const s6 = new jsgui.Control({ context, tag_name: 'section' });
    s6.add_class('demo-section');
    const h2_6 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_6.add('Section 6: Month_View — Sunday First (US style)');
    s6.add(h2_6);
    const d6 = new jsgui.Control({ context, tag_name: 'p' });
    d6.add('first_day_of_week: 6 makes Sunday the first column. Weekend columns adjust automatically.');
    s6.add(d6);
    try {
        const mv6 = new Month_View({ context, size: [360, 220], first_day_of_week: 6 });
        s6.add(mv6);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message);
        s6.add(err);
    }
    page.add(s6);

    // ============================================
    // Section 7: Month_View — min/max date bounds
    // ============================================
    const s7 = new jsgui.Control({ context, tag_name: 'section' });
    s7.add_class('demo-section');
    const h2_7 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_7.add('Section 7: Month_View — Min/Max Date Bounds');
    s7.add(h2_7);
    const d7 = new jsgui.Control({ context, tag_name: 'p' });
    const now = new Date();
    const y = now.getFullYear(), mo = now.getMonth();
    const min_d = `${y}-${String(mo + 1).padStart(2, '0')}-05`;
    const max_d = `${y}-${String(mo + 1).padStart(2, '0')}-25`;
    d7.add(`Only dates between ${min_d} and ${max_d} are selectable. Others are greyed out with strikethrough.`);
    s7.add(d7);
    try {
        const mv7 = new Month_View({ context, size: [360, 220], selection_mode: 'range', min_date: min_d, max_date: max_d });
        s7.add(mv7);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message);
        s7.add(err);
    }
    page.add(s7);

    // Get component CSS
    let component_css = '';
    if (Grid.css) component_css += Grid.css;
    if (Month_View.css) component_css += Month_View.css;
    if (Date_Picker.css) component_css += Date_Picker.css;

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
    <title>jsgui3 Date Controls — Range Selection Demo</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 24px;
            background: #f8fafc;
            color: #1e293b;
        }
        h1 {
            color: #0f172a;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 8px;
        }
        h2 {
            color: #334155;
            margin-top: 32px;
        }
        .demo-section {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .desc, p {
            color: #64748b;
            font-size: 14px;
            line-height: 1.5;
        }
        .status-bar {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 8px 12px;
            margin: 8px 0 12px;
            font-size: 13px;
            font-family: monospace;
            color: #475569;
        }
        pre {
            background: #fef2f2;
            color: #dc2626;
            padding: 12px;
            border-radius: 4px;
            white-space: pre-wrap;
        }

        /* --- Left-Right Arrows Selector (year/month pickers) --- */
        .left-right.arrows-selector {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 4px 0;
        }
        .left-right.arrows-selector .item-selector {
            flex: 1;
            text-align: center;
            font-size: 15px;
            font-weight: 600;
            color: #1e293b;
            position: relative;
        }
        .left-right.arrows-selector .item-selector .item {
            cursor: pointer;
            padding: 2px 8px;
        }
        .left-right.arrows-selector .item-selector .list.hidden {
            display: none;
        }

        /* --- Arrow buttons --- */
        .button.arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            cursor: pointer;
            padding: 2px;
            min-width: 32px;
            min-height: 32px;
        }
        .button.arrow:hover {
            background: #e2e8f0;
        }
        .button.arrow svg {
            width: 16px;
            height: 16px;
            fill: #334155;
            stroke: #334155;
        }

        /* --- Date Picker container --- */
        .date-picker {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px;
            background: #fff;
        }

        ${component_css}
    </style>
</head>
<body>
    ${html}
    <script>
        // Wire up range-change events client-side
        // (The Month_View activate() method handles this,
        //  but we also want to update the status bar.)
        
        // Find all month-view controls and listen for custom events
        document.querySelectorAll('.month-view').forEach((mv, idx) => {
            // The controls will raise events through the jsgui system on activate
            // For now the status bars show the initial state
        });
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(full_html);
});

server.listen(PORT, () => {
    console.log(`Date Controls demo server running at http://localhost:${PORT}`);
});
