const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;

const DOCK_POSITIONS = ['none', 'left', 'right', 'top', 'bottom', 'fill'];

class Dock_Editor extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'dock_editor';
        super(spec);
        this.add_class('dock-editor');

        this.value = spec.value || 'none';
        this.size = spec.size || 60;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        const container = new Control({ context });
        container.add_class('dock-editor-container');
        container.dom.attributes.style = container.dom.attributes.style || {};
        container.dom.attributes.style.width = `${this.size}px`;
        container.dom.attributes.style.height = `${this.size}px`;

        DOCK_POSITIONS.forEach(pos => {
            const btn = new Control({ context, tag_name: 'button' });
            btn.add_class('dock-editor-button');
            btn.add_class(`dock-${pos}`);
            btn.add(pos === 'none' ? '×' : pos[0].toUpperCase());
            container.add(btn);
            this._ctrl_fields[pos] = btn;
        });

        this.add(container);
        this._ctrl_fields.container = container;
        this._sync_ui();
    }

    _sync_ui() {
        DOCK_POSITIONS.forEach(pos => {
            const btn = this._ctrl_fields && this._ctrl_fields[pos];
            if (!btn) return;
            if (this.value === pos) btn.add_class('active');
            else btn.remove_class('active');
        });
    }

    set_value(value) {
        if (!DOCK_POSITIONS.includes(value)) value = 'none';
        this.value = value;
        this._sync_ui();
        this.raise('change', { value: this.value });
    }

    get_value() {
        return this.value;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            DOCK_POSITIONS.forEach(pos => {
                const btn = this._ctrl_fields && this._ctrl_fields[pos];
                if (!btn || !btn.dom.el) return;
                btn.dom.el.addEventListener('click', () => {
                    this.set_value(pos);
                });
            });
        }
    }
}

module.exports = Dock_Editor;
