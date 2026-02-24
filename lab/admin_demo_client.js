/**
 * Admin Controls Demo — Interactive Showcase
 * 
 * Demonstrates all 9 upgraded admin UI controls with data binding,
 * using the jsgui3-server SSR + hydration pattern.
 * 
 * Controls: Data_Table, Sidebar_Nav, Breadcrumbs, Tabbed_Panel,
 *           Master_Detail, Toast, Modal, Toolbar, Form_Container
 * 
 * Run: node lab/admin_demo_server.js
 */

const jsgui = require('../html');
const { Control } = jsgui;
const Active_HTML_Document = jsgui.controls.Active_HTML_Document || jsgui.Active_HTML_Document;

// ── Direct requires for admin controls ──
const Data_Table = require('../controls/organised/1-standard/4-data/Data_Table');
const Sidebar_Nav = require('../controls/organised/1-standard/6-layout/Sidebar_Nav');
const Breadcrumbs = require('../controls/organised/1-standard/5-ui/Breadcrumbs');
const Tabbed_Panel = require('../controls/organised/1-standard/6-layout/Tabbed_Panel');
const Master_Detail = require('../controls/organised/1-standard/6-layout/Master_Detail');
const Toast = require('../controls/organised/1-standard/5-ui/Toast');
const Modal = require('../controls/organised/1-standard/6-layout/Modal');
const Toolbar = require('../controls/organised/1-standard/5-ui/Toolbar');
const Form_Container = require('../controls/organised/1-standard/1-editor/Form_Container');

// ── Sample employee data ──
const EMPLOYEES = [
    { id: 1, name: 'Alice Chen', role: 'Engineer', dept: 'Platform', salary: 125000, status: 'active' },
    { id: 2, name: 'Bob Martinez', role: 'Designer', dept: 'Product', salary: 105000, status: 'active' },
    { id: 3, name: 'Charlie Kim', role: 'Manager', dept: 'Platform', salary: 145000, status: 'active' },
    { id: 4, name: 'Diana Patel', role: 'Engineer', dept: 'Data', salary: 130000, status: 'on-leave' },
    { id: 5, name: 'Eve Johnson', role: 'Analyst', dept: 'Data', salary: 95000, status: 'active' },
    { id: 6, name: 'Frank Lee', role: 'Engineer', dept: 'Platform', salary: 120000, status: 'active' },
    { id: 7, name: 'Grace Williams', role: 'Designer', dept: 'Product', salary: 110000, status: 'on-leave' },
    { id: 8, name: 'Henry Davis', role: 'Manager', dept: 'Product', salary: 150000, status: 'active' }
];

const COLUMNS = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'dept', label: 'Department', sortable: true },
    { key: 'salary', label: 'Salary', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
];

const NAV_ITEMS = [
    { id: 'all', label: 'All Employees', icon: '👥' },
    {
        id: 'departments', label: 'By Department', icon: '🏢', children: [
            { id: 'dept-platform', label: 'Platform' },
            { id: 'dept-product', label: 'Product' },
            { id: 'dept-data', label: 'Data' }
        ]
    },
    {
        id: 'status', label: 'By Status', icon: '📊', children: [
            { id: 'status-active', label: 'Active' },
            { id: 'status-on-leave', label: 'On Leave' }
        ]
    }
];


