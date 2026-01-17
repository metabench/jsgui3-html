/**
 * Window Theme Variants Unit Tests
 */

require('../setup');
const { expect } = require('chai');

describe('Window Theme Variants', () => {
    let Window, context;

    before(() => {
        // Load Window after the test helpers are set up
        Window = require('../../controls/organised/1-standard/6-layout/window');
    });

    beforeEach(() => {
        context = createTestContext();
    });

    describe('default variant', () => {
        it('creates buttons in default order (minimize, maximize, close)', () => {
            const win = new Window({ context, title: 'Test' });

            // Default variant should have right-aligned buttons
            expect(win._theme_params.button_position).to.equal('right');
            expect(win._theme_params.button_order).to.deep.equal(['minimize', 'maximize', 'close']);
            expect(win._theme_params.button_style).to.equal('icons');
        });

        it('creates all three buttons by default', () => {
            const win = new Window({ context, title: 'Test' });

            expect(win._ctrl_fields.btn_minimize).to.exist;
            expect(win._ctrl_fields.btn_maximize).to.exist;
            expect(win._ctrl_fields.btn_close).to.exist;
        });
    });

    describe('macos variant', () => {
        it('creates buttons in macos order (close, minimize, maximize)', () => {
            const win = new Window({
                context,
                title: 'Test',
                variant: 'macos'
            });

            expect(win._theme_params.button_position).to.equal('left');
            expect(win._theme_params.button_order).to.deep.equal(['close', 'minimize', 'maximize']);
            expect(win._theme_params.button_style).to.equal('traffic-light');
        });
    });

    describe('minimal variant', () => {
        it('only shows close button', () => {
            const win = new Window({
                context,
                title: 'Test',
                variant: 'minimal'
            });

            expect(win._theme_params.show_minimize).to.equal(false);
            expect(win._theme_params.show_maximize).to.equal(false);
            expect(win._theme_params.show_close).to.equal(true);

            // btn_minimize and btn_maximize should be undefined
            expect(win._ctrl_fields.btn_minimize).to.be.undefined;
            expect(win._ctrl_fields.btn_maximize).to.be.undefined;
            expect(win._ctrl_fields.btn_close).to.exist;
        });
    });

    describe('spec.params overrides', () => {
        it('allows overriding individual params', () => {
            const win = new Window({
                context,
                title: 'Test',
                variant: 'macos',
                params: {
                    button_style: 'outlined'  // Override from macos default
                }
            });

            // Should keep macos position but use overridden style
            expect(win._theme_params.button_position).to.equal('left');
            expect(win._theme_params.button_style).to.equal('outlined');
        });
    });

    describe('context.theme.params', () => {
        it('applies theme params from context', () => {
            context.theme = {
                params: {
                    window: {
                        button_position: 'left',
                        title_alignment: 'center'
                    }
                }
            };

            const win = new Window({ context, title: 'Test' });

            expect(win._theme_params.button_position).to.equal('left');
            expect(win._theme_params.title_alignment).to.equal('center');
        });
    });

    describe('backward compatibility', () => {
        it('respects spec.show_buttons = false', () => {
            const win = new Window({
                context,
                title: 'Test',
                show_buttons: false
            });

            expect(win._ctrl_fields.btn_minimize).to.be.undefined;
            expect(win._ctrl_fields.btn_maximize).to.be.undefined;
            expect(win._ctrl_fields.btn_close).to.be.undefined;
        });

        it('works without any params (pure default)', () => {
            const win = new Window({ context });

            // Should behave exactly like before the refactor
            expect(win._theme_params.button_position).to.equal('right');
            expect(win._theme_params.button_style).to.equal('icons');
            expect(win._ctrl_fields.btn_minimize).to.exist;
            expect(win._ctrl_fields.btn_maximize).to.exist;
            expect(win._ctrl_fields.btn_close).to.exist;
        });
    });
});
