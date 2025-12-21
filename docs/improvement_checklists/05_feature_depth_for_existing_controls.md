# Feature Depth for Existing Controls

Each checklist item should include tests and documentation updates.

## Checkbox fixes
- [x] Fix `el_radio` typo in change handler (no `el_radio` reference remains; change handler uses `el_checkbox`).
- [x] Ensure `checked` sync on initialization and updates.
- [x] Add `aria-checked` and focus styling.
- [x] Add unit test or E2E test for toggle behavior.

## Date picker improvements
- [x] Add `min`, `max`, `locale`, `week_start` options.
- [x] Add keyboard navigation and focus management.
- [x] Add format/parse helpers that are server-safe.
- [x] Tests for min/max and keyboard navigation.

## Dropdown/list/combobox improvements
- [x] Add async options loader and typeahead filtering.
- [x] Standardize `items` schema and `selected_item` binding.
- [x] Add ARIA roles and `aria-activedescendant` updates.
- [x] Tests for async load and selection.

## Window/panel enhancements
- [x] Add snap, dock, maximize, z-index manager.
- [x] Add resize handles and constraints.
- [x] Consider shared window manager singleton.
- [x] Tests for stacking and resizing.

## Tree and file tree enhancements
- [x] Add lazy loading with async child fetch.
- [x] Add multi-select and drag reparenting.
- [x] Add keyboard navigation.
- [x] Tests for lazy load and selection.

## Scrollbar/scroll_view enhancements
- [x] Add horizontal + vertical sync.
- [x] Add optional inertial scrolling.
- [x] Tests for scroll sync.
