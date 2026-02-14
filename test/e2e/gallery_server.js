/**
 * Control Gallery Server
 *
 * Renders any jsgui3-html control in isolation for E2E testing and visual inspection.
 * Serves a client-side bundle to hydrate controls and enable interactivity.
 *
 * Usage:
 *   node test/e2e/gallery_server.js
 *
 * Environment Variables:
 *   GALLERY_PORT  (default: 4444)
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');
const jsgui = require('../../html-core/html-core');
const all_controls = require('../../controls/controls');
const palettes = require('../../html-core/palettes');

const PORT = parseInt(process.env.GALLERY_PORT || '4444');

function get_mime_type(file_path) {
    const ext = path.extname(file_path).toLowerCase();
    if (ext === '.css') return 'text/css; charset=utf-8';
    if (ext === '.js') return 'application/javascript; charset=utf-8';
    if (ext === '.svg') return 'image/svg+xml';
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    return 'application/octet-stream';
}

// ── Bundle Client Code ────────────────────────────────────

let client_bundle = '';

async function build_client_bundle() {
    const entry_path = path.join(__dirname, 'gallery_client_entry.js');
    const entry_code = `
        const jsgui = require('../../html-core/html-core');
        const all_controls = require('../../controls/controls');

        // Client-side context
        const context = new jsgui.Page_Context();

        // Register all controls
        Object.keys(all_controls).forEach(name => {
            const C = all_controls[name];
            if (C && typeof C === 'function') {
                context.map_Controls[name] = C;
                // Register by _tag_name if available (standard jsgui pattern)
                if (C.prototype && C.prototype._tag_name) {
                    context.map_Controls[C.prototype._tag_name] = C;
                }
                // Also register by class name if different
                if (C.name && C.name !== name) {
                    context.map_Controls[C.name] = C;
                }
                
                // Register lowercase and hyphenated versions to ensure matching with data-jsgui-type
                const lower = name.toLowerCase();
                if (!context.map_Controls[lower]) context.map_Controls[lower] = C;
                
                const hyphenated = lower.replace(/_/g, '-');
                if (!context.map_Controls[hyphenated]) context.map_Controls[hyphenated] = C;
            }
        });

        // Activate
        console.log('Activating Gallery Controls...');
        try {
            jsgui.pre_activate(context);
            jsgui.activate(context);
            console.log('Gallery Active ✅');
        } catch (e) {
            console.error('Activation failed:', e, e.stack || '');
        }

        // Expose for debug
        window.jsgui = jsgui;
        window.controls = all_controls;
        window.context = context;
    `;

    try {
        fs.writeFileSync(entry_path, entry_code);
        const result = await esbuild.build({
            entryPoints: [entry_path],
            bundle: true,
            write: false,
            platform: 'browser',
            target: 'es2020',
            define: { 'process.env.NODE_ENV': '"development"' },
            // Shim node builtins if needed, or exclude them
        });
        client_bundle = result.outputFiles[0].text;
        console.log('Client bundle built successfully (' + client_bundle.length + ' bytes)');
    } catch (e) {
        console.error('Build failed:', e);
        client_bundle = `console.error("Client build failed: ${e.message.replace(/"/g, '\\"')}");`;
    }
}

// ── Collect CSS from control class hierarchy ──────────────

function collect_control_css(ControlClass) {
    const css_parts = new Set();
    let current = ControlClass;
    while (current && current !== Object) {
        if (current.css && typeof current.css === 'string') {
            css_parts.add(current.css);
        }
        current = Object.getPrototypeOf(current);
    }
    return [...css_parts].join('\n');
}

// ── Get all valid control names (sorted) ──────────────────

function get_control_names() {
    return Object.keys(all_controls).filter(k =>
        k !== 'experimental' && k !== 'deprecated' && typeof all_controls[k] === 'function'
    ).sort();
}

function get_default_spec(control_name) {
    if (control_name === 'Grid') {
        return {
            grid_size: [8, 6],
            cell_size: [28, 28],
            column_headers: true,
            row_headers: true
        };
    }

    if (control_name === 'Color_Grid') {
        const palette_entry = palettes.get('crayola');
        return {
            grid_size: [12, 12],
            cell_size: [16, 16],
            palette: palette_entry && Array.isArray(palette_entry.colors)
                ? palette_entry.colors
                : undefined
        };
    }

    if (control_name === 'Color_Picker_Tabbed') {
        return {
            variant: 'full',
            value: '#3b82f6'
        };
    }

    if (control_name === 'Line_Chart') {
        return {
            size: [400, 300],
            range: [[0, 0], [100, 100]],
            x_major_notch_spacing: 25,
            y_major_notch_spacing: 25,
            x_minor_notch_spacing: 5,
            y_minor_notch_spacing: 5
        };
    }

    if (control_name === 'Radio_Button_Group') {
        return {
            items: ['Option A', 'Option B', 'Option C']
        };
    }

    if (control_name === 'Timespan_Selector') {
        return {
            span: [new Date('2024-01-01'), new Date('2024-06-30')]
        };
    }

    if (control_name === 'Menu_Node') {
        return {
            text: 'Menu Item',
            value: ['Sub Item 1', 'Sub Item 2', 'Sub Item 3']
        };
    }

    if (control_name === 'Popup_Menu_Button') {
        return {
            text: 'Actions',
            items: ['Edit', 'Delete', 'Copy']
        };
    }

    if (control_name === 'Accordion') {
        return {
            sections: [
                { id: 'sec1', title: 'Section 1', content: 'Content for section one.' },
                { id: 'sec2', title: 'Section 2', content: 'Content for section two.' },
                { id: 'sec3', title: 'Section 3', content: 'Content for section three.' }
            ],
            open_ids: ['sec1']
        };
    }

    if (control_name === 'Breadcrumbs') {
        return {
            items: [
                { label: 'Home', href: '#' },
                { label: 'Products', href: '#' },
                { label: 'Widget' }
            ]
        };
    }

    if (control_name === 'Data_Table') {
        return {
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' }
            ],
            rows: [
                { name: 'Alice', role: 'Engineer', status: 'Active' },
                { name: 'Bob', role: 'Designer', status: 'Active' },
                { name: 'Carol', role: 'Manager', status: 'Away' }
            ]
        };
    }

    if (control_name === 'Split_Pane') {
        return {
            orientation: 'horizontal',
            size: '200px'
        };
    }

    if (control_name === 'Tabbed_Panel') {
        return {
            tabs: ['Overview', 'Details', 'Settings']
        };
    }

    if (control_name === 'Tree_View' || control_name === 'Tree') {
        return {
            data: [
                { label: 'Documents', children: [
                    { label: 'Report.pdf' },
                    { label: 'Notes.txt' }
                ]},
                { label: 'Images', children: [
                    { label: 'Photo.png' }
                ]},
                { label: 'README.md' }
            ]
        };
    }

    if (control_name === 'Data_Grid') {
        return {
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'age', label: 'Age' },
                { key: 'city', label: 'City' }
            ],
            rows: [
                { name: 'Alice', age: 30, city: 'London' },
                { name: 'Bob', age: 25, city: 'Paris' },
                { name: 'Carol', age: 35, city: 'Berlin' }
            ]
        };
    }

    if (control_name === 'Data_Row') {
        return {
            items: ['Alice', '30', 'London']
        };
    }

    if (control_name === 'File_Tree_Node') {
        return {
            text: 'src',
            expandable: true,
            nodes: [
                { text: 'index.js' },
                { text: 'utils.js' }
            ]
        };
    }

    if (control_name === 'Form_Container') {
        return {
            fields: [
                { name: 'username', label: 'Username', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'bio', label: 'Bio', type: 'textarea' }
            ]
        };
    }

    if (control_name === 'Horizontal_Menu') {
        return {
            value: {
                'File': ['New', 'Open', 'Save'],
                'Edit': ['Undo', 'Redo', 'Cut'],
                'View': ['Zoom In', 'Zoom Out']
            }
        };
    }

    if (control_name === 'Item') {
        return {
            item: 'Sample Item'
        };
    }

    if (control_name === 'Item_Selector') {
        return {
            items: ['Option A', 'Option B', 'Option C'],
            item_index: 0
        };
    }

    if (control_name === 'List') {
        return {
            items: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
        };
    }

    if (control_name === 'Property_Viewer') {
        return {
            data: {
                name: 'Widget',
                version: '2.1.0',
                enabled: true,
                count: 42
            }
        };
    }

    if (control_name === 'Reorderable_List') {
        return {
            items: ['First', 'Second', 'Third', 'Fourth']
        };
    }

    if (control_name === 'Text_Item') {
        return {
            value: 'Sample text item'
        };
    }

    if (control_name === 'Toggle_Button') {
        return {
            states: 'on,off',
            state: 'off'
        };
    }

    if (control_name === 'Tree_Node') {
        return {
            text: 'Root Node',
            expandable: true,
            nodes: [
                { text: 'Child 1' },
                { text: 'Child 2', nodes: [{ text: 'Grandchild' }] }
            ]
        };
    }

    if (control_name === 'Markdown_Viewer') {
        return {
            markdown: '# Hello World\n\nThis is a **Markdown** viewer.\n\n- Item 1\n- Item 2\n- Item 3\n\n```js\nconsole.log("hello");\n```'
        };
    }

    if (control_name === 'Pie_Chart') {
        return {
            data: [
                { label: 'Desktop', value: 60 },
                { label: 'Mobile', value: 30 },
                { label: 'Tablet', value: 10 }
            ],
            width: 300,
            height: 300
        };
    }

    if (control_name === 'Sparkline') {
        return {
            data: [10, 25, 15, 30, 20, 35, 28, 40, 32, 45],
            width: 150,
            height: 40
        };
    }

    if (control_name === 'Area_Chart') {
        return {
            data: [
                { label: 'Jan', value: 100 },
                { label: 'Feb', value: 150 },
                { label: 'Mar', value: 120 },
                { label: 'Apr', value: 180 },
                { label: 'May', value: 200 }
            ],
            width: 400,
            height: 250
        };
    }

    if (control_name === 'Bar_Chart') {
        return {
            data: [
                { label: 'Q1', value: 120 },
                { label: 'Q2', value: 180 },
                { label: 'Q3', value: 150 },
                { label: 'Q4', value: 210 }
            ],
            width: 400,
            height: 250
        };
    }

    if (control_name === 'Gauge') {
        return {
            value: 72,
            min: 0,
            max: 100,
            label: 'CPU',
            unit: '%',
            size: 160
        };
    }

    if (control_name === 'Radio_Button') {
        return {
            text: 'Option A',
            group_name: 'demo_group'
        };
    }

    if (control_name === 'Radio_Button_Tab') {
        return {
            text: 'Tab Label',
            group_name: 'tab_group'
        };
    }

    if (control_name === 'Indicator') {
        return {
            status: 'success',
            label: 'Online'
        };
    }

    if (control_name === 'String_Span') {
        return {
            value: 'Editable text'
        };
    }

    if (control_name === 'Calendar') {
        return {};
    }

    return {};
}

// Controls that cannot be rendered in gallery isolation
const GALLERY_SKIP_LIST = new Set([
    'Admin_Theme',           // Static utility class, not a renderable control
    'Window_Manager',        // Requires full page context, not isolatable
    'Active_HTML_Document',  // Full page wrapper, not a gallery control
    'Standard_Web_Page',     // Full page wrapper, not a gallery control
    'Message_Web_Page',      // Full page wrapper, not a gallery control
]);

// ── Render a single control to a complete HTML page ───────

function render_control_page(control_name, spec, theme, show_grid) {
    const ControlClass = all_controls[control_name];
    if (!ControlClass) return null;

    let context;
    try {
        context = new jsgui.Page_Context();
    } catch (e) {
        try {
            context = jsgui.create_context ? jsgui.create_context() : {};
        } catch (e2) {
            context = {};
        }
    }

    let ctrl_html = '';
    let error_msg = '';

    if (GALLERY_SKIP_LIST.has(control_name)) {
        error_msg = `<div style="color:#6b7280;padding:12px;border:2px solid #d1d5db;border-radius:8px;">
            <strong>${control_name}</strong> is a utility class, not a renderable control.
        </div>`;
    } else {
        try {
            // Provide mock context.req for controls that need server request context
            if (control_name === 'Login' || control_name === 'File_Upload') {
                context.req = {
                    headers: { host: 'localhost:' + PORT },
                    url: '/',
                    method: 'GET'
                };
            }
            const ctrl = new ControlClass({ ...spec, context });
            // Ensure ID is set for hydration if not already
            if (!ctrl.dom.attributes.id) {
                ctrl.dom.attributes.id = 'target_ctrl';
            }
            ctrl_html = ctrl.html || '';
        } catch (e) {
            error_msg = `<div style="color:red;padding:12px;border:2px solid red;border-radius:8px;">
                <strong>Instantiation Error:</strong> ${e.message}
            </div>`;
        }
    }

    const control_css = collect_control_css(ControlClass);

    const admin_theme = theme === 'dark' ? 'vs-dark' : 'vs-default';

    return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}" data-admin-theme="${admin_theme}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${control_name} – Gallery</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/jsgui.css">
    <style>
        @layer jsgui-legacy {
            ${control_css}
        }

        *, *::before, *::after { box-sizing: border-box; }

        :root {
            --j-bg: #ffffff;
            --j-fg: #111827;
            --j-border: #d1d5db;
            --j-primary: #4f46e5;
            --j-primary-hover: #4338ca;
            --j-muted: #6b7280;
            --j-surface: #f9fafb;
            --j-tooltip-bg: #1f2937;
            --j-tooltip-fg: #f9fafb;
            --j-focus-ring: rgba(79, 70, 229, 0.4);
            --j-radius: 6px;
            --j-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
            --j-shadow-md: 0 4px 6px rgba(0,0,0,0.07);
        }

        [data-theme="dark"] {
            --j-bg: #111827;
            --j-fg: #f9fafb;
            --j-border: #374151;
            --j-primary: #818cf8;
            --j-primary-hover: #a5b4fc;
            --j-muted: #9ca3af;
            --j-surface: #1f2937;
            --j-tooltip-bg: #111827;
            --j-tooltip-fg: #f9fafb;
            --j-focus-ring: rgba(129, 140, 248, 0.4);
        }

        body {
            margin: 0;
            padding: 32px;
            font-family: Inter, system-ui, -apple-system, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            background: var(--j-bg);
            color: var(--j-fg);
            min-height: 100vh;
        }

        body.show-grid {
            background-image: linear-gradient(rgba(0,0,0,.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,.04) 1px, transparent 1px);
            background-size: 8px 8px;
        }

        #gallery-header {
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--j-border);
        }
        #gallery-header h2 {
            margin: 0 0 4px;
            font-size: 18px;
            font-weight: 600;
        }
        #gallery-header .meta {
            font-size: 12px;
            color: var(--j-muted);
        }

        #control-mount {
            position: relative;
            display: inline-block;
            min-width: 100px;
            min-height: 40px;
        }
    </style>
</head>
<body class="${show_grid ? 'show-grid' : ''} ${theme === 'dark' ? 'jsgui-dark-mode' : ''}">
    <div id="gallery-header">
        <h2>${control_name}</h2>
        <div class="meta">Theme: ${theme} | Spec: ${JSON.stringify(spec)}</div>
    </div>
    <div id="control-mount" data-testid="mount">
        ${error_msg || ctrl_html}
    </div>
    <script src="/client.js"></script>
</body>
</html>`;
}

// ── Render the index page ─────────────────────────────────

function render_index() {
    const names = get_control_names();

    const rows = names.map(n => {
        const C = all_controls[n];
        const has_css = C.css ? '✅' : '—';
        const is_skipped = GALLERY_SKIP_LIST.has(n);
        const name_cell = is_skipped
            ? `<span style="color:#9ca3af" title="Utility class, not renderable">${n} ⚙️</span>`
            : `<a href="/?control=${n}">${n}</a>`;
        return `<tr${is_skipped ? ' style="opacity:0.6"' : ''}>
            <td>${name_cell}</td>
            <td style="text-align:center">${has_css}</td>
            <td>
                <a href="/?control=${n}&theme=light" style="margin-right:8px">light</a>
                <a href="/?control=${n}&theme=dark">dark</a>
            </td>
        </tr>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>jsgui3-html Control Gallery</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/jsgui.css">
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            margin: 0; padding: 40px;
            font-family: Inter, system-ui, sans-serif;
            font-size: 14px;
            background: #f8fafc;
            color: #1e293b;
        }
        h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; }
        .subtitle { color: #64748b; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        th, td { padding: 8px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
        a { color: #4f46e5; text-decoration: none; }
        a:hover { text-decoration: underline; }
        tr:hover { background: #f8fafc; }
    </style>
</head>
<body>
    <h1>Control Gallery</h1>
    <div class="subtitle">${names.length} controls available</div>
    <table>
        <thead>
            <tr>
                <th>Control</th>
                <th style="text-align:center">Has CSS</th>
                <th>Theme Links</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
    <script src="/client.js"></script>
</body>
</html>`;
}

// ── HTTP Server ───────────────────────────────────────────

const server = http.createServer((req, res) => {
    try {
        const url = new URL(req.url, `http://localhost:${PORT}`);

        if (url.pathname.startsWith('/css/')) {
            const relative_path = url.pathname.replace(/^\//, '');
            const absolute_path = path.join(__dirname, '..', '..', relative_path);
            const css_root = path.join(__dirname, '..', '..', 'css');

            if (!absolute_path.startsWith(css_root) || !fs.existsSync(absolute_path)) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Not found');
                return;
            }

            const mime_type = get_mime_type(absolute_path);
            res.writeHead(200, { 'Content-Type': mime_type });
            res.end(fs.readFileSync(absolute_path));
            return;
        }

        // Serve client bundle
        if (url.pathname === '/client.js') {
            res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
            res.end(client_bundle);
            return;
        }

        const control_name = url.searchParams.get('control');
        const theme = url.searchParams.get('theme') || 'light';
        const show_grid = url.searchParams.get('grid') === '1';

        // Index page
        if (!control_name) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(render_index());
            return;
        }

        // Check control exists
        if (!all_controls[control_name] || typeof all_controls[control_name] !== 'function') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`Unknown control: ${control_name}\n\nAvailable: ${get_control_names().join(', ')}`);
            return;
        }

        // Parse spec
        let spec = get_default_spec(control_name);
        const spec_param = url.searchParams.get('spec');
        if (spec_param) {
            try {
                spec = { ...spec, ...JSON.parse(spec_param) };
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end(`Invalid spec JSON: ${e.message}`);
                return;
            }
        }

        const html = render_control_page(control_name, spec, theme, show_grid);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);

    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.message}\n${err.stack}`);
    }
});

// ── Start ─────────────────────────────────────────────────

if (require.main === module) {
    (async () => {
        console.log('Building client bundle...');
        await build_client_bundle();
        server.listen(PORT, () => {
            console.log(`Gallery server running at http://localhost:${PORT}`);
            console.log(`Example: http://localhost:${PORT}/?control=Color_Picker`);
        });
    })();
}

module.exports = {
    start: async (port) => {
        await build_client_bundle();
        return new Promise(resolve => {
            server.listen(port || PORT, () => resolve(server));
        });
    },
    stop: () => new Promise(resolve => server.close(resolve)),
    render_control_page,
    render_index,
    PORT
};
