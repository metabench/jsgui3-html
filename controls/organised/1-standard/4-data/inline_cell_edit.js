/**
 * Inline_Cell_Edit — Click-to-edit cell for data tables and grids.
 *
 * Options:
 *   value       — Current display value
 *   type        — 'text' | 'number' | 'select' | 'date' (default 'text')
 *   options     — Array of options for select type
 *   placeholder — Placeholder text
 *   on_save     — Callback (new_value, old_value) => void
 *   on_cancel   — Callback () => void
 *   editable    — Boolean, default true
 *
 * Events: save({ value, old_value }), cancel
 */
const Control = require('../../../../html-core/control');
const { is_defined } = require('../../../../html-core/html-core');

class Inline_Cell_Edit extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'inline_cell_edit';
        super(spec);
        this.add_class('inline-cell-edit');
        this.add_class('jsgui-inline-cell-edit');
        this.dom.tagName = 'div';

        this.value = is_defined(spec.value) ? spec.value : '';
        this.type = spec.type || 'text';
        this.options = spec.options || [];
        this.placeholder = spec.placeholder || 'Click to edit';
        this.on_save = spec.on_save || null;
        this.on_cancel = spec.on_cancel || null;
        this.editable = spec.editable !== false;
        this.editing = false;

        if (!spec.el) this.compose();
    }

    compose() {
        // Display element
        this._display = new Control({ context: this.context, tag_name: 'div' });
        this._display.add_class('ice-display');
        this._display.dom.attributes.tabindex = '0';

        const value_span = new Control({ context: this.context, tag_name: 'span' });
        value_span.add_class('ice-value');
        value_span.add(this.value || this.placeholder);
        if (!this.value) value_span.add_class('is-placeholder');
        this._display.add(value_span);

        const edit_icon = new Control({ context: this.context, tag_name: 'span' });
        edit_icon.add_class('ice-edit-icon');
        edit_icon.add('✏️');
        this._display.add(edit_icon);

        // Editor (hidden initially)
        this._editor_wrap = new Control({ context: this.context, tag_name: 'div' });
        this._editor_wrap.add_class('ice-editor');
        this._editor_wrap.add_class('is-hidden');

        if (this.type === 'select') {
            this._input = new Control({ context: this.context, tag_name: 'select' });
            this._input.add_class('ice-input');
            this.options.forEach(opt => {
                const option = new Control({ context: this.context, tag_name: 'option' });
                const opt_value = typeof opt === 'object' ? opt.value : opt;
                const opt_label = typeof opt === 'object' ? opt.label : opt;
                option.dom.attributes.value = String(opt_value);
                if (String(opt_value) === String(this.value)) {
                    option.dom.attributes.selected = 'selected';
                }
                option.add(opt_label);
                this._input.add(option);
            });
        } else {
            this._input = new Control({ context: this.context, tag_name: 'input' });
            this._input.add_class('ice-input');
            this._input.dom.attributes.type = this.type === 'number' ? 'number' : this.type === 'date' ? 'date' : 'text';
            this._input.dom.attributes.value = String(this.value || '');
            if (this.placeholder) {
                this._input.dom.attributes.placeholder = this.placeholder;
            }
        }

        this._editor_wrap.add(this._input);

        // Action buttons
        const actions = new Control({ context: this.context, tag_name: 'div' });
        actions.add_class('ice-actions');

        this._save_btn = new Control({ context: this.context, tag_name: 'button' });
        this._save_btn.add_class('ice-btn');
        this._save_btn.add_class('ice-btn--save');
        this._save_btn.dom.attributes.type = 'button';
        this._save_btn.dom.attributes['aria-label'] = 'Save';
        this._save_btn.add('✓');

        this._cancel_btn = new Control({ context: this.context, tag_name: 'button' });
        this._cancel_btn.add_class('ice-btn');
        this._cancel_btn.add_class('ice-btn--cancel');
        this._cancel_btn.dom.attributes.type = 'button';
        this._cancel_btn.dom.attributes['aria-label'] = 'Cancel';
        this._cancel_btn.add('✕');

        actions.add(this._save_btn);
        actions.add(this._cancel_btn);
        this._editor_wrap.add(actions);

        this.add(this._display);
        this.add(this._editor_wrap);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            const display = this.dom.el.querySelector('.ice-display');
            const editor = this.dom.el.querySelector('.ice-editor');
            const input = this.dom.el.querySelector('.ice-input');
            const save_btn = this.dom.el.querySelector('.ice-btn--save');
            const cancel_btn = this.dom.el.querySelector('.ice-btn--cancel');

            if (display && this.editable) {
                display.addEventListener('click', () => this._enter_edit());
                display.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === 'F2') this._enter_edit();
                });
            }

            if (save_btn) save_btn.addEventListener('click', () => this._save());
            if (cancel_btn) cancel_btn.addEventListener('click', () => this._cancel());

            if (input) {
                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter') this._save();
                    if (e.key === 'Escape') this._cancel();
                });
            }
        }
    }

    _enter_edit() {
        if (this.editing) return;
        this.editing = true;

        const display = this.dom.el.querySelector('.ice-display');
        const editor = this.dom.el.querySelector('.ice-editor');
        const input = this.dom.el.querySelector('.ice-input');

        display.classList.add('is-hidden');
        editor.classList.remove('is-hidden');
        this.dom.el.classList.add('is-editing');

        if (input) {
            input.value = this.value || '';
            input.focus();
            if (input.select) input.select();
        }
    }

    _save() {
        const input = this.dom.el.querySelector('.ice-input');
        const new_value = input ? input.value : this.value;
        const old_value = this.value;
        this.value = new_value;

        this.raise('save', { value: new_value, old_value });
        if (this.on_save) this.on_save(new_value, old_value);

        this._exit_edit();
    }

    _cancel() {
        this.raise('cancel');
        if (this.on_cancel) this.on_cancel();
        this._exit_edit();
    }

    _exit_edit() {
        this.editing = false;
        const display = this.dom.el.querySelector('.ice-display');
        const editor = this.dom.el.querySelector('.ice-editor');
        const value_span = this.dom.el.querySelector('.ice-value');

        display.classList.remove('is-hidden');
        editor.classList.add('is-hidden');
        this.dom.el.classList.remove('is-editing');

        if (value_span) {
            value_span.textContent = this.value || this.placeholder;
            value_span.classList.toggle('is-placeholder', !this.value);
        }
    }

    get_value() {
        return this.value;
    }

    set_value(val) {
        this.value = val;
        if (this.dom.el) {
            const value_span = this.dom.el.querySelector('.ice-value');
            if (value_span) {
                value_span.textContent = val || this.placeholder;
                value_span.classList.toggle('is-placeholder', !val);
            }
        }
    }
}

Inline_Cell_Edit.css = `
.inline-cell-edit {
    display: inline-flex;
    position: relative;
}
.ice-editor.is-hidden,
.ice-display.is-hidden {
    display: none;
}
.ice-input {
    border: 1px solid #ccc;
    padding: 4px 8px;
    font: inherit;
}
`;

module.exports = Inline_Cell_Edit;
