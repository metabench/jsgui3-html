const jsgui = require('../../../../html-core/html-core');
const Drawer = require('../../../../controls/organised/1-standard/6-layout/drawer');

const build_drawer_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const drawer = new Drawer({
        context,
        position: 'right',
        open: false,
        content: 'Drawer content'
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Drawer Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    ${Drawer.css || ''}
  </style>
</head>
<body>
  <button id="open-drawer" type="button">Open Drawer</button>
  <div id="drawer-wrap">${drawer.html}</div>
  <div id="log" aria-live="polite"></div>

  <script>
    const root = document.querySelector('#drawer-wrap .drawer');
    const overlay = root.querySelector('.drawer-overlay');
    const close = root.querySelector('.drawer-close');
    const log = document.getElementById('log');

    const open = () => {
      root.classList.add('is-open');
      log.textContent = 'open';
    };
    const close_drawer = () => {
      root.classList.remove('is-open');
      log.textContent = 'close';
    };

    document.getElementById('open-drawer').addEventListener('click', open);
    overlay.addEventListener('click', close_drawer);
    if (close) close.addEventListener('click', close_drawer);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        close_drawer();
      }
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_drawer_fixture_html
};
