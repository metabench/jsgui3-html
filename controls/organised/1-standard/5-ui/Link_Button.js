const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

class Link_Button extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'link_button';
        spec.tag_name = spec.tag_name || 'button';
        super(spec);

        themeable(this, 'link_button', spec);

        this.add_class('link-button');
        this.add_class('jsgui-link-button');

        this.text = spec.text || 'Link';
        this.underline = spec.underline || 'hover';
        this.disabled = !!spec.disabled;

        this.dom.attributes.type = 'button';
        this.dom.attributes['data-underline'] = this.underline;

        if (this.disabled) {
            this.dom.attributes.disabled = true;
            this.dom.attributes['aria-disabled'] = 'true';
            this.add_class('link-button-disabled');
        }

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        this.add(this.text);
    }

    activate() {
        if (this.__active) return;
        super.activate();

        if (this.dom && this.dom.el) {
            this.dom.el.addEventListener('click', () => {
                if (this.disabled) return;
                this.raise('action', {});
            });
        }
    }

    set_disabled(flag) {
        this.disabled = !!flag;
        if (this.disabled) {
            this.dom.attributes.disabled = true;
            this.dom.attributes['aria-disabled'] = 'true';
            this.add_class('link-button-disabled');
        } else {
            delete this.dom.attributes.disabled;
            delete this.dom.attributes['aria-disabled'];
            this.remove_class('link-button-disabled');
        }
    }
}

Link_Button.css = `
.jsgui-link-button {
    border: none;
    background: transparent;
    color: var(--admin-accent, #2563eb);
    font: inherit;
    padding: 0;
    cursor: pointer;
}

.jsgui-link-button[data-underline="always"] {
    text-decoration: underline;
}

.jsgui-link-button[data-underline="hover"] {
    text-decoration: none;
}

.jsgui-link-button[data-underline="hover"]:hover {
    text-decoration: underline;
}

.jsgui-link-button[data-underline="none"] {
    text-decoration: none;
}

.jsgui-link-button:focus-visible {
    outline: 2px solid var(--admin-accent, #2563eb);
    outline-offset: 2px;
    border-radius: 2px;
}

.jsgui-link-button.link-button-disabled {
    color: var(--admin-muted, #6b7280);
    cursor: not-allowed;
    text-decoration: none;
}
`;

module.exports = Link_Button;