class Admin_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'admin_demo';
        super(spec);
        this.__type_name = 'admin_demo';

        if (!spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        const body = this.body || this;

        // ── STYLE ──
        const style = new Control({ context, tag_name: 'style' });
        style.add(Admin_Demo.css);
        if (this.head) {
            this.head.add(style);
        }

        // Google Fonts link
        if (this.head) {
            const font_link = new Control({ context, tag_name: 'link' });
            font_link.dom.attributes.rel = 'stylesheet';
            font_link.dom.attributes.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
            this.head.add(font_link);
        }

        // ── SHELL ──
        const shell = new Control({ context, tag_name: 'div' });
        shell.add_class('demo-shell');

        // ── HEADER ──
        shell.add(this._build_header(context));

        // ── APP: sidebar + main ──
        const app = new Control({ context, tag_name: 'div' });
        app.add_class('demo-app');

        // ─── SIDEBAR ───
        app.add(this._build_sidebar(context));

        // ─── MAIN CONTENT ───
        const main = new Control({ context, tag_name: 'main' });
        main.add_class('demo-main');

        // Breadcrumbs
        const breadcrumbs = new Breadcrumbs({
            context,
            items: [
                { label: 'Home', href: '#' },
                { label: 'Employees', href: '#' },
                { label: 'All', current: true }
            ]
        });
        breadcrumbs.dom.attributes.id = 'demo-breadcrumbs';
        main.add(breadcrumbs);

        // Toolbar
        const toolbar = new Toolbar({
            context,
            items: [
                { id: 'add', label: 'Add Employee', icon: '➕' },
                { id: 'refresh', label: 'Refresh', icon: '🔄' },
                { type: 'separator' },
                { id: 'density-comfortable', label: 'Comfortable', icon: '📏', toggle: true, pressed: true, group: 'density' },
                { id: 'density-compact', label: 'Compact', icon: '📐', toggle: true, group: 'density' },
                { id: 'density-dense', label: 'Dense', icon: '🔬', toggle: true, group: 'density' },
                { type: 'separator' },
                { id: 'modal-test', label: 'Modal', icon: '🪟' }
            ],
            aria_label: 'Employee toolbar'
        });
        toolbar.dom.attributes.id = 'demo-toolbar';
        main.add(toolbar);

        // ── Tab 1 content: Data Table ──
        const data_table = new Data_Table({
            context,
            columns: COLUMNS,
            rows: EMPLOYEES,
            density: 'comfortable',
            page_size: 10,
            aria_label: 'Employee directory'
        });
        data_table.dom.attributes.id = 'demo-data-table';

        // ── Tab 2 content: Master Detail ──
        const master_detail = new Master_Detail({
            context,
            items: EMPLOYEES.map(e => ({ id: String(e.id), label: e.name, detail: `${e.role} — ${e.dept}` })),
            selected_id: '1',
            aria_label: 'Employee details'
        });
        master_detail.dom.attributes.id = 'demo-master-detail';

        // ── Tab 3 content: Form ──
        const form = new Form_Container({
            context,
            fields: [
                { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Smith' },
                { name: 'role', label: 'Role', type: 'text', required: true, placeholder: 'Engineer' },
                { name: 'dept', label: 'Department', type: 'select', options: ['Platform', 'Product', 'Data'], required: true },
                { name: 'salary', label: 'Salary', type: 'number', required: true, placeholder: '100000' }
            ],
            submit_label: 'Add Employee',
            aria_label: 'New employee form'
        });
        form.dom.attributes.id = 'demo-form';

        // ── Tabbed Panel — content passed inline ──
        const tabbed = new Tabbed_Panel({
            context,
            tabs: [
                { title: 'Table View', icon: '📋', content: data_table },
                { title: 'Detail View', icon: '👤', content: master_detail },
                { title: 'Add Employee', icon: '✏️', content: form }
            ],
            aria_label: 'Employee views'
        });
        tabbed.dom.attributes.id = 'demo-tabs';
        main.add(tabbed);

        // ── Toast container (for JS-created toasts) ──
        const toast_container = new Control({ context, tag_name: 'div' });
        toast_container.add_class('demo-toast-container');
        toast_container.dom.attributes.id = 'demo-toast-container';
        main.add(toast_container);

        // ── Modal (hidden until opened) ──
        const modal = new Modal({
            context,
            title: 'Confirm Action',
            content: 'Are you sure you want to proceed with this action?',
            buttons: [
                { id: 'cancel', label: 'Cancel', variant: 'ghost' },
                { id: 'confirm', label: 'Confirm', variant: 'primary' }
            ]
        });
        modal.dom.attributes.id = 'demo-modal';
        main.add(modal);

        app.add(main);
        shell.add(app);

        // ── STATUS BAR ──
        const status = new Control({ context, tag_name: 'div' });
        status.add_class('demo-status-bar');
        status.dom.attributes.id = 'demo-status';
        status.add(`${EMPLOYEES.length} employees loaded • All departments`);
        shell.add(status);

        body.add(shell);
    }

    _build_header(context) {
        const header = new Control({ context, tag_name: 'header' });
        header.add_class('demo-header');

        const logo = new Control({ context, tag_name: 'div' });
        logo.add_class('demo-logo');
        logo.add('⚡');

        const block = new Control({ context, tag_name: 'div' });

        const title = new Control({ context, tag_name: 'h1' });
        title.add_class('demo-title');
        title.add('Admin Controls Demo');

        const sub = new Control({ context, tag_name: 'div' });
        sub.add_class('demo-subtitle');
        sub.add('9 upgraded controls • ARIA grid • Data binding • Theme tokens');

        block.add(title);
        block.add(sub);
        header.add(logo);
        header.add(block);
        return header;
    }

    _build_sidebar(context) {
        const sidebar = new Control({ context, tag_name: 'aside' });
        sidebar.add_class('demo-sidebar');

        const label = new Control({ context, tag_name: 'div' });
        label.add_class('sidebar-title');
        label.add('EMPLOYEE DIRECTORY');
        sidebar.add(label);

        const nav = new Sidebar_Nav({
            context,
            items: NAV_ITEMS,
            active_id: 'all',
            aria_label: 'Employee navigation'
        });
        nav.dom.attributes.id = 'demo-nav';
        sidebar.add(nav);

        return sidebar;
    }

    activate() {
        if (this.__active) return;
        super.activate();

        console.log('⚡ Admin_Demo activate()');

        // ── DOM elements ──
        const nav_el = document.getElementById('demo-nav');
        const breadcrumbs_el = document.getElementById('demo-breadcrumbs');
        const toolbar_el = document.getElementById('demo-toolbar');
        const table_el = document.getElementById('demo-data-table');
        const status_el = document.getElementById('demo-status');
        const toast_container = document.getElementById('demo-toast-container');
        const modal_el = document.getElementById('demo-modal');

        let current_filter = 'All';

        // ── Toast helper ──
        const show_toast = (message, type = 'info') => {
            if (!toast_container) return;
            const el = document.createElement('div');
            el.className = `demo-toast demo-toast-${type}`;
            el.setAttribute('role', 'status');
            el.setAttribute('aria-live', 'polite');
            el.textContent = message;
            toast_container.appendChild(el);

            setTimeout(() => {
                el.classList.add('demo-toast-exit');
                setTimeout(() => el.remove(), 300);
            }, 3000);
        };

        // ── Status bar ──
        const update_status = (count, filter) => {
            if (status_el) {
                status_el.textContent = `${count} employees shown • Filter: ${filter}`;
            }
        };

        // ── Sidebar nav filtering ──
        if (nav_el) {
            nav_el.addEventListener('click', e => {
                const item = e.target.closest('[data-nav-id]');
                if (!item) return;
                const id = item.getAttribute('data-nav-id');

                // Highlight active
                nav_el.querySelectorAll('[data-nav-id]').forEach(n => n.classList.remove('is-active'));
                item.classList.add('is-active');

                let filtered = EMPLOYEES;
                let label = 'All';

                if (id.startsWith('dept-')) {
                    const dept = id.replace('dept-', '');
                    filtered = EMPLOYEES.filter(e => e.dept.toLowerCase() === dept);
                    label = dept.charAt(0).toUpperCase() + dept.slice(1);
                } else if (id.startsWith('status-')) {
                    const s = id.replace('status-', '');
                    filtered = EMPLOYEES.filter(e => e.status === s);
                    label = s;
                }

                current_filter = label;

                // Re-render table body
                if (table_el) {
                    const tbody = table_el.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = filtered.map((row, i) =>
                            `<tr class="data-table-row" data-row-index="${i}" role="row" aria-rowindex="${i + 2}">` +
                            COLUMNS.map((col, ci) =>
                                `<td role="gridcell" aria-colindex="${ci + 1}">${row[col.key]}</td>`
                            ).join('') + '</tr>'
                        ).join('');
                    }
                }

                // Update breadcrumbs
                if (breadcrumbs_el) {
                    const items = breadcrumbs_el.querySelectorAll('.breadcrumb-item');
                    const last = items[items.length - 1];
                    if (last) last.textContent = label;
                }

                show_toast(`Filtered: ${label} (${filtered.length} results)`, 'info');
                update_status(filtered.length, label);
            });
        }

        // ── Toolbar actions ──
        if (toolbar_el) {
            toolbar_el.addEventListener('click', e => {
                const btn = e.target.closest('[data-item-id]');
                if (!btn) return;
                const action = btn.getAttribute('data-item-id');

                if (action === 'add') {
                    // Activate "Add Employee" tab (index 2)
                    const tab_labels = document.querySelectorAll('#demo-tabs .tab-label');
                    if (tab_labels[2]) tab_labels[2].click();
                    show_toast('Switched to Add Employee form', 'info');
                }

                if (action === 'refresh') {
                    current_filter = 'All';
                    if (table_el) {
                        const tbody = table_el.querySelector('tbody');
                        if (tbody) {
                            tbody.innerHTML = EMPLOYEES.map((row, i) =>
                                `<tr class="data-table-row" data-row-index="${i}" role="row" aria-rowindex="${i + 2}">` +
                                COLUMNS.map((col, ci) =>
                                    `<td role="gridcell" aria-colindex="${ci + 1}">${row[col.key]}</td>`
                                ).join('') + '</tr>'
                            ).join('');
                        }
                    }
                    show_toast('Data refreshed — all employees', 'success');
                    update_status(EMPLOYEES.length, 'All');
                }

                if (action && action.startsWith('density-')) {
                    const density = action.replace('density-', '');
                    if (table_el) table_el.setAttribute('data-density', density);
                    show_toast(`Table density: ${density}`, 'info');
                }

                if (action === 'modal-test') {
                    if (modal_el) {
                        modal_el.classList.add('is-open');
                        modal_el.setAttribute('aria-hidden', 'false');
                    }
                }
            });
        }

        // ── Data Table row click ──
        if (table_el) {
            table_el.addEventListener('click', e => {
                const row = e.target.closest('tr[data-row-index]');
                if (!row) return;

                // highlight
                table_el.querySelectorAll('.data-table-row').forEach(r => r.classList.remove('is-selected'));
                row.classList.add('is-selected');

                const idx = parseInt(row.getAttribute('data-row-index'));
                const emp = EMPLOYEES[idx];
                if (emp) {
                    show_toast(`Selected: ${emp.name} (${emp.role})`, 'info');
                }
            });
        }

        // ── Modal ──
        if (modal_el) {
            modal_el.addEventListener('click', e => {
                const btn = e.target.closest('[data-button-id]');
                if (btn) {
                    const action = btn.getAttribute('data-button-id');
                    modal_el.classList.remove('is-open');
                    modal_el.setAttribute('aria-hidden', 'true');
                    show_toast(
                        action === 'confirm' ? 'Action confirmed ✓' : 'Action cancelled',
                        action === 'confirm' ? 'success' : 'info'
                    );
                }
                // Close on overlay click
                if (e.target.classList.contains('modal-overlay')) {
                    modal_el.classList.remove('is-open');
                    modal_el.setAttribute('aria-hidden', 'true');
                }
            });
        }

        // ── Form submit ──
        const form_el = document.getElementById('demo-form');
        if (form_el) {
            const form_tag = form_el.querySelector('form') || form_el;
            form_tag.addEventListener('submit', e => {
                e.preventDefault();
                show_toast('Employee added successfully!', 'success');

                // Switch to table tab
                const tab_labels = document.querySelectorAll('#demo-tabs .tab-label');
                if (tab_labels[0]) {
                    setTimeout(() => tab_labels[0].click(), 500);
                }
            });
        }

        // ── Initial toast ──
        show_toast('Admin demo loaded — try the sidebar navigation!', 'success');
        console.log('✅ Admin_Demo fully activated');
    }
}

