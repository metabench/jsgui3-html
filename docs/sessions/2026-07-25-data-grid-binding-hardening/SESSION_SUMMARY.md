# Session Summary: Data Grid Binding Hardening

**Date**: 2026-07-25
**Owner repository**: `jsgui3-html`
**Status**: Implemented and locally verified; not committed, published, or
deployed.

## Outcome

`Data_Filter`, `Data_Grid`, and `Data_Table` now have one documented and tested
integration contract. Filter-builder maps work locally without adapters,
connected query state stays synchronized, user events have defined
cardinality, selection updates model/DOM/ARIA together, and destruction makes
late model/async work inert.

Fresh reconstruction is explicitly opt-in and bounded. Current serializable
state is written to the live DOM, unsafe state removes the tabular snapshot,
and a second fresh context restores sort, filter, page, and visible selection
without duplicating handlers.

## Proof

- 863 framework tests pass (2 pending).
- 77 MVVM tests pass.
- Focused input/data-control regressions pass.
- Standalone Data_Grid, Data_Filter, and server-side Data_Table checks pass.
- The reattachment lab passes.
- A new real Chromium gate bundles, activates, and interacts with the exported
  controls. It verifies filter integration, pointer and keyboard sorting,
  paging, selection class/ARIA, event counts, and zero browser errors.

## Public contract

- `Data_Grid.model` owns connected query and singular selection state.
- `Data_Table.model` owns rendered table state as the grid projection.
- Structured filters support the operators emitted by `Data_Filter`; unknown
  custom operators are for server-side handling.
- Selection indices are zero-based within the visible page and are not stable
  identities across fetches.
- Activation metadata exposes its values in HTML and must not be used for
  secrets.

## Remaining release work

No version, package lock, commit, push, npm publication, or deployment was
performed. Those remain deliberate release operations.
