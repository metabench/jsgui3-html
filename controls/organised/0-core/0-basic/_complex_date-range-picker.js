const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const Month_View = require('./1-compositional/Month_View');
const Popup = require('../1-advanced/Popup');

// Build the calendar icon from jsgui svg controls (raw SVG strings passed to
// .add() are text-escaped by design, so the icon must be composed).
const make_calendar_icon = (context) => {
    const svg = new jsgui.controls.svg({ context });
    const a = svg.dom.attributes;
    a.width = '16'; a.height = '16'; a.viewBox = '0 0 24 24';
    a.fill = 'none'; a.stroke = 'currentColor';
    a['stroke-width'] = '2'; a['stroke-linecap'] = 'round'; a['stroke-linejoin'] = 'round';

    const body = new jsgui.controls.rect({ context });
    Object.assign(body.dom.attributes, { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' });
    svg.add(body);

    [['16', '2', '16', '6'], ['8', '2', '8', '6'], ['3', '10', '21', '10']].forEach(([x1, y1, x2, y2]) => {
        const line = new jsgui.controls.line({ context });
        Object.assign(line.dom.attributes, { x1, y1, x2, y2 });
        svg.add(line);
    });
    return svg;
};

const parse_iso_month = (iso) => {
    if (!iso) return null;
    const [y, m] = iso.split('-').map(Number);
    if (!y || !m) return null;
    return { year: y, month: m - 1 };
};

/**
 * Date_Range_Picker — start/end date selection with a calendar popup.
 *
 * @param {Object}  spec
 * @param {string}  [spec.mode='single']   'single' (one calendar) | 'dual' (two, start month + next)
 * @param {string}  [spec.start]           Initial start date (ISO YYYY-MM-DD)
 * @param {string}  [spec.end]             Initial end date (ISO YYYY-MM-DD)
 * @param {boolean} [spec.use_time=false]  Show HH:MM time inputs next to the dates
 * @param {string}  [spec.start_time='00:00']
 * @param {string}  [spec.end_time='23:59']
 *
 * Events: 'change' {start, end}, 'time-change' {start, end}
 *
 * Isomorphic contract: children are tagged with data-jsgui-ctrl (refs restored
 * by _wire_jsgui_ctrls) and behavior-affecting config is persisted to data-*
 * attributes and recovered in activate().
 */
class Date_Range_Picker extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'date_range_picker';
        const start = spec.start || spec.initial_start;
        const end = spec.end || spec.initial_end;
        super(spec);
        this.add_class('date-range-picker');

        // Config
        this.mode = spec.mode || 'single'; // 'single' | 'dual'
        this.use_time = !!spec.use_time;
        this.format = spec.format || 'YYYY-MM-DD';
        this.sync_views = spec.sync_views !== false; // true by default

        // State (start/end ISO strings)
        this.start_date = start || null;
        this.end_date = end || null;

        // Time state (HH:MM string)
        this.start_time = spec.start_time || '00:00';
        this.end_time = spec.end_time || '23:59';

        // Persist config for SSR reattachment (V7).
        const attrs = this.dom.attributes;
        if (!attrs['data-mode']) attrs['data-mode'] = this.mode;
        if (this.use_time && !attrs['data-use-time']) attrs['data-use-time'] = 'true';
        if (this.start_date && !attrs['data-start']) attrs['data-start'] = this.start_date;
        if (this.end_date && !attrs['data-end']) attrs['data-end'] = this.end_date;

        if (!spec.el) {
            this.compose_date_range_picker();
        }
    }

    get start_date() { return this._start_date; }
    set start_date(v) { this._start_date = v; }
    get end_date() { return this._end_date; }
    set end_date(v) { this._end_date = v; }

    compose_date_range_picker() {
        const { context } = this;

        // --- 1. Inputs Row ---
        const inputs_row = new Control({ context });
        inputs_row.add_class('inputs-row');
        inputs_row.dom.attributes['data-jsgui-ctrl'] = 'inputs_row';
        this.add(inputs_row);
        this.inputs_row = inputs_row;

        const make_input_group = (which, placeholder, date_value, time_value) => {
            const grp = new Control({ context });
            grp.add_class('input-group');
            grp.add_class(which);
            inputs_row.add(grp);

            const icon = new Control({ context, tag_name: 'span' });
            icon.add_class('icon');
            icon.add(make_calendar_icon(context));
            grp.add(icon);

            const input = new Control({ context, tag_name: 'input' });
            const ia = input.dom.attributes;
            ia.type = 'text';
            ia.placeholder = placeholder;
            ia.readonly = 'readonly';
            ia['aria-label'] = placeholder;
            ia['aria-haspopup'] = 'dialog';
            if (date_value) ia.value = date_value; // SSR shows the value (V2)
            ia['data-jsgui-ctrl'] = `input_${which}`;
            grp.add(input);
            this[`input_${which}`] = input;

            if (this.use_time) {
                const time_input = new Control({ context, tag_name: 'input' });
                const ta = time_input.dom.attributes;
                ta.type = 'time';
                ta.value = time_value;
                ta['data-jsgui-ctrl'] = `input_${which}_time`;
                time_input.add_class('time-input');
                grp.add(time_input);
                this[`input_${which}_time`] = time_input;
            }
            return grp;
        };

        make_input_group('start', 'Start Date', this.start_date, this.start_time);

        const sep = new Control({ context, tag_name: 'span' });
        sep.add_class('separator');
        sep.add('—');
        inputs_row.add(sep);

        make_input_group('end', 'End Date', this.end_date, this.end_time);

        // --- 2. Popup (reusable primitive) ---
        this.popup = new Popup({ context, position: 'bottom', offset: { x: 0, y: 8 } });
        this.popup.add_class('picker-popup');
        this.popup.dom.attributes['data-jsgui-ctrl'] = 'popup';
        this.add(this.popup);

        // --- 3. Calendars ---
        const calendars_row = new Control({ context });
        calendars_row.add_class('calendars-row');
        this.popup.add(calendars_row);

        // Initial months come from the configured range, not "now" (V3).
        const start_m = parse_iso_month(this.start_date) || (() => {
            const now = new Date();
            return { year: now.getFullYear(), month: now.getMonth() };
        })();

        const mv_spec = (extra) => Object.assign({
            context, selection_mode: 'range', size: [300, 240]
        }, extra);

        this.mv_start = new Month_View(mv_spec({ month: start_m.month, year: start_m.year }));
        this.mv_start.dom.attributes['data-jsgui-ctrl'] = 'mv_start';
        if (this.mode === 'dual') this.mv_start.add_class('left-view');
        calendars_row.add(this.mv_start);

        if (this.mode === 'dual') {
            // Right view: the end date's month if it differs, else start month + 1.
            const end_m = parse_iso_month(this.end_date);
            let right = { year: start_m.year, month: start_m.month + 1 };
            if (right.month > 11) { right.month = 0; right.year++; }
            if (end_m && (end_m.year !== start_m.year || end_m.month !== start_m.month)) {
                right = end_m;
            }
            this.mv_end = new Month_View(mv_spec({ month: right.month, year: right.year }));
            this.mv_end.dom.attributes['data-jsgui-ctrl'] = 'mv_end';
            this.mv_end.add_class('right-view');
            calendars_row.add(this.mv_end);
        }

        // --- Init State (sync initial values to calendar views) ---
        if (this.start_date || this.end_date) {
            [this.mv_start, this.mv_end].forEach(mv => {
                if (!mv) return;
                mv.range_start = this.start_date;
                mv.range_end = this.end_date;
                mv.update_range_highlight();
            });
        }
    }

    // Recover configuration persisted at compose time (SSR reattachment, V7).
    _recover_config_from_dom() {
        const el = this.dom && this.dom.el;
        if (!el || !el.getAttribute) return;
        const mode = el.getAttribute('data-mode');
        if (mode) this.mode = mode;
        if (el.getAttribute('data-use-time') === 'true') this.use_time = true;
        const start = el.getAttribute('data-start');
        const end = el.getAttribute('data-end');
        if (start && !this.start_date) this.start_date = start;
        if (end && !this.end_date) this.end_date = end;
    }

    activate() {
        if (!this.__active) {
            super.activate();

            this._recover_config_from_dom();
            this._wire_jsgui_ctrls();

            const input_el = (ref) => ref && ref.dom && ref.dom.el;

            // --- Inputs open/close the popup ---
            const toggle = (e) => {
                e.stopPropagation();
                if (this.popup && this.popup.toggle) {
                    const anchor = input_el(this.inputs_row) || (this.dom && this.dom.el);
                    this.popup.toggle(anchor);
                    if (this.popup.is_open) this.add_class('open');
                    else this.remove_class('open');
                }
            };
            if (this.popup && this.popup.on) {
                this.popup.on('close', () => this.remove_class('open'));
            }
            [this.input_start, this.input_end].forEach(inp => {
                const el = input_el(inp);
                if (el) el.addEventListener('click', toggle);
            });

            // --- Range logic ---
            const update_inputs = (start, end) => {
                const se = input_el(this.input_start), ee = input_el(this.input_end);
                if (se) { se.value = start || ''; se.setAttribute('value', start || ''); }
                if (ee) { ee.value = end || ''; ee.setAttribute('value', end || ''); }
                // Keep persisted config current so re-hydration sees the latest range.
                const root = this.dom && this.dom.el;
                if (root) {
                    if (start) root.setAttribute('data-start', start);
                    if (end) root.setAttribute('data-end', end);
                }
            };

            const sync_dual_highlights = (source_mv) => {
                if (this.mode !== 'dual') return;
                const other = source_mv === this.mv_start ? this.mv_end : this.mv_start;
                if (!other) return;
                other.range_start = this.start_date;
                other.range_end = this.end_date;
                other.update_range_highlight();
            };

            const handle_range_change = (e) => {
                const { start, end } = e;
                this.start_date = start;
                this.end_date = end;
                update_inputs(start, end);
                if (this.mode === 'dual') sync_dual_highlights(e.target);
                this.raise('change', { start, end });
            };

            const attach_mv_listeners = (mv) => {
                if (!mv || !mv.on) return;
                mv.on('range-change', handle_range_change);
                mv.on('date-hover', (e) => {
                    if (this.mode === 'dual') {
                        const other = mv === this.mv_start ? this.mv_end : this.mv_start;
                        if (other && other._highlight_hover) other._highlight_hover(e.date);
                    }
                });
            };
            attach_mv_listeners(this.mv_start);
            attach_mv_listeners(this.mv_end);

            // --- Time logic ---
            if (this.use_time) {
                const handle_time_change = () => {
                    const se = input_el(this.input_start_time), ee = input_el(this.input_end_time);
                    if (se) this.start_time = se.value;
                    if (ee) this.end_time = ee.value;
                    this.raise('time-change', { start: this.start_time, end: this.end_time });
                };
                [this.input_start_time, this.input_end_time].forEach(inp => {
                    const el = input_el(inp);
                    if (el) el.addEventListener('change', handle_time_change);
                });
            }

            // --- Init: reflect state into the inputs and calendars ---
            if (this.start_date || this.end_date) {
                update_inputs(this.start_date, this.end_date);
                // Re-push the configured range into the calendar views: their
                // internal state does not survive SSR reattachment.
                [this.mv_start, this.mv_end].forEach(mv => {
                    if (!mv || !mv.update_range_highlight) return;
                    mv.range_start = this.start_date;
                    mv.range_end = this.end_date;
                    mv.update_range_highlight();
                });
            }
        }
    }
}

