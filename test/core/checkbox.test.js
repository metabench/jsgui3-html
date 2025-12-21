const { expect } = require('chai');
const sinon = require('sinon');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');

describe('Checkbox Control', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('should render checked state when checked is true', () => {
        const checkbox = new controls.Checkbox({
            context,
            text: 'Test Checkbox',
            checked: true
        });

        document.body.innerHTML = checkbox.html;
        const input_el = document.querySelector('input[type="checkbox"]');

        expect(input_el).to.exist;
        expect(input_el.checked).to.equal(true);
        expect(input_el.getAttribute('aria-checked')).to.equal('true');
    });

    it('should raise change with current checked state', () => {
        const checkbox = new controls.Checkbox({
            context,
            text: 'Test Checkbox',
            checked: false
        });

        checkbox.register_this_and_subcontrols();
        document.body.innerHTML = checkbox.html;

        jsgui.pre_activate(context);
        jsgui.activate(context);

        const change_spy = sinon.spy();
        checkbox.on('change', change_spy);

        const input_el = document.querySelector('input[type="checkbox"]');
        expect(input_el.getAttribute('aria-checked')).to.equal('false');
        input_el.checked = true;
        triggerEvent(input_el, 'change');

        expect(change_spy.called).to.equal(true);
        const event_data = change_spy.firstCall.args[0];
        expect(event_data.name).to.equal('checked');
        expect(event_data.value).to.equal(true);
        expect(checkbox.checked).to.equal(true);
        expect(input_el.getAttribute('aria-checked')).to.equal('true');
    });

    it('should sync checked state via set_checked', () => {
        const checkbox = new controls.Checkbox({
            context,
            text: 'Sync Checkbox',
            checked: false
        });

        checkbox.register_this_and_subcontrols();
        document.body.innerHTML = checkbox.html;

        jsgui.pre_activate(context);
        jsgui.activate(context);

        const input_el = document.querySelector('input[type="checkbox"]');
        checkbox.set_checked(true);

        expect(checkbox.get_checked()).to.equal(true);
        expect(input_el.checked).to.equal(true);
        expect(input_el.getAttribute('aria-checked')).to.equal('true');
    });
});
