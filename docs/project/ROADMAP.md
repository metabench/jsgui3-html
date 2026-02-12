# jsgui3-html Roadmap

This document consolidates the development plan for `jsgui3-html`, derived from `docs/jsgui3_html_improvement_plan.md` and `docs/control-design-book/05-control-catalogue.md`.

## Phase 1: Core Reliability & Visual Baseline (Current Focus)

Goal: Ensure all base controls are present, functional, and visually styled (T2+).

- [ ] **Checkbox & Radio**:
    - [ ] Fix unstyled/native appearance.
    - [ ] Implement SVG checkmark animation.
    - [ ] Add indeterminate state.
- [ ] **Toggle Switch**:
    - [ ] Create `controls/organised/0-core/0-basic/1-compositional/toggle_switch.js`.
- [ ] **Text Input & Textarea**:
    - [ ] Styling for focus, error, and disabled states.
    - [ ] Add `Textarea` control wrapping native element.
- [ ] **Button Polish**:
    - [ ] Implement missing variants (outline, ghost, link, icon).
    - [ ] Verify accessibility (aria-pressed, etc).

## Phase 2: Data & Forms (Next)

Goal: Enable complex data entry and display.

- [ ] **Data Table**:
    - [ ] Implement `data_table.js` with columns/rows model.
- [ ] **Form Container**:
    - [ ] Validation routing and submission handling.
- [ ] **Virtual List**:
    - [ ] Efficient rendering for large collections.

## Phase 3: Layout & Advanced UX

Goal: Desktop-class application layout.

- [ ] **Window / Panel**:
    - [ ] Resize handles, snap-to-edge, window management.
- [ ] **Split Pane**:
    - [ ] Resizable dividers.
- [ ] **Tabs**:
    - [ ] Animated indicators, overflow handling.

## Reference Material
- **Detailed Design Specs**: `docs/control-design-book/05-control-catalogue.md`
- **Architecture**: `docs/jsgui3_html_improvement_plan.md`
