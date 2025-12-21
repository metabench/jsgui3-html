const jsgui = require('../../../html');

const { Control, Active_HTML_Document } = jsgui;
const { Form_Container, Rich_Text_Editor, Object_Editor } = jsgui;

const validate_email = value => /.+@.+\..+/.test(value || '') || 'Invalid email address.';

class Form_Editor_Features_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'form_editor_features_demo';
        super(spec);

        const { context } = this;

        if (this.body && typeof this.body.add_class === 'function') {
            this.body.add_class('form-editor-features-body');
        }

        if (!spec.el) {
            if (this.head) {
                const title = new Control({ context, tag_name: 'title' });
                title.add('Form and Editor Features');
                this.head.add(title);

                const rich_text_styles = new Control({ context, tag_name: 'link' });
                rich_text_styles.dom.attributes.rel = 'stylesheet';
                rich_text_styles.dom.attributes.href = '/controls/organised/1-standard/1-editor/rich_text_editor.css';
                this.head.add(rich_text_styles);
            }

            const page = new Control({ context, tag_name: 'div' });
            page.add_class('form-editor-features');

            const header = new Control({ context, tag_name: 'header' });
            header.add_class('page-header');

            const heading = new Control({ context, tag_name: 'h1' });
            heading.add('Form and Editor Features');
            header.add(heading);

            const subtitle = new Control({ context, tag_name: 'p' });
            subtitle.add('Validation routing, masks, autosize textareas, rich text, and schema-driven editors.');
            header.add(subtitle);

            page.add(header);

            this.form_output = new Control({ context, tag_name: 'pre' });
            this.form_output.add_class('demo-output');
            this.form_output.add('Submit the form to see values.');

            const form_section = new Control({ context, tag_name: 'section' });
            form_section.add_class('demo-section');

            const form_title = new Control({ context, tag_name: 'h2' });
            form_title.add('Form Container');
            form_section.add(form_title);

            this.form_container = new Form_Container({
                context,
                fields: [
                    {
                        name: 'full_name',
                        label: 'Full name',
                        required: true,
                        placeholder: 'Ada Lovelace'
                    },
                    {
                        name: 'email',
                        label: 'Email',
                        type: 'email',
                        required: true,
                        validator: validate_email
                    },
                    {
                        name: 'phone',
                        label: 'Phone',
                        mask_type: 'phone',
                        placeholder: '(555) 123-4567'
                    },
                    {
                        name: 'start_date',
                        label: 'Start date',
                        mask_type: 'date',
                        placeholder: 'YYYY-MM-DD'
                    },
                    {
                        name: 'budget',
                        label: 'Budget',
                        mask_type: 'currency',
                        placeholder: '0.00'
                    },
                    {
                        name: 'notes',
                        label: 'Notes',
                        type: 'textarea',
                        autosize: true,
                        rows: 3,
                        placeholder: 'Add optional details'
                    },
                    {
                        name: 'subscribe',
                        label: 'Subscribe to updates',
                        type: 'checkbox'
                    }
                ]
            });

            const submit_button = new Control({ context, tag_name: 'button' });
            submit_button.add_class('form-submit-button');
            submit_button.dom.attributes.type = 'submit';
            submit_button.add('Submit');
            this.form_container.add(submit_button);

            form_section.add(this.form_container);
            form_section.add(this.form_output);

            this.rich_text_output = new Control({ context, tag_name: 'pre' });
            this.rich_text_output.add_class('demo-output');
            this.rich_text_output.add_class('rte-output');

            const rich_text_section = new Control({ context, tag_name: 'section' });
            rich_text_section.add_class('demo-section');

            const rich_text_title = new Control({ context, tag_name: 'h2' });
            rich_text_title.add('Rich Text Editor');
            rich_text_section.add(rich_text_title);

            this.rich_text_editor = new Rich_Text_Editor({
                context,
                allow_markdown: true,
                initial_html: '<p><strong>Welcome</strong> to the editor.</p><p>Toggle MD to edit markdown.</p>',
                on_change: html => {
                    this.update_pre(this.rich_text_output, html);
                }
            });

            rich_text_section.add(this.rich_text_editor);
            rich_text_section.add(this.rich_text_output);

            this.object_output = new Control({ context, tag_name: 'pre' });
            this.object_output.add_class('demo-output');

            const object_section = new Control({ context, tag_name: 'section' });
            object_section.add_class('demo-section');

            const object_title = new Control({ context, tag_name: 'h2' });
            object_title.add('Object Editor');
            object_section.add(object_title);

            this.object_editor = new Object_Editor({
                context,
                value: {
                    title: 'Example',
                    count: 3,
                    active: true,
                    details: {
                        owner: 'Team A',
                        priority: 'medium'
                    }
                },
                schema: {
                    fields: [
                        { name: 'title', type: 'string' },
                        { name: 'count', type: 'number' },
                        { name: 'active', type: 'boolean' },
                        {
                            name: 'details',
                            type: 'object',
                            schema: {
                                fields: [
                                    { name: 'owner', type: 'string' },
                                    { name: 'priority', type: 'string' }
                                ]
                            }
                        }
                    ]
                },
                allow_add: true,
                allow_remove: true
            });

            this.object_snapshot_button = new Control({ context, tag_name: 'button' });
            this.object_snapshot_button.add_class('object-snapshot-button');
            this.object_snapshot_button.dom.attributes.type = 'button';
            this.object_snapshot_button.add('Snapshot');

            object_section.add(this.object_editor);
            object_section.add(this.object_snapshot_button);
            object_section.add(this.object_output);

            page.add(form_section);
            page.add(rich_text_section);
            page.add(object_section);

            if (this.body) {
                this.body.add(page);
            } else {
                this.add(page);
            }
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();

            if (this.form_container) {
                this.form_container.on('submit', event => {
                    this.update_pre(this.form_output, event.values, 'submit');
                });
                this.form_container.on('invalid', event => {
                    this.update_pre(this.form_output, event.errors, 'invalid');
                });
            }

            if (this.object_snapshot_button) {
                this.object_snapshot_button.on('click', () => {
                    this.update_pre(this.object_output, this.object_editor.get_value(), 'snapshot');
                });
            }

            if (this.rich_text_editor) {
                this.update_pre(this.rich_text_output, this.rich_text_editor.get_html());
            }
        }
    }

    update_pre(control, value, label) {
        if (!control) return;
        const header = label ? `${label.toUpperCase()}\n` : '';
        const body = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        const text = `${header}${body}`;
        if (control.dom.el) {
            control.dom.el.textContent = text;
        } else {
            control.content.clear();
            control.add(text);
        }
    }
}

