'use strict';

const ReactiveCollection = require('../../html-core/ReactiveCollection');

module.exports = {
    name: 'reactive_collection',
    description: 'Verify ReactiveCollection filter, insert/remove events, and diff behavior',

    run() {
        const assert = require('assert');

        // ── Test 1: Basic filter ──
        {
            const source = [
                { id: 1, name: 'Alice', active: true },
                { id: 2, name: 'Bob', active: false },
                { id: 3, name: 'Carol', active: true }
            ];

            const rc = new ReactiveCollection(source, {
                filter: item => item.active
            });

            assert.strictEqual(rc.length, 2, 'Filter: only 2 active items');
            assert.strictEqual(rc.get(0).name, 'Alice');
            assert.strictEqual(rc.get(1).name, 'Carol');

            rc.destroy();
        }

        // ── Test 2: No filter = all items ──
        {
            const source = [1, 2, 3, 4, 5];
            const rc = new ReactiveCollection(source);
            assert.strictEqual(rc.length, 5, 'No filter: all items');
            rc.destroy();
        }

        // ── Test 3: set_filter → diff events ──
        {
            const source = [
                { id: 1, active: true },
                { id: 2, active: true },
                { id: 3, active: false }
            ];

            const rc = new ReactiveCollection(source, {
                filter: item => item.active
            });
            assert.strictEqual(rc.length, 2);

            const events = [];
            rc.on('insert', e => events.push({ type: 'insert', ...e }));
            rc.on('remove', e => events.push({ type: 'remove', ...e }));

            // Change filter to show all
            rc.set_filter(null);

            assert.strictEqual(rc.length, 3, 'After removing filter: all items');
            const inserts = events.filter(e => e.type === 'insert');
            assert.strictEqual(inserts.length, 1, 'One insert event for item 3');
            assert.strictEqual(inserts[0].item.id, 3, 'Inserted item is id=3');

            rc.destroy();
        }

        // ── Test 4: set_filter → remove events ──
        {
            const source = [
                { id: 1, active: true },
                { id: 2, active: true },
                { id: 3, active: true }
            ];

            const rc = new ReactiveCollection(source);
            assert.strictEqual(rc.length, 3);

            const events = [];
            rc.on('remove', e => events.push(e));

            // Apply strict filter — removes 2 items
            rc.set_filter(item => item.id === 1);

            assert.strictEqual(rc.length, 1, 'After filter: 1 item');
            assert.strictEqual(events.length, 2, 'Two remove events');

            rc.destroy();
        }

        // ── Test 5: set_source ──
        {
            const source1 = [1, 2, 3];
            const source2 = [4, 5, 6, 7];

            const rc = new ReactiveCollection(source1);
            assert.strictEqual(rc.length, 3);

            const events = [];
            rc.on('insert', e => events.push({ type: 'insert', ...e }));
            rc.on('remove', e => events.push({ type: 'remove', ...e }));

            rc.set_source(source2);

            assert.strictEqual(rc.length, 4, 'After set_source: 4 items');
            const removes = events.filter(e => e.type === 'remove');
            const inserts = events.filter(e => e.type === 'insert');
            assert.strictEqual(removes.length, 3, '3 removes (1,2,3)');
            assert.strictEqual(inserts.length, 4, '4 inserts (4,5,6,7)');

            rc.destroy();
        }

        // ── Test 6: reset() ──
        {
            const source = [1, 2, 3];
            const rc = new ReactiveCollection(source);

            let reset_event = null;
            rc.on('reset', e => { reset_event = e; });

            rc.reset();

            assert.ok(reset_event, 'Reset event fired');
            assert.strictEqual(reset_event.items.length, 3, 'Reset includes all items');

            rc.destroy();
        }

        // ── Test 7: on/off listener management ──
        {
            const rc = new ReactiveCollection([1, 2]);
            let count = 0;
            const handler = () => count++;

            rc.on('reset', handler);
            rc.reset();
            assert.strictEqual(count, 1);

            rc.off('reset', handler);
            rc.reset();
            assert.strictEqual(count, 1, 'After off: handler not called');

            rc.destroy();
        }

        // ── Test 8: Integration with BindingManager ──
        {
            const { BindingManager } = require('../../html-core/ModelBinder');
            const bm = new BindingManager();

            const source = [10, 20, 30, 40, 50];
            const rc = bm.create_reactive_collection(source, {
                filter: v => v > 20
            });

            assert.strictEqual(rc.length, 3, 'BindingManager: filtered 3 items');

            // Cleanup should destroy reactive collections
            bm.cleanup();
            assert.strictEqual(rc._items.length, 0, 'After cleanup: collection destroyed');
        }

        console.log('✅ All ReactiveCollection tests passed!');
    }
};
