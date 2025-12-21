const jsgui = require('../../../../../html-core/html-core');
const {Control, Control_Data, Control_View, Data_Object} = jsgui;
const {field} = require('obext');

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const pad_2 = value => String(value).padStart(2, '0');

const to_iso_date = date => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = pad_2(date.getMonth() + 1);
    const day = pad_2(date.getDate());
    return `${year}-${month}-${day}`;
};

const parse_iso_date = value => {
    if (!value || typeof value !== 'string') return null;
    if (!ISO_DATE_RE.test(value)) return null;
    const [year, month, day] = value.split('-').map(part => parseInt(part, 10));
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const clamp_iso_value = (value, min_value, max_value) => {
    if (!value) return '';
    let next_value = value;
    if (min_value && next_value < min_value) next_value = min_value;
    if (max_value && next_value > max_value) next_value = max_value;
    return next_value;
};

const add_days = (date, day_delta) => {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + day_delta);
    return next;
};

const add_months = (date, month_delta) => {
    const year = date.getFullYear();
    const month = date.getMonth() + month_delta;
    const day = date.getDate();
    const first_of_target = new Date(year, month, 1);
    const last_day = new Date(first_of_target.getFullYear(), first_of_target.getMonth() + 1, 0).getDate();
    const safe_day = Math.min(day, last_day);
    return new Date(first_of_target.getFullYear(), first_of_target.getMonth(), safe_day);
};

