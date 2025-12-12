/**
 * Created by James on 04/08/2014.
 */


var jsgui = require('./../../../../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, def = jsgui.is_defined;
var Control = jsgui.Control;

// Titled_Panel would be useful.
//  Would extend the panel, and also show it's name or title.

// Want to keep panel simple. Could have Titled_Panel, maybe Resizable_Panel.
//  If we want a panel with a lot of functionality, it would be the Flexi_Panel.

// Panel_Grid possibly...
//  Can load panels etc...

// May make Showcase version.
//  Or SuperPanel?
//  Or ActivePanel?
//   SmartPanel

// A panel with something like 4 panels inside it...
//  Should be a way of doing application layout.

// Or just use a normal panel with a bunch of mixins?


// Panel could have a text label as part of it (by default, easy to set, easy to move, easy to delete or not use)
//   Though may want to get into making it really easy to add new controls in specific ways, such as binding it to the edge
//     (and also probably reducing the size of the panel itself so that label (or div / span element) fits)




class Panel extends Control {
    // panel name?

    // could have a title field.
    //'fields': {
    //    'name': String
    //}
    // maybe add before make would be better. add will probably be used more.
    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'panel';
        super(spec);
        //this.__type_name = 'panel';
        //this.add_class('panel');
        this.add_class('panel');

        if (def(spec.name)) {
            this.name = spec.name;
        }

        if (def(spec.title)) {
            this.title = spec.title;
        }


        // With name as a field, that field should get sent to the client...
        if (!spec.abstract && !spec.el) {
            var l = 0;
            //var ctrl_fields = {
            //}

            let n = this.name;
            if (def(n)) {
                let f = this._fields = this._fields || {};
                f.name = n;
            }

            if (def(this.title)) {
                const title_ctrl = new Control({
                    context: this.context,
                    class: 'panel-title'
                });
                title_ctrl.add(this.title);
                this.add(title_ctrl);
                this._ctrl_fields = this._ctrl_fields || {};
                this._ctrl_fields.title = title_ctrl;
            }

            if (def(spec.content)) {
                this.add(spec.content);
            }


            //var name = this.name;
            //if (is_defined(name)) {
                //this._fields = this._fields || {};
                //this._fields['name'] = name;
            //    this.name = name;
            //}
        }
    }
    //'resizable': function() {
    //},

    /*
    'activate'() {
        // May need to register Flexiboard in some way on the client.

        if (!this.__active) {
            super.activate();
            this.content.on('change', e => {
                console.log('e', e);
                console.log('this', this);
            })
        }
        
    }
    */
}
module.exports = Panel;
