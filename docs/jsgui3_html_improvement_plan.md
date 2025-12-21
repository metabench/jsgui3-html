# JSGUI3-HTML Improvement Plan

This document expands on the improvement ideas from the jsgui3-server review and translates them into concrete implementation work for `jsgui3-html`. It focuses on new controls, feature depth for existing controls, and cross-cutting system work (a11y, theming, naming consistency, and tests).

## Scope and goals

- Build missing core controls that map cleanly to native HTML, with predictable activation and server-side safety.
- Expand data-centric controls (tables, lists, trees) for real-world usage.
- Improve form and editor capability (validation, masking, error presentation).
- Unify naming, exports, and public API stability.
- Standardize a11y behavior and theme tokens across controls.

## Implementation guardrails

- Use snake_case for variables, methods, and file names; Camel_Case for class names.
- Controls must be isomorphic: DOM access is guarded and event wiring happens in `activate()`.
- Public methods require JSDoc.
- Models use `Data_Object`, not plain objects.
- New controls must be exported in `controls/controls.js`.
- New interactive examples should have E2E tests (Puppeteer).

## Related documents

- Priorities: `docs/jsgui3_html_improvement_priorities.md`
- Workstream checklists: `docs/jsgui3_html_improvement_checklists.md`
- Checklist index: `docs/improvement_checklists/INDEX.md`

## Workstreams and concrete implementation details

### 1) Missing core controls

These controls are small building blocks. Each should have a minimal, reliable feature set and a consistent API pattern with existing inputs (value get/set, enable/disable, validation hooks, and DOM guards).

Suggested locations use the existing structure under `controls/organised/0-core/0-basic/0-native-compositional` or `1-compositional` as appropriate.

- Textarea
  - File: `controls/organised/0-core/0-basic/0-native-compositional/textarea.js`
  - Class: `Textarea`
  - Features: `value`, `placeholder`, `rows`, `cols`, `disabled`, `readonly`, `focus()`, `select()`.
  - Bindings: `value` and `input` events; guard DOM access.
  - Tests: input and value round-trip, SSR guard.

- Password/email/url/tel inputs
  - File: `controls/organised/0-core/0-basic/0-native-compositional/text_input.js` expansion or separate files per input type if the project prefers explicit controls.
  - Expose `input_type` values and associated attributes.
  - Validation: `pattern`, `minlength`, `maxlength`, `autocomplete` support.
  - A11y: `aria-invalid` when invalid, `aria-describedby` for error element.

- Number input with stepper
  - File: `controls/organised/0-core/0-basic/0-native-compositional/number_input.js`
  - Features: `value`, `min`, `max`, `step`, `inputmode`, `wheel` handling.
  - Consider a compositional wrapper for custom steppers while still using native input.
  - Event model: normalize to a single `change` and `input` event in view model.

- Range slider (native) + stepped slider
  - File: `controls/organised/0-core/0-basic/0-native-compositional/range_input.js`
  - Stepped variant: `controls/organised/0-core/0-basic/1-compositional/stepped_slider.js`
  - Features: `min`, `max`, `step`, `value`, `ticks`.
  - A11y: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.

- Progress bar and meter
  - File: `controls/organised/0-core/0-basic/0-native-compositional/progress_bar.js`
  - File: `controls/organised/0-core/0-basic/0-native-compositional/meter.js`
  - Both should accept numeric values and clamp to range.
  - Consider a compositional wrapper for label + status text.

- Switch/toggle (styled checkbox)
  - File: `controls/organised/0-core/0-basic/1-compositional/toggle_switch.js`
  - Internally use checkbox control; keep `checked` in sync.
  - Provide `on_label` and `off_label` for a11y text.

- Chip/tag input
  - File: `controls/organised/1-standard/1-editor/tag_input.js`
  - Model: `Data_Object` with `items` array and `input_value`.
  - Features: add on enter/comma, remove on backspace, render chips list.
  - Add composition with existing `text_input` and `list`.

