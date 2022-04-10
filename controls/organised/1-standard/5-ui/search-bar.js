const jsgui = require('./../../../../html-core/html-core');

// text input?
// search button
//   an icon system would be of great help.
//    references to web resources for icons too.
//    making use of them from local CMS as well. CMS and icons could be integrated well.

const {Control} = jsgui;

//const Button = require('./button');
//const Text_Input = require('./text-input');

// Worth having a 'text' property.
//  Use oext.

// Will support rapid lookups.
//  Results will not be part of this right now though.

// Worth having a property or field to represent the 'text'.
//  Possibly Data_Value will be of use.

// or ._ being an evented class that stores properties?
// specific change events for specific properties?

const {prop, field} = require('obext');

// The search bar having toolboxes would make sense.
//  For holding buttons etc.

class Search_Bar extends Control {
    constructor(spec) {
        // Capitalise type names?
        spec.__type_name = spec.__type_name || 'search_bar';
        super(spec);

        // Composed of the button and the text input.
        // Needs to itself raise an event / events from the search button being pressed.
        //  How to do that with parse_mount?
        //   Would get the created items back, and then be able in interact with them.
        this.add_class('search-bar');
        // a prop for the text being enough?
        /*
        prop(this, 'value', (e_change) => {
            console.log('text prop e_change', e_change);
        });
        */
        field(this, 'value');

        if (!spec.el) {
            //this.compose_block_summary();

            // Flexibility with buttons?
            //  A toolbox or two?
            //  jsgui toolbox control?
            //   yes would make sense for some guis such as drawing apps, IDEs.
            //   a bit like a menu. 

            const jsguiml = '<Text_Input name="input"></Text_Input><Button name="btn"></Button>';
            //console.log('Search_Bar constructor pre parse_mount Object.keys(jsgui.controls)', Object.keys(jsgui.controls));

            //console.trace();
            //throw 'stop';
            jsgui.parse_mount(jsguiml, this, jsgui.controls);
        }
    }

    // onkeypress 

    activate() {
        if (!this.__active) {
            super.activate();
            const {input, btn} = this;

            // will need to listen to the keypress event.
            // worth raising a text change event?

            /*
            input.on('keypress', e => {
                console.log('input keypress', e);

                // get the text of the input...

                const input_text = input.text;
                console.log('input_text', input_text);
                this.text = input_text;

            });
            */

            // input on change...

            //  change event overriding dom?
            //   a little ambiguous?

            // nice if this happens on keypress / paste / whatever causes it to change.
            //  don't like how change means losing focus.

            // So text input should raise the 'change' event when its text field / property changes.

            input.on('change', e_change => {
                //console.log('Search_Bar input change', e_change);
                // should happen when the value changes? Change event gets called because of the field?
                // value property - set the value of the search bar.

                const {name, value} = e_change;

                if (name === 'value') {
                    this.value = value;
                }
            });

        }
        
    }
}

module.exports = Search_Bar;
