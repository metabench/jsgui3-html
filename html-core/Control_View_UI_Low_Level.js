const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');

const Control_View_UI_Low_Level_Data = require('./Control_View_UI_Low_Level_Data');

class Control_View_UI_Low_Level extends Data_Object {
    constructor(spec = {}) {
        super(spec)

        const {context} = this;

        // And it needs its own .data

        // then that needs its own .model

        // just set .data???
        //  from spec???

        if (spec.data) {
            this.data = spec.data;
        } else {
            this.data = new Control_View_UI_Low_Level_Data({context});
        }
    }
}

module.exports = Control_View_UI_Low_Level;
