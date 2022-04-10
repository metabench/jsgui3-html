

const jsgui = require('./../../../../html-core/html-core');
var Toggle_Button = require('./toggle-button');
//if (typeof define !== 'function') { var define = require('amdefine')(module) }

//define(["../../jsgui-html", "./toggle-button"],
//function(jsgui, Toggle_Button) {

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

class Plus_Minus_Toggle_Button extends Toggle_Button {

    //  and can have other fields possibly.

    constructor(spec, add, make) {

        // Set it so it only has two states
        //  '+' and '-'
        spec.__type_name = 'plus_minus_toggle_button';
        spec.states = ['+', '-'];
        spec.state = spec.state || '-';

        //console.log('spec.context', spec.context);

        super(spec);
        let state = this.state = spec.state;

        // Set should return the object it sets it as. Possibly a Data_Object.

        //console.log('state', state);
        //if (spec_state) {
        //if (spec_state == 'expanded' || spec_state == 'contracted') {
        //state = this.set('state', spec_state);
        //} else {
        //	throw 'spec.state expects "expanded" or "contracted".';
        //}
        //} else {
        //state = this.set('state', 'expanded');
        //}

        // Then render the text content itself.

		/*
		 var t_state = tof(state);
		 //console.log('t_state', t_state);
		 //throw 'stop';
		 if (t_state == 'string') {
		 //console.log('state', state);
		 //throw 'stop';
		 this.add(state);
		 };
		 */

    }
};
//return Plus_Minus_Toggle_Button;

//return jsgui;


//});

module.exports = Plus_Minus_Toggle_Button;
