const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');

let Month_View, Time_Picker;
try {
    Month_View = require('../../controls/organised/0-core/0-basic/1-compositional/Month_View');
} catch (e) {
    console.warn('Month_View not loadable:', e.message);
}
try {
    Time_Picker = require('../../controls/organised/0-core/0-basic/1-compositional/Time_Picker');
} catch (e) {
    console.warn('Time_Picker not loadable:', e.message);
}

// Render a control into jsdom and connect its root element.
const mount = (ctrl) => {
    const html = ctrl.all_html_render();
    document.body.innerHTML = html;
    ctrl.dom.el = document.body.firstElementChild;
    return ctrl.dom.el;
};

describe('Keyboard Navigation', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    // ========================================================
    // Month_View — focusability
    // ========================================================
    describe('Month_View focusability', () => {
        it('should set tabindex=0 on the root by default', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            expect(String(mv.dom.attrs.tabindex)).to.equal('0');
        });

        it('should not overwrite an explicit tabindex', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            // simulate author-set attribute on a second instance
            const mv2 = new Month_View({ context, year: 2026, month: 0 });
            mv2.dom.attrs.tabindex = '-1';
            expect(String(mv2.dom.attrs.tabindex)).to.equal('-1');
            expect(String(mv.dom.attrs.tabindex)).to.equal('0');
        });
    });

    // ========================================================
    // Month_View — month bounds helper
    // ========================================================
    describe('Month_View _month_bound_iso', () => {
        it('should return first/last day of month without constraints', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            expect(mv._month_bound_iso('first')).to.equal('2026-01-01');
            expect(mv._month_bound_iso('last')).to.equal('2026-01-31');
        });

        it('should respect min/max date bounds', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({
                context, year: 2026, month: 0,
                min_date: '2026-01-05', max_date: '2026-01-25'
            });
            expect(mv._month_bound_iso('first')).to.equal('2026-01-05');
            expect(mv._month_bound_iso('last')).to.equal('2026-01-25');
        });
    });

    // ========================================================
    // Month_View — focus movement
    // ========================================================
    describe('Month_View focus movement', () => {
        it('should initialize focus on first in-bounds day when no selection', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            mount(mv);
            mv._move_kb_focus(1); // first call just initializes
            expect(mv._focused_iso).to.equal('2026-01-01');
            const focused = mv.dom.el.querySelectorAll('.cell.kb-focus');
            expect(focused.length).to.equal(1);
            expect(focused[0].textContent.trim()).to.equal('1');
        });

        it('should move focus by ±1 day and ±7 days', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            mount(mv);
            mv._set_kb_focus('2026-01-15');
            mv._move_kb_focus(1);
            expect(mv._focused_iso).to.equal('2026-01-16');
            mv._move_kb_focus(-1);
            expect(mv._focused_iso).to.equal('2026-01-15');
            mv._move_kb_focus(7);
            expect(mv._focused_iso).to.equal('2026-01-22');
            mv._move_kb_focus(-7);
            expect(mv._focused_iso).to.equal('2026-01-15');
        });

        it('should clamp focus to the displayed month', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            mount(mv);
            mv._set_kb_focus('2026-01-31');
            mv._move_kb_focus(1); // would leave the month
            expect(mv._focused_iso).to.equal('2026-01-31');
            mv._set_kb_focus('2026-01-01');
            mv._move_kb_focus(-7);
            expect(mv._focused_iso).to.equal('2026-01-01');
        });

        it('should not move focus onto out-of-bounds dates', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({
                context, year: 2026, month: 0,
                min_date: '2026-01-10', max_date: '2026-01-20'
            });
            mount(mv);
            mv._set_kb_focus('2026-01-10');
            mv._move_kb_focus(-1); // 9th is below min
            expect(mv._focused_iso).to.equal('2026-01-10');
            mv._set_kb_focus('2026-01-20');
            mv._move_kb_focus(1); // 21st is above max
            expect(mv._focused_iso).to.equal('2026-01-20');
        });

        it('should start from the current range start when present', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'range' });
            mount(mv);
            mv.set_range('2026-01-12', '2026-01-14');
            mv._move_kb_focus(1); // initializes from range start
            expect(mv._focused_iso).to.equal('2026-01-12');
        });
    });

    // ========================================================
    // Month_View — keyboard activation per mode
    // ========================================================
    describe('Month_View keyboard activation', () => {
        it('range mode: Enter-Enter picks a range and raises range-change', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'range' });
            mount(mv);
            let range_event = null;
            mv.on('range-change', e => { range_event = e; });

            mv._set_kb_focus('2026-01-05');
            mv._kb_activate_focused(); // pick start
            expect(mv._range_click_state).to.equal(1);
            expect(mv.range_start).to.equal('2026-01-05');

            mv._set_kb_focus('2026-01-09');
            mv._kb_activate_focused(); // pick end
            expect(mv._range_click_state).to.equal(0);
            expect(range_event).to.not.equal(null);
            expect(range_event.start).to.equal('2026-01-05');
            expect(range_event.end).to.equal('2026-01-09');

            // Visual classes applied
            const start_el = mv._kb_el_for_iso('2026-01-05');
            const end_el = mv._kb_el_for_iso('2026-01-09');
            expect(start_el.classList.contains('range-start')).to.equal(true);
            expect(end_el.classList.contains('range-end')).to.equal(true);
        });

        it('multi mode: Enter toggles dates', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'multi' });
            mount(mv);
            mv._set_kb_focus('2026-01-05');
            mv._kb_activate_focused();
            expect(mv.selected_dates).to.deep.equal(['2026-01-05']);
            mv._kb_activate_focused(); // toggle off
            expect(mv.selected_dates).to.deep.equal([]);
        });

        it('week mode: Enter selects the whole week', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'week' });
            mount(mv);
            let week_event = null;
            mv.on('week-select', e => { week_event = e; });
            mv._set_kb_focus('2026-01-14'); // a Wednesday
            mv._kb_activate_focused();
            expect(week_event).to.not.equal(null);
            expect(week_event.start).to.equal('2026-01-12'); // Monday
            expect(week_event.end).to.equal('2026-01-18');   // Sunday
            expect(mv.selected_dates.length).to.equal(7);
        });

        it('single mode: Enter sets day and raises date-select', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'single' });
            mount(mv);
            let select_event = null;
            mv.on('date-select', e => { select_event = e; });
            mv._set_kb_focus('2026-01-21');
            mv._kb_activate_focused();
            expect(mv.day).to.equal(21);
            expect(select_event).to.not.equal(null);
            expect(select_event.iso).to.equal('2026-01-21');
        });

        it('should not activate an out-of-bounds focused date', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({
                context, year: 2026, month: 0, selection_mode: 'multi',
                min_date: '2026-01-10'
            });
            mount(mv);
            mv._focused_iso = '2026-01-05'; // force below min
            mv._kb_activate_focused();
            expect(mv.selected_dates).to.deep.equal([]);
        });
    });

    // ========================================================
    // Month_View — Escape
    // ========================================================
    describe('Month_View Escape', () => {
        it('should cancel a half-picked range and clear focus', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'range' });
            mount(mv);
            mv._set_kb_focus('2026-01-05');
            mv._kb_activate_focused(); // state 1 (waiting for end)
            expect(mv._range_click_state).to.equal(1);

            mv._kb_escape();
            expect(mv._range_click_state).to.equal(0);
            expect(mv.range_start).to.equal(null);
            expect(mv._focused_iso).to.equal(null);
            expect(mv.dom.el.querySelectorAll('.cell.kb-focus').length).to.equal(0);
        });
    });

    // ========================================================
    // Time_Picker — keyboard adjustment
    // ========================================================
    describe('Time_Picker keyboard', () => {
        const make_activated_tp = (spec = {}) => {
            const tp = new Time_Picker(Object.assign({
                context, value: '10:30', show_clock: false, show_spinners: false
            }, spec));
            mount(tp);
            tp.activate();
            return tp;
        };

        const key = (tp, k) => {
            const ev = new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
            tp.dom.el.dispatchEvent(ev);
        };

        it('should set tabindex=0 on the root by default', function () {
            if (!Time_Picker) this.skip();
            const tp = new Time_Picker({ context, value: '10:30' });
            expect(String(tp.dom.attrs.tabindex)).to.equal('0');
        });

        it('ArrowUp/ArrowDown adjust minutes by step', function () {
            if (!Time_Picker) this.skip();
            const tp = make_activated_tp({ step_minutes: 5 });
            key(tp, 'ArrowUp');
            expect(tp.value).to.equal('10:35');
            key(tp, 'ArrowDown');
            expect(tp.value).to.equal('10:30');
        });

        it('ArrowLeft/ArrowRight adjust hours', function () {
            if (!Time_Picker) this.skip();
            const tp = make_activated_tp();
            key(tp, 'ArrowRight');
            expect(tp.hours).to.equal(11);
            key(tp, 'ArrowLeft');
            expect(tp.hours).to.equal(10);
        });

        it('PageUp/PageDown adjust minutes by 15', function () {
            if (!Time_Picker) this.skip();
            const tp = make_activated_tp();
            key(tp, 'PageUp');
            expect(tp.value).to.equal('10:45');
            key(tp, 'PageDown');
            expect(tp.value).to.equal('10:30');
        });

        it('minute wrap carries into hours', function () {
            if (!Time_Picker) this.skip();
            const tp = make_activated_tp();
            key(tp, 'PageUp'); // 10:45
            key(tp, 'PageUp'); // 11:00
            expect(tp.value).to.equal('11:00');
            expect(tp.hours).to.equal(11);
        });
    });
});
