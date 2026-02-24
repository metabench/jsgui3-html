/**
 * Created by James on 04/08/2014.
 */

/*

 if (typeof define !== 'function') { var define = require('amdefine')(module) }


 // Also want to make an MDI window system (Multiple Document Interface)

 define(["../../jsgui-html", "./horizontal-menu"],
 function(jsgui, Horizontal_Menu) {
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
    

    class Radio_Button_Tab extends Control {
        constructor(spec, add, make) {
    
    
            super(spec);
    
            this.__type_name = 'radio_button';
    
            this.add_class('radio-button');
            var context = this.context;
            //var that = this;
    
            // A different way of raising change events?
            //  .on('change') often translates to the dom el's onchange.
    
            // Want a way to refer to the event for the Control itself, not adding a DOM listener.
            //  (..., false) seems OK.
    
    
    
            if (spec.group_name) this.group_name = spec.group_name;
            if (spec.text) this.text = spec.text;
            if (spec.label) this.text = spec.label;
    
            //console.log('spec.el', spec.el);
    
            // No, make this contain an input element and a label element
    
            if (!spec.abstract && !spec.el) {
    
                var name = this.group_name;
    
                // Will need to render its ID in the DOM.
    
                var html_radio = new Control({
                    context
                });
                {
                    const {dom} = html_radio;
                    dom.tagName = 'input';
                    const {attributes} = dom;
                    attributes.type = 'radio';
    
                    attributes.name = name;
    
    
                    attributes.id = html_radio._id();
    
                }
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
    
                this.add(html_radio);
                this.add(html_label);
                
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
    
        }
        //'resizable': function() {
        //},
        'activate'() {
            // May need to register Flexiboard in some way on the client.
    
    
            if (!this.__active) {
                super.activate();
    
                var radio = this.radio;
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
    
                // Need to listen for DOM change events. That will chage the value.
                //  The checked value true or false.
    
    
    
            }
    
    
    
            //
    
        }
    };
    
    module.exports = Radio_Button_Tab;
    /*
     return Panel;
     }
     );
     */
    