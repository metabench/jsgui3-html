# MVVM Architecture Evaluation

**Date:** 2026-02-12  
**Scope:** `ModelBinder.js`, `Data_Model_View_Model_Control.js`, `Transformations.js`, `Collection.js`, `Data_Object.js`  
**Verdict:** Fit for purpose. Several concrete improvements would make it production-grade.

---

## 1. What Works Well

### Multi-Model Computed Properties ✅
`ComputedProperty` accepts an **array of models** and resolves dependencies across all of them.
This is the critical capability for the View Pipeline pattern — it allows a single computed property to depend on both `data.model` (raw rows) and `view.data.model` (sort/filter config).

```javascript
// ModelBinder.js line 248: models can be an array
this.models = Array.isArray(models) ? models : [models];
```

**Verified in lab:** `mvvm_pipeline_lab.js` uses this to define `visible_rows` from cross-model dependencies.

### Bidirectional Bindings with Transforms ✅
`ModelBinder` supports `transform` (forward) and `reverse` (backward) functions with automatic loop suppression via `_locks`. This enables clean two-way binding between domain values and display values.

```javascript
// ModelBinder.js line 127-134: lock-based loop prevention
const lock_key = `${sourceProp}->${targetProp}`;
if (this._acquire(lock_key)) {
    this.targetModel[targetProp] = transformedValue;
    this._release(lock_key);
}
```

### Rich Transformation Library ✅
`Transformations.js` provides `compose()`, `pipe()`, `when()`, `bidirectional()`, and type-specific transforms (date, number, string, boolean, array, object). These are well-suited for binding transforms but are **not yet integrated** into the MVVM workflow — they exist as standalone utilities.

### Collection Granular Events ✅
`Collection.js` emits specific change events with operation type and position:
- `push()` → `{ name: 'insert', position, item }`
- `remove()` → `{ name: 'remove', position, value }`
- `insert()` → `{ name: 'insert', position, item }`
- `clear()` → `{ name: 'clear' }`

This is a **strong foundation** for efficient list rendering — the events carry enough information to do surgical DOM updates.

### Lifecycle Management ✅
`BindingManager.cleanup()` properly deactivates all binders, computed properties, and watchers. This prevents memory leaks when controls are destroyed.

### Debugging Introspection ✅
`BindingManager.inspect()` returns the current state of all bindings, computed properties, and watchers. Useful for development.

---

## 2. Issues Found

### Issue 1: No Event Batching 🔴
**Severity: High**

Each `Data_Object.set()` call fires a separate `change` event synchronously. When setting multiple properties at once (e.g., resetting sort + filter + page), each fires independently, causing **cascading recomputation**.

```javascript
// Data_Object.js line 854: set({...}) iterates and calls set(k,v) per key
res = {};
each(a[0], function (v, i) {
    res[i] = that.set(i, v);  // Each fires 'change'!
});
```

**Impact:** Setting 3 properties triggers 3 separate `computed` recalculations, each producing a new `visible_rows` array and triggering a re-render. Only the last one matters.

**Fix:** Add a `batch()` or `transaction()` mechanism:
```javascript
this.view.data.model.batch(() => {
    this.view.data.model.set('sort_state', newSort);
    this.view.data.model.set('filters', newFilters);
    this.view.data.model.set('page', 1);
});
// Single 'change' event fired after batch completes
```

### Issue 2: No Error Handling in Computed 🔴
**Severity: High**

`ComputedProperty.compute()` has no try/catch. If the compute function throws (e.g., due to `undefined` dependency during initialization), the entire control breaks silently or crashes.

```javascript
// ModelBinder.js line 324-326
compute() {
    const args = this.dependencies.map(dep => this._resolve_dependency(dep));
    const newValue = this.computeFn(...args);  // No try/catch!
    // ...
}
```

**Fix:** Wrap in try/catch, emit an error event, and optionally return a fallback value:
```javascript
compute() {
    try {
        const args = this.dependencies.map(dep => this._resolve_dependency(dep));
        const newValue = this.computeFn(...args);
        // ... update logic
    } catch (err) {
        if (this.options.onError) this.options.onError(err);
        else if (this.options.debug) console.error('[ComputedProperty] Error:', err);
        return this.options.fallback !== undefined ? this.options.fallback : this._lastValue;
    }
}
```

### Issue 3: Initialization Order Trap 🟡
**Severity: Medium**

`ComputedProperty` with `immediate: true` (the default) computes and sets the value in its constructor. If a `PropertyWatcher` is registered **after** the computed property, it misses the initial value.

**Discovered in lab:** `mvvm_pipeline_lab.js` required `{ immediate: true }` on the watcher AND careful ordering of `_compose()` before `computed()` to avoid crashes.

**Fix options:**
1. Document the ordering requirement clearly
2. Add a `ComputedProperty.onUpdate(callback)` that fires for both initial and subsequent values
3. Queue initial computation to run after all bindings are established (microtask)

### Issue 4: Shallow Equality Only 🟡
**Severity: Medium**

