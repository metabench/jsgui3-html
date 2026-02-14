const jsgui = require('../../../../html-core/html-core');
const Split_Button = require('../../../../controls/organised/1-standard/5-ui/split_button');

const build_split_button_fixture_html = () => {
    const context = new jsgui.Page_Context();
    const split = new Split_Button({
        context,
        text: 'Save',
        default_action: 'save',
        items: [
            { id: 'save', text: 'Save' },
            { id: 'save_as', text: 'Save As…' },
            { id: 'save_all', text: 'Save All' }
        ]
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Split Button Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    ${Split_Button.css || ''}
  </style>
</head>
<body>
  <div id="split-wrap">${split.html}</div>
  <div id="log" aria-live="polite"></div>
  <script>
    const root = document.querySelector('#split-wrap .jsgui-split-button');
    const primary = root.querySelector('.split-button-primary');
    const trigger = root.querySelector('.split-button-trigger');
    const menu = root.querySelector('.split-button-menu');
    const log = document.getElementById('log');

    const set_open = open => {
      root.classList.toggle('split-button-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    primary.addEventListener('click', () => {
      log.textContent = 'action:save:primary';
    });

    trigger.addEventListener('click', () => {
      const open = root.classList.contains('split-button-open');
      set_open(!open);
      log.textContent = !open ? 'menu:open' : 'menu:close';
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        set_open(true);
        const first = menu.querySelector('.split-button-menu-item');
        if (first) first.focus();
        log.textContent = 'menu:open:keyboard';
      }
      if (e.key === 'Escape') {
        set_open(false);
        log.textContent = 'menu:close:escape';
      }
    });

    menu.querySelectorAll('.split-button-menu-item').forEach(item => {
      item.setAttribute('tabindex', '0');
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-action-id');
        set_open(false);
        log.textContent = 'action:' + id + ':menu';
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          set_open(false);
          trigger.focus();
          log.textContent = 'menu:close:escape';
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) {
        set_open(false);
      }
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_split_button_fixture_html
};
