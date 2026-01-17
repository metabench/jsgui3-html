const jsgui = require('./../../../../html-core/html-core');
const Control = jsgui.Control;
const mx_selectable = require('./../../../../control_mixins/selectable');
const { each, is_array, tof } = jsgui;
const Panel = require('./panel');
const List = require('../../0-core/0-basic/1-compositional/list');
const Radio_Button_Group = require('../../0-core/0-basic/1-compositional/radio-button-group');
const Radio_Button = require('../../0-core/0-basic/0-native-compositional/radio-button');
const keyboard_navigation = require('../../../../control_mixins/keyboard_navigation');
const {
    apply_focus_ring,
    apply_label,
    apply_role,
    ensure_sr_text
} = require('../../../../control_mixins/a11y');
const { themeable } = require('../../../../control_mixins/themeable');
const { apply_token_map } = require('../../../../themes/token_maps');

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

/**
 * Tabbed Panel Control
 * 
 * A panel with tabbed navigation.
 * 
 * Supports variants: default, pills, card, vertical, vertical-right, bottom, icon, compact
 * 
 * @example
 * // Default tabs
 * new Tabbed_Panel({ tabs: ['Tab 1', 'Tab 2', 'Tab 3'] });
 * 
 * // Pill tabs
 * new Tabbed_Panel({ variant: 'pills', tabs: ['Home', 'Profile', 'Settings'] });
 * 
 * // Vertical tabs
 * new Tabbed_Panel({ variant: 'vertical', tabs: ['Overview', 'Details'] });
 */
class Tabbed_Panel extends Panel {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'tabbed_panel';
        super(spec);

        // Apply themeable - resolves params and applies hooks
        const params = themeable(this, 'tabbed_panel', spec);

        // Apply token mappings (size -> CSS variables)
        apply_token_map(this, 'tab', params);

