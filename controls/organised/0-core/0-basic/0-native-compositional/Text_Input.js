const jsgui = require('../../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const { Control, Control_Data, Control_View, Data_Object, Data_Model, Data_Value } = jsgui;
const { prop, field } = require('obext');
const apply_input_mask = require('../../../../../control_mixins/input_mask');
const { apply_full_input_api } = require('../../../../../control_mixins/input_api');
const { themeable } = require('../../../../../control_mixins/themeable');
const { apply_token_map } = require('../../../../../themes/token_maps');

/**
 * Text Input Control
 * 
 * A text input field with theme support.
 * 
 * Supports variants: default, compact, floating, filled, underline, search, inline
 * Supports sizes: small, medium, large
 * 
 * @example
 * // Default input
 * new Text_Input({ placeholder: 'Enter text...' });
 * 
 * // Search input
 * new Text_Input({ variant: 'search', placeholder: 'Search...' });
 * 
 * // Filled input with small size
 * new Text_Input({ 
 *     variant: 'filled', 
 *     params: { size: 'small' }
 * });
 */
class Text_Input extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'text_input';
        spec.class = 'text-input';

        super(spec);
        const { context } = this;

        // Apply themeable - resolves params and applies hooks
        const params = themeable(this, 'text_input', spec);

        // Apply token mappings (size -> CSS variables)
        apply_token_map(this, 'input', params);

        this.enhance_only = !!spec.enhance_only && !!spec.el;

        apply_input_mask(this, spec || {});
        apply_full_input_api(this, {
            disabled: spec.disabled,
            readonly: spec.readonly,
            required: spec.required
        });

        if (spec.placeholder) this.placeholder = spec.placeholder;
        if (this.placeholder) {
            this.dom.attributes.placeholder = this.placeholder;
        }
        if (!spec.el) {
            //this.compose_text_input();
        }


        // Likely to need improved client-side data coherence.
        //   Worth approaching it step-by-step.



        // But actually want to set up syncing between the view model and the dom element value.

        //console.log('this.view.data', this.view.data);


        //console.log('this.view.data.model', this.view.data.model);


        // not so sure about .ui.ll.data.model.

        // a ui ll dm could make sense.
        //console.log('this.view.ll.data.model', this.view.ll.data.model);

        //console.log('this.view.ll.data.model', this.view.ll.data.model);

        // 3 models, multi-sync.... - Maybe that could be added in somehow.
        //   Maybe need 3 models only in some cases.
        //   Maybe need 0 in some cases?
        //   For the moment, see what can be done with the 2 models system, making it standard in some ways, better supported.

        // Maybe the view model of the parent control gets synced with the data model of the subcontrol.
        //   








        const view_data_model_change_handler = e => {
            const { name, value, old } = e;

            //console.log('Text_Input view data model change e:', e);

            //console.log('Text_Input view_data_model_change_handler [old, value]', [old, value]);

            if (name === 'value') {
                //console.log('Text_Input pre set dom attributes value to:', value);
                //console.log('tof(value)', tof(value));

                const masked_value = this.apply_input_mask_value
                    ? this.apply_input_mask_value(value)
                    : value;

                this.dom.attributes.value = masked_value;

                //console.log('!!this.dom.el', this.dom.el);

                if (this.dom.el) {
                    //this.dom.el.setAttribute('value', value + '');
                    this.dom.el.value = masked_value + '';
                }


                //this.view.ll.data.model.value = value;

                this.data.model.value = masked_value;

                // and update the view.ui.ll.data.model....

            }

        };

        //console.log('this.view.data', this.view.data);
        this.view.data.model.on('change', view_data_model_change_handler);

        this.view.data.on('change', e => {
            const { name, value, old } = e;
            if (name === 'model') {
                if (old instanceof Data_Model) {
                    old.off('change', view_data_model_change_handler);
                }
                value.on('change', view_data_model_change_handler);
            }
        });



        /*

        const view_ui_ll_data_model_change_handler = e => {
            const {name, value, old} = e;

            //console.log('Text_Input view data model change e:', e);

            //console.log('Text_Input view_data_model_change_handler [old, value]', [old, value]);

            if (name === 'value') {
                //this.dom.attributes.value = value;
                this.dom.attributes.value = value;
                this.view.data.model.value = value;
                

                // and update the view.ui.ll.data.model....



            }
        }

        this.view.ui.ll.data.model.on('change', view_ui_ll_data_model_change_handler);
        this.view.ui.ll.data.on('change', e => {
            const {name, value, old} = e;
            if (name === 'model') {
                if (old instanceof Data_Model) {
                    old.off('change', view_ui_ll_data_model_change_handler);
                }
                value.on('change', view_ui_ll_data_model_change_handler);
            }
        });
        */

        /*
        const view_ll_data_model_change_handler = e => {
            const {name, value, old} = e;

            //console.log('Text_Input view data model change e:', e);

            //console.log('Text_Input view_data_model_change_handler [old, value]', [old, value]);

            if (name === 'value') {
                //this.dom.attributes.value = value;

                // can it accept that new value???

                //console.log('view_ll_data_model_change_handler [old, value]', [old, value]);

                const change_attempt = this.view.data.model.attempt_set_value(value);
                

                console.log('change_attempt', change_attempt);

                if (change_attempt.success === true) {
                    //this.view.data.model.value = value;
                    this.dom.attributes.value = value;



                } else {


                    //this.view.ll.data.model.value = old;
                    //  not sure this has been set to a value of the right type (str or int).

                    //this.dom.attributes.value = old;

                    // or directly set the dom el???
                    //this.dom.el.value = old;





                    // Set it back to the old value....



                    // undo it....

                    //console.trace();
                    console.log('need to change back to the old value');
                    console.log('[name, value, old]', [name, value, old]);
                    throw 'NYI';
                }


                

                
                

                // and update the view.ui.ll.data.model....



            }
        }

        this.view.ll.data.model.on('change', view_ll_data_model_change_handler);
        this.view.ll.data.on('change', e => {
            const {name, value, old} = e;
            console.log('this.view.ll.data change e:', e);
            if (name === 'model') {
                if (old instanceof Data_Model) {
                    old.off('change', view_ll_data_model_change_handler);
                }
                value.on('change', view_ll_data_model_change_handler);
            }
        });
        */



        const data_model_change_handler = e => {
            const { name, value, old } = e;
            //console.log('Text_Input data_model_change_handler e:', e);
            if (name === 'value') {
                //this.dom.attributes.value = value;
                this.view.data.model.value = value;
            }

        };

        this.data.model.on('change', data_model_change_handler);

        // Maybe have this already automatically from the mixin.

        const setup_handle_data_model_itself_changing = () => {
            this.data.on('change', e => {
                const { name, value, old } = e;
                //console.log('Text_Input .data change e:', e);
                if (name === 'model') {



                    if (old instanceof Data_Model) {
                        old.off('change', data_model_change_handler);
                    }

                    if (value instanceof Data_Model) {
                        value.on('change', data_model_change_handler);
                    }


                }
            })
        }
        setup_handle_data_model_itself_changing();

        //console.log('Text_Input constructor this.data.model.value', this.data.model.value);

        if (this.data.model.value !== undefined) {
            this.view.data.model.value = this.data.model.value;
        }

        if (spec.value !== undefined) {
            if (this.data && this.data.model && typeof this.data.model.set === 'function') {
                this.data.model.set('value', spec.value, true);
            } else {
                this.data.model.value = spec.value;
            }
            this.dom.attributes.value = spec.value;
        }

        this.dom.tagName = 'input';
        this.dom.attributes.type = 'text';
        //this.dom.attributes.value = this.value;

        //console.log('Text_Input end of constructor this.view.ui.ll.data.model:', this.view.ui.ll.data.model);
        //console.log('Text_Input end of constructor this.view.data.model:', this.view.data.model);
        //console.log('this.view.ll.data.model.value', this.view.ll.data.model.value);

    }


    get value() {

        return this.data.model.value;
    }
    set value(v) {


        this.data.model.value = v;
    }

    /*
    compose_text_input() {

        // More like the DOM settings rather than composition.

        

        // And it's placeholder text
        //   That's not part of the data model.
        //   Maybe it's the presentation data model? Presentation model?



        // ui.data.model perhaps....
        // ui.model perhaps???
        //   want some kind of consistency to calling things data models.


        //   And would define types there.
        


        // ui is the presentation basically.





        if (this.placeholder) this.dom.attributes.placeholder = this.placeholder;


    }
    */

    // A ll getter for the string value???

    // ll_value???
    // ll_value_type???


    activate() {
        if (!this.__active) {
            super.activate();
            const { dom } = this;




            // Maybe set the view.ui.ll.data.model.value instead....



            // sync_dom_changes_to_view_data_model....???

            // Later will have some lower level code to set these things up better.

            //console.log('dom.el.value', dom.el.value);

            //console.log('this.view.data.model', this.view.data.model);
            //console.log('this.view.data.model.value', this.view.data.model.value);

            this.view.data.model.value = dom.el.value;

            //console.log('this.view.data.model.value', this.view.data.model.value);


            const activate_sync_dom_to_view_ui_ll_data_model = () => {
                const dm = this.view.ui.ll.data.model;

                this.add_dom_event_listener('change', e => {
                    dm.value = dom.el.value;
                });
                this.add_dom_event_listener('keypress', e_keypress => {
                    dm.value = dom.el.value;
                });
                this.add_dom_event_listener('keyup', e_keyup => {
                    dm.value = dom.el.value;
                });
                this.add_dom_event_listener('keydown', e_keydown => {
                    dm.value = dom.el.value;
                });
            }
            //activate_sync_dom_to_view_ui_ll_data_model();

            const handle_change_event = e => {

                //console.log('Text_Input DOM handle_change_event');

                //console.log('dom.el.value', dom.el.value);
                const masked_value = this.apply_input_mask_value
                    ? this.apply_input_mask_value(dom.el.value)
                    : dom.el.value;
                if (dom.el.value !== masked_value) {
                    dom.el.value = masked_value;
                }
                this.view.data.model.value = masked_value;
            }

            const activate_sync_dom_to_view_ll_data_model = () => {
                //console.log('activate_sync_dom_to_view_ll_data_model');
                //const dm = this.view.ll.data.model;

                this.add_dom_event_listener('change', e => {
                    handle_change_event(e);
                });
                this.add_dom_event_listener('keypress', e => {
                    handle_change_event(e);
                });
                this.add_dom_event_listener('keyup', e => {
                    handle_change_event(e);
                });
                this.add_dom_event_listener('keydown', e => {
                    handle_change_event(e);
                });
            }
            activate_sync_dom_to_view_ll_data_model();
        }
    }
}

const { register_swap } = require('../../../../../control_mixins/swap_registry');

const should_enhance = el => {
    if (!el || !el.classList) return false;
    if (el.classList.contains('jsgui-enhance')) return true;
    if (typeof el.closest === 'function' && el.closest('.jsgui-form')) return true;
    return false;
};

register_swap('input[type="text"], input:not([type])', Text_Input, {
    enhancement_mode: 'enhance',
    predicate: should_enhance
});

module.exports = Text_Input;
