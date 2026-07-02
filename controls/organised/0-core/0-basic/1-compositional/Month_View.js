const jsgui = require('../../../../../html-core/html-core');
const clone = jsgui.clone;
const each = jsgui.each, is_defined = jsgui.is_defined;
const Grid = require('./Grid');
const Tile_Slider = require('../../../1-standard/6-layout/Tile_Slide');
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Disabled/filler cells use the theme variable (defaults to light gray in
// Month_View.css) so dark-panel hosts like DateTime_Picker can restyle them.
let bgc_disabled = 'var(--mv-cell-disabled)';
let bgc_enabled = 'inherit';
const mx_date = require(`../../../../../control_mixins/typed_data/date`);
const { prop } = require('obext');

// ---- date helpers ----
const pad2 = n => String(n).padStart(2, '0');
const to_iso = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const from_iso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const date_le = (a, b) => a <= b;
const TODAY_ISO = to_iso(new Date());

// ISO 8601 week number
const iso_week_number = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Localized short weekday names, Monday-first (2024-01-01 is a Monday).
// Returns null when Intl is unavailable or the locale is invalid — callers
// fall back to the English ALL_DAYS constants.
const get_locale_day_names = (locale) => {
    try {
        if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) return null;
        const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
        const names = [];
        for (let i = 0; i < 7; i++) {
            names.push(fmt.format(new Date(2024, 0, 1 + i)));
        }
        return names;
    } catch (e) {
        return null;
    }
};

// Localized month names (long form), January-first. Same fallback contract.
const get_locale_month_names = (locale) => {
    try {
        if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) return null;
        const fmt = new Intl.DateTimeFormat(locale, { month: 'long' });
        const names = [];
        for (let i = 0; i < 12; i++) {
            names.push(fmt.format(new Date(2024, i, 1)));
        }
        return names;
    } catch (e) {
        return null;
    }
};

class Month_View extends Grid {
    constructor(spec) {
        // Week numbers add an extra column
        const show_week_nums = !!spec.show_week_numbers;
        spec.grid_size = [show_week_nums ? 8 : 7, 7];
        spec.size = spec.size || [show_week_nums ? 400 : 360, 200];
        spec.__type_name = 'month_view';
        super(spec); mx_date(this, spec);

        // Selection mode: 'single' | 'range' | 'multi' | 'week'
        prop(this, 'selection_mode', spec.selection_mode || 'single');
        // Persist to DOM attribute so it survives SSR hydration
        // Only set if not already set (avoid overwriting if spec provided it directly to attrs)
        if (!this.dom.attrs['data-selection-mode']) {
            this.dom.attrs['data-selection-mode'] = this.selection_mode;
        }
        // Focusable root so arrow-key navigation works (see activate()).
        if (this.dom.attrs.tabindex === undefined) {
            this.dom.attrs.tabindex = '0';
        }

        // Persist the displayed month/year: mx_date defaults them to "now",
        // so a reattached instance would otherwise map cells to the wrong
        // month whenever the rendered month is not the current one.
        if (this.dom.attrs['data-month'] === undefined) {
            this.dom.attrs['data-month'] = String(this.month);
        }
        if (this.dom.attrs['data-year'] === undefined) {
            this.dom.attrs['data-year'] = String(this.year);
        }

        // Keyboard focus state (ISO string of the cell the keyboard "cursor" is on)
        this._focused_iso = null;

        // Phase 1 config
        this._first_day = spec.first_day_of_week || 0; // 0=Mon (default), 6=Sun
        this._show_week_numbers = show_week_nums;
        this._min_date = spec.min_date || null; // ISO string
        this._max_date = spec.max_date || null; // ISO string

        // Localization (BCP 47 tag, e.g. 'fr', 'de-DE'). Day headers render via
        // Intl.DateTimeFormat with English fallback. Persisted for hydration.
        this._locale = spec.locale || null;
        if (this._locale && !this.dom.attrs['data-locale']) {
            this.dom.attrs['data-locale'] = this._locale;
        }

        // Range state
        this._range_start = null;   // ISO string
        this._range_end = null;     // ISO string
        this._anchor_date = null;   // ISO string (for shift+click)
        this._range_click_state = 0; // 0=waiting for start, 1=waiting for end
        this._dragging = false;
        this._selected_dates = new Set(); // for 'multi' mode

        // Cell → date mapping (filled on compose/refresh)
        this._cell_date_map = new Map();  // cell → ISO string
        this._date_cell_map = new Map();  // ISO string → cell

        if (!spec.el) { this.compose_month_view(); }
        this.context.new_selection_scope(this);
    }

    // ---- Public API ----

    get range_start() { return this._range_start; }
    set range_start(v) { this._range_start = v; }

    get range_end() { return this._range_end; }
    set range_end(v) { this._range_end = v; }

    get selected_dates() { return Array.from(this._selected_dates).sort(); }

    get min_date() { return this._min_date; }
    set min_date(v) { this._min_date = v; }

    get max_date() { return this._max_date; }
    set max_date(v) { this._max_date = v; }

    _is_date_in_bounds(iso) {
        if (this._min_date && iso < this._min_date) return false;
        if (this._max_date && iso > this._max_date) return false;
        return true;
    }

    get locale() { return this._locale; }
    set locale(v) { this._locale = v || null; }

    // Get rotated day headers based on first_day_of_week (localized when locale is set)
    _get_day_headers() {
        const base = (this._locale && get_locale_day_names(this._locale)) || ALL_DAYS;
        return [...base.slice(this._first_day), ...base.slice(0, this._first_day)];
    }

