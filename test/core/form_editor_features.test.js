const { expect } = require('chai');
const sinon = require('sinon');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');
const apply_input_mask = require('../../control_mixins/input_mask');

describe('Form and Editor Features', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Form_Container', () => {
        it('validates required fields and emits submit/invalid', () => {
            const form_container = new controls.Form_Container({
                context,
                fields: [
                    { name: 'full_name', required: true },
                    {
                        name: 'email',
                        validator: value => /.+@.+\..+/.test(value || '') || 'Invalid email.'
                    }
                ]
            });

            const submit_spy = sinon.spy();
            const invalid_spy = sinon.spy();
            form_container.on('submit', submit_spy);
            form_container.on('invalid', invalid_spy);

            const invalid_result = form_container.submit();
            expect(invalid_result.valid).to.equal(false);
            expect(invalid_spy.called).to.equal(true);
            const error_value = form_container.errors.get('full_name');
            const error_text = error_value && error_value.value !== undefined
                ? error_value.value
                : error_value;
            expect(error_text).to.equal('This field is required.');

            form_container.set_values({
                full_name: 'Ada Lovelace',
                email: 'ada@example.com'
            });

            const valid_result = form_container.submit();
            expect(valid_result.valid).to.equal(true);
            expect(submit_spy.called).to.equal(true);
        });
    });

    describe('Input Mask', () => {
        it('formats and exposes raw value', () => {
            const control = new jsgui.Control({ context, tag_name: 'input' });
            apply_input_mask(control, { mask_type: 'phone' });

            const masked_value = control.apply_input_mask_value('1234567890');
            expect(masked_value).to.equal('(123) 456-7890');
            expect(control.get_raw_value()).to.equal('1234567890');

            control.set_raw_value('2223334444');
            expect(control.get_raw_value()).to.equal('2223334444');
        });
    });

    describe('Textarea Autosize', () => {
        it('sets height based on rows', () => {
            const textarea = new controls.Textarea({
                context,
                autosize: true,
                rows: 3,
                autosize_line_height: 18
            });

            textarea.register_this_and_subcontrols();
            document.body.innerHTML = textarea.html;

            jsgui.pre_activate(context);
            jsgui.activate(context);

            const el = document.querySelector('textarea');
            expect(Number.parseFloat(el.style.height)).to.equal(54);
        });
    });

    describe('Object_Editor', () => {
        it('adds and removes keys', () => {
            const object_editor = new controls.Object_Editor({
                context,
                value: { title: 'Alpha' },
                allow_add: true,
                allow_remove: true
            });
            const added = object_editor.add_key('field_1', 'Beta');
            expect(added).to.equal(true);
            expect(object_editor.value).to.have.property('field_1');

            const removed = object_editor.remove_key('title');
            expect(removed).to.equal(true);
            expect(object_editor.value).to.not.have.property('title');
        });
    });

    describe('Rich_Text_Editor', () => {
        it('converts markdown to HTML and toggles mode', () => {
            const rich_text_editor = new controls.Rich_Text_Editor({
                context,
                allow_markdown: true,
                markdown_mode: true,
                initial_markdown: '# Title'
            });

            const html = rich_text_editor.get_html();
            expect(html).to.include('<h1>');

            rich_text_editor.set_markdown('**Bold**');
            expect(rich_text_editor.get_html()).to.include('<strong>');

            rich_text_editor.toggle_markdown_mode(false);
            expect(rich_text_editor.markdown_mode).to.equal(false);
        });
    });
});
