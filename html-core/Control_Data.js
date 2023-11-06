// And maybe should have the context too?
//   Not unless necessary.

const {field, Data_Object, Evented_Class} = require('lang-tools');


// The model needs to share context....

// Or extend Data_Object here even???

// The model could possibly be a single value (Data_Value).


// data.model ????
// data.value ????
// data.model.value ????



// Could maybe make non-server examples / tests that just render it to HTML and list info on what events are attached to the
//   dom and control.

// Having further ways to develop and test controls not on the server could help a little.
//   Could help a lot with unit / regression tests.
//   Eg what HTML do they render?

// Is the data coordinated with the data model(s)?

class Control_Data extends Evented_Class {
    constructor(spec = {}) {
        super();
        if (spec.context) this.context = spec.context;

        // set up the .model field....
        //  would help when responding to it being changed.

        //this.model = {};

        field(this, 'model');

        // .model is a Data_Value???
        // .model.inner_value ????


        // .model.value may be OK???
        // as in value.value would be OK in that situation.




        if (spec.model) {
            this.model = spec.model;
        } else {
            // Could maybe use just a Data_Value???

            this.model = new Data_Object({context: this.context});
        }

        


    }
}

// Maybe this will be 'DMVM' rather than 'MVVM'.
// Data-Model-View-Model.
// Data_Model_View_Model.
// Data_Model_View_Model_View_Data_Model even ???
//   Could generally always support those three model layers (and use them?) but not need to be explicit about them in the high level API.

// The View_Data_Model will be specifically to mirror the Data_Model, while the View_Model would include things like zoom level of the
//   viewer or editor.

// Could look into a nice mid-level API to facilitate model mirroring / syncing.
//   Data_Object syncing.
//     And could have it support async patterns (though may be better to retrofit that a little later)
//   That could help make other code more explicit and compact.





module.exports = Control_Data;