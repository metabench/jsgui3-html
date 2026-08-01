# Working Notes

## Baseline

- The bounded static activation path and first fresh reconstruction pass.
- `Data_Filter.get_filter_map()` emits `{op, value}` records, while
  `Data_Table` only understands scalar substring or predicate filters.
- `Data_Grid` mirrors state across its model, instance properties, and the
  inner table; sort/filter currently reset only the table page.
- Documented `sort_change` and `page_change` events are not forwarded.
- Programmatic grid selection does not update the table selection.
- Owned listeners are not comprehensively detached.
- The public guide/spec and standalone example describe older behavior.

## Decisions

- Treat the grid model as the public state entry point and the table model as
  the rendering pipeline owned by the grid.
- Preserve direct table APIs, but make grid-originated updates idempotent.
- Keep selection page-relative and reconcile by row identity after view
  changes; clear it rather than selecting unrelated data.
- Extend activation state additively with bounded selection indices and keep
  its live attribute synchronized.
- Keep both table and filter activation persistence opt-in. Persisted values
  are HTML-visible, and unsafe/non-JSON state removes or omits the attribute.
- Treat user header sorting as the source of `sort_change`; programmatic sort
  and selection remain silent. Effective page changes emit `page_change`.

## Implemented

- Added the structured operator contract shared by `Data_Filter` output and
  local `Data_Table` processing while retaining scalar and predicate filters.
- Synchronized grid/table/model paging, event forwarding, programmatic
  selection, row-identity reconciliation, and live ARIA state.
- Added newest-request handling, synchronous error recovery, idempotent
  teardown, exact listener removal, and async invalidation.
- Made `Data_Filter` fresh-reconstructable, type-aware when fields change, and
  explicit about bounded JSON-safe persistence.
- Kept live tabular activation metadata current through a second fresh
  reconstruction, including selected visible-row indices.
- Corrected `BindingManager.inspect()` computed/watcher names.
- Replaced the prototype example with the exported production controls.
- Added root test entry points and included control tests in the default suite.
- Rewrote public guides/specs around observed, tested behavior.

## Verification

- Focused input/data-control suite: 19 passing.
- Focused data-control gate: 16 passing after async/reconstruction additions.
- MVVM suite: 77 passing.
- Full framework suite: 863 passing, 2 pending.
- Standalone checks: Data_Grid 32/32, Data_Filter 66/66,
  Data_Table server-side 31/31.
- Opt-in reattachment lab: passing.
- Activated Chromium Filter → Grid contract: passing with no browser errors.
