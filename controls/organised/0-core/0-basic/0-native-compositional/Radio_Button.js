/**
 * Created by James on 04/08/2014.
 */

/*

 if (typeof define !== 'function') { var define = require('amdefine')(module) }


 // Also want to make an MDI window system (Multiple Document Interface)

 define(["../../jsgui-html", "./horizontal-menu"],
 function(jsgui, Horizontal_Menu) {
 */

const jsgui = require('../../../../../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;
const { apply_full_input_api } = require('../../../../../control_mixins/input_api');
const { themeable } = require('../../../../../control_mixins/themeable');

var group = jsgui.group;

// And the tab buttons act as radio buttons.
//  Having a JSGUI radio button replacement would be nice.
//   Could choose whether to render as a radio button and progressively enhance on the client...
//    Client-side enhancement of semantic HTML.

//   Or render as it appears on the client?
//    Being able to handle both would be nicest.
//    Possibly radio buttons could have good styling on modern clients anyway?
//    May want them to look very different to normal radio buttons though, eg using them for tabs.


// RadioButtonGroup could be a useful Control as well.
//  May provide an easier interface that abstracts away from having to directly make some of the controls.











var fields = {
    'name': String,
    'text': String,
    'value': String,
    'checked': Boolean
};

class Radio_Button extends Control {
    // panel name?

    // could have a title field.

    // Items field could be an array.

    // maybe add before make would be better. add will probably be used more.
    constructor(spec, add, make) {
        spec = spec || {};
        super(spec);

        // Will have set up some fields.
        //  However, will not be directly using a Field_Collection.
        //   Though perhaps that would help with keeping the ordering of the fields.
        //   Currently we are just treating ._ as holding all fields.
        //    Though not everything in there need be considered a field or set up as one.




        this.__type_name = 'radio_button';

        this.add_class('radio-button');
        this.add_class('jsgui-radio');
        var context = this.context;

        // Apply theming
        const params = themeable(this, 'radio_button', spec);
        //var that = this;

        // A different way of raising change events?
        //  .on('change') often translates to the dom el's onchange.

        // Want a way to refer to the event for the Control itself, not adding a DOM listener.
        //  (..., false) seems OK.



        if (spec.group_name) this.group_name = spec.group_name;
        if (spec.text) this.text = spec.text;
        if (spec.label) this.text = spec.label;

        const enhance_only = !!spec.enhance_only && !!spec.el;
        const has_checked = is_defined(spec.checked);
        const initial_checked = has_checked ? !!spec.checked : (enhance_only ? !!spec.el.checked : false);
        this.checked = initial_checked;
        this.enhance_only = enhance_only;
        if (enhance_only) {
            this._native_radio_el = spec.el;
            this._input_base_el = spec.el;
            if (!this.group_name && spec.el.name) {
                this.group_name = spec.el.name;
            }
            if (spec.el.value !== undefined) {
                this.value = spec.el.value;
            }
        }

        //console.log('spec.el', spec.el);

        // No, make this contain an input element and a label element

        if (!spec.abstract && !spec.el) {

            var name = this.group_name;

            // Will need to render its ID in the DOM.

            var html_radio = new Control({
                context
            });
            {
                const { dom } = html_radio;
                dom.tagName = 'input';
                const { attributes } = dom;
                attributes.type = 'radio';

                attributes.name = name;


                attributes.id = html_radio._id();
                attributes['aria-checked'] = initial_checked ? 'true' : 'false';
                if (initial_checked) {
                    attributes.checked = 'checked';
                }

            }

            html_radio.add_class('jsgui-radio-input');

            // Custom radio circle with dot
            const radio_circle = new Control({ context });
            radio_circle.dom.tagName = 'div';
            radio_circle.add_class('jsgui-radio-circle');

            const radio_dot = new Control({ context });
            radio_dot.dom.tagName = 'span';
            radio_dot.add_class('jsgui-radio-dot');
            radio_circle.add(radio_dot);
            /*
            html_radio.set('dom.tagName', 'input');
            html_radio.set('dom.attributes.type', 'radio');
            html_radio.set('dom.attributes.name', name);
            html_radio.set('dom.attributes.id', html_radio._id());
            */




            var html_label = new Control({
                'context': context
            });

            //html_label.set('dom.tagName', 'label');
            html_label.dom.tagName = 'label';
            //console.log('that._', that._);

            var text_value = (this.text != null) ? this.text + '' : '';

            //console.log('spec.text', spec.text);

            // Value should have been set during the initialization.


            //console.log('text_value', text_value);
            //console.log('tof text_value', tof(text_value));
            //console.log('that._.text', that._.text);
            //console.log('tof(that._.text)', tof(that._.text));
            //console.log('tof(that._.text._)', tof(that._.text._));

            // So it seems as though the text field has not been assigned.
            //  It should have been, as its specified as a field.

            // However, there is a Data_Value for the text field, but it has not been set.

            // The field should have been set during initialization.



            //throw 'stop';

            if (is_defined(text_value)) {
                html_label.add(text_value);
            }

            // The text is a field.
            //  Should be automatically assigned from the spec.


            // Needs to have a context for the text that gets added.
            //  Text is not an element in of itself, so will not need a context.



            //html_label.set('dom.attributes.for', html_radio._id());
            html_label.dom.attributes.for = html_radio._id();
            html_label.add_class('jsgui-radio-label');

            this.add(html_radio);
            this.add(radio_circle);
            this.add(html_label);

            this._ctrl_fields = this._ctrl_fields || {};
            this._ctrl_fields.radio = html_radio;
            this._ctrl_fields.label = html_label;
            this.radio = html_radio;
            this.label = html_label;
            this._input_base_el = html_radio;

            //this.set('radio', html_radio);
            //this.set('label', html_label);
            //html_radio.set('dom.attributes.type', 'radio');


            /*
            this.set('dom.attributes.data-jsgui-fields', stringify({
                'value': this.get('value')
            }).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));

            */

            // Look at the items.




            /*
             var ctrl_fields = {
             'ctrl_relative': div_relative._id(),
             'title_bar': title_bar._id()
             }


             this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
             */


        }

        apply_full_input_api(this, {
            value_mode: 'checked'
        });

    }
    /**
     * Set the checked state.
     * @param {boolean} checked - The checked state.
     */
    set_checked(checked) {
        const next_checked = !!checked;
        this.checked = next_checked;
        this._fields = this._fields || {};
        this._fields.checked = next_checked;

        const html_radio = this.radio || (this._ctrl_fields && this._ctrl_fields.radio);
        const native_radio = this._native_radio_el || (html_radio && html_radio.dom ? html_radio.dom.el : null);

        if (html_radio) {
            html_radio.dom.attributes['aria-checked'] = next_checked ? 'true' : 'false';
            if (next_checked) {
                html_radio.dom.attributes.checked = 'checked';
            } else {
                html_radio.dom.attributes.checked = '';
            }
            if (html_radio.dom.el) {
                html_radio.dom.el.checked = next_checked;
            }
        } else if (native_radio) {
            if (typeof native_radio.setAttribute === 'function') {
                native_radio.setAttribute('aria-checked', next_checked ? 'true' : 'false');
                if (next_checked) {
                    native_radio.setAttribute('checked', 'checked');
                } else {
                    native_radio.removeAttribute('checked');
                }
            }
            native_radio.checked = next_checked;
        }
    }

    /**
     * Get the checked state.
     * @returns {boolean}
     */
    get_checked() {
        return !!this.checked;
    }

    /**
     * Set the disabled state.
     * @param {boolean} disabled
     */
    set_disabled(disabled) {
        const html_radio = this.radio || (this._ctrl_fields && this._ctrl_fields.radio);
        if (disabled) {
            this.add_class('disabled');
            if (html_radio) {
                html_radio.dom.attributes.disabled = 'disabled';
                if (html_radio.dom.el) html_radio.dom.el.disabled = true;
            }
        } else {
            this.remove_class('disabled');
            if (html_radio) {
                delete html_radio.dom.attributes.disabled;
                if (html_radio.dom.el) html_radio.dom.el.disabled = false;
            }
        }
    }
    //'resizable': function() {
    //},
    'activate'() {
        // May need to register Flexiboard in some way on the client.


        if (!this.__active) {
            super.activate();

            var radio = this.radio || (this._ctrl_fields && this._ctrl_fields.radio);
            var el_radio = radio && radio.dom ? radio.dom.el : null;
            if (!el_radio) {
                el_radio = this._native_radio_el || (this.dom && this.dom.el);
            }
            if (!el_radio) return;
            //var el_radio = radio.dom.el;//???
            var label = this.label;
            //var that = this;

            //var el = this.dom.el;
            //

            // No, refer specifically to the radio button element's control.

            // Changes upon becoming checked?

            /*
            radio.on('change', e_change => {
                //console.log('el_radio.checked', el_radio.checked);

                //if (el_radio.checked) {
                    this.raise('change', {
                        name: 'checked',
                        value: el_radio.checked
                    });
                //}
            });
            */

            const handle_change = () => {
                const checked = !!el_radio.checked;
                this.set_checked(checked);
                this.raise('change', {
                    name: 'checked',
                    value: checked
                });
            };

            if (radio) {
                radio.on('change', handle_change);
            } else {
                this.add_dom_event_listener('change', handle_change);
            }

            // Need to listen for DOM change events. That will chage the value.
            //  The checked value true or false.



        }



        //

    }
};

const { register_swap } = require('../../../../../control_mixins/swap_registry');

const should_enhance = el => {
    if (!el || !el.classList) return false;
    if (el.classList.contains('jsgui-enhance')) return true;
    if (typeof el.closest === 'function' && el.closest('.jsgui-form')) return true;
    return false;
};

register_swap('input[type="radio"]', Radio_Button, {
    enhancement_mode: 'enhance',
    predicate: should_enhance
});

module.exports = Radio_Button;
/*
 return Panel;
 }
 );
 */
