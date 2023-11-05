const jsgui = require('./../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const {Control, Control_Data, Control_View, Data_Object} = jsgui;
const {prop, field} = require('obext');

// Late 2023 - not so much code.
//   Do want to make use of view.data.model syntax.
//     Separate to for example view.data.ui.options.model
//   Be really explicit with what it's about, but allow for shortened syntax when it's clear(er) what it's doing.


class Text_Input extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'text_input';
        spec.class = 'text-input';
        super(spec);
        const {context} = this;
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

            // 

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
        if (spec.placeholder) this.placeholder = spec.placeholder;
        if (!spec.el) {
            this.compose_text_input();
        }
    }
    get value() {
        return this.data.model.value;
    }
    set value(v) {
        this.data.model.value = v;
    }
    compose_text_input() {
        this.dom.tagName = 'input';
        this.dom.attributes.type = 'input';
        this.dom.attributes.value = this.value;
        if (this.placeholder) this.dom.attributes.placeholder = this.placeholder;
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
module.exports = Text_Input;
