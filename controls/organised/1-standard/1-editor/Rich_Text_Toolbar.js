const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;

const DEFAULT_BUTTONS = [
    { command: 'bold', label: '<strong>B</strong>', title: 'Bold (Ctrl+B)' },
    { command: 'italic', label: '<em>I</em>', title: 'Italic (Ctrl+I)' },
    { command: 'underline', label: '<u>U</u>', title: 'Underline (Ctrl+U)' },
    { command: 'strikeThrough', label: '<s>S</s>', title: 'Strikethrough' },
    { type: 'separator' },
    { command: 'formatBlock', value: '<h2>', label: 'H2', title: 'Heading 2' },
    { command: 'formatBlock', value: '<blockquote>', label: '❝', title: 'Block quote' },
    { type: 'separator' },
    { command: 'insertUnorderedList', label: '• List', title: 'Bullet List' },
    { command: 'insertOrderedList', label: '1. List', title: 'Numbered List' },
    { type: 'separator' },
    { command: 'createLink', label: '🔗', title: 'Insert Link' },
    { command: 'unlink', label: '🔗✗', title: 'Remove Link' },
    { type: 'separator' },
    { command: 'removeFormat', label: '✗', title: 'Clear Formatting' }
];

class Rich_Text_Toolbar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'rich_text_toolbar';
        super(spec);
        this.add_class('rte-toolbar');
        this.dom.tagName = 'div';

        this.buttons = Array.isArray(spec.buttons) ? spec.buttons : DEFAULT_BUTTONS;
        this.button_controls = [];

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;
        this.button_controls = [];

        this.buttons.forEach(button_def => {
            if (button_def.type === 'separator') {
                const sep = new Control({ context, tag_name: 'span' });
                sep.add_class('rte-toolbar-separator');
                this.add(sep);
                return;
            }

            const button = new Control({ context, tag_name: 'button' });
            button.add_class('rte-toolbar-button');
            button.dom.attributes.type = 'button';
            button.dom.attributes.title = button_def.title || '';
            button.dom.attributes['data-command'] = button_def.command;
            if (button_def.value) {
                button.dom.attributes['data-value'] = button_def.value;
            }
            if (button_def.label) {
                button.dom.innerHTML = button_def.label;
            }
            if (typeof button_def.handler === 'function') {
                button.custom_handler = button_def.handler;
            }

            this.button_controls.push(button);
            this.add(button);
        });
    }

    pre_activate() {
        super.pre_activate();
        if (!this.dom || !this.dom.el || !this.context || !this.context.map_controls) return;

        this.button_controls = Array.from(
            this.dom.el.querySelectorAll('.rte-toolbar-button[data-jsgui-id]')
        ).map(button_el => {
            const button_id = button_el.getAttribute('data-jsgui-id');
            return this.context.map_controls[button_id];
        }).filter(Boolean);
    }
}

Rich_Text_Toolbar.DEFAULT_BUTTONS = DEFAULT_BUTTONS;

module.exports = Rich_Text_Toolbar;
