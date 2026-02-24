const jsgui = require('../../../../html-core/html-core');
const controls = require('../../../../controls/controls');

const build_showcase_app_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const status_bar = new controls.Status_Bar({
        context,
        status: 'info',
        text: 'System ready',
        meta_text: 'Idle'
    });

    const filter_chips = new controls.Filter_Chips({
        context,
        chips: [
            { id: 'all', label: 'All', selected: true },
            { id: 'active', label: 'Active' },
            { id: 'errors', label: 'Errors' },
            { id: 'archived', label: 'Archived', disabled: true }
        ],
        multi_select: true,
        aria_label: 'Filter showcase'
    });

    const icon_button = new controls.Icon_Button({
        context,
        text: 'Save',
        icon: '💾',
        aria_label: 'Save changes'
    });

    const link_button = new controls.Link_Button({
        context,
        text: 'Read docs',
        href: '#',
        underline_mode: 'hover'
    });

    const split_button = new controls.Split_Button({
        context,
        text: 'Deploy',
        primary_action: { id: 'deploy' },
        menu_items: [
            { id: 'preview', text: 'Preview deploy' },
            { id: 'staging', text: 'Deploy to staging' },
            { id: 'production', text: 'Deploy to production' }
        ]
    });

    const tabbed_panel = new controls.Tabbed_Panel({
        context,
        tabs: [
            { title: 'Overview', content: 'Overview content', icon: '🏠' },
            { title: 'Usage', content: 'Usage content', badge: 2 },
            { title: 'Logs', content: 'Logs content', closable: true },
            { title: 'Disabled', content: 'Disabled content', disabled: true }
        ],
        tab_bar: { position: 'top', variant: 'compact' },
        aria_label: 'Showcase tabs'
    });

    const accordion = new controls.Accordion({
        context,
        allow_multiple: true,
        sections: [
            { id: 'theme', title: 'Theme editor', content: 'Tune colors, radius, and typography.', open: true },
            { id: 'controls', title: 'Controls', content: 'Mix action, layout, and data controls.' },
            { id: 'testing', title: 'Testing', content: 'Playwright validates interactions.' }
        ]
    });

    const drawer = new controls.Drawer({
        context,
        position: 'right',
        open: false,
        content: 'Dashboard\nReports\nSettings'
    });

    const code_editor = new controls.Code_Editor({
        context,
        value: 'const theme = "vs-default";\nconsole.log(theme);',
        language: 'javascript',
        line_numbers: true
    });

    const console_panel = new controls.Console_Panel({
        context,
        title: 'Showcase Console',
        max_lines: 5,
        lines: ['[info] Showcase booted', '[info] Theme loaded: vs-default']
    });

    const theme_options_html = controls.Admin_Theme.themes
        .map(name => `<option value="${name}"${name === 'vs-default' ? ' selected="selected"' : ''}>${name}</option>`)
        .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Showcase App Fixture</title>
  <style>
    ${controls.Admin_Theme.css || ''}
    ${controls.Status_Bar.css || ''}
    ${controls.Filter_Chips.css || ''}
    ${controls.Icon_Button.css || ''}
    ${controls.Link_Button.css || ''}
    ${controls.Split_Button.css || ''}
    ${controls.Tabbed_Panel.css || ''}
    ${controls.Accordion.css || ''}
    ${controls.Drawer.css || ''}
    ${controls.Code_Editor.css || ''}
    ${controls.Console_Panel.css || ''}

    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      background: var(--admin-bg);
      color: var(--admin-text);
      font-family: var(--admin-font);
      font-size: var(--admin-font-size);
    }
    .showcase-shell {
      display: grid;
      grid-template-columns: 220px 320px 1fr;
      gap: 14px;
      max-width: 1360px;
      margin: 0 auto;
    }
    .card {
      background: var(--admin-card-bg);
      border: 1px solid var(--admin-border);
      border-radius: var(--admin-radius-lg);
      box-shadow: var(--admin-shadow);
      padding: 12px;
    }
    .theme-input { width: 100%; min-height: 34px; margin-bottom: 8px; }
    .theme-json { width: 100%; min-height: 100px; resize: vertical; margin-bottom: 8px; font-family: var(--admin-font-mono); }
    .theme-actions, .mini-actions, .action-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .mini-button {
      border: 1px solid var(--admin-border);
      border-radius: var(--admin-radius);
      background: var(--admin-header-bg);
      color: var(--admin-text);
      min-height: 32px;
      padding: 0 10px;
      cursor: pointer;
    }
    .showcase-content { display: grid; gap: 12px; }
    .showcase-nav-list { display: flex; flex-direction: column; gap: 8px; }
    .showcase-nav-link {
      border: 1px solid var(--admin-border);
      border-radius: var(--admin-radius);
      background: var(--admin-header-bg);
      color: var(--admin-text);
      min-height: 34px;
      text-align: left;
      padding: 0 10px;
      cursor: pointer;
    }
    .showcase-nav-link.is-active {
      border-color: var(--admin-accent);
      box-shadow: inset 0 0 0 1px var(--admin-accent);
    }
    .layout-grid, .editor-grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (max-width: 1100px) {
      .showcase-shell { grid-template-columns: 1fr; }
      .layout-grid, .editor-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="showcase-shell">
    <aside class="card showcase-nav">
      <h2>Showcase Nav</h2>
      <div class="showcase-nav-list">
        <button type="button" class="showcase-nav-link is-active" data-target="showcase-feedback">Feedback + Status</button>
        <button type="button" class="showcase-nav-link" data-target="showcase-actions">Action Controls</button>
        <button type="button" class="showcase-nav-link" data-target="showcase-layout">Layout + Navigation</button>
        <button type="button" class="showcase-nav-link" data-target="showcase-editor">Editor + Console</button>
      </div>
    </aside>

    <aside class="card">
      <h2>Theme Studio</h2>
      <p>Theme preset + live token editing.</p>
      <label for="theme-preset-select">Preset</label>
      <select id="theme-preset-select" class="theme-input">${theme_options_html}</select>

      <label for="theme-accent">Accent</label>
      <input id="theme-accent" class="theme-input" type="color" value="#0078d4" data-theme-var="--admin-accent" />

      <label for="theme-card-bg">Card background</label>
      <input id="theme-card-bg" class="theme-input" type="color" value="#ffffff" data-theme-var="--admin-card-bg" />

      <label for="theme-text">Text</label>
      <input id="theme-text" class="theme-input" type="color" value="#1e1e1e" data-theme-var="--admin-text" />

      <label for="theme-radius">Radius</label>
      <input id="theme-radius" class="theme-input" type="range" min="0" max="14" step="1" value="4" data-theme-var="--admin-radius" data-theme-unit="px" />

      <label for="theme-font-size">Font size</label>
      <input id="theme-font-size" class="theme-input" type="range" min="11" max="18" step="1" value="13" data-theme-var="--admin-font-size" data-theme-unit="px" />

      <div class="theme-actions">
        <button id="theme-reset" type="button" class="mini-button">Reset to preset</button>
        <div id="theme-preview-chip" style="background: var(--admin-accent); color: #fff; border-radius: var(--admin-radius); padding: 6px 10px;">Preview</div>
      </div>

      <div class="theme-actions" style="margin-top:8px;">
        <button id="theme-save-local" type="button" class="mini-button">Save local</button>
        <button id="theme-clear-local" type="button" class="mini-button">Clear saved</button>
      </div>

      <textarea id="theme-json" class="theme-json" placeholder='{"preset":"vs-default","overrides":{"--admin-accent":"#0078d4"}}'></textarea>

      <div class="theme-actions">
        <button id="theme-export" type="button" class="mini-button">Export JSON</button>
        <button id="theme-import" type="button" class="mini-button">Import JSON</button>
      </div>
    </aside>

    <main class="showcase-content">
      <section class="card" id="showcase-feedback">
        <h3>Feedback + Status</h3>
        <div id="showcase-status-wrap">${status_bar.html}</div>
        <div class="mini-actions"><button id="status-cycle" type="button" class="mini-button">Cycle status</button></div>
        ${filter_chips.html}
      </section>

      <section class="card" id="showcase-actions">
        <h3>Action Controls</h3>
        <div class="action-row">${icon_button.html}${link_button.html}${split_button.html}</div>
      </section>

      <section class="card" id="showcase-layout">
        <h3>Layout + Navigation</h3>
        <div class="layout-grid">
          <div>${tabbed_panel.html}</div>
          <div>${accordion.html}</div>
          <div>
            <button id="showcase-open-drawer" type="button" class="mini-button">Open nav drawer</button>
            <div id="showcase-drawer">${drawer.html}</div>
          </div>
        </div>
      </section>

      <section class="card" id="showcase-editor">
        <h3>Editor + Console</h3>
        <div class="editor-grid">
          <div>${code_editor.html}</div>
          <div>
            ${console_panel.html}
            <div class="mini-actions" style="margin-top:8px;">
              <button id="console-append" type="button" class="mini-button">Append log</button>
              <button id="console-clear" type="button" class="mini-button">Clear log</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <script>
    const theme_model = {
      presets: ${JSON.stringify(controls.Admin_Theme.THEMES || {})},
      current: 'vs-default'
    };

    const theme_select = document.getElementById('theme-preset-select');
    const reset_button = document.getElementById('theme-reset');
    const save_local_button = document.getElementById('theme-save-local');
    const clear_local_button = document.getElementById('theme-clear-local');
    const export_button = document.getElementById('theme-export');
    const import_button = document.getElementById('theme-import');
    const theme_json = document.getElementById('theme-json');
    const var_inputs = Array.from(document.querySelectorAll('[data-theme-var]'));
    const nav_buttons = Array.from(document.querySelectorAll('.showcase-nav-link'));
    const storage_key = 'showcase_theme_state_v1';

    const status_states = [
      { status: 'info', text: 'System ready', meta: 'Idle' },
      { status: 'success', text: 'Theme applied', meta: 'No errors' },
      { status: 'warning', text: 'High contrast recommended', meta: 'A11y hint' },
      { status: 'error', text: 'Token conflict detected', meta: 'Review theme vars' }
    ];

    const status_root = document.querySelector('#showcase-status-wrap .jsgui-status-bar');
    const status_left = document.querySelector('#showcase-status-wrap .status-bar-left');
    const status_right = document.querySelector('#showcase-status-wrap .status-bar-right');

    const set_status = idx => {
      const state = status_states[idx];
      if (!state || !status_root || !status_left || !status_right) return;
      status_root.setAttribute('data-status', state.status);
      status_left.textContent = state.text;
      status_right.textContent = state.meta;
    };

    let status_index = 0;
    document.getElementById('status-cycle').addEventListener('click', () => {
      status_index = (status_index + 1) % status_states.length;
      set_status(status_index);
    });

    const apply_vars = vars => {
      Object.entries(vars || {}).forEach(([name, value]) => {
        document.documentElement.style.setProperty(name, value);
      });
    };

    const sync_inputs_from_preset = preset_name => {
      const vars = theme_model.presets[preset_name] || {};
      var_inputs.forEach(input => {
        const var_name = input.getAttribute('data-theme-var');
        const unit = input.getAttribute('data-theme-unit') || '';
        const preset_value = vars[var_name];
        if (preset_value === undefined) return;
        if (input.type === 'range' && unit && String(preset_value).endsWith(unit)) {
          input.value = String(preset_value).slice(0, -unit.length);
        } else {
          input.value = String(preset_value);
        }
      });
      apply_vars(vars);
    };

    const apply_input = input => {
      const var_name = input.getAttribute('data-theme-var');
      const unit = input.getAttribute('data-theme-unit') || '';
      if (!var_name) return;
      const value = unit ? input.value + unit : input.value;
      document.documentElement.style.setProperty(var_name, value);
    };

    const has_storage = (() => {
      try {
        if (typeof localStorage === 'undefined') return false;
        const probe = '__showcase_storage_probe__';
        localStorage.setItem(probe, '1');
        localStorage.removeItem(probe);
        return true;
      } catch (err) {
        return false;
      }
    })();

    const read_state = () => {
      if (!has_storage) return null;
      try {
        const raw = localStorage.getItem(storage_key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    };

    const write_state = state => {
      if (!has_storage) return;
      try {
        localStorage.setItem(storage_key, JSON.stringify(state));
      } catch (err) {
      }
    };

    const clear_state = () => {
      if (!has_storage) return;
      try {
        localStorage.removeItem(storage_key);
      } catch (err) {
      }
    };

    const collect_overrides = () => {
      const overrides = {};
      var_inputs.forEach(input => {
        const var_name = input.getAttribute('data-theme-var');
        const unit = input.getAttribute('data-theme-unit') || '';
        if (!var_name) return;
        overrides[var_name] = unit ? input.value + unit : input.value;
      });
      return overrides;
    };

    const apply_overrides = overrides => {
      if (!overrides) return;
      Object.entries(overrides).forEach(([var_name, value]) => {
        document.documentElement.style.setProperty(var_name, value);
      });

      var_inputs.forEach(input => {
        const var_name = input.getAttribute('data-theme-var');
        const unit = input.getAttribute('data-theme-unit') || '';
        if (!var_name || overrides[var_name] === undefined) return;
        const raw = String(overrides[var_name]);
        if (input.type === 'range' && unit && raw.endsWith(unit)) {
          input.value = raw.slice(0, -unit.length);
        } else {
          input.value = raw;
        }
      });
    };

    const serialize_state = () => ({
      preset: theme_select.value,
      overrides: collect_overrides()
    });

    const apply_state = state => {
      if (!state) return;
      if (state.preset && theme_model.presets[state.preset]) {
        theme_select.value = state.preset;
        theme_model.current = state.preset;
      }
      document.documentElement.setAttribute('data-admin-theme', theme_model.current);
      sync_inputs_from_preset(theme_model.current);
      if (state.overrides) {
        apply_overrides(state.overrides);
      }
    };

    theme_select.addEventListener('change', () => {
      theme_model.current = theme_select.value;
      document.documentElement.setAttribute('data-admin-theme', theme_model.current);
      sync_inputs_from_preset(theme_model.current);
    });

    var_inputs.forEach(input => {
      input.addEventListener('input', () => apply_input(input));
      input.addEventListener('change', () => apply_input(input));
    });

    reset_button.addEventListener('click', () => {
      document.documentElement.setAttribute('data-admin-theme', theme_model.current);
      sync_inputs_from_preset(theme_model.current);
    });

    save_local_button.addEventListener('click', () => {
      const state = serialize_state();
      write_state(state);
      theme_json.value = JSON.stringify(state, null, 2);
    });

    clear_local_button.addEventListener('click', () => {
      clear_state();
      document.documentElement.setAttribute('data-admin-theme', theme_model.current);
      sync_inputs_from_preset(theme_model.current);
      theme_json.value = '';
    });

    export_button.addEventListener('click', () => {
      theme_json.value = JSON.stringify(serialize_state(), null, 2);
    });

    import_button.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(theme_json.value || '{}');
        apply_state(parsed);
        write_state(parsed);
      } catch (err) {
      }
    });

    if (nav_buttons.length) {
      const set_active_nav = target_id => {
        nav_buttons.forEach(btn => {
          btn.classList.toggle('is-active', btn.getAttribute('data-target') === target_id);
        });
      };

      nav_buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target_id = btn.getAttribute('data-target');
          const section = target_id ? document.getElementById(target_id) : null;
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            set_active_nav(target_id);
          }
        });
      });
    }

    const drawer_root = document.querySelector('#showcase-drawer .drawer');
    const drawer_open = document.getElementById('showcase-open-drawer');
    if (drawer_root && drawer_open) {
      const close_drawer = () => drawer_root.classList.remove('is-open');
      drawer_open.addEventListener('click', () => drawer_root.classList.add('is-open'));
      const overlay = drawer_root.querySelector('.drawer-overlay');
      const close_button = drawer_root.querySelector('.drawer-close');
      if (overlay) overlay.addEventListener('click', close_drawer);
      if (close_button) close_button.addEventListener('click', close_drawer);
      document.addEventListener('keydown', evt => {
        if (evt.key === 'Escape') close_drawer();
      });
    }

    const tabs_root = document.querySelector('#showcase-layout .jsgui-tabs');
    if (tabs_root) {
      const get_tabs = () => Array.from(tabs_root.querySelectorAll('.tab-label'))
        .filter(label => !label.classList.contains('tab-label-hidden'));
      const get_inputs = () => Array.from(tabs_root.querySelectorAll('.tab-input'));
      const get_pages = () => Array.from(tabs_root.querySelectorAll('.tab-page'));

      const set_active = index => {
        const tabs = get_tabs();
        const inputs = get_inputs();
        const pages = get_pages();
        if (index < 0 || index >= tabs.length) return;
        if (tabs[index].classList.contains('tab-disabled')) return;

        inputs.forEach((input, idx) => {
          input.checked = idx === index;
          if (idx === index) input.setAttribute('checked', 'checked');
          else input.removeAttribute('checked');
        });

        tabs.forEach((tab, idx) => {
          tab.setAttribute('aria-selected', idx === index ? 'true' : 'false');
          tab.setAttribute('tabindex', idx === index ? '0' : '-1');
        });

        pages.forEach((page, idx) => {
          page.setAttribute('aria-hidden', idx === index ? 'false' : 'true');
        });
      };

      tabs_root.addEventListener('click', evt => {
        const label = evt.target.closest('.tab-label');
        if (!label) return;
        const idx = Number(label.getAttribute('data-tab-index'));
        set_active(idx);
      });

      set_active(0);
    }

    const output = document.querySelector('.console-panel-output');
    let lines = ['[info] Showcase booted', '[info] Theme loaded: vs-default'];
    const max_lines = 5;

    const sync_output = () => {
      if (!output) return;
      output.textContent = lines.join('\\n');
    };

    document.getElementById('console-append').addEventListener('click', () => {
      lines.push('[info] Theme token update');
      if (lines.length > max_lines) {
        lines = lines.slice(lines.length - max_lines);
      }
      sync_output();
    });

    document.getElementById('console-clear').addEventListener('click', () => {
      lines = [];
      sync_output();
    });

    document.documentElement.setAttribute('data-admin-theme', 'vs-default');
    sync_inputs_from_preset('vs-default');
    set_status(0);

    const saved_state = read_state();
    if (saved_state) {
      apply_state(saved_state);
    }
  </script>
</body>
</html>`;
};

module.exports = {
    build_showcase_app_fixture_html
};
