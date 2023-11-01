

const {Data_Object} = require('lang-tools');

class Control_View {
    constructor(spec = {}) {
        if (spec.context) this.context = spec.context;

        if (spec.model) {
            this.model = spec.model;
        } else {
            this.model = new Data_Object({context: this.context});
        }

    }
}

module.exports = Control_View;