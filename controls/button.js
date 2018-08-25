var jsgui = require('../html-core/html-core');
var Control = jsgui.Control;
const fast_touch_click = require('../control_mixins/fast-touch-click');

class Button extends Control {
    constructor(spec, add, make) {
        // Wont fields have been set?
        //spec['class'] = spec['class'] || 'button';
        spec.__type_name = spec.__type_name || 'button';
        super(spec);
        var that = this;
        
        this.add_class('button');
        //this.add_class('button');
        // Want to have a system of accessing icons.
        //  Will be possible to do using a Postgres website db resource
        //   First want it working from disk though.

        // A way not to add the text like this to start with?
        //  Or just don't inherit from a button in some cases when we don't want this?

        if (spec.text || spec.label) {
            this.text = spec.text || spec.label;
        }

        //  || spec.no_compose === true
        if (!spec.el) {
            //if (!this._abstract) {}
            this.compose_button();
        }
    }
    'compose_button'() {
        if (this.text) {
            //console.log('pre add text to button', this.text);
            this.add(this.text);
        }
    }
    'activate'() {
        super.activate();

        // seems like a mixin.
        //  activation mixin...

        // Do this by default on touch.


        //fast_touch_click(this);

        /*


        // Disabling should disable events.
        //  Maybe not all of them.


        



        // Respond to touch events.

        // generally want a 'press' event too.
        //  Could be a click, or a touch press.

        // Could raise a press or click event.
        //  Press could cover click and touch.
        //  Click could specifically be a mouse event to make least confusion / ambiguity long term.

        // Could have an emulate_clicks option.

        let has_moved_away = false;

        this.on('touchstart', ets => {
            //console.log('ets', ets);
            // Then cancel the event.

            //console.log('Object.keys(ets)', Object.keys(ets));

            // Returning false from such a DOM event should cancel the event propagation.

            ets.preventDefault();
            //return false;
        })
        this.on('touchend', ete => {
            //console.log('ete', ete);

            if (!has_moved_away) {
                this.raise('click', ete);
            }
            has_moved_away = false;
        })
        this.on('touchmove', etm => {
            has_moved_away = true;
            //console.log('etm', etm);
        })
        */


    }
}
module.exports = Button;