    // Localized month name for the displayed (or given) month index.
    month_name(month_index) {
        const idx = is_defined(month_index) ? month_index : this.month;
        const names = (this._locale && get_locale_month_names(this._locale))
            || ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
        return names[idx];
    }

    // Convert JS day (0=Sun) to grid column index
    _js_day_to_column(js_day) {
        const mon_based = (js_day + 6) % 7; // 0=Mon
        return (mon_based - this._first_day + 7) % 7;
    }

    // Weekend column indices for current first_day config
    _weekend_columns() {
        return [
            (5 - this._first_day + 7) % 7, // Saturday
            (6 - this._first_day + 7) % 7  // Sunday
        ];
    }

    /**
     * Set the range programmatically. Auto-swaps if start > end.
     */
    set_range(start, end) {
        if (start && end && start > end) { [start, end] = [end, start]; }
        this._range_start = start;
        this._range_end = end;
        this.update_range_highlight();
        this.raise('range-change', { start: this._range_start, end: this._range_end });
    }

    /**
     * Clear the current range/selection.
     */
    clear_range() {
        this._range_start = null;
        this._range_end = null;
        this._anchor_date = null;
        this._range_click_state = 0;
        this._selected_dates.clear();
        this.update_range_highlight();
    }

    // ---- Cell ↔ Date mapping ----

    _build_date_maps() {
        this._cell_date_map.clear();
        this._date_cell_map.clear();
        const col_offset = this._show_week_numbers ? 1 : 0;
        const weekendCols = this._weekend_columns();
        this.each_cell((cell, pos) => {
            const [x, y] = pos;
            // Skip week-number gutter column
            if (this._show_week_numbers && x === 0) return;

            // After SSR hydration, cell.value may be lost (not serialized to HTML).
            // Restore it from the cell's span text content if available.
            if (cell.value == null) {
                const el = cell.dom && (cell.dom.el || cell.el);
                if (el) {
                    const span = el.querySelector && el.querySelector('span');
                    if (span) {
                        const text = span.textContent.trim();
                        if (/^\d+$/.test(text)) {
                            cell.value = parseInt(text, 10);
                        }
                    }
                }
            }

            if (y > 0 && cell.value != null) {
                const iso = to_iso(new Date(this.year, this.month, cell.value));
                this._cell_date_map.set(cell, iso);
                this._date_cell_map.set(iso, cell);
                // Today indicator
                if (iso === TODAY_ISO) cell.add_class('today');
                else cell.remove_class('today');
                // Weekend styling
                if (weekendCols.includes(x - col_offset)) cell.add_class('weekend');
                // Min/max bounds
                if (cell.selectable && !this._is_date_in_bounds(iso)) {
                    cell.selectable = false;
                    cell.background.color = bgc_disabled;
                    cell.add_class('out-of-bounds');
                }
            }
        });
    }

    _get_cell_date(cell) {
        // Try the map first (populated server-side)
        const mapped = this._cell_date_map.get(cell);
        if (mapped) return mapped;

        // Fallback: read the day from the cell's DOM span text
        // (after SSR hydration, cell.value is lost)
        const el = cell.dom && (cell.dom.el || cell.el);
        if (el) {
            const span = el.querySelector && el.querySelector('span');
            if (span) {
                const text = span.textContent.trim();
                if (/^\d+$/.test(text)) {
                    const day = parseInt(text, 10);
                    const iso = to_iso(new Date(this.year, this.month, day));
                    // Cache for future lookups
                    this._cell_date_map.set(cell, iso);
                    this._date_cell_map.set(iso, cell);
                    return iso;
                }
            }
        }
        return null;
    }

    // ---- Week helper ----

