const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const Panel = require('../1-standard/6-layout/panel');
const Button = require('../0-core/0-basic/0-native-compositional/button');

class Dialog extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'dialog';
        super(spec);
        this.add_class('dialog');

        this.title = spec.title || '';
        this.width = spec.width || 'auto';
        this.height = spec.height || 'auto';
        this.modal = spec.modal !== false;
        this.closeable = spec.closeable !== false;
        this.draggable = spec.draggable !== false;
        this.buttons = spec.buttons || null;
        this.center = spec.center !== false;
        this.escape_closes = spec.escape_closes !== false;
        this.click_outside_closes = !!spec.click_outside_closes;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        if (this.modal) {
            const overlay = new Control({ context });
            overlay.add_class('dialog-overlay');
            this.add(overlay);
            this._ctrl_fields.overlay = overlay;
        }

        const panel = new Panel({ context, title: this.title });
        panel.add_class('dialog-panel');
        if (this.width !== 'auto') panel.dom.attributes.style = Object.assign(panel.dom.attributes.style || {}, { width: this.width });
        if (this.height !== 'auto') panel.dom.attributes.style = Object.assign(panel.dom.attributes.style || {}, { height: this.height });
        this.add(panel);
        this._ctrl_fields.panel = panel;

        const content = new Control({ context });
        content.add_class('dialog-content');
        panel.add_content(content);
        this._ctrl_fields.content = content;

        if (Array.isArray(this.buttons)) {
            const button_row = new Control({ context });
            button_row.add_class('dialog-buttons');
            this.buttons.forEach(def => {
                const btn = new Button({ context });
                btn.add_class('dialog-button');
                btn.add_class(def.type || 'secondary');
                btn.add(def.label || 'OK');
                btn.on('click', () => {
                    this.raise('dialog-action', { action: def.action || 'ok' });
                    if (def.close !== false) {
                        this.close(def.action || 'ok');
                    }
                });
                button_row.add(btn);
            });
            panel.add_content(button_row);
        }
    }

    get_content() {
        return this._ctrl_fields && this._ctrl_fields.content;
    }

    set_title(title) {
        this.title = title;
        if (this._ctrl_fields && this._ctrl_fields.panel && this._ctrl_fields.panel._ctrl_fields) {
            const header = this._ctrl_fields.panel._ctrl_fields.title;
            if (header) {
                header.clear();
                header.add(title);
            }
        }
    }

    open() {
        this.show();
        this.raise('dialog-open', {});
    }

    close(action) {
        this.hide();
        this.raise('dialog-close', { action });
    }

    shake() {
        this.add_class('dialog-shake');
        setTimeout(() => this.remove_class('dialog-shake'), 300);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (this.escape_closes && typeof document !== 'undefined') {
                document.addEventListener('keydown', e => {
                    if (e.key === 'Escape') {
                        this.close('escape');
                    }
                });
            }
            if (this.click_outside_closes && this._ctrl_fields && this._ctrl_fields.overlay) {
                const overlay = this._ctrl_fields.overlay;
                if (overlay.dom.el) {
                    overlay.dom.el.addEventListener('click', () => this.close('overlay'));
                }
            }
        }
    }
}

module.exports = Dialog;
