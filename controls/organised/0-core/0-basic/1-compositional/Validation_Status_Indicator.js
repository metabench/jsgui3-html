const Status_Indicator = require('./Status_Indicator');

const Control_Validation = require('../../../../../html-core/Control_Validation');

// Control_Validation.

// Control View Validation???
//   etc can use in a few different ways.


// Seems like piece-by-piece implementation of client-side data model recoherence will be the way.
//   Seems like the controls would need to be constructed without the correct data_models, and then they get changed later on.

// Perhaps though, the Data_Model could be set up completely independant of controls (to start with at least).
//   Though having it so that all the logic is within client-side controls could make sense.
//   It does for now at least, but consider other ways.
//     Recoherence (and recoherence testing?) may be the best way forward for now, and work on making it as simple as possible
//     on a high level.

// Possibly need more low/mid level code to coordinate validations.
//   Specifically how one data model gets validated against another data model.

// Make the status indicator get the status after it gets activated?
//   Before it gets activated?

// Reloading / reconstructing / recohering a data_model on the client-side....
//   Need to carefully consider the steps.
//   Probably best to implement on high-level for the moment, move to lower level when the principles are clearer.



// this.validate.by perhaps???
// this.validation.data.model does make sense.
//   At least when it comes to a validation status indicator.
//   Though having more of the work done by Validation_Status would make sense.

// Do need to be a bit clearer about what will validate what.

// Maybe see about using some concise pieces of code....

// Or looking at validation statuses thoroughly on different levels.




class Validation_Status_Indicator extends Status_Indicator {

    // Likely will need some client-side recoherence with whatever model(s).

    // vsi.data.model.value being the status value itself?
    // vsi.data.model.validation.state perhaps?????

    //   

    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'validation_status_indicator';
        super(spec);
        this.add_class('validation-status')

        const {context} = this;

        // .validation.data.model ....

        //  Should look at lower level coherence systems so that the data_model gets transmitted best to the client.
        // does the spec have a validation data model???

        // Is it connected to the data to validate?

        // Some kinds of 'statuses' model / list?
        //   

        // .validation.status.valid = true / false
        // or .data.model.validation.state ????

        // Data_Model_Validation_State



        const create_control_validation_but_maybe_we_dont_need_it = () => {

            const o_validation = {context};

            if (spec.validation) {
                if (spec.validation.data) {
                    if (spec.validation.data.model) {
                        o_validation.data = {
                            model: spec.validation.data.model
                        }
                    }
                }
            }
            // 




            this.validation = new Control_Validation(o_validation);
            this.validation.state.on('change', e => {
                const {name, old, value} = e;

                //console.log('Validation_Status_Indicator validation.state change e:', e);

                if (name === 'valid') {
                    // update the appearance (class)

                    if (value === true) {
                        this.remove_class('is-not-valid');
                        this.add_class('is-valid');
                    } else if (value === false) {
                        this.remove_class('is-valid');
                        this.add_class('is-not-valid');
                    }
                }
            })

        }

        // 
        this.data.on('change', e => {

            console.log('V_S_I change e:', e);

            const {name, old, value} = e;
            if (name === 'model') {
                // May need to move handlers.
                //   The validation status change handler.


                console.log('vsi data model change e', e);

            }
        })

        this.data.model.validation.state.on('change', e => {
            console.log('Validation_Status_Indicator .data.model.validation.state change e:', e);
        })


        // this.data.model.validation.status.on('change' 'valid')


        // this.validation.on('change' valid)....


        // A Validation State is an important thing to have as well.
        //   It is worth putting a load of logic into the names and purposes of classes.

        // this.validation.state.on('change'....)

    }

    activate() {

        // Definitely would be better to put some kinds of validation / data model recoherence in the lower level code that
        //   gets run automatically.

        // Want both the controls and the usage of them to have simple code.
        //   Will need to focus on implementing particularly mid-level code to get all these things working smoothly.

        // Looking again at ctrl and ctrl-enh may help with recohering the data on the client-side.

        // Also want to get into a view.ui.presentation data model....
        //   Maybe also see about coherance / reconstruction of that.

        // It seems very worth focusing for the moment on the mid-level code that will get everything working more smoothly.
        //   Plus Data_Value where needed.
        //   Maybe see about refactoring it.


        // Context seems like the best place to keep some data model coherence.
        //   

        // Recoherence of data_model(s) within the Page_Context?



        // Any kind of recoherence that would help here???


        const log_some_things = () => {
            console.log('Validation_Status_Indicator activate');

            console.log('this.validation', this.validation);

            console.log('this.validation.state', this.validation.state);

            console.log('this.validation.data.model', this.validation.data.model);

            console.log('this.data.model', this.data.model);

            console.log('this.data.model.value', this.data.model.value);
        }

        


    }

    // And activation????
    //   Would nice to have less needing to be done in activate functions.



}

Validation_Status_Indicator.css = `
    .validation-status.indicator {
        width: 24px;
        height: 24px;
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        border: 1px solid #333333;
        border-radius: 3px;
    }
    .validation-status.indicator.is-valid {
        background-color: '#66DD66'
    }
    .validation-status.indicator.is-not-valid {
        background-color: '#DD6666'
    }
`

module.exports = Validation_Status_Indicator;