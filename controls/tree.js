// A box that contains a tree.
//  While a tree can be put in a normal Control, will have some more functions / tools / controls for dealing with a tree, such as collapse_all etc.
var jsgui = require('../html-core/html-core');
/*
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;
*/
const {stringify, each, tof, def, Control} = jsgui;

// Registration of controls within jsgui.
//  where it adds it to the map of controls.

// jsgui.controls is now the / a map of controls.

// Again, a 'platform' control.
//  Ways to merge in different controls / control sets?
//   That will come. It needs to be convenient.

// Could download the bare minimum.
//  Bare minimum / core controls.

// Could separate out the core controls ie document, div, span, svg, many others.
//  Pay them more attention. Could have plugins.
//   Styling shortcuts.
// Really advanced and flexible core that deals mostly with single controls, but sets the groundwork for 'platform' controls.

// Platform controls - separate from the core controls.
//  eos-live-www just seems to need to show some very basic controls ie have control over some span contents.
//   it has its own controls. then module-view as well.
//    so does not need much in terms of jsgui controls at all at this stage.





//  Then download a control set all at once in another file.








const Panel = require('./layout/panel');
const Title_Bar = require('./layout/title-bar');
const Tree_Node = require('./tree-node');
// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
const {prop, field} = require('../../../tools/tensor-imgs/ImageFormat/formats/shared/Tree/Ui32Binary/obext');
//var fields = [
//    ['text', String]
//];
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
        super(spec);
        this.add_class('tree');
        //this.__type_name = 'tree';
        // Add the title bar and the main container space.
        /*
        this.title_bar = new Title_Bar({
        });
        */
        //if (spec.title) this.title = spec.title;

        field(this, 'title');
        this.title = spec.title;

        //add(Title_Bar({
        //    'text': 'tree'
        //}));

        // don't do this composition on the client.
        //  don't do it when connecting to an existing DOM.

        if (!spec.el) {
        //if (!window) {
            this.compose_tree(spec);
        }

        // one way data binding.
        // this.bind('title', this.title_bar.text);
        // bind(this, 'title', this.title_bar.text)

        this.on('change', e_change => {
            if (e_change.name === 'title') {
                this.title_bar.text = e_change.value;
            };
        }) 
    }
    compose_tree(spec) {
        //console.log('this.title', this.title);

        // Can try the new parse_mount with controls.




        if (this.title !== undefined) {
            this.add(this.title_bar = new Title_Bar({
                context: this.context,
                text: this.title
            }));
        }
        this.add(this.main = new Panel({
            context: this.context
        }));
        //var ctrl_fields = ;
        if (spec.nodes) {
            for (let node of spec.nodes) {
                node.context = this.context;
                node.depth = 0;
                let tn = new Tree_Node(node);
                this.main.add(tn);
            }
        }
        this._ctrl_fields = Object.assign(this._ctrl_fields || {}, {
            //'title_bar': this.title_bar,
            'main': this.main
        });
        if (this.title_bar) {
            this._ctrl_fields.title_bar = this.title_bar;
        }
        //this.dom.attributes['data-jsgui-ctrl-fields'] = stringify(ctrl_fields).replace(/"/g, "'");
    }
    clear() {
        //console.log('this.main', this.main);
        this.main.clear();
    }
    activate() {
        super.activate();
        this.selection_scope = this.context.new_selection_scope();
    }
};
module.exports = Tree;