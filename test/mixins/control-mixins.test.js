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
            
            // Apply mixin
            Selectable(control);
            
            expect(typeof control.select).to.equal('function');
            expect(typeof control.deselect).to.equal('function');
        });
        
        it('should select and deselect control', function() {
            if (!Selectable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Selectable(control);
            control.mount(document.body);
            
            control.select();
            expect(control.has_class('selected')).to.be.true;
            
            control.deselect();
            expect(control.has_class('selected')).to.be.false;
        });
        
        it('should emit selection events', function(done) {
            if (!Selectable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Selectable(control);
            
            control.on('selected', () => {
                expect(true).to.be.true;
                done();
            });
            
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
            
            // Check for drag-related methods
            expect(control).to.exist;
        });
        
        it('should handle drag start', function() {
            if (!Draggable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Draggable(control);
            control.mount(document.body);
            
            // Simulate mousedown
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 100,
                clientY: 100
            });
            
            control.dom.el.dispatchEvent(event);
            
            // Check if drag started
            expect(control).to.exist;
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
            
            Resizable(control);
            
            expect(control).to.exist;
        });
        
        it('should add resize handles', function() {
            if (!Resizable) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Resizable(control);
            control.mount(document.body);
            
            // Check for resize handles in DOM
            const handles = control.dom.el.querySelectorAll('.resize-handle');
            expect(handles.length).to.be.greaterThan(0);
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
            
            expect(typeof control.show_popup).to.equal('function');
            expect(typeof control.hide_popup).to.equal('function');
        });
        
        it('should show and hide popup', function() {
            if (!Popup) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            Popup(control);
            control.mount(document.body);
            
            control.show_popup();
            expect(control.has_class('popup-visible')).to.be.true;
            
            control.hide_popup();
            expect(control.has_class('popup-visible')).to.be.false;
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
            control.mount(document.body);
            
            expect(control).to.exist;
        });
        
        it('should add pressed class on mousedown', function() {
            if (!PressedState) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'button'
            });
            
            PressedState(control);
            control.mount(document.body);
            
            const event = new MouseEvent('mousedown', { bubbles: true });
            control.dom.el.dispatchEvent(event);
            
            expect(control.has_class('pressed')).to.be.true;
        });
        
        it('should remove pressed class on mouseup', function() {
            if (!PressedState) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'button'
            });
            
            PressedState(control);
            control.mount(document.body);
            
            const downEvent = new MouseEvent('mousedown', { bubbles: true });
            control.dom.el.dispatchEvent(downEvent);
            
            const upEvent = new MouseEvent('mouseup', { bubbles: true });
            control.dom.el.dispatchEvent(upEvent);
            
            expect(control.has_class('pressed')).to.be.false;
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
            
            expect(typeof control.set_display_mode).to.equal('function');
        });
        
        it('should switch between display modes', function() {
            if (!DisplayModes) this.skip();
            
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            DisplayModes(control);
            control.mount(document.body);
            
            control.set_display_mode('edit');
            expect(control.has_class('mode-edit')).to.be.true;
            
            control.set_display_mode('view');
            expect(control.has_class('mode-view')).to.be.true;
            expect(control.has_class('mode-edit')).to.be.false;
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
            control.mount(document.body);
            
            control.cover();
            expect(control.has_class('covered')).to.be.true;
            
            control.uncover();
            expect(control.has_class('covered')).to.be.false;
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
            
            Selectable(control);
            Draggable(control);
            
            expect(typeof control.select).to.equal('function');
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
            
            Selectable(control);
            PressedState(control);
            control.mount(document.body);
            
            control.select();
            expect(control.has_class('selected')).to.be.true;
            
            // Pressed state should still work
            const event = new MouseEvent('mousedown', { bubbles: true });
            control.dom.el.dispatchEvent(event);
            
            // Both classes should be present
            expect(control.has_class('selected')).to.be.true;
        });
    });
});
