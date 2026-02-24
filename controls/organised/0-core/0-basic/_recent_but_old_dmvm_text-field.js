// Maybe just change to Field control
// Then Field_Group control would avoid confusion with an HTML form.

// This will be more about text or string editor in the future.

const jsgui = require('../../../../html-core/html-core');
const Text_Input = require('./__Recent_But_Old_Text_Input');
const Text_Item = require('./Text_Item');
/*
var stringify = jsgui.stringify,
	each = jsgui.each,
	tof = jsgui.tof;
	*/
const {Control, Control_Data, Control_View, Data_Object, Data_Value} = jsgui;

const {field} = require('lang-tools');

const Data_Model_View_Model_Control = require('../../../../html-core/Data_Model_View_Model_Control');


const Validation_Status_Indicator = require('./Validation_Status_Indicator');
const { model_data_view_compositional_representation } = require('../../../../control_mixins/mx');


// fields could have default values too.

// May well be worth improving and extending this.
//   Put code to set up specific features in their own functions.
//     May later want to optimise (make more concise) the code here using more patterns.


// Late 2023 - Currently works, but could do with extra options, finesse, and making the code more compact and idiomatic,
//   making use of (new) lower level features to support it.



// 

// Will set the fields up (slightly?) differently in the future?
//   Or passing it along as 2nd param could be OK???



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









class Text_Field extends Data_Model_View_Model_Control {
	// fields... text, value, type?
	//  type could specify some kind of validation, or also 'password'.

