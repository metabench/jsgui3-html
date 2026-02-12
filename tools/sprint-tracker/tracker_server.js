/**
 * Sprint Tracker Server
 * 
 * HTTP server for the Sprint Tracker dashboard.
 * Renders pages using jsgui3-html SSR and provides a REST API for agents.
 * 
 * Usage:
 *   node tools/sprint-tracker/tracker_server.js
 * 
 * Environment Variables:
 *   TRACKER_PORT (default: 3700)
 */

'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

const store = require('./data/backlog_store');

// Try to load jsgui — if available, enable SSR
let jsgui;
try {
    jsgui = require('../../html-core/html-core');
} catch (e) {
    console.warn('jsgui3-html not found, SSR disabled. API-only mode.');
}

const PORT = parseInt(process.env.TRACKER_PORT || '3700');

// ── CSS for the dashboard ─────────────────────────────────

const DASHBOARD_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
        --bg-primary: #0f1117;
        --bg-secondary: #1a1d27;
        --bg-card: #1e2230;
        --bg-card-hover: #252a3a;
        --border-color: #2a2f42;
        --text-primary: #e4e7ee;
        --text-secondary: #8b93a7;
        --text-muted: #5c6478;
        --accent-blue: #4f7df9;
        --accent-green: #34d399;
        --accent-amber: #fbbf24;
        --accent-red: #f87171;
        --accent-purple: #a78bfa;
        --radius: 10px;
        --radius-sm: 6px;
        --shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
        font-family: 'Inter', -apple-system, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        line-height: 1.6;
        min-height: 100vh;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px 32px;
    }

    /* Header */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--border-color);
    }
    .header h1 {
        font-size: 24px;
        font-weight: 700;
        background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .header .subtitle {
        font-size: 13px;
        color: var(--text-muted);
        margin-top: 2px;
    }
    .header-right {
        display: flex;
        gap: 12px;
        align-items: center;
    }
    .last-updated {
        font-size: 12px;
        color: var(--text-muted);
    }

    /* Summary Cards */
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
    }
    .summary-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        padding: 20px;
        transition: transform 150ms ease, box-shadow 150ms ease;
    }
    .summary-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow);
    }
    .summary-card .label {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .summary-card .value {
        font-size: 32px;
        font-weight: 700;
        margin-top: 4px;
    }
    .summary-card .sub {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 2px;
    }
    .value-blue { color: var(--accent-blue); }
    .value-green { color: var(--accent-green); }
    .value-amber { color: var(--accent-amber); }
    .value-red { color: var(--accent-red); }
    .value-purple { color: var(--accent-purple); }

    /* Category Progress */
    .section-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--text-primary);
    }
    .category-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 32px;
    }
    .category-row {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .category-label {
        min-width: 260px;
        font-size: 13px;
        font-weight: 500;
    }
    .category-bar-wrap {
        flex: 1;
        height: 8px;
        background: rgba(255,255,255,0.06);
        border-radius: 4px;
        overflow: hidden;
    }
    .category-bar {
        height: 100%;
        border-radius: 4px;
        background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
        transition: width 500ms ease;
    }
    .category-count {
        min-width: 70px;
        text-align: right;
        font-size: 13px;
        color: var(--text-secondary);
        font-variant-numeric: tabular-nums;
    }
    .category-pct {
        min-width: 45px;
        text-align: right;
        font-size: 13px;
        font-weight: 600;
        color: var(--accent-blue);
        font-variant-numeric: tabular-nums;
    }

    /* Task Table */
    .task-table-wrap {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        overflow: hidden;
        margin-bottom: 32px;
    }
    .task-table {
        width: 100%;
        border-collapse: collapse;
    }
    .task-table th {
        text-align: left;
        padding: 12px 16px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-secondary);
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        user-select: none;
    }
    .task-table th:hover {
        color: var(--text-primary);
    }
    .task-table td {
        padding: 10px 16px;
        font-size: 13px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        vertical-align: middle;
    }
    .task-table tr:hover td {
        background: var(--bg-card-hover);
    }

    /* Status badges */
    .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    .status-done { background: rgba(52,211,153,0.15); color: var(--accent-green); }
    .status-in_progress { background: rgba(79,125,249,0.15); color: var(--accent-blue); }
    .status-planning { background: rgba(167,139,250,0.15); color: var(--accent-purple); }
    .status-testing { background: rgba(251,191,36,0.15); color: var(--accent-amber); }
    .status-not_started { background: rgba(255,255,255,0.06); color: var(--text-muted); }

    /* Priority badges */
    .priority-badge {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
    }
    .priority-P0 { background: rgba(248,113,113,0.15); color: var(--accent-red); }
    .priority-P1 { background: rgba(251,191,36,0.15); color: var(--accent-amber); }
    .priority-P2 { background: rgba(79,125,249,0.15); color: var(--accent-blue); }
    .priority-P3 { background: rgba(255,255,255,0.06); color: var(--text-muted); }

    /* Time column */
    .time-cell {
        font-variant-numeric: tabular-nums;
        font-size: 12px;
    }
    .time-good { color: var(--accent-green); }
    .time-over { color: var(--accent-red); }
    .time-none { color: var(--text-muted); }

    /* Phase bar (miniature stacked bar in table) */
    .phase-bar {
        display: flex;
        height: 6px;
        border-radius: 3px;
        overflow: hidden;
        min-width: 80px;
        background: rgba(255,255,255,0.04);
    }
    .phase-bar span {
        display: block;
        height: 100%;
    }
    .phase-planning { background: var(--accent-purple); }
    .phase-implementation { background: var(--accent-blue); }
    .phase-testing { background: var(--accent-green); }
    .phase-e2e_testing { background: var(--accent-amber); }
    .phase-bug_fixing { background: var(--accent-red); }

    /* Navigation */
    .nav-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 24px;
    }
    .nav-tab {
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        text-decoration: none;
        transition: all 150ms ease;
    }
    .nav-tab:hover { background: var(--bg-card); color: var(--text-primary); }
    .nav-tab.active { background: var(--accent-blue); color: white; }

    /* Filter bar */
    .filter-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }
    .filter-bar select {
        padding: 6px 12px;
        font-size: 13px;
        font-family: inherit;
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        cursor: pointer;
    }

    /* Phase legend */
    .phase-legend {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        font-size: 12px;
        color: var(--text-secondary);
    }
    .phase-legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .phase-legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .container { padding: 16px; }
        .summary-grid { grid-template-columns: repeat(2, 1fr); }
        .category-label { min-width: 120px; }
    }

    /* API link */
    .api-link {
        display: inline-block;
        padding: 6px 14px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        color: var(--accent-blue);
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
        transition: all 150ms ease;
    }
    .api-link:hover {
        background: var(--bg-card);
        border-color: var(--accent-blue);
    }
