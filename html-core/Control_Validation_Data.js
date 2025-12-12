// And maybe should have the context too?
//   Not unless necessary.

const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');

const Data = require('./Data');

class Control_Validation_Data extends Data {
    constructor(spec = {}) {
        super(spec);

    }


}



module.exports = Control_Validation_Data;
