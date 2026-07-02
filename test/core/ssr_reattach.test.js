const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');

/**
 * SSR → reattachment e2e tests (the V7/V8 bug-class guard).
 *
 * These tests reproduce what the real client bundle does on page load:
 *   1. SERVER: compose controls in one Page_Context, render to an HTML string.
 *   2. CLIENT: mount that HTML into a fresh DOM, build a NEW Page_Context
 *      (the original instances are gone — exactly like a browser page load),
 *      then run jsgui.pre_activate(ctx) + jsgui.activate(ctx).
 *   3. Assert the reconstructed controls recovered their config from data-*
 *      attributes, restored child refs via data-jsgui-ctrl, and wired their
 *      event handlers.
 *
 * Plain unit tests construct+activate the SAME instance, which silently
 * skips this entire contract — that is how V7/V8 shipped unnoticed.
 */

let registry;
try {
    registry = require('../../controls/controls');
} catch (e) {
    console.warn('controls registry not loadable:', e.message);
}

// Build the type_name → Constructor map the way the client bootstrap does
// (Page_Context.update_Controls lowercases registry keys).
const build_map_Controls = () => {
    const map = {};
    if (jsgui.controls) {
        Object.keys(jsgui.controls).forEach(k => { map[k.toLowerCase()] = jsgui.controls[k]; });
    }
    if (registry) {
        Object.keys(registry).forEach(k => {
            if (typeof registry[k] === 'function') map[k.toLowerCase()] = registry[k];
        });
    }
    return map;
};

// Server render: compose ctrl in a private context, return its HTML.
const server_render = (make_ctrl) => {
    const server_ctx = new jsgui.Page_Context();
    const ctrl = make_ctrl(server_ctx);
    return ctrl.all_html_render();
};

// Client boot: mount html, reconstruct + activate in a FRESH context.
const client_boot = (html) => {
    document.body.innerHTML = html;
    const ctx = new jsgui.Page_Context({ map_Controls: build_map_Controls() });
    jsgui.pre_activate(ctx);
    jsgui.activate(ctx);
    return ctx;
};

const find_ctrl = (ctx, type_prefix) => {
    const id = Object.keys(ctx.map_controls).find(k => k.startsWith(type_prefix));
    return id ? ctx.map_controls[id] : null;
};

const mousedown = (el) => el.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

const cell_by_day = (root_el, day) =>
    [...root_el.querySelectorAll('.row:not(.header) .cell')].find(c => c.textContent.trim() === String(day));

