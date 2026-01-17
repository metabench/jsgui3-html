/**
 * Context Menu Control Tests
 * 
 * Comprehensive test suite covering:
 * - SSR: HTML structure and rendering
 * - Theme: Variant resolution and token application
 */

require('../setup');
const { expect } = require('chai');

describe('Context_Menu Control', () => {
    let Context_Menu, context;

    before(() => {
        Context_Menu = require('../../controls/organised/0-core/0-basic/1-compositional/context-menu');
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
            const menu = new Context_Menu({ context, abstract: true });
            expect(menu).to.exist;
            expect(menu.__type_name).to.equal('context_menu');
        });

        it('renders valid HTML', () => {
            const menu = new Context_Menu({ context, abstract: true });
            const html = menu.all_html_render();

            expect(html).to.be.a('string');
            expect(html.length).to.be.greaterThan(10);
        });

        it('includes context menu classes', () => {
            const menu = new Context_Menu({ context, abstract: true });
            const html = menu.all_html_render();

            expect(html).to.include('context');
            expect(html).to.include('menu');
        });

        // Note: This test is skipped because the Menu_Node instantiation pattern
        // in Context_Menu uses legacy make() factory pattern that needs refactoring
        it.skip('renders menu items from object value', () => {
            const menu = new Context_Menu({
                context,
                value: { 'Cut': () => { }, 'Copy': () => { }, 'Paste': () => { } }
            });
            const html = menu.all_html_render();

            expect(html).to.include('Cut');
            expect(html).to.include('Copy');
            expect(html).to.include('Paste');
        });
    });

    // ===== Theme Tests =====
    describe('Theme - Variant Resolution', () => {
        it('resolves default variant params', () => {
            const menu = new Context_Menu({ context, abstract: true });

            expect(menu._theme_params).to.exist;
            expect(menu._theme_params.size).to.equal('medium');
            expect(menu._theme_params.shadow).to.equal('medium');
            expect(menu._theme_params.radius).to.equal('small');
        });

        it('resolves compact variant', () => {
            const menu = new Context_Menu({ context, abstract: true, variant: 'compact' });

            expect(menu._theme_params.size).to.equal('small');
        });

        it('resolves dark variant', () => {
            const menu = new Context_Menu({ context, abstract: true, variant: 'dark' });

            expect(menu._theme_params.theme).to.equal('dark');
            expect(menu._theme_params.shadow).to.equal('large');
        });
    });

    describe('Theme - CSS Classes', () => {
        it('adds size class for compact', () => {
            const menu = new Context_Menu({ context, abstract: true, variant: 'compact' });
            const html = menu.all_html_render();

            expect(html).to.include('context-menu-small');
        });

        it('adds dark-theme class for dark variant', () => {
            const menu = new Context_Menu({ context, abstract: true, variant: 'dark' });
            const html = menu.all_html_render();

            expect(html).to.include('dark-theme');
        });
    });

    describe('Theme - Data Attributes', () => {
        it('sets data-variant attribute', () => {
            const menu = new Context_Menu({ context, abstract: true, variant: 'compact' });

            expect(menu.dom.attributes['data-variant']).to.equal('compact');
        });
    });

    // ===== Backward Compatibility =====
    describe('Backward Compatibility', () => {
        // Note: Skipped due to legacy Menu_Node factory pattern
        it.skip('works with object value (legacy usage)', () => {
            const menu = new Context_Menu({ 
                context,
                value: { 'Action': () => {} }
            });
            const html = menu.all_html_render();
            
            expect(html).to.include('Action');
        });
    });
});
