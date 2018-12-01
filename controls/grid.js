/**
 * Created by James on 24/01/2016.
 */


var jsgui = require('../html-core/html-core');

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

// row headers, column headers.

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

let obj_field = (obj, spec, name, default_value, fn_validate) => {
    //prop(name, default_value, fn_validate);
    let _prop_value;
    Object.defineProperty(obj, name, {
        get() {
            return _prop_value;
        },
        set(value) {
            // value must be an array of length 2.
            if (fn_validate) {
                let val = fn_validate(value);
                if (val === true) {
                    let old = _prop_value
                    _prop_value = value;
                    if (!obj.el) {
                        (obj._fields = obj._fields || {})[name] = value;
                        //this._fields = this._fields || {};
                        //this._fields[name] = value;
                    }
                    obj.raise('change', {
                        'name': name,
                        'old': old,
                        'value': value
                    });

                } else {
                    throw val;
                }
            } else {
                let old = _prop_value
                _prop_value = value;
                if (!obj.el) {
                    (obj._fields = obj._fields || {})[name] = value;
                    //this._fields = this._fields || {};
                    //this._fields[name] = value;
                }
                obj.raise('change', {
                    'name': name,
                    'old': old,
                    'value': value
                });
            }
        }
    });
    if (def(spec[name])) {
        (obj._fields = obj._fields || {})[name] = _prop_value = spec[name];
    } else {
        _prop_value = default_value;
    }
}

class Grid_Cell extends Control {
    constructor(spec) {
        (spec = spec || {}).__type_name = 'grid_cell';
        super(spec);
        this.add_class('cell');

        obj_field(this, spec, 'x');
        obj_field(this, spec, 'y');
        obj_field(this, spec, 'data');

        this.compose_grid_cell();

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
}

// Row_Headers
// Column_Headers

class Grid extends Control {
    // maybe add before make would be better. add will probably be used more.
    constructor(spec, add, make) {
        spec = spec || {};

        spec.size = spec.size || [320, 200];


        // grid should have a default size?
        //  would be nice to read this from css.

        // or to compile css from values in JavaScript.
        // Need to get grids working in a nice general purpose kind of way.

        // define control property would be a useful function.

        // .prop()
        //  name, validation test,

        // default...?

        // default.

        // Could make a language object extension module.
        //  

        // More work on control fields would help too.

        let prop = (name, default_value, fn_validate) => {
            let _prop_value;
            Object.defineProperty(this, name, {
                get() {
                    return _prop_value;
                },
                set(value) {
                    // value must be an array of length 2.
                    if (fn_validate) {
                        let val = fn_validate(value);
                        if (val === true) {
                            let old = _prop_value
                            _prop_value = value;
                            this.raise('change', {
                                'name': name,
                                'old': old,
                                'value': value
                            });
                        } else {
                            throw val;
                        }
                    } else {
                        let old = _prop_value
                        _prop_value = value;
                        this.raise('change', {
                            'name': name,
                            'old': old,
                            'value': value
                        });
                    }
                }
            });
            if (def(spec[name])) {
                _prop_value = spec[name];
            } else {
                _prop_value = default_value;
            }
        }

        // and a field function.
        //  like a prop, but sets the ._fields

        let field = (name, default_value, fn_validate) => {
            //prop(name, default_value, fn_validate);
            let _prop_value;
            Object.defineProperty(this, name, {
                get() {
                    return _prop_value;
                },
                set(value) {
                    // value must be an array of length 2.
                    if (fn_validate) {
                        let val = fn_validate(value);
                        if (val === true) {
                            let old = _prop_value
                            _prop_value = value;
                            if (!this.el) {
                                (this._fields = this._fields || {})[name] = value;
                                //this._fields = this._fields || {};
                                //this._fields[name] = value;
                            }
                            this.raise('change', {
                                'name': name,
                                'old': old,
                                'value': value
                            });

                        } else {
                            throw val;
                        }
                    } else {
                        let old = _prop_value
                        _prop_value = value;
                        if (!this.el) {
                            (this._fields = this._fields || {})[name] = value;
                            //this._fields = this._fields || {};
                            //this._fields[name] = value;
                        }
                        this.raise('change', {
                            'name': name,
                            'old': old,
                            'value': value
                        });
                    }
                }
            });
            if (def(spec[name])) {

                (this._fields = this._fields || {})[name] = _prop_value = spec[name];
            } else {
                _prop_value = default_value;
            }
        }

        spec.__type_name = spec.__type_name || 'grid';
        super(spec);
        //this.__type_name = 'grid';
        this.add_class('grid');
        var spec_data = spec.data;
        this._arr_rows = [];
        var composition_mode = 'divs';

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

        let _cell_size;
        Object.defineProperty(this, 'cell_size', {
            get() {
                return _cell_size;
            },
            set(value) {
                let old = _cell_size
                _cell_size = value;
                this.raise('change', {
                    'name': 'cell_size',
                    'old': old,
                    'value': value
                });
            }
        });

        //console.log('spec.cell_size', spec.cell_size);

        if (spec.cell_size) _cell_size = spec.cell_size;


        // row headers property
        // column headers property

        // A translate property?
        //  could be objects


        field('column_headers', false);
        field('row_headers', false);
        prop('data', false);

        this.map_cells = {};
        this.arr_cells = {};

        // size prop
        //  however, controls in general could do with an upgrade here.
        //  sizes could still be undefined when not set and there is no element to measure the size of.

        // size property should read from the DOM when there is the DOM - or have corresponding values at least.
        //  (or not - could have dom size)

        // need to measure border and possibly some other sizes.

        // Part of an overhaul of css and styling?


        // data property.

        // if it's an array...

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

            this._fields = this._fields || {};
            Object.assign(this._fields, {
                'composition_mode': composition_mode,
                'grid_size': this.grid_size

                // Cell size options.
                //  Really column width values.

                // 'all_columns': { width: 200px }

            });

            //this._fields = ;
        }
        // on resize, resize all of the cells.
        // on activate, will need to reconnect all of the cells.

