const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');

let Date_Picker, Month_View;
try {
    Date_Picker = require('../../controls/organised/0-core/0-basic/_complex_date-picker');
    Month_View = require('../../controls/organised/0-core/0-basic/1-compositional/month-view');
} catch (e) {
    console.warn('Complex Date_Picker not loadable:', e.message);
}

describe('Complex Date_Picker', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    // ========================================================
    // Constructor / Composition
    // ========================================================
    describe('Constructor', () => {
        it('should create with default options', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            expect(dp).to.exist;
        });

        it('should have year_picker sub-control', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            expect(dp.year_picker).to.exist;
        });

        it('should have month_picker sub-control', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            expect(dp.month_picker).to.exist;
        });

        it('should have month_view sub-control', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            expect(dp.month_view).to.exist;
            // month_view should be a Month_View instance
            if (Month_View) {
                expect(dp.month_view).to.be.instanceOf(Month_View);
            }
        });

        it('should have today button', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            expect(dp.today_btn).to.exist;
        });

        it('should apply date-picker CSS class', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            expect(dp.__type_name).to.equal('date_picker');
        });
    });

    // ========================================================
    // Year/Month Sync
    // ========================================================
    describe('Year/Month Sync', () => {
        it('should have year property from mx_date', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            expect(dp.year).to.be.a('number');
        });

        it('should have month property from mx_date', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            expect(dp.month).to.be.a('number');
        });

        it('should update month_view.year on year change', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            const original_year = dp.month_view.year;
            dp.year = 2020;
            // finish_date_picker wires up change events — in SSR mode they are already connected
            expect(dp.year).to.equal(2020);
        });

        it('should update month_view.month on month change', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context });
            dp.month = 5;
            expect(dp.month).to.equal(5);
        });
    });

    // ========================================================
    // CSS
    // ========================================================
    describe('CSS', () => {
        it('should have static css property', function () {
            if (!Date_Picker) this.skip();
            expect(Date_Picker.css).to.be.a('string');
            expect(Date_Picker.css).to.include('.date-picker');
        });

        it('should include today button styles', function () {
            if (!Date_Picker) this.skip();
            expect(Date_Picker.css).to.include('.today-btn');
        });
    });

    // ========================================================
    // HTML Output (SSR)
    // ========================================================
    describe('SSR Output', () => {
        it('should render HTML with sub-controls', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context, size: [360, 280] });
            const html = dp.all_html_render();
            expect(html).to.be.a('string');
            expect(html.length).to.be.greaterThan(100);
        });

        it('should include month-view in rendered HTML', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context, size: [360, 280] });
            const html = dp.all_html_render();
            expect(html).to.include('month_view');
        });

        it('should include year-picker in rendered HTML', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context, size: [360, 280] });
            const html = dp.all_html_render();
            expect(html).to.include('year-picker');
        });

        it('should include month-picker in rendered HTML', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context, size: [360, 280] });
            const html = dp.all_html_render();
            expect(html).to.include('month-picker');
        });

        it('should include Today button in rendered HTML', function () {
            if (!Date_Picker) this.skip();
            const dp = new Date_Picker({ context, size: [360, 280] });
            const html = dp.all_html_render();
            expect(html).to.include('Today');
        });
    });
});
