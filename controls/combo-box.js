/**
 * Created by james on 18/12/2016.
 */

// Could accept only some specific types of data eg numeric.
//  May well want nicer / custom scrollbars.

// It will be a text box but the selection list appears below.
//  So we will use List with its own scrollbar.

// Should be made out of component JSGUI controls as necessary. both option control as well as text box.

// text-input
//  drop-down-list (menu)

// Have a need for combo box
//  Choosing a month
//  Clicking on the box should bring up the full range of options
//   Could involve scrolling
//    In this situation, we want something totally HTML styled.
//    Not making use of native Options.
//     Keep native scrollbars for the moment. More work on jsgui scrollbars would help though.


// Hold a list of items
//  Data rendered as controls
//  

// Interested in data coming in from the side

// Item_Selector could be a good alternative.
//  More varied than Combo_Box. Not a problem having non-combo-box functionality.
var jsgui = require('../html-core/html-core');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

class Combo_Box extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'combo_box';
        super(spec);

        // Has various items.
        // At the top is a control that either shows the item selected, or search text.

        // spec.items

        // create Item control from the spec items
        //  They will be displayed in a vertical list
        //  



        //  
        //  Could use Items_Container mixin.
        //  Open_Closed mixin

        // Run-time mixins for the moment.



        // Maybe contain a single main area and a drop-down box

    }

}

module.exports = Combo_Box;