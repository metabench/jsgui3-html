// Maybe just change to Field control
// Then Field_Group control would avoid confusion with an HTML form.

// This will be more about text or string editor in the future.

const jsgui = require('../../../../../html-core/html-core');
const Text_Input = require('../0-native-compositional/Text_Input');
const Text_Item = require('./text-item');
/*
var stringify = jsgui.stringify,
	each = jsgui.each,
	tof = jsgui.tof;
	*/
const {Control, Control_Data, Control_View, Data_Object, Data_Value, Data_Model} = jsgui;

const {field} = require('lang-tools');

const Data_Model_View_Model_Control = require('../../../../../html-core/Data_Model_View_Model_Control');


const Validation_Status_Indicator = require('./Validation_Status_Indicator');
const { model_data_view_compositional_representation } = require('../../../../../control_mixins/mx');


// fields could have default values too.

// May well be worth improving and extending this.
//   Put code to set up specific features in their own functions.
//     May later want to optimise (make more concise) the code here using more patterns.


// Late 2023 - Currently works, but could do with extra options, finesse, and making the code more compact and idiomatic,
//   making use of (new) lower level features to support it.



// 

// Will set the fields up (slightly?) differently in the future?
//   Or passing it along as 2nd param could be OK???


// Maybe an is_editable mixin???
//   Or have that integrated with the various view and model systems.
//     so if there is an 'editable' ui property, its value will have some kind of synced mapping to other parts of the system.

// Simplify things from a lower level too.



const fields = [
	['text', String],
	['name', String],
	//['value', String],
	['type', String],
	['editable', Boolean, true],
	['show_text', Boolean, true]
];

// Could use validation status and validation status indicator.

// Could see if updates to the Data_Model (from the View_Model) validate correctly.
//   See if the View_Model (.data.model) validates properly.
//     Assigning validation rules to the view.data.model too....




// Could maybe use a status indicator mixin???

// Or the status indicator only has a view.model ???



//  status_indicator.data.model = ....



// Text_Field


// Value has got to be dynamic!!!!

// When activated, respond to the property changes...
//   Or even not only when activated.


// Proper dom / view / model referencing and clarity seems important.

// ctrl.model.on(change)???


// Could seem the most explicit MVC or CVM type pattern.
// ctrl.view.model.on()


// .label.text perhaps....



// extends Data_Model_View_Model_Control perhaps.

// Making effective ll functionality to support this would help a lot.

// For the moment should focus on implementing the interface here???
//   No, separate the concerns now, so that can be general purpose.


// Maybe should use a Data_Value by default.

// Perhaps Data_Value could have a .name property as well.
//   The name of the value. Synonymous with .key I suppose.

// Could display the data_value name (perhaps???)

// Maybe bound to the name and the value?

// Data_Model.clone() could help.
//   So set the view.data.model = data.model.clone()

// See about some work on the .view.ui.model here.

//   Being able to specify it nicely will help.

//   More view.ui.options or similar....
//     .ui.options makes sense....
//     





// Could also make Text_Input extend Data_Model_View_Model_Control.


// No, should be made from a normal control but which has the model_data_view_compositional_representation mixin in use.

// 



// Seems worth making a new version which uses the new (high-level? mid-level?) API that sets up and makes use of data and view models etc.
//   Need some sort of DOM data binding too.

// defining how a view.data.model syncs with the dom.el.value or something.

// Mid-level code to get all of it working concisely on a high level.

// view.ui.inner.compositional.model for example.
//   maybe most controls won't support it???
//   the Window Control should support it, some others too....


// This does seem essential when representing some data.
//   Let's also have a validation indicator in an example.


// Need very clear and idiomatic data model / value sync and validation code and APIs.
//   A view.data.model.validation.state
//

// 

// this.validation.status change etc....
// The validation between the view and the data model.







class Text_Field extends Control {
	// fields... text, value, type?
	//  type could specify some kind of validation, or also 'password'.

