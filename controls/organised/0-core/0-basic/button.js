const jsgui = require('./../../../../html-core/html-core');

// This may be a simple one to include .view.model but no .data.model (perhaps???)

// It does not really deal with / interact with data in a model itself, though it itself could do with a .view.ui.data.model.

// no view.data.model though....

// view.ui.data.model would be a decent place to hold an abstraction about what kind of presentation options the control has.

// view.ui.data.model.size for example.
//    could even be a string like 'x-small', 'micro', 'normal', 'compact', 'large', 'fully-expanded'???, 'very-large'.
//      or an enumeration of strings / values like that.
// That would be a level further abstracted from the DOM.
//   Would want to listen to that property change to sync with other parts of the (inner control) system.

// .view.ui.data.model.icon ????
//    By putting things behind these various objects, can be as clear as possible about them, if it's found there is too much typing,
//      could even make a higher level interface on top of this, could simplify access to it.

// Eg setting ctrl.size automatically sets ctrl.view.ui.data.model.size.



var Control = jsgui.Control;

class Button extends Control {
    constructor(spec = {}, add, make) {
        spec.__type_name = spec.__type_name || 'button';
        spec.tag_name = 'button';
        super(spec);
        this.add_class('button');
        if (spec.text || spec.label) {
            this.text = spec.text || spec.label;
        }
        if (!spec.el) {
            this.compose_button();
        }
    }
    'compose_button'() {
        if (this.text) {
            this.add(this.text);
        }
    }
    'activate'() {
        super.activate();
    }
}
module.exports = Button;

if (require.main === module) {
    class London_Button extends Button {
        constructor(spec = {}, add, make) {
            // Call the superclass constructor with the spec, add, and make arguments.
            spec.text = "London, England";
            super(spec, add, make);
    
            // Set the text property of the London_Button to "London, England".
            //this.text = "London, England";
        }
    }
    const lbtn = new London_Button();
    console.log(lbtn.all_html_render());
}