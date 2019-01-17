var jsgui = require('../html-core/html-core');
var Control = jsgui.Control;
//const fast_touch_click = require('../control_mixins/fast-touch-click');

class Button extends Control {
    constructor(spec, add, make) {
        // Wont fields have been set?
        //spec['class'] = spec['class'] || 'button';
        spec.__type_name = spec.__type_name || 'button';
        super(spec);
        var that = this;
        
        this.add_class('button');
        //this.add_class('button');
        // Want to have a system of accessing icons.
        //  Will be possible to do using a Postgres website db resource
        //   First want it working from disk though.

        // A way not to add the text like this to start with?
        //  Or just don't inherit from a button in some cases when we don't want this?

        if (spec.text || spec.label) {
            this.text = spec.text || spec.label;
        }

        //  || spec.no_compose === true
        if (!spec.el) {
            //if (!this._abstract) {}
            this.compose_button();
        }
    }
    'compose_button'() {
        if (this.text) {
            //console.log('pre add text to button', this.text);
            this.add(this.text);
        }
    }
    'activate'() {
        super.activate();

    }
}
module.exports = Button;