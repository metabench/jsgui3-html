/**
 * Created by James on 24/01/2016.
 */


var jsgui = require('../html-core/html-core');

// A general purpose grid...
//  Have something with a similar API to Vectorious?
//var Data_Grid = jsgui.Data_Grid;

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var group = jsgui.group;

const mx_selectable = require('../control_mixins/selectable');
// Not as complex, or designed to be as responsive to data as the Data_Grid.

// This will need to be versatile as well as operating simply with little configuration.

// presentation
//  column_headers
//  row_headers
// data
//  columns
//  rows
// range
//  num_columns
//  num_rows

// grid.set('data', ...);


// Has an underlying Data_Grid.
//  Listens to and queries the Data_Grid.
//  Possibly will be showing just a view of particular cells on the grid.

// If the grid is initialised with a Data_Grid, it uses that.
//  If it's not a Data_Grid, it attempts to load that data into a Data_Grid.

// Also want to indicate row and column labels.


/*
 'fields': {
 'range': Array
 },
 */

// For the moment, scrollable and holding the whole dataset would be best.
//  Fine for thousands of records, maybe not millions.


// Also need to make this scrollable.
//  Describe size of view window, but allow scrolling to show the full data

// Lazy loading of scrolled data...

// Non-scroll-mode
//  
//  Keep constant display controls, update with data

// Grid control should be made more flexible
//  In terms of layout and GUI
//  In terms of data source

// Row_Headers
// Column_Headers

class Grid extends Control {
    // maybe add before make would be better. add will probably be used more.
    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'grid';
        super(spec);
        //this.__type_name = 'grid';
        this.add_class('grid');
        var spec_data = spec.data;
        this._arr_rows = [];
        var composition_mode = 'divs';
        if (spec.grid_size) this.grid_size = spec.grid_size;

        if (!spec.abstract && !spec.el) {
            var data;

            /*
            if (spec_data) {
                if (spec_data instanceof Data_Grid) {
                    this.set('data', spec_data);
                    data = spec_data;
                } else {
                    console.log('pre create Data_Grid');
                    var dg = new Data_Grid(spec_data);
                    this.set('data', dg);
                    data = dg;
                }
            }

            var range = data.get('range');
            */
            //console.log('range', range);

            // Render all cells as table.
            // Render all cells as divs


            // Then we may want to do partial rendering
            //  Becomes more complicated when the heights/sizes of items vary.

            //console.log('pre full_compose_as_table');

            // Table grid

            //this.full_compose_as_table();
            this.full_compose_as_divs();

            /*
            this.dom.attributes['data-jsgui-fields'] = stringify({
                'composition_mode': composition_mode
            }).replace(/"/g, "'");
            */

            // column_data / columns property.

            this._fields = {
                'composition_mode': composition_mode,
                'grid_size': this.grid_size

                // Cell size options.
                //  Really column width values.

                // 'all_columns': { width: 200px }

            };
        }

        // on resize, resize all of the cells.

        // on activate, will need to reconnect all of the cells.

