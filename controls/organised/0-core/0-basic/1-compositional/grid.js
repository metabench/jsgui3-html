const jsgui = require('../../../../../html-core/html-core');
const {
    stringify,
    each,
    tof,
    def,
    Control
} = jsgui;
const Data_Model_View_Model_Control = require('../../../../../html-core/Data_Model_View_Model_Control');
const mx_selectable = require('../../../../../control_mixins/selectable');
const Cell = require('./Cell');
const Grid_Cell = Cell;

// Some kind of compositional spec being part of the view (data) model.
// view.data.model.composition = ...




class Grid extends Data_Model_View_Model_Control {
    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'grid';
        super(spec);
        if (spec.cell_selection) {
            this.cell_selection = spec.cell_selection;
        }
        this.drag_selection = !!spec.drag_selection;
        this.add_class('grid');
        var spec_data = spec.data;
        this._arr_rows = [];

        // ── Model properties (replaces obext prop/field) ──
        this.model = this.data.model;
        this.model.batch(() => {
            this.model.set('composition_mode', spec.composition_mode || 'divs');
            this.model.set('grid_size', spec.grid_size || [12, 12]);
            this.model.set('cell_size', spec.cell_size || null);
            this.model.set('column_headers', spec.column_headers || false);
            this.model.set('row_headers', spec.row_headers || false);
            this.model.set('cell_selection', !!spec.cell_selection);
            this.model.set('drag_selection', !!spec.drag_selection);
            if (spec.data) this.model.set('grid_data', spec.data);
        });

        // ── Computed: cell_count ──
        this.computed(
            this.model,
            ['grid_size'],
            (grid_size) => {
                if (!grid_size || !Array.isArray(grid_size)) return 0;
                return grid_size[0] * grid_size[1];
            },
            { property_name: 'cell_count' }
        );

        this.map_cells = {};
        this.arr_cells = {};
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
                this.model.set('grid_size', [max_x, ly], true);
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

