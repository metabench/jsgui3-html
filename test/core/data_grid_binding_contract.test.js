const { expect } = require('chai');

const jsgui = require('../../html-core/html-core');
const Data_Grid = require('../../controls/connected/Data_Grid');
const Data_Table = require('../../controls/organised/1-standard/4-data/Data_Table');
const Data_Filter = require('../../controls/organised/1-standard/4-data/Data_Filter');
const async_data_source = require('../../control_mixins/async_data_source');
const {
    MAX_COLUMNS,
    MAX_STATE_CHARACTERS,
    read_tabular_state,
    serialize_tabular_state
} = require('../../controls/organised/1-standard/4-data/tabular_activation_state');

const rows = [
    { name: 'Alice', age: 0, role: 'admin' },
    { name: 'Bob', age: 23, role: 'editor' },
    { name: 'Carol', age: 41, role: 'viewer' }
];
const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'role', label: 'Role' }
];

const make_grid = (spec = {}) => new Data_Grid(Object.assign({
    context: new jsgui.Page_Context(),
    columns,
    rows
}, spec));

describe('Data_Grid and data binding contract', function () {
    this.timeout(15000);

    it('accepts every Data_Filter operator map without an adapter', () => {
        const grid = make_grid();
        const cases = [
            ['contains', 'lic', ['Alice']],
            ['equals', 'Bob', ['Bob']],
            ['not_equals', 'Bob', ['Alice', 'Carol']],
            ['starts_with', 'Ca', ['Carol']],
            ['ends_with', 'ice', ['Alice']]
        ];

        cases.forEach(([operator, value, names]) => {
            grid.set_filters({ name: { op: operator, value } });
            expect(grid.table.visible_rows.map(row => row.name)).to.deep.equal(names);
        });

        [
            ['greater_than', '23', ['Carol']],
            ['less_than', '23', ['Alice']],
            ['greater_or_eq', '23', ['Bob', 'Carol']],
            ['less_or_eq', '0', ['Alice']]
        ].forEach(([operator, value, names]) => {
            grid.set_filters({ age: { operator, value } });
            expect(grid.table.visible_rows.map(row => row.name)).to.deep.equal(names);
        });

        grid.set_filters({ age: 0 });
        expect(grid.table.visible_rows.map(row => row.name)).to.deep.equal(['Alice']);

        grid.set_filters({ name: row => row.role === 'editor' });
        expect(grid.table.visible_rows.map(row => row.name)).to.deep.equal(['Bob']);

        grid.set_filters({ name: { op: 'server_custom', value: 'anything' } });
        expect(grid.table.visible_rows).to.have.lengthOf(3);
    });

    it('uses Data_Filter output directly and resets paging before refresh', () => {
        const calls = [];
        const grid = make_grid({
            data_source: params => {
                calls.push(params);
                return rows;
            },
            page: 2,
            page_size: 1
        });
        const filter = new Data_Filter({
            context: new jsgui.Page_Context(),
            fields: [{ name: 'name', type: 'string' }],
            filters: [{ field: 'name', operator: 'contains', value: 'Ali' }]
        });

        grid.set_filters(filter.get_filter_map());

        expect(grid.page).to.equal(1);
        expect(grid.table.page).to.equal(1);
        expect(grid.model.page).to.equal(1);
        expect(calls[calls.length - 1].page).to.equal(1);
        expect(grid.table.visible_rows.map(row => row.name)).to.deep.equal(['Alice']);
    });

    it('forwards sort and page changes exactly once and keeps pages aligned', () => {
        const grid = make_grid({ page_size: 1 });
        let sort_events = 0;
        let page_events = 0;
        grid.on('sort_change', () => { sort_events += 1; });
        grid.on('page_change', () => { page_events += 1; });

        grid.table.raise('sort_change', {
            sort_state: { key: 'name', direction: 'desc' }
        });
        expect(page_events).to.equal(0);
        grid.table.set_page(2);
        grid.table.raise('sort_change', {
            sort_state: { key: 'name', direction: 'asc' }
        });

        expect(sort_events).to.equal(2);
        expect(page_events).to.equal(2);
        expect(grid.page).to.equal(1);
        expect(grid.table.page).to.equal(1);
        expect(grid.model.page).to.equal(1);
    });

    it('synchronizes initial and programmatic selection with the table model', () => {
        const grid = make_grid({
            selection_mode: 'single',
            selection: { row_index: 1, row_data: rows[1] }
        });

        expect(grid.table.get_selected_rows()).to.deep.equal([1]);
        expect(grid.table.model.selected_row_indices).to.deep.equal([1]);

        grid.set_selection({ row_index: 2, row_data: rows[2] });
        expect(grid.get_selection()).to.deep.equal({ row_index: 2, row_data: rows[2] });
        expect(grid.table.get_selected_rows()).to.deep.equal([2]);
        expect(grid.table.model.selected_row_indices).to.deep.equal([2]);

        grid.set_filters({ name: 'Alice' });
        expect(grid.get_selection()).to.equal(null);
        expect(grid.table.get_selected_rows()).to.deep.equal([]);
    });

    it('unbinds the old table bridge when the table is replaced', () => {
        const grid = make_grid();
        const old_table = grid.table;
        const replacement = new Data_Table({
            context: grid.context,
            columns,
            rows,
            selection_mode: 'single'
        });
        grid.table = replacement;
        grid._bind_table_events();
        let sort_events = 0;
        grid.on('sort_change', () => { sort_events += 1; });

        old_table.raise('sort_change', {
            sort_state: { key: 'name', direction: 'asc' }
        });
        replacement.raise('sort_change', {
            sort_state: { key: 'name', direction: 'desc' }
        });

        expect(sort_events).to.equal(1);
        expect(grid.sort_state).to.deep.equal({ key: 'name', direction: 'desc' });
    });

    it('stops model and pending async work after destroy', async () => {
        let resolve_rows;
        const pending = new Promise(resolve => { resolve_rows = resolve; });
        const grid = make_grid({ data_source: () => pending });
        let loads = 0;
        grid.on('load_complete', () => { loads += 1; });
        grid.destroy();

        grid.model.set('page', 3);
        resolve_rows([{ name: 'Late', age: 1, role: 'late' }]);
        await Promise.resolve();
        await Promise.resolve();

        expect(loads).to.equal(0);
        expect(grid.page).to.equal(1);
        expect(() => grid.destroy()).to.not.throw();
    });

    it('applies only the newest async request and recovers from a synchronous source error', async () => {
        const pending = [];
        const grid = make_grid({
            data_source: () => new Promise(resolve => pending.push(resolve))
        });
        let loads = 0;
        let errors = 0;
        grid.on('load_complete', () => { loads += 1; });
        grid.on('error', () => { errors += 1; });
        grid.refresh();

        pending[1]([{ name: 'Newest', age: 2, role: 'new' }]);
        await Promise.resolve();
        await Promise.resolve();
        pending[0]([{ name: 'Stale', age: 1, role: 'old' }]);
        await Promise.resolve();
        await Promise.resolve();

        expect(grid.table.rows.map(row => row.name)).to.deep.equal(['Newest']);
        expect(loads).to.equal(1);

        grid.set_data_source(() => {
            throw new Error('source failed');
        });
        expect(errors).to.equal(1);
        expect(grid.has_class('error')).to.equal(true);
    });

    it('converges external model updates into the table projection', () => {
        const grid = make_grid({ page_size: 1 });
        grid.model.set('page', 2);
        expect(grid.page).to.equal(2);
        expect(grid.table.page).to.equal(2);
        expect(grid.table.visible_rows[0].name).to.equal('Bob');

        grid.model.set('filters', { role: { op: 'equals', value: 'viewer' } });
        expect(grid.page).to.equal(1);
        expect(grid.table.page).to.equal(1);
        expect(grid.table.visible_rows.map(row => row.name)).to.deep.equal(['Carol']);
    });

    it('invalidates the Data_Table async mixin on destroy', async () => {
        let resolve_rows;
        const table = new Data_Table({
            context: new jsgui.Page_Context(),
            columns,
            rows: []
        });
        async_data_source(table, {
            data_source: () => new Promise(resolve => { resolve_rows = resolve; })
        });
        let loads = 0;
        table.on('data_loaded', () => { loads += 1; });
        const load = table.load_data();
        table.destroy();
        resolve_rows({ rows, total: rows.length });
        await load;

        expect(loads).to.equal(0);
        expect(table.rows).to.deep.equal([]);
    });

    it('rejects unsafe, cyclic, oversized, and incompatible activation state', () => {
        const cyclic = {};
        cyclic.self = cyclic;
        expect(serialize_tabular_state({ columns, rows: [cyclic] })).to.equal(null);
        expect(serialize_tabular_state({ columns, rows: [{ value: 1n }] })).to.equal(null);
        expect(serialize_tabular_state({ columns, rows: [{ value: Symbol('x') }] })).to.equal(null);
        expect(serialize_tabular_state({ columns, rows: [{ value: new Date() }] })).to.equal(null);
        expect(serialize_tabular_state({
            columns: Array.from({ length: MAX_COLUMNS + 1 }, (_, index) => ({ key: index })),
            rows
        })).to.equal(null);
        expect(serialize_tabular_state({
            columns,
            rows: [{ value: 'x'.repeat(MAX_STATE_CHARACTERS) }]
        })).to.equal(null);

        const element = document.createElement('table');
        element.setAttribute('data-jsgui-tabular-state', '{"version":999}');
        expect(read_tabular_state(element)).to.equal(null);
        element.setAttribute('data-jsgui-tabular-state', '{broken');
        expect(read_tabular_state(element)).to.equal(null);
    });
});
