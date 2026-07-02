const { expect } = require('chai');

let Month_View, Time_Picker, DateTime_Picker, Date_Range_Picker, Popup, a11y;
try { Month_View = require('../../controls/organised/0-core/0-basic/1-compositional/Month_View'); } catch (e) { console.warn(e.message); }
try { Time_Picker = require('../../controls/organised/0-core/0-basic/1-compositional/Time_Picker'); } catch (e) { console.warn(e.message); }
try { DateTime_Picker = require('../../controls/organised/0-core/0-basic/1-compositional/Datetime_Picker'); } catch (e) { console.warn(e.message); }
try { Date_Range_Picker = require('../../controls/organised/0-core/0-basic/_complex_date-range-picker'); } catch (e) { console.warn(e.message); }
try { Popup = require('../../controls/organised/0-core/1-advanced/Popup'); } catch (e) { console.warn(e.message); }
try { a11y = require('../../control_mixins/a11y'); } catch (e) { console.warn(e.message); }

describe('Date Controls ARIA', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('a11y mixin helpers', () => {
        it('apply_grid_aria sets role and label', function () {
            if (!a11y || !Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            // compose already applied it; verify the outcome
            expect(mv.dom.attributes.role).to.equal('grid');
            expect(mv.dom.attributes['aria-label']).to.equal('January 2026');
        });

        it('apply_spinbutton_aria sets role and range attributes', function () {
            if (!a11y) this.skip();
            const jsgui = require('../../html-core/html-core');
            const ctrl = new jsgui.Control({ context, tag_name: 'span' });
            a11y.apply_spinbutton_aria(ctrl, { label: 'minutes', min: 0, max: 59, now: 30 });
            expect(ctrl.dom.attributes.role).to.equal('spinbutton');
            expect(ctrl.dom.attributes['aria-valuemin']).to.equal('0');
            expect(ctrl.dom.attributes['aria-valuemax']).to.equal('59');
            expect(ctrl.dom.attributes['aria-valuenow']).to.equal('30');
        });

        it('apply_dialog_aria sets dialog semantics', function () {
            if (!a11y) this.skip();
            const jsgui = require('../../html-core/html-core');
            const ctrl = new jsgui.Control({ context });
            a11y.apply_dialog_aria(ctrl, { label: 'Pick a date' });
            expect(ctrl.dom.attributes.role).to.equal('dialog');
            expect(ctrl.dom.attributes['aria-modal']).to.equal('false');
            expect(ctrl.dom.attributes['aria-label']).to.equal('Pick a date');
        });
    });

    describe('Month_View grid semantics', () => {
        it('root is a labelled grid with localized label', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 6, locale: 'fr' });
            expect(mv.dom.attributes.role).to.equal('grid');
            expect(mv.dom.attributes['aria-label'].toLowerCase()).to.have.string('juillet');
        });

        it('rows and cells carry row/columnheader/gridcell roles', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0 });
            const html = mv.all_html_render();
            expect(html).to.have.string('role="row"');
            expect(html).to.have.string('role="columnheader"');
            expect(html).to.have.string('role="gridcell"');
        });

        it('range selection marks aria-selected in SSR output', function () {
            if (!Month_View) this.skip();
            const mv = new Month_View({ context, year: 2026, month: 0, selection_mode: 'range' });
            mv.set_range('2026-01-05', '2026-01-07');
            const html = mv.all_html_render();
            expect(html).to.have.string('aria-selected="true"');
        });
    });

    describe('Time_Picker semantics', () => {
        it('root is a labelled group, display is aria-live', function () {
            if (!Time_Picker) this.skip();
            const tp = new Time_Picker({ context, value: '14:30' });
            expect(tp.dom.attributes.role).to.equal('group');
            expect(tp.dom.attributes['aria-label']).to.have.string('14:30');
            const html = tp.all_html_render();
            expect(html).to.have.string('aria-live="polite"');
        });

        it('clock canvas is a labelled img', function () {
            if (!Time_Picker) this.skip();
            const tp = new Time_Picker({ context, value: '14:30', show_clock: true });
            const html = tp.all_html_render();
            expect(html).to.have.string('role="img"');
            expect(html).to.match(/aria-label="Analog clock showing 14:30"/);
        });

        it('spinner buttons have increase/decrease labels', function () {
            if (!Time_Picker) this.skip();
            const tp = new Time_Picker({ context, value: '14:30', show_spinners: true, show_clock: false });
            const html = tp.all_html_render();
            expect(html).to.have.string('aria-label="Increase hours"');
            expect(html).to.have.string('aria-label="Decrease minutes"');
            expect(html).to.have.string('role="spinbutton"');
        });
    });

    describe('DateTime_Picker tabs', () => {
        it('tabbed layout renders tablist/tab roles with aria-selected', function () {
            if (!DateTime_Picker) this.skip();
            const dtp = new DateTime_Picker({ context, layout: 'tabbed', value: '2026-07-02T14:30' });
            const html = dtp.all_html_render();
            expect(html).to.have.string('role="tablist"');
            expect(html).to.have.string('role="tab"');
            expect(html).to.have.string('aria-selected="true"');
            expect(html).to.have.string('aria-selected="false"');
        });

        it('persists layout for SSR reattachment', function () {
            if (!DateTime_Picker) this.skip();
            const dtp = new DateTime_Picker({ context, layout: 'tabbed', value: '2026-07-02T14:30' });
            expect(dtp.dom.attrs['data-layout']).to.equal('tabbed');
        });
    });

    describe('Date_Range_Picker inputs and popup', () => {
        it('inputs carry aria-labels and haspopup', function () {
            if (!Date_Range_Picker) this.skip();
            const drp = new Date_Range_Picker({ context, mode: 'dual', start: '2026-07-06', end: '2026-07-17' });
            const html = drp.all_html_render();
            expect(html).to.have.string('aria-label="Start Date"');
            expect(html).to.have.string('aria-label="End Date"');
            expect(html).to.have.string('aria-haspopup="dialog"');
        });

        it('popup renders as a non-modal dialog', function () {
            if (!Popup) this.skip();
            const p = new Popup({ context, aria_label: 'Choose dates' });
            expect(p.dom.attributes.role).to.equal('dialog');
            expect(p.dom.attributes['aria-modal']).to.equal('false');
            expect(p.dom.attributes['aria-label']).to.equal('Choose dates');
        });
    });
});
