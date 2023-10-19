/*
    Basically an 'select' element with options, rendering would be swappable though.


*/

const jsgui = require('./../../../../html-core/html-core');
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