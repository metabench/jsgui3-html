/*
    Basically an 'select' element with options, rendering would be swappable though.


*/

// A Select_Options control could help more first....
//   And could progressively enhance that too.
//   So falling back on the non-enhanced control by default will help, it brings the app further towards
//     not requiring client-side JS.






const jsgui = require('../../../../../html-core/html-core');
const each = jsgui.each;
const tof = jsgui.tof;
const Control = jsgui.Control;
//const Tree_Node = require('./tree-node');

// Then use a swap to change the controls when it's in place.

/*
    <select> <option value="American">American flamingo</option> <option value="Andean">Andean flamingo</option> <option value="Chilean">Chilean flamingo</option> <option value="Greater">Greater flamingo</option> <option value="James's">James's flamingo</option> <option value="Lesser">Lesser flamingo</option> </select>

    Read more: https://html.com/tags/select/#ixzz5NXFlnCLS
*/

// Different states - open, closed


// This will do more than just wrap the HTML control(s)
//  Maybe work on the combo-box control.

// Likely could be enhanced a lot, removed, or replaced.
//  Does minimal wrapping of html options list (it seems).
//  Could do with popup iplementation.


// Maybe could make good use of the mx_display_modes.


// Could render as a select / options box by default.
//   Though could use progressive enhancement to replace it.
//     Could even do some CSS hack(s) to make open/closed state not require client-side JS.

// Basically select option control.
//   Maybe retire this for the moment.
//     Or make it with a dropdown mixin and a list.


// Worth making the control that encapsulates the bare HTML input option select.
//   The 'select' and 'option' elements system.

// Just make jsgui.select perhaps????
//   Some enhancement around that?

// Select_Options ?????

// Select_Options_Dropdown_List perhaps???

// Then an Options_List could do more progressive enhancement.
//   See about making better idioms for 'progressively enhanced' versions.
//     So have the basic control there, have code for it, that code would support client-side things, but it gets swapped for
//       a more advanced control???

// Want to be able to easily express both the basic HTML, as well as the enchanced versions.


// Grid does seem like it needs more work when it comes to separating the data and the presentation.
//   Want it to be powerful and flexible in this regard.

// Perhaps this could use a select options and replace it upon activation using JS?



//  Different types of controls / control modes.
//    HTML Native, JSGUI Composed.
//    So a dropdown menu could use the HTML select element, or could be composed of other controls.
//    Maybe just 'native' and 'composed'.
//      Or 'complex'? 'built'?

// Native controls could still have other native controls within them - like options in a select.

// And controls operating in either native or composed mode?
//   Not right now.





class Dropdown_List extends Control {
    constructor(spec) {
        super(spec);
        // and the options...
        //  an array of options.
        this.options = spec.options;
        // Compose functions look like they would be helpful again.

        // if it was called through activation?

        if (!spec.skip_compose) this.compose();
    }
    compose() {
        let context = this.context;

        // Make this more versitile, while also supporting a very intuitive high-level API.
        //   Such as being able to provide it options from a model or part of one to select from.
        



        each(this.spec.options, option => {
            // Option could just be a string, a number or [number, string]

            let t = tof(option);
            let ctrl_option = new jsgui.option({
                context: context
            });
            if (t === 'string') {
                ctrl_option.dom.attributes.value = option;
                ctrl_option.add(new jsgui.textNode('option'));
            }

        });
    }
}

module.exports = Dropdown_List;