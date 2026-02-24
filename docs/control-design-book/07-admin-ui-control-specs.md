# Chapter 7: Admin UI Control Specs — Full Build Specs

This chapter provides **Control_Spec v1** YAML specifications for the ten controls
most critical to building a production admin interface. These specs are grounded in
the current implementations and define the target acceptance criteria for each.

All specs use the `Control_Spec v1` JSON Schema defined in [Chapter 6](./06-unimplemented-control-specs.md).

---

## 7.1 Selection Rationale

An admin UI lives or dies on these capabilities:

| Capability | Primary control |
|------------|----------------|
| Tabular data browsing | **Data_Table** |
| Record editing | **Form_Container** |
| Navigation | **Sidebar_Nav** |
| Context & location | **Breadcrumbs** |
| List → detail flow | **Master_Detail** |
| Confirmations & dialogs | **Modal** |
| Actions & commands | **Toolbar** |
| Feedback & notifications | **Toast** |
| Content sectioning | **Tabbed_Panel** |
| Search & discovery | **Search_Bar** |

---

## 7.2 Data_Table

```yaml
spec_version: "1.0"
control:
  class_name: Data_Table
  type_name: data_table
  category: 1-standard/4-data
  priority: P0
  target_tier: T4
  proposed_file: controls/organised/1-standard/4-data/data_table.js
  dependencies: [Control, Data_Model_View_Model_Control, Pagination, Checkbox, Scroll_View]
status:
  implemented: true
  notes: >
    791-line implementation with MVVM pipeline, virtual rendering, sort/filter/paginate,
    column resize mixin, row selection, frozen columns. Current tier ~T2.
purpose:
  summary: >
    Renders tabular data with sorting, filtering, pagination, column resizing,
    row selection, virtual scrolling, and inline cell editing hooks.
  use_cases:
    - Admin entity listing (users, orders, logs, audit trails).
    - Server monitoring dashboards with sortable metric columns.
    - Data export preview with column visibility toggles.
  non_goals:
    - Not a spreadsheet (no formula engine).
    - Not a pivot table (use a dedicated BI control).
composition:
  children:
    - thead (header row with sort indicators)
    - tbody (data rows, standard or virtual-rendered)
    - tfoot (optional summary/pagination row)
    - column_resize_handles (overlay)
    - empty_state_slot
  variants: [default, compact, striped, bordered, card_rows]
  states: [idle, loading, empty, error, selecting, editing]
  default_variant: default
  default_state: idle
api:
  props:
    - name: columns
      type: array<{key:string, label:string, sortable?:boolean, width?:string, frozen?:boolean, render?:function, accessor?:function}>
      required: true
      description: Column definitions. Each must have a stable key.
    - name: rows
      type: array<object>
      required: true
      default: []
      description: Data rows keyed by column keys.
    - name: page
      type: number
      required: false
      default: 1
      description: Current 1-based page number.
    - name: page_size
      type: number
      required: false
      default: 25
      description: Rows per page (0 = no paging).
    - name: sort_state
      type: "{key:string, direction:'asc'|'desc'}|null"
      required: false
      default: null
      description: Active sort column and direction.
    - name: filters
      type: "object|null"
      required: false
      default: null
      description: Column filter map {column_key: filter_value}.
    - name: selectable
      type: boolean
      required: false
      default: false
      description: Enables row selection checkboxes.
    - name: multi_select
      type: boolean
      required: false
      default: false
      description: Allows multiple row selection.
    - name: virtual
      type: boolean
      required: false
      default: false
      description: Enables virtual scrolling for large datasets.
    - name: row_height
      type: number
      required: false
      default: 40
      description: Row height in px (required for virtual mode).
    - name: empty_text
      type: string
      required: false
      default: "No data"
      description: Text shown when rows array is empty.
    - name: loading
      type: boolean
      required: false
      default: false
      description: Shows loading skeleton overlay.
  events:
    - name: row_click
      payload: "{row_index:number, row_data:object}"
      when: User clicks a data row.
    - name: sort_change
      payload: "{key:string, direction:'asc'|'desc'}"
      when: User clicks a sortable column header.
    - name: page_change
      payload: "{page:number}"
      when: User navigates to a different page.
    - name: selection_change
      payload: "{selected_indices:number[], selected_rows:object[]}"
      when: Row selection changes via checkbox or click.
    - name: filter_change
      payload: "{filters:object}"
      when: Column filter values change.
    - name: column_resize
      payload: "{key:string, width:number}"
      when: User resizes a column via drag handle.
  methods:
    - name: set_rows
      signature: set_rows(rows)
      description: Replaces all data rows.
    - name: set_columns
      signature: set_columns(columns)
      description: Replaces column definitions.
    - name: set_sort_state
      signature: set_sort_state(sort_state)
      description: Programmatically sort by column.
    - name: set_filters
      signature: set_filters(filters)
      description: Programmatically apply filters.
    - name: set_page
      signature: set_page(page)
      description: Navigate to a specific page.
    - name: get_visible_rows
      signature: get_visible_rows()
      description: Returns rows after filter → sort → page pipeline.
    - name: get_selected_rows
      signature: get_selected_rows()
      description: Returns currently selected row objects.
    - name: select_all
      signature: select_all()
      description: Selects all rows on current page.
    - name: clear_selection
      signature: clear_selection()
      description: Deselects all rows.
interaction:
  keyboard:
    - key: ArrowUp / ArrowDown
      behavior: Move focus between rows.
    - key: ArrowLeft / ArrowRight
      behavior: Move focus between cells in a row.
    - key: Enter
      behavior: Activate row (emits row_click) or begin inline edit.
    - key: Space
      behavior: Toggle row selection when selectable=true.
    - key: Ctrl+A
      behavior: Select all rows when multi_select=true.
    - key: Home / End
      behavior: Focus first/last row.
    - key: Page Up / Page Down
      behavior: Navigate table pages.
    - key: Escape
      behavior: Cancel inline edit or clear selection.
  pointer:
    - Click header to sort (toggles asc → desc → none).
    - Click row to select or emit row_click.
    - Drag column border to resize.
    - Shift+click for range selection.
    - Ctrl+click for additive selection.
accessibility:
  roles:
    - table element with role="grid" when interactive
    - role="row" on tr elements
    - role="columnheader" on th elements with aria-sort
    - role="gridcell" on td elements
  aria:
    - aria-sort="ascending|descending|none" on sortable headers
    - aria-selected on selected rows
    - aria-rowcount and aria-colcount on grid
    - aria-rowindex on each row (for virtual scrolling)
    - aria-busy="true" during loading state
    - aria-label on table describing the data
  focus:
    - Roving tabindex across cells (row-major order).
    - Focus ring visible on active cell.
    - Tab enters grid, arrow keys navigate within.
styling:
  css_classes:
    - jsgui-data-table
    - jsgui-table-header
    - jsgui-table-row
    - jsgui-table-cell
    - jsgui-table-row-selected
    - jsgui-table-empty
    - jsgui-table-loading
  tokens:
    - --j-bg
    - --j-bg-elevated
    - --j-bg-muted
    - --j-fg
    - --j-fg-muted
    - --j-border
    - --j-primary
    - --j-shadow-sm
    - --j-text-sm
    - --j-font-sans
  density_support: [comfortable, compact, dense]
acceptance:
  e2e:
    - Renders column headers from definitions with correct labels.
    - Clicking a sortable header emits sort_change and shows sort indicator.
    - Pagination controls navigate pages and emit page_change.
    - Row click emits row_click with correct row_data.
    - Selection checkboxes toggle and emit selection_change.
    - Column resize drag updates column width visually and emits column_resize.
    - Virtual mode renders only visible rows (verify DOM count << total rows).
    - Empty state message appears when rows==[].
    - Loading state shows skeleton/spinner overlay.
    - Keyboard navigation (arrows, Enter, Space, Tab) works correctly.
    - aria-sort reflects current sort state.
  done_definition:
    - All 6 density/variant combinations render correctly.
    - Virtual mode handles 10,000+ rows without visible lag.
    - Full keyboard grid navigation per WAI-ARIA grid pattern.
    - Adaptive: card-row mode on phone layout.
```

