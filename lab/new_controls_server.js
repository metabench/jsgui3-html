
/**
 * New Controls Demo Server
 * 
 * Server to view Tree_View, Property_Viewer, and Resource_Viewer in browser.
 * Includes theming demos.
 * Run with: node lab/new_controls_server.js
 */

const http = require('http');
const jsgui = require('../html-core/html-core');
const Tree_View = require('../controls/organised/1-standard/4-data/Tree_View');
const Property_Viewer = require('../controls/organised/1-standard/0-viewer/Property_Viewer');
const Resource_Viewer = require('../controls/organised/1-standard/0-viewer/Resource_Viewer');

const PORT = 3500;

const create_demo_html = () => {
    const context = new jsgui.Page_Context();

    // Create page wrapper
    const page = new jsgui.Control({ context });
    page.dom.tagName = 'div';
    page.add_class('controls-demo');

    // Title
    const title = new jsgui.Control({ context, tag_name: 'h1' });
    title.add('New Controls Demo');
    page.add(title);

    // ============================================
    // Section: Tree View
    // ============================================
    const tree_section = new jsgui.Control({ context, tag_name: 'section' });
    tree_section.add_class('demo-section');
    tree_section.add(new jsgui.Control({ context, tag_name: 'h2' }).add('Tree_View'));

    const tree = new Tree_View({
        context,
        data: [
            { id: '1', label: 'Documents', icon: '📁', expanded: true, children: [
                { id: '1.1', label: 'Work', icon: '📂', children: [
                    { id: '1.1.1', label: 'Project A', icon: '📄' },
                    { id: '1.1.2', label: 'Report.pdf', icon: '📃' }
                ]},
                { id: '1.2', label: 'Personal', icon: '🔒' }
            ]},
            { id: '2', label: 'Images', icon: '🖼️', children: [
                { id: '2.1', label: 'Logo.png', icon: '🖼️' }
            ]}
        ]
    });
    tree_section.add(tree);
    page.add(tree_section);

    // ============================================
    // Section: Property Viewer
    // ============================================
    const prop_section = new jsgui.Control({ context, tag_name: 'section' });
    prop_section.add_class('demo-section');
    prop_section.add(new jsgui.Control({ context, tag_name: 'h2' }).add('Property_Viewer'));

    const prop_viewer = new Property_Viewer({
        context,
        data: {
            name: 'Production DB',
            type: 'postgres',
            status: 'active',
            uptime: '99.99%',
            connections: 1250,
            last_backup: new Date(),
            dashboard: 'https://admin.example.com/db'
        },
        schema: {
            name: { label: 'Database Name' },
            type: { label: 'Type', type: 'badge', badgeClass: 'type-badge' },
            status: { label: 'Status', type: 'status', statusMap: { active: 'green', maintenance: 'yellow', down: 'red' } },
            uptime: { label: 'Uptime', type: 'string' },
            connections: { label: 'Active Connections', type: 'number' },
            last_backup: { label: 'Last Backup', type: 'date' },
            dashboard: { label: 'Dashboard Link', type: 'link' }
        }
    });

    prop_section.add(prop_viewer);
    page.add(prop_section);


    // ============================================
    // Section: Resource Viewer
    // ============================================
    const resource_section = new jsgui.Control({ context, tag_name: 'section' });
    resource_section.add_class('demo-section');
    resource_section.add(new jsgui.Control({ context, tag_name: 'h2' }).add('Resource_Viewer'));

    const resource = new Resource_Viewer({
        context,
        resource: {
            name: '/api/v1/users',
            type: 'endpoint',
            icon: '🔌',
            status: 'active',
            description: 'User management API endpoint. Handles CRUD operations for user accounts.',
            properties: {
                schema: { 
                    method: { label: 'Method', type: 'badge' },
                    auth: { label: 'Auth', type: 'string' },
                    rate_limit: { label: 'Rate Limit', type: 'number' }
                },
                method: 'GET',
                auth: 'Bearer Token',
                rate_limit: 1000
            },
            actions: [
                { name: 'test', label: 'Test Endpoint' },
                { name: 'docs', label: 'View Docs' },
                { name: 'disable', label: 'Disable' }
            ]
        },
        expandable: true
    });
    // Start expanded for demo
    resource.view.data.model.expanded = true;
    // We need to ensure the class is added if we set the model directly server-side without full binding
    resource.add_class('expanded');
    if (resource.ctrl_details) resource.ctrl_details.remove_class('hidden');

    resource_section.add(resource);
    page.add(resource_section);


    // ============================================
    // Section: Theming (Dark Mode)
    // ============================================
    const theme_section = new jsgui.Control({ context, tag_name: 'section' });
    theme_section.add_class('demo-section dark-theme');
    theme_section.add(new jsgui.Control({ context, tag_name: 'h2' }).add('Dark Theme Variant'));

    // Resource Viewer in Dark Mode
    const dark_resource = new Resource_Viewer({
        context,
        resource: {
            name: 'Background Worker',
            type: 'service',
            icon: '⚙️',
            status: 'paused',
            description: 'Processes background jobs for report generation.',
            properties: {
                schema: { 
                    jobs: { label: 'Jobs', type: 'number' },
                    memory: { label: 'Memory', type: 'string' }
                },
                jobs: 0,
                memory: '128MB'
            },
            actions: [
                { name: 'start', label: 'Start' }
            ]
        }
    });
    
    theme_section.add(dark_resource);
    page.add(theme_section);


    const content_html = page.all_html_render();

    // Combine CSS
    // Extract CSS from controls
    const css = `
        ${Tree_View.css}
        ${Property_Viewer.css}
        ${Resource_Viewer.css}

        /* Demo Page Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f5f7fa;
            color: #333;
            margin: 0;
            padding: 40px;
        }
        .controls-demo {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 { text-align: center; color: #2c3e50; margin-bottom: 40px; }
        h2 { color: #34495e; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0; }
        
        .demo-section {
            background: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            margin-bottom: 32px;
        }

        /* Dark Theme Overrides */
        .dark-theme {
            background-color: #1a202c;
            color: #e2e8f0;
        }
        .dark-theme h2 {
            color: #f7fafc;
            border-bottom-color: #2d3748;
        }

        .dark-theme .resource-viewer {
            background-color: #2d3748;
            border-color: #4a5568;
        }
        .dark-theme .resource-header {
            background-color: #2d3748;
            color: #f7fafc;
        }
        .dark-theme .resource-header:hover {
            background-color: #4a5568;
        }
        .dark-theme .resource-name {
            color: #f7fafc;
        }
        .dark-theme .resource-description {
            background-color: #2d3748;
            color: #a0aec0;
        }
        .dark-theme .resource-details {
            background-color: #2d3748;
            border-top: 1px solid #4a5568;
        }
        .dark-theme .resource-actions {
            background-color: #2d3748;
            border-top-color: #4a5568;
        }
        .dark-theme .resource-action-btn {
            background-color: #4a5568;
            border-color: #718096;
            color: #f7fafc;
        }
        .dark-theme .resource-action-btn:hover {
            background-color: #718096;
        }
        .dark-theme .resource-badge {
            background-color: #4a5568;
            color: #e2e8f0;
        }
        
        /* Property Viewer Dark Mode */
        .dark-theme .property-label { color: #a0aec0; }
        .dark-theme .property-value { color: #e2e8f0; }
        .dark-theme .property-row { border-bottom-color: #4a5568; }
        .dark-theme .property-value--badge {
            background-color: #4a5568;
            color: #e2e8f0;
        }
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSGUI3 New Controls Demo</title>
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
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(create_demo_html());
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`New Controls demo server running at http://localhost:${PORT}`);
});
