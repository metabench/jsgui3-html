/**
 * Admin Controls Demo — Standalone Premium UI
 *
 * Generates a fully styled, self-contained HTML page showcasing all 9
 * upgraded admin controls. Bypasses jsgui3-server to avoid bundling
 * issues — the page is pure SSR HTML + inline CSS/JS.
 *
 * Usage:
 *   node lab/admin_demo_standalone.js          → writes lab/admin_demo.html
 *   node lab/admin_demo_standalone.js --serve   → serves on http://localhost:4600
 */

const fs = require('fs');
const path = require('path');
const jsgui = require('../html-core/html-core');
const { Control } = jsgui;

const Data_Table = require('../controls/organised/1-standard/4-data/Data_Table');
const Sidebar_Nav = require('../controls/organised/1-standard/6-layout/Sidebar_Nav');
const Breadcrumbs = require('../controls/organised/1-standard/5-ui/Breadcrumbs');
const Tabbed_Panel = require('../controls/organised/1-standard/6-layout/Tabbed_Panel');
const Master_Detail = require('../controls/organised/1-standard/6-layout/Master_Detail');
const Toast = require('../controls/organised/1-standard/5-ui/Toast');
const Modal = require('../controls/organised/1-standard/6-layout/Modal');
const Toolbar = require('../controls/organised/1-standard/5-ui/Toolbar');
const Form_Container = require('../controls/organised/1-standard/1-editor/Form_Container');

/* ═══════════════════════════════════════════════════════
 *  SAMPLE DATA
 * ═══════════════════════════════════════════════════════ */
