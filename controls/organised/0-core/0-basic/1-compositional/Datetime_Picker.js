const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;
const Month_View = require('./Month_View');
const Time_Picker = require('./Time_Picker');

const pad2 = n => String(n).padStart(2, '0');

/**
 * DateTime_Picker - Composite control combining Month_View + Time_Picker.
 *
 * Provides full date+time selection in one control. Forwards date config
 * to Month_View and time config to Time_Picker.
 *
 * @param {Object} spec
 * @param {string} [spec.value] ISO datetime 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DDTHH:MM:SS'
 * @param {string} [spec.layout='stacked'] 'stacked' | 'side-by-side' | 'tabbed'
 * @param {boolean} [spec.show_month_view=true]
 * @param {boolean} [spec.show_clock=true]
 * @param {boolean} [spec.use_24h=true]
 * @param {boolean} [spec.show_seconds=false]
 * @param {number} [spec.clock_size]
 * @param {string} [spec.clock_style]
 * @param {boolean} [spec.show_spinners=false]
 * @param {number} [spec.step_minutes]
 * @param {number} [spec.month] 0-based month for Month_View
 * @param {number} [spec.year] Year for Month_View
 * @param {string} [spec.min_date] YYYY-MM-DD min date
 * @param {string} [spec.max_date] YYYY-MM-DD max date
 */
