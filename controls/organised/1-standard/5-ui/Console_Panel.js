const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

class Console_Panel extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'console_panel';
        super(spec);

        themeable(this, 'console_panel', spec);

        this.add_class('console-panel');
        this.add_class('jsgui-console-panel');

        this.title_text = spec.title || 'Console';
        this.max_lines = Number.isInteger(spec.max_lines) ? spec.max_lines : 200;
        this.lines = Array.isArray(spec.lines) ? spec.lines.map(line => String(line)) : [];

        this.dom.attributes.role = 'region';
        this.dom.attributes['aria-label'] = spec.aria_label || this.title_text;

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;

        this.header_ctrl = new Control({ context, tag_name: 'div' });
        this.header_ctrl.add_class('console-panel-header');

        this.title_ctrl = new Control({ context, tag_name: 'span' });
        this.title_ctrl.add_class('console-panel-title');
        this.title_ctrl.add(this.title_text);
        this.header_ctrl.add(this.title_ctrl);

        this.output_ctrl = new Control({ context, tag_name: 'pre' });
        this.output_ctrl.add_class('console-panel-output');
        this.output_ctrl.dom.attributes.role = 'log';
        this.output_ctrl.dom.attributes['aria-live'] = 'polite';
        this.output_ctrl.add(this.lines.join('\n'));

        this.add(this.header_ctrl);
        this.add(this.output_ctrl);
    }

    append_line(line) {
        this.lines.push(String(line));
        if (this.lines.length > this.max_lines) {
            this.lines = this.lines.slice(this.lines.length - this.max_lines);
        }
        this._sync_output();
    }

    clear_lines() {
        this.lines = [];
        this._sync_output();
    }

    _sync_output() {
        if (!this.output_ctrl) return;
        this.output_ctrl.clear();
        this.output_ctrl.add(this.lines.join('\n'));
    }
}

Console_Panel.css = `
.jsgui-console-panel {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--admin-border, #d1d5db);
    border-radius: 8px;
    background: var(--admin-card-bg, #ffffff);
    overflow: hidden;
}

.jsgui-console-panel .console-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 32px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--admin-border, #d1d5db);
}

.jsgui-console-panel .console-panel-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--admin-text, #111827);
}

.jsgui-console-panel .console-panel-output {
    margin: 0;
    padding: 10px;
    min-height: 120px;
    max-height: 240px;
    overflow: auto;
    white-space: pre-wrap;
    font-size: 12px;
    line-height: 1.4;
    color: var(--admin-text, #111827);
    background: var(--admin-surface, #f9fafb);
}
`;

module.exports = Console_Panel;
