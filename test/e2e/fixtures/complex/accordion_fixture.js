const jsgui = require('../../../../html-core/html-core');
const Accordion = require('../../../../controls/organised/1-standard/6-layout/accordion');

const build_accordion_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const accordion = new Accordion({
        context,
        allow_multiple: true,
        sections: [
            { id: 'a', title: 'Section A', content: 'Content A', open: true },
            { id: 'b', title: 'Section B', content: 'Content B' },
            { id: 'c', title: 'Section C', content: 'Content C' }
        ]
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Accordion Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; max-width: 700px; }
    ${Accordion.css || ''}
  </style>
</head>
<body>
  <div id="accordion-wrap">${accordion.html}</div>
  <div id="log" aria-live="polite"></div>
  <script>
    const root = document.querySelector('#accordion-wrap .jsgui-accordion');
    const log = document.getElementById('log');

    const toggle = section => {
      const open = section.classList.contains('is-open');
      section.classList.toggle('is-open', !open);
      const id = section.querySelector('.accordion-header')?.getAttribute('data-section-id');
      log.textContent = 'toggle:' + id + ':' + (!open ? 'open' : 'closed');
    };

    root.querySelectorAll('.accordion-header').forEach(header => {
      header.setAttribute('tabindex', '0');
      header.addEventListener('click', () => {
        const section = header.closest('.accordion-section');
        if (section) toggle(section);
      });
      header.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const section = header.closest('.accordion-section');
          if (section) toggle(section);
        }
      });
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_accordion_fixture_html
};
