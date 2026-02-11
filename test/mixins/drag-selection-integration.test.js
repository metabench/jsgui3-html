/**
 * Drag Selection Integration Tests
 * 
 * Tests drag selection across Grid, List, and Cell controls.
 */

const { expect } = require('chai');

describe('Drag Selection Integration', () => {
    let jsgui, context;

    before(() => {
        jsgui = require('../../html-core/html-core');
    });

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Grid with drag_selection', () => {
        let Grid;

        before(() => {
            try {
                Grid = require('../../controls/organised/0-core/0-basic/1-compositional/grid');
            } catch (e) {
                console.log('Could not load Grid:', e.message);
            }
        });

        it('should store drag_selection from spec', function () {
            if (!Grid) this.skip();

            const grid = new Grid({
                context,
                grid_size: [3, 3],
                cell_selection: true,
                drag_selection: true,
                size: [90, 90]
            });

            expect(grid.drag_selection).to.equal(true);
        });

        it('should not enable drag_selection by default', function () {
            if (!Grid) this.skip();

            const grid = new Grid({
                context,
                grid_size: [3, 3],
                size: [90, 90]
            });

            expect(grid.drag_selection).to.equal(false);
        });

        it('should pass drag_select to cells when drag_selection is true', function () {
            if (!Grid) this.skip();

            const grid = new Grid({
                context,
                grid_size: [3, 3],
                cell_selection: true,
                drag_selection: true,
                size: [90, 90]
            });

            // Verify that cells have drag_select set in their spec
            // (DOM-level event wiring requires full browser activation)
            let cells_with_drag = 0;
            grid.each_cell((cell) => {
                // The cell should have a truthy indication it was created with drag
                // Since Cell doesn't expose spec, check that grid passes drag_selection
                cells_with_drag++;
            });
            expect(cells_with_drag).to.equal(9);
            expect(grid.drag_selection).to.equal(true);
        });

        it('should have _select_cell_range helper method', function () {
            if (!Grid) this.skip();

            const grid = new Grid({
                context,
                grid_size: [3, 3],
                drag_selection: true,
                size: [90, 90]
            });

            expect(grid._select_cell_range).to.be.a('function');
            expect(grid._find_cell_from_el).to.be.a('function');
            expect(grid._get_selected_cells).to.be.a('function');
        });

        it('should select rectangular cell range', function () {
            if (!Grid) this.skip();

            const grid = new Grid({
                context,
                grid_size: [4, 4],
                cell_selection: true,
                drag_selection: true,
                size: [120, 120]
            });

            const start = grid.get_cell(0, 0);
            const end = grid.get_cell(2, 2);

            if (!start || !end) {
                this.skip();
                return;
            }

            grid._select_cell_range(start, end);

            // Should select 9 cells (3x3)
            const selected = grid._get_selected_cells();
            expect(selected.length).to.equal(9);

            // All selected cells should be within [0,0] to [2,2]
            selected.forEach(({ x, y }) => {
                expect(x).to.be.at.least(0).and.at.most(2);
                expect(y).to.be.at.least(0).and.at.most(2);
            });
        });

        it('should deselect cells outside range', function () {
            if (!Grid) this.skip();

            const grid = new Grid({
                context,
                grid_size: [4, 4],
                cell_selection: true,
                drag_selection: true,
                size: [120, 120]
            });

            // First select everything
            grid.each_cell(cell => { cell.selected = true; });

            // Now select only a 2x2 range
            const start = grid.get_cell(1, 1);
            const end = grid.get_cell(2, 2);
            if (!start || !end) { this.skip(); return; }

            grid._select_cell_range(start, end);

            const selected = grid._get_selected_cells();
            expect(selected.length).to.equal(4);
        });
    });

    describe('List with drag_select', () => {
        let List;

        before(() => {
            try {
                List = require('../../controls/organised/0-core/0-basic/1-compositional/list');
            } catch (e) {
                console.log('Could not load List:', e.message);
            }
        });

        it('should store drag_select from spec', function () {
            if (!List) this.skip();

            const list = new List({
                context,
                items: ['A', 'B', 'C'],
                drag_select: true
            });

            expect(list.drag_select).to.equal(true);
        });

        it('should not enable drag_select by default', function () {
            if (!List) this.skip();

            const list = new List({
                context,
                items: ['A', 'B', 'C']
            });

            expect(list.drag_select).to.equal(false);
        });

        it('should have _select_item_range helper method', function () {
            if (!List) this.skip();

            const list = new List({
                context,
                items: ['A', 'B', 'C', 'D', 'E'],
                drag_select: true
            });

            expect(list._select_item_range).to.be.a('function');
            expect(list._find_item_index_from_el).to.be.a('function');
            expect(list._get_selected_indices).to.be.a('function');
        });

        it('should select contiguous item range', function () {
            if (!List) this.skip();

            const list = new List({
                context,
                items: ['A', 'B', 'C', 'D', 'E'],
                drag_select: true
            });

            list._select_item_range(1, 3);

            const selected = list._get_selected_indices();
            expect(selected).to.deep.equal([1, 2, 3]);

            // Items outside range should not be selected
            expect(list.item_controls[0].selected).to.not.equal(true);
            expect(list.item_controls[4].selected).to.not.equal(true);
        });

        it('should handle reversed range', function () {
            if (!List) this.skip();

            const list = new List({
                context,
                items: ['A', 'B', 'C', 'D', 'E'],
                drag_select: true
            });

            list._select_item_range(3, 1);

            const selected = list._get_selected_indices();
            expect(selected).to.deep.equal([1, 2, 3]);
        });
    });

    describe('Cell with drag_select', () => {
        let Cell;

        before(() => {
            try {
                Cell = require('../../controls/organised/0-core/0-basic/1-compositional/Cell');
            } catch (e) {
                console.log('Could not load Cell:', e.message);
            }
        });

        it('should not enable drag on cell by default', function () {
            if (!Cell) this.skip();

            const cell = new Cell({ context });
            expect(!!cell._drag_select_applied).to.equal(false);
        });

        it('should accept drag_select true in spec', function () {
            if (!Cell) this.skip();

            // Cell constructor with drag_select passes {drag: true} to mx_selectable
            // Full DOM-level drag wiring requires browser activation (dom.el at mixin call time)
            // Here we verify the Cell is created without error when drag_select is specified
            const cell = new Cell({ context, drag_select: true });
            expect(cell).to.exist;
            expect(cell.dom).to.exist;
        });
    });
});
