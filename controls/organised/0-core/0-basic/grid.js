/**
 * Created by James on 24/01/2016.
 */

// Grid may be different, kind of is a layout control.

const jsgui = require('./../../../../html-core/html-core');

// A general purpose grid...
//  Have something with a similar API to Vectorious?
//var Data_Grid = jsgui.Data_Grid;
const {
    stringify,
    each,
    tof,
    def,
    Control
} = jsgui;

/*
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof,
    def = jsgui.is_defined;
var Control = jsgui.Control;
*/
//var group = jsgui.group;


// mx_dynamic_size possibly
//  maybe we need more in the core / activation part.
//  maybe we need more on the server in terms of view composition.





const mx_selectable = require('./../../../../control_mixins/selectable');

// not sure we use them by default.
const mx_press_events = require('./../../../../control_mixins/press-events');
// mx_autoscale perhaps?


// Not as complex, or designed to be as responsive to data as the Data_Grid.

// This will need to be versatile as well as operating simply with little configuration.

// Could do with use of obext / oext

// Including a sliding tile inside the grid would help too.

const {
    prop,
    field
} = require('obext');


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

// Multiple composition modes.


class Grid_Cell extends Control {
    constructor(spec) {
        (spec = spec || {}).__type_name = 'grid_cell';
        super(spec);
        this.add_class('cell');


        // field o,o
        //  where we only need to call the field function once.
        field(this, 'x', spec.x);
        field(this, 'y', spec.y);
        field(this, 'data', spec.data);

        // A cell size property here (maybe)?
        //  Maybe would be more efficient in the CSS?

        // Rendering inline styles in the HTML would at least be reliable and clear.
        //  

        // does 'Control' have a 'size' property anyway???
        //   and have that render inline?
        //  .options / .meta
        //    .render_size_using_inline_css  bool   ??






        //console.log('new grid cell');

        
        


        if (!spec.el) {
            this.compose_grid_cell();
        }

    }
    compose_grid_cell() {
        // add a span
        let o = {
            context: this.context
        };
        if (this.data) o.text = this.data;

        // causes problems with the month view.
        //  possibly grid cell should contain a span anyway.

        // Better if it has a span.
        //  Don't add it in the Month_View Control

        this.add(this.span = new jsgui.span(o));

    }
    activate() {
        if (!this.__active) {
            super.activate();
            //console.log('');
            //console.log('activate Grid_Cell');
            //console.log('this.selectable', this.selectable);

            //console.log('pre make grid cell selectable');
            mx_selectable(this);
            //this.selectable = true;

            //console.log('');

            //console.log('this.selectable', this.selectable);
            //console.trace();
        }
    }
    // activate grid cell?
}

// Row_Headers
// Column_Headers

