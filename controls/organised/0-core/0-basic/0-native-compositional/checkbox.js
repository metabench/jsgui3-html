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


        }

    }
    //'resizable': function() {
    //},
    'activate'() {

        if (!this.__active) {
            super.activate();

            var html_check = this.check;
            var el_checkbox = html_check.dom.el;//???
            var label = this.label;
            //var that = this;

            //var el = this.dom.el;
            //

            // No, refer specifically to the radio button element's control.

            // Changes upon becoming checked?
            html_check.on('change', e_change => {
                //console.log('el_radio.checked', el_radio.checked);

                // Track the old values here? Could help the 'change' event.

                //if (el_radio.checked) {
                    this.raise('change', {
                        name: 'checked',
                        value: el_checkbox.checked
                    });
                //}
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
`

module.exports = Checkbox;