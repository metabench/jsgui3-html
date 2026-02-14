# Design: Event Batching for Data_Object

**Status:** Proposal  
**Scope:** `lang-tools/Data_Model/new/Data_Object.js`  
**Goal:** Prevent cascading recomputations when setting multiple properties at once

---

## Problem

Each `Data_Object.set(name, value)` call fires a separate `change` event synchronously. When a pipeline depends on multiple properties (e.g., `sort_state`, `filters`, `page`), changing all three fires 3 `change` events, each triggering a full `ComputedProperty.compute()` cycle. Only the final result matters.

```javascript
// Data_Object.set() line 854 — iterates and calls set(k,v) per key:
res = {};
each(a[0], function (v, i) {
    res[i] = that.set(i, v);  // Each fires 'change'!
});
```

## Proposed Solution

Add a `batch()` method to `Data_Object` that defers `change` events until the batch completes, then fires a single coalesced event.

### API

```javascript
model.batch(() => {
    model.set('sort_state', { column: 'name', direction: 'asc' });
    model.set('filters', [{ column: 'status', value: 'active' }]);
    model.set('page', 1);
});
// → Single 'change' event fired with all changes
```

### Implementation Sketch

```javascript
// In Data_Object:
batch(fn) {
    this._batch_depth = (this._batch_depth || 0) + 1;
    this._batch_queue = this._batch_queue || [];
    
    try {
        fn();
    } finally {
        this._batch_depth--;
        
        if (this._batch_depth === 0 && this._batch_queue.length > 0) {
            const queued = this._batch_queue.splice(0);
            // Fire one composite event per changed property
            for (const event of queued) {
                this.raise_event('change', event);
            }
            // Or: fire a single batch event with all changes
            // this.raise_event('batch_change', { changes: queued });
        }
    }
}
```

The `set()` method needs modification to check `_batch_depth`:
```javascript
// In Data_Object.set(), where raise_event is called:
if (!silent) {
    const e_change = { name: property_name, value: value, ... };
    if (this._batch_depth > 0) {
        this._batch_queue.push(e_change);
    } else {
        this.raise_event('change', e_change);
    }
}
```

### Design Decisions

1. **One event per property vs. one batch event?**
   - If we fire one event per property (deferred), `ComputedProperty` still runs N times, just after the batch.
   - If we fire a single `batch_change` event, `ComputedProperty` needs to understand it (breaking change).
   - **Recommendation:** Fire deferred individual events, but add a `debounce` option to `ComputedProperty` so it coalesces rapid recomputations (e.g., `requestAnimationFrame` or `queueMicrotask`).

2. **Nested batches?**
   - Support via depth counter. Only flush when depth returns to 0.

3. **Error in batch callback?**
   - Queue is flushed in `finally`, so events still fire even if the batch throws.

### Affected Files
- `lang-tools/Data_Model/new/Data_Object.js` — Add `batch()` method, modify `set()` event emission
- `html-core/ModelBinder.js` — Optionally add `debounce` option to `ComputedProperty`

### Testing
- Unit test: `batch()` fires N events after completion, not during
- Unit test: nested batches flush at outermost level only
- Lab: pipeline with batch vs. without, counting compute invocations

---

# Design: ReactiveCollection

**Status:** Proposal  
**Scope:** New class, potentially in `html-core/` or `lang-tools/`  
**Goal:** Incremental list rendering — add/remove DOM nodes instead of full replacement

---

## Problem

The current pipeline computes `visible_rows` as a new array every time any dependency changes. This causes a full DOM rebuild of the list because watchers see a completely new array reference.

**Current flow:**
```
Collection.push(row)  →  change{name:'insert', position:5}
  →  ComputedProperty hears 'change' on 'rows'
  →  Runs: filter(rows) → sort(rows) → paginate(rows) → NEW array
  →  Sets visible_rows = [new array]
  →  Watcher: full DOM rebuild
```

## Proposed Solution

A `ReactiveCollection` that wraps a source collection and applies transforms incrementally:

```javascript
const visible = new ReactiveCollection(source, {
    filter: (row) => row.status === 'active',
    sort: (a, b) => a.name.localeCompare(b.name),
    limit: 20,
    offset: 0
});

// When source emits 'insert', ReactiveCollection:
// 1. Tests filter(new_row) → pass?
// 2. Binary-searches sort position → position 7
// 3. Checks offset/limit bounds → within window?
// 4. Emits: { name: 'insert', position: 7, item: new_row }
// 5. DOM handler: insert single <tr> at position 7
```

### Key Design Points

1. **Incremental `insert`:**
   - Test filter → if passes, find sorted position via binary search → check pagination window → emit insert if visible

2. **Incremental `remove`:**
   - Find item in internal sorted list → remove → check if it was in pagination window → emit remove if was visible → possibly emit insert for next item that slides into view

3. **Config change (filter/sort/page):**
   - Falls back to full recomputation — this is expected and acceptable since config changes are infrequent.

4. **API:**
   ```javascript
   visible.on('insert', ({ position, item }) => { /* add DOM node */ });
   visible.on('remove', ({ position, item }) => { /* remove DOM node */ });
   visible.on('reset',  ({ items }) => { /* full replace */ });
   visible.on('move',   ({ from, to, item }) => { /* reorder DOM node */ });
   ```

5. **Integration with watch/computed:**
   - Could be used instead of `computed()` for array-producing pipelines
   - Would be exposed as `this.reactive_collection()` on Control

### Complexity Assessment

This is a **significant** piece of work:
- Sort insertion requires a maintained sorted index
- Pagination window sliding is tricky (remove from window → need to pull next item in)
- Filter changes could swap many items
- Need thorough edge-case testing (empty collections, single items, boundary conditions)

Recommend implementing in stages:
1. **Stage 1:** Filter + insert/remove (no sort, no pagination)
2. **Stage 2:** Add sort with binary-search insert
3. **Stage 3:** Add pagination window management

### Affected Files
- New: `html-core/ReactiveCollection.js`
- Modify: `html-core/Data_Model_View_Model_Control.js` — add `reactive_collection()` method
- Modify: `html-core/ModelBinder.js` — potentially add `BindingManager.create_reactive_collection()`

### Testing
- Unit tests for each transform stage
- Lab experiment showing incremental DOM updates
- Performance benchmark: 10,000 rows, measure DOM operations per insert
