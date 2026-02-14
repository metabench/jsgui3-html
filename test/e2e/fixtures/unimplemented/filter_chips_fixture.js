const jsgui = require('../../../../html-core/html-core');
const Filter_Chips = require('../../../../controls/organised/1-standard/5-ui/filter_chips');

const build_filter_chips_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const filters = new Filter_Chips({
        context,
        multiple: true,
        items: [
            { id: 'all', label: 'All', selected: true },
            { id: 'open', label: 'Open' },
            { id: 'closed', label: 'Closed' },
            { id: 'archived', label: 'Archived', disabled: true }
        ]
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Filter Chips Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    ${Filter_Chips.css || ''}
  </style>
</head>
<body>
  <div id="chips-wrap">${filters.html}</div>
  <div id="log" aria-live="polite"></div>
  <script>
    const root = document.querySelector('#chips-wrap .jsgui-filter-chips');
    const log = document.getElementById('log');
    const chips = Array.from(root.querySelectorAll('.filter-chip'));

    const selected_ids = () => chips
      .filter(chip => chip.getAttribute('aria-pressed') === 'true')
      .map(chip => chip.getAttribute('data-chip-id'));

    const sync_log = () => {
      log.textContent = selected_ids().join(',');
    };

    const toggle_chip = chip => {
      if (chip.hasAttribute('disabled')) return;
      const selected = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', selected ? 'false' : 'true');
      chip.classList.toggle('filter-chip-selected', !selected);
      sync_log();
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => toggle_chip(chip));
      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle_chip(chip);
        }
      });
    });

    sync_log();
  </script>
</body>
</html>`;
};

module.exports = {
    build_filter_chips_fixture_html
};
