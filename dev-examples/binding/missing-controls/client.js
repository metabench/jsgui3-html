const jsgui = require('../../../html');

const { Control, Active_HTML_Document } = jsgui;
const controls = jsgui.controls;

class Missing_Controls_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'missing_controls_demo';
        super(spec);

        const { context } = this;

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
    }

    activate() {
        if (!this.__active) {
            super.activate();

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

module.exports = jsgui;
