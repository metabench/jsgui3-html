const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

class Code_Editor extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'code_editor';
        super(spec);

        themeable(this, 'code_editor', spec);

        this.add_class('code-editor');
        this.add_class('jsgui-code-editor');

        this.language = spec.language || 'plaintext';
        this.value = typeof spec.value === 'string' ? spec.value : '';
        this.placeholder = spec.placeholder || '';
        this.readonly = !!spec.readonly;

        this.dom.attributes.role = 'region';
        this.dom.attributes['aria-label'] = spec.aria_label || 'Code editor';
        this.dom.attributes['data-language'] = this.language;

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;

        this.header_ctrl = new Control({ context, tag_name: 'div' });
        this.header_ctrl.add_class('code-editor-header');

        this.language_ctrl = new Control({ context, tag_name: 'span' });
        this.language_ctrl.add_class('code-editor-language');
        this.language_ctrl.add(this.language);
        this.header_ctrl.add(this.language_ctrl);

        this.textarea_ctrl = new Control({ context, tag_name: 'textarea' });
        this.textarea_ctrl.add_class('code-editor-textarea');
        this.textarea_ctrl.dom.attributes.spellcheck = 'false';
        this.textarea_ctrl.dom.attributes['aria-label'] = 'Code input';
        if (this.placeholder) this.textarea_ctrl.dom.attributes.placeholder = this.placeholder;
        if (this.readonly) this.textarea_ctrl.dom.attributes.readonly = true;
        this.textarea_ctrl.add(this.value);

        this.add(this.header_ctrl);
        this.add(this.textarea_ctrl);
    }

    activate() {
        if (this.__active) return;
        super.activate();

        if (this.textarea_ctrl && this.textarea_ctrl.dom && this.textarea_ctrl.dom.el) {
            this.textarea_ctrl.dom.el.addEventListener('input', e => {
                this.value = e.target.value;
                this.raise('change', { value: this.value });
            });
        }
    }

    get_value() {
        return this.value;
    }

    set_value(value) {
        this.value = typeof value === 'string' ? value : '';
        if (this.textarea_ctrl && this.textarea_ctrl.dom && this.textarea_ctrl.dom.el) {
            this.textarea_ctrl.dom.el.value = this.value;
        }
    }

    set_language(language) {
        this.language = language || 'plaintext';
        this.dom.attributes['data-language'] = this.language;
        if (this.language_ctrl) {
            this.language_ctrl.clear();
            this.language_ctrl.add(this.language);
        }
    }
}

Code_Editor.css = `
.jsgui-code-editor {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--admin-border, #d1d5db);
    border-radius: 8px;
    overflow: hidden;
    background: var(--admin-card-bg, #ffffff);
}

.jsgui-code-editor .code-editor-header {
    min-height: 30px;
    display: flex;
    align-items: center;
    padding: 4px 10px;
    border-bottom: 1px solid var(--admin-border, #d1d5db);
    background: var(--admin-surface, #f9fafb);
}

.jsgui-code-editor .code-editor-language {
    font-size: 12px;
    font-weight: 600;
    color: var(--admin-text, #111827);
}

.jsgui-code-editor .code-editor-textarea {
    border: 0;
    min-height: 180px;
    resize: vertical;
    padding: 10px;
    font-size: 13px;
    line-height: 1.45;
    color: var(--admin-text, #111827);
    background: var(--admin-card-bg, #ffffff);
}

.jsgui-code-editor .code-editor-textarea:focus-visible {
    outline: 2px solid var(--admin-accent, #2563eb);
    outline-offset: -2px;
}
`;

module.exports = Code_Editor;
