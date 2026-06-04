const jsgui = require('../../../html');
const bootstrap_client_controls = require('../../client_bootstrap');

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

const TABLE_PAGE_SIZE = 3;
const TABLE_ROWS = [
    { name: 'Alpha', status: 'open', owner: 'Jasmine' },
    { name: 'Beta', status: 'closed', owner: 'Chris' },
    { name: 'Gamma', status: 'open', owner: 'Riley' },
    { name: 'Delta', status: 'pending', owner: 'Morgan' },
    { name: 'Epsilon', status: 'open', owner: 'Taylor' },
    { name: 'Zeta', status: 'closed', owner: 'Drew' },
    { name: 'Eta', status: 'pending', owner: 'Avery' }
];

const GRID_ROWS = [
    { name: 'Oak', category: 'Tree', rating: 4 },
    { name: 'Pine', category: 'Tree', rating: 3 },
    { name: 'Rose', category: 'Flower', rating: 5 },
    { name: 'Tulip', category: 'Flower', rating: 4 },
    { name: 'Moss', category: 'Plant', rating: 2 }
];

const VIRTUAL_LIST_ITEMS = Array.from({ length: 60 }, (_, index) => `List item ${index + 1}`);

const TREE_ROWS = [
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
];

const REORDER_ITEMS = ['Alpha', 'Beta', 'Gamma', 'Delta'];

const MASTER_DETAIL_ITEMS = [
    { id: 'north', label: 'North Region', detail: 'North team coverage.' },
    { id: 'south', label: 'South Region', detail: 'South team coverage.' },
    { id: 'west', label: 'West Region', detail: 'West team coverage.' }
];

const flatten_tree_rows = (rows, expanded_ids, depth = 0, results = []) => {
    rows.forEach((row) => {
        results.push({ row, depth });
        if (Array.isArray(row.children) && expanded_ids.includes(String(row.id))) {
            flatten_tree_rows(row.children, expanded_ids, depth + 1, results);
        }
    });
    return results;
};

