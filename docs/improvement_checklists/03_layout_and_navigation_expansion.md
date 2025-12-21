# Layout and Navigation Expansion

Each checklist item should include tests and documentation updates.

## Split pane
- [x] Create `controls/organised/1-standard/6-layout/split_pane.js` with class `Split_Pane`.
- [x] Support horizontal/vertical, min/max sizes, drag handles.
- [x] Export, example, E2E tests for resizing.

## Accordion
- [x] Create `controls/organised/1-standard/6-layout/accordion.js` with class `Accordion`.
- [x] Compose `vertical_expander` instances.
- [x] Provide single-open or multi-open modes.
- [x] Export, example, E2E tests for expand/collapse.

## Drawer
- [x] Create `controls/organised/1-standard/6-layout/drawer.js` with class `Drawer`.
- [x] Support overlay mode and responsive breakpoints.
- [x] Provide open/close events and a11y focus trapping.
- [x] Export, example, E2E tests for open/close.

## Tab variants
- [x] Extend `tabbed_panel` for vertical tabs, icon tabs, and overflow.
- [x] Add `tab_bar` config and overflow menu behavior.
- [x] Update docs and add example.

## Stepper / wizard
- [x] Create `controls/organised/1-standard/6-layout/stepper.js` with class `Stepper`.
- [x] Provide `steps` model, current step index, and completion status.
- [x] Export, example, E2E tests for navigation.

## Layout primitives
- [x] Create `stack.js`, `cluster.js`, `center.js`, `grid_gap.js` under `6-layout`.
- [x] Keep API minimal: spacing, alignment, and direction.
- [x] Export and add short examples.