class DateTime_Picker extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'datetime_picker';

        const initial_value = spec.value || null;
        const cfg = {
            layout: spec.layout || 'stacked',
            show_month_view: spec.show_month_view !== false,
            show_clock: spec.show_clock !== false,
            use_24h: spec.use_24h !== false,
            show_seconds: !!spec.show_seconds,
            clock_size: spec.clock_size || 160,
            clock_style: spec.clock_style || 'modern',
            show_spinners: !!spec.show_spinners,
            step_minutes: spec.step_minutes || 1,
            month: spec.month,
            year: spec.year,
            min_date: spec.min_date || null,
            max_date: spec.max_date || null
        };

        super(spec);
        this.add_class('datetime-picker');
        this.add_class(`dtp-layout-${cfg.layout}`);

        this._cfg = cfg;

        // Persist layout so tab wiring survives SSR reattachment: the spec is
        // not available client-side, so activate() recovers it from the DOM.
        if (!this.dom.attrs['data-layout']) {
            this.dom.attrs['data-layout'] = cfg.layout;
        }

        if (initial_value) {
            const parsed = DateTime_Picker.parse_datetime(initial_value);
            this._date = parsed.date;
            this._time_str = parsed.time_str;
            if (!is_defined(cfg.month)) cfg.month = parsed.date.getMonth();
            if (!is_defined(cfg.year)) cfg.year = parsed.date.getFullYear();
        } else {
            const now = new Date();
            this._date = now;
            this._time_str = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
            if (!is_defined(cfg.month)) cfg.month = now.getMonth();
            if (!is_defined(cfg.year)) cfg.year = now.getFullYear();
        }

        if (!spec.el) {
            this.compose();
        }
    }

    get date() {
        return new Date(this._date);
    }

    get time() {
        return this._time_picker ? this._time_picker.value : this._time_str;
    }

    get hours() {
        return this._time_picker ? this._time_picker.hours : parseInt(this._time_str.split(':')[0], 10);
    }

    get minutes() {
        return this._time_picker ? this._time_picker.minutes : parseInt(this._time_str.split(':')[1], 10);
    }

    get value() {
        const d = this._date;
        const date_str = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        return `${date_str}T${this.time}`;
    }

    get datetime() {
        const d = new Date(this._date);
        d.setHours(this.hours, this.minutes, 0);
        return d;
    }

    set_date(year, month, day) {
        this._date = new Date(year, month, day);
        this._on_change();
    }

    set_time(hours, minutes) {
        if (this._time_picker) {
            this._time_picker.set_time(hours, minutes);
        }
        this._time_str = `${pad2(hours)}:${pad2(minutes)}`;
        this._on_change();
    }

    set_value(iso_str) {
        const parsed = DateTime_Picker.parse_datetime(iso_str);
        this._date = parsed.date;
        this._time_str = parsed.time_str;
        if (this._time_picker) {
            this._time_picker.set_value(parsed.time_str);
        }
        this._on_change();
    }

    compose() {
        const { context, _cfg: cfg } = this;
        const d = this._date;
        const date_str = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

        this._month_view = cfg.show_month_view ? new Month_View({
            context,
            month: cfg.month,
            year: cfg.year,
            min_date: cfg.min_date,
            max_date: cfg.max_date,
            selection_mode: 'single'
        }) : null;
        if (this._month_view) {
            this._month_view.dom.attributes['data-jsgui-ctrl'] = '_month_view';
        }

        this._time_picker = new Time_Picker({
            context,
            value: this._time_str,
            show_clock: cfg.show_clock,
            clock_size: cfg.clock_size,
            clock_style: cfg.clock_style,
            use_24h: cfg.use_24h,
            show_seconds: cfg.show_seconds,
            show_spinners: cfg.show_spinners,
            step_minutes: cfg.step_minutes
        });
        this._time_picker.dom.attributes['data-jsgui-ctrl'] = '_time_picker';

        this._header = new Control({ context, tag_name: 'div' });
        this._header.add_class('dtp-header');
        this._header.dom.attributes['data-jsgui-ctrl'] = '_header';

        this._date_display = new Control({ context, tag_name: 'span' });
        this._date_display.add_class('dtp-date-display');
        this._date_display.dom.attributes['data-jsgui-ctrl'] = '_date_display';
        this._date_display.add(date_str);
        this._header.add(this._date_display);

        this._time_display = new Control({ context, tag_name: 'span' });
        this._time_display.add_class('dtp-time-display');
        this._time_display.dom.attributes['data-jsgui-ctrl'] = '_time_display';
        this._time_display.add(this._time_str);
        this._header.add(this._time_display);

        this.add(this._header);

        if (cfg.layout === 'tabbed') {
            this._tabs = new Control({ context, tag_name: 'div' });
            this._tabs.add_class('dtp-tabs');
            this._tabs.dom.attributes.role = 'tablist';
            this._tabs.dom.attributes['aria-label'] = 'Date or time selection';

            this._tab_date = new Control({ context, tag_name: 'button' });
            this._tab_date.add_class('dtp-tab');
            this._tab_date.add_class('dtp-tab-active');
            this._tab_date.dom.attributes.type = 'button';
            this._tab_date.dom.attributes['data-jsgui-ctrl'] = '_tab_date';
            this._tab_date.dom.attributes.role = 'tab';
            this._tab_date.dom.attributes['aria-selected'] = 'true';
            this._tab_date.add('Date');
            this._tabs.add(this._tab_date);

            this._tab_time = new Control({ context, tag_name: 'button' });
            this._tab_time.add_class('dtp-tab');
            this._tab_time.dom.attributes.type = 'button';
            this._tab_time.dom.attributes['data-jsgui-ctrl'] = '_tab_time';
            this._tab_time.dom.attributes.role = 'tab';
            this._tab_time.dom.attributes['aria-selected'] = 'false';
            this._tab_time.add('Time');
            this._tabs.add(this._tab_time);

            this.add(this._tabs);
        }

        this._body = new Control({ context, tag_name: 'div' });
        this._body.add_class('dtp-body');
        this._body.dom.attributes['data-jsgui-ctrl'] = '_body';

        if (this._month_view) {
            this._body.add(this._month_view);
        }
        this._body.add(this._time_picker);

        this.add(this._body);
        this._wire_jsgui_ctrls();
    }

    _on_change() {
        if (this._date_display && this._date_display.dom.el) {
            const d = this._date;
            this._date_display.dom.el.textContent = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        }
        if (this._time_display && this._time_display.dom.el) {
            this._time_display.dom.el.textContent = this.time;
        }

        this.raise('change', {
            value: this.value,
            date: this._date,
            time: this.time,
            hours: this.hours,
            minutes: this.minutes
        });
    }

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        this._wire_jsgui_ctrls();

        // Recover layout persisted at compose time (spec does not survive
        // SSR reattachment — without this, tabbed wiring never runs client-side).
        const rootEl = this.dom && this.dom.el;
        if (rootEl && rootEl.getAttribute) {
            const dom_layout = rootEl.getAttribute('data-layout');
            if (dom_layout && dom_layout !== this._cfg.layout) {
                this._cfg.layout = dom_layout;
            }
        }

        if (this._month_view) {
            this._month_view.on('date-select', (e) => {
                if (e.iso) {
                    const [y, m, d] = e.iso.split('-').map(Number);
                    this._date = new Date(y, m - 1, d);
                    this._on_change();
                }
            });
        }

        if (this._time_picker) {
            this._time_picker.on('change', (e) => {
                this._time_str = e.value;
                this._on_change();
            });
        }

        if (this._cfg.layout === 'tabbed' && this._tab_date && this._tab_time) {
            const month_view_el = this._month_view ? this._month_view.dom.el : null;
            const time_picker_el = this._time_picker ? this._time_picker.dom.el : null;

            if (time_picker_el) {
                time_picker_el.style.display = 'none';
            }

            this._tab_date.dom.el.addEventListener('click', () => {
                if (month_view_el) month_view_el.style.display = '';
                if (time_picker_el) time_picker_el.style.display = 'none';
                this._tab_date.dom.el.classList.add('dtp-tab-active');
                this._tab_time.dom.el.classList.remove('dtp-tab-active');
                this._tab_date.dom.el.setAttribute('aria-selected', 'true');
                this._tab_time.dom.el.setAttribute('aria-selected', 'false');
            });

            this._tab_time.dom.el.addEventListener('click', () => {
                if (month_view_el) month_view_el.style.display = 'none';
                if (time_picker_el) time_picker_el.style.display = '';
                this._tab_time.dom.el.classList.add('dtp-tab-active');
                this._tab_date.dom.el.classList.remove('dtp-tab-active');
                this._tab_time.dom.el.setAttribute('aria-selected', 'true');
                this._tab_date.dom.el.setAttribute('aria-selected', 'false');
            });
        }
    }

    static parse_datetime(str) {
        if (!str || typeof str !== 'string') {
            const now = new Date();
            return {
                date: now,
                time_str: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
            };
        }
        str = str.trim();

        const iso_match = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (iso_match) {
            return {
                date: new Date(+iso_match[1], +iso_match[2] - 1, +iso_match[3]),
                time_str: iso_match[6]
                    ? `${pad2(+iso_match[4])}:${iso_match[5]}:${iso_match[6]}`
                    : `${pad2(+iso_match[4])}:${iso_match[5]}`
            };
        }

        const date_only_match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (date_only_match) {
            return {
                date: new Date(+date_only_match[1], +date_only_match[2] - 1, +date_only_match[3]),
                time_str: '12:00'
            };
        }

        const now = new Date();
        return {
            date: now,
            time_str: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
        };
    }
}

