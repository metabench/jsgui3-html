const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const Tabbed_Panel = require('../1-standard/6-layout/tabbed-panel');

class Document_Tab_Container extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'document_tab_container';
        super(spec);
        this.add_class('document-tab-container');

        this.closeable = spec.closeable !== false;
        this.reorderable = spec.reorderable !== false;
        this.overflow_mode = spec.overflow_mode || 'scroll';
        this.show_icons = spec.show_icons !== false;
        this.confirm_close_modified = spec.confirm_close_modified !== false;
        this.allow_split = spec.allow_split !== false;
        this.max_tab_width = spec.max_tab_width || 200;
        this.context_menu = spec.context_menu !== false;

        this.tabs = [];

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};
        this.tabbed = new Tabbed_Panel({ context, tabs: [] });
        this.tabbed.add_class('document-tabs');
        this.add(this.tabbed);
        this._ctrl_fields.tabbed = this.tabbed;
    }

    add_tab(options) {
        const tab = Object.assign({}, options);
        this.tabs.push(tab);
        this._refresh_tabs();
        return tab;
    }

    remove_tab(id) {
        const idx = this.tabs.findIndex(t => t.id === id);
        if (idx === -1) return;
        const tab = this.tabs[idx];
        const payload = { id, tab, cancel: () => { payload._cancelled = true; } };
        this.raise('tab-close', payload);
        if (payload._cancelled) return;
        this.tabs.splice(idx, 1);
        this._refresh_tabs();
        this.raise('tab-closed', { id });
    }

    select_tab(id) {
        const idx = this.tabs.findIndex(t => t.id === id);
        if (idx < 0) return;
        if (this.tabbed) {
            this.tabbed.set_active_tab_index(idx, { focus: true });
        }
        this.raise('tab-select', { id, tab: this.tabs[idx] });
    }

    get_tab(id) {
        return this.tabs.find(t => t.id === id);
    }

    get_active_tab() {
        const idx = this.tabbed ? this.tabbed.active_index : 0;
        return this.tabs[idx] || null;
    }

    get_all_tabs() {
        return this.tabs.map(t => t.id);
    }

    set_modified(id, bool) {
        const tab = this.get_tab(id);
        if (!tab) return;
        tab.modified = !!bool;
        this.raise('tab-modified', { id, modified: tab.modified });
        this._refresh_tabs();
    }

    set_title(id, title) {
        const tab = this.get_tab(id);
        if (!tab) return;
        tab.title = title;
        this._refresh_tabs();
    }

    _refresh_tabs() {
        if (!this.tabbed) return;
        this.tabbed.tabs = this.tabs.map(tab => ({
            title: tab.title || '',
            content: tab.content,
            icon: tab.icon
        }));
        this.tabbed.compose_tabbed_panel(this.tabbed.tabs, this.tabbed.tab_bar || {});
    }

    pin_tab(id) {
        const tab = this.get_tab(id);
        if (!tab) return;
        tab.pinned = true;
        this._refresh_tabs();
    }

    unpin_tab(id) {
        const tab = this.get_tab(id);
        if (!tab) return;
        tab.pinned = false;
        this._refresh_tabs();
    }

    close_all() {
        const ids = this.tabs.map(t => t.id);
        ids.forEach(id => this.remove_tab(id));
    }

    close_others(id) {
        const ids = this.tabs.map(t => t.id).filter(tid => tid !== id);
        ids.forEach(tid => this.remove_tab(tid));
    }

    close_to_right(id) {
        const idx = this.tabs.findIndex(t => t.id === id);
        if (idx < 0) return;
        const ids = this.tabs.slice(idx + 1).map(t => t.id);
        ids.forEach(tid => this.remove_tab(tid));
    }

    split_horizontal() {
        this.raise('split', { direction: 'horizontal', tabs: this.tabs });
    }

    split_vertical() {
        this.raise('split', { direction: 'vertical', tabs: this.tabs });
    }

    unsplit() {
        this.raise('split', { direction: 'none', tabs: this.tabs });
    }
}

module.exports = Document_Tab_Container;
