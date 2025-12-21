const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

class Pop_Over extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'pop_over';
        super(spec);
        this.add_class('pop-over');
        this.dom.tagName = 'div';
        this.dom.attributes.role = 'dialog';
        this.dom.attributes['aria-hidden'] = 'true';
        this.dom.attributes.id = this._id();

        this.placement = is_defined(spec.placement) ? String(spec.placement) : 'bottom';
        this.target = spec.target;

        if (this.placement) {
            this.add_class(`pop-over-${this.placement}`);
        }

        if (!spec.el) {
            this.set_content(spec.content || spec.message || spec.text || '');
        }
    }

    /**
     * Set pop-over content.
     * @param {*} content - The content to set.
     */
    set_content(content) {
        this.clear();
        if (content instanceof Control) {
            this.add(content);
        } else if (is_defined(content) && content !== '') {
            this.add(String(content));
        }
    }

    /**
     * Show the pop-over.
     */
    show() {
        this.add_class('is-visible');
        this.dom.attributes['aria-hidden'] = 'false';
        if (this.dom.el) {
            this.dom.el.setAttribute('aria-hidden', 'false');
        }
        this.update_target_state(true);
    }

    /**
     * Hide the pop-over.
     */
    hide() {
        this.remove_class('is-visible');
        this.dom.attributes['aria-hidden'] = 'true';
        if (this.dom.el) {
            this.dom.el.setAttribute('aria-hidden', 'true');
        }
        this.update_target_state(false);
    }

    /**
     * Toggle pop-over visibility.
     */
    toggle() {
        if (this.has_class('is-visible')) {
            this.hide();
        } else {
            this.show();
        }
    }

    update_target_state(is_open) {
        if (!this.target) return;
        const target_el = this.get_target_el();
        if (target_el) {
            target_el.setAttribute('aria-expanded', is_open ? 'true' : 'false');
            target_el.setAttribute('aria-controls', this._id());
        }
    }

    get_target_el() {
        if (!this.target) return undefined;
        if (typeof document === 'undefined') return undefined;
        if (typeof this.target === 'string') {
            return document.querySelector(this.target);
        }
        if (this.target.dom && this.target.dom.el) {
            return this.target.dom.el;
        }
        if (this.context && typeof this.context.get_ctrl_el === 'function') {
            return this.context.get_ctrl_el(this.target);
        }
        return undefined;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (typeof document === 'undefined') return;

            const target_el = this.get_target_el();
            if (!target_el) return;

            target_el.addEventListener('click', e_click => {
                e_click.preventDefault();
                this.toggle();
            });

            document.addEventListener('click', e_click => {
                if (!this.dom.el) return;
                if (!this.has_class('is-visible')) return;
                const target = e_click.target;
                if (target === target_el || target_el.contains(target)) return;
                if (this.dom.el.contains(target)) return;
                this.hide();
            });
        }
    }
}

Pop_Over.css = `
.pop-over {
    position: absolute;
    min-width: 160px;
    padding: 8px 10px;
    border-radius: 6px;
    background: #fff;
    border: 1px solid #ddd;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
}
.pop-over.is-visible {
    opacity: 1;
    pointer-events: auto;
}
`;

module.exports = Pop_Over;
