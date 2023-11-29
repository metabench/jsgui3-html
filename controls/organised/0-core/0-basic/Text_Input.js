const jsgui = require('../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const {Control, Control_Data, Control_View, Data_Object, Data_Model, Data_Value} = jsgui;
const {prop, field} = require('obext');

// Late 2023 - not so much code.
//   Do want to make use of view.data.model syntax.
//     Separate to for example view.data.ui.options.model
//   Be really explicit with what it's about, but allow for shortened syntax when it's clear(er) what it's doing.

// May see about making this a Data_Model_View_Model_Control (later), but this is quite concise right now without the comments and
//   empty lines.

// Will also make a new version of Text_Input.
//   Want some kind of specification of what data it models / represents.
//   Maybe just say String somewhere.
// ctrl.data.type = String perhaps.
//  data_type: String possibly.


// Then some means to sync this data with the value in the DOM.

// view.ll.model???


//   Maybe just make it the view model for the moment???
//   Does seem worth being able to have (at least) 2 levels of view.data.model




// And Text_Item too...
//   Seems a bit like Text_Input but possibly more flexible.




// Need to do more basic work on Data_Value of data_type String
//   and then could make some easy system / API for specifying maxLength. It could be implemented using a more complex
//   constraint though.


// data_value.constraint(s)

// data_value.constraints.add(new Constraint())
// data_value constraints being separate to the data type.


// Definitely has a View_Model.
// Possibly has a separate Data_Model.

// The syncing code is not actually all that complex on this level.
//   May make some functions to get it working with much less code, but later on once patterns are clear.


class Text_Input extends Control {
    constructor(spec) {


        spec.__type_name = spec.__type_name || 'text_input';
        spec.class = 'text-input';


        super(spec);
        const {context} = this;

        if (spec.placeholder) this.placeholder = spec.placeholder;
        if (!spec.el) {
            //this.compose_text_input();
        }

        // But actually want to set up syncing between the view model and the dom element value.

        console.log('this.view.data', this.view.data);


        console.log('this.view.data.model', this.view.data.model);


        // not so sure about .ui.ll.data.model.

        // a ui ll dm could make sense.
        //console.log('this.view.ll.data.model', this.view.ll.data.model);

        //console.log('this.view.ll.data.model', this.view.ll.data.model);

        // 3 models, multi-sync.... - Maybe that could be added in somehow.
        //   Maybe need 3 models only in some cases.
        //   Maybe need 0 in some cases?
        //   For the moment, see what can be done with the 2 models system, making it standard in some ways, better supported.

        // Maybe the view model of the parent control gets synced with the data model of the subcontrol.
        //   








        const view_data_model_change_handler = e => {
            const {name, value, old} = e;

            console.log('Text_Input view data model change e:', e);

            //console.log('Text_Input view_data_model_change_handler [old, value]', [old, value]);

            if (name === 'value') {
                this.dom.attributes.value = value;
                //this.view.ll.data.model.value = value;

                this.data.model.value = value;

                // and update the view.ui.ll.data.model....

            }

        };

        console.log('this.view.data', this.view.data);
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



        /*

        const view_ui_ll_data_model_change_handler = e => {
            const {name, value, old} = e;

            //console.log('Text_Input view data model change e:', e);

            //console.log('Text_Input view_data_model_change_handler [old, value]', [old, value]);

            if (name === 'value') {
                //this.dom.attributes.value = value;
                this.dom.attributes.value = value;
                this.view.data.model.value = value;
                

                // and update the view.ui.ll.data.model....



            }
        }

        this.view.ui.ll.data.model.on('change', view_ui_ll_data_model_change_handler);
        this.view.ui.ll.data.on('change', e => {
            const {name, value, old} = e;
            if (name === 'model') {
                if (old instanceof Data_Model) {
                    old.off('change', view_ui_ll_data_model_change_handler);
                }
                value.on('change', view_ui_ll_data_model_change_handler);
            }
        });
        */

        /*
        const view_ll_data_model_change_handler = e => {
            const {name, value, old} = e;

            //console.log('Text_Input view data model change e:', e);

            //console.log('Text_Input view_data_model_change_handler [old, value]', [old, value]);

            if (name === 'value') {
                //this.dom.attributes.value = value;

                // can it accept that new value???

                //console.log('view_ll_data_model_change_handler [old, value]', [old, value]);

                const change_attempt = this.view.data.model.attempt_set_value(value);
                

                console.log('change_attempt', change_attempt);

                if (change_attempt.success === true) {
                    //this.view.data.model.value = value;
                    this.dom.attributes.value = value;



                } else {


                    //this.view.ll.data.model.value = old;
                    //  not sure this has been set to a value of the right type (str or int).

                    //this.dom.attributes.value = old;

                    // or directly set the dom el???
                    //this.dom.el.value = old;





                    // Set it back to the old value....



                    // undo it....

                    //console.trace();
                    console.log('need to change back to the old value');
                    console.log('[name, value, old]', [name, value, old]);
                    throw 'NYI';
                }


                

                
                

                // and update the view.ui.ll.data.model....



            }
        }

        this.view.ll.data.model.on('change', view_ll_data_model_change_handler);
        this.view.ll.data.on('change', e => {
            const {name, value, old} = e;
            console.log('this.view.ll.data change e:', e);
            if (name === 'model') {
                if (old instanceof Data_Model) {
                    old.off('change', view_ll_data_model_change_handler);
                }
                value.on('change', view_ll_data_model_change_handler);
            }
        });
        */



        const data_model_change_handler = e => {
            const {name, value, old} = e;
            console.log('Text_Input data_model_change_handler e:', e);
            if (name === 'value') {
                //this.dom.attributes.value = value;
                this.view.data.model.value = value;
            }

        };

        this.data.model.on('change', data_model_change_handler);

        // Maybe have this already automatically from the mixin.

        const setup_handle_data_model_itself_changing = () => {
            this.data.on('change', e => {
                const {name, value, old} = e;
                console.log('Text_Input .data change e:', e);
                if (name === 'model') {
                    if (old instanceof Data_Model) {
                        old.off('change', data_model_change_handler);
                    }
                    value.on('change', data_model_change_handler);
                }
            })
        }
        setup_handle_data_model_itself_changing();
        

        if (spec.value) {
            // Sets the .data.model.value, which in turn sets the .view.data.model.value, which in turn sets the dom.attributes,
            //   which then sets it in the live element if active on the client, or in the rendering.

            // .value will be a shortcut.



            //this.value = spec.value;

            this.data.model.value = spec.value; // more explicit here.



            // Will need to also work with the view ui ll data model.
            //   Maybe only have an optional view data model or stack of them.


        }

        this.dom.tagName = 'input';
        this.dom.attributes.type = 'input';
        //this.dom.attributes.value = this.value;

        //console.log('Text_Input end of constructor this.view.ui.ll.data.model:', this.view.ui.ll.data.model);
        console.log('Text_Input end of constructor this.view.data.model:', this.view.data.model);
        //console.log('this.view.ll.data.model.value', this.view.ll.data.model.value);

    }



    // With a single .value field in the data model.
    //   However, probably want a view.data.model by default.
    //   maybe view.ll.data.model even.

    // view.ll.data.model.value

    // Can be longwinded and explicit here.
    
    // A Text_Field could connect with the low level data model of the Text_Input.
    //   It would not need a low level view data model of its own.










    get value() {

        return this.data.model.value;
    }
    set value(v) {


        this.data.model.value = v;
    }

    /*
    compose_text_input() {

        // More like the DOM settings rather than composition.

        

        // And it's placeholder text
        //   That's not part of the data model.
        //   Maybe it's the presentation data model? Presentation model?



        // ui.data.model perhaps....
        // ui.model perhaps???
        //   want some kind of consistency to calling things data models.


        //   And would define types there.
        


        // ui is the presentation basically.





        if (this.placeholder) this.dom.attributes.placeholder = this.placeholder;


    }
    */

    // A ll getter for the string value???

    // ll_value???
    // ll_value_type???


    activate() {
        if (!this.__active) {
            super.activate();
            const {dom} = this;




            // Maybe set the view.ui.ll.data.model.value instead....



            // sync_dom_changes_to_view_data_model....???

            // Later will have some lower level code to set these things up better.

            console.log('dom.el.value', dom.el.value);

            console.log('this.view.data.model', this.view.data.model);
            console.log('this.view.data.model.value', this.view.data.model.value);

            this.view.data.model.value = dom.el.value;

            console.log('this.view.data.model.value', this.view.data.model.value);


            const activate_sync_dom_to_view_ui_ll_data_model = () => {
                const dm = this.view.ui.ll.data.model;

                this.add_dom_event_listener('change', e => {
                    dm.value = dom.el.value;
                });
                this.add_dom_event_listener('keypress', e_keypress => {
                    dm.value = dom.el.value;
                });
                this.add_dom_event_listener('keyup', e_keyup => {
                    dm.value = dom.el.value;
                });
                this.add_dom_event_listener('keydown', e_keydown => {
                    dm.value = dom.el.value;
                });
            }
            //activate_sync_dom_to_view_ui_ll_data_model();

            const handle_change_event = e => {

                console.log('Text_Input DOM handle_change_event');

                console.log('dom.el.value', dom.el.value);
                this.view.data.model.value = dom.el.value;
            }

            const activate_sync_dom_to_view_ll_data_model = () => {
                //console.log('activate_sync_dom_to_view_ll_data_model');
                //const dm = this.view.ll.data.model;

                this.add_dom_event_listener('change', e => {
                    handle_change_event(e);
                });
                this.add_dom_event_listener('keypress', e => {
                    handle_change_event(e);
                });
                this.add_dom_event_listener('keyup', e => {
                    handle_change_event(e);
                });
                this.add_dom_event_listener('keydown', e => {
                    handle_change_event(e);
                });
            }
            activate_sync_dom_to_view_ll_data_model();
        }
    }
}
module.exports = Text_Input;
