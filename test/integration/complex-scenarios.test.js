/**
 * Integration Tests
 * 
 * Tests complex scenarios with multiple controls, nested structures, and real-world use cases
 */

const { expect } = require('chai');
const sinon = require('sinon');
const jsgui = require('../../html-core/html-core');
const { Data_Object } = jsgui;
const Data_Model_View_Model_Control = require('../../html-core/Data_Model_View_Model_Control');

describe('Integration Tests', () => {
    let context;
    
    beforeEach(() => {
        context = createTestContext();
    });
    
    afterEach(() => {
        cleanup();
    });
    
    describe('Complex Form with Validation', () => {
        class ComplexForm extends Data_Model_View_Model_Control {
            constructor(spec) {
                super(spec);
                
                this.data.model = new Data_Object({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                
                this.view.data.model = new Data_Object({
                    errors: {},
                    isValid: false
                });
                
                this.setupValidation();
            }
            
            setupValidation() {
                this.computed(
                    [this.data.model, this.view.data.model],
                    ['username', 'email', 'password', 'confirmPassword'],
                    (username, email, password, confirmPassword) => {
                        const errors = {};
                        
                        if (!username || username.length < 3) {
                            errors.username = 'Username must be at least 3 characters';
                        }
                        
                        if (!email || !email.includes('@')) {
                            errors.email = 'Invalid email address';
                        }
                        
                        if (!password || password.length < 8) {
                            errors.password = 'Password must be at least 8 characters';
                        }
                        
                        if (password !== confirmPassword) {
                            errors.confirmPassword = 'Passwords do not match';
                        }
                        
                        this.view.data.model.errors = errors;
                        this.view.data.model.isValid = Object.keys(errors).length === 0;
                        
                        return errors;
                    },
                    { propertyName: 'validationErrors', target: this.view.data.model }
                );
            }
        }
        
        it('should validate all fields', (done) => {
            const form = new ComplexForm({ context });
            
            setTimeout(() => {
                expect(form.view.data.model.isValid).to.be.false;
                
                form.data.model.username = 'testuser';
                form.data.model.email = 'test@example.com';
                form.data.model.password = 'password123';
                form.data.model.confirmPassword = 'password123';
                
                setTimeout(() => {
                    expect(form.view.data.model.isValid).to.be.true;
                    expect(Object.keys(form.view.data.model.errors)).to.have.lengthOf(0);
                    done();
                }, 100);
            }, 50);
        });
        
        it('should detect password mismatch', (done) => {
            const form = new ComplexForm({ context });
            
            form.data.model.username = 'testuser';
            form.data.model.email = 'test@example.com';
            form.data.model.password = 'password123';
            form.data.model.confirmPassword = 'different';
            
            setTimeout(() => {
                expect(form.view.data.model.errors.confirmPassword).to.exist;
                expect(form.view.data.model.isValid).to.be.false;
                done();
            }, 100);
        });
    });
    
    describe('Nested Component Communication', () => {
        class ParentControl extends Data_Model_View_Model_Control {
            constructor(spec) {
                super(spec);
                
                this.data.model = new Data_Object({
                    items: spec.items || []
                });
                
                this.children = [];
            }
            
            addChild(child) {
                this.children.push(child);
                this.add(child);
                
                // Listen to child events
                child.on('item-clicked', (data) => {
                    this.trigger('child-interaction', data);
                });
            }
        }
        
        class ChildControl extends Data_Model_View_Model_Control {
            constructor(spec) {
                super(spec);
                
                this.data.model = new Data_Object({
                    value: spec.value
                });
            }
            
            handleClick() {
                this.trigger('item-clicked', { value: this.data.model.value });
            }
        }
        
        it('should communicate between parent and children', (done) => {
            const parent = new ParentControl({
                context,
                items: [1, 2, 3]
            });
            
            const child1 = new ChildControl({ context, value: 'test' });
            parent.addChild(child1);
            
            parent.on('child-interaction', (data) => {
                expect(data.value).to.equal('test');
                done();
            });
            
            child1.handleClick();
        });
        
        it('should propagate data changes to all children', (done) => {
            const parent = new ParentControl({
                context,
                items: [1, 2, 3]
            });
            
            const children = [
                new ChildControl({ context, value: 1 }),
                new ChildControl({ context, value: 2 }),
                new ChildControl({ context, value: 3 })
            ];
            
            children.forEach(child => parent.addChild(child));
            
            // Bind all children to parent's first item
            children.forEach(child => {
                child.watch(
                    parent.data.model,
                    'items',
                    (new_items) => {
                        const arr = Array.isArray(new_items) ? new_items : [];
                        child.data.model.value = arr[0];
                    }
                );
            });
            
            parent.data.model.items = [100, 2, 3];
            
            setTimeout(() => {
                // All children should have updated
                children.forEach(child => {
                    expect(child.data.model.value).to.equal(100);
                });
                done();
            }, 100);
        });
    });
    
    describe('Dynamic List Rendering', () => {
        class DynamicList extends Data_Model_View_Model_Control {
            constructor(spec) {
                super(spec);
                
                this.data.model = new Data_Object({
                    items: spec.items || []
                });
                
                this.view.data.model = new Data_Object({
                    filterText: ''
                });
                
                this.setupFiltering();
                this.renderList();
            }
            
            setupFiltering() {
                this.computed(
                    [this.data.model, this.view.data.model],
                    ['items', 'filterText'],
                    (items, filter) => {
                        if (!filter) return items;
                        return items.filter(item => 
                            item.toLowerCase().includes(filter.toLowerCase())
                        );
                    },
                    { propertyName: 'filteredItems', target: this.view.data.model }
                );
            }
            
            renderList() {
                this.watch(
                    this.view.data.model,
                    'filteredItems',
                    (items) => {
                        this.clear();
                        
                        if (!items) return;
                        
                        items.forEach(item => {
                            const itemControl = new jsgui.Control({
                                context: this.context,
                                tagName: 'div',
                                class: 'list-item',
                                content: item
                            });
                            this.add(itemControl);
                        });
                    },
                    { immediate: true }
                );
            }
        }
        
        it('should render all items initially', (done) => {
            const list = new DynamicList({
                context,
                items: ['Apple', 'Banana', 'Cherry']
            });
            
            setTimeout(() => {
                expect(list.content._arr.length).to.equal(3);
                done();
            }, 100);
        });
        
        it('should filter items dynamically', (done) => {
            const list = new DynamicList({
                context,
                items: ['Apple', 'Banana', 'Cherry', 'Apricot']
            });
            
            setTimeout(() => {
                list.view.data.model.filterText = 'ap';
                
                setTimeout(() => {
                    expect(list.content._arr.length).to.equal(2); // Apple and Apricot
                    done();
                }, 100);
            }, 100);
        });
        
        it('should update when items are added', (done) => {
            const list = new DynamicList({
                context,
                items: ['Apple', 'Banana']
            });
            
            setTimeout(() => {
                list.data.model.items.push('Cherry');
                list.data.model.items = [...list.data.model.items]; // Trigger change
                
                setTimeout(() => {
                    expect(list.content._arr.length).to.equal(3);
                    done();
                }, 100);
            }, 100);
        });
    });
    
    describe('Master-Detail Pattern', () => {
        class MasterDetail extends Data_Model_View_Model_Control {
            constructor(spec) {
                super(spec);
                
                this.data.model = new Data_Object({
                    items: spec.items || [],
                    selectedId: null
                });
                
                this.view.data.model = new Data_Object({
                    selectedItem: null
                });
                
                this.setupSelection();
            }
            
            setupSelection() {
                this.computed(
                    this.data.model,
                    ['items', 'selectedId'],
                    (items, id) => {
                        if (!id || !items) return null;
                        return items.find(item => item.id === id);
                    },
                    { propertyName: 'selectedItem', target: this.view.data.model }
                );
            }
            
            selectItem(id) {
                this.data.model.selectedId = id;
            }
        }
        
        it('should select item from master list', (done) => {
            const items = [
                { id: 1, name: 'Item 1', description: 'First item' },
                { id: 2, name: 'Item 2', description: 'Second item' }
            ];
            
            const view = new MasterDetail({ context, items });
            
            setTimeout(() => {
                view.selectItem(1);
                
                setTimeout(() => {
                    expect(view.view.data.model.selectedItem).to.exist;
                    expect(view.view.data.model.selectedItem.id).to.equal(1);
                    done();
                }, 100);
            }, 50);
        });
        
        it('should update detail when selection changes', (done) => {
            const items = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ];
            
            const view = new MasterDetail({ context, items });
            
            setTimeout(() => {
                view.selectItem(1);
                
                setTimeout(() => {
                    expect(view.view.data.model.selectedItem.name).to.equal('Item 1');
                    
                    view.selectItem(2);
                    
                    setTimeout(() => {
                        expect(view.view.data.model.selectedItem.name).to.equal('Item 2');
                        done();
                    }, 100);
                }, 100);
            }, 50);
        });
    });
    
    describe('Data Transformation Pipeline', () => {
        class TransformPipeline extends Data_Model_View_Model_Control {
            constructor(spec) {
                super(spec);
                
                this.data.model = new Data_Object({
                    rawInput: ''
                });
                
                this.view.data.model = new Data_Object({
                    formatted: ''
                });
                
                this.setupPipeline();
            }
            
            setupPipeline() {
                // Chain multiple transformations
                this.bind({
                    'rawInput': {
                        to: 'formatted',
                        transform: (val) => {
                            // Trim, lowercase, then slugify
                            return this.transforms.string.slugify(
                                this.transforms.string.trim(val)
                            );
                        }
                    }
                });
            }
        }
        
        it('should apply transformation pipeline', (done) => {
            const pipeline = new TransformPipeline({ context });
            
            setTimeout(() => {
                pipeline.data.model.rawInput = '  Hello World!  ';
                
                setTimeout(() => {
                    expect(pipeline.view.data.model.formatted).to.equal('hello-world');
                    done();
                }, 100);
            }, 50);
        });
    });
    
    describe('Performance with Many Controls', () => {
        it('should handle 100 controls efficiently', function() {
            this.timeout(5000);
            
            const parent = new jsgui.Control({
                context,
                tagName: 'div'
            });
            
            const start = Date.now();
            
            for (let i = 0; i < 100; i++) {
                const child = new jsgui.Control({
                    context,
                    tagName: 'div',
                    content: `Item ${i}`
                });
                parent.add(child);
            }
            
            const duration = Date.now() - start;
            
            expect(parent.content._arr.length).to.equal(100);
            expect(duration).to.be.lessThan(1000); // Should complete in under 1 second
        });
        
        it('should handle 50 MVVM controls with bindings', function(done) {
            this.timeout(5000);
            
            class TestControl extends Data_Model_View_Model_Control {
                constructor(spec) {
                    super(spec);
                    
                    this.data.model = new Data_Object({
                        value: spec.value
                    });
                    
                    this.view.data.model = new Data_Object({
                        display: ''
                    });
                    
                    this.bind({
                        'value': {
                            to: 'display',
                            transform: (v) => `Value: ${v}`
                        }
                    });
                }
            }
            
            const controls = [];
            const start = Date.now();
            
            for (let i = 0; i < 50; i++) {
                controls.push(new TestControl({ context, value: i }));
            }
            
            setTimeout(() => {
                const duration = Date.now() - start;
                
                expect(controls.length).to.equal(50);
                expect(duration).to.be.lessThan(3000);
                done();
            }, 500);
        });
    });
    
    describe('Error Handling and Recovery', () => {
        it('should handle transformation errors gracefully', (done) => {
            class ErrorProneControl extends Data_Model_View_Model_Control {
                constructor(spec) {
                    super(spec);
                    
                    this.data.model = new Data_Object({
                        value: null
                    });
                    
                    this.view.data.model = new Data_Object({
                        result: ''
                    });
                    
                    this.bind({
                        'value': {
                            to: 'result',
                            transform: (v) => {
                                try {
                                    return v.toUpperCase();
                                } catch (e) {
                                    return 'ERROR';
                                }
                            }
                        }
                    });
                }
            }
            
            const control = new ErrorProneControl({ context });
            
            setTimeout(() => {
                expect(control.view.data.model.result).to.equal('ERROR');
                
                control.data.model.value = 'test';
                
                setTimeout(() => {
                    expect(control.view.data.model.result).to.equal('TEST');
                    done();
                }, 100);
            }, 50);
        });
    });
    
    describe('Memory Leak Prevention', () => {
        it('should clean up bindings on destroy', (done) => {
            class CleanupControl extends Data_Model_View_Model_Control {
                constructor(spec) {
                    super(spec);
                    
                    this.data.model = new Data_Object({
                        value: 0
                    });
                    
                    this.view.data.model = new Data_Object({
                        display: ''
                    });
                    
                    this.bind({
                        'value': {
                            to: 'display'
                        }
                    });
                }
            }
            
            const control = new CleanupControl({ context });
            
            setTimeout(() => {
                const initialBindings = control._binding_manager ? 
                    control._binding_manager._bindings.length : 0;
                
                if (typeof control.destroy === 'function') {
                    control.destroy();
                    
                    // Check that bindings are cleaned up
                    const afterBindings = control._binding_manager ? 
                        control._binding_manager._bindings.length : 0;
                    
                    expect(afterBindings).to.be.lessThan(initialBindings);
                }
                
                done();
            }, 50);
        });
    });
});
