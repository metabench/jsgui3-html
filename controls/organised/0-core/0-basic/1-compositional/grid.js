// Late 2023 - Still about 450 lines once comments and empty lines removed.
//   Want to simplify this using idioms - maybe create idioms?
//   Do want to make use of .data.model as well as .view.data.model, and .view.ui.data.model too.

// The data.model could be the values in the cells?
//   Same with the view.data.model .....

// Setting the .data.model.cells[x][y] may make sense.
//   Programming it with a very explicit higher level API would help.

// Could hold off on this for the moment...
//   Could see about the Calendar control, or enhancement on the Date_Picker making use of this.



// grid.selected.value
// grid.view.ui.data.model.selected.data.model.value perhaps....

// Be able to have these shorter paths assembled, available to use idiomatically and clearly,
//   but on a lower level will have / maintain / sync these different data models.

// a .view.ui.data.model could be optional.
//   Not sure.

// Late 2023 - Breaking changes will not break very much right now.

// ctrl.ui.mixins???
// ctrl.data.mixins???

// Basically make sure that the distinctions of different models are there, set up to operate easily,
//   but also there and pluggable so that some more complex scenarios will work OK, or system can support it with a little
//     modification / extension.


// Possibly getting the 'select' options dropdown working will be better first.
//   Will be a tiny bit like 'grid' where there are multiple options to select.

// .selected.value may help in places....
//   Want easy to use and idiomatic syntax, higher level than HTML.


// Late 2023 - decision to move to a composition.model system, though keeping things backwards-compatable.
//  .content may point to something else internally.

// composition model being different to composition itself.
//   That would make a lot of sense in terms of the distinction.

// Or even there is a composition content model, as well as composition model.
//   The composition content model would include all the content of the control, just like before.

// May want a higher level composition content model (too)
//   Ie for a window, we don't treat it as having the direct child controls that it has.
//     compositional content is what we already have. We may want a new type of content (model), being some other kind
//     of (composition) content that's more relevant to the usage of the control.
//   So may want a .inner in many cases.
//   Maybe want a .left.inner and .right.inner in some. top.inner bottom.inner
//     and something for both hotizontal and vertical. Things like a 3 inner parts composition.
//   An interface where inner parts can be numbered and named would help.
//     Would definitely be a useful and intuitive interface.
//     Want to be able to recognise different inner / internal parts of a control, where other controls can be placed.

//   As in inner.controls???
//     That may be a good readable API for referring to inner controls.
//       Those controls being containers for other controls?

// .inner.areas? .zones .places .containers .parts? .controls? or all 6 are synonyms.
//   .inner.control when there is a single one or a primary one.
//   .inner.primary.control?
//   .inner.controls.primary ???

// view.ui.composition.inner.controls.top;

// It may make some sense to move some things explicitly within this view.ui.composition system.
//   It does provide a place where some settings that already exist can be further categorised, and also used in a way so things
//   will be more extendable and clearer.

// Then can work on supporting some shorthands....
//   Possibly with functions.






// so a left/right movable bar could have 2 inner zones / areas / places / parts / containers.
//   Making a really flexible API could be helpful.

// And the Window control has a single inner area / control



// This could benefit from lower level compositional logic.



















const jsgui = require('../../../../../html-core/html-core');
const {
    stringify,
    each,
    tof,
    def,
    Control
} = jsgui;

// Selectable should work in terms of view.ui.model???

// though maybe .value, and .data.model.value should correspond with the day of the month.
//   or .value is the full date????

// This is a somewhat complex control, but may want to make sure it has a simple and consistent highest level API.
// Having different composition modes / models could be useful.
//   Possibly enabling all controls to take varying composition models would help.
//     The composition model could be generated accoding to the number of cells, or it could be an abstraction that
//     can handle things like num rows and num columns.




// class Composition_Model perhaps....
//   Would have the parts of the control itself.
//   Then there would be the 'contents' type parts.

// Compositional_Model.compose(ctrl) perhaps....
//   Would set the content of that control / add the content.

// and control.compose() would involk that compositional model.
// compositional.model
// compositional.content (that's everything, like normal .content ????) or the compositional content is different???
//  makes sense to move .content collection to .view.ui.compositional.content
// compositional.inner.content in some cases (like window)


// Would be best to make multiple compositional models work within the curent system

// Grid looks like a place where a slightly different compositional model could be used, as well as a Data_Model / Data_Value
//   that represents a 2D grid of data.

// 
















const mx_selectable = require('../../../../../control_mixins/selectable');


const {
    prop,
    field
} = require('obext');


// Move to the data model system as well as the view data model system.

// .view.ui.data.model
// .view.data.model
// view.ui does seem like an important distinction.



const Cell = require('./Cell');
const Grid_Cell = Cell;


