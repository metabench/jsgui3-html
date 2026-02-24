const jsgui = require('../../../html-core/html-core');
const Data_Table = require('../../../controls/organised/1-standard/4-data/Data_Table');
const Data_Filter = require('../../../controls/organised/1-standard/4-data/Data_Filter');
const Data_Grid = require('../../../controls/connected/Data_Grid');

/**
 * Build fixture HTML for Data_Table standalone tests.
 * Shows a table with 5 rows, sortable columns, and client-side paging.
 */
const build_data_table_fixture_html = () => {
  const context = new jsgui.Page_Context();

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'age', label: 'Age', sortable: true }
  ];

  const rows = [
    { id: 1, name: 'Alice', role: 'admin', age: 30 },
    { id: 2, name: 'Bob', role: 'editor', age: 25 },
    { id: 3, name: 'Charlie', role: 'viewer', age: 35 },
    { id: 4, name: 'Diana', role: 'admin', age: 28 },
    { id: 5, name: 'Eve', role: 'editor', age: 40 }
  ];

  const table = new Data_Table({ context, columns, rows, page_size: 3 });
  table.dom.attributes.id = 'test-table';

  // Empty table for empty state test
  const empty_table = new Data_Table({ context, columns, rows: [] });
  empty_table.dom.attributes.id = 'test-empty-table';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Data_Table Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a2e; color: #eee; }
    h2 { color: #5b9bd5; }
    ${Data_Table.css || ''}
  </style>
</head>
<body>
  <h2>Data_Table — Populated (page_size=3)</h2>
  <div id="table-wrap">${table.html}</div>

  <h2>Data_Table — Empty</h2>
  <div id="empty-wrap">${empty_table.html}</div>

  <div id="log" aria-live="polite"></div>
  <script>
    // Log sort clicks
    const th_cells = document.querySelectorAll('#test-table th[aria-sort]');
    th_cells.forEach(th => {
      th.addEventListener('click', () => {
        document.getElementById('log').textContent = 'sorted:' + th.textContent;
      });
    });
  </script>
</body>
</html>`;
};

/**
 * Build fixture HTML for Data_Filter standalone tests.
 */
const build_data_filter_fixture_html = () => {
  const context = new jsgui.Page_Context();

  const filter = new Data_Filter({
    context,
    fields: [
      { name: 'name', label: 'Name', type: 'string' },
      { name: 'age', label: 'Age', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' }
    ]
  });
  filter.dom.attributes.id = 'test-filter';

  // Pre-populated filter
  const filter2 = new Data_Filter({
    context,
    fields: ['name', 'role'],
    filters: [
      { field: 'name', operator: 'contains', value: 'Alice' }
    ]
  });
  filter2.dom.attributes.id = 'test-filter-preloaded';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Data_Filter Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a2e; color: #eee; }
    h2 { color: #5b9bd5; }
    ${Data_Filter.css || ''}
  </style>
</head>
<body>
  <h2>Data_Filter — Empty</h2>
  <div id="filter-wrap">${filter.html}</div>

  <h2>Data_Filter — Pre-loaded</h2>
  <div id="filter-preloaded-wrap">${filter2.html}</div>

  <div id="log" aria-live="polite"></div>
</body>
</html>`;
};

/**
 * Build fixture HTML for Data_Grid tests.
 * Shows a grid with static data and one with an empty data source.
 */
const build_data_grid_fixture_html = () => {
  const context = new jsgui.Page_Context();

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' }
  ];

  const rows = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'editor' },
    { id: 3, name: 'Charlie', role: 'viewer' }
  ];

  const grid = new Data_Grid({ context, columns, rows });
  grid.dom.attributes.id = 'test-grid';

  const empty_grid = new Data_Grid({ context, columns, rows: [], empty_text: 'No results found' });
  empty_grid.dom.attributes.id = 'test-empty-grid';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Data_Grid Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a2e; color: #eee; }
    h2 { color: #5b9bd5; }
    ${Data_Table.css || ''}
    ${Data_Grid.css || ''}
  </style>
</head>
<body>
  <h2>Data_Grid — Populated</h2>
  <div id="grid-wrap">${grid.html}</div>

  <h2>Data_Grid — Empty</h2>
  <div id="empty-grid-wrap">${empty_grid.html}</div>

  <div id="log" aria-live="polite"></div>
</body>
</html>`;
};

module.exports = {
  build_data_table_fixture_html,
  build_data_filter_fixture_html,
  build_data_grid_fixture_html
};
