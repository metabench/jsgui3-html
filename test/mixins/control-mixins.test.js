/**
 * Control Mixin Tests
 * 
 * Tests mixins like selectable, draggable, resizable, etc.
 */

const { expect } = require('chai');
const sinon = require('sinon');
const jsgui = require('../../html-core/html-core');

describe('Control Mixin Tests', () => {
    let context;
    
    beforeEach(() => {
        context = createTestContext();
    });
    
    afterEach(() => {
        cleanup();
    });
    
    describe('Selectable Mixin', () => {
        let Selectable;
        
        before(() => {
            try {
                Selectable = require('../../control_mixins/selectable');
            } catch (e) {
                console.warn('Selectable mixin not found, skipping tests');
            }
        });
        
        it('should make control selectable', function() {
            if (!Selectable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            control.dom.el = document.createElement('div');
            
            // Apply mixin
            Selectable(control);
            control.selectable = true;
            
            expect(typeof control.select).to.equal('function');
            expect(typeof control.deselect).to.equal('function');
        });
        
        it('should select and deselect control', function() {
            if (!Selectable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            control.dom.el = document.createElement('div');
            
            Selectable(control);
            control.selectable = true;
            
            control.action_select_only();
            expect(control.has_class('selected')).to.equal(true);
            
            control.selected = false;
            expect(!!control.has_class('selected')).to.equal(false);
        });
        
        it('should emit selection events', function(done) {
            if (!Selectable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            control.dom.el = document.createElement('div');
            
            Selectable(control);
            control.selectable = true;
            
            control.on('select', () => done());
            control.select();
        });
    });
    
    describe('Draggable Mixin', () => {
        let Draggable;
        
        before(() => {
            try {
                Draggable = require('../../control_mixins/dragable');
            } catch (e) {
                console.warn('Draggable mixin not found, skipping tests');
            }
        });
        
        it('should make control draggable', function() {
            if (!Draggable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Draggable(control);
            
            expect('dragable' in control).to.equal(true);
        });
    });
    
    describe('Resizable Mixin', () => {
        let Resizable;
        
        before(() => {
            try {
                Resizable = require('../../control_mixins/resizable');
            } catch (e) {
                console.warn('Resizable mixin not found, skipping tests');
            }
        });
        
        it('should make control resizable', function() {
            if (!Resizable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });

            expect(() => Resizable(control)).to.not.throw();
            expect('resizable' in control).to.equal(true);
            expect(control.resizable).to.equal(true);
            expect(control.ctrl_br_resize_handle).to.exist;
        });
    });
    
    describe('Popup Mixin', () => {
        let Popup;
        
        before(() => {
            try {
                Popup = require('../../control_mixins/popup');
            } catch (e) {
                console.warn('Popup mixin not found, skipping tests');
            }
        });
        
        it('should create popup control', function() {
            if (!Popup) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Popup(control);
            
            expect(typeof control.popup).to.equal('function');
        });
    });
    
    describe('Pressed State Mixin', () => {
        let PressedState;
        
        before(() => {
            try {
                PressedState = require('../../control_mixins/pressed-state');
            } catch (e) {
                console.warn('Pressed state mixin not found, skipping tests');
            }
        });
        
        it('should track pressed state', function() {
            if (!PressedState) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'button'
            });
            
            PressedState(control);
            
            control.trigger('press-start');
            expect(control.view.data.model.state).to.equal('pressed');
        });
        
        it('should add pressed class on mousedown', function() {
            if (!PressedState) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'button'
            });
            
            PressedState(control);
            control.trigger('press-start');
            
            expect(control.has_class('pressed')).to.be.true;
        });
        
        it('should remove pressed class on mouseup', function() {
            if (!PressedState) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'button'
            });
            
            PressedState(control);
            control.trigger('press-start');
            control.trigger('press-end');
            
            expect(!!control.has_class('pressed')).to.equal(false);
        });
    });
    
    describe('Display Modes Mixin', () => {
        let DisplayModes;
        
        before(() => {
            try {
                DisplayModes = require('../../control_mixins/display-modes');
            } catch (e) {
                console.warn('Display modes mixin not found, skipping tests');
            }
        });
        
        it('should set display mode', function() {
            if (!DisplayModes) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            DisplayModes(control);
            
            expect(control).to.exist;
        });
    });
    
    describe('Bind Mixin', () => {
        let Bind;
        
        before(() => {
            try {
                Bind = require('../../control_mixins/bind');
            } catch (e) {
                console.warn('Bind mixin not found, skipping tests');
            }
        });
        
        it('should provide bind functionality', function() {
            if (!Bind) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Bind(control);
            
            expect(typeof control.bind).to.equal('function');
        });
    });
    
    describe('Coverable Mixin', () => {
        let Coverable;
        
        before(() => {
            try {
                Coverable = require('../../control_mixins/coverable');
            } catch (e) {
                console.warn('Coverable mixin not found, skipping tests');
            }
        });
        
        it('should add cover functionality', function() {
            if (!Coverable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Coverable(control);
            
            expect(typeof control.cover).to.equal('function');
            expect(typeof control.uncover).to.equal('function');
        });
        
        it('should cover and uncover control', function() {
            if (!Coverable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Coverable(control);

            const content_ctrl = new jsgui.Control({
                context,
                tagName: 'div'
            });
            control.add(content_ctrl);

            const cover_ctrl = control.cover(content_ctrl);
            expect(cover_ctrl).to.exist;
            expect(cover_ctrl.has_class('cover')).to.equal(true);
            expect(control.content._arr).to.include(cover_ctrl);

            control.uncover();
            expect(control.content._arr).to.not.include(cover_ctrl);
        });
    });
    
    describe('Multiple Mixins', () => {
        it('should combine multiple mixins on same control', function() {
            let Selectable, Draggable;
            
            try {
                Selectable = require('../../control_mixins/selectable');
                Draggable = require('../../control_mixins/dragable');
            } catch (e) {
                this.skip();
            }
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            control.dom.el = document.createElement('div');
            Selectable(control);
            // Apply draggable in non-DOM mode to avoid requiring context.body()
            control.dom.el = null;
            Draggable(control);
            control.selectable = true;
            
            expect(typeof control.action_select_only).to.equal('function');
            // Both mixins should work together
        });
        
        it('should not conflict when combining mixins', function() {
            let Selectable, PressedState;
            
            try {
                Selectable = require('../../control_mixins/selectable');
                PressedState = require('../../control_mixins/pressed-state');
            } catch (e) {
                this.skip();
            }
            
            const control = new jsgui.Control({
                context,
                tagName: 'button'
            });
            control.dom.el = document.createElement('button');
            
            Selectable(control);
            PressedState(control);
            control.selectable = true;
            
            control.action_select_only();
            expect(control.has_class('selected')).to.equal(true);
            
            // Pressed state should still work
            control.trigger('press-start');
            
            // Both classes should be present
            expect(control.has_class('selected')).to.equal(true);
            expect(control.has_class('pressed')).to.equal(true);
        });
    });
});
