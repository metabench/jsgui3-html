const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');
const { Control } = jsgui;

describe('SSR attribute value escaping', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    const render_with_attr = (name, value) => {
        const ctrl = new Control({ context, tag_name: 'div' });
        ctrl.dom.attributes[name] = value;
        return { ctrl, html: ctrl.all_html_render() };
    };

    it('escapes double quotes so values cannot terminate the attribute', () => {
        const { html } = render_with_attr('data-payload', '[{"date":"2026-07-06"}]');
        expect(html).to.have.string('data-payload="[{&quot;date&quot;:&quot;2026-07-06&quot;}]"');
        expect(html).to.not.have.string('data-payload="[{"');
    });

    it('escapes ampersands', () => {
        const { html } = render_with_attr('data-url', '/search?a=1&b=2');
        expect(html).to.have.string('data-url="/search?a=1&amp;b=2"');
    });

    it('escapes angle brackets (no markup injection through values)', () => {
        const { html } = render_with_attr('title', '<script>alert(1)</script>');
        expect(html).to.have.string('&lt;script&gt;');
        expect(html).to.not.have.string('<script>');
    });

    it('escapes quoted font names in string style attributes', () => {
        const ctrl = new Control({ context, tag_name: 'div' });
        ctrl.dom.attributes.style = 'font-family:"Inter", sans-serif';
        const html = ctrl.all_html_render();
        expect(html).to.have.string('&quot;Inter&quot;');
    });

    it('round-trips through the DOM: getAttribute returns the original value', () => {
        const payload = '[{"date":"2026-07-06","label":"a&b <ok>"}]';
        const { html } = render_with_attr('data-payload', payload);
        document.body.innerHTML = html;
        const el = document.body.firstElementChild;
        expect(el.getAttribute('data-payload')).to.equal(payload);
        // The element parsed as ONE element with the attribute intact —
        // pre-fix, the quote terminated the attribute and shredded the tag.
        expect(el.attributes.length).to.be.lessThan(8);
    });

    it('leaves simple values untouched', () => {
        const { html } = render_with_attr('data-mode', 'dual');
        expect(html).to.have.string('data-mode="dual"');
    });
});