// ── CSS ──
Admin_Demo.css = [
    Data_Table.css || '',
    Sidebar_Nav.css || '',
    Breadcrumbs.css || '',
    Tabbed_Panel.css || '',
    Master_Detail.css || '',
    Toast.css || '',
    Modal.css || '',
    Toolbar.css || '',
    Form_Container.css || '',
    `
/* ═══════ Demo Layout ═══════ */
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
    --demo-bg: #0c0c1d;
    --demo-surface: rgba(255,255,255,0.03);
    --demo-border: rgba(255,255,255,0.06);
    --demo-accent: #6366f1;
    --demo-text: #e2e8f0;
    --demo-muted: #64748b;
}

body {
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: var(--demo-bg);
    color: var(--demo-text);
    min-height: 100vh;
    line-height: 1.5;
}

.demo-shell { display: flex; flex-direction: column; min-height: 100vh; }

/* ── Header ── */
.demo-header {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #1a1a3e 0%, #0f1629 100%);
    border-bottom: 1px solid var(--demo-border);
}
.demo-logo {
    font-size: 24px; width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(99,102,241,0.3);
}
.demo-title {
    font-size: 20px; font-weight: 700;
    background: linear-gradient(135deg, #c7d2fe, #e0e7ff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
}
.demo-subtitle { font-size: 12px; color: var(--demo-muted); margin-top: 2px; letter-spacing: 0.3px; }

/* ── App grid ── */
.demo-app { display: flex; flex: 1; overflow: hidden; }

/* ── Sidebar ── */
.demo-sidebar {
    width: 240px; flex-shrink: 0;
    background: #12122a; border-right: 1px solid var(--demo-border);
    padding: 16px 0; overflow-y: auto;
}
.sidebar-title {
    padding: 8px 20px 16px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1.5px; color: var(--demo-muted);
}

/* ── Main ── */
.demo-main {
    flex: 1; padding: 20px 24px; overflow-y: auto;
    display: flex; flex-direction: column; gap: 16px;
}

/* ── Status bar ── */
.demo-status-bar {
    padding: 8px 24px; font-size: 12px; color: var(--demo-muted);
    background: #0a0a1a; border-top: 1px solid var(--demo-border);
}

/* ── Control dark overrides ── */
.jsgui-sidebar-nav { background: transparent; }
.jsgui-breadcrumbs { padding: 0; }
.jsgui-toolbar {
    background: var(--demo-surface); border: 1px solid var(--demo-border);
    border-radius: 10px; padding: 6px 12px;
}
.tab-container {
    background: var(--demo-surface); border: 1px solid var(--demo-border);
    border-radius: 12px; overflow: hidden;
}
.tab-page { padding: 16px; }
.jsgui-data-table { background: var(--demo-surface); border-radius: 8px; overflow: hidden; }
.jsgui-data-table th { color: var(--demo-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
.jsgui-data-table td { padding: 10px 12px; border-bottom: 1px solid var(--demo-border); }
.jsgui-data-table tr:hover td { background: rgba(99,102,241,0.06); }
.data-table-row.is-selected td { background: rgba(99,102,241,0.12); }
.jsgui-master-detail { border: 1px solid var(--demo-border); border-radius: 8px; min-height: 280px; }
.jsgui-form-container { padding: 16px; background: var(--demo-surface); border: 1px solid var(--demo-border); border-radius: 8px; }
.jsgui-modal { display: none; }
.jsgui-modal.is-open { display: flex; position: fixed; inset: 0; z-index: 2000; align-items: center; justify-content: center; }
.jsgui-modal.is-open .modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
.jsgui-modal.is-open .modal-dialog { position: relative; z-index: 1; background: #1e1e3a; border: 1px solid var(--demo-border); border-radius: 12px; padding: 24px; min-width: 400px; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }

/* ── Toasts ── */
.demo-toast-container {
    position: fixed; bottom: 48px; right: 24px;
    display: flex; flex-direction: column-reverse; gap: 8px;
    z-index: 3000; pointer-events: none;
}
.demo-toast {
    padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 500;
    backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    animation: toast-in 0.3s ease; pointer-events: auto; max-width: 360px;
}
.demo-toast-info { background: rgba(99,102,241,0.9); color: #fff; }
.demo-toast-success { background: rgba(34,197,94,0.9); color: #fff; }
.demo-toast-exit { animation: toast-out 0.3s ease forwards; }

@keyframes toast-in { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes toast-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px) scale(0.95); } }
`
].join('\n');

// Register for hydration
jsgui.controls = jsgui.controls || {};
jsgui.controls.Admin_Demo = Admin_Demo;

module.exports = jsgui;
