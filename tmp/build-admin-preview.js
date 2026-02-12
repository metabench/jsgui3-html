/**
 * Build a live HTML preview showing actual SSR-rendered admin controls
 * across all 4 themes: vs-default, vs-dark, terminal, warm.
 */
'use strict';
const path = require('path');
const fs = require('fs');

// Load jsgui3 controls
const jsgui = require('../html-core/html-core');
const controls = require('../controls/controls');
const { Key_Value_Table, Stat_Card, Log_Viewer, Data_Table, Admin_Theme } = controls;

const OUT = path.join(__dirname, 'admin-controls-preview.html');

/**
 * Helper: render a control to HTML with wrapping reset.
 */
function render(ctl) {
    return ctl.html;
}

/**
 * Build a themed section for each admin control.
 */
function build_theme_section(theme_name) {
    const ctx = new jsgui.Page_Context();

    // Key_Value_Table
    const kvt = new Key_Value_Table({
        context: ctx,
        title: 'Server Configuration',
        subtitle: 'Production • us-east-1',
        show_header: true,
        key_label: 'Setting',
        value_label: 'Value',
        copyable: true,
        data: [
            { key: 'Hostname', value: 'api.example.com', badge: 'LIVE', badge_variant: 'success' },
            { key: 'Port', value: '443' },
            { key: 'TLS Version', value: '1.3', badge: 'SECURE', badge_variant: 'info' },
            { key: 'Workers', value: '4' },
            { key: 'Max Connections', value: '10,000' },
            { key: 'Memory Limit', value: '2048 MB' },
            { key: 'Log Level', value: 'info' },
            { key: 'Cache TTL', value: '3600s' },
        ]
    });

    // Stat Cards
    const card1 = new Stat_Card({
        context: ctx,
        label: 'Active Users',
        value: '1,284',
        trend: 'up',
        trend_value: '+12% from yesterday',
        icon: '👤',
        variant: 'success'
    });

    const card2 = new Stat_Card({
        context: ctx,
        label: 'Error Rate',
        value: '0.3%',
        trend: 'down',
        trend_value: '-0.1% from avg',
        icon: '⚠',
        variant: 'danger'
    });

    const card3 = new Stat_Card({
        context: ctx,
        label: 'Response Time',
        value: '142ms',
        trend: 'flat',
        trend_value: 'Stable',
        icon: '⏱',
        variant: 'info'
    });

    const card4 = new Stat_Card({
        context: ctx,
        label: 'Uptime',
        value: '99.97%',
        trend: 'up',
        trend_value: '+0.02%',
        icon: '🟢'
    });

    // Log Viewer
    const lv = new Log_Viewer({
        context: ctx,
        title: 'Application Log',
        entries: [
            { message: 'Server listening on port 443', level: 'info', timestamp: '14:22:01.123' },
            { message: 'TLS handshake completed (client: 192.168.1.42)', level: 'debug', timestamp: '14:22:01.456' },
            { message: 'Connected to PostgreSQL cluster (pool: 5/20)', level: 'info', timestamp: '14:22:01.789' },
            { message: 'Slow query detected: SELECT * FROM users (847ms)', level: 'warn', timestamp: '14:22:03.012' },
            { message: 'Connection timeout to redis://cache:6379', level: 'error', timestamp: '14:22:05.234' },
            { message: 'Redis reconnected after 2 retries', level: 'info', timestamp: '14:22:07.567' },
            { message: 'Health check passed: all services nominal', level: 'info', timestamp: '14:22:10.890' },
        ]
    });

    // Data Table
    const dt = new Data_Table({
        context: ctx,
        columns: [
            { key: 'endpoint', label: 'Endpoint', sortable: true },
            { key: 'method', label: 'Method', sortable: true },
            { key: 'latency', label: 'Latency', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'last_call', label: 'Last Call', sortable: true },
        ],
        rows: [
            { endpoint: '/api/v1/users', method: 'GET', latency: '42ms', status: '200', last_call: '2s ago' },
            { endpoint: '/api/v1/auth/login', method: 'POST', latency: '128ms', status: '200', last_call: '5s ago' },
            { endpoint: '/api/v1/products', method: 'GET', latency: '67ms', status: '200', last_call: '8s ago' },
            { endpoint: '/api/v1/orders', method: 'POST', latency: '245ms', status: '201', last_call: '12s ago' },
            { endpoint: '/api/v1/health', method: 'GET', latency: '3ms', status: '200', last_call: '1s ago' },
            { endpoint: '/api/v1/metrics', method: 'GET', latency: '892ms', status: '504', last_call: '30s ago' },
        ],
        bordered: false
    });

    // Collect all CSS from controls
    const allCSS = [
        Admin_Theme.css,
        Key_Value_Table.css || '',
        Stat_Card.css || '',
        Log_Viewer.css || '',
        Data_Table.css || ''
    ].join('\n');

    return {
        css: allCSS,
        kvt_html: render(kvt),
        cards_html: [render(card1), render(card2), render(card3), render(card4)].join('\n'),
        log_html: render(lv),
        dt_html: render(dt),
    };
}

