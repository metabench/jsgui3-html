const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

class Group_Box extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'group_box';
        super(spec);

        themeable(this, 'group_box', spec);

        this.add_class('group-box');
        this.add_class('jsgui-group-box');

        this.legend = spec.legend || '';
        this.as_fieldset = spec.as_fieldset !== false;
        this.invalid = !!spec.invalid;
        this.disabled = !!spec.disabled;
        this.initial_content = spec.content !== undefined ? spec.content : spec.contents;

        this.dom.tagName = this.as_fieldset ? 'fieldset' : 'div';
        if (!this.as_fieldset) {
            this.dom.attributes.role = 'group';
        }

        if (this.invalid) {
            this.add_class('group-box-invalid');
            this.dom.attributes['aria-invalid'] = 'true';
        }

        if (this.disabled) {
            this.dom.attributes['aria-disabled'] = 'true';
            this.add_class('group-box-disabled');
        }

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;

        if (this.legend) {
            this.legend_ctrl = new Control({
                context,
                tag_name: this.as_fieldset ? 'legend' : 'div'
            });
            this.legend_ctrl.add_class('group-box-legend');
            this.legend_ctrl.add(this.legend);
            this.add(this.legend_ctrl);
        }

        this.content_ctrl = new Control({ context, tag_name: 'div' });
        this.content_ctrl.add_class('group-box-content');
        this.add(this.content_ctrl);

        if (this.initial_content !== undefined) {
            this.add_content(this.initial_content);
        }
    }

    activate() {
        if (this.__active) return;
        super.activate();

        if (this.legend_ctrl && this.legend_ctrl.dom && this.legend_ctrl.dom.el) {
            this.legend_ctrl.dom.el.addEventListener('click', () => {
                this.raise('legend_click', { legend: this.legend });
            });
        }
    }

    set_legend(text) {
        this.legend = text || '';
        if (this.legend_ctrl) {
            this.legend_ctrl.clear();
            if (this.legend) this.legend_ctrl.add(this.legend);
        }
    }

    set_invalid(flag) {
        this.invalid = !!flag;
        if (this.invalid) {
            this.add_class('group-box-invalid');
            this.dom.attributes['aria-invalid'] = 'true';
        } else {
            this.remove_class('group-box-invalid');
            delete this.dom.attributes['aria-invalid'];
        }
    }

    add_content(content) {
        if (!this.content_ctrl || content === undefined || content === null) return;

        if (Array.isArray(content)) {
            content.forEach(item => this.add_content(item));
            return;
        }

        this.content_ctrl.add(content);
    }
}

Group_Box.css = `
.jsgui-group-box {
    margin: 0;
    padding: 10px 12px 12px 12px;
    border: 1px solid var(--admin-border, #d1d5db);
    border-radius: 6px;
    background: var(--admin-card-bg, #ffffff);
    color: var(--admin-text, #111827);
    min-width: 0;
}

.jsgui-group-box .group-box-legend {
    padding: 0 6px;
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--admin-text, #111827);
}

.jsgui-group-box .group-box-content {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.jsgui-group-box.group-box-invalid {
    border-color: var(--admin-danger, #dc2626);
}

.jsgui-group-box.group-box-invalid .group-box-legend {
    color: var(--admin-danger, #dc2626);
}

.jsgui-group-box.group-box-disabled {
    opacity: 0.65;
}
`;

module.exports = Group_Box;
