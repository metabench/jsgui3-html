/**
 * PropertyEditor - A panel for editing properties of selected items
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

class PropertyEditor extends Panel {
    constructor(options = {}) {
        super(options);
        
        this.add_class('property-editor');
        
        const { context } = this;
        
        // Header
        this.header = new Control({ context, tag_name: 'div' });
        this.header.add_class('property-editor-header');
        this.headerTitle = new Control({ context, tag_name: 'h3' });
        this.headerTitle.add('Properties');
        this.header.add(this.headerTitle);
        this.add(this.header);
        
        // Properties container
        this.propertiesContainer = new Control({ context, tag_name: 'div' });
        this.propertiesContainer.add_class('property-editor-properties');
        this.add(this.propertiesContainer);
        
        // No selection message
        this.noSelectionMessage = new Control({ context, tag_name: 'div' });
        this.noSelectionMessage.add_class('property-editor-no-selection');
        this.noSelectionMessage.add('Select a field to edit its properties');
        this.propertiesContainer.add(this.noSelectionMessage);
        
        this.currentItem = null;
        this.propertyFields = {};
    }
    
    /**
     * Load properties for an item
     */
    loadItem(item, onChange) {
        this.currentItem = item;
        this.onChange = onChange;
        this.propertyFields = {};
        
        // Clear container
        this.propertiesContainer.content.clear();
        
        if (!item) {
            this.propertiesContainer.add(this.noSelectionMessage);
            return;
        }
        
        const { context } = this;
        const properties = item.properties || {};
        
        // Field Type (read-only)
        this._addPropertyGroup(context, 'Field Type', properties.type || 'text', null, true);
        
        // Label
        this._addPropertyGroup(context, 'Label', properties.label || '', (value) => {
            properties.label = value;
            if (this.onChange) this.onChange();
        });
        
        // Name/ID
        this._addPropertyGroup(context, 'Name/ID', properties.name || '', (value) => {
            properties.name = value;
            if (this.onChange) this.onChange();
        });
        
        // Placeholder (for text inputs)
        if (['text', 'email', 'password', 'number', 'url', 'tel', 'textarea'].includes(properties.type)) {
            this._addPropertyGroup(context, 'Placeholder', properties.placeholder || '', (value) => {
                properties.placeholder = value;
                if (this.onChange) this.onChange();
            });
        }
        
        // Required
        this._addPropertyCheckbox(context, 'Required', properties.required || false, (checked) => {
            properties.required = checked;
            if (this.onChange) this.onChange();
        });
        
        // Options (for select fields)
        if (properties.type === 'select') {
            this._addPropertyGroup(context, 'Options (comma-separated)', 
                (properties.options || []).join(', '), 
                (value) => {
                    properties.options = value.split(',').map(s => s.trim()).filter(s => s);
                    if (this.onChange) this.onChange();
                }
            );
        }
        
        // Width
        this._addPropertyGroup(context, 'Width (%)', properties.width || '100', (value) => {
            properties.width = value;
            if (this.onChange) this.onChange();
        });
        
        // Delete button
        const deleteBtn = new Control({ context, tag_name: 'button' });
        deleteBtn.add_class('property-editor-delete-btn');
        deleteBtn.add('Delete Field');
        deleteBtn.on('click', () => {
            if (this.onDelete) this.onDelete(item);
        });
        this.propertiesContainer.add(deleteBtn);
    }
    
    _addPropertyGroup(context, label, value, onChange, readOnly = false) {
        const group = new Control({ context, tag_name: 'div' });
        group.add_class('property-group');
        
        const labelEl = new Control({ context, tag_name: 'label' });
        labelEl.add_class('property-label');
        labelEl.add(label);
        group.add(labelEl);
        
        const input = new Text_Input({ context });
        input.add_class('property-input');
        input.dom.el.value = value;
        if (readOnly) input.dom.el.disabled = true;
        
        if (onChange && !readOnly) {
            input.on('input', () => {
                onChange(input.dom.el.value);
            });
        }
        
        group.add(input);
        this.propertiesContainer.add(group);
        
        this.propertyFields[label] = input;
        
        return group;
    }
    
    _addPropertyCheckbox(context, label, checked, onChange) {
        const group = new Control({ context, tag_name: 'div' });
        group.add_class('property-group');
        group.add_class('property-group-checkbox');
        
        const checkbox = new Checkbox({ context });
        checkbox.add_class('property-checkbox');
        checkbox.dom.el.checked = checked;
        
        if (onChange) {
            checkbox.on('change', () => {
                onChange(checkbox.dom.el.checked);
            });
        }
        
        const labelEl = new Control({ context, tag_name: 'label' });
        labelEl.add_class('property-label');
        labelEl.add(label);
        
        group.add(checkbox);
        group.add(labelEl);
        this.propertiesContainer.add(group);
        
        this.propertyFields[label] = checkbox;
        
        return group;
    }
    
    /**
     * Set the delete callback
     */
    setOnDelete(callback) {
        this.onDelete = callback;
    }
}

module.exports = PropertyEditor;