class Grid extends Control {
    // maybe add before make would be better. add will probably be used more.
    constructor(spec, add, make) {
        spec = spec || {};

        spec.__type_name = spec.__type_name || 'grid';
        super(spec);


        if (spec.cell_selection) {
            this.cell_selection = spec.cell_selection;
        }

        //this.__type_name = 'grid';
        this.add_class('grid');
        var spec_data = spec.data;
        this._arr_rows = [];


        // Be able to get the composition mode from the spec.

        //var composition_mode = 'divs';

        field(this, 'composition_mode');
        //console.log('spec.cell_size', spec.cell_size);
        if (spec.composition_mode) {
            this.composition_mode = spec.composition_mode
        } else {
            this.composition_mode = 'divs'
        }


        // Could make this get the property out of fields....
        //  should have been set on activation?

        let _grid_size;
        Object.defineProperty(this, 'grid_size', {
            get() {
                return _grid_size;
            },
            set(value) {
                // value must be an array of length 2.
                if (Array.isArray(value) && value.length === 2) {
                    let old = _grid_size
                    _grid_size = value;
                    console.log('set _grid_size', value);
                    this.raise('change', {
                        'name': 'grid_size',
                        'old': old,
                        'value': value
                    });
                } else {
                    throw 'Invalid grid_size. Expected [x, y]';
                }
            }
        });

        if (spec.grid_size) _grid_size = spec.grid_size;


        field(this, 'cell_size');
        //console.log('spec.cell_size', spec.cell_size);
        if (spec.cell_size) this.cell_size = spec.cell_size;

        field(this, 'column_headers', false);
        field(this, 'row_headers', false);
        prop(this, 'data', false);

        this.map_cells = {};
        this.arr_cells = {};

        if (spec.data) {
            let t_data = tof(spec.data);
            if (t_data === 'array') {
                let max_x = -1;
                let y, x, ly, lx, arr = spec.data,
                    arr_row;
                ly = arr.length; // max_y = -1;

                for (y = 0; y < ly; y++) {
                    arr_row = arr[y];
                    lx = arr_row.length;
                    //if (y > max_y) max_y = y;
                    if (lx > max_x) max_x = lx;
                    for (x = 0; x < lx; x++) {
                        // cell
                    }
                }
                _grid_size = [max_x, ly];
            }
        }

        if (!spec.el) {
            var data;
            this.full_compose_as_divs();

            this._fields = this._fields || {};
            Object.assign(this._fields, {
                'composition_mode': this.composition_mode,
                'grid_size': this.grid_size//,
                //'cell_size': this.cell_size

                // Cell size options.
                //  Really column width values.
                // 'all_columns': { width: 200px }
            });
            if (this.cell_size) {
                this._fields.cell_size = this.cell_size;
            }
            //this._fields = ;
        }
        this.changes({
            grid_size: v => {
                // No, not while the property is loading.
                //  Need to be careful with refreshes.
                //  

                if (!spec.el) {
                    this.clear();
                    this.full_compose_as_divs();

                }

                //this.clear();
                //this.full_compose_as_divs();
            }
        });
    }

    'refresh_size'() {

        // Don't necessarily refresh the cell size.
        console.log('grid.js refresh_size this.composition_mode', this.composition_mode);
        if (this.composition_mode === 'divs') {

            // resize or refresh_grid_size


            //var num_columns = this.grid_size[0];
            //var num_rows = this.grid_size[1];
            //console.log('refresh_size this.grid_size', this.grid_size);
            let [num_columns, num_rows] = this.grid_size;

            var cell_border_thickness = 1;
            var _2_cell_border_thickness = cell_border_thickness * 2;

            if (this.size) {
                var cell_size = this.cell_size || [Math.floor(this.size[0] / num_columns) - _2_cell_border_thickness, Math.floor(this.size[1] / num_rows) - _2_cell_border_thickness];
                //var that = this;
                var cell_v_border_thickness = 2;

                this.each_row((row) => {
                    // not enough to trigger the event it seems.
                    //  need to get changing a style property to raise the relevant event.
                    //row.dom.attrs.style.height = cell_size[1];
                    row.size = [this.size[0], cell_size[1] + cell_v_border_thickness];
                });

                this.each_cell((cell) => {
                    cell.size = cell_size;
                });
            } else {
                console.log('.size was not available');
            }

            // could be given the cell size.
            // cell sizes by row. 
            // if cell_size is already defined...


            // Maybe don't (yet) have own size? Not set or measured.
            //  Should assume we have a this.size property (at all times??)
            //   Sometimes would not be set?
            //   Should have some way of autosetting it.
            //   Bounding client rect on the client.
            //    But should have some defaults in the CSS that get used?
            
            // Maybe have a sizing and layout model on the server.
            //  For serving pages with different content sizes....
            //  So the server could know that something gets sized 32x32 to fit in place on an iPhone for example.
            //   iPhone in a specific view mode.
            //  

            //console.log('this.size', this.size);

            
        }
    }

    'each_row'(cb_row) {
        each(this._arr_rows, cb_row);
    }

    'each_cell'(cb_cell) {
        // want to return the cell position as an index
        // Activate has not put together the rows...

        //console.log('this._arr_rows.length', this._arr_rows.length);
        //console.trace();

        each(this._arr_rows, (row, i_row) => {
            row.content.each((cell, i_cell) => {
                cb_cell(cell, [i_cell, i_row]);
            });

            //each(row, cb_cell);
        });
    }
    'get_cell'(x, y) {

        //return this._arr_rows[y]
    }

    // Cells only rendering mode
    //  They will float
    //  More layout will be done with CSS.

