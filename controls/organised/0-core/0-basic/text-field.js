// Maybe just change to Field control
// Then Field_Group control would avoid confusion with an HTML form.

// This will be more about text or string editor in the future.

const jsgui = require('./../../../../html-core/html-core');
const Text_Input = require('./text-input');
const Text_Item = require('./text-item');
/*
var stringify = jsgui.stringify,
	each = jsgui.each,
	tof = jsgui.tof;
	*/
const Control = jsgui.Control;

const {prop, field} = require('obext');

// fields could have default values too.

// May well be worth improving and extending this.
//   Put code to set up specific features in their own functions.
//     May later want to optimise (make more concise) the code here using more patterns.


// Late 2023 - Currently works, but could do with extra options, finesse, and making the code more compact and idiomatic,
//   making use of (new) lower level features to support it.



// 

const fields = [
	['text', String],
	['name', String],
	//['value', String],
	['type', String],
	['editable', Boolean, true],
	['show_text', Boolean, true]
];

// Text_Field


// Value has got to be dynamic!!!!

// When activated, respond to the property changes...
//   Or even not only when activated.


// Proper dom / view / model referencing and clarity seems important.

// ctrl.model.on(change)???


// Could seem the most explicit MVC or CVM type pattern.
// ctrl.view.model.on()


// .label.text perhaps....



class Text_Field extends Control {
	// fields... text, value, type?
	//  type could specify some kind of validation, or also 'password'.

	//  and can have other fields possibly.
	constructor(spec) {

		// Putting the fields in the constructor of Control....
		//   Could be effective.
		//   Or could put it into the spec instead.
		//     Could have Data_Object handle fields, and have extensions where needed in Control.



		// The ctrl spec fields - does it use oext???

		super(spec, fields);

		this.__type_name = 'text_field';
		this.add_class('text-field');

		if (spec.type) this.type = spec.type;
		if (spec.placeholder) this.placeholder = spec.placeholder;

		field(this, 'value', spec.value);

		if (!spec.el) {
			this.compose_text_field();
		}

		// obext this.editable property.
		//  Will show different layouts / compositions depending on that property.

		// Maybe a more explicit .view.model.value setter would help????


		// .value setter seems to be malfunctioning....?



		/*

		this.on('change', e => {
			const {name, value} = e;

			if (name === 'value') {
				this.text_input.value = value;
			}
		})
		*/

		//this.add_event_listener('change', function(e) {
		//console.log('Text_Field change event e ' + stringify(e));
		//});
	}

	/*
	this.on('change', e => {

                //console.log('e', e);
                const {name, value} = e;

                //if (e.old !== undefined) {
                    if (e.value !== e.old) {

                        if (name === 'value') {
                            dom.el.value = value;
                        }

                    }
                //}

                
            })
	*/


	// Just call it .model perhaps????

	// The Control is the abstraction for the View (always???)

	// Not sure about MVVM here.
	// Maybe just CM.
	// The Control also representing the View?
	
	// Maybe just .model rather than .view.model.


	// The view model could be a model that applies just to the view, maybe like a font, not the text itself.
	//   If it were an option for how the text gets viewed in that session, rather than a setting to be saved with that text.





	/*
	
	get view() {

		// And .model as well....
		const {textInput} = this;

		return {
			get model() {
				return {

					get on() {
						return (name, handler) => {

							//console.log('name', name);

							if (name === 'change') {
								// listen for the textInput change of value.

								textInput.on('change', e => {
									// Maybe need the textInput view model????

									if (e.old !== e.value) {
										if (e.name === 'value') {
											handler({
												name: 'change',
												property_name: 'value',
												value: e.value,
												old: e.old
	
											});
										}
									}

									
								})


							}

						}
					},

					get value() {
						return this.value;
						//  for the moment....
					}
				}
			}

		}

	}
	*/

	get model() {
		const that = this;
		return {

			get on() {
				return (name, handler) => {

					//console.log('name', name);

					if (name === 'change') {
						// listen for the textInput change of value.
						
						that.textInput.on('change', e => {
							// Maybe need the textInput view model????

							if (e.old !== e.value) {
								if (e.name === 'value') {
									handler({
										name: 'change',
										property_name: 'value',
										value: e.value,
										old: e.old

									});
								}
							}

							
						})


					}

				}
			},

			get value() {
				return this.value;
				//  for the moment....
			}
		}
	}

	activate() {
        if (!this.__active) {
            super.activate();
            const {dom, textInput} = this;

			//console.log('activate Text_Field');

			// The view model changing would be a different / more important thing to respond to.
			//  .value will raise the .view.model change event.

			// Maybe also enable / sometimes even require ??? a less ambiguous syntax for attaching DOM events?






			
			this.on('change', e => {

                //console.log('e', e);

				// If
                const {name, value} = e;

                //if (e.old !== undefined) {
                    if (e.value !== e.old) {

                        if (name === 'value') {

                            textInput.value = value;
                        }

                    }
                //}

                
            })

			textInput.on('change', e => {

                //console.log('e', e);
                const {name, value} = e;

                //if (e.old !== undefined) {
                    if (e.value !== e.old) {

                        if (name === 'value') {

							// Should create an event....
                            this.value = value;
                        }

                    }
                //}

                
            })




		}
	}



	compose_text_field() {
		// Parse-mount could take less space.

		// Probably a significant improvement.


		// Different view modes.
		//  or just .mode ????
		//  maybe .view.mode in some cases to avoid ambiguity, but shortcuts to .mode

		// .view.mode makes more sense.

		// .view could be another abstraction layer that could be used for other things.
		// .view = 'none' ????

		// just make a getter for the view object for the moment?







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
			this.text_input = textInput;
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