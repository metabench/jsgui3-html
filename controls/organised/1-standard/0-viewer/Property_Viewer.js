
const jsgui = require('../../../../html-core/html-core');
const { each, tof } = jsgui;
const Control = jsgui.Control;
const { field, prop } = require('obext');

class Property_Viewer extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'property_viewer';
        super(spec);

        this.add_class('property-viewer');

        field(this.view.data.model, 'data');
        field(this.view.data.model, 'schema');

        // Initial data
        if (spec.data) this.view.data.model.data = spec.data;
        if (spec.schema) this.view.data.model.schema = spec.schema;

        this.view.data.model.on('change', (e) => {
            if (e.name === 'data' || e.name === 'schema') {
                this.refresh_view();
            }
        });

        if (!spec.abstract && !spec.el) {
            this.compose_viewer();
        }
    }

    compose_viewer() {
        this.add_class('property-viewer');
        this.refresh_view();
    }

    set_data(data) {
        this.view.data.model.data = data;
        // The change event listener will trigger refresh_view
    }

    refresh_view() {
        // Clear existing content
        this.content.clear();

        const { context } = this;
        const data = this.view.data.model.data || {};
        const schema = this.view.data.model.schema || {};

        // Iterate through schema (or data keys if no schema?)
        // Better to drive by schema if available, else keys.

        const keys = Object.keys(schema).length > 0 ? Object.keys(schema) : Object.keys(data);

        each(keys, key => {
            const field_schema = schema[key] || {};
            const value = data[key];
            const label_text = field_schema.label || key;
            const type = field_schema.type || 'string';

            const row = new Control({ context });
            row.add_class('property-row');

            // Label
            const label = new Control({ context });
            label.add_class('property-label');
            label.add(label_text);
            row.add(label);

            // Value
            const value_container = new Control({ context });
            value_container.add_class('property-value');

            this.render_value(value_container, value, type, field_schema);

            row.add(value_container);
            this.add(row);
        });
    }

    render_value(container, value, type, schema) {
        const { context } = this;

        if (value === undefined || value === null) {
            container.add('-');
            return;
        }

        if (type === 'badge') {
            const badge = new Control({ context });
            badge.add_class('property-value--badge');
            if (schema.badgeClass) badge.add_class(schema.badgeClass);
            badge.add(String(value));
            container.add(badge);

        } else if (type === 'status') {
            const status_wrapper = new Control({ context });
            status_wrapper.add_class('property-value--status-wrapper');

            const dot = new Control({ context });
            dot.add_class('status-dot');

            const status_map = schema.statusMap || { active: 'green', inactive: 'red' };
            const color = status_map[value] || 'gray';
            dot.add_class(`status-${color}`);

            status_wrapper.add(dot);

            const text = new Control({ context });
            text.add(String(value));
            status_wrapper.add(text);

            container.add(status_wrapper);

        } else if (type === 'link') {
            const link = new Control({ context, tag_name: 'a' });
            link.add_class('property-value--link');
            link.dom.attributes.href = value;
            link.add(String(value));
            container.add(link);

        } else if (type === 'code') {
            const code = new Control({ context, tag_name: 'code' });
            code.add_class('property-value--code');
            code.add(String(value));
            container.add(code);

        } else if (type === 'date') {
            // Simple date formatting
            let date_str = value;
            try {
                if (value instanceof Date) {
                    date_str = value.toLocaleString();
                } else {
                    date_str = new Date(value).toLocaleString();
                }
            } catch (e) { }
            container.add(date_str);

        } else {
            // Default string/number
            container.add(String(value));
        }
    }
}

Property_Viewer.css = `
.property-viewer {
    display: flex;
    flex-direction: column;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
    width: 100%;
}

.property-row {
    display: flex;
    flex-direction: row;
    padding: 6px 0;
    border-bottom: 1px solid #eee;
}

.property-row:last-child {
    border-bottom: none;
}

.property-label {
    width: 140px;
    color: #666;
    font-weight: 500;
    padding-right: 12px;
    flex-shrink: 0;
}

.property-value {
    color: #222;
    flex-grow: 1;
    word-break: break-word;
}

.property-value--badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    background-color: #e0e0e0;
    font-size: 12px;
    font-weight: 600;
    color: #444;
}

.property-value--badge.type-badge {
    background-color: #e3f2fd;
    color: #1565c0;
}

.property-value--status-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ccc;
    display: inline-block;
}

.status-green { background-color: #4caf50; }
.status-yellow { background-color: #ffc107; }
.status-red { background-color: #f44336; }
.status-gray { background-color: #9e9e9e; }

.property-value--link {
    color: #0366d6;
    text-decoration: none;
}
.property-value--link:hover {
    text-decoration: underline;
}

.property-value--code {
    font-family: Consolas, monospace;
    background-color: #f6f8fa;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 13px;
}
`;

module.exports = Property_Viewer;
