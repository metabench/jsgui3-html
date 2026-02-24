const jsgui = require('../../../../../html-core/html-core');
var Grid = require('./grid');
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
class Color_Grid extends Grid {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'color_grid';
        super(spec);
        this.add_class('color-grid');
        this.internal_relative_div = true;

        // Will mainly be the 'view' model.

        prop(this, 'palette', spec.palette);

        // Apply colors directly to the inherited Grid cells (no nested grid).
        if (!spec.abstract && !spec.el) {
            this.add_grid_cells();
        }
        this.on('resize', (e_resize) => {
            var _2_padding = 12;
            var new_grid_size = v_subtract(e_resize.value, [_2_padding, _2_padding]);
            this.size = new_grid_size;
        });
    }
    activate() {
        if (!this.__active) {
            super.activate();
            this.selection_scope.on('change', e => {
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
        }
    }
    add_grid_cells() {
        if (this.palette) {
            let c = 0;
            // Use the inherited each_cell from Grid — these are the actual rendered cells
            super.each_cell((cell) => {
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
}
if (require.main === module) {
    console.log('pal_crayola.length', pal_crayola.length);
} else {
}
module.exports = Color_Grid;