class Date_Picker extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'date_picker';
        super(spec);
        this.add_class('date-picker');
        this.dom.tagName = 'input';
        this.dom.attributes.type = 'date';

        this.locale = spec.locale || '';
        this.week_start = spec.week_start !== undefined ? Number(spec.week_start) : 0;
        this.min_value = spec.min ? this.format_date(spec.min, {format: 'iso'}) : '';
        this.max_value = spec.max ? this.format_date(spec.max, {format: 'iso'}) : '';

        if (this.locale) {
            this.dom.attributes.lang = this.locale;
        }
        if (this.week_start !== undefined) {
            this.dom.attributes['data-week-start'] = String(this.week_start);
        }
        if (this.min_value) {
            this.dom.attributes.min = this.min_value;
        }
        if (this.max_value) {
            this.dom.attributes.max = this.max_value;
        }

        this.construct_synchronised_data_and_view_models(spec);

        if (spec.value !== undefined) {
            this.set_value(spec.value, {from_model: true});
        }
    }

    construct_synchronised_data_and_view_models(spec) {
        const {context} = this;
        this.data = new Control_Data({context});
        if (spec.data && spec.data.model) {
            this.data.model = spec.data.model;
        } else {
            this.data.model = new Data_Object({context});
        }
        field(this.data.model, 'value');
        field(this.data.model, 'min');
        field(this.data.model, 'max');
        field(this.data.model, 'locale');
        field(this.data.model, 'week_start');

        this.view = new Control_View({context});
        if (spec.view && spec.view.data && spec.view.data.model) {
            this.view.data.model = spec.view.data.model;
        } else {
            this.view.data.model = new Data_Object({context});
        }
        field(this.view.data.model, 'value');
        field(this.view.data.model, 'min');
        field(this.view.data.model, 'max');
        field(this.view.data.model, 'locale');
        field(this.view.data.model, 'week_start');

        this.data.model.on('change', e => {
            const {name, value, old} = e;
            if (value === old) return;
            if (name === 'value') {
                this.view.data.model.value = value;
                this.set_value(value, {from_model: true});
            } else if (name === 'min') {
                this.view.data.model.min = value;
                this.set_min(value, {from_model: true});
            } else if (name === 'max') {
                this.view.data.model.max = value;
                this.set_max(value, {from_model: true});
            } else if (name === 'locale') {
                this.view.data.model.locale = value;
                this.set_locale(value, {from_model: true});
            } else if (name === 'week_start') {
                this.view.data.model.week_start = value;
                this.set_week_start(value, {from_model: true});
            }
        });

        this.view.data.model.on('change', e => {
            const {name, value, old} = e;
            if (value === old) return;
            if (name === 'value') {
                this.data.model.value = value;
                this.set_value(value, {from_model: true});
            } else if (name === 'min') {
                this.data.model.min = value;
                this.set_min(value, {from_model: true});
            } else if (name === 'max') {
                this.data.model.max = value;
                this.set_max(value, {from_model: true});
            } else if (name === 'locale') {
                this.data.model.locale = value;
                this.set_locale(value, {from_model: true});
            } else if (name === 'week_start') {
                this.data.model.week_start = value;
                this.set_week_start(value, {from_model: true});
            }
        });
    }

    /**
     * Format a date value as ISO or locale string.
     * @param {Date|string} value - Date to format.
     * @param {Object} [options] - Options for formatting.
     * @returns {string}
     */
    format_date(value, options = {}) {
        const format = options.format || 'iso';
        let date_value = value;
        if (typeof value === 'string') {
            date_value = parse_iso_date(value);
        }
        if (!(date_value instanceof Date)) return '';
        if (format === 'locale' && typeof Intl !== 'undefined') {
            const locale = options.locale || this.locale || undefined;
            try {
                return new Intl.DateTimeFormat(locale).format(date_value);
            } catch (e) {
                return to_iso_date(date_value);
            }
        }
        return to_iso_date(date_value);
    }

    /**
     * Parse a date value into a Date object.
     * @param {Date|string} value - Value to parse.
     * @returns {Date|null}
     */
    parse_date(value) {
        if (value instanceof Date) return value;
        return parse_iso_date(value);
    }

    /**
     * Set the picker value.
     * @param {Date|string} value - Value to set.
     * @param {Object} [options] - Optional settings.
     */
    set_value(value, options = {}) {
        const iso_value = this.format_date(value, {format: 'iso'});
        const clamped_value = clamp_iso_value(iso_value, this.min_value, this.max_value);
        if (!options.from_model) {
            this.set_model_value('value', clamped_value);
        }
        if (this.dom.el) {
            this.dom.el.value = clamped_value;
        }
        this.dom.attributes.value = clamped_value;
    }

    /**
     * Get the picker value.
     * @returns {string}
     */
    get_value() {
        if (this.data && this.data.model && this.data.model.value) {
            return this.data.model.value;
        }
        return this.dom.attributes.value || '';
    }

    /**
     * Set minimum value.
     * @param {Date|string} value - Minimum value.
     * @param {Object} [options] - Optional settings.
     */
    set_min(value, options = {}) {
        this.min_value = value ? this.format_date(value, {format: 'iso'}) : '';
        this.dom.attributes.min = this.min_value;
        if (!options.from_model) {
            this.set_model_value('min', this.min_value);
        }
    }

    /**
     * Set maximum value.
     * @param {Date|string} value - Maximum value.
     * @param {Object} [options] - Optional settings.
     */
    set_max(value, options = {}) {
        this.max_value = value ? this.format_date(value, {format: 'iso'}) : '';
        this.dom.attributes.max = this.max_value;
        if (!options.from_model) {
            this.set_model_value('max', this.max_value);
        }
    }

    /**
     * Set locale for formatting.
     * @param {string} locale - Locale string.
     * @param {Object} [options] - Optional settings.
     */
    set_locale(locale, options = {}) {
        this.locale = locale || '';
        if (this.locale) {
            this.dom.attributes.lang = this.locale;
        }
        if (!options.from_model) {
            this.set_model_value('locale', this.locale);
        }
    }

    /**
     * Set week start index.
     * @param {number} week_start - Week start index.
     * @param {Object} [options] - Optional settings.
     */
    set_week_start(week_start, options = {}) {
        this.week_start = week_start !== undefined ? Number(week_start) : 0;
        this.dom.attributes['data-week-start'] = String(this.week_start);
        if (!options.from_model) {
            this.set_model_value('week_start', this.week_start);
        }
    }

    set_model_value(name, value) {
        if (this.data && this.data.model && this.data.model[name] !== value) {
            this.data.model[name] = value;
        }
        if (this.view && this.view.data && this.view.data.model && this.view.data.model[name] !== value) {
            this.view.data.model[name] = value;
        }
    }

    handle_keydown(e_keydown) {
        const key = e_keydown.key;
        if (!key) return;
        const current_value = this.dom.el ? this.dom.el.value : this.get_value();
        let base_date = this.parse_date(current_value);
        if (!base_date) {
            if (this.min_value) {
                base_date = this.parse_date(this.min_value);
            } else {
                base_date = new Date();
            }
        }
        if (!base_date) return;

        let next_date = null;
        if (key === 'ArrowUp') {
            next_date = add_days(base_date, 1);
        } else if (key === 'ArrowDown') {
            next_date = add_days(base_date, -1);
        } else if (key === 'PageUp') {
            next_date = add_months(base_date, -1);
        } else if (key === 'PageDown') {
            next_date = add_months(base_date, 1);
        } else if (key === 'Home' && this.min_value) {
            next_date = this.parse_date(this.min_value);
        } else if (key === 'End' && this.max_value) {
            next_date = this.parse_date(this.max_value);
        }

        if (next_date) {
            e_keydown.preventDefault();
            this.set_value(next_date);
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const {dom} = this;
            const sync_value = () => {
                if (dom.el) {
                    this.view.data.model.value = dom.el.value;
                }
            };
            this.add_dom_event_listener('change', sync_value);
            this.add_dom_event_listener('keypress', sync_value);
            this.add_dom_event_listener('keyup', sync_value);
            this.add_dom_event_listener('keydown', e_keydown => {
                this.handle_keydown(e_keydown);
                sync_value();
            });
        }
    }
}

module.exports = Date_Picker;
