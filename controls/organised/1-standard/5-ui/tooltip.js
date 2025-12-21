const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

class Tooltip extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'tooltip';
        super(spec);
        this.add_class('tooltip');
        this.dom.tagName = 'div';
        this.dom.attributes.role = 'tooltip';
        this.dom.attributes['aria-hidden'] = 'true';
        this.dom.attributes.id = this._id();

        this.message = is_defined(spec.message)
            ? String(spec.message)
            : (is_defined(spec.text) ? String(spec.text) : '');
        this.placement = is_defined(spec.placement) ? String(spec.placement) : 'top';
        this.target = spec.target;

        if (this.placement) {
            this.add_class(`tooltip-${this.placement}`);
        }

        if (!spec.el && this.message) {
            this.add(this.message);
        }
    }

    /**
     * Set the tooltip message.
     * @param {string} message - The message to set.
     */
    set_message(message) {
        this.message = is_defined(message) ? String(message) : '';
        this.clear();
        if (this.message) {
            this.add(this.message);
        }
    }

    /**
     * Show the tooltip.
     */
    show() {
        this.add_class('is-visible');
        this.dom.attributes['aria-hidden'] = 'false';
        if (this.dom.el) {
            this.dom.el.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Hide the tooltip.
     */
    hide() {
        this.remove_class('is-visible');
        this.dom.attributes['aria-hidden'] = 'true';
        if (this.dom.el) {
            this.dom.el.setAttribute('aria-hidden', 'true');
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (typeof document === 'undefined') return;

            let target_el;
            if (this.target) {
                if (typeof this.target === 'string') {
                    target_el = document.querySelector(this.target);
                } else if (this.target.dom && this.target.dom.el) {
                    target_el = this.target.dom.el;
                } else if (this.context && typeof this.context.get_ctrl_el === 'function') {
                    target_el = this.context.get_ctrl_el(this.target);
                }
            }

            if (!target_el) return;

            target_el.setAttribute('aria-describedby', this._id());

            target_el.addEventListener('mouseenter', () => this.show());
            target_el.addEventListener('mouseleave', () => this.hide());
            target_el.addEventListener('focus', () => this.show());
            target_el.addEventListener('blur', () => this.hide());
        }
    }
}

Tooltip.css = `
.tooltip {
    position: absolute;
    padding: 6px 8px;
    border-radius: 4px;
    background: #222;
    color: #fff;
    font-size: 0.8em;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
}
.tooltip.is-visible {
    opacity: 1;
}
`;

module.exports = Tooltip;