- Inline validation message
  - File: `controls/organised/1-standard/1-editor/inline_validation_message.js`
  - Plain text display, `status` variants (error, warn, info, success).
  - Should work as `aria-describedby` target for inputs.

- Breadcrumbs and pagination
  - File: `controls/organised/1-standard/5-ui/breadcrumbs.js`
  - File: `controls/organised/1-standard/5-ui/pagination.js`
  - Provide `items`/`pages` arrays and selection events.

- Tooltip/popover
  - File: `controls/organised/1-standard/5-ui/tooltip.js`
  - Consider anchoring to existing control via `target` and `placement`.
  - For popover: compositional container that can hold arbitrary controls.
  - A11y: `role="tooltip"` and `aria-describedby` wiring.

- Notification/toast and alert banner
  - File: `controls/organised/1-standard/5-ui/toast.js`
  - File: `controls/organised/1-standard/5-ui/alert_banner.js`
  - Provide `queue` or container and a small API: `show`, `dismiss`.
  - Consider timeouts and pause-on-hover.

- Badge/pill
  - File: `controls/organised/0-core/0-basic/1-compositional/badge.js`
  - Minimal layout + theme tokens; used across other controls.

### 2) Data and collection controls

- Data table
  - File: `controls/organised/1-standard/4-data/data_table.js`
  - Use `Data_Object` for `rows`, `columns`, `sort_state`, `filters`.
  - Provide cell rendering hooks and a column config schema.
  - Sorting and filtering should be pluggable and optionally client-side.
  - A11y: table semantics, `aria-sort`, keyboard nav.
  - Tests: render, sort, filter, pagination, empty state.

- Virtualized list/grid
  - File: `controls/organised/1-standard/4-data/virtual_list.js`
  - Use `scroll_view` with a windowed rendering strategy.
  - Expose item renderer callback and item size config.
  - Consider a mixin for virtualization usable by list and grid.

- Tree table hybrid
  - File: `controls/organised/1-standard/4-data/tree_table.js`
  - Compose `tree` with a column layout; allow expand/collapse per row.
  - Maintain state for expanded node ids.

- List reordering
  - File: `controls/organised/1-standard/5-ui/reorderable_list.js`
  - Add drag and drop with keyboard fallback.
  - Update underlying `Data_Object` order.

- Master/detail split view
  - File: `controls/organised/1-standard/6-layout/master_detail.js`
  - Compose `split_pane` with `list` and detail container.

- Data grid reconnection
  - Revisit `controls/connected/data-grid.js` and integrate into `controls/controls.js`.
  - Define a modern API: `data_source`, `columns`, `selection`, `sort_state`.
  - Decide whether this becomes a wrapper around `data_table` or a separate control.

### 3) Layout and navigation expansion

- Split pane / resizable panes
  - File: `controls/organised/1-standard/6-layout/split_pane.js`
  - Horizontal and vertical modes, drag handles, min/max sizes.

- Accordion / collapsible sections
  - File: `controls/organised/1-standard/6-layout/accordion.js`
  - Built on top of `vertical_expander`.

- Sidebar + responsive drawer
  - File: `controls/organised/1-standard/6-layout/drawer.js`
  - Provide open/close state and overlay support for mobile.

- Tab variants
  - Extend `tabbed-panel` with vertical and icon tabs, overflow handling.
  - Consider an optional `tab_bar` sub-control.

- Stepper / wizard layout
  - File: `controls/organised/1-standard/6-layout/stepper.js`
  - Provide `steps` model and progress indicator.

- Layout primitives
  - Files: `stack.js`, `cluster.js`, `center.js`, `grid_gap.js`
  - Simple wrappers around flex/grid with clear props.

### 4) Form and editor features

- Form container with validation routing
  - File: `controls/organised/1-standard/1-editor/form_container.js`
  - Model: `Data_Object` for values and validation state.
  - Expose `validate()` and `submit()`; allow per-field validators.
  - Provide a standard place to attach inline validation messages.

- Field-level error display + status badges
  - Pair with `inline_validation_message` and `badge` control.
  - Add standardized CSS classes and aria attributes.