Form_Editor_Features_Demo.css = `
* {
    box-sizing: border-box;
}
body {
    font-family: "Source Sans Pro", Arial, sans-serif;
    margin: 0;
    padding: 24px;
    background: #f6f7fb;
    color: #1f1f1f;
}
.form-editor-features {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
}
.page-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.page-header h1 {
    margin: 0;
    font-size: 2rem;
}
.page-header p {
    margin: 0;
    color: #555;
}
.demo-section {
    background: #fff;
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.demo-section h2 {
    margin: 0;
    font-size: 1.3rem;
}
.form-submit-button,
.object-snapshot-button {
    align-self: flex-start;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 6px 12px;
    background: #fff;
    cursor: pointer;
}
.demo-output {
    background: #0f172a;
    color: #e2e8f0;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    white-space: pre-wrap;
    min-height: 60px;
}
.rte-output {
    min-height: 80px;
}
.form-container {
    background: #f9fafc;
    padding: 12px;
    border-radius: 8px;
}
@media (max-width: 800px) {
    body {
        padding: 16px;
    }
    .form-container-field {
        grid-template-columns: 1fr;
    }
    .form-container-message {
        grid-column: auto;
    }
}
`;

jsgui.controls.Form_Editor_Features_Demo = Form_Editor_Features_Demo;

module.exports = jsgui;
