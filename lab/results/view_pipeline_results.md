# Lab Results: View-Owned Data Pipeline

**Date:** 2026-02-12  
**Experiment:** `view_pipeline_lab.js`  
**Status:** ✅ All 12 assertions passed

## Summary

Validated an architecture where the **View owns the Data Pipeline**. Properties like `sort_state`, `filters`, and `page_size` are **dual-purpose**: they simultaneously capture the user's intent to:
1.  **Transform Data:** Configure pipeline stages (filter/sort/paginate) to produce `visible_rows`.
2.  **Update Visuals:** Drive UI state like header sort indicators, active filter highlights, and pagination controls.

## Key Findings

### 1. The View Owns the Pipeline
The experiment proved this by creating two `Pipeline_Data_Table` instances sharing the **exact same raw data array** (`data.model`).
-   **Table 1:** Sorted by Name (Ascending)
-   **Table 2:** Sorted by Score (Descending), Page Size 3
-   **Result:** They produced different `visible_rows` without mutating the source data.
-   **Implication:** Sorting and filtering are View concerns, not Data concerns. The raw data remains pure.

### 2. Dual-Purpose Properties
A single property on `view.data.model` (e.g., `sort_state`) is the single source of truth for two distinct systems:
-   **Pipeline Stage:** `STAGES.sort` reads `vm.sort_state` to reorder the rows.
-   **View Effect:** `VIEW_EFFECTS.sort_indicators` reads `vm.sort_state` to set `aria-sort="ascending"` on the `<th>`.

This eliminates synchronization bugs. You can't have a "sorted" table with an unsorted header indicator because both are derived from the same reactive property.

### 3. Dynamic Pipeline Stages
The pipeline is a collection of named stages. This supports the **Complexity Gating** pattern:
-   **Standard Mode:** Uses `[filter, sort, paginate]` stages.
-   **Virtual Mode:** Can dynamically inject a `virtual_window` stage at the end of the pipeline to slice the visible rows to just the viewport.
-   The experiment successfully demonstrated adding a `top_n` stage dynamically.

## Architecture Pattern

```javascript
view.data.model = {
    sort_state: { key: 'name', dir: 'asc' }, // Dual-purpose
    filters: { name: 'ali' }                 // Dual-purpose
}

// 1. Data Transformation (Pipeline)
raw_rows → [Filter] → [Sort] → [Paginate] → visible_rows

// 2. Visual Rendering (Effects)
view.data.model → [Highlight Headers] → [Update Pager info]
```

## Production Recommendations
-   **Refactor `Data_Table`:** Move `get_filtered_rows`, `get_sorted_rows`, `get_paged_rows` into a formal `ViewDataPipeline` class.
-   **Formalize View Model:** Explicitly define the `view.data.model` schema to include these pipeline configuration properties.
-   **Reactive Binding:** Bind the pipeline's `run()` method to changes in `view.data.model`.
