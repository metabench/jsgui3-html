
const jsgui = require('../../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

// The basic controls should not do too much on top of normal HTML, but make it easier to do a few things
//  there.

const textNode = require('../../../../../html-core/text-node');
// more work on fields? or use obext fields for now?
var fields = [
    ['value', String, '']

];

// Maybe not much need for this?

// A div containing a text node.
//   Possibly enable better control over inner text / html of both spans and divs.

// Being able to use .view.data.model.value to hold the text, as well as .data.model.value.
//   and then also just .value shortcutting to .data.model.value.





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

        this.add(new textNode({
            text: this.value,
            context: this.context
        }))
    }
}
module.exports = Text_Item;