---

## 7.3 Form_Container

```yaml
spec_version: "1.0"
control:
  class_name: Form_Container
  type_name: form_container
  category: 1-standard/1-editor
  priority: P0
  target_tier: T3
  proposed_file: controls/organised/1-standard/1-editor/form_container.js
  dependencies: [Control, Data_Object, Text_Input, Checkbox, Select_Options, Number_Input, Textarea, Inline_Validation_Message]
status:
  implemented: true
  notes: >
    503-line implementation with model binding, field-level validation,
    adaptive layout, submit handling. Current tier ~T2.
purpose:
  summary: >
    Declarative form builder that generates labelled input fields from
    a field definition array, binds to a data model, validates on submit,
    and adapts layout across phone/tablet/desktop.
  use_cases:
    - CRUD record editor (create user, edit order, settings panel).
    - Login / registration forms.
    - Filter/search forms in admin dashboards.
  non_goals:
    - Not a schema-driven code generator (no JSON Schema → form).
    - Not a form step wizard (use Stepper + Form_Container).
composition:
  children:
    - form_fields (label + input + validation message per field)
    - actions_row (submit/reset buttons)
    - error_summary (optional aggregate error list)
  variants: [default, horizontal, inline, card]
  states: [pristine, dirty, validating, valid, invalid, submitting, submitted, disabled]
  default_variant: default
  default_state: pristine
api:
  props:
    - name: fields
      type: >
        array<{
          name:string, label?:string, type?:string,
          required?:boolean, placeholder?:string,
          options?:array, validators?:array<function>,
          help_text?:string, default_value?:any, col_span?:number
        }>
      required: true
      description: Field definition array driving form generation.
    - name: values
      type: object
      required: false
      default: {}
      description: Initial field values keyed by field name.
    - name: columns
      type: number
      required: false
      default: 1
      description: Number of form columns (desktop layout).
    - name: submit_label
      type: string
      required: false
      default: "Submit"
      description: Submit button label text.
    - name: show_reset
      type: boolean
      required: false
      default: false
      description: Shows a reset button alongside submit.
    - name: validate_on_blur
      type: boolean
      required: false
      default: true
      description: Triggers field validation on blur.
    - name: validate_on_change
      type: boolean
      required: false
      default: false
      description: Triggers field validation on every change.
    - name: disabled
      type: boolean
      required: false
      default: false
      description: Disables all form inputs and submit.
  events:
    - name: submit
      payload: "{values:object, is_valid:boolean, errors:object}"
      when: User clicks submit (fires after validation).
    - name: change
      payload: "{field_name:string, value:any, values:object}"
      when: Any field value changes.
    - name: validate
      payload: "{is_valid:boolean, errors:object}"
      when: Validation completes (blur or explicit).
    - name: reset
      payload: "{values:object}"
      when: Form is reset to initial values.
  methods:
    - name: get_values
      signature: get_values()
      description: Returns all current field values as object.
    - name: set_values
      signature: set_values(values)
      description: Programmatically sets field values.
    - name: get_value
      signature: get_value(field_name)
      description: Returns single field value.
    - name: set_value
      signature: set_value(field_name, value)
      description: Sets single field value.
    - name: validate
      signature: validate()
      description: Runs all validators, returns {is_valid, errors}.
    - name: submit
      signature: submit()
      description: Validates then emits submit event.
    - name: reset
      signature: reset()
      description: Resets all fields to initial values.
    - name: set_field_error
      signature: set_field_error(field_name, message)
      description: Manually sets validation error on a field.
    - name: clear_errors
      signature: clear_errors()
      description: Clears all validation errors.
interaction:
  keyboard:
    - key: Tab
      behavior: Moves focus between form fields in order.
    - key: Shift+Tab
      behavior: Moves focus to previous field.
    - key: Enter
      behavior: Submits form when focus is on last field or submit button.
    - key: Escape
      behavior: Resets form if show_reset=true, else blurs.
  pointer:
    - Click label to focus corresponding input.
    - Click submit button to validate and submit.
accessibility:
  roles:
    - Native form element
    - role="group" on fieldset sections
  aria:
    - aria-required on required fields
    - aria-invalid on fields with validation errors
    - aria-describedby linking input to help_text and error message
    - aria-disabled on disabled form
    - aria-live="polite" on error summary
  focus:
    - First invalid field receives focus after failed validation.
    - All inputs are tabbable in source order.
styling:
  css_classes:
    - form-container
    - form-container-field
    - form-container-label
    - form-container-input
    - form-container-message
    - form-container-actions
    - form-container-dirty
    - form-container-invalid
  tokens:
    - --j-fg
    - --j-bg
    - --j-border
    - --j-primary
    - --j-danger
    - --j-text-sm
    - --j-font-sans
    - --j-space-2
    - --j-space-4
    - --j-radius-md
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - Generates correct input types from field definitions.
    - Required field validation prevents submit and shows error.
    - Custom validator functions run and display messages.
    - get_values() returns current form state.
    - set_values() populates all fields correctly.
    - Phone layout stacks label above input (single column).
    - Tablet layout uses narrower label column.
    - Tab order follows field definition order.
    - aria-invalid set on failed fields.
    - Error summary lists all errors with field links.
  done_definition:
    - Supports text, number, email, password, tel, url, textarea, select, checkbox, radio field types.
    - Multi-column grid layout on desktop.
    - Model binding two-way synchronization verified.
```

