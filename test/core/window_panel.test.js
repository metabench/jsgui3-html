const { expect } = require('chai');
const controls = require('../../controls/controls');
const { get_window_manager } = require('../../controls/organised/1-standard/6-layout/window_manager');

describe('Window and Panel Enhancements', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('docks window via window manager', () => {
        const parent = new controls.Panel({
            context
        });
        parent.size = [800, 600];

        const window_ctrl = new controls.Window({
            context
        });
        parent.add(window_ctrl);

        const manager = get_window_manager(context);
        manager.register(window_ctrl);
        manager.dock(window_ctrl, 'left');

        expect(window_ctrl.size[0]).to.equal(400);
        expect(window_ctrl.size[1]).to.equal(600);
        expect(window_ctrl.pos[0]).to.equal(0);
    });

    it('docks panel to right edge', () => {
        const parent = new controls.Panel({
            context
        });
        parent.size = [900, 500];

        const panel = new controls.Panel({
            context
        });
        parent.add(panel);
        panel.dock_to('right');

        expect(panel.size[0]).to.equal(450);
        expect(panel.size[1]).to.equal(500);
        expect(panel.pos[0]).to.equal(450);
    });
});
