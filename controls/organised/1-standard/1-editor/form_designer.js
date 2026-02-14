const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

class Form_Designer extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'form_designer';
        super(spec);

        themeable(this, 'form_designer', spec);

        this.add_class('form-designer');
        this.add_class('jsgui-form-designer');

        this.fields = Array.isArray(spec.fields) ? spec.fields.map(this._normalize_field) : [];

        this.dom.attributes.role = 'region';
        this.dom.attributes['aria-label'] = spec.aria_label || 'Form designer';

        if (!spec.el) {
            this.compose();
        }
    }

    _normalize_field(field, index = 0) {
        const id = field && field.id ? String(field.id) : `field_${index + 1}`;
        return {
            id,
            label: field && field.label ? String(field.label) : id,
            type: field && field.type ? String(field.type) : 'text',
            required: !!(field && field.required)
        };
    }

    compose() {
        const { context } = this;
        this.clear();

        this.header_ctrl = new Control({ context, tag_name: 'div' });
        this.header_ctrl.add_class('form-designer-header');

        this.title_ctrl = new Control({ context, tag_name: 'span' });
        this.title_ctrl.add_class('form-designer-title');
        this.title_ctrl.add('Form Designer');
        this.header_ctrl.add(this.title_ctrl);

        this.list_ctrl = new Control({ context, tag_name: 'div' });
        this.list_ctrl.add_class('form-designer-list');

        this.fields.forEach((field, index) => {
            this.list_ctrl.add(this._render_field_row(context, field, index));
        });

        this.add(this.header_ctrl);
        this.add(this.list_ctrl);
    }

    _render_field_row(context, field, index) {
        const row = new Control({ context, tag_name: 'div' });
        row.add_class('form-designer-row');
        row.dom.attributes['data-field-id'] = field.id;

        const name_ctrl = new Control({ context, tag_name: 'span' });
        name_ctrl.add_class('form-designer-row-name');
        name_ctrl.add(field.label);

        const type_ctrl = new Control({ context, tag_name: 'span' });
        type_ctrl.add_class('form-designer-row-type');
        type_ctrl.add(field.type);

        const req_ctrl = new Control({ context, tag_name: 'span' });
        req_ctrl.add_class('form-designer-row-required');
        req_ctrl.add(field.required ? 'required' : 'optional');

        const order_ctrl = new Control({ context, tag_name: 'span' });
        order_ctrl.add_class('form-designer-row-order');
        order_ctrl.add(String(index + 1));

        row.add(order_ctrl);
        row.add(name_ctrl);
        row.add(type_ctrl);
        row.add(req_ctrl);

        return row;
    }

    add_field(field) {
        this.fields.push(this._normalize_field(field, this.fields.length));
        this.compose();
        this.raise('change', { fields: this.fields });
    }

    remove_field(field_id) {
        const id = String(field_id);
        this.fields = this.fields.filter(field => field.id !== id);
        this.compose();
        this.raise('change', { fields: this.fields });
    }

    move_field_up(field_id) {
        const id = String(field_id);
        const index = this.fields.findIndex(field => field.id === id);
        if (index <= 0) return;

        const temp = this.fields[index - 1];
        this.fields[index - 1] = this.fields[index];
        this.fields[index] = temp;
        this.compose();
        this.raise('change', { fields: this.fields });
    }

    get_fields() {
        return this.fields.slice();
    }
}

Form_Designer.css = `
.jsgui-form-designer {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--admin-border, #d1d5db);
    border-radius: 8px;
    background: var(--admin-card-bg, #ffffff);
    overflow: hidden;
}

.jsgui-form-designer .form-designer-header {
    min-height: 36px;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid var(--admin-border, #d1d5db);
}

.jsgui-form-designer .form-designer-title {
    color: var(--admin-text, #111827);
    font-weight: 600;
    font-size: 13px;
}

.jsgui-form-designer .form-designer-list {
    display: flex;
    flex-direction: column;
}

.jsgui-form-designer .form-designer-row {
    display: grid;
    grid-template-columns: 36px minmax(100px, 1fr) 110px 110px;
    gap: 8px;
    align-items: center;
    min-height: 34px;
    padding: 0 10px;
    border-bottom: 1px solid var(--admin-border, #d1d5db);
    color: var(--admin-text, #111827);
    font-size: 12px;
}

.jsgui-form-designer .form-designer-row:last-child {
    border-bottom: 0;
}

.jsgui-form-designer .form-designer-row-order {
    opacity: 0.8;
}

.jsgui-form-designer .form-designer-row-type,
.jsgui-form-designer .form-designer-row-required {
    opacity: 0.9;
}
`;

module.exports = Form_Designer;
