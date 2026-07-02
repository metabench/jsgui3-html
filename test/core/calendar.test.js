const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');

let Calendar, registry;
try { Calendar = require('../../controls/organised/0-core/0-basic/1-compositional/Calendar'); } catch (e) { console.warn(e.message); }
try { registry = require('../../controls/controls'); } catch (e) { console.warn(e.message); }

const EVENTS = [
    { date: '2026-07-06', label: 'Standup', color: '#16a34a' },
    { date: '2026-07-06', label: 'Review', color: '#dc2626' },
    { date: '2026-07-17', label: 'Release' }
];

const mount = (ctrl) => {
    const html = ctrl.all_html_render();
    document.body.innerHTML = html;
    ctrl.dom.el = document.body.firstElementChild;
    return ctrl.dom.el;
};

describe('Calendar (event layer)', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('composes a caption, Month_View and event list', function () {
        if (!Calendar) this.skip();
        const cal = new Calendar({ context, year: 2026, month: 6, events: EVENTS });
        expect(cal._caption).to.exist;
        expect(cal._month_view).to.exist;
        expect(cal._event_list).to.exist;
        const html = cal.all_html_render();
        expect(html).to.have.string('July 2026');
        expect(html).to.have.string('month-view');
    });

    it('renders event badges into the SSR HTML', function () {
        if (!Calendar) this.skip();
        const cal = new Calendar({ context, year: 2026, month: 6, events: EVENTS });
        const html = cal.all_html_render();
        expect(html).to.have.string('mv-event-dots');
        expect(html).to.have.string('has-events');
        // Two dots on the 6th (green + red), one on the 17th (default color).
        expect(html).to.have.string('background-color:#16a34a');
        expect(html).to.have.string('background-color:#dc2626');
        expect(html).to.have.string('aria-label="2 events"');
        expect(html).to.have.string('aria-label="1 event"');
    });

    it('persists events as a URI-encoded data attribute', function () {
        if (!Calendar) this.skip();
        const cal = new Calendar({ context, year: 2026, month: 6, events: EVENTS });
        const raw = cal.dom.attributes['data-events'];
        // Encoded — raw JSON quotes would break the (unescaped) attribute rendering.
        expect(raw).to.not.have.string('"');
        const stored = JSON.parse(decodeURIComponent(raw));
        expect(stored).to.have.lengthOf(3);
        expect(stored[0].label).to.equal('Standup');
    });

    it('events_on() returns events for a date', function () {
        if (!Calendar) this.skip();
        const cal = new Calendar({ context, year: 2026, month: 6, events: EVENTS });
        expect(cal.events_on('2026-07-06')).to.have.lengthOf(2);
        expect(cal.events_on('2026-07-17')).to.have.lengthOf(1);
        expect(cal.events_on('2026-07-01')).to.have.lengthOf(0);
    });

    it('add_event / remove_event mutate and re-render badges in the DOM', function () {
        if (!Calendar) this.skip();
        const cal = new Calendar({ context, year: 2026, month: 6, events: EVENTS.slice(0, 1) });
        const el = mount(cal);
        // Connect the embedded Month_View to its DOM for badge rendering.
        cal._month_view.dom.el = el.querySelector('.month-view');

        let change_events = 0;
        cal.on('events-change', () => change_events++);

        cal.add_event({ date: '2026-07-20', label: 'Demo', color: '#f59e0b' });
        expect(cal.events).to.have.lengthOf(2);
        expect(change_events).to.equal(1);
        const cell20 = [...el.querySelectorAll('.cell')].find(c => c.textContent.trim().startsWith('20'));
        expect(cell20.querySelector('.mv-event-dots'), 'badge on the 20th').to.exist;

        cal.remove_event('2026-07-20');
        expect(cal.events).to.have.lengthOf(1);
        expect(cell20.querySelector('.mv-event-dots'), 'badge removed').to.not.exist;
        // data-events attribute stays truthful
        expect(JSON.parse(decodeURIComponent(el.getAttribute('data-events')))).to.have.lengthOf(1);
    });

    it('caps visible dots and shows an overflow count', function () {
        if (!Calendar) this.skip();
        const many = [1, 2, 3, 4, 5].map(i => ({ date: '2026-07-10', label: `E${i}` }));
        const cal = new Calendar({ context, year: 2026, month: 6, events: many });
        const html = cal.all_html_render();
        expect(html).to.have.string('mv-event-more');
        expect(html).to.have.string('+2');
    });

    it('SSR reattachment: recovers events and wires date-select → event list', function () {
        if (!Calendar || !registry) this.skip();
        // SERVER phase
        const server_ctx = new jsgui.Page_Context();
        const server_cal = new Calendar({ context: server_ctx, year: 2026, month: 6, events: EVENTS });
        const html = server_cal.all_html_render();

        // CLIENT phase — fresh context, reconstruct via the real bootstrap.
        document.body.innerHTML = html;
        const map = {};
        Object.keys(jsgui.controls).forEach(k => { map[k.toLowerCase()] = jsgui.controls[k]; });
        Object.keys(registry).forEach(k => { if (typeof registry[k] === 'function') map[k.toLowerCase()] = registry[k]; });
        const ctx = new jsgui.Page_Context({ map_Controls: map });
        jsgui.pre_activate(ctx);
        jsgui.activate(ctx);

        const id = Object.keys(ctx.map_controls).find(k => k.startsWith('calendar'));
        const cal = ctx.map_controls[id];
        expect(cal, 'reconstructed Calendar').to.exist;
        expect(cal.events, 'events recovered from data-events').to.have.lengthOf(3);
        expect(cal._month_view, '_month_view ref restored').to.exist;

        // Selecting a day fills the event list.
        let selected = null;
        cal.on('date-select', e => { selected = e; });
        cal._month_view.raise('date-select', { iso: '2026-07-06' });
        expect(selected.events).to.have.lengthOf(2);
        const list_el = cal._event_list.dom.el;
        expect(list_el.textContent).to.have.string('Standup');
        expect(list_el.textContent).to.have.string('Review');
    });
});
