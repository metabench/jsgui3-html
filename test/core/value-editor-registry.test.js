/**
 * Value Editor Registry — Unit Tests
 */

require('../setup');
const { expect } = require('chai');

const {
    register_value_editor,
    get_value_editor,
    create_editor,
    unregister_value_editor,
    list_registered_types,
    registry
} = require('../../controls/organised/1-standard/1-editor/value_editors/value_editor_registry');

const Value_Editor_Base = require('../../controls/organised/1-standard/1-editor/value_editors/Value_Editor_Base');

describe('value_editor_registry', function () {
    // Save registry state so tests don't leak
    let snapshot;
    before(() => { snapshot = new Map(registry); });
    afterEach(() => {
        registry.clear();
        for (const [k, v] of snapshot) registry.set(k, v);
    });

    describe('register_value_editor', () => {
        it('should register a new type', () => {
            class Dummy extends Value_Editor_Base { }
            register_value_editor('dummy', Dummy);
            expect(registry.has('dummy')).to.be.true;
        });

        it('should allow priority override', () => {
            class A extends Value_Editor_Base { }
            class B extends Value_Editor_Base { }
            register_value_editor('ptest', A, { priority: 1 });
            register_value_editor('ptest', B, { priority: 10 });
            expect(registry.get('ptest').editor_class).to.equal(B);
        });

        it('should NOT override when lower priority', () => {
            class A extends Value_Editor_Base { }
            class B extends Value_Editor_Base { }
            register_value_editor('ptest2', A, { priority: 10 });
            register_value_editor('ptest2', B, { priority: 5 });
            expect(registry.get('ptest2').editor_class).to.equal(A);
        });

        it('should store inline / popup flags', () => {
            class D extends Value_Editor_Base { }
            register_value_editor('flags', D, { inline: true, popup: false });
            const entry = registry.get('flags');
            expect(entry.inline).to.be.true;
            expect(entry.popup).to.be.false;
        });
    });

    describe('get_value_editor', () => {
        it('should return null for unknown type', () => {
            expect(get_value_editor('nonexistent')).to.be.null;
        });

        it('should return the entry for known type', () => {
            class D extends Value_Editor_Base { }
            register_value_editor('known', D);
            const entry = get_value_editor('known');
            expect(entry).to.not.be.null;
            expect(entry.editor_class).to.equal(D);
        });

        it('should respect predicate', () => {
            class D extends Value_Editor_Base { }
            register_value_editor('pred', D, { predicate: (ctx) => ctx && ctx.special === true });
            expect(get_value_editor('pred', {})).to.be.null;
            expect(get_value_editor('pred', { special: true })).to.not.be.null;
        });
    });

    describe('create_editor', () => {
        it('should return null for unknown type', () => {
            expect(create_editor('nope', {})).to.be.null;
        });

        it('should create an instance of the registered class', () => {
            const context = createTestContext();
            class D extends Value_Editor_Base { }
            register_value_editor('create_test', D);
            const inst = create_editor('create_test', { context, value: 42 });
            expect(inst).to.be.instanceOf(D);
            expect(inst.get_value()).to.equal(42);
        });
    });

    describe('unregister_value_editor', () => {
        it('should remove a registered type', () => {
            class D extends Value_Editor_Base { }
            register_value_editor('unreg', D);
            expect(registry.has('unreg')).to.be.true;
            unregister_value_editor('unreg');
            expect(registry.has('unreg')).to.be.false;
        });
    });

    describe('list_registered_types', () => {
        it('should include built-in types', () => {
            // Require the index to register built-ins
            require('../../controls/organised/1-standard/1-editor/value_editors');
            const types = list_registered_types();
            expect(types).to.include('text');
            expect(types).to.include('number');
            expect(types).to.include('boolean');
            expect(types).to.include('enum');
            expect(types).to.include('date');
            expect(types).to.include('color');
        });
    });
});
