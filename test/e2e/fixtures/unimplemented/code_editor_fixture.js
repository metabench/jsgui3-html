const jsgui = require('../../../../html-core/html-core');
const Code_Editor = require('../../../../controls/organised/1-standard/1-editor/code_editor');

const build_code_editor_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const editor = new Code_Editor({
        context,
        language: 'javascript',
        value: 'const sum = (a, b) => a + b;',
        placeholder: 'Write code...'
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Code Editor Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .actions { margin-top: 10px; display: flex; gap: 8px; }
    ${Code_Editor.css || ''}
  </style>
</head>
<body>
  <div id="editor-wrap">${editor.html}</div>
  <div class="actions">
    <button id="set-ts" type="button">Set TypeScript</button>
    <button id="set-sample" type="button">Set Sample</button>
  </div>
  <script>
    const root = document.querySelector('#editor-wrap .jsgui-code-editor');
    const language = root.querySelector('.code-editor-language');
    const textarea = root.querySelector('.code-editor-textarea');

    document.getElementById('set-ts').addEventListener('click', () => {
      root.setAttribute('data-language', 'typescript');
      language.textContent = 'typescript';
    });

    document.getElementById('set-sample').addEventListener('click', () => {
      textarea.value = 'interface Point { x: number; y: number; }';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_code_editor_fixture_html
};
