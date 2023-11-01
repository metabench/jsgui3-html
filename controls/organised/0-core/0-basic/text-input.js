/*
 if (typeof define !== 'function') { var define = require('amdefine')(module) }

 define(["../../jsgui-html"],
 function(jsgui) {
 */

// Improved wysiwyg text editor? Such as with toolbar. Not so sure about contenteditable. These can take a while to make properly.
// display modes preview and code for example?
//  multiple display modes next to each other, side by side.
//   should be possible to orchestrate.
// Want the right abstractions so that specifying and using display modes is easy.
//  Don't want it too complex (on the surface)
// Writing controls so that they operate in different display mode settings
// Writing display mode specific code that gets controls to operate properly if there is more to do.

// Number only text input?
// Or validated to a specific format?


// jsgui3-html-core could be its own module even?
//   Would not have controls like these, would have bare minimum.
//     Or controls like these could be defined really concisely.

// control.active_view could make sense too.
//   Would need to be careful about changing it while in operation.

const jsgui = require('./../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const {Control, Control_Data, Control_View, Data_Object} = jsgui;

// The basic controls should not do too much on top of normal HTML, but make it easier to do a few things
//  there.

const {prop, field} = require('obext');

// See about making this extendable / use progressive enhancement.

// Should make this use the multi-model system.
//   Would help to set up how the value in the control is synced to other parts of the system.

// Want the more complex data.model and view.model and view.data.model to be behind the scenes where possible.

// ctrl.view.ui.data.model being another thing as well?
//   Does seem worth going into some very explicit and separate things at the low / mid level.
//     Quite high level in terms of jsgui3-html, but a lot else would use it with a really simple / automatic api.
//  May need a bit more though when writing controls.
//    Though some properties would have a good place in the abstraction ctrl.view.ui.data.model (eg .size???)
//      Then a grid size could be ctrl.view.data.model ???
//       It may depend.
//         The size and formatting on screen / in the UI would be different to things like the data model size.
//         Work in terms of interactions between those things.









// Maybe make linked (shared data model) Text_Inputs.

// The view.model could even be virtual...?
//  As in the getter always ? only gets it from the DOM?
//  And setter sets it in the DOM?






// text_input.data.model.value ???
//   Would make sense like that.

// Could see about more concise notations later on.
// text_input.view.model.on('change'...)


// Both the view model and the data model together would disambiguate.

// And maybe a view.ui.options.model even???

// Can use quite a lot of .model objects (5?). Could be used to track and syncronise a variety of different categories of data.


// .data.model - may be more important?
// .view.model - may be a useful in-between / disctinction on a lower level.
//   Would be an abstraction above the DOM itself, so could prove useful.


// May be worth doing more work on the example(s) concerning text-input and both the data model and view model.


// Would have Control_Data and Control_View.






// May build the view.model etc stuff into a lower level control before long.


class Text_Input extends Control {
    constructor(spec) {

        // May mean giving the data model in the spec.



        //this._super(spec, fields);
        spec.__type_name = spec.__type_name || 'text_input';
        spec.class = 'text-input';

        // fields were not working through this constructor system.
        //  maybe better as an array in the spec. Simpler API that way.
        super(spec);


        // So these 'Model' or 'model' objects need to raise change events on everything, or just the set fields.
        //   Need to set up the 'value' fields on these models.
        //     So that they raise change events when changed.



        const {context} = this;

        // Will (instead) be data.value - though that is short for data.model.value.
        //   Maybe a Data_Value would be best after all?
        //     Though .value.value does not look good.
        //      Maybe would mean much more widespread support for and checking of Data_Value instances.

        // Want to arrange it for good high level syntax - data_value has not offered that so far, data_object has extensively
        //   through subclasses.



        // The data model could / should (automatically) have a .value field.

        // Then the data model - would just have a single .value ????

        this.data = new Control_Data({context})
        if (spec.data && spec.data.model) {
            this.data.model = spec.data.model;
        } else {
            // The Control_Data will have its own model object.

            this.data.model = new Data_Object({context});
            field(this.data.model, 'value');
        }

        this.view = new Control_View({context})
        if (spec.view && spec.view.model) {
            // set the view model????
            this.view.model = spec.view.model;
        } else {
            this.view.model = new Data_Object({context});
            field(this.view.model, 'value');
        }


        // Then on data value change - see about changing it in the data model....

        this.data.model.on('change', e => {
            const {name, value, old} = e;
            if (name === 'value') {
                if (value !== old) {
                    // change it in the view model...

                    this.view.model.value = value;
                }
            }
        });

        // And the view model changing --- would be nice to know if the change has been initiated by the DOM???
        //   Or the comparison will prevent feedback, and be simpler??


        this.view.model.on('change', e => {
            const {name, value, old} = e;

            //console.log('view model change', e);

            if (name === 'value') {
                if (value !== old) {
                    // change it in the view model...

                    // Though check if the data model can change to that?
                    //   can_change_data_model
                    this.data.model.value = value;

                    // Kind of activated???
                    //   Does seem fine within the constructor though.
                    //     May try this kind of code more.
                    if (this.dom.el) {
                        this.dom.el.value = value;
                    }

                }
            }

            // And possibly? update it in the DOM (.value property of the html element) here.



            //
        });


        // And responding to the data model changes too.


        //this.data.model.on('change', e => {



            //console.log('data model change e:', e);
        //})



        // But then need to interact with the DOM element change.
        //   Definitely looks like it would be better to be more explicit with this here.
        // ctrl.dom.events???
        //   ctrl.dom.el is direct access to the el.
        // 


        // this.view.dom even???
        //   later on perhaps.
        //   don't do a large refactoring now.
        //    will be nice to keep the .dom api, expand it where useful.


        // DOM events would be better to separate.
        //   Though keeping the current flexible API would help, where it adds it as a DOM event handler if it matches the DOM
        //     event names.

        // For the moment, just do ctrl.on for this.
        //   Though may be nice to put / assign these DOM events in the constructor too...?
        //     Having functionality added automatically when it reconstructs the controls in the DOM will help.
        // Maybe could directly attach dom el events???


        // Maybe look a bit at making the lower level events for classes more split by dom and other.
        //   Try it here for the moment though....




        // this.dom.on





        // this.dom.on('change') ???





        // View data model does make a lot of sense - it's the data model that's being represented in the view.
        //   The changes would not always be persisted between the models....
        //     Such as the view model being in an invalid state, or not confirmed.






        // .view.data.model ???
        // View data model different to view model? The data that is being represented in the view (at that time)
        //   view.ui.model ???  - Seems clearer about things like fonts, size, user options for display

        // Changing that value should change the data model - then it should cause changes to happen to the view data model,
        //   Accessing .value should interact with the data.model.value
        //     And automatically interact with the other levels....

        // So programatically don't change what's being displayed directly, but tell the control that displays how it gets displayed,
        //   and have that control handle the change(s).





        //field(this, 'value', spec.value);



        if (spec.placeholder) this.placeholder = spec.placeholder;

        // listen for a change in the value of the text field, in the DOM.
        //  and when that changes, the value changes.
        //this.set('dom.tagName', 'input');



        if (!spec.el) {
            this.compose_text_input();
        }
        // This should render as an input field.
    }

    get value() {
        return this.data.model.value;
    }
    set value(v) {
        this.data.model.value = v;

    }

    compose_text_input() {
        this.dom.tagName = 'input';
        this.dom.attributes.type = 'input';
        this.dom.attributes.value = this.value;

        if (this.placeholder) this.dom.attributes.placeholder = this.placeholder;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const {dom} = this;

            // And of course need to respond to value change events....

            //  Silent updates?
            //    Avoid infinite loops?
            //    Or test the event source (better).



            /*
            this.add_dom_event_listener('change', e => {

                // Does seem like a more explicit way to only refer to DOM events will help.
                //  Maybe .add_dom_event_handler even ?


                // But this responds to the DOM events too...



                console.log('add_dom_event_listener change e', e);
                const {name, value} = e;

                //if (e.old !== undefined) {
                if (e.value !== e.old) {
                    if (name === 'value') {

                        this.view.model.value = value;



                        //dom.el.value = value;
                    }
                }
                //}

                
            });
            */

            



            // Will update the view model here.
            //   Then sometimes feed that to the data model.

            //   Probably want some kind of data model update success acknowledgement.
            //     When it's all going smoothly, the coder will not need to pay attention to that on high level code.

            // On keypress (or more explicitly set up the DOM event for it???)


            // .view.model ??
            // .data.model ??

            // Separate view and data would be sensible.

            // .model ???




            this.add_dom_event_listener('keypress', e_keypress => {
                //console.log('dom specific event e_keypress', e_keypress);

                this.view.model.value = dom.el.value;
                /*
                setTimeout(() => {
                    this.value = dom.el.value;
                    // Should raise a change event?
                }, 0);
                */
            });

            this.add_dom_event_listener('keyup', e_keyup => {
                //console.log('dom specific event e_keyup', e_keyup);

                this.view.model.value = dom.el.value;
                /*
                setTimeout(() => {
                    this.value = dom.el.value;
                    // Should raise a change event?
                }, 0);
                */
            });
        }
    }
}
module.exports = Text_Input;

//return Text_Input;
//});