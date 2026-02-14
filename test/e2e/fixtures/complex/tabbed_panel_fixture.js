const jsgui = require('../../../../html-core/html-core');
const Tabbed_Panel = require('../../../../controls/organised/1-standard/6-layout/tabbed-panel');

const build_tabbed_panel_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const tabs = new Tabbed_Panel({
        context,
        tabs: [
            { title: 'Overview', content: 'Overview content', icon: '🏠' },
            { title: 'Errors', content: 'Errors content', badge: 3 },
            { title: 'Logs', content: 'Logs content', closable: true },
            { title: 'Disabled', content: 'Disabled content', disabled: true }
        ],
        tab_bar: { position: 'top', variant: 'compact' },
        aria_label: 'Demo tabs'
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tabbed Panel Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    ${Tabbed_Panel.css || ''}
  </style>
</head>
<body>
  <div id="tabs-wrap">${tabs.html}</div>
  <div id="log" aria-live="polite"></div>
  <script>
    const root = document.querySelector('#tabs-wrap .jsgui-tabs');
    const log = document.getElementById('log');

    const get_tabs = () => Array.from(root.querySelectorAll('.tab-label'))
      .filter(label => !label.classList.contains('tab-label-hidden'));
    const get_inputs = () => Array.from(root.querySelectorAll('.tab-input'));
    const get_pages = () => Array.from(root.querySelectorAll('.tab-page'));

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

      log.textContent = 'active:' + index;
    };

    root.addEventListener('click', e => {
      const close_btn = e.target.closest('.tab-close');
      if (close_btn) {
        e.preventDefault();
        const label = close_btn.closest('.tab-label');
        if (!label) return;
        const idx = Number(label.getAttribute('data-tab-index'));
        const input = root.querySelector('.tab-input[data-tab-index="' + idx + '"]');
        const page = root.querySelector('.tab-page[data-tab-index="' + idx + '"]');
        if (input) input.remove();
        if (label) label.remove();
        if (page) page.remove();
        set_active(0);
        log.textContent = 'closed:' + idx;
        return;
      }

      const label = e.target.closest('.tab-label');
      if (!label) return;
      const idx = Number(label.getAttribute('data-tab-index'));
      set_active(idx);
    });

    root.addEventListener('keydown', e => {
      const current = root.querySelector('.tab-label[aria-selected="true"]');
      const tabs = get_tabs();
      if (!current || !tabs.length) return;
      let current_index = tabs.indexOf(current);
      if (current_index < 0) current_index = 0;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        let next = (current_index + 1) % tabs.length;
        for (let i = 0; i < tabs.length; i++) {
          if (!tabs[next].classList.contains('tab-disabled')) break;
          next = (next + 1) % tabs.length;
        }
        set_active(Number(tabs[next].getAttribute('data-tab-index')));
        tabs[next].focus();
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        let prev = (current_index - 1 + tabs.length) % tabs.length;
        for (let i = 0; i < tabs.length; i++) {
          if (!tabs[prev].classList.contains('tab-disabled')) break;
          prev = (prev - 1 + tabs.length) % tabs.length;
        }
        set_active(Number(tabs[prev].getAttribute('data-tab-index')));
        tabs[prev].focus();
      }
    });

    set_active(0);
  </script>
</body>
</html>`;
};

module.exports = {
    build_tabbed_panel_fixture_html
};
