/*
    Basically an 'select' element with options, rendering would be swappable though.

    Want to make the code here much more concise and idiomaic when possible - though first need to get a really clear API working.

    Select_Options could before long work as a basis for other more complex controls that have a .value (maybe a selected / current value)
    as well as a group of possible other values that can be selected.

    See about making the syntax to integrate this into apps most conveniently, with clear phrasing or very nice shorthand
    when not ambiguous.



*/

// A Select_Options control could help more first....
//   And could progressively enhance that too.
//   So falling back on the non-enhanced control by default will help, it brings the app further towards
//     not requiring client-side JS.






const jsgui = require('../../../../html-core/html-core');
//const each = jsgui.each;
//const tof = jsgui.tof;
const {Control, Control_Data, Control_View, Data_Object, is_array, is_arr_of_strs, each} = jsgui;
//const Tree_Node = require('./tree-node');

const {field} = require('obext');

// Would be nice to get this solved simply and extendibly and flexibly if possible.

// Perhaps having all the options in the standard data model would be the right way to do it to start with.
// but not data.model.value perhaps.

// data.model.options maybe

// Then could get looking into .state.data.model and .general.data.model perhaps????
//   Basically don't want to keep too much in the app state.


// Partial data model syncing?

// data.model.value syncing, but not data.model.options???
//   That does seem the way to do it.

// Often would want to sync the value to the app state data model, but not sync the options.

// maybe make app.state ????
//   Maybe be able to maintain multiple states, load, save, transmit them, but also have something like 
//   app.data which would encompass more data that the 'state' of the app.
//     Eg could include loads of cached pieces of data?



// ctrl.data.model.options does make a lot of sense.

// ctrl.view.data.model.options too.

// And they can be synced separately, or something like:
// sync(app.data.model.value, ctrl.data.model.value)

// Though maybe syncing .value would be the default.

// Let's make a simple enough implementation of the .data.model.value syncing, and look into the rest as well.

// Does seem worth using different and specific models, not shared models, where different things are being represented.

// The Select_Option control's data.model does seem like it's worth including the options.
// An app or app.state.data.model would not include all the options, but just treat that control as a control that specifies
//   a single value - though possibly those options could be in the app.state.data.model??? In order to validate a correct option has been set.






















// Then use a swap to change the controls when it's in place.

/*
    <select> <option value="American">American flamingo</option> <option value="Andean">Andean flamingo</option> <option value="Chilean">Chilean flamingo</option> <option value="Greater">Greater flamingo</option> <option value="James's">James's flamingo</option> <option value="Lesser">Lesser flamingo</option> </select>

    Read more: https://html.com/tags/select/#ixzz5NXFlnCLS
*/

// Different states - open, closed


// This will do more than just wrap the HTML control(s)
//  Maybe work on the combo-box control.

// Likely could be enhanced a lot, removed, or replaced.
//  Does minimal wrapping of html options list (it seems).
//  Could do with popup iplementation.


// Maybe could make good use of the mx_display_modes.


// Could render as a select / options box by default.
//   Though could use progressive enhancement to replace it.
//     Could even do some CSS hack(s) to make open/closed state not require client-side JS.

// Basically select option control.
//   Maybe retire this for the moment.
//     Or make it with a dropdown mixin and a list.


// Worth making the control that encapsulates the bare HTML input option select.
//   The 'select' and 'option' elements system.

// Just make jsgui.select perhaps????
//   Some enhancement around that?

// Select_Options ?????

// Select_Options_Dropdown_List perhaps???

// Then an Options_List could do more progressive enhancement.
//   See about making better idioms for 'progressively enhanced' versions.
//     So have the basic control there, have code for it, that code would support client-side things, but it gets swapped for
//       a more advanced control???

// Want to be able to easily express both the basic HTML, as well as the enchanced versions.


// Grid does seem like it needs more work when it comes to separating the data and the presentation.
//   Want it to be powerful and flexible in this regard.




// Having the different options as part of the data.model does make sense.
//   They could be changed dynamically or be data / a data model from a different part of the app.

// Which one is selected should be part of the view model.
//   Or the view data model???
//     Probably not. Don't have the 'selected' field updated in an external data model.
//       Interacting with some other data model (or likely view model?) would be done through the .data.model.value value.
//    


// High-level API - want select_options.value to be the (data.model) value of the selected item.
//   Main goal is to support a very convenient and easy high-level API.

//   May want to make data.model.value distinguished??? Or have it somehow always refer to .view.data.model.selected.data.model.value ????

// view.data.model mirroring (part of?) data.model.
// view.ui.data.model can hold its own data, such as which (one) on this control is selected.



// Though it's somewhat wordy, expressing it in something like 7 words will help the workings to be very clear and extensible.



