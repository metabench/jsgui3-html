// Maybe just change to Field control
// Then Field_Group control would avoid confusion with an HTML form.

const jsgui = require('../html-core/html-core');
const Text_Input = require('./text-input');
const Text_Item = require('./text-item');
/*
var stringify = jsgui.stringify,
	each = jsgui.each,
	tof = jsgui.tof;
	*/
const Control = jsgui.Control;

// fields could have default values too.

const fields = [
	['text', String],
	['name', String],
	['value', String],
	['type', String],
	['editable', Boolean, true],
	['show_text', Boolean, true]
];

class Text_Field extends Control {
	// fields... text, value, type?
	//  type could specify some kind of validation, or also 'password'.

	//  and can have other fields possibly.
	constructor(spec) {
		super(spec, fields);
		this.__type_name = 'text_field';
		this.add_class('field');

		if (spec.type) this.type = spec.type;
		if (spec.placeholder) this.placeholder = spec.placeholder;

		if (!spec.el) {
			this.compose_text_field();
		}

		// obext this.editable property.
		//  Will show different layouts / compositions depending on that property.


		//this.add_event_listener('change', function(e) {
		//console.log('Text_Field change event e ' + stringify(e));
		//});
	}
	compose_text_field() {
		// Parse-mount could take less space.

		// Probably a significant improvement.



		var left = new jsgui.div({
			'context': this.context
		});
		left.add_class('left');

		var right = new jsgui.div({
			'context': this.context
		});
		right.add_class('right');
		// adding should set the context properly.

		this.add(left);
		this.add(right);

		var clearall = new jsgui.div({
			'context': this.context
		});
		clearall.add_class('clearall');
		this.add(clearall);

		if (this.show_text) {
			var label = new jsgui.label({
				'context': this.context
			});
			//var text = this.get('text');
			//console.log('this.text ' + this.text);
			//console.log('tof text ' + tof(text));
			label.add(this.text);
			left.add(label);
		}

		const _ctrl_fields = this._ctrl_fields = this._ctrl_fields || {};

		// Needs to work differently.
		//  Define two modes, it will swap between modes based on editable property and changes to it.
		if (this.editable) {

			let o_spec = {
				'context': this.context,
				'value': this.value
			}

			if (this.placeholder) o_spec.placeholder = this.placeholder;

			var textInput = new Text_Input(o_spec);
			var tiid = textInput._id();

			// da(ctrl, str attr name, attr value)
			// da([arr of ctrl dom attr changes])

			textInput.dom.attributes.id = tiid;
			textInput.dom.attributes.name = this.name;
			label.dom.attributes.for = tiid;

			// and the type... it could be a password.
			//  that's a DOM attribute.
			textInput.dom.attributes.type = this.type;
			right.add(textInput);

			_ctrl_fields.textInput = textInput;
			this.text_input = _ctrl_fields.text_input = textInput;
		} else {
			// Text_Item.
			var text_item = new Text_Item({
				'context': this.context,
				'value': this.value
			});
			right.add(text_item);
		}
		// textInput
	}

	/*
	get value() {
		return this.text_input.value;
		//const text_input = this.text_input;

	}
	*/
}
module.exports = Text_Field;