`;

// ── HTML Page Renderer ────────────────────────────────────

function render_dashboard_page() {
    const stats = store.get_stats();
    const tasks = store.get_tasks();

    // Summary cards
    const summary_html = `
        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Total Tasks</div>
                <div class="value value-blue">${stats.total}</div>
                <div class="sub">${stats.estimated_days_total.toFixed(1)} estimated days</div>
            </div>
            <div class="summary-card">
                <div class="label">Completed</div>
                <div class="value value-green">${stats.done}</div>
                <div class="sub">${stats.percent_done}% done</div>
            </div>
            <div class="summary-card">
                <div class="label">In Progress</div>
                <div class="value value-amber">${stats.in_progress}</div>
                <div class="sub">${stats.not_started} not started</div>
            </div>
            <div class="summary-card">
                <div class="label">Time Logged</div>
                <div class="value value-purple">${stats.total_hours}h</div>
                <div class="sub">${stats.total_minutes} minutes total</div>
            </div>
            <div class="summary-card">
                <div class="label">Remaining</div>
                <div class="value value-red">${stats.remaining_estimated_days.toFixed(1)}</div>
                <div class="sub">estimated days left</div>
            </div>
            <div class="summary-card">
                <div class="label">Accuracy</div>
                <div class="value ${stats.accuracy ? 'value-green' : 'value-blue'}">${stats.accuracy ? stats.accuracy + '%' : '—'}</div>
                <div class="sub">actual / estimated</div>
            </div>
        </div>
    `;

    // Category progress bars
    const cat_html = Object.entries(stats.categories).map(([key, cat]) => `
        <div class="category-row">
            <div class="category-label">${cat.label}</div>
            <div class="category-bar-wrap">
                <div class="category-bar" style="width: ${cat.percent}%"></div>
            </div>
            <div class="category-count">${cat.done} / ${cat.total}</div>
            <div class="category-pct">${cat.percent}%</div>
        </div>
    `).join('\n');

    // Task table (sorted by priority then status)
    const status_order = { planning: 0, in_progress: 1, testing: 2, not_started: 3, done: 4 };
    const priority_order = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const sorted_tasks = [...tasks].sort((a, b) => {
        const sa = status_order[a.status] ?? 5;
        const sb = status_order[b.status] ?? 5;
        if (sa !== sb) return sa - sb;
        const pa = priority_order[a.priority] ?? 5;
        const pb = priority_order[b.priority] ?? 5;
        return pa - pb;
    });

    const task_rows = sorted_tasks.map(t => {
        const total_mins = Object.values(t.phase_totals || {}).reduce((a, b) => a + b, 0);
        const est_mins = (t.estimated_days || 0) * 480;
        const time_class = total_mins === 0 ? 'time-none' : (total_mins <= est_mins * 1.1 ? 'time-good' : 'time-over');
        const time_display = total_mins === 0 ? '—' : `${Math.round(total_mins / 60 * 10) / 10}h`;

        // Phase bar
        const phase_total = Math.max(total_mins, 1);
        const phase_bar = Object.entries(t.phase_totals || {})
            .filter(([, v]) => v > 0)
            .map(([phase, mins]) => `<span class="phase-${phase}" style="width: ${(mins / phase_total * 100).toFixed(1)}%"></span>`)
            .join('');

        return `
            <tr>
                <td><span class="status-badge status-${t.status}">${t.status.replace(/_/g, ' ')}</span></td>
                <td><span class="priority-badge priority-${t.priority}">${t.priority}</span></td>
                <td>${escHtml(t.title)}</td>
                <td style="font-size:12px; color:var(--text-secondary)">${escHtml(t.category)}</td>
                <td style="font-size:12px; color:var(--text-secondary)">${t.control || '—'}</td>
                <td class="time-cell">${t.estimated_days}d</td>
                <td class="time-cell ${time_class}">${time_display}</td>
                <td><div class="phase-bar">${phase_bar}</div></td>
            </tr>
        `;
    }).join('\n');

    const data = store.load();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sprint Tracker — jsgui3-html</title>
    <style>${DASHBOARD_CSS}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>⚡ jsgui3 Sprint Tracker</h1>
                <div class="subtitle">Control Suite — Visual Advancement Progress</div>
            </div>
            <div class="header-right">
                <a href="/api/stats" class="api-link">📊 API</a>
                <a href="/api/tasks" class="api-link">📋 Tasks JSON</a>
                <div class="last-updated">Updated: ${new Date(data.meta.last_updated).toLocaleString()}</div>
            </div>
        </div>

        ${summary_html}

        <div class="section-title">📂 Progress by Category</div>
        <div class="category-list">
            ${cat_html}
        </div>

        <div class="section-title">📋 All Tasks</div>
        <div class="phase-legend">
            <div class="phase-legend-item"><span class="phase-legend-dot" style="background:var(--accent-purple)"></span> Planning</div>
            <div class="phase-legend-item"><span class="phase-legend-dot" style="background:var(--accent-blue)"></span> Implementation</div>
            <div class="phase-legend-item"><span class="phase-legend-dot" style="background:var(--accent-green)"></span> Testing</div>
            <div class="phase-legend-item"><span class="phase-legend-dot" style="background:var(--accent-amber)"></span> E2E Testing</div>
            <div class="phase-legend-item"><span class="phase-legend-dot" style="background:var(--accent-red)"></span> Bug Fixing</div>
        </div>
        <div class="task-table-wrap">
            <table class="task-table">
                <thead>
                    <tr>
                        <th style="width:110px">Status</th>
                        <th style="width:50px">Pri</th>
                        <th>Task</th>
                        <th style="width:120px">Category</th>
                        <th style="width:110px">Control</th>
                        <th style="width:60px">Est.</th>
                        <th style="width:70px">Actual</th>
                        <th style="width:100px">Phases</th>
                    </tr>
                </thead>
                <tbody>
                    ${task_rows}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>`;
}