    // Get the Mon–Sun week containing the given ISO date
    _get_week_dates(iso) {
        const d = from_iso(iso);
        const js_day = d.getDay(); // 0=Sun
        const mon_offset = (js_day + 6) % 7; // 0=Mon
        const mon = new Date(d); mon.setDate(d.getDate() - mon_offset);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const wd = new Date(mon); wd.setDate(mon.getDate() + i);
            dates.push(to_iso(wd));
        }
        return dates; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    }

    // ---- Month paging ----

    // Show the previous/next month (delta in months, may cross years).
    page_month(delta) {
        const d = new Date(this.year, this.month + delta, 1);
        this._page_to(d.getFullYear(), d.getMonth());
    }

    // Show the same month in the previous/next year.
    page_year(delta) {
        this._page_to(this.year + delta, this.month);
    }

    _page_to(year, month) {
        // Remember the focused (or selected) day-of-month so the focus ring
        // lands on the equivalent day in the new month, clamped to its length.
        const prev_day = this._focused_iso
            ? from_iso(this._focused_iso).getDate()
            : null;

        this.year = year;
        this.month = month;

        const rootEl = this.dom && (this.dom.el || this.el);
        if (rootEl && typeof document !== 'undefined') {
            this._refresh_dom_month(rootEl);
        } else {
            // Server/VDOM path (pre-activation).
            this.refresh_month_view();
        }

        // Re-apply any selection that falls inside the newly displayed month
        // (range/multi state is stored as absolute ISO dates).
        this.update_range_highlight();

        // Localized grid label follows the displayed month.
        if (rootEl && rootEl.setAttribute) {
            rootEl.setAttribute('aria-label', `${this.month_name()} ${this.year}`);
        }

        if (prev_day) {
            const last_day = new Date(this.year, this.month + 1, 0).getDate();
            const iso = to_iso(new Date(this.year, this.month, Math.min(prev_day, last_day)));
            if (this._is_date_in_bounds(iso)) this._set_kb_focus(iso);
        }

        this.raise('month-change', {
            year: this.year,
            month: this.month,
            month_name: this.month_name()
        });
    }

    // Client-side twin of refresh_month_view: rewrites the live DOM grid for
    // the current year/month. (refresh_month_view manipulates VDOM cells and
    // its span.add() APPENDS, so it must not run against an activated grid.)
    _refresh_dom_month(rootEl) {
        const first = new Date(this.year, this.month, 1);
        const days_in_month = new Date(this.year, this.month + 1, 0).getDate();
        const start_col = this._js_day_to_column(first.getDay());
        const today_iso = to_iso(new Date());

        const rows = [...rootEl.querySelectorAll('.row:not(.header)')];
        let day = 1;
        rows.forEach((rowEl, row_idx) => {
            const cells = [...rowEl.querySelectorAll('.cell')].filter(c => !c.classList.contains('week-number'));
            cells.forEach((cellEl, col) => {
                const span = cellEl.querySelector('span');
                const in_month = !(row_idx === 0 && col < start_col) && day <= days_in_month;
                cellEl.classList.remove('today', 'weekend', 'out-of-bounds', 'selected', 'kb-focus', 'has-events');
                if (in_month) {
                    const iso = to_iso(new Date(this.year, this.month, day));
                    if (span) span.textContent = String(day);
                    cellEl.style.backgroundColor = '';
                    const wd = new Date(this.year, this.month, day).getDay();
                    if (wd === 0 || wd === 6) cellEl.classList.add('weekend');
                    if (iso === today_iso) cellEl.classList.add('today');
                    if (!this._is_date_in_bounds(iso)) cellEl.classList.add('out-of-bounds');
                    cellEl.setAttribute('aria-selected', 'false');
                    day++;
                } else {
                    if (span) span.textContent = '';
                    cellEl.style.backgroundColor = 'var(--mv-cell-disabled)';
                    cellEl.removeAttribute('aria-selected');
                }
            });
            // Week-number gutter: recompute from the first in-month cell.
            const wn = rowEl.querySelector('.cell.week-number span');
            if (wn) {
                const first_cell = [...rowEl.querySelectorAll('.cell:not(.week-number) span')]
                    .map(s => parseInt(s.textContent.trim(), 10)).find(n => !Number.isNaN(n));
                wn.textContent = first_cell
                    ? String(iso_week_number(new Date(this.year, this.month, first_cell)))
                    : '';
            }
        });

        // Cell↔date maps are stale for the new month.
        this._cell_date_map = new Map();
        this._date_cell_map = new Map();
        this._build_date_maps();

        // Keep the persisted month/year attributes truthful.
        this.dom.attrs['data-month'] = String(this.month);
        this.dom.attrs['data-year'] = String(this.year);
        rootEl.setAttribute('data-month', String(this.month));
        rootEl.setAttribute('data-year', String(this.year));
    }

    // ---- Visual highlighting ----

    update_range_highlight() {
        const rs = this._range_start;
        const re = this._range_end;
        const mode = this.selection_mode;

        const RANGE_CLASSES = ['range-start', 'range-end', 'range-between', 'range-hover', 'multi-selected'];

        // Use direct DOM access — after SSR hydration, the jsgui control tree
        // may not have cell.value, so we read day numbers from span text.
        const rootEl = this.dom && (this.dom.el || this.el);
        if (!rootEl) {
            // Server-side render: apply classes to the VDOM cells via the date
            // map so the initial HTML already shows the configured range.
            this._cell_date_map.forEach((iso, cell) => {
                RANGE_CLASSES.forEach(cls => cell.remove_class(cls));
                let selected = false;
                if (mode === 'range' && rs && re) {
                    if (iso === rs) { cell.add_class('range-start'); selected = true; }
                    if (iso === re) { cell.add_class('range-end'); selected = true; }
                    if (iso > rs && iso < re) { cell.add_class('range-between'); selected = true; }
                } else if ((mode === 'multi' || mode === 'week') && this._selected_dates.has(iso)) {
                    cell.add_class('multi-selected');
                    selected = true;
                }
                cell.dom.attributes['aria-selected'] = selected ? 'true' : 'false';
            });
            return;
        }

        const dataCells = rootEl.querySelectorAll('.row:not(.header) .cell:not(.week-number)');


        dataCells.forEach(cellEl => {
            // Remove all range/multi classes
            RANGE_CLASSES.forEach(cls => cellEl.classList.remove(cls));

            const span = cellEl.querySelector('span');
            const text = span ? span.textContent.trim() : '';
            if (!/^\d+$/.test(text)) return;

            const day = parseInt(text, 10);
            const iso = to_iso(new Date(this.year, this.month, day));

            let selected = false;
            if (mode === 'range' && rs && re) {
                if (iso === rs && iso === re) {
                    cellEl.classList.add('range-start');
                    cellEl.classList.add('range-end');
                    selected = true;
                } else if (iso === rs) {
                    cellEl.classList.add('range-start');
                    selected = true;
                } else if (iso === re) {
                    cellEl.classList.add('range-end');
                    selected = true;
                } else if (iso > rs && iso < re) {
                    cellEl.classList.add('range-between');
                    selected = true;
                }
            } else if (mode === 'multi' || mode === 'week') {
                if (this._selected_dates.has(iso)) {
                    cellEl.classList.add('multi-selected');
                    selected = true;
                }
            }
            cellEl.setAttribute('aria-selected', selected ? 'true' : 'false');
        });

    }

    _highlight_hover(hover_iso) {
        if (!this._range_start || !hover_iso) return;
        const rs = this._range_start;
        let effective_start = rs <= hover_iso ? rs : hover_iso;
        let effective_end = rs <= hover_iso ? hover_iso : rs;

        const rootEl = this.dom && (this.dom.el || this.el);
        if (!rootEl) return;

        const HOVER_CLASSES = ['range-hover', 'range-between', 'range-start', 'range-end'];
        const dataCells = rootEl.querySelectorAll('.row:not(.header) .cell:not(.week-number)');

        dataCells.forEach(cellEl => {
            HOVER_CLASSES.forEach(cls => cellEl.classList.remove(cls));

            const span = cellEl.querySelector('span');
            const text = span ? span.textContent.trim() : '';
            if (!/^\d+$/.test(text)) return;

            const day = parseInt(text, 10);
            const iso = to_iso(new Date(this.year, this.month, day));

            if (iso === effective_start && iso === effective_end) {
                cellEl.classList.add('range-start');
                cellEl.classList.add('range-end');
            } else if (iso === effective_start) {
                cellEl.classList.add('range-start');
            } else if (iso === effective_end) {
                cellEl.classList.add('range-hover');
            } else if (iso > effective_start && iso < effective_end) {
                cellEl.classList.add('range-between');
            }
        });
    }

    // ---- Keyboard navigation ----

    // Find the DOM cell element displaying the given ISO date (this month only).
    _kb_el_for_iso(iso) {
        const rootEl = this.dom && (this.dom.el || this.el);
        if (!rootEl || !iso) return null;
        const dataCells = rootEl.querySelectorAll('.row:not(.header) .cell:not(.week-number)');
        for (const cellEl of dataCells) {
            if (this._iso_from_el(cellEl) === iso) return cellEl;
        }
        return null;
    }

    // First / last in-bounds ISO date of the displayed month.
    _month_bound_iso(which) {
        const last_day = new Date(this.year, this.month + 1, 0).getDate();
        for (let i = 0; i < last_day; i++) {
            const day = which === 'first' ? i + 1 : last_day - i;
            const iso = to_iso(new Date(this.year, this.month, day));
            if (this._is_date_in_bounds(iso)) return iso;
        }
        return null;
    }

    // Move the keyboard focus ring onto the given ISO date.
    _set_kb_focus(iso) {
        const rootEl = this.dom && (this.dom.el || this.el);
        if (!rootEl || !iso) return;
        rootEl.querySelectorAll('.cell.kb-focus').forEach(el => el.classList.remove('kb-focus'));
        const cellEl = this._kb_el_for_iso(iso);
        if (cellEl) {
            cellEl.classList.add('kb-focus');
            this._focused_iso = iso;
            this.raise('focus-date', { date: iso });
        }
    }

    // Move focus by a day delta, staying inside the displayed month and min/max bounds.
    _move_kb_focus(delta_days) {
        let base = this._focused_iso;
        if (!base) {
            // Sensible starting point: current selection, today (if displayed), or first in-bounds day.
            base = this._range_start
                || (this._selected_dates.size ? this.selected_dates[0] : null)
                || (from_iso(TODAY_ISO).getMonth() === this.month && from_iso(TODAY_ISO).getFullYear() === this.year ? TODAY_ISO : null)
                || this._month_bound_iso('first');
            if (base) this._set_kb_focus(base);
            return;
        }
        const d = from_iso(base);
        d.setDate(d.getDate() + delta_days);
        // Clamp: keyboard focus stays within the displayed month (month paging is a separate concern).
        if (d.getMonth() !== this.month || d.getFullYear() !== this.year) return;
        const next = to_iso(d);
        if (!this._is_date_in_bounds(next)) return;
        this._set_kb_focus(next);
    }

    // Canonical single-mode selection: used by mouse clicks (post-reattach)
    // and keyboard activation. Applies the .selected class directly to the
    // DOM (the jsgui selectable-mixin path does not survive reattachment).
    _select_single(iso) {
        if (!iso || !this._is_date_in_bounds(iso)) return;
        const rootEl = this.dom && (this.dom.el || this.el);
        if (rootEl) {
            rootEl.querySelectorAll('.cell.selected').forEach(el => el.classList.remove('selected'));
            const cellEl = this._kb_el_for_iso(iso);
            if (cellEl) cellEl.classList.add('selected');
        }
        this.day = from_iso(iso).getDate();
        this.raise('date-select', { iso, date: iso });
    }

    // Enter/Space on the focused date — same semantics as a mouse press in each mode.
    _kb_activate_focused() {
        const iso = this._focused_iso;
        if (!iso || !this._is_date_in_bounds(iso)) return;
        const mode = this.selection_mode;

        if (mode === 'single') {
            this._select_single(iso);
        } else if (mode === 'range') {
            if (this._range_click_state === 0) {
                this._range_start = iso;
                this._range_end = iso;
                this._anchor_date = iso;
                this._range_click_state = 1;
                this.update_range_highlight();
                this._set_kb_focus(iso); // update_range_highlight cleared the focus class
                this.raise('range-start-pick', { date: iso });
            } else {
                this.set_range(this._range_start, iso);
                this._range_click_state = 0;
                this._set_kb_focus(iso);
            }
        } else if (mode === 'multi') {
            if (this._selected_dates.has(iso)) {
                this._selected_dates.delete(iso);
            } else {
                this._selected_dates.add(iso);
            }
            this._anchor_date = iso;
            this.update_range_highlight();
            this._set_kb_focus(iso);
            this.raise('selection-change', { dates: this.selected_dates });
        } else if (mode === 'week') {
            const week_dates = this._get_week_dates(iso);
            this._selected_dates.clear();
            week_dates.forEach(wd => this._selected_dates.add(wd));
            this._anchor_date = iso;
            this.update_range_highlight();
            this._set_kb_focus(iso);
            this.raise('week-select', {
                week_number: iso_week_number(from_iso(iso)),
                start: week_dates[0],
                end: week_dates[6],
                dates: [...this._selected_dates].sort()
            });
        }
    }

    // Escape — cancel a half-picked range and drop the focus ring.
    _kb_escape() {
        if (this.selection_mode === 'range' && this._range_click_state === 1) {
            this._range_click_state = 0;
            this._range_start = null;
            this._range_end = null;
            this.update_range_highlight();
        }
        const rootEl = this.dom && (this.dom.el || this.el);
        if (rootEl) rootEl.querySelectorAll('.cell.kb-focus').forEach(el => el.classList.remove('kb-focus'));
        this._focused_iso = null;
    }

    // ---- Activation (wiring up events) ----

    /**
     * Get ISO date string from a DOM cell element's span text.
     * E.g. if the span says "15", returns "2026-02-15".
     */
    _iso_from_el(cellEl) {
        const span = cellEl.querySelector('span');
        if (!span) return null;
        const text = span.textContent.trim();
        if (!/^\d+$/.test(text)) return null;
        const day = parseInt(text, 10);
        return to_iso(new Date(this.year, this.month, day));
    }

    activate() {
        // Guard against double activation: in a real page this method is
        // reached both via the parent's content activation and the page-level
        // bootstrap — without the guard every DOM listener wires twice (one
        // PageDown then pages two months, one click runs the range state
        // machine twice).
        if (this._mv_activated) return;
        this._mv_activated = true;
        super.activate();

        const rootEl = this.dom && (this.dom.el || this.el);

        // Restore displayed month/year BEFORE rebuilding the date maps —
        // mx_date defaults them to "now", which is wrong for any other month.
        if (rootEl && rootEl.getAttribute) {
            const dom_month = rootEl.getAttribute('data-month');
            const dom_year = rootEl.getAttribute('data-year');
            if (dom_month !== null && !Number.isNaN(Number(dom_month))) this.month = Number(dom_month);
            if (dom_year !== null && !Number.isNaN(Number(dom_year))) this.year = Number(dom_year);
        }

        // Rebuild cell→date maps (they were built server-side in compose_month_view
        // but Maps don't survive SSR hydration)
        this._build_date_maps();

        // Restore selection_mode from DOM attribute if needed (SSR hydration)
        if (rootEl && this.selection_mode === 'single') {
            const domMode = rootEl.getAttribute('data-selection-mode');
            if (domMode && domMode !== 'single') {
                this.selection_mode = domMode;
            }
        }

        // Recover selection STATE from SSR-rendered classes: the classes are
        // in the mounted HTML but the reattached instance's _range_start /
        // _selected_dates are empty, so month paging (or any re-highlight)
        // would silently drop the selection.
        if (rootEl && !this._range_start) {
            const start_el = rootEl.querySelector('.cell.range-start');
            const end_el = rootEl.querySelector('.cell.range-end');
            if (start_el) {
                this._range_start = this._iso_from_el(start_el);
                this._range_end = end_el ? this._iso_from_el(end_el) : this._range_start;
            }
        }
        if (rootEl && this._selected_dates && this._selected_dates.size === 0) {
            rootEl.querySelectorAll('.cell.multi-selected').forEach(sel_el => {
                const iso = this._iso_from_el(sel_el);
                if (iso) this._selected_dates.add(iso);
            });
        }

        const mode = this.selection_mode;

        // Single mode.
        // 1. jsgui control-tree path: programmatic cell.selected changes keep
        //    this.day in sync (same-process composition).
        // 2. Direct DOM click path: the selectable-mixin chain does NOT
        //    survive SSR reattachment, so clicks are wired explicitly —
        //    this is the path that raises date-select for composites.
        if (mode === 'single') {
            let cells = this.$('grid_cell');
            each(cells, cell => {
                cell.on('change', e_change => {
                    if (e_change.name === 'selected' && e_change.value && is_defined(cell.value)) {
                        this.day = cell.value;
                    }
                });
            });

            if (rootEl) {
                const dataCells = rootEl.querySelectorAll('.row:not(.header) .cell:not(.week-number)');
                dataCells.forEach(cellEl => {
                    cellEl.addEventListener('click', () => {
                        const iso = this._iso_from_el(cellEl);
                        if (iso) this._select_single(iso);
                    });
                });
            }
        }

        // For range/multi/week modes, bind directly to real DOM elements.
        // After SSR hydration, jsgui cell.dom.el may not be connected to
        // the actual DOM nodes, so we use querySelectorAll on the root element.
        if (mode !== 'single') {
            if (!rootEl) return;

            const dataCells = rootEl.querySelectorAll('.row:not(.header) .cell:not(.week-number)');

            if (mode === 'range') {
                dataCells.forEach(cellEl => {
                    cellEl.addEventListener('mousedown', (e) => {
                        e.stopImmediatePropagation(); // prevent framework from double-firing
                        const iso = this._iso_from_el(cellEl);
                        if (!iso) return;

                        if (e.shiftKey && this._anchor_date) {
                            this.set_range(this._anchor_date, iso);
                            this._range_click_state = 0;
                            return;
                        }
                        if (e.ctrlKey || e.metaKey) return;

                        if (this._range_click_state === 0) {
                            this._range_start = iso;
                            this._range_end = iso;
                            this._anchor_date = iso;
                            this._range_click_state = 1;
                            this._dragging = true;
                            this.update_range_highlight();
                            this.raise('range-start-pick', { date: iso });
                        } else {
                            this._dragging = false;
                            this.set_range(this._range_start, iso);
                            this._range_click_state = 0;
                        }
                    });

                    cellEl.addEventListener('mousemove', (e) => {
                        const iso = this._iso_from_el(cellEl);
                        if (!iso) return;
                        if (this._dragging || this._range_click_state === 1) {
                            this._highlight_hover(iso);
                        }
                        this.raise('date-hover', { date: iso });
                    });

                    cellEl.addEventListener('mouseup', (e) => {
                        if (!this._dragging) return;
                        const iso = this._iso_from_el(cellEl);
                        if (!iso) return;
                        this._dragging = false;
                        if (iso !== this._range_start) {
                            this.set_range(this._range_start, iso);
                            this._range_click_state = 0;
                        }
                    });
                });
            }

            if (mode === 'multi') {
                dataCells.forEach(cellEl => {
                    cellEl.addEventListener('mousedown', (e) => {
                        e.stopImmediatePropagation(); // prevent selectable mixin from clearing selection
                        const iso = this._iso_from_el(cellEl);
                        if (!iso) return;

                        if (e.shiftKey && this._anchor_date) {
                            let s = this._anchor_date <= iso ? this._anchor_date : iso;
                            let en = this._anchor_date <= iso ? iso : this._anchor_date;
                            let cur = new Date(from_iso(s));
                            const endD = from_iso(en);
                            while (cur <= endD) {
                                this._selected_dates.add(to_iso(cur));
                                cur.setDate(cur.getDate() + 1);
                            }
                        } else if (e.ctrlKey || e.metaKey) {
                            if (this._selected_dates.has(iso)) {
                                this._selected_dates.delete(iso);
                            } else {
                                this._selected_dates.add(iso);
                            }
                            this._anchor_date = iso;
                        } else {
                            this._selected_dates.clear();
                            this._selected_dates.add(iso);
                            this._anchor_date = iso;
                        }
                        this.update_range_highlight();
                        this.raise('selection-change', { dates: this.selected_dates });
                    });
                });
            }

            if (mode === 'week') {
                dataCells.forEach(cellEl => {
                    cellEl.addEventListener('click', (e) => {
                        const iso = this._iso_from_el(cellEl);
                        if (!iso) return;
                        const week_dates = this._get_week_dates(iso);
                        this._selected_dates.clear();
                        week_dates.forEach(wd => this._selected_dates.add(wd));
                        this._anchor_date = iso;
                        this.update_range_highlight();
                        this.raise('week-select', {
                            week_number: iso_week_number(from_iso(iso)),
                            start: week_dates[0],
                            end: week_dates[6],
                            dates: [...this._selected_dates].sort()
                        });
                    });
                });
            }
        }

        // Global mouseup to cancel drag if released outside grid
        if (mode === 'range' && typeof document !== 'undefined') {
            document.addEventListener('mouseup', () => {
                if (this._dragging) {
                    this._dragging = false;
                    if (this._range_start && !this._range_end) {
                        this._range_end = this._range_start;
                        this.update_range_highlight();
                    }
                }
            });
        }

        // ---- Keyboard navigation (all modes) ----
        // Arrow keys move a focus ring by day/week; Enter/Space acts like a
        // mouse press in the current mode; Home/End jump to month bounds;
        // Escape cancels a half-picked range.
        if (rootEl && typeof document !== 'undefined') {
            if (!rootEl.getAttribute('tabindex')) rootEl.setAttribute('tabindex', '0');
            const keyboard_navigation = require('../../../../../control_mixins/keyboard_navigation');
            keyboard_navigation(this, {
                orientation: 'both',
                on_left: () => this._move_kb_focus(-1),
                on_right: () => this._move_kb_focus(1),
                on_up: () => this._move_kb_focus(-7),
                on_down: () => this._move_kb_focus(7),
                on_home: () => { const iso = this._month_bound_iso('first'); if (iso) this._set_kb_focus(iso); },
                on_end: () => { const iso = this._month_bound_iso('last'); if (iso) this._set_kb_focus(iso); },
                on_activate: () => this._kb_activate_focused()
            });
            this.add_dom_event_listener('keydown', e => {
                if (e.key === 'Escape') {
                    this._kb_escape();
                } else if (e.key === 'PageUp') {
                    e.preventDefault();
                    if (e.shiftKey) this.page_year(-1); else this.page_month(-1);
                } else if (e.key === 'PageDown') {
                    e.preventDefault();
                    if (e.shiftKey) this.page_year(1); else this.page_month(1);
                }
            });
        }
    }

    // ---- Compose & Refresh ----

    compose_month_view() {
        this.refresh_month_view(); this.add_class('month-view');
        let days_row = this._arr_rows[0];
        days_row.add_class('days'); days_row.add_class('header');
        const day_headers = this._get_day_headers();
        const col_offset = this._show_week_numbers ? 1 : 0;
        const max_col = 6 + col_offset;
        each(days_row.content._arr, (cell, i) => {
            if (cell.span) {
                if (this._show_week_numbers && i === 0) {
                    cell.span.add('W'); cell.add_class('week-number');
                } else {
                    cell.span.add(day_headers[i - col_offset]);
                    // Weekend header styling
                    const weekendCols = this._weekend_columns();
                    if (weekendCols.includes(i - col_offset)) cell.add_class('weekend');
                }
            }
        });
        let cell_pos = [col_offset, 1], ctrl_row = this._arr_rows[cell_pos[1]];
        // Disable week-number gutter cells in all data rows
        if (this._show_week_numbers) {
            for (let r = 1; r < this._arr_rows.length; r++) {
                let wn_cell = this._arr_rows[r].content._arr[0];
                wn_cell.selectable = false; wn_cell.add_class('week-number');
            }
        }
        let advance_cell = () => {
            if (cell_pos[0] === ctrl_row.content._arr.length - 1) {
                if (cell_pos[1] < this._arr_rows.length - 1) { cell_pos[0] = col_offset; cell_pos[1]++; ctrl_row = this._arr_rows[cell_pos[1]]; }
                else return false;
            } else { cell_pos[0]++; }
            return true;
        };
        let d = new Date(this.year, this.month, 1);
        let got_day = this._js_day_to_column(d.getDay());
        while (cell_pos[0] < got_day + col_offset) {
            let cell = ctrl_row.content._arr[cell_pos[0]++];
            cell.selectable = false; cell.select_unique = true; cell.background.color = bgc_disabled;
        }
        let did_advance = true;
        while (did_advance) {
            let cell = ctrl_row.content._arr[cell_pos[0]];
            cell.selectable = true; cell.select_unique = true; cell.value = d.getDate();
            cell._fields = cell._fields || {}; cell._fields.value = cell.value;
            d.setDate(d.getDate() + 1);
            did_advance = advance_cell() && d.getDate() !== 1;
        }
        while (cell_pos[0] <= max_col) {
            let cell = ctrl_row.content._arr[cell_pos[0]++];
            cell.selectable = false; cell.select_unique = true; cell.background.color = bgc_disabled;
        }
        if (cell_pos[1] < 6) {
            cell_pos = [col_offset, 6]; ctrl_row = this._arr_rows[cell_pos[1]];
            while (cell_pos[0] <= max_col) {
                let cell = ctrl_row.content._arr[cell_pos[0]++];
                cell.selectable = false; cell.select_unique = true; cell.background.color = bgc_disabled;
            }
        }
        // Fill week numbers in the gutter
        if (this._show_week_numbers) { this._fill_week_numbers(); }
        this._build_date_maps();
        this._apply_grid_aria();
    }

    // ARIA grid semantics: root=grid, rows=row, headers=columnheader, cells=gridcell.
    _apply_grid_aria() {
        const a11y = require('../../../../../control_mixins/a11y');
        a11y.apply_grid_aria(this, { label: `${this.month_name()} ${this.year}` });
        each(this._arr_rows, (row, y) => {
            row.dom.attributes.role = row.dom.attributes.role || 'row';
            each(row.content._arr, cell => {
                if (!cell || !cell.dom) return;
                const attrs = cell.dom.attributes;
                if (!attrs.role) attrs.role = (y === 0) ? 'columnheader' : 'gridcell';
            });
        });
    }

    refresh_month_view() {
        let d = new Date(this.year, this.month, 1), m = d.getMonth();
        let got_day = this._js_day_to_column(d.getDay());
        let day = this.day;
        const col_offset = this._show_week_numbers ? 1 : 0;
        this.each_cell((cell, cell_pos) => {
            let [x, y] = cell_pos;
            // Skip week-number gutter
            if (this._show_week_numbers && x === 0) return;
            if (y > 0) {
                const adj_x = x - col_offset;
                if (y === 1) {
                    if (adj_x < got_day) {
                        cell.background.color = bgc_disabled; cell.selectable = false;
                        if (cell.deselect) cell.deselect(); cell.value = null;
                        cell.remove_class('today'); cell.remove_class('weekend'); cell.remove_class('out-of-bounds');
                        cell.iterate_this_and_subcontrols(ctrl => { if (ctrl.dom.tagName === 'span') ctrl.text = ''; });
                    } else {
                        cell.background.color = bgc_enabled; cell.selectable = true;
                        cell.span.add(d.getDate() + ''); cell.value = d.getDate();
                        d.setDate(d.getDate() + 1);
                    }
                } else {
                    let dm = d.getMonth();
                    if (dm === m) {
                        cell.background.color = bgc_enabled; cell.selectable = true;
                        cell.span.add(d.getDate() + ''); cell.value = d.getDate();
                        d.setDate(d.getDate() + 1);
                    } else {
                        cell.background.color = bgc_disabled; cell.selectable = false;
                        if (cell.deselect) cell.deselect(); cell.value = null;
                        cell.remove_class('today'); cell.remove_class('weekend'); cell.remove_class('out-of-bounds');
                    }
                }
            }
        });
        if (this._show_week_numbers) { this._fill_week_numbers(); }
        this._build_date_maps();

        // Keep the persisted month/year attributes truthful after navigation.
        this.dom.attrs['data-month'] = String(this.month);
        this.dom.attrs['data-year'] = String(this.year);
        const el = this.dom && this.dom.el;
        if (el && el.setAttribute) {
            el.setAttribute('data-month', String(this.month));
            el.setAttribute('data-year', String(this.year));
        }
    }

    // Fill the week-number gutter cells with ISO week numbers
    _fill_week_numbers() {
        for (let r = 1; r < this._arr_rows.length; r++) {
            const wn_cell = this._arr_rows[r].content._arr[0];
            // Find the first date cell in this row that has a value
            let found_date = null;
            const row_cells = this._arr_rows[r].content._arr;
            for (let c = 1; c < row_cells.length; c++) {
                if (row_cells[c].value != null) {
                    found_date = new Date(this.year, this.month, row_cells[c].value);
                    break;
                }
            }
            if (found_date) {
                const wk = iso_week_number(found_date);
                // Clear ALL existing content from the span before setting the week number
                // (span.add() appends, causing doubled values like '99', '1010')
                if (wn_cell.span) {
                    if (wn_cell.span.content && wn_cell.span.content._arr) {
                        wn_cell.span.content._arr.length = 0;
                    }
                    wn_cell.span.add('' + wk);
                }
            }
        }
    }
}

