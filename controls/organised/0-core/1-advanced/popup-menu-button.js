
var jsgui = require('./../../../../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
//var Control = jsgui.Control;

var Button = require('../0-basic/0-native-compositional/button');
var Item = require('../0-basic/1-compositional/item');
var Collection = jsgui.Collection;
var Data_Value = jsgui.Data_Value;

// Titled_Panel would be useful.
//  Would extend the panel, and also show it's name or title.

// Want to keep panel simple. Could have Titled_Panel, maybe Resizable_Panel.
//  If we want a panel with a lot of functionality, it would be the Flexi_Panel.


// A 'platform' control.
//  Not basic. Will still have its own file for the moment.


// limited states feature.
//  can oble be one of a few.
//  may as well give as an array or list in many cases.


class Popup_Menu_Button extends Button {
    // panel name?

    // could have a title field.
    //'fields': {
    //    'name': String
    //}
    // maybe add before make would be better. add will probably be used more.
    constructor(spec, add, make) {
        spec.no_compose = true;
        spec['class'] = 'popup-menu-button';
        super(spec);
        this.__type_name = 'popup_menu_button';
        //this.add_class('panel');
        //console.log('pre add class');
        //console.log('1) this.dom.attrs', this.dom.attrs);
        //this.add_class('popup-menu-button');
        //console.log('2) this.dom.attrs', this.dom.attrs);
        // Should set the class in the DOM if its not set already.

        var context = this.context;
        // that = this;
        // With name as a field, that field should get sent to the client...

        // Then will have the hidden menu that appears when the popup menu button is clicked.

        // Has a list/collection of items.

        // Use Stateful mixin?

        // Mixins may be a bit tricky in terms of adding both composition and activation stages.
        //  Mixins would need to be loaded in order, and applied with care.
        //  ._mixin_compose
        //  ._mixin_activate
        //  ._arr_mixin_names

        //  These two would also need to be made as properties of the Control, so that they can be added to by the mixins.
        //  ._active_fields
        //  ._ctrl_fields


        

        var setup_mixins = function () {
            this.mixin(
                ['open_closed', 'closed'],
                ['item_container']
            )
        }


        // Update this!
        this.states = ['closed', 'open'];
        this.state = new Data_Value('closed');
        this.i_state = 0;

        var active_fields = this.active_fields = {};
        active_fields.states = this.states;
        active_fields.state = this.state;
        active_fields.i_state = this.i_state;

        var compose = () => {
            this.text = spec.text || spec.label || '';
            var root_menu_item = new Item({
                'context': context,
                'item': this.text
            });
            root_menu_item.add_class('popup-menu');

            // Create an inner container for the popup menu items
            var inner_container = new jsgui.Control({
                'context': context
            });
            inner_container.add_class('popup-menu-inner');
            inner_container.add_class('popup-menu');

            this.add(root_menu_item);
            this.add(inner_container);
            this.root_menu_item = root_menu_item;
            this._inner_container = inner_container;

            // Then the inner part / the part that is hidden within the root node.
            // Show / hide the hidden area based on click or hover.

            if (spec.items) {
                //console.log('spec.items', spec.items);
                let items = this.items = new Collection(spec.items);
                //console.log('this.items', this.items);
                each(items, item => {
                    //console.log('item', item);

                    var menu_item = new Item({
                        'context': context,
                        'item': item
                    });
                    menu_item.add_class('popup-menu');
                    inner_container.add(menu_item);

                    // Then add a callback event, if we have that.
                    //  Post-activation I suppose.

                });
            };

            var ctrl_fields = {
                'root_menu_item': root_menu_item._id()
            }

            //this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
            this.dom.attrs['data-jsgui-fields'] = stringify(active_fields).replace(/"/g, "'");
            this.dom.attrs['data-jsgui-ctrl-fields'] = stringify(ctrl_fields).replace(/"/g, "'");
        }

        if (!spec.abstract && !spec.el) {
            // Render the menu itself as a bunch of items / an item tree.
            // Create the top level menu item.
            compose();
        }

        if (spec.el) {
            // A different type of constructor usage. Most likely client-side / within a web browser.
            // The element could be empty.
            //  If so, we need to carry out the compose stage.
            compose();
            // Needs to reflect changes within itself to the DOM.
            //  Possibly this is where react could come in.

            // It does not have a rendering phase at the moment when it's not being rendered on the server.
            //  Want small and to-the-point client-side rendering.

        }
    }
    //'resizable': function() {
    //},
    'activate'() {
        if (!this.__active) {
            super.activate();

            // Activating should set the CSS class of the node if necessary.

            var root_menu_item = this.root_menu_item;
            var inner_container = this._inner_container;

            //console.log('Popup_Menu_Button activate');
            // Need references?
            //var that = this;

            //console.log('this.root_menu_item', this.root_menu_item);

            // Respond to clicks / selects of the inner menu items.
            // All the descendent items need to have events.
            //  Want to have it so that the event handler can be called directly when that item is clicked.

            // Want to set up the onclicks in the construction / composition.



            //console.log('root_menu_item', root_menu_item);

            // And pop out of body too?
            //  Could leave a placeholder / comment in place of where the element used to be.
            //  Then swap them to go back.

            this.state.on('change', (e_change) => {
                //console.log('Popup_Menu_Button state change', e_change);

                // Change it in the UI at this point.
                var val = e_change.value;
                //console.log('val', val);

                //if (val == 'closed') {
                //ui_close();
                //    root_menu_item.close();
                //}

                //if (val == 'open') {
                //ui_open();
                //    root_menu_item.open();
                //}

                if (val === 'open') {
                    //ui_open();
                    //root_menu_item.open();
                    if (inner_container.dom && inner_container.dom.el) {
                        inner_container.dom.el.style.display = 'block';
                    }

                    // Elsewhere could take account for menu being put into the body?

                    this.one_mousedown_elsewhere((e_mousedown_elsewhere) => {
                        console.log('e_mousedown_elsewhere', e_mousedown_elsewhere);
                        /*
                        window.requestAnimationFrame(function () {
                            //resolve(func.apply(null, args));
                            this.i_state = 0;
                            this.state.set('closed'); // closed
                        });
                        */
                        setTimeout(() => {
                            //resolve(func.apply(null, args));
                            this.i_state = 0;
                            this.state.set('closed'); // closed
                        }, 300);
                        // close it.
                        //console.log('pre close');

                    })
                };

                // The root menu item needs to pup up into the DOM.

                if (val === 'closed' && inner_container.dom && inner_container.dom.el) {
                    inner_container.dom.el.style.display = 'none';
                }
            });


            root_menu_item.on('click', (e_click) => {
                //console.log('root_menu_item clicked e_click', e_click);

                // have a control target?
                // Find out if that control is part of this control directly, not part of any other control?

                //if (e_click.target === root_menu_item.dom.el) {
                //console.log('that.state', that.state);
                //console.log('that.i_state', that.i_state);
                //console.log('that.states', that.states);

                //console.log('tof that.state', tof(that.state));

                var new_i_state = this.i_state + 1;
                if (new_i_state === this.states.length) {
                    new_i_state = 0;
                }

                this.i_state = new_i_state;
                this.state.set(this.states[new_i_state]);
                //}

            });
            // When it's disconnected from the DOM, the events from inner controls don't reach above.

            // Need to go through the internal menu items...
            // prototype.description.
            //  description function to set it up.
            //  .api?
            //   info on the API?

            // prototype.api?
            //  seems useful info there.





            //console.log('root_menu_item.inner.content', root_menu_item.inner.content);
            if (inner_container.content) {
                inner_container.content.each((inner_menu_item) => {
                //console.log('inner_menu_item', inner_menu_item);
                inner_menu_item.on('click', (e_click) => {
                    //console.log('root_menu_item clicked e_click', e_click);

                    // have a control target?
                    // Find out if that control is part of this control directly, not part of any other control?

                    //if (e_click.target === root_menu_item.dom.el) {
                    //console.log('that.state', that.state);
                    //console.log('that.i_state', that.i_state);
                    //console.log('that.states', that.states);

                    //console.log('tof that.state', tof(that.state));

                    this.state.set('closed');
                    this.i_state = 0;
                    //}
                });
            })
            } // end if (inner_container.content)

            // Listen for the various changes on inner buttons.
            //  Want an easy way to iterate them.
            //console.log('pre iterate_sub_items');

            // Could attach the events earlier.
            //  Want to try that.
            /*
            root_menu_item.iterate_sub_items((item, str_path) => {
                //console.log('item', item);
                item.on('click', (e_click) => {

                    console.log('sub item click', e_click);
                    console.log('sub item: ', item);
                })
            });

            */
        }
    }
}
module.exports = Popup_Menu_Button;
