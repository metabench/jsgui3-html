# Working Notes

Session: Docs Viewer Grid Activation

---

## Baseline research

**Context**: The public docs viewer renders all 157 control-registry rows inside
an opening `Data_Grid`.

**Findings**:

- Public Chromium reports 1,898 DOM elements, 157 atlas rows, 436,743 decoded
  HTML bytes, no duplicate IDs, and correct desktop/mobile opening geometry.
- `Data_Table` already owns paging and a virtual renderer, but `Data_Grid` does
  not forward those options.
- A fresh reattached `Data_Table` currently starts with empty columns and rows;
  generic model state is not restored unless declarative `tpl` mounting invokes
  `_restore_model_state_from_dom()`.
- `Data_Grid` registers inner-table events only during server composition and
  has no reattachment-specific `activate()` path.
- The viewer therefore correctly uses application-owned DOM interaction today;
  replacing it requires stronger proof than same-instance unit tests.
- Deprecated alias modules warn when the full registry loads because
  `controls/controls.js` requires both aliases eagerly.

**Decisions**:

- Keep framework work opt-in and additive.
- Reject serialization whenever a row or column contains non-plain values or
  functions.
- Require a fresh-context reattachment test and real-browser proof before using
  a framework state contract in the deployed viewer.

**Next Steps**:

- Build the minimal reattachment experiment.
- Compare app-level bounded paging with an opt-in framework contract.
- Test lazy deprecated aliases without changing canonical exports.

---

## Implementation decision

**Promoted contract**:

- `persist_activation_state: true` opts a static `Data_Table` or `Data_Grid`
  into a versioned JSON-safe state record.
- The record is bounded to 500 rows, 64 columns, 131,072 serialized
  characters, and nesting depth 20.
- Only finite JSON primitives, arrays, and plain objects are accepted.
  Functions, symbols, bigints, cycles, class instances, and oversized values
  disable persistence without changing the legacy render path.
- A fresh activation restores the model before computed table state is
  created, adopts the exact server-rendered first page, restores head/body
  lookups, and binds the grid-to-table bridge once.

**Related repairs**:

- Live table updates now parse row and cell markup in the parent table's
  contextual fragment instead of a generic `div`.
- `Data_Grid` forwards paging, filtering, sorting, selection, and persistence
  options to `Data_Table`.
- Logical ARIA row counts and page-offset row indices are retained through
  filter and paging changes.
- Grid keyboard navigation now includes Home and End.
- Sort indicators use ASCII-only CSS border geometry. This prevents the
  production extractor from turning a JavaScript Unicode escape into visible
  `u25B2` text.
- Deprecated `FormField` and `PropertyEditor` aliases are lazy,
  non-enumerable compatibility accessors. Direct access still warns and
  returns the canonical constructor.

---

## Verification

- Deterministic lab:
  `node lab/experiments/001-data-grid-reattach/check.js` passed, including
  exact first-page SSR-node retention and post-activation sort, filter, page,
  selection, and duplicate-ID checks.
- Focused framework suite: 35 passing.
- Full framework suite: 657 passing.
- Owner integration suite: 19/19 passing, including eight real Chromium
  tests.
- Private Oracle browser proof retained eight rendered rows out of 155
  logical controls, page-offset `aria-rowindex`, one selection event per
  interaction, zero duplicate IDs, and zero console warnings/errors.
- Final local, candidate, and public computed-style/screenshot checks proved
  the sorted header renders a 6px triangle, retains `aria-sort=ascending`, and
  contains no escaped label text.

## Deferred

- The old `jsgui3-html@0.0.180` nested under one local
  `jsgui3-webpage` dependency tree still emits its historical eager alias
  warnings. Installed packages were not patched; dependency deduplication is
  a separate owner/release task.
- Adapter-backed and asynchronous data remain outside this static activation
  state contract.
- Virtual scrolling remains a separate lifecycle and accessibility project;
  ordinary paging is the lower-risk fit for the 155-control registry.

---
