const assert = require('assert');
const { JSDOM } = require('jsdom');
const jsgui = require('../../html-core/html-core');
const Data_Table = require('../../controls/organised/1-standard/4-data/Data_Table');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.navigator = { userAgent: 'node.js' };

function find_child(ctrl, predicate) {
    if (predicate(ctrl)) return ctrl;
    const children = ctrl.content && ctrl.content._arr;
    if (Array.isArray(children)) {
        for (const child of children) {
            if (child && typeof child === 'object' && child.dom) {
                const found = find_child(child, predicate);
                if (found) return found;
            }
        }
    }
    return null;
}

function find_all_children(ctrl, predicate) {
    const results = [];
    const walk = c => {
        if (predicate(c)) results.push(c);
        const ch = c.content && c.content._arr;
        if (Array.isArray(ch)) ch.forEach(x => { if (x && x.dom) walk(x); });
    };
    walk(ctrl);
    return results;
}

const COLUMNS = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'email', label: 'Email', sortable: false }
];

const ROWS = [
    { name: 'Alice', age: 30, email: 'alice@test.com' },
    { name: 'Bob', age: 25, email: 'bob@test.com' },
    { name: 'Charlie', age: 35, email: 'charlie@test.com' },
    { name: 'Diana', age: 28, email: 'diana@test.com' },
    { name: 'Eve', age: 32, email: 'eve@test.com' }
];

function make_table(spec = {}) {
    const context = new jsgui.Page_Context();
    return new Data_Table({ context, columns: COLUMNS, rows: ROWS, ...spec });
}

