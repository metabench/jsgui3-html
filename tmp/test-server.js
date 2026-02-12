/**
 * Controls Test Server — serves a page that exercises all controls with activation.
 * 
 * Run: node tmp/test-server.js
 * Then open: http://localhost:4444
 */
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 4455;

// Build the page HTML using jsgui controls
const jsgui = require('../html-core/html-core');

// Import controls
const controls = require('../controls/controls');
const {
    Sidebar_Nav, Wizard, Inline_Cell_Edit, Markdown_Viewer,
    Bar_Chart, Pie_Chart, Sparkline,
    Accordion, Badge, Chip, Toast, Tooltip, Search_Bar,
    Skeleton_Loader, Spinner, Avatar, Progress_Bar, Rating_Stars,
    Modal, Tabbed_Panel, Breadcrumbs, Toggle_Switch,
    Button, Checkbox, Alert_Banner,
    // Admin controls
    Admin_Theme, Stat_Card, Log_Viewer, Key_Value_Table, Data_Table,
    Activity_Feed, Command_Palette, Status_Dashboard
} = controls;

function build_page() {
    const ctx = new jsgui.Page_Context();
    const sections = [];

    // Helper to build a section
    function section(title, control_html) {
        return `
        <section class="test-section">
            <h2 class="test-section-title">${title}</h2>
            <div class="test-section-body">${control_html}</div>
        </section>`;
    }

    // 1. Sidebar Nav
    try {
        const nav = new Sidebar_Nav({
            context: ctx,
            active_id: 'dashboard',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'users', label: 'Users', icon: '👥', badge: 3 },
                {
                    id: 'settings', label: 'Settings', icon: '⚙️', items: [
                        { id: 'general', label: 'General' },
                        { id: 'security', label: 'Security' },
                        { id: 'notifications', label: 'Notifications' }
                    ]
                },
                { id: 'reports', label: 'Reports', icon: '📈' }
            ]
        });
        sections.push(section('Sidebar Nav', nav.html));
    } catch (e) { sections.push(section('Sidebar Nav', `<pre class="error">${e.message}</pre>`)); }

    // 2. Wizard — use jsgui Controls for step content
    try {
        // Build step content as Controls
        const step1_content = new jsgui.Control({ context: ctx, tag_name: 'div' });
        const step1_label = new jsgui.Control({ context: ctx, tag_name: 'label' });
        step1_label.add('Name: ');
        const step1_input = new jsgui.Control({ context: ctx, tag_name: 'input' });
        step1_input.dom.attributes.type = 'text';
        step1_input.dom.attributes.id = 'wiz-name';
        step1_input.dom.attributes.placeholder = 'Enter name';
        step1_input.dom.noClosingTag = true;
        step1_label.add(step1_input);
        step1_content.add(step1_label);

        const step2_content = new jsgui.Control({ context: ctx, tag_name: 'div' });
        const lbl_dark = new jsgui.Control({ context: ctx, tag_name: 'label' });
        const chk_dark = new jsgui.Control({ context: ctx, tag_name: 'input' });
        chk_dark.dom.attributes.type = 'checkbox';
        chk_dark.dom.attributes.id = 'wiz-dark';
        chk_dark.dom.noClosingTag = true;
        lbl_dark.add(chk_dark);
        lbl_dark.add(' Dark Mode');
        const lbl_notify = new jsgui.Control({ context: ctx, tag_name: 'label' });
        const chk_notify = new jsgui.Control({ context: ctx, tag_name: 'input' });
        chk_notify.dom.attributes.type = 'checkbox';
        chk_notify.dom.attributes.id = 'wiz-notify';
        chk_notify.dom.noClosingTag = true;
        lbl_notify.add(chk_notify);
        lbl_notify.add(' Notifications');
        step2_content.add(lbl_dark);
        step2_content.add(lbl_notify);

        const step3_content = new jsgui.Control({ context: ctx, tag_name: 'p' });
        step3_content.add('Review your choices and click Finish.');

        const wiz = new Wizard({
            context: ctx,
            steps: [
                { id: 'info', title: 'Your Info', content: step1_content },
                { id: 'prefs', title: 'Preferences', content: step2_content },
                { id: 'confirm', title: 'Confirm', content: step3_content }
            ]
        });
        sections.push(section('Wizard', wiz.html));
    } catch (e) { sections.push(section('Wizard', `<pre class="error">${e.message}</pre>`)); }

    // 3. Inline Cell Edit
    try {
        const ice1 = new Inline_Cell_Edit({ context: ctx, value: 'Click me to edit', type: 'text' });
        const ice2 = new Inline_Cell_Edit({ context: ctx, value: '42', type: 'number' });
        const ice3 = new Inline_Cell_Edit({ context: ctx, value: 'Option B', type: 'select', options: [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }, { value: 'c', label: 'Option C' }] });
        sections.push(section('Inline Cell Edit', `
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
                <div><strong>Text:</strong> ${ice1.html}</div>
                <div><strong>Number:</strong> ${ice2.html}</div>
                <div><strong>Select:</strong> ${ice3.html}</div>
            </div>
        `));
    } catch (e) { sections.push(section('Inline Cell Edit', `<pre class="error">${e.message}</pre>`)); }

    // 4. Markdown Viewer
    try {
        const md = new Markdown_Viewer({
            context: ctx,
            theme: 'github',
            markdown: `# Markdown Viewer Demo

This component renders **Markdown** as styled HTML.

## Features
- Headings (h1-h6)
- **Bold** and *italic* text
- \`Inline code\` and code blocks
- [Links](https://example.com)

\`\`\`javascript
const greeting = "Hello, jsgui!";
console.log(greeting);
\`\`\`

> This is a blockquote with important information.

---

1. Ordered list
2. Second item
3. Third item`
        });
        sections.push(section('Markdown Viewer', md.html));
    } catch (e) { sections.push(section('Markdown Viewer', `<pre class="error">${e.message}</pre>`)); }

    // 5. Bar Chart
    try {
        const bar = new Bar_Chart({
            context: ctx,
            width: 500,
            height: 280,
            data: [
                { label: 'Jan', value: 30, color: '#3b82f6' },
                { label: 'Feb', value: 45, color: '#8b5cf6' },
                { label: 'Mar', value: 25, color: '#ef4444' },
                { label: 'Apr', value: 60, color: '#22c55e' },
                { label: 'May', value: 55, color: '#f59e0b' },
                { label: 'Jun', value: 70, color: '#06b6d4' }
            ]
        });
        sections.push(section('Bar Chart', bar.html));
    } catch (e) { sections.push(section('Bar Chart', `<pre class="error">${e.message}</pre>`)); }

    // 6. Pie Chart + Donut
    try {
        const pie = new Pie_Chart({
            context: ctx,
            width: 260,
            height: 260,
            data: [
                { label: 'Chrome', value: 65, color: '#3b82f6' },
                { label: 'Firefox', value: 15, color: '#ef4444' },
                { label: 'Safari', value: 12, color: '#22c55e' },
                { label: 'Edge', value: 8, color: '#f59e0b' }
            ]
        });
        const donut = new Pie_Chart({
            context: ctx,
            width: 260,
            height: 260,
            donut: true,
            donut_width: 50,
            data: [
                { label: 'Done', value: 41, color: '#22c55e' },
                { label: 'In Progress', value: 5, color: '#f59e0b' },
                { label: 'Not Started', value: 27, color: '#94a3b8' }
            ]
        });
        sections.push(section('Pie & Donut Charts', `
            <div style="display:flex;gap:40px;flex-wrap:wrap;align-items:flex-start;">
                <div><h3>Pie Chart</h3>${pie.html}</div>
                <div><h3>Donut Chart</h3>${donut.html}</div>
            </div>
        `));
    } catch (e) { sections.push(section('Pie & Donut Charts', `<pre class="error">${e.message}</pre>`)); }

    // 7. Sparklines
    try {
        const spark1 = new Sparkline({ context: ctx, data: [10, 15, 8, 22, 18, 25, 30, 28, 35], stroke_color: '#3b82f6', fill: true });
        const spark2 = new Sparkline({ context: ctx, data: [30, 28, 25, 20, 15, 10, 8, 5, 3], stroke_color: '#ef4444', fill: true });
        const spark3 = new Sparkline({ context: ctx, data: [5, 10, 8, 15, 12, 18, 20, 22, 25], stroke_color: '#22c55e', fill: false });
        sections.push(section('Sparklines', `
            <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
                <div>Revenue ${spark1.html} <strong style="color:#3b82f6">+16%</strong></div>
                <div>Errors ${spark2.html} <strong style="color:#ef4444">-90%</strong></div>
                <div>Users ${spark3.html} <strong style="color:#22c55e">+400%</strong></div>
            </div>
        `));
    } catch (e) { sections.push(section('Sparklines', `<pre class="error">${e.message}</pre>`)); }

    // 8. Accordion
    try {
        const acc = new Accordion({
            context: ctx,
            sections: [
                { title: 'Getting Started', content: 'Welcome to jsgui3! This accordion demonstrates expandable sections.' },
                { title: 'Configuration', content: 'Configure your application by editing the settings.json file.' },
                { title: 'API Reference', content: 'See the docs folder for complete API documentation.' }
            ]
        });
        sections.push(section('Accordion', acc.html));
    } catch (e) { sections.push(section('Accordion', `<pre class="error">${e.message}</pre>`)); }

    // 9. Badge & Chip
    try {
        const badge1 = new Badge({ context: ctx, text: 'New', variant: 'primary' });
        const badge2 = new Badge({ context: ctx, text: 'Warning', variant: 'warning' });
        const badge3 = new Badge({ context: ctx, text: '99+', variant: 'danger' });
        const chip1 = new Chip({ context: ctx, label: 'JavaScript', dismissible: true });
        const chip2 = new Chip({ context: ctx, label: 'CSS', dismissible: true });
        const chip3 = new Chip({ context: ctx, label: 'HTML', dismissible: true });
        sections.push(section('Badge & Chip', `
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;">
                <strong>Badges:</strong> ${badge1.html} ${badge2.html} ${badge3.html}
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <strong>Chips:</strong> ${chip1.html} ${chip2.html} ${chip3.html}
            </div>
        `));
    } catch (e) { sections.push(section('Badge & Chip', `<pre class="error">${e.message}</pre>`)); }

    // 10. Progress Bar & Spinner
    try {
        const prog1 = new Progress_Bar({ context: ctx, value: 65 });
        const prog2 = new Progress_Bar({ context: ctx, value: 30 });
        const spin = new Spinner({ context: ctx });
        sections.push(section('Progress Bar & Spinner', `
            <div style="margin-bottom:12px;"><strong>65%:</strong> ${prog1.html}</div>
            <div style="margin-bottom:12px;"><strong>30%:</strong> ${prog2.html}</div>
            <div><strong>Spinner:</strong> ${spin.html}</div>
        `));
    } catch (e) { sections.push(section('Progress Bar & Spinner', `<pre class="error">${e.message}</pre>`)); }

    // 11. Rating Stars
    try {
        const stars = new Rating_Stars({ context: ctx, value: 3, max: 5 });
        sections.push(section('Rating Stars', stars.html));
    } catch (e) { sections.push(section('Rating Stars', `<pre class="error">${e.message}</pre>`)); }

    // 12. Breadcrumbs
    try {
        const crumbs = new Breadcrumbs({
            context: ctx,
            items: [
                { label: 'Home', href: '#' },
                { label: 'Components', href: '#' },
                { label: 'Breadcrumbs' }
            ]
        });
        sections.push(section('Breadcrumbs', crumbs.html));
    } catch (e) { sections.push(section('Breadcrumbs', `<pre class="error">${e.message}</pre>`)); }

    // 13. Avatar
    try {
        const av1 = new Avatar({ context: ctx, initials: 'JD', size: 'lg' });
        const av2 = new Avatar({ context: ctx, initials: 'AB', size: 'md' });
        const av3 = new Avatar({ context: ctx, initials: 'XY', size: 'sm' });
        sections.push(section('Avatar', `
            <div style="display:flex;gap:12px;align-items:center;">
                ${av1.html} ${av2.html} ${av3.html}
            </div>
        `));
    } catch (e) { sections.push(section('Avatar', `<pre class="error">${e.message}</pre>`)); }

    // 14. Search Bar
    try {
        const search = new Search_Bar({ context: ctx, placeholder: 'Search controls...' });
        sections.push(section('Search Bar', search.html));
    } catch (e) { sections.push(section('Search Bar', `<pre class="error">${e.message}</pre>`)); }

    // 15. Skeleton Loader
    try {
        const skel = new Skeleton_Loader({ context: ctx, lines: 3 });
        sections.push(section('Skeleton Loader', skel.html));
    } catch (e) { sections.push(section('Skeleton Loader', `<pre class="error">${e.message}</pre>`)); }

    // 16. Toggle Switch
    try {
        const toggle = new Toggle_Switch({ context: ctx, label: 'Dark Mode' });
        sections.push(section('Toggle Switch', toggle.html));
    } catch (e) { sections.push(section('Toggle Switch', `<pre class="error">${e.message}</pre>`)); }

    // 17. Tabbed Panel
    try {
        const tabs = new Tabbed_Panel({
            context: ctx,
            tabs: [
                { label: 'Overview', content: 'This is the overview tab.' },
                { label: 'Details', content: 'Here are the details.' },
                { label: 'Settings', content: 'Adjust your settings here.' }
            ]
        });
        sections.push(section('Tabbed Panel', tabs.html));
    } catch (e) { sections.push(section('Tabbed Panel', `<pre class="error">${e.message}</pre>`)); }

    // ═══ ADMIN DASHBOARD CONTROLS ═══

    // 18. Stat Cards
    try {
        const card1 = new Stat_Card({ context: ctx, label: 'Active Users', value: '1,284', trend: 'up', trend_value: '+12%', icon: '👤', variant: 'success' });
        const card2 = new Stat_Card({ context: ctx, label: 'Error Rate', value: '0.3%', trend: 'down', trend_value: '-0.1%', icon: '⚠', variant: 'danger' });
        const card3 = new Stat_Card({ context: ctx, label: 'Response Time', value: '142ms', trend: 'flat', trend_value: 'Stable', icon: '⏱', variant: 'info' });
        const card4 = new Stat_Card({ context: ctx, label: 'Uptime', value: '99.97%', trend: 'up', trend_value: '+0.02%', icon: '🟢' });
        sections.push(section('Stat Cards', `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                ${card1.html}${card2.html}${card3.html}${card4.html}
            </div>
        `));
    } catch (e) { sections.push(section('Stat Cards', `<pre class="error">${e.message}</pre>`)); }

    // 19. Key Value Table
    try {
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
        sections.push(section('Key Value Table', kvt.html));
    } catch (e) { sections.push(section('Key Value Table', `<pre class="error">${e.message}</pre>`)); }

    // 20. Log Viewer
    try {
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
        sections.push(section('Log Viewer', lv.html));
    } catch (e) { sections.push(section('Log Viewer', `<pre class="error">${e.message}</pre>`)); }

    // 21. Data Table
    try {
        const dt = new Data_Table({
            context: ctx,
            columns: [
                { key: 'endpoint', label: 'Endpoint' },
                { key: 'method', label: 'Method' },
                { key: 'latency', label: 'Latency' },
                { key: 'status', label: 'Status' },
                { key: 'last_call', label: 'Last Call' },
            ],
            rows: [
                { endpoint: '/api/v1/users', method: 'GET', latency: '42ms', status: '200', last_call: '2s ago' },
                { endpoint: '/api/v1/auth/login', method: 'POST', latency: '128ms', status: '200', last_call: '5s ago' },
                { endpoint: '/api/v1/products', method: 'GET', latency: '67ms', status: '200', last_call: '8s ago' },
                { endpoint: '/api/v1/orders', method: 'POST', latency: '245ms', status: '201', last_call: '12s ago' },
                { endpoint: '/api/v1/health', method: 'GET', latency: '3ms', status: '200', last_call: '1s ago' },
                { endpoint: '/api/v1/metrics', method: 'GET', latency: '892ms', status: '504', last_call: '30s ago' },
            ]
        });
        sections.push(section('Data Table', `<div style="background:var(--admin-card-bg,#fff);border:1px solid var(--admin-border,#e0e0e0);border-radius:6px;overflow:hidden;">${dt.html}</div>`));
    } catch (e) { sections.push(section('Data Table', `<pre class="error">${e.message}</pre>`)); }

    // 22. Activity Feed
    try {
        const af = new Activity_Feed({
            context: ctx,
            title: 'Recent Activity',
            entries: [
                { timestamp: '14:32:01', type: 'deploy', message: 'deployed v2.4.1 to production', actor: 'ci-bot', detail: '45s' },
                { timestamp: '14:28:15', type: 'success', message: 'Health check passed — all 12 services healthy', detail: '12/12' },
                { timestamp: '14:15:42', type: 'warning', message: 'Memory usage above 80% on worker-3', detail: '82%' },
                { timestamp: '13:58:00', type: 'info', message: 'Scheduled backup completed', actor: 'cron', detail: '2.3 GB' },
                { timestamp: '13:45:22', type: 'error', message: 'Connection timeout to database replica db-read-2', detail: '30s' },
                { timestamp: '13:30:00', type: 'system', message: 'Auto-scaling triggered: 2 → 4 instances', detail: '+2' },
                { timestamp: '13:12:11', type: 'success', message: 'SSL certificate renewed for api.example.com', actor: 'certbot' },
                { timestamp: '12:55:33', type: 'info', message: 'Cache cleared for /api/v2/users endpoint', actor: 'admin' }
            ]
        });
        sections.push(section('Activity Feed', af.html));
    } catch (e) { sections.push(section('Activity Feed', `<pre class="error">${e.message}</pre>`)); }

    // 23. Status Dashboard
    try {
        const sd = new Status_Dashboard({
            context: ctx,
            title: 'System Overview',
            groups: [
                {
                    title: 'Performance',
                    metrics: [
                        { label: 'Requests/sec', value: '2,847', trend: 'up', trend_value: '+12%', icon: '⚡', variant: 'info', sparkline_data: [20, 25, 22, 30, 28, 35, 32, 40, 38, 45] },
                        { label: 'Avg Latency', value: '42ms', trend: 'down', trend_value: '-8ms', icon: '⏱', variant: 'success', sparkline_data: [60, 55, 50, 48, 45, 42, 44, 42, 40, 42] },
                        { label: 'Error Rate', value: '0.12%', trend: 'flat', icon: '🛡', variant: 'success' }
                    ]
                },
                {
                    title: 'Resources',
                    metrics: [
                        { label: 'CPU Usage', value: '67%', trend: 'up', trend_value: '+5%', icon: '🔥', variant: 'warning', sparkline_data: [45, 50, 55, 60, 58, 65, 62, 67, 70, 67] },
                        { label: 'Memory', value: '4.2 GB', icon: '💾', variant: 'default', sparkline_data: [3.0, 3.2, 3.5, 3.8, 4.0, 3.9, 4.1, 4.0, 4.2, 4.2] },
                        { label: 'Disk I/O', value: '128 MB/s', icon: '💿', variant: 'default' }
                    ]
                }
            ]
        });
        sections.push(section('Status Dashboard', sd.html));
    } catch (e) { sections.push(section('Status Dashboard', `<pre class="error">${e.message}</pre>`)); }

    // 24. Alert Banners
    try {
        const alerts = ['info', 'success', 'warn', 'error'].map(status => {
            const messages = {
                info: 'System maintenance scheduled for Sunday 02:00 UTC.',
                success: 'All services are operational. Last incident: 14 days ago.',
                warn: 'Memory usage on worker-3 is above 80%. Consider scaling.',
                error: 'Database replica db-read-2 is unreachable. Failover active.'
            };
            return new Alert_Banner({
                context: ctx,
                status,
                message: messages[status],
                dismissible: true
            });
        });
        const alerts_html = alerts.map(a => a.html).join('<div style="height:8px"></div>');
        sections.push(section('Alert Banners', alerts_html));
    } catch (e) { sections.push(section('Alert Banners', `<pre class="error">${e.message}</pre>`)); }

    // 25. Command Palette (hidden by default, triggered by Ctrl+K)
    try {
        const cp = new Command_Palette({
            context: ctx,
            commands: [
                { id: 'restart', label: 'Restart Server', shortcut: 'Ctrl+R', icon: '🔄', group: 'Server' },
                { id: 'logs', label: 'View Logs', shortcut: 'Ctrl+L', icon: '📋', group: 'Server' },
                { id: 'clear-cache', label: 'Clear Cache', icon: '🗑', group: 'Server' },
                { id: 'deploy', label: 'Deploy to Production', icon: '🚀', group: 'Deploy' },
                { id: 'rollback', label: 'Rollback Last Deploy', icon: '↩', group: 'Deploy' },
                { id: 'users', label: 'Manage Users', icon: '👥', group: 'Admin' },
                { id: 'settings', label: 'Server Settings', shortcut: 'Ctrl+,', icon: '⚙', group: 'Admin' },
                { id: 'theme', label: 'Change Theme', icon: '🎨', group: 'Admin' }
            ]
        });
        sections.push(section('Command Palette', `<p style="color:var(--admin-muted,#64748b);font-size:13px;">Press <kbd style="padding:2px 6px;border-radius:4px;border:1px solid var(--admin-border,#e2e8f0);background:var(--admin-hover,#f1f5f9);font-size:12px;">Ctrl+K</kbd> to open the command palette</p>${cp.html}`));
    } catch (e) { sections.push(section('Command Palette', `<pre class="error">${e.message}</pre>`)); }

    // Read external CSS
    const cssDir = path.join(__dirname, '..', 'css');
    let mainCss = '';
    try {
        mainCss = fs.readFileSync(path.join(cssDir, 'jsgui.css'), 'utf8');
        // Resolve @import URLs to inline them
        mainCss = mainCss.replace(/@import\s+url\(['"]?\.\/([^'")\s]+)['"]?\)[^;]*;/g, (match, file) => {
            try {
                return fs.readFileSync(path.join(cssDir, file), 'utf8');
            } catch { return `/* missing: ${file} */`; }
        });
    } catch (e) { mainCss = '/* Could not load jsgui.css */'; }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>jsgui3 Controls Test Page</title>
    <style>
        ${mainCss}
        ${Admin_Theme.css}
        ${Stat_Card.css || ''}
        ${Log_Viewer.css || ''}
        ${Key_Value_Table.css || ''}
        ${Data_Table.css || ''}
        ${Accordion.css || ''}
        ${Chip.css || ''}
        ${Activity_Feed.css || ''}
        ${Command_Palette.css || ''}
        ${Status_Dashboard.css || ''}
        ${Alert_Banner.css || ''}
        ${Tabbed_Panel.css || ''}

        /* === Test page layout === */
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.5;
        }
        .test-header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e2e8f0;
        }
        .test-header h1 { margin: 0 0 4px; font-size: 28px; }
        .test-header p { margin: 0; color: #64748b; }
        .test-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
            gap: 24px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .test-section {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
        }
        .test-section-title {
            margin: 0;
            padding: 12px 20px;
            font-size: 15px;
            font-weight: 600;
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
        }
        .test-section-body {
            padding: 20px;
        }
        .error {
            color: #dc2626;
            background: #fef2f2;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
        }
        /* Theme bar */
        .theme-bar {
            position: fixed;
            top: 0;
            right: 0;
            left: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 24px;
            background: var(--admin-card-bg, #fff);
            border-bottom: 2px solid var(--admin-accent, #0078d4);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-family: var(--admin-font, 'Segoe UI', sans-serif);
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
            border-radius: 4px;
            background: var(--admin-card-bg, #fff);
            color: var(--admin-text, #1e1e1e);
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.15s;
        }
        .theme-btn:hover { background: var(--admin-hover-bg, #e8e8e8); }
        .theme-btn.active {
            background: var(--admin-accent, #0078d4);
            color: #fff;
            border-color: var(--admin-accent, #0078d4);
        }
        body { padding-top: 56px !important; }
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
    
    <div class="test-header">
        <h1>jsgui3 Controls Gallery</h1>
        <p>Interactive test page — ${sections.length} controls rendered • Admin Theme System</p>
    </div>

    <div class="test-grid">
        ${sections.join('\n')}
    </div>

    <script>
        // Activate all jsgui controls
        document.querySelectorAll('[class*="jsgui-"]').forEach(el => {
            if (el.__jsgui_control && typeof el.__jsgui_control.activate === 'function') {
                el.__jsgui_control.activate();
            }
        });

        // Manual activation for interactive controls
        // Wizard navigation
        document.querySelectorAll('.wizard-btn--next').forEach(btn => {
            btn.addEventListener('click', function() {
                const wizard = this.closest('.jsgui-wizard');
                if (!wizard) return;
                const panels = wizard.querySelectorAll('.wizard-panel');
                const dots = wizard.querySelectorAll('.wizard-step-dot');
                let current = -1;
                panels.forEach((p, i) => { if (!p.classList.contains('is-hidden')) current = i; });
                if (current < 0) current = 0;
                if (current < panels.length - 1) {
                    panels[current].classList.add('is-hidden');
                    panels[current + 1].classList.remove('is-hidden');
                    dots[current].classList.remove('is-active');
                    dots[current].classList.add('is-completed');
                    dots[current + 1].classList.add('is-active');
                    // Update prev button
                    const prevBtn = wizard.querySelector('.wizard-btn--prev');
                    if (prevBtn) prevBtn.classList.remove('is-hidden');
                    // Update next button on last step
                    if (current + 1 === panels.length - 1) {
                        this.textContent = 'Finish';
                    }
                }
            });
        });

        document.querySelectorAll('.wizard-btn--prev').forEach(btn => {
            btn.addEventListener('click', function() {
                const wizard = this.closest('.jsgui-wizard');
                if (!wizard) return;
                const panels = wizard.querySelectorAll('.wizard-panel');
                const dots = wizard.querySelectorAll('.wizard-step-dot');
                let current = -1;
                panels.forEach((p, i) => { if (!p.classList.contains('is-hidden')) current = i; });
                if (current > 0) {
                    panels[current].classList.add('is-hidden');
                    panels[current - 1].classList.remove('is-hidden');
                    dots[current].classList.remove('is-active');
                    dots[current - 1].classList.remove('is-completed');
                    dots[current - 1].classList.add('is-active');
                    if (current - 1 === 0) this.classList.add('is-hidden');
                    const nextBtn = wizard.querySelector('.wizard-btn--next');
                    if (nextBtn) nextBtn.textContent = 'Next →';
                }
            });
        });

        // Inline Cell Edit activation
        document.querySelectorAll('.ice-display').forEach(display => {
            display.addEventListener('click', function() {
                const wrap = this.closest('.inline-cell-edit');
                if (!wrap) return;
                const editor = wrap.querySelector('.ice-editor');
                const input = wrap.querySelector('.ice-input');
                this.classList.add('is-hidden');
                editor.classList.remove('is-hidden');
                wrap.classList.add('is-editing');
                if (input) { input.focus(); input.select && input.select(); }
            });
        });
        document.querySelectorAll('.ice-btn--save').forEach(btn => {
            btn.addEventListener('click', function() {
                const wrap = this.closest('.inline-cell-edit');
                const display = wrap.querySelector('.ice-display');
                const editor = wrap.querySelector('.ice-editor');
                const input = wrap.querySelector('.ice-input');
                const valueSpan = wrap.querySelector('.ice-value');
                if (valueSpan && input) valueSpan.textContent = input.value;
                display.classList.remove('is-hidden');
                editor.classList.add('is-hidden');
                wrap.classList.remove('is-editing');
            });
        });
        document.querySelectorAll('.ice-btn--cancel').forEach(btn => {
            btn.addEventListener('click', function() {
                const wrap = this.closest('.inline-cell-edit');
                const display = wrap.querySelector('.ice-display');
                const editor = wrap.querySelector('.ice-editor');
                display.classList.remove('is-hidden');
                editor.classList.add('is-hidden');
                wrap.classList.remove('is-editing');
            });
        });

        // Sidebar Nav activation
        document.querySelectorAll('.sidebar-toggle').forEach(btn => {
            btn.addEventListener('click', function() {
                const nav = this.closest('.jsgui-sidebar-nav');
                if (nav) nav.classList.toggle('is-collapsed');
            });
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.sidebar-link.is-active').forEach(l => l.classList.remove('is-active'));
                this.classList.add('is-active');
            });
        });
        document.querySelectorAll('.sidebar-chevron').forEach(chevron => {
            chevron.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const parent = this.closest('.sidebar-item');
                if (parent) parent.classList.toggle('is-expanded');
            });
        });

        // Accordion activation
        document.querySelectorAll('.jsgui-accordion .accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                const section = this.closest('.accordion-section');
                if (section) section.classList.toggle('is-open');
            });
        });

        // Chip dismiss
        document.querySelectorAll('.jsgui-chip .chip-close').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const chip = this.closest('.jsgui-chip');
                if (chip) {
                    chip.style.transition = 'opacity 0.2s, transform 0.2s';
                    chip.style.opacity = '0';
                    chip.style.transform = 'scale(0.8)';
                    setTimeout(() => chip.remove(), 200);
                }
            });
        });

        // Toast demo — show a toast on chart click
        document.querySelectorAll('.bar-chart-bar, .pie-chart-slice').forEach(el => {
            el.addEventListener('click', function() {
                const val = this.getAttribute('data-value');
                const label = this.getAttribute('data-label') || '';
                showToast(label ? label + ': ' + val : 'Value: ' + val);
            });
        });

        function showToast(msg) {
            const toast = document.createElement('div');
            toast.className = 'demo-toast';
            toast.textContent = msg;
            toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e293b;color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;z-index:9999;animation:fadeIn .3s';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        // Rating stars activation
        document.querySelectorAll('.jsgui-rating .star').forEach(star => {
            star.addEventListener('click', function() {
                const val = parseInt(this.getAttribute('data-value') || this.getAttribute('data-index'), 10);
                const container = this.closest('.jsgui-rating');
                if (!container) return;
                container.querySelectorAll('.star').forEach((s, i) => {
                    s.classList.toggle('is-filled', i < val);
                    s.textContent = i < val ? '★' : '☆';
                });
            });
        });

        // Theme switcher
        function setTheme(name) {
            document.documentElement.setAttribute('data-admin-theme', name);
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('onclick').includes("'" + name + "'"));
            });
            // Update page background for dark themes
            const isDark = name === 'vs-dark' || name === 'terminal';
            document.body.style.background = isDark ? 'var(--admin-bg)' : '';
            document.body.style.color = isDark ? 'var(--admin-text)' : '';
            document.querySelectorAll('.test-section').forEach(s => {
                s.style.background = 'var(--admin-card-bg)';
                s.style.borderColor = 'var(--admin-border)';
            });
            document.querySelectorAll('.test-section-title').forEach(t => {
                t.style.background = 'var(--admin-header-bg)';
                t.style.borderColor = 'var(--admin-border)';
                t.style.color = 'var(--admin-header-text)';
            });
            document.querySelectorAll('.test-header h1, .test-header p').forEach(el => {
                el.style.color = 'var(--admin-text)';
            });
        }
        window.setTheme = setTheme;

        // Copy button handler for Key_Value_Table
        document.querySelectorAll('.kv-copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const val = this.getAttribute('data-copy-value') || '';
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(val);
                    this.textContent = '✓';
                    setTimeout(() => { this.textContent = '⧉'; }, 1200);
                }
            });
        });

        console.log('jsgui3 test page loaded — all controls activated');
    </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(build_page());
});

server.listen(PORT, () => {
    console.log('Controls test server running at http://localhost:' + PORT);
});