const EMPLOYEES = [
  { id: 1, name: 'Alice Chen', role: 'Senior Engineer', dept: 'Platform', salary: 125000, status: 'active', avatar: 'AC' },
  { id: 2, name: 'Bob Martinez', role: 'Lead Designer', dept: 'Product', salary: 105000, status: 'active', avatar: 'BM' },
  { id: 3, name: 'Charlie Kim', role: 'Engineering Manager', dept: 'Platform', salary: 145000, status: 'active', avatar: 'CK' },
  { id: 4, name: 'Diana Patel', role: 'Staff Engineer', dept: 'Data', salary: 130000, status: 'on-leave', avatar: 'DP' },
  { id: 5, name: 'Eve Johnson', role: 'Data Analyst', dept: 'Data', salary: 95000, status: 'active', avatar: 'EJ' },
  { id: 6, name: 'Frank Lee', role: 'Backend Engineer', dept: 'Platform', salary: 120000, status: 'active', avatar: 'FL' },
  { id: 7, name: 'Grace Williams', role: 'UX Designer', dept: 'Product', salary: 110000, status: 'on-leave', avatar: 'GW' },
  { id: 8, name: 'Henry Davis', role: 'Product Manager', dept: 'Product', salary: 150000, status: 'active', avatar: 'HD' }
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

/* ═══════════════════════════════════════════════════════
 *  BUILD HTML
 * ═══════════════════════════════════════════════════════ */
function build_demo_html() {
  const context = new jsgui.Page_Context();

  // ── Controls ──
  const data_table = new Data_Table({ context, columns: COLUMNS, rows: EMPLOYEES, density: 'comfortable', page_size: 10, aria_label: 'Employee directory' });
  const sidebar_nav = new Sidebar_Nav({ context, items: NAV_ITEMS, active_id: 'all', aria_label: 'Employee navigation' });
  const breadcrumbs = new Breadcrumbs({ context, items: [{ label: 'Home', href: '#' }, { label: 'Employees', href: '#' }, { label: 'All', current: true }] });
  const tabbed_panel = new Tabbed_Panel({
    context,
    tabs: [
      { title: 'Table View', icon: '📋', content: data_table },
      { title: 'Detail View', icon: '👤', content: new Master_Detail({ context, items: EMPLOYEES.map(e => ({ id: String(e.id), label: e.name, detail: `${e.role} — ${e.dept}` })), selected_id: '1' }) },
      { title: 'Add Employee', icon: '✏️', content: new Form_Container({ context, fields: [{ name: 'name', label: 'Full Name', type: 'text', required: true }, { name: 'role', label: 'Role', type: 'text', required: true }, { name: 'dept', label: 'Department', type: 'select', options: ['Platform', 'Product', 'Data'], required: true }, { name: 'salary', label: 'Salary', type: 'number', required: true }], submit_label: 'Add Employee' }) }
    ],
    aria_label: 'Employee views'
  });
  const toolbar = new Toolbar({
    context,
    items: [
      { id: 'add', label: 'Add', icon: '➕' },
      { id: 'refresh', label: 'Refresh', icon: '🔄' },
      { type: 'separator' },
      { id: 'density-comfortable', label: 'Comfortable', toggle: true, pressed: true, group: 'density' },
      { id: 'density-compact', label: 'Compact', toggle: true, group: 'density' },
      { type: 'separator' },
      { id: 'modal-test', label: 'Modal', icon: '🪟' }
    ],
    aria_label: 'Employee toolbar'
  });
  const modal = new Modal({ context, title: 'Confirm Action', content: 'Are you sure you want to proceed?', buttons: [{ id: 'cancel', label: 'Cancel', variant: 'ghost' }, { id: 'confirm', label: 'Confirm', variant: 'primary' }] });

  // Aggregate control CSS
  const control_css = [Data_Table.css, Sidebar_Nav.css, Breadcrumbs.css, Tabbed_Panel.css, Master_Detail.css, Toast.css, Modal.css, Toolbar.css, Form_Container.css].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin Controls Demo — jsgui3</title>
  <meta name="description" content="Interactive demo of 9 upgraded jsgui3 admin controls with ARIA, data binding, and dark theme" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    ${control_css}
    ${DEMO_CSS}
  </style>
</head>
<body>
  <div class="demo-shell">
    <!-- ═══ HEADER ═══ -->
    <header class="demo-header">
      <div class="demo-header-inner">
        <div class="demo-logo">
          <div class="demo-logo-icon">⚡</div>
          <div class="demo-logo-text">
            <h1 class="demo-title">Admin Controls</h1>
            <p class="demo-subtitle">9 Upgraded Components • Dark Theme • ARIA Accessible</p>
          </div>
        </div>
        <div class="demo-header-actions">
          <div class="demo-chip" id="employee-count">${EMPLOYEES.length} Employees</div>
          <button class="demo-header-btn" id="btn-theme" type="button" aria-label="Toggle compact mode">◑</button>
        </div>
      </div>
    </header>

    <!-- ═══ APP BODY ═══ -->
    <div class="demo-app">
      <!-- ─── SIDEBAR ─── -->
      <aside class="demo-sidebar" id="sidebar">
        <div class="sidebar-section-title">NAVIGATION</div>
        <nav class="jsgui-sidebar-nav" id="sidebar-nav" role="navigation" aria-label="Employee navigation">
          <a class="sidebar-link is-active" data-nav-id="all" href="#" aria-current="page"><span class="sidebar-icon">👥</span> All Employees</a>
          <div class="sidebar-group" data-group="departments">
            <div class="sidebar-group-label"><span>🏢 By Department</span><span class="group-chevron">▸</span></div>
            <div class="sidebar-group-children">
              <a class="sidebar-link" data-nav-id="dept-platform" href="#">Platform</a>
              <a class="sidebar-link" data-nav-id="dept-product" href="#">Product</a>
              <a class="sidebar-link" data-nav-id="dept-data" href="#">Data</a>
            </div>
          </div>
          <div class="sidebar-group" data-group="status">
            <div class="sidebar-group-label"><span>📊 By Status</span><span class="group-chevron">▸</span></div>
            <div class="sidebar-group-children">
              <a class="sidebar-link" data-nav-id="status-active" href="#">Active</a>
              <a class="sidebar-link" data-nav-id="status-on-leave" href="#">On Leave</a>
            </div>
          </div>
        </nav>
        <div class="sidebar-stats">
          <div class="sidebar-stat"><span class="stat-value">${EMPLOYEES.filter(e => e.status === 'active').length}</span><span class="stat-label">Active</span></div>
          <div class="sidebar-stat"><span class="stat-value">${EMPLOYEES.filter(e => e.status === 'on-leave').length}</span><span class="stat-label">On Leave</span></div>
          <div class="sidebar-stat"><span class="stat-value">${new Set(EMPLOYEES.map(e => e.dept)).size}</span><span class="stat-label">Depts</span></div>
        </div>
      </aside>

      <!-- ─── MAIN CONTENT ─── -->
      <main class="demo-main">
        <!-- Breadcrumbs -->
        <div class="demo-breadcrumbs-row" id="demo-breadcrumbs">${breadcrumbs.html}</div>

        <!-- Toolbar -->
        <div class="demo-toolbar-row" id="demo-toolbar">${toolbar.html}</div>

        <!-- Tabbed content -->
        <div class="demo-content-area" id="demo-tabs">${tabbed_panel.html}</div>
      </main>
    </div>

    <!-- ═══ STATUS BAR ═══ -->
    <footer class="demo-footer" id="demo-status">
      <div class="demo-footer-left">
        <span class="status-dot status-dot--live"></span>
        <span id="status-text">${EMPLOYEES.length} employees loaded • All departments</span>
      </div>
      <div class="demo-footer-right">jsgui3-html • Admin Controls Demo</div>
    </footer>
  </div>

  <!-- Modal overlay (hidden) -->
  <div id="demo-modal">${modal.html}</div>

  <!-- Toast container -->
  <div class="demo-toast-container" id="demo-toast-container" aria-live="polite"></div>

  <!-- ═══ INLINE ACTIVATION ═══ -->
  <script>
  (function() {
    'use strict';

    const EMPLOYEES = ${JSON.stringify(EMPLOYEES)};
    const COLUMNS = ${JSON.stringify(COLUMNS)};

    /* ── Utility ── */
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));

    /* ── Toast ── */
    const toast_container = $('#demo-toast-container');
    function toast(msg, type) {
      type = type || 'info';
      const el = document.createElement('div');
      el.className = 'demo-toast demo-toast--' + type;
      el.setAttribute('role', 'status');
      el.innerHTML = '<span class="toast-icon">' + (type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ') + '</span><span class="toast-text">' + msg + '</span>';
      toast_container.appendChild(el);
      requestAnimationFrame(() => el.classList.add('demo-toast--enter'));
      setTimeout(() => {
        el.classList.add('demo-toast--exit');
        el.addEventListener('transitionend', () => el.remove());
      }, 3500);
    }

    /* ── Status bar ── */
    function set_status(text) {
      const el = $('#status-text');
      if (el) el.textContent = text;
    }

    /* ── Sidebar nav ── */
    const nav = $('.jsgui-sidebar-nav');
    if (nav) {
      // Expand/collapse groups
      $$('.sidebar-group-label').forEach(function(label) {
        label.addEventListener('click', function() {
          var group = label.closest('.sidebar-group');
          if (group) group.classList.toggle('is-expanded');
        });
      });

      nav.addEventListener('click', function(e) {
        const link = e.target.closest('.sidebar-link[data-nav-id]');
        if (!link) return;
        e.preventDefault();

        // Update active state
        $$('.sidebar-link').forEach(l => { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');

        const id = link.getAttribute('data-nav-id');
        let filtered = EMPLOYEES, label = 'All';

        if (id.startsWith('dept-')) {
          const dept = id.replace('dept-', '');
          filtered = EMPLOYEES.filter(e => e.dept.toLowerCase() === dept);
          label = dept.charAt(0).toUpperCase() + dept.slice(1);
        } else if (id.startsWith('status-')) {
          const s = id.replace('status-', '');
          filtered = EMPLOYEES.filter(e => e.status === s);
          label = s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        // Switch to Table View tab
        var tabs = $$('#demo-tabs .tab-label');
        if (tabs[0]) tabs[0].click();

        // Update table
        const tbody = document.querySelector('.jsgui-data-table tbody');
        if (tbody) {
          tbody.innerHTML = filtered.map((row, i) =>
            '<tr class="data-table-row" data-row-index="' + i + '" role="row" aria-rowindex="' + (i + 2) + '">' +
            COLUMNS.map((col, ci) => '<td role="gridcell" aria-colindex="' + (ci + 1) + '">' + row[col.key] + '</td>').join('') +
            '</tr>'
          ).join('');
        }

        // Update breadcrumbs
        const bcLinks = $$('#demo-breadcrumbs .breadcrumbs-link');
        if (bcLinks.length) {
          const last = bcLinks[bcLinks.length - 1];
          last.textContent = label;
        }

        // Update employee count chip
        var chip = $('#employee-count');
        if (chip) chip.textContent = filtered.length + ' Employees';

        toast('Filtered: ' + label + ' (' + filtered.length + ' results)', 'info');
        set_status(filtered.length + ' employees shown • Filter: ' + label);
      });
    }

    /* ── Toolbar ── */
    const toolbar_el = $('#demo-toolbar .jsgui-toolbar');
    if (toolbar_el) {
      // Build items if empty
      if (!toolbar_el.querySelector('[data-item-id]')) {
        var items = [
          { id: 'add', label: '➕ Add', cls: '' },
          { id: 'refresh', label: '🔄 Refresh', cls: '' },
          { type: 'separator' },
          { id: 'density-comfortable', label: 'Comfortable', toggle: true, pressed: true, group: 'density' },
          { id: 'density-compact', label: 'Compact', toggle: true, group: 'density' },
          { type: 'separator' },
          { id: 'modal-test', label: '🪟 Modal', cls: '' }
        ];
        items.forEach(function(it) {
          if (it.type === 'separator') {
            var sep = document.createElement('div');
            sep.className = 'toolbar-separator';
            sep.setAttribute('role', 'separator');
            toolbar_el.appendChild(sep);
          } else {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'toolbar-item';
            btn.setAttribute('data-item-id', it.id);
            btn.textContent = it.label;
            if (it.toggle) {
              btn.setAttribute('aria-pressed', it.pressed ? 'true' : 'false');
              if (it.group) btn.setAttribute('data-group', it.group);
            }
            toolbar_el.appendChild(btn);
          }
        });
      }

      toolbar_el.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-item-id]');
        if (!btn) return;
        var action = btn.getAttribute('data-item-id');
        var group = btn.getAttribute('data-group');

        if (group) {
          toolbar_el.querySelectorAll('[data-group="' + group + '"]').forEach(function(g) { g.setAttribute('aria-pressed', 'false'); });
          btn.setAttribute('aria-pressed', 'true');
        }

        if (action === 'add') {
          var tabs = $$('#demo-tabs .tab-label');
          if (tabs[2]) tabs[2].click();
          toast('Switched to Add Employee form', 'info');
        }
        if (action === 'refresh') {
          var tbody = document.querySelector('.jsgui-data-table tbody');
          if (tbody) {
            tbody.innerHTML = EMPLOYEES.map(function(row, i) {
              return '<tr class="data-table-row" data-row-index="' + i + '" role="row" aria-rowindex="' + (i + 2) + '">' +
                COLUMNS.map(function(col, ci) { return '<td role="gridcell" aria-colindex="' + (ci + 1) + '">' + row[col.key] + '</td>'; }).join('') +
                '</tr>';
            }).join('');
          }
          toast('Data refreshed — all employees', 'success');
          set_status(EMPLOYEES.length + ' employees loaded • All departments');
        }
        if (action && action.startsWith('density-')) {
          var density = action.replace('density-', '');
          var table = document.querySelector('.jsgui-data-table');
          if (table) table.setAttribute('data-density', density);
          toast('Density: ' + density, 'info');
        }
        if (action === 'modal-test') { open_modal(); }
      });
    }

    /* ── Tabbed Panel ── */
    (function() {
      var root = document.querySelector('#demo-tabs .jsgui-tabs') || document.querySelector('#demo-tabs .tab-container');
      if (!root) return;
      var get_tabs = function() { return Array.from(root.querySelectorAll('.tab-label')); };
      var get_inputs = function() { return Array.from(root.querySelectorAll('.tab-input')); };
      var get_pages = function() { return Array.from(root.querySelectorAll('.tab-page')); };

      function set_tab(index) {
        var tabs = get_tabs(), inputs = get_inputs(), pages = get_pages();
        if (index < 0 || index >= tabs.length) return;
        inputs.forEach(function(inp, i) { inp.checked = i === index; if (i === index) inp.setAttribute('checked','checked'); else inp.removeAttribute('checked'); });
        tabs.forEach(function(tb, i) { tb.setAttribute('aria-selected', i === index ? 'true' : 'false'); tb.setAttribute('tabindex', i === index ? '0' : '-1'); });
        pages.forEach(function(pg, i) { pg.setAttribute('aria-hidden', i === index ? 'false' : 'true'); });
      }
      root.addEventListener('click', function(e) { var lb = e.target.closest('.tab-label'); if (lb) set_tab(Number(lb.getAttribute('data-tab-index'))); });
      root.addEventListener('keydown', function(e) {
        var cur = root.querySelector('.tab-label[aria-selected="true"]'), tabs = get_tabs();
        if (!cur) return;
        var ci = tabs.indexOf(cur);
        if (e.key === 'ArrowRight') { e.preventDefault(); var n = (ci + 1) % tabs.length; set_tab(Number(tabs[n].getAttribute('data-tab-index'))); tabs[n].focus(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); var p = (ci - 1 + tabs.length) % tabs.length; set_tab(Number(tabs[p].getAttribute('data-tab-index'))); tabs[p].focus(); }
      });
      set_tab(0);
    })();

    /* ── Breadcrumb click (reset filter) ── */
    (function() {
      var bc = document.querySelector('#demo-breadcrumbs .jsgui-breadcrumbs');
      if (!bc) return;
      bc.addEventListener('click', function(e) {
        var link = e.target.closest('a.breadcrumbs-link');
        if (!link) return;
        e.preventDefault();

        // Clicking any ancestor breadcrumb resets the view to All Employees
        // Reset sidebar active state
        $$('.sidebar-link').forEach(function(l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        var allLink = $('[data-nav-id="all"]');
        if (allLink) { allLink.classList.add('is-active'); allLink.setAttribute('aria-current', 'page'); }

        // Switch to Table View tab
        var tabs = $$('#demo-tabs .tab-label');
        if (tabs[0]) tabs[0].click();

        // Repopulate table with all employees
        var tbody = document.querySelector('.jsgui-data-table tbody');
        if (tbody) {
          tbody.innerHTML = EMPLOYEES.map(function(row, i) {
            return '<tr class="data-table-row" data-row-index="' + i + '" role="row" aria-rowindex="' + (i + 2) + '">' +
              COLUMNS.map(function(col, ci) { return '<td role="gridcell" aria-colindex="' + (ci + 1) + '">' + row[col.key] + '</td>'; }).join('') +
              '</tr>';
          }).join('');
        }

        // Reset breadcrumb text
        var bcLinks = $$('#demo-breadcrumbs .breadcrumbs-link');
        if (bcLinks.length) bcLinks[bcLinks.length - 1].textContent = 'All';

        // Reset employee count chip
        var chip = $('#employee-count');
        if (chip) chip.textContent = EMPLOYEES.length + ' Employees';

        toast('Showing all employees', 'info');
        set_status(EMPLOYEES.length + ' employees loaded • All departments');
      });
    })();

    /* ── Data Table row click ── */
    (function() {
      var table = document.querySelector('.jsgui-data-table');
      if (!table) return;
      table.addEventListener('click', function(e) {
        var row = e.target.closest('tr[aria-rowindex]');
        if (!row || row.closest('thead')) return;
        table.querySelectorAll('tbody tr').forEach(function(r) { r.classList.remove('is-selected'); r.setAttribute('aria-selected','false'); });
        row.classList.add('is-selected');
        row.setAttribute('aria-selected','true');
        var idx = parseInt(row.getAttribute('aria-rowindex')) - 2;
        if (EMPLOYEES[idx]) toast('Selected: ' + EMPLOYEES[idx].name + ' (' + EMPLOYEES[idx].role + ')', 'info');
      });
    })();

    /* ── Master Detail ── */
    (function() {
      var root = document.querySelector('.master-detail');
      if (!root) return;
      var master = root.querySelector('.master-detail-master');
      var detail = root.querySelector('.master-detail-detail');
      if (!master || !detail) return;

      function select_item(el) {
        master.querySelectorAll('.master-detail-item').forEach(function(i) { i.classList.remove('is-selected'); i.setAttribute('aria-selected','false'); i.tabIndex = -1; });
        el.classList.add('is-selected');
        el.setAttribute('aria-selected','true');
        el.tabIndex = 0;
        var id = parseInt(el.getAttribute('data-item-id'));
        var emp = EMPLOYEES.find(function(e) { return e.id === id; });
        if (emp) detail.innerHTML = '<div class="detail-card"><div class="detail-avatar">' + emp.avatar + '</div><h3>' + emp.name + '</h3><p class="detail-role">' + emp.role + '</p><div class="detail-meta"><span>📁 ' + emp.dept + '</span><span>💰 $' + emp.salary.toLocaleString() + '</span><span class="status-badge status-badge--' + emp.status + '">' + emp.status + '</span></div></div>';
      }

      master.addEventListener('click', function(e) { var it = e.target.closest('.master-detail-item'); if (it) select_item(it); });
      master.addEventListener('keydown', function(e) {
        var items = Array.from(master.querySelectorAll('.master-detail-item'));
        var cur = master.querySelector('.master-detail-item.is-selected');
        if (!cur) return;
        var ci = items.indexOf(cur);
        if (e.key === 'ArrowDown') { e.preventDefault(); var n = Math.min(ci + 1, items.length - 1); select_item(items[n]); items[n].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); var p = Math.max(ci - 1, 0); select_item(items[p]); items[p].focus(); }
      });

      // Render initial detail
      var first = master.querySelector('.master-detail-item.is-selected');
      if (first) select_item(first);
    })();

    /* ── Form patches (SSR gaps: select input + submit button) ── */
    (function() {
      var form = document.querySelector('.form-container');
      if (!form) return;

      // Replace dept text input with <select>
      var dept_field = form.querySelector('[data-field-name="dept"] .form-container-input');
      if (dept_field && dept_field.tagName !== 'SELECT') {
        var sel = document.createElement('select');
        sel.name = 'dept';
        sel.className = dept_field.className;
        sel.setAttribute('data-field-name', 'dept');
        sel.setAttribute('required', 'required');
        sel.setAttribute('aria-required', 'true');
        sel.setAttribute('aria-describedby', dept_field.getAttribute('aria-describedby') || '');
        ['', 'Platform', 'Product', 'Data'].forEach(function(v) {
          var opt = document.createElement('option');
          opt.value = v; opt.textContent = v || '— Select department —';
          if (!v) opt.disabled = true; opt.selected = !v;
          sel.appendChild(opt);
        });
        dept_field.parentNode.replaceChild(sel, dept_field);
      }

      // Add submit button if missing
      if (!form.querySelector('button[type="submit"]')) {
        var btn = document.createElement('button');
        btn.type = 'submit';
        btn.className = 'form-submit-btn';
        btn.textContent = '✏️ Add Employee';
        form.appendChild(btn);
      }

      // Form submit handler
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var required = form.querySelectorAll('[required]'), valid = true;
        required.forEach(function(inp) {
          if (!inp.value || !inp.value.trim()) { valid = false; inp.setAttribute('aria-invalid','true'); }
          else inp.setAttribute('aria-invalid','false');
        });
        if (valid) {
          toast('Employee added successfully!', 'success');
          form.reset();
          setTimeout(function() { var tabs = $$('#demo-tabs .tab-label'); if (tabs[0]) tabs[0].click(); }, 600);
        } else {
          toast('Please fill all required fields', 'error');
        }
      });
    })();

    /* ── Modal ── */
    var modal_overlay = document.querySelector('#demo-modal .jsgui-modal-overlay');
    function open_modal() {
      if (!modal_overlay) return;
      // Build footer buttons if empty
      var footer = modal_overlay.querySelector('.jsgui-modal-footer');
      if (footer && !footer.querySelector('button')) {
        ['cancel','confirm'].forEach(function(id) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'modal-btn modal-btn--' + id;
          btn.setAttribute('data-button-id', id);
          btn.textContent = id.charAt(0).toUpperCase() + id.slice(1);
          footer.appendChild(btn);
        });
      }
      modal_overlay.classList.add('is-open');
      modal_overlay.setAttribute('aria-hidden','false');
      // Focus first button
      var first_btn = modal_overlay.querySelector('.modal-btn');
      if (first_btn) setTimeout(function() { first_btn.focus(); }, 100);
    }
    function close_modal(action) {
      if (!modal_overlay) return;
      modal_overlay.classList.remove('is-open');
      modal_overlay.setAttribute('aria-hidden','true');
      if (action === 'confirm') toast('Action confirmed ✓', 'success');
      else toast('Action cancelled', 'info');
    }
    if (modal_overlay) {
      modal_overlay.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-button-id]');
        if (btn) { close_modal(btn.getAttribute('data-button-id')); return; }
        var close = e.target.closest('.jsgui-modal-close');
        if (close) { close_modal('cancel'); return; }
        if (e.target === modal_overlay) close_modal('cancel');
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal_overlay && modal_overlay.classList.contains('is-open')) close_modal('cancel');
    });

    /* ── Welcome ── */
    setTimeout(function() { toast('Admin Controls Demo loaded — explore the sidebar!', 'success'); }, 500);

  })();
  </script>
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════
 *  PREMIUM CSS
 * ═══════════════════════════════════════════════════════ */