`ComputedProperty` uses `!==` for change detection:
```javascript
// ModelBinder.js line 328
if (newValue !== this._lastValue) { ... }
```

For the pipeline, the compute function always returns a **new array**, so this always evaluates to `true`, triggering updates even when the content hasn't changed. For primitive values this is fine; for objects/arrays it's wasteful.

**Fix:** Allow configurable equality:
```javascript
const equals = this.options.equals || ((a, b) => a === b);
if (!equals(newValue, this._lastValue)) { ... }
```

With a built-in `shallowArrayEquals` for common cases:
```javascript
function shallowArrayEquals(a, b) {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
```

### Issue 5: Pipeline Destroys Collection Granularity 🟡
**Severity: Medium (performance)**

`Collection` emits granular `insert`/`remove` events, but when used through `ComputedProperty`, the pipeline function consumes the raw array and returns a **new array**, losing the diff information. The watcher sees a full replacement and must do a full re-render.

**Current flow:**
```
Collection.push(row)  →  change{name:'insert', position:5}
    →  ComputedProperty hears 'change' on 'rows'
    →  Runs full pipeline: filter → sort → paginate
    →  Returns NEW array
    →  Sets visible_rows = [completely new reference]
    →  Watcher sees change → full DOM rebuild
```

**Ideal flow:**
```
Collection.push(row)  →  change{name:'insert', position:5}
    →  ReactiveCollection: test filter(row)? yes
    →  Binary-search sort position → insert at position 3
    →  Check pagination bounds → visible? yes
    →  Emit: visible_rows change{name:'insert', position:3, item:row}
    →  DOM: insert single <tr> at position 3
```

**Fix:** Introduce `ReactiveCollection` — a collection that maintains a live, incrementally-updated view of its source:
```javascript
this.reactiveCollection(
    this.data.model, 'rows',         // source
    this.view.data.model, 'visible_rows', // target
    {
        filter: (row) => matchesFilters(row, this.view.data.model.filters),
        sort: (a, b) => compareBySortState(a, b, this.view.data.model.sort_state),
        offset: () => (this.view.data.model.page - 1) * pageSize,
        limit: () => pageSize
    }
);
```

### Issue 6: Missing Control-Level API Surface 🟡
**Severity: Medium (developer experience)**

`BindingManager` has `bind_value()` and `bind_collection()` methods, but these are **not exposed** on `Data_Model_View_Model_Control`. The control only exposes `bind()`, `computed()`, and `watch()`.

**Impact:** Developers must use `this._binding_manager.bind_value(...)` directly, which is an internal access pattern.

**Fix:** Add convenience methods:
```javascript
bind_value(sourceModel, sourceProp, targetModel, targetProp, options) {
    return this._binding_manager.bind_value(
        sourceModel, sourceProp, targetModel, targetProp, options
    );
}

bind_collection(sourceModel, sourceProp, targetModel, targetProp, options) {
    return this._binding_manager.bind_collection(
        sourceModel, sourceProp, targetModel, targetProp, options
    );
}
```

### Issue 7: No `old` Value from ComputedProperty 🟢
**Severity: Low**

`ComputedProperty` stores `_lastValue` but does not pass the previous value to watchers. The `PropertyWatcher` callback receives `(newVal, oldVal, propName)`, but the `change` event from `Data_Object.set()` doesn't consistently include `old`.

**Fix:** Include `old` in the change event emitted by `ComputedProperty`:
```javascript
// In ComputedProperty.compute():
const oldValue = this._lastValue;
// ... after computing newValue:
target_model.set(property_name, newValue);
// The set() already fires 'change', but doesn't carry 'old' for non-Data_Value props
```

---

## 3. Summary Table

| Capability | Status | Priority Fix |
|---|---|---|
| Multi-model computed | ✅ Works | — |
| Bidirectional binding | ✅ Works | — |
| Transform library | ✅ Exists | Integrate with `bind()` API |
| Collection events | ✅ Granular | — |
| Lifecycle cleanup | ✅ Works | — |
| Debug introspection | ✅ Works | — |
| Event batching | ❌ Missing | `batch()` / `transaction()` |
| Error handling | ❌ Missing | try/catch in `compute()` |
| Init order | ⚠️ Fragile | Document or queue |
| Equality check | ⚠️ Shallow | Configurable `equals` |
| List diffing | ⚠️ Full replace | `ReactiveCollection` |
| API surface | ⚠️ Incomplete | Expose `bind_value`/`bind_collection` |
| Old value tracking | ⚠️ Inconsistent | Include in change event |

## 4. Recommended Priority

1. **Event batching** — Prevents cascading recomputation (most impactful for correctness)
2. **Error handling in computed** — Prevents silent failures (most impactful for reliability)
3. **Expose `bind_value`/`bind_collection`** — Quick win for developer experience
4. **Configurable equality** — Prevents unnecessary re-renders
5. **`ReactiveCollection`** — Critical for large datasets, but can be deferred until needed