        this.on('change', (e_change) => {
            //console.log('resize Grid', e_resize);

            let {name, value} = e_change;
            if (name === 'grid_size') {
                //this.refresh_size();


                this.clear();
                this.full_compose_as_divs();
            }


            // then need to recalculate the cell sizes.
            //console.log('this.composition_mode', this.composition_mode);
            
        });
    }

    'refresh_size'() {
        if (this.composition_mode === 'divs') {

            // resize or refresh_grid_size


            //var num_columns = this.grid_size[0];
            //var num_rows = this.grid_size[1];
            console.log('refresh_size this.grid_size', this.grid_size);
            let [num_columns, num_rows] = this.grid_size;

            

            var cell_border_thickness = 1;
            var _2_cell_border_thickness = cell_border_thickness * 2;

            // could be given the cell size.
            // cell sizes by row. 
            // if cell_size is already defined...

            var cell_size = this.cell_size || [Math.floor(this.size[0] / num_columns) - _2_cell_border_thickness, Math.floor(this.size[1] / num_rows) - _2_cell_border_thickness];
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
    'get_cell'(x, y) {



        //return this._arr_rows[y]
    }

    'full_compose_as_divs'() {
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
        let map_cells = this.map_cells, arr_cells = this.arr_cells;
        if (this.grid_size) {
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

            var cell_size = this.cell_size || [Math.floor(this.size[0] / num_columns) - _2_cell_border_thickness, Math.floor(this.size[1] / num_rows) - _2_cell_border_thickness];
            console.log('cell_size', cell_size);
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
                row_height = Math.floor(this.size[1] / num_rows);
            }

            const data = this.data;

            console.log('row_header_width', row_header_width);


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
                this.add(header_row);

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
                this.add(row_container);
                row_container.activate();


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
                    cell.activate();
                }
                console.log('num_columns', num_columns);

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
                    cell.add_class('cell');

                    console.log('cell', cell);

                    // and put the data in the cell.

                    // A grid cell class may work best.

                    cell.size = cell_size;
                    mx_selectable(cell);
                    row_container.add(cell);
                    arr_cells[x] = arr_cells[x] || [];
                    arr_cells[x][y] = cell;
                    map_cells['[' + x + ',' + y + ']'] = cell;
                    cell.activate();
                }
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
            //console.log('activate Grid');
            //var _arr_rows;

            var load_rows = () => {
                //console.log('load_rows');
                //console.log('this.content.length()', this.content.length());
                // the rows are the content?

                var _arr_rows = this._arr_rows = [];
                this.content.each((v) => {
                    _arr_rows.push(v);
                });

            }
            load_rows();

            //this.each_cell

            // load the cells

            var load_cells = () => {
                each(this._arr_rows, (row) => {
                    each(row.content._arr, (cell) => {
                        mx_selectable(cell);
                        //cell.selectable = cell.selectable;
                    });
                });
            };
            //load_cells();

        }

    }
}

module.exports = Grid;