const DEMO_CSS = `
/* ═══════════════════════════════════════════
 * DESIGN TOKENS
 * ═══════════════════════════════════════════ */
:root {
  /* Palette — deep indigo dark theme */
  --bg-base:       #080818;
  --bg-elevated:   #0e0e24;
  --bg-surface:    #141432;
  --bg-card:       rgba(255,255,255,0.025);
  --bg-hover:      rgba(99,102,241,0.08);
  --bg-active:     rgba(99,102,241,0.15);

  --border:        rgba(255,255,255,0.06);
  --border-accent: rgba(99,102,241,0.3);

  --text:          #e2e8f0;
  --text-secondary:#94a3b8;
  --text-muted:    #64748b;
  --text-inverse:  #0f172a;

  --accent:        #6366f1;
  --accent-light:  #818cf8;
  --accent-glow:   rgba(99,102,241,0.25);
  --success:       #22c55e;
  --error:         #ef4444;
  --warning:       #f59e0b;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 24px var(--accent-glow);

  /* Transitions */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --dur: 200ms;
}

/* ═══════ RESET ═══════ */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 14px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg-base);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.6;
}

/* ═══════ SCROLLBAR ═══════ */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* ═══════════════════════════════════════════
 * LAYOUT SHELL
 * ═══════════════════════════════════════════ */
.demo-shell { display: flex; flex-direction: column; min-height: 100vh; }

/* ── HEADER ── */
.demo-header {
  background: linear-gradient(135deg, var(--bg-elevated) 0%, #0a0a28 50%, var(--bg-elevated) 100%);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(12px);
}
.demo-header-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px var(--space-lg); max-width: 100%;
}
.demo-logo { display: flex; align-items: center; gap: 14px; }
.demo-logo-icon {
  width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glow), 0 4px 12px rgba(99,102,241,0.3);
  animation: logo-pulse 3s ease-in-out infinite;
}
@keyframes logo-pulse {
  0%, 100% { box-shadow: var(--shadow-glow), 0 4px 12px rgba(99,102,241,0.3); }
  50% { box-shadow: 0 0 32px var(--accent-glow), 0 4px 16px rgba(99,102,241,0.4); }
}
.demo-title {
  font-size: 18px; font-weight: 700; letter-spacing: -0.3px;
  background: linear-gradient(135deg, #c7d2fe, #e0e7ff 40%, #f8fafc);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.demo-subtitle {
  font-size: 11px; color: var(--text-muted); margin-top: 1px;
  letter-spacing: 0.5px; font-weight: 400;
}
.demo-header-actions { display: flex; align-items: center; gap: var(--space-sm); }
.demo-chip {
  padding: 5px 12px; border-radius: 50px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
  background: rgba(99,102,241,0.12); color: var(--accent-light);
  border: 1px solid rgba(99,102,241,0.2);
}
.demo-header-btn {
  width: 34px; height: 34px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); background: var(--bg-card);
  color: var(--text-secondary); cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--dur) var(--ease);
}
.demo-header-btn:hover { background: var(--bg-hover); border-color: var(--border-accent); color: var(--text); }

/* ── APP GRID ── */
.demo-app { display: flex; flex: 1; overflow: hidden; }

/* ── SIDEBAR ── */
.demo-sidebar {
  width: 250px; flex-shrink: 0;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  overflow-y: auto;
}
.sidebar-section-title {
  padding: 18px 20px 10px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted);
}
.sidebar-stats {
  margin-top: auto; padding: 16px 20px;
  border-top: 1px solid var(--border);
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;
}
.sidebar-stat { text-align: center; }
.stat-value { display: block; font-size: 18px; font-weight: 700; color: var(--accent-light); }
.stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }

/* ── MAIN CONTENT ── */
.demo-main {
  flex: 1; padding: var(--space-lg);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: var(--space-md);
  background: var(--bg-base);
}

/* ── FOOTER / STATUS ── */
.demo-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px var(--space-lg);
  background: #060614;
  border-top: 1px solid var(--border);
  font-size: 11px; color: var(--text-muted);
}
.demo-footer-left { display: flex; align-items: center; gap: var(--space-sm); }
.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--success);
}
.status-dot--live { animation: pulse-dot 2s ease-in-out infinite; }
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
}

/* ═══════════════════════════════════════════
 * CONTROL DARK THEME OVERRIDES
 * ═══════════════════════════════════════════ */

/* Sidebar Nav */
.jsgui-sidebar-nav { background: transparent; padding: 0 8px; }
/* Hide the hamburger toggle — not needed in desktop demo */
.jsgui-sidebar-nav > button:first-child,
.jsgui-sidebar-nav > [aria-label='Toggle menu'],
.sidebar-toggle { display: none !important; }
.sidebar-link {
  padding: 8px 12px !important; border-radius: var(--radius-sm) !important;
  transition: all var(--dur) var(--ease) !important;
  color: var(--text-secondary) !important;
  font-size: 13px !important;
  display: flex !important; align-items: center !important; gap: 8px;
}
.sidebar-link:hover { background: var(--bg-hover) !important; color: var(--text) !important; }
.sidebar-link.is-active {
  background: var(--bg-active) !important;
  color: var(--accent-light) !important;
  box-shadow: inset 3px 0 0 var(--accent) !important;
}
.sidebar-icon { opacity: 0.8; transition: opacity var(--dur) var(--ease); }
.sidebar-link:hover .sidebar-icon { opacity: 1; }
/* Sidebar nav groups — parent items that expand children */
.sidebar-group { margin-bottom: 4px; }
.sidebar-group-label {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 12px; cursor: pointer;
  font-size: 12px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  border-radius: var(--radius-sm);
  transition: all var(--dur) var(--ease);
  user-select: none;
}
.sidebar-group-label:hover { background: var(--bg-hover); color: var(--text-secondary); }
.sidebar-group-label .group-chevron {
  transition: transform var(--dur) var(--ease); font-size: 10px;
}
.sidebar-group.is-expanded .group-chevron { transform: rotate(90deg); }
.sidebar-group-children {
  max-height: 0; overflow: hidden;
  transition: max-height 0.3s var(--ease);
  padding-left: 12px;
}
.sidebar-group.is-expanded .sidebar-group-children {
  max-height: 200px;
}

/* Breadcrumbs */
.demo-breadcrumbs-row { padding: 0; }
.jsgui-breadcrumbs { padding: 0; background: transparent; }
.breadcrumbs-list { list-style: none; display: flex; align-items: center; gap: 4px; }
.breadcrumbs-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); }
.breadcrumbs-item::before { content: ''; }
.breadcrumbs-item:not(:first-child)::before { content: '/'; margin-right: 4px; opacity: 0.4; }
.breadcrumbs-link { color: var(--text-secondary); text-decoration: none; transition: color var(--dur) var(--ease); }
.breadcrumbs-link:hover { color: var(--text); }
.breadcrumbs-current .breadcrumbs-link { color: var(--accent-light); font-weight: 500; }

/* Toolbar */
.demo-toolbar-row { margin-bottom: 0; }
.jsgui-toolbar {
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-md) !important;
  padding: 6px 10px !important;
  display: flex !important; align-items: center !important; gap: 4px !important;
}
.toolbar-item {
  padding: 6px 14px; border-radius: var(--radius-sm); border: 1px solid transparent;
  background: transparent; color: var(--text-secondary);
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: all var(--dur) var(--ease);
  white-space: nowrap;
}
.toolbar-item:hover { background: var(--bg-hover); color: var(--text); border-color: var(--border); }
.toolbar-item[aria-pressed="true"] {
  background: var(--bg-active); color: var(--accent-light);
  border-color: var(--border-accent);
}
.toolbar-separator {
  width: 1px; height: 20px; background: var(--border); margin: 0 4px; flex-shrink: 0;
}

/* Tabbed Panel — horizontal tab bar via flex-wrap */
.tab-container, .jsgui-tabs {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  display: flex !important;
  flex-flow: row wrap !important;
  align-items: flex-start !important;
}
/* Radio inputs — hidden */
.tab-input { display: none !important; }
/* Tab labels — inline row at top */
.tab-label {
  order: -1 !important;
  display: inline-flex !important; align-items: center !important; gap: 6px;
  padding: 10px 20px !important; cursor: pointer;
  color: var(--text-muted) !important; font-size: 13px !important; font-weight: 500 !important;
  border-bottom: 2px solid transparent !important;
  transition: all var(--dur) var(--ease) !important;
  background: transparent !important; border-radius: 0 !important;
}
.tab-label:hover { color: var(--text-secondary) !important; background: var(--bg-hover) !important; }
.tab-label[aria-selected="true"] {
  color: var(--accent-light) !important;
  border-bottom-color: var(--accent) !important;
}
/* Tab pages — full width below labels */
.tab-page {
  flex: 1 0 100% !important;
  order: 10 !important;
  padding: var(--space-md) 0 !important;
  background: transparent !important;
}
.tab-page[aria-hidden="true"] { display: none !important; }
.tab-page[aria-hidden="false"] { display: block !important; }
/* Tab bar bottom border — pseudo-element spanning full width */
.demo-content-area .tab-container::before,
.demo-content-area .jsgui-tabs::before {
  content: '';
  order: 0;
  flex: 0 0 100%;
  height: 0;
  border-bottom: 1px solid var(--border);
}

/* Data Table */
.jsgui-data-table {
  width: 100%; border-collapse: collapse; border-spacing: 0;
  background: var(--bg-card); border-radius: var(--radius-md); overflow: hidden;
  border: 1px solid var(--border);
}
.jsgui-data-table th {
  text-align: left; padding: 12px 16px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  color: var(--text-muted); background: rgba(255,255,255,0.02);
  border-bottom: 1px solid var(--border);
}
.jsgui-data-table td {
  padding: 12px 16px; font-size: 13px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: background var(--dur) var(--ease);
}
.jsgui-data-table tbody tr { cursor: pointer; transition: background var(--dur) var(--ease); }
.jsgui-data-table tbody tr:hover td { background: var(--bg-hover); }
.jsgui-data-table tbody tr.is-selected td {
  background: var(--bg-active) !important;
  border-bottom-color: rgba(99,102,241,0.1);
}
.jsgui-data-table tbody tr:last-child td { border-bottom: none; }

/* Master Detail */
.master-detail {
  display: flex; border: 1px solid var(--border); border-radius: var(--radius-md);
  overflow: hidden; min-height: 320px; background: var(--bg-card);
}
.master-detail-back { display: none; }
.master-detail-master {
  width: 240px; flex-shrink: 0; border-right: 1px solid var(--border);
  overflow-y: auto; padding: 6px;
}
.master-detail-item {
  display: block; width: 100%; text-align: left;
  padding: 10px 14px; border: none; border-radius: var(--radius-sm);
  background: transparent; color: var(--text-secondary);
  cursor: pointer; font-size: 13px;
  transition: all var(--dur) var(--ease);
}
.master-detail-item:hover { background: var(--bg-hover); color: var(--text); }
.master-detail-item.is-selected {
  background: var(--bg-active); color: var(--accent-light);
  box-shadow: inset 3px 0 0 var(--accent);
}
.master-detail-detail {
  flex: 1; padding: var(--space-lg);
  display: flex; align-items: flex-start; justify-content: center;
}

/* Detail card */
.detail-card { width: 100%; max-width: 400px; }
.detail-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #a78bfa);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; color: #fff;
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-glow);
}
.detail-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
.detail-role { color: var(--text-secondary); font-size: 14px; margin-bottom: var(--space-md); }
.detail-meta { display: flex; gap: var(--space-md); flex-wrap: wrap; font-size: 13px; color: var(--text-secondary); }
.status-badge {
  padding: 2px 10px; border-radius: 50px; font-size: 11px; font-weight: 600; text-transform: capitalize;
}
.status-badge--active { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-badge--on-leave { background: rgba(245,158,11,0.15); color: #fbbf24; }

/* Form */
.form-container {
  max-width: 480px; padding: var(--space-lg) 0;
  display: flex; flex-direction: column; gap: var(--space-md);
}
.form-container-field { display: flex; flex-direction: column; gap: 6px; }
.form-container-label {
  font-size: 11px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1px; text-align: left;
}
.form-container-input,
.form-container input[type="text"],
.form-container input[type="number"],
.form-container select {
  padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg-surface); color: var(--text); font-size: 14px; font-family: inherit;
  transition: all var(--dur) var(--ease);
  width: 100%; appearance: none;
}
.form-container select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
  padding-right: 32px; cursor: pointer;
}
.form-container-input:focus,
.form-container input:focus,
.form-container select:focus {
  outline: none; border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.form-container input[aria-invalid="true"],
.form-container select[aria-invalid="true"] {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
}
.form-container button[type="submit"], .form-container .form-submit-btn {
  padding: 11px 28px; border: none; border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all var(--dur) var(--ease);
  box-shadow: var(--shadow-sm);
  align-self: flex-start; margin-top: var(--space-sm);
}
.form-container button[type="submit"]:hover { box-shadow: var(--shadow-glow), var(--shadow-md); transform: translateY(-1px); }

/* Modal */
.jsgui-modal-overlay {
  display: none; position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
  align-items: center; justify-content: center;
}
.jsgui-modal-overlay.is-open { display: flex; animation: modal-bg-in 0.2s var(--ease); }
@keyframes modal-bg-in { from { opacity: 0; } to { opacity: 1; } }
.jsgui-modal {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 0;
  min-width: 420px; max-width: 90vw;
  box-shadow: var(--shadow-lg), 0 0 60px rgba(99,102,241,0.08);
  animation: modal-in 0.25s var(--ease); overflow: hidden;
}
@keyframes modal-in { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
.jsgui-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
}
.jsgui-modal-title { font-size: 16px; font-weight: 700; }
.jsgui-modal-close {
  width: 30px; height: 30px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); background: var(--bg-card);
  color: var(--text-secondary); cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--dur) var(--ease);
}
.jsgui-modal-close:hover { background: var(--bg-hover); color: var(--text); }
.jsgui-modal-body { padding: 20px 24px; font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.jsgui-modal-footer {
  display: flex; align-items: center; justify-content: flex-end;
  gap: var(--space-sm); padding: 16px 24px;
  border-top: 1px solid var(--border);
}
.modal-btn {
  padding: 8px 20px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all var(--dur) var(--ease);
}
.modal-btn--cancel {
  background: transparent; border: 1px solid var(--border);
  color: var(--text-secondary);
}
.modal-btn--cancel:hover { background: var(--bg-hover); color: var(--text); }
.modal-btn--confirm {
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  border: none; color: #fff;
  box-shadow: var(--shadow-sm);
}
.modal-btn--confirm:hover { box-shadow: var(--shadow-glow); transform: translateY(-1px); }

/* ═══════ TOASTS ═══════ */
.demo-toast-container {
  position: fixed; bottom: 50px; right: var(--space-lg);
  display: flex; flex-direction: column-reverse; gap: var(--space-sm);
  z-index: 3000; pointer-events: none;
}
.demo-toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500;
  backdrop-filter: blur(16px); pointer-events: auto;
  box-shadow: var(--shadow-md);
  max-width: 400px;
  opacity: 0; transform: translateY(12px) scale(0.95);
  transition: all 0.3s var(--ease);
  border: 1px solid rgba(255,255,255,0.06);
}
.demo-toast--enter { opacity: 1; transform: translateY(0) scale(1); }
.demo-toast--exit { opacity: 0; transform: translateX(40px) scale(0.95); }
.demo-toast--info { background: rgba(99,102,241,0.92); color: #fff; }
.demo-toast--success { background: rgba(34,197,94,0.92); color: #fff; }
.demo-toast--error { background: rgba(239,68,68,0.92); color: #fff; }
.toast-icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,255,255,0.2); display: flex;
  align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}

/* ═══════ FORM VALIDATION ═══════ */
.inline-validation-message { font-size: 11px; color: var(--error); min-height: 16px; }
.inline-validation-icon.hidden { display: none; }
.form-container-badge { display: none; }

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 768px) {
  .demo-sidebar { display: none; }
  .demo-main { padding: var(--space-md); }
  .master-detail { flex-direction: column; }
  .master-detail-master { width: 100%; border-right: none; border-bottom: 1px solid var(--border); max-height: 200px; }
}
`;

/* ═══════════════════════════════════════════════════════
 *  CLI
 * ═══════════════════════════════════════════════════════ */
const html = build_demo_html();

if (process.argv.includes('--serve')) {
  const http = require('http');
  const PORT = 4600;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  server.listen(PORT, () => {
    console.log(`\n  ⚡  Admin Controls Demo`);
    console.log(`  ────────────────────────`);
    console.log(`  http://localhost:${PORT}\n`);
  });
} else {
  const out = path.join(__dirname, 'admin_demo.html');
  fs.writeFileSync(out, html, 'utf8');
  console.log(`\n  ⚡  Wrote ${(html.length / 1024).toFixed(1)}KB → ${out}`);
  console.log(`  Open in browser, or run with --serve\n`);
}
