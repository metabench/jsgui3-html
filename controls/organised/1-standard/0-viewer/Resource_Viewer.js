
const jsgui = require('../../../../html-core/html-core');
const { each, tof } = jsgui;
const Control = jsgui.Control;
const { field, prop } = require('obext');
const Property_Viewer = require('./Property_Viewer');

class Resource_Viewer extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'resource_viewer';
        super(spec);

        this.add_class('resource-viewer');

        field(this.view.data.model, 'resource');
        field(this.view.data.model, 'expanded');

        if (spec.resource) {
            this.view.data.model.resource = spec.resource;
        }

        if (spec.expandable !== undefined) {
            this.expandable = spec.expandable;
        } else {
            this.expandable = true; // Default
        }

        if (spec.onAction) {
            this.on('action', spec.onAction);
        }

        // Initialize state
        this.view.data.model.expanded = false;

        this.view.data.model.on('change', (e) => {
            if (e.name === 'resource') {
                this.refresh_view();
            }
            if (e.name === 'expanded') {
                this.toggle_details_view(e.value);
            }
        });

        if (!spec.abstract && !spec.el) {
            this.compose_viewer();
        }
    }

    compose_viewer() {
        this.refresh_view();
    }

    refresh_view() {
        this.content.clear();
        const { context } = this;
        const resource = this.view.data.model.resource || {};

        // 1. Header Section
        const header = new Control({ context });
        header.add_class('resource-header');

        if (this.expandable) {
            header.add_class('expandable');
            header.on('click', () => {
                this.view.data.model.expanded = !this.view.data.model.expanded;
            });
        }

        // Icon
        if (resource.icon) {
            const icon = new Control({ context });
            icon.add_class('resource-icon');
            icon.add(resource.icon);
            header.add(icon);
        }

        // Name / Title
        const name = new Control({ context });
        name.add_class('resource-name');
        name.add(resource.name || 'Resource');
        header.add(name);

        // Type Badge
        if (resource.type) {
            const badge = new Control({ context });
            badge.add_class('resource-badge');
            badge.add(resource.type);
            header.add(badge);
        }

        // Status Indicator
        if (resource.status) {
            const status = new Control({ context });
            status.add_class('resource-status');
            const status_color = this.get_status_color(resource.status);
            status.add_class(`status-${status_color}`);
            header.add(status);
        }

        this.add(header);

        // Optional Description (in header or below? Design says below name in header block maybe?)
        // Let's put description inside header or just below it but always visible?
        // Layout:
        // [Icon] [Name] [Badge] [Status]
        //        [Description]

        if (resource.description) {
            const desc = new Control({ context });
            desc.add_class('resource-description');
            desc.add(resource.description);
            // Insert into header? Complex layout. 
            // Let's make header a flex row, and maybe wrap lines if needed.
            // Or add description as a separate block below the main title line but still in "header area".
            // Implementation: Keep it simple. Add description row below title row if needed.
            // But for now, let's just append it to the main container, maybe styled lightly.
            this.add(desc);
        }


        // 2. Details Section (Expandable)
        if (this.expandable && resource.properties) {
            const details = new Control({ context });
            details.add_class('resource-details');

            // Create Property Viewer
            const props_viewer = new Property_Viewer({
                context,
                data: resource.properties,
                schema: resource.properties.schema // If schema is embedded or passed separately
            });

            details.add(props_viewer);

            this.ctrl_details = details;
            this.add(details);

            // Initial State check
            if (!this.view.data.model.expanded) {
                details.add_class('hidden');
            }
        }

        // 3. Actions Toolbar
        // Assuming we might have actions passed in spec or part of resource def? 
        // User request: "Optional action buttons" -> onAction callback.
        // Where do buttons come from? Maybe defined in spec?
        // Let's assume some defaults or mechanism to add. 
        // For now, if "actions" array is in resource, render them.

        if (resource.actions && Array.isArray(resource.actions)) {
            const actions_bar = new Control({ context });
            actions_bar.add_class('resource-actions');

            each(resource.actions, action => {
                const btn = new Control({ context, tag_name: 'button' });
                btn.add_class('resource-action-btn');
                btn.add(action.label || action.name);
                btn.on('click', (e) => {
                    e.stopPropagation();
                    this.raise('action', { action: action.name, resource });
                });
                actions_bar.add(btn);
            });

            this.add(actions_bar);
        }
    }

    toggle_details_view(expanded) {
        if (this.ctrl_details) {
            if (expanded) {
                this.ctrl_details.remove_class('hidden');
                this.add_class('expanded');
            } else {
                this.ctrl_details.add_class('hidden');
                this.remove_class('expanded');
            }
        }
    }

    get_status_color(status) {
        // Simple mapping
        const map = {
            active: 'green',
            online: 'green',
            running: 'green',
            paused: 'yellow',
            warning: 'yellow',
            stopped: 'red',
            error: 'red',
            offline: 'gray'
        };
        return map[status] || 'gray';
    }
}

Resource_Viewer.css = `
.resource-viewer {
    display: flex;
    flex-direction: column;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    overflow: hidden;
    margin-bottom: 8px;
    font-family: 'Segoe UI', sans-serif;
}

.resource-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #f9fafb;
    border-bottom: 1px solid transparent;
    transition: background-color 0.2s;
}

.resource-header.expandable {
    cursor: pointer;
}
.resource-header.expandable:hover {
    background-color: #f3f4f6;
}

.resource-viewer.expanded .resource-header {
    border-bottom-color: #e5e7eb;
}

.resource-icon {
    font-size: 20px;
    margin-right: 12px;
}

.resource-name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-right: 12px;
}

.resource-badge {
    background-color: #e5e7eb;
    color: #374151;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: auto; /* Push status to right */
    letter-spacing: 0.5px;
}

.resource-status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-left: 12px;
}
.status-green { background-color: #10b981; }
.status-yellow { background-color: #f59e0b; }
.status-red { background-color: #ef4444; }
.status-gray { background-color: #9ca3af; }

.resource-description {
    padding: 0 16px 12px 48px; /* Indent under name */
    background-color: #f9fafb;
    color: #6b7280;
    font-size: 13px;
    margin-top: -8px; /* Pull up closer to header */
}

.resource-details {
    padding: 16px;
    background-color: #fff;
}

.resource-details.hidden {
    display: none;
}

.resource-actions {
    padding: 12px 16px;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
}

.resource-action-btn {
    padding: 6px 12px;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.1s;
}

.resource-action-btn:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
}

`;

module.exports = Resource_Viewer;
