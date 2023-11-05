const jsgui = require('../../../../html-core/html-core');
//const stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const {Control, Control_Data, Control_View, Data_Object} = jsgui;
const {field} = require('obext');

// 2023 - Initial support for the data.model and view.model system. Compact code, but want to make it more compact and idiomatic.

// So it's view.data.model for the moment.
//   There could be other view models too, such as view.ui.model ????
//     As in the scroll position?
//     view.ui.data.model even ???
//      for the moment, use more nested and longwinded syntax.
//      Will allow more future flexibility, and clarity when describing / writing the app(s).

// Incorporate more options / settings into these.
//   Like for a Window control, view.ui.data.model could help.
//     Meaning data such as it's position, height, width.
//       Could then use similar mechanisms for persisting and sharing that data, when needed.







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

        // Could be part of a mixin???
        //   Not quite yet though...

        // May want the 'draggable' mixin to work on the level of ctrl.view.ui.options.data.model.draggable = true??
        //   A ui options model could be useful.
        //   or just view.ui.model rather than view.data.model. ctrl.view.options ....???

        // Do make them deeply nested so that they can be for very specific things.

        // Maybe work on integrating .view.ui.data.model into classes at a lower level, for controlling some presentation things,
        //   such as ctrl.view.ui.data.model.background....

        // And could make (common / general purpose) shortcuts to them.
        //   Could make it clearer about how to write code (functions) to deal with the changes and syncronisation.

        






        const construct_synchronised_data_and_view_models = () => {
            this.data = new Control_Data({context})
            if (spec.data && spec.data.model) {
                this.data.model = spec.data.model;
            } else {
                this.data.model = new Data_Object({context});
                field(this.data.model, 'value');
            }
            this.view = new Control_View({context})
            if (spec.view && spec.view.data.model) {
                this.view.data.model = spec.view.data.model;
            } else {
                this.view.data.model = new Data_Object({context});
                field(this.view.data.model, 'value');
            }
            this.data.model.on('change', e => {
                const {name, value, old} = e;
                if (name === 'value') {
                    if (value !== old) {
                        this.view.data.model.value = value;
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
                        this.view.data.model.value = value;
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
                    this.view.data.model.value = dom.el.value;
                });
                this.add_dom_event_listener('keypress', e_keypress => {
                    this.view.data.model.value = dom.el.value;
                });
                this.add_dom_event_listener('keyup', e_keyup => {
                    this.view.data.model.value = dom.el.value;
                });
                this.add_dom_event_listener('keydown', e_keydown => {
                    this.view.data.model.value = dom.el.value;
                });
            }
            activate_view_model_to_dom_model_sync();
        }
    }
}
module.exports = Date_Picker;