---

## 7.4 Sidebar_Nav

```yaml
spec_version: "1.0"
control:
  class_name: Sidebar_Nav
  type_name: sidebar_nav
  category: 1-standard/6-layout
  priority: P0
  target_tier: T3
  proposed_file: controls/organised/1-standard/6-layout/sidebar_nav.js
  dependencies: [Control, Badge, Icon]
status:
  implemented: true
  notes: >
    400-line implementation with sections, icons, badges, collapsible mode,
    adaptive layout (phone overlay, tablet rail, desktop full). Current tier ~T2.
purpose:
  summary: >
    Vertical navigation sidebar with hierarchical sections, icon support,
    badge counts, collapse/expand, and adaptive layout morphing.
  use_cases:
    - Primary admin app navigation.
    - Settings panel category navigation.
    - Documentation sidebar with section groups.
  non_goals:
    - Not a horizontal nav bar (use Horizontal_Menu).
    - Not a breadcrumb trail.
composition:
  children:
    - header_slot (logo, app name, collapse toggle)
    - nav_items (recursive: link | group with children)
    - footer_slot (user profile, settings shortcut)
  variants: [default, compact, branded, minimal]
  states: [expanded, collapsed, overlay_open, overlay_closed]
  default_variant: default
  default_state: expanded
api:
  props:
    - name: items
      type: "array<{id:string, label:string, icon?:string, badge?:string|number, href?:string, items?:array, disabled?:boolean}>"
      required: true
      description: Navigation tree. Nested items create collapsible groups.
    - name: active_id
      type: string
      required: false
      default: null
      description: Currently active navigation item id.
    - name: collapsed
      type: boolean
      required: false
      default: false
      description: Start in collapsed (icon-only rail) mode.
    - name: collapsible
      type: boolean
      required: false
      default: true
      description: Whether the sidebar can be collapsed.
    - name: header
      type: string|Control
      required: false
      description: Header content (logo/title).
    - name: footer
      type: string|Control
      required: false
      description: Footer content (user info).
  events:
    - name: navigate
      payload: "{id:string, item:object}"
      when: User clicks a navigation item.
    - name: collapse_change
      payload: "{collapsed:boolean}"
      when: Sidebar collapse state changes.
    - name: group_toggle
      payload: "{id:string, expanded:boolean}"
      when: A navigation group is expanded or collapsed.
  methods:
    - name: set_active
      signature: set_active(id)
      description: Programmatically sets active item, expanding parent groups.
    - name: toggle_collapse
      signature: toggle_collapse(force?)
      description: Toggles or forces collapsed state.
    - name: get_active_id
      signature: get_active_id()
      description: Returns currently active item id.
    - name: set_items
      signature: set_items(items)
      description: Replaces navigation items.
    - name: set_badge
      signature: set_badge(id, value)
      description: Updates badge value for a specific item.
interaction:
  keyboard:
    - key: ArrowUp / ArrowDown
      behavior: Move focus between visible nav items.
    - key: ArrowRight
      behavior: Expand collapsed group or move to first child.
    - key: ArrowLeft
      behavior: Collapse group or move to parent.
    - key: Enter
      behavior: Activate focused item (emits navigate) or toggle group.
    - key: Home / End
      behavior: Focus first/last visible item.
  pointer:
    - Click item to navigate and emit navigate event.
    - Click group header to toggle expand/collapse.
    - Click collapse toggle to switch rail/expanded mode.
accessibility:
  roles:
    - nav element as root
    - role="tree" on item container
    - role="treeitem" on each nav item
    - role="group" on nested item lists
  aria:
    - aria-label="Main navigation" on nav element
    - aria-expanded on group headers
    - aria-current="page" on active item
    - aria-disabled on disabled items
  focus:
    - Roving tabindex within tree.
    - Visible focus ring on focused item.
    - Focus preserved across collapse/expand.
styling:
  css_classes:
    - jsgui-sidebar-nav
    - sidebar-link
    - sidebar-icon
    - sidebar-badge
    - sidebar-group
    - sidebar-section-header
    - is-active
    - is-collapsed
  tokens:
    - --j-bg-elevated
    - --j-border
    - --j-fg
    - --j-primary
    - --j-bg-hover
    - --j-bg-selected
    - --sidebar-width
    - --j-touch-target
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - Renders flat and nested item structures correctly.
    - Active item is visually highlighted and has aria-current.
    - Group toggle expands/collapses children with animation.
    - Collapse mode shows icons only with tooltips.
    - Phone layout uses overlay drawer with backdrop.
    - Keyboard tree navigation (arrows, Enter) works.
    - Badge values display and update dynamically.
    - Navigate event fires with correct item data.
  done_definition:
    - Supports 3-level nesting without visual degradation.
    - Adaptive layout: desktop (full), tablet (rail), phone (overlay).
    - Smooth CSS transitions on collapse/expand.
```

---

## 7.5 Modal

