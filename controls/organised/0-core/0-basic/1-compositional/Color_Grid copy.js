const jsgui = require('../../../../../html-core/html-core');
var Grid = require('./Grid');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof,
    is_defined = jsgui.is_defined;
var Control = jsgui.Control;
var v_subtract = jsgui.util.v_subtract;
const {
    field,
    prop
} = require('obext');
class Color_Grid extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'color_grid';
        super(spec);
        this.add_class('color-grid');
        this.internal_relative_div = true;
        prop(this, 'palette', spec.palette);
        prop(this, 'grid_size', spec.grid_size || [12, 12]);
        if (!spec.abstract && !spec.el) {
            this.compose_color_palette_grid();
        }
        this.on('resize', (e_resize) => {
            if (this.grid) {
                var _2_padding = 12;
                var new_grid_size = v_subtract(e_resize.value, [_2_padding, _2_padding]);
                this.grid.size = new_grid_size;
            }
        });
    }
    activate() {
        if (!this.__active) {
            super.activate();
            this.grid.selection_scope.on('change', e => {
                const {
                    name,
                    value
                } = e;
                if (name === 'selected') {
                    const selected_ctrl = value;
                    if (selected_ctrl) {
                        let color = selected_ctrl._color;
                        this.raise('choose-color', {
                            value: color
                        });
                    }
                }
            });
            const old_make_grid_cells_selectable = () => {
                this.grid.each_cell(cell => {
                })
            }
        }
    }
    each_cell(cb) {
        return this.grid.each_cell(cb);
    }
    add_grid_cells() {
        if (this.palette) {
            let c = 0;
            this.grid.each_cell((cell) => {
                var item = this.palette[c++];
                if (item) {
                    if (item.hex) {
                        cell.color = item.hex;
                    } else {
                        if (typeof item === 'string') {
                            cell.color = item;
                        }
                    }
                }
            });
        }
    }
    compose_color_palette_grid() {
        var padding = 6;
        const grid = this.grid = new Grid({
            'context': this.context,
            'grid_size': this.grid_size,
            'size': this.size,
            'cell_selection': 'single'
        });
        grid.each_cell((cell, [x, y]) => {
        });
        this.add(grid);
        this.add_grid_cells();
        this._ctrl_fields = this._ctrl_fields || {};
		this._ctrl_fields.grid = grid;
    }
}
if (require.main === module) {
    console.log('pal_crayola.length', pal_crayola.length);
} else {
}
module.exports = Color_Grid;
