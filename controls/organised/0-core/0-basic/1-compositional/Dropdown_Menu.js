const jsgui = require('../../../../../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof,
    is_defined = jsgui.is_defined;

const {is_array, is_arr_of_strs} = jsgui;

var Control = jsgui.Control;
const {
    field,
    prop
} = require('obext');
class Dropdown_Menu extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'dropdown_menu';
        super(spec);
        this.add_class('dropdown-menu');

        field(this.view.data.model, 'state');
        field(this.view.data.model, 'options');

        this.view.data.model.on('change', e_change => {
            //console.log('this.view.data.model.on change e_change', e_change);
            const {name, value} = e_change;

            if (name === 'state') {
                if (value === 'open') {
                    this.remove_class('closed');
                    this.add_class('open');
                } else if (value === 'closed') {
                    this.remove_class('open');
                    this.add_class('closed');
                }
            } else {
                //console.log('this.view.data.model.on change e_change', e_change);
            }

            // and on changing the options...
            //   do some specific composition I suppose?

        });

        this.view.data.model.state = 'closed';

        if (spec.options) {
            this.view.data.model.options = spec.options;
        }

        if (!spec.abstract && !spec.el) {
            //this.compose_color_palette_grid();
            this.compose_dropdown_menu();
        }

        /*
        this.on('resize', (e_resize) => {
            if (this.grid) {
                var _2_padding = 12;
                var new_grid_size = v_subtract(e_resize.value, [_2_padding, _2_padding]);
                this.grid.size = new_grid_size;
            }
        });
        */
    }
    
    compose_dropdown_menu() {

        const {context} = this;

        // Popup can be modal or not.

        // Have the initial / closed state item.
        //   Show the current value, have the dropdown icon.

        // Selected item, null item / no item selected.

        const ctrl_closed_top = new Control({ context });
        ctrl_closed_top.add_class('closed-top');


        const ctrl_closed_top_item_itself = new Control({ context });
        ctrl_closed_top_item_itself.add_class('item-itself');
        ctrl_closed_top.add(ctrl_closed_top_item_itself);


        const ctrl_dropdown_icon = new Control({ context });
        ctrl_dropdown_icon.add_class('dropdown-icon');
        ctrl_dropdown_icon.add('▼');
        ctrl_closed_top.add(ctrl_dropdown_icon);

        this.add(ctrl_closed_top);

        const ctrl_open_items = new Control({ context });
        ctrl_open_items.add_class('open-items');
        this.add(ctrl_open_items);

        
        const dm_options = this.view.data.model.options;
        //console.log('Select_Options compose dm_options:', dm_options);
        if (is_array(dm_options)) {
            if (is_arr_of_strs(dm_options)) {
                //console.log('dm_options is an array of strings');
                each(dm_options, str_option => {
                    const ctrl_option = new Control({
                        context
                    });
                    ctrl_option.add_class('item');
                    //ctrl_option.dom.attributes.value = str_option;
                    ctrl_option.add(str_option);
                    ctrl_open_items.add(ctrl_option);
                })
            }
        }



        this._ctrl_fields = this._ctrl_fields || {};
		this._ctrl_fields.ctrl_dropdown_icon = ctrl_dropdown_icon;


    }

    activate() {
        if (!this.__active) {
            super.activate();

            const {ctrl_dropdown_icon} = this;

            //console.log('activating Dropdown_Menu this.ctrl_dropdown_icon', this.ctrl_dropdown_icon);

            // Want to listen for clicks on the dropdown icon.
            //  Will change the state of the dropdown menu.

            // Though could have that control bound to the open/closed view state.
            
            ctrl_dropdown_icon.on('click', e_click => {

                //console.log('ctrl_dropdown_icon e_click', e_click);

                //console.log('this.view.data.model.state', this.view.data.model.state);

                if (this.view.data.model.state === 'closed') {
                    this.view.data.model.state = 'open';
                } else {
                    this.view.data.model.state = 'closed';
                }

            });

            
        }
    }

}


Dropdown_Menu.css = `
.dropdown-menu {
    height: 64px;
    width: 384px;
    background-color: #FFFFFF;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
    padding: 2px;
}

.dropdown-menu .closed-top {
    height: 56px;
    width: 376px;
    background-color: #EEEEEE;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
    padding: 2px;
    display: flex;
    flex-direction: row;
}

.dropdown-menu .closed-top .item-itself {
    height: 53px;
    width: 320px;
    background-color: #FFFFFF;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
}

.dropdown-menu .closed-top .dropdown-icon {
    height: 53px;
    width: 53px;
    background-color: #FFFFFF;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
    margin-left: 2px;
    font-size: 53px;
    line-height: 53px;
    color: #888888;
}

.dropdown-menu .open-items {
    width: 376px;
    height: 414px;
    background-color: #EEEEEE;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
    padding: 2px;
}

.dropdown-menu.closed .open-items {
    display: none;
}

.dropdown-menu .open-items .item {
    width: 373px;
    height: 64px;
    background-color: #FFFFFF;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
}

.dropdown-menu .open-items .item:not(:first-child) {
    margin-top: 2px;
}



`

if (require.main === module) {
    //console.log('pal_crayola.length', pal_crayola.length);


    // Could make a new doc / context etc without the server.

    const ddm = new Dropdown_Menu();
    console.log(ddm.all_html_render());

} else {
}
module.exports = Dropdown_Menu;