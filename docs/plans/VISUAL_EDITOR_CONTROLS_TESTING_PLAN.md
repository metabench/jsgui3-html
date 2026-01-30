# Visual Editor Controls Testing Plan (Testing Pyramid)

**Date**: 2026-01-29

This plan lists the testing work required to extensively validate all newly added visual editor controls and utilities, following the testing pyramid (unit → integration → E2E/visual/a11y). It also defines when to use `lab/` for research experiments.

---

## 0) Prerequisites and Test Harness Setup

- [ ] Add a test index for new controls in `test/` (unit, integration, e2e, visual).
- [ ] Ensure jsdom or browser-like environment is available for DOM-bound controls.
- [ ] Establish shared helpers:
  - Control instantiation helper with `Page_Context`.
  - Event capture helper for `change`, `input`, `drag-like-action-*`.
  - DOM query helper for `data-jsgui-id` activation checks.
- [ ] Add fixtures for date/calendar values, selections, and layout snapshots.

---

## 1) Unit Tests (Base of Pyramid)

**Goal:** Test logic in isolation without browser rendering whenever possible.

### 1.1 Selection_Handles
- [ ] Creates handles for all 8 directions.
- [ ] `maintain_aspect` keeps ratio on resize.
- [ ] `min_size` / `max_size` clamp correctly.
- [ ] `move-start` / `move-end` events fire when dragging frame.
- [ ] `resize-start` / `resize-move` / `resize-end` fire per handle.

### 1.2 Snap_Guide_Overlay
- [ ] `get_snapped_position()` snaps to grid properly.
- [ ] `start_drag()` shows overlay; `end_drag()` hides.
- [ ] `set_excluded()` stores excluded list.

### 1.3 Property_Grid
- [ ] Renders rows from schema.
- [ ] `register_editor()` uses custom editor class.
- [ ] `property-change` fired with old/new values.
- [ ] `property-changing` cancel stops update.
- [ ] `filter()` hides rows by label.

### 1.4 Dockable_Panel_System
- [ ] `add_panel()` creates group and raises `panel-dock`.
- [ ] `remove_panel()` removes panel entry.
- [ ] `get_layout()` / `set_layout()` round trip.
- [ ] `save_layout()`/`restore_layout()` no-op safely when unavailable.

### 1.5 Document_Tab_Container
- [ ] `add_tab()` registers tabs and selects index 0.
- [ ] `remove_tab()` raises `tab-close` (cancelable) + `tab-closed`.
- [ ] `set_modified()` raises `tab-modified`.
- [ ] `close_to_right()` removes appropriate subset.

### 1.6 Dialog
- [ ] `open()`/`close()` raise events.
- [ ] Button definitions create actions.
- [ ] `set_title()` updates header.

### 1.7 Color_Picker
- [ ] Default value applied and reported.
- [ ] `set_value()` raises `change` with format.
- [ ] `add_recent()` list dedupes and caps length.

### 1.8 Font_Picker
- [ ] `set_value()` updates preview styles.
- [ ] Emits `change` on size/family selection.

### 1.9 Date_Picker_Progressive
- [ ] Native input syncs value to calendar and back.
- [ ] `open_calendar()`/`close_calendar()` flags and events.
- [ ] `clear()` sets null value and raises `change`.

### 1.10 Calendar
- [ ] `go_to_date()` updates month/year in Month_View.
- [ ] `next_month()` / `prev_month()` navigation updates title.
- [ ] `set_value()` updates display month.
- [ ] `date-click` event fires on day selection.

### 1.11 Status_Bar
- [ ] `add_section()`/`remove_section()` updates structure.
- [ ] `set_text()` updates section content.

### 1.12 Anchor_Editor
- [ ] Toggle edges update `value` and `change` event.

### 1.13 Dock_Editor
- [ ] Selecting each dock position updates `value`.

### 1.14 Collection_Editor
- [ ] `add_item()` respects `max_items`.
- [ ] `remove_item()` respects `min_items`.
- [ ] `select_item()` updates Property_Grid target.

### 1.15 Undo_Redo_Manager + Commands
- [ ] Execute/undo/redo stack integrity.
- [ ] `begin_transaction()` / `end_transaction()` creates composite command.
- [ ] `merge()` behavior for typed commands.

### 1.16 Clipboard_Manager
- [ ] `copy()` stores serialized payload.
- [ ] `cut()` removes from container.
- [ ] `paste()` returns stored controls.

