const { expect } = require('chai');
const { JSDOM } = require('jsdom');

const jsgui = require('../../html-core/html-core');
const { Control, Page_Context } = jsgui;

// Defects confirmed by execution on 2026-08-01 against jsgui3-html 0.0.189 (4480471).
//
// Each defect gets TWO tests:
//   * a PIN test that asserts CURRENT behaviour, so the defect cannot change unnoticed
//   * a skipped test asserting the CORRECT behaviour, to un-skip when it is fixed
//
// Pinning rather than failing is deliberate. A permanently-red suite trains people to
// ignore red. These are all public-API or hydration behaviours where the fix is a real
// behaviour change that needs its own deliberate commit, not a drive-by.
//
// See jsgui3-ecosystem/docs/reviews/README.md and lab/experiments/002-spec-survival/.

const make_dom = () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
    return dom;
};

describe('known defects (pinned)', () => {
    describe('spec.text does not set element content', () => {
        // Not a bug to fix necessarily, but the README documented it as working and it
        // silently produced an empty element. Pin the forms that DO work.
        it('spec.text renders nothing', () => {
            const c = new Control({ context: new Page_Context(), tag_name: 'button', text: 'Click me' });
            expect(c.all_html_render()).to.not.include('Click me');
        });

        it('spec.content renders the text', () => {
            const c = new Control({ context: new Page_Context(), tag_name: 'button', content: 'Click me' });
            expect(c.all_html_render()).to.include('Click me');
        });

        it('.add(string) renders the text', () => {
            const c = new Control({ context: new Page_Context(), tag_name: 'button' });
            c.add('Click me');
            expect(c.all_html_render()).to.include('Click me');
        });
    });

    describe('_persisted_fields hydration has no reserved-key guard', () => {
        // control-enh.js:636-640 assigns every data-jsgui-fields key onto `this` with no
        // filtering. exempt_prop_names at :151 is an empty object literal. The sibling
        // _ctrl_fields path at :893-898 guards 22 reserved names and warns on collision.
        const hydrate = (fields_json) => {
            const dom = make_dom();
            const doc = dom.window.document;
            doc.body.innerHTML =
                `<div data-jsgui-id="p1" data-jsgui-type="control" data-jsgui-fields="${fields_json}"></div>`;
            const el = doc.body.firstElementChild;
            const ctrl = new Control({
                context: new Page_Context({ document: doc }),
                __type_name: 'control',
                id: 'p1',
                el
            });
            ctrl.pre_activate(ctrl.dom.el);
            return ctrl;
        };

        it('PIN: a persisted field overwrites a live property with a raw primitive', () => {
            const ctrl = hydrate("{'selection_scope':3}");
            expect(ctrl.selection_scope).to.equal(3);
        });

        it('PIN: it clobbers even a reserved name, destroying the content collection', () => {
            const ctrl = hydrate("{'content':99}");
            expect(ctrl.content).to.equal(99);
        });

        it.skip('CORRECT: reserved names should be skipped, as _ctrl_fields does', () => {
            const ctrl = hydrate("{'content':99}");
            expect(ctrl.content).to.not.equal(99);
            expect(ctrl.content).to.be.an('object');
        });
    });

    describe('view_environment is read but never assigned', () => {
        // 12 controls read this.context.view_environment.layout_mode; a repo-wide grep for
        // an assignment across all three packages returns nothing.
        it('PIN: a fresh Page_Context has no view_environment', () => {
            expect(new Page_Context().view_environment).to.equal(undefined);
        });

        it.skip('CORRECT: context should expose a view_environment for layout resolution', () => {
            expect(new Page_Context().view_environment).to.be.an('object');
        });
    });

    describe('Control.add() return value', () => {
        it('PIN: add(control) returns the added child, not this', () => {
            const ctx = new Page_Context();
            const parent = new Control({ context: ctx });
            const child = new Control({ context: ctx });
            expect(parent.add(child)).to.equal(child);
            expect(parent.add(child)).to.not.equal(parent);
        });

        it('PIN: add(array) returns undefined because control-core.js:797 shadows res', () => {
            const ctx = new Page_Context();
            const parent = new Control({ context: ctx });
            const result = parent.add([new Control({ context: ctx }), new Control({ context: ctx })]);
            expect(result).to.equal(undefined);
        });

        it('add(array) still adds every child despite returning undefined', () => {
            const ctx = new Page_Context();
            const parent = new Control({ context: ctx });
            parent.add([new Control({ context: ctx }), new Control({ context: ctx })]);
            expect(parent.content._arr.length).to.equal(2);
        });

        it.skip('CORRECT: add(array) should return the added children, not undefined', () => {
            const ctx = new Page_Context();
            const parent = new Control({ context: ctx });
            const result = parent.add([new Control({ context: ctx }), new Control({ context: ctx })]);
            expect(result).to.be.an('array').with.length(2);
        });
    });
});
