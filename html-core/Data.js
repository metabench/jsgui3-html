
const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');


class Data extends Evented_Class {
    constructor(...a) {
        super(...a);
        
        const [spec] = a;
        if (spec.context) this.context = spec.context;

        

        // and will have .model.

        // but it will be some type of field.

        //field(this, 'model', spec.model);

        if (spec.model) {
            this._model = spec.model;
        }




    }

    get model() {

        //console.log('get model');
        //console.log('this._model', this._model);

        if (this._model === undefined) {
            this._model = new Data_Value({context: this.context});
        }


        return this._model;
    }
    set model(value) {
        if (value !== this._model) {
            const old = this._model;
            this._model = value;

            this.raise('change', {
                name: 'model',
                old,
                value
            })

        }

    }
}

module.exports = Data;