```yaml
spec_version: "1.0"
control:
  class_name: Modal
  type_name: modal
  category: 1-standard/6-layout
  priority: P0
  target_tier: T3
  proposed_file: controls/organised/1-standard/6-layout/modal.js
  dependencies: [Control, Button]
status:
  implemented: true
  notes: >
    365-line implementation with header/body/footer, focus trapping,
    size variants, close-on-overlay, adaptive phone fullscreen. Current tier ~T2.
purpose:
  summary: >
    Dialog overlay with title bar, scrollable body, action footer,
    focus trapping, backdrop click handling, and Escape dismissal.
  use_cases:
    - Confirmation dialogs (delete record, discard changes).
    - Detail record editing in overlay.
    - Alert and error dialogs.
    - Media preview lightbox.
  non_goals:
    - Not a tooltip or popover (use Pop_Over).
    - Not a non-modal drawer (use Drawer).
composition:
  children:
    - overlay (backdrop)
    - dialog_container
    - header (title + close button)
    - body (scrollable content area)
    - footer (action buttons)
  variants: [default, danger, info, compact]
  states: [closed, opening, open, closing]
  default_variant: default
  default_state: closed
api:
  props:
    - name: title
      type: string
      required: false
      default: ""
      description: Modal title text.
    - name: size
      type: string
      required: false
      default: "md"
      description: "Size preset: sm, md, lg, xl, full."
    - name: closable
      type: boolean
      required: false
      default: true
      description: Shows close button in header.
    - name: close_on_overlay
      type: boolean
      required: false
      default: true
      description: Clicking backdrop closes the modal.
    - name: close_on_escape
      type: boolean
      required: false
      default: true
      description: Escape key closes the modal.
    - name: prevent_body_scroll
      type: boolean
      required: false
      default: true
      description: Prevents body scrolling while open.
    - name: auto_focus
      type: boolean
      required: false
      default: true
      description: Focus first focusable element on open.
  events:
    - name: open
      payload: "{}"
      when: Modal opens.
    - name: close
      payload: "{trigger:'button'|'overlay'|'escape'|'api'}"
      when: Modal closes, with trigger source.
    - name: before_close
      payload: "{cancel:function}"
      when: Fires before closing — call cancel() to prevent.
  methods:
    - name: open
      signature: open()
      description: Opens the modal with animation.
    - name: close
      signature: close()
      description: Closes the modal with animation.
    - name: toggle
      signature: toggle()
      description: Toggles open/close state.
    - name: set_title
      signature: set_title(text)
      description: Updates header title.
    - name: set_content
      signature: set_content(control_or_html)
      description: Replaces body content.
    - name: set_footer
      signature: set_footer(control_or_html)
      description: Replaces footer content.
    - name: body
      signature: body()
      description: Returns body container control for direct manipulation.
interaction:
  keyboard:
    - key: Escape
      behavior: Closes modal when close_on_escape=true.
    - key: Tab
      behavior: Cycles focus within modal (focus trap).
    - key: Shift+Tab
      behavior: Reverse focus cycle within modal.
    - key: Enter
      behavior: Activates focused button.
  pointer:
    - Click overlay/backdrop to close (when close_on_overlay=true).
    - Click close button to close.
    - Scroll within body area for long content.
accessibility:
  roles:
    - role="dialog" on dialog container
    - role="alertdialog" for danger/confirm variant
  aria:
    - aria-modal="true"
    - aria-labelledby pointing to title element
    - aria-describedby pointing to body for alert dialogs
    - aria-hidden="true" on content behind modal
  focus:
    - Focus trapped within modal while open.
    - First focusable element receives focus on open.
    - Focus returns to trigger element on close.
styling:
  css_classes:
    - modal
    - jsgui-modal-dialog
    - jsgui-modal-header
    - jsgui-modal-body
    - jsgui-modal-footer
    - jsgui-modal-close
    - jsgui-modal-title
    - modal-open
  tokens:
    - --j-overlay
    - --j-bg-elevated
    - --j-bg-muted
    - --j-border
    - --j-fg
    - --j-shadow-lg
    - --j-radius-lg
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - Modal opens and closes with animation.
    - Focus traps inside modal (Tab does not escape).
    - Escape key closes when close_on_escape=true.
    - Overlay click closes when close_on_overlay=true.
    - before_close cancel() prevents closing.
    - Focus returns to trigger element after close.
    - Phone layout uses fullscreen presentation.
    - aria-modal, aria-labelledby, role set correctly.
    - Body scroll locked while modal is open.
  done_definition:
    - Transition animations for open/close (fade + scale).
    - Stacking support (multiple modals via z-index management).
    - Danger variant with red-accented header.
```

---

## 7.6 Toolbar

```yaml
spec_version: "1.0"
control:
  class_name: Toolbar
  type_name: toolbar
  category: 1-standard/5-ui
  priority: P1
  target_tier: T3
  proposed_file: controls/organised/1-standard/5-ui/Toolbar.js
  dependencies: [Control, Button, Icon_Button, Separator, Tooltip]
status:
  implemented: true
  notes: >
    293-line implementation with buttons, separators, spacers, overflow menu,
    adaptive touch targets. Current tier ~T1.
purpose:
  summary: >
    Horizontal action bar with buttons, separators, spacers, and an overflow
    menu that activates when available space is insufficient.
  use_cases:
    - Page-level action toolbar (New, Edit, Delete, Export).
    - Editor toolbar (Bold, Italic, Underline, Insert).
    - Table header toolbar (Refresh, Filter, Columns, Export).
  non_goals:
    - Not a navigation bar (use Sidebar_Nav or Breadcrumbs).
    - Not a menu bar with dropdowns (use Horizontal_Menu).
composition:
  children:
    - button_items (icon_button, button, custom control)
    - separator_items
    - spacer_items
    - overflow_trigger (» button)
    - overflow_menu (hidden items)
  variants: [default, compact, transparent, bordered]
  states: [normal, overflow_active, disabled]
  default_variant: default
  default_state: normal
api:
  props:
    - name: items
      type: >
        array<{type:'button'|'separator'|'spacer'|'control',
        id?:string, label?:string, icon?:string,
        tooltip?:string, disabled?:boolean, toggle?:boolean,
        pressed?:boolean, control?:Control}>
      required: false
      default: []
      description: Toolbar item definitions (can also use addButton etc.).
    - name: orientation
      type: string
      required: false
      default: "horizontal"
      description: horizontal or vertical.
    - name: overflow_strategy
      type: string
      required: false
      default: "menu"
      description: "menu (overflow button) | scroll | wrap."
  events:
    - name: action
      payload: "{id:string, pressed?:boolean}"
      when: A toolbar button is activated.
    - name: overflow_change
      payload: "{overflow:boolean, hidden_count:number}"
      when: Items enter or leave the overflow menu.
  methods:
    - name: addButton
      signature: addButton(config)
      description: Adds a button item.
    - name: addSeparator
      signature: addSeparator()
      description: Adds a visual separator.
    - name: addSpacer
      signature: addSpacer()
      description: Adds a flexible spacer.
    - name: addControl
      signature: addControl(control)
      description: Adds any custom control inline.
    - name: clear
      signature: clear()
      description: Removes all items.
    - name: set_item_disabled
      signature: set_item_disabled(id, flag)
      description: Enables/disables a specific item.
    - name: set_item_pressed
      signature: set_item_pressed(id, flag)
      description: Sets toggle state of a button.
interaction:
  keyboard:
    - key: ArrowLeft / ArrowRight
      behavior: Move focus between toolbar buttons (horizontal).
    - key: ArrowUp / ArrowDown
      behavior: Move focus between buttons (vertical orientation).
    - key: Home / End
      behavior: Focus first/last button.
    - key: Enter / Space
      behavior: Activate focused button.
  pointer:
    - Click button to emit action event.
    - Click overflow trigger to show overflow menu.
accessibility:
  roles:
    - role="toolbar" on root
    - role="button" on each button item
    - role="separator" on separator items
  aria:
    - aria-label on toolbar root
    - aria-pressed on toggle buttons
    - aria-disabled on disabled items
    - aria-haspopup="menu" on overflow trigger
    - aria-expanded on overflow trigger
  focus:
    - Roving tabindex across buttons.
    - Single Tab stop into toolbar, arrows within.
styling:
  css_classes:
    - jsgui-toolbar
    - toolbar-button
    - toolbar-button-label
    - toolbar-separator
    - toolbar-spacer
    - toolbar-overflow-trigger
    - toolbar-overflow-menu
  tokens:
    - --j-bg-elevated
    - --j-border
    - --j-fg
    - --j-primary
    - --j-bg-hover
    - --toolbar-gap
    - --toolbar-padding
    - --j-touch-target
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - Buttons emit action event with id.
    - Overflow trigger appears when container is too narrow.
    - Hidden items appear in overflow menu and remain functional.
    - Toggle buttons update pressed state and aria-pressed.
    - Keyboard arrows navigate between buttons.
    - Phone layout uses touch-sized (44px) targets.
    - Disabled items are visually styled and non-interactive.
  done_definition:
    - Overflow detection uses ResizeObserver.
    - Vertical orientation variant works correctly.
    - Separator and spacer render correctly in both orientations.
```

