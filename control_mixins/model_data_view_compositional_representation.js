//const Control = require('../html-core/control');

// Data_Features?
// Control_Multi_Modal_System???

// MVVMMM??

// the xM system perhaps?
// xMVM
// view_and_models???

// view_and_data_and_composition_models

// model_view_data_composition_representation

// DMVDMVCMVDRM



const {
    tof,
    each,
    Data_Model,
    Data_Value,
    Immutable_Data_Model,
    Immutable_Data_Value
} = require('lang-tools');

const Control_Data = require('../html-core/Control_Data');
const Control_View = require('../html-core/Control_View');
const Control_Validation = require('../html-core/Control_Validation');


// Control_Validation???
//   Does seem like a good approach when there is both the Data and the View.




// This definitely will slow down the current system of controls.
//   However, will allow more flexibility and power in high level syntax.

// Maybe include validation in another function....
//   Like setting it up so it can respond to validation status changes.


// validate_view_data_by_data
// validation_of_view_data_by_data
// setup_validation_of_view_data_by_data ????



const model_data_view_compositional_representation = (ctrl, options = {}) => {


    // And so this works in the constructor and can take the spec as well???


    const {data} = options;

    // Set up the control.view
    //  it should not be there already.

    // same with control.data

    const verify_ctrl_conditions = (ctrl) => {
        if (ctrl.data !== undefined) return false;
        if (ctrl.view !== undefined) return false;
        if (ctrl.validation !== undefined) return false;
        
        return true;
    }

    const can_proceed = verify_ctrl_conditions(ctrl);

    if (can_proceed) {
        const {context} = ctrl;

        // Create the Control_View and the Control_Data class instances.

        const o_cd = {
            context
        }

        if (data) {
            if (data.model) {
                o_cd.model = data.model;
                //ctrl.data.model = 
            }
        }

        // No, better to make it only get that data object when needed?
        //   And could do has_own_data at some stages...?

        ctrl.data = new Control_Data(o_cd);

        ctrl.validation = new Control_Validation();

        // .data._model

        
        // .data.model
        //   possibly .data.representation.models???
        //   data.model.representations?
        //   data.model.representational.models???
        //   .representation_mode = ...

        ctrl.view = new Control_View({
            context
        });

        // ctrl.view.data.model.is_selected;
        //   possibly.

        // Does seem like we need those complex and nested layers to make it clear and easy to use - clear where
        //   the info goes.

        // Have this automatically now in the general purpose (enhanced) control.
        //   Will be able to make a lot of controls that are more powerful and easier to use.
        //   Will be able to make more complex controls more easily.
        //   Will use these features to make 'selectable' work properly.
        //     The control's selection state will be one of the pieces of view data.







        // Automatically make it move own event listeners for the data.model if that data.model changes???

        /*

        ctrl.data.on('change', e => {
            const {name, old, value} = e;

            if (name === 'model') {
                console.log('somewhere / somehow need to handle ctrl.data having its .model changed');
                console.log('e', e);

                // Reattaching event listeners???
                //   but not so sure about access to evented_class.events.

                // Would depend on what syncing is set up.
                //   Maybe implement this on a higher level to start with, then move to lower level when path is clear.

            }

        })
        */


        // ctrl.view.compositional.model

        // Control_View_Compositional for example....
        // Control_View_Compositional_Model too.

        // The main focus will be power and clarity of syntax rather than speed.
        //   Maybe later on, specify which controls have this enabled and which don't.
        //     Could maybe create them on access using getters.
        //     Focus on making a powerful, simple to use, and flexible API.

        // ctrl.view.data.model.compositional.representation.model ????
        //   can make some very explicit namespaces for some very specific things.

    } else {
        console.trace();
        console.log('ctrl', ctrl);
        throw 'model_data_view_compositional_representation(ctrl) - ctrl must not have .data or .view properties';

    }







}
module.exports = model_data_view_compositional_representation;