async function run_tests() {
    console.log('Starting Data_Table tests...');

    // Test 1: Default instantiation
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({ context, columns: COLUMNS, rows: ROWS });

        assert.ok(table.has_class('jsgui-data-table'));
        assert.strictEqual(table.dom.tagName, 'table');
        assert.strictEqual(table.dom.attributes.role, 'grid');
        assert.ok(table.dom.attributes['aria-label']);

        console.log('Test 1 Passed: Default instantiation');
    }

    // Test 2: aria-colcount and aria-rowcount
    {
        const table = make_table();

        assert.strictEqual(table.dom.attributes['aria-colcount'], '3');
        assert.strictEqual(table.dom.attributes['aria-rowcount'], '6'); // 5 rows + 1 header

        console.log('Test 2 Passed: aria-colcount and aria-rowcount');
    }

    // Test 3: Headers have role=columnheader and aria-sort
    {
        const table = make_table();

        const headers = find_all_children(table, c =>
            c.has_class && c.has_class('data-table-header'));
        assert.strictEqual(headers.length, 3);

        headers.forEach(h => {
            assert.strictEqual(h.dom.attributes.role, 'columnheader');
            assert.strictEqual(h.dom.attributes.scope, 'col');
        });

        // Sortable headers have aria-sort
        const name_header = headers.find(h => h.dom.attributes['data-column-key'] === 'name');
        assert.ok(name_header);
        assert.strictEqual(name_header.dom.attributes['aria-sort'], 'none');

        console.log('Test 3 Passed: Headers have role=columnheader');
    }

    // Test 4: Data rows have role=row and aria-rowindex
    {
        const table = make_table();

        const rows = find_all_children(table, c =>
            c.has_class && c.has_class('data-table-row'));
        assert.strictEqual(rows.length, 5);

        rows.forEach((row, i) => {
            assert.strictEqual(row.dom.attributes.role, 'row');
            assert.strictEqual(row.dom.attributes['aria-rowindex'], String(i + 2)); // 1-based, header is 1
        });

        console.log('Test 4 Passed: Rows have role=row and aria-rowindex');
    }

    // Test 5: Cells have role=gridcell
    {
        const table = make_table();

        const cells = find_all_children(table, c =>
            c.has_class && c.has_class('data-table-cell'));
        assert.strictEqual(cells.length, 15); // 5 rows × 3 columns

        cells.forEach(cell => {
            assert.strictEqual(cell.dom.attributes.role, 'gridcell');
        });

        console.log('Test 5 Passed: Cells have role=gridcell');
    }

    // Test 6: Sort state updates aria-sort
    {
        const table = make_table({ sort_state: { key: 'name', direction: 'asc' } });

        const headers = find_all_children(table, c =>
            c.has_class && c.has_class('data-table-header'));
        const name_header = headers.find(h => h.dom.attributes['data-column-key'] === 'name');
        assert.strictEqual(name_header.dom.attributes['aria-sort'], 'ascending');

        console.log('Test 6 Passed: Sort state sets aria-sort');
    }

    // Test 7: Descending sort
    {
        const table = make_table({ sort_state: { key: 'age', direction: 'desc' } });

        const headers = find_all_children(table, c =>
            c.has_class && c.has_class('data-table-header'));
        const age_header = headers.find(h => h.dom.attributes['data-column-key'] === 'age');
        assert.strictEqual(age_header.dom.attributes['aria-sort'], 'descending');

        console.log('Test 7 Passed: Descending sort sets aria-sort');
    }

    // Test 8: Density default is comfortable
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({ context, columns: COLUMNS, rows: ROWS });

        assert.strictEqual(table.dom.attributes['data-density'], 'comfortable');

        console.log('Test 8 Passed: Default density is comfortable');
    }

    // Test 9: Compact density via spec
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({ context, columns: COLUMNS, rows: ROWS, density: 'compact' });

        assert.strictEqual(table.dom.attributes['data-density'], 'compact');

        console.log('Test 9 Passed: Compact density');
    }

    // Test 10: Dense density
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({ context, columns: COLUMNS, rows: ROWS, density: 'dense' });

        assert.strictEqual(table.dom.attributes['data-density'], 'dense');

        console.log('Test 10 Passed: Dense density');
    }

    // Test 11: Backward compat — compact: true sets density=compact
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({ context, columns: COLUMNS, rows: ROWS, compact: true });

        assert.strictEqual(table.dom.attributes['data-density'], 'compact');

        console.log('Test 11 Passed: Backward compat compact: true');
    }

    // Test 12: Pagination — page, page_size
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({
            context, columns: COLUMNS, rows: ROWS,
            page: 1, page_size: 2
        });

        const visible = table.get_visible_rows();
        assert.strictEqual(visible.length, 2);

        console.log('Test 12 Passed: Pagination');
    }

    // Test 13: set_rows and set_columns API
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({ context, columns: COLUMNS, rows: ROWS });

        table.set_rows([{ name: 'Zara', age: 40, email: 'z@z.com' }]);
        assert.strictEqual(table.rows.length, 1);

        table.set_columns([{ key: 'x', label: 'X' }]);
        assert.strictEqual(table.columns.length, 1);

        console.log('Test 13 Passed: set_rows and set_columns');
    }

    // Test 14: set_sort_state API
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({ context, columns: COLUMNS, rows: ROWS });

        table.set_sort_state({ key: 'name', direction: 'asc' });
        assert.deepStrictEqual(table.sort_state, { key: 'name', direction: 'asc' });
        assert.strictEqual(table.page, 1, 'sort resets to page 1');

        console.log('Test 14 Passed: set_sort_state');
    }

    // Test 15: set_filters API
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({ context, columns: COLUMNS, rows: ROWS });

        table.set_filters({ name: 'Ali' });
        const visible = table.get_visible_rows();
        assert.strictEqual(visible.length, 1);
        assert.strictEqual(visible[0].name, 'Alice');

        console.log('Test 15 Passed: set_filters');
    }

    // Test 16: Custom aria-label
    {
        const context = new jsgui.Page_Context();
        const table = new Data_Table({
            context, columns: COLUMNS, rows: ROWS,
            aria_label: 'User list'
        });

        assert.strictEqual(table.dom.attributes['aria-label'], 'User list');

        console.log('Test 16 Passed: Custom aria-label');
    }

    // Test 17: CSS uses theme tokens
    {
        const css = Data_Table.css;
        const lines = css.split('\n');
        const bad_lines = lines.filter(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;
            const has_hex = /#[0-9a-fA-F]{3,8}\b/.test(trimmed);
            const is_var_fallback = /var\([^)]*#[0-9a-fA-F]{3,8}/.test(trimmed);
            const is_rgba = /rgba?\(/.test(trimmed);
            return has_hex && !is_var_fallback && !is_rgba;
        });

        assert.strictEqual(bad_lines.length, 0,
            `CSS should not have hardcoded hex. Found: ${bad_lines.join('; ')}`);
        assert.ok(css.includes('var(--j-'), 'CSS should use --j- tokens');
        assert.ok(!css.includes('--admin-'), 'CSS should not have --admin- tokens');

        console.log('Test 17 Passed: CSS uses theme tokens');
    }

    // Test 18: CSS has density variants
    {
        const css = Data_Table.css;
        assert.ok(css.includes('data-density="comfortable"'), 'should have comfortable density');
        assert.ok(css.includes('data-density="compact"'), 'should have compact density');
        assert.ok(css.includes('data-density="dense"'), 'should have dense density');

        console.log('Test 18 Passed: CSS density variants');
    }

    // Test 19: CSS has focus-visible
    {
        const css = Data_Table.css;
        assert.ok(css.includes(':focus-visible'), 'CSS should have focus-visible');
        assert.ok(css.includes('.data-table-cell:focus-visible'), 'cells should have focus-visible');
        assert.ok(css.includes('.data-table-row:focus-visible'), 'rows should have focus-visible');

        console.log('Test 19 Passed: CSS focus-visible');
    }

    // Test 20: CSS has aria-busy loading state
    {
        const css = Data_Table.css;
        assert.ok(css.includes('aria-busy="true"'), 'should have loading state');

        console.log('Test 20 Passed: CSS aria-busy loading');
    }

    console.log(`\nAll 20 Data_Table tests passed!`);
}

run_tests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