    'add_cell'(content) {
        var cell = new Grid_Cell({
            context: this.context
        });
        //console.log('this.cell_selection', this.cell_selection);
        if (this.cell_selection) {


            //if (this.cell_selection) {
            cell.selectable = true;
            //}
        } else {
            //mx_selectable(cell);
        }
        if (content) {
            cell.add(content);
        }
        cell.active();
        // doesnt add it to a row.

        this.main.add(cell);

        // jsgui.doc property
        //  would be a useful undefined or document reference.

        //cell.activate();

        return cell;
    }

    'full_compose_as_divs'() {

        console.log('full_compose_as_divs')

        let main = this.main = new Control({
            context: this.context,
            class: 'main'
        });
        this.add(main);

        let rows = this.main = new Control({
            context: this.context,
            class: 'rows'
        });
        main.add(rows);



        // Compose row and column headers here, if they are in use.
        // row header width
        // column header height
        //  default of 32
        // 
        // regular sizing. (default, cell size fits the screen size)
        // rows can have their widths set.
        // maybe we don't have the grid size (yet)
        //  grid_size could be a gettable / settable property

        //var num_columns = this.grid_size[0];
        //var num_rows = this.grid_size[1];
        //console.log('this.grid_size', this.grid_size);
        let map_cells = this.map_cells,
            arr_cells = this.arr_cells;
        if (this.grid_size) {
            // set the number of rows or columns...
            let [num_columns, num_rows] = this.grid_size;
            //console.log('this.size', this.size);
            //throw 'stop';
            // Nope, easier to use box-sizing internal or whatever css.

            var cell_border_thickness = 0;
            var _2_cell_border_thickness = cell_border_thickness * 2;

            //console.log('this.cell_size', this.cell_size);
            // need to know the row / column header sizes and if we are using them.
            //console.log('this.size', this.size);
            //console.log('num_rows', num_rows);
            //console.log('num_columns', num_columns);

            let cell_size;

            if (this.size) {
                cell_size = this.cell_size || [Math.floor(this.size[0] / num_columns) - _2_cell_border_thickness, Math.floor(this.size[1] / num_rows) - _2_cell_border_thickness];
            } else {
                cell_size = this.cell_size;
            }

            
            //console.log('cell_size', cell_size);
            let row_width, row_height;
            //console.log('this.cell_size', this.cell_size);
            //let row_header_width = this.cell_size[0];
            let row_header_width;
            //console.log('this.row_headers', this.row_headers);
            if (this.cell_size) {
                //header_row.style('width', this.cell_size[0] * num_columns);
                //header_row.style('height', this.cell_size[1]);
                if (this.row_headers) {
                    row_header_width = this.row_headers.width || row_header_width;
                    row_width = this.cell_size[0] * num_columns + row_header_width;
                } else {
                    row_width = this.cell_size[0] * num_columns;
                }
                row_height = this.cell_size[1];

            } else {
                //header_row.style('height', Math.floor(this.size[1] / num_rows));
                if (this.size) row_height = Math.floor(this.size[1] / num_rows);
                
            }
            const data = this.data;
            //console.log('row_header_width', row_header_width);
            var x, y;

            // compose the header row if we have one.
            if (this.column_headers) {
                let header_row = new Control({
                    context: this.context //,
                    //'class': 'row'
                });
                header_row.add_class('header');
                header_row.add_class('row');

                if (row_height) {
                    header_row.style('height', row_height);
                }
                if (row_width) {
                    header_row.style('width', row_width);
                }
                rows.add(header_row);

                if (this.row_headers) {
                    var cell = new Control({
                        context: this.context,
                        __type_name: 'grid_cell', //,
                        //'class': 'cell'
                    });
                    cell.add_class('grid-header');
                    cell.add_class('cell');
                    if (row_header_width) {
                        cell.size = [row_header_width, cell_size[1]];
                    } else {
                        // Work on size property probably. Would render / appear as inline width and height css.
                        cell.size = cell_size;
                    }
                    header_row.add(cell);
                }

                for (x = 0; x < num_columns; x++) {
                    var cell = new Control({
                        context: this.context,
                        __type_name: 'grid_cell', //,
                        //'class': 'cell'
                    });
                    cell.add_class('column-header');
                    cell.add_class('cell');
                    cell.size = cell_size;
                    //mx_selectable(cell);
                    header_row.add(cell);
                }
            }

            for (y = 0; y < num_rows; y++) {
                var row_container = new Control({
                    context: this.context //,
                    //'class': 'row'
                });
                //row_container.style.height = cell_size[1];
                //if (this.cell_size) {
                //    row_container.style('width', this.cell_size[0] * num_columns);
                //    row_container.style('height', this.cell_size[1]);

                //} else {
                //    row_container.style('height', Math.floor(this.size[1] / num_rows));
                // }

                if (row_height) {
                    row_container.style('height', row_height);
                }
                if (row_width) {
                    row_container.style('width', row_width);
                }

                row_container.add_class('row');
                this._arr_rows.push(row_container);
                rows.add(row_container);
                //row_container.activate();
                // if we have a row header...

                if (this.row_headers) {
                    var cell = new Control({
                        context: this.context,
                        __type_name: 'grid_cell', //,
                        //'class': 'cell'
                    });
                    cell.add_class('row-header');
                    cell.add_class('cell');
                    //cell.x = 

                    if (row_header_width) {
                        cell.size = [row_header_width, cell_size[1]];
                    } else {
                        cell.size = cell_size;
                    }
                    row_container.add(cell);
                    //cell.activate();
                }
                //console.log('num_columns', num_columns);

                for (x = 0; x < num_columns; x++) {
                    let o = {
                        context: this.context,
                        x: x,
                        y: y
                        //,
                        //__type_name: 'grid_cell', //,
                        //'class': 'cell'
                    }

                    if (data) {
                        //console.log('data', data);
                        //console.log('[x, y]', [x, y]);
                        o.data = data[y][x];
                    }

                    // Grid_Cell
                    var cell = new Grid_Cell(o);
                    //cell.add_class('cell');

                    //console.log('cell', cell);
                    // and put the data in the cell.
                    // A grid cell class may work best.
                    if (cell_size) cell.size = cell_size;
                    // but with what selection options.

                    /*
                    if (this.cell_selection) {
                        mx_selectable(cell, this.cell_selection);
                    } else {
                        mx_selectable(cell);
                    }
                    */

                    row_container.add(cell);
                    arr_cells[x] = arr_cells[x] || [];
                    arr_cells[x][y] = cell;
                    map_cells['[' + x + ',' + y + ']'] = cell;

                    //cell.activate();
                }
            }
        }
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.main = main;
        this._ctrl_fields.rows = rows;
    }