	//  and can have other fields possibly.
	constructor(spec) {

		super(spec, fields);
		//super(spec);
		this.editable = true; // for now.

		this.__type_name = 'text_field';
		this.add_class('text-field');

		//if (spec.type) this.type = spec.type;
		// could be 'password' for example...???


			if (spec.placeholder) this.placeholder = spec.placeholder;

			if (spec.label !== undefined && spec.text === undefined) {
				this.text = spec.label;
			}

			if (spec.value !== undefined) {
				try {
					this.set('value', spec.value, true);
				} catch (e) {
					this.value = spec.value;
				}
				if (this.data && this.data.model && typeof this.data.model.set === 'function') {
					this.data.model.set('value', spec.value, true);
				} else if (this.data && this.data.model) {
					this.data.model.value = spec.value;
				}
			}

		// Binding 'value' to the model data???


		const {context} = this;

		const data_model_change_handler = e => {
            console.log('Text_Field data_model_change_handler e', e);

			// Should change it in the view model....???

			const {name, old, value} = e;
			if (name === 'value') {

				this.view.data.model.value = value;
			}

        };

        this.data.model.on('change', data_model_change_handler);

        this.data.on('change', e => {
            const {name, value, old} = e;
			console.log('Text_Field data change e:', e);
            if (name === 'model') {
                if (old instanceof Data_Model) {
                    old.off('change', data_model_change_handler);
                }
                value.on('change', data_model_change_handler);
            }
        });



		const view_data_model_change_handler = e => {
            //console.log('Text_Field view_data_model_change_handler e', e);

			// Should change it in the view model....???

			const {name, old, value} = e;
			if (name === 'value') {
				this.data.model.value = value;

				// Needs to update the UI!!!!

				// The equivalent being the data model of the internal text_input

				//console.log('!!this.text_input', !!this.text_input);

				if (this.text_input) {
					this.text_input.data.model.value = value;
				}
			}

        };

        this.view.data.model.on('change', view_data_model_change_handler);

        this.view.data.on('change', e => {
            const {name, value, old} = e;
            if (name === 'model') {
                if (old instanceof Data_Model) {
                    old.off('change', view_data_model_change_handler);
                }
                value.on('change', view_data_model_change_handler);
            }
        });

		const old_setup_data_and_view = () => {

			this.data = new Control_Data({context});

			// even see about putting that data_model in the spec when reconstructing the controls?
			//   does seem like a better (but increasing complexity) answer for it on a lower level.

			// This could be within Data_Model_View_Model_Control.
			//   Probably should be.
			//     See about some lower level improvements to assigning / specifying fields.
			//       Will be using the field function that's new to lang-mini - though the function had been used in 
			//       obext for quite a while. The field function is proving useful and versitile, moreso for the moment
			//       than the slightly similar in purpose prop function also in obext.
			//     




			if (spec.data && spec.data.model) {
				this.data.model = spec.data.model;
			} else {
				// The Control_Data will have its own model object.

				this.data.model = new Data_Value({context});
				//field(this.data.model, 'value');
			}

			this.view = new Control_View({context})
			if (spec.view && spec.view.data.model) {
				// set the view model????
				this.view.data.model = spec.view.data.model;
			} else {


				this.view.data.model = new Data_Value({context});
				//field(this.view.data.model, 'value');
			}


			// Then on data value change - see about changing it in the data model....


			// Better to make a new setup_models_change_handlers ???
			//


			//this.setup_models_change_handlers();

			// Or this is fine in the constructor because it does not have to do with internal controls???
			//   Or at least does not need to listen to their DOM events???
			//     Will be worth trying patterns that get this to work easily, as well as provide a nice / simple API
			//       when used.

			// Does seem OK here....

			//this.assign_data_model_value_change_handler();

			

			

			// And the view model changing --- would be nice to know if the change has been initiated by the DOM???
			//   Or the comparison will prevent feedback, and be simpler??


			this.view.data.model.on('change', e => {
				const {name, value, old} = e;

				//console.log('text_field view model change', e);

				if (name === 'value') {

					// Maybe want a more versitile equals function. Or even relying on tostring coersion with ==?

					if (value !== old) {
						// change it in the view model...

						// Though check if the data model can change to that?
						//   can_change_data_model
						this.data.model.value = value;

						// Kind of activated???
						//   Does seem fine within the constructor though.
						//     May try this kind of code more.

						this.text_input.data.model.value = value;
						//if (this.dom.el) {
							//this.dom.el.value = value;
						//}

					}
				}

				// And possibly? update it in the DOM (.value property of the html element) here.



				//
			});

		}
		// old_setup_data_and_view();
		

		if (!spec.el) {
			this.compose_text_field();

			// Not so sure this should be needed....
			//this.setup_child_controls_listeners();
			// And better to call an 

		}

			// spec.value handled earlier for SSR composition.

		
	}

