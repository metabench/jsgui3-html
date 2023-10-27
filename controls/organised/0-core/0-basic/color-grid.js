/**
 * Created by james on 18/12/2016.
 */
const jsgui = require('../../../../html-core/html-core');
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


// May be a bit easier to define in terms of more explicit MVC.
//  defining what data type the color palette interacts with.
//   though there could be flexibility in terms of how many get interacted with.

// jsgui3-data-model may make sense?
//  or jsgui3-model.

// A model module could make sense...?
//  Maybe as a mixin for Control.
//   .model (evented class)
//     so can listen for model events

//    May as well make getters and setters observables. Many would immediately return anyway.
//     .model.set(name, value)
//     .model.get(name);
//     .model.set(value);
//     .model.get();
//     .model.validate(value);
//     .model.format = ...  getter and setter.

// .model could get into more detailed specification of data types that can have views made for them.
//   That seems like the most useful purpose for .model.

// .model.data_type

// Looks like jsgui3-html will get some awareness of low level data types.
// Defining controls so that it's determined already what type / structure of data is interacted with.
//   May have some low level efficiency improvements too, such for color palette rgb values.

// Defining the data type for the color (model).

// Want to define it so that a color (24 bit) is 3 8 bit values, uint8 x 3 for each of the components.
//  Would prefer the framework to have 'understanding'.

// .view will be for all settings to do with the view?

// seems like control.model needs a lot more work to make it suitable.
//  once we have model data types specified, we can make the controls that interact with them.



















// This also could make good use of mx_display_modes


// Looks like we will need to fix grid sizes & sizing.
//  Perhaps a new mixin, autosizing / autosize-to-fill-space could work?




// Could accept only some specific types of data eg numeric.
//  May well want nicer / custom scrollbars.

// It will be a text box but the selection list appears below.
//  So we will use List with its own scrollbar.

// Platform control.
//  Move the colours somewhere else.
//   Facility for general jsgui data.

// Data plugins maybe.
//  Optional loading of data plugins from the server side?

// In a later HTTP request?
//  Local storage and caching mechanism, generalised.




// Put the color data elsewhere.
//   Not in controls.
//   In html-core perhaps.
//     Or even as a Resource???
//       Eg being able to calculate and get matching assortments of colors.


// A Colors class and class instance could help.

// HTML Helpers???

// Want some lower level color choice functionality.
//   Maybe more integrated with gfx.

//const pal_crayola = require('../../../../html-core/arr_colors');

// Maybe simplify this a lot?


// Contains a Grid control.

// Could do with 2 'active palette' colours.
//   It's own mini-palette?

// Color_Grid perhaps for colours in a grid, Color_Grid will have more functionality.
//   And Color_Grid could be used for just 2 colors, eg background and foreground.
//     Could have a 2 column multi row color grid for background and foreground color pairs.

// Could have Color_Pair control that is a grid of only 2.
//   Reuse a more complex component in a more limited way in order to provide a simple and consistant API.





// Full_Color_Palette here...?


class Color_Grid extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'Color_Grid';
        super(spec);
        this.add_class('color-grid');

        // Should be able to check for this when needed.

        // Maybe a mixin could set up the internal relative div?
        //   Or just do it normally, and see about more compact syntax.

        // Could make this work a bit more according to the definition of what a color palette is.

        


        this.internal_relative_div = true;



        // Has various items.
        // At the top is a control that either shows the item selected, or search text.

        prop(this, 'palette', spec.palette);
        // A 'model' type property.

        prop(this, 'grid_size', spec.grid_size || [12, 12]);

        console.log('color_grid this.size', this.size);

        // [12, 12]

        //  
        //  Could use  mixin.
        //  Open_Closed mixin

        // Run-time mixins for the moment.


        // Maybe contain a single main area and a drop-down box

        if (!spec.abstract && !spec.el) {
            this.compose_color_palette_grid();
        }

        this.on('resize', (e_resize) => {
            //console.log('color palette resize event');
            if (this.grid) {

                // or could have browser css do the layouts

                // need to account for internal padding.
                var _2_padding = 12;
                var new_grid_size = v_subtract(e_resize.value, [_2_padding, _2_padding]);

                this.grid.size = new_grid_size;
            }
        });
    }

    activate() {
        if (!this.activate.__active) {
            super.activate();

            // listen for selection change events.

            this.grid.selection_scope.on('change', e => {
                //console.log('color palette ss change', e);
                //console.trace();
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

            // go through the cells, getting their color values from the DOM
            //console.log('pre grid each cell');
            
            const old_make_grid_cells_selectable = () => {
                // Selectable by default now.
                this.grid.each_cell(cell => {

                    //console.log('cell', cell);
                    //console.log('cell.dom.el', cell.dom.el);
                    //console.log('cell.dom.el.style.background-color', cell.dom.el.style['background-color']);
                    //console.log('cell.dom.attributes.style.background-color', cell.dom.attributes.style['background-color']);
    
                    //console.log('cell.color', cell.color);
    
                    // set color, but silently...
    
                    // .set(..., silent);
    
                    //cell._color = cell.dom.el.style['background-color'];
    
    
                    //cell.selectable = true;
                    //cell.color = cell.dom.el.style['background-color'];
    
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
                //console.log('item', item);
                if (item) {
                    if (item.hex) {
                        cell.color = item.hex;
                    } else {
                        if (typeof item === 'string') {
                            cell.color = item;
                        }
                    }
                    //var hex = item.hex;
                    //console.log('hex', hex);
                    //console.log('cell', cell);

                }
                //cell.selectable = true;
            });
        }

        
    }

    /*
    refresh() {
        //this.grid.clear();

        //this.grid.grid_size = 
        // A problem clearing dynamically added?

        // clear the cells, reapply the colors
        this.clear();
        //this.compose_color_palette();
        this.compose_color_grid();
        //this.grid.active();

        //this.add_grid_cells();
    }
    */


    compose_color_palette_grid() {
        console.log('compose_color_palette_grid');
        // An internal relative frame could help.
        //  Help superimposing anything relative to that DIV, any popup, but not require the DIV itself to have relative positioning.


        // Be able to switch on and off those options.
        //  An internal relative div in the kind of internal implementation property which could be done as a rendering property.

        //var size = this.size || [200, 200];
        //console.log('size', size);

        var padding = 6;

        // Make it so that resizing the grid resizes the internal controls.
        //  A resize event listener.

        //throw 'stop';

        // internal_relative_div = true || false

        console.log('this.grid_size', this.grid_size);

        const grid = this.grid = new Grid({
            'context': this.context,
            'grid_size': this.grid_size,
            'size': this.size,
            'cell_selection': 'single'
        });

        // grid.cells possibly
        //  Could be an iterator rather than an array.

        //console.log('pre each cell\n\n');

        grid.each_cell((cell, [x, y]) => {
            //console.log('cell', cell);

            // Assign the colors here...?

        });
        /*
        this.grid.style({
            //'position': 'relative'
        })
        */
        this.add(grid);

        /*
        if (this.__active) {
            //console.log('pre activate grid');
            this.grid.activate();
        }
        */

        this.add_grid_cells();

        //this.dom.attributes['data-jsgui-ctrl-fields'] = stringify({
        //    'grid': this.grid._id()
        //}).replace(/"/g, "'");

        this._ctrl_fields = this._ctrl_fields || {};

		this._ctrl_fields.grid = grid;
        // Then iterate the grid cells.

    }

}



if (require.main === module) {
    console.log('pal_crayola.length', pal_crayola.length);
} else {

}
// pal_crayola

module.exports = Color_Grid;