---

## 7.7 Toast

```yaml
spec_version: "1.0"
control:
  class_name: Toast
  type_name: toast
  category: 1-standard/5-ui
  priority: P1
  target_tier: T3
  proposed_file: controls/organised/1-standard/5-ui/toast.js
  dependencies: [Control]
status:
  implemented: true
  notes: >
    141-line basic implementation with position, status variants, auto-dismiss,
    manual dismiss. Current tier ~T1. Missing animations, progress indicator.
purpose:
  summary: >
    Non-modal notification system that displays stackable toast messages
    with auto-dismiss timers, status variants, and action buttons.
  use_cases:
    - Success notification after saving a record.
    - Error notification for failed API calls.
    - Info notification with action link ("Undo").
  non_goals:
    - Not a modal alert (use Modal with alertdialog role).
    - Not a persistent banner (use Alert_Banner).
composition:
  children:
    - toast_item (icon + message + action_button + dismiss_button + timer_bar)
  variants: [default, minimal, detailed]
  states: [entering, visible, exiting, dismissed]
  default_variant: default
  default_state: visible
api:
  props:
    - name: position
      type: string
      required: false
      default: "top-right"
      description: "Position: top-right, top-left, top-center, bottom-right, bottom-left, bottom-center."
    - name: max_visible
      type: number
      required: false
      default: 5
      description: Maximum visible toasts before stacking.
    - name: default_timeout_ms
      type: number
      required: false
      default: 5000
      description: Default auto-dismiss duration.
  events:
    - name: show
      payload: "{id:string, message:string, status:string}"
      when: A new toast appears.
    - name: dismiss
      payload: "{id:string, trigger:'timeout'|'button'|'action'|'api'}"
      when: A toast is dismissed.
    - name: action
      payload: "{id:string, action_id:string}"
      when: User clicks a toast action button.
  methods:
    - name: show
      signature: "show(message, options?)"
      description: >
        Shows toast. Options: {status, timeout_ms, action_label, action_id,
        dismissible, icon}. Returns toast id.
    - name: dismiss
      signature: dismiss(id)
      description: Programmatically dismisses a toast by id.
    - name: clear
      signature: clear()
      description: Dismisses all active toasts.
interaction:
  keyboard:
    - key: Escape
      behavior: Dismisses the most recent toast (when focused).
    - key: Tab
      behavior: Focuses toast action/dismiss buttons.
    - key: Enter
      behavior: Activates focused toast action.
  pointer:
    - Click dismiss button (×) to close.
    - Click action button to emit action event and dismiss.
    - Hover pauses auto-dismiss timer.
accessibility:
  roles:
    - aria-live="polite" container for non-urgent toasts
    - aria-live="assertive" for error toasts
    - role="status" on each toast item
  aria:
    - aria-atomic="true" on toast items
    - aria-label on dismiss button
  focus:
    - Toast action/dismiss buttons are focusable.
    - Toast container itself is not focusable.
styling:
  css_classes:
    - jsgui-toast-container
    - jsgui-toast
    - toast-success
    - toast-error
    - toast-warning
    - toast-info
    - toast-message
    - toast-dismiss
    - toast-action
    - toast-timer-bar
  tokens:
    - --j-bg-elevated
    - --j-fg
    - --j-shadow-lg
    - --j-radius-md
    - --j-danger
    - --j-success
    - --j-warning
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - show() displays toast and returns id.
    - Auto-dismiss fires after timeout_ms.
    - Hover pauses auto-dismiss timer.
    - dismiss(id) removes specific toast.
    - Action button click emits action event.
    - Status variants (success, error, warning, info) style correctly.
    - Position prop places container in correct screen corner.
    - max_visible limits DOM count.
    - aria-live region announces new toasts.
  done_definition:
    - Slide-in/slide-out CSS animations.
    - Timer progress bar indicator.
    - Icon support per status type.
    - Stacking with count indicator when max_visible exceeded.
```

---

## 7.8 Breadcrumbs

