const jsgui = require('../../../../html-core/html-core');
const Separator = require('../../../../controls/organised/0-core/0-basic/1-compositional/separator');

const build_separator_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const horizontal = new Separator({
        context,
        orientation: 'horizontal',
        decorative: true
    });

    const vertical = new Separator({
        context,
        orientation: 'vertical',
        decorative: false
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Separator Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .box { width: 360px; border: 1px solid #ddd; padding: 12px; margin-bottom: 12px; }
    .row { display: flex; align-items: center; gap: 12px; height: 80px; }
    ${Separator.css || ''}
  </style>
</head>
<body>
  <div class="box">
    <h3>Horizontal</h3>
    <div id="horizontal-wrap">${horizontal.html}</div>
  </div>

  <div class="box">
    <h3>Vertical</h3>
    <div class="row">
      <span>Left</span>
      <div id="vertical-wrap" style="height: 60px;">${vertical.html}</div>
      <span>Right</span>
    </div>
  </div>

  <button id="toggle">Toggle vertical/horizontal (DOM attr)</button>

  <script>
    const toggle = document.getElementById('toggle');
    const sep = document.querySelector('#vertical-wrap .jsgui-separator');
    toggle.addEventListener('click', () => {
      const current = sep.getAttribute('data-orientation');
      const next = current === 'vertical' ? 'horizontal' : 'vertical';
      sep.setAttribute('data-orientation', next);
      sep.setAttribute('aria-orientation', next);
      document.body.setAttribute('data-last-orientation', next);
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_separator_fixture_html
};
