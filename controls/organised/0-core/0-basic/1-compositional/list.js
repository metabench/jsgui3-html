/*
 if (typeof define !== 'function') { var define = require('amdefine')(module) }

 define(["../../jsgui-html", "./item"],
 function(jsgui, Item) {
 */

const jsgui = require('../../../../../html-core/html-core');
//var Item = require('./old/item');

const Item = require('./item');


// Maybe integrate obext into lang-tools? Or some of it into lang-mini (eventually).

const {each} = jsgui;

const {prop} = require('lang-tools');

var Control = jsgui.Control;
var Collection = jsgui.Collection;

// Could be folded. Could show all items.
//  Could show just a view of a range of items in the list.

// will have a context menu by default

// Swaps will be useful here.

const mx_selectable = require('../../../../../control_mixins/selectable');

// could use a mixin for active-data
//  it would call an add function.

// or raise an event called 'next'.
//  .listen(obs)
//  .observe(obs)

// Do more programming for UI components observing observables.

// SSR will still produce nice looking lists even when not activated. Unlike Date_Picker when it comes to progressive enhancement?
//   Or even with a full Date_Picker when there is no client-side JS, it could fully render the proper Date_Picker on the server,
//     and then send it back to the client having processed a click.
//   So it could run like old-fashioned websites did with no client-side JS, still have a fancy/specifically styled UI date picker.
//     Could have some system where there are various attributes in the querystring or request body so that the server knows params from the client
//       Like ASP.NET was, slightly.








// This needs to be flexible.
//  May be useful to have a .subscribe or .observe function to listen to an observable.
//   Then create items out of the data that gets produced.
//   Would need to focus on client-side observables.
// Want to be able to give it an array or observable, or object, it renders it.
//  But needs to work with resources and objects that interact with server data.

// May be worth being able to use this in a Radio_Button_Group....
//   Different possible internal implementations of controls such as List.
//   By default will use the HTML ul, could use ol


// Likely to want different ways that lists can be rendered.

// Needs to be able to respond to the list changing from outside of the Control.
// Could be a list of controls. Possibly using the List class will help make some things clearer, like a list of items on a menu.

// 




class List extends Control {

    // Items collection as a field?
    //  This would have control content items.
    //  It would / may also have a Collection of items.
    //  It would get given its items as JSON / a JS object / array, and then would create the content Controls.

    // Want it to be easy to create a list, give it the data or the data source.

    /*
     'fields': [
     //['text', String]
     ['toggle_button', Control],
     ['inner_control', Control],
     ['expander', Control]
     ],
     */

