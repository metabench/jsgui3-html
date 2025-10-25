/**
 * WYSIWYG Form Builder - Client Side
 * 
 * A complete visual form builder that demonstrates:
 * - Drag-and-drop or click-to-add field creation
 * - Real-time property editing
 * - Field reordering
 * - Form preview mode
 * - JSON export/import
 * - Local storage persistence
 * - Field types: text, email, password, number, select, checkbox, textarea
 */

const jsgui = require('../../html');
const { Data_Object } = require('lang-tools');
const { Control, Active_HTML_Document } = jsgui;
const Data_Model_View_Model_Control = require('../../html-core/Data_Model_View_Model_Control');
const Toolbar = require('../../controls/organised/1-standard/5-ui/Toolbar');
const PropertyEditor = require('../../controls/organised/1-standard/1-editor/PropertyEditor');
const Panel = require('../../controls/organised/1-standard/6-layout/panel');
const Button = require('../../controls/organised/0-core/0-basic/0-native-compositional/button');
const mx = require('../../control_mixins/mx');

/**
 * Palette Item - Draggable field type button
 */
class PaletteItem extends Control {
    constructor(options = {}) {
        super(options);
        
        const { context, fieldType, icon, label } = options;
        
        this.fieldType = fieldType;
        this.add_class('palette-item');
        this.dom.attributes['data-field-type'] = fieldType;
        
        // Icon
        if (icon) {
            this.icon = new Control({ context, tag_name: 'span' });
            this.icon.add_class('palette-item-icon');
            this.icon.add(icon);
            this.add(this.icon);
        }
        
        // Label
        this.label = new Control({ context, tag_name: 'span' });
        this.label.add_class('palette-item-label');
        this.label.add(label);
        this.add(this.label);
    }
}

/**
 * Form Field Preview - Visual representation of a form field in the builder
 */
class FormFieldPreview extends Control {
    constructor(options = {}) {
        super(options);
        
        const { context, properties, index } = options;
        
        this.properties = properties;
        this.fieldIndex = index;
        this.add_class('form-field-preview');
        this.dom.attributes['data-index'] = index;
        
        // Field header with controls
        this.header = new Control({ context, tag_name: 'div' });
        this.header.add_class('field-preview-header');
        
        this.typeLabel = new Control({ context, tag_name: 'span' });
        this.typeLabel.add_class('field-type-label');
        this.typeLabel.add(properties.type.toUpperCase());
        this.header.add(this.typeLabel);
        
        this.moveUpBtn = new Control({ context, tag_name: 'button' });
        this.moveUpBtn.add_class('field-move-btn');
        this.moveUpBtn.add('↑');
        this.moveUpBtn.dom.attributes.title = 'Move up';
        this.header.add(this.moveUpBtn);
        
        this.moveDownBtn = new Control({ context, tag_name: 'button' });
        this.moveDownBtn.add_class('field-move-btn');
        this.moveDownBtn.add('↓');
        this.moveDownBtn.dom.attributes.title = 'Move down';
        this.header.add(this.moveDownBtn);
        
        this.add(this.header);
        
        // Field preview content
        this.preview = new Control({ context, tag_name: 'div' });
        this.preview.add_class('field-preview-content');
        this._renderPreview(context);
        this.add(this.preview);
    }
    
    _renderPreview(context) {
        this.preview.content.clear();
        
        const { label, placeholder, required, type, options } = this.properties;
        
        // Label
        if (label) {
            const labelEl = new Control({ context, tag_name: 'div' });
            labelEl.add_class('preview-label');
            labelEl.add(label);
            if (required) labelEl.add(' *');
            this.preview.add(labelEl);
        }
        
        // Input preview
        const inputPreview = new Control({ context, tag_name: 'div' });
        inputPreview.add_class('preview-input');
        inputPreview.add_class(`preview-input-${type}`);
        
        if (type === 'checkbox') {
            inputPreview.add('☐ ' + (label || 'Checkbox'));
        } else if (type === 'select' && options && options.length > 0) {
            inputPreview.add(`⌄ ${options[0]} ...`);
        } else if (type === 'textarea') {
            inputPreview.add(placeholder || 'Text area...');
            inputPreview.add_class('preview-textarea');
        } else {
            inputPreview.add(placeholder || `Enter ${type}...`);
        }
        
        this.preview.add(inputPreview);
    }
    
    updatePreview() {
        const context = this.context;
        this._renderPreview(context);
        this.typeLabel.content.clear();
        this.typeLabel.add(this.properties.type.toUpperCase());
    }
}

/**
 * Main Form Builder Control
 */