        // ── Watch (replaces this.changes()) ──
        this.watch(this.model, 'grid_size', () => {
            if (!spec.el) {
                this.clear();
                this._arr_rows = [];
                this.map_cells = {};
                this.arr_cells = {};
                this.full_compose_as_divs();
            }
        });
    }

    // ── Model Accessors (read-through) ──
    get composition_mode() { return this.model ? this.model.composition_mode : 'divs'; }
    set composition_mode(v) { if (this.model) this.model.set('composition_mode', v); }
    get grid_size() { return this.model ? this.model.grid_size : [12, 12]; }
    set grid_size(v) { if (this.model) this.model.set('grid_size', v); }
    get cell_size() { return this.model ? this.model.cell_size : null; }
    set cell_size(v) { if (this.model) this.model.set('cell_size', v); }
    get column_headers() { return this.model ? this.model.column_headers : false; }
    set column_headers(v) { if (this.model) this.model.set('column_headers', v); }
    get row_headers() { return this.model ? this.model.row_headers : false; }
    set row_headers(v) { if (this.model) this.model.set('row_headers', v); }
    get grid_data() { return this.model ? this.model.grid_data : null; }
    set grid_data(v) { if (this.model) this.model.set('grid_data', v); }
    get cell_selection() { return this.model ? this.model.cell_selection : false; }
    set cell_selection(v) { if (this.model) this.model.set('cell_selection', v); }
    get drag_selection() { return this.model ? this.model.drag_selection : false; }
    set drag_selection(v) { if (this.model) this.model.set('drag_selection', v); }
    get cell_count() { return this.model ? this.model.cell_count : 0; }

    //  Have the size system set up within the 'view model'.


    'refresh_size'() {
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
        let cell_x = x;
        let cell_y = y;

        if (typeof cell_x === 'object' && cell_x !== null) {
            if (Array.isArray(cell_x)) {
                cell_y = cell_x[1];
                cell_x = cell_x[0];
            } else if (typeof cell_y === 'undefined') {
                cell_y = cell_x.y;
                cell_x = cell_x.x;
            }
        }

        if (typeof cell_x === 'undefined' || typeof cell_y === 'undefined') return undefined;

        const x_num = typeof cell_x === 'number' ? cell_x : parseInt(cell_x, 10);
        const y_num = typeof cell_y === 'number' ? cell_y : parseInt(cell_y, 10);
        if (!Number.isFinite(x_num) || !Number.isFinite(y_num)) return undefined;

        const key = '[' + x_num + ',' + y_num + ']';
        if (this.map_cells && this.map_cells[key]) return this.map_cells[key];

        if (this.arr_cells && this.arr_cells[x_num] && this.arr_cells[x_num][y_num]) {
            return this.arr_cells[x_num][y_num];
        }

        if (this._arr_rows && this._arr_rows[y_num]) {
            const row = this._arr_rows[y_num];
            const offset = this.row_headers ? 1 : 0;
            const idx = x_num + offset;
            if (row && row.content && row.content._arr && row.content._arr[idx]) {
                return row.content._arr[idx];
            }
        }

        return undefined;
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
    'full_compose_as_divs'() {
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
            const data = this.grid_data;
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
                    if (this.drag_selection) {
                        o.drag_select = true;
                    }
                    var cell = new Grid_Cell(o);
                    cell.selectable = true;

                    // saying the cells are selectable within this scope...?

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
        var data = this.grid_data;
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
            this.selection_scope = this.selection_scope || this.context.new_selection_scope(this);

            // Use _ctrl_fields.rows (set in full_compose_as_divs)
            const rows_ctrl = this._ctrl_fields && this._ctrl_fields.rows;
            if (rows_ctrl && rows_ctrl.content && rows_ctrl.content._arr) {
                this._arr_rows = [];
                rows_ctrl.content._arr.forEach((v) => {
                    this._arr_rows.push(v);
                });
            }

            // Drag selection: listen for drag events on cells and select ranges
            if (this.drag_selection) {
                let drag_start_cell = null;
                this.each_cell((cell) => {
                    cell.on('drag-select-start', (e) => {
                        drag_start_cell = cell;
                    });
                    cell.on('drag-select-move', (e) => {
                        if (!drag_start_cell) return;
                        const evt = e.event || e;
                        const el_under = document.elementFromPoint(
                            evt.clientX, evt.clientY
                        );
                        if (!el_under) return;
                        const end_cell = this._find_cell_from_el(el_under);
                        if (end_cell) {
                            this._select_cell_range(drag_start_cell, end_cell);
                        }
                    });
                    cell.on('drag-select-end', (e) => {
                        if (drag_start_cell) {
                            this.raise('drag-selection-change', {
                                cells: this._get_selected_cells()
                            });
                        }
                        drag_start_cell = null;
                    });
                });
            }
        }
    }
    '_find_cell_from_el'(el) {
        let current = el;
        while (current && current !== this.dom.el) {
            // Check each cell to see if its DOM element matches
            let found = null;
            this.each_cell((cell) => {
                if (found) return;
                const cell_el = (cell.dom && cell.dom.el) || cell.el;
                if (cell_el && (cell_el === current || cell_el.contains(current))) {
                    found = cell;
                }
            });
            if (found) return found;
            current = current.parentElement;
        }
        return null;
    }
    '_select_cell_range'(start, end) {
        const x1 = Math.min(start.x, end.x), x2 = Math.max(start.x, end.x);
        const y1 = Math.min(start.y, end.y), y2 = Math.max(start.y, end.y);
        this.each_cell((cell, pos) => {
            const [cx, cy] = pos;
            if (cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2) {
                cell.selected = true;
            } else {
                cell.selected = false;
            }
        });
    }
    '_get_selected_cells'() {
        const selected = [];
        this.each_cell((cell, pos) => {
            if (cell.selected) {
                selected.push({ cell, x: pos[0], y: pos[1] });
            }
        });
        return selected;
    }
}
Grid.css = `
/* ─── Grid ─── */
table.grid {
    background-color: var(--admin-card-bg, #eceff1);
    border: 1px solid var(--admin-border, #546e7a);
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
div.grid {
    user-select: none;
    clear: both;
    font-family: var(--admin-font, 'Segoe UI', -apple-system, sans-serif);
    color: var(--admin-text, #1e1e1e);
}
div.grid .header.row .cell {
    text-align: center;
    background: var(--admin-header-bg, #f8f8f8);
    color: var(--admin-header-text, #616161);
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
    border-right: 1px solid var(--admin-border, #AAAAAA);
    border-bottom: 1px solid var(--admin-border-strong, #999999);
    transition: background-color 0.08s;
}
div.grid .row .cell:hover {
    background: var(--admin-hover-bg, #e8e8e8);
}
div.grid .row .cell.selected {
    float: left;
    box-sizing: border-box;
    border: 2px solid var(--admin-accent, #0078d4);
    border-radius: 4px;
    background: var(--admin-accent-bg, rgba(0, 120, 212, 0.08));
}
div.grid .row .cell.selected span {
    position: relative;
    left: 3px;
    top: -1px;
    font-size: 16pt;
    color: var(--admin-accent, #0078d4);
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
