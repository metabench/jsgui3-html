'use strict';

const jsgui = require('../../../html-core/html-core');
const Data_Grid = require('../../../controls/connected/Data_Grid');
const Data_Table = require('../../../controls/organised/1-standard/4-data/Data_Table');
const Data_Filter = require('../../../controls/organised/1-standard/4-data/Data_Filter');

const context = new jsgui.Page_Context({
    map_Controls: Object.assign({}, jsgui.map_Controls, {
        control: jsgui.Control,
        data_filter: Data_Filter,
        data_grid: Data_Grid,
        data_table: Data_Table
    })
});

jsgui.pre_activate(context);
jsgui.activate(context);

const controls = Object.values(context.map_controls);
const grid = controls.find(control => control && control.__type_name === 'data_grid');
const filter = controls.find(control => control && control.__type_name === 'data_filter');
const metrics = {
    filter_change: 0,
    sort_change: 0,
    page_change: 0,
    selection_change: 0
};

filter.on('filter_change', event => {
    metrics.filter_change += 1;
    grid.set_filters(event.filters);
});
grid.on('sort_change', () => { metrics.sort_change += 1; });
grid.on('page_change', () => { metrics.page_change += 1; });
grid.on('selection_change', () => { metrics.selection_change += 1; });

window.__jsgui_data_controls = { context, filter, grid, metrics };
window.__jsgui_data_controls_ready = true;
