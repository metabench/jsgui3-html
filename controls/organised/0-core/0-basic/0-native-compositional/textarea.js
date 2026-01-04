const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const apply_input_mask = require('../../../../../control_mixins/input_mask');
const { apply_full_input_api } = require('../../../../../control_mixins/input_api');

class Textarea extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'textarea';
        super(spec);
        this.add_class('textarea');
        this.dom.tagName = 'textarea';
        this.enhance_only = !!spec.enhance_only && !!spec.el;

        this.autosize = !!spec.autosize;
        this.autosize_line_height = is_defined(spec.autosize_line_height)
            ? Number(spec.autosize_line_height)
            : 20;

        apply_input_mask(this, spec);
        apply_full_input_api(this, {
            disabled: spec.disabled,
            readonly: spec.readonly,
            required: spec.required
        });

        if (is_defined(spec.placeholder)) {
            this.dom.attributes.placeholder = String(spec.placeholder);
        }
        if (is_defined(spec.rows)) {
            this.dom.attributes.rows = String(spec.rows);
        }
        if (is_defined(spec.cols)) {
            this.dom.attributes.cols = String(spec.cols);
        }
        if (spec.disabled) {
            this.dom.attributes.disabled = 'disabled';
        }
        if (spec.readonly) {
            this.dom.attributes.readonly = 'readonly';
        }

        const has_spec_value = is_defined(spec.value);
        const dom_value = this.enhance_only && spec.el ? String(spec.el.value || '') : '';
        const value = has_spec_value ? String(spec.value) : dom_value;
        this.value = this.apply_input_mask_value ? this.apply_input_mask_value(value) : value;
        if (!spec.el && value) {
            this.add(this.value);
        }
    }

    /**
     * Set the textarea value.
     * @param {*} value - The value to set.
     */
    set_value(value) {
        const value_str = is_defined(value) ? String(value) : '';
        const masked_value = this.apply_input_mask_value ? this.apply_input_mask_value(value_str) : value_str;
        this.value = masked_value;
        if (!this.dom.el) {
            this.clear();
            if (masked_value) {
                this.add(masked_value);
            }
        } else {
            this.dom.el.value = masked_value;
            if (this.autosize) {
                this.adjust_autosize();
            }
        }
    }

    /**
     * Get the textarea value.
     * @returns {string}
     */
    get_value() {
        return this.value || '';
    }

    /**
     * Focus the textarea element.
     */
    focus() {
        if (this.dom.el) {
            this.dom.el.focus();
        }
    }

    /**
     * Select the textarea content.
     */
    select() {
        if (this.dom.el) {
            this.dom.el.select();
        }
    }

    /**
     * Adjust textarea height for autosize mode.
     */
    adjust_autosize() {
        if (!this.dom.el) return;
        this.dom.el.style.height = 'auto';
        const scroll_height = this.dom.el.scrollHeight || 0;
        if (scroll_height > 0) {
            this.dom.el.style.height = `${scroll_height}px`;
        } else {
            const rows = Number(this.dom.attributes.rows) || 2;
            const fallback_height = rows * (this.autosize_line_height || 20);
            this.dom.el.style.height = `${fallback_height}px`;
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            const sync_value = () => {
                const masked_value = this.apply_input_mask_value
                    ? this.apply_input_mask_value(this.dom.el.value)
                    : this.dom.el.value;
                if (this.dom.el.value !== masked_value) {
                    this.dom.el.value = masked_value;
                }
                this.value = masked_value;
                if (this.autosize) {
                    this.adjust_autosize();
                }
            };

            this.add_dom_event_listener('input', sync_value);
            this.add_dom_event_listener('change', sync_value);

            sync_value();

            if (this.autosize) {
                this.adjust_autosize();
            }
        }
    }
}

const { register_swap } = require('../../../../../control_mixins/swap_registry');

const should_enhance = el => {
    if (!el || !el.classList) return false;
    if (el.classList.contains('jsgui-enhance')) return true;
    if (typeof el.closest === 'function' && el.closest('.jsgui-form')) return true;
    return false;
};

register_swap('textarea', Textarea, {
    enhancement_mode: 'enhance',
    predicate: should_enhance
});

module.exports = Textarea;
