/**
 * Swap Infrastructure Tests
 *
 * Tests for the progressive enhancement swap system including:
 * - swap_registry.js
 * - activation.js
 * - hydration.js
 * - auto_enhance.js
 */

const { expect } = require('chai');

// Import swap infrastructure modules
const {
    register_swap,
    unregister_swap,
    get_swap,
    get_all_swaps,
    clear_swaps,
    swap_registry
} = require('../control_mixins/swap_registry');

const { Activation_Manager } = require('../control_mixins/activation');
const { enable_auto_enhancement, disable_auto_enhancement } = require('../control_mixins/auto_enhance');
const {
    hydrate,
    is_hydrated,
    get_hydrated_controls,
    reset_hydration,
    when_hydrated
} = require('../control_mixins/hydration');

describe('Swap Infrastructure Tests', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
        clear_swaps();
        reset_hydration();
    });

    afterEach(() => {
        cleanup();
        clear_swaps();
        reset_hydration();
    });

    describe('swap_registry', () => {
        describe('register_swap', () => {
            it('should register a swap configuration', () => {
                const MockControl = function(spec) { this.spec = spec; };
                const config = register_swap('input[type="text"]', MockControl);

                expect(config).to.exist;
                expect(config.control_class).to.equal(MockControl);
                expect(config.priority).to.equal(0);
                expect(config.enhancement_mode).to.equal('full');
            });

            it('should allow custom priority', () => {
                const MockControl = function(spec) { this.spec = spec; };
                const config = register_swap('input', MockControl, { priority: 10 });

                expect(config.priority).to.equal(10);
            });

            it('should allow custom enhancement mode', () => {
                const MockControl = function(spec) { this.spec = spec; };
                const config = register_swap('input', MockControl, { enhancement_mode: 'wrap' });

                expect(config.enhancement_mode).to.equal('wrap');
            });

            it('should allow custom predicate', () => {
                const MockControl = function(spec) { this.spec = spec; };
                const predicate = el => el.hasAttribute('data-custom');
                const config = register_swap('input', MockControl, { predicate });

                expect(config.predicate).to.equal(predicate);
            });

            it('should throw on empty selector', () => {
                const MockControl = function(spec) { this.spec = spec; };
                expect(() => register_swap('', MockControl)).to.throw();
                expect(() => register_swap('   ', MockControl)).to.throw();
            });

            it('should throw on missing control class', () => {
                expect(() => register_swap('input', null)).to.throw();
                expect(() => register_swap('input', undefined)).to.throw();
            });
        });

        describe('unregister_swap', () => {
            it('should remove a registered swap', () => {
                const MockControl = function(spec) { this.spec = spec; };
                register_swap('input', MockControl);

                expect(swap_registry.has('input')).to.be.true;

                const result = unregister_swap('input');
                expect(result).to.be.true;
                expect(swap_registry.has('input')).to.be.false;
            });

            it('should return false for non-existent swap', () => {
                const result = unregister_swap('nonexistent');
                expect(result).to.be.false;
            });
        });

        describe('get_swap', () => {
            it('should find matching swap configuration', () => {
                const MockControl = function(spec) { this.spec = spec; };
                register_swap('input[type="text"]', MockControl);

                const input = document.createElement('input');
                input.type = 'text';

                const config = get_swap(input);
                expect(config).to.exist;
                expect(config.control_class).to.equal(MockControl);
            });

            it('should return null for non-matching element', () => {
                const MockControl = function(spec) { this.spec = spec; };
                register_swap('input[type="text"]', MockControl);

                const div = document.createElement('div');
                const config = get_swap(div);
                expect(config).to.be.null;
            });

            it('should respect priority when multiple swaps match', () => {
                const LowPriority = function(spec) { this.priority = 'low'; };
                const HighPriority = function(spec) { this.priority = 'high'; };

                register_swap('input', LowPriority, { priority: 0 });
                register_swap('input[type="text"]', HighPriority, { priority: 10 });

                const input = document.createElement('input');
                input.type = 'text';

                const config = get_swap(input);
                expect(config.control_class).to.equal(HighPriority);
            });

            it('should respect predicate', () => {
                const MockControl = function(spec) { this.spec = spec; };
                register_swap('input', MockControl, {
                    predicate: el => el.hasAttribute('data-enhance')
                });

                const input1 = document.createElement('input');
                const input2 = document.createElement('input');
                input2.setAttribute('data-enhance', 'true');

                expect(get_swap(input1)).to.be.null;
                expect(get_swap(input2)).to.exist;
            });
        });

        describe('get_all_swaps', () => {
            it('should return all registered swaps', () => {
                const Mock1 = function() {};
                const Mock2 = function() {};

                register_swap('input', Mock1);
                register_swap('select', Mock2);

                const all = get_all_swaps();
                expect(all).to.have.lengthOf(2);
                expect(all[0][0]).to.equal('input');
                expect(all[1][0]).to.equal('select');
            });
        });

        describe('clear_swaps', () => {
            it('should remove all registered swaps', () => {
                const Mock1 = function() {};
                const Mock2 = function() {};

                register_swap('input', Mock1);
                register_swap('select', Mock2);

                expect(swap_registry.size).to.equal(2);

                clear_swaps();
                expect(swap_registry.size).to.equal(0);
            });
        });
    });

    describe('Activation_Manager', () => {
        describe('constructor', () => {
            it('should create manager with context', () => {
                const manager = new Activation_Manager(context);
                expect(manager.context).to.equal(context);
                expect(manager.activated).to.exist;
            });
        });

        describe('activate', () => {
            it('should activate matching elements', () => {
                const activated = [];
                const MockControl = function(spec) {
                    this.spec = spec;
                    activated.push(this);
                    this.activate = function() {};
                };

                register_swap('input[type="text"]', MockControl);

                const container = document.createElement('div');
                const input1 = document.createElement('input');
                input1.type = 'text';
                const input2 = document.createElement('input');
                input2.type = 'text';
                container.appendChild(input1);
                container.appendChild(input2);
                document.body.appendChild(container);

                const manager = new Activation_Manager(context);
                const controls = manager.activate(container);

                expect(controls).to.have.lengthOf(2);
                expect(activated).to.have.lengthOf(2);
            });

            it('should not activate same element twice', () => {
                let activationCount = 0;
                const MockControl = function(spec) {
                    activationCount++;
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                const manager = new Activation_Manager(context);
                manager.activate(document.body);
                manager.activate(document.body);

                expect(activationCount).to.equal(1);
            });

            it('should skip elements with jsgui-no-enhance class', () => {
                let activationCount = 0;
                const MockControl = function(spec) {
                    activationCount++;
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                input.classList.add('jsgui-no-enhance');
                document.body.appendChild(input);

                const manager = new Activation_Manager(context);
                manager.activate(document.body);

                expect(activationCount).to.equal(0);
            });

            it('should mark elements as enhanced', () => {
                const MockControl = function(spec) {
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                const manager = new Activation_Manager(context);
                manager.activate(document.body);

                expect(input.getAttribute('data-jsgui-enhanced')).to.equal('true');
            });

            it('should call on_error callback on activation failure', () => {
                const errors = [];
                const FailingControl = function() {
                    throw new Error('Activation failed');
                };

                register_swap('input', FailingControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                const manager = new Activation_Manager(context);
                manager.activate(document.body, {
                    on_error: (err, el, config) => {
                        errors.push({ err, el, config });
                    }
                });

                expect(errors).to.have.lengthOf(1);
                expect(errors[0].err.message).to.equal('Activation failed');
            });
        });

        describe('deactivate', () => {
            it('should deactivate an activated element', () => {
                const MockControl = function(spec) {
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                const manager = new Activation_Manager(context);
                manager.activate(document.body);

                expect(input.getAttribute('data-jsgui-enhanced')).to.equal('true');

                const result = manager.deactivate(input);
                expect(result).to.be.true;
                expect(input.getAttribute('data-jsgui-enhanced')).to.be.null;
            });

            it('should return false for non-activated elements', () => {
                const manager = new Activation_Manager(context);
                const input = document.createElement('input');

                const result = manager.deactivate(input);
                expect(result).to.be.false;
            });
        });
    });

    describe('hydration', () => {
        describe('hydrate (sync)', () => {
            it('should hydrate elements in container', () => {
                const activated = [];
                const MockControl = function(spec) {
                    activated.push(spec);
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                const controls = hydrate(context);
                expect(controls).to.have.lengthOf(1);
                expect(is_hydrated()).to.be.true;
            });

            it('should call on_complete callback', () => {
                let completedControls = null;
                const MockControl = function(spec) {
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                hydrate(context, {
                    on_complete: (controls) => {
                        completedControls = controls;
                    }
                });

                expect(completedControls).to.have.lengthOf(1);
            });
        });

        describe('hydrate (async)', async () => {
            it('should hydrate elements asynchronously', async () => {
                const MockControl = function(spec) {
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                const controls = await hydrate(context, { async: true });
                expect(controls).to.have.lengthOf(1);
                expect(is_hydrated()).to.be.true;
            });

            it('should call on_progress callback', async () => {
                const progressUpdates = [];
                const MockControl = function(spec) {
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                for (let i = 0; i < 3; i++) {
                    const input = document.createElement('input');
                    document.body.appendChild(input);
                }

                await hydrate(context, {
                    async: true,
                    batch_size: 1,
                    on_progress: (completed, total) => {
                        progressUpdates.push({ completed, total });
                    }
                });

                expect(progressUpdates.length).to.be.greaterThan(0);
            });
        });

        describe('get_hydrated_controls', () => {
            it('should return all hydrated controls', () => {
                const MockControl = function(spec) {
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input1 = document.createElement('input');
                const input2 = document.createElement('input');
                document.body.appendChild(input1);
                document.body.appendChild(input2);

                hydrate(context);

                const hydrated = get_hydrated_controls();
                expect(hydrated).to.have.lengthOf(2);
            });
        });

        describe('reset_hydration', () => {
            it('should reset hydration state', () => {
                const MockControl = function(spec) {
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                hydrate(context);
                expect(is_hydrated()).to.be.true;

                reset_hydration();
                expect(is_hydrated()).to.be.false;
                expect(get_hydrated_controls()).to.have.lengthOf(0);
            });
        });

        describe('when_hydrated', () => {
            it('should resolve immediately if already hydrated', async () => {
                const MockControl = function(spec) {
                    this.activate = function() {};
                };

                register_swap('input', MockControl);
                hydrate(context);

                const result = await when_hydrated();
                expect(result).to.be.true;
            });
        });
    });

    describe('auto_enhance', () => {
        describe('enable_auto_enhancement', () => {
            it('should return an observer with manager', () => {
                const result = enable_auto_enhancement(context, { observe: false });
                expect(result).to.exist;
                expect(result.manager || result).to.exist;
            });

            it('should activate existing elements immediately', () => {
                const activated = [];
                const MockControl = function(spec) {
                    activated.push(spec);
                    this.activate = function() {};
                };

                register_swap('input', MockControl);

                const input = document.createElement('input');
                document.body.appendChild(input);

                enable_auto_enhancement(context, { observe: false });

                expect(activated).to.have.lengthOf(1);
            });
        });

        describe('disable_auto_enhancement', () => {
            it('should disconnect the observer', () => {
                let disconnected = false;
                const mockObserver = {
                    disconnect: () => { disconnected = true; }
                };

                disable_auto_enhancement(mockObserver);
                expect(disconnected).to.be.true;
            });

            it('should handle null observer gracefully', () => {
                expect(() => disable_auto_enhancement(null)).to.not.throw();
            });
        });
    });
});
