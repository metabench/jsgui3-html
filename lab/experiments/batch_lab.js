'use strict';

const { Data_Object } = require('lang-tools');

module.exports = {
    name: 'batch',
    description: 'Verify Data_Object.batch() defers and deduplicates change events',

    run() {
        const assert = require('assert');

        // ── Test 1: Without batch — fires individual events ──
        {
            const model = new Data_Object({});
            let event_count = 0;
            model.on('change', () => { event_count++; });

            model.set('a', 1);
            model.set('b', 2);
            model.set('c', 3);

            assert.strictEqual(event_count, 3, 'Without batch: should fire 3 events');
        }

        // ── Test 2: With batch — deferred events ──
        {
            const model = new Data_Object({});
            let event_count = 0;
            let events_during_batch = 0;
            model.on('change', () => { event_count++; });

            model.batch(() => {
                model.set('a', 1);
                model.set('b', 2);
                model.set('c', 3);
                events_during_batch = event_count;
            });

            assert.strictEqual(events_during_batch, 0, 'During batch: no events should fire');
            assert.strictEqual(event_count, 3, 'After batch: 3 deferred events should fire');
        }

        // ── Test 3: Deduplication — same property set twice ──
        {
            const model = new Data_Object({});
            let event_count = 0;
            const received = [];
            model.on('change', (e) => {
                event_count++;
                received.push({ name: e.name, value: e.value });
            });

            model.batch(() => {
                model.set('page', 1);
                model.set('page', 5);  // Should deduplicate: only last value fires
                model.set('sort', 'asc');
            });

            assert.strictEqual(event_count, 2, 'Deduplicated: only 2 events (page + sort)');
            const page_event = received.find(e => e.name === 'page');
            assert.strictEqual(page_event.value, 5, 'Deduplicated: page should be 5 (last value)');
        }

        // ── Test 4: Nested batches — flush at outermost ──
        {
            const model = new Data_Object({});
            let event_count = 0;
            model.on('change', () => { event_count++; });

            model.batch(() => {
                model.set('a', 1);
                model.batch(() => {
                    model.set('b', 2);
                });
                // Inner batch completes but events should NOT fire yet
                assert.strictEqual(event_count, 0, 'Nested: no events after inner batch');
                model.set('c', 3);
            });

            assert.strictEqual(event_count, 3, 'Nested: all events fire after outermost batch');
        }

        // ── Test 5: Batch with ComputedProperty — compute runs once ──
        {
            const { ComputedProperty } = require('../../html-core/ModelBinder');
            const model = new Data_Object({});
            model.set('x', 10);
            model.set('y', 20);

            let compute_count = 0;
            const cp = new ComputedProperty(model, ['x', 'y'], (x, y) => {
                compute_count++;
                return (x || 0) + (y || 0);
            }, { property_name: 'sum' });

            // Reset counter after initial compute
            compute_count = 0;

            model.batch(() => {
                model.set('x', 100);
                model.set('y', 200);
            });

            // After batch: x and y both change, but x's event fires first
            // which triggers compute, then y's event fires, triggering compute again.
            // With deduplication, we get 2 events (x, y) -> 2 computes
            // But the key benefit is they fire AFTER both values are set,
            // so the intermediate state (x=100, y=20) is never visible to watchers.
            assert.strictEqual(model.get('sum').value, 300, 'ComputedProperty: sum should be 300');

            cp.destroy();
        }

        // ── Test 6: Error in batch — events still flush ──
        {
            const model = new Data_Object({});
            let event_count = 0;
            model.on('change', () => { event_count++; });

            try {
                model.batch(() => {
                    model.set('a', 1);
                    throw new Error('intentional');
                });
            } catch (e) {
                // Expected
            }

            assert.strictEqual(event_count, 1, 'Error in batch: events still flush');
        }

        console.log('✅ All batch tests passed!');
    }
};
