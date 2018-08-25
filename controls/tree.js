// A box that contains a tree.
//  While a tree can be put in a normal Control, will have some more functions / tools / controls for dealing with a tree, such as collapse_all etc.


var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;

const Panel = require('./panel');
const Title_Bar = require('./title-bar');

// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
var fields = [
    ['text', String]
];

// Could do with a File_Tree that can integrate with an FS_Resource



// text alias being title?
class Tree extends Control {
    // fields... text, value, type?
    //  type could specify some kind of validation, or also 'password'.
    // single field?
    //  and can have other fields possibly.
    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'tree';
        super(spec, fields);
        this.add_class('tree');
        //this.__type_name = 'tree';

        // Add the title bar and the main container space.
        /*
        this.title_bar = new Title_Bar({

        });
        */
        //if (spec.title) this.title = spec.title;
        this.title = spec.title || '';

        //add(Title_Bar({
        //    'text': 'tree'
        //}));

        // don't do this composition on the client.
        //  don't do it when connecting to an existing DOM.

        if (!spec.el) {
        //if (!window) {
            this.add(this.title_bar = new Title_Bar({
                context: this.context,
                text: this.title
            }));
    
            this.add(this.main = new Panel({
                context: this.context
            }));
    
            var ctrl_fields = {
                'title_bar': this.title_bar._id(),
                'main': this.main._id()
            };
    
            this.dom.attributes['data-jsgui-ctrl-fields'] = stringify(ctrl_fields).replace(/"/g, "'");
        }


        



    }
    clear() {

        console.log('this.main', this.main);

        this.main.clear();
    }
    activate() {
        super.activate();

        this.selection_scope = this.context.new_selection_scope();
    }
};
module.exports = Tree;