// Control_Validation_View

// And maybe should have the context too?
//   Not unless necessary.

const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');

const View = require('./View');

// No, will be Control_View_Data_Validation, for the moment at least

class Control_Validation_View extends View {
    constructor(spec = {}) {



        super(spec);

        // though will have Control_Validation_View_Data



    }


}



module.exports = Control_Validation_View;