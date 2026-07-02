/**
 * Calendar — event-layer calendar built on Month_View.
 *
 * A Month_View with a caption bar, per-day event badges (colored dots), and
 * an event list for the selected day.
 *
 * @param {Object} spec
 * @param {Array}  [spec.events]            [{date: 'YYYY-MM-DD', label: string, color?: css-color}]
 * @param {number} [spec.month]             0-11 (defaults to current month)
 * @param {number} [spec.year]
 * @param {string} [spec.locale]            BCP 47 tag, forwarded to Month_View
 * @param {number} [spec.first_day_of_week] 0=Mon (default) … 6=Sun
 * @param {boolean}[spec.show_event_list=true]  Selected-day event panel
 *
 * Events raised: 'date-select' {iso, events}, 'events-change' {events}
 *
 * Isomorphic contract: events are persisted to a data-events JSON attribute
 * and recovered in activate(); child refs restored via data-jsgui-ctrl.
 */
const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const Month_View = require('./Month_View');

const MAX_DOTS = 3;
const DEFAULT_COLOR = '#2563eb';

class Calendar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'calendar';
        super(spec);
        this.add_class('jsgui-calendar');

        this._events = Array.isArray(spec.events) ? spec.events.slice() : [];
        this._show_event_list = spec.show_event_list !== false;
        this._locale = spec.locale || null;

        // Persist config for SSR reattachment. The payload is URI-encoded:
        // the renderer now HTML-escapes attribute values, but the encoding is
        // kept so this control also reattaches against HTML rendered by
        // pre-escaping builds (and it keeps the attribute compact/safe).
        const attrs = this.dom.attributes;
        if (this._events.length && !attrs['data-events']) {
            attrs['data-events'] = encodeURIComponent(JSON.stringify(this._events));
        }
        if (this._show_event_list === false && !attrs['data-show-event-list']) {
            attrs['data-show-event-list'] = 'false';
        }

        if (!spec.el) {
            this.compose_calendar(spec);
        }
    }

    get events() { return this._events.slice(); }

    // Events on a specific ISO date, sorted by label for stable rendering.
    events_on(iso) {
        return this._events.filter(e => e && e.date === iso);
    }

    compose_calendar(spec) {
        const { context } = this;

        // Caption bar: localized "Month Year".
        this._caption = new Control({ context, tag_name: 'div' });
        this._caption.add_class('cal-caption');
        this._caption.dom.attributes['data-jsgui-ctrl'] = '_caption';
        this.add(this._caption);

        this._month_view = new Month_View({
            context,
            selection_mode: 'single',
            month: spec.month,
            year: spec.year,
            locale: spec.locale,
            first_day_of_week: spec.first_day_of_week,
            min_date: spec.min_date,
            max_date: spec.max_date
        });
        this._month_view.dom.attributes['data-jsgui-ctrl'] = '_month_view';
        this.add(this._month_view);

        this._caption.add(`${this._month_view.month_name()} ${this._month_view.year}`);

        if (this._show_event_list) {
            this._event_list = new Control({ context, tag_name: 'div' });
            this._event_list.add_class('cal-event-list');
            this._event_list.dom.attributes['data-jsgui-ctrl'] = '_event_list';
            this._event_list.dom.attributes['aria-live'] = 'polite';
            const hint = new Control({ context, tag_name: 'span' });
            hint.add_class('cal-event-hint');
            hint.add('Select a day to see its events');
            this._event_list.add(hint);
            this.add(this._event_list);
        }

        this._compose_badges();
    }

    // Server-side badge composition: adds dot rows to Month_View's VDOM cells.
    _compose_badges() {
        const mv = this._month_view;
        if (!mv || !mv._date_cell_map) return;
        const { context } = this;

        const by_date = {};
        this._events.forEach(e => {
            if (!e || !e.date) return;
            (by_date[e.date] = by_date[e.date] || []).push(e);
        });

        Object.keys(by_date).forEach(iso => {
            const cell = mv._date_cell_map.get(iso);
            if (!cell) return; // event outside the displayed month
            cell.add_class('has-events');
            const dots = new Control({ context, tag_name: 'span' });
            dots.add_class('mv-event-dots');
            dots.dom.attributes['aria-label'] = `${by_date[iso].length} event${by_date[iso].length === 1 ? '' : 's'}`;
            by_date[iso].slice(0, MAX_DOTS).forEach(e => {
                const dot = new Control({ context, tag_name: 'span' });
                dot.add_class('mv-event-dot');
                dot.dom.attributes.style = `background-color:${e.color || DEFAULT_COLOR}`;
                dots.add(dot);
            });
            if (by_date[iso].length > MAX_DOTS) {
                const more = new Control({ context, tag_name: 'span' });
                more.add_class('mv-event-more');
                more.add(`+${by_date[iso].length - MAX_DOTS}`);
                dots.add(more);
            }
            cell.add(dots);
        });
    }

    // Client-side badge (re)render: direct DOM, used after event mutations.
    _render_badges_dom() {
        const mv = this._month_view;
        const root = mv && mv.dom && mv.dom.el;
        if (!root || typeof document === 'undefined') return;

        root.querySelectorAll('.mv-event-dots').forEach(el => el.remove());
        root.querySelectorAll('.cell.has-events').forEach(el => el.classList.remove('has-events'));

        const by_date = {};
        this._events.forEach(e => {
            if (!e || !e.date) return;
            (by_date[e.date] = by_date[e.date] || []).push(e);
        });

        Object.keys(by_date).forEach(iso => {
            const cell_el = mv._kb_el_for_iso ? mv._kb_el_for_iso(iso) : null;
            if (!cell_el) return;
            cell_el.classList.add('has-events');
            const dots = document.createElement('span');
            dots.className = 'mv-event-dots';
            dots.setAttribute('aria-label', `${by_date[iso].length} event${by_date[iso].length === 1 ? '' : 's'}`);
            by_date[iso].slice(0, MAX_DOTS).forEach(e => {
                const dot = document.createElement('span');
                dot.className = 'mv-event-dot';
                dot.style.backgroundColor = e.color || DEFAULT_COLOR;
                dots.appendChild(dot);
            });
            if (by_date[iso].length > MAX_DOTS) {
                const more = document.createElement('span');
                more.className = 'mv-event-more';
                more.textContent = `+${by_date[iso].length - MAX_DOTS}`;
                dots.appendChild(more);
            }
            cell_el.appendChild(dots);
        });
    }

    _render_event_list(iso) {
        const el = this._event_list && this._event_list.dom && this._event_list.dom.el;
        if (!el) return;
        const events = iso ? this.events_on(iso) : [];
        el.innerHTML = '';
        if (!iso) {
            const hint = document.createElement('span');
            hint.className = 'cal-event-hint';
            hint.textContent = 'Select a day to see its events';
            el.appendChild(hint);
            return;
        }
        const heading = document.createElement('div');
        heading.className = 'cal-event-date';
        heading.textContent = iso;
        el.appendChild(heading);
        if (!events.length) {
            const none = document.createElement('span');
            none.className = 'cal-event-hint';
            none.textContent = 'No events';
            el.appendChild(none);
            return;
        }
        events.forEach(e => {
            const row = document.createElement('div');
            row.className = 'cal-event-row';
            const dot = document.createElement('span');
            dot.className = 'mv-event-dot';
            dot.style.backgroundColor = e.color || DEFAULT_COLOR;
            row.appendChild(dot);
            const label = document.createElement('span');
            label.textContent = e.label || '(untitled event)';
            row.appendChild(label);
            el.appendChild(row);
        });
    }

    // ---- Event mutation API ----

    set_events(events) {
        this._events = Array.isArray(events) ? events.slice() : [];
        this._sync_events_attr();
        this._render_badges_dom();
        if (this._selected_iso) this._render_event_list(this._selected_iso);
        this.raise('events-change', { events: this.events });
    }

    add_event(event) {
        if (!event || !event.date) return;
        this._events.push(event);
        this._sync_events_attr();
        this._render_badges_dom();
        if (this._selected_iso === event.date) this._render_event_list(event.date);
        this.raise('events-change', { events: this.events });
    }

    remove_event(date, label) {
        this._events = this._events.filter(e => !(e.date === date && (label === undefined || e.label === label)));
        this._sync_events_attr();
        this._render_badges_dom();
        if (this._selected_iso === date) this._render_event_list(date);
        this.raise('events-change', { events: this.events });
    }

    _sync_events_attr() {
        const encoded = encodeURIComponent(JSON.stringify(this._events));
        this.dom.attributes['data-events'] = encoded;
        const el = this.dom && this.dom.el;
        if (el && el.setAttribute) el.setAttribute('data-events', encoded);
    }

    // ---- Activation ----

    activate() {
        if (!this.__active) {
            super.activate();

            this._wire_jsgui_ctrls();

            // Recover persisted config (SSR reattachment).
            const el = this.dom && this.dom.el;
            if (el && el.getAttribute) {
                const events_attr = el.getAttribute('data-events');
                if (events_attr && !this._events.length) {
                    try {
                        this._events = JSON.parse(decodeURIComponent(events_attr)) || [];
                    } catch (e) { /* keep [] */ }
                }
                if (el.getAttribute('data-show-event-list') === 'false') {
                    this._show_event_list = false;
                }
            }

            // Day selection → event list.
            if (this._month_view && this._month_view.on) {
                this._month_view.on('date-select', (e) => {
                    if (e && e.iso) {
                        this._selected_iso = e.iso;
                        this._render_event_list(e.iso);
                        this.raise('date-select', { iso: e.iso, events: this.events_on(e.iso) });
                    }
                });
            }
        }
    }
}

