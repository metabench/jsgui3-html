const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

class Toast extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'toast';
        super(spec);
        this.add_class('toast-container');
        this.dom.tagName = 'div';
        this.dom.attributes['aria-live'] = 'polite';

        this.toast_items = new Map();
        this.toast_id_counter = 1;
    }

    /**
     * Show a toast message.
     * @param {string} message - The message to show.
     * @param {object} options - Optional toast options.
     * @returns {string} Toast id.
     */
    show(message, options = {}) {
        const msg_text = is_defined(message) ? String(message) : '';
        const id = `toast_${this.toast_id_counter++}`;
        const status = is_defined(options.status) ? String(options.status) : '';

        const toast_ctrl = new Control({ context: this.context });
        toast_ctrl.dom.tagName = 'div';
        toast_ctrl.add_class('toast');
        toast_ctrl.dom.attributes['data-toast-id'] = id;
        if (status) {
            toast_ctrl.add_class(`toast-${status}`);
        }

        const text_ctrl = new Control({ context: this.context });
        text_ctrl.dom.tagName = 'span';
        text_ctrl.add_class('toast-message');
        text_ctrl.add(msg_text);

        const dismiss_ctrl = new Control({ context: this.context });
        dismiss_ctrl.dom.tagName = 'button';
        dismiss_ctrl.dom.attributes.type = 'button';
        dismiss_ctrl.dom.attributes['data-toast-id'] = id;
        dismiss_ctrl.add_class('toast-dismiss');
        dismiss_ctrl.add('x');

        toast_ctrl.add(text_ctrl);
        toast_ctrl.add(dismiss_ctrl);
        this.add(toast_ctrl);

        this.toast_items.set(id, toast_ctrl);

        const timeout_ms = options.timeout_ms;
        if (typeof window !== 'undefined' && Number.isFinite(timeout_ms) && timeout_ms > 0) {
            setTimeout(() => {
                this.dismiss(id);
            }, timeout_ms);
        }

        return id;
    }

    /**
     * Dismiss a toast by id.
     * @param {string} toast_id - The toast id.
     */
    dismiss(toast_id) {
        const toast_ctrl = this.toast_items.get(toast_id);
        if (!toast_ctrl) return;
        this.toast_items.delete(toast_id);
        toast_ctrl.remove();
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            this.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target || !target.getAttribute) return;
                const toast_id = target.getAttribute('data-toast-id');
                if (!is_defined(toast_id)) return;
                this.dismiss(toast_id);
            });
        }
    }
}

Toast.css = `
.toast-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.toast {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 6px;
    background: #333;
    color: #fff;
}
.toast-success {
    background: #1b5e20;
}
.toast-error {
    background: #b71c1c;
}
.toast-warn,
.toast-warning {
    background: #ff6f00;
}
.toast-dismiss {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
}
`;

module.exports = Toast;
