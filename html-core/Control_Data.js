// And maybe should have the context too?
//   Not unless necessary.

const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');

const Data = require('./Data');

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

// Make it extend Data

class Control_Data extends Data {
    constructor(spec = {}) {
        super(spec);
        //if (spec.context) this.context = spec.context;

        // set up the .model field....
        //  would help when responding to it being changed.

        //this.model = {};

        //field(this, 'model');

        // .model is a Data_Value???
        // .model.inner_value ????


        // .model.value may be OK???
        // as in value.value would be OK in that situation.

        //console.log('spec.model', spec.model);
        /*
        const model = (() => {
            if (spec.model) {
                return spec.model;
            } else {
                //return new Control_View_Low_Level_Data({context});
            }
        })();
        Object.defineProperty(this, 'model', {get: () => model});
        */

        const old = () => {
            if (spec.model) {
                this.model = spec.model;
            } else {
    
                //console.log('spec.model', spec.model);
    
                //console.trace();
                //throw 'NYI';
                // 
    
                // Could maybe use just a Data_Value???
    
                // Maybe better for the moment....
    
                // Possibly only want lazy loading of this.model.
    
                //this.model = new Data_Value({context: this.context});
            }
        }

        


    }

    

    // but will have a model on change system of some sort(s).
    
    // Reassigning events (change event handlers).
    //   So anything listening for change events on the old model instead listens to change events on the new model.

    // so the Control_Data would raise a 'change' event with name 'model'.
    //   maybe worth being clearer about what kinds of changes there are, ie if something's value changes, or of it gets
    //   replaced with another item.







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