/*
    May wind up as superclass of Combo_Box
    Maybe will have a massive amount of options and modes.

    For the moment, want this to handle a relatively small array of items.
*/

var jsgui = require('../html-core/html-core');

//function(jsgui, Plus_Minus_Toggle_Button, Vertical_Expander) {

var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;
const def = jsgui.is_defined;

const Item_View = require('./item-view');
const List = require('./list');

const mx_popup = require('../control_mixins/popup');

// Post construct compose and activate
//  Want to be able to run same code on client and server.
//  Want code to respond to list changes

// Definitely want a post compose and activate function.
//  Maybe would need to call it from the constructor.

// .setup?
//  .finalize?
//  .finish

// Respond to control changes...
//  Don't just want this on activation, as they are not DOM events, though many would originate there.




class Item_Selector extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'item_selector';
        super(spec);
        this.add_class('item-selector');
        // selected_index
        // Could have Object assignproperies done here
        //  use local variables as true private variables.
        if (spec.items) this.items = spec.items;
        if (spec.loop) this.loop = spec.loop;
        //console.log('spec.item_index', spec.item_index);
        if (def(spec.item_index)) {
            this.item_index = spec.item_index;
        } else {
            // Don't want to overwrite the item_index if we have set it up already.
            //  May need this pattern more.
            //  Maybe write more setting code.

            // this.copy_from(spec);
            if (!def(this.item_index)) {
                this.item_index = 0;
            }
        }
        // A loop option.
        if (!spec.el) {
            this.compose_item_selector();

            this.finish_item_selector();
        }
    }
    finish_item_selector() {
        this.item_list.on('change', e_change => {
            //console.log('item_list e_change', e_change);
            if (e_change.name === 'selection') {
                let selected_index = e_change.value;
                this.item_index = selected_index;
                this.current_item_view.item = this.items[selected_index];

                this.raise('change', {
                    'name': 'value',
                    'value': this.items[selected_index],
                    'index': selected_index
                });

                this.value = this.items[selected_index];



                setTimeout(() => {
                    this.item_list.hide();
                }, 120);
            }
        });
    }
    compose_item_selector() {
        // In combo mode normally.
        // current_item
        // item_list

        let current_item_view = this.current_item_view = new Item_View({
            context: this.context,
            item: this.items[this.item_index]
        });
        this.add(current_item_view);

        //console.log('compose_item_selector this.items', this.items);

        let item_list = this.item_list = new List({
            context: this.context,
            items: this.items
        });
        item_list.hide();
        item_list.add_class('item-selector'); // So styling works right in the popup layer.
        mx_popup(item_list);

        this.add(item_list);

        // Render all of the items in a list.
        //  Grid of some kind depending on if horizontal or vertical
        //  

        // Items hidden in a list, the rest of the items in the list hidden?
        //  Specific copy of the item that gets shown, also be able to show item list.

        // Just show it in a list anyway.

        // Go for both single item with neighbours on tiles.
        //  Also all items rendered in a list / sequence.

        // Item_List with direction: horizontal would work well.

        // Item_View
        //  And Tile_Slide processed item view.

        // Want a very simple Item_View that renders the string item as a span, in an item view control marked with classes in the DOM.
        //  Want Item_View with no expand/contract.
        // Depending on the type of items...?
        this._fields = this._fields || {};
        this._fields.item_index = this.item_index;
        this._fields.items = this.items;
        if (this.loop) this._fields.loop = this.loop;
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.current_item_view = current_item_view;
        this._ctrl_fields.item_list = item_list;
    }
    previous(raise_event = true) {
        //console.log('this.item_index', this.item_index);
        let o_change;
        if (this.item_index > 0) {
            this.item_index--;
            this.current_item_view.item = this.items[this.item_index];
            if (raise_event) {
                o_change = {
                    value: this.items[this.item_index],
                    index: this.item_index,
                    size: -1
                }
            }
        } else {
            if (this.loop) {
                this.item_index = this.items.length - 1;
                this.current_item_view.item = this.items[this.item_index];
                if (raise_event) {
                    this.raise('loop', -1);
                    o_change = {
                        value: this.items[this.item_index],
                        loop: -1,
                        index: this.item_index,
                        size: -1
                    }
                }

            }
        }
        if (o_change) {
            if (this.item_index === 0) {
                o_change.first = true;
            }
            if (this.item_index === this.items.length - 1) {
                o_change.last = true;
            }
            this.raise('change', o_change);
        }
    }
    next(raise_event = true) {
        //console.log('this.item_index', this.item_index);
        let old_index = this.item_index;
        let old = this.items[this.item_index];
        let o_change;
        if (this.item_index < this.items.length - 1) {
            this.item_index++;
            this.current_item_view.item = this.items[this.item_index];
            if (raise_event) {
                o_change = {
                    value: this.items[this.item_index],
                    index: this.item_index,
                    size: 1
                };
            }
        } else {
            if (this.loop) {
                this.item_index = 0;
                this.current_item_view.item = this.items[this.item_index];
                if (raise_event) {
                    this.raise('loop', 1);
                    o_change = {
                        value: this.items[this.item_index],
                        loop: 1,
                        index: this.item_index,
                        size: 1
                    };
                    //if (this.item_index === this.items.length - 1) {
                    //    o_change.first = true;
                    //}
                }
            }
        }
        if (o_change) {
            if (this.item_index === 0) {
                o_change.first = true;
            }
            if (this.item_index === this.items.length - 1) {
                o_change.last = true;
            }
            this.raise('change', o_change);
        }
        //console.log('this.items', this.items);
        // Then the item view needs to respond to the item change.
    }
    activate() {
        let ctrl = this;
        if (!this.__active) {
            super.activate();



            let item_list = this.item_list;
            mx_popup(item_list);
            // touchstart - bring up the list

            let has_moved_away = false;
            let t = false;

            /*
            this.item_list.on('change', e_change => {
                console.log('item_list e_change', e_change);
            })
            */

            this.on('touchstart', ets => {
                //console.log('ets', ets);
                // Then cancel the event.
                t = true;

                item_list.popup();

                //console.log('Object.keys(ets)', Object.keys(ets));
                // Returning false from such a DOM event should cancel the event propagation.

                ets.preventDefault();
                //return false;
            })
            this.on('touchend', ete => {
                //console.log('ete', ete);

                if (!has_moved_away) {
                    //this.raise('click', ete);
                }
                has_moved_away = false;
                item_list.hide();
            })
            this.on('touchmove', etm => {
                has_moved_away = true;
                //console.log('etm', etm);
            });
            this.on('click', ec => {
                //item_list.show();

                if (!t) {
                    let replace = item_list.popup();
                    // Event propagation has stopped? :(

                    // then click elsewhere...

                    // best done with body event (delegation)

                    let body = this.context.map_controls['body_0'];

                    let body_click_handler = (e_click) => {
                        //console.log('e_click', e_click);

                        let target_ctrl = this.context.map_controls[e_click.target.getAttribute('data-jsgui-id')];
                        //console.log('target_ctrl', target_ctrl);

                        //let anc = item_list.ancestor(e_click.ctrl);
                        let anc = target_ctrl.ancestor(item_list);
                        //console.log('anc', anc);

                        if (anc) {
                            // Select that item.


                        } else {
                            body.off('click', body_click_handler);
                            replace();
                        }


                    }
                    setTimeout(() => {
                        body.on('click', body_click_handler);
                    }, 0);
                }





            });



            this.finish_item_selector();

        }
    }
}

module.exports = Item_Selector;