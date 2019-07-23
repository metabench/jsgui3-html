/*
 if (typeof define !== 'function') { var define = require('amdefine')(module) }

 define(["../../jsgui-html"],
 function(jsgui) {
 */

var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

// The basic controls should not do too much on top of normal HTML, but make it easier to do a few things
//  there.

const {prop, field} = require('obext');

/*
var fields = [
    ['value', String],
    ['type', String]
];
*/


// A synonym / alias property would help a lot.

// Fairly simple wrapping around DOM.


// Say this is a 'basic' control?
//  Or an HTML control?
//   So we have the controls that wrap HTML.
//   Or markup, elements, svg, nodes etc. 


// Want to keep internal text property / value property synced with the dom.
// Getter is most important for this input.

class Text_Input extends Control {
    // is an Input element.
    //  type of either text or password.
    // could possibly specify some of the starting field values in this part.

    constructor(spec) {
        //this._super(spec, fields);
        spec.__type_name = spec.__type_name || 'text_input';
        spec.class = 'text-input';

        // fields were not working through this constructor system.
        //  maybe better as an array in the spec. Simpler API that way.
        super(spec);

        // Prop not working here.
        //  Not sure why. using field() function does. Not sure how they are so different.
        field(this, 'value');

        if (spec.placeholder) this.placeholder = spec.placeholder;

        // listen for a change in the value of the text field, in the DOM.
        //  and when that changes, the value changes.
        //this.set('dom.tagName', 'input');

        if (!spec.el) {
            this.compose_text_input();
        }
        // This should render as an input field.
    }
    compose_text_input() {
        this.dom.tagName = 'input';

        //console.log('dom.tagName ' + this.get('dom.tagName'));

        // maybe dom should be able to have a variety of attributes,
        //  or could actually specify what is valid in HTML.
        //  Would prefer to specify the HTML so that better html editors could be made... select the
        //   input type from a drop-down menu. Smaller builds may not have these.

        //this.set('dom.attributes.type', 'input');
        this.dom.attributes.type = 'input';
        this.dom.attributes.value = this.value;

        if (this.placeholder) this.dom.attributes.placeholder = this.placeholder;

        //this._ctrl_fields = this._ctrl_fields || {};
        //this._ctrl_fields.

        // .value or .text?

        // being able to read (set?) a text property would help.

        //  obext alias?


    }

    activate() {
        if (!this.__active) {
            super.activate();
            const {dom} = this;
            // listen for keypress.
            //  must do non-dom-updating event?

            // say that its source is the 'dom'. or 'user'?

            //  or direct listen to the node here???

            // misses backspace key?
            this.on('keypress', e_keypress => {
                // get the value of the dom node here.

                // This is before the keypress takes place.

                setTimeout(() => {
                    //const value = dom.el.value;
                    console.log('pre set .value prop value', dom.el.value);
                    this.value = dom.el.value;
                    // Should raise a change event?
                }, 0);

                

            })




        }


    }

    // the change event... its in the dom.



    /*
    get value() {

    }
    */
}
module.exports = Text_Input;

//return Text_Input;
//});