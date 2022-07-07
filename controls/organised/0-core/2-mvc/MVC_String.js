
const jsgui = require('./../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

// The basic controls should not do too much on top of normal HTML, but make it easier to do a few things
//  there.

const {prop, field} = require('obext');

/*
var fields = [
    ['value', String],
    ['type', String]
];
*/


// A synonym / alias property would help a lot.

// Fairly simple wrapping around DOM.


// Say this is a 'basic' control?
//  Or an HTML control?
//   So we have the controls that wrap HTML.
//   Or markup, elements, svg, nodes etc. 


// Want to keep internal text property / value property synced with the dom.
// Getter is most important for this input.

// More like a text input view in the future.
//   Will make somewhat more advanced (but still basic) string editor.
//   The main / default view will use a Text_Input.
//     Number editor will use and / or extend it in some ways.

// String_Editor will use the new model, view-model system.




// Could this be defined much more concisely?
//   Make it clear that this is a DOM_Element_Control? Or A Dom_Element_View (within a Control)?
//     How the value in the view corresponds to the value in the model?
//       Though this control does not have .model at the moment.
//         Could somehow automatically bind the value in the view itself with the value in the model?




// String_Value_Model object? String_Model? Model_String?

// String_View or View_String as well.
//   Want different possible views as well.
//   Want to be able to make alternate views.
//     Want to be able to easily specify which view(s).
//       Sensible defaults, easy to use alternatives.

// Be able to place limits such as maximum length.

// MVControl maybe???



// Extends MVControl even?
//  MVC or MV Mixin...


class MVC_String extends Control { 

    constructor(spec = {}) {
        super(spec);

        // Use the MVC mixin.
        //  Somewhere: say that the model is for type 'string'.

        // Then the view - may be able to make the interface into 2 functions
        //   update the model with the data in the element in the view
        //   update the data in the element in the view from the model


    }



}

module.exports = MVC_String;