/**
 * Input Theme Integration Tests
 */

require('../setup');
const { expect } = require('chai');

describe('Text_Input Theme Integration', () => {
    let Text_Input, context;

    before(() => {
        Text_Input = require('../../controls/organised/0-core/0-basic/0-native-compositional/Text_Input');
    });

    beforeEach(() => {
        context = createTestContext();
    });

    describe('variant resolution', () => {
        it('resolves default variant params', () => {
            const input = new Text_Input({ context });

            expect(input._theme_params).to.exist;
            expect(input._theme_params.size).to.equal('medium');
            expect(input._theme_params.fill_style).to.equal('outline');
            expect(input._theme_params.label_position).to.equal('top');
        });

        it('resolves compact variant', () => {
            const input = new Text_Input({ context, variant: 'compact' });

            expect(input._theme_params.size).to.equal('small');
            expect(input._theme_params.label_position).to.equal('left');
        });

        it('resolves search variant', () => {
            const input = new Text_Input({ context, variant: 'search' });

            expect(input._theme_params.shape).to.equal('pill');
            expect(input._theme_params.clear_button).to.equal(true);
            expect(input._theme_params.label_position).to.equal('hidden');
        });

        it('resolves filled variant', () => {
            const input = new Text_Input({ context, variant: 'filled' });

            expect(input._theme_params.fill_style).to.equal('filled');
        });

        it('resolves underline variant', () => {
            const input = new Text_Input({ context, variant: 'underline' });

            expect(input._theme_params.fill_style).to.equal('underline');
            expect(input._theme_params.label_position).to.equal('floating');
        });

        it('resolves floating variant', () => {
            const input = new Text_Input({ context, variant: 'floating' });

            expect(input._theme_params.label_position).to.equal('floating');
        });

        it('resolves inline variant', () => {
            const input = new Text_Input({ context, variant: 'inline' });

            expect(input._theme_params.size).to.equal('small');
            expect(input._theme_params.fill_style).to.equal('transparent');
            expect(input._theme_params.border_on_focus).to.equal(true);
        });
    });

    describe('token application', () => {
        it('applies size tokens for small', () => {
            const input = new Text_Input({
                context,
                params: { size: 'small' }
            });

            expect(input.dom.attributes.style['--input-height']).to.equal('32px');
            expect(input.dom.attributes.style['--input-font-size']).to.equal('13px');
        });

        it('applies size tokens for medium', () => {
            const input = new Text_Input({ context });

            expect(input.dom.attributes.style['--input-height']).to.equal('40px');
            expect(input.dom.attributes.style['--input-font-size']).to.equal('14px');
        });

        it('applies size tokens for large', () => {
            const input = new Text_Input({
                context,
                params: { size: 'large' }
            });

            expect(input.dom.attributes.style['--input-height']).to.equal('48px');
            expect(input.dom.attributes.style['--input-font-size']).to.equal('16px');
        });
    });

    describe('data attributes', () => {
        it('sets data-fill-style attribute', () => {
            const input = new Text_Input({ context, variant: 'filled' });

            expect(input.dom.attributes['data-fill-style']).to.equal('filled');
        });

        it('sets data-label-position attribute', () => {
            const input = new Text_Input({ context, variant: 'floating' });

            expect(input.dom.attributes['data-label-position']).to.equal('floating');
        });

        it('sets data-variant attribute', () => {
            const input = new Text_Input({ context, variant: 'search' });

            expect(input.dom.attributes['data-variant']).to.equal('search');
        });
    });

    describe('CSS classes', () => {
        it('adds input-small class for small size', () => {
            const input = new Text_Input({
                context,
                params: { size: 'small' }
            });

            const html = input.all_html_render();
            expect(html).to.include('input-small');
        });

        it('adds input-pill class for search variant', () => {
            const input = new Text_Input({ context, variant: 'search' });

            const html = input.all_html_render();
            expect(html).to.include('input-pill');
        });

        it('adds has-clear-button class when clear_button is true', () => {
            const input = new Text_Input({ context, variant: 'search' });

            const html = input.all_html_render();
            expect(html).to.include('has-clear-button');
        });

        it('includes text-input base class', () => {
            const input = new Text_Input({ context });

            const html = input.all_html_render();
            expect(html).to.include('text-input');
        });
    });

    describe('spec params override', () => {
        it('allows spec.params to override variant defaults', () => {
            const input = new Text_Input({
                context,
                variant: 'compact',
                params: { size: 'large' }  // Override compact's small size
            });

            expect(input._theme_params.size).to.equal('large');
            // But keep other compact defaults
            expect(input._theme_params.label_position).to.equal('left');
        });
    });

    describe('context theme params', () => {
        it('inherits params from context.theme', () => {
            context.theme = {
                params: {
                    text_input: {
                        fill_style: 'filled'
                    }
                }
            };

            const input = new Text_Input({ context });

            expect(input._theme_params.fill_style).to.equal('filled');
        });

        it('spec.params overrides theme params', () => {
            context.theme = {
                params: {
                    text_input: {
                        fill_style: 'filled'
                    }
                }
            };

            const input = new Text_Input({
                context,
                params: { fill_style: 'underline' }
            });

            expect(input._theme_params.fill_style).to.equal('underline');
        });
    });

    describe('backward compatibility', () => {
        it('works with spec.placeholder', () => {
            const input = new Text_Input({
                context,
                placeholder: 'Enter text...'
            });

            expect(input.dom.attributes.placeholder).to.equal('Enter text...');
        });

        it('works with spec.value', () => {
            const input = new Text_Input({
                context,
                value: 'Hello'
            });

            expect(input.dom.attributes.value).to.equal('Hello');
        });

        it('still renders as input element', () => {
            const input = new Text_Input({ context });
            const html = input.all_html_render();

            expect(html).to.include('<input');
            expect(html).to.include('type="text"');
        });

        it('has text-input class', () => {
            const input = new Text_Input({ context });
            const html = input.all_html_render();

            expect(html).to.include('text-input');
        });
    });
});
