'use strict';

const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.CustomEvent = dom.window.CustomEvent;

const jsgui = require('../../../html-core/html-core');
const registry = require('../../../controls/controls');

const build_control_map = () => {
    const map_controls = {};
    Object.keys(jsgui.controls || {}).forEach((name) => {
        map_controls[name.toLowerCase()] = jsgui.controls[name];
    });
    Object.keys(registry).forEach((name) => {
        if (typeof registry[name] === 'function') {
            map_controls[name.toLowerCase()] = registry[name];
        }
    });
    return map_controls;
};

const find_control = (context, type_name) => {
    return Object.values(context.map_controls).find(control => {
        return control && control.__type_name === type_name;
    });
};

const boot_fresh_context = html => {
    document.body.innerHTML = html;
    const first_row_before_activation = document.querySelector('tbody tr');
    const client_context = new jsgui.Page_Context({ map_Controls: build_control_map() });
    jsgui.pre_activate(client_context);
    jsgui.activate(client_context);
    return {
        client_context,
        first_row_before_activation,
        client_grid: find_control(client_context, 'data_grid'),
        client_table: find_control(client_context, 'data_table')
    };
};

const rows = Array.from({ length: 24 }, (_, index) => ({
    name: `Control_${String(index + 1).padStart(2, '0')}`,
    group: index % 2 ? 'Data' : 'Layout'
})).reverse();
const columns = [
    { key: 'name', label: 'Control' },
    { key: 'group', label: 'Group' }
];

// Compatibility guard: state remains opt-in.
const legacy_context = new jsgui.Page_Context();
const legacy_grid = new registry.Data_Grid({
    context: legacy_context,
    columns,
    rows
});
const legacy = boot_fresh_context(legacy_grid.all_html_render());
assert.strictEqual(legacy.client_table.rows.length, 0, 'non-opt-in tables keep the legacy state contract');
assert.strictEqual(
    document.querySelectorAll('tbody tr').length,
    rows.length,
    'non-opt-in activation still preserves existing SSR rows'
);
legacy.client_table.raise('row_click', { row_index: 0, row_data: rows[0] });
assert.strictEqual(
    legacy.client_grid.selection.row_data,
    rows[0],
    'the Data_Grid event bridge is restored independently of model persistence'
);

// Opt-in static state: bounded SSR plus functional post-activation updates.
const server_context = new jsgui.Page_Context();
const grid = new registry.Data_Grid({
    context: server_context,
    columns,
    rows,
    page_size: 6,
    selection_mode: 'single',
    persist_activation_state: true
});
const html = grid.all_html_render();
document.body.innerHTML = html;
const server_row_count = document.querySelectorAll('tbody tr').length;
assert.strictEqual(server_row_count, 6, 'SSR should render only the configured first page');
assert.ok(
    document.querySelector('table').hasAttribute('data-jsgui-tabular-state'),
    'opt-in table should carry bounded activation state'
);

const activated = boot_fresh_context(html);
const { client_context, client_grid, client_table, first_row_before_activation } = activated;
assert.ok(client_grid, 'fresh context should reconstruct a typed Data_Grid');
assert.ok(client_table, 'fresh context should reconstruct a typed Data_Table');
assert.strictEqual(
    document.querySelector('tbody tr'),
    first_row_before_activation,
    'initial activation should retain the server-rendered first row'
);
assert.strictEqual(document.querySelectorAll('tbody tr').length, 6, 'initial activation should retain the bounded SSR page');
assert.strictEqual(client_grid.columns.length, 2, 'Data_Grid should adopt restored columns');
assert.strictEqual(client_table.columns.length, 2, 'Data_Table should restore columns');
assert.strictEqual(client_table.rows.length, rows.length, 'Data_Table should restore all static model rows');
assert.strictEqual(client_table.selection_mode, 'single', 'selection mode should survive activation');
assert.strictEqual(client_grid.table, client_table, 'control fields should restore the inner table reference');

const ids = [...document.querySelectorAll('[data-jsgui-id]')].map(element => element.getAttribute('data-jsgui-id'));
assert.strictEqual(new Set(ids).size, ids.length, 'activation should not create duplicate control ids');

const first_header = document.querySelector('th[data-column-key="name"]');
first_header.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
const sorted_header = document.querySelector('th[data-column-key="name"]');
assert.strictEqual(
    sorted_header.getAttribute('aria-sort'),
    'ascending',
    'restored columns should make header sorting functional'
);
assert.strictEqual(
    document.querySelector('tbody tr td').textContent,
    'Control_01',
    'sorting should re-render the bounded page from the restored full model'
);

client_grid.set_page(2);
assert.strictEqual(document.querySelectorAll('tbody tr').length, 6, 'paging should keep the live DOM bounded');
assert.strictEqual(document.querySelector('tbody tr td').textContent, 'Control_07', 'page two should show the next logical row');
assert.strictEqual(
    document.querySelector('tbody tr').getAttribute('aria-rowindex'),
    '8',
    'paged rows should expose their logical ARIA row index'
);

let selection_events = 0;
client_grid.on('selection_change', () => { selection_events += 1; });
document.querySelector('tbody tr td').dispatchEvent(new window.MouseEvent('click', {
    bubbles: true,
    cancelable: true
}));
assert.strictEqual(selection_events, 1, 'one row click should bridge one Data_Grid selection event');
assert.strictEqual(client_grid.selection.row_data.name, 'Control_07', 'selection should expose restored row data');

client_grid.set_filters({ name: 'Control_24' });
assert.strictEqual(document.querySelectorAll('tbody tr').length, 1, 'filtering should apply to the restored full model');
assert.strictEqual(document.querySelector('tbody tr td').textContent, 'Control_24');
assert.strictEqual(client_table.total_rows, 1);
assert.strictEqual(document.querySelector('table').getAttribute('aria-rowcount'), '2');

console.log(JSON.stringify({
    server_row_count,
    client_row_count: document.querySelectorAll('tbody tr').length,
    client_grid_columns: client_grid.columns.length,
    client_table_columns: client_table.columns.length,
    client_table_rows: client_table.rows.length,
    client_selection_mode: client_table.selection_mode,
    table_reference_restored: client_grid.table === client_table,
    event_bridge_restored: selection_events === 1,
    bounded_page_size: client_table.page_size
}, null, 2));
console.log('Data Grid opt-in reattachment contract verified.');