Calendar.css = `
.jsgui-calendar {
    display: inline-block;
    font-family: 'Inter', system-ui, sans-serif;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
}
.jsgui-calendar .cal-caption {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    padding: 2px 2px 8px;
}
.jsgui-calendar .month-view .cell {
    position: relative;
}
.jsgui-calendar .mv-event-dots {
    position: absolute;
    left: 2px;
    right: 2px;
    bottom: 1px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
    pointer-events: none;
    overflow: hidden;
    max-height: 7px;
}
/* Lift the day number slightly so the dot strip has clear space. */
.jsgui-calendar .month-view .row:not(.header) .cell > span {
    position: relative;
    top: -3px;
}
.jsgui-calendar .mv-event-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    display: inline-block;
}
.jsgui-calendar .mv-event-more {
    font-size: 8px;
    color: #64748b;
    line-height: 1;
}
.jsgui-calendar .cal-event-list {
    margin-top: 10px;
    border-top: 1px solid #f1f5f9;
    padding-top: 8px;
    min-height: 40px;
    font-size: 13px;
}
.jsgui-calendar .cal-event-hint {
    color: #94a3b8;
}
.jsgui-calendar .cal-event-date {
    font-weight: 600;
    color: #334155;
    margin-bottom: 4px;
}
.jsgui-calendar .cal-event-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #475569;
    padding: 2px 0;
}
.jsgui-calendar .cal-event-row .mv-event-dot {
    width: 8px;
    height: 8px;
    flex: 0 0 auto;
}
`;

module.exports = Calendar;
