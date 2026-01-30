const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const Date_Picker = require('../0-core/0-basic/0-native-compositional/date-picker');
const Calendar = require('./calendar');
const Button = require('../0-core/0-basic/0-native-compositional/button');

class Date_Picker_Progressive extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'date_picker_progressive';
        super(spec);
        this.add_class('date-picker-progressive');

        this.value = spec.value || null;
        this.min = spec.min || null;
        this.max = spec.max || null;
        this.format = spec.format || 'YYYY-MM-DD';
        this.locale = spec.locale || 'en-US';
        this.mode = spec.mode || 'auto';
        this.first_day_of_week = spec.first_day_of_week || 0;
        this.disabled_dates = spec.disabled_dates || null;
        this.disabled_days = spec.disabled_days || null;
        this.show_week_numbers = !!spec.show_week_numbers;
        this.show_today_button = spec.show_today_button !== false;
        this.show_clear_button = spec.show_clear_button !== false;
        this.calendar_position = spec.calendar_position || 'auto';
        this.readonly = !!spec.readonly;
        this.required = !!spec.required;

        this.calendar_open = false;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        const native_input = new Date_Picker({
            context,
            value: this.value,
            min: this.min,
            max: this.max,
            locale: this.locale,
            week_start: this.first_day_of_week,
            readonly: this.readonly,
            required: this.required
        });
        native_input.add_class('date-picker-native');
        this.add(native_input);
        this._ctrl_fields.native_input = native_input;

        const toggle = new Button({ context });
        toggle.add_class('date-picker-toggle');
        toggle.add('📅');
        this.add(toggle);
        this._ctrl_fields.toggle = toggle;

        const calendar = new Calendar({
            context,
            value: this.value,
            min_date: this.min,
            max_date: this.max,
            first_day_of_week: this.first_day_of_week,
            locale: this.locale,
            selection_mode: 'single'
        });
        calendar.add_class('date-picker-calendar');
        this.add(calendar);
        this._ctrl_fields.calendar = calendar;
        calendar.hide();
    }

    _sync_calendar(value) {
        const calendar = this._ctrl_fields && this._ctrl_fields.calendar;
        if (calendar) {
            calendar.set_value(value);
        }
    }

    _sync_native(value) {
        const native_input = this._ctrl_fields && this._ctrl_fields.native_input;
        if (native_input && typeof native_input.set_value === 'function') {
            native_input.set_value(value);
        }
    }

    get_value() {
        const native_input = this._ctrl_fields && this._ctrl_fields.native_input;
        if (native_input && typeof native_input.get_value === 'function') {
            return native_input.get_value();
        }
        return this.value;
    }

    set_value(value) {
        this.value = value;
        this._sync_native(value);
        this._sync_calendar(value);
        this.raise('change', { value });
    }

    open_calendar() {
        const calendar = this._ctrl_fields && this._ctrl_fields.calendar;
        if (!calendar) return;
        calendar.show();
        this.calendar_open = true;
        this.raise('calendar-open', {});
    }

    close_calendar() {
        const calendar = this._ctrl_fields && this._ctrl_fields.calendar;
        if (!calendar) return;
        calendar.hide();
        this.calendar_open = false;
        this.raise('calendar-close', {});
    }

    toggle_calendar() {
        if (this.calendar_open) this.close_calendar();
        else this.open_calendar();
    }

    clear() {
        this.set_value(null);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const native_input = this._ctrl_fields && this._ctrl_fields.native_input;
            const calendar = this._ctrl_fields && this._ctrl_fields.calendar;
            const toggle = this._ctrl_fields && this._ctrl_fields.toggle;

            if (toggle && toggle.dom.el) {
                toggle.dom.el.addEventListener('click', () => this.toggle_calendar());
            }

            if (native_input) {
                native_input.on('change', () => {
                    const value = native_input.get_value();
                    this.value = value;
                    this._sync_calendar(value);
                    this.raise('change', { value });
                });
            }

            if (calendar) {
                calendar.on('change', e => {
                    const value = e.value;
                    this.value = value;
                    this._sync_native(value);
                    this.raise('change', { value });
                });
            }
        }
    }
}

module.exports = Date_Picker_Progressive;