        this.on('resize', (e_resize) => {
            //console.log('resize Grid', e_resize);

            // then need to recalculate the cell sizes.
            //console.log('this.composition_mode', this.composition_mode);

            this.refresh_size();
            
        });
    }

    'refresh_size'() {
        if (this.composition_mode === 'divs') {

            // resize or refresh_grid_size


            var num_columns = this.grid_size[0];
            var num_rows = this.grid_size[1];
            var cell_border_thickness = 1;
            var _2_cell_border_thickness = cell_border_thickness * 2;
            var cell_size = [Math.floor(this.size[0] / num_columns) - _2_cell_border_thickness, Math.floor(this.size[1] / num_rows) - _2_cell_border_thickness];
            var that = this;
            var cell_v_border_thickness = 2;

            this.each_row((row) => {
                // not enough to trigger the event it seems.
                //  need to get changing a style property to raise the relevant event.
                //row.dom.attrs.style.height = cell_size[1];
                row.size = [that.size[0], cell_size[1] + cell_v_border_thickness];
            });

            this.each_cell((cell) => {
                cell.size = cell_size;
            });
        }
    }

    'each_row'(cb_row) {
        each(this._arr_rows, cb_row);
    }

    'each_cell'(cb_cell) {
        // want to return the cell position as an index
        each(this._arr_rows, (row, i_row) => {


            row.content.each((cell, i_cell) => {
                cb_cell(cell, [i_cell, i_row]);
            });

            //each(row, cb_cell);
        });
    }

    'full_compose_as_divs'() {

        // regular sizing. (default, cell size fits the screen size)
        // rows can have their widths set.



        var num_columns = this.grid_size[0];
        var num_rows = this.grid_size[1];

        //console.log('this.size', this.size);


        //throw 'stop';

        // Nope, easier to use box-sizing internal or whatever css.

        var cell_border_thickness = 0;


        var _2_cell_border_thickness = cell_border_thickness * 2;

        var cell_size = [Math.floor(this.size[0] / num_columns) - _2_cell_border_thickness, Math.floor(this.size[1] / num_rows) - _2_cell_border_thickness];
        //console.log('cell_size', cell_size);

        var x, y;

        for (y = 0; y < num_rows; y++) {
            var row_container = new Control({
                context: this.context//,
                //'class': 'row'
            });
            //row_container.style.height = cell_size[1];
            row_container.style('height', Math.floor(this.size[1] / num_rows));
            row_container.add_class('row');
            this._arr_rows.push(row_container);
            this.add(row_container);

            for (x = 0; x < num_columns; x++) {
                var cell = new Control({
                    context: this.context,
                    __type_name: 'gridcell',//,
                    //'class': 'cell'
                });
                cell.add_class('cell');
                cell.size = cell_size;
                mx_selectable(cell);
                row_container.add(cell);

            }
        }
    }

    'full_compose_as_table'() {

        //this.set('dom.tagName', 'table');
        this.dom.tagName = table;


        var data = this.data;

        //console.log('data', data);
        //console.log('t data', tof(data));

        var range = data.range;

        var value;

        // The Data_Grid could even contain a Data_Value in each cell.
        //  I'm not doing it this way at the moment though.

        if (tof(data) === 'data_grid') {

            // Need to iterate the data_grid by column and row.

            // Retrieval of all values from all cells within the range.

            // console.log('range', range);


            var x, y, max_x = range[0], max_y = range[1];
            var ctrl_cell, ctrl_row;

            var size = this.size().value();

            //console.log('size', size);

            //throw 'stop';

            var tbody_params = {
                'context': this.context,
                'tagName': 'tbody'
            }

            if (size) {

                tbody_params.size = [size[0][0], size[1][0]];
            }


            var tbody = new Control(tbody_params);

            this.add(tbody);


            for (y = 0; y <= max_y; y++) {

                ctrl_row = new jsgui.tr({
                    'context': this.context
                });

                tbody.add(ctrl_row);


                for (x = 0; x <= max_x; x++) {
                    ctrl_cell = new jsgui.td({
                        'context': this.context
                    });
                    ctrl_row.add(ctrl_cell);

                    // then we need to write the value within each cell.
                    //  would be good to have a .text function.

                    // or a .set('text', ...);

                    // a .text function would in some cases set the text property
                    // in other cases, would just replace all of the contents with that single piece of text.

                    // an add_text function would be simpler.
                    //  and that would be in html-enh Control
                    //   because it's not intrinsic to the Control's core operations.

                    value = data.get(x, y);
                    //console.log('x, y', x, y);
                    //console.log('value', value);

                    ctrl_cell.add_text(value);
                }
            }
        } else {
            throw 'Unexpected data type. Expected data_grid, got ' + tof(data);
        }
        // So it looks like a Data_Grid wrapped in a Data_Value.

        // Would like Data_Grid to be an intrinsic type to jsgui...
        //  meaning that when something is set with a Data_Grid, it does not wrap it in a Data_Value.

    }
    'activate'() {
        // May need to register Flexiboard in some way on the client.

        if (!this.__active) {
            super.activate();
            //console.log('activate Grid');
            //var _arr_rows;

            var load_rows = () => {
                //console.log('load_rows');
                //console.log('this.content.length()', this.content.length());
                // the rows are the content?

                var _arr_rows = this._arr_rows = [];
                this.content.each((v) => {
                    _arr_rows.push(v);
                })

            }
            load_rows();

            //this.each_cell


            // load the cells
            
            var load_cells = () => {
                each(this._arr_rows, (row) => {
                    each(row.content._arr, (cell) => {
                        mx_selectable(cell);
                        //cell.selectable = cell.selectable;
                    })
                })
            }
            //load_cells();
            


        }

    }
}

module.exports = Grid;