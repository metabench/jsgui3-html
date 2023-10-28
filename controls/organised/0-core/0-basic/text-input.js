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

// See about making this extendable / use progressive enhancement.

class Text_Input extends Control {
    constructor(spec) {
        //this._super(spec, fields);
        spec.__type_name = spec.__type_name || 'text_input';
        spec.class = 'text-input';

        // fields were not working through this constructor system.
        //  maybe better as an array in the spec. Simpler API that way.
        super(spec);
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
        this.dom.attributes.type = 'input';
        this.dom.attributes.value = this.value;

        if (this.placeholder) this.dom.attributes.placeholder = this.placeholder;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const {dom} = this;

            // And of course need to respond to value change events....

            //  Silent updates?
            //    Avoid infinite loops?
            //    Or test the event source (better).

            this.on('change', e => {

                //console.log('e', e);
                const {name, value} = e;

                //if (e.old !== undefined) {
                    if (e.value !== e.old) {

                        if (name === 'value') {
                            dom.el.value = value;
                        }

                    }
                //}

                
            })




            this.on('keypress', e_keypress => {
                setTimeout(() => {
                    this.value = dom.el.value;
                    // Should raise a change event?
                }, 0);
            });

            this.on('keyup', e_keypress => {
                setTimeout(() => {
                    this.value = dom.el.value;
                    // Should raise a change event?
                }, 0);
            });
        }
    }
}
module.exports = Text_Input;

//return Text_Input;
//});