/**
 * Property Grid Demo Server
 *
 * Demonstrates all value editor types in a live property grid.
 * Run with: node lab/property_grid_demo_server.js
 */

const http = require('http');
const jsgui = require('../html-core/html-core');
const Property_Grid = require('../controls/organised/1-standard/1-editor/Property_Grid');

const PORT = 3602;

const create_demo_html = () => {
    const context = new jsgui.Page_Context();

    const page = new jsgui.Control({ context });
    page.dom.tagName = 'div';
    page.add_class('pg-demo');

    // Title
    const title = new jsgui.Control({ context, tag_name: 'h1' });
    title.add('jsgui3 Property Grid — Value Editors Demo');
    page.add(title);

    const desc = new jsgui.Control({ context, tag_name: 'p' });
    desc.add_class('demo-desc');
    desc.add('Interactive property grid with text, number, boolean, enum, date, and color editors.');
    page.add(desc);

    // ── Section 1: Basic Property Grid ──
    const s1 = new jsgui.Control({ context, tag_name: 'section' });
    s1.add_class('demo-section');
    const h2_1 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_1.add('Section 1: Basic Property Grid');
    s1.add(h2_1);

    try {
        const grid1 = new Property_Grid({
            context,
            schema: [
                { key: 'name', type: 'text', label: 'Name' },
                { key: 'age', type: 'number', label: 'Age', min: 0, max: 150 },
                { key: 'enabled', type: 'boolean', label: 'Enabled' },
                { key: 'role', type: 'enum', label: 'Role', options: ['admin', 'editor', 'viewer', 'guest'] },
                { key: 'birth_date', type: 'date', label: 'Birth Date' },
                { key: 'color', type: 'color', label: 'Theme Color' }
            ],
            data: {
                name: 'Alice',
                age: 30,
                enabled: true,
                role: 'admin',
                birth_date: '1994-06-15',
                color: '#3b82f6'
            }
        });
        grid1.dom.attributes.id = 'grid1';
        s1.add(grid1);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message + '\n' + e.stack);
        s1.add(err);
    }
    page.add(s1);

    // ── Section 2: Grouped Properties ──
    const s2 = new jsgui.Control({ context, tag_name: 'section' });
    s2.add_class('demo-section');
    const h2_2 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_2.add('Section 2: Grouped Properties');
    s2.add(h2_2);

    try {
        const grid2 = new Property_Grid({
            context,
            schema: [
                {
                    group: 'Identity', fields: [
                        { key: 'first_name', type: 'text', label: 'First Name' },
                        { key: 'last_name', type: 'text', label: 'Last Name' },
                        { key: 'email', type: 'text', label: 'Email' }
                    ]
                },
                {
                    group: 'Appearance', fields: [
                        { key: 'bg_color', type: 'color', label: 'Background' },
                        { key: 'fg_color', type: 'color', label: 'Foreground' },
                        { key: 'opacity', type: 'number', label: 'Opacity', min: 0, max: 1, step: 0.1 }
                    ]
                },
                {
                    group: 'Schedule', fields: [
                        { key: 'start_date', type: 'date', label: 'Start Date' },
                        { key: 'priority', type: 'enum', label: 'Priority', options: ['low', 'medium', 'high', 'critical'] },
                        { key: 'active', type: 'boolean', label: 'Active' }
                    ]
                }
            ],
            data: {
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'jane@example.com',
                bg_color: '#1f2937',
                fg_color: '#f3f4f6',
                opacity: 0.9,
                start_date: '2026-03-01',
                priority: 'high',
                active: true
            }
        });
        grid2.dom.attributes.id = 'grid2';
        s2.add(grid2);
    } catch (e) {
        const err = new jsgui.Control({ context, tag_name: 'pre' });
        err.add('Error: ' + e.message + '\n' + e.stack);
        s2.add(err);
    }
    page.add(s2);

    // ── Section 3: Read-only + Output ──
    const s3 = new jsgui.Control({ context, tag_name: 'section' });
    s3.add_class('demo-section');
    const h2_3 = new jsgui.Control({ context, tag_name: 'h2' });
    h2_3.add('Section 3: Interactive Output');
    s3.add(h2_3);

    const output_desc = new jsgui.Control({ context, tag_name: 'p' });
    output_desc.add('Changes in the first grid are logged below:');
    s3.add(output_desc);

    const output = new jsgui.Control({ context, tag_name: 'pre' });
    output.add_class('demo-output');
    output.dom.attributes.id = 'change-output';
    output.add('(no changes yet)');
    s3.add(output);

    page.add(s3);

    return { page, context };
};

