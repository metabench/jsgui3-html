# Session Summary

**Date**: 2026-07-25
**Topic**: Docs Viewer Grid Activation

## Completed

- Reproduced fresh-client `Data_Grid`/`Data_Table` state loss separately from
  same-instance activation.
- Added an opt-in, bounded, JSON-safe static activation-state contract.
- Preserved the exact initial SSR row nodes and restored later model-owned
  filter, sort, page, selection, and keyboard updates.
- Repaired contextual parsing for dynamic table rows/cells.
- Replaced production-unsafe Unicode CSS `content` indicators with tested
  bundle-safe CSS triangles after visual review caught the escaped label.
- Made deprecated compatibility aliases lazy while retaining their public
  behavior.
- Adopted the contract in the docs viewer's eight-row opening Control Atlas.
- Passed the deterministic lab, 35 focused tests, all 657 framework tests,
  all 19 owner tests, and private desktop/mobile browser gates.

## Not Completed

- Function-backed, adapter-backed, and asynchronous data serialization was
  intentionally excluded.
- Virtual scrolling and nested dependency deduplication remain separate work.

## Follow-ups

- [ ] Deduplicate the historical `jsgui3-html@0.0.180` dependency through its
      package owner rather than editing `node_modules`.
- [ ] Give virtual data sources their own reattachment, resize, focus, and
      accessibility research project before changing defaults.

## Lessons Learned

- Same-instance activation is not evidence of browser reattachment; a fresh
  constructor must be tested against server-rendered markup.
- Initial activation should adopt SSR nodes, not immediately replace them.
- HTML table mutations require a table-aware parsing context.
- A bounded ordinary page can outperform a more complex virtual-scroll
  lifecycle for a modest, fully discoverable registry.

## Files Changed

- `controls/connected/Data_Grid.js`
- `controls/organised/1-standard/4-data/Data_Table.js`
- `controls/organised/1-standard/4-data/tabular_activation_state.js`
- `control_mixins/grid_keyboard_nav.js`
- `html-core/control-enh.js`
- `controls/controls.js`
- `html.js`
- `test/core/data_grid_activation_state.test.js`
- `test/core/module_load_regression.test.js`
- `lab/experiments/001-data-grid-reattach/`
- this session record and the session hub
