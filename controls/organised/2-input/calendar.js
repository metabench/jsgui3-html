const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const Month_View = require('../0-core/0-basic/1-compositional/month-view');

const normalize_date = value => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

class Calendar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'calendar';
        super(spec);
        this.add_class('calendar');

        this.value = spec.value || null;
        this.display_date = normalize_date(spec.display_date) || new Date();
        this.selection_mode = spec.selection_mode || 'single';
        this.view_mode = spec.view_mode || 'month';
        this.min_date = normalize_date(spec.min_date) || null;
        this.max_date = normalize_date(spec.max_date) || null;
        this.first_day_of_week = spec.first_day_of_week || 0;
        this.locale = spec.locale || 'en-US';
        this.show_week_numbers = !!spec.show_week_numbers;
        this.show_other_months = spec.show_other_months !== false;
        this.selectable_other_months = !!spec.selectable_other_months;
        this.show_today = spec.show_today !== false;
        this.show_navigation = spec.show_navigation !== false;
        this.show_header = spec.show_header !== false;
        this.show_day_names = spec.show_day_names !== false;
        this.disabled_dates = spec.disabled_dates || null;
        this.disabled_days = spec.disabled_days || null;
        this.highlighted_dates = spec.highlighted_dates || null;
        this.event_data = spec.event_data || null;
        this.data_model = spec.data_model || null;
        this.value_property = spec.value_property || 'value';
        this.compact = !!spec.compact;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};

        if (this.show_header) {
            const header = new Control({ context });
            header.add_class('calendar-header');
            if (this.show_navigation) {
                const prev = new Control({ context, tag_name: 'button' });
                prev.add_class('calendar-nav-prev');
                prev.add('←');
                const next = new Control({ context, tag_name: 'button' });
                next.add_class('calendar-nav-next');
                next.add('→');
                header.add(prev);
                header.add(next);
                this._ctrl_fields.prev = prev;
                this._ctrl_fields.next = next;
            }
            const title = new Control({ context });
            title.add_class('calendar-title');
            header.add(title);
            this._ctrl_fields.title = title;
            this.add(header);
        }

        const month_view = new Month_View({
            context,
            month: this.display_date.getMonth(),
            year: this.display_date.getFullYear()
        });
        month_view.add_class('calendar-grid');
        this.add(month_view);
        this._ctrl_fields.month_view = month_view;

        this._update_title();
    }

    _update_title() {
        const title = this._ctrl_fields && this._ctrl_fields.title;
        if (!title) return;
        const month = this.display_date.toLocaleString(this.locale, { month: 'long' });
        const year = this.display_date.getFullYear();
        title.clear();
        title.add(`${month} ${year}`);
    }

    _apply_selected_date(date) {
        this.value = date;
        if (this.data_model && this.value_property) {
            this.data_model[this.value_property] = date;
        }
        this.raise('change', { value: date, old_value: null });
    }

    get_value() {
        return this.value;
    }

    set_value(date) {
        const normalized = normalize_date(date);
        this.value = normalized;
        if (normalized) {
            this.display_date = new Date(normalized.getFullYear(), normalized.getMonth(), 1);
            this._update_title();
        }
    }

    clear() {
        this.value = null;
        this.raise('change', { value: null, old_value: null });
    }

    go_to_date(date) {
        const normalized = normalize_date(date);
        if (!normalized) return;
        this.display_date = new Date(normalized.getFullYear(), normalized.getMonth(), 1);
        if (this._ctrl_fields && this._ctrl_fields.month_view) {
            this._ctrl_fields.month_view.month = this.display_date.getMonth();
            this._ctrl_fields.month_view.year = this.display_date.getFullYear();
            this._ctrl_fields.month_view.refresh_month_view();
        }
        this._update_title();
        this.raise('month-change', { month: this.display_date.getMonth(), year: this.display_date.getFullYear() });
    }

    go_to_today() {
        this.go_to_date(new Date());
    }

    next_month() {
        const next = new Date(this.display_date.getFullYear(), this.display_date.getMonth() + 1, 1);
        this.go_to_date(next);
    }

    prev_month() {
        const prev = new Date(this.display_date.getFullYear(), this.display_date.getMonth() - 1, 1);
        this.go_to_date(prev);
    }

    next_year() {
        const next = new Date(this.display_date.getFullYear() + 1, this.display_date.getMonth(), 1);
        this.go_to_date(next);
    }

    prev_year() {
        const prev = new Date(this.display_date.getFullYear() - 1, this.display_date.getMonth(), 1);
        this.go_to_date(prev);
    }

    set_view_mode(mode) {
        this.view_mode = mode;
        this.raise('view-change', { view_mode: mode });
    }

    get_display_date() {
        return this.display_date;
    }

    refresh() {
        if (this._ctrl_fields && this._ctrl_fields.month_view) {
            this._ctrl_fields.month_view.refresh_month_view();
        }
        this._update_title();
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const month_view = this._ctrl_fields && this._ctrl_fields.month_view;
            const prev = this._ctrl_fields && this._ctrl_fields.prev;
            const next = this._ctrl_fields && this._ctrl_fields.next;

            if (prev && prev.dom.el) {
                prev.dom.el.addEventListener('click', () => this.prev_month());
            }
            if (next && next.dom.el) {
                next.dom.el.addEventListener('click', () => this.next_month());
            }

            if (month_view) {
                month_view.on('change', e_change => {
                    if (e_change && e_change.name === 'day') {
                        const selected = new Date(month_view.year, month_view.month, month_view.day);
                        this._apply_selected_date(selected);
                        this.raise('date-click', { date: selected, cell: e_change.value });
                    }
                });
            }
        }
    }
}

module.exports = Calendar;
