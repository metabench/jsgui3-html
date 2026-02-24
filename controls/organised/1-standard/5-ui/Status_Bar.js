const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

class Status_Bar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'status_bar';
        super(spec);

        themeable(this, 'status_bar', spec);

        this.add_class('status-bar');
        this.add_class('jsgui-status-bar');

        this.status = spec.status || 'info';
        this.text = spec.text || 'Ready';
        this.meta_text = spec.meta_text || '';

        this.dom.attributes.role = 'status';
        this.dom.attributes['aria-live'] = spec.aria_live || 'polite';
        this.dom.attributes['data-status'] = this.status;

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;

        this.left_ctrl = new Control({ context, tag_name: 'span' });
        this.left_ctrl.add_class('status-bar-left');
        this.left_ctrl.add(this.text);

        this.right_ctrl = new Control({ context, tag_name: 'span' });
        this.right_ctrl.add_class('status-bar-right');
        this.right_ctrl.add(this.meta_text);

        this.add(this.left_ctrl);
        this.add(this.right_ctrl);
    }

    set_text(text) {
        this.text = text || '';
        if (this.left_ctrl) {
            this.left_ctrl.clear();
            this.left_ctrl.add(this.text);
        }
    }

    set_meta_text(meta_text) {
        this.meta_text = meta_text || '';
        if (this.right_ctrl) {
            this.right_ctrl.clear();
            this.right_ctrl.add(this.meta_text);
        }
    }

    set_status(status) {
        this.status = status || 'info';
        this.dom.attributes['data-status'] = this.status;
    }
}

Status_Bar.css = `
.jsgui-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 30px;
    padding: 6px 10px;
    border-top: 1px solid var(--admin-border, #d1d5db);
    background: var(--admin-surface, #f9fafb);
    color: var(--admin-text, #111827);
    font-size: 12px;
}

.jsgui-status-bar .status-bar-left,
.jsgui-status-bar .status-bar-right {
    display: inline-flex;
    align-items: center;
}

.jsgui-status-bar[data-status="info"] {
    color: var(--admin-text, #111827);
}

.jsgui-status-bar[data-status="success"] {
    font-weight: 500;
}

.jsgui-status-bar[data-status="warning"] {
    text-decoration: underline;
    text-decoration-thickness: 1px;
}

.jsgui-status-bar[data-status="error"] {
    font-weight: 600;
}
`;

module.exports = Status_Bar;
