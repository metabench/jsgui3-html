const jsgui = require('../../../../html-core/html-core');
const Console_Panel = require('../../../../controls/organised/1-standard/5-ui/console_panel');

const build_console_panel_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const panel = new Console_Panel({
        context,
        title: 'Build Console',
        max_lines: 3,
        lines: ['[info] Starting build', '[info] Resolving modules']
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Console Panel Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .actions { margin-top: 10px; display: flex; gap: 8px; }
    ${Console_Panel.css || ''}
  </style>
</head>
<body>
  <div id="console-wrap">${panel.html}</div>
  <div class="actions">
    <button id="append" type="button">Append</button>
    <button id="append-error" type="button">Append Error</button>
    <button id="clear" type="button">Clear</button>
  </div>
  <script>
    const output = document.querySelector('#console-wrap .console-panel-output');
    let lines = ['[info] Starting build', '[info] Resolving modules'];
    const max_lines = 3;

    const sync_output = () => {
      output.textContent = lines.join('\\n');
    };

    const append_line = line => {
      lines.push(line);
      if (lines.length > max_lines) {
        lines = lines.slice(lines.length - max_lines);
      }
      sync_output();
    };

    document.getElementById('append').addEventListener('click', () => {
      append_line('[info] Step complete');
    });

    document.getElementById('append-error').addEventListener('click', () => {
      append_line('[error] Build failed');
    });

    document.getElementById('clear').addEventListener('click', () => {
      lines = [];
      sync_output();
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_console_panel_fixture_html
};
