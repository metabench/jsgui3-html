/**
 * Created by James on 04/08/2014.
 */

const jsgui = require('./../../../../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var group = jsgui.group;


var fields = {
    'name': String,
    'text': String,
    'value': String,
    'checked': Boolean
};

// Want better way(s) to hook up fields like this in controls / data objects.

// Data objects should probably be able to handle fields.
//   Though rendering should also render these fields as their own specific attribute data-jsgui-fields

// have some relatively direct access to the canvas API...?

// A canvas fractal on the client may be nice.
//   A pixel based and maybe fractal system could make nice effects.
//     Be able to specify and transmit them without much code.
//       Make things look more natural in some ways.

// Validation status changes definitely look like a good way forward for some things....





class Canvas extends Control {
    constructor(spec, add, make) {
        spec.tagName = 'canvas';
        
        super(spec);
        this.__type_name = 'canvas';

        //this.add_class('checkbox');
        const context = this.context;

        if (!spec.abstract && !spec.el) {
            


        }

    }
    //'resizable': function() {
    //},
    'activate'() {

        if (!this.__active) {
            super.activate();

            

        }



        //

    }
};

Canvas.css = `
}
`

module.exports = Canvas;