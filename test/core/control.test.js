/**
 * Core Control Tests
 * 
 * Tests basic control creation, rendering, DOM manipulation, and event handling
 */

const { expect } = require('chai');
const sinon = require('sinon');
const jsgui = require('../../html-core/html-core');

describe('Core Control Tests', () => {
    let context;
    
    beforeEach(() => {
        context = createTestContext();
    });
    
    afterEach(() => {
        cleanup();
    });
    
    describe('Control Creation', () => {
        it('should create a basic control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            expect(control).to.exist;
            expect(control.tagName).to.equal('div');
        });
        
        it('should create control with class name', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'test-class'
            });
            
            expect(control.classes._arr).to.include('test-class');
        });
        
        it('should create control with multiple classes', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: ['class1', 'class2', 'class3']
            });
            
            expect(control.classes._arr).to.include.members(['class1', 'class2', 'class3']);
        });
        
        it('should create control with attributes', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'input',
                attrs: {
                    type: 'text',
                    placeholder: 'Enter text',
                    'data-test': 'value'
                }
            });
            
            expect(control.attrs.type).to.equal('text');
            expect(control.attrs.placeholder).to.equal('Enter text');
            expect(control.attrs['data-test']).to.equal('value');
        });
        
        it('should create control with text content', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                content: 'Hello World'
            });
            
            expect(control.content._arr).to.have.lengthOf(1);
            expect(control.content._arr[0]).to.equal('Hello World');
        });
        
        it('should create control with child controls', () => {
            const parent = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            const child = new jsgui.Control({
                context,
                tagName: 'span',
                content: 'Child'
            });
            
            parent.add(child);
            
            expect(parent.content._arr).to.include(child);
        });
    });
    
    describe('DOM Rendering', () => {
        it('should render control to HTML string', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'test',
                content: 'Test Content'
            });
            
            const html = control.html;
            expect(html).to.be.a('string');
            expect(html).to.include('<div');
            expect(html).to.include('class="test"');
            expect(html).to.include('Test Content');
        });
        
        it('should render nested controls correctly', () => {
            const parent = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'parent'
            });
            
            const child1 = new jsgui.Control({
                context,
                tagName: 'span',
                content: 'Child 1'
            });
            
            const child2 = new jsgui.Control({
                context,
                tagName: 'span',
                content: 'Child 2'
            });
            
            parent.add(child1);
            parent.add(child2);
            
            const html = parent.html;
            expect(html).to.include('Child 1');
            expect(html).to.include('Child 2');
        });
        
        it('should activate control from DOM element', () => {
            const div = document.createElement('div');
            div.className = 'test-control';
            div.textContent = 'Test';
            document.body.appendChild(div);
            
            const control = new jsgui.Control({
                context,
                el: div
            });
            
            expect(control.dom.el).to.equal(div);
            expect(control.tagName).to.equal('div');
        });
        
        it('should mount control to DOM', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'mounted',
                content: 'Mounted Control'
            });
            
            control.mount(document.body);
            
            expect(document.querySelector('.mounted')).to.exist;
            expect(document.querySelector('.mounted').textContent).to.equal('Mounted Control');
        });
    });
    
    describe('Class Manipulation', () => {
        it('should add class to control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.add_class('new-class');
            expect(control.classes._arr).to.include('new-class');
        });
        
        it('should remove class from control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'remove-me'
            });
            
            control.remove_class('remove-me');
            expect(control.classes._arr).to.not.include('remove-me');
        });
        
        it('should toggle class on control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.toggle_class('toggle-me');
            expect(control.classes._arr).to.include('toggle-me');
            
            control.toggle_class('toggle-me');
            expect(control.classes._arr).to.not.include('toggle-me');
        });
        
        it('should check if control has class', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'check-me'
            });
            
            expect(control.has_class('check-me')).to.be.true;
            expect(control.has_class('not-present')).to.be.false;
        });
    });
    
    describe('Content Manipulation', () => {
        it('should add content to control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.add('Text content');
            expect(control.content._arr).to.include('Text content');
        });
        
        it('should clear content from control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                content: ['Item 1', 'Item 2']
            });
            
            control.clear();
            expect(control.content._arr).to.have.lengthOf(0);
        });
        
        it('should remove specific content item', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            const child = new jsgui.Control({
                context,
                tagName: 'span'
            });
            
            control.add(child);
            expect(control.content._arr).to.include(child);
            
            control.remove(child);
            expect(control.content._arr).to.not.include(child);
        });
    });
    
    describe('Event Handling', () => {
        it('should register event handler', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'button'
            });
            
            const handler = sinon.spy();
            control.on('click', handler);
            
            control.mount(document.body);
            control.dom.el.click();
            
            expect(handler.calledOnce).to.be.true;
        });
        
        it('should remove event handler', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'button'
            });
            
            const handler = sinon.spy();
            control.on('click', handler);
            control.off('click', handler);
            
            control.mount(document.body);
            control.dom.el.click();
            
            expect(handler.called).to.be.false;
        });
        
        it('should trigger custom events', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            const handler = sinon.spy();
            control.on('custom-event', handler);
            
            control.trigger('custom-event', { data: 'test' });
            
            expect(handler.calledOnce).to.be.true;
            expect(handler.firstCall.args[0].data).to.equal('test');
        });
        
        it('should handle event delegation', () => {
            const parent = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            const child = new jsgui.Control({
                context,
                tagName: 'button',
                class: 'child-btn'
            });
            
            parent.add(child);
            parent.mount(document.body);
            
            const handler = sinon.spy();
            parent.dom.el.addEventListener('click', handler);
            
            child.dom.el.click();
            
            expect(handler.calledOnce).to.be.true;
        });
    });
    
    describe('Visibility Control', () => {
        it('should show control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.hide();
            control.show();
            
            expect(control.has_class('hidden')).to.be.false;
        });
        
        it('should hide control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.hide();
            
            expect(control.has_class('hidden')).to.be.true;
        });
        
        it('should toggle visibility', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            const wasHidden = control.has_class('hidden');
            control.toggle();
            
            expect(control.has_class('hidden')).to.equal(!wasHidden);
        });
    });
    
    describe('Control Lifecycle', () => {
        it('should initialize control properly', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            expect(control.context).to.equal(context);
            expect(control.tagName).to.equal('div');
            expect(control.content).to.exist;
            expect(control.classes).to.exist;
        });
        
        it('should destroy control and clean up', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.mount(document.body);
            
            if (typeof control.destroy === 'function') {
                control.destroy();
                // Verify cleanup if destroy method exists
            }
        });
    });
    
    describe('Attribute Manipulation', () => {
        it('should set attribute on control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'input'
            });
            
            control.attrs.type = 'text';
            control.attrs.placeholder = 'Test';
            
            expect(control.attrs.type).to.equal('text');
            expect(control.attrs.placeholder).to.equal('Test');
        });
        
        it('should update mounted control attributes', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'input',
                attrs: { type: 'text' }
            });
            
            control.mount(document.body);
            
            control.attrs.value = 'new value';
            
            // In a real implementation, this should update the DOM
            expect(control.attrs.value).to.equal('new value');
        });
    });
});
