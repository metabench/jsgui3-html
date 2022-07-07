/*
 if (typeof define !== 'function') { var define = require('amdefine')(module) }

 define(["../../jsgui-html"],
 function(jsgui) {
 */

// Improved wysiwyg text editor? Such as with toolbar. Not so sure about contenteditable. These can take a while to make properly.
// display modes preview and code for example?
//  multiple display modes next to each other, side by side.
//   should be possible to orchestrate.
// Want the right abstractions so that specifying and using display modes is easy.
//  Don't want it too complex (on the surface)
// Writing controls so that they operate in different display mode settings
// Writing display mode specific code that gets controls to operate properly if there is more to do.

// Number only text input?
// Or validated to a specific format?


// jsgui3-html-core could be its own module even?
//   Would not have controls like these, would have bare minimum.
//     Or controls like these could be defined really concisely.

// control.active_view could make sense too.
//   Would need to be careful about changing it while in operation.

const jsgui = require('./../../../../html-core/html-core');
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

// More like a text input view in the future.
//   Will make somewhat more advanced (but still basic) string editor.
//   The main / default view will use a Text_Input.
//     Number editor will use and / or extend it in some ways.

// String_Editor will use the new model, view-model system.




// Could this be defined much more concisely?
//   Make it clear that this is a DOM_Element_Control? Or A Dom_Element_View (within a Control)?
//     How the value in the view corresponds to the value in the model?
//       Though this control does not have .model at the moment.
//         Could somehow automatically bind the value in the view itself with the value in the model?






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
                    //console.log('pre set .value prop value', dom.el.value);
                    this.value = dom.el.value;
                    // Should raise a change event?
                }, 0);

                

            });
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