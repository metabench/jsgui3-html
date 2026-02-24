const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

class Icon_Button extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'icon_button';
        spec.tag_name = spec.tag_name || 'button';
        super(spec);

        themeable(this, 'icon_button', spec);

        this.add_class('icon-button');
        this.add_class('jsgui-icon-button');

        this.icon = spec.icon || '•';
        this.aria_label = spec.aria_label || spec.label || 'Icon button';
        this.tooltip = spec.tooltip || '';
        this.toggle = !!spec.toggle;
        this.pressed = !!spec.pressed;
        this.disabled = !!spec.disabled;

        this.dom.attributes.type = 'button';
        this.dom.attributes['aria-label'] = this.aria_label;
        if (this.tooltip) this.dom.attributes.title = this.tooltip;
        if (this.toggle) {
            this.dom.attributes['aria-pressed'] = this.pressed ? 'true' : 'false';
        }
        if (this.disabled) {
            this.dom.attributes.disabled = true;
            this.dom.attributes['aria-disabled'] = 'true';
            this.add_class('icon-button-disabled');
        }

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;
        this.icon_ctrl = new Control({ context, tag_name: 'span' });
        this.icon_ctrl.add_class('icon-button-icon');
        this.icon_ctrl.add(this.icon);
        this.add(this.icon_ctrl);
    }

    activate() {
        if (this.__active) return;
        super.activate();

        if (this.dom && this.dom.el) {
            this.dom.el.addEventListener('click', () => {
                if (this.disabled) return;
                if (this.toggle) {
                    this.set_pressed(!this.pressed);
                }
                this.raise('action', this.toggle ? { pressed: this.pressed } : {});
            });
        }
    }

    set_pressed(flag) {
        this.pressed = !!flag;
        if (this.toggle) {
            this.dom.attributes['aria-pressed'] = this.pressed ? 'true' : 'false';
            if (this.pressed) this.add_class('icon-button-pressed');
            else this.remove_class('icon-button-pressed');
        }
    }

    set_icon(icon) {
        this.icon = icon || '•';
        if (this.icon_ctrl) {
            this.icon_ctrl.clear();
            this.icon_ctrl.add(this.icon);
        }
    }
}

Icon_Button.css = `
.jsgui-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--admin-border, #d1d5db);
    background: var(--admin-card-bg, #fff);
    color: var(--admin-text, #111827);
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease;
}

.jsgui-icon-button:hover {
    background: var(--admin-hover, #f3f4f6);
}

.jsgui-icon-button:focus-visible {
    outline: 2px solid var(--admin-accent, #2563eb);
    outline-offset: 1px;
}

.jsgui-icon-button.icon-button-pressed {
    background: color-mix(in srgb, var(--admin-accent, #2563eb) 15%, white);
    border-color: var(--admin-accent, #2563eb);
}

.jsgui-icon-button.icon-button-disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.jsgui-icon-button .icon-button-icon {
    line-height: 1;
    font-size: 16px;
}
`;

module.exports = Icon_Button;
