

const {field, Data_Object, Data_Value, Evented_Class, tof} = require('lang-tools');


class Validation_State extends Evented_Class {


    constructor(spec = {}) {
        super(spec);

        // Which properties????

        

        // .value property????
        // .valid property?

        // .valid for the moment.

    }

    // a set() function????
    //   because a few things at once get set.

    set(value) {
        if (value === true) {
            this._valid = true;
        } else if (value === false) {
            this._valid = false;
        } else {
            console.trace();
            throw 'NYI';
        }
    }

    get valid() {
        return this._valid;
    }




}

module.exports = Validation_State;