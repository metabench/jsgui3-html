/**
 * Tooltip Component Tests
 *
 * Tests for rendering, configuration, and ARIA attributes.
 * Uses the shared test setup (JSDOM, chai, createTestContext).
 *
 * Run:  cd test && npx mocha controls/tooltip.test.js --timeout 5000
 */

const { expect } = require('chai');

// Ensure test setup is loaded
require('../setup');

const Tooltip = require('../../controls/organised/1-standard/5-ui/tooltip');

describe('Tooltip', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    // ── Construction ──────────────────────────────────────

    describe('constructor', () => {
        it('should instantiate with minimal spec', () => {
            const tip = new Tooltip({ context });
            expect(tip).to.exist;
        });

        it('should set message from spec.message', () => {
            const tip = new Tooltip({ context, message: 'Hello' });
            expect(tip.message).to.equal('Hello');
        });

        it('should set message from spec.text as fallback', () => {
            const tip = new Tooltip({ context, text: 'Fallback text' });
            expect(tip.message).to.equal('Fallback text');
        });

        it('should default placement to "top"', () => {
            const tip = new Tooltip({ context });
            expect(tip.placement).to.equal('top');
        });

        it('should accept custom placement', () => {
            const tip = new Tooltip({ context, placement: 'bottom' });
            expect(tip.placement).to.equal('bottom');
        });

        it('should default show_delay to 400ms', () => {
            const tip = new Tooltip({ context });
            expect(tip.show_delay).to.equal(400);
        });

        it('should accept custom delay', () => {
            const tip = new Tooltip({ context, delay: 200 });
            expect(tip.show_delay).to.equal(200);
        });

        it('should default max_width to 280', () => {
            const tip = new Tooltip({ context });
            expect(tip.max_width).to.equal(280);
        });

        it('should accept custom max_width', () => {
            const tip = new Tooltip({ context, max_width: 200 });
            expect(tip.max_width).to.equal(200);
        });
    });

    // ── HTML Output ───────────────────────────────────────

    describe('rendering', () => {
        it('should include the jsgui-tooltip class', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            expect(tip.html).to.include('jsgui-tooltip');
        });

        it('should include the placement class', () => {
            const tip = new Tooltip({ context, message: 'Test', placement: 'bottom' });
            expect(tip.html).to.include('jsgui-tooltip--bottom');
        });

        it('should include the message text in output', () => {
            const tip = new Tooltip({ context, message: 'Save changes' });
            expect(tip.html).to.include('Save changes');
        });

        it('should render as a div', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            expect(tip.html).to.include('<div');
        });
    });

    // ── ARIA Attributes ──────────────────────────────────

    describe('ARIA', () => {
        it('should have role="tooltip"', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            expect(tip.html).to.include('role="tooltip"');
        });

        it('should have aria-hidden="true" by default', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            expect(tip.html).to.include('aria-hidden="true"');
        });

        it('should have a unique id', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            expect(tip.html).to.match(/id="[^"]+"/);
        });
    });

    // ── Show / Hide ──────────────────────────────────────

    describe('show / hide', () => {
        it('should add is-visible class on immediate show', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            tip.show(true);
            expect(tip.html).to.include('is-visible');
        });

        it('should remove is-visible class on immediate hide', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            tip.show(true);
            tip.hide(true);
            expect(tip.html).to.not.include('is-visible');
        });

        it('should set aria-hidden to false when shown', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            tip.show(true);
            expect(tip.dom.attributes['aria-hidden']).to.equal('false');
        });

        it('should set aria-hidden to true when hidden', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            tip.show(true);
            tip.hide(true);
            expect(tip.dom.attributes['aria-hidden']).to.equal('true');
        });
    });

    // ── set_message ──────────────────────────────────────

    describe('set_message', () => {
        it('should update the message text', () => {
            const tip = new Tooltip({ context, message: 'Old' });
            tip.set_message('New');
            expect(tip.message).to.equal('New');
        });

        it('should update rendered HTML', () => {
            const tip = new Tooltip({ context, message: 'Old' });
            tip.set_message('New message');
            expect(tip.html).to.include('New message');
        });

        it('should handle empty string', () => {
            const tip = new Tooltip({ context, message: 'Test' });
            tip.set_message('');
            expect(tip.message).to.equal('');
        });
    });

    // ── Static CSS ───────────────────────────────────────

    describe('CSS', () => {
        it('should have a static css property', () => {
            expect(Tooltip.css).to.be.a('string');
            expect(Tooltip.css.length).to.be.greaterThan(100);
        });

        it('should use CSS custom properties (var())', () => {
            expect(Tooltip.css).to.include('var(--j-tooltip-bg');
            expect(Tooltip.css).to.include('var(--j-tooltip-fg');
        });

        it('should define arrow styles for all placements', () => {
            expect(Tooltip.css).to.include('.jsgui-tooltip--top::after');
            expect(Tooltip.css).to.include('.jsgui-tooltip--bottom::after');
            expect(Tooltip.css).to.include('.jsgui-tooltip--left::after');
            expect(Tooltip.css).to.include('.jsgui-tooltip--right::after');
        });

        it('should define the is-visible state', () => {
            expect(Tooltip.css).to.include('.jsgui-tooltip.is-visible');
        });

        it('should NOT contain hardcoded hex colours', () => {
            // Only allow hex inside var() fallbacks
            const css_no_vars = Tooltip.css.replace(/var\([^)]+\)/g, '');
            const hex_matches = css_no_vars.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
            expect(hex_matches).to.have.lengthOf(0);
        });
    });
});