// ---- CSS ----
Month_View.css = `
/* --- CSS custom properties for theming --- */
.month-view {
    --mv-bg: #fff;
    --mv-cell-bg: inherit;
    --mv-cell-disabled: #ddd;
    --mv-text: #1e293b;
    --mv-header-text: #64748b;
    --mv-accent: #2563eb;
    --mv-accent-light: #dbeafe;
    --mv-accent-mid: #93c5fd;
    --mv-today-ring: #2563eb;
    --mv-weekend-text: #94a3b8;
}

:is(.jsgui-dark-mode, [data-theme="dark"]) .month-view {
    --mv-bg: #1f2937;
    --mv-cell-bg: #111827;
    --mv-cell-disabled: #374151;
    --mv-text: #e5e7eb;
    --mv-header-text: #9ca3af;
    --mv-accent: #60a5fa;
    --mv-accent-light: #1e3a8a;
    --mv-accent-mid: #2563eb;
    --mv-today-ring: #93c5fd;
    --mv-weekend-text: #cbd5e1;
}
/* --- Range highlighting --- */
.month-view .cell.range-start {
    background-color: var(--mv-accent) !important;
    color: #fff;
    border-radius: 4px 0 0 4px;
}
.month-view .cell.range-end {
    background-color: var(--mv-accent) !important;
    color: #fff;
    border-radius: 0 4px 4px 0;
}
.month-view .cell.range-start.range-end {
    border-radius: 4px;
}
.month-view .cell.range-between {
    background-color: var(--mv-accent-light) !important;
}
.month-view .cell.range-hover {
    background-color: var(--mv-accent-mid) !important;
    color: #fff;
    border-radius: 0 4px 4px 0;
}
.month-view .cell.multi-selected {
    background-color: var(--mv-accent) !important;
    color: #fff;
    border-radius: 4px;
}
.month-view .row:not(.header) .cell {
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition: background-color 0.1s ease;
}
.month-view .row:not(.header) .cell:hover {
    opacity: 0.85;
}
/* --- Today indicator --- */
.month-view .cell.today {
    font-weight: 700;
    box-shadow: inset 0 0 0 2px var(--mv-today-ring);
    border-radius: 4px;
}
/* --- Weekend styling --- */
.month-view .cell.weekend span { color: var(--mv-weekend-text); }
.month-view .row.header .cell.weekend span { color: var(--mv-weekend-text); }
/* --- Out-of-bounds / disabled --- */
.month-view .cell.out-of-bounds {
    cursor: not-allowed !important;
    opacity: 0.4;
}
.month-view .cell.out-of-bounds span { text-decoration: line-through; }
/* --- Week number gutter --- */
.month-view .cell.week-number {
    font-size: 10px;
    color: var(--mv-weekend-text);
    pointer-events: none;
    background: #f8fafc !important;
    font-weight: 500;
}
.month-view .cell.week-number span { font-size: 10px; }
/* --- Week mode: highlight full row --- */
.month-view[data-selection-mode="week"] .row:not(.header):hover {
    background-color: var(--mv-accent-light);
}
/* --- Keyboard navigation --- */
.month-view:focus {
    outline: 2px solid var(--mv-accent);
    outline-offset: 2px;
}
.month-view .cell.kb-focus {
    box-shadow: inset 0 0 0 2px var(--mv-accent), inset 0 0 0 4px var(--mv-bg);
    border-radius: 4px;
}
`;

// Locale helpers exposed for composites (date pickers, captions, etc.)
Month_View.get_locale_day_names = get_locale_day_names;
Month_View.get_locale_month_names = get_locale_month_names;

Month_View.Tiled = Tile_Slider.wrap(Month_View, spec => {
    spec = clone(spec);
    if (!is_defined(spec.month)) {
        let now = new Date();
        spec.month = now.getMonth(); spec.year = now.getFullYear();
    }
    spec.month = spec.month - 1; if (spec.month < 0) { spec.month = 11; spec.year = spec.year - 1; }
    return spec;
}, spec => {
    spec = clone(spec);
    if (!is_defined(spec.month)) {
        let now = new Date();
        spec.month = now.getMonth(); spec.year = now.getFullYear();
    }
    spec.month = spec.month + 1; if (spec.month > 11) { spec.month = 0; spec.year = spec.year + 1; }
    return spec;
});
module.exports = Month_View;