class FormBuilder extends Data_Model_View_Model_Control {
    constructor(options) {
        options.__type_name = options.__type_name || 'form_builder';
        super(options);
        
        const { context } = this;
        
        this.add_class('form-builder');
        
        // Create the data model (runs on both server and client)
        this.model = new Data_Object({
            fields: [],
            selectedFieldIndex: null,
            mode: 'edit', // edit or preview
            formTitle: 'Untitled Form'
        });
        
        // Create main layout
        this._createLayout(context);
        
        // Load from localStorage if available
        this._loadFromStorage();
    }
    
    _createLayout(context) {
        // Top toolbar
        this.toolbar = new Toolbar({ context });
        this.toolbar.add_class('form-builder-toolbar');
        
        this.toolbar.addButton({
            icon: '📄',
            label: 'New',
            tooltip: 'New form',
            onClick: () => this._newForm()
        });
        
        this.toolbar.addButton({
            icon: '💾',
            label: 'Save',
            tooltip: 'Save to localStorage',
            onClick: () => this._saveToStorage()
        });
        
        this.toolbar.addButton({
            icon: '📥',
            label: 'Export',
            tooltip: 'Export JSON',
            onClick: () => this._exportJSON()
        });
        
        this.toolbar.addButton({
            icon: '📤',
            label: 'Import',
            tooltip: 'Import JSON',
            onClick: () => this._importJSON()
        });
        
        this.toolbar.addSeparator();
        
        this.previewBtn = this.toolbar.addButton({
            icon: '👁',
            label: 'Preview',
            tooltip: 'Toggle preview mode',
            onClick: () => this._togglePreview()
        });
        
        this.toolbar.addSeparator();
        
        this.toolbar.addButton({
            icon: '🗑',
            label: 'Clear',
            tooltip: 'Clear all fields',
            onClick: () => this._clearForm()
        });
        
        this.add(this.toolbar);
        
        // Main container
        this.mainContainer = new Control({ context, tag_name: 'div' });
        this.mainContainer.add_class('form-builder-main');
        this.add(this.mainContainer);
        
        // Left panel - Field palette
        this.palettePanel = new Panel({ context });
        this.palettePanel.add_class('palette-panel');
        
        const paletteTitle = new Control({ context, tag_name: 'h3' });
        paletteTitle.add('Field Types');
        this.palettePanel.add(paletteTitle);
        
        this._createPalette(context);
        
        this.mainContainer.add(this.palettePanel);
        
        // Center panel - Form canvas
        this.canvasPanel = new Panel({ context });
        this.canvasPanel.add_class('canvas-panel');
        
        // Form title editor
        this.formTitleContainer = new Control({ context, tag_name: 'div' });
        this.formTitleContainer.add_class('form-title-container');
        
        this.formTitleInput = new Control({ context, tag_name: 'input' });
        this.formTitleInput.add_class('form-title-input');
        this.formTitleInput.dom.attributes.placeholder = 'Form Title';
        // Set value only if on client (dom.el exists)
        if (this.formTitleInput.dom.el) {
            this.formTitleInput.dom.el.value = this.model.get('formTitle');
        }
        this.formTitleContainer.add(this.formTitleInput);
        
        this.canvasPanel.add(this.formTitleContainer);
        
        // Form fields container
        this.formCanvas = new Control({ context, tag_name: 'div' });
        this.formCanvas.add_class('form-canvas');
        
        this.emptyMessage = new Control({ context, tag_name: 'div' });
        this.emptyMessage.add_class('canvas-empty-message');
        this.emptyMessage.add('Click a field type to add it to your form');
        this.formCanvas.add(this.emptyMessage);
        
        this.canvasPanel.add(this.formCanvas);
        
        this.mainContainer.add(this.canvasPanel);
        
        // Right panel - Properties
        this.propertyEditor = new PropertyEditor({ context });
        this.propertyEditor.add_class('form-builder-properties');
        this.propertyEditor.setOnDelete((item) => this._deleteField(item.index));
        
        this.mainContainer.add(this.propertyEditor);
    }
    
    _createPalette(context) {
        const fieldTypes = [
            { type: 'text', icon: '📝', label: 'Text Input' },
            { type: 'email', icon: '📧', label: 'Email' },
            { type: 'password', icon: '🔒', label: 'Password' },
            { type: 'number', icon: '🔢', label: 'Number' },
            { type: 'tel', icon: '📞', label: 'Phone' },
            { type: 'url', icon: '🔗', label: 'URL' },
            { type: 'textarea', icon: '📄', label: 'Text Area' },
            { type: 'select', icon: '📋', label: 'Dropdown' },
            { type: 'checkbox', icon: '☑', label: 'Checkbox' }
        ];
        
        fieldTypes.forEach(field => {
            const item = new PaletteItem({
                context,
                fieldType: field.type,
                icon: field.icon,
                label: field.label
            });
            
            this.palettePanel.add(item);
        });
    }
    