function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── API Helpers ────────────────────────────────────────────

function read_json_body(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

function json_response(res, data, status = 200) {
    const body = JSON.stringify(data, null, 2);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(body);
}

function html_response(res, html, status = 200) {
    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

function error_response(res, message, status = 400) {
    json_response(res, { error: message }, status);
}

// ── Request Handler ────────────────────────────────────────

async function handle_request(req, res) {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    const method = req.method;

    // CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        return res.end();
    }

    try {
        // ── HTML Pages ──
        if (method === 'GET' && (pathname === '/' || pathname === '/dashboard')) {
            return html_response(res, render_dashboard_page());
        }

        // ── API Routes ──

        // GET /api/stats
        if (method === 'GET' && pathname === '/api/stats') {
            return json_response(res, store.get_stats());
        }

        // GET /api/tasks
        if (method === 'GET' && pathname === '/api/tasks') {
            const filters = {};
            if (parsed.query.status) filters.status = parsed.query.status;
            if (parsed.query.category) filters.category = parsed.query.category;
            if (parsed.query.priority) filters.priority = parsed.query.priority;
            if (parsed.query.control) filters.control = parsed.query.control;
            if (parsed.query.tag) filters.tag = parsed.query.tag;
            return json_response(res, store.get_tasks(filters));
        }

        // GET /api/tasks/:id
        const task_match = pathname.match(/^\/api\/tasks\/([^/]+)$/);
        if (method === 'GET' && task_match) {
            const task = store.get_task(task_match[1]);
            if (!task) return error_response(res, 'Task not found', 404);
            return json_response(res, task);
        }

        // PATCH /api/tasks/:id
        if (method === 'PATCH' && task_match) {
            const patch = await read_json_body(req);
            const task = store.update_task(task_match[1], patch);
            return json_response(res, task);
        }

        // POST /api/tasks/:id/log
        const log_match = pathname.match(/^\/api\/tasks\/([^/]+)\/log$/);
        if (method === 'POST' && log_match) {
            const entry = await read_json_body(req);
            const task = store.log_time(log_match[1], entry);
            return json_response(res, task);
        }

        // POST /api/tasks (create new task)
        if (method === 'POST' && pathname === '/api/tasks') {
            const data = await read_json_body(req);
            const task = store.add_task(data);
            return json_response(res, task, 201);
        }

        // DELETE /api/tasks/:id
        const del_match = pathname.match(/^\/api\/tasks\/([^/]+)$/);
        if (method === 'DELETE' && del_match) {
            const deleted = store.delete_task(del_match[1]);
            if (!deleted) return error_response(res, 'Task not found', 404);
            return json_response(res, { deleted: true });
        }

        // GET /api/export/csv
        if (method === 'GET' && pathname === '/api/export/csv') {
            const tasks = store.get_tasks();
            const header = 'id,title,category,chapter,control,priority,status,estimated_days,actual_minutes,completed_at\n';
            const rows = tasks.map(t => {
                const actual = Object.values(t.phase_totals || {}).reduce((a, b) => a + b, 0);
                return [t.id, `"${t.title}"`, t.category, t.chapter, t.control || '', t.priority, t.status, t.estimated_days, actual, t.completed_at || ''].join(',');
            }).join('\n');
            res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="sprint-backlog.csv"'
            });
            return res.end(header + rows);
        }

        // 404
        error_response(res, 'Not found', 404);
    } catch (err) {
        console.error('Request error:', err);
        error_response(res, err.message, 500);
    }
}

// ── Start Server ──────────────────────────────────────────

const server = http.createServer(handle_request);
server.listen(PORT, () => {
    console.log(`\n  ⚡ Sprint Tracker Server`);
    console.log(`  ────────────────────────`);
    console.log(`  Dashboard:  http://localhost:${PORT}/`);
    console.log(`  API Stats:  http://localhost:${PORT}/api/stats`);
    console.log(`  API Tasks:  http://localhost:${PORT}/api/tasks`);
    console.log(`  Export CSV: http://localhost:${PORT}/api/export/csv`);
    console.log('');
});
