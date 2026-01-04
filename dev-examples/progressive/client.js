const jsgui = require('../../html');

const { Control, Active_HTML_Document } = jsgui;
const { enable_auto_enhancement } = require('../../control_mixins/auto_enhance');

class Progressive_Enhancement_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'progressive_enhancement_demo';
        super(spec);

        const { context } = this;

        if (this.body && typeof this.body.add_class === 'function') {
            this.body.add_class('progressive-demo-body');
        }

        if (!spec.el) {
            if (this.head) {
                const title = new Control({ context, tag_name: 'title' });
                title.add('Progressive Enhancement (Activation)');
                this.head.add(title);
            }

            const page = new Control({ context, tag_name: 'div' });
            page.add_class('progressive-demo');

            const header = new Control({ context, tag_name: 'header' });
            header.add_class('demo-header');

            const heading = new Control({ context, tag_name: 'h1' });
            heading.add('Progressive Enhancement (Activation)');
            header.add(heading);

            const subtitle = new Control({ context, tag_name: 'p' });
            subtitle.add('Native HTML first, styled with CSS, then activated with jsgui behavior.');
            header.add(subtitle);

            page.add(header);

            let field_index = 0;
            const next_id = base_name => {
                field_index += 1;
                return `${base_name}-${field_index}`;
            };

            const create_section = (title_text, description_text, test_id) => {
                const section = new Control({ context, tag_name: 'section' });
                section.add_class('demo-section');
                section.dom.attributes['data-test'] = test_id;

                const title = new Control({ context, tag_name: 'h2' });
                title.add(title_text);
                section.add(title);

                const description = new Control({ context, tag_name: 'p' });
                description.add(description_text);
                section.add(description);

                return section;
            };

            const create_form = extra_class => {
                const form = new Control({ context, tag_name: 'form' });
                form.add_class('demo-form');
                if (extra_class) {
                    form.add_class(extra_class);
                }
                return form;
            };

            const apply_common_attributes = (control, options) => {
                if (!options) return;
                if (options.class_name) {
                    control.add_class(options.class_name);
                }
                if (options.data_test) {
                    control.dom.attributes['data-test'] = options.data_test;
                }
                if (options.attrs) {
                    Object.keys(options.attrs).forEach(key => {
                        control.dom.attributes[key] = options.attrs[key];
                    });
                }
            };

            const create_text_input = (name, label_text, input_type, options = {}) => {
                const field = new Control({ context, tag_name: 'div' });
                field.add_class('demo-field');

                const input_id = next_id(name);
                const label = new Control({ context, tag_name: 'label' });
                label.add(label_text);
                label.dom.attributes.for = input_id;

                const input = new Control({ context, tag_name: 'input' });
                input.dom.attributes.type = input_type || 'text';
                input.dom.attributes.name = name;
                input.dom.attributes.id = input_id;
                if (options.placeholder) {
                    input.dom.attributes.placeholder = options.placeholder;
                }
                if (options.value !== undefined) {
                    input.dom.attributes.value = options.value;
                }
                apply_common_attributes(input, options);

                field.add(label);
                field.add(input);
                return field;
            };

            const create_checkbox_input = (name, label_text, options = {}) => {
                const field = new Control({ context, tag_name: 'div' });
                field.add_class('demo-field');
                field.add_class('demo-field-inline');

                const input_id = next_id(name);
                const input = new Control({ context, tag_name: 'input' });
                input.dom.attributes.type = 'checkbox';
                input.dom.attributes.name = name;
                input.dom.attributes.id = input_id;
                if (options.checked) {
                    input.dom.attributes.checked = 'checked';
                }
                apply_common_attributes(input, options);

                const label = new Control({ context, tag_name: 'label' });
                label.add(label_text);
                label.dom.attributes.for = input_id;

                field.add(input);
                field.add(label);
                return field;
            };

            const create_select_input = (name, label_text, items, options = {}) => {
                const field = new Control({ context, tag_name: 'div' });
                field.add_class('demo-field');

                const select_id = next_id(name);
                const label = new Control({ context, tag_name: 'label' });
                label.add(label_text);
                label.dom.attributes.for = select_id;

                const select = new Control({ context, tag_name: 'select' });
                select.dom.attributes.name = name;
                select.dom.attributes.id = select_id;
                apply_common_attributes(select, options);

                (items || []).forEach(item => {
                    const option = new Control({ context, tag_name: 'option' });
                    option.dom.attributes.value = item.value;
                    if (item.value === options.value) {
                        option.dom.attributes.selected = 'selected';
                    }
                    option.add(item.label);
                    select.add(option);
                });

                field.add(label);
                field.add(select);
                return field;
            };

            const create_textarea_input = (name, label_text, options = {}) => {
                const field = new Control({ context, tag_name: 'div' });
                field.add_class('demo-field');

                const textarea_id = next_id(name);
                const label = new Control({ context, tag_name: 'label' });
                label.add(label_text);
                label.dom.attributes.for = textarea_id;

                const textarea = new Control({ context, tag_name: 'textarea' });
                textarea.dom.attributes.name = name;
                textarea.dom.attributes.id = textarea_id;
                if (options.placeholder) {
                    textarea.dom.attributes.placeholder = options.placeholder;
                }
                if (options.rows) {
                    textarea.dom.attributes.rows = String(options.rows);
                }
                if (options.value) {
                    textarea.add(options.value);
                }
                apply_common_attributes(textarea, options);

                field.add(label);
                field.add(textarea);
                return field;
            };

            const create_button = (label_text, options = {}) => {
                const button = new Control({ context, tag_name: 'button' });
                button.add(label_text);
                button.dom.attributes.type = options.type || 'button';
                apply_common_attributes(button, options);
                return button;
            };

            const common_items = [
                { value: 'basic', label: 'Basic' },
                { value: 'pro', label: 'Pro' },
                { value: 'enterprise', label: 'Enterprise' }
            ];

            const tier0_section = create_section(
                'Tier 0: Native HTML',
                'Plain HTML controls with no styling or activation.',
                'tier0-section'
            );
            const tier0_form = create_form();
            tier0_form.add(create_text_input('tier0-name', 'Name', 'text', {
                placeholder: 'Ada Lovelace',
                data_test: 'tier0-input'
            }));
            tier0_form.add(create_text_input('tier0-email', 'Email', 'email', {
                placeholder: 'ada@example.com'
            }));
            tier0_form.add(create_checkbox_input('tier0-subscribe', 'Subscribe to updates'));
            tier0_form.add(create_select_input('tier0-plan', 'Plan', common_items, {
                value: 'basic'
            }));
            tier0_form.add(create_textarea_input('tier0-notes', 'Notes', {
                rows: 3,
                placeholder: 'Plain textarea'
            }));
            tier0_form.add(create_button('Submit', { type: 'submit' }));
            tier0_section.add(tier0_form);

            const tier1_section = create_section(
                'Tier 1: Styled Native',
                'Native controls styled with CSS tokens but no activation.',
                'tier1-section'
            );
            const tier1_form = create_form();
            tier1_form.add(create_text_input('tier1-name', 'Name', 'text', {
                placeholder: 'Grace Hopper',
                class_name: 'jsgui-input',
                data_test: 'tier1-input'
            }));
            tier1_form.add(create_text_input('tier1-email', 'Email', 'email', {
                placeholder: 'grace@example.com',
                class_name: 'jsgui-input'
            }));
            tier1_form.add(create_checkbox_input('tier1-subscribe', 'Subscribe to updates', {
                class_name: 'jsgui-checkbox'
            }));
            tier1_form.add(create_select_input('tier1-plan', 'Plan', common_items, {
                value: 'pro',
                class_name: 'jsgui-select'
            }));
            tier1_form.add(create_textarea_input('tier1-notes', 'Notes', {
                rows: 3,
                placeholder: 'Styled textarea',
                class_name: 'jsgui-input'
            }));
            tier1_form.add(create_button('Submit', {
                type: 'submit',
                class_name: 'jsgui-button'
            }));
            tier1_section.add(tier1_form);

            const tier2_section = create_section(
                'Tier 2: Activated',
                'Activation attaches behavior to native elements via swap registration.',
                'tier2-section'
            );
            const tier2_form = create_form();
            tier2_form.add(create_text_input('tier2-name', 'Name', 'text', {
                placeholder: 'Alan Turing',
                class_name: 'jsgui-enhance',
                data_test: 'tier2-input'
            }));
            tier2_form.add(create_text_input('tier2-email', 'Email', 'email', {
                placeholder: 'alan@example.com',
                class_name: 'jsgui-enhance'
            }));
            tier2_form.add(create_checkbox_input('tier2-subscribe', 'Subscribe to updates', {
                class_name: 'jsgui-enhance'
            }));
            tier2_form.add(create_select_input('tier2-plan', 'Plan', common_items, {
                value: 'enterprise',
                class_name: 'jsgui-enhance'
            }));
            tier2_form.add(create_textarea_input('tier2-notes', 'Notes', {
                rows: 3,
                placeholder: 'Activated textarea',
                class_name: 'jsgui-enhance'
            }));
            tier2_form.add(create_button('Submit', {
                type: 'submit',
                class_name: 'jsgui-button'
            }));
            tier2_section.add(tier2_form);

            const mixed_section = create_section(
                'Mixed Activation',
                'Form-scoped activation with opt-out and per-field overrides.',
                'mixed-section'
            );
            const mixed_form = create_form('jsgui-form');
            mixed_form.add(create_text_input('mixed-name', 'Name', 'text', {
                placeholder: 'Katherine Johnson',
                data_test: 'mixed-input'
            }));
            mixed_form.add(create_text_input('mixed-department', 'Department (no activation)', 'text', {
                placeholder: 'Research',
                class_name: 'jsgui-no-enhance',
                data_test: 'mixed-skip'
            }));
            mixed_form.add(create_checkbox_input('mixed-remote', 'Remote team', {
                class_name: 'jsgui-enhance'
            }));
            mixed_form.add(create_select_input('mixed-plan', 'Plan', common_items, {
                value: 'pro',
                class_name: 'jsgui-enhance'
            }));
            mixed_form.add(create_button('Submit', {
                type: 'submit',
                class_name: 'jsgui-button'
            }));
            mixed_section.add(mixed_form);

            const ssr_section = create_section(
                'Server Render + Activation',
                'Server renders native markup, client activation reuses the DOM.',
                'ssr-section'
            );
            const ssr_form = create_form();
            ssr_form.add(create_text_input('ssr-name', 'Name', 'text', {
                placeholder: 'Server rendered',
                class_name: 'jsgui-enhance',
                data_test: 'ssr-input',
                attrs: {
                    'data-jsgui-ssr': 'true'
                }
            }));
            ssr_form.add(create_button('Submit', {
                type: 'submit',
                class_name: 'jsgui-button'
            }));
            ssr_section.add(ssr_form);

            page.add(tier0_section);
            page.add(tier1_section);
            page.add(tier2_section);
            page.add(mixed_section);
            page.add(ssr_section);

            if (this.body) {
                this.body.add(page);
            } else {
                this.add(page);
            }
        }
    }

    /**
     * Activate progressive enhancement for the demo.
     */
    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.activation_observer) {
                this.activation_observer = enable_auto_enhancement(this.context);
            }
        }
    }
}

