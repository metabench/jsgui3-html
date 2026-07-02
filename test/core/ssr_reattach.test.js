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
