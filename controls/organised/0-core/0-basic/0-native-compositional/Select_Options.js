const jsgui = require('../../../../../html-core/html-core');
const {Control, Control_Data, Control_View, Data_Object, is_array, is_arr_of_strs, each} = jsgui;
const {field} = require('obext');
class Select_Options extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'select_options';
        spec.tag_name = 'select';
        super(spec);
        const {context} = this;
        const construct_synchronised_data_and_view_models = () => {
            this.data = new Control_Data({context})
            if (spec.data && spec.data.model) {
                this.data.model = spec.data.model;
            } else {
                this.data.model = new Data_Object({context});
                field(this.data.model, 'value');
                field(this.data.model, 'options');
            }
            this.view = new Control_View({context})
            if (spec.view && spec.view.data.model) {
                this.view.data.model = spec.view.data.model;
            } else {
                this.view.data.model = new Data_Object({context});
                field(this.view.data.model, 'value');
                field(this.view.data.model, 'options');
            }
            this.data.model.on('change', e => {
                const {name, value, old} = e;
                if (name === 'value') {
                    if (value !== old) {
                        this.view.data.model.value = value;
                    }
                } else if (name === 'options') {
                    if (value !== old) {
                        this.view.data.model.options = value;
                    }
                }
            });
            this.view.data.model.on('change', e => {
                const {name, value, old} = e;
                if (name === 'value') {
                    if (value !== old) {
                        this.data.model.value = value;
                        if (this.dom.el) {
                            this.dom.el.value = value;
                        }
                    }
                } else if (name === 'options') {
                    if (value !== old) {
                        this.data.model.options = value;
                    }
                }
            });
        }
        construct_synchronised_data_and_view_models();
        if (spec.options) {
            this.data.model.options = spec.options;
        }
        if (!spec.el) {
            this.compose();
        }
    }
    activate() {
        if (!this.__active) {
            super.activate();
            const {dom} = this;
            const activate_view_model_to_dom_model_sync = () => {
                this.add_dom_event_listener('change', e => {
                    console.log('dom.el.value', dom.el.value);
                    this.view.data.model.value = dom.el.value;
                });
            }
            activate_view_model_to_dom_model_sync();
		}
	}
    compose() {

        // The options may really be within the view.ui object????
        

        const {context} = this;
        const dm_options = this.data.model.options;
        //console.log('Select_Options compose dm_options:', dm_options);
        if (is_array(dm_options)) {
            if (is_arr_of_strs(dm_options)) {
                console.log('dm_options is an array of strings');
                each(dm_options, str_option => {
                    const ctrl_option = new jsgui.option({
                        context
                    });
                    ctrl_option.dom.attributes.value = str_option;
                    ctrl_option.add(str_option);
                    this.add(ctrl_option);
                })
            }
        }
    }
}
module.exports = Select_Options;