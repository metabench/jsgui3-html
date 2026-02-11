const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;
const Month_View = require('./month-view');
const Time_Picker = require('./time-picker');

const pad2 = n => String(n).padStart(2, '0');

/**
 * DateTime_Picker — Composite control combining Month_View + Time_Picker.
 *
 * Provides full date+time selection in one control. Forwards date config
 * to Month_View and time config to Time_Picker.
 *
 * @param {Object}  spec
 * @param {string}  [spec.value]              ISO datetime 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DDTHH:MM:SS'
 * @param {string}  [spec.layout='stacked']   'stacked' | 'side-by-side' | 'tabbed'
 * @param {boolean} [spec.show_month_view=true]
 * @param {boolean} [spec.show_clock=true]
 * @param {boolean} [spec.use_24h=true]
 * @param {boolean} [spec.show_seconds=false]
 * @param {number}  [spec.clock_size]
 * @param {string}  [spec.clock_style]
 * @param {boolean} [spec.show_spinners=false]
 * @param {number}  [spec.step_minutes]
 * @param {number}  [spec.month]              0-based month for Month_View
 * @param {number}  [spec.year]               Year for Month_View
 * @param {string}  [spec.min_date]           YYYY-MM-DD min date
 * @param {string}  [spec.max_date]           YYYY-MM-DD max date
 */
