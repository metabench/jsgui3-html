/**
 * MVVM Pattern Tests
 * 
 * Tests Data_Object, model binding, computed properties, and watchers
 */

const { expect } = require('chai');
const sinon = require('sinon');
const { Data_Object } = require('lang-tools');
const Data_Model_View_Model_Control = require('../../html-core/Data_Model_View_Model_Control');
const {
    ModelBinder,
    ComputedProperty,
    PropertyWatcher,
    BindingManager
} = require('../../html-core/ModelBinder');

describe('MVVM Pattern Tests', () => {
    let context;
    
    beforeEach(() => {
        context = createTestContext();
    });
    
    afterEach(() => {
        cleanup();
    });
    
    describe('Data_Object Basics', () => {
        it('should create Data_Object with initial values', () => {
            const data = new Data_Object({
                name: 'Test',
                age: 25,
                active: true
            });
            
            expect(data.name).to.equal('Test');
            expect(data.age).to.equal(25);
            expect(data.active).to.be.true;
        });
        
        it('should emit change events when properties change', (done) => {
            const data = new Data_Object({
                value: 10
            });
            
            data.on('change', (e) => {
                expect(e.name).to.equal('value');
                expect(e.value).to.equal(20);
                done();
            });
            
            data.value = 20;
        });
        
        it('should get and set nested properties', () => {
            const data = new Data_Object({
                user: {
                    name: 'John',
                    address: {
                        city: 'New York'
                    }
                }
            });
            
            expect(data.user.name).to.equal('John');
            expect(data.user.address.city).to.equal('New York');
            
            data.user.address.city = 'Boston';
            expect(data.user.address.city).to.equal('Boston');
        });
    });
    
    describe('Model Binding', () => {
        it('should create one-way binding from source to target', (done) => {
            const source = new Data_Object({ value: 10 });
            const target = new Data_Object({ value: 0 });
            
            const binder = new ModelBinder(source, target, {
                value: 'value'
            });
            
            setTimeout(() => {
                expect(target.value).to.equal(10);
                
                source.value = 20;
                
                setTimeout(() => {
                    expect(target.value).to.equal(20);
                    binder.unbind();
                    done();
                }, 10);
            }, 10);
        });
        
        it('should create two-way binding between models', (done) => {
            const model1 = new Data_Object({ value: 10 });
            const model2 = new Data_Object({ value: 20 });
            
            const binder = new ModelBinder(model1, model2, {
                value: {
                    to: 'value',
                    reverse: (val) => val
                }
            }, {
                bidirectional: true
            });
            
            setTimeout(() => {
                expect(model2.value).to.equal(10);
                model2.value = 30;
                
                setTimeout(() => {
                    expect(model1.value).to.equal(30);
                    binder.deactivate();
                    done();
                }, 10);
            }, 10);
        });
        
        it('should apply transformation during binding', (done) => {
            const source = new Data_Object({ value: 'hello' });
            const target = new Data_Object({ value: '' });
            
            const binder = new ModelBinder(source, target, {
                value: {
                    to: 'value',
                    transform: (val) => val.toUpperCase()
                }
            });
            
            setTimeout(() => {
                expect(target.value).to.equal('HELLO');
                
                source.value = 'world';
                
                setTimeout(() => {
                    expect(target.value).to.equal('WORLD');
                    binder.deactivate();
                    done();
                }, 10);
            }, 10);
        });
        
        it('should apply reverse transformation in two-way binding', (done) => {
            const source = new Data_Object({ celsius: 0 });
            const target = new Data_Object({ fahrenheit: 32 });
            
            const binder = new ModelBinder(source, target, {
                celsius: {
                    to: 'fahrenheit',
                    transform: (c) => c * 9/5 + 32,
                    reverse: (f) => (f - 32) * 5/9
                }
            }, { bidirectional: true });
            
            setTimeout(() => {
                target.fahrenheit = 212;
                
                setTimeout(() => {
                    expect(source.celsius).to.be.closeTo(100, 0.01);
                    binder.deactivate();
                    done();
                }, 10);
            }, 10);
        });
        
        it('should unbind and stop synchronization', (done) => {
            const source = new Data_Object({ value: 10 });
            const target = new Data_Object({ value: 0 });
            
            const binder = new ModelBinder(source, target, {
                value: 'value'
            });
            
            setTimeout(() => {
                binder.unbind();
                
                source.value = 20;
                
                setTimeout(() => {
                    expect(target.value).to.equal(10);
                    done();
                }, 10);
            }, 10);
        });
    });
    
    describe('Computed Properties', () => {
        it('should create computed property from single dependency', (done) => {
            const data = new Data_Object({
                radius: 5
            });
            
            const computed = new ComputedProperty(
                data,
                ['radius'],
                (r) => Math.PI * r * r,
                { propertyName: 'area' }
            );
            
            setTimeout(() => {
                expect(data.area).to.be.closeTo(78.54, 0.01);
                
                data.radius = 10;
                
                setTimeout(() => {
                    expect(data.area).to.be.closeTo(314.16, 0.01);
                    computed.destroy();
                    done();
                }, 10);
            }, 10);
        });
        
        it('should create computed property from multiple dependencies', (done) => {
            const data = new Data_Object({
                firstName: 'John',
                lastName: 'Doe'
            });
            
            const computed = new ComputedProperty(
                data,
                ['firstName', 'lastName'],
                (first, last) => `${first} ${last}`,
                { propertyName: 'fullName' }
            );
            
            setTimeout(() => {
                expect(data.fullName).to.equal('John Doe');
                
                data.firstName = 'Jane';
                
                setTimeout(() => {
                    expect(data.fullName).to.equal('Jane Doe');
                    computed.destroy();
                    done();
                }, 10);
            }, 10);
        });
        
        it('should handle computed properties with null values', (done) => {
            const data = new Data_Object({
                value: null
            });
            
            const computed = new ComputedProperty(
                data,
                ['value'],
                (val) => val ? val * 2 : 0,
                { propertyName: 'doubled' }
            );
            
            setTimeout(() => {
                expect(data.doubled).to.equal(0);
                
                data.value = 5;
                
                setTimeout(() => {
                    expect(data.doubled).to.equal(10);
                    computed.destroy();
                    done();
                }, 10);
            }, 10);
        });
    });
    
    describe('Property Watchers', () => {
        it('should watch single property for changes', (done) => {
            const data = new Data_Object({
                value: 10
            });
            
            const spy = sinon.spy();
            
            const watcher = new PropertyWatcher(data, 'value', spy);
            
            data.value = 20;
            
            setTimeout(() => {
                expect(spy.calledOnce).to.be.true;
                expect(spy.firstCall.args[0]).to.equal(20);
                expect(spy.firstCall.args[1]).to.equal(10);
                watcher.unwatch();
                done();
            }, 10);
        });
        
        it('should call watcher immediately with immediate option', (done) => {
            const data = new Data_Object({
                value: 10
            });
            
            const spy = sinon.spy();
            
            const watcher = new PropertyWatcher(data, 'value', spy, {
                immediate: true
            });
            
            setTimeout(() => {
                expect(spy.calledOnce).to.be.true;
                expect(spy.firstCall.args[0]).to.equal(10);
                watcher.unwatch();
                done();
            }, 10);
        });
        
        it('should watch multiple properties', (done) => {
            const data = new Data_Object({
                width: 10,
                height: 20
            });
            
            const spy = sinon.spy();
            
            const watcher = new PropertyWatcher(data, ['width', 'height'], spy);
            
            data.width = 15;
            
            setTimeout(() => {
                expect(spy.calledOnce).to.be.true;
                
                data.height = 25;
                
                setTimeout(() => {
                    expect(spy.calledTwice).to.be.true;
                    watcher.unwatch();
                    done();
                }, 10);
            }, 10);
        });
        
        it('should unwatch and stop receiving changes', (done) => {
            const data = new Data_Object({
                value: 10
            });
            
            const spy = sinon.spy();
            
            const watcher = new PropertyWatcher(data, 'value', spy);
            
            watcher.unwatch();
            data.value = 20;
            
            setTimeout(() => {
                expect(spy.called).to.be.false;
                done();
            }, 10);
        });
    });
    
    describe('BindingManager Helpers', () => {
        it('should bind simple values with bind_value', (done) => {
            const manager = new BindingManager();
            const source = new Data_Object({ value: 5 });
            const target = new Data_Object({ value: 0 });
            
            manager.bind_value(source, 'value', target);
            
            setTimeout(() => {
                expect(target.value).to.equal(5);
                source.value = 12;
                
                setTimeout(() => {
                    expect(target.value).to.equal(12);
                    done();
                }, 10);
            }, 10);
        });
        
        it('should bind collections with mapping', (done) => {
            const manager = new BindingManager();
            const source = new Data_Object({ items: [1, 2, 3] });
            const target = new Data_Object({ doubles: [] });
            
            manager.bind_collection(source, 'items', target, 'doubles', {
                map: (v) => v * 2
            });
            
            setTimeout(() => {
                expect(target.doubles).to.deep.equal([2, 4, 6]);
                source.items = [3, 4];
                
                setTimeout(() => {
                    expect(target.doubles).to.deep.equal([6, 8]);
                    done();
                }, 10);
            }, 10);
        });
        
        it('should prevent infinite loops with bidirectional bindings', (done) => {
            const manager = new BindingManager();
            const a = new Data_Object({ value: 1 });
            const b = new Data_Object({ value: 0 });
            const spy = sinon.spy();
            
            a.on('change', spy);
            manager.bind_value(a, 'value', b, 'value', {
                reverse: (v) => v,
                bidirectional: true
            });
            
            setTimeout(() => {
                b.value = 9;
                
                setTimeout(() => {
                    expect(a.value).to.equal(9);
                    expect(spy.calledOnce).to.be.true;
                    done();
                }, 10);
            }, 10);
        });
        
        it('should expose diagnostics through inspectBindings', () => {
            const manager = new BindingManager();
            const source = new Data_Object({ value: 1 });
            const target = new Data_Object({ display: 0 });
            
            manager.bind_value(source, 'value', target, 'display');
            
            const report = manager.inspect();
            expect(report.binders).to.have.lengthOf(1);
            expect(report.binders[0].value).to.include({
                target: 'display'
            });
        });
    });
    
    describe('MVVM Control Integration', () => {
        it('should create MVVM control with data and view models', () => {
            class TestControl extends Data_Model_View_Model_Control {
                constructor(spec) {
                    super(spec);
                    
                    this.data.model = new Data_Object({
                        value: spec.value || 0
                    });
                    
                    this.view.data.model = new Data_Object({
                        displayValue: ''
                    });
                }
            }
            
            const control = new TestControl({
                context,
                value: 10
            });
            
            expect(control.data.model.value).to.equal(10);
            expect(control.view.data.model).to.exist;
        });
        
        it('should use bind() method for declarative binding', (done) => {
            class TestControl extends Data_Model_View_Model_Control {
                constructor(spec) {
                    super(spec);
                    
                    this.data.model = new Data_Object({
                        value: 10
                    });
                    
                    this.view.data.model = new Data_Object({
                        doubled: 0
                    });
                    
                    this.bind({
                        'value': {
                            to: 'doubled',
                            transform: (val) => val * 2
                        }
                    });
                }
            }
            
            const control = new TestControl({ context });
            
            setTimeout(() => {
                expect(control.view.data.model.doubled).to.equal(20);
                done();
            }, 50);
        });
        
        it('should use computed() method for computed properties', (done) => {
            class TestControl extends Data_Model_View_Model_Control {
                constructor(spec) {
                    super(spec);
                    
                    this.data.model = new Data_Object({
                        width: 10,
                        height: 20
                    });
                    
                    this.computed(
                        this.data.model,
                        ['width', 'height'],
                        (w, h) => w * h,
                        { propertyName: 'area' }
                    );
                }
            }
            
            const control = new TestControl({ context });
            
            setTimeout(() => {
                expect(control.data.model.area).to.equal(200);
                done();
            }, 50);
        });
        
        it('should use watch() method for property watchers', (done) => {
            class TestControl extends Data_Model_View_Model_Control {
                constructor(spec) {
                    super(spec);
                    
                    this.data.model = new Data_Object({
                        value: 10
                    });
                    
                    this.changes = [];
                    
                    this.watch(
                        this.data.model,
                        'value',
                        (newVal, oldVal) => {
                            this.changes.push({ newVal, oldVal });
                        }
                    );
                }
            }
            
            const control = new TestControl({ context });
            
            control.data.model.value = 20;
            
            setTimeout(() => {
                expect(control.changes).to.have.lengthOf(1);
                expect(control.changes[0].newVal).to.equal(20);
                expect(control.changes[0].oldVal).to.equal(10);
                done();
            }, 50);
        });
    });
});
