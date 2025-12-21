const { expect } = require('chai');
const controls = require('../../controls/controls');

describe('Scroll_View Control', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('syncs scrollbars from scroll state', () => {
        const scroll_view = new controls.Scroll_View({
            context
        });

        scroll_view.set_scroll_state({
            scroll_left: 50,
            scroll_width: 200,
            viewport_width: 100,
            scroll_top: 20,
            scroll_height: 120,
            viewport_height: 60
        });

        expect(scroll_view.h_scrollbar.ratio).to.equal(0.5);
        expect(scroll_view.v_scrollbar.ratio).to.equal(0.3333333333333333);
    });

    it('updates scroll position without DOM', () => {
        const scroll_view = new controls.Scroll_View({
            context
        });

        scroll_view.set_scroll_position({scroll_left: 40, scroll_top: 30});
        expect(scroll_view.scroll_state.scroll_left).to.equal(40);
        expect(scroll_view.scroll_state.scroll_top).to.equal(30);
    });
});