---

## 2) Integration Tests (Middle of Pyramid)

**Goal:** Validate interactions between controls, mixins, and models.

### 2.1 Selection_Handles + resizable/drag_like_events
- [ ] Drag handle updates target size and position.
- [ ] `maintain_aspect` on handles with real target control.

### 2.2 Property_Grid + Editor Controls
- [ ] `Color_Picker` editor updates a target property.
- [ ] `Anchor_Editor`/`Dock_Editor` editors update target.

### 2.3 Date_Picker_Progressive + Calendar + Date_Picker
- [ ] Date selected in calendar updates native input value.
- [ ] Native input change updates calendar selection.

### 2.4 Dockable_Panel_System + Tabbed_Panel
- [ ] Panel added to a zone appears in tab group.
- [ ] Group contains correct panel content control.

### 2.5 Document_Tab_Container + Tabbed_Panel
- [ ] Add multiple tabs with icons and set active.

### 2.6 Collection_Editor + Property_Grid
- [ ] Select item -> Property_Grid target updates and edits propagate.

---

## 3) End-to-End (E2E) Tests

**Goal:** Validate real DOM interactions in browser-like environments (Puppeteer).

### 3.1 Visual Editor Harness Page
- [ ] Build a single E2E page with all controls to reduce setup cost.
- [ ] Test selection handles, drag and resize with pointer events.
- [ ] Use the date picker dropdown and validate calendar popover.

### 3.2 Specific Scenarios
- [ ] Docking a panel and switching tabs.
- [ ] Document tabs: close, pin, reorder, overflow handling.
- [ ] Dialog: open, close, escape key, click outside.
- [ ] Property grid: change a property and observe target update.
- [ ] Status bar updates via set_text.

---

## 4) Visual Regression Tests

**Goal:** Catch layout regressions and theming breakage.

- [ ] Baseline snapshots for each control (light + dark).
- [ ] Selection_Handles overlay states (idle, resize active).
- [ ] Date_Picker_Progressive: closed vs open.
- [ ] Calendar: month view with selection.
- [ ] Dockable_Panel_System: left/right/bottom docks.
- [ ] Dialog: modal overlay + panel.
- [ ] Property_Grid: with long labels and editor types.

---

## 5) Accessibility Tests

**Goal:** Confirm ARIA and keyboard navigation for all controls.

- [ ] Dialog: focus trap, `aria-modal`, ESC close.
- [ ] Document tabs: `role="tablist"`, `aria-selected`.
- [ ] Calendar: `role="grid"`, `aria-current="date"`.
- [ ] Date_Picker_Progressive: keyboard navigation (Enter/Escape/Arrow).
- [ ] Selection_Handles: keyboard accessible handle focus (if supported).

---

## 6) Performance and Stress Tests

- [ ] Property_Grid with 200+ rows.
- [ ] Calendar with 500+ events (if event rendering added).
- [ ] Dockable_Panel_System with 20+ panels.
- [ ] Document_Tab_Container with 100 tabs.

---

## 7) SSR + Activation Tests

- [ ] Server-render native date picker markup.
- [ ] Client activation reuses existing DOM nodes.
- [ ] Serialized `data-jsgui-*` attributes persist and restore.

---

## 8) CSS/Theming Validation

- [ ] Confirm new CSS tokens for date picker and calendar apply in both light/dark.
- [ ] Verify `editor-controls.css` styles apply to new editor controls.
- [ ] Theme overrides via `.dark-theme` class.

---

## 9) Labs (Research and Experiments Only)

**Use `lab/` solely for research before finalizing code.**

### Suggested Experiments
- [ ] Drag/resize ergonomics test harness using `selection_handles`.
- [ ] Calendar rendering and selection performance test with large date sets.
- [ ] Docking layout heuristics experiment to compare grid vs flex layouts.

### Lab Files
- [ ] Add experiments under `lab/experiments/`.
- [ ] Use `lab/experiment_runner.js` to script experiments.
- [ ] Capture findings in `lab/results/` with reproducible steps.

---

## 10) Deliverables Checklist

- [ ] Unit tests for all controls.
- [ ] Integration tests for shared workflows.
- [ ] E2E tests for interactive behaviors.
- [ ] Visual regression suite.
- [ ] Accessibility audit.
- [ ] SSR + activation validation.
- [ ] Theme validation checks.
- [ ] Lab findings (only where needed).
