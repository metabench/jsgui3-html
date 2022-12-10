
const jsgui = require('./../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

// The basic controls should not do too much on top of normal HTML, but make it easier to do a few things
//  there.


// more work on fields? or use obext fields for now?
var fields = [
    ['value', String, '']

];

// Maybe not much need for this?


class Text_Item extends Control {
    // is an Input element.
    //  type of either text or password.
    // could possibly specify some of the starting field values in this part.

    constructor(spec) {
        //this._super(spec, fields);
        super(spec, fields);
        this.__type_name = 'text_item';
        this.add_class('item');

        // composition function instead...

        this.add(new jsgui.textNode({
            text: this.value,
            context: this.context
        }))
    }
}
module.exports = Text_Item;