	setup_inner_control_events() {
		const {text_input} = this;


		//this.view.data.model = this.text_input.data.model;

		//this.text_input.data.model = this.view.data.model;

		// And validation states???

		this.view.data.model.on('change', e => {
			const {name, old, value} = e;
			if (name === 'value') {
				text_input.data.model.value = value;
			}
		})

		text_input.data.model.on('change', e => {
			const {name, old, value} = e;
			if (name === 'value') {
				this.view.data.model.value = value;
			}
		})

	}

	activate() {
        if (!this.__active) {
            super.activate();
            const {dom, text_input} = this;

			//this.setup_child_controls_listeners();
			this.setup_inner_control_events();





		}
	}



	compose_text_field() {
		
		// Could set the view.ui.compositional.model.
		//   Though may want 'name' values too, as strings???
		//    And it would set them all up as this._ctrl_fields too.
		//      Or only some of them???
		//      Seems worth setting all the named ones up as ctrl fields.

		const old_composition_code = () => {

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

				var text_input = new Text_Input(o_spec);
				var tiid = text_input._id();

				// da(ctrl, str attr name, attr value)
				// da([arr of ctrl dom attr changes])

				text_input.dom.attributes.id = tiid;
				text_input.dom.attributes.name = this.name;
				label.dom.attributes.for = tiid;

				// and the type... it could be a password.
				//  that's a DOM attribute.
				text_input.dom.attributes.type = this.type;
				right.add(text_input);

				_ctrl_fields.text_input = text_input;
				this.text_input = this.text_input = text_input;
			} else {
				// Text_Item.
				var text_item = new Text_Item({
					'context': this.context,
					'value': this.value
				});
				right.add(text_item);

				_ctrl_fields.text_item = text_item;
				this.text_item = text_item;
			}

		}

		// For now, have both the text label and the text input.

		const using_compositional_model = () => {

			//console.log('using_compositional_model');

			this.view.ui.compositional.model = [

				// (string, function || constructor) handling needed for the composition system.
				// (string, function || constructor, object)

				['left_part', Control, {class: 'left', comp: [['label', jsgui.label]]}],
				['right_part', Control, {class: 'right', comp: [['text_input', Text_Input, {'value': this.value}]]}]

			];

			// But then need to localise the inner named items too.

			// see about (auto) extracting names and references from the composition once it's been made according to that model.

			const label = this._ctrl_fields.left_part.content._arr[0];
			const text_input = this._ctrl_fields.right_part.content._arr[0];

			//text_input.data.model = this.view.data.model;

			//console.log('!!label', !!label);
			//console.log('!!text_input', !!text_input);

			//console.log('this.text', this.text);

			if (this.text) {
				//label.text = this.text;
				label.add(this.text);
			}

			this._ctrl_fields = this._ctrl_fields || {};
			this._ctrl_fields.label = label;
			this._ctrl_fields.text_input = text_input;

			this.label = label;
			this.text_input = text_input;
		}

		using_compositional_model();
		// text_input
	}

}
module.exports = Text_Field;
