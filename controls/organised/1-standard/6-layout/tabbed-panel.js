// Tab bar - selectable
// multiple panel controls

// Would contain internal panels that get swapped.
//  Option to be able to close tabs too. Would be useful in many cases.

// Need to move this closer to being able to view nested observables.
//  Advanced app data can be within that format.

// Also will connect UIs to client-side data resources.
//  Those resources will handle the communication abstractions.




const jsgui = require('./../../../../html-core/html-core');
const Control = jsgui.Control;
//const Panel = jsgui.Panel;
const mx_selectable = require('./../../../../control_mixins/selectable');
const {each, is_array, tof} = jsgui;

const Panel = require('./panel');

// An overall simpler way of doing things, and using mixins for functionality that's a bit complex and common between controls.


// Tab_Group could extend Radio_Button_Group.

const List = require('./../../0-core/0-basic/list');

const Radio_Button_Group = require('../../0-core/0-basic/radio-button-group');


const Radio_Button = require('../../0-core/0-basic/radio-button');

// Radio_Button_Tab, and it could implement the Radio_Button then have the .inner part of it.
//  but also .label.inner??? .label.content ???




// Maybe redo this using lower level things in a more declarative and idiomatic way.
//   Maybe creating controls (with a kind of shorthand) from the Page_Context would work well.



// Have tabs with tab pages / panels.

// Tab_Panel probably will be best.
// Include both the tab and the panel. The CSS tricks work when the panel is the next sibling of the tab.



// Doing this best my involve generating some CSS.
//   It would be a separate thing that would need to be implemented.
//     Custom  CSS for inner (composed) elements.
//       Vary the CSS depenging on what elements are there?

// Or other way of doing things where the tabs are siblings with the panels they reveal
//   and have got CSS (order?) that moves them to a separate line.


/*

<input type="radio" name="tabs" id="tab1" class="tab">
<label for="tab1" class="tab-label">Tab 1</label>
<div class="tab-content">Content for Tab 1</div>

*/



class Tab extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tab';
        super(spec);

        //console.log('Tab spec', spec);

        // Include a Radio_Button inside is probably best.

        // group_name perhaps?
        //   group_id???




        // obext instead

        // Definitely looks like it would be much more concise code.

        // group_name property / get_set ???

        // 

        let _group_name;
        Object.defineProperty(this, 'group_name', {
            get() {
                return _group_name;
            },
            set(value) {
                let old = _group_name
                _group_name = value;
                this.raise('change', {
                    'name': 'group_name',
                    'old': old,
                    'value': value
                });
            }
        });
        _group_name = spec.group_name;
        

        let _name;
        Object.defineProperty(this, 'name', {
            get() {
                return _name;
            },
            set(value) {
                let old = _name
                _name = value;
                this.raise('change', {
                    'name': 'name',
                    'old': old,
                    'value': value
                });
            }
        });
        _name = spec.name;

        //this.name = spec.name;
        this.add_class('tab');
        mx_selectable(this);
        this.selectable = true;

        if (!spec.el) {
            this.construct_tab();
        }
    }
    construct_tab() {
        const {context} = this;




        const radio_button = new Radio_Button({
            context,
            group_name: this.group_name,
            text: this.name
        })

        this.add(radio_button);

        this._ctrl_fields = this._ctrl_fields || {};

		this._ctrl_fields.radio_button = radio_button;


        // 
        // could be an item within the tab, as well as text.

        /*
        this.add(this.span = new jsgui.span({
            context: this.context,
            text: this.name
        }));
        */


        (this._fields = this._fields || {}).name = this.name;
    }
}

Tab.css = `
.tab {

}

/*
.tab input {
    position: absolute;
    opacity: 0;
    with: 0px;
}
*/
`

//console.log('jsgui.List', jsgui.List);

class Tab_Group extends List {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tab_group';
        super(spec);
        this.add_class('tab-group');



        //this.selection_scope = this.context.new_selection_scope(this);


        this.tab_names = spec.tab_names || spec.tabs;
        if (!spec.el) {
            this.construct_tab_group();
        }

        //console.log('this.selection_scope', this.selection_scope);


        //this.selection_scope.on('change', e_change => {
        //    console.log('Tab_Group selection_scope e_change', e_change);
        //});

        // selection scope change, then we raise a change here.


        
    }
    construct_tab_group() {
        each(this.tab_names, tab_name => {



            let tab = new Tab({
                context: this.context,
                name: tab_name,
                group_name: this.__id
            });
            this.add(tab);
        });
    }

    // then on activation...
}

Tab_Group.css = `
.tab-group {
    display: flex;
    column-gap: 6px;
}
`

class Tabbed_Panel extends Panel {

    // Provides a panel for each tab.
    //  Tabs have a key

    // can choose tab names in the spec.
    // tab titles

    // then choose the tab content.

    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tabbed_panel';
        super(spec);
        this.add_class('tab-container');

        // spec.tabs...
        //  

        // 

        this.tabs = spec.tabs;

        // tab definition property.

