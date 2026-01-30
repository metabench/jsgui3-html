const jsgui = require('../html-core/html-core');
const Evented_Class = jsgui.Evented_Class || require('lang-tools').Evented_Class;

class Clipboard_Manager extends Evented_Class {
    constructor(spec = {}) {
        super();
        this.format = spec.format || 'jsgui-controls';
        this.clipboard_data = null;
    }

    copy(controls) {
        const data = this._serialize(controls);
        this.clipboard_data = data;
        this._write_to_clipboard(JSON.stringify(data));
        this.raise('copy', { controls });
    }

    cut(controls, container) {
        this.copy(controls);
        if (container && Array.isArray(controls)) {
            controls.forEach(ctrl => container.remove(ctrl));
        }
        this.raise('cut', { controls });
    }

    paste(container, position) {
        const data = this.clipboard_data;
        const controls = data ? data.controls : [];
        this.raise('paste', { controls });
        return controls;
    }

    can_paste() {
        return !!this.clipboard_data;
    }

    get_clipboard_data() {
        return this.clipboard_data;
    }

    set_clipboard_data(data) {
        this.clipboard_data = data;
    }

    _serialize(controls) {
        const arr = Array.isArray(controls) ? controls : [];
        return {
            type: this.format,
            version: 1,
            controls: arr.map(ctrl => ({
                type: ctrl.__type_name || ctrl.constructor.name,
                properties: ctrl._fields || {},
                children: []
            }))
        };
    }

    _write_to_clipboard(text) {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => {});
        }
    }
}

module.exports = Clipboard_Manager;