```yaml
spec_version: "1.0"
control:
  class_name: Breadcrumbs
  type_name: breadcrumbs
  category: 1-standard/5-ui
  priority: P1
  target_tier: T2
  proposed_file: controls/organised/1-standard/5-ui/breadcrumbs.js
  dependencies: [Control]
status:
  implemented: true
  notes: >
    130-line basic implementation with items, navigate event, separator.
    Current tier ~T1. Missing overflow collapsing, icons, dropdown.
purpose:
  summary: >
    Horizontal breadcrumb trail showing navigation hierarchy with clickable
    ancestor links and a non-interactive current-page indicator.
  use_cases:
    - Admin page hierarchy (Dashboard > Users > User Detail).
    - File manager path (Root > Documents > Project).
    - Multi-step wizard progress indicator.
  non_goals:
    - Not a full navigation bar.
    - Not a tab strip.
composition:
  children:
    - breadcrumb_list (ordered list of items)
    - breadcrumb_item (link or current)
    - separator (/ or > or custom)
    - overflow_trigger (... for collapsed middle items)
  variants: [default, arrow, pill, minimal]
  states: [normal, overflow_collapsed]
  default_variant: default
  default_state: normal
api:
  props:
    - name: items
      type: "array<{label:string, href?:string, icon?:string, id?:string}>"
      required: true
      description: Breadcrumb items in order (last item is current page).
    - name: separator
      type: string
      required: false
      default: "/"
      description: Separator character or HTML between items.
    - name: max_visible
      type: number
      required: false
      default: 0
      description: Max visible items before collapsing middle (0 = no limit).
    - name: home_icon
      type: string
      required: false
      description: Icon for first item (replaces text).
  events:
    - name: navigate
      payload: "{index:number, item:object}"
      when: User clicks a breadcrumb link.
  methods:
    - name: set_items
      signature: set_items(items)
      description: Replaces breadcrumb items.
    - name: get_items
      signature: get_items()
      description: Returns current items array.
    - name: push
      signature: push(item)
      description: Appends a breadcrumb item.
    - name: pop
      signature: pop()
      description: Removes last breadcrumb item.
interaction:
  keyboard:
    - key: Tab
      behavior: Tab moves between breadcrumb links.
    - key: Enter
      behavior: Activates focused breadcrumb link.
  pointer:
    - Click any breadcrumb (except current) to navigate.
    - Click overflow trigger to show collapsed items dropdown.
accessibility:
  roles:
    - nav element with aria-label="Breadcrumb"
    - ol/li list structure (native semantic breadcrumbs)
  aria:
    - aria-current="page" on last (current) item
    - aria-label="Breadcrumb" on nav
  focus:
    - Links are focusable, current item is not a link.
styling:
  css_classes:
    - jsgui-breadcrumbs
    - breadcrumbs-list
    - breadcrumbs-item
    - breadcrumbs-link
    - breadcrumbs-current
    - breadcrumbs-separator
    - breadcrumbs-overflow
  tokens:
    - --j-fg
    - --j-fg-muted
    - --j-primary
    - --j-text-sm
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - Renders items with separators in correct order.
    - Last item is styled as current (non-clickable, aria-current="page").
    - Click on ancestor item emits navigate with correct index.
    - Overflow collapse shows "..." when items > max_visible.
    - Overflow dropdown shows collapsed items on click.
    - nav element has aria-label="Breadcrumb".
  done_definition:
    - Separator customization (string or icon).
    - Overflow collapse with dropdown for long paths.
    - Icon support on first item (home icon).
```

---

## 7.9 Master_Detail

```yaml
spec_version: "1.0"
control:
  class_name: Master_Detail
  type_name: master_detail
  category: 1-standard/6-layout
  priority: P0
  target_tier: T3
  proposed_file: controls/organised/1-standard/6-layout/master_detail.js
  dependencies: [Control, Data_Object, List]
status:
  implemented: true
  notes: >
    428-line implementation with MVVM, adaptive layout (desktop grid,
    tablet narrow, phone stacked with back button). Current tier ~T2.
purpose:
  summary: >
    Two-pane layout with a selectable master list on the left and a
    detail content area on the right, morphing to stacked navigation
    on small screens.
  use_cases:
    - Email client (inbox list + message detail).
    - User management (user list + user profile editor).
    - Settings panel (category list + settings form).
  non_goals:
    - Not a split pane with free-drag divider (use Split_Pane).
    - Not a tree + content layout (use File_Tree + Panel).
composition:
  children:
    - master_pane (list of selectable items)
    - detail_pane (content area)
    - back_button (phone mode navigation)
    - divider (optional resizable border)
  variants: [default, compact, bordered, card]
  states: [idle, master_focused, detail_focused, loading, empty_detail]
  default_variant: default
  default_state: idle
api:
  props:
    - name: items
      type: "array<{id:string|number, label:string, subtitle?:string, icon?:string, badge?:string|number}>"
      required: true
      default: []
      description: Master list items.
    - name: selected_id
      type: "string|number|null"
      required: false
      default: null
      description: Initially selected item id.
    - name: master_width
      type: string
      required: false
      default: "240px"
      description: Master pane width (CSS value).
    - name: detail_render
      type: function
      required: false
      description: "Callback(item) => Control to render in detail pane."
    - name: empty_detail_text
      type: string
      required: false
      default: "Select an item"
      description: Text shown when no item is selected.
    - name: show_back_button
      type: boolean
      required: false
      default: true
      description: Shows back button in phone stacked mode.
  events:
    - name: select
      payload: "{id:string|number, item:object, previous_id:string|number|null}"
      when: User selects a different master item.
    - name: detail_render
      payload: "{id:string|number, item:object, pane:Control}"
      when: Detail pane needs rendering for selected item.
  methods:
    - name: set_items
      signature: set_items(items)
      description: Replaces master list items.
    - name: set_selected_id
      signature: set_selected_id(id)
      description: Programmatically selects an item.
    - name: get_selected_id
      signature: get_selected_id()
      description: Returns currently selected id.
    - name: get_selected_item
      signature: get_selected_item()
      description: Returns selected item object.
    - name: show_detail
      signature: show_detail()
      description: In phone mode, navigates to detail view.
    - name: show_master
      signature: show_master()
      description: In phone mode, navigates back to master list.
    - name: set_detail_content
      signature: set_detail_content(control)
      description: Manually sets detail pane content.
interaction:
  keyboard:
    - key: ArrowUp / ArrowDown
      behavior: Navigate master list items.
    - key: Enter
      behavior: Select focused item and move focus to detail.
    - key: Escape / Backspace
      behavior: In phone detail view, navigate back to master.
    - key: Tab
      behavior: Move between master and detail panes.
  pointer:
    - Click master item to select it and show detail.
    - Click back button (phone mode) to return to master.
accessibility:
  roles:
    - role="listbox" on master list
    - role="option" on master list items
    - role="region" on detail pane
  aria:
    - aria-selected on selected master item
    - aria-label="Master list" on master pane
    - aria-label="Detail" on detail pane
    - aria-live="polite" on detail pane for content changes
  focus:
    - Master list uses roving tabindex.
    - Focus moves to detail on selection (desktop).
    - Phone mode: focus follows view transition.
styling:
  css_classes:
    - master-detail
    - master-detail-master
    - master-detail-detail
    - master-detail-item
    - master-detail-item-selected
    - master-detail-back
    - master-detail-empty
  tokens:
    - --j-bg-elevated
    - --j-border
    - --j-fg
    - --j-primary
    - --j-bg-hover
    - --j-bg-selected
    - --j-gap
    - --j-touch-target
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - Renders master list from items array.
    - Clicking item emits select and shows detail content.
    - Phone layout stacks master/detail with back button navigation.
    - Tablet layout uses narrower master pane.
    - Empty detail state shows placeholder message.
    - Keyboard arrows navigate master list.
    - Selected item has aria-selected="true".
    - detail_render callback invoked on selection change.
  done_definition:
    - Smooth transition animation between master/detail in phone mode.
    - Master pane scrolls independently from detail.
    - Support for loading state in detail pane.
```