    'full_compose_as_table'() {
        //this.set('dom.tagName', 'table');
        this.dom.tagName = table;
        var data = this.data;
        var range = data.range;
        var value;
        // The Data_Grid could even contain a Data_Value in each cell.
        //  I'm not doing it this way at the moment though.

        if (tof(data) === 'data_grid') {
            // Need to iterate the data_grid by column and row.
            // Retrieval of all values from all cells within the range.

            // console.log('range', range);
            var x, y, max_x = range[0],
                max_y = range[1];
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
            console.log('activate Grid');
            //var _arr_rows;
            this.selection_scope = this.context.new_selection_scope(this);

            // A Collection of rows may be better.

            var load_rows = () => {
                //console.log('load_rows');
                //console.log('this.content.length', this.content.length);
                // the rows are the content?
                //console.log('this.main.content', this.main.content);
                //console.log('load_rows this.main.content._arr.length', this.main.content._arr.length);
                var _arr_rows = this._arr_rows = [];
                this.rows.content._arr.forEach((v) => {
                    //console.log('v', v);
                    _arr_rows.push(v);
                });
            }
            load_rows();


            var load_cells = () => {
                each(this._arr_rows, (row) => {
                    each(row.content._arr, (cell) => {
                        
                        //cell.selectable = cell.selectable;
                    });
                });
            };
            //load_cells();

            this.each_cell(cell => {
                cell.activate();
            })
        }
    }
}

Grid.Cell = Grid.Grid_Cell = Grid_Cell;

module.exports = Grid;