    activate() {
        if (!this.__active) {
            super.activate();
            
            // Form title change handler
            this.formTitleInput.on('input', () => {
                this.model.set('formTitle', this.formTitleInput.dom.el.value);
                this._saveToStorage();
            });
            
            // Palette item click handlers
            const paletteItems = this.palettePanel.dom.el.querySelectorAll('.palette-item');
            paletteItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const fieldType = item.getAttribute('data-field-type');
                    this._addField(fieldType);
                });
            });
        }
    }
    
    _addField(type) {
        const fields = this.model.get('fields') || [];
        
        const newField = {
            type: type,
            label: this._getDefaultLabel(type),
            name: `field_${fields.length + 1}`,
            placeholder: '',
            required: false,
            width: '100',
            options: type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : []
        };
        
        fields.push(newField);
        this.model.set('fields', fields);
        
        this._renderCanvas();
        this._selectField(fields.length - 1);
        this._saveToStorage();
    }
    
    _getDefaultLabel(type) {
        const labels = {
            text: 'Text Field',
            email: 'Email Address',
            password: 'Password',
            number: 'Number',
            tel: 'Phone Number',
            url: 'Website URL',
            textarea: 'Comments',
            select: 'Select Option',
            checkbox: 'I agree'
        };
        return labels[type] || 'Field';
    }
    
    _renderCanvas() {
        const fields = this.model.get('fields') || [];
        const mode = this.model.get('mode');
        
        this.formCanvas.content.clear();
        
        if (fields.length === 0) {
            this.formCanvas.add(this.emptyMessage);
            return;
        }
        
        if (mode === 'preview') {
            this._renderPreviewMode(fields);
        } else {
            this._renderEditMode(fields);
        }
    }
    
    _renderEditMode(fields) {
        const context = this.context;
        
        fields.forEach((field, index) => {
            const fieldPreview = new FormFieldPreview({
                context,
                properties: field,
                index: index
            });
            
            // Click to select
            fieldPreview.on('click', (e) => {
                if (!e.target.closest('.field-move-btn')) {
                    this._selectField(index);
                }
            });
            
            // Move up
            fieldPreview.moveUpBtn.on('click', (e) => {
                e.stopPropagation();
                this._moveField(index, -1);
            });
            
            // Move down
            fieldPreview.moveDownBtn.on('click', (e) => {
                e.stopPropagation();
                this._moveField(index, 1);
            });
            
            // Highlight if selected
            if (index === this.model.get('selectedFieldIndex')) {
                fieldPreview.add_class('selected');
            }
            
            this.formCanvas.add(fieldPreview);
        });
    }
    
    _renderPreviewMode(fields) {
        const context = this.context;
        
        const FormField = require('../../controls/organised/1-standard/1-editor/FormField');
        
        fields.forEach((field, index) => {
            const formField = new FormField({
                context,
                label: field.label,
                name: field.name,
                type: field.type,
                placeholder: field.placeholder,
                required: field.required
            });
            
            // Set width
            if (field.width) {
                formField.dom.el.style.width = field.width + '%';
            }
            
            // Add options for select
            if (field.type === 'select' && field.options) {
                field.options.forEach(opt => {
                    const option = new Control({ context, tag_name: 'option' });
                    option.dom.el.value = opt;
                    option.add(opt);
                    formField.input.add(option);
                });
            }
            
            this.formCanvas.add(formField);
        });
        
        // Add submit button in preview
        const submitBtn = new Button({ context });
        submitBtn.add('Submit');
        submitBtn.add_class('form-preview-submit');
        submitBtn.on('click', () => {
            alert('This is a preview. The form does not actually submit.');
        });
        this.formCanvas.add(submitBtn);
    }
    
    _selectField(index) {
        const fields = this.model.get('fields') || [];
        
        if (index < 0 || index >= fields.length) {
            this.model.set('selectedFieldIndex', null);
            this.propertyEditor.loadItem(null);
            this._renderCanvas();
            return;
        }
        
        this.model.set('selectedFieldIndex', index);
        
        const field = fields[index];
        this.propertyEditor.loadItem({ properties: field, index }, () => {
            // On property change, re-render and save
            this._renderCanvas();
            this._saveToStorage();
        });
        
        this._renderCanvas();
    }
    
    _deleteField(index) {
        const fields = this.model.get('fields') || [];
        fields.splice(index, 1);
        this.model.set('fields', fields);
        this.model.set('selectedFieldIndex', null);
        this.propertyEditor.loadItem(null);
        this._renderCanvas();
        this._saveToStorage();
    }
    
    _moveField(index, direction) {
        const fields = this.model.get('fields') || [];
        const newIndex = index + direction;
        
        if (newIndex < 0 || newIndex >= fields.length) return;
        
        // Swap
        [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
        this.model.set('fields', fields);
        
        // Update selection
        const selectedIndex = this.model.get('selectedFieldIndex');
        if (selectedIndex === index) {
            this.model.set('selectedFieldIndex', newIndex);
        } else if (selectedIndex === newIndex) {
            this.model.set('selectedFieldIndex', index);
        }
        
        this._renderCanvas();
        this._selectField(this.model.get('selectedFieldIndex'));
        this._saveToStorage();
    }
    
    _togglePreview() {
        const currentMode = this.model.get('mode');
        const newMode = currentMode === 'edit' ? 'preview' : 'edit';
        this.model.set('mode', newMode);
        
        if (newMode === 'preview') {
            this.previewBtn.content.clear();
            this.previewBtn.add('✏️ Edit');
            this.palettePanel.add_class('hidden');
            this.propertyEditor.add_class('hidden');
            this.toolbar.add_class('preview-mode');
        } else {
            this.previewBtn.content.clear();
            this.previewBtn.add('👁 Preview');
            this.palettePanel.remove_class('hidden');
            this.propertyEditor.remove_class('hidden');
            this.toolbar.remove_class('preview-mode');
        }
        
        this._renderCanvas();
    }
    
    _newForm() {
        if (confirm('Create a new form? This will clear the current form.')) {
            this.model.set('fields', []);
            this.model.set('selectedFieldIndex', null);
            this.model.set('formTitle', 'Untitled Form');
            this.formTitleInput.dom.el.value = 'Untitled Form';
            this.propertyEditor.loadItem(null);
            this._renderCanvas();
            this._saveToStorage();
        }
    }
    
    _clearForm() {
        if (confirm('Clear all fields?')) {
            this.model.set('fields', []);
            this.model.set('selectedFieldIndex', null);
            this.propertyEditor.loadItem(null);
            this._renderCanvas();
            this._saveToStorage();
        }
    }
    
    _exportJSON() {
        const formData = {
            title: this.model.get('formTitle'),
            fields: this.model.get('fields')
        };
        
        const json = JSON.stringify(formData, null, 2);
        
        // Create download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (formData.title || 'form').replace(/\s+/g, '-').toLowerCase() + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    _importJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const formData = JSON.parse(event.target.result);
                    
                    if (formData.title) {
                        this.model.set('formTitle', formData.title);
                        this.formTitleInput.dom.el.value = formData.title;
                    }
                    
                    if (Array.isArray(formData.fields)) {
                        this.model.set('fields', formData.fields);
                        this.model.set('selectedFieldIndex', null);
                        this.propertyEditor.loadItem(null);
                        this._renderCanvas();
                        this._saveToStorage();
                    }
                } catch (err) {
                    alert('Error parsing JSON: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    _saveToStorage() {
        if (typeof localStorage !== 'undefined') {
            const formData = {
                title: this.model.get('formTitle'),
                fields: this.model.get('fields')
            };
            localStorage.setItem('formBuilder_currentForm', JSON.stringify(formData));
        }
    }
    
    _loadFromStorage() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('formBuilder_currentForm');
            if (saved) {
                try {
                    const formData = JSON.parse(saved);
                    if (formData.title) {
                        this.model.set('formTitle', formData.title);
                        this.formTitleInput.dom.el.value = formData.title;
                    }
                    if (Array.isArray(formData.fields)) {
                        this.model.set('fields', formData.fields);
                        this._renderCanvas();
                    }
                } catch (err) {
                    console.error('Error loading from localStorage:', err);
                }
            }
        }
    }
}

/**
 * Demo UI wrapper
 */
class Demo_UI extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'wysiwyg_demo_ui';
        super(spec);
        
        const { context } = this;

        if (typeof this.body.add_class === 'function') {
            this.body.add_class('wysiwyg-body');
        }

        if (!spec.el) {
            if (this.head) {
                const title = new Control({ context, tag_name: 'title' });
                title.add('WYSIWYG Form Builder');
                this.head.add(title);
            }

            const container = new Control({ context, tag_name: 'div' });
            container.add_class('wysiwyg-demo');

            this.formBuilder = new FormBuilder({ context });
            container.add(this.formBuilder);

            if (this.body) {
                this.body.add(container);
            } else {
                this.add(container);
            }
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
        }
    }
}

// Export for server
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Demo_UI, FormBuilder };
}