Date_Range_Picker.css = `
.date-range-picker {
    position: relative;
    font-family: 'Inter', system-ui, sans-serif;
    display: inline-block;
    user-select: none;
}
.date-range-picker .inputs-row {
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px 10px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    transition: all 0.2s;
    cursor: pointer;
}
.date-range-picker:not(.open) .inputs-row:hover {
    border-color: #94a3b8;
}
.date-range-picker.open .inputs-row {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.date-range-picker .input-group {
    display: flex;
    align-items: center;
    gap: 8px;
}
.date-range-picker input {
    border: none;
    outline: none;
    font-size: 14px;
    color: #334155;
    width: 90px;
    background: transparent;
    cursor: pointer;
    font-weight: 500;
}
.date-range-picker input::placeholder { color: #94a3b8; font-weight: 400; }
.date-range-picker input.time-input {
    width: auto;
    color: #475569;
    font-size: 13px;
    background: #f1f5f9;
    border-radius: 4px;
    padding: 2px 6px;
    border: 1px solid transparent;
}
.date-range-picker input.time-input:focus {
    background: #fff;
    border-color: #cbd5e1;
}
.date-range-picker .icon {
    display: flex;
    align-items: center;
}
.date-range-picker .icon svg {
    stroke: #64748b;
    width: 16px;
    height: 16px;
}
.date-range-picker .separator {
    color: #cbd5e1;
    margin: 0 12px;
    font-weight: 300;
}

/* Popup content (positioning is handled by the Popup primitive) */
.picker-popup.jsgui-popup {
    padding: 20px;
}
.picker-popup:not(.hidden) {
    animation: drpSlideDown 0.15s ease-out;
}
@keyframes drpSlideDown {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
.picker-popup .calendars-row {
    display: flex;
    gap: 24px;
}
/* Divider line in dual mode */
.picker-popup .calendars-row:has(.right-view) {
    position: relative;
}
.picker-popup .calendars-row:has(.right-view)::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 10px;
    bottom: 10px;
    width: 1px;
    background: #f1f5f9;
    transform: translateX(-50%);
}
.picker-popup .month-view {
    border: none;
    background: transparent;
}
`;

module.exports = Date_Range_Picker;
