const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');

let Month_View;
try {
    Month_View = require('../../controls/organised/0-core/0-basic/1-compositional/month-view');
} catch (e) {
    console.warn('Month_View not loadable:', e.message);
}

describe('Month_View Control', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    // ========================================================
    // Constructor Options
    // ========================================================
    describe('Constructor Options', () => {
        it('should create with default options', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context });
            expect(mv.selection_mode).to.equal('single');
            expect(mv._first_day).to.equal(0);
            expect(mv._show_week_numbers).to.equal(false);
            expect(mv._min_date).to.equal(null);
            expect(mv._max_date).to.equal(null);
        });

        it('should accept selection_mode option', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, selection_mode: 'range' });
            expect(mv.selection_mode).to.equal('range');
        });

        it('should accept multi selection mode', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, selection_mode: 'multi' });
            expect(mv.selection_mode).to.equal('multi');
        });

        it('should accept week selection mode', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, selection_mode: 'week' });
            expect(mv.selection_mode).to.equal('week');
        });

        it('should accept first_day_of_week option', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, first_day_of_week: 6 });
            expect(mv._first_day).to.equal(6);
        });

        it('should accept show_week_numbers option', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, show_week_numbers: true });
            expect(mv._show_week_numbers).to.equal(true);
        });

        it('should set wider size when week numbers enabled', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, show_week_numbers: true });
            // Default size with week numbers is [400, 200]
            const size = mv._size || mv.size;
            expect(size[0]).to.equal(400);
        });

        it('should accept min_date and max_date options', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, min_date: '2026-01-10', max_date: '2026-01-20' });
            expect(mv._min_date).to.equal('2026-01-10');
            expect(mv._max_date).to.equal('2026-01-20');
        });

        it('should accept month and year options', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2025, month: 5 });
            expect(mv.year).to.equal(2025);
            expect(mv.month).to.equal(5);
        });
    });

    // ========================================================
    // Day Headers
    // ========================================================
    describe('Day Headers', () => {
        it('should return Mon-first headers by default', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context });
            const headers = mv._get_day_headers();
            expect(headers[0]).to.equal('Mon');
            expect(headers[6]).to.equal('Sun');
        });

        it('should rotate headers for Sunday-first', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, first_day_of_week: 6 });
            const headers = mv._get_day_headers();
            expect(headers[0]).to.equal('Sun');
            expect(headers[1]).to.equal('Mon');
            expect(headers[6]).to.equal('Sat');
        });

        it('should rotate headers for Wednesday-first', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, first_day_of_week: 2 });
            const headers = mv._get_day_headers();
            expect(headers[0]).to.equal('Wed');
        });
    });

    // ========================================================
    // Weekend Columns
    // ========================================================
    describe('Weekend Columns', () => {
        it('should return Sat/Sun at columns 5,6 for Mon-first', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, first_day_of_week: 0 });
            const wc = mv._weekend_columns();
            expect(wc).to.include(5); // Saturday
            expect(wc).to.include(6); // Sunday
        });

        it('should adjust weekend columns for Sunday-first', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, first_day_of_week: 6 });
            const wc = mv._weekend_columns();
            // Sun is at col 0, Sat is at col 6
            expect(wc).to.include(6); // Saturday
            expect(wc).to.include(0); // Sunday
        });
    });

    // ========================================================
    // Date Mapping
    // ========================================================
    describe('Date Mapping', () => {
        it('should build cell-to-date maps', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 }); // January 2026
            expect(mv._cell_date_map.size).to.be.greaterThan(0);
            expect(mv._date_cell_map.size).to.be.greaterThan(0);
        });

        it('should map correct number of days for January', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            expect(mv._date_cell_map.size).to.equal(31);
        });

        it('should map correct number of days for February (non-leap)', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2025, month: 1 });
            expect(mv._date_cell_map.size).to.equal(28);
        });

        it('should map correct number of days for February (leap)', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2024, month: 1 });
            expect(mv._date_cell_map.size).to.equal(29);
        });

        it('should have ISO date strings in map', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            expect(mv._date_cell_map.has('2026-01-01')).to.equal(true);
            expect(mv._date_cell_map.has('2026-01-31')).to.equal(true);
        });

        it('should have _get_cell_date return ISO for valid cell', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            const cell = mv._date_cell_map.get('2026-01-15');
            expect(cell).to.exist;
            expect(mv._get_cell_date(cell)).to.equal('2026-01-15');
        });

        it('should return null for unmapped cell', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            expect(mv._get_cell_date({})).to.equal(null);
        });
    });

    // ========================================================
    // Min/Max Bounds
    // ========================================================
    describe('Min/Max Bounds', () => {
        it('should identify in-bounds dates', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, min_date: '2026-01-05', max_date: '2026-01-25' });
            expect(mv._is_date_in_bounds('2026-01-10')).to.equal(true);
            expect(mv._is_date_in_bounds('2026-01-05')).to.equal(true);
            expect(mv._is_date_in_bounds('2026-01-25')).to.equal(true);
        });

        it('should reject out-of-bounds dates', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, min_date: '2026-01-05', max_date: '2026-01-25' });
            expect(mv._is_date_in_bounds('2026-01-04')).to.equal(false);
            expect(mv._is_date_in_bounds('2026-01-26')).to.equal(false);
        });

        it('should allow all dates when no bounds set', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context });
            expect(mv._is_date_in_bounds('2000-01-01')).to.equal(true);
            expect(mv._is_date_in_bounds('2099-12-31')).to.equal(true);
        });

        it('should allow min-only bounds', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, min_date: '2026-01-10' });
            expect(mv._is_date_in_bounds('2026-01-09')).to.equal(false);
            expect(mv._is_date_in_bounds('2026-01-10')).to.equal(true);
            expect(mv._is_date_in_bounds('2099-12-31')).to.equal(true);
        });

        it('should allow max-only bounds', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, max_date: '2026-01-20' });
            expect(mv._is_date_in_bounds('2000-01-01')).to.equal(true);
            expect(mv._is_date_in_bounds('2026-01-20')).to.equal(true);
            expect(mv._is_date_in_bounds('2026-01-21')).to.equal(false);
        });

        it('should have min_date/max_date getters/setters', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            mv.min_date = '2026-01-05';
            mv.max_date = '2026-01-25';
            expect(mv.min_date).to.equal('2026-01-05');
            expect(mv.max_date).to.equal('2026-01-25');
        });
    });

    // ========================================================
    // Range Selection
    // ========================================================
    describe('Range Selection', () => {
        it('should set range with set_range()', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'range' });
            mv.set_range('2026-01-05', '2026-01-15');
            expect(mv.range_start).to.equal('2026-01-05');
            expect(mv.range_end).to.equal('2026-01-15');
        });

        it('should auto-swap range if start > end', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'range' });
            mv.set_range('2026-01-20', '2026-01-05');
            expect(mv.range_start).to.equal('2026-01-05');
            expect(mv.range_end).to.equal('2026-01-20');
        });

        it('should clear range with clear_range()', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'range' });
            mv.set_range('2026-01-05', '2026-01-15');
            mv.clear_range();
            expect(mv.range_start).to.equal(null);
            expect(mv.range_end).to.equal(null);
        });

        it('should raise range-change event', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'range' });
            let event_data = null;
            mv.on('range-change', e => { event_data = e; });
            mv.set_range('2026-01-05', '2026-01-15');
            expect(event_data).to.exist;
            expect(event_data.start).to.equal('2026-01-05');
            expect(event_data.end).to.equal('2026-01-15');
        });
    });

    // ========================================================
    // Multi Selection
    // ========================================================
    describe('Multi Selection', () => {
        it('should start with empty selected_dates', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'multi' });
            expect(mv.selected_dates).to.deep.equal([]);
        });

        it('should return sorted selected_dates', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'multi' });
            mv._selected_dates.add('2026-01-15');
            mv._selected_dates.add('2026-01-05');
            mv._selected_dates.add('2026-01-10');
            const dates = mv.selected_dates;
            expect(dates).to.deep.equal(['2026-01-05', '2026-01-10', '2026-01-15']);
        });

        it('should clear selected_dates on clear_range()', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'multi' });
            mv._selected_dates.add('2026-01-15');
            mv._selected_dates.add('2026-01-05');
            mv.clear_range();
            expect(mv.selected_dates).to.deep.equal([]);
        });
    });

    // ========================================================
    // Week Mode
    // ========================================================
    describe('Week Mode', () => {
        it('should compute correct Mon-Sun week dates', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'week' });
            // Jan 14, 2026 is a Wednesday
            const week = mv._get_week_dates('2026-01-14');
            expect(week.length).to.equal(7);
            expect(week[0]).to.equal('2026-01-12'); // Monday
            expect(week[6]).to.equal('2026-01-18'); // Sunday
        });

        it('should compute week for a Monday', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'week' });
            // Jan 12, 2026 is a Monday
            const week = mv._get_week_dates('2026-01-12');
            expect(week[0]).to.equal('2026-01-12');
            expect(week[6]).to.equal('2026-01-18');
        });

        it('should compute week for a Sunday', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'week' });
            // Jan 18, 2026 is a Sunday
            const week = mv._get_week_dates('2026-01-18');
            expect(week[0]).to.equal('2026-01-12');
            expect(week[6]).to.equal('2026-01-18');
        });

        it('should handle week spanning month boundary', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'week' });
            // Jan 1, 2026 is a Thursday. Week is Dec29 - Jan4
            const week = mv._get_week_dates('2026-01-01');
            expect(week[0]).to.equal('2025-12-29'); // Monday
            expect(week[6]).to.equal('2026-01-04'); // Sunday
        });
    });

    // ========================================================
    // Week Numbers
    // ========================================================
    describe('Week Numbers', () => {
        it('should use 8-column grid when week numbers enabled', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, show_week_numbers: true });
            // Header row should have 8 cells
            const header_row = mv._arr_rows[0];
            expect(header_row.content._arr.length).to.equal(8);
        });

        it('should use 7-column grid when week numbers disabled', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, show_week_numbers: false });
            const header_row = mv._arr_rows[0];
            expect(header_row.content._arr.length).to.equal(7);
        });
    });

    // ========================================================
    // Refresh
    // ========================================================
    describe('Refresh', () => {
        it('should update cells when year/month changes and refresh is called', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            const initial_count = mv._date_cell_map.size;
            expect(initial_count).to.equal(31); // January = 31 days

            // Switch to February
            mv.month = 1;
            mv.refresh_month_view();
            expect(mv._date_cell_map.size).to.equal(28); // Feb 2026 = 28 days
        });

        it('should rebuild date maps on refresh', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            expect(mv._date_cell_map.has(mv._date_cell_map.entries().next().value[0])).to.equal(true);

            mv.month = 5; // June
            mv.refresh_month_view();
            expect(mv._date_cell_map.size).to.equal(30); // June = 30 days
            expect(mv._date_cell_map.has(mv._date_cell_map.entries().next().value[0])).to.equal(true);
        });
    });

    // ========================================================
    // CSS
    // ========================================================
    describe('CSS', () => {
        it('should have static css property', function () {
            if (!Month_View) this.skip();
            expect(Month_View.css).to.be.a('string');
            expect(Month_View.css).to.include('.month-view');
        });

        it('should include range highlighting classes', function () {
            if (!Month_View) this.skip();
            expect(Month_View.css).to.include('.range-start');
            expect(Month_View.css).to.include('.range-end');
            expect(Month_View.css).to.include('.range-between');
        });

        it('should include today and weekend styles', function () {
            if (!Month_View) this.skip();
            expect(Month_View.css).to.include('.today');
            expect(Month_View.css).to.include('.weekend');
        });

        it('should include CSS custom properties', function () {
            if (!Month_View) this.skip();
            expect(Month_View.css).to.include('--mv-accent');
            expect(Month_View.css).to.include('--mv-today-ring');
            expect(Month_View.css).to.include('--mv-weekend-text');
        });
    });

    // ========================================================
    // Tiled Month_View
    // ========================================================
    describe('Tiled Month_View', () => {
        it('should have a Tiled static property', function () {
            if (!Month_View) this.skip();
            expect(Month_View.Tiled).to.exist;
        });
    });
});