// Want this to work very easily and effectively only using higher level APIs.
//   Easy way to specify the options, as well as shared models having options...?



// .options.data.model could make a lot of sense for this control specifically.
//   Let's do that for now.

// Maybe even get into ctrl.value.data.model???
// ctrl.value.view.model???

// .options.view.data.model too???
//   Like the size of the options....?


// This will need to become a somewhat complex control where there will be a different data model for the available options
//   to the data model that needs a value selected / represented.

// For the moment, being extra-explicit about the multiple data models.
//   In many cases, the control needs to be constructed in normal type ways - though being able to
//     define the data, define the options data, and then having the view and data model objects synced will be very powerful.

// Want to make a powerful general-purpose suite of controls.
//   They need to smoothly handle many of the complexities of web UIs.
//     Not making the wrong assumptions about data syncing and flows.
//     Will be able to integrate client and server side checking, validation, error correction, updates of UI to show these things.

// Let's see about making this as a simple control in a window, then making other mirrored versions.
//   and maybe mirrored so that the list of options and the selected value get mirrored to different places????

// This is where it can get a little complex, but do want it to be only a word or two (3 or 4) more at the higher level.
//   Then look more into higher level convenience features too.

// Will use Data_Model classes perhaps too...
//   Would basically (use a proxy to) generate change events on anything changing???
//   Or would always have the .value field.

// Easily being able to use different (sensible?) configurations of Data_Object / Model / Data_Model instances.
//   Focus on making it very explicit and convenient.

// Have the higher level syntax be a clear and concise expression of what the app does / is.
//   Would be worth doing a lot more through .data.model....

// Perhaps the shared data model could include the options or not.
//   And then perhaps it could specify that the options do not get included in it?
//     Or have it so that no new objects (like options) get put within that data.model.

// Maybe allow multiple idioms....

// .data.model.options as well as .options.data.model ????
//   and could work in different ways under the hood, but be different ways to do mostly the same thing.

// Or a control like this would have its own full internal data.model, but present a .value.data.model and .options.data.model ????

// options.data.model does seem sensible for the moment....
///  Though having all the data within a single data model also looks like it could be effective.

// This does seem like one of the places where it's most worth establishing patterns that are easy to use
//   and easy enough to implement.

// Combined data models - where data from multiple models is combined into one, and specific fields of that
//   combined model is then synced with a number of other models.

// const combined_data_model = combine(arr_data_models) perhaps.

// Want it to be easy and flexible to use both when all the options are part of the app data model,
//   and when they are not.

// Or, the app state data model being different from the app data model.
//   The .state.data.model would not have all the possible values, while the .full.data.model would do.

//  maybe allow divison into .state.data and .full.data

// the .options.data.model could be useful.
//  and view.options.data.model perhaps....

// having a separate data model for the options.
//   or perhaps it could refer to part of a larger separate data model, not the .data.model.value ???



// Need to have it compose / recompose / update_composition upon .data.model.options change.

// Or it could batch updates like that and do them together more efficiently....?


// if we have spec.options, use it to populate .data.model.options.
//   then copy that over to view.model.options.
//   then rearrange the composition depending on view.model.options.


// maybe see about handling .compose being called multiple times???

// could begin to treate .compose as .update_composition.
//   would compose it the first time round, or clear then compose again, or modify the composition (internal controls).

// could do .clear() then .compose() for the time being....