Progressive_Enhancement_Demo.css = `
:root {
    --jsgui-font-family: 'Segoe UI', sans-serif;
    --jsgui-input-font-size: 15px;
    --jsgui-input-padding: 10px 12px;
    --jsgui-input-border: 1px solid #c5c5c5;
    --jsgui-input-radius: 6px;
    --jsgui-input-bg: #ffffff;
    --jsgui-input-color: #222222;
    --jsgui-focus-color: #1c6fb8;
    --jsgui-focus-ring: rgba(28, 111, 184, 0.25);
    --jsgui-input-disabled-bg: #f2f2f2;
    --jsgui-input-disabled-color: #9a9a9a;
    --jsgui-error-color: #c0392b;
    --jsgui-success-color: #2e8b57;
    --jsgui-button-font-size: 14px;
    --jsgui-button-padding: 10px 18px;
    --jsgui-button-border: 1px solid #c5c5c5;
    --jsgui-button-radius: 6px;
    --jsgui-button-bg: #f5f5f5;
    --jsgui-button-color: #222222;
    --jsgui-button-hover-bg: #e9e9e9;
    --jsgui-button-active-bg: #dedede;
    --jsgui-accent-color: #1c6fb8;
}

input.jsgui-input,
input.jsgui-enhance,
textarea.jsgui-input,
textarea.jsgui-enhance,
.jsgui-form input[type="text"],
.jsgui-form input[type="email"],
.jsgui-form input[type="password"],
.jsgui-form input[type="tel"],
.jsgui-form input[type="url"],
.jsgui-form input[type="number"],
.jsgui-form textarea {
    box-sizing: border-box;
    font-family: var(--jsgui-font-family, inherit);
    font-size: var(--jsgui-input-font-size, 14px);
    padding: var(--jsgui-input-padding, 8px 12px);
    border: var(--jsgui-input-border, 1px solid #c5c5c5);
    border-radius: var(--jsgui-input-radius, 4px);
    background: var(--jsgui-input-bg, #ffffff);
    color: var(--jsgui-input-color, #222222);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input.jsgui-input:focus,
input.jsgui-enhance:focus,
textarea.jsgui-input:focus,
textarea.jsgui-enhance:focus,
.jsgui-form input:focus,
.jsgui-form textarea:focus,
.jsgui-form select:focus {
    outline: none;
    border-color: var(--jsgui-focus-color, #1c6fb8);
    box-shadow: 0 0 0 3px var(--jsgui-focus-ring, rgba(28, 111, 184, 0.25));
}

input.jsgui-input:disabled,
input.jsgui-enhance:disabled,
textarea.jsgui-input:disabled,
textarea.jsgui-enhance:disabled,
.jsgui-form input:disabled,
.jsgui-form textarea:disabled,
.jsgui-form select:disabled {
    background: var(--jsgui-input-disabled-bg, #f2f2f2);
    color: var(--jsgui-input-disabled-color, #9a9a9a);
    cursor: not-allowed;
}

input.jsgui-invalid,
textarea.jsgui-invalid,
select.jsgui-invalid,
.jsgui-form input:invalid,
.jsgui-form textarea:invalid,
.jsgui-form select:invalid {
    border-color: var(--jsgui-error-color, #c0392b);
}

input.jsgui-valid,
textarea.jsgui-valid,
select.jsgui-valid,
.jsgui-form input.valid,
.jsgui-form textarea.valid,
.jsgui-form select.valid {
    border-color: var(--jsgui-success-color, #2e8b57);
}

button.jsgui-button,
.jsgui-form button {
    font-family: var(--jsgui-font-family, inherit);
    font-size: var(--jsgui-button-font-size, 14px);
    padding: var(--jsgui-button-padding, 8px 16px);
    border: var(--jsgui-button-border, 1px solid #c5c5c5);
    border-radius: var(--jsgui-button-radius, 4px);
    background: var(--jsgui-button-bg, #f5f5f5);
    color: var(--jsgui-button-color, #222222);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
}

button.jsgui-button:hover,
.jsgui-form button:hover {
    background: var(--jsgui-button-hover-bg, #e9e9e9);
}

button.jsgui-button:active,
.jsgui-form button:active {
    background: var(--jsgui-button-active-bg, #dedede);
}

select.jsgui-select,
.jsgui-form select {
    appearance: none;
    font-family: var(--jsgui-font-family, inherit);
    font-size: var(--jsgui-input-font-size, 14px);
    padding: var(--jsgui-input-padding, 8px 12px);
    padding-right: 32px;
    border: var(--jsgui-input-border, 1px solid #c5c5c5);
    border-radius: var(--jsgui-input-radius, 4px);
    background-color: var(--jsgui-input-bg, #ffffff);
}

input[type="checkbox"].jsgui-checkbox,
input[type="radio"].jsgui-radio,
.jsgui-form input[type="checkbox"],
.jsgui-form input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: var(--jsgui-accent-color, #1c6fb8);
}

.progressive-demo-body {
    margin: 0;
    background: #f7f7f7;
    color: #1f1f1f;
}

.progressive-demo {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 24px 80px;
    font-family: var(--jsgui-font-family, 'Segoe UI', sans-serif);
}

.demo-header {
    margin-bottom: 32px;
}

.demo-header h1 {
    margin: 0 0 12px;
    font-size: 32px;
}

.demo-header p {
    margin: 0;
    color: #4b4b4b;
    font-size: 16px;
}

.demo-section {
    background: #ffffff;
    border: 1px solid #e1e1e1;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 6px 20px rgba(15, 15, 15, 0.06);
}

.demo-section h2 {
    margin-top: 0;
    margin-bottom: 6px;
    font-size: 22px;
}

.demo-section p {
    margin-top: 0;
    margin-bottom: 18px;
    color: #5a5a5a;
}

.demo-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px 20px;
}

.demo-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.demo-field-inline {
    flex-direction: row;
    align-items: center;
}

.demo-field label {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6a6a6a;
}

.demo-field-inline label {
    text-transform: none;
    letter-spacing: 0;
    font-size: 15px;
    color: #333333;
}

@media (max-width: 700px) {
    .demo-form {
        grid-template-columns: 1fr;
    }
}
`;

jsgui.controls = jsgui.controls || {};
jsgui.controls.Progressive_Enhancement_Demo = Progressive_Enhancement_Demo;

module.exports = jsgui;
