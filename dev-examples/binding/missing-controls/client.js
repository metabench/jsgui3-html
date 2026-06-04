const jsgui = require('../../../html');
const bootstrap_client_controls = require('../../client_bootstrap');

const { Control, Active_HTML_Document } = jsgui;
const controls = jsgui.controls;

class Missing_Controls_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'missing_controls_demo';
        super(spec);

        const { context } = this;
        this.progress_value = 40;
        this.meter_value = 0.4;
        this.pagination_page = 1;

        if (typeof this.body.add_class === 'function') {
            this.body.add_class('missing-controls-body');
        }

        if (!spec.el) {
            this.compose_ui(context);
        }
    }

    compose_ui(context) {
        const container = new Control({ context, tag_name: 'div' });
        container.add_class('missing-controls-container');
        this.body.add(container);

        const create_section = title_text => {
            const section = new Control({ context, tag_name: 'section' });
            section.add_class('controls-section');
            const title = new Control({ context, tag_name: 'h2' });
            title.add_class('section-title');
            title.add(title_text);
            section.add(title);
            container.add(section);
            return section;
        };

        const add_row = (section, label_text, control) => {
            const row = new Control({ context, tag_name: 'div' });
            row.add_class('control-row');
            const label = new Control({ context, tag_name: 'div' });
            label.add_class('control-label');
            label.add(label_text);
            row.add(label);
            row.add(control);
            section.add(row);
            return row;
        };

        const inputs_section = create_section('Inputs');
        const textarea = new controls.Textarea({
            context,
            value: 'Notes',
            rows: 3,
            cols: 30,
            placeholder: 'Enter text'
        });
        textarea.add_class('demo-textarea');
        add_row(inputs_section, 'Textarea', textarea);

        const number_input = new controls.Number_Input({
            context,
            value: 3,
            min: 0,
            max: 10,
            step: 1
        });
        number_input.add_class('demo-number-input');
        add_row(inputs_section, 'Number input', number_input);

        this.number_stepper = new controls.Number_Stepper({
            context,
            value: 2,
            min: 0,
            max: 10,
            step: 1
        });
        this.number_stepper.add_class('demo-number-stepper');
        add_row(inputs_section, 'Number stepper', this.number_stepper);

        const range_input = new controls.Range_Input({
            context,
            value: 25,
            min: 0,
            max: 100,
            step: 5
        });
        range_input.add_class('demo-range-input');
        add_row(inputs_section, 'Range input', range_input);

        this.stepped_slider = new controls.Stepped_Slider({
            context,
            value: 20,
            min: 0,
            max: 100,
            step: 10,
            ticks: [0, 25, 50, 75, 100],
            show_value: true
        });
        this.stepped_slider.add_class('demo-stepped-slider');
        add_row(inputs_section, 'Stepped slider', this.stepped_slider);

        const email_input = new controls.Email_Input({
            context,
            value: 'user@example.com'
        });
        email_input.add_class('demo-email-input');
        add_row(inputs_section, 'Email input', email_input);

        const password_input = new controls.Password_Input({
            context,
            value: 'secret'
        });
        password_input.add_class('demo-password-input');
        add_row(inputs_section, 'Password input', password_input);

        const url_input = new controls.Url_Input({
            context,
            value: 'https://example.com'
        });
        url_input.add_class('demo-url-input');
        add_row(inputs_section, 'URL input', url_input);

        const tel_input = new controls.Tel_Input({
            context,
            value: '+1 555 0100'
        });
        tel_input.add_class('demo-tel-input');
        add_row(inputs_section, 'Tel input', tel_input);

        const indicators_section = create_section('Indicators');
        this.progress_control = new controls.Progress_Bar({
            context,
            value: 40,
            max: 100
        });
        this.progress_control.add_class('demo-progress-bar');
        add_row(indicators_section, 'Progress bar', this.progress_control);

        this.meter_control = new controls.Meter({
            context,
            value: 0.4,
            min: 0,
            max: 1,
            low: 0.2,
            high: 0.8,
            optimum: 0.6
        });
        this.meter_control.add_class('demo-meter');
        add_row(indicators_section, 'Meter', this.meter_control);

        const progress_button = new Control({ context, tag_name: 'button' });
        progress_button.add('Advance progress');
        progress_button.add_class('demo-progress-button');
        this.progress_button = progress_button;
        add_row(indicators_section, 'Update', progress_button);

        const badge = new controls.Badge({
            context,
            text: 'Beta',
            status: 'info'
        });
        badge.add_class('demo-badge');
        add_row(indicators_section, 'Badge', badge);

        const inline_message = new controls.Inline_Validation_Message({
            context,
            message: 'Required field',
            status: 'error'
        });
        inline_message.add_class('demo-inline-validation');
        add_row(indicators_section, 'Inline validation', inline_message);

        this.toggle_switch = new controls.Toggle_Switch({
            context,
            checked: false,
            on_label: 'Enabled',
            off_label: 'Disabled'
        });
        this.toggle_switch.add_class('demo-toggle-switch');
        add_row(indicators_section, 'Toggle switch', this.toggle_switch);

        const collections_section = create_section('Collections');
        this.tag_input = new controls.Tag_Input({
            context,
            items: ['alpha', 'beta'],
            placeholder: 'Add tag'
        });
        this.tag_input.add_class('demo-tag-input');
        add_row(collections_section, 'Tag input', this.tag_input);

        const navigation_section = create_section('Navigation');
        const breadcrumbs = new controls.Breadcrumbs({
            context,
            items: [
                { label: 'Home', href: '/' },
                { label: 'Settings', href: '/settings' },
                { label: 'Profile' }
            ]
        });
        breadcrumbs.add_class('demo-breadcrumbs');
        add_row(navigation_section, 'Breadcrumbs', breadcrumbs);

        this.pagination = new controls.Pagination({
            context,
            page: 1,
            page_count: 3
        });
        this.pagination.add_class('demo-pagination');
        add_row(navigation_section, 'Pagination', this.pagination);

        const feedback_section = create_section('Feedback');

        const tooltip_wrap = new Control({ context, tag_name: 'div' });
        tooltip_wrap.add_class('tooltip-wrap');
        const tooltip_target = new Control({ context, tag_name: 'button' });
        tooltip_target.add_class('demo-tooltip-target');
        tooltip_target.add('Hover for tooltip');
        const tooltip = new controls.Tooltip({
            context,
            message: 'Helpful hint',
            target: tooltip_target,
            placement: 'top'
        });
        tooltip.add_class('demo-tooltip');
        tooltip_wrap.add(tooltip_target);
        tooltip_wrap.add(tooltip);
        add_row(feedback_section, 'Tooltip', tooltip_wrap);

        const pop_over_wrap = new Control({ context, tag_name: 'div' });
        pop_over_wrap.add_class('popover-wrap');
        const pop_over_target = new Control({ context, tag_name: 'button' });
        pop_over_target.add_class('demo-popover-target');
        pop_over_target.add('Toggle pop-over');
        const pop_over = new controls.Pop_Over({
            context,
            content: 'Additional details go here.',
            target: pop_over_target,
            placement: 'bottom'
        });
        pop_over.add_class('demo-popover');
        pop_over_wrap.add(pop_over_target);
        pop_over_wrap.add(pop_over);
        add_row(feedback_section, 'Pop-over', pop_over_wrap);

        this.toast_control = new controls.Toast({ context });
        this.toast_control.add_class('demo-toast');
        this.toast_button = new Control({ context, tag_name: 'button' });
        this.toast_button.add_class('demo-toast-button');
        this.toast_button.add('Show toast');
        const toast_row = new Control({ context, tag_name: 'div' });
        toast_row.add_class('toast-row');
        toast_row.add(this.toast_button);
        toast_row.add(this.toast_control);
        add_row(feedback_section, 'Toast', toast_row);

        this.alert_banner = new controls.Alert_Banner({
            context,
            message: 'Profile saved',
            status: 'success',
            dismissible: true
        });
        this.alert_banner.add_class('demo-alert-banner');
        add_row(feedback_section, 'Alert banner', this.alert_banner);

        this._ctrl_fields = {
            number_stepper: this.number_stepper,
            stepped_slider: this.stepped_slider,
            progress_control: this.progress_control,
            meter_control: this.meter_control,
            progress_button: this.progress_button,
            toggle_switch: this.toggle_switch,
            tag_input: this.tag_input,
            pagination: this.pagination,
            toast_control: this.toast_control,
            toast_button: this.toast_button,
            alert_banner: this.alert_banner
        };
    }

    sync_toggle_switch_dom(root_el) {
        const input_el = root_el.querySelector('.demo-toggle-switch .jsgui-toggle-input');
        const label_el = root_el.querySelector('.demo-toggle-switch .jsgui-toggle-label');
        if (!input_el || !label_el) return;

        input_el.classList.add('toggle-switch-input');
        label_el.classList.add('toggle-switch-label');
        input_el.setAttribute('aria-checked', input_el.checked ? 'true' : 'false');
        label_el.textContent = input_el.checked ? 'Enabled' : 'Disabled';
    }

    add_tag_item_dom(items_el, tag_text) {
        const item_el = document.createElement('span');
        item_el.className = 'tag-input-item';

        const text_el = document.createElement('span');
        text_el.className = 'tag-input-text';
        text_el.textContent = tag_text;

        const remove_el = document.createElement('button');
        remove_el.type = 'button';
        remove_el.className = 'tag-input-remove';
        remove_el.textContent = 'x';

        item_el.appendChild(text_el);
        item_el.appendChild(remove_el);
        items_el.appendChild(item_el);
    }

    sync_pagination_dom(root_el) {
        const pagination_el = root_el.querySelector('.demo-pagination');
        if (!pagination_el) return;

        pagination_el.querySelectorAll('.pagination-button[data-page]').forEach((button_el) => {
            const page = Number(button_el.getAttribute('data-page'));
            const is_current = page === this.pagination_page;
            button_el.classList.toggle('is-current', is_current);
            button_el.setAttribute('aria-current', is_current ? 'page' : 'false');
        });
    }

    sync_feedback_dom(root_el) {
        const progress_el = root_el.querySelector('.demo-progress-bar');
        const fill_el = progress_el && progress_el.querySelector('.jsgui-progress-fill');
        const meter_el = root_el.querySelector('.demo-meter');

        if (progress_el) {
            progress_el.setAttribute('value', String(this.progress_value));
            progress_el.setAttribute('aria-valuenow', String(this.progress_value));
        }
        if (fill_el) {
            fill_el.style.width = `${this.progress_value}%`;
        }
        if (meter_el) {
            meter_el.setAttribute('value', String(this.meter_value));
        }
    }

    step_number_input(input_el, delta) {
        const current_value = Number(input_el.value || input_el.getAttribute('value') || 0);
        const step = Number(input_el.getAttribute('step') || 1) || 1;
        const min = Number(input_el.getAttribute('min'));
        const max = Number(input_el.getAttribute('max'));
        let next_value = current_value + (step * delta);
        if (Number.isFinite(min)) next_value = Math.max(min, next_value);
        if (Number.isFinite(max)) next_value = Math.min(max, next_value);
        input_el.value = String(next_value);
        input_el.setAttribute('value', String(next_value));
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const root_el = this.dom && this.dom.el;
            if (!root_el || this._demo_dom_bound) return;

            this._demo_dom_bound = true;
            this.sync_toggle_switch_dom(root_el);
            this.sync_pagination_dom(root_el);
            this.sync_feedback_dom(root_el);

            if (this.toast_button && this.toast_control) {
                this.toast_button.on('click', () => {
                    this.toast_control.show('Saved', { status: 'success', timeout_ms: 2000 });
                });
            }

            if (this.progress_button && this.progress_control && this.meter_control) {
                this.progress_button.on('click', () => {
                    const next_value = (this.progress_control.value || 0) + 10;
                    const next_meter = (this.meter_control.value || 0) + 0.1;
                    this.progress_control.set_value(next_value > 100 ? 0 : next_value);
                    this.meter_control.set_value(next_meter > 1 ? 0 : next_meter);
                });
            }

            const toggle_input_el = root_el.querySelector('.demo-toggle-switch .jsgui-toggle-input');
            if (toggle_input_el) {
                toggle_input_el.addEventListener('change', () => {
                    this.sync_toggle_switch_dom(root_el);
                });
            }

            const tag_input_el = root_el.querySelector('.demo-tag-input .tag-input-field');
            const tag_items_el = root_el.querySelector('.demo-tag-input .tag-input-items');
            if (tag_input_el && tag_items_el) {
                tag_input_el.addEventListener('keydown', (event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    const value = tag_input_el.value.trim();
                    if (!value) return;
                    this.add_tag_item_dom(tag_items_el, value);
                    tag_input_el.value = '';
                });

                tag_items_el.addEventListener('click', (event) => {
                    const remove_el = event.target.closest('.tag-input-remove');
                    if (!remove_el) return;
                    const item_el = remove_el.closest('.tag-input-item');
                    if (item_el) {
                        item_el.remove();
                    }
                });
            }

            root_el.querySelectorAll('.demo-pagination .pagination-button[data-page]').forEach((button_el) => {
                button_el.addEventListener('click', () => {
                    this.pagination_page = Number(button_el.getAttribute('data-page')) || 1;
                    this.sync_pagination_dom(root_el);
                });
            });

            const tooltip_target_el = root_el.querySelector('.demo-tooltip-target');
            const tooltip_el = root_el.querySelector('.demo-tooltip');
            if (tooltip_target_el && tooltip_el) {
                const show_tooltip = (visible) => {
                    tooltip_el.classList.toggle('is-visible', visible);
                    tooltip_el.setAttribute('aria-hidden', visible ? 'false' : 'true');
                };
                tooltip_target_el.addEventListener('mouseenter', () => show_tooltip(true));
                tooltip_target_el.addEventListener('mouseleave', () => show_tooltip(false));
            }

            const popover_target_el = root_el.querySelector('.demo-popover-target');
            const popover_el = root_el.querySelector('.demo-popover');
            if (popover_target_el && popover_el) {
                const show_popover = (visible) => {
                    popover_el.classList.toggle('is-visible', visible);
                    popover_el.setAttribute('aria-hidden', visible ? 'false' : 'true');
                };
                popover_target_el.addEventListener('click', () => {
                    show_popover(!popover_el.classList.contains('is-visible'));
                });
                document.addEventListener('mousedown', (event) => {
                    if (!popover_el.classList.contains('is-visible')) return;
                    if (popover_el.contains(event.target) || popover_target_el.contains(event.target)) return;
                    show_popover(false);
                });
            }

            const dismiss_alert_el = root_el.querySelector('.demo-alert-banner .alert-banner-dismiss');
            const alert_banner_el = root_el.querySelector('.demo-alert-banner');
            if (dismiss_alert_el && alert_banner_el) {
                dismiss_alert_el.addEventListener('click', () => {
                    alert_banner_el.style.display = 'none';
                });
            }

            const progress_button_el = root_el.querySelector('.demo-progress-button');
            if (progress_button_el) {
                progress_button_el.addEventListener('click', () => {
                    this.progress_value = this.progress_value >= 100 ? 0 : this.progress_value + 10;
                    this.meter_value = this.meter_value >= 1 ? 0 : Math.round((this.meter_value + 0.1) * 10) / 10;
                    this.sync_feedback_dom(root_el);
                });
            }

            const stepper_input_el = root_el.querySelector('.demo-number-stepper .number-stepper-input');
            const stepper_inc_el = root_el.querySelector('.demo-number-stepper .number-stepper-increment');
            const stepper_dec_el = root_el.querySelector('.demo-number-stepper .number-stepper-decrement');
            if (stepper_input_el && stepper_inc_el && stepper_dec_el) {
                stepper_inc_el.addEventListener('click', () => this.step_number_input(stepper_input_el, 1));
                stepper_dec_el.addEventListener('click', () => this.step_number_input(stepper_input_el, -1));
            }
        }
    }
}

Missing_Controls_Demo.css = `
* {
    box-sizing: border-box;
}
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 24px;
    background: #f7f7f7;
    color: #222;
}
.missing-controls-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 960px;
    margin: 0 auto;
}
.controls-section {
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.section-title {
    margin: 0 0 12px 0;
    font-size: 1.2em;
}
.control-row {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
}
.control-label {
    font-weight: bold;
    font-size: 0.9em;
}
.tooltip-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.popover-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.toast-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}
`;

jsgui.controls.Missing_Controls_Demo = Missing_Controls_Demo;

bootstrap_client_controls(jsgui, {
    missing_controls_demo: Missing_Controls_Demo
}, {
    bootstrap_key: '__jsgui_missing_controls_demo_context__'
});

module.exports = jsgui;
