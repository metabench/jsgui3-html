const jsgui = require('./../../../../html-core/html-core');
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