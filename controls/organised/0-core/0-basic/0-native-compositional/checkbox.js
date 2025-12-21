/**
 * Created by James on 04/08/2014.
 */

const jsgui = require('../../../../../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;
var group = jsgui.group;


var fields = {
    'name': String,
    'text': String,
    'value': String,
    'checked': Boolean
};
// Want better way(s) to hook up fields like this in controls / data objects.

// Data objects should probably be able to handle fields.
//   Though rendering should also render these fields as their own specific attribute data-jsgui-fields



class Checkbox extends Control {
    constructor(spec, add, make) {

        super(spec);
        this.__type_name = 'checkbox';

        this.add_class('checkbox');
        const context = this.context;
        const has_checked = is_defined(spec.checked);
        const initial_checked = has_checked ? !!spec.checked : false;
        this.checked = initial_checked;

        if (!spec.abstract && !spec.el) {
            const name = this.name;

            // Will need to render its ID in the DOM.

            const html_check = new Control({
                'context': context
            });

            html_check.dom.tagName = 'input';
            html_check.dom.attributes.type = 'checkbox';
            html_check.dom.attributes.name = name;
            html_check.dom.attributes.id = html_check._id();
            if (has_checked && initial_checked) {
                html_check.dom.attributes.checked = 'checked';
            }
            html_check.dom.attributes['aria-checked'] = initial_checked ? 'true' : 'false';

            //html_check.set('dom.tagName', 'input');
            //html_check.set('dom.attributes.type', 'checkbox');
            //html_check.set('dom.attributes.name', name);
            //html_check.set('dom.attributes.id', html_radio._id());

            var html_label = new Control({
                'context': context,
                
            });
            html_label.dom.tagName = 'label';

            if (is_defined(spec.text)) {
                html_label.add(spec.text);
            } else {
                if (is_defined(spec.label?.text)) html_label.add(spec.label.text);
            }
            

            //html_label.set('dom.tagName', 'label');
            //console.log('that._', that._);


            //var text_value = this.get('text').value();

            
            html_label.dom.attributes.for = html_check._id();
            //html_label.set('dom.attributes.for', html_check._id());

            this.add(html_check);
            this.add(html_label);



            //this.set('check', html_check);
            //this.set('label', html_label);


            //html_radio.set('dom.attributes.type', 'radio');

            this._ctrl_fields = this._ctrl_fields || {};

			this._ctrl_fields.check = html_check;
            this._ctrl_fields.label = html_label;

            // ._fields perhaps....
            
            /*
            this.set('dom.attributes.data-jsgui-fields', stringify({
                'value': this.value
            }).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));

            */ 

            this._fields = this._fields || {};

            if (is_defined(this.value)) this._fields.value = this.value;
            if (has_checked) this._fields.checked = this.checked;
            this.set_checked(initial_checked);


        }

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

        const html_check = this.check || (this._ctrl_fields && this._ctrl_fields.check);
        if (html_check) {
            html_check.dom.attributes['aria-checked'] = next_checked ? 'true' : 'false';
            if (next_checked) {
                html_check.dom.attributes.checked = 'checked';
            } else {
                html_check.dom.attributes.checked = '';
            }
            if (html_check.dom.el) {
                html_check.dom.el.checked = next_checked;
            }
        }
    }

    /**
     * Get the checked state.
     * @returns {boolean}
     */
    get_checked() {
        return !!this.checked;
    }
    //'resizable': function() {
    //},
    'activate'() {

        if (!this.__active) {
            super.activate();

            var html_check = this.check || (this._ctrl_fields && this._ctrl_fields.check);
            if (!html_check || !html_check.dom || !html_check.dom.el) {
                return;
            }
            var el_checkbox = html_check.dom.el;
            //var that = this;

            //var el = this.dom.el;
            //

            // No, refer specifically to the radio button element's control.

            // Changes upon becoming checked?
            html_check.on('change', () => {
                const checked = !!el_checkbox.checked;
                this.set_checked(checked);
                this.raise('change', {
                    name: 'checked',
                    value: checked
                });

                // But have it updated in the data model...?

                // Specification of the data model and the view model as a pair and have the system work out how to sync them properly.
                //   Define the data, define how the data model can vary, define how those variations can be displayed.
                //     Then use that to create the view model, use that to create the view.

            });

            // Need to listen for DOM change events. That will chage the value.
            //  The checked value true or false.

        }
        //

    }
};

Checkbox.css = `
.checkbox input + label {
    margin-left: 6px;
}
.checkbox input:focus-visible + label {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
`

module.exports = Checkbox;
