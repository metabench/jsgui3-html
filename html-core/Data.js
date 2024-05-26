
const {field, Data_Object, Data_Value, Data_Model, Evented_Class} = require('lang-tools');


class Data extends Evented_Class {
    constructor(...a) {
        super(...a);
        
        const [spec] = a;
        if (spec.context) this.context = spec.context;
        // and will have .model.

        // but it will be some type of field.

        //field(this, 'model', spec.model);

        // spec.model_constructor


        if (spec.model) {
            if (spec.model instanceof Data_Model) {
                this._model = spec.model;
            } else {
                console.trace();
                throw 'stop';
            }
        }

        if (spec.model_constructor) {
            this.model_constructor = spec.model_constructor;
        }

        // And include .validation too.

        // Maybe lazy loading get and set properties for .validation.

        // ctrl.data.validation?
        // ctrl.view.data.validation will make sense in many cases

        // ctrl.view.data.validation.validator.data.model = ctrl.data.model

        // Maybe don't necessarily only set that on the client side.
        //   Want the code to be isomorphic in principle.

        


        //   Need a fair bit of underlying complexity to support this on a high level.



        // Having these together could work well.

    }

    get model() {
        //console.log('get model');
        //console.log('this._model', this._model);

        if (this._model === undefined) {

            if (this.model_constructor) {
                this._model = new this.model_constructor({context: this.context});
            } else {
                this._model = new Data_Value({context: this.context});
            }

            
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