	//  and can have other fields possibly.
	constructor(spec) {

		// Putting the fields in the constructor of Control....
		//   Could be effective.
		//   Or could put it into the spec instead.
		//     Could have Data_Object handle fields, and have extensions where needed in Control.



		// The ctrl spec fields - does it use oext???

		// Probably move away from setting up fields like that.
		//   Or use the newer field() function to set them up.

		super(spec, fields);
		//super(spec);

		this.__type_name = 'text_field';
		this.add_class('text-field');

		if (spec.type) this.type = spec.type;
		// could be 'password' for example...???


		if (spec.placeholder) this.placeholder = spec.placeholder;

		// Binding 'value' to the model data???


		const {context} = this;

        // Will (instead) be data.value - though that is short for data.model.value.
        //   Maybe a Data_Value would be best after all?
        //     Though .value.value does not look good.
        //      Maybe would mean much more widespread support for and checking of Data_Value instances.

        // Want to arrange it for good high level syntax - data_value has not offered that so far, data_object has extensively
        //   through subclasses.



        // The data model could / should (automatically) have a .value field.

        // Then the data model - would just have a single .value ????

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

		this.assign_data_model_value_change_handler();

		

        

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

		// So do the updates (correctly?) both ways.
		//   Don't have this re-update with the same value (of course).
		//     That should help in some cases.
		//     Though in more complex cases, may be best to serialise each and hash / get a hash of each value
		//       and compare hashes to check it's not about to repeat the same update.
		//   Could be quite a simple and clever system to prevent infinite / inefficient update feedback loops.


		// Could see about making the Data_Model_View_Model_Control deal with the model.value by default.





		// This 'value' field has become a bit more complex....
		//   May need to stop using obext field, and make it more specific for the moment.
		//    Or use the onchange etc?

		// .value would refer to the .data.model.value.
		//   may be best having it (always) reflect that.

		// The data model value is the value represented to the system outside of this control.
		//   The view.model.value would represent the value while it's in the process of being edited - and a better UI
		//     means not updating some other things whenever that value being edited / selected changes.
		//       Though may want it to update automatically in many situations, such as moving the mouse away, touching elsewhere???







		//field(this, 'value', spec.value);

		// Maybe build the data.model.value and view.model.value around this.

		// The value field would just be the data model value???

		// But need to keep compatibility for when there is no such view.model and data.model.

		//  So could set the 'value' field when the view.model changes.
		//    And when the 'value' field is changed, it will change the data.model???
		//      Or just don't want that 'value' field programatically settable like that? Or it's an OK way to set it in the data.model???
		//        Yes, want to allow the programmer to use the data.model and view.model without needing to specify it if it would make
		//        for a simpler and still unambiguous API.

		// Could presume that the .value field gets updated when the .data.model.value gets updated, and it would also
		//   update the data.model.value when the .value field gets updated.

		// .value field seems like a still useful higher-level API.











		if (!spec.el) {
			this.compose_text_field();
			this.setup_child_controls_listeners();
			// And better to call an 

		}




		// Probably want .data.model here...?
		//   Want it to respond to changes in that .data.model immediately by updating the .view.model.
		//   Then the .view.model changes result in immediate update to the HTML DOM value.
		//   

		// Need model and model value(s) binding and syncing.

		// Make it really easy to use in the top level API.
		//   Maybe a bunch of simple ways to specify relationships between ctrl.view.model, ctrl.data.model, context.data.model, context.view.model
		//     See how much can be done automatically. Automatic things will work where there are no more params / options
		//     that need to be specified.

		// Possibly / likely need to send more data to the client.
		//   Possible data-jsgui-declare-model="json...."
		//     data-jsgui-data-model="json?...."
		//     data-jsgui-view-model="json?...."

		// Then reference back to those data and view models.
		//   The HTML document itself may have those data attributes.
		//     Maybe would be easiest only that way?
		//     But then could have matching data-jsgui-data-model declarations.
		//       And the view-model could be automatic, maybe the app's view model could contain everything relating to views
		//       of all controls.


		// Easy model syncing will help with a variety of controls, such as 'adjuster' controls such as +1, -1 to adjust numbers.


		// Does seem as though model references (and maybe model data???) would need to be sent to the client.
		//   Could see about a more formalised procedure to read the model data from the HTML / DOM.
		//     load_model_from_dom perhaps....
		//     load_view_model_from_dom
		//     sync_dom_to_view_model ???
		//     sync_view_model_to_dom




		//       still go with longer and more explicit function names.
		//       Then work on shorthands / syntax sugar.

















		// 


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

	// Maybe / definitely move this lower level once it's working and needed within more controls.
	//   Or have the problems that require it to be used solved so that it's not needed.
	//    Or put it into a mixin.

	// Really to do with syncing the view model from (changes to) the data model.

	// A mixin to handle model synchronisation could help.
	//   Get the patterns right, move them to mixin(s) where appropriate.

	// Maybe just make 'helper' functions?
	//   Maybe more concise / idiomatic mixin definitions, with lower level supporting code for that.

	
	assign_data_model_value_change_handler() {
		this.data.model.on('change', e => {
			const {name, value, old} = e;
			//console.log('text_field data model change', e);
			if (name === 'value') {
				if (value !== old) {
					// change it in the view model...
					this.view.data.model.value = value;

				}
			}
		});
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
		const {text_input} = this;

		return {
			get model() {
				return {

					get on() {
						return (name, handler) => {

							//console.log('name', name);

							if (name === 'change') {
								// listen for the text_input change of value.

								text_input.on('change', e => {
									// Maybe need the text_input view model????

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

	// will be data.model and view.model

	// May see about putting this tech in a mixin.

	// model set value too???
	//  no, as it's now a model object.




	// Maybe don't use this for the moment?

	//   May always be best, or at least for now, be explicit about a different data model and view model.
	//     The data model may change less frequently, such as being the selected item(s) in a list, while the view model
	//      would be the position in the list being displayed, the range of list items displayed, the size of these list items.


	// Possibly making a clearer split between data and view models at the core of interactive controls that could or can
	//   hold data.
	// They could essentially hold a copy of the data, and only update the data in the main part of the app at certain times.
	//   Maybe a debounce between view model changes and data model changes?
	//   Or even an 'immediate' or 'current' view model.


	// Maybe integrate .data and .data.model soon, while keeping this 'get model()'.
	//   Want to find a good default way to keep the data flow tidy.




	// No, think we need to change the .model property....
	//  Though will have .data.model and .view.model for the moment.


	// This may make it too complex, keeping this.
	//   Probably best to get .data.model and .view.model working properly, then work on a .model, or remove it.

	// It may help to always to be clear on data models and view models, and the differences / buffering between them.
	//   Eg chaning the view model for a lat long bounding box does not change how the rest of the app treats the bounding box
	//    without clicking 'OK' or 'Update' or 'Confirm', with 'Cancel' undoing that change to the View Model.

	// Seems like it would be a reasonably large amount of underlying code.

	// Maybe best to implement it in a few (2?) controls, and put it into a mixin.
	//   Eg the 'view model' would contain the text for the label (as well?), maybe that would not be needed in or synced with the
	//   data model.


	// Separate view and data models seems like a good feature.

	// Control_View class perhaps???
	//   With the 'model' property only for the moment?

	// Control_Data class too perhaps???
	//   Would extend Data_Object.

	// ctrl.data.model.on('change', e => {})

	// ctrl.dmoc(e => {});

	// Not every control would need this I expect.
	//   






	setup_child_controls_listeners() {
		const {text_input} = this;

		text_input.data.model.on('change', e=> {
			//console.log('text_input.data.model change e', e);

			const {name, value, old} = e;

			// The data model of the subcontrol is the view model of this.

			if (name === 'value') {
				if (value !== old) {
					this.view.data.model.value = value;
				}

			}

		})
	}

	activate() {
        if (!this.__active) {
            super.activate();
            const {dom, text_input} = this;

			this.setup_child_controls_listeners();



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
		// text_input
	}

	/*
	get value() {
		return this.text_input.value;
		//const text_input = this.text_input;

	}
	*/
}
module.exports = Text_Field;