        this.add_class('tab-container');
        this.tabs = spec.tabs;
        this.tab_bar = spec.tab_bar || {};
        this.aria_label = spec.aria_label;
        if (!spec.el) { this.compose_tabbed_panel(spec.tabs, this.tab_bar); }
    }
    compose_tabbed_panel(tabs_def, tab_bar = {}) {
        const { context } = this;
        this.tab_pages = [];
        const tabs = tabs_def || this.tabs || [];
        const tab_bar_position = tab_bar.position || 'top';
        const tab_variant = tab_bar.variant || null;
        const max_tabs = Number.isFinite(Number(tab_bar.max_tabs)) ? Number(tab_bar.max_tabs) : null;
        const use_overflow = !!tab_bar.overflow && Number.isFinite(max_tabs) && tabs.length > max_tabs;
        apply_role(this, 'tablist', { force: true });
        this.dom.attributes['aria-orientation'] = (tab_bar_position === 'left' || tab_bar_position === 'right')
            ? 'vertical'
            : 'horizontal';
        if (this.aria_label !== undefined) {
            apply_label(this, this.aria_label);
        }

        this.remove_class('tabbed-panel-vertical');
        this.remove_class('tabbed-panel-right');
        this.remove_class('tabbed-panel-bottom');
        if (tab_bar_position === 'left' || tab_bar_position === 'right') {
            this.add_class('tabbed-panel-vertical');
            if (tab_bar_position === 'right') {
                this.add_class('tabbed-panel-right');
            }
        }
        if (tab_bar_position === 'bottom') {
            this.add_class('tabbed-panel-bottom');
        }

        const tab_inputs = [];
        const tab_labels = [];
        const tab_pages = [];

        const add_tab = (name, group_name, is_checked, tab_index, tab_def) => {
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
            html_radio.dom.attributes['data-tab-index'] = String(tab_index);

            const label = new jsgui.controls.label({ context });
            const tab_id = `${this._id()}-tab-${tab_index}`;
            const panel_id = `${this._id()}-panel-${tab_index}`;
            label.dom.attributes.for = html_radio.dom.attributes.id;
            label.add_class('tab-label');
            label.dom.attributes['data-tab-index'] = String(tab_index);
            label.dom.attributes.role = 'tab';
            label.dom.attributes.id = tab_id;
            label.dom.attributes.tabindex = is_checked ? '0' : '-1';
            label.dom.attributes['aria-selected'] = is_checked ? 'true' : 'false';
            label.dom.attributes['aria-controls'] = panel_id;
            if (tab_variant === 'icon' && tab_def && tab_def.icon) {
                const icon_span = new Control({ context, tag_name: 'span' });
                icon_span.add_class('tab-icon');
                icon_span.add(String(tab_def.icon));
                label.add(icon_span);
                if (name) {
                    const label_span = new Control({ context, tag_name: 'span' });
                    label_span.add_class('tab-text');
                    label_span.add(name);
                    label.add(label_span);
                } else {
                    const fallback_text = `Tab ${tab_index + 1}`;
                    ensure_sr_text(label, fallback_text);
                }
            } else {
                label.add(name);
            }
            apply_focus_ring(label);
            this.add(label);

            const tab_page = new Control({ context });
            tab_page.add_class('tab-page');
            tab_page.dom.attributes['data-tab-index'] = String(tab_index);
            tab_page.dom.attributes.role = 'tabpanel';
            tab_page.dom.attributes.id = panel_id;
            tab_page.dom.attributes['aria-labelledby'] = tab_id;
            tab_page.dom.attributes['aria-hidden'] = is_checked ? 'false' : 'true';
            tab_page.dom.attributes.tabindex = '0';
            this.tab_pages.push(tab_page);
            this.add(tab_page);
            return {
                tab_page,
                input_ctrl: html_radio,
                label_ctrl: label
            };
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
            const tab_parts = add_tab(label_text, group_name, is_checked, idx_tab, tab);
            if (typeof normalized.content !== 'undefined') {
                tab_parts.tab_page.add(normalized.content);
            }
            tab_inputs.push(tab_parts.input_ctrl);
            tab_labels.push(tab_parts.label_ctrl);
            tab_pages.push(tab_parts.tab_page);

            if (use_overflow && idx_tab >= max_tabs) {
                tab_parts.label_ctrl.add_class('tab-label-hidden');
            }
        });

        if (use_overflow) {
            const overflow_select = new Control({ context });
            overflow_select.dom.tagName = 'select';
            overflow_select.add_class('tab-overflow-select');
            overflow_select.dom.attributes['aria-label'] = 'More tabs';

            for (let index = max_tabs; index < tabs.length; index += 1) {
                const normalized = normalize_tab_def(tabs[index], index);
                const option_ctrl = new Control({ context });
                option_ctrl.dom.tagName = 'option';
                option_ctrl.dom.attributes.value = String(index);
                option_ctrl.add(normalized.label_text || `Tab ${index + 1}`);
                overflow_select.add(option_ctrl);
            }

            this.add(overflow_select);
            this._ctrl_fields = this._ctrl_fields || {};
            this._ctrl_fields.overflow_select = overflow_select;
        }

        const ctrl_break = new Control({ context });
        ctrl_break.add_class('break');
        this.add(ctrl_break);

        this._tab_controls = {
            tab_inputs,
            tab_labels,
            tab_pages
        };
    }
    /**
     * Set the active tab by index.
     * @param {number} index - Tab index to activate.
     * @param {Object} [options] - Optional settings.
     */
    set_active_tab_index(index, options = {}) {
        const tab_controls = this._tab_controls || {};
        const tab_inputs = tab_controls.tab_inputs;
        const tab_labels = tab_controls.tab_labels;
        const tab_pages = tab_controls.tab_pages;
        if (!Array.isArray(tab_inputs) || !Array.isArray(tab_labels) || !Array.isArray(tab_pages)) return;
        if (!tab_inputs.length) return;

        const clamped = Math.max(0, Math.min(index, tab_inputs.length - 1));
        this.active_index = clamped;

        tab_inputs.forEach((input_ctrl, idx) => {
            const is_checked = idx === clamped;
            if (is_checked) {
                input_ctrl.dom.attributes.checked = 'checked';
            } else if (input_ctrl.dom.attributes.checked) {
                delete input_ctrl.dom.attributes.checked;
            }
            if (input_ctrl.dom.el) {
                input_ctrl.dom.el.checked = is_checked;
            }
        });

        tab_labels.forEach((label_ctrl, idx) => {
            const is_selected = idx === clamped;
            label_ctrl.dom.attributes['aria-selected'] = is_selected ? 'true' : 'false';
            label_ctrl.dom.attributes.tabindex = is_selected ? '0' : '-1';
            if (options.focus && is_selected && label_ctrl.dom.el) {
                label_ctrl.dom.el.focus();
            }
        });

        tab_pages.forEach((page_ctrl, idx) => {
            const is_active = idx === clamped;
            const aria_hidden = is_active ? 'false' : 'true';
            page_ctrl.dom.attributes['aria-hidden'] = aria_hidden;
            if (page_ctrl.dom.el) {
                page_ctrl.dom.el.setAttribute('aria-hidden', aria_hidden);
            }
        });
    }
    activate() {
        if (!this.__active) {
            super.activate();
            const overflow_select = this._ctrl_fields && this._ctrl_fields.overflow_select;
            const tab_controls = this._tab_controls || {};
            const tab_inputs = tab_controls.tab_inputs;
            const tab_labels = tab_controls.tab_labels;
            const tab_pages = tab_controls.tab_pages;
            if (Array.isArray(tab_inputs) && tab_inputs.length) {
                const initial_index = tab_inputs.findIndex(input_ctrl => {
                    const attrs_checked = input_ctrl.dom.attributes.checked;
                    const dom_checked = input_ctrl.dom.el && input_ctrl.dom.el.checked;
                    return attrs_checked || dom_checked;
                });
                this.set_active_tab_index(initial_index >= 0 ? initial_index : 0);
                tab_inputs.forEach((input_ctrl, idx) => {
                    if (input_ctrl.dom.el) {
                        input_ctrl.dom.el.addEventListener('change', () => {
                            this.set_active_tab_index(idx);
                        });
                    }
                });
            }
            if (overflow_select && overflow_select.dom.el && Array.isArray(tab_inputs)) {
                overflow_select.add_dom_event_listener('change', () => {
                    const selected = overflow_select.dom.el.value;
                    const selected_index = Number(selected);
                    if (!Number.isFinite(selected_index)) return;
                    this.set_active_tab_index(selected_index, { focus: true });
                });
            }
            if (Array.isArray(tab_labels) && tab_labels.length) {
                const orientation = this.dom.attributes['aria-orientation'] === 'vertical' ? 'vertical' : 'horizontal';
                keyboard_navigation(this, {
                    orientation,
                    roving_tabindex: true,
                    focus_item: true,
                    get_items: () => tab_labels,
                    get_active_index: () => this.active_index || 0,
                    set_active_index: (index, options_set = {}) => {
                        this.set_active_tab_index(index, { focus: !!options_set.from_keyboard });
                    },
                    on_activate: () => {
                        this.set_active_tab_index(this.active_index || 0, { focus: true });
                    }
                });
            }
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
.tabbed-panel-vertical {
    flex-direction: column;
    align-items: flex-start;
}
.tabbed-panel-right {
    align-items: flex-end;
}
.tabbed-panel-bottom {
    flex-direction: column-reverse;
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
.tab-label-hidden {
    display: none;
}
.tab-icon {
    margin-right: 6px;
}
.tab-overflow-select {
    margin: 2px;
    padding: 4px;
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