class Select_Options extends Control {
    constructor(spec) {

        spec.__type_name = spec.__type_name || 'select_options';

        spec.tag_name = 'select';
        super(spec);

        // Need to make this work when the shared data model is just holding the selected value.
        
        // May try this with 2 dropdowns
        //  eg 'Europe' | 'Africa'
        //    And then it changes the options in the 2nd dropdown to countries in the selected continent.

        // A Control_Data possibly???
        //  .options.view.data.model ????

        const {context} = this;

        // So just the .value in the data_models for the moment only.
        //   Will later incorporate .options as well.

        // Does seem worth making some kind of split sharing data model.
        // Or split syncronisation.
        
        // .value shared with the state data.model, or app.state.data.model
        //  while options would be shared with????
        // .app.full.data.model ???? less ambiguous.
        // .app.data.model ???

        // Or could see about some examples that share / sync the .data.model.options.

        // Options would be its own field.
        //   Possibly a collection of options would work better, as change events get raised on add.


        const construct_synchronised_data_and_view_models = () => {
            this.data = new Control_Data({context})
            if (spec.data && spec.data.model) {
                this.data.model = spec.data.model;
            } else {
                this.data.model = new Data_Object({context});
                field(this.data.model, 'value');
                field(this.data.model, 'options');
            }
            this.view = new Control_View({context})
            if (spec.view && spec.view.data.model) {
                this.view.data.model = spec.view.data.model;
            } else {
                this.view.data.model = new Data_Object({context});
                field(this.view.data.model, 'value');
                field(this.view.data.model, 'options');
            }

            // 

            this.data.model.on('change', e => {
                const {name, value, old} = e;
                if (name === 'value') {
                    if (value !== old) {
                        this.view.data.model.value = value;
                    }
                } else if (name === 'options') {
                    if (value !== old) {
                        this.view.data.model.options = value;
                    }
                }
            });

            this.view.data.model.on('change', e => {
                const {name, value, old} = e;
                if (name === 'value') {
                    if (value !== old) {
                        this.data.model.value = value;
                        if (this.dom.el) {

                            this.dom.el.value = value;


                        }
                    }
                } else if (name === 'options') {
                    if (value !== old) {

                        // and .options could get the data.model.options.
                        //   a convenient shorter property.
                        



                        this.data.model.options = value;

                        // This changes the internal composition, rather than a property of the dom el.

                        // Would need to recompose according to those options.

                        // .recompose(value) ???
                        /*
                        if (this.dom.el) {
                            this.dom.el.value = value;
                        }
                        */


                    }
                }
            });
        }
        construct_synchronised_data_and_view_models();


        // Then needs to assign the data.model.options if we have it in the spec.

        if (spec.options) {
            this.data.model.options = spec.options;
        }



        // Seems like the options need to be set in the .data.model.options at this stage.
        //   Then there will be code that controls the internal composition based on the options.
        //     Complete re-compose may be the easiest code to write here.
        //       Or it could modify existing options too.

        // re-compose internal options may be the best way to do this...?
        //   Or it could loop through the options already available, reassigning them, then deleting excess or adding more as needed.

        // Needs to be really clear, rather than having to be really efficient in terms of small code path.
        //   So for the moment, having data.model.options as well as view.data.model.options makes sense.










        // Having been given the spec.options ....
        //   Need to incorporate them into the .data.model.





        /*

        field(this, 'options', {
            data: {
                model: new Data_Object({context})
            }
        });

        // options.data.model

        if (this.options?.data?.model) {
            field(this.options.data.model, 'value');

            console.log('Select_Options constructor: have set up the Select_Options .options.data.model.value field');
        }

        */

        // For the moment, will stick with .data.model and .view.data.model.
        //   Could be very precise with this control, while making some overall syncing system that syncs the right data (fields).




        
        //  Just a single value for the moment, though it will be an array.
        //    Worth moving more into the Data_Value class, improving that....



        
        // options.data.model
        // options.data.model.value ???
        // options.data.model.list ????



        // Specifying options in the spec could be easy enough....
        //   Would set the options on the .data.model

        // ctrl.shared.data.model = ...
        //   and then there could be access to a data model for the app.
        //     Though that data model wouldn't need to know what all the options are, but would need to know what option is selected.

        // ctrl.specific.data.model = ...

        // Going into shared and specific data models would / could help a lot.

        // ctrl.value.data.model = ....
        // ctrl.ui.data.model = ....


        // ctrl.data.models = [app_data_model, data_model_with_specific_options]

        // Maybe the ui.data.model, not the view.ui.data.model, could help here???
        //   The view ui being about how it's being viewed...?

        // Let's make it most flexible - be able to get all the options from the ctrl.data.model, but have another way of doing it too.

        // Setting things into the view.model but not the view.data.model.

        // Yes, view.model does seem very appropriate for defining the available options.
        //   Do want to make the specs refer to view: {model: view_model} for the moment.


        // .data.set ????
        // data.set.model ???

        // .dataset ????

        // .data and .dataset or data.set could be useful.

        // So the list of options would be the data.set???
        //   Or maybe a Control_Dataset control perhaps?

        // ctrl.data.all???
        // ctrl.data.options???

        // .options could also be used elsewhere in jsgui....?

        // ctrl.data.model.options maybe is best here....
        //   And have it so that an external data model does not get updated with the options, just the value?

        // ctrl.view.data.model.options too perhaps???
        //   Where if they are not to be included with the shared data model, they get provided in the view.

        // And also setting which data.model properties get synced....?
        //   Though no - shared data model is the same object.

        // This could have a control specific extended / full data model.
        
        // Extended data models could be useful here...?

        // data.view.model????
        // extended.data.model????

        // An extended data model probably does seem the best way to do it. ???
        // data.model.extensions()????

        // .full.data.model????

        // .specific.data.model ???
        // ctrl.specific.data.model could make sense here.

        // ctrl.specific.data.model.options ????
        //   Definitely would make sense.

        // Control_Specific_Data class perhaps?
        
        
        //   And can use this for ctrl.specific.data.model.options.


        // Control_Options_Data class even???
        //   Not right now, too ambiguous







        // .options.data.model does seem most sensible???


        // .contents????




















        // The view.model makes a lot of sense possibly???
        // view.model.options????
        // view.options.data.model ????

        // Does seem worth very clearly defining how this data_model is or can be different.
        //   It's specific to defining the options.
        //     Likely not to be changed much during normal app use - but should support it.
        //   The list of values.
        //     Just an options.model???






        // view.all_data.model????



        //   ctrl.view.model.options???







        // .data.model would need an 'options' field.
        //   Want this to work conveniently without various data models being explicitly specified.
        // Maybe later do some ctrl.bind or maybe ctrl.data.bind(ctrl.data || ctrl)

        //   Want it to be very simple / easy to set up the controls so they work well together.

        // Maybe specify that controls access a part of a shared model, but also introduce models specific to that control as well.
        //   But the ctrl.ui.data.model could possibly express all the options if they are not there in the normal (app) data model.

        // Supplementary data models? Control specific data models?
        //   Integrating the data models of Select_Options could help multilingual systems work better.











        // and the options...
        //  an array of options.


        // data.model.options
        // view.data.model.options
        // view.ui.data.model.selected ....?



        // Nope - will have .data.model.options as well as .view.data.model.options

        // Also want there to be the .data.model.value to be the selected option.
        //   Provide a simple standard interface where possible.
        //   Have the more complex mid-level code handle complexities to do with keeping data in sync, such as
        //     having this Select_Options control represent (and allow modifying) a value that's defined and used
        //     elsewhere in the program.


        //this.dom.


        //this.options = spec.options;


        // Compose functions look like they would be helpful again.

        // if it was called through activation?

        if (!spec.el) {

            // But this will compose it from the .data.model.options (mainly).


            this.compose();


        }

    }

