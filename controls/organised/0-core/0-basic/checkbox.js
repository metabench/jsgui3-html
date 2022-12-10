/**
 * Created by James on 04/08/2014.
 */

const jsgui = require('./../../../../html-core/html-core');
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

class Checkbox extends Control {
    constructor(spec, add, make) {


        super(spec);

        this.__type_name = 'checkbox';

        this.add_class('checkbox');
        var context = this.context;

        if (!spec.abstract && !spec.el) {

            var name = this.name;

            // Will need to render its ID in the DOM.

            var html_check = new Control({
                'context': context
            });

            html_check.set('dom.tagName', 'input');
            html_check.set('dom.attributes.type', 'checkbox');
            html_check.set('dom.attributes.name', name);
            html_check.set('dom.attributes.id', html_radio._id());

            var html_label = new Control({
                'context': context
            });

            html_label.set('dom.tagName', 'label');
            //console.log('that._', that._);

            var text_value = this.get('text').value();

            if (is_defined(text_value)) {
                html_label.add(text_value);
            }
            html_label.set('dom.attributes.for', html_check._id());

            this.add(html_check);
            this.add(html_label);
            this.set('check', html_check);
            this.set('label', html_label);
            //html_radio.set('dom.attributes.type', 'radio');

            this.set('dom.attributes.data-jsgui-fields', stringify({
                'value': this.get('value')
            }).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));


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
            radio.on('change', e_change => {
                //console.log('el_radio.checked', el_radio.checked);

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

module.exports = Checkbox;