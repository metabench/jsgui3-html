var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;

// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
var fields = [
    ['text', String]
];

// text alias being title?
class Title_Bar extends Control {
    // fields... text, value, type?
    //  type could specify some kind of validation, or also 'password'.
    // single field?
    //  and can have other fields possibly.
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'title_bar';

        super(spec, fields);
        

        if (!spec.el) {
            this.add_class('title-bar title bar');
            var span = new jsgui.span({
                'context': this.context,
                'text': this.text
            })

            /*
            span.add(new jsgui.textNode({
                context: this.context,
                text: this.text
            }));
            */
            //ctrl_title_bar.set('dom.attributes.class', 'titlebar');
            this.add(span);
        }
        
    }
};
module.exports = Title_Bar;