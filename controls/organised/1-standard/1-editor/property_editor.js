/**
 * Property_Editor - A panel for editing properties of selected items
 * 
 * Features:
 * - Dynamic property fields based on item type
 * - Label, placeholder, required, validation editing
 * - Real-time updates
 * - Type-specific editors
 */

const Panel = require('../6-layout/panel');
const Control = require('../../../../html-core/control');
const Text_Input = require('../../0-core/0-basic/0-native-compositional/Text_Input');
const Checkbox = require('../../0-core/0-basic/0-native-compositional/checkbox');

class Property_Editor extends Panel {
    constructor(options = {}) {
        super(options);
        
        this.add_class('property-editor');
        
        const { context } = this;
        
        // Header
        this.header = new Control({ context, tag_name: 'div' });
        this.header.add_class('property-editor-header');
        this.header_title = new Control({ context, tag_name: 'h3' });
        this.header_title.add('Properties');
        this.header.add(this.header_title);
        this.add(this.header);
        
        // Properties container
        this.properties_container = new Control({ context, tag_name: 'div' });
        this.properties_container.add_class('property-editor-properties');
        this.add(this.properties_container);
        
        // No selection message
        this.no_selection_message = new Control({ context, tag_name: 'div' });
        this.no_selection_message.add_class('property-editor-no-selection');
        this.no_selection_message.add('Select a field to edit its properties');
        this.properties_container.add(this.no_selection_message);
        
        this.current_item = null;
        this.property_fields = {};
    }
    
    /**
     * Load properties for an item
     */
    load_item(item, on_change) {
        this.current_item = item;
        this.on_change = on_change;
        this.property_fields = {};
        
        // Clear container
        this.properties_container.content.clear();
        
        if (!item) {
            this.properties_container.add(this.no_selection_message);
            return;
        }
        
        const { context } = this;
        const properties = item.properties || {};
        
        // Field Type (read-only)
        this._add_property_group(context, 'Field Type', properties.type || 'text', null, true);
        
        // Label
        this._add_property_group(context, 'Label', properties.label || '', (value) => {
            properties.label = value;
            if (this.on_change) this.on_change();
        });
        
        // Name/ID
        this._add_property_group(context, 'Name/ID', properties.name || '', (value) => {
            properties.name = value;
            if (this.on_change) this.on_change();
        });
        
        // Placeholder (for text inputs)
        if (['text', 'email', 'password', 'number', 'url', 'tel', 'textarea'].includes(properties.type)) {
            this._add_property_group(context, 'Placeholder', properties.placeholder || '', (value) => {
                properties.placeholder = value;
                if (this.on_change) this.on_change();
            });
        }
        
        // Required
        this._add_property_checkbox(context, 'Required', properties.required || false, (checked) => {
            properties.required = checked;
            if (this.on_change) this.on_change();
        });
        
        // Options (for select fields)
        if (properties.type === 'select') {
            this._add_property_group(context, 'Options (comma-separated)', 
                (properties.options || []).join(', '), 
                (value) => {
                    properties.options = value.split(',').map(s => s.trim()).filter(s => s);
                    if (this.on_change) this.on_change();
                }
            );
        }
        
        // Width
        this._add_property_group(context, 'Width (%)', properties.width || '100', (value) => {
            properties.width = value;
            if (this.on_change) this.on_change();
        });
        
        // Delete button
        const delete_btn = new Control({ context, tag_name: 'button' });
        delete_btn.add_class('property-editor-delete-btn');
        delete_btn.add('Delete Field');
        delete_btn.on('click', () => {
            if (this.on_delete) this.on_delete(item);
        });
        this.properties_container.add(delete_btn);
    }
    
    _add_property_group(context, label, value, on_change, read_only = false) {
        const group = new Control({ context, tag_name: 'div' });
        group.add_class('property-group');
        
        const label_el = new Control({ context, tag_name: 'label' });
        label_el.add_class('property-label');
        label_el.add(label);
        group.add(label_el);
        
        const input = new Text_Input({ context });
        input.add_class('property-input');
        input.dom.el.value = value;
        if (read_only) input.dom.el.disabled = true;
        
        if (on_change && !read_only) {
            input.on('input', () => {
                on_change(input.dom.el.value);
            });
        }
        
        group.add(input);
        this.properties_container.add(group);
        
        this.property_fields[label] = input;
        
        return group;
    }
    
    _add_property_checkbox(context, label, checked, on_change) {
        const group = new Control({ context, tag_name: 'div' });
        group.add_class('property-group');
        group.add_class('property-group-checkbox');
        
        const checkbox = new Checkbox({ context });
        checkbox.add_class('property-checkbox');
        checkbox.dom.el.checked = checked;
        
        if (on_change) {
            checkbox.on('change', () => {
                on_change(checkbox.dom.el.checked);
            });
        }
        
        const label_el = new Control({ context, tag_name: 'label' });
        label_el.add_class('property-label');
        label_el.add(label);
        
        group.add(checkbox);
        group.add(label_el);
        this.properties_container.add(group);
        
        this.property_fields[label] = checkbox;
        
        return group;
    }
    
    /**
     * Set the delete callback
     */
    set_on_delete(callback) {
        this.on_delete = callback;
    }
}

module.exports = Property_Editor;
