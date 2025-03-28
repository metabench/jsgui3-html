/**
 * Created by James on 29/02/2016.
 */

const jsgui = require('../../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;
var Scrollbar = require('./scrollbar');
var H_Scrollbar = Scrollbar.H, V_Scrollbar = Scrollbar.V;

// Scroll_View
//  Being a Control that has both scrollbars optionally
//   Also left for RTL languages?
//   Also possibility of scrollbar on top?
//    Never used that way.

class Scroll_View extends Control {

    // Though maybe tell it to be an array and it should be an array rather than a collection?
    //  Or a Data_Value that holds an array?

    //'fields': [
    //    ['text', String],
    //    ['state', String],
    //    ['states', Array]
    //],
    //  and can have other fields possibly.

    constructor(spec, add, make) {

        super(spec);
        this.__type_name = 'toggle_button';
        this.add_class('scrollbar');

        // Always active?

        if (!spec.abstract && !spec.el) {

            // Compose the different sections.
            //  Grid9 would be a useful abstraction here.
            //  Will not use it right now. Grid_9 currently makes DOM interactions and it would be better if it used the right JSGUI abstractions.


            // So, in composition we need to know which scrollbars are showing.

            // show_h_scrollbar, show_v_scrollbar

            // Need to have up to three components rendered
            //  2 scrollbars, inner view


            // For the moment we will have thw tro scrollbars rendered not optionally.

            // Need to be aware of the widths of the various scrollbars.

            var inner_view = new Control({
                'context': this.context
            });
            var h_scrollbar = new H_Scrollbar({
                'context': this.context
            });
            var v_scrollbar = new V_Scrollbar({
                'context': this.context
            });

            this.add(inner_view);
            this.add(h_scrollbar);
            this.add(v_scrollbar);
            this.active();
        }
        var that = this;
    }
    'activate'() {
        if (!this.__active) {
            super.activate();
            var that = this;
        }
    }
}

module.exports = Scroll_View;
