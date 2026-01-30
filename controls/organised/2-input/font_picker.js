const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;

const DEFAULT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

class Font_Picker extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'font_picker';
        super(spec);
        this.add_class('font-picker');

        this.value = spec.value || null;
        this.families = spec.families || ['Arial', 'Helvetica', 'Verdana', 'Times New Roman', 'Courier New'];
        this.sizes = spec.sizes || DEFAULT_SIZES;
        this.show_preview = spec.show_preview !== false;
        this.show_effects = spec.show_effects !== false;
        this.preview_text = spec.preview_text || 'AaBbYyZz';

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        const family_select = new Control({ context });
        family_select.dom.tagName = 'select';
        family_select.add_class('font-picker-family');
        this.families.forEach(family => {
            const opt = new Control({ context });
            opt.dom.tagName = 'option';
            opt.dom.attributes.value = family;
            opt.add(family);
            family_select.add(opt);
        });
        this.add(family_select);
        this._ctrl_fields.family = family_select;

        const size_select = new Control({ context });
        size_select.dom.tagName = 'select';
        size_select.add_class('font-picker-size');
        this.sizes.forEach(size => {
            const opt = new Control({ context });
            opt.dom.tagName = 'option';
            opt.dom.attributes.value = String(size);
            opt.add(String(size));
            size_select.add(opt);
        });
        this.add(size_select);
        this._ctrl_fields.size = size_select;

        if (this.show_preview) {
            const preview = new Control({ context });
            preview.add_class('font-picker-preview');
            preview.add(this.preview_text);
            this.add(preview);
            this._ctrl_fields.preview = preview;
        }

        this._sync_ui();
    }

    _sync_ui() {
        const value = this.get_value() || {};
        const family = value.family || this.families[0];
        const size = value.size || this.sizes[0];

        const family_select = this._ctrl_fields && this._ctrl_fields.family;
        const size_select = this._ctrl_fields && this._ctrl_fields.size;
        const preview = this._ctrl_fields && this._ctrl_fields.preview;

        if (family_select && family_select.dom.el) family_select.dom.el.value = family;
        if (size_select && size_select.dom.el) size_select.dom.el.value = String(size);
        if (preview) {
            preview.dom.attributes.style = preview.dom.attributes.style || {};
            preview.dom.attributes.style['font-family'] = family;
            preview.dom.attributes.style['font-size'] = `${size}px`;
        }
    }

    get_value() {
        return this.value || {
            family: this.families[0],
            size: this.sizes[0],
            style: 'normal',
            weight: 'normal',
            strikethrough: false,
            underline: false
        };
    }

    set_value(font) {
        this.value = Object.assign({}, this.get_value(), font || {});
        this._sync_ui();
        this.raise('change', { value: this.value });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const family_select = this._ctrl_fields && this._ctrl_fields.family;
            const size_select = this._ctrl_fields && this._ctrl_fields.size;

            const handle_change = () => {
                const family = family_select && family_select.dom.el ? family_select.dom.el.value : this.families[0];
                const size = size_select && size_select.dom.el ? Number(size_select.dom.el.value) : this.sizes[0];
                this.set_value({ family, size });
            };

            if (family_select && family_select.dom.el) {
                family_select.dom.el.addEventListener('change', handle_change);
            }
            if (size_select && size_select.dom.el) {
                size_select.dom.el.addEventListener('change', handle_change);
            }
        }
    }
}

module.exports = Font_Picker;
