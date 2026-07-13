const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');
const { Control, String_Control } = jsgui;

/**
 * Raw text elements (<style>, <script>) — SSR rendering.
 *
 * Per the HTML spec these elements contain RAW TEXT: browsers never decode
 * entity references inside them. Entity-escaping their text children
 * therefore corrupts CSS/JS — observed in production as /* comments *​/
 * becoming &#x2F;*…*&#x2F;, with CSS error recovery silently discarding
 * the rule after every comment (copilot-dl-news crawl-status page,
 * 2026-07-11). Text children of style/script must render unescaped; the
 * one required sanitization is neutralizing the closing-tag sequence
 * ("</style", "</script") so content cannot end the element early.
 */

describe('SSR raw text elements (<style>/<script>)', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    const CSS_SAMPLE = [
        '/* ── Caption bar (gradient) ── */',
        "body { font-family: 'Tahoma', \"MS Shell Dlg 2\", sans-serif; }",
        '/* another comment */',
        '.vs-caption { background: linear-gradient(to bottom, #3B77D3 0%, #16418B 100%); }'
    ].join('\n');

    it('renders <style> text children unescaped (apostrophes, quotes, comments)', () => {
        const style = new Control({ context, tagName: 'style' });
        style.add(CSS_SAMPLE);
        const html = style.all_html_render();

        expect(html).to.have.string("'Tahoma'");
        expect(html).to.have.string('"MS Shell Dlg 2"');
        expect(html).to.have.string('/* another comment */');
        expect(html).to.not.have.string('&#x27;');
        expect(html).to.not.have.string('&#x2F;');
        expect(html).to.not.have.string('&quot;');
    });

    it('neutralizes a literal </style> inside style content', () => {
        const style = new Control({ context, tagName: 'style' });
        style.add('.a::before { content: "</style><img src=x onerror=alert(1)>"; }');
        const html = style.all_html_render();

        // The real closing tag must be the ONLY parseable one.
        const closings = html.match(/<\/style>/g) || [];
        expect(closings.length).to.equal(1);
        expect(html).to.have.string('<\\/style');
        expect(html).to.not.have.string('&quot;');
    });

    it('renders <script> text children unescaped and executable', () => {
        const script = new Control({ context, tagName: 'script' });
        const JS_SAMPLE = "var msg = 'it\\'s alive'; var q = \"double\"; /* comment */ window.__raw_text_ok = msg + q;";
        script.add(JS_SAMPLE);
        const html = script.all_html_render();

        expect(html).to.have.string("var msg = 'it\\'s alive';");
        expect(html).to.not.have.string('&#x27;');
        expect(html).to.not.have.string('&quot;');
        expect(html).to.not.have.string('&#x2F;');

        // Executable: extract the body and eval it in a sandbox-ish scope.
        const body = html.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
        const fn = new Function('window', body);
        const fake_window = {};
        expect(() => fn(fake_window)).to.not.throw();
        expect(fake_window.__raw_text_ok).to.equal("it's alivedouble");
    });

    it('neutralizes a literal </script> inside script content', () => {
        const script = new Control({ context, tagName: 'script' });
        script.add('var s = "</script><script>alert(1)</scr" + "ipt>";');
        const html = script.all_html_render();

        const closings = html.match(/<\/script>/g) || [];
        expect(closings.length).to.equal(1);
        expect(html).to.have.string('<\\/script');
    });

    it('is case-insensitive about the closing-tag sequence', () => {
        const style = new Control({ context, tagName: 'style' });
        style.add('/* tricky */ .b { content: "</STYLE>"; }');
        const html = style.all_html_render();
        expect(html.match(/<\/style>/gi).length).to.equal(1); // only the real one
        expect(html).to.have.string('<\\/STYLE');
    });

    it('still escapes text children of normal elements', () => {
        const div = new Control({ context, tagName: 'div' });
        div.add('<script>alert(1)</script> & \'quotes\' "here"');
        const html = div.all_html_render();

        expect(html).to.have.string('&lt;script&gt;');
        expect(html).to.have.string('&amp;');
        expect(html).to.have.string('&#x27;');
        expect(html).to.not.have.string('<script>alert(1)');
    });

    it('String_Control keeps rendering raw (unchanged behavior)', () => {
        const style = new Control({ context, tagName: 'style' });
        style.add(new String_Control({ context, text: CSS_SAMPLE }));
        const html = style.all_html_render();
        expect(html).to.have.string('/* another comment */');
        expect(html).to.not.have.string('&#x2F;');
    });

    it('ships static control CSS intact (Admin_Theme + Data_Table)', function () {
        // First require of the full controls catalog can exceed mocha's
        // default 2s on cold disk/AV-scanned machines.
        this.timeout(20000);
        const controls = require('../../controls/controls');
        for (const css of [controls.Admin_Theme && controls.Admin_Theme.css, controls.Data_Table && controls.Data_Table.css]) {
            if (!css) continue;
            const style = new Control({ context, tagName: 'style' });
            style.add(css);
            const html = style.all_html_render();
            expect(html).to.not.have.string('&#x27;');
            expect(html).to.not.have.string('&#x2F;');
            expect(html).to.not.have.string('&quot;');
        }
    });
});
