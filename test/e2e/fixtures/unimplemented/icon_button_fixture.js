const jsgui = require('../../../../html-core/html-core');
const Icon_Button = require('../../../../controls/organised/1-standard/5-ui/icon_button');

const build_icon_button_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const normal = new Icon_Button({
        context,
        icon: '🖨',
        aria_label: 'Print',
        tooltip: 'Print document'
    });

    const toggled = new Icon_Button({
        context,
        icon: '★',
        aria_label: 'Favorite',
        toggle: true,
        pressed: false
    });

    const disabled = new Icon_Button({
        context,
        icon: '🗑',
        aria_label: 'Delete',
        disabled: true
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Icon Button Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .row { display: flex; gap: 10px; align-items: center; }
    ${Icon_Button.css || ''}
  </style>
</head>
<body>
  <div class="row">
    <div id="normal-wrap">${normal.html}</div>
    <div id="toggle-wrap">${toggled.html}</div>
    <div id="disabled-wrap">${disabled.html}</div>
  </div>
  <div id="log" aria-live="polite"></div>

  <script>
    const log = document.getElementById('log');
    const normalEl = document.querySelector('#normal-wrap .jsgui-icon-button');
    const toggleEl = document.querySelector('#toggle-wrap .jsgui-icon-button');
    const disabledEl = document.querySelector('#disabled-wrap .jsgui-icon-button');

    normalEl.addEventListener('click', () => {
      log.textContent = 'normal-click';
    });

    toggleEl.addEventListener('click', () => {
      const pressed = toggleEl.getAttribute('aria-pressed') === 'true';
      const next = !pressed;
      toggleEl.setAttribute('aria-pressed', next ? 'true' : 'false');
      toggleEl.classList.toggle('icon-button-pressed', next);
      log.textContent = next ? 'toggle-on' : 'toggle-off';
    });

    disabledEl.addEventListener('click', () => {
      log.textContent = 'disabled-click';
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_icon_button_fixture_html
};
