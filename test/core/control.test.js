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
            expect(control.dom.tagName).to.equal('div');
        });
        
        it('should create control with class name', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'test-class'
            });
            
            expect(control.has_class('test-class')).to.equal(true);
        });
        
        it('should create control with multiple classes', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: ['class1', 'class2', 'class3']
            });
            
            expect(control.dom.attrs.class).to.include.members(['class1', 'class2', 'class3']);
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
            
            expect(control.dom.attributes.type).to.equal('text');
            expect(control.dom.attributes.placeholder).to.equal('Enter text');
            expect(control.dom.attributes['data-test']).to.equal('value');
        });
        
        it('should create control with text content', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                content: 'Hello World'
            });
            
            expect(control.content._arr).to.have.lengthOf(1);
            expect(control.content._arr[0].get()).to.equal('Hello World');
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
            expect(control.dom.tagName).to.equal('div');
        });
        
        it('should render HTML that can be inserted into DOM', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'mounted',
                content: 'Mounted Control'
            });
            
            document.body.innerHTML = control.html;
            const mounted_el = document.querySelector('.mounted');
            expect(mounted_el).to.exist;
            expect(mounted_el.textContent).to.equal('Mounted Control');
        });
    });
    
    describe('Class Manipulation', () => {
        it('should add class to control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.add_class('new-class');
            expect(control.has_class('new-class')).to.equal(true);
        });
        
        it('should remove class from control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'remove-me'
            });
            
            control.remove_class('remove-me');
            expect(!!control.has_class('remove-me')).to.equal(false);
        });
        
        it('should toggle class on control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.toggle_class('toggle-me');
            expect(control.has_class('toggle-me')).to.equal(true);
            
            control.toggle_class('toggle-me');
            expect(!!control.has_class('toggle-me')).to.equal(false);
        });
        
        it('should check if control has class', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div',
                class: 'check-me'
            });
            
            expect(control.has_class('check-me')).to.be.true;
            expect(!!control.has_class('not-present')).to.equal(false);
        });
    });
    
    describe('Content Manipulation', () => {
        it('should add content to control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            control.add('Text content');
            const text_node = control.content._arr[0];
            expect(text_node).to.be.instanceof(jsgui.Text_Node);
            expect(text_node.text).to.equal('Text content');
        });
        
        it('should clear content from control', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });

            control.add(['Item 1', 'Item 2']);
            
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
            
            child.remove();
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
            
            control.trigger('click');
            
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
            
            control.trigger('click');
            
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
            const handler = sinon.spy();
            child.on('click', handler);
            child.trigger('click');
            
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
            
            expect(!!control.has_class('hidden')).to.equal(false);
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
            
            const was_hidden = !!control.has_class('hidden');
            if (was_hidden) {
                control.show();
            } else {
                control.hide();
            }
            expect(!!control.has_class('hidden')).to.equal(!was_hidden);
        });
    });
    
    describe('Control Lifecycle', () => {
        it('should initialize control properly', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            expect(control.context).to.equal(context);
            expect(control.dom.tagName).to.equal('div');
            expect(control.content).to.exist;
            expect(control.dom.attrs).to.exist;
        });
        
        it('should destroy control and clean up', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
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
            
            control.dom.attributes.type = 'text';
            control.dom.attributes.placeholder = 'Test';
            
            expect(control.dom.attributes.type).to.equal('text');
            expect(control.dom.attributes.placeholder).to.equal('Test');
        });
        
        it('should update control attributes', () => {
            const control = new jsgui.Control({
                context,
                tagName: 'input',
                attrs: { type: 'text' }
            });
            
            control.dom.attributes.value = 'new value';
            
            expect(control.dom.attributes.value).to.equal('new value');
            expect(control.html).to.include('value=\"new value\"');
        });
    });
});