describe('SSR reattachment (isomorphic contract e2e)', () => {
    afterEach(() => {
        cleanup();
    });

    describe('Month_View', () => {
        it('recovers selection_mode and wires range interaction after reattach', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => new registry.Month_View({
                context: ctx, year: 2026, month: 0, selection_mode: 'range'
            }));

            const ctx = client_boot(html);
            const mv = find_ctrl(ctx, 'month_view');
            expect(mv, 'reconstructed Month_View').to.exist;
            // Typed reconstruction, not the generic-Control fallback:
            expect(mv.set_range, 'typed instance with Month_View API').to.be.a('function');
            // Config recovered from data-selection-mode (V7 contract):
            expect(mv.selection_mode).to.equal('range');

            // Wired interaction: click-click picks a range on the REAL DOM.
            const el = mv.dom.el;
            mousedown(cell_by_day(el, 5));
            mousedown(cell_by_day(el, 9));
            expect(mv.range_start).to.equal('2026-01-05');
            expect(mv.range_end).to.equal('2026-01-09');
            expect(cell_by_day(el, 5).classList.contains('range-start')).to.equal(true);
            expect(cell_by_day(el, 7).classList.contains('range-between')).to.equal(true);
            expect(cell_by_day(el, 9).classList.contains('range-end')).to.equal(true);
        });

        it('single mode: DOM click selects a day and raises date-select after reattach', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => new registry.Month_View({
                context: ctx, year: 2026, month: 0, selection_mode: 'single'
            }));

            const ctx = client_boot(html);
            const mv = find_ctrl(ctx, 'month_view');
            let picked = null;
            mv.on('date-select', e => { picked = e; });

            click(cell_by_day(mv.dom.el, 21));
            expect(picked, 'date-select raised from a real DOM click').to.not.equal(null);
            expect(picked.iso).to.equal('2026-01-21');
            expect(mv.day).to.equal(21);
            expect(cell_by_day(mv.dom.el, 21).classList.contains('selected')).to.equal(true);
        });

        it('renders a configured range in SSR output and keeps it after reattach', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => {
                const mv = new registry.Month_View({
                    context: ctx, year: 2026, month: 0, selection_mode: 'range'
                });
                mv.set_range('2026-01-12', '2026-01-15');
                return mv;
            });

            // SSR HTML itself shows the range (isomorphic update_range_highlight):
            expect(html).to.have.string('range-start');
            expect(html).to.have.string('range-between');
            expect(html).to.have.string('range-end');
            expect(html).to.have.string('aria-selected="true"');

            const ctx = client_boot(html);
            const mv = find_ctrl(ctx, 'month_view');
            const el = mv.dom.el;
            expect(cell_by_day(el, 12).classList.contains('range-start')).to.equal(true);
            expect(cell_by_day(el, 15).classList.contains('range-end')).to.equal(true);
        });
    });

    describe('DateTime_Picker (tabbed)', () => {
        it('recovers layout, restores child refs, and switches tabs after reattach', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => new registry.Datetime_Picker({
                context: ctx, layout: 'tabbed', value: '2026-07-02T14:30', show_clock: false
            }));

            const ctx = client_boot(html);
            const dtp = find_ctrl(ctx, 'datetime_picker');
            expect(dtp, 'reconstructed DateTime_Picker').to.exist;

            // V7: layout recovered from data-layout (client spec has no layout).
            expect(dtp._cfg.layout).to.equal('tabbed');

            // V8: child refs restored via data-jsgui-ctrl.
            expect(dtp._month_view, '_month_view ref').to.exist;
            expect(dtp._tab_date, '_tab_date ref').to.exist;
            expect(dtp._tab_time, '_tab_time ref').to.exist;

            // Tab switching actually works on the reattached DOM.
            const mv_el = dtp._month_view.dom.el;
            const time_el = dtp._time_picker.dom.el;
            expect(time_el.style.display, 'time pane starts hidden').to.equal('none');

            click(dtp._tab_time.dom.el);
            expect(time_el.style.display, 'time pane shown').to.not.equal('none');
            expect(mv_el.style.display, 'date pane hidden').to.equal('none');
            expect(dtp._tab_time.dom.el.getAttribute('aria-selected')).to.equal('true');
            expect(dtp._tab_date.dom.el.getAttribute('aria-selected')).to.equal('false');

            click(dtp._tab_date.dom.el);
            expect(mv_el.style.display).to.not.equal('none');
            expect(dtp._tab_date.dom.el.getAttribute('aria-selected')).to.equal('true');
        });
    });

    describe('Month_View month paging', () => {
        it('PageDown/PageUp pages months after reattach; Shift pages years', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => new registry.Month_View({
                context: ctx, year: 2026, month: 0, selection_mode: 'single'
            }));

            const ctx = client_boot(html);
            const mv = find_ctrl(ctx, 'month_view');
            const el = mv.dom.el;
            let changes = [];
            mv.on('month-change', e => changes.push(e));

            const page = (key, shiftKey) => el.dispatchEvent(new window.KeyboardEvent('keydown', {
                key, shiftKey: !!shiftKey, bubbles: true, cancelable: true
            }));

            page('PageDown');                       // Jan → Feb 2026
            expect(mv.month).to.equal(1);
            expect(mv.year).to.equal(2026);
            // The DOM grid actually re-rendered: Feb 2026 has 28 days.
            const day_texts = [...el.querySelectorAll('.row:not(.header) .cell span')]
                .map(s => s.textContent.trim()).filter(t => /^\d+$/.test(t)).map(Number);
            expect(Math.max(...day_texts)).to.equal(28);
            // Feb 1 2026 is a Sunday → column 7 in Monday-first layout: 6 leading blanks.
            expect(el.getAttribute('data-month')).to.equal('1');

            page('PageUp');                          // Feb → Jan
            expect(mv.month).to.equal(0);

            page('PageDown', true);                  // Jan 2026 → Jan 2027 (Shift)
            expect(mv.year).to.equal(2027);
            page('PageUp', true);                    // back to 2026
            expect(mv.year).to.equal(2026);

            expect(changes).to.have.lengthOf(4);
            expect(changes[0].month_name).to.equal('February');

            // Maps rebuilt: clicking day 21 selects 2026-01-21, not a stale month.
            let picked = null;
            mv.on('date-select', e => { picked = e; });
            click(cell_by_day(el, 21));
            expect(picked.iso).to.equal('2026-01-21');
        });

        it('keeps an absolute range highlighted when paging back to its month', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => {
                const mv = new registry.Month_View({
                    context: ctx, year: 2026, month: 0, selection_mode: 'range'
                });
                mv.set_range('2026-01-12', '2026-01-15');
                return mv;
            });

            const ctx = client_boot(html);
            const mv = find_ctrl(ctx, 'month_view');
            mv.page_month(1);   // Feb: range not visible
            expect(mv.dom.el.querySelectorAll('.range-start, .range-end').length).to.equal(0);
            mv.page_month(-1);  // back to Jan: range re-appears
            expect(cell_by_day(mv.dom.el, 12).classList.contains('range-start')).to.equal(true);
            expect(cell_by_day(mv.dom.el, 15).classList.contains('range-end')).to.equal(true);
        });
    });

    describe('Time_Picker config persistence', () => {
        it('recovers step_minutes/use_24h after reattach (keyboard steps correctly)', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => new registry.Time_Picker({
                context: ctx, value: '14:30', step_minutes: 5, use_24h: false,
                min_time: '09:00', max_time: '18:00', show_clock: false
            }));

            const ctx = client_boot(html);
            const tp = find_ctrl(ctx, 'time_picker');
            expect(tp, 'reconstructed Time_Picker').to.exist;

            // Config recovered from data-cfg (defaults are 1 / true / null).
            expect(tp._cfg.step_minutes).to.equal(5);
            expect(tp._cfg.use_24h).to.equal(false);
            expect(tp._cfg.min_time).to.equal('09:00');
            expect(tp._cfg.max_time).to.equal('18:00');

            // The key behavioral assertion: ArrowUp steps by the configured 5.
            expect(tp.minutes).to.equal(30);
            tp.dom.el.dispatchEvent(new window.KeyboardEvent('keydown', {
                key: 'ArrowUp', bubbles: true, cancelable: true
            }));
            expect(tp.minutes, 'ArrowUp advanced by step_minutes').to.equal(35);
        });
    });

    describe('Time_Picker clock touch', () => {
        it('touchstart on the clock face sets the time after reattach', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => new registry.Time_Picker({
                context: ctx, value: '14:30', show_clock: true, clock_size: 200
            }));

            const ctx = client_boot(html);
            const tp = find_ctrl(ctx, 'time_picker');
            const canvas = tp._clock_canvas && tp._clock_canvas.dom.el;
            expect(canvas, 'clock canvas wired').to.exist;

            // jsdom rects are all zeros, so the face center is (100, 100) for
            // clock_size 200. A touch at (100, 60) is 40px above center —
            // inside the inner (hour) zone, pointing at 12.
            const ev = new window.Event('touchstart', { bubbles: true, cancelable: true });
            ev.touches = [{ clientX: 100, clientY: 60 }];
            canvas.dispatchEvent(ev);
            // Was 14 (afternoon): touching "12" keeps the PM half → noon.
            expect(tp.hours, 'touch at 12 o\'clock sets noon').to.equal(12);

            // Outer zone at 3 o'clock: (170, 100) → minutes 15.
            const ev2 = new window.Event('touchmove', { bubbles: true, cancelable: true });
            ev2.touches = [{ clientX: 170, clientY: 100 }];
            canvas.dispatchEvent(ev2);
            expect(tp.minutes, 'touch-drag to 3 o\'clock sets minutes 15').to.equal(15);
        });
    });

    describe('DateTime_Picker config persistence', () => {
        it('recovers use_24h/step_minutes via data-cfg after reattach', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => new registry.Datetime_Picker({
                context: ctx, value: '2026-07-02T14:30', use_24h: false,
                step_minutes: 15, show_clock: false
            }));

            const ctx = client_boot(html);
            const dtp = find_ctrl(ctx, 'datetime_picker');
            expect(dtp, 'reconstructed DateTime_Picker').to.exist;
            expect(dtp._cfg.use_24h).to.equal(false);
            expect(dtp._cfg.step_minutes).to.equal(15);
            // data-layout stays authoritative for layout.
            expect(dtp._cfg.layout).to.equal('stacked');
        });
    });

    describe('Date_Range_Picker (dual)', () => {
        it('recovers mode/dates, shows input values, and opens the popup after reattach', function () {
            if (!registry) this.skip();
            const html = server_render(ctx => new registry.Date_Range_Picker({
                context: ctx, mode: 'dual', start: '2026-07-06', end: '2026-07-17'
            }));

            // SSR: input values present in the HTML (V2).
            expect(html).to.have.string('value="2026-07-06"');
            expect(html).to.have.string('value="2026-07-17"');

            const ctx = client_boot(html);
            const drp = find_ctrl(ctx, 'date_range_picker');
            expect(drp, 'reconstructed Date_Range_Picker').to.exist;

            // Config recovered (V7).
            expect(drp.mode).to.equal('dual');
            expect(drp.start_date).to.equal('2026-07-06');
            expect(drp.end_date).to.equal('2026-07-17');

            // Child refs restored (V8).
            expect(drp.input_start, 'input_start ref').to.exist;
            expect(drp.popup, 'popup ref').to.exist;
            expect(drp.mv_start, 'mv_start ref').to.exist;
            expect(drp.mv_end, 'mv_end ref').to.exist;

            // Popup opens from an input click and contains both calendars
            // with the configured range highlighted.
            click(drp.input_start.dom.el);
            const popup_el = drp.popup.dom.el;
            expect(popup_el.classList.contains('hidden'), 'popup visible').to.equal(false);
            expect(popup_el.querySelectorAll('.month-view').length).to.equal(2);
            expect(popup_el.querySelectorAll('.range-start, .range-between, .range-end').length)
                .to.be.greaterThan(0);
        });
    });
});
