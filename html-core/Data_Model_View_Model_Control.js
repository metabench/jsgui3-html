
const Ctrl_Enh = require('./control-enh');

const {Data_Object} = require('lang-tools');

// Quite a lot of the standard controls should become this.
//   It should provide mechanisms for the app to efficiently process and pass on updates at the various different stages.
//   Want to work both with well defined app data models, as well has having them created simply / automatically to 
//     facilitate easy (to code) sharing of data between different parts of the app, and easy to code data persistance and update
//     operations.

// A server side data model could replay changes and then update the DB as necessary.
//   Could undo changes too (if history is stored).

// These two models would help a lot when it comes to the app state history.
//   eg don't undo maximising and minimising windows within the app, but also have a good way to save the state (automatically essentially).


// Can have fairly complex code on lower and especially mid levels, but the high level code should be simple and cleary express what's being done
//   though also allowing for shorthands that would not be as readable but would be more compact.
// Could maybe search and replace on building to use the shorthand forms instead, maybe even replace the functions with the
//   long form names (though that would likely be a day or two's work at least)

const Control_Data = require('./Control_Data');
const Control_View = require('./Control_View');

// Possibly not so much to do here right now???

// Maybe will use this to make some other controls more concise.

// Maybe make both Data_Model_View_Model_Control_Single_Value
//   and Data_Model_View_Model_Control_Multi_Value_Data_Object
//         so it would have properties available with string keys.
//   maybe also make some kind(s) of Collection or Array holding data models.






