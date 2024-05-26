

const {field, Data_Object, Evented_Class} = require('lang-tools');

// And the View Data as well...

const Data = require('./Data');
//const Control_View_UI = require('./Control_View_UI');
//const Control_View_Data = require('./Control_View_Data');
const Control_View_Low_Level = require('./Control_View_Low_Level');


class View extends Evented_Class {
    // .data.model
    // .ui.data.model

    constructor(spec = {}) {
        super();
        if (spec.context) this.context = spec.context;
        const {context} = this;

        // view.data.model

        // .data being a Data_Object?
        //   Could make sense when responding to models being changed or updated.

        //const o_data = {context};
        const o_data = {};
        // Maybe create a specific 'view data model'.
        //   Though not sure how different it should be to other sorts.
        if (spec.data) {
            if (spec.data.model) {
                //this.data.model = spec.data.model;
                o_data.model = spec.data.model;
            } else {
                
            }
        }

        

        this.data = new Control_View_Data(o_data);
        //field(this.data, 'model');

        // No, make it a Control_UI object. Or Control_View_UI.
        /*

        this.ui = {
            data: new Data_Object({context})
        }
        */

        const o_ui = {context};
        if (spec.ui && spec.ui.data) {
            o_ui.data = spec.ui.data;
        }


        // Just View_UI at a lower level....
        this.ui = new Control_View_UI(o_ui);


        // Not to sure we need the low level control view object.
        //   May be worth making a directory where the systems can be grouped together?
        //   Though really want to set a standard for all controls.
        //   Does seem better to add another level to the view when needed.
        //     As an option rather than to the Control.




        /*

        const ll = new Control_View_Low_Level();
        Object.defineProperty(this, 'll', {get: () => ll});

        */


        // and .ll of course...




        // Set up the view data model.



        


        // And the UI will have a compositional model.
        //   Could even have multiple compositional models.
        //   But focus on supporting one to start with...?

        // but set .compositional.model = ... should be fine for now....

        //    .active.compositional.model and .compositional.models ????

        // .active.compositional.model does make sense of course.
        //   Support a friendly API with possibly strange objects and classes.

        // Control_View_UI_Active perhaps....?













        // .ui.compositional.data.model....

        // Does seem sensible to store various properties deeper within structures.
        




        //field(this.ui.data, 'model');
        //  Because it now already has that 'model' field

        if (spec.data) {


            
        }
        if (!this.data.model) {

            // Or create a Data_Value for the moment???

            //this.data.model = new Data_Object({context});
        }


        // Improve this somewhat....

        /*

        if (spec.ui && spec.ui.data) {

            if (spec.ui.data.model) {


                this.ui.data.model = spec.ui.data.model;
            } else {
                this.ui.data.model = new Data_Object({context});
            }
        }
        */

        // 

    }
}

module.exports = View;