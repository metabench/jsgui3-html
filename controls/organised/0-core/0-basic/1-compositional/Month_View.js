const jsgui = require('../../../../../html-core/html-core');
const clone = jsgui.clone;
const each = jsgui.each, is_defined = jsgui.is_defined;
const Grid = require('./Grid');
const Tile_Slider = require('../../../1-standard/6-layout/Tile_Slide');
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let bgc_disabled = '#DDDDDD';
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

        // Phase 1 config
        this._first_day = spec.first_day_of_week || 0; // 0=Mon (default), 6=Sun
        this._show_week_numbers = show_week_nums;
        this._min_date = spec.min_date || null; // ISO string
        this._max_date = spec.max_date || null; // ISO string

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

    // Get rotated day headers based on first_day_of_week
    _get_day_headers() {
        return [...ALL_DAYS.slice(this._first_day), ...ALL_DAYS.slice(0, this._first_day)];
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

    // ---- Visual highlighting ----

    update_range_highlight() {
        const rs = this._range_start;
        const re = this._range_end;
        const mode = this.selection_mode;

        // Use direct DOM access — after SSR hydration, the jsgui control tree
        // may not have cell.value, so we read day numbers from span text.
        const rootEl = this.dom && (this.dom.el || this.el);
        if (!rootEl) return;

        const RANGE_CLASSES = ['range-start', 'range-end', 'range-between', 'range-hover', 'multi-selected'];
        const dataCells = rootEl.querySelectorAll('.row:not(.header) .cell:not(.week-number)');


        dataCells.forEach(cellEl => {
            // Remove all range/multi classes
            RANGE_CLASSES.forEach(cls => cellEl.classList.remove(cls));

            const span = cellEl.querySelector('span');
            const text = span ? span.textContent.trim() : '';
            if (!/^\d+$/.test(text)) return;

            const day = parseInt(text, 10);
            const iso = to_iso(new Date(this.year, this.month, day));

            if (mode === 'range' && rs && re) {
                if (iso === rs && iso === re) {
                    cellEl.classList.add('range-start');
                    cellEl.classList.add('range-end');
                } else if (iso === rs) {
                    cellEl.classList.add('range-start');
                } else if (iso === re) {
                    cellEl.classList.add('range-end');
                } else if (iso > rs && iso < re) {
                    cellEl.classList.add('range-between');
                }
            } else if (mode === 'multi' || mode === 'week') {
                if (this._selected_dates.has(iso)) {
                    cellEl.classList.add('multi-selected');
                }
            }
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
        super.activate();

        // Rebuild cell→date maps (they were built server-side in compose_month_view
        // but Maps don't survive SSR hydration)
        this._build_date_maps();

        // Restore selection_mode from DOM attribute if needed (SSR hydration)
        const rootEl = this.dom && (this.dom.el || this.el);
        if (rootEl && this.selection_mode === 'single') {
            const domMode = rootEl.getAttribute('data-selection-mode');
            if (domMode && domMode !== 'single') {
                this.selection_mode = domMode;
            }
        }

        const mode = this.selection_mode;

        // Single mode: use jsgui control tree for the change event
        if (mode === 'single') {
            let cells = this.$('grid_cell');
            each(cells, cell => {
                cell.on('change', e_change => {
                    if (e_change.name === 'selected' && e_change.value && is_defined(cell.value)) {
                        this.day = cell.value;
                    }
                });
            });
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
`;

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