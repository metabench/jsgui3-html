const jsgui = require('../html-core/html-core');
const Control = jsgui.Control;
const def = jsgui.is_defined;
const Arrow_Button = require('./arrow-button');
const Item_Selector = require('./item-selector');
/*

    Encapsulates an array with a range of possible values.
    // Maybe a number of years.

    // Basically just chooses an index within the array, and can get a value for the item in the array too.

    // Could be used for picking a year, or months within a year.

    // Events responding to the UI events and changes there.
    //  Does its internal processing, raises external event when event occurs.

    // Tile_Slide_Panel could be useful here, and with Month_View
    //  With Month_View, would have entire month views rendered already for previous and next months.

    // Possibility of Tile_Slide_Panel being something that would hack into another control?

    // Want it so that a control can be wrapped automatically in a Title_Slide_Panel, so adjacent controls also get constructed.

    // Still want the Month_View to be fairly simple.
    //  Month_View is a place where its worth implementing Tile_Slide or Tile_Slide_Panel.

    // This will be good for choosing months and years.

    // Will be able to operate with tile sliding too.
    //  Tile sliding on mobile especially.


    // Could use Tile_Slider with next and previous.


    // Could tile slide towards a control that shows the month name


    // Having a very nice month selector with arrows
    // Then also a very nice year selector
    
    //  These could be micro Controls.
    //   Worth making into a Control, a grouping of controls.



    //   such as a year picker
    //    all it does is allow picking of a year in a user friendly way. Won't be very obvious, but will be a component of Date_Picker.
    // ./micro-date


    Arrow
    [Box with value] - Something like a Select box
    // 

    Item_Selector
     // Can deal with previous and next
     //  Directional sliding
     //  Choose the direction
     //   Are all items rendered to begin with?
     //    Less than 100 then this would work nicely.
     //   Optional delayed_item_rendering
     //    Those in view
     //     Those that may be brought into the view soon.
     //   Could have a buffer of active / live controls.

     // Possibly Item_Selector could be enabled to set up Tile_Slider based on internal controls, and functional involkation of them

    Arrow


*/

// Item_Selector interface?
//  By passing on Item_Selector 
class Left_Right_Arrows_Selector extends Control {
    constructor (spec) {

        //console.log('');
        //console.log('Left_Right_Arrows_Selector spec', spec);

        spec.__type_name = spec.__type_name || 'left_right_arrows_selector';
        super(spec);
        this.add_class('left-right');
        this.add_class('arrows-selector');

        if (spec.items) {
            this.items = spec.items;
        }
        if (def(spec.item_index)) {
            this.item_index = spec.item_index;
        }
        if (def(spec.loop)) {
            this.loop = spec.loop;
        }
        if (!spec.el) {
            this.compose_lras();
        }
    }
    compose_lras() {

        // left, item, right
        let context = this.context;
        let left_arrow = new Arrow_Button({
            context: context,
            direction: 'left'
        });

        let is_spec = {
            context: context
        }
        if (this.items) is_spec.items = this.items; 
        if (this.item_index) is_spec.item_index = this.item_index;
        if (this.loop) is_spec.loop = this.loop; 

        let item_selector = new Item_Selector(is_spec);

        let right_arrow = new Arrow_Button({
            context: context,
            direction: 'right'
        });

        this.add(left_arrow);
        this.add(item_selector);
        this.add(right_arrow);

        this._fields = this._fields || {};
        if (this.items) this._fields.items = this.items;
        if (def(this.item_index)) this._fields.item_index = this.item_index;
        if (def(this.loop)) this._fields.loop = this.loop;

        this._ctrl_fields = {
            left_arrow: left_arrow,
            item_selector: item_selector,
            right_arrow: right_arrow
        }
    }

    previous(raise_event = true) {
        this.item_selector.previous(raise_event);

    }
    next(raise_event = true) {
        this.item_selector.next(raise_event);
    }
    activate() {
        if (!this.__active) {
            super.activate();
            // Automatically disable arrow if we reach the first while not in loop mode.



            //console.log('Activate Left_Right_Arrows_Selector');
            let {left_arrow, item_selector, right_arrow} = this;

            left_arrow.on('click', e_click => {
                //console.log('left_arrow e_click',e_click);
                this.previous();
            });
            item_selector.on('change', e_change => {
                //console.log('item_selector e_change', e_change);

                if (!this.loop) {
                    if (e_change.first) {
                        left_arrow.disabled = true;
                    } else {
                        left_arrow.disabled = false;
                    }
                    if (e_change.last) {
                        right_arrow.disabled = true;
                    } else {
                        right_arrow.disabled = false;
                    }
                }
                this.raise('change', e_change);
            });
            right_arrow.on('click', e_click => {
                //console.log('right_arrow e_click',e_click);
                this.next();
            });

            if (this.loop) {
                item_selector.on('loop', loop_direction => {
                    //console.log('loop_direction', loop_direction);
                    this.raise('loop', loop_direction);
                })
            }
        }
    }
}


// Needs to select from an array of items.
//  Can loop (optional)

// Internally can use a tile_slide


module.exports = Left_Right_Arrows_Selector;

