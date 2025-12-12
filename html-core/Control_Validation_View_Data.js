// Control_Validation_View

// And maybe should have the context too?
//   Not unless necessary.

const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');

const View_Data = require('./View_Data');

class Control_Validation_View_Data extends View_Data {
    constructor(spec = {}) {
        super(spec);

    }


}



module.exports = Control_Validation_View_Data;
