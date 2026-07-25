const { expect } = require('chai');

const jsgui = require('../../html-core/html-core');
const Data_Grid = require('../../controls/connected/Data_Grid');
const Data_Table = require('../../controls/organised/1-standard/4-data/Data_Table');
const Data_Filter = require('../../controls/organised/1-standard/4-data/Data_Filter');
const {
    MAX_ROWS,
    serialize_tabular_state
} = require('../../controls/organised/1-standard/4-data/tabular_activation_state');

const columns = [
    { key: 'name', label: 'Control' },
    { key: 'group', label: 'Group' }
];
const rows = Array.from({ length: 18 }, (_, index) => ({
    name: `Control_${String(index + 1).padStart(2, '0')}`,
    group: index % 2 ? 'Data' : 'Layout'
})).reverse();

const control_map = () => Object.assign({}, jsgui.map_Controls, {
    control: jsgui.Control,
    data_filter: Data_Filter,
    data_grid: Data_Grid,
    data_table: Data_Table
});

const server_render = spec => {
    const context = new jsgui.Page_Context();
    return new Data_Grid(Object.assign({ context }, spec)).all_html_render();
};

const fresh_activate = html => {
    document.body.innerHTML = html;
    const first_row = document.querySelector('tbody tr');
    const context = new jsgui.Page_Context({ map_Controls: control_map() });
    jsgui.pre_activate(context);
    jsgui.activate(context);
    const controls = Object.values(context.map_controls);
    return {
        first_row,
        grid: controls.find(control => control && control.__type_name === 'data_grid'),
        table: controls.find(control => control && control.__type_name === 'data_table')
    };
};