// Should make some lower / mid level compositional routines / models / systems.
//   Functions for expressing / processing those compositional models, such as Repeat(item, n);


// Would be better to use different compositional models here.
//   With underlying support for that.



class Grid extends Control {
    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'grid';
        super(spec);
        if (spec.cell_selection) {
            this.cell_selection = spec.cell_selection;
        }
        this.add_class('grid');
        var spec_data = spec.data;
        //  Could give it a data_model here.

        this._arr_rows = [];

        // instead use .view.ui.compositional.model(s) alternatives. 
        //   .compositional.models.active/current perhaps?
        //     eg composition made up of divs with float, or divs with flex grid, or others.

        //   .and the representational model of some data being something corresponding with / compatable with this grid.


        // .data.model.grid.size somewhere.

        field(this, 'composition_mode');


        if (spec.composition_mode) {
            this.composition_mode = spec.composition_mode
        } else {
            this.composition_mode = 'divs'
        }
        let _grid_size;
        Object.defineProperty(this, 'grid_size', {
            get() {
                return _grid_size;
            },
            set(value) {
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

        // The view.ui.model or view.ui.data.model perhaps?
        //   Including fields within that data model could help.
        //     



        field(this, 'cell_size');
        if (spec.cell_size) this.cell_size = spec.cell_size;


        // .data column names
        // .data row names
        // .data.row.names = [1, 2, 3, 4, 5, 6, 7, 8] for example. Allowing numbers as names?
        //   or map to strings.

        field(this, 'column_headers', false);
        field(this, 'row_headers', false);

        // No will be the control.data system. That will become standard.
        prop(this, 'data', false);


        this.map_cells = {};
        this.arr_cells = {};

        // Integrate within internal Data_Model...


        if (spec.data) {
            let t_data = tof(spec.data);
            if (t_data === 'array') {
                let max_x = -1;
                let y, x, ly, lx, arr = spec.data,
                    arr_row;
                ly = arr.length; 
                for (y = 0; y < ly; y++) {
                    arr_row = arr[y];
                    lx = arr_row.length;
                    if (lx > max_x) max_x = lx;
                    for (x = 0; x < lx; x++) {
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
                'grid_size': this.grid_size
            });
            if (this.cell_size) {
                this._fields.cell_size = this.cell_size;
            }
        }
        this.changes({
            grid_size: v => {
                if (!spec.el) {
                    this.clear();
                    this.full_compose_as_divs();
                }
            }
        });
    }
    'refresh_size'() {
        //console.log('grid.js refresh_size this.composition_mode', this.composition_mode);

        // .view.ui.compositional.mode
        // .view.ui.composition.mode(l)

        // Composition model does seem very useful as a concept for how the controls will be put together.



        // .view.ui.composition.model.compose(this);
        //   And a compositional model could contain a list of controls.
        //     Maybe even as an array of pairs of [Ctrl, spec]
        // .view.ui.composition.content perhaps???

        // this.view.ui.composition.model.name === 'divs' perhaps in the future?


        if (this.composition_mode === 'divs') {
            let [num_columns, num_rows] = this.grid_size;
            var cell_border_thickness = 1;
            var _2_cell_border_thickness = cell_border_thickness * 2;
            if (this.size) {
                var cell_size = this.cell_size || [Math.floor(this.size[0] / num_columns) - _2_cell_border_thickness, Math.floor(this.size[1] / num_rows) - _2_cell_border_thickness];
                var cell_v_border_thickness = 2;
                this.each_row((row) => {
                    row.size = [this.size[0], cell_size[1] + cell_v_border_thickness];
                });
                this.each_cell((cell) => {
                    cell.size = cell_size;
                });
            } else {
                console.log('.size was not available');
            }
        }
    }
    'each_row'(cb_row) {
        each(this._arr_rows, cb_row);
    }
    'each_cell'(cb_cell) {
        each(this._arr_rows, (row, i_row) => {
            row.content.each((cell, i_cell) => {
                cb_cell(cell, [i_cell, i_row]);
            });
        });
    }
    'get_cell'(x, y) {
        console.trace();
        throw 'NYI';
    }
    'add_cell'(content) {
        var cell = new Grid_Cell({
            context: this.context
        });
        if (this.cell_selection) {
            cell.selectable = true;
        } else {
        }
        if (content) {
            cell.add(content);
        }
        cell.active();
        this.main.add(cell);
        return cell;
    }
    // Different composition models could help here.
    'full_compose_as_divs'() {
        //console.log('* full_compose_as_divs')
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
        let map_cells = this.map_cells,
            arr_cells = this.arr_cells;
        if (this.grid_size) {
            let [num_columns, num_rows] = this.grid_size;
            var cell_border_thickness = 0;
            var _2_cell_border_thickness = cell_border_thickness * 2;
            let cell_size;
            if (this.size) {
                cell_size = this.cell_size || [Math.floor(this.size[0] / num_columns) - _2_cell_border_thickness, Math.floor(this.size[1] / num_rows) - _2_cell_border_thickness];
            } else {
                cell_size = this.cell_size;
            }
            let row_width, row_height;
            let row_header_width;
            if (this.cell_size) {
                if (this.row_headers) {
                    row_header_width = this.row_headers.width || row_header_width;
                    row_width = this.cell_size[0] * num_columns + row_header_width;
                } else {
                    row_width = this.cell_size[0] * num_columns;
                }
                row_height = this.cell_size[1];
            } else {
                if (this.size) row_height = Math.floor(this.size[1] / num_rows);
            }
            const data = this.data;
            var x, y;
            if (this.column_headers) {
                let header_row = new Control({
                    context: this.context 
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
                        __type_name: 'grid_cell', 
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
                        __type_name: 'grid_cell', 
                    });
                    cell.add_class('column-header');
                    cell.add_class('cell');
                    cell.size = cell_size;
                    header_row.add(cell);
                }
            }
            for (y = 0; y < num_rows; y++) {
                var row_container = new Control({
                    context: this.context 
                });
                if (row_height) {
                    row_container.style('height', row_height);
                }
                if (row_width) {
                    row_container.style('width', row_width);
                }
                row_container.add_class('row');
                this._arr_rows.push(row_container);
                rows.add(row_container);
                if (this.row_headers) {
                    var cell = new Control({
                        context: this.context,
                        __type_name: 'grid_cell', 
                    });
                    cell.add_class('row-header');
                    cell.add_class('cell');
                    if (row_header_width) {
                        cell.size = [row_header_width, cell_size[1]];
                    } else {
                        cell.size = cell_size;
                    }
                    row_container.add(cell);
                }
                for (x = 0; x < num_columns; x++) {
                    let o = {
                        context: this.context,
                        x: x,
                        y: y
                    }
                    if (data) {
                        o.data = data[y][x];
                    }
                    var cell = new Grid_Cell(o);
                    if (cell_size) cell.size = cell_size;
                    row_container.add(cell);
                    arr_cells[x] = arr_cells[x] || [];
                    arr_cells[x][y] = cell;
                    map_cells['[' + x + ',' + y + ']'] = cell;
                }
            }
        }
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.main = main;
        this._ctrl_fields.rows = rows;
    }
    'full_compose_as_table'() {
        this.dom.tagName = table;
        var data = this.data;
        var range = data.range;
        var value;
        if (tof(data) === 'data_grid') {
            var x, y, max_x = range[0],
                max_y = range[1];
            var ctrl_cell, ctrl_row;
            var size = this.size().value();
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
                    value = data.get(x, y);
                    ctrl_cell.add_text(value);
                }
            }
        } else {
            throw 'Unexpected data type. Expected data_grid, got ' + tof(data);
        }
    }
    'activate'() {
        if (!this.__active) {
            super.activate();
            this.selection_scope = this.context.new_selection_scope(this);
            var load_rows = () => {
                var _arr_rows = this._arr_rows = [];
                this.rows.content._arr.forEach((v) => {
                    _arr_rows.push(v);
                });
            }
            load_rows();
            var load_cells = () => {
                each(this._arr_rows, (row) => {
                    each(row.content._arr, (cell) => {
                    });
                });
            };
            this.each_cell(cell => {
                cell.activate();
            })
        }
    }
}
Grid.css = `
table.grid {
    background-color: #eceff1;
    border: 1px solid #546e7a;
    padding: 2px;
    cursor: default;
}
table.grid tbody {
    overflow: hidden;
    display: block;
}
table.grid td {
    padding: 1px;
}
.data-row .data-item {
    display: inline;
    margin-left: 2px;
    padding: 2px;
}
.mid-width {
    width: 450px;
}
div.grid {
    user-select: none;
    clear: both;
}
div.grid .header.row .cell {
    text-align: center
}
div.grid .row {
    clear: both;
}
div.grid .header.row .cell span {
    position: relative;
    top: 4px;
    left: 0px;
    font-size: 11pt;
}
div.grid .row .cell {
    float: left;
    box-sizing: border-box;
    border-right: 1px solid #AAAAAA;
    border-bottom: 1px solid #999999;
}
div.grid .row .cell.selected {
    float: left;
    box-sizing: border-box;
    border: 2px solid #2046df;
    border-radius: 4px;
}
div.grid .row .cell.selected span {
    position: relative;
    left: 3px;
    top: -1px;
    font-size: 16pt;
}
div.grid .row .cell span {
    position: relative;
    left: 5px;
    top: 1px;
    font-size: 16pt;
}
`;
Grid.Cell = Grid.Grid_Cell = Grid_Cell;
module.exports = Grid;