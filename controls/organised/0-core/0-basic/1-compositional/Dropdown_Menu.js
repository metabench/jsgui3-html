const jsgui = require('../../../../../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof,
    is_defined = jsgui.is_defined;
var Control = jsgui.Control;
var v_subtract = jsgui.util.v_subtract;
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
        //this.internal_relative_div = true;

        //prop(this, 'palette', spec.palette);
        //prop(this, 'grid_size', spec.grid_size || [12, 12]);


        if (!spec.abstract && !spec.el) {
            //this.compose_color_palette_grid();
            this.compose_dropdown_menu();
        }

        /*
        console.log('!!this.view', !!this.view);
        console.log('!!this.data', !!this.data);

        console.log('this.view keys:', Object.keys(this.view));
        console.log('this.data keys:', Object.keys(this.data));

        console.log('this.view.data keys:', Object.keys(this.view.data));
        */



        field(this.view.data.model, 'state');

        //this.view.data.model.states = ['open', 'closed'];

        // May be multiple types of states?
        //   Though want this to work simply and intuitively in the simpler cases.

        //console.log('this.view.data.model.states', this.view.data.model.states);


        //  Do want to be able to listen for changes to specific things in the model.

        //prop(this.view.data.model, 'state');



        this.view.data.model.on('change', e_change => {
            //console.log('this.view.data.model.on change e_change', e_change);
            const {value} = e_change;
            if (value === 'open') {
                this.remove_class('closed');
                this.add_class('open');
            } else if (value === 'closed') {
                this.remove_class('open');
                this.add_class('closed');
            }

        });

        this.view.data.model.state = 'closed';

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
    activate() {
        if (!this.activate.__active) {
            super.activate();
            
        }
    }
    compose_dropdown_menu() {

        // Popup can be modal or not.

        // Have the initial / closed state item.
        //   Show the current value, have the dropdown icon.

        // Selected item, null item / no item selected.

        const ctrl_closed_top = new Control({ 'context': this.context });
        ctrl_closed_top.add_class('closed-top');


        const ctrl_closed_top_item_itself = new Control({ 'context': this.context });
        ctrl_closed_top_item_itself.add_class('item-itself');
        ctrl_closed_top.add(ctrl_closed_top_item_itself);


        const ctrl_dropdown_icon = new Control({ 'context': this.context });
        ctrl_dropdown_icon.add_class('dropdown-icon');
        ctrl_dropdown_icon.add('▼');
        ctrl_closed_top.add(ctrl_dropdown_icon);

        this.add(ctrl_closed_top);

        // And have an inner items container.
        // open items

        const ctrl_open_items = new Control({ 'context': this.context });
        ctrl_open_items.add_class('open-items');
        this.add(ctrl_open_items);

        




    }

}


Dropdown_Menu.css = `
.dropdown-menu.closed {
    height: 64px;
    width: 384px;
    background-color: #FFFFFF;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
    padding: 2px;
}

.dropdown-menu.closed .closed-top {
    height: 56px;
    width: 376px;
    background-color: #EEEEEE;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
    padding: 2px;
    display: flex;
    flex-direction: row;
}

.dropdown-menu.closed .closed-top .item-itself {
    height: 53px;
    width: 320px;
    background-color: #FFFFFF;
    border-radius: 4px;
    border: 2px solid #CCCCCC;
}

.dropdown-menu.closed .closed-top .dropdown-icon {
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


`

if (require.main === module) {
    //console.log('pal_crayola.length', pal_crayola.length);


    // Could make a new doc / context etc without the server.

    const ddm = new Dropdown_Menu();
    console.log(ddm.all_html_render());

} else {
}
module.exports = Dropdown_Menu;