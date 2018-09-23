/**
 * Created by James on 04/08/2014.
 */


var jsgui = require('../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, def = jsgui.is_defined;
var Control = jsgui.Control;

// Titled_Panel would be useful.
//  Would extend the panel, and also show it's name or title.

// Want to keep panel simple. Could have Titled_Panel, maybe Resizable_Panel.
//  If we want a panel with a lot of functionality, it would be the Flexi_Panel.

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
}
module.exports = Panel;
