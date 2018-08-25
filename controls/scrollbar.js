/**
 * Created by James on 28/02/2016.
 */


var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;
var Button = require('./button');

// Scroll_View
//  Being a Control that has both scrollbars optionally
//   Also left for RTL languages?
//   Also possibility of scrollbar on top?
//    Never used that way.

class Scrollbar extends Control {

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
        this.__type_name = 'scrollbar';

        // Always active?

        this.active();
        var that = this;
        var context = this.context;

        if (!spec.abstract && !spec.el) {
            this.add_class('scrollbar');
            var btn_negitive = new Button({
                'context': context
            });
            var scroll_area = new Control({
                'context': context
            });
            var draggable_scroller = new Control({
                'context': context
            });
            var btn_positive = new Button({
                'context': context
            });
            this.add(btn_negitive);
            scroll_area.add(draggable_scroller);
            this.add(scroll_area);
            this.add(btn_positive);
        }

    }
    'activate'() {

        if (!this.__active) {
            super.activate();
            var that = this;

        }
    }
}

class Horizontal_Scrollbar extends Scrollbar {
    constructor(spec) {
        super(spec);
        this.__direction = 'horizontal';
        
    }
}

class Vertical_Scrollbar extends Scrollbar {
    constructor(spec) {
        super(spec);
        this.__direction = 'vertical';
        
    }
}

Scrollbar.H = Scrollbar.Horizontal = Horizontal_Scrollbar;
Scrollbar.V = Scrollbar.Vertical = Vertical_Scrollbar;

module.exports = Scrollbar;