DateTime_Picker.css = `
.datetime-picker {
    display: inline-flex;
    flex-direction: column;
    gap: 0;
    background: #1e293b;
    border-radius: 12px;
    font-family: 'Inter', system-ui, sans-serif;
    color: #e2e8f0;
    overflow: hidden;
}

.dtp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: #0f172a;
    border-bottom: 1px solid #334155;
}
.dtp-date-display {
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
}
.dtp-time-display {
    font-size: 14px;
    font-weight: 600;
    color: #3b82f6;
    font-variant-numeric: tabular-nums;
}

.dtp-body {
    padding: 10px;
}

/* The picker panel is always dark: retheme the embedded Month_View via its
   CSS custom properties (day numbers were near-invisible dark-on-dark). */
.datetime-picker .month-view {
    --mv-bg: #1e293b;
    --mv-cell-bg: #1e293b;
    --mv-cell-disabled: #16202f;
    --mv-text: #e5e7eb;
    --mv-header-text: #94a3b8;
    --mv-accent: #60a5fa;
    --mv-accent-light: #1e3a8a;
    --mv-accent-mid: #2563eb;
    --mv-today-ring: #93c5fd;
    --mv-weekend-text: #64748b;
}
.datetime-picker .month-view .cell span {
    color: var(--mv-text);
}
.datetime-picker .month-view .row.header .cell {
    background-color: #0f172a !important;
}
.datetime-picker .month-view .row.header .cell span {
    color: var(--mv-header-text);
}
.datetime-picker .month-view .cell.weekend span {
    color: var(--mv-weekend-text);
}
.dtp-layout-stacked .dtp-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
}
.dtp-layout-side-by-side .dtp-body {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-items: flex-start;
}
.dtp-layout-tabbed .dtp-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
}

.dtp-tabs {
    display: flex;
    border-bottom: 1px solid #334155;
}
.dtp-tab {
    flex: 1;
    padding: 8px 16px;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
}
.dtp-tab:hover {
    color: #e2e8f0;
    background: rgba(59,130,246,0.05);
}
.dtp-tab.dtp-tab-active {
    color: #3b82f6;
    border-bottom: 2px solid #3b82f6;
}

.datetime-picker .time-picker {
    background: transparent;
    padding: 0;
}
.datetime-picker .month-view {
    border-radius: 0;
}
`;

module.exports = DateTime_Picker;