- Input masking
  - Implement as a mixin or helper for `text_input` and `textarea`.
  - Support date, currency, phone formats with pluggable patterns.

- Autosize text field / textarea
  - Add to `textarea` or as a compositional wrapper with a hidden sizer.

- Rich text editor improvements
  - Expand `rich_text_editor` with toolbar and formatting actions.
  - Consider optional markdown mode and paste sanitization.

- Object editor improvements
  - Add schema-driven rendering and add/remove key/value operations.
  - Provide inline editing with `text_input` and `dropdown_list`.

### 5) Feature depth for existing controls

- Checkbox
  - Fix `el_radio` typo in change handler.
  - Ensure `checked` state sync on initialization and updates.
  - Add keyboard focus styling and `aria-checked`.

- Date picker
  - Add `min`, `max`, `locale`, `week_start`, keyboard navigation.
  - Provide `value` parse/format utility (client and server-safe).

- Dropdown/list/combobox
  - Add async options and typeahead filtering.
  - Standardize `items` schema and `selected_item` binding.
  - Add `aria-expanded`, `aria-activedescendant`.

- Window/panel
  - Add snap, dock, maximize, z-index management, resize handles.
  - Consider a shared window manager singleton for stacking.

- Tree and file tree
  - Add lazy loading, multi-select, drag reparent, keyboard navigation.
  - Provide `expanded_ids` and `selected_ids` in model.

- Scrollbar/scroll_view
  - Add horizontal + vertical sync and optional inertia.

### 6) Accessibility and semantics

- Create a small a11y helper module for: `aria` attribute setting, role defaults, label wiring, focus management.
- Standardize keyboard navigation patterns for lists, trees, menus, tab panels.
- Add reduced-motion mode using CSS media queries and provide a theme token.
- Ensure icon-only buttons include screen reader text.

### 7) Theming and styling system

- Add CSS tokens for color, spacing, radius, typography.
- Provide a theme context object and allow per-control overrides.
- Introduce CSS layers or base/component/utility structuring.
- Document the intended usage in `docs/` and update examples.

### 8) Consistency and packaging

- Normalize naming and casing: remove duplicates like `FormField.js` vs `form_field.js`.
  - Decide on a canonical control and provide legacy aliases for a deprecation window.
- Define stable public exports in `controls/controls.js` and mark experimental controls clearly.
- Clarify which controls are core vs showcase in documentation.

## Additional ideas beyond the suggestions

- Input base class or mixin
  - Add a shared base for all inputs to handle `value`, `disabled`, `readonly`, `name` and basic a11y.

- Unified selection model
  - For list, tree, grid, and file tree: a shared selection API (`selected_ids`, `toggle_select`).

- Control theming registry
  - Optional theme registry that can swap control styles based on context.

- Server-safe rendering checks
  - Add a small helper for guarded DOM operations to reduce repeated checks.

- Control lifecycle tests
  - Basic unit tests to ensure `constructor` and `activate` behavior is consistent.

- Performance budget
  - Add a simple benchmark page in `dev-examples` for control render speed.

## Suggested roadmap and sequencing

- Phase 1: Core and reliability
  - Add missing native inputs and basic validation components.
  - Fix checkbox and other low-risk bug fixes.
  - Add a11y baselines across native inputs.

- Phase 2: Data and forms
  - Data table, virtual list, and form container with validation.
  - Object editor improvements and tag input.

- Phase 3: Layout and advanced UX
  - Split panes, accordion, drawer, stepper.
  - Window management and theming system.

## Documentation and test updates

- Add a new `docs/` entry for the new control(s) and update `README.md` as needed.
- Create `dev-examples/` for complex controls (data table, virtual list, form container).
- Add E2E tests for interactive examples and unit tests for utilities.

## Open questions

- Do we want a single shared input base class, or keep inputs independent for minimal coupling?
- Should the data table be built on a unified data grid, or separate simpler table control?
- Is there an existing theming mechanism that should be extended rather than replaced?
