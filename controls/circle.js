// JavaScript source code


var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

class Circle extends Control {
    // Can have different views open.
    // Can view by months, in different types.

    // could have a .view property
    //  string property, can say 'month', 'week',

    constructor(spec) {
        super();

        // should basically be whatever size is specified, with color, and border properties.
        // Will have some specific rendering code, default used is SVG rendering.

        // Need good server and client side control over DOM properties and integration with the control's properties.

        // Worth having some HTML examples using DIVs that get sized and shaped?
        //  May experiment more with mixin properties and functions, though they would be mixed into objects within a class heirachy.

        // Resizable (handles)
        // Color palette, that allows the color to be selected
        // Properties viewer that allows changes to be made.








    }


}