---

## 7.10 Tabbed_Panel

```yaml
spec_version: "1.0"
control:
  class_name: Tabbed_Panel
  type_name: tabbed_panel
  category: 1-standard/6-layout
  priority: P1
  target_tier: T3
  proposed_file: controls/organised/1-standard/6-layout/tabbed-panel.js
  dependencies: [Control]
status:
  implemented: true
  notes: >
    Existing implementation with 8 variants (underline, box, pill, etc.),
    tab strip and panels. Current tier ~T1. Missing keyboard nav,
    overflow handling, animated indicator, ARIA.
purpose:
  summary: >
    Tabbed content container with multiple panels, only one visible at a time,
    switched via a tab strip with animated active indicator.
  use_cases:
    - Settings sections (General, Security, Notifications).
    - Record detail tabs (Overview, Activity, Permissions).
    - Editor mode tabs (Visual, Code, Preview).
  non_goals:
    - Not a step wizard (use Stepper).
    - Not a navigation bar (tabs represent views, not pages).
composition:
  children:
    - tab_strip (container for tab buttons)
    - tab_button (one per tab)
    - active_indicator (animated underline/highlight)
    - tab_panels (content containers, one per tab)
    - overflow_trigger (for many tabs)
  variants: [underline, box, pill, segment, vertical, icon_only, vs_classic, bordered]
  states: [normal, overflow, disabled]
  default_variant: underline
  default_state: normal
api:
  props:
    - name: tabs
      type: "array<{id:string, label:string, icon?:string, disabled?:boolean, closable?:boolean, badge?:string|number}>"
      required: true
      description: Tab definitions.
    - name: active_tab
      type: string
      required: false
      description: Initially active tab id (defaults to first).
    - name: tab_position
      type: string
      required: false
      default: "top"
      description: "Tab strip position: top, bottom, left, right."
    - name: closable
      type: boolean
      required: false
      default: false
      description: Enables close button on all tabs.
    - name: add_tab_button
      type: boolean
      required: false
      default: false
      description: Shows a + button to add new tabs.
    - name: overflow_strategy
      type: string
      required: false
      default: "scroll"
      description: "scroll | dropdown | wrap."
  events:
    - name: tab_change
      payload: "{id:string, previous_id:string}"
      when: Active tab changes.
    - name: tab_close
      payload: "{id:string}"
      when: A closable tab's close button is clicked.
    - name: tab_add
      payload: "{}"
      when: Add tab button is clicked.
  methods:
    - name: set_active_tab
      signature: set_active_tab(id)
      description: Programmatically switches to a tab.
    - name: add_tab
      signature: add_tab(tab_def, content?)
      description: Adds a new tab dynamically.
    - name: remove_tab
      signature: remove_tab(id)
      description: Removes a tab and its panel.
    - name: set_tab_disabled
      signature: set_tab_disabled(id, flag)
      description: Enables/disables a specific tab.
    - name: set_tab_badge
      signature: set_tab_badge(id, value)
      description: Updates badge value on a tab.
    - name: get_active_tab
      signature: get_active_tab()
      description: Returns active tab id.
    - name: get_tab_content
      signature: get_tab_content(id)
      description: Returns content control for a tab panel.
interaction:
  keyboard:
    - key: ArrowLeft / ArrowRight
      behavior: Move focus between tabs (horizontal).
    - key: ArrowUp / ArrowDown
      behavior: Move focus between tabs (vertical position).
    - key: Home / End
      behavior: Focus first/last tab.
    - key: Enter / Space
      behavior: Activate focused tab.
    - key: Delete
      behavior: Close focused tab (when closable).
  pointer:
    - Click tab to activate it.
    - Click close button to close tab.
    - Click add button to emit tab_add.
accessibility:
  roles:
    - role="tablist" on tab strip
    - role="tab" on each tab button
    - role="tabpanel" on each content panel
  aria:
    - aria-selected="true" on active tab
    - aria-controls linking tab to its panel id
    - aria-labelledby linking panel to its tab id
    - aria-disabled on disabled tabs
    - aria-orientation on tablist (horizontal/vertical)
  focus:
    - Roving tabindex within tablist.
    - Active tab is in tab order, inactive tabs use tabindex=-1.
    - Focus moves to panel content after Tab from active tab.
styling:
  css_classes:
    - jsgui-tabs
    - jsgui-tab-strip
    - jsgui-tab
    - jsgui-tab-active
    - jsgui-tab-disabled
    - jsgui-tab-panel
    - jsgui-tab-indicator
    - jsgui-tab-close
    - jsgui-tab-badge
    - jsgui-tab-add
  tokens:
    - --j-fg
    - --j-fg-muted
    - --j-primary
    - --j-bg
    - --j-bg-muted
    - --j-border
    - --j-radius-md
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - Only active tab panel is visible.
    - Switching tabs emits tab_change with previous_id.
    - Active indicator animates between tabs (if underline variant).
    - Keyboard arrows cycle through tabs.
    - Disabled tab cannot be activated.
    - Close button emits tab_close and removes tab.
    - Tab overflow scrolling/dropdown works for many tabs.
    - ARIA roles and relationships are correct.
    - Vertical tab position renders correctly.
  done_definition:
    - Animated active indicator (CSS transition on translateX/width).
    - All 8 visual variants render correctly.
    - Dynamic add/remove tabs without rerender artifacts.
    - Badge update does not disrupt active indicator position.
```