class DateTime_Picker extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'datetime_picker';

        // Capture before super()
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
            max_date: spec.max_date || null,
        };

        super(spec);
        this.add_class('datetime-picker');
        this.add_class(`dtp-layout-${cfg.layout}`);

        this._cfg = cfg;

        // Parse initial value
        if (initial_value) {
            const parsed = DateTime_Picker.parse_datetime(initial_value);
            this._date = parsed.date;
            this._time_str = parsed.time_str;
            // Set month/year from date if not explicitly provided
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
            this._compose();
        }
    }

    // ── Public API ──

    get date() { return new Date(this._date); }

    get time() {
        return this._time_picker ? this._time_picker.value : this._time_str;
    }

    get hours() { return this._time_picker ? this._time_picker.hours : parseInt(this._time_str.split(':')[0], 10); }
    get minutes() { return this._time_picker ? this._time_picker.minutes : parseInt(this._time_str.split(':')[1], 10); }

    get value() {
        const d = this._date;
        const date_str = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        const time_str = this.time;
        return `${date_str}T${time_str}`;
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
        if (this._month_view) {
            // Refresh month view to new month if needed
            // Month_View doesn't have a set_date method — we'd need to rebuild or call refresh
        }
        this._on_change();
    }

    // ── Composition ──

    _compose() {
        const { context } = this;
        const cfg = this._cfg;

        // ── Header with current selection ──
        this._header = new Control({ context, tag_name: 'div' });
        this._header.add_class('dtp-header');

        this._date_display = new Control({ context, tag_name: 'span' });
        this._date_display.add_class('dtp-date-display');
        const d = this._date;
        this._date_display.add(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
        this._header.add(this._date_display);

        this._time_display = new Control({ context, tag_name: 'span' });
        this._time_display.add_class('dtp-time-display');
        this._time_display.add(this._time_str);
        this._header.add(this._time_display);

        this.add(this._header);

        // ── Body ──
        this._body = new Control({ context, tag_name: 'div' });
        this._body.add_class('dtp-body');

        // ── Month View ──
        if (cfg.show_month_view) {
            this._month_view = new Month_View({
                context,
                month: cfg.month,
                year: cfg.year,
                min_date: cfg.min_date,
                max_date: cfg.max_date,
                selection_mode: 'single',
            });
            this._body.add(this._month_view);
        }

        // ── Time Picker ──
        this._time_picker = new Time_Picker({
            context,
            value: this._time_str,
            show_clock: cfg.show_clock,
            clock_size: cfg.clock_size,
            clock_style: cfg.clock_style,
            use_24h: cfg.use_24h,
            show_seconds: cfg.show_seconds,
            show_spinners: cfg.show_spinners,
            step_minutes: cfg.step_minutes,
        });
        this._body.add(this._time_picker);

        this.add(this._body);

        // ── Tabbed layout toggles ──
        if (cfg.layout === 'tabbed') {
            this._tabs = new Control({ context, tag_name: 'div' });
            this._tabs.add_class('dtp-tabs');

            this._tab_date = new Control({ context, tag_name: 'button' });
            this._tab_date.add_class('dtp-tab');
            this._tab_date.add_class('dtp-tab-active');
            this._tab_date.dom.attributes.type = 'button';
            this._tab_date.add('📅 Date');
            this._tabs.add(this._tab_date);

            this._tab_time = new Control({ context, tag_name: 'button' });
            this._tab_time.add_class('dtp-tab');
            this._tab_time.dom.attributes.type = 'button';
            this._tab_time.add('🕐 Time');
            this._tabs.add(this._tab_time);

            // Insert tabs before body
            // (DOM ordering: header, tabs, body)
            this.add(this._tabs);
        }
    }

    // ── Change handler ──

    _on_change() {
        // Update header displays
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
            minutes: this.minutes,
        });
    }

    // ── Reconnect DOM refs for hydration (when _compose was skipped) ──
    _reconnect_from_dom() {
        const el = this.dom.el;
        if (!el) return;

        const q = (cls) => {
            const found = el.querySelector('.' + cls);
            return found ? { dom: { el: found } } : null;
        };

        // Header displays
        if (!this._date_display) this._date_display = q('dtp-date-display');
        if (!this._time_display) this._time_display = q('dtp-time-display');

        // Tab buttons
        if (!this._tab_date) this._tab_date = q('dtp-tab');
        if (!this._tab_time) {
            const tabs = el.querySelectorAll('.dtp-tab');
            if (tabs.length > 1) this._tab_time = { dom: { el: tabs[1] } };
        }

        // Read date from header display
        if (this._date_display && this._date_display.dom.el) {
            const text = this._date_display.dom.el.textContent.trim();
            const m = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) {
                this._date = new Date(+m[1], +m[2] - 1, +m[3]);
            }
        }

        // Read time from header display
        if (this._time_display && this._time_display.dom.el) {
            this._time_str = this._time_display.dom.el.textContent.trim();
        }
    }

    // ── Activation ──

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        // Reconnect DOM references if hydrating
        this._reconnect_from_dom();

        // Wire month view date selection to update our date
        if (this._month_view) {
            this._month_view.on('date-select', (e) => {
                if (e.iso) {
                    const [y, m, d] = e.iso.split('-').map(Number);
                    this._date = new Date(y, m - 1, d);
                    this._on_change();
                }
            });
        }

        // Wire time picker changes
        if (this._time_picker) {
            this._time_picker.on('change', (e) => {
                this._time_str = e.value;
                this._on_change();
            });
        }

        // Tabbed layout toggling
        if (this._cfg.layout === 'tabbed' && this._tab_date && this._tab_time) {
            const mv_el = this._month_view ? this._month_view.dom.el : null;
            const tp_el = this._time_picker ? this._time_picker.dom.el : null;

            // Initially show date, hide time
            if (tp_el) tp_el.style.display = 'none';

            this._tab_date.dom.el.addEventListener('click', () => {
                if (mv_el) mv_el.style.display = '';
                if (tp_el) tp_el.style.display = 'none';
                this._tab_date.dom.el.classList.add('dtp-tab-active');
                this._tab_time.dom.el.classList.remove('dtp-tab-active');
            });

            this._tab_time.dom.el.addEventListener('click', () => {
                if (mv_el) mv_el.style.display = 'none';
                if (tp_el) tp_el.style.display = '';
                this._tab_time.dom.el.classList.add('dtp-tab-active');
                this._tab_date.dom.el.classList.remove('dtp-tab-active');
            });
        }
    }

    // ── Static helpers ──

    static parse_datetime(str) {
        if (!str || typeof str !== 'string') {
            const now = new Date();
            return {
                date: now,
                time_str: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
            };
        }
        str = str.trim();

        // ISO format: YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS
        const m = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (m) {
            return {
                date: new Date(+m[1], +m[2] - 1, +m[3]),
                time_str: m[6] ? `${pad2(+m[4])}:${m[5]}:${m[6]}` : `${pad2(+m[4])}:${m[5]}`,
            };
        }

        // Date only: YYYY-MM-DD
        const d = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (d) {
            return {
                date: new Date(+d[1], +d[2] - 1, +d[3]),
                time_str: '12:00',
            };
        }

        const now = new Date();
        return {
            date: now,
            time_str: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
        };
    }
}

// ── Static CSS ──
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

/* Header */
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

/* Body */
.dtp-body {
    padding: 10px;
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

/* Tabs */
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
.dtp-tab:hover { color: #e2e8f0; background: rgba(59,130,246,0.05); }
.dtp-tab.dtp-tab-active {
    color: #3b82f6;
    border-bottom: 2px solid #3b82f6;
}

/* Override child backgrounds to blend */
.datetime-picker .time-picker {
    background: transparent;
    padding: 0;
}
.datetime-picker .month-view {
    border-radius: 0;
}
`;

module.exports = DateTime_Picker;