// Only need to render once — the CSS variables handle theming
const section = build_theme_section();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Admin Controls — Live Preview</title>
<style>
${section.css}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    background: var(--admin-bg, #f3f3f3);
    color: var(--admin-text, #1e1e1e);
    font-family: var(--admin-font, 'Segoe UI', 'Inter', sans-serif);
    padding: 0;
    transition: background-color 0.3s, color 0.3s;
}

/* Theme switcher bar */
.theme-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: var(--admin-card-bg, #fff);
    border-bottom: 2px solid var(--admin-border-accent, #0078d4);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.theme-bar label {
    font-weight: 600;
    font-size: 13px;
    color: var(--admin-text, #1e1e1e);
    margin-right: 4px;
}
.theme-btn {
    padding: 5px 14px;
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--admin-radius, 4px);
    background: var(--admin-card-bg, #fff);
    color: var(--admin-text, #1e1e1e);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s;
}
.theme-btn:hover {
    background: var(--admin-hover-bg, #e8e8e8);
}
.theme-btn.active {
    background: var(--admin-accent, #0078d4);
    color: #fff;
    border-color: var(--admin-accent, #0078d4);
}

.preview-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px;
}

.section-header {
    font-size: 16px;
    font-weight: 600;
    margin: 32px 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
    color: var(--admin-text, #1e1e1e);
    display: flex;
    align-items: center;
    gap: 8px;
}
.section-header::before {
    content: '';
    width: 3px;
    height: 18px;
    background: var(--admin-accent, #0078d4);
    border-radius: 2px;
}
.section-header:first-child {
    margin-top: 0;
}

.stat-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}
.stat-cards-grid .jsgui-stat-card {
    width: 100%;
    display: flex;
}

.data-table-wrap {
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--admin-radius-lg, 6px);
    overflow: hidden;
    box-shadow: var(--admin-shadow, 0 1px 3px rgba(0,0,0,0.08));
}
</style>
</head>
<body>
<div class="theme-bar">
    <label>Theme:</label>
    <button class="theme-btn active" onclick="setTheme('vs-default')">VS Default</button>
    <button class="theme-btn" onclick="setTheme('vs-dark')">VS Dark</button>
    <button class="theme-btn" onclick="setTheme('terminal')">Terminal</button>
    <button class="theme-btn" onclick="setTheme('warm')">Warm</button>
</div>

<div class="preview-container">
    <div class="section-header">Stat Cards</div>
    <div class="stat-cards-grid">
        ${section.cards_html}
    </div>

    <div class="section-header">Key Value Table</div>
    ${section.kvt_html}

    <div class="section-header">Log Viewer</div>
    ${section.log_html}

    <div class="section-header">Data Table</div>
    <div class="data-table-wrap">
        ${section.dt_html}
    </div>
</div>

<script>
function setTheme(name) {
    document.documentElement.setAttribute('data-admin-theme', name);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().replace(/\\s+/g, '-') === name.replace('vs-', 'vs ').toLowerCase() || 
            btn.textContent.toLowerCase() === name.replace('vs-', 'vs '));
    });
    // Simpler: just check onclick text
    document.querySelectorAll('.theme-btn').forEach(btn => {
        const matches = btn.getAttribute('onclick').includes("'" + name + "'");
        btn.classList.toggle('active', matches);
    });
}
</script>
</body>
</html>`;

fs.writeFileSync(OUT, html);
console.log('Preview written to:', OUT);
console.log('Size:', (Buffer.byteLength(html) / 1024).toFixed(1), 'KB');
console.log('\\nOpen in browser: file:///' + OUT.replace(/\\\\/g, '/'));