describe('Data_Grid static activation state', function () {
    this.timeout(15000);

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('keeps sort indicators ASCII-only for production CSS extraction', () => {
        const sort_css = Data_Table.css.slice(
            Data_Table.css.indexOf('/* Sort indicators */'),
            Data_Table.css.indexOf('/* Rows */')
        );
        expect(sort_css).to.match(/aria-sort="ascending"/);
        expect(sort_css).to.match(/border-bottom: 6px solid/);
        expect(sort_css).to.not.match(/[^\x00-\x7F]/);
    });

    it('is explicit and rejects functions or oversized row sets', () => {
        expect(serialize_tabular_state({
            columns,
            rows,
            page_size: 6,
            selection_mode: 'single'
        })).to.be.a('string');
        expect(serialize_tabular_state({
            columns: [{ key: 'name', render: value => value }],
            rows
        })).to.equal(null);
        expect(serialize_tabular_state({
            columns,
            rows: Array.from({ length: MAX_ROWS + 1 }, () => ({ name: 'x' }))
        })).to.equal(null);

        const legacy_html = server_render({ columns, rows, page_size: 6 });
        expect(legacy_html).to.not.include('data-jsgui-tabular-state');
    });

    it('retains the SSR page, restores its model, and updates bounded table DOM', () => {
        const html = server_render({
            columns,
            rows,
            page_size: 6,
            selection_mode: 'single',
            persist_activation_state: true
        });
        document.body.innerHTML = html;
        expect(document.querySelectorAll('tbody tr')).to.have.lengthOf(6);
        expect(document.querySelector('table').hasAttribute('data-jsgui-tabular-state')).to.equal(true);

        const activated = fresh_activate(html);
        const { grid, table, first_row } = activated;
        expect(grid).to.exist;
        expect(table).to.exist;
        expect(document.querySelector('tbody tr')).to.equal(first_row);
        expect(table.rows).to.have.lengthOf(18);
        expect(table.columns).to.have.lengthOf(2);
        expect(table.selection_mode).to.equal('single');
        expect(grid.table).to.equal(table);

        document.querySelector('th[data-column-key="name"]').dispatchEvent(
            new window.MouseEvent('click', { bubbles: true, cancelable: true })
        );
        expect(document.querySelector('th[data-column-key="name"]').getAttribute('aria-sort')).to.equal('ascending');
        expect(document.querySelector('tbody tr td').textContent).to.equal('Control_01');

        grid.set_page(2);
        expect(document.querySelectorAll('tbody tr')).to.have.lengthOf(6);
        expect(document.querySelector('tbody tr td').textContent).to.equal('Control_07');
        expect(document.querySelector('tbody tr').getAttribute('aria-rowindex')).to.equal('8');

        let selection_events = 0;
        grid.on('selection_change', () => { selection_events += 1; });
        document.querySelector('tbody tr td').dispatchEvent(
            new window.MouseEvent('click', { bubbles: true, cancelable: true })
        );
        expect(selection_events).to.equal(1);
        expect(grid.selection.row_data.name).to.equal('Control_07');

        grid.set_filters({ name: 'Control_18' });
        expect(document.querySelectorAll('tbody tr')).to.have.lengthOf(1);
        expect(document.querySelector('tbody tr td').textContent).to.equal('Control_18');
        expect(document.querySelector('table').getAttribute('aria-rowcount')).to.equal('2');
    });

    it('persists the current page, filters, sort, and selection across a second fresh reconstruction', () => {
        const first = fresh_activate(server_render({
            columns,
            rows,
            page_size: 6,
            selection_mode: 'single',
            persist_activation_state: true
        }));
        first.grid.set_sort_state({ key: 'name', direction: 'asc' });
        first.grid.set_filters({ group: { op: 'equals', value: 'Data' } });
        first.grid.set_page(2);
        first.grid.set_selection({
            row_index: 0,
            row_data: first.table.visible_rows[0]
        });
        const current_html = document.body.innerHTML;

        const second = fresh_activate(current_html);
        expect(second.table.sort_state).to.deep.equal({ key: 'name', direction: 'asc' });
        expect(second.table.filters).to.deep.equal({ group: { op: 'equals', value: 'Data' } });
        expect(second.table.page).to.equal(2);
        expect(second.grid.page).to.equal(2);
        expect(second.table.get_selected_rows()).to.deep.equal([0]);
        expect(document.querySelector('tbody tr').classList.contains('is-selected')).to.equal(true);
        expect(document.querySelector('tbody tr').getAttribute('aria-selected')).to.equal('true');
    });

    it('restores and operates Data_Filter after fresh activation without duplicate handlers', () => {
        const context = new jsgui.Page_Context();
        const filter = new Data_Filter({
            context,
            fields: [
                { name: 'name', label: 'Name', type: 'string' },
                { name: 'age', label: 'Age', type: 'number' }
            ],
            filters: [{ field: 'name', operator: 'contains', value: 'Ali' }],
            persist_activation_state: true
        });
        document.body.innerHTML = filter.all_html_render();
        const activate_context = new jsgui.Page_Context({ map_Controls: control_map() });
        jsgui.pre_activate(activate_context);
        jsgui.activate(activate_context);
        const activated = Object.values(activate_context.map_controls)
            .find(control => control && control.__type_name === 'data_filter');
        let changes = 0;
        activated.on('filter_change', () => { changes += 1; });

        activated.activate();
        const input = document.querySelector('.data-filter-value');
        input.value = 'Bob';
        input.dispatchEvent(new window.Event('input', { bubbles: true }));

        expect(changes).to.equal(1);
        expect(activated.get_filter_map()).to.deep.equal({
            name: { op: 'contains', value: 'Bob' }
        });

        const field = document.querySelector('.data-filter-field');
        field.value = 'age';
        field.dispatchEvent(new window.Event('change', { bubbles: true }));
        expect(document.querySelector('.data-filter-operator').value).to.equal('equals');
        expect(Array.from(document.querySelectorAll('.data-filter-operator option'))
            .map(option => option.value)).to.include.members(['greater_than', 'less_or_eq']);

        const second_html = document.body.innerHTML;
        document.body.innerHTML = second_html;
        const second_context = new jsgui.Page_Context({ map_Controls: control_map() });
        jsgui.pre_activate(second_context);
        jsgui.activate(second_context);
        const second = Object.values(second_context.map_controls)
            .find(control => control && control.__type_name === 'data_filter');
        expect(second.get_filter_map()).to.deep.equal({
            age: { op: 'equals', value: 'Bob' }
        });
    });

    it('omits unsafe Data_Filter persistence and ignores malformed state', () => {
        const unsafe = new Data_Filter({
            context: new jsgui.Page_Context(),
            fields: ['name'],
            operators: {
                string: [{ value: 'custom', label: 'custom', match: () => true }]
            },
            persist_activation_state: true
        });
        expect(unsafe.dom.attributes['data-jsgui-filter-state']).to.equal(undefined);

        const element = document.createElement('div');
        element.setAttribute('data-jsgui-filter-state', '{broken');
        const restored = new Data_Filter({
            context: new jsgui.Page_Context(),
            el: element
        });
        expect(restored.get_filters()).to.deep.equal([]);
    });
});
