/**
 * Control Rendering Tests
 *
 * Tests that various controls can be instantiated and render correctly
 * without throwing errors. This helps identify broken controls that
 * need fixing.
 */

const { expect } = require('chai');
const controls = require('../controls/controls');

describe('Control Rendering Tests', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Basic Native Compositional Controls', () => {
        it('should render Button control', () => {
            const button = new controls.Button({
                context,
                text: 'Test Button'
            });

            expect(button).to.exist;
            expect(button.dom.tagName).to.equal('button');
            expect(button.html).to.be.a('string');
            expect(button.html).to.include('Test Button');
        });

        it('should render Text_Input control', () => {
            const textInput = new controls.Text_Input({
                context,
                value: 'test value',
                placeholder: 'Enter text'
            });

            expect(textInput).to.exist;
            expect(textInput.dom.tagName).to.equal('input');
            expect(textInput.dom.attrs.type).to.equal('text');
            expect(textInput.dom.attrs.value).to.equal('test value');
            expect(textInput.dom.attrs.placeholder).to.equal('Enter text');
        });

        it('should render Checkbox control', () => {
            const checkbox = new controls.Checkbox({
                context,
                text: 'Test Checkbox',
                checked: true
            });

            expect(checkbox).to.exist;
            expect(checkbox.html).to.be.a('string');
            expect(checkbox.html).to.include('Test Checkbox');
        });

        it('should render Radio_Button control', () => {
            const radio = new controls.Radio_Button({
                context,
                group_name: 'test-group',
                value: 'option1',
                text: 'Option 1'
            });

            expect(radio).to.exist;
            expect(radio.dom.tagName).to.equal('div');
            expect(radio.html).to.be.a('string');
            expect(radio.html).to.include('Option 1');
        });

        it('should render Select_Options control', () => {
            const select = new controls.Select_Options({
                context,
                options: ['Option 1', 'Option 2']
            });

            expect(select).to.exist;
            expect(select.dom.tagName).to.equal('select');
            expect(select.html).to.be.a('string');
            expect(select.html).to.include('Option 1');
            expect(select.html).to.include('Option 2');
        });

        it('should render Date_Picker control', () => {
            const datePicker = new controls.Date_Picker({
                context
            });

            expect(datePicker).to.exist;
            expect(datePicker.dom.tagName).to.equal('input');
            expect(datePicker.dom.attrs.type).to.equal('date');
        });
    });

    describe('Compositional Controls', () => {
        it('should render Text_Field control', () => {
            const textField = new controls.Text_Field({
                context,
                label: 'Test Field',
                value: 'test value'
            });

            expect(textField).to.exist;
            expect(textField.html).to.be.a('string');
            expect(textField.html).to.include('Test Field');
        });

        it('should render Toggle_Button control', () => {
            const toggle = new controls.Toggle_Button({
                context,
                text_on: 'ON',
                text_off: 'OFF'
            });

            expect(toggle).to.exist;
            expect(toggle.html).to.be.a('string');
        });

        it('should render List control', () => {
            const list = new controls.List({
                context,
                items: ['Item 1', 'Item 2', 'Item 3']
            });

            expect(list).to.exist;
            expect(list.html).to.be.a('string');
            expect(list.html).to.include('Item 1');
        });

        it('should render Grid control', () => {
            const grid = new controls.Grid({
                context,
                size: [3, 3]
            });

            expect(grid).to.exist;
            expect(grid.html).to.be.a('string');
        });
    });

    describe('Form and Editor Controls', () => {
        it('should render Form_Field control', () => {
            const formField = new controls.Form_Field({
                context,
                name: 'test_field',
                label: 'Test Field',
                field_type: 'text',
                value: 'test'
            });

            expect(formField).to.exist;
            expect(formField.html).to.be.a('string');
            expect(formField.html).to.include('Test Field');
        });

        it('should render Rich_Text_Editor control', () => {
            const rte = new controls.Rich_Text_Editor({
                context,
                value: '<p>Test content</p>'
            });

            expect(rte).to.exist;
            expect(rte.html).to.be.a('string');
        });
    });

    describe('UI Controls', () => {
        it('should render Panel control', () => {
            const panel = new controls.Panel({
                context,
                title: 'Test Panel',
                content: 'Panel content'
            });

            expect(panel).to.exist;
            expect(panel.html).to.be.a('string');
            expect(panel.html).to.include('Test Panel');
        });

        it('should render Modal control', () => {
            const modal = new controls.Modal({
                context,
                title: 'Test Modal',
                content: 'Modal content'
            });

            expect(modal).to.exist;
            expect(modal.html).to.be.a('string');
        });

        it('should render Tabbed_Panel control', () => {
            const tabbed = new controls.Tabbed_Panel({
                context,
                tabs: [
                    { title: 'Tab 1', content: 'Content 1' },
                    { title: 'Tab 2', content: 'Content 2' }
                ]
            });

            expect(tabbed).to.exist;
            expect(tabbed.html).to.be.a('string');
        });
    });

    describe('Layout Controls', () => {
        it('should render Window control', () => {
            const window = new controls.Window({
                context,
                title: 'Test Window',
                content: 'Window content'
            });

            expect(window).to.exist;
            expect(window.html).to.be.a('string');
        });

        it('should render Titled_Panel control', () => {
            const titled = new controls.Titled_Panel({
                context,
                title: 'Test Title',
                content: 'Panel content'
            });

            expect(titled).to.exist;
            expect(titled.html).to.be.a('string');
        });
    });

    describe('Advanced Controls', () => {
        it('should render Tree control', () => {
            const tree = new controls.Tree({
                context,
                data: {
                    name: 'Root',
                    children: [
                        { name: 'Child 1' },
                        { name: 'Child 2' }
                    ]
                }
            });

            expect(tree).to.exist;
            expect(tree.html).to.be.a('string');
        });

        it('should render File_Tree control', () => {
            const fileTree = new controls.File_Tree({
                context,
                root_path: '/test'
            });

            expect(fileTree).to.exist;
            expect(fileTree.html).to.be.a('string');
        });
    });

    describe('Indicator Controls', () => {
        it('should render Status_Indicator control', () => {
            const indicator = new controls.Status_Indicator({
                context,
                status: 'success',
                text: 'Success'
            });

            expect(indicator).to.exist;
            expect(indicator.html).to.be.a('string');
        });

        it('should render Validation_Status_Indicator control', () => {
            const validation = new controls.Validation_Status_Indicator({
                context,
                status: 'valid'
            });

            expect(validation).to.exist;
            expect(validation.html).to.be.a('string');
        });
    });
});