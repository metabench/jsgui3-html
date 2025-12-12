const { expect } = require('chai');
const sinon = require('sinon');
const jsgui = require('../../html-core/html-core');
const { parse, parse_mount } = require('../../html-core/parse-mount');

describe('parse (html-core/parse-mount.js)', () => {
    let context;

    beforeEach(() => {
        context = new jsgui.Page_Context();
    });

    it('creates controls and text nodes with correct structure', done => {
        const str_content = '<div class=\"outer\"><span name=\"inner\">Hi</span> there</div>';
        parse(str_content, context, jsgui.controls, (err, res_parse) => {
            try {
                expect(err).to.equal(null);

                const [depth_0_ctrls, res_controls] = res_parse;
                expect(depth_0_ctrls).to.have.lengthOf(1);

                const div_ctrl = depth_0_ctrls[0];
                expect(div_ctrl.dom.tagName).to.equal('div');
                expect(div_ctrl.has_class('outer')).to.equal(true);

                expect(res_controls.named).to.be.an('object');
                expect(res_controls.named.inner).to.exist;

                const inner_ctrl = res_controls.named.inner;
                expect(inner_ctrl.dom.tagName).to.equal('span');
                expect(inner_ctrl.content._arr[0]).to.be.instanceof(jsgui.Text_Node);
                expect(inner_ctrl.content._arr[0].text).to.equal('Hi');

                expect(div_ctrl.content._arr[0]).to.equal(inner_ctrl);
                expect(div_ctrl.content._arr[1]).to.be.instanceof(jsgui.Text_Node);
                expect(div_ctrl.content._arr[1].text.trim()).to.equal('there');
                expect(div_ctrl.content._arr[1].sibling_index).to.equal(1);

                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('copies non-jsgui attributes into dom.attributes', done => {
        parse('<div data-x=\"1\"></div>', context, jsgui.controls, (err, res_parse) => {
            try {
                expect(err).to.equal(null);
                const [depth_0_ctrls] = res_parse;
                const div_ctrl = depth_0_ctrls[0];
                expect(div_ctrl.dom.attributes['data-x']).to.equal('1');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('handles script tags as controls with raw text', done => {
        parse('<script>var x = 1;</script>', context, jsgui.controls, (err, res_parse) => {
            try {
                expect(err).to.equal(null);
                const [depth_0_ctrls] = res_parse;
                expect(depth_0_ctrls).to.have.lengthOf(1);
                const script_ctrl = depth_0_ctrls[0];
                expect(script_ctrl.dom.tagName).to.equal('script');
                expect(script_ctrl.content._arr[0]).to.be.instanceof(jsgui.Text_Node);
                expect(script_ctrl.content._arr[0].text).to.equal('var x = 1;');
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});

describe('parse_mount (html-core/parse-mount.js)', () => {
    let context;

    beforeEach(() => {
        context = new jsgui.Page_Context();
    });

    it('mounts parsed controls into target and exposes named controls', async() => {
        const target = new jsgui.controls.div({ context });
        const str_content = '<span name=\"greeting\">Hi</span><span>There</span>';

        const depth_0_ctrls = await parse_mount(str_content, target, jsgui.controls);

        expect(depth_0_ctrls).to.have.lengthOf(2);
        expect(target.content._arr).to.include.members(depth_0_ctrls);

        expect(target.greeting).to.equal(depth_0_ctrls[0]);
        expect(target._ctrl_fields).to.be.an('object');
        expect(target._ctrl_fields.greeting).to.equal(depth_0_ctrls[0]);
    });

    it('supports mounting into a separate container', async() => {
        const target = new jsgui.controls.div({ context });
        const container = new jsgui.controls.div({ context });
        target.add(container);

        const depth_0_ctrls = await parse_mount('<span>Ok</span>', target, container, jsgui.controls);
        expect(depth_0_ctrls).to.have.lengthOf(1);
        expect(container.content._arr[0]).to.equal(depth_0_ctrls[0]);
    });

    it('auto-activates mounted controls in active context', async() => {
        const clock = sinon.useFakeTimers();
        context.__is_active = true;

        const target = new jsgui.controls.div({ context });
        const depth_0_ctrls = await parse_mount('<span>Active</span>', target, jsgui.controls);

        const span_ctrl = depth_0_ctrls[0];
        const activate_stub = sinon.stub(span_ctrl, 'activate').callsFake(() => {});
        try {
            clock.tick(1);
            expect(activate_stub.called).to.equal(true);
        } finally {
            activate_stub.restore();
            clock.restore();
        }
    });
});
