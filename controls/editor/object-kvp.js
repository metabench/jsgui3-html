// Maybe just call it KVP editor.
//  The object editor will use it, but so will some other things.




// object editor

/*
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(["../../../jsgui-html-enh", "../viewer/object-kvp", "./factory", "./basic/string"],
	function(jsgui, Object_KVP_Viewer, factory, String_Editor) {
*/

var jsgui = require('../../lang/lang');
var Object_KVP_Viewer = require('../viewer/object-kvp');
var factory = require('./factory');
var String_Editor = require('./string');
var Number_Editor = require('./number');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

// A way of telling this to do a component replace?
//  So that it uses the editor components instead of the viewer ones.

// Class substitutions may be a useful thing, so it chooses the correct class to use.
//  So, it could load with various references, and those references could be changed by using substitutions
//   before the module is initialized.
//  So, it would set values in the control's prototype.
//   Running a control could be done in different ways depending on what 'mode' or particular subclass is used.

// This could be more flexible in appearance so it can be used both for a JSON editor and a property editor.
//  Also good to have it so it



class Object_KVP_Editor extends Object_KVP_Viewer {
    constructor(spec) {
        super(spec);
        this.factory = factory;
        this.String = String_Editor;
        this.Number = Number_Editor;
        //this._super(spec);

        this.add_class('object-kvp-editor');
        // but keep the mode class somehow?
        // Or need to add it back again...?

        // Perhaps there could be a post_init stage where things like that can be done.

        // IE the superclass carries things out after a subclass has made its changes.
        //  The superclass's post init will be after all inits have finished.

        //this.add_class(this.get('mode'));
        this.add_class(this.mode);

        this.__type_name = 'object_kvp_editor';

    }
    'refresh_internal'() {
        // Instead of having viewer components, this needs to have editor components.

        this._super();

    }
    'activate'() {
      this._super();
    }
}
module.exports = Object_KVP_Editor;

		//return Object_KVP_Editor;
	//}
//);
