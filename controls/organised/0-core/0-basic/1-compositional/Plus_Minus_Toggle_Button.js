

const jsgui = require('../../../../../html-core/html-core');
var Toggle_Button = require('./Toggle_Button');
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

    }
};
//return Plus_Minus_Toggle_Button;

//return jsgui;


//});

module.exports = Plus_Minus_Toggle_Button;
