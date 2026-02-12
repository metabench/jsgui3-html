/**
 * Toolbox — Grouped tool palette for canvas/editor UIs.
 *
 * A vertical panel of tool buttons organised into collapsible groups.
 * Used alongside canvas-based controls or editors for tool selection.
 *
 * Options:
 *   groups       — Array of { id, label, tools: [{ id, label, icon?, shortcut? }] }
 *   active_tool  — Initial active tool id
 *   collapsible  — Whether groups can collapse (default true)
 *   theme        — Admin theme name
 *
 * API:
 *   add_group(spec)         — Add a tool group
 *   add_tool(group_id, spec) — Add a tool to a group
 *   set_active(tool_id)     — Set the active tool
 *   get_active()            — Get the current active tool id
 *
 * Events:
 *   'select'  { tool_id, tool, previous }  — Fired when active tool changes
 *   'hover'   { tool_id, tool }            — Fired when a tool is hovered
 */
const Control = require('../../../../html-core/control');

class Toolbox extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'toolbox';
        const cfg_groups = spec.groups || [];
        const cfg_active = spec.active_tool || null;
        super(spec);
        this.add_class('jsgui-toolbox');
        this.dom.tagName = 'div';
        this.dom.attributes.role = 'toolbar';
        this.dom.attributes['aria-label'] = spec.label || 'Toolbox';

        this._groups = [];
        this._tools = new Map();      // tool_id → { id, label, icon, shortcut, group_id, el }
        this._active_tool = null;
        this._collapsible = spec.collapsible !== false;

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }

        if (!spec.el) {
            this.compose();
            cfg_groups.forEach(g => this.add_group(g));
            if (cfg_active) this.set_active(cfg_active);
        }
    }

    compose() {
        // Container is the control itself — groups are added dynamically
    }

    // ── Public API ──

    add_group(spec) {
        const group_id = spec.id || `group_${this._groups.length}`;
        const label = spec.label || group_id;

        const group_el = new Control({ context: this.context, tag_name: 'div' });
        group_el.add_class('toolbox-group');
        group_el.dom.attributes['data-group-id'] = group_id;

        // Group header
        const header = new Control({ context: this.context, tag_name: 'div' });
        header.add_class('toolbox-group-header');
        if (this._collapsible) {
            header.dom.attributes.role = 'button';
            header.dom.attributes.tabindex = '0';
            header.dom.attributes['aria-expanded'] = 'true';
        }

        const chevron = new Control({ context: this.context, tag_name: 'span' });
        chevron.add_class('toolbox-chevron');
        chevron.add('▾');
        header.add(chevron);

        const lbl = new Control({ context: this.context, tag_name: 'span' });
        lbl.add_class('toolbox-group-label');
        lbl.add(label);
        header.add(lbl);

        group_el.add(header);

        // Tools container
        const tools_el = new Control({ context: this.context, tag_name: 'div' });
        tools_el.add_class('toolbox-tools');
        group_el.add(tools_el);

        const group_data = {
            id: group_id, label, el: group_el, header, tools_el, chevron,
            collapsed: false, tools: []
        };
        this._groups.push(group_data);
        this.add(group_el);

        // Add tools if provided
        if (Array.isArray(spec.tools)) {
            spec.tools.forEach(t => this.add_tool(group_id, t));
        }

        return group_id;
    }

    add_tool(group_id, spec) {
        const group = this._groups.find(g => g.id === group_id);
        if (!group) return;

        const tool_id = spec.id || `tool_${this._tools.size}`;
        const tool = {
            id: tool_id,
            label: spec.label || tool_id,
            icon: spec.icon || '',
            shortcut: spec.shortcut || '',
            group_id
        };

        const btn = new Control({ context: this.context, tag_name: 'button' });
        btn.add_class('toolbox-tool');
        btn.dom.attributes.type = 'button';
        btn.dom.attributes.tabindex = '0';
        btn.dom.attributes['data-tool-id'] = tool_id;
        btn.dom.attributes['aria-label'] = tool.label;
        btn.dom.attributes.title = tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label;

        if (tool.icon) {
            const icon_el = new Control({ context: this.context, tag_name: 'span' });
            icon_el.add_class('toolbox-tool-icon');
            icon_el.add(tool.icon);
            btn.add(icon_el);
        }

        const label_el = new Control({ context: this.context, tag_name: 'span' });
        label_el.add_class('toolbox-tool-label');
        label_el.add(tool.label);
        btn.add(label_el);

        if (tool.shortcut) {
            const shortcut_el = new Control({ context: this.context, tag_name: 'kbd' });
            shortcut_el.add_class('toolbox-tool-shortcut');
            shortcut_el.add(tool.shortcut);
            btn.add(shortcut_el);
        }

        tool.el = btn;
        group.tools.push(tool);
        this._tools.set(tool_id, tool);
        group.tools_el.add(btn);

        return tool_id;
    }

    set_active(tool_id) {
        const tool = this._tools.get(tool_id);
        if (!tool) return;

        const previous = this._active_tool;

        // Deactivate previous
        if (previous && this._tools.has(previous)) {
            const prev_tool = this._tools.get(previous);
            if (prev_tool.el) prev_tool.el.remove_class('active');
        }

        // Activate new
        this._active_tool = tool_id;
        if (tool.el) tool.el.add_class('active');

        this.raise('select', { tool_id, tool, previous });
    }

    get_active() {
        return this._active_tool;
    }

    // ── Activation ──

    activate() {
        super.activate();
        const that = this;

        // Tool selection
        this._tools.forEach((tool, id) => {
            if (tool.el) {
                tool.el.on('click', () => that.set_active(id));
                tool.el.on('mouseenter', () => that.raise('hover', { tool_id: id, tool }));
            }
        });

        // Group collapse/expand
        if (this._collapsible) {
            this._groups.forEach(group => {
                if (group.header) {
                    group.header.on('click', () => {
                        group.collapsed = !group.collapsed;
                        if (group.tools_el && group.tools_el.dom.el) {
                            group.tools_el.dom.el.style.display = group.collapsed ? 'none' : '';
                        }
                        if (group.chevron && group.chevron.dom.el) {
                            group.chevron.dom.el.textContent = group.collapsed ? '▸' : '▾';
                        }
                        if (group.header.dom.el) {
                            group.header.dom.el.setAttribute('aria-expanded', !group.collapsed);
                        }
                    });
                }
            });
        }

        // Keyboard navigation — arrow keys between tools, Enter to select
        this.on('keydown', (e) => {
            const ev = e.event || e;
            if (!ev) return;
            const key = ev.key;
            if (key === 'ArrowDown' || key === 'ArrowUp') {
                ev.preventDefault();
                const all_tools = Array.from(that._tools.keys());
                const idx = all_tools.indexOf(that._active_tool);
                let next_idx;
                if (key === 'ArrowDown') {
                    next_idx = idx < all_tools.length - 1 ? idx + 1 : 0;
                } else {
                    next_idx = idx > 0 ? idx - 1 : all_tools.length - 1;
                }
                that.set_active(all_tools[next_idx]);
                const next_tool = that._tools.get(all_tools[next_idx]);
                if (next_tool && next_tool.el && next_tool.el.dom.el) next_tool.el.dom.el.focus();
            }
        });
    }
}

