const jsgui = require('../../../html');

const { Control, Active_HTML_Document } = jsgui;
const { is_defined } = jsgui;
const controls = jsgui.controls;

const compare_values = (left, right) => {
    if (left === right) return 0;
    if (!is_defined(left)) return 1;
    if (!is_defined(right)) return -1;
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }
    return String(left).localeCompare(String(right));
};

class Data_Controls_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_controls_demo';
        super(spec);

        const { context } = this;

        if (typeof this.body.add_class === 'function') {
            this.body.add_class('data-controls-body');
        }

        if (!spec.el) {
            this.compose_ui(context);
        }
    }

    compose_ui(context) {
        const container = new Control({ context, tag_name: 'div' });
        container.add_class('data-controls-container');
        this.body.add(container);

        const create_section = title_text => {
            const section = new Control({ context, tag_name: 'section' });
            section.add_class('controls-section');
            const title = new Control({ context, tag_name: 'h2' });
            title.add_class('section-title');
            title.add(title_text);
            const body = new Control({ context, tag_name: 'div' });
            body.add_class('section-body');
            section.add(title);
            section.add(body);
            container.add(section);
            return body;
        };

        const table_section = create_section('Data Table');
        const table_filter_row = new Control({ context, tag_name: 'div' });
        table_filter_row.add_class('data-table-controls');
        const table_filter_label = new Control({ context, tag_name: 'label' });
        table_filter_label.add_class('control-label');
        table_filter_label.add('Status filter');
        const table_filter_input = new Control({ context, tag_name: 'input' });
        table_filter_input.dom.attributes.type = 'text';
        table_filter_input.dom.attributes.placeholder = 'open / closed';
        table_filter_input.add_class('data-table-filter');
        table_filter_row.add(table_filter_label);
        table_filter_row.add(table_filter_input);
        table_section.add(table_filter_row);
        this.table_filter_input = table_filter_input;

        const table_rows = [
            { name: 'Alpha', status: 'open', owner: 'Jasmine' },
            { name: 'Beta', status: 'closed', owner: 'Chris' },
            { name: 'Gamma', status: 'open', owner: 'Riley' },
            { name: 'Delta', status: 'pending', owner: 'Morgan' },
            { name: 'Epsilon', status: 'open', owner: 'Taylor' },
            { name: 'Zeta', status: 'closed', owner: 'Drew' },
            { name: 'Eta', status: 'pending', owner: 'Avery' }
        ];

        this.data_table = new controls.Data_Table({
            context,
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
                { key: 'owner', label: 'Owner' }
            ],
            rows: table_rows,
            page_size: 3,
            page: 1
        });
        this.data_table.add_class('demo-data-table');
        table_section.add(this.data_table);

        this.table_pagination = new controls.Pagination({
            context,
            page: 1,
            page_count: Math.ceil(table_rows.length / 3)
        });
        this.table_pagination.add_class('demo-data-table-pagination');
        table_section.add(this.table_pagination);

        const grid_section = create_section('Data Grid');
        this.grid_rows = [
            { name: 'Oak', category: 'Tree', rating: 4 },
            { name: 'Pine', category: 'Tree', rating: 3 },
            { name: 'Rose', category: 'Flower', rating: 5 },
            { name: 'Tulip', category: 'Flower', rating: 4 },
            { name: 'Moss', category: 'Plant', rating: 2 }
        ];

        const grid_data_source = params => {
            const rows = this.grid_rows.slice();
            const sort_state = params && params.sort_state ? params.sort_state : null;
            if (sort_state && is_defined(sort_state.key)) {
                const key = sort_state.key;
                const direction = sort_state.direction === 'desc' ? 'desc' : 'asc';
                rows.sort((left, right) => {
                    const cmp = compare_values(left[key], right[key]);
                    return direction === 'desc' ? -cmp : cmp;
                });
            }
            return rows;
        };

        this.data_grid = new controls.Data_Grid({
            context,
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'category', label: 'Category' },
                { key: 'rating', label: 'Rating' }
            ],
            data_source: grid_data_source
        });
        this.data_grid.add_class('demo-data-grid');
        grid_section.add(this.data_grid);

        this.grid_selection_output = new Control({ context, tag_name: 'div' });
        this.grid_selection_output.add_class('grid-selection-output');
        this.grid_selection_output.add('Selected: none');
        grid_section.add(this.grid_selection_output);

        const virtualization_section = create_section('Virtualization');
        const virtualization_stack = new Control({ context, tag_name: 'div' });
        virtualization_stack.add_class('virtualization-stack');
        virtualization_section.add(virtualization_stack);

        const list_items = Array.from({ length: 60 }, (_, index) => `List item ${index + 1}`);
        this.virtual_list = new controls.Virtual_List({
            context,
            items: list_items,
            height: 160,
            item_height: 24,
            buffer: 2
        });
        this.virtual_list.add_class('demo-virtual-list');
        virtualization_stack.add(this.virtual_list);

        const grid_items = Array.from({ length: 24 }, (_, index) => `Card ${index + 1}`);
        this.virtual_grid = new controls.Virtual_Grid({
            context,
            items: grid_items,
            height: 200,
            item_height: 80,
            column_count: 3,
            gap: 10,
            buffer: 1
        });
        this.virtual_grid.add_class('demo-virtual-grid');
        virtualization_stack.add(this.virtual_grid);

        const tree_section = create_section('Tree Table');
        this.tree_table = new controls.Tree_Table({
            context,
            columns: [
                { key: 'label', label: 'Item' },
                { key: 'value', label: 'Value' }
            ],
            rows: [
                {
                    id: 'group-1',
                    label: 'Group A',
                    value: '3 items',
                    children: [
                        { id: 'a-1', label: 'Alpha', value: 'Ready' },
                        { id: 'a-2', label: 'Beta', value: 'Pending' }
                    ]
                },
                {
                    id: 'group-2',
                    label: 'Group B',
                    value: '2 items',
                    children: [
                        { id: 'b-1', label: 'Gamma', value: 'Active' }
                    ]
                }
            ],
            expanded_ids: ['group-1']
        });
        this.tree_table.add_class('demo-tree-table');
        tree_section.add(this.tree_table);

        const reorder_section = create_section('Reorderable List');
        this.reorderable_list = new controls.Reorderable_List({
            context,
            items: ['Alpha', 'Beta', 'Gamma', 'Delta']
        });
        this.reorderable_list.add_class('demo-reorderable-list');
        reorder_section.add(this.reorderable_list);

        this.reorder_output = new Control({ context, tag_name: 'div' });
        this.reorder_output.add_class('reorder-output');
        this.reorder_output.add('Order: Alpha, Beta, Gamma, Delta');
        reorder_section.add(this.reorder_output);

        const master_detail_section = create_section('Master Detail');
        this.master_detail = new controls.Master_Detail({
            context,
            items: [
                { id: 'north', label: 'North Region', detail: 'North team coverage.' },
                { id: 'south', label: 'South Region', detail: 'South team coverage.' },
                { id: 'west', label: 'West Region', detail: 'West team coverage.' }
            ],
            selected_id: 'south'
        });
        this.master_detail.add_class('demo-master-detail');
        master_detail_section.add(this.master_detail);
    }

    activate() {
        if (!this.__active) {
            super.activate();

            if (this.table_filter_input && this.table_filter_input.dom.el && this.data_table) {
                this.table_filter_input.add_dom_event_listener('input', () => {
                    const value = this.table_filter_input.dom.el.value.trim();
                    this.data_table.set_filters(value ? { status: value } : null);
                    this.data_table.set_page(1);
                });
            }

            if (this.table_pagination && this.data_table) {
                this.table_pagination.on('page_change', e_change => {
                    this.data_table.set_page(e_change.page);
                });
            }

            if (this.data_grid && this.grid_selection_output) {
                this.data_grid.on('selection_change', e_change => {
                    const selection = e_change.selection;
                    this.grid_selection_output.clear();
                    if (selection && selection.row_data) {
                        this.grid_selection_output.add(`Selected: ${selection.row_data.name}`);
                    } else {
                        this.grid_selection_output.add('Selected: none');
                    }
                });
            }

            if (this.reorderable_list && this.reorder_output) {
                this.reorderable_list.on('reorder', e_change => {
                    const items = e_change.items || [];
                    this.reorder_output.clear();
                    this.reorder_output.add(`Order: ${items.join(', ')}`);
                });
            }
        }
    }
}

