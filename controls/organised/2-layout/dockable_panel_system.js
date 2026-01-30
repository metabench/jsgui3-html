const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const Panel = require('../1-standard/6-layout/panel');
const Tabbed_Panel = require('../1-standard/6-layout/tabbed-panel');

class Dockable_Panel extends Panel {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'dockable_panel';
        super(spec);
        this.add_class('dockable-panel');
        this.title = spec.title || this.title || '';
        this.icon = spec.icon || null;
        this.can_float = spec.can_float !== false;
        this.can_close = spec.can_close !== false;
        this.can_auto_hide = spec.can_auto_hide !== false;
        this.min_size = spec.min_size || this.min_size || [200, 100];
    }
}

class Dock_Tab_Group extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'dock_tab_group';
        super(spec);
        this.add_class('dock-tab-group');
        this.tabs = [];
        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this.tabbed = new Tabbed_Panel({ context, tabs: [] });
        this.add(this.tabbed);
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.tabbed = this.tabbed;
    }

    add_panel(panel) {
        this.tabs.push(panel);
        if (this.tabbed) {
            this.tabbed.tabs = this.tabs.map(tab => ({ title: tab.title || 'Panel', content: tab }));
            this.tabbed.compose_tabbed_panel(this.tabbed.tabs, this.tabbed.tab_bar || {});
        }
    }
}

class Dock_Zone extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'dock_zone';
        super(spec);
        this.add_class('dock-zone');
        this.position = spec.position || 'left';
        this.add_class(`dock-zone-${this.position}`);
        this.groups = [];
    }

    add_group(group) {
        this.groups.push(group);
        this.add(group);
    }
}

class Dockable_Panel_System extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'dockable_panel_system';
        super(spec);
        this.add_class('dockable-panel-system');

        this.allow_floating = spec.allow_floating !== false;
        this.allow_tab_groups = spec.allow_tab_groups !== false;
        this.allow_auto_hide = spec.allow_auto_hide !== false;
        this.allow_split = spec.allow_split !== false;
        this.dock_indicator_style = spec.dock_indicator_style || 'overlay';
        this.save_layout_key = spec.save_layout_key || null;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        this.zones = {
            left: new Dock_Zone({ context, position: 'left' }),
            right: new Dock_Zone({ context, position: 'right' }),
            top: new Dock_Zone({ context, position: 'top' }),
            bottom: new Dock_Zone({ context, position: 'bottom' })
        };

        this.center = new Control({ context });
        this.center.add_class('dock-center');

        Object.keys(this.zones).forEach(key => {
            this.add(this.zones[key]);
        });
        this.add(this.center);

        this._ctrl_fields.center = this.center;
    }

    add_panel(panel, position = 'left') {
        const zone = this.zones[position] || this.zones.left;
        const group = new Dock_Tab_Group({ context: this.context });
        group.add_panel(panel);
        zone.add_group(group);
        this.raise('panel-dock', { panel, position, zone });
    }

    remove_panel(panel) {
        Object.values(this.zones || {}).forEach(zone => {
            zone.content && zone.content._arr && zone.content._arr.forEach(group => {
                if (group && group.tabs) {
                    group.tabs = group.tabs.filter(tab => tab !== panel);
                }
            });
        });
        this.raise('panel-close', { panel });
    }

    dock(panel, position, zone) {
        const target_zone = zone || this.zones[position] || this.zones.left;
        const group = new Dock_Tab_Group({ context: this.context });
        group.add_panel(panel);
        target_zone.add_group(group);
        this.raise('panel-dock', { panel, position, zone: target_zone });
    }

    float(panel, pos, size) {
        this.raise('panel-float', { panel, position: pos, size });
    }

    auto_hide(panel, edge) {
        this.raise('panel-auto-hide', { panel, edge });
    }

    show_panel(panel) {
        this.raise('show-panel', { panel });
    }

    get_layout() {
        return { version: 1 };
    }

    set_layout(layout) {
        this._layout = layout;
        this.raise('layout-change', { layout });
    }

    save_layout() {
        if (this.save_layout_key && typeof localStorage !== 'undefined') {
            localStorage.setItem(this.save_layout_key, JSON.stringify(this.get_layout()));
        }
    }

    restore_layout() {
        if (this.save_layout_key && typeof localStorage !== 'undefined') {
            const raw = localStorage.getItem(this.save_layout_key);
            if (raw) {
                this.set_layout(JSON.parse(raw));
            }
        }
    }
}

Dockable_Panel_System.Dockable_Panel = Dockable_Panel;
Dockable_Panel_System.Dock_Tab_Group = Dock_Tab_Group;
Dockable_Panel_System.Dock_Zone = Dock_Zone;

module.exports = Dockable_Panel_System;