Toolbox.css = `
/* ─── Toolbox ─── */
.jsgui-toolbox {
    font-family: var(--admin-font, 'Segoe UI', -apple-system, sans-serif);
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--admin-radius-lg, 6px);
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 180px;
    box-shadow: var(--admin-shadow, 0 1px 3px rgba(0,0,0,0.08));
    user-select: none;
}
.toolbox-group {
    display: flex;
    flex-direction: column;
}
.toolbox-group + .toolbox-group {
    border-top: 1px solid var(--admin-border, #e0e0e0);
    padding-top: 4px;
    margin-top: 4px;
}
.toolbox-group-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--admin-muted, #888);
    cursor: pointer;
    border-radius: var(--admin-radius, 4px);
    transition: background 0.12s ease;
}
.toolbox-group-header:hover {
    background: var(--admin-hover, rgba(128,128,128,0.08));
}
.toolbox-chevron {
    font-size: 10px;
    width: 12px;
    text-align: center;
    transition: transform 0.15s ease;
}
.toolbox-tools {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding-left: 2px;
}
.toolbox-tool {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    font-size: 13px;
    font-family: inherit;
    color: var(--admin-text, #1e1e1e);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--admin-radius, 4px);
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: background 0.12s ease, border-color 0.12s ease;
}
.toolbox-tool:hover {
    background: var(--admin-hover, rgba(128,128,128,0.08));
}
.toolbox-tool:focus-visible {
    outline: 2px solid var(--admin-accent, #007acc);
    outline-offset: -1px;
}
.toolbox-tool.active {
    background: var(--admin-accent, #007acc);
    color: #fff;
    border-color: var(--admin-accent, #007acc);
}
.toolbox-tool.active:hover {
    background: var(--admin-accent-hover, #0066b0);
}
.toolbox-tool-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
}
.toolbox-tool-label {
    flex: 1 1 auto;
}
.toolbox-tool-shortcut {
    font-size: 10px;
    color: var(--admin-muted, #888);
    background: var(--admin-header-bg, #f5f5f5);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--admin-mono-font, 'Cascadia Code', 'Consolas', monospace);
    flex-shrink: 0;
}
.toolbox-tool.active .toolbox-tool-shortcut {
    background: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.85);
}
`;

module.exports = Toolbox;