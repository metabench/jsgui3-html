
const Ctrl_Enh = require('./control-enh');

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



// Possibly not so much to do here right now???




class Data_Model_View_Model_Control extends Ctrl_Enh {
    constructor(...a) {
        super(...a);

        const spec = a[0] || {};
        // Possibly set up both models here, but should look out for data and view models in the spec.

        // Also, look out for it in pre_activate I think. Would be good to reconnect those models here.

        // Would also need to add the appropriate .dom.attributes['data-jsgui-view-model']
        //                                        .dom.attributes['data-jsgui-data-model']

        // 

        console.log('construct Data_Model_View_Model_Control');

        // spec.view
        // spec.data

        // and would both need 'model' properties???
        //   does seem best for the moment to make it really explicit.

        if (spec.data) {
            this.data = {};
            if (spec.data.model) {
                this.data.model = spec.data.model;

                this.dom.attributes['data-jsgui-data-model'] = this.data.model._id();
            }
        }
        if (spec.view) {
            this.view = {};
            if (spec.view.model) {
                this.view.model = spec.view.model;

                this.dom.attributes['data-jsgui-view-model'] = this.view.model._id();
            }
        }

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

            }

            if (this.dom.el.hasAttribute('data-jsgui-view-model')) {
                const view_model_jsgui_id = this.dom.el.getAttribute('data-jsgui-view-model');

                console.log('Data_Model_View_Model_Control view_model_jsgui_id:', view_model_jsgui_id);

                // then get it from the context.



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
    }
}

module.exports = Data_Model_View_Model_Control;