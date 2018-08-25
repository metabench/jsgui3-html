var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;

var Data_Item = require('./data-item');
// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
var fields = [
    ['text', String]
];
class Data_Row extends Control {
    // fields... text, value, type?
    //  type could specify some kind of validation, or also 'password'.
    // single field?
    //  and can have other fields possibly.
    constructor(spec) {
        super(spec);
        this.add_class('data-row');
        let context = this.context;

        // Contains data items

        this.items = [];

        // Or use the inner collection of controls?

        if (spec.items) {
            each(spec.items, item => {
                //console.log('item', item);
                this.items.push(this.add(new Data_Item({
                    'context': context,
                    'value': item
                })));
            })
        }

        //ctrl_title_bar.set('dom.attributes.class', 'titlebar');
        //this.add(span);
    }
};
module.exports = Data_Row;