Data_Controls_Demo.css = `
* {
    box-sizing: border-box;
}
body {
    font-family: "Source Sans Pro", Arial, sans-serif;
    margin: 0;
    padding: 24px;
    background: #f4f5f8;
    color: #1f1f1f;
}
.data-controls-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
}
.controls-section {
    background: #fff;
    padding: 18px;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.section-title {
    margin: 0 0 12px;
    font-size: 1.25em;
}
.section-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.data-table-controls {
    display: flex;
    gap: 12px;
    align-items: center;
}
.control-label {
    font-weight: 600;
}
.data-table-filter {
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
}
.demo-data-table {
    width: 100%;
}
.demo-data-table-pagination {
    justify-content: flex-end;
}
.grid-selection-output {
    padding: 8px 10px;
    border-radius: 6px;
    background: #f3f4f6;
}
.virtualization-stack {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
.demo-virtual-list {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
}
.demo-virtual-grid {
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
}
.demo-tree-table {
    border-top: 1px solid #eee;
}
.demo-reorderable-list {
    max-width: 360px;
}
.reorder-output {
    font-size: 0.95em;
    color: #444;
}
.demo-master-detail {
    border-top: 1px solid #eee;
    padding-top: 12px;
}
`;

jsgui.controls.Data_Controls_Demo = Data_Controls_Demo;

module.exports = jsgui;
