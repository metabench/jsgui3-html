const { expect } = require('chai');
const controls = require('../../controls/controls');

describe('Theme System', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('applies theme context tokens and overrides', () => {
        context.theme = {
            name: 'dark',
            tokens: {
                color_bg: '#111111',
                color_primary: '#ff0000'
            }
        };

        const panel = new controls.Panel({
            context,
            theme_overrides: {
                color_text: '#222222'
            }
        });

        expect(panel.dom.attributes['data-theme']).to.equal('dark');
        expect(panel.dom.attributes.style['--theme-color-bg']).to.equal('#111111');
        expect(panel.dom.attributes.style['--theme-color-primary']).to.equal('#ff0000');
        expect(panel.dom.attributes.style['--theme-color-text']).to.equal('#222222');
    });
});
