const jsgui = require('../../../../html-core/html-core');
const Link_Button = require('../../../../controls/organised/1-standard/5-ui/link_button');

const build_link_button_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const hover_btn = new Link_Button({ context, text: 'Open details', underline: 'hover' });
    const always_btn = new Link_Button({ context, text: 'Always underlined', underline: 'always' });
    const none_btn = new Link_Button({ context, text: 'No underline', underline: 'none' });
    const disabled_btn = new Link_Button({ context, text: 'Disabled link', underline: 'hover', disabled: true });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Link Button Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .stack { display: flex; flex-direction: column; gap: 10px; }
    ${Link_Button.css || ''}
  </style>
</head>
<body>
  <div class="stack">
    <div id="hover">${hover_btn.html}</div>
    <div id="always">${always_btn.html}</div>
    <div id="none">${none_btn.html}</div>
    <div id="disabled">${disabled_btn.html}</div>
  </div>
  <div id="log" aria-live="polite"></div>
  <script>
    const log = document.getElementById('log');
    document.querySelector('#hover .jsgui-link-button').addEventListener('click', () => { log.textContent = 'hover-click'; });
    document.querySelector('#always .jsgui-link-button').addEventListener('click', () => { log.textContent = 'always-click'; });
    document.querySelector('#none .jsgui-link-button').addEventListener('click', () => { log.textContent = 'none-click'; });
    document.querySelector('#disabled .jsgui-link-button').addEventListener('click', () => { log.textContent = 'disabled-click'; });
  </script>
</body>
</html>`;
};

module.exports = {
    build_link_button_fixture_html
};
