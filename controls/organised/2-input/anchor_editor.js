const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;

class Anchor_Editor extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'anchor_editor';
        super(spec);
        this.add_class('anchor-editor');

        this.value = Object.assign({ top: true, bottom: true, left: true, right: true }, spec.value || {});
        this.size = spec.size || 50;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        const container = new Control({ context });
        container.add_class('anchor-editor-container');
        container.dom.attributes.style = container.dom.attributes.style || {};
        container.dom.attributes.style.width = `${this.size}px`;
        container.dom.attributes.style.height = `${this.size}px`;

        ['top', 'right', 'bottom', 'left'].forEach(edge => {
            const btn = new Control({ context, tag_name: 'button' });
            btn.add_class('anchor-editor-button');
            btn.add_class(`anchor-${edge}`);
            btn.add(edge.charAt(0).toUpperCase());
            container.add(btn);
            this._ctrl_fields[edge] = btn;
        });

        this.add(container);
        this._ctrl_fields.container = container;
        this._sync_ui();
    }

    _sync_ui() {
        ['top', 'right', 'bottom', 'left'].forEach(edge => {
            const btn = this._ctrl_fields && this._ctrl_fields[edge];
            if (!btn) return;
            if (this.value[edge]) btn.add_class('active');
            else btn.remove_class('active');
        });
    }

    set_value(value) {
        this.value = Object.assign({ top: false, bottom: false, left: false, right: false }, value || {});
        this._sync_ui();
        this.raise('change', { value: this.value });
    }

    get_value() {
        return this.value;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            ['top', 'right', 'bottom', 'left'].forEach(edge => {
                const btn = this._ctrl_fields && this._ctrl_fields[edge];
                if (!btn || !btn.dom.el) return;
                btn.dom.el.addEventListener('click', () => {
                    this.value[edge] = !this.value[edge];
                    this._sync_ui();
                    this.raise('change', { value: this.value });
                });
            });
        }
    }
}

module.exports = Anchor_Editor;
