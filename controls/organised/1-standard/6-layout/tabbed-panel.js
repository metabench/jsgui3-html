const jsgui = require('./../../../../html-core/html-core');
const Control = jsgui.Control;
const mx_selectable = require('./../../../../control_mixins/selectable');
const { each, is_array, tof } = jsgui;
const Panel = require('./panel');
const List = require('../../0-core/0-basic/1-compositional/list');
const Radio_Button_Group = require('../../0-core/0-basic/1-compositional/radio-button-group');
const Radio_Button = require('../../0-core/0-basic/0-native-compositional/radio-button');

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
            this.add(new Tab({
                context: this.context,
                name: tab_name,
                group_name: this.__id
            }));
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
        const tabs = tabs_def || this.tabs || [];

        const add_tab = (name, group_name, is_checked) => {
            var html_radio = new Control({ context });
            {
                const { dom } = html_radio;
                dom.tagName = 'input';
                const { attributes } = dom;
                attributes.type = 'radio';
                attributes.name = group_name;
                if (is_checked) attributes.checked = 'checked';
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

        const group_name = this._id();
        const normalize_tab_def = (tab, idx_tab) => {
            const t = tof(tab);

            if (t === 'string') return { label_text: tab, content: undefined };

            if (t === 'array') {
                return { label_text: tab[0], content: tab[1] };
            }

            if (tab instanceof Control) {
                const label_text = tab.title || tab.name || tab.text || tab.__type_name || ('Tab ' + (idx_tab + 1));
                return { label_text, content: tab };
            }

            if (t === 'object') {
                const label_text = tab.title || tab.name || tab.text || ('Tab ' + (idx_tab + 1));
                const content = tab.content;
                return { label_text, content };
            }

            return { label_text: String(tab), content: undefined };
        };

        each(tabs, (tab, idx_tab) => {
            const is_checked = idx_tab === 0;
            const normalized = normalize_tab_def(tab, idx_tab);
            const label_text = typeof normalized.label_text === 'undefined' ? '' : normalized.label_text;
            const tab_page = add_tab(label_text, group_name, is_checked);
            if (typeof normalized.content !== 'undefined') {
                tab_page.add(normalized.content);
            }
        });

        const ctrl_break = new Control({ context });
        ctrl_break.add_class('break');
        this.add(ctrl_break);

        this._ctrl_fields = this._ctrl_fields || {};
    }
    activate() {
        if (!this.__active) {
            super.activate();
            const tab_pages = [];
            each(this.content._arr, ctrl => {
                if (ctrl.has_class('tab-page')) { tab_pages.push(ctrl); }
            });
            this.tab_pages = tab_pages;
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
