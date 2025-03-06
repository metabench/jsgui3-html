const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');
const Control_Validation_Data = require('./Control_Validation_Data');
const Validation_State = require('./Validation_State');
const Control_Validation_Target = require('./Control_Validation_Target');
const Control_Validation_Validator = require('./Control_Validation_Validator');
class Data_Validation extends Evented_Class {
    constructor(spec = {}) {
        super(spec);
        if (spec.data) {
            if (spec.data.model) {
                this.data.model = spec.data.model;
            }
        }
    }
    get validator() {
        if (this._validator === undefined) {
            this._validator = new Control_Validation_Validator({context: this.context});
        }
        return this._validator;
    }
    set validator(value) {
        if (value !== this._validator) {
            const old = this._validator;
            this._validator = value;
            this.raise('change', {
                name: 'validator',
                old,
                value
            })
        }
    }
    get target() {
        if (this._target === undefined) {
            this._target = new Control_Validation_Target({context: this.context});
        }
        return this._target;
    }
    set target(value) {
        if (value !== this._target) {
            const old = this._target;
            this._target = value;
            this.raise('change', {
                name: 'target',
                old,
                value
            })
        }
    }
    get state() {
        if (this._state === undefined) {
            this._state = new Validation_State();
        }
        return this._state;
    }
    get data() {
        if (this._data === undefined) {
            this._data = new Control_Validation_Data({context: this.context});
        }
        return this._data;
    }
    set data(value) {
        if (value !== this._data) {
            const old = this._data;
            this._data = value;
            this.raise('change', {
                name: 'data',
                old,
                value
            })
        }
    }
}
module.exports = Control_Validation;