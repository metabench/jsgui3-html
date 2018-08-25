var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;

// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
var fields = [
    ['value', Object]
];
class Data_Item extends Control {
    // fields... text, value, type?
    //  type could specify some kind of validation, or also 'password'.
    // single field?
    //  and can have other fields possibly.


    // this.__type_name = 'text_item';
    constructor(spec) {
        super(spec, fields);
        this.__type_name = 'data_item';
        this.add_class('data-item');
        let context = this.context;

        //console.log('this.value', this.value);

        this.add(new jsgui.textNode({
            text: this.value + '',
            context: this.context
        }));

        // Contains data items
        /*
        if (spec.item || spec.value) {
            let item = this.item = spec.item || spec.value;



        }
        */



        //ctrl_title_bar.set('dom.attributes.class', 'titlebar');
        //this.add(span);
    }
};
module.exports = Data_Item;