---

## 7.11 Search_Bar

```yaml
spec_version: "1.0"
control:
  class_name: Search_Bar
  type_name: search_bar
  category: 1-standard/5-ui
  priority: P1
  target_tier: T2
  proposed_file: controls/organised/1-standard/5-ui/search-bar.js
  dependencies: [Control, Text_Input, Icon]
status:
  implemented: true
  notes: >
    Existing implementation with search icon, input field, clear button.
    Current tier ~T1. Missing debounce, suggestions dropdown, keyboard nav.
purpose:
  summary: >
    Search input with icon, clear button, debounced query emission,
    optional suggestion/autocomplete dropdown, and keyboard shortcuts.
  use_cases:
    - Global admin search (Ctrl+K / Cmd+K shortcut).
    - Table/list filter search.
    - Entity lookup with autocomplete.
  non_goals:
    - Not a full command palette (use Command_Palette).
    - Not a filter bar with structured criteria (use Data_Filter).
composition:
  children:
    - search_icon
    - input_field
    - clear_button
    - suggestions_dropdown (optional)
    - loading_spinner (optional)
  variants: [default, outlined, filled, pill, expanded]
  states: [idle, focused, loading, has_results, no_results, disabled]
  default_variant: default
  default_state: idle
api:
  props:
    - name: placeholder
      type: string
      required: false
      default: "Search..."
      description: Placeholder text.
    - name: value
      type: string
      required: false
      default: ""
      description: Initial search value.
    - name: debounce_ms
      type: number
      required: false
      default: 300
      description: Debounce delay before emitting search event.
    - name: min_chars
      type: number
      required: false
      default: 1
      description: Minimum characters before emitting search.
    - name: suggestions
      type: "array<{id:string, label:string, description?:string, icon?:string}>|null"
      required: false
      default: null
      description: Suggestion items (null = no dropdown).
    - name: shortcut
      type: string
      required: false
      default: null
      description: "Global keyboard shortcut (e.g. 'Ctrl+K')."
    - name: loading
      type: boolean
      required: false
      default: false
      description: Shows loading spinner.
  events:
    - name: search
      payload: "{query:string}"
      when: Debounced query emitted after typing.
    - name: submit
      payload: "{query:string}"
      when: User presses Enter.
    - name: suggestion_select
      payload: "{id:string, item:object}"
      when: User selects a suggestion.
    - name: clear
      payload: "{}"
      when: Search is cleared.
  methods:
    - name: set_value
      signature: set_value(query)
      description: Sets search input value.
    - name: get_value
      signature: get_value()
      description: Returns current search value.
    - name: set_suggestions
      signature: set_suggestions(items)
      description: Updates suggestion dropdown items.
    - name: focus
      signature: focus()
      description: Focuses the search input.
    - name: clear
      signature: clear()
      description: Clears search input and emits clear event.
interaction:
  keyboard:
    - key: Enter
      behavior: Emits submit with current query.
    - key: Escape
      behavior: Clears input or closes suggestions dropdown.
    - key: ArrowDown
      behavior: Opens/navigates suggestion dropdown.
    - key: ArrowUp
      behavior: Navigates suggestion dropdown upward.
    - key: Ctrl+K / Cmd+K
      behavior: Global shortcut to focus search (if shortcut configured).
  pointer:
    - Click clear button to clear input.
    - Click suggestion item to select it.
accessibility:
  roles:
    - role="search" on root container
    - role="combobox" on input when suggestions enabled
    - role="listbox" on suggestion dropdown
    - role="option" on each suggestion
  aria:
    - aria-label="Search" on input
    - aria-expanded on combobox (suggestions visible)
    - aria-activedescendant for highlighted suggestion
    - aria-autocomplete="list" when suggestions enabled
    - aria-busy="true" during loading
  focus:
    - Input receives focus on shortcut activation.
    - Focus returns to input after suggestion selection.
styling:
  css_classes:
    - jsgui-search-bar
    - search-bar-input
    - search-bar-icon
    - search-bar-clear
    - search-bar-suggestions
    - search-bar-suggestion-item
    - search-bar-loading
  tokens:
    - --j-fg
    - --j-fg-muted
    - --j-bg
    - --j-border
    - --j-primary
    - --j-radius-md
    - --j-shadow-lg
  density_support: [comfortable, compact]
acceptance:
  e2e:
    - Typing emits debounced search event.
    - Clear button resets input and emits clear.
    - Suggestions dropdown appears when items provided.
    - Arrow key navigation highlights suggestions.
    - Enter selects highlighted suggestion.
    - Global shortcut focuses search input.
    - Loading state shows spinner.
    - min_chars threshold prevents premature search emission.
  done_definition:
    - Debounce uses cancelable timer (not stale events).
    - Suggestion dropdown positions correctly (flip if near edge).
    - Works without suggestions (plain search mode).
```

---

## 7.12 Implementation Order

Recommended order for building admin UIs, based on value delivery:

| Order | Control | Reason |
|:-----:|---------|--------|
| 1 | **Data_Table** | Backbone of every admin view |
| 2 | **Form_Container** | Required for any CRUD operation |
| 3 | **Sidebar_Nav** | App shell navigation |
| 4 | **Modal** | Confirmations, dialogs, editing overlays |
| 5 | **Toolbar** | Page-level actions |
| 6 | **Breadcrumbs** | Context and navigation |
| 7 | **Tabbed_Panel** | Content organization |
| 8 | **Toast** | User feedback |
| 9 | **Master_Detail** | Common admin layout pattern |
| 10 | **Search_Bar** | Discovery and filtering |

---

## 7.13 Quality Gate Checklist

Before any of these controls can be considered at their target tier:

- [ ] All props in spec are implemented and tested
- [ ] All events fire with correct payloads
- [ ] All methods work as documented
- [ ] Full keyboard interaction pattern implemented
- [ ] ARIA roles, states, and properties correct
- [ ] CSS uses only theme tokens (no hardcoded colors)
- [ ] Adaptive layout works on phone/tablet/desktop
- [ ] Density variants (comfortable/compact) render correctly
- [ ] E2E acceptance tests pass
- [ ] Exported correctly from `controls/controls.js`
