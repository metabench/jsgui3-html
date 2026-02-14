# Lab Results: Swappable Mode (Complexity Gating)

**Date:** 2026-02-12  
**Experiment:** `swappable_mode_lab.js`  
**Status:** ✅ All 13 assertions passed

## Summary

Validated a **Mode Registry** pattern where a control's internal composition is driven by a reactive `mode` property. Changing the mode triggers a teardown → recompose cycle while preserving the data model and public API.

## Patterns Validated

| Pattern | Implementation | Verdict |
|---------|---------------|---------|
| `field()` reactive mode | `field(this, 'mode', default)` on `obext` | ✅ Clean — raises `change` event, stores on `obj._` |
| Mode Registry | `_mode_registry` map of composer strategy objects | ✅ Simple, extensible, supports dynamic registration |
| Teardown → Recompose | `_on_mode_change` listens for field change events | ✅ Clean lifecycle, no stale DOM |
| Data preservation | Rows/columns cached before teardown, restored after | ✅ Zero data loss across switches |
| Shared API | `set_rows`, `set_columns`, `get_row_count` etc. | ✅ Works identically across all modes |
| `view.data.model` sync | Mode value synced to view model on every change | ✅ MVVM consumers can observe mode |
| Event propagation | `mode_changed` event with old/new mode | ✅ Composable — consumers can react |
| Dynamic registration | `register_mode()` adds new composers at runtime | ✅ No rebuild needed |

## Modes Tested

1. **`simple_table`** — Standard `<table>/<thead>/<tbody>/<tr>/<td>`. Semantic HTML, accessible.
2. **`div_grid`** — `<div>` with CSS Grid layout. Flexible, rearrangeable.
3. **`minimal`** — Dynamically registered. Just renders row count as text.

## Key Findings

### What works well
- `field()` from `obext` is the ideal primitive for mode tracking: it raises `change` events automatically, stores on `obj._` (serializable to `data-jsgui-fields`), and is already used throughout jsgui3.
- Composer objects are clean strategy interfaces (`compose`, `render`, `teardown`, `css`, `meta`).
- The teardown → recompose cycle is simple because `content.clear()` is already well-supported.

### Architecture insight: Composer as first-class object
Each composer can carry its own `css`, `meta` (description, icon, properties list), and even a `properties` schema. This maps directly to the **IDE complexity gating** vision:
- Toolbox shows `Data_Table` control
- User selects a mode → properties panel reconfigures with that composer's schema
- Mode meta includes illustration, description, and property accordion data

### Production considerations
1. **CSS scoping:** Each mode should add/remove its own CSS class. A CSS manager could load/unload mode CSS dynamically.
2. **Activation:** `activate()` needs mode-awareness — the active composer should have an `activate` method for DOM event binding.
3. **Mixin compatibility:** Mixins like `grid_selection` assume specific DOM structure. Each composer should declare which mixins it supports.
4. **Server-side rendering:** `field()` stores mode on `obj._`, which serializes to `data-jsgui-fields`. On activate, the client reads this to know which composer to boot.

## Next Steps

- [ ] Add `activate()` support to composers (DOM event binding per mode)
- [ ] Add `properties` schema to composer meta (for IDE property grid)
- [ ] Test mixin compatibility matrix (which mixins work with which composers)
- [ ] Prototype the IDE mode selector dialog
- [ ] Explore `view.data.model` as the single source of truth vs. `field()` — compare tradeoffs
