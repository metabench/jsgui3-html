# Data and Collection Controls

Each checklist item should include tests and documentation updates.

## Data table
- [x] Create `controls/organised/1-standard/4-data/data_table.js` with class `Data_Table`.
- [x] Define `columns` schema, `rows`, `sort_state`, `filters` in `Data_Object`.
- [x] Provide header click sorting and `aria-sort` updates.
- [x] Add filter hooks and pagination support.
- [x] Export, dev-example, E2E tests for sort/filter/pagination.

## Virtual list/grid
- [x] Create `controls/organised/1-standard/4-data/virtual_list.js` with class `Virtual_List`.
- [x] Windowed rendering based on scroll position.
- [x] Expose `item_renderer` and `item_height` config.
- [x] Add a virtualization mixin usable by list and grid.
- [x] Export, dev-example, E2E tests for large dataset.

## Tree table
- [x] Create `controls/organised/1-standard/4-data/tree_table.js` with class `Tree_Table`.
- [x] Compose `tree` with column layout and expand/collapse.
- [x] Store `expanded_ids` in model; update via events.
- [x] Export, example, E2E tests for expand/collapse.

## Reorderable list
- [x] Create `controls/organised/1-standard/5-ui/reorderable_list.js` with class `Reorderable_List`.
- [x] Add drag-and-drop and keyboard reordering.
- [x] Update `Data_Object` order on drop.
- [x] Export, example, E2E tests for reorder.

## Master/detail split view
- [x] Create `controls/organised/1-standard/6-layout/master_detail.js` with class `Master_Detail`.
- [x] Compose `split_pane` with list and detail container.
- [x] Expose `selected_id` and detail render hook.
- [x] Export, example, E2E tests for selection.

## Data grid reconnection
- [x] Review `controls/connected/data-grid.js` and decide replace or wrap strategy.
- [x] Define modern API: `data_source`, `columns`, `selection`, `sort_state`.
- [x] Wire into `controls/controls.js` and deprecate old API if needed.
- [x] Add migration notes in docs.
