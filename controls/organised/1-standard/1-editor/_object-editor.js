// object editor

var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

// Another type of control? - composite or basic-composite?
//  That would be an unenhanced Login control. Made up of basic controls, will render and
//   be useful on very limited platforms.

// Since this is now an advanced control...

// Flexible fields?
//  So it can accept an object or data_object.

// Will need to render with different means for either an object or data_object.
//  Basically, does the 'each', and then will show the keys and their values.

// Will create the specific editor for each of the values.

// Seems like they should be in the same module as they all need each other.

// I think making it so that the editor gets activated on the client makes most sense.
//  Need to ensure that the JSGUI JS gets served to the client.

// Now, can make editor versions of these.
//  Will inherit from the editors.

// An XML editor like this would be very nice.

var String_Editor = String_Viewer.extend({

	// Maybe should put this into a form, so that it does a form post.
	//  That could possibly be disabled.


	constructor(spec) {
		var make = this.make;


		super(spec);

		this.add_class('string-editor');
		this.__type_name = 'string_editor';

	},
	'refresh_internal': function() {
		super();


	}
});

var Number_Editor = Number_Viewer.extend({

	// Maybe should put this into a form, so that it does a form post.
	//  That could possibly be disabled.


	constructor(spec) {
		var make = this.make;


		super(spec);

		this.add_class('number-editor');
		this.__type_name = 'number_editor';


		// when the object changes, we re-render.
		//  Not sure about re-rendering the whole thing though.

	},
	'refresh_internal': function() {
		super();

	}
});

var Object_KVP_Editor = Object_KVP_Viewer.extend({
	constructor(spec) {
		super(spec);
		this.add_class('object-vkp-editor');
		this.__type_name = 'object_vkp_editor';

	},
	'refresh_internal': function() {
		super();

	}
})


// Maybe make this an Array_Editor too?
var Object_Editor = Object_Viewer.extend({

	// Maybe should put this into a form, so that it does a form post.
	//  That could possibly be disabled.

	constructor(spec) {
		var make = this.make;

		super(spec);

		this.add_class('object-editor');
		this.__type_name = 'object_editor';

	},
	'refresh_internal': function() {
		super();


	}
});

var Array_Editor = Array_Viewer.extend({

	// Maybe should put this into a form, so that it does a form post.
	//  That could possibly be disabled.

	constructor(spec) {
		var make = this.make;

		super(spec);

		this.add_class('array-editor');
		this.__type_name = 'array_editor';


		// when the object changes, we re-render.
		//  Not sure about re-rendering the whole thing though.

	},
	'refresh_internal': function() {
		super();

	}
});

var editor = function(obj, context) {
	var tobj = tof(obj);
	console.log('tobj ' + tobj);
	if (tobj == 'object') {
		var res = new Object_Editor({
			'context': context,
			'value': obj
		})
		return res;
	}
	if (tobj == 'array') {
		var res = new Array_Editor({
			'context': context,
			'value': obj
		})
		return res;
	}
	if (tobj == 'string') {
		var res = new String_Editor({
			'context': context,
			'value': obj
		})
		return res;
	}
	if (tobj == 'number') {
		var res = new Number_Editor({
			'context': context,
			'value': obj
		})
		return res;
	}
	if (tobj == 'data_value') {
		var val = obj.value();
		var tval = tof(val);

		if (tval == 'string') {
			var res = new String_Editor({
				'context': context,
				'value': obj
			})
		}

		if (tval == 'array') {
			var res = new Array_Editor({
				'context': context,
				'value': obj
			})
		}


		return res;
	}
}

modeule.exports = {
	'String_Editor': String_Editor,
	'Number_Editor': Number_Editor,
	'Object_Editor': Object_Editor,
	'Array_Editor': Array_Editor
}