const jsgui = require('./../../../../html-core/html-core');
const Control = jsgui.Control;
const mx_selectable = require('./../../../../control_mixins/selectable');
const { each, is_array, tof } = jsgui;
const Panel = require('./panel');
const List = require('./../../0-core/0-basic/list');
const Radio_Button_Group = require('../../0-core/0-basic/radio-button-group');
const Radio_Button = require('../../0-core/0-basic/radio-button');

class Tab extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tab';
        super(spec);
        let _group_name;
        Object.defineProperty(this, 'group_name', {
            get() { return _group_name; },
            set(value) {
                let old = _group_name;
                _group_name = value;
                this.raise('change', { 'name': 'group_name', 'old': old, 'value': value });
            }
        });
        _group_name = spec.group_name;

        let _name;
        Object.defineProperty(this, 'name', {
            get() { return _name; },
            set(value) {
                let old = _name;
                _name = value;
                this.raise('change', { 'name': 'name', 'old': old, 'value': value });
            }
        });
        _name = spec.name;

        this.add_class('tab');
        mx_selectable(this);
        this.selectable = true;
        if (!spec.el) { this.construct_tab(); }
    }
    construct_tab() {
        const { context } = this;
        const radio_button = new Radio_Button({
            context,
            group_name: this.group_name,
            text: this.name
        });
        this.add(radio_button);
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.radio_button = radio_button;
        (this._fields = this._fields || {}).name = this.name;
    }
}
Tab.css = `
.tab { }
`;

class Tab_Group extends List {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tab_group';
        super(spec);
        this.add_class('tab-group');
        this.tab_names = spec.tab_names || spec.tabs;
        if (!spec.el) { this.compose_tab_group(); }
    }
    compose_tab_group() {
        each(this.tab_names, tab_name => {
            let tab = new Tab({
                context: this.context,
                name: tab_name,
                group_name: this.__id
            });
            this.add(tab);
        });
    }
}
Tab_Group.css = `
.tab-group {
    display: flex;
    column-gap: 6px;
}
`;

class Tabbed_Panel extends Panel {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tabbed_panel';
        super(spec);
        this.add_class('tab-container');
        this.tabs = spec.tabs;
        if (!spec.el) { this.compose_tabbed_panel(spec.tabs); }
    }
    compose_tabbed_panel(tabs_def) {
        const { context } = this;
        this.tab_pages = [];

        const add_tab = (name, group_name) => {
            var html_radio = new Control({ context });
            {
                const { dom } = html_radio;
                dom.tagName = 'input';
                const { attributes } = dom;
                attributes.type = 'radio';
                attributes.name = group_name;
            }
            html_radio.add_class('tab-input');
            this.add(html_radio);
            html_radio.dom.attributes.id = html_radio.__id;

            const label = new jsgui.controls.label({ context });
            label.dom.attributes.for = html_radio.dom.attributes.id;
            label.add_class('tab-label');
            label.add(name);
            this.add(label);

            const tab_page = new Control({ context });
            tab_page.add_class('tab-page');
            this.tab_pages.push(tab_page);
            this.add(tab_page);
            return tab_page;
        };

        let i_tab = 0;
        each(this.tabs, tab => {
            const group_name = this._id();
            const t = tof(tab);
            if (t === 'string') {
                add_tab(tab, group_name);
                i_tab++;
            } else {

                if (t === 'array') {

                    const tab_label_text = tab[0];
                    const tab_content = tab[1];
                    const tab_page = add_tab(tab_label_text, group_name);
                    tab_page.add(tab_content);

                } else {
                    console.log('tab', tab);
                    console.log('t', t);
                    throw 'NYI';
                }
                
                

            }
        });

        const ctrl_break = new Control({ context });
        ctrl_break.add_class('break');
        this.add(ctrl_break);

        this._ctrl_fields = this._ctrl_fields || {};
    }
    activate() {
        if (!this.__active) {
            this.__active = true;
            const tab_pages = [];
            each(this.content._arr, ctrl => {
                if (ctrl.has_class('tab-page')) { tab_pages.push(ctrl); }
            });
            this.tab_pages = tab_pages;
            console.log('tab_pages.length', tab_pages.length);
        }
    }
}
Tabbed_Panel.css = `
.tab-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row; /* Change to 'row' for top or bottom tabs */
    width: 300px; /* Adjust width as needed */
    position: relative;
    height: 300px;
}
.break {
    flex-basis: 100%;
    height: 0;
}
.tab-input {
    display: none;
}
.tab-label {
    height: 22px;
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
    


    /*
    order: 100;
    left: 4px;
    right: 4px;
    top: 32px;
    */


    /* height: calc(100% - 32px); */

    height: 300px;
    width: 300px;
    background-color: #FFFFFF;
    border: 1px solid #CCCCCC;
}
`;
module.exports = Tabbed_Panel;