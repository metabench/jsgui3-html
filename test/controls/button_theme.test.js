/**
 * Button Theme Integration Tests
 */

require('../setup');
const { expect } = require('chai');

describe('Button Theme Integration', () => {
    let Button, context;

    before(() => {
        Button = require('../../controls/organised/0-core/0-basic/0-native-compositional/button');
    });

    beforeEach(() => {
        context = createTestContext();
    });

    describe('default variant', () => {
        it('uses default params', () => {
            const btn = new Button({ context, text: 'Test' });
            expect(btn._theme_params).to.exist;
            expect(btn._theme_params.size).to.equal('medium');
            expect(btn._theme_params.variant).to.equal('secondary');
        });

        it('renders text content', () => {
            const btn = new Button({ context, text: 'Click me' });
            const html = btn.all_html_render();
            expect(html).to.include('Click me');
        });
    });

    describe('primary variant', () => {
        it('applies primary variant', () => {
            const btn = new Button({ context, text: 'Submit', variant: 'primary' });
            expect(btn._theme_params.variant).to.equal('primary');
        });

        it('sets data-variant attribute', () => {
            const btn = new Button({ context, text: 'Submit', variant: 'primary' });
            expect(btn.dom.attributes['data-variant']).to.equal('primary');
        });
    });

    describe('size params', () => {
        it('respects size from params', () => {
            const btn = new Button({
                context,
                text: 'Large',
                params: { size: 'large' }
            });
            expect(btn._theme_params.size).to.equal('large');
        });

        it('applies size tokens as CSS variables', () => {
            const btn = new Button({
                context,
                text: 'Large',
                params: { size: 'large' }
            });
            expect(btn.dom.attributes.style['--btn-height']).to.equal('44px');
        });
    });

    describe('icon support', () => {
        it('renders icon on left by default', () => {
            const btn = new Button({ context, text: 'Save', icon: '💾' });
            const html = btn.all_html_render();
            expect(html).to.include('💾');
            expect(html).to.include('Save');
        });

        it('renders icon on right when specified', () => {
            const btn = new Button({
                context,
                text: 'Next',
                icon: '→',
                params: { icon_position: 'right' }
            });
            const html = btn.all_html_render();
            expect(html).to.include('→');
            expect(html).to.include('Next');
        });

        it('renders icon only when specified', () => {
            const btn = new Button({
                context,
                text: 'Add',
                icon: '+',
                variant: 'icon'
            });
            expect(btn._theme_params.icon_position).to.equal('only');
        });
    });

    describe('context theme params', () => {
        it('applies theme-level defaults', () => {
            context.theme = {
                params: { button: { size: 'small' } }
            };
            const btn = new Button({ context, text: 'Small' });
            expect(btn._theme_params.size).to.equal('small');
        });

        it('spec.params overrides theme params', () => {
            context.theme = {
                params: { button: { size: 'small' } }
            };
            const btn = new Button({
                context,
                text: 'Large',
                params: { size: 'large' }
            });
            expect(btn._theme_params.size).to.equal('large');
        });
    });

    describe('backward compatibility', () => {
        it('works with just text (legacy usage)', () => {
            const btn = new Button({ context, text: 'Legacy' });
            const html = btn.all_html_render();
            expect(html).to.include('Legacy');
            expect(html).to.include('<button');
        });

        it('works with label instead of text', () => {
            const btn = new Button({ context, label: 'Label Button' });
            const html = btn.all_html_render();
            expect(html).to.include('Label Button');
        });
    });
});
