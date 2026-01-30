const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;

class Status_Bar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'status_bar';
        super(spec);
        this.add_class('status-bar');

        this.sections = Array.isArray(spec.sections) ? spec.sections.slice() : [];

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.sections = {};

        this.sections.forEach(def => {
            const section = new Control({ context });
            section.add_class('status-bar-section');
            if (def.align) section.add_class(`status-bar-${def.align}`);
            if (def.width) {
                section.dom.attributes.style = section.dom.attributes.style || {};
                section.dom.attributes.style.width = typeof def.width === 'number' ? `${def.width}px` : def.width;
            }
            if (def.tooltip) {
                section.dom.attributes.title = def.tooltip;
            }
            if (def.content) {
                section.add(def.content);
            }
            this.add(section);
            if (def.id) {
                this._ctrl_fields.sections[def.id] = section;
            }
        });
    }

    add_section(def) {
        this.sections.push(def);
        this._compose();
    }

    remove_section(id) {
        this.sections = this.sections.filter(sec => sec.id !== id);
        this._compose();
    }

    get_section(id) {
        return this._ctrl_fields && this._ctrl_fields.sections ? this._ctrl_fields.sections[id] : null;
    }

    set_text(id, text) {
        const section = this.get_section(id);
        if (!section) return;
        section.clear();
        section.add(text);
    }
}

module.exports = Status_Bar;
