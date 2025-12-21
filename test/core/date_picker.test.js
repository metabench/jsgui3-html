const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');

describe('Date_Picker Control', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('applies min and max constraints', () => {
        const date_picker = new controls.Date_Picker({
            context,
            min: '2024-01-02',
            max: '2024-01-10'
        });

        expect(date_picker.dom.attributes.min).to.equal('2024-01-02');
        expect(date_picker.dom.attributes.max).to.equal('2024-01-10');

        date_picker.set_value('2024-01-01');
        expect(date_picker.get_value()).to.equal('2024-01-02');
    });

    it('supports keyboard navigation', () => {
        const date_picker = new controls.Date_Picker({
            context,
            value: '2024-01-02'
        });

        date_picker.register_this_and_subcontrols();
        document.body.innerHTML = date_picker.html;

        jsgui.pre_activate(context);
        jsgui.activate(context);

        const input_el = document.querySelector('input[type="date"]');
        input_el.value = '2024-01-02';
        const event = new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
        input_el.dispatchEvent(event);

        expect(input_el.value).to.equal('2024-01-03');
    });
});