    activate() {
        if (!this.__active) {
            super.activate();
            const {dom} = this;

			//this.setup_child_controls_listeners();

            // activate dom el to view model sync.

            // .dom.events.add(...)
            // .dom.events.change.listen(...)



            const activate_view_model_to_dom_model_sync = () => {
                this.add_dom_event_listener('change', e => {

                    console.log('dom.el.value', dom.el.value);

                    this.view.data.model.value = dom.el.value;
                });

                /*
                this.add_dom_event_listener('keypress', e_keypress => {
                    this.view.data.model.value = dom.el.value;
                });
                this.add_dom_event_listener('keyup', e_keyup => {
                    this.view.data.model.value = dom.el.value;
                });
                this.add_dom_event_listener('keydown', e_keydown => {
                    this.view.data.model.value = dom.el.value;
                });
                */
            }
            activate_view_model_to_dom_model_sync();

		}
	}

    compose() {


        const {context} = this;

        const dm_options = this.data.model.options;

        console.log('Select_Options compose dm_options:', dm_options);

        // An array? Collection?

        // array for the moment.
        //  and is it an array of strings????

        if (is_array(dm_options)) {
            // Can proceed....?


            if (is_arr_of_strs(dm_options)) {
                console.log('dm_options is an array of strings');

                // Then add jsgui.option controls for each of them....

                each(dm_options, str_option => {
                    const ctrl_option = new jsgui.option({
                        context
                    });
                    //  But set it's value dom attribute?
                    //    has 'value' dom attribute as well as (only text node inside???)

                    ctrl_option.dom.attributes.value = str_option;
                    ctrl_option.add(str_option);


                    this.add(ctrl_option);

                })


            }

        }





        // Make this more versitile, while also supporting a very intuitive high-level API.
        //   Such as being able to provide it options from a model or part of one to select from.


        // Maybe spec.options is the best way to express it???
        //   But it should load the relevant data model from the spec to start with.


        // Need to compose the options.
        //   Though spec should be parsed in the constructor.
        //     Maybe best not to keep the spec.



        //   In the constructor, use spec.options (array?) to populate the list of options.
        //     Maybe all only strings here for now.

        // In this part, it should be more about doing a 1st time composition of the child controls that represent each of the options.

        // Does seem like it will be a bit complex to come up with the right patterns to use as well as lower level functionality that supports it.
        //   Data binding and sync is one of the more difficult features to get right.

        // Being really explicit about all of it, while having sensible defaults would work well.
        // Making it easy to set up a few convenient ways of doing things with little code.
        //   Maybe some short named helper functions to keep code denser too?
        //     Or with long explicit names that will compress a lot.











        

        


        /*

        each(this.spec.options, option => {
            // Option could just be a string, a number or [number, string]

            let t = tof(option);
            let ctrl_option = new jsgui.option({
                context: context
            });
            if (t === 'string') {
                ctrl_option.dom.attributes.value = option;
                ctrl_option.add(new jsgui.textNode('option'));
            }

        });

        */
    }
}

module.exports = Select_Options;