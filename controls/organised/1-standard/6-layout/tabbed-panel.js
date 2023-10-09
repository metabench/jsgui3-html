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
const each = jsgui.each;

const Panel = require('./panel');

// An overall simpler way of doing things, and using mixins for functionality that's a bit complex and common between controls.


// Tab_Group could extend Radio_Button_Group.

const List = require('./../../0-core/0-basic/list');

// Maybe redo this using lower level things in a more declarative and idiomatic way.
//   Maybe creating controls (with a kind of shorthand) from the Page_Context would work well.





class Tab extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tab';
        super(spec);

        //console.log('Tab spec', spec);


        // obext instead
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
        // 
        // could be an item within the tab, as well as text.
        this.add(this.span = new jsgui.span({
            context: this.context,
            text: this.name
        }));
        (this._fields = this._fields || {}).name = this.name;
    }
}

//console.log('jsgui.List', jsgui.List);

class Tab_Group extends List {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tab_group';
        super(spec);
        this.add_class('tab-group');
        this.selection_scope = this.context.new_selection_scope(this);
        this.tab_names = spec.tab_names || spec.tabs;
        if (!spec.el) {
            this.construct_tab_group();
        }

        //console.log('this.selection_scope', this.selection_scope);

        this.selection_scope.on('change', e_change => {
            console.log('Tab_Group selection_scope e_change', e_change);
        });

        // selection scope change, then we raise a change here.


        
    }
    construct_tab_group() {
        each(this.tab_names, tab_name => {
            let tab = new Tab({
                context: this.context,
                name: tab_name
            });
            this.add(tab);
        });
    }

    // then on activation...
}

class Tabbed_Panel extends Panel {

    // Provides a panel for each tab.
    //  Tabs have a key

    // can choose tab names in the spec.
    // tab titles

    // then choose the tab content.

    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tabbed_panel';
        super(spec);
        this.add_class('tabbed-panel');

        // spec.tabs...
        //  

        // tab definition property.

        if (!spec.el) {
            this.compose_tabbed_panel(spec.tabs);
        }
    }
    compose_tabbed_panel(tabs_def) {
        // tab group
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
    }
}

module.exports = Tabbed_Panel;