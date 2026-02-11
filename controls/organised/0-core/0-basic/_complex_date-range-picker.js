const jsgui = require('../../../../html-core/html-core');
const { Control, Control_Data, Control_View, Data_Object } = jsgui;
const { field } = require('obext');
const Month_View = require('./1-compositional/month-view');
const { apply_full_input_api } = require('../../../../control_mixins/input_api');

// --- Icons ---
const ICON_CALENDAR = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
  <line x1="16" y1="2" x2="16" y2="6"></line>
  <line x1="8" y1="2" x2="8" y2="6"></line>
  <line x1="3" y1="10" x2="21" y2="10"></line>
</svg>`;

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

        // Internal state
        this._popup_open = false;

        this.compose_date_range_picker();
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
        this.add(inputs_row);

        // Start Input Group
        const start_grp = new Control({ context });
        start_grp.add_class('input-group start');
        inputs_row.add(start_grp);

        const start_icon = new Control({ context, tag_name: 'span' });
        start_icon.add_class('icon');
        // start_icon.html = ICON_CALENDAR; // .html assignment might be failing
        start_icon.add(ICON_CALENDAR); // SVG is just a string, add() handles it
        start_grp.add(start_icon);

        this.input_start = new Control({ context, tag_name: 'input' });
        this.input_start.dom.attrs = { type: 'text', placeholder: 'Start Date', readonly: 'readonly' }; // Readonly for now to force picker use
        start_grp.add(this.input_start);

        if (this.use_time) {
            this.input_start_time = new Control({ context, tag_name: 'input' });
            this.input_start_time.dom.attrs = { type: 'time', value: this.start_time };
            this.input_start_time.add_class('time-input');
            start_grp.add(this.input_start_time);
        }

        // Separator
        const sep = new Control({ context, tag_name: 'span' });
        sep.add_class('separator');
        sep.add('—');
        inputs_row.add(sep);

        // End Input Group
        const end_grp = new Control({ context });
        end_grp.add_class('input-group end');
        inputs_row.add(end_grp);

        const end_icon = new Control({ context, tag_name: 'span' });
        end_icon.add_class('icon');
        // end_icon.html = ICON_CALENDAR;
        end_icon.add(ICON_CALENDAR);
        end_grp.add(end_icon);

        this.input_end = new Control({ context, tag_name: 'input' });
        this.input_end.dom.attrs = { type: 'text', placeholder: 'End Date', readonly: 'readonly' };
        end_grp.add(this.input_end);

        if (this.use_time) {
            this.input_end_time = new Control({ context, tag_name: 'input' });
            this.input_end_time.dom.attrs = { type: 'time', value: this.end_time };
            this.input_end_time.add_class('time-input');
            end_grp.add(this.input_end_time);
        }

        // --- 2. Popup Container ---
        this.popup = new Control({ context });
        this.popup.add_class('picker-popup hidden');
        this.add(this.popup);

        // --- 3. Calendars ---
        const calendars_row = new Control({ context });
        calendars_row.add_class('calendars-row');
        this.popup.add(calendars_row);

        if (this.mode === 'single') {
            this.mv_start = new Month_View({
                context,
                selection_mode: 'range',
                size: [300, 240]
            });
            calendars_row.add(this.mv_start);
        } else {
            // Dual mode
            this.mv_start = new Month_View({
                context,
                selection_mode: 'range',
                size: [300, 240]
            });
            this.mv_start.add_class('left-view');
            calendars_row.add(this.mv_start);

            this.mv_end = new Month_View({
                context,
                selection_mode: 'range',
                size: [300, 240]
            });
            this.mv_end.add_class('right-view');

            // Set initial months
            let now = new Date();
            this.mv_start.month = now.getMonth();
            this.mv_start.year = now.getFullYear();

            // Next month for right view
            let next_m = now.getMonth() + 1;
            let next_y = now.getFullYear();
            if (next_m > 11) { next_m = 0; next_y++; }
            this.mv_end.month = next_m;
            this.mv_end.year = next_y;

            calendars_row.add(this.mv_end);
        }

        // --- Init State (sync initial values to calendar views) ---
        if (this.start_date || this.end_date) {
            if (this.mv_start) {
                this.mv_start.range_start = this.start_date;
                this.mv_start.range_end = this.end_date;
                this.mv_start.update_range_highlight();
            }
            if (this.mv_end) {
                this.mv_end.range_start = this.start_date;
                this.mv_end.range_end = this.end_date;
                this.mv_end.update_range_highlight();
            }
        }
    }

    activate() {
        if (this._active) return;
        super.activate();
        this._active = true;

        // --- Event Handlers ---

        const toggle_popup = (e) => {
            e.stopPropagation(); // prevent document listener from closing immediately
            if (this.popup.has_class('hidden')) {
                this.popup.remove_class('hidden');
                this.add_class('open');
                this._popup_open = true;
            } else {
                this.close_popup();
            }
        };

        this.close_popup = () => {
            if (!this.popup.has_class('hidden')) {
                this.popup.add_class('hidden');
                this.remove_class('open');
                this._popup_open = false;
            }
        };

        // Bind click to input groups
        // Note: we need to find the DOM elements if they were rendered server-side
        // But for now assuming client-side activation of components
        if (this.input_start.dom.el) {
            this.input_start.dom.el.addEventListener('click', toggle_popup);
        }
        if (this.input_end.dom.el) {
            this.input_end.dom.el.addEventListener('click', toggle_popup);
        }

        // Handle input group container clicks too for better UX
        // (requires finding them via DOM or having stored refs to groups)

        // --- Range Logic ---

        const update_inputs = (start, end) => {
            if (this.input_start.dom.el) this.input_start.dom.el.value = start || '';
            if (this.input_end.dom.el) this.input_end.dom.el.value = end || '';
        };

        const sync_dual_highlights = (source_mv) => {
            if (this.mode !== 'dual') return;
            const other = source_mv === this.mv_start ? this.mv_end : this.mv_start;

            // Sync range state
            other.range_start = this.start_date;
            other.range_end = this.end_date;
            other.update_range_highlight();
        };

        const handle_range_change = (e) => {
            console.log('handle_range_change fired:', e);
            const { start, end } = e;
            this.start_date = start;
            this.end_date = end;

            update_inputs(start, end);

            if (this.mode === 'dual') {
                sync_dual_highlights(e.target);
            }

            // Raise public event
            this.raise('change', { start, end });
        };

        // Attach listeners to Month_Views
        // (We need to capture them from the jsgui event system)

        const attach_mv_listeners = (mv) => {
            mv.on('range-change', handle_range_change);
            // Also listen for hover to sync preview
            mv.on('date-hover', (e) => {
                if (this.mode === 'dual') {
                    const other = mv === this.mv_start ? this.mv_end : this.mv_start;
                    // Manually trigger hover logic on other view? 
                    // Month_View might need public API for this, or we just set internal state
                    other._highlight_hover(e.date);
                }
            });
        };

        if (this.mv_start) attach_mv_listeners(this.mv_start);
        if (this.mv_end) attach_mv_listeners(this.mv_end);

        // --- Time Logic ---
        if (this.use_time) {
            const handle_time_change = () => {
                if (this.input_start_time.dom.el) this.start_time = this.input_start_time.dom.el.value;
                if (this.input_end_time.dom.el) this.end_time = this.input_end_time.dom.el.value;
                this.raise('time-change', { start: this.start_time, end: this.end_time });
            };

            if (this.input_start_time.dom.el) {
                this.input_start_time.dom.el.addEventListener('change', handle_time_change);
            }
            if (this.input_end_time.dom.el) {
                this.input_end_time.dom.el.addEventListener('change', handle_time_change);
            }
        }

        // --- Document Click (Close Popup) ---
        // Use a slight delay or check logic to avoid immediate close on toggle
        document.addEventListener('click', (e) => {
            if (this._popup_open && this.dom.el && !this.dom.el.contains(e.target)) {
                this.close_popup();
            }
        });

        // --- Init State (sync inputs on activation) ---
        if (this.start_date || this.end_date) {
            update_inputs(this.start_date, this.end_date);
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

/* Popup */
.date-range-picker .picker-popup {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    z-index: 1000;
    padding: 20px;
    animation: slideDown 0.15s ease-out;
}
@keyframes slideDown {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
.date-range-picker .picker-popup.hidden {
    display: none;
}
.date-range-picker .calendars-row {
    display: flex;
    gap: 24px;
}
/* Divider line in dual mode */
.date-range-picker .calendars-row:has(.right-view) {
    position: relative;
}
.date-range-picker .calendars-row:has(.right-view)::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 10px;
    bottom: 10px;
    width: 1px;
    background: #f1f5f9;
    transform: translateX(-50%);
}

.date-range-picker .month-view {
    border: none;
    background: transparent;
}
`;

module.exports = Date_Range_Picker;
