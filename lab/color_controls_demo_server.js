
/**
 * Color Controls Demo Server
 * 
 * Server to view Color_Grid and Color_Palette in browser.
 * Used for visual verification of existing color picker controls.
 * Run with: node lab/color_controls_demo_server.js
 */

const http = require('http');
const jsgui = require('../html-core/html-core');
const Color_Grid = require('../controls/organised/0-core/0-basic/1-compositional/color-grid');
const Color_Palette = require('../controls/organised/0-core/0-basic/1-compositional/color-palette');
const pal_crayola = require('../html-core/arr_colors');
const pal_crayola_sorted = require('../html-core/pal_crayola_sorted');
const pal_pastels = require('../html-core/pal_pastels');
const pal_crayola_extended = require('../html-core/pal_crayola_extended');

const PORT = 3600;

const create_demo_html = () => {
    const context = new jsgui.Page_Context();

    // Create page wrapper
    const page = new jsgui.Control({ context });
    page.dom.tagName = 'div';
    page.add_class('color-demo');

    // Title
    const title = new jsgui.Control({ context, tag_name: 'h1' });
    title.add('jsgui3 Color Controls — Visual Verification');
    page.add(title);

    // ============================================
    // Section 1: Color_Grid with Crayola palette
    // ============================================
    const grid_section = new jsgui.Control({ context, tag_name: 'section' });
    grid_section.add_class('demo-section');
    const h2_grid = new jsgui.Control({ context, tag_name: 'h2' });
    h2_grid.add('Section 1: Color_Grid (Crayola Palette, 12×12)');
    grid_section.add(h2_grid);

    const desc1 = new jsgui.Control({ context, tag_name: 'p' });
    desc1.add_class('desc');
    desc1.add('The existing Color_Grid control with the built-in 133-color Crayola palette arranged in a 12×12 grid.');
    grid_section.add(desc1);

    try {
        const color_grid = new Color_Grid({
            context,
            grid_size: [12, 12],
            palette: pal_crayola,
            size: [360, 360]
        });
        grid_section.add(color_grid);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add_class('error');
        err.add('Error creating Color_Grid: ' + e.message);
        grid_section.add(err);
    }
    page.add(grid_section);

    // ============================================
    // Section 2: Color_Grid with small custom palette
    // ============================================
    const grid2_section = new jsgui.Control({ context, tag_name: 'section' });
    grid2_section.add_class('demo-section');
    const h2_grid2 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_grid2.add('Section 2: Color_Grid (Custom 4×2 Palette)');
    grid2_section.add(h2_grid2);

    const desc2 = new jsgui.Control({ context, tag_name: 'p' });
    desc2.add_class('desc');
    desc2.add('A small Color_Grid with 8 hand-picked colors to verify cell rendering at larger cell sizes.');
    grid2_section.add(desc2);

    try {
        const small_palette = [
            '#FF0000', '#FF8800', '#FFFF00', '#00FF00',
            '#00FFFF', '#0000FF', '#8800FF', '#FF00FF'
        ];
        const color_grid_small = new Color_Grid({
            context,
            grid_size: [4, 2],
            palette: small_palette,
            size: [320, 160]
        });
        grid2_section.add(color_grid_small);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add_class('error');
        err.add('Error creating small Color_Grid: ' + e.message);
        grid2_section.add(err);
    }
    page.add(grid2_section);

    // ============================================
    // Section 3: Color_Palette (full composite)
    // ============================================
    const palette_section = new jsgui.Control({ context, tag_name: 'section' });
    palette_section.add_class('demo-section');
    const h2_palette = new jsgui.Control({ context, tag_name: 'h2' });
    h2_palette.add('Section 3: Color_Palette (Full Composite with FG/BG selector)');
    palette_section.add(h2_palette);

    const desc3 = new jsgui.Control({ context, tag_name: 'p' });
    desc3.add_class('desc');
    desc3.add('The Color_Palette control wraps Color_Grid and adds a foreground/background color selector (2×1 grid at top). Uses the default Crayola palette.');
    palette_section.add(desc3);

    try {
        const color_palette = new Color_Palette({
            context,
            grid_size: [12, 12],
            size: [360, 406]
        });
        palette_section.add(color_palette);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add_class('error');
        err.add('Error creating Color_Palette: ' + e.message);
        palette_section.add(err);
    }
    page.add(palette_section);

    // ============================================
    // Section 4: Multiple Color_Grids side by side (palette comparison)
    // ============================================
    const compare_section = new jsgui.Control({ context, tag_name: 'section' });
    compare_section.add_class('demo-section');
    const h2_compare = new jsgui.Control({ context, tag_name: 'h2' });
    h2_compare.add('Section 4: Palette Comparison — Subsets');
    compare_section.add(h2_compare);

    const desc4 = new jsgui.Control({ context, tag_name: 'p' });
    desc4.add_class('desc');
    desc4.add('Three small Color_Grids showing warm, cool, and neutral subsets of the Crayola palette to verify color accuracy.');
    compare_section.add(desc4);

    const row = new jsgui.Control({ context });
    row.add_class('grid-row');

    // Warm colors (reds, oranges, yellows)
    const warm_colors = pal_crayola.filter(c => {
        const hex = (c.hex || c).replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return r > 150 && b < 150;
    }).slice(0, 16);

    // Cool colors (blues, greens, purples)
    const cool_colors = pal_crayola.filter(c => {
        const hex = (c.hex || c).replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return b > 120 && r < 150;
    }).slice(0, 16);

    // Neutral colors (grays, browns)
    const neutral_colors = pal_crayola.filter(c => {
        const hex = (c.hex || c).replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return (max - min) < 60;
    }).slice(0, 16);

    const labels = ['Warm Colors', 'Cool Colors', 'Neutral Colors'];
    const palettes = [warm_colors, cool_colors, neutral_colors];

    palettes.forEach((pal, i) => {
        const col = new jsgui.Control({ context });
        col.add_class('grid-col');
        const label = new jsgui.Control({ context, tag_name: 'h3' });
        label.add(labels[i] + ` (${pal.length})`);
        col.add(label);

        try {
            const grid = new Color_Grid({
                context,
                grid_size: [4, 4],
                palette: pal,
                size: [160, 160]
            });
            col.add(grid);
        } catch (e) {
            const err = new jsgui.Control({ context, tag_name: 'pre' });
            err.add_class('error');
            err.add(e.message);
            col.add(err);
        }
        row.add(col);
    });

    compare_section.add(row);
    page.add(compare_section);

    // ============================================
    // Section 5: Raw Color Swatches (pure HTML for comparison)
    // ============================================
    const raw_section = new jsgui.Control({ context, tag_name: 'section' });
    raw_section.add_class('demo-section');
    const h2_raw = new jsgui.Control({ context, tag_name: 'h2' });
    h2_raw.add('Section 5: Raw HTML Swatches (Baseline Comparison)');
    raw_section.add(h2_raw);

    const desc5 = new jsgui.Control({ context, tag_name: 'p' });
    desc5.add_class('desc');
    desc5.add('Plain HTML divs with background-color — this is the quality standard. Compare these to the Color_Grid rendering above.');
    raw_section.add(desc5);

    const swatch_container = new jsgui.Control({ context });
    swatch_container.add_class('raw-swatches');

    const sample_colors = [
        { hex: '#ED0A3F', name: 'Red' },
        { hex: '#FF8833', name: 'Orange' },
        { hex: '#FBE870', name: 'Yellow' },
        { hex: '#01A368', name: 'Green' },
        { hex: '#0066FF', name: 'Blue' },
        { hex: '#6B3FA0', name: 'Violet' },
        { hex: '#AF593E', name: 'Brown' },
        { hex: '#000000', name: 'Black' },
        { hex: '#FFFFFF', name: 'White' },
        { hex: '#C0C0C0', name: 'Silver' },
        { hex: '#FFD700', name: 'Gold' },
        { hex: '#FC80A5', name: 'Pink' }
    ];

    sample_colors.forEach(c => {
        const swatch = new jsgui.Control({ context });
        swatch.add_class('raw-swatch');
        swatch.dom.attributes = swatch.dom.attributes || {};
        swatch.dom.attributes.style = swatch.dom.attributes.style || {};
        swatch.dom.attributes.style['background-color'] = c.hex;
        swatch.dom.attributes.style['width'] = '60px';
        swatch.dom.attributes.style['height'] = '60px';
        swatch.dom.attributes.style['display'] = 'inline-block';
        swatch.dom.attributes.style['margin'] = '4px';
        swatch.dom.attributes.style['border-radius'] = '6px';
        swatch.dom.attributes.style['border'] = '1px solid #ccc';
        swatch.dom.attributes.title = c.name + ' ' + c.hex;
        swatch_container.add(swatch);
    });

    raw_section.add(swatch_container);

    // Also add labeled swatches below for name verification
    const labeled_container = new jsgui.Control({ context });
    labeled_container.add_class('labeled-swatches');

    sample_colors.forEach(c => {
        const item = new jsgui.Control({ context });
        item.add_class('labeled-swatch');

        const swatch = new jsgui.Control({ context });
        swatch.dom.attributes = swatch.dom.attributes || {};
        swatch.dom.attributes.style = swatch.dom.attributes.style || {};
        swatch.dom.attributes.style['background-color'] = c.hex;
        swatch.dom.attributes.style['width'] = '40px';
        swatch.dom.attributes.style['height'] = '40px';
        swatch.dom.attributes.style['border-radius'] = '4px';
        swatch.dom.attributes.style['border'] = '1px solid #ddd';
        item.add(swatch);

        const label = new jsgui.Control({ context, tag_name: 'span' });
        label.add_class('swatch-label');
        label.add(c.name);
        item.add(label);

        const hex_label = new jsgui.Control({ context, tag_name: 'code' });
        hex_label.add(c.hex);
        item.add(hex_label);

        labeled_container.add(item);
    });

    raw_section.add(labeled_container);
    page.add(raw_section);

    // ============================================
    // Section 6: Optimized Crayola Palette (GA-sorted)
    // ============================================
    const sorted_section = new jsgui.Control({ context, tag_name: 'section' });
    sorted_section.add_class('demo-section');
    const h2_sorted = new jsgui.Control({ context, tag_name: 'h2' });
    h2_sorted.add('Section 6: Optimized Crayola Palette (GA-sorted)');
    sorted_section.add(h2_sorted);

    const desc6 = new jsgui.Control({ context, tag_name: 'p' });
    desc6.add_class('desc');
    desc6.add('The same 133 Crayola colors rearranged by a Genetic Algorithm to minimize perceptual difference between neighboring cells. Compare to Section 1 above.');
    sorted_section.add(desc6);

    try {
        const sorted_grid = new Color_Grid({
            context,
            grid_size: [12, 12],
            palette: pal_crayola_sorted,
            size: [360, 360]
        });
        sorted_section.add(sorted_grid);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add_class('error');
        err.add('Error creating optimized Color_Grid: ' + e.message);
        sorted_section.add(err);
    }
    page.add(sorted_section);

    // ============================================
    // Section 7: Pastel Palette (GA-sorted)
    // ============================================
    const pastel_section = new jsgui.Control({ context, tag_name: 'section' });
    pastel_section.add_class('demo-section');
    const h2_pastel = new jsgui.Control({ context, tag_name: 'h2' });
    h2_pastel.add('Section 7: Pastel Palette (GA-sorted)');
    pastel_section.add(h2_pastel);

    const desc7 = new jsgui.Control({ context, tag_name: 'p' });
    desc7.add_class('desc');
    const pastel_cols = 12;
    const pastel_rows_count = Math.ceil(pal_pastels.length / 12);
    desc7.add(`${pal_pastels.length} pastel colors (high lightness, low chroma) arranged in a ${pastel_cols}×${pastel_rows_count} grid by a GA for smooth transitions.`);
    pastel_section.add(desc7);

    try {
        const pastel_grid = new Color_Grid({
            context,
            grid_size: [12, pastel_rows_count],
            palette: pal_pastels,
            size: [360, 360]
        });
        pastel_section.add(pastel_grid);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add_class('error');
        err.add('Error creating pastel Color_Grid: ' + e.message);
        pastel_section.add(err);
    }
    page.add(pastel_section);

    // ============================================
    // Section 8: Extended Crayola (144 = 12×12, no gaps)
    // ============================================
    const ext_section = new jsgui.Control({ context, tag_name: 'section' });
    ext_section.add_class('demo-section');
    const h2_ext = new jsgui.Control({ context, tag_name: 'h2' });
    h2_ext.add('Section 8: Extended Crayola (144 colors, full 12×12)');
    ext_section.add(h2_ext);

    const desc8 = new jsgui.Control({ context, tag_name: 'p' });
    desc8.add_class('desc');
    desc8.add('133 Crayola colors + 11 algorithmically chosen gap-filling colors = 144 (a perfect 12×12 grid with no empty cells). GA-sorted for smooth transitions.');
    ext_section.add(desc8);

    try {
        const ext_grid = new Color_Grid({
            context,
            grid_size: [12, 12],
            palette: pal_crayola_extended,
            size: [360, 360]
        });
        ext_section.add(ext_grid);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add_class('error');
        err.add('Error creating extended Color_Grid: ' + e.message);
        ext_section.add(err);
    }
    page.add(ext_section);

    const content_html = page.all_html_render();

    const css = `
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f0f2f5;
            color: #333;
            margin: 0;
            padding: 30px;
        }
        .color-demo {
            max-width: 900px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
            font-size: 24px;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-top: 0;
            font-size: 18px;
        }
        h3 {
            color: #555;
            font-size: 14px;
            margin: 0 0 8px 0;
        }
        .desc {
            color: #666;
            font-size: 14px;
            margin: 0 0 16px 0;
            line-height: 1.5;
        }
        .demo-section {
            background: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 24px;
        }
        .error {
            background: #fff0f0;
            color: #cc0000;
            padding: 12px;
            border-radius: 4px;
            border: 1px solid #ffcccc;
            font-size: 13px;
            white-space: pre-wrap;
        }
        .grid-row {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
        }
        .grid-col {
            flex: 1;
            min-width: 160px;
        }
        .raw-swatches {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 16px;
        }
        .labeled-swatches {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        .labeled-swatch {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            background: #f8f9fa;
            border-radius: 6px;
            font-size: 13px;
        }
        .labeled-swatch code {
            color: #888;
            font-size: 11px;
        }
        .swatch-label {
            font-weight: 500;
        }

        /* Grid control styles - ensure cells show their colors */
        .grid { position: relative; }
        .grid .row { display: flex; }
        .grid .cell {
            border: 1px solid rgba(0,0,0,0.1);
            cursor: pointer;
            transition: transform 0.1s;
        }
        .grid .cell:hover {
            transform: scale(1.15);
            z-index: 1;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>jsgui3 Color Controls — Visual Verification</title>
    <style>
        ${css}
    </style>
</head>
<body>
    ${content_html}
</body>
</html>`;
};

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        try {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(create_demo_html());
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error: ' + e.message + '\n' + e.stack);
        }
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Color Controls demo server running at http://localhost:${PORT}`);
});
