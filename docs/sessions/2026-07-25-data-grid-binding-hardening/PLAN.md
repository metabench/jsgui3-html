# Session Plan: Data Grid Binding Hardening

**Date**: 2026-07-25
**Agent**: Codex
**Goal**: Make the documented `Data_Grid`, `Data_Table`, and `Data_Filter`
contracts agree with their activated behavior, lifecycle, examples, and test
entry points.

## Scope

### In Scope

- Preserve the current public constructors, setters, exports, SSR output, and
  static/async data-source shapes.
- Make `Data_Filter.get_filter_map()` work with client-side tabular filtering.
- Keep grid and table page state coherent through sort/filter changes.
- Forward documented grid/table events and synchronize programmatic selection.
- Detach owned model, DOM, window, document, and virtual-scroll listeners.
- Keep opt-in activation state current across repeated fresh reconstruction.
- Add focused unit, integration, lifecycle, and real-browser checks.
- Replace the misleading standalone example and stale public documentation.
- Provide reliable root test commands.

### Out of Scope

- Breaking binding syntax or constructor changes.
- Persisting function, adapter, promise, or asynchronous data sources.
- Adding spreadsheet editing or a built-in pagination toolbar.
- Publishing, committing, pushing, tagging, or deploying.

## Compatibility Contract

- Existing scalar and predicate filters continue to work.
- Existing array, function, adapter, and `{rows}` data sources keep their shape.
- Existing selection and sort events retain their payloads.
- Activation persistence stays explicit and bounded.
- Non-opt-in rendering and activation remain unchanged.

## Risks

- State synchronization could introduce duplicate refreshes or events.
- Selection indices are page-relative and must not silently select a different
  row after sort, filtering, or paging.
- Teardown must not interfere with controls that remain mounted.
- Re-serialization must remove stale state when new data is no longer safe.

## Success Criteria

- [x] Operator filters work end-to-end through `Data_Grid`.
- [x] Sort/filter resets grid and table to page 1 with one coherent refresh.
- [x] Documented sort/page/selection behavior is verified.
- [x] Initial and programmatic selection update model and rendered table.
- [x] Destroyed controls ignore model changes and pending async completions.
- [x] Repeated activation restores matching DOM and model state.
- [x] Canonical examples use the exported controls.
- [x] Focused, full, and activated-browser validation pass.
