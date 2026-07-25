# Experiment 001: Data Grid SSR Reattachment

## Hypothesis

A `Data_Grid` rendered with static, JSON-safe rows preserves its HTML and
restores its `_ctrl_fields` table reference through a fresh client activation,
but the reattached `Data_Grid` and `Data_Table` instances lose the columns,
rows, selection mode, and table-event bridge because those constructor options
and compose-time listeners are not serialized.

## Setup

Run from the `jsgui3-html` repository:

```bash
node lab/experiments/001-data-grid-reattach/check.js
```

The check renders a grid in one `Page_Context`, mounts the HTML into jsdom,
creates a fresh client context, then calls `pre_activate()` and `activate()`.

## Expected Result

The compatibility case should preserve the legacy opt-in boundary. The static
opt-in case should retain its first server-rendered page during activation,
restore its bounded JSON-safe model, and then support native sorting, paging,
filtering, selection, and accurate ARIA row metadata.

## Actual Result

Verified. A non-opt-in table preserves its server DOM without serializing data.
With `persist_activation_state: true`, 24 static rows render as a six-row first
page, retain that exact DOM through fresh activation, and restore the full
model and `Data_Grid` event bridge. Subsequent sort, page, filter, and selection
operations update only the bounded page. Duplicate control IDs are rejected by
the check, and logical `aria-rowindex`/`aria-rowcount` values are asserted.