const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
        padding: 24px;
        line-height: 1.5;
    }
    h1 {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #60a5fa, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .demo-desc { color: #94a3b8; margin-bottom: 24px; }
    h2 {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 12px;
        color: #cbd5e1;
    }
    .demo-section {
        margin-bottom: 32px;
        background: #1e293b;
        border-radius: 10px;
        padding: 20px;
        border: 1px solid #334155;
    }

    /* ── Property Grid ── */
    .property-grid {
        display: grid;
        grid-template-columns: minmax(120px, 180px) 1fr;
        border: 1px solid #475569;
        border-radius: 6px;
        overflow: hidden;
        font-size: 13px;
    }
    .pg-group-header {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
    }
    .pg-group-label {
        width: 100%;
        padding: 6px 10px;
        background: #334155;
        color: #93c5fd;
        font-weight: 700;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        border-bottom: 1px solid #475569;
    }
    .pg-row {
        display: contents;
    }
    .pg-row:focus-within .pg-label,
    .pg-row:focus .pg-label {
        background: #2d3f56;
    }
    .pg-row:focus-within .pg-value,
    .pg-row:focus .pg-value {
        background: #1a2a3c;
    }
    .pg-label {
        padding: 5px 10px;
        background: #1e293b;
        border-bottom: 1px solid #334155;
        font-weight: 500;
        color: #94a3b8;
        display: flex;
        align-items: center;
    }
    .pg-value {
        padding: 3px 6px;
        border-bottom: 1px solid #334155;
        display: flex;
        align-items: center;
        background: #0f172a;
        min-height: 30px;
    }

    .pg-row-invalid .pg-value {
        outline: 1px solid #ef4444;
        background: rgba(239,68,68,0.08);
    }
    .pg-row-invalid .pg-label {
        color: #fca5a5;
    }

    /* ── Value Editor Common ── */
    .value-editor {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .ve-text-input, .ve-number-input, .ve-select {
        width: 100%;
        background: #1e293b;
        border: 1px solid #475569;
        border-radius: 3px;
        color: #e2e8f0;
        padding: 3px 6px;
        font-size: 13px;
        font-family: inherit;
        outline: none;
    }
    .ve-text-input:focus, .ve-number-input:focus, .ve-select:focus {
        border-color: #60a5fa;
        box-shadow: 0 0 0 2px rgba(96,165,250,0.25);
    }
    .ve-checkbox {
        width: 16px;
        height: 16px;
        accent-color: #60a5fa;
    }

    /* ── Popup Editors ── */
    .date-value-editor, .color-value-editor {
        position: relative;
    }
    .ve-popup-summary {
        flex: 1;
        padding: 2px 4px;
        cursor: pointer;
        white-space: nowrap;
        color: #e2e8f0;
    }
    .ve-popup-trigger {
        background: #334155;
        border: 1px solid #475569;
        color: #94a3b8;
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
    }
    .ve-popup-trigger:hover {
        background: #475569;
        color: #e2e8f0;
    }
    .ve-popup-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 100;
        background: #1e293b;
        border: 1px solid #475569;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        padding: 8px;
        margin-top: 4px;
    }

    /* ── Color Editor ── */
    .ve-color-swatch {
        display: inline-block;
        width: 18px;
        height: 18px;
        border-radius: 3px;
        border: 1px solid #475569;
        cursor: pointer;
        flex-shrink: 0;
    }
    .ve-color-grid {
        display: grid;
        grid-template-columns: repeat(6, 28px);
        gap: 3px;
    }
    .ve-color-cell {
        width: 28px;
        height: 28px;
        border-radius: 3px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: transform 0.1s, border-color 0.1s;
    }
    .ve-color-cell:hover {
        transform: scale(1.15);
        border-color: #e2e8f0;
    }

    /* ── Date Editor / Month_View overrides ── */
    .date-value-editor .month-view { font-size: 12px; }

    /* ── Output ── */
    .demo-output {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 12px;
        font-family: 'Consolas', 'Fira Code', monospace;
        font-size: 12px;
        color: #86efac;
        min-height: 60px;
        max-height: 200px;
        overflow-y: auto;
        white-space: pre-wrap;
    }
`;

const client_js = `
    document.addEventListener('DOMContentLoaded', () => {
        // Find all property grids and activate them
        const grids = document.querySelectorAll('.property-grid');
        // jsgui controls self-activate via the framework on the client side,
        // but for this SSR demo we just wire up the output log manually.

        const output = document.getElementById('change-output');
        const log_lines = [];

        // Since grids are server-rendered, we wire lightweight client-side
        // event listeners for the output panel.
        const grid1 = document.getElementById('grid1');
        if (grid1) {
            // Listen for input events on all inputs within grid1
            grid1.addEventListener('input', (e) => {
                const input = e.target.closest('[data-role="value-input"]');
                if (input) {
                    const row = input.closest('.pg-row');
                    const key = row ? row.getAttribute('data-key') : 'unknown';
                    const val = input.type === 'checkbox' ? input.checked : input.value;
                    log_lines.push(key + ' = ' + JSON.stringify(val));
                    if (log_lines.length > 10) log_lines.shift();
                    output.textContent = log_lines.join('\\n');
                }
            });
            grid1.addEventListener('change', (e) => {
                const input = e.target.closest('[data-role="value-input"]');
                if (input) {
                    const row = input.closest('.pg-row');
                    const key = row ? row.getAttribute('data-key') : 'unknown';
                    const val = input.type === 'checkbox' ? input.checked : input.value;
                    log_lines.push(key + ' = ' + JSON.stringify(val));
                    if (log_lines.length > 10) log_lines.shift();
                    output.textContent = log_lines.join('\\n');
                }
            });

            // Color cell clicks
            grid1.addEventListener('click', (e) => {
                const cell = e.target.closest('.ve-color-cell');
                if (cell) {
                    const hex = cell.getAttribute('data-color');
                    const editor = cell.closest('.color-value-editor');
                    if (editor) {
                        const swatch = editor.querySelector('.ve-color-swatch');
                        const summary = editor.querySelector('.ve-popup-summary');
                        if (swatch) swatch.style.background = hex;
                        if (summary) summary.textContent = hex;

                        // Close popup
                        const popup = editor.querySelector('.ve-popup-dropdown');
                        if (popup) popup.style.display = 'none';
                    }
                    const row = cell.closest('.pg-row');
                    const key = row ? row.getAttribute('data-key') : 'unknown';
                    log_lines.push(key + ' = ' + JSON.stringify(hex));
                    if (log_lines.length > 10) log_lines.shift();
                    output.textContent = log_lines.join('\\n');
                }
            });
        }

        // Popup toggle handling for all grids
        document.querySelectorAll('.ve-popup-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const editor = btn.closest('.date-value-editor, .color-value-editor');
                if (editor) {
                    const popup = editor.querySelector('.ve-popup-dropdown');
                    if (popup) {
                        const visible = popup.style.display !== 'none';
                        popup.style.display = visible ? 'none' : 'block';
                        btn.setAttribute('aria-expanded', visible ? 'false' : 'true');
                    }
                }
            });
        });

        // Summary click also toggles popup
        document.querySelectorAll('.ve-popup-summary').forEach(summary => {
            summary.addEventListener('click', (e) => {
                const editor = summary.closest('.date-value-editor, .color-value-editor');
                if (editor) {
                    const popup = editor.querySelector('.ve-popup-dropdown');
                    if (popup) {
                        const visible = popup.style.display !== 'none';
                        popup.style.display = visible ? 'none' : 'block';
                    }
                }
            });
        });

        // Color swatch click
        document.querySelectorAll('.ve-color-swatch').forEach(sw => {
            sw.addEventListener('click', (e) => {
                const editor = sw.closest('.color-value-editor');
                if (editor) {
                    const popup = editor.querySelector('.ve-popup-dropdown');
                    if (popup) {
                        const visible = popup.style.display !== 'none';
                        popup.style.display = visible ? 'none' : 'block';
                    }
                }
            });
        });

        // Close popups on outside click
        document.addEventListener('mousedown', (e) => {
            document.querySelectorAll('.ve-popup-dropdown').forEach(popup => {
                if (popup.style.display !== 'none') {
                    const editor = popup.closest('.date-value-editor, .color-value-editor');
                    if (editor && !editor.contains(e.target)) {
                        popup.style.display = 'none';
                        const trigger = editor.querySelector('.ve-popup-trigger');
                        if (trigger) trigger.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });

        // Keyboard navigation on grids
        document.querySelectorAll('.property-grid').forEach(grid => {
            let focused = -1;
            const rows = Array.from(grid.querySelectorAll('.pg-row'));
            grid.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    focused = Math.min(focused + 1, rows.length - 1);
                    rows[focused]?.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    focused = Math.max(focused - 1, 0);
                    rows[focused]?.focus();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    focused = 0;
                    rows[0]?.focus();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    focused = rows.length - 1;
                    rows[focused]?.focus();
                }
            });
        });
    });
`;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        const { page } = create_demo_html();

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Property Grid Demo — jsgui3</title>
    <style>${css}</style>
</head>
<body>
    ${page.all_html_render()}
    <script>${client_js}</script>
</body>
</html>`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Property Grid Demo: http://localhost:${PORT}`);
    console.log(`Server running on localhost:${PORT}`);
});
