/**
 * List Control Tests
 * 
 * Comprehensive test suite covering:
 * - SSR: HTML structure and rendering
 * - Theme: Variant resolution and token application
 * - Core: Item management and selection
 */

require('../setup');
const { expect } = require('chai');

describe('List Control', () => {
    let List, context;

    before(() => {
        List = require('../../controls/organised/0-core/0-basic/1-compositional/list');
    });

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    // ===== SSR Tests =====
    describe('SSR - HTML Structure', () => {
        it('instantiates without errors', () => {
            const list = new List({ context });
            expect(list).to.exist;
            expect(list.__type_name).to.equal('list');
        });

        it('renders as ul by default', () => {
            const list = new List({ context });
            const html = list.all_html_render();

            expect(html).to.include('<ul');
        });

        it('renders as ol when ordered', () => {
            const list = new List({ context, ordered: true });
            const html = list.all_html_render();

            expect(html).to.include('<ol');
        });

        it('includes list class', () => {
            const list = new List({ context });
            const html = list.all_html_render();

            expect(html).to.include('list');
        });

        it('renders items from spec', () => {
            const list = new List({
                context,
                items: ['Apple', 'Banana', 'Cherry']
            });
            const html = list.all_html_render();

            expect(html).to.include('Apple');
            expect(html).to.include('Banana');
            expect(html).to.include('Cherry');
        });
    });

    // ===== Theme Tests =====
    describe('Theme - Variant Resolution', () => {
        it('resolves default variant params', () => {
            const list = new List({ context });

            expect(list._theme_params).to.exist;
            expect(list._theme_params.size).to.equal('medium');
            expect(list._theme_params.spacing).to.equal('medium');
            expect(list._theme_params.dividers).to.equal(false);
        });

        it('resolves compact variant', () => {
            const list = new List({ context, variant: 'compact' });

            expect(list._theme_params.size).to.equal('small');
            expect(list._theme_params.spacing).to.equal('small');
        });

        it('resolves divided variant', () => {
            const list = new List({ context, variant: 'divided' });

            expect(list._theme_params.dividers).to.equal(true);
            expect(list._theme_params.spacing).to.equal('none');
        });

        it('resolves large variant', () => {
            const list = new List({ context, variant: 'large' });

            expect(list._theme_params.size).to.equal('large');
        });

        it('resolves cards variant', () => {
            const list = new List({ context, variant: 'cards' });

            expect(list._theme_params.item_style).to.equal('card');
        });
    });

    describe('Theme - CSS Classes', () => {
        it('adds size class for small', () => {
            const list = new List({ context, variant: 'compact' });
            const html = list.all_html_render();

            expect(html).to.include('list-small');
        });

        it('adds list-divided class for divided variant', () => {
            const list = new List({ context, variant: 'divided' });
            const html = list.all_html_render();

            expect(html).to.include('list-divided');
        });

        it('adds list-cards class for cards variant', () => {
            const list = new List({ context, variant: 'cards' });
            const html = list.all_html_render();

            expect(html).to.include('list-cards');
        });
    });

    describe('Theme - Data Attributes', () => {
        it('sets data-variant attribute', () => {
            const list = new List({ context, variant: 'compact' });

            expect(list.dom.attributes['data-variant']).to.equal('compact');
        });
    });

    // ===== Core Functionality =====
    describe('Core - Item Management', () => {
        it('stores items array', () => {
            const list = new List({
                context,
                items: ['A', 'B', 'C']
            });

            expect(list.items).to.have.lengthOf(3);
        });

        it('allows setting items after construction', () => {
            const list = new List({ context });
            list.set_items(['X', 'Y', 'Z']);

            expect(list.items).to.have.lengthOf(3);
        });

        it('supports filter text', () => {
            const list = new List({
                context,
                items: ['Apple', 'Banana', 'Apricot']
            });
            list.set_filter_text('Ap');

            expect(list.filtered_items).to.have.lengthOf(2);
        });
    });

    describe('Core - Selection', () => {
        it('starts with no selection', () => {
            const list = new List({ context, items: ['A', 'B'] });

            expect(list.selected_item).to.be.null;
            expect(list.selected_index).to.equal(-1);
        });

        it('allows setting selected item', () => {
            const list = new List({ context, items: ['A', 'B', 'C'] });
            list.set_selected_value('B');

            expect(list.selected_item.value).to.equal('B');
        });
    });

    // ===== Backward Compatibility =====
    describe('Backward Compatibility', () => {
        it('works with just items (legacy usage)', () => {
            const list = new List({
                context,
                items: ['Item 1', 'Item 2']
            });
            const html = list.all_html_render();

            expect(html).to.include('Item 1');
            expect(html).to.include('Item 2');
        });

        it('maintains data model interface', () => {
            const list = new List({ context, items: ['X'] });

            expect(list.data).to.exist;
            expect(list.data.model).to.exist;
        });
    });
});
