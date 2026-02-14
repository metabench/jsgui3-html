const jsgui = require('../../../../html-core/html-core');
const Status_Bar = require('../../../../controls/organised/1-standard/5-ui/status_bar');

const build_status_bar_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const status_bar = new Status_Bar({
        context,
        status: 'info',
        text: 'Ready',
        meta_text: 'Ln 12, Col 4'
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Status Bar Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .controls { margin-top: 12px; display: flex; gap: 8px; }
    ${Status_Bar.css || ''}
  </style>
</head>
<body>
  <div id="status-wrap">${status_bar.html}</div>
  <div class="controls">
    <button id="set-success" type="button">Success</button>
    <button id="set-warning" type="button">Warning</button>
    <button id="set-error" type="button">Error</button>
  </div>
  <script>
    const root = document.querySelector('#status-wrap .jsgui-status-bar');
    const left = root.querySelector('.status-bar-left');
    const right = root.querySelector('.status-bar-right');

    const set_state = (status, text, meta) => {
      root.setAttribute('data-status', status);
      left.textContent = text;
      right.textContent = meta;
    };

    document.getElementById('set-success').addEventListener('click', () => {
      set_state('success', 'Saved successfully', 'All checks passed');
    });

    document.getElementById('set-warning').addEventListener('click', () => {
      set_state('warning', 'Unsaved changes', 'Press Ctrl+S');
    });

    document.getElementById('set-error').addEventListener('click', () => {
      set_state('error', 'Save failed', 'Retry required');
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_status_bar_fixture_html
};
