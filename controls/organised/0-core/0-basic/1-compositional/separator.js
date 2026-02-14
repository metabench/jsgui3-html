const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../../control_mixins/themeable');

class Separator extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'separator';
        super(spec);

        themeable(this, 'separator', spec);

        this.add_class('separator');
        this.add_class('jsgui-separator');

        this.orientation = spec.orientation === 'vertical' ? 'vertical' : 'horizontal';
        this.inset = !!spec.inset;
        this.decorative = spec.decorative !== false;

        this.dom.attributes['data-orientation'] = this.orientation;
        if (this.inset) this.dom.attributes['data-inset'] = 'true';

        if (this.decorative) {
            this.dom.attributes['aria-hidden'] = 'true';
        } else {
            this.dom.attributes.role = 'separator';
            this.dom.attributes['aria-orientation'] = this.orientation;
        }

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;
        this.line = new Control({ context, tag_name: 'span' });
        this.line.add_class('separator-line');
        this.add(this.line);
    }

    set_orientation(value) {
        const next = value === 'vertical' ? 'vertical' : 'horizontal';
        this.orientation = next;
        this.dom.attributes['data-orientation'] = next;
        if (!this.decorative) {
            this.dom.attributes['aria-orientation'] = next;
        }
    }
}

Separator.css = `
.jsgui-separator {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--admin-border, #d1d5db);
}

.jsgui-separator[data-orientation="horizontal"] {
    width: 100%;
    min-height: 1px;
    padding: 0;
}

.jsgui-separator[data-orientation="horizontal"][data-inset="true"] {
    margin-left: 8px;
    margin-right: 8px;
}

.jsgui-separator[data-orientation="vertical"] {
    height: 100%;
    min-width: 1px;
    padding: 0;
}

.jsgui-separator[data-orientation="vertical"][data-inset="true"] {
    margin-top: 8px;
    margin-bottom: 8px;
}

.jsgui-separator .separator-line {
    display: block;
    background: var(--admin-border, #d1d5db);
}

.jsgui-separator[data-orientation="horizontal"] .separator-line {
    width: 100%;
    height: 1px;
}

.jsgui-separator[data-orientation="vertical"] .separator-line {
    width: 1px;
    height: 100%;
}
`;

module.exports = Separator;
