const { expect } = require('chai');
const sinon = require('sinon');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');

describe('Missing Controls', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Textarea', () => {
        it('should render textarea with value', () => {
            const textarea = new controls.Textarea({
                context,
                value: 'Hello',
                rows: 2,
                cols: 10
            });

            textarea.register_this_and_subcontrols();
            document.body.innerHTML = textarea.html;

            const el = document.querySelector('textarea');
            expect(el).to.exist;
            expect(el.value).to.equal('Hello');
        });
    });

    describe('Number_Input', () => {
        it('should render number input with attributes', () => {
            const number_input = new controls.Number_Input({
                context,
                value: 5,
                min: 0,
                max: 10,
                step: 1
            });

            const html = number_input.html;
            expect(html).to.include('type="number"');
            expect(html).to.include('value="5"');
            expect(html).to.include('min="0"');
            expect(html).to.include('max="10"');
        });
    });

    describe('Number_Stepper', () => {
        it('should step value up and down', () => {
            const number_stepper = new controls.Number_Stepper({
                context,
                value: 2,
                step: 1
            });

            number_stepper.step_up();
            expect(number_stepper.get_value()).to.equal(3);
            number_stepper.step_down();
            expect(number_stepper.get_value()).to.equal(2);
        });
    });

    describe('Range_Input', () => {
        it('should render range input with aria attributes', () => {
            const range_input = new controls.Range_Input({
                context,
                value: 25,
                min: 0,
                max: 100
            });

            const html = range_input.html;
            expect(html).to.include('type="range"');
            expect(html).to.include('aria-valuenow="25"');
            expect(html).to.include('aria-valuemin="0"');
            expect(html).to.include('aria-valuemax="100"');
        });
    });

    describe('Stepped_Slider', () => {
        it('should clamp and update value', () => {
            const stepped_slider = new controls.Stepped_Slider({
                context,
                min: 0,
                max: 10,
                value: 5
            });

            stepped_slider.set_value(12);
            expect(stepped_slider.get_value()).to.equal(10);
        });
    });

    describe('Progress_Bar', () => {
        it('should render progress with value and max', () => {
            const progress_bar = new controls.Progress_Bar({
                context,
                value: 40,
                max: 100
            });

            const html = progress_bar.html;
            expect(html).to.include('<progress');
            expect(html).to.include('value="40"');
            expect(html).to.include('max="100"');
        });
    });

    describe('Meter', () => {
        it('should render meter with value range', () => {
            const meter = new controls.Meter({
                context,
                value: 0.6,
                min: 0,
                max: 1
            });

            const html = meter.html;
            expect(html).to.include('<meter');
            expect(html).to.include('value="0.6"');
            expect(html).to.include('min="0"');
            expect(html).to.include('max="1"');
        });
    });

    describe('Toggle_Switch', () => {
        it('should update checked state on change', () => {
            const toggle_switch = new controls.Toggle_Switch({
                context,
                checked: false
            });

            toggle_switch.register_this_and_subcontrols();
            document.body.innerHTML = toggle_switch.html;

            jsgui.pre_activate(context);
            jsgui.activate(context);

            const change_spy = sinon.spy();
            toggle_switch.on('change', change_spy);

            const input_el = document.querySelector('.toggle-switch-input');
            input_el.checked = true;
            triggerEvent(input_el, 'change');

            expect(change_spy.called).to.equal(true);
            expect(toggle_switch.checked).to.equal(true);
        });
    });

    describe('Badge', () => {
        it('should apply status class and text', () => {
            const badge = new controls.Badge({
                context,
                text: 'New',
                status: 'info'
            });

            const html = badge.html;
            expect(html).to.include('badge-info');
            expect(html).to.include('New');
        });
    });

    describe('Inline_Validation_Message', () => {
        it('should render message and status', () => {
            const message = new controls.Inline_Validation_Message({
                context,
                message: 'Required',
                status: 'error'
            });

            const html = message.html;
            expect(html).to.include('Required');
            expect(html).to.include('inline-validation-message-error');
        });
    });

    describe('Tag_Input', () => {
        it('should add and remove tags', () => {
            const tag_input = new controls.Tag_Input({
                context,
                items: ['alpha']
            });

            expect(tag_input.get_items()).to.deep.equal(['alpha']);
            tag_input.add_item('beta');
            expect(tag_input.get_items()).to.deep.equal(['alpha', 'beta']);
            tag_input.remove_item('alpha');
            expect(tag_input.get_items()).to.deep.equal(['beta']);
        });
    });

    describe('Breadcrumbs', () => {
        it('should raise navigate on click', () => {
            const breadcrumbs = new controls.Breadcrumbs({
                context,
                items: [
                    { label: 'Home', href: '/' },
                    { label: 'Settings' }
                ]
            });

            breadcrumbs.register_this_and_subcontrols();
            document.body.innerHTML = breadcrumbs.html;

            jsgui.pre_activate(context);
            jsgui.activate(context);

            const navigate_spy = sinon.spy();
            breadcrumbs.on('navigate', navigate_spy);

            const link_el = document.querySelector('.breadcrumbs-link');
            triggerEvent(link_el, 'click');

            expect(navigate_spy.called).to.equal(true);
        });
    });

    describe('Pagination', () => {
        it('should change page on click', () => {
            const pagination = new controls.Pagination({
                context,
                page: 1,
                page_count: 3
            });

            pagination.register_this_and_subcontrols();
            document.body.innerHTML = pagination.html;

            jsgui.pre_activate(context);
            jsgui.activate(context);

            const page_spy = sinon.spy();
            pagination.on('page_change', page_spy);

            const page_button = document.querySelector('button[data-page="2"]');
            triggerEvent(page_button, 'click');

            expect(page_spy.called).to.equal(true);
            expect(pagination.page).to.equal(2);
        });
    });

    describe('Tooltip', () => {
        it('should toggle visibility', () => {
            const tooltip = new controls.Tooltip({
                context,
                message: 'Hint'
            });

            tooltip.show();
            expect(tooltip.dom.attributes['aria-hidden']).to.equal('false');
            tooltip.hide();
            expect(tooltip.dom.attributes['aria-hidden']).to.equal('true');
        });
    });

    describe('Pop_Over', () => {
        it('should toggle visibility', () => {
            const pop_over = new controls.Pop_Over({
                context,
                content: 'Details'
            });

            pop_over.show();
            expect(pop_over.dom.attributes['aria-hidden']).to.equal('false');
            pop_over.hide();
            expect(pop_over.dom.attributes['aria-hidden']).to.equal('true');
        });
    });

    describe('Toast', () => {
        it('should add and dismiss toasts', () => {
            const toast = new controls.Toast({ context });
            const toast_id = toast.show('Saved');

            expect(toast.toast_items.size).to.equal(1);
            toast.dismiss(toast_id);
            expect(toast.toast_items.size).to.equal(0);
        });
    });

    describe('Alert_Banner', () => {
        it('should dismiss banner', () => {
            const alert_banner = new controls.Alert_Banner({
                context,
                message: 'Alert',
                dismissible: true
            });

            alert_banner.dismiss();
            expect(alert_banner.has_class('alert-banner-hidden')).to.equal(true);
        });
    });

    describe('Typed inputs', () => {
        it('should set email input type', () => {
            const email_input = new controls.Email_Input({ context });
            expect(email_input.dom.attributes.type).to.equal('email');
        });

        it('should set password input type', () => {
            const password_input = new controls.Password_Input({ context });
            expect(password_input.dom.attributes.type).to.equal('password');
        });

        it('should set url input type', () => {
            const url_input = new controls.Url_Input({ context });
            expect(url_input.dom.attributes.type).to.equal('url');
        });

        it('should set tel input type', () => {
            const tel_input = new controls.Tel_Input({ context });
            expect(tel_input.dom.attributes.type).to.equal('tel');
        });
    });
});
