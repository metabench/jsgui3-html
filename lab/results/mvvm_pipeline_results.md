# Lab Results: MVVM Declarative Pipeline

**Date:** 2026-02-12  
**Experiment:** `mvvm_pipeline_lab.js`  
**Status:** ✅ Passed

## Summary
Validated the use of jsgui3's native `ComputedProperty` mechanism to implement a fully declarative, reactive data pipeline. This approach eliminates imperative `render()` calls and manual orchestration.

## The Pattern

The entire pipeline logic is defined as a single computed property that depends on both the Data Model (source rows) and View Model (configuration).

```javascript
// Inside Control constructor:

this.computed(
    [this.data.model, this.view.data.model], 
    ['rows', 'sort_state', 'filters', 'page'], 
    (rows, sort, filters, page) => {
        let res = rows || [];
        // Pure function transformations
        res = PIPELINE.filter(res, filters);
        res = PIPELINE.sort(res, sort);
        res = PIPELINE.paginate(res, page, page_size);
        return res;
    },
    { propertyName: 'visible_rows', target: this.view.data.model }
);

// React to changes:
this.watch(this.view.data.model, ['visible_rows'], () => {
    this.render(); // or bind visible_rows directly to a List/Collection
}, { immediate: true });
```

## Key Capabilities Verified
1.  **Multi-Model Dependencies:** `ComputedProperty` correctly observes changes in both `data.model` and `view.data.model`.
2.  **Automatic Reactivity:**
    *   `collection.push(...)` → pipeline re-runs → DOM updates.
    *   `view.emit('change', {name: 'sort_state'})` → pipeline re-runs → DOM updates.
3.  **Zero Manual Orchestration:** No need to call `render_table()` manually in setters. The setters just update the model, and the system handles the rest.

## Recommendation
Adopting this MVVM pattern for `Data_Table` (and similar complex controls) will significantly reduce code complexity and bugs related to state synchronization. It separates **Data Transformation Logic** (pure functions in computed) from **DOM Rendering Logic** (watcher/binding).
