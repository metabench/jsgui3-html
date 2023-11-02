const jsgui = require('../../../../html-core/html-core');
//const stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const {Control, Control_Data, Control_View, Data_Object} = jsgui;
const {field} = require('obext');

// 2023 - Initial support for the data.model and view.model system. Compact code, but want to make it more compact and idiomatic.

class Date_Picker extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'date_picker';
        super(spec);
        this.add_class('date-picker');
        this.dom.tagName = 'input';
        this.dom.attributes.type = 'date';
        const {context} = this;
        if (!spec.el) {
            this.compose_date_picker();
        }
        const construct_synchronised_data_and_view_models = () => {
            this.data = new Control_Data({context})
            if (spec.data && spec.data.model) {
                this.data.model = spec.data.model;
            } else {
                this.data.model = new Data_Object({context});
                field(this.data.model, 'value');
            }
            this.view = new Control_View({context})
            if (spec.view && spec.view.model) {
                this.view.model = spec.view.model;
            } else {
                this.view.model = new Data_Object({context});
                field(this.view.model, 'value');
            }
            this.data.model.on('change', e => {
                const {name, value, old} = e;
                if (name === 'value') {
                    if (value !== old) {
                        this.view.model.value = value;
                    }
                }
            });
            this.view.model.on('change', e => {
                const {name, value, old} = e;
                if (name === 'value') {
                    if (value !== old) {
                        this.data.model.value = value;
                        if (this.dom.el) {
                            this.dom.el.value = value;
                        }
                    }
                }
            });
        }
        construct_synchronised_data_and_view_models();
        this.assign_data_model_value_change_handler();
    }
    assign_data_model_value_change_handler() {
        if (this.data && this.data.model) {
            this.data.model.on('change', e => {
                const {name, value, old} = e;
                if (name === 'value') {
                    if (value !== old) {
                        this.view.model.value = value;
                    }
                }
            });
        }
	}
    compose_date_picker() {
    }
    activate() {
        if (!this.__active) {
            super.activate();
            const {dom} = this;
            const activate_view_model_to_dom_model_sync = () => {
                    this.add_dom_event_listener('change', e => {
                        this.view.model.value = dom.el.value;
                    });
                    this.add_dom_event_listener('keypress', e_keypress => {
                        this.view.model.value = dom.el.value;
                    });
                    this.add_dom_event_listener('keyup', e_keyup => {
                        this.view.model.value = dom.el.value;
                    });
                    this.add_dom_event_listener('keydown', e_keydown => {
                        this.view.model.value = dom.el.value;
                    });
            }
            activate_view_model_to_dom_model_sync();
        }
    }
}
module.exports = Date_Picker;