class Data_Controls_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'data_controls_demo';
        super(spec);

        const { context } = this;
        this.table_filter_value = '';
        this.table_sort_state = null;
        this.table_page = 1;
        this.tree_expanded_ids = ['group-1'];
        this.reorder_items = REORDER_ITEMS.slice();
        this.selected_master_detail_id = 'south';

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

        this._ctrl_fields = {
            table_filter_input: this.table_filter_input,
            data_table: this.data_table,
            table_pagination: this.table_pagination,
            data_grid: this.data_grid,
            grid_selection_output: this.grid_selection_output,
            virtual_list: this.virtual_list,
            tree_table: this.tree_table,
            reorderable_list: this.reorderable_list,
            reorder_output: this.reorder_output,
            master_detail: this.master_detail
        };
    }

    get_table_visible_rows() {
        const filter_value = (this.table_filter_value || '').trim().toLowerCase();
        let rows = TABLE_ROWS.filter((row) => {
            if (!filter_value) return true;
            return String(row.status || '').toLowerCase().includes(filter_value);
        });

        if (this.table_sort_state && this.table_sort_state.key) {
            const { key, direction } = this.table_sort_state;
            rows = rows.slice().sort((left, right) => {
                const cmp = compare_values(left[key], right[key]);
                return direction === 'desc' ? -cmp : cmp;
            });
        }

        const page_count = Math.max(1, Math.ceil(rows.length / TABLE_PAGE_SIZE));
        this.table_page = Math.max(1, Math.min(this.table_page, page_count));

        return {
            rows,
            page_count,
            visible_rows: rows.slice((this.table_page - 1) * TABLE_PAGE_SIZE, this.table_page * TABLE_PAGE_SIZE)
        };
    }

    render_table_dom(root_el) {
        const table_el = root_el.querySelector('.demo-data-table');
        const pagination_el = root_el.querySelector('.demo-data-table-pagination');
        if (!table_el) return;

        const table_state = this.get_table_visible_rows();
        const tbody_el = table_el.querySelector('tbody');
        if (tbody_el) {
            tbody_el.innerHTML = table_state.visible_rows.map((row, index) => `
                <tr class="data-table-row" data-row-index="${index}" role="row" aria-rowindex="${index + 2}" aria-selected="false">
                    <td class="data-table-cell" role="gridcell">${row.name}</td>
                    <td class="data-table-cell" role="gridcell">${row.status}</td>
                    <td class="data-table-cell" role="gridcell">${row.owner}</td>
                </tr>
            `).join('');
        }

        table_el.querySelectorAll('th[data-column-key]').forEach((header_el) => {
            const is_active = this.table_sort_state && this.table_sort_state.key === header_el.getAttribute('data-column-key');
            const aria_sort = is_active
                ? (this.table_sort_state.direction === 'desc' ? 'descending' : 'ascending')
                : 'none';
            header_el.setAttribute('aria-sort', aria_sort);
        });

        if (pagination_el) {
            pagination_el.querySelectorAll('.pagination-button[data-page]').forEach((button_el) => {
                const page = Number(button_el.getAttribute('data-page'));
                const is_current = page === this.table_page;
                button_el.classList.toggle('is-current', is_current);
                button_el.setAttribute('aria-current', is_current ? 'page' : 'false');
                button_el.disabled = page > table_state.page_count;
            });
        }
    }

    render_grid_selection_dom(root_el, selected_name) {
        const grid_el = root_el.querySelector('.demo-data-grid');
        const output_el = root_el.querySelector('.grid-selection-output');
        if (!grid_el || !output_el) return;

        grid_el.querySelectorAll('tbody tr').forEach((row_el) => {
            const cell_text = row_el.querySelector('td') ? row_el.querySelector('td').textContent.trim() : '';
            const is_selected = cell_text === selected_name;
            row_el.classList.toggle('is-selected', is_selected);
            row_el.setAttribute('aria-selected', is_selected ? 'true' : 'false');
        });

        output_el.textContent = selected_name ? `Selected: ${selected_name}` : 'Selected: none';
    }

    render_virtual_list_dom(root_el, scroll_top = 0) {
        const viewport_el = root_el.querySelector('.demo-virtual-list .virtual-list-viewport');
        const spacer_el = root_el.querySelector('.demo-virtual-list .virtual-list-spacer');
        const items_el = root_el.querySelector('.demo-virtual-list .virtual-list-items');
        if (!viewport_el || !spacer_el || !items_el) return;

        const item_height = 24;
        const viewport_height = 160;
        const buffer = 2;
        const start_index = Math.max(0, Math.floor(scroll_top / item_height) - buffer);
        const visible_count = Math.ceil(viewport_height / item_height) + buffer * 2;
        const end_index = Math.min(VIRTUAL_LIST_ITEMS.length, start_index + visible_count);

        spacer_el.style.height = `${VIRTUAL_LIST_ITEMS.length * item_height}px`;
        items_el.style.transform = `translateY(${start_index * item_height}px)`;
        items_el.innerHTML = VIRTUAL_LIST_ITEMS.slice(start_index, end_index).map((item, offset) => `
            <div class="virtual-list-item" style="height:${item_height}px" data-index="${start_index + offset}">${item}</div>
        `).join('');
    }

    render_tree_table_dom(root_el) {
        const body_el = root_el.querySelector('.demo-tree-table .tree-table-body');
        if (!body_el) return;

        const flattened_rows = flatten_tree_rows(TREE_ROWS, this.tree_expanded_ids);
        body_el.innerHTML = flattened_rows.map(({ row, depth }) => {
            const has_children = Array.isArray(row.children) && row.children.length;
            const is_expanded = has_children && this.tree_expanded_ids.includes(String(row.id));
            return `
                <div class="tree-table-row" data-node-id="${row.id}">
                    <div class="tree-table-cell">
                        <span class="tree-table-indent" style="padding-left:${depth * 16}px">
                            ${has_children ? `<button type="button" class="tree-table-toggle" data-toggle-id="${row.id}" aria-expanded="${is_expanded ? 'true' : 'false'}">${is_expanded ? '-' : '+'}</button>` : ''}
                            <span class="tree-table-label">${row.label}</span>
                        </span>
                    </div>
                    <div class="tree-table-cell">${row.value || ''}</div>
                </div>
            `;
        }).join('');
    }

    render_reorder_list_dom(root_el) {
        const list_el = root_el.querySelector('.demo-reorderable-list');
        const output_el = root_el.querySelector('.reorder-output');
        if (!list_el || !output_el) return;

        list_el.innerHTML = this.reorder_items.map((item, index) => `
            <li class="reorderable-list-item" data-index="${index}" draggable="true" tabindex="0">${item}</li>
        `).join('');
        output_el.textContent = `Order: ${this.reorder_items.join(', ')}`;
    }

    render_master_detail_dom(root_el) {
        const master_el = root_el.querySelector('.demo-master-detail .master-detail-master');
        const detail_el = root_el.querySelector('.demo-master-detail .master-detail-detail');
        if (!master_el || !detail_el) return;

        master_el.querySelectorAll('.master-detail-item').forEach((item_el) => {
            const is_selected = item_el.getAttribute('data-item-id') === this.selected_master_detail_id;
            item_el.classList.toggle('is-selected', is_selected);
            item_el.setAttribute('aria-selected', is_selected ? 'true' : 'false');
        });

        const selected_item = MASTER_DETAIL_ITEMS.find((item) => item.id === this.selected_master_detail_id);
        detail_el.textContent = selected_item ? selected_item.detail : '';
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const root_el = this.dom && this.dom.el;
            if (!root_el || this._demo_dom_bound) return;

            this._demo_dom_bound = true;
            this.render_table_dom(root_el);
            this.render_grid_selection_dom(root_el, null);
            this.render_virtual_list_dom(root_el, 0);
            this.render_tree_table_dom(root_el);
            this.render_reorder_list_dom(root_el);
            this.render_master_detail_dom(root_el);

            const filter_input_el = root_el.querySelector('.data-table-filter');
            if (filter_input_el) {
                filter_input_el.addEventListener('input', () => {
                    this.table_filter_value = filter_input_el.value;
                    this.table_page = 1;
                    this.render_table_dom(root_el);
                });
            }

            root_el.addEventListener('click', (event) => {
                const sort_header_el = event.target.closest('.demo-data-table th[data-column-key]');
                if (sort_header_el) {
                    const column_key = sort_header_el.getAttribute('data-column-key');
                    const next_direction = this.table_sort_state && this.table_sort_state.key === column_key && this.table_sort_state.direction === 'asc'
                        ? 'desc'
                        : 'asc';
                    this.table_sort_state = { key: column_key, direction: next_direction };
                    this.render_table_dom(root_el);
                    return;
                }

                const page_button_el = event.target.closest('.demo-data-table-pagination .pagination-button[data-page]');
                if (page_button_el) {
                    this.table_page = Number(page_button_el.getAttribute('data-page')) || 1;
                    this.render_table_dom(root_el);
                    return;
                }

                const grid_row_el = event.target.closest('.demo-data-grid tbody tr');
                if (grid_row_el) {
                    const name_cell = grid_row_el.querySelector('td');
                    this.render_grid_selection_dom(root_el, name_cell ? name_cell.textContent.trim() : null);
                    return;
                }

                const toggle_el = event.target.closest('.demo-tree-table .tree-table-toggle[data-toggle-id]');
                if (toggle_el) {
                    const toggle_id = toggle_el.getAttribute('data-toggle-id');
                    if (this.tree_expanded_ids.includes(toggle_id)) {
                        this.tree_expanded_ids = this.tree_expanded_ids.filter((id) => id !== toggle_id);
                    } else {
                        this.tree_expanded_ids = this.tree_expanded_ids.concat(toggle_id);
                    }
                    this.render_tree_table_dom(root_el);
                    return;
                }

                const reorder_item_el = event.target.closest('.demo-reorderable-list .reorderable-list-item[data-index]');
                if (reorder_item_el) {
                    this.reorder_active_index = Number(reorder_item_el.getAttribute('data-index'));
                    if (typeof reorder_item_el.focus === 'function') {
                        reorder_item_el.focus();
                    }
                    return;
                }

                const master_detail_item_el = event.target.closest('.demo-master-detail .master-detail-item[data-item-id]');
                if (master_detail_item_el) {
                    this.selected_master_detail_id = master_detail_item_el.getAttribute('data-item-id');
                    this.render_master_detail_dom(root_el);
                }
            });

            root_el.addEventListener('keydown', (event) => {
                const reorder_item_el = event.target.closest('.demo-reorderable-list .reorderable-list-item[data-index]');
                const move_up = (event.key === 'ArrowUp') && (event.altKey || event.ctrlKey);
                const move_down = (event.key === 'ArrowDown') && (event.altKey || event.ctrlKey);
                if (!reorder_item_el || (!move_up && !move_down)) return;

                event.preventDefault();
                const current_index = Number(reorder_item_el.getAttribute('data-index'));
                const next_index = move_up ? current_index - 1 : current_index + 1;
                if (next_index < 0 || next_index >= this.reorder_items.length) return;

                const next_items = this.reorder_items.slice();
                const [moved_item] = next_items.splice(current_index, 1);
                next_items.splice(next_index, 0, moved_item);
                this.reorder_items = next_items;
                this.render_reorder_list_dom(root_el);

                const next_item_el = root_el.querySelector(`.demo-reorderable-list .reorderable-list-item[data-index="${next_index}"]`);
                if (next_item_el && typeof next_item_el.focus === 'function') {
                    next_item_el.focus();
                }
            });

            const viewport_el = root_el.querySelector('.demo-virtual-list .virtual-list-viewport');
            if (viewport_el) {
                viewport_el.addEventListener('scroll', () => {
                    this.render_virtual_list_dom(root_el, viewport_el.scrollTop || 0);
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

bootstrap_client_controls(jsgui, {
    data_controls_demo: Data_Controls_Demo
}, {
    bootstrap_key: '__jsgui_data_controls_demo_context__'
});

module.exports = jsgui;