        if (!spec.el) {
            this.compose_tabbed_panel(spec.tabs);
        }
    }
    compose_tabbed_panel(tabs_def) {


        const {context} = this;
        // probably / possibly should have a 'relative' div inside, then other divs inside that?
        //   could help with positioning the tab bar and tab page display in various places flexibly.


        /*
        const ctrl_relative = new Control({
            context
        });
        ctrl_relative.add_class('relative');
        this.add(ctrl_relative);

        // the ctrl tab bar, which will contain a Radio_Button_Group

        const ctrl_tabs = new Tab_Group({
            context,
            tabs: tabs_def
        })

        ctrl_relative.add(ctrl_tabs);

        */

        // Then this for each of them:

        // Need to be able to specify the contents within various places.
        //   Making them accessible through the API.
        //   Maybe 



        /*
        <input type="radio" name="tabs" id="tab1" class="tab-input">
        <label for="tab1" class="tab-label">Tab 1</label>
        <div class="tab-content">Content for Tab 1</div>
        */

        // And then controls internal to the tab page.

        // Include an empty tab page for each of them....

        // Will want ways to access the specific tabs - by name, or by index.
        //   Including once it has been activated.




        const add_tab = (name, group_name) => {


            var html_radio = new Control({
                context
            });
            {

                // Or enclose the whole thing in a label???
                // Not sure how that would work with the tabs css though....

                const {dom} = html_radio;
                dom.tagName = 'input';
                const {attributes} = dom;
                attributes.type = 'radio';
                attributes.name = group_name;
                


                //html_radio.add(name);

                //attributes.name = name;


                //attributes.id = html_radio._id();



            }
            html_radio.add_class('tab-input');
            this.add(html_radio);
            html_radio.dom.attributes.id = html_radio.__id;
            
            const label = new jsgui.controls.label({
                context
            });
            label.dom.attributes.for = html_radio.dom.attributes.id;
            label.add_class('tab-label');
            label.add(name);
            this.add(label);

            // Then add a tab-page

            const tab_page = new Control({
                context
            });
            tab_page.add_class('tab-page');
            //tab_page.dom.attributes.order = '100';

            // Then add the tab page content....?


            this.add(tab_page);

            return tab_page;


        }

        let i_tab = 0;

        each(this.tabs, tab => {

            const group_name = this._id();

            const t = tof(tab);
            if (t === 'string') {
                const tab_page = add_tab(tab, group_name);

                tab_page.add(i_tab + '');
                i_tab++;
            }

        })

        const ctrl_break = new Control({
            context
        });
        ctrl_break.add_class('break');
        //tab_page.dom.attributes.order = '100';

        // Then add the tab page content....?


        this.add(ctrl_break);

        // flex-wrap: wrap;



        // tab bar
        // tab page container




        // Should have the tab group anyway.

        const oldest = () => {

            if (is_array(tabs_def)) {

                // compose tab page...

                // if they are all strings???

                for (const tab_item of tabs_def) {
                    const t_item = tof(tab_item);

                    if (t_item === 'string') {

                        // add_tab perhaps....



                    }
                }




            } else {
                
                let tab_names = Object.keys(tabs_def);
                // different panels for each tab.
                //  only one to be shown on the screen at once.

                // then hide and show the main panels.
                this.add(this.tab_group = new Tab_Group({
                    context: this.context,
                    tabs: tab_names
                }));
                this.add(this.main = new Panel({
                    context: this.context
                }));
                // a collection of panels could be useful. this.main

                // Need to make this more flexible / powerful.
                //.  Want to provide a convenient API for specifying the tabs.
                //.    Including with not much specified, maybe just the names.

                

                let map_panels = {};


                each(tabs_def, (tab, name) => {
                    tab.name = name;
                    let c_panel = new Panel({
                        context: this.context,
                        name: name
                    });
                    map_panels[name] = c_panel;
                    // then if tab is a control, add it to that panel.
                    if (tab.__type_name) {
                        c_panel.add(tab);
                    }
                    this.main.add(c_panel);
                });

                // an object???


            }
        }

        this._ctrl_fields = this._ctrl_fields || {};
        
        //this._ctrl_fields.ctrl_relative = ctrl_relative;

        // Is it an array???

        

        // tab group
        
    }
}

Tabbed_Panel.css = `
.tab-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row; /* Change to 'row' for top or bottom tabs */
    /* width: 300px; */ /* Adjust width as needed */
    position: relative;
  }

  
.break {
	flex-basis: 100%;
	height: 0;
}

  .tab-page {
    
  }
  
  .tab-input {
    display: none;
  }
  
  .tab-label {
    background-color: #ccc;
    padding: 4px;
    margin: 2px;
    cursor: pointer;
  }
  
  .tab-input:checked + .tab-label {
    background-color: #DDFFDD;
  }
  
  .tab-input:checked + .tab-label + .tab-page {
    display: block;
  }

  
  .tab-page {

    display: none;
    order: 100;
    /* padding: 10px; */
    /* position: absolute; */
    left: 4px;
    right: 4px;
    /* width: calc(100% - 8px); */
    top: 32px;
    height: calc(100% - 32px);
  }
`

module.exports = Tabbed_Panel;