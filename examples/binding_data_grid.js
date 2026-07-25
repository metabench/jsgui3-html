'use strict';

/**
 * Canonical Data_Filter → Data_Grid example.
 *
 * This intentionally uses the exported production controls. It demonstrates
 * the supported binding boundary: Data_Filter emits a structured filter map,
 * and Data_Grid accepts that map directly for either local or remote data.
 */
const jsgui = require('../html-core/html-core');
const Data_Grid = require('../controls/connected/Data_Grid');
const Data_Filter = require('../controls/organised/1-standard/4-data/Data_Filter');

const example_rows = [
    { id: 1, name: 'Alice Johnson', age: 28, department: 'Engineering' },
    { id: 2, name: 'Bob Smith', age: 35, department: 'Sales' },
    { id: 3, name: 'Carol White', age: 42, department: 'Marketing' },
    { id: 4, name: 'David Brown', age: 31, department: 'Engineering' },
    { id: 5, name: 'Eve Davis', age: 29, department: 'People' }
];

const create_example = (context = new jsgui.Page_Context()) => {
    const view = new jsgui.Control({ context, tag_name: 'section' });
    view.add_class('data-grid-binding-example');

    const filter = new Data_Filter({
        context,
        fields: [
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'age', label: 'Age', type: 'number' },
            { name: 'department', label: 'Department', type: 'string' }
        ],
        persist_activation_state: true
    });
    const grid = new Data_Grid({
        context,
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' },
            { key: 'department', label: 'Department' }
        ],
        rows: example_rows,
        page_size: 5,
        selection_mode: 'single',
        persist_activation_state: true,
        aria_label: 'People'
    });

    filter.on('filter_change', event => grid.set_filters(event.filters));
    view.add(filter);
    view.add(grid);
    view.filter = filter;
    view.grid = grid;
    return view;
};

if (require.main === module) {
    const example = create_example();
    console.log(example.all_html_render());
}

// Preserve the historical default export name while making it the real control.
module.exports = Data_Grid;
module.exports.create_example = create_example;
module.exports.example_rows = example_rows;
