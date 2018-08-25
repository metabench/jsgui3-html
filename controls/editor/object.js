// object editor
var jsgui = require('../../html-core/html-core');
var Object_Viewer = require('../viewer/object');
var Object_KVP_Editor = require('./object-kvp');
var factory = require('./factory');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

class Object_Editor extends Object_Viewer {
	// Maybe should put this into a form, so that it does a form post.
	//  That could possibly be disabled.

	constructor(spec) {
		super(spec);
		var make = this.make;
		this.factory = factory;
		this.Object_KVP = Object_KVP_Editor;

		//this._super(spec);

		this.add_class('object-editor');
		this.__type_name = 'object_editor';

	}
	'refresh_internal'() {
		//this._super();
		super.refresh_internal();

	}
};
module.exports = Object_Editor;