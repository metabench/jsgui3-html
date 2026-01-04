const { expect } = require('chai');
const sinon = require('sinon');
const jsgui = require('../../html-core/html-core');
const { Control } = jsgui;
const { apply_input_base } = require('../../control_mixins/input_base');
const { apply_input_validation, validators } = require('../../control_mixins/input_validation');

describe('Input Mixins', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('should sync value to DOM and raise value_change', () => {
        const ctrl = new Control({
            context,
            tag_name: 'input'
        });
        ctrl.dom.attributes.type = 'text';

        apply_input_base(ctrl, {
            apply_focus_ring: false
        });

        ctrl.register_this_and_subcontrols();
        document.body.innerHTML = ctrl.html;
        jsgui.pre_activate(context);
        jsgui.activate(context);

        const value_spy = sinon.spy();
        ctrl.on('value_change', value_spy);

        ctrl.set_value('hello');

        expect(ctrl.dom.el.value).to.equal('hello');
        expect(value_spy.calledOnce).to.equal(true);
        expect(value_spy.firstCall.args[0].value).to.equal('hello');
    });

    it('should raise input events when DOM changes', async () => {
        const ctrl = new Control({
            context,
            tag_name: 'input'
        });
        ctrl.dom.attributes.type = 'text';

        apply_input_base(ctrl, {
            apply_focus_ring: false
        });

        ctrl.register_this_and_subcontrols();
        document.body.innerHTML = ctrl.html;
        jsgui.pre_activate(context);
        jsgui.activate(context);

        const input_spy = sinon.spy();
        ctrl.on('input', input_spy);

        await waitFor(0);

        ctrl.dom.el.value = 'updated';
        triggerEvent(ctrl.dom.el, 'input');

        expect(ctrl.get_value()).to.equal('updated');
        expect(input_spy.calledOnce).to.equal(true);
        expect(input_spy.firstCall.args[0].value).to.equal('updated');
    });

    it('should validate required values', async () => {
        const ctrl = new Control({
            context,
            tag_name: 'input'
        });
        ctrl.dom.attributes.type = 'text';

        apply_input_base(ctrl, {
            apply_focus_ring: false
        });
        apply_input_validation(ctrl);

        ctrl.add_validator(validators.required);

        ctrl.set_value('');
        const result = await ctrl.validate();

        expect(result.valid).to.equal(false);
        expect(ctrl.validation_state).to.equal('invalid');
    });
});
