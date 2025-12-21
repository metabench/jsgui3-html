const { expect } = require('chai');
const controls = require('../../controls/controls');

describe('Layout Controls', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Split_Pane', () => {
        it('should apply size to primary pane', () => {
            const split_pane = new controls.Split_Pane({
                context,
                size: 200,
                panes: ['A', 'B']
            });

            const primary = split_pane.get_primary_pane();
            expect(primary.dom.attributes.style.flex).to.include('200px');
        });
    });

    describe('Accordion', () => {
        it('should toggle sections', () => {
            const accordion = new controls.Accordion({
                context,
                sections: [
                    { id: 'a', title: 'A', content: 'Alpha', open: true },
                    { id: 'b', title: 'B', content: 'Beta' }
                ]
            });

            expect(accordion.get_open_ids()).to.deep.equal(['a']);
            accordion.toggle_section('b');
            expect(accordion.get_open_ids()).to.deep.equal(['b']);
        });
    });

    describe('Drawer', () => {
        it('should open and close', () => {
            const drawer = new controls.Drawer({
                context,
                open: false,
                content: 'Menu'
            });

            expect(drawer.get_open()).to.equal(false);
            drawer.open();
            expect(drawer.get_open()).to.equal(true);
            drawer.close();
            expect(drawer.get_open()).to.equal(false);
        });
    });

    describe('Stepper', () => {
        it('should change steps', () => {
            const stepper = new controls.Stepper({
                context,
                steps: [
                    { title: 'One', content: 'A' },
                    { title: 'Two', content: 'B' }
                ]
            });

            expect(stepper.get_current_step()).to.equal(0);
            stepper.next();
            expect(stepper.get_current_step()).to.equal(1);
            stepper.previous();
            expect(stepper.get_current_step()).to.equal(0);
        });
    });

    describe('Tabbed_Panel', () => {
        it('should render overflow select', () => {
            const tabbed_panel = new controls.Tabbed_Panel({
                context,
                tabs: ['One', 'Two', 'Three'],
                tab_bar: { overflow: true, max_tabs: 2 }
            });

            const html = tabbed_panel.html;
            expect(html).to.include('tab-overflow-select');
        });
    });

    describe('Layout primitives', () => {
        it('should apply stack gap', () => {
            const stack = new controls.Stack({
                context,
                gap: 10
            });

            expect(stack.dom.attributes.style.gap).to.equal('10px');
        });

        it('should apply grid gap columns', () => {
            const grid_gap = new controls.Grid_Gap({
                context,
                columns: 'repeat(2, minmax(0, 1fr))',
                gap: 8
            });

            expect(grid_gap.dom.attributes.style.gridTemplateColumns).to.equal('repeat(2, minmax(0, 1fr))');
        });
    });
});
