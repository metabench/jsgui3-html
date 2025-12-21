const { expect } = require('chai');
const controls = require('../../controls/controls');

describe('Data Collection Controls', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Data_Table', () => {
        it('sorts rows and sets aria-sort', () => {
            const data_table = new controls.Data_Table({
                context,
                columns: ['name'],
                rows: [
                    { name: 'b' },
                    { name: 'a' }
                ]
            });

            data_table.set_sort_state({ key: 'name', direction: 'asc' });
            const visible = data_table.get_visible_rows();
            expect(visible[0].name).to.equal('a');
            expect(data_table.html).to.include('aria-sort="ascending"');
        });

        it('filters and paginates rows', () => {
            const data_table = new controls.Data_Table({
                context,
                columns: ['status'],
                rows: [
                    { status: 'open' },
                    { status: 'closed' },
                    { status: 'open' }
                ],
                page_size: 1
            });

            data_table.set_filters({ status: 'open' });
            expect(data_table.get_visible_rows()).to.have.lengthOf(1);

            data_table.set_page(2);
            const visible = data_table.get_visible_rows();
            expect(visible[0].status).to.equal('open');
        });
    });

    describe('Virtual_List', () => {
        it('renders a windowed subset of items', () => {
            const items = Array.from({ length: 20 }, (_, index) => `Item ${index}`);
            const virtual_list = new controls.Virtual_List({
                context,
                items,
                item_height: 10,
                height: 30,
                buffer: 1
            });

            const items_ctrl = virtual_list._ctrl_fields.items;
            expect(items_ctrl.content._arr.length).to.equal(5);
        });
    });

    describe('Virtual_Grid', () => {
        it('renders a windowed subset of items', () => {
            const items = Array.from({ length: 20 }, (_, index) => `Cell ${index}`);
            const virtual_grid = new controls.Virtual_Grid({
                context,
                items,
                column_count: 2,
                item_height: 10,
                height: 30,
                gap: 0,
                buffer: 1
            });

            const items_ctrl = virtual_grid._ctrl_fields.items;
            expect(items_ctrl.content._arr.length).to.equal(10);
        });
    });

    describe('Tree_Table', () => {
        it('expands and collapses nodes', () => {
            const tree_table = new controls.Tree_Table({
                context,
                columns: ['label'],
                rows: [
                    {
                        id: 'a',
                        label: 'Alpha',
                        children: [{ id: 'a-1', label: 'Alpha child' }]
                    },
                    { id: 'b', label: 'Beta' }
                ],
                expanded_ids: ['a']
            });

            expect(tree_table.get_visible_nodes()).to.have.lengthOf(3);
            tree_table.toggle_node('a');
            expect(tree_table.get_visible_nodes()).to.have.lengthOf(2);
        });
    });

    describe('Reorderable_List', () => {
        it('moves items in order', () => {
            const reorderable_list = new controls.Reorderable_List({
                context,
                items: ['alpha', 'beta', 'gamma']
            });

            reorderable_list.move_item(0, 1);
            expect(reorderable_list.get_items()).to.deep.equal(['beta', 'alpha', 'gamma']);
        });
    });

    describe('Master_Detail', () => {
        it('selects items and renders detail', () => {
            const master_detail = new controls.Master_Detail({
                context,
                items: [
                    { id: 'a', label: 'Alpha', detail: 'Alpha detail' },
                    { id: 'b', label: 'Beta', detail: 'Beta detail' }
                ],
                selected_id: 'b'
            });

            expect(master_detail.get_selected_item().label).to.equal('Beta');
            master_detail.set_selected_id('a');
            expect(master_detail.get_selected_item().label).to.equal('Alpha');
        });
    });

    describe('Data_Grid', () => {
        it('loads rows from data source', () => {
            const data_source = () => [
                { name: 'Alpha' },
                { name: 'Beta' }
            ];

            const data_grid = new controls.Data_Grid({
                context,
                columns: ['name'],
                data_source
            });

            data_grid.refresh_rows();
            expect(data_grid.table.get_visible_rows()).to.have.lengthOf(2);
        });
    });
});