class Data_Model_View_Model_Control extends Ctrl_Enh {
    constructor(...a) {
        super(...a);

        const spec = a[0] || {};
        // Possibly set up both models here, but should look out for data and view models in the spec.

        // Also, look out for it in pre_activate I think. Would be good to reconnect those models here.

        // Would also need to add the appropriate .dom.attributes['data-jsgui-view-model']
        //                                        .dom.attributes['data-jsgui-data-model']

        // 
        console.log('');
        console.log('construct Data_Model_View_Model_Control');


        const {context} = this;

        // spec.view
        // spec.data

        // and would both need 'model' properties???
        //   does seem best for the moment to make it really explicit.

        // But then recognising and passing on changes...?
        //   Should work when not activated if possible.

        // Though seems like it would need a bit more code in the higher level classes.
        // Possibly more in intialisation, telling it what property names to use.
        //   Though could default to 'value' to allow easy sharing between 2 or more objects where it's just one
        //     value that gets shared.


        // Probably need to set up fields / change events on the model objects.

        // Could try it with 'value' hardcoded here???

        //  Or take the 'fields' in the spec???

        // With the Text_Field (and Text_Input) will need to have it change the Data Model appropriately.
        //   Maybe could have a decent default for it, but explicitly set it as well with a short string eg 'onexit' or 'exit' or 'leave'
        // But would more likely want an 'cancel | confirm' non-modal popup, and control the positioning of that popup.
        //   Likely to want it just below in this example.

        // This can likely be very effective....

        





        if (spec.data) {
            this.data = new Control_Data();
            if (spec.data.model) {
                this.data.model = spec.data.model;

                this.data.model.on('change', e => {
                    console.log('this.data.model change e:', e);
                })

                this.dom.attributes['data-jsgui-data-model'] = this.data.model._id();
            }
        }
        if (spec.view) {
            this.view = new Control_View();

            // 

            // data-jsgui-view-data-model
            //   does seem like it would be worth being able to get that....
            //     (even back from the context)
            //   but maybe the view data model should (only) be internal to this (for the moment?)

            // Maybe do need to / best to register these controls in the context.
            //  


            if (!spec.view.data) {
                // create new view data model.

                const view_data_model = new Data_Object({context});
                this.view.data = {
                    model: view_data_model
                }
            } else {
                this.view.data = spec.view.data;

                if (!this.view.data.model) {
                    this.view.data.model = new Data_Object({context});
                }

            }



            if (this.view.data.model) {

                this.view.data.model.on('change', e => {
                    console.log('this.view.data.model change e:', e);
                })

                this.dom.attributes['data-jsgui-view-data-model'] = this.view.data.model._id();
            }
            // Could create other internal view.data???





            // view.data.model????
            if (spec.view.model) {


                this.view.model = spec.view.model;

                this.view.model.on('change', e => {
                    console.log('this.view.model change e:', e);
                })

                this.dom.attributes['data-jsgui-view-model'] = this.view.model._id();
            }

            // Otherwise create new internal view model?

            

        }
        // otherwise constuct view by default?
        //   not now, want this to work first with the patterns being used / tried currently.

        


        //console.log('!!spec.el', !!spec.el);
        console.log('!!this.dom.el', !!this.dom.el);

        if (this.dom.el) {

            const context_keys = Array.from(Object.keys(this.context));
            console.log('context_keys', context_keys);

            const context_map_controls_keys = Array.from(Object.keys(this.context.map_controls));
            console.log('context_map_controls_keys', context_map_controls_keys);

            if (this.dom.el.hasAttribute('data-jsgui-data-model')) {
                const data_model_jsgui_id = this.dom.el.getAttribute('data-jsgui-data-model');

                console.log('Data_Model_View_Model_Control data_model_jsgui_id:', data_model_jsgui_id);

                const data_model = this.context.map_controls[data_model_jsgui_id];

                this.data = this.data || {};
                this.data.model = data_model;


                // Then set up the syncing here????

                //   If the data model changes, set the .value field....?


                data_model.on('change', e => {
                    console.log('data_model change', e);
                })
            }


            // And if it does not have that attribute, create its own internal view model.




            if (this.dom.el.hasAttribute('data-jsgui-view-model')) {
                this.view = this.view || {};
                const view_model_jsgui_id = this.dom.el.getAttribute('data-jsgui-view-model');

                console.log('Data_Model_View_Model_Control view_model_jsgui_id:', view_model_jsgui_id);

                // then get it from the context.

                const view_model = this.context.map_controls[view_model_jsgui_id];

                
                this.view.model = view_model;

                view_model.on('change', e => {
                    console.log('view_model change', e);
                });

                // Load the view model at the very beginning???


                // But in the activated part it would need to change the model???
                //   Not necessarily.
                //   It could change that in respond to the field changing.
                //     Then would change the view model in response to the that data model change.
                //     Then would update the DOM in response to the view model change (would have to be the responsibility of the
                //       specific control I think???)

                


            } else {
                console.log('Data_Model_View_Model_Control with el lacks view model, need to make one');
                this.view = this.view || {};
                this.view.model = new Data_Object({
                    context
                });

                // and register it in the context as a control???
                //   best not to in this case when it's only currently supposed to be internal to that control.

                // See about making the Text_Input itself read values on start....

                



            }
        }




        // Also assign data-jsgui dom attributes.
        //   That's fine to do before compose, not reliant on internal composition.

        // A really simple to use (though not overly so) system for data syncing will help.
        //   Make setting up the differences between 3? models simple / work by default.
        //   Maybe 4 models.

        // App / Page_Context data.model and view.model
        // Control data.model and view.model

        // Possibly other interactions between control's view models.
        //   The disambiguation here should allow components to update in predictable and well described ways.

        // Overall should not be too complicated.
        //   Allow (many) controls to work (easily) in a MVVM (type) pattern.

        // Eg when the data model updates, and causes the control's view model to update, when it's updated the DOM,
        //   it should know to ignore that DOM update event.
        // Possibly there will / should be a property (boolean) like ._syncing_view_model_update_to_dom
        //   and while that is true, dom (change) events will not raise change events.
        //    Maybe not key up or down either??? Likely should not matter.












        // maybe if there is an element in the spec, read the data-jsgui-view-model property?

        // And then see if we can get that back from the context???
        //   Possibly the context will be more likely to be available on pre-activate.
        //     That may be a more sensible later time to do it on the client.



        







    }
    pre_activate() {
        super.pre_activate();


        // re-assign the .data.model and .view.model if they are available....

        // These models would need to exist within the Page_Context.
        //   That probably should be the case, working isomorphically.
        //     Model creation would be within the Page_Context.





        console.log('Data_Model_View_Model_Control pre_activate');

        // should be able to access own data_model???


    }
}

module.exports = Data_Model_View_Model_Control;