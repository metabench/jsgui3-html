/**
 * Panel Theme Integration Tests
 */

require('../setup');
const { expect } = require('chai');

describe('Panel Theme Integration', () => {
    let Panel, context;

    before(() => {
        Panel = require('../../controls/organised/1-standard/6-layout/panel');
    });

    beforeEach(() => {
        context = createTestContext();
    });

    describe('default variant', () => {
        it('uses default params', () => {
            const panel = new Panel({ context });
            expect(panel._theme_params).to.exist;
            expect(panel._theme_params.padding).to.equal('medium');
            expect(panel._theme_params.border).to.equal(false);
        });

        it('applies padding tokens', () => {
            const panel = new Panel({ context });
            expect(panel.dom.attributes.style['--panel-padding']).to.equal('16px');
        });
    });

    describe('card variant', () => {
        it('applies card params', () => {
            const panel = new Panel({ context, variant: 'card', title: 'Card' });
            expect(panel._theme_params.border).to.equal(true);
            expect(panel._theme_params.shadow).to.equal('small');
            expect(panel._theme_params.radius).to.equal('medium');
        });

        it('adds bordered class', () => {
            const panel = new Panel({ context, variant: 'card' });
            const html = panel.all_html_render();
            expect(html).to.include('bordered');
        });

        it('sets data-variant attribute', () => {
            const panel = new Panel({ context, variant: 'card' });
            expect(panel.dom.attributes['data-variant']).to.equal('card');
        });
    });

    describe('elevated variant', () => {
        it('applies large shadow and radius', () => {
            const panel = new Panel({ context, variant: 'elevated' });
            expect(panel._theme_params.shadow).to.equal('large');
            expect(panel._theme_params.radius).to.equal('large');
            expect(panel._theme_params.padding).to.equal('large');
        });
    });

    describe('flush variant', () => {
        it('has no padding', () => {
            const panel = new Panel({ context, variant: 'flush' });
            expect(panel._theme_params.padding).to.equal('none');
            expect(panel.dom.attributes.style['--panel-padding']).to.equal('0');
        });
    });

    describe('title and header', () => {
        it('creates header when title is provided', () => {
            const panel = new Panel({ context, title: 'My Panel' });
            expect(panel._ctrl_fields.header).to.exist;
            expect(panel._ctrl_fields.title).to.exist;
        });

        it('includes title in rendered HTML', () => {
            const panel = new Panel({ context, title: 'My Panel' });
            const html = panel.all_html_render();
            expect(html).to.include('My Panel');
            expect(html).to.include('panel-header');
            expect(html).to.include('panel-title');
        });

        it('respects header=false param', () => {
            const panel = new Panel({
                context,
                title: 'Hidden Header',
                params: { header: false }
            });
            expect(panel._ctrl_fields.header).to.be.undefined;
        });
    });

    describe('content', () => {
        it('creates content container', () => {
            const panel = new Panel({ context });
            expect(panel.content_container).to.exist;
            expect(panel._ctrl_fields.content).to.exist;
        });

        it('adds initial content', () => {
            const panel = new Panel({ context, content: 'Hello World' });
            const html = panel.all_html_render();
            expect(html).to.include('Hello World');
        });
    });

    describe('collapsible variant', () => {
        it('has collapsible flag set', () => {
            const panel = new Panel({ context, variant: 'collapsible', title: 'Collapsible' });
            expect(panel._collapsible).to.equal(true);
        });

        it('can toggle collapsed state', () => {
            const panel = new Panel({ context, variant: 'collapsible', title: 'Collapsible' });
            expect(panel._collapsed).to.equal(false);
            panel.toggle_collapsed();
            expect(panel._collapsed).to.equal(true);
        });
    });

    describe('context theme params', () => {
        it('applies theme-level defaults', () => {
            context.theme = {
                params: { panel: { padding: 'large', shadow: 'medium' } }
            };
            const panel = new Panel({ context });
            expect(panel._theme_params.padding).to.equal('large');
            expect(panel._theme_params.shadow).to.equal('medium');
        });
    });

    describe('backward compatibility', () => {
        it('works with basic spec', () => {
            const panel = new Panel({ context, name: 'test-panel' });
            expect(panel.name).to.equal('test-panel');
        });

        it('supports resizable option', () => {
            const panel = new Panel({ context, resizable: true });
            expect(panel.resizable_enabled).to.equal(true);
        });
    });
});
