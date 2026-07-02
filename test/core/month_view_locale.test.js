const { expect } = require('chai');

let Month_View;
try {
    Month_View = require('../../controls/organised/0-core/0-basic/1-compositional/Month_View');
} catch (e) {
    console.warn('Month_View not loadable:', e.message);
}

describe('Month_View Localization', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('should default to English day headers without a locale', function () {
        if (!Month_View) this.skip();
        const mv = new Month_View({ context, year: 2026, month: 0 });
        expect(mv._get_day_headers()).to.deep.equal(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });

    it('should produce French day headers with locale fr', function () {
        if (!Month_View) this.skip();
        const mv = new Month_View({ context, year: 2026, month: 0, locale: 'fr' });
        const headers = mv._get_day_headers();
        expect(headers[0].toLowerCase()).to.have.string('lun'); // lundi
        expect(headers[6].toLowerCase()).to.have.string('dim'); // dimanche
    });

    it('should produce German day headers with locale de', function () {
        if (!Month_View) this.skip();
        const mv = new Month_View({ context, year: 2026, month: 0, locale: 'de' });
        const headers = mv._get_day_headers();
        expect(headers[0].toLowerCase()).to.have.string('mo');
        expect(headers[5].toLowerCase()).to.have.string('sa');
    });

    it('should rotate localized headers by first_day_of_week', function () {
        if (!Month_View) this.skip();
        const mv = new Month_View({ context, year: 2026, month: 0, locale: 'fr', first_day_of_week: 6 });
        const headers = mv._get_day_headers();
        expect(headers[0].toLowerCase()).to.have.string('dim'); // Sunday first
        expect(headers[1].toLowerCase()).to.have.string('lun');
    });

    it('should render localized headers into the header row', function () {
        if (!Month_View) this.skip();
        const mv = new Month_View({ context, year: 2026, month: 0, locale: 'fr' });
        const html = mv.all_html_render();
        expect(html.toLowerCase()).to.have.string('lun');
        expect(html.toLowerCase()).to.have.string('dim');
        expect(html).to.not.have.string('>Mon<');
    });

    it('should persist locale as a data attribute for hydration', function () {
        if (!Month_View) this.skip();
        const mv = new Month_View({ context, year: 2026, month: 0, locale: 'fr' });
        expect(mv.dom.attrs['data-locale']).to.equal('fr');
    });

    it('should fall back to English for an invalid locale', function () {
        if (!Month_View) this.skip();
        const mv = new Month_View({ context, year: 2026, month: 0, locale: 'not-a-real-locale-xx-!!' });
        expect(mv._get_day_headers()).to.deep.equal(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });

    it('should expose localized month names', function () {
        if (!Month_View) this.skip();
        const mv_en = new Month_View({ context, year: 2026, month: 6 });
        expect(mv_en.month_name()).to.equal('July');
        const mv_fr = new Month_View({ context, year: 2026, month: 6, locale: 'fr' });
        expect(mv_fr.month_name().toLowerCase()).to.have.string('juillet');
    });

    it('should expose static locale helpers for composites', function () {
        if (!Month_View) this.skip();
        expect(Month_View.get_locale_day_names).to.be.a('function');
        expect(Month_View.get_locale_month_names).to.be.a('function');
        const days = Month_View.get_locale_day_names('es');
        expect(days).to.be.an('array').with.lengthOf(7);
        expect(days[0].toLowerCase()).to.have.string('lun'); // lunes
    });
});
