const jsgui = require('../../html');

const { Control, Active_HTML_Document } = jsgui;
const Date_Picker_Progressive = require('../../controls/organised/2-input/date_picker_progressive');
const Calendar = require('../../controls/organised/2-input/calendar');
const { Data_Object } = require('lang-tools');

class Date_Picker_Calendar_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'date_picker_calendar_demo';
        super(spec);

        const { context } = this;

        if (this.body && typeof this.body.add_class === 'function') {
            this.body.add_class('date-picker-demo-body');
        }

        if (!spec.el) {
            if (this.head) {
                const title = new Control({ context, tag_name: 'title' });
                title.add('Date Picker & Calendar Demo');
                this.head.add(title);

                const link = new Control({ context, tag_name: 'link' });
                link.dom.attributes.rel = 'stylesheet';
                link.dom.attributes.href = '/css/date-picker.css';
                this.head.add(link);

                const link2 = new Control({ context, tag_name: 'link' });
                link2.dom.attributes.rel = 'stylesheet';
                link2.dom.attributes.href = '/css/calendar.css';
                this.head.add(link2);
            }

            const page = new Control({ context, tag_name: 'div' });
            page.add_class('date-picker-demo');

            const header = new Control({ context, tag_name: 'header' });
            header.add_class('demo-header');

            const heading = new Control({ context, tag_name: 'h1' });
            heading.add('Date Picker & Calendar Demo');
            header.add(heading);

            const subtitle = new Control({ context, tag_name: 'p' });
            subtitle.add('Progressive enhancement date picker with calendar control and MVVM data binding.');
            header.add(subtitle);

            page.add(header);

            // Section 1: Basic Date Picker Progressive
            const section1 = new Control({ context, tag_name: 'section' });
            section1.add_class('demo-section');

            const h2_1 = new Control({ context, tag_name: 'h2' });
            h2_1.add('Progressive Enhancement Date Picker');
            section1.add(h2_1);

            const p1 = new Control({ context, tag_name: 'p' });
            p1.add('Native HTML5 date input with custom calendar fallback. Click the calendar icon to open the custom calendar.');
            section1.add(p1);

            const date_picker = new Date_Picker_Progressive({
                context,
                value: '2024-01-15',
                min: '2023-01-01',
                max: '2025-12-31'
            });
            date_picker.dom.attributes['data-test'] = 'date-picker-basic';
            section1.add(date_picker);

            const output1 = new Control({ context, tag_name: 'p' });
            output1.add_class('output');
            output1.add('Selected date: 2024-01-15');
            section1.add(output1);

            page.add(section1);

            // Section 2: Standalone Calendar
            const section2 = new Control({ context, tag_name: 'section' });
            section2.add_class('demo-section');

            const h2_2 = new Control({ context, tag_name: 'h2' });
            h2_2.add('Standalone Calendar Control');
            section2.add(h2_2);

            const p2 = new Control({ context, tag_name: 'p' });
            p2.add('Interactive calendar with month navigation. Click any date to select it.');
            section2.add(p2);

            const calendar = new Calendar({
                context,
                value: new Date(2024, 0, 15),
                show_week_numbers: false,
                first_day_of_week: 0
            });
            calendar.dom.attributes['data-test'] = 'calendar-standalone';
            section2.add(calendar);

            const output2 = new Control({ context, tag_name: 'p' });
            output2.add_class('output');
            output2.add('Selected date: 2024-01-15');
            section2.add(output2);

            page.add(section2);

            // Section 3: MVVM Data Binding
            const section3 = new Control({ context, tag_name: 'section' });
            section3.add_class('demo-section');

            const h2_3 = new Control({ context, tag_name: 'h2' });
            h2_3.add('MVVM Data Binding');
            section3.add(h2_3);

            const p3 = new Control({ context, tag_name: 'p' });
            p3.add('Calendar control with MVVM data model. Changes to the model automatically update the view.');
            section3.add(p3);

            const model = new Data_Object({
                selected_date: new Date(2024, 5, 15)
            });

            const calendar_mvvm = new Calendar({
                context,
                data_model: model,
                value_property: 'selected_date',
                value: model.selected_date
            });
            calendar_mvvm.dom.attributes['data-test'] = 'calendar-mvvm';
            section3.add(calendar_mvvm);

            const output3 = new Control({ context, tag_name: 'p' });
            output3.add_class('output');
            output3.add(`Model value: ${model.selected_date.toISOString().split('T')[0]}`);
            section3.add(output3);

            page.add(section3);

            // Section 4: Date Range Picker (Future)
            const section4 = new Control({ context, tag_name: 'section' });
            section4.add_class('demo-section');

            const h2_4 = new Control({ context, tag_name: 'h2' });
            h2_4.add('Date Range Selection');
            section4.add(h2_4);

            const p4 = new Control({ context, tag_name: 'p' });
            p4.add('Two date pickers for selecting a date range (start and end dates).');
            section4.add(p4);

            const range_container = new Control({ context, tag_name: 'div' });
            range_container.add_class('date-range-container');

            const start_picker = new Date_Picker_Progressive({
                context,
                value: '2024-06-01'
            });
            start_picker.dom.attributes['data-test'] = 'date-picker-start';
            range_container.add(start_picker);

            const range_separator = new Control({ context, tag_name: 'span' });
            range_separator.add_class('range-separator');
            range_separator.add(' to ');
            range_container.add(range_separator);

            const end_picker = new Date_Picker_Progressive({
                context,
                value: '2024-06-15'
            });
            end_picker.dom.attributes['data-test'] = 'date-picker-end';
            range_container.add(end_picker);

            section4.add(range_container);

            const output4 = new Control({ context, tag_name: 'p' });
            output4.add_class('output');
            output4.add('Range: 2024-06-01 to 2024-06-15');
            section4.add(output4);

            page.add(section4);

            if (this.body) {
                this.body.add(page);
            } else {
                this.add(page);
            }

            // Store references for activation
            this._date_picker = date_picker;
            this._calendar = calendar;
            this._calendar_mvvm = calendar_mvvm;
            this._start_picker = start_picker;
            this._end_picker = end_picker;
            this._output1 = output1;
            this._output2 = output2;
            this._output3 = output3;
            this._output4 = output4;
            this._model = model;
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();

            // Attach event handlers
            if (this._date_picker) {
                this._date_picker.on('change', e => {
                    if (this._output1) {
                        this._output1.clear();
                        this._output1.add(`Selected date: ${e.value || 'none'}`);
                    }
                });
            }

            if (this._calendar) {
                this._calendar.on('change', e => {
                    if (this._output2 && e.value) {
                        const date_str = e.value.toISOString().split('T')[0];
                        this._output2.clear();
                        this._output2.add(`Selected date: ${date_str}`);
                    }
                });
            }

            if (this._calendar_mvvm && this._model) {
                this._calendar_mvvm.on('change', e => {
                    if (this._output3 && e.value) {
                        const date_str = e.value.toISOString().split('T')[0];
                        this._output3.clear();
                        this._output3.add(`Model value: ${date_str}`);
                    }
                });
            }

            if (this._start_picker && this._end_picker) {
                const update_range = () => {
                    const start = this._start_picker.get_value();
                    const end = this._end_picker.get_value();
                    if (this._output4) {
                        this._output4.clear();
                        this._output4.add(`Range: ${start || 'none'} to ${end || 'none'}`);
                    }
                };

                this._start_picker.on('change', update_range);
                this._end_picker.on('change', update_range);
            }
        }
    }
}

Date_Picker_Calendar_Demo.css = `
:root {
    --demo-font-family: 'Segoe UI', system-ui, sans-serif;
}

.date-picker-demo-body {
    margin: 0;
    background: #f7f7f7;
    color: #1f1f1f;
    font-family: var(--demo-font-family);
}

.date-picker-demo {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 24px 80px;
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

.output {
    margin-top: 16px;
    padding: 12px 16px;
    background: #f0f4f8;
    border-left: 4px solid #3b82f6;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
}

.date-range-container {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.range-separator {
    color: #6b7280;
    font-weight: 500;
}

@media (prefers-color-scheme: dark) {
    .date-picker-demo-body {
        background: #1a1a1a;
        color: #e5e7eb;
    }

    .demo-section {
        background: #2a2a2a;
        border-color: #3a3a3a;
    }

    .demo-header p,
    .demo-section p {
        color: #9aa4b2;
    }

    .output {
        background: #1f2937;
        border-left-color: #60a5fa;
        color: #e5e7eb;
    }

    .range-separator {
        color: #9aa4b2;
    }
}
`;

jsgui.controls = jsgui.controls || {};
jsgui.controls.Date_Picker_Calendar_Demo = Date_Picker_Calendar_Demo;

module.exports = jsgui;
