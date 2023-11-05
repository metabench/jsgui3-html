

const {Data_Object, Evented_Class} = require('lang-tools');
const {field} = require('obext');

class Control_View extends Evented_Class {

    // .data.model
    // .ui.data.model

    constructor(spec = {}) {
        super();
        if (spec.context) this.context = spec.context;

        const {context} = this;

        // view.data.model

        // .data being a Data_Object?
        //   Could make sense when responding to models being changed or updated.

        this.data = new Data_Object({context});
        field(this.data, 'model');

        this.ui = {
            data: new Data_Object({context})
        }
        field(this.ui.data, 'model');

        if (spec.data) {
            if (spec.data.model) {
                this.data.model = spec.data.model;
            } else {
                
            }
        }
        if (!this.data.model) {
            this.data.model = new Data_Object({context});
        }

        if (spec.ui && spec.ui.data) {
            if (spec.ui.data.model) {
                this.ui.data.model = spec.ui.data.model;
            } else {
                this.ui.data.model = new Data_Object({context});
            }
        }

        // 

    }
}

module.exports = Control_View;