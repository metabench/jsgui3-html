/*
 if (typeof define !== 'function') { var define = require('amdefine')(module) }

 define(["../../jsgui-html"],
 function(jsgui) {
 */

var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

// The basic controls should not do too much on top of normal HTML, but make it easier to do a few things
//  there.

var fields = [
    ['value', String],
    ['type', String]
];

class Text_Input extends Control {
    // is an Input element.
    //  type of either text or password.
    // could possibly specify some of the starting field values in this part.

    constructor(spec) {
        //this._super(spec, fields);
        super(spec, fields);

        if (spec.placeholder) this.placeholder = spec.placeholder;

        // listen for a change in the value of the text field, in the DOM.
        //  and when that changes, the value changes.
        //this.set('dom.tagName', 'input');

        if (!spec.el) {
            this.compose_text_input();
        }
        // This should render as an input field.
    }
    compose_text_input() {
        this.dom.tagName = 'input';

        //console.log('dom.tagName ' + this.get('dom.tagName'));

        // maybe dom should be able to have a variety of attributes,
        //  or could actually specify what is valid in HTML.
        //  Would prefer to specify the HTML so that better html editors could be made... select the
        //   input type from a drop-down menu. Smaller builds may not have these.

        //this.set('dom.attributes.type', 'input');
        this.dom.attributes.type = 'input';
        this.dom.attributes.value = this.value;

        if (this.placeholder) this.dom.attributes.placeholder = this.placeholder;

        //this._ctrl_fields = this._ctrl_fields || {};
        //this._ctrl_fields.
    }

    /*
    get value() {

    }
    */
}
module.exports = Text_Input;

//return Text_Input;
//});