    constructor(spec, add, make) {
        // Wont fields have been set?
        //console.log('init list');
        super(spec);
        var that = this;
        // Can take an image
        // Can take some text.
        //  That's all I'll have in the tree node for now.
        this.__type_name = 'list';
        //this.dom.attributes.class', 'list');

        // 'ordered' property. Want it to have change events raised.
        //   probably using 'prop'

        prop(this, 'ordered', spec.ordered || false);


        if (this.ordered) {
            this.dom.tagName = 'ol';
        } else {
            this.dom.tagName = 'ul';
        }

        
        this.add_class('list');

        // Should render as a ul.
        //   Could have some code that puts a 'li' around anything added that is not a 'li' (dom.tagName === 'li').


        // a Collection of items.
        // Collection not needing a Context?
        //  Having all Data_Objects and Collections require a context seems too much.
        //  Context seems important in the case of Controls.

        //this.items = new Collection();

        //this.set('items', coll_items);
        //console.log('spec.items', spec.items);
        //throw 'stop';

        // Could have items property and listen for item change events.
        //   Preferably that will work server-side too, adding and removing controls as necessary, and then on the client
        //     side those updates will then be updated in the DOM.



        const items = spec.items || [];
        prop(this, 'items', items);
        /*

        if (spec.items) {
            // is the type a Collection? An Array?

            //this.items.set(spec.items);
            this.items = spec.items;
        } else {
            this.items = new Collection();
        }
        */

        // The list spec could also take info about how to display the items.

        // And create a new item control for each item.
        //  I think an 'item' control could be quite useful. Shows some data.
        //   Won't be too big, but will be flexible in what it can do.

        // Will take some JSON, and render it using sensible defaults.
        //  Eg name first and in bold.
        //  Maybe key
        //

        // A general purpose item control will be quite useful.
        //  Item will be fairly general purpose, and much of the purpose of using it is to show intent rather than because of
        //  an 'item' doing particular things. It just is. It will be like a control, except it's generally used for rendering some particular data.
        // Want the Item and the List to be convenient UI components. They need to make it simple to represent some data.
        //  Items and Lists could potentially use templates to quickly render data.

        // Any need to send the list as a jsgui field?
        // listen for changes to the list. represent those changes in the UI controls. Then these get automatically changed in the DOM by other code.
        // This is where a Collection could help a lot.
        /*

        this.items.on('change', (evt_change) => {
            //console.log('evt_change', evt_change);
            if (evt_change.type === 'insert') {
                var ctrl_item = new Item({
                    'context': this.context,
                    'value': evt_change.item
                });

                this.add(ctrl_item);
            }
        });
        */
        // A system to share objects sent to the client by reference.
        //  Could tag an object to send to the client, assign it an id, and then only need to send it once.
        // A system of objects-to-client
        if (!spec.el) {
            //let ss = this.context.new_selection_scope(this);
            //console.log('ss', ss);
            this.compose_list();
        }
        // the selection scope could just be a number on the server.
    }

    'compose_list' () {


        each(this.items, (item, index) => {
            //console.log('item', item);


            // Make it a List_Item....?


            // Make it a 'li'.
            //  Maybe want more flexibility?
            //    Or take existing item specs, and add the context.

            // Being able to make controls without specifying the context will help.
            //   Have the context get set as soon as they are added inside another control which has a context.
            //     Can not rely on the IDs of the controls before they have a context.
            //       Maybe could / would need to tighten up some other code so it does not assume or need a context at some points.
            


            // Maybe a list-item control will be best.
            //   And could be very basic HTML.
            // May want a simple and quick to write way of specifying the inner controls.
            //   Could make it work specifically on controls that only have one inner section.

            




            var ctrl_item = new Item({
                'context': this.context,
                'value': item
            });

            ctrl_item._fields = ctrl_item._fields || {};
            ctrl_item._fields.index = index;
            
            //console.log('ctrl_item.selectable', ctrl_item.selectable);
            mx_selectable(ctrl_item);
            ctrl_item.selectable = true;

            this.add(ctrl_item);
        });
    }

    'activate' () {
        //console.log('');
        //console.log('activate list');
        if (!this.__active) {
            super.activate();

            each(this.$('item'), item => {
                item.selectable = true;
            })
            let ss = this.find_selection_scope();
            if (ss && ss.on) {
                //console.log('ss', ss);

                ss.on('change', e_change => {
                    //console.log('1) list ss e_change', e_change);

                    let item = e_change.value;
                    //console.log('item', item);

                    this.selected_index = item.index;

                    this.raise('change', {
                        'name': 'selection',
                        'value': item.index
                    })
                })
            }
        }

        // Could use delegated click events.
        //  Would save having to wire up each item.

        // The items themselves could be selectable.


        // put the context menu in place.
        //throw 'stop';

        // Not all lists need context menus.

        /*

        this.context_menu({
            'Delete': function() {
                console.log('context_menu Delete');

                // need to actually delete it if possible?

            },
            'Edit': function() {
                console.log('context_menu Edit');
                // need to actually delete it if possible?
            }
        });
        */

        // Need to listen for new items being added.
        //  (Changes being made)



    }
}
module.exports = List;
