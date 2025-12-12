const jsgui = require('../../../../../html-core/html-core');
const Color_Grid = require('./color-grid');
const {v_subtract} = jsgui;
var Control = jsgui.Control;
const {
    field,
    prop
} = require('obext');
const pal_crayola = require('../../../../../html-core/arr_colors');
class Color_Palette extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'color_palette';
        super(spec);
        this.add_class('color-palette');
        prop(this, 'palette', spec.palette || pal_crayola);


        // Have this within the 'view model'.
        //   The color palette itself would be in the data model, probably.


        prop(this, 'grid_size', spec.grid_size || [12, 12]);
        if (!spec.abstract && !spec.el) {
            this.compose_color_grid();
        }
        this.on('resize', (e_resize) => {
        });
    }
    activate() {
        if (!this.__active) {
            super.activate();
            const attach_on_change_named_property_handler = (obj, property_name, fn_handler) => {
                obj.on('change', e => {
                    if (property_name === e.name) {
                        fn_handler(e);
                    }
                })
            }
            attach_on_change_named_property_handler(this, 'selected', e => {
                const selected_ctrl = e.value;
                if (selected_ctrl) {
                    let color = selected_ctrl._color;
                    this.raise('choose-color', {
                        value: color
                    });
                }
            })
            const old_make_grid_cells_selectable = () => {
                this.grid.each_cell(cell => {
                })
            }
        }
    }
    compose_color_grid() {
        console.log('compose_color_grid');
        var padding = 6;
        const fg_bg_color_grid = new Color_Grid({
            'context': this.context,
            'grid_size': [2, 1],
            'size': [80, 40]
        });
        this.add(fg_bg_color_grid);
        const color_grid_pxsize = v_subtract(this.size, [0, 46]);
        const color_grid = this.grid = new Color_Grid({
            'context': this.context,
            'grid_size': this.grid_size,
            'palette': this.palette,
            'size': color_grid_pxsize,
            'cell_selection': 'single'
        });
        this.add(color_grid);
        this._ctrl_fields = this._ctrl_fields || {};
		this._ctrl_fields.color_grid = color_grid;
        this._ctrl_fields.fg_bg_color_grid = fg_bg_color_grid;
    }
}
if (require.main === module) {
    console.log('pal_crayola.length', pal_crayola.length);
} else {
}
module.exports = Color_Palette;
