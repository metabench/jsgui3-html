/**
 * Dropdown Menu Control Tests
 * 
 * Comprehensive test suite covering:
 * - SSR: HTML structure and rendering
 * - Theme: Variant resolution and token application  
 * - Client: Activation and state management
 * - A11y: Accessibility attributes
 */

require('../setup');
const { expect } = require('chai');
const {
    test_control_instantiation,
    test_ssr_render,
    test_html_structure,
    test_theme_params,
    test_data_attributes,
    mount_and_activate,
    simulate_click,
    create_themed_context
} = require('../helpers/control_test_base');

describe('Dropdown_Menu Control', () => {
    let Dropdown_Menu, context;

    before(() => {
        Dropdown_Menu = require('../../controls/organised/0-core/0-basic/1-compositional/Dropdown_Menu');
    });

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    // ===== SSR: Server-Side Rendering Tests =====
    describe('SSR - HTML Structure', () => {
        it('instantiates without errors', () => {
            const dropdown = new Dropdown_Menu({ context });
            expect(dropdown).to.exist;
            expect(dropdown.__type_name).to.equal('dropdown_menu');
        });

        it('renders valid HTML', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.be.a('string');
            expect(html.length).to.be.greaterThan(50);
            expect(html).to.include('<');
        });

        it('includes dropdown-menu class', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.include('dropdown-menu');
        });

        it('includes closed-top element', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.include('closed-top');
        });

        it('includes open-items container', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.include('open-items');
        });

        it('includes dropdown icon', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.include('dropdown-icon');
            expect(html).to.include('▼');
        });

        it('starts in closed state', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.include('closed');
        });
    });

    describe('SSR - Options Rendering', () => {
        it('renders string options as items', () => {
            const dropdown = new Dropdown_Menu({
                context,
                options: ['Alpha', 'Beta', 'Gamma']
            });
            const html = dropdown.all_html_render();

            expect(html).to.include('Alpha');
            expect(html).to.include('Beta');
            expect(html).to.include('Gamma');
        });

        it('renders each option with item class', () => {
            const dropdown = new Dropdown_Menu({
                context,
                options: ['One', 'Two']
            });
            const html = dropdown.all_html_render();

            // Should have multiple item classes (one for each option)
            const item_matches = html.match(/class="[^"]*item[^"]*"/g);
            expect(item_matches).to.have.length.at.least(2);
        });

        it('handles empty options gracefully', () => {
            const dropdown = new Dropdown_Menu({
                context,
                options: []
            });
            const html = dropdown.all_html_render();

            expect(html).to.include('open-items');
        });

        it('handles undefined options gracefully', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.be.a('string');
            expect(html).to.include('dropdown-menu');
        });
    });

    // ===== Theme: Variant Resolution Tests =====
    describe('Theme - Variant Resolution', () => {
        it('resolves default variant params', () => {
            const dropdown = new Dropdown_Menu({ context });

            expect(dropdown._theme_params).to.exist;
            expect(dropdown._theme_params.size).to.equal('medium');
            expect(dropdown._theme_params.fill_style).to.equal('outline');
            expect(dropdown._theme_params.radius).to.equal('medium');
        });

        it('resolves compact variant', () => {
            const dropdown = new Dropdown_Menu({ context, variant: 'compact' });

            expect(dropdown._theme_params.size).to.equal('small');
            expect(dropdown._theme_params.radius).to.equal('small');
        });

        it('resolves filled variant', () => {
            const dropdown = new Dropdown_Menu({ context, variant: 'filled' });

            expect(dropdown._theme_params.fill_style).to.equal('filled');
        });

        it('resolves ghost variant', () => {
            const dropdown = new Dropdown_Menu({ context, variant: 'ghost' });

            expect(dropdown._theme_params.fill_style).to.equal('transparent');
            expect(dropdown._theme_params.radius).to.equal('none');
        });

        it('resolves native variant', () => {
            const dropdown = new Dropdown_Menu({ context, variant: 'native' });

            expect(dropdown._theme_params.icon).to.equal('triangle');
        });
    });

    describe('Theme - Token Application', () => {
        it('applies size tokens for small', () => {
            const dropdown = new Dropdown_Menu({
                context,
                params: { size: 'small' }
            });

            const style = dropdown.dom.attributes.style;
            expect(style['--input-height']).to.equal('32px');
        });

        it('applies size tokens for medium (default)', () => {
            const dropdown = new Dropdown_Menu({ context });

            const style = dropdown.dom.attributes.style;
            expect(style['--input-height']).to.equal('40px');
        });

        it('applies size tokens for large', () => {
            const dropdown = new Dropdown_Menu({
                context,
                params: { size: 'large' }
            });

            const style = dropdown.dom.attributes.style;
            expect(style['--input-height']).to.equal('48px');
        });

        it('applies radius tokens', () => {
            const dropdown = new Dropdown_Menu({
                context,
                params: { radius: 'large' }
            });

            const style = dropdown.dom.attributes.style;
            expect(style['--radius']).to.equal('12px');
        });
    });

    describe('Theme - Data Attributes', () => {
        it('sets data-fill-style attribute', () => {
            const dropdown = new Dropdown_Menu({ context, variant: 'filled' });

            expect(dropdown.dom.attributes['data-fill-style']).to.equal('filled');
        });

        it('sets data-icon for non-chevron icons', () => {
            const dropdown = new Dropdown_Menu({ context, variant: 'native' });

            expect(dropdown.dom.attributes['data-icon']).to.equal('triangle');
        });

        it('sets data-variant attribute', () => {
            const dropdown = new Dropdown_Menu({ context, variant: 'compact' });

            expect(dropdown.dom.attributes['data-variant']).to.equal('compact');
        });
    });

    describe('Theme - CSS Classes', () => {
        it('adds dropdown-small class for small size', () => {
            const dropdown = new Dropdown_Menu({
                context,
                variant: 'compact'
            });
            const html = dropdown.all_html_render();

            expect(html).to.include('dropdown-small');
        });

        it('does not add size class for medium (default)', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.not.include('dropdown-medium');
        });
    });

    // ===== Spec Override Tests =====
    describe('Spec Params Override', () => {
        it('allows spec.params to override variant defaults', () => {
            const dropdown = new Dropdown_Menu({
                context,
                variant: 'compact',
                params: { radius: 'full' }
            });

            expect(dropdown._theme_params.radius).to.equal('full');
            expect(dropdown._theme_params.size).to.equal('small'); // Keep variant default
        });
    });

    describe('Context Theme Params', () => {
        it('inherits params from context.theme', () => {
            context.theme = {
                params: {
                    dropdown_menu: {
                        fill_style: 'filled'
                    }
                }
            };

            const dropdown = new Dropdown_Menu({ context });

            expect(dropdown._theme_params.fill_style).to.equal('filled');
        });

        it('spec.params overrides context theme params', () => {
            context.theme = {
                params: {
                    dropdown_menu: {
                        fill_style: 'filled'
                    }
                }
            };

            const dropdown = new Dropdown_Menu({
                context,
                params: { fill_style: 'transparent' }
            });

            expect(dropdown._theme_params.fill_style).to.equal('transparent');
        });
    });

    // ===== Client: State Management Tests =====
    describe('Client - State Management', () => {
        it('starts in closed state', () => {
            const dropdown = new Dropdown_Menu({ context });

            expect(dropdown.view.data.model.state).to.equal('closed');
        });

        it('can change state to open', () => {
            const dropdown = new Dropdown_Menu({ context });
            dropdown.view.data.model.state = 'open';

            expect(dropdown.view.data.model.state).to.equal('open');
        });

        it('can change state back to closed', () => {
            const dropdown = new Dropdown_Menu({ context });
            dropdown.view.data.model.state = 'open';
            dropdown.view.data.model.state = 'closed';

            expect(dropdown.view.data.model.state).to.equal('closed');
        });
    });

    // ===== Client: Activation Tests =====
    // Note: Full activation testing requires E2E tests with real browser
    describe('Client - Activation', () => {
        it('has activate method', () => {
            const dropdown = new Dropdown_Menu({
                context,
                options: ['A', 'B']
            });

            expect(typeof dropdown.activate).to.equal('function');
        });

        it('ctrl_dropdown_icon is accessible after composition', () => {
            const dropdown = new Dropdown_Menu({
                context,
                options: ['A', 'B']
            });

            // ctrl_dropdown_icon is stored in _ctrl_fields
            expect(dropdown._ctrl_fields).to.exist;
            expect(dropdown._ctrl_fields.ctrl_dropdown_icon).to.exist;
        });
    });

    // ===== Accessibility Tests =====
    describe('Accessibility', () => {
        it('has identifiable jsgui data attributes', () => {
            const dropdown = new Dropdown_Menu({ context });
            const html = dropdown.all_html_render();

            expect(html).to.include('data-jsgui-id');
        });

        it('has __type_name set correctly', () => {
            const dropdown = new Dropdown_Menu({ context });

            expect(dropdown.__type_name).to.equal('dropdown_menu');
        });
    });

    // ===== Backward Compatibility =====
    describe('Backward Compatibility', () => {
        it('works with just options (legacy usage)', () => {
            const dropdown = new Dropdown_Menu({
                context,
                options: ['A', 'B', 'C']
            });
            const html = dropdown.all_html_render();

            expect(html).to.include('A');
            expect(html).to.include('B');
            expect(html).to.include('C');
        });

        it('maintains view.data.model interface', () => {
            const dropdown = new Dropdown_Menu({
                context,
                options: ['X', 'Y']
            });

            expect(dropdown.view).to.exist;
            expect(dropdown.view.data).to.exist;
            expect(dropdown.view.data.model).to.exist;
            expect(dropdown.view.data.model.state).to.exist;
            expect(dropdown.view.data.model.options).to.exist;
        });
    });
});
