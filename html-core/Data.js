const {field, Data_Object, Data_Value, Data_Model, Evented_Class} = require('lang-tools');
class Data extends Evented_Class {
    constructor(...a) {
        super(...a);
        const [spec] = a;
        if (spec.context) this.context = spec.context;
        if (spec.model) {
            if (spec.model instanceof Data_Model) {
                this._model = spec.model;
            } else {
                console.trace();
                throw new Error('Data: Expected spec.model to be a Data_Model');
            }
        }
        if (spec.model_constructor) {
            this.model_constructor = spec.model_constructor;
        }
    }
    get model() {
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
