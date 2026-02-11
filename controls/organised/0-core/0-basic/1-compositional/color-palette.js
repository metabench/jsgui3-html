const jsgui = require('../../../../../html-core/html-core');
const Color_Grid = require('./color-grid');
const { v_subtract } = jsgui;
var Control = jsgui.Control;
const {
    field,
    prop
} = require('obext');
const palettes = require('../../../../../html-core/palettes');

class Color_Palette extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'color_palette';
        super(spec);
        this.add_class('color-palette');

        // Resolve palette: accept a key string, an array, or default
        const palette_key = spec.palette_key || palettes.default_key;
        let resolved_palette;
        let resolved_grid_size;

        if (typeof spec.palette === 'string') {
            const entry = palettes[spec.palette];
            resolved_palette = entry ? entry.colors : palettes[palettes.default_key].colors;
            resolved_grid_size = entry ? entry.grid : [12, 12];
        } else if (Array.isArray(spec.palette)) {
            resolved_palette = spec.palette;
            resolved_grid_size = spec.grid_size || [12, 12];
        } else {
            const entry = palettes[palette_key];
            resolved_palette = entry ? entry.colors : palettes[palettes.default_key].colors;
            resolved_grid_size = entry ? entry.grid : [12, 12];
        }

        prop(this, 'palette', resolved_palette);
        prop(this, 'palette_key', palette_key);
        prop(this, 'grid_size', spec.grid_size || resolved_grid_size);

        if (!spec.abstract && !spec.el) {
            this.compose_color_grid();
        }
        this.on('resize', (e_resize) => {
        });
    }

    /**
     * Switch to a different palette by key.
     * Rebuilds the color grid with the new palette.
     */
    set_palette(key) {
        const entry = palettes[key];
        if (!entry) {
            console.warn('Color_Palette: unknown palette key:', key);
            return;
        }
        this.palette_key = key;
        this.palette = entry.colors;
        this.grid_size = entry.grid;
        this.rebuild_grid();
    }

    /**
     * Rebuild the color grid (e.g. after palette change).
     */
    rebuild_grid() {
        if (this._ctrl_fields && this._ctrl_fields.color_grid) {
            const old_grid = this._ctrl_fields.color_grid;
            if (old_grid.el && old_grid.el.parentNode) {
                old_grid.el.parentNode.removeChild(old_grid.el);
            }
        }
        const color_grid_pxsize = v_subtract(this.size, [0, 46]);
        const color_grid = this.grid = new Color_Grid({
            'context': this.context,
            'grid_size': this.grid_size,
            'palette': this.palette,
            'size': color_grid_pxsize,
            'cell_selection': 'single'
        });
        this.add(color_grid);
        this._ctrl_fields.color_grid = color_grid;

        if (this.__active && color_grid.activate) {
            color_grid.activate();
        }
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

            // Wire up the palette selector <select> change event
            if (this._ctrl_fields && this._ctrl_fields.palette_selector_ctrl) {
                const select_ctrl = this._ctrl_fields.palette_selector_ctrl;
                if (select_ctrl.el) {
                    select_ctrl.el.addEventListener('change', () => {
                        this.set_palette(select_ctrl.el.value);
                    });
                }
            }

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

        // Palette selector — use jsgui Controls for SSR
        const select_ctrl = new Control({
            'context': this.context,
            'tag_name': 'select'
        });
        select_ctrl.add_class('palette-selector');
        select_ctrl.style('display', 'block');
        select_ctrl.style('margin', '4px 0');
        select_ctrl.style('padding', '3px 6px');
        select_ctrl.style('font-size', '12px');
        select_ctrl.style('width', '100%');
        select_ctrl.style('box-sizing', 'border-box');

        for (const key of palettes.keys) {
            const opt = new Control({
                'context': this.context,
                'tag_name': 'option'
            });
            opt.dom.attrs['value'] = key;
            if (key === this.palette_key) {
                opt.dom.attrs['selected'] = 'selected';
            }
            opt.add(palettes[key].name);
            select_ctrl.add(opt);
        }
        this.add(select_ctrl);

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
        this._ctrl_fields.palette_selector_ctrl = select_ctrl;
    }
}
if (require.main === module) {
    console.log('palettes:', Object.keys(palettes));
} else {
}
module.exports = Color_Palette;
