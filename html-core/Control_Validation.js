const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');

const Control_Validation_Data = require('./Control_Validation_Data');
const Validation_State = require('./Validation_State');

// Let's just have it a Validation class????

const Control_Validation_Target = require('./Control_Validation_Target');
const Control_Validation_Validator = require('./Control_Validation_Validator');

// Control_Validation_Validator

// Should not automatically be there for every control...??
//   Or create it when it's accessed the first time???

// Or a mixin that sets up the Control_Validation on the control.


class Control_Validation extends Evented_Class {
    // Or set up validation on data model states?

    // Control validation will be about if the view.data.model.value is valid according to the data.model.valdate_value

    constructor(spec = {}) {
        super(spec);

        // and will have .data too.
        //   that would itself have .data

        // The validation data model is important.
        
        if (spec.data) {
            if (spec.data.model) {
                this.data.model = spec.data.model;
            }
        }

        // validation target too....
        //   a field of some sort.
        //   will need to be able to listen to target change.








        // .validation.state.valid for the moment.
        // .validation.state.valid === true???

        // And need to change that automatically according to what validation needs to be done.

        // Make it so that validation status indicators can be very clear in purpose and accurate in what they show.
        //   Easy to define and use.

        // Should continue working on particularly mid level code that makes the high-level code more succinct.
        //   There is quite a lot of existing low level code that can improve the mid level to make the high level
        //   very capable.


        // ctrl.validation.target = ...
        // ctrl.validation.validator = ...
        // ctrl.validation = {target, validator}

        // ctrl.validation.state.on('change', e => {...})
        //   Does seem like it would be a convenient API for watching state changes.

        // .onchange('valid')

        // ctrl.view.data.validation seems like maybe the best / clearest syntax.
        // ctrl.validation is not as clear / explicit.
        //   it's really about validating the data in the view.
        //   maybe that would be assumed.
        // ctrl.data.validation too ???
        //   that would be about validating the underlying (currently accepted) data rather than the data represented in the view.


        // Maybe best to focus on Control_View_Data_Validation for the moment.
        //   Either would not have a .target, or better its .target is the .view.data.model as read-only.

        





        //





    }

    // and validator too....



    get validator() {
        //console.log('get model');
        //console.log('this._model', this._model);

        if (this._validator === undefined) {

            //if (this.model_constructor) {
            //    this._model = new this.model_constructor({context: this.context});
            //} else {
            //    this._validator = new Data_Value({context: this.context});
            //}

            this._validator = new Control_Validation_Validator({context: this.context});

            
        }
        return this._validator;
    }
    set validator(value) {
        // 

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
        //console.log('get model');
        //console.log('this._model', this._model);

        if (this._target === undefined) {

            //if (this.model_constructor) {
            //    this._model = new this.model_constructor({context: this.context});
            //} else {
            //    this._target = new Data_Value({context: this.context});
            //}

            this._target = new Control_Validation_Target({context: this.context});

            
        }
        return this._target;
    }
    set target(value) {
        // 

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

    // Need both .data and .view.data
    //   It may validate between them...?


    // validation.validator = ....?
    // validation.validatior.data.model = ...???
    //   Does seem logical!!!

    // Control_Validation_Target

    // validation.target.data.model = ....?

    // Control_Validation_Validator even!!!!

    // A very explicit API would help, will be a bit fiddly to code all the parts.


    // Validator and Target would be explicit names, and will be clear when a view data model is being validated according to the (backing) data model






    get data() {
        if (this._data === undefined) {
            this._data = new Control_Validation_Data({context: this.context});
        }
        return this._data;
    }

    // And a view property too.

    // Seems somewhat easy to set up like this....

    // Though it's Control_Validation_View

    // Validation View???

    // ctrl.validation.view.data.model = ctrl.view.data.model



    // Validate view agasint non-view.





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
