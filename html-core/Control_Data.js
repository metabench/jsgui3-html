// And maybe should have the context too?
//   Not unless necessary.

const {Data_Object} = require('lang-tools');

// The model needs to share context....

class Control_Data {
    constructor(spec = {}) {
        if (spec.context) this.context = spec.context;

        if (spec.model) {
            